import { useState } from "react";
import YouTube, { YouTubeProps } from "react-youtube";

// type Props = {
//   videoId: string;
// };

// function Play(props: Props) {
function Player() {
  const [YTPlayer, setYTPlayer] = useState<YT.Player>();
  const onPlayerReady: YouTubeProps["onReady"] = (event) => {
    setYTPlayer(event.target);
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
      <YouTube videoId="N6di9-zLGbw" opts={opts} onReady={onPlayerReady} />
      <button
        onClick={() => {
          if (YTPlayer) {
            YTPlayer.playVideo();
          }
        }}
      >
        再生
      </button>
      <button
        onClick={() => {
          if (YTPlayer) {
            YTPlayer.pauseVideo();
          }
        }}
      >
        停止
      </button>
    </>
  );
}
export default Player;
