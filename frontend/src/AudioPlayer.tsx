import React, { useEffect, useState, useRef } from "react";
import AudioPlayer from "react-modern-audio-player";
import styles from "./styles/AudioPlayer.module.css";

function Player() {
    const [playList, setPlayList] = useState<any[]>([]);
    const [currentTrack, setCurrentTrack] = useState<{
        id: string;
        elapsed: number;
        duration: number;
        isTrackChange?: boolean;
    } | null>(null);
    const [elapsed, setElapsed] = useState(0);

    // Garder la dernière valeur de elapsed en ref pour le listener
    const elapsedRef = useRef(elapsed);
    useEffect(() => {
        elapsedRef.current = elapsed;
    }, [elapsed]);

    // Connexion SSE unique
    useEffect(() => {
        const eventSource = new EventSource("http://localhost:3000/player/connection");
        eventSource.onmessage = (event) => {
            const data = JSON.parse(event.data);
            setCurrentTrack(data);
            setPlayList((prev) => {
                const exists = prev.some((track) => track.id === data.id);
                return exists ? prev : [...prev, data];
            });
            setElapsed(data.elapsed);
        };
        return () => eventSource.close();
    }, []);

    useEffect(() => {
        const timer = setTimeout(() => {
            const audioEl = document.querySelector("audio");
            if (audioEl) {
                const handlePlay = async () => {
                    try {
                        const res = await fetch("http://localhost:3000/player/status");
                        const data = await res.json();
                        setCurrentTrack(data);
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
            {currentTrack && (
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
