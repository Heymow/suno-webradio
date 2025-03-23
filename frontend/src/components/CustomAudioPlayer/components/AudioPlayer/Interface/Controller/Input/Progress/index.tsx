import { useNonNullableContext } from "../../../../../../hooks/useNonNullableContext";
import { audioPlayerStateContext } from "../../../../../../components/AudioPlayer/Context/StateContext";
import { FC } from "react";
import styled from "styled-components";
import { BarProgress } from "./BarProgress";
import { WaveformProgress } from "./WaveformProgress";
import React from "react";

const ProgressContainer = styled.div`
  min-width: 100px;
`;

export const Progress: FC = () => {
  const { activeUI } = useNonNullableContext(audioPlayerStateContext);

  return (
    <ProgressContainer className="progress-container">
      <WaveformProgress isActive={true} />
      <BarProgress isActive={activeUI.progress !== "waveform"} />
    </ProgressContainer>
  );
};
