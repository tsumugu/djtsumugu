export type mVideo = {
  videoId: string;
  videoType: VideoType;
  collectionId?: string;
};

export enum VideoType {
  "normal" = 0, // プレイリストから自動的に取得されたもの
  "request" = 1, // リクエストされたもの
}
