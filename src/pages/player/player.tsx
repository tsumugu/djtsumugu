import arrayShuffle from "array-shuffle";
import { useEffect, useRef, useState } from "react";
import YouTube, { YouTubeProps } from "react-youtube";
import { VideoType, mVideo } from "../../type/type";
import { db } from "../..";
import {
  Unsubscribe,
  collection,
  doc,
  onSnapshot,
  query,
  updateDoc,
  where,
} from "firebase/firestore";

function Player() {
  const [YTPlayer, setYTPlayer] = useState<YT.Player>();
  const [videoIds, setVideoIds] = useState<mVideo[]>();
  const videoIndexRef = useRef(0);
  const unsubscribeRef = useRef<Unsubscribe>();

  useEffect(() => {
    (async function () {
      // 1. プレイリストから動画を読み込む
      let localVideoIds: mVideo[] = [];
      const PLAYLIST_ID = "RDCLAK5uy_nbK9qSkqYZvtMXH1fLCMmC1yn8HEm0W90"; // released "RDCLAK5uy_nVjU2j4lOFyJicLDWEMjYmBkaejmrsx5M";
      const url = `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&playlistId=${PLAYLIST_ID}&maxResults=200&key=${process.env.REACT_APP_YOUTUBE_API_KEY}`;
      const response = await fetch(url);
      localVideoIds = arrayShuffle(
        /* @ts-ignore */
        response.data.items.map((e) => {
          return {
            videoId: e.snippet.resourceId.videoId,
            videoType: VideoType.normal,
          };
        })
      );
      // 2. firestoreから動画を読み込む (firestoreに追加されたときはvideoIdsに追加する)
      if (unsubscribeRef.current) {
        // リスナーが既にある場合はアンサブスクライブする
        unsubscribeRef.current();
      }
      const q = query(
        collection(db, "requests"),
        where("isPlayed", "==", false)
      );
      unsubscribeRef.current = onSnapshot(q, (querySnapshot) => {
        const newRequests: mVideo[] = [];
        querySnapshot.docChanges().forEach((change) => {
          if (change.type === "added") {
            const newData = change.doc.data();
            // console.log("New: ", newData);
            if (newData.videoId) {
              newRequests.push({
                videoId: newData.videoId,
                videoType: VideoType.request,
                collectionId: change.doc.id,
              });
            }
          }
        });
        //
        setVideoIds(newRequests.concat(localVideoIds));
      });
    })();
  }, []);

  // YTPlayerEvent
  const onPlayerReady: YouTubeProps["onReady"] = (event) => {
    setYTPlayer(event.target);
    if (videoIds) {
      console.log(videoIds);
      event.target.loadVideoById(videoIds[0].videoId);
    }
  };

  const onPlayerEnd: YouTubeProps["onEnd"] = async (event) => {
    if (YTPlayer && videoIds) {
      // リクエストされたものだったら再生済みにする
      if (videoIds[videoIndexRef.current].videoType === VideoType.request) {
        if (videoIds[videoIndexRef.current].collectionId) {
          const reqRef = doc(
            db,
            "requests",
            videoIds[videoIndexRef.current].collectionId!
          );
          await updateDoc(reqRef, {
            isPlayed: true,
          });
        }
      }
      // 次を再生
      videoIndexRef.current += 1;
      YTPlayer.loadVideoById(videoIds[videoIndexRef.current].videoId);
    }
  };

  const opts: YouTubeProps["opts"] = {
    height: "390",
    width: "640",
    playerVars: {
      autoplay: 1,
    },
  };

  return (
    <>
      <YouTube
        videoId="N6di9-zLGbw"
        opts={opts}
        onReady={onPlayerReady}
        onEnd={onPlayerEnd}
      />
      <button
        onClick={() => {
          if (YTPlayer && videoIds) {
            videoIndexRef.current += 1;
            YTPlayer.loadVideoById(videoIds[videoIndexRef.current].videoId);
          }
        }}
      >
        次の曲へ
      </button>
    </>
  );
}
export default Player;
