import { useEffect } from "react";

function Result(props: { query?: string }) {
  useEffect(() => {
    const searchVideo = async () => {
      const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${props.query}&maxResults=50&eventType=completed&order=viewCount&relevanceLanguage=ja&safeSearch=none&type=video&key=${process.env.REACT_APP_YOUTUBE_API_KEY}`;
      console.log(url);
      // const response = await fetch(url);
      // const data = await response.json();
      // console.log(data);
    };
    const timer = setTimeout(async () => {
      await searchVideo();
    }, 500);
    return () => {
      clearTimeout(timer);
    };
  }, [props.query]);
  return <>query: {props.query}</>;
}
export default Result;
