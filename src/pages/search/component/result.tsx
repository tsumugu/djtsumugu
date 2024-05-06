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
    <div className="searchResults">
      <div className="searchResultsWrapper grid gap-1 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {searchResults &&
          searchResults.map((item) => (
            <div
              className="searchResult m-4 max-w-sm rounded overflow-hidden shadow-lg"
              key={item.videoId}
            >
              <img
                className="thumbnail w-full"
                src={item.thumbnailUrl}
                alt={item.videoTitle}
              />
              <div className="px-6 py-4">
                <p className="title font-bold text-xl mb-2">
                  {item.videoTitle}
                </p>
                <p className="channel text-gray-700 text-base">
                  {item.channelTitle}
                </p>
                <button
                  className="addButton w-full bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                  onClick={() => requestVideo(item)}
                >
                  この曲を追加
                </button>
              </div>
            </div>
          ))}
      </div>
    </div>
  );
}
export default Result;
