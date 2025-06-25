import { useNonNullableContext } from "../../../../hooks/useNonNullableContext";
import { audioPlayerStateContext } from "../../../../components/AudioPlayer/Context/StateContext";
import { FC } from "react";
import styled from "styled-components";
import React from "react";

const ArtworkContainer = styled.div`
  display: flex;
  align-items: center;
  width: 100%;
  height: 100%;
  img {
    width: 60px;
    height: 60px;
    cursor: pointer;
    transition: transform 0.2s ease;
    user-select: none;
    -webkit-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    border-radius: 50%;
    
    &:hover {
      transform: scale(1.05);
    }
  }
`;

export const Artwork: FC = () => {
  const { playList, curIdx, coverImgsCss } = useNonNullableContext(
    audioPlayerStateContext
  );

  const currentTrack = playList[curIdx];
  const sunoLink = (currentTrack as any)?.src.replace("https://cdn1.suno.ai/", "https://suno.com/song/").replace(".mp3", "");



  const handleImageClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();



    if (sunoLink) {
      console.log("Opening link:", sunoLink);
      window.open(sunoLink, '_blank', 'noopener,noreferrer');
    } else {
      console.log("No suno link available");
    }
  };

  return (
    <ArtworkContainer className="artwork-container">
      <img
        src={currentTrack?.img}
        alt={""}
        style={coverImgsCss?.artwork}
        onClick={handleImageClick}
        title={sunoLink ? "Cliquer pour ouvrir sur Suno" : ""}
        draggable={false}
      />
    </ArtworkContainer>
  );
};
