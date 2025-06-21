export type StreamInfo = {
    title: string;
    code: string;
    description: string,
    streamerName: string;
    stats: StreamStats,
    quality: string,
    type: string,
    isChatEnabled: boolean,
  }

type StreamStats = {
  viewers: number,
  likes: number,
  duration: number
}
  