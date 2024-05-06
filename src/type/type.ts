export type mVideo = {
  videoTitle: string;
  videoId: string;
  videoType: VideoType;
  collectionId?: string;
  thumbnailUrl?: string;
  channelTitle?: string;
};

export enum VideoType {
  "normal" = 0, // プレイリストから自動的に取得されたもの
  "request" = 1, // リクエストされたもの
}
