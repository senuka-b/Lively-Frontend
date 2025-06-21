export type StreamInfo = {
    title: string;
    code: string;
    description: string,
    streamerName: string;
    stats: StreamStats,
    quality: string,
    type: string,
  }

type StreamStats = {
  viewers: number,
  likes: number,
  duration: number
}
  