import { useEffect, useState } from "react";
import { VideoType, mVideo } from "../../../type/type";
import { addDoc, collection } from "firebase/firestore";
import { db } from "../../..";

function Result(props: { query?: string }) {
  const [searchResults, setSearchResults] = useState<mVideo[]>();

  useEffect(() => {
    const searchVideo = async () => {
      const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${props.query}&maxResults=50&order=viewCount&relevanceLanguage=ja&safeSearch=none&type=video&key=${process.env.REACT_APP_YOUTUBE_API_KEY}`;
      const response = await fetch(url);
      const data = await response.json();
      // MEMO: resultがゼロになるエラーを解決したい
      console.log(data);
      return (
        data.items
          /* @ts-ignore */
          .map((e) => {
            if (e.id && e.id.videoId) {
              return {
                videoTitle: e.snippet.title,
                videoId: e.id.videoId,
                videoType: VideoType.request,
                thumbnailUrl: e.snippet.thumbnails.default.url,
                channelTitle: e.snippet.channelTitle,
              };
            }
            return null;
          })
          .filter(Boolean) as mVideo[]
      );
    };
    const timer = setTimeout(async () => {
      const result = await searchVideo();
      console.log(result);
      setSearchResults(result);
    }, 500);
    return () => {
      clearTimeout(timer);
    };
  }, [props.query]);

  const requestVideo = (item: mVideo) => {
    (async function () {
      await addDoc(collection(db, "requests"), {
        videoTitle: item.videoTitle,
        videoId: item.videoId,
        isPlayed: false,
        now: Date(),
      });
    })();
  };

  return (
    <>
      query: {props.query}
      <ul>
        {searchResults &&
          searchResults.map((item) => (
            <div key={item.videoId}>
              <p>{item.videoId}</p>
              <p>{item.videoTitle}</p>
              <p>{item.channelTitle}</p>
              <img src={item.thumbnailUrl} alt={item.videoTitle} />
              <button onClick={() => requestVideo(item)}>この曲を追加</button>
              <hr />
            </div>
          ))}
      </ul>
    </>
  );
}
export default Result;
