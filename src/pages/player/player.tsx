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
  // const videoIndexRef = useRef(0);
  const unsubscribeRef = useRef<Unsubscribe>();

  const fetchVideoIdsFromPlaylist = async () => {
    const PLAYLIST_ID = "RDCLAK5uy_nbK9qSkqYZvtMXH1fLCMmC1yn8HEm0W90"; // released "RDCLAK5uy_nVjU2j4lOFyJicLDWEMjYmBkaejmrsx5M";
    const url = `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&playlistId=${PLAYLIST_ID}&maxResults=200&key=${process.env.REACT_APP_YOUTUBE_API_KEY}`;
    const response = await fetch(url);
    const data = await response.json();
    return arrayShuffle(
      /* @ts-ignore */
      data.items.map((e) => {
        return {
          videoId: e.snippet.resourceId.videoId,
          videoType: VideoType.normal,
        };
      })
    ) as mVideo[];
  };

  useEffect(() => {
    (async function () {
      // 1. プレイリストから動画を読み込む
      const videoIdsFromPlaylist = await fetchVideoIdsFromPlaylist();
      // 2. firestoreから動画を読み込む (firestoreに追加されたときはvideoIdsに追加する)
      if (unsubscribeRef.current) {
        // リスナーが既にある場合はアンサブスクライブする
        unsubscribeRef.current();
      }
      unsubscribeRef.current = onSnapshot(
        query(collection(db, "requests"), where("isPlayed", "==", false)),
        (querySnapshot) => {
          const newRequests = querySnapshot
            .docChanges()
            .map((change) => {
              const videoId = change.doc.data().videoId;
              if (change.type === "added" && videoId) {
                return {
                  videoId: videoId,
                  videoType: VideoType.request,
                  collectionId: change.doc.id,
                };
              }
              return null;
            })
            .filter(Boolean) as mVideo[];
          const shiftedVideoIdsFromPlaylist = videoIdsFromPlaylist;
          shiftedVideoIdsFromPlaylist.shift();
          setVideoIds(
            // videoIdsFromPlaylistの0番目 + newRequests + videoIdsFromPlaylistの1番目以降
            [videoIdsFromPlaylist[0]].concat(
              newRequests.concat(shiftedVideoIdsFromPlaylist)
            )
          );
        }
      );
    })();
  }, []);

  // YTPlayerに関連する
  const playNext = () => {
    // 次の曲へ
    if (YTPlayer && videoIds) {
      const tmpVideoIds = videoIds;
      tmpVideoIds.shift();
      setVideoIds(tmpVideoIds);
      YTPlayer.loadVideoById(videoIds[0].videoId);
    }
  };

  const PlayedFlagToTrue = async () => {
    // リクエストされたものだったら再生済みにする
    if (
      videoIds &&
      videoIds[0].videoType === VideoType.request &&
      videoIds[0].collectionId
    ) {
      const reqRef = doc(db, "requests", videoIds[0].collectionId!);
      await updateDoc(reqRef, {
        isPlayed: true,
      });
    }
  };

  const onPlayerReady: YouTubeProps["onReady"] = (event) => {
    setYTPlayer(event.target);
    if (videoIds) {
      event.target.loadVideoById(videoIds[0].videoId);
    }
  };

  const onPlayerEnd = async () => {
    await PlayedFlagToTrue();
    playNext();
  };

  return (
    <>
      <YouTube
        videoId="N6di9-zLGbw"
        opts={{
          height: "390",
          width: "640",
          playerVars: {
            autoplay: 1,
          },
        }}
        onReady={onPlayerReady}
        onEnd={onPlayerEnd}
      />
      <button onClick={onPlayerEnd}>次の曲へ</button>
    </>
  );
}
export default Player;
