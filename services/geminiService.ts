
import { GoogleGenAI, Type, Modality } from "@google/genai";
import { Scene } from "../types";

// Helper to get fresh AI instance
const getAi = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Encodes Uint8Array to base64
 */
function encode(bytes: Uint8Array): string {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

/**
 * Decodes base64 string to Uint8Array
 */
function decode(base64: string): Uint8Array {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

/**
 * Converts raw PCM audio data to AudioBuffer
 */
async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

export const generateScript = async (prompt: string): Promise<Scene[]> => {
  const ai = getAi();
  const response = await ai.models.generateContent({
    model: "gemini-3-pro-preview",
    contents: `Act as a master cinematographer and scriptwriter. Create a short movie script based on: "${prompt}". 
    Format the output as a JSON array of scenes. 
    Each scene must have: "title", "visualPrompt" (highly detailed description for a high-quality 3D render/Blender style), "audioScript" (dialogue or narration), and "speaker" (either "Joe" or "Jane").
    Limit to 3-5 scenes total for a short cinematic experience.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            visualPrompt: { type: Type.STRING },
            audioScript: { type: Type.STRING },
            speaker: { type: Type.STRING, enum: ["Joe", "Jane"] }
          },
          required: ["title", "visualPrompt", "audioScript", "speaker"]
        }
      }
    }
  });

  const rawJson = response.text;
  const parsed = JSON.parse(rawJson);
  return parsed.map((s: any, idx: number) => ({
    ...s,
    id: `scene-${Date.now()}-${idx}`,
    status: 'pending'
  }));
};

export const generateVideoForScene = async (prompt: string): Promise<string> => {
  const ai = getAi();
  
  // High quality Blender-like render needs Veo
  let operation = await ai.models.generateVideos({
    model: 'veo-3.1-fast-generate-preview',
    prompt: `${prompt}, cinematic 4k, octane render, unreal engine 5, masterwork, blender 3d style`,
    config: {
      numberOfVideos: 1,
      resolution: '720p',
      aspectRatio: '16:9'
    }
  });

  while (!operation.done) {
    await new Promise(resolve => setTimeout(resolve, 10000));
    operation = await ai.operations.getVideosOperation({ operation });
  }

  const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
  if (!downloadLink) throw new Error("Video generation failed: No URI returned");

  const videoResponse = await fetch(`${downloadLink}&key=${process.env.API_KEY}`);
  const blob = await videoResponse.blob();
  return URL.createObjectURL(blob);
};

export const generateAudioForScene = async (script: string, speaker: 'Joe' | 'Jane'): Promise<string> => {
  const ai = getAi();
  const voiceName = speaker === 'Joe' ? 'Kore' : 'Puck';

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash-preview-tts",
    contents: [{ parts: [{ text: script }] }],
    config: {
      responseModalities: [Modality.AUDIO],
      speechConfig: {
        voiceConfig: {
          prebuiltVoiceConfig: { voiceName },
        },
      },
    },
  });

  const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
  if (!base64Audio) throw new Error("Audio generation failed");

  const audioData = decode(base64Audio);
  
  // We need to convert the raw PCM to a playable WAV/ObjectURL
  // For simplicity in a browser player, we'll convert it to an AudioBuffer then create a Blob
  const audioCtx = new (window.AudioContext || window.webkitAudioContext)({ sampleRate: 24000 });
  const buffer = await decodeAudioData(audioData, audioCtx, 24000, 1);
  
  // Simple way to get a URL for the audio buffer: Render it to a wave blob or use standard OfflineAudioContext
  // But browser Audio element can't play raw AudioBuffer directly. 
  // We will return a Blob with a data URL manually for the browser <audio> tag.
  // Actually, simpler: Use Web Audio API to play it, but for UI <audio> we need a format.
  
  // Convert AudioBuffer to WAV
  const wavBlob = audioBufferToWav(buffer);
  return URL.createObjectURL(wavBlob);
};

// Helper to convert AudioBuffer to WAV blob
function audioBufferToWav(buffer: AudioBuffer): Blob {
  const length = buffer.length * 2;
  const arrayBuffer = new ArrayBuffer(44 + length);
  const view = new DataView(arrayBuffer);

  const writeString = (offset: number, string: string) => {
    for (let i = 0; i < string.length; i++) {
      view.setUint8(offset + i, string.charCodeAt(i));
    }
  };

  writeString(0, 'RIFF');
  view.setUint32(4, 32 + length, true);
  writeString(8, 'WAVE');
  writeString(12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, 1, true);
  view.setUint32(24, 24000, true);
  view.setUint32(28, 24000 * 2, true);
  view.setUint16(32, 2, true);
  view.setUint16(34, 16, true);
  writeString(36, 'data');
  view.setUint32(40, length, true);

  const channelData = buffer.getChannelData(0);
  let offset = 44;
  for (let i = 0; i < channelData.length; i++, offset += 2) {
    const s = Math.max(-1, Math.min(1, channelData[i]));
    view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7FFF, true);
  }

  return new Blob([arrayBuffer], { type: 'audio/wav' });
}
