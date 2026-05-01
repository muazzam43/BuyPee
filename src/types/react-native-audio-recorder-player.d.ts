declare module 'react-native-audio-recorder-player' {
  export default class AudioRecorderPlayer {
    startRecorder(path?: string, audioSet?: any): Promise<string>;
    stopRecorder(): Promise<string>;
    startPlayer(path: string): Promise<string>;
    stopPlayer(): Promise<string>;
    addRecordBackListener(callback: (e: any) => void): void;
    addPlayBackListener(callback: (e: any) => void): void;
    removeRecordBackListener(): void;
    removePlayBackListener(): void;
    mmssss(ms: number): string;
  }
}
