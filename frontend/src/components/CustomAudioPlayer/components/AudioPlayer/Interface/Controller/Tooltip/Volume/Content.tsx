import React from "react";
import { useNonNullableContext } from "../../../../../../hooks/useNonNullableContext";
import { audioPlayerDispatchContext } from "../../../../../AudioPlayer/Context/dispatchContext";
import {
  audioPlayerStateContext,
  VolumeSliderPlacement,
} from "../../../../../AudioPlayer/Context/StateContext";
import { ChangeEvent, FC, useCallback } from "react";
import styled from "styled-components";

export const VolumeSlider: FC<{ placement: VolumeSliderPlacement }> = ({
  placement,
}) => {
  const { curAudioState } = useNonNullableContext(audioPlayerStateContext);
  const audioPlayerDispatch = useNonNullableContext(audioPlayerDispatchContext);

  const onChangeVolume = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      e.stopPropagation();
      e.preventDefault();
      if (curAudioState.muted) {
        audioPlayerDispatch({ type: "SET_MUTED", muted: false });
      }

      const { value } = e.target;
      const parsedValue = parseFloat(value);
      audioPlayerDispatch({
        type: "SET_VOLUME",
        volume: parsedValue,
      });
    },
    [curAudioState.muted, audioPlayerDispatch]
  );

  return (
    <VolumeSliderContainer placement={placement}>
      <input
        type="range"
        min="0"
        max="1"
        step="0.01"
        value={curAudioState.volume}
        onChange={onChangeVolume}
        className="volume-slider"
      />
    </VolumeSliderContainer>
  );
};

const VolumeSliderContainer = styled.div<{ placement: VolumeSliderPlacement }>`
  padding: 10px;
  width: 100px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;

  .volume-slider {
    width: 100%;
    height: 4px;
    -webkit-appearance: none;
    background: #ddd;
    border-radius: 2px;
    outline: none;
    margin: 0;
    padding: 0;

    &::-webkit-slider-thumb {
      -webkit-appearance: none;
      width: 16px;
      height: 16px;
      border-radius: 50%;
      background: #666;
      cursor: pointer;
      margin-top: 10;
      position: relative;
      top: 0;
      transform: none;
    }

    &::-moz-range-thumb {
      width: 16px;
      height: 16px;
      border-radius: 50%;
      background: #666;
      cursor: pointer;
      border: none;
      position: relative;
      top: 0;
      transform: none;
    }

    &::-moz-range-track {
      width: 100%;
      height: 4px;
      background: #ddd;
      border: none;
    }
  }
`;
