import React, { useEffect, useState, useRef } from "react";
import AudioPlayer from "react-modern-audio-player";
import styles from "./styles/AudioPlayer.module.css";

interface PlayerProps {
    currentTrack: any;
}

function Player({ currentTrack }: PlayerProps) {
    const [playList, setPlayList] = useState<any[]>([]);
    const [elapsed, setElapsed] = useState(0);

    // Garder la dernière valeur de elapsed en ref pour le listener
    const elapsedRef = useRef(elapsed);
    useEffect(() => {
        elapsedRef.current = elapsed;
    }, [elapsed]);

    // Mettre à jour la playlist quand currentTrack change
    useEffect(() => {
        if (currentTrack) {
            const formattedTrack = {
                id: currentTrack.id,
                name: currentTrack.name,
                src: currentTrack.audio,
                img: currentTrack.songImage
            };

            setPlayList((prev) => {
                const exists = prev.some((track) => track.id === formattedTrack.id);
                return exists ? prev : [formattedTrack];
            });
            setElapsed(currentTrack.elapsed || 0);
        }
    }, [currentTrack]);

    useEffect(() => {
        const timer = setTimeout(() => {
            const audioEl = document.querySelector("audio");
            if (audioEl) {
                const handlePlay = async () => {
                    try {
                        const res = await fetch("http://localhost:3000/player/status");
                        const data = await res.json();
                        setElapsed(data.elapsed);
                        audioEl.currentTime = data.elapsed;
                    } catch (error) {
                        console.error("Erreur en récupérant le statut :", error);
                    }
                };

                audioEl.addEventListener("play", handlePlay);
                return () => {
                    audioEl.removeEventListener("play", handlePlay);
                };
            }
        }, 100);

        return () => clearTimeout(timer);
    }, []);

    return (
        <div className={styles.audioPlayer}>
            {currentTrack && playList.length > 0 && (
                <AudioPlayer
                    className={styles.audioPlayer}
                    playList={playList}
                    audioInitialState={{
                        muted: false,
                        curPlayId: currentTrack.id,
                    }}
                    placement={{
                        player: "top",
                    }}
                    activeUI={{
                        all: true,
                        progress: "waveform",
                        playlist: false,
                        repeatType: false,
                        prevNnext: false,
                    }}
                    rootContainerProps={{ width: "40%" }}
                />
            )}
        </div>
    );
}

export default Player;
