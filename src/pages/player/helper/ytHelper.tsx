import { doc, updateDoc } from "firebase/firestore";
import { db } from "../../..";

// プレイヤーで再生する動画を指定する
export const loadVideo = (YTPlayer: YT.Player, videoId: string) => {
  YTPlayer.loadVideoById(videoId);
};

// 再生済みフラグを立てる
export const playedFlagToTrue = async (collectionId: string) => {
  const reqRef = doc(db, "requests", collectionId);
  await updateDoc(reqRef, {
    isPlayed: true,
  });
};
