
import { GoogleGenAI, LiveServerMessage, Modality, FunctionDeclaration, Type, Blob as GenBlob } from '@google/genai';
import { useAppStore } from '../store/appStore';
import { AccessibilityMode, WidgetType, SentimentTone } from '../types';

// Tools for the Live Agent to manipulate the OS
const updateAccessibilityModeTool: FunctionDeclaration = {
  name: 'update_accessibility_mode',
  parameters: {
    type: Type.OBJECT,
    description: 'Switch the user interface mode based on user disability or preference.',
    properties: {
      mode: {
        type: Type.STRING,
        enum: ['STANDARD', 'SONIC_VIEW', 'FOCUS_SHIELD', 'SENTIMENT_HUD'],
        description: 'The visual/functional mode to switch to.'
      }
    },
    required: ['mode']
  }
};

const createWidgetTool: FunctionDeclaration = {
  name: 'create_widget',
  parameters: {
    type: Type.OBJECT,
    description: 'Create a new UI widget on the dashboard.',
    properties: {
      type: { type: Type.STRING, description: 'Type of widget' },
      title: { type: Type.STRING, description: 'Title of the widget' },
      content: { type: Type.OBJECT, description: 'JSON content payload for the widget' }
    },
    required: ['type', 'title', 'content']
  }
};

class GeminiLiveBridge {
  private session: any = null;
  private inputAudioContext: AudioContext | null = null;
  private outputAudioContext: AudioContext | null = null;
  private inputSource: MediaStreamAudioSourceNode | null = null;
  private processor: ScriptProcessorNode | null = null;
  private nextStartTime: number = 0;
  private activeSources: Set<AudioBufferSourceNode> = new Set();
  
  constructor() {
    // Client is initialized in connect() to ensure env vars are ready
  }

  public async connect(config: { systemInstruction?: string, voiceName?: string } = {}) {
    const store = useAppStore.getState();
    store.setLiveState({ isConnected: true, isThinking: false });

    try {
      // Lazy init to ensure API key is present
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

      // 1. Audio Output Setup
      this.outputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      
      // 2. Start Live Session
      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-09-2025',
        callbacks: {
          onopen: async () => {
            console.log("[LiveBridge] Connected");
            store.setLiveState({ isConnected: true });
            // Start Mic Streaming
            await this.startAudioStream(sessionPromise);
          },
          onmessage: async (message: LiveServerMessage) => {
            this.handleMessage(message);
          },
          onclose: () => {
            console.log("[LiveBridge] Closed");
            store.setLiveState({ isConnected: false });
            this.cleanup();
          },
          onerror: (err) => {
            console.error("[LiveBridge] Error", err);
            store.setLiveState({ isConnected: false });
            this.cleanup();
          }
        },
        config: {
          systemInstruction: config.systemInstruction || `
            You are EntreprenOS, an Agentic Operating System. 
            Goal: Be a 'Sensory Bridge' for disabled founders.
            
            IMPORTANT: If the user is in 'SENTIMENT_HUD' mode, you must prepend your text responses with a sentiment tag like [SENTIMENT: POSITIVE], [SENTIMENT: SKEPTICAL], [SENTIMENT: CONFLICT].
          `,
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: config.voiceName || 'Kore' } }
          },
          tools: [{ functionDeclarations: [updateAccessibilityModeTool, createWidgetTool] }]
        }
      });

      this.session = await sessionPromise;
    } catch (error) {
      console.error("[LiveBridge] Connection Failed", error);
      store.setLiveState({ isConnected: false });
      this.cleanup();
    }
  }

  public async disconnect() {
    // Close session if supported or just cleanup context
    this.cleanup();
    useAppStore.getState().setLiveState({ isConnected: false, isStreaming: false });
  }

  public sendVideoFrame(base64Image: string) {
    if (this.session) {
      this.session.sendRealtimeInput({
        media: {
          mimeType: 'image/jpeg',
          data: base64Image
        }
      });
    }
  }

  public sendText(text: string) {
    if (this.session) {
      this.session.sendRealtimeInput([{ text }]);
    }
  }

  private async startAudioStream(sessionPromise: Promise<any>) {
    try {
      this.inputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      this.inputSource = this.inputAudioContext.createMediaStreamSource(stream);
      this.processor = this.inputAudioContext.createScriptProcessor(4096, 1, 1);
      
      this.processor.onaudioprocess = (e) => {
        const inputData = e.inputBuffer.getChannelData(0);
        
        // Calculate volume for visualizer
        let sum = 0;
        for (let i = 0; i < inputData.length; i++) {
           sum += inputData[i] * inputData[i];
        }
        const rms = Math.sqrt(sum / inputData.length);
        useAppStore.getState().setLiveState({ volumeLevel: rms });

        // Convert Float32 to PCM Int16
        const pcmBlob = this.createBlob(inputData);
        
        sessionPromise.then(session => {
            session.sendRealtimeInput({ media: pcmBlob });
        }).catch(err => console.error("Failed to send input", err));
      };

      this.inputSource.connect(this.processor);
      this.processor.connect(this.inputAudioContext.destination);
      useAppStore.getState().setLiveState({ isStreaming: true });

    } catch (err) {
      console.error("[LiveBridge] Mic Error", err);
    }
  }

  private async handleMessage(message: LiveServerMessage) {
    const store = useAppStore.getState();

    // 1. Handle Audio Output
    const audioData = message.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
    if (audioData) {
       this.playAudioChunk(audioData);
       store.setLiveState({ isThinking: false });
    }

    // NEW: Handle Text & Sentiment extraction if present in parts
    const textPart = message.serverContent?.modelTurn?.parts?.find(p => p.text);
    if (textPart && textPart.text) {
       this.parseSentiment(textPart.text);
    }

    // 2. Handle Turn Complete (Thinking finished)
    if (message.serverContent?.turnComplete) {
      store.setLiveState({ isThinking: false });
    }

    // 3. Handle Tool Calls
    if (message.toolCall) {
       for (const fc of message.toolCall.functionCalls) {
          console.log("[LiveBridge] Tool Call:", fc.name, fc.args);
          this.executeTool(fc);
       }
    }
  }

  private parseSentiment(text: string) {
     const regex = /\[SENTIMENT:\s*(\w+)\]/i;
     const match = text.match(regex);
     if (match) {
        const tone = match[1].toLowerCase() as SentimentTone;
        useAppStore.getState().addSentimentFrame({
           id: Math.random().toString(),
           speaker: 'Gemini',
           tone: tone,
           text: text.replace(regex, '').trim(),
           timestamp: Date.now(),
           intensity: 0.8 // Simulated intensity
        });
     }
  }

  private async executeTool(fc: any) {
    const store = useAppStore.getState();
    let result: Record<string, any> = { status: "ok" };

    if (fc.name === 'update_accessibility_mode') {
       store.setAccessibilityMode(fc.args.mode as AccessibilityMode);
       result = { status: "mode_updated", mode: fc.args.mode };
    } 
    else if (fc.name === 'create_widget') {
       store.appendWidgets([{
          id: Math.random().toString(),
          type: fc.args.type as WidgetType,
          title: fc.args.title,
          content: fc.args.content
       }]);
       result = { status: "widget_created" };
    }

    // Send response back
    if (this.session) {
      this.session.sendToolResponse({
        functionResponses: {
          id: fc.id,
          name: fc.name,
          response: { result }
        }
      });
    }
  }

  private async playAudioChunk(base64Audio: string) {
    if (!this.outputAudioContext) return;
    
    // Decode Base64 to ArrayBuffer
    const binaryString = atob(base64Audio);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
    }

    // Decode Audio
    const audioBuffer = await this.decodeAudioData(bytes, this.outputAudioContext);
    
    const source = this.outputAudioContext.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(this.outputAudioContext.destination);
    
    // Schedule Playback
    this.nextStartTime = Math.max(this.outputAudioContext.currentTime, this.nextStartTime);
    source.start(this.nextStartTime);
    this.nextStartTime += audioBuffer.duration;
    
    this.activeSources.add(source);
    source.onended = () => this.activeSources.delete(source);
  }

  private async decodeAudioData(data: Uint8Array, ctx: AudioContext): Promise<AudioBuffer> {
     // Raw PCM decoding manually since decodeAudioData expects file headers (wav/mp3)
     const inputInt16 = new Int16Array(data.buffer);
     const float32 = new Float32Array(inputInt16.length);
     for (let i=0; i<inputInt16.length; i++) {
         float32[i] = inputInt16[i] / 32768;
     }
     
     const buffer = ctx.createBuffer(1, float32.length, 24000);
     buffer.getChannelData(0).set(float32);
     return buffer;
  }

  private createBlob(data: Float32Array): GenBlob {
    const l = data.length;
    const int16 = new Int16Array(l);
    for (let i = 0; i < l; i++) {
        int16[i] = data[i] * 32768;
    }
    let binary = '';
    const bytes = new Uint8Array(int16.buffer);
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return {
        data: btoa(binary),
        mimeType: 'audio/pcm;rate=16000'
    };
  }

  private cleanup() {
    if (this.processor) {
      this.processor.disconnect();
      this.processor = null;
    }
    if (this.inputSource) {
      this.inputSource.disconnect();
      this.inputSource = null;
    }
    if (this.inputAudioContext) {
      this.inputAudioContext.close();
      this.inputAudioContext = null;
    }
    if (this.outputAudioContext) {
      this.outputAudioContext.close();
      this.outputAudioContext = null;
    }
    this.session = null;
  }
}

export const liveBridge = new GeminiLiveBridge();
