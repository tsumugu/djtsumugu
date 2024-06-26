import arrayShuffle from "array-shuffle";
import { useEffect, useState } from "react";
import YouTube, { YouTubeProps } from "react-youtube";
import { VideoType, mVideo } from "../../type/type";
import { db } from "../..";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { insertArrayInArray } from "../../util/utils";
import { loadVideo, playedFlagToTrue } from "./helper/ytHelper";

function Player() {
  const [YTPlayer, setYTPlayer] = useState<YT.Player>();
  const [videoIds, setVideoIds] = useState<mVideo[]>();
  const [videoIdsFromPlaylist, setVideoIdsFromPlaylist] = useState<mVideo[]>();
  const [videoIdsFromRequest, setVideoIdsFromRequest] = useState<mVideo[]>();
  const [nowPlaying, setNowPlaying] = useState<mVideo>();

  ////////////////////////////////////
  // プレイリストとDBから動画を読み込む　//
  ///////////////////////////////////
  // 1. プレイリストから動画を読み込む
  const fetchVideoIdsFromPlaylist = async () => {
    const PLAYLIST_ID = "RDCLAK5uy_nbK9qSkqYZvtMXH1fLCMmC1yn8HEm0W90"; // released "RDCLAK5uy_nVjU2j4lOFyJicLDWEMjYmBkaejmrsx5M";
    const url = `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&playlistId=${PLAYLIST_ID}&maxResults=200&key=${process.env.REACT_APP_YOUTUBE_API_KEY}`;
    const response = await fetch(url);
    const data = await response.json();
    return arrayShuffle(
      /* @ts-ignore */
      data.items.map((e) => {
        return {
          videoTitle: e.snippet.title,
          videoId: e.snippet.resourceId.videoId,
          videoType: VideoType.normal,
        };
      })
    ) as mVideo[];
  };

  useEffect(() => {
    (async function () {
      const videoIdsFromPlaylist = await fetchVideoIdsFromPlaylist();
      setVideoIdsFromPlaylist(videoIdsFromPlaylist);
    })();
  }, []);

  // 2. firestoreから動画を読み込む (firestoreに追加されたときはvideoIdsに追加する)
  const fetchVideoIdsFromRequest = () => {
    return onSnapshot(
      query(collection(db, "requests"), where("isPlayed", "==", false)),
      (querySnapshot) => {
        const newRequests = querySnapshot
          .docChanges()
          .map((change) => {
            const data = change.doc.data();
            if (change.type === "added" && data.videoId) {
              return {
                videoTitle: data.videoTitle,
                videoId: data.videoId,
                videoType: VideoType.request,
                collectionId: change.doc.id,
              };
            }
            return null;
          })
          .filter(Boolean) as mVideo[];
        setVideoIdsFromRequest(newRequests);
      }
    );
  };

  useEffect(() => {
    const unsubscribe = fetchVideoIdsFromRequest();
    return () => {
      unsubscribe();
    };
  }, []);

  // 3. 2つの動画IDリストをマージする
  useEffect(() => {
    if (videoIdsFromPlaylist && videoIdsFromRequest) {
      // videoIdsFromPlaylistの0番目 + newRequests + videoIdsFromPlaylistの1番目以降 という順番になるようにする
      const mergedVideoIds = insertArrayInArray(
        videoIdsFromPlaylist,
        videoIdsFromRequest,
        1
      );
      setVideoIds(mergedVideoIds);
    }
  }, [videoIdsFromPlaylist, videoIdsFromRequest]);

  ////////////////////////
  // YTPlayerに関連する　//
  //////////////////////
  // 次の曲へ行くときに呼び出す関数
  const playNext = () => {
    if (YTPlayer && videoIds) {
      const tmpVideoIds = videoIds;
      tmpVideoIds.shift();
      setVideoIds(tmpVideoIds);
      setNowPlaying(videoIds[0]);
      loadVideo(YTPlayer, videoIds[0].videoId);
    }
  };

  // プレイヤーの準備が完了したときに呼び出される関数
  const onPlayerReady: YouTubeProps["onReady"] = (event) => {
    setYTPlayer(event.target);
    if (videoIds) {
      setNowPlaying(videoIds[0]);
      loadVideo(event.target, videoIds[0].videoId);
    }
  };

  // プレイヤーの再生が終わったときに呼び出される関数
  const onPlayerEnd = async () => {
    if (
      videoIds &&
      videoIds[0].videoType === VideoType.request &&
      videoIds[0].collectionId
    ) {
      await playedFlagToTrue(videoIds[0].collectionId!);
    }
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
      <p>
        {nowPlaying?.videoType === VideoType.request
          ? "リクエストされた曲"
          : ""}
      </p>
      <button onClick={onPlayerEnd}>次の曲へ</button>
    </>
  );
}
export default Player;
