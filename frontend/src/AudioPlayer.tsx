import React, { useEffect } from "react";
import AudioPlayer from "react-modern-audio-player";
import styles from "./styles/AudioPlayer.module.css";

const playList = [
    {
        name: "Track 1",
        writer: "Artist 1",
        img: "https://via.placeholder.com/150",
        src: "https://cdn1.suno.ai/4e0af342-326c-42b6-9433-86a8e48a55f4.mp3",
        id: 1,
    },
];

useEffect(() => {
    if (AudioContext) {
        const audioContext = new AudioContext();
        if (audioContext.state === "suspended") {
            audioContext.resume()
        }
    }
}, []);


function Player() {
    <div className={styles.audioPlayer}>
        <AudioPlayer className={styles.audioPlayer}
            playList={playList}
            audioInitialState={{
                muted: false,
                volume: 0.5,
                curPlayId: 1,
            }}
            placement={{
                player: "top",
            }}
            activeUI={{
                all: true,
                progress: "waveform",

            }}
            rootContainerProps={{ width: "40%", }}
        />
    </div>
}

export default Player;