import React, { useEffect, useState, useRef } from "react";
import AudioPlayer from "react-modern-audio-player";
import styles from "./styles/AudioPlayer.module.css";

interface PlayerProps {
    currentTrack: any;
}

function Player({ currentTrack }: PlayerProps) {
    const [playList, setPlayList] = useState<any[]>([]);
    const [elapsed, setElapsed] = useState(0);
    const [isAudioReady, setIsAudioReady] = useState(false);
    const [audioError, setAudioError] = useState<string | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);

    // Refs pour accéder aux éléments et valeurs entre les rendus
    const audioElementRef = useRef<HTMLAudioElement | null>(null);
    const audioTestRef = useRef<HTMLAudioElement | null>(null);

    // Précharger et vérifier l'audio avant de le jouer
    const preloadAudio = (audioUrl: string): Promise<void> => {
        return new Promise((resolve, reject) => {
            if (audioTestRef.current) {
                audioTestRef.current.src = '';
            }

            const audioTest = new Audio();
            audioTestRef.current = audioTest;

            const handleCanPlay = () => {
                console.log("Audio préchargé avec succès:", audioUrl);
                audioTest.removeEventListener('canplaythrough', handleCanPlay);
                audioTest.removeEventListener('error', handleError);
                resolve();
            };

            const handleError = (e: any) => {
                console.error("Erreur lors du préchargement:", e);
                audioTest.removeEventListener('canplaythrough', handleCanPlay);
                audioTest.removeEventListener('error', handleError);
                reject(new Error("Impossible de charger l'audio"));
            };

            audioTest.addEventListener('canplaythrough', handleCanPlay);
            audioTest.addEventListener('error', handleError);
            audioTest.src = audioUrl;
        });
    };

    // Synchronisation avec le serveur
    const syncWithServer = async (audioEl: HTMLAudioElement | null = null) => {
        try {
            const res = await fetch("http://localhost:3000/player/status");
            const data = await res.json();
            setElapsed(data.elapsed);

            if (audioEl) {
                const timeDiff = Math.abs((audioEl.currentTime || 0) - data.elapsed);
                if (timeDiff > 3) { // Seulement ajuster si différence > 3 secondes
                    console.log(`Ajustement: ${audioEl.currentTime} -> ${data.elapsed}`);
                    audioEl.currentTime = data.elapsed;
                }
            }
        } catch (error) {
            console.error("Erreur de synchronisation:", error);
        }
    };

    // Traitement de la piste reçue
    useEffect(() => {
        if (!currentTrack) {
            setAudioError("Aucune piste à lire");
            return;
        }

        if (!currentTrack.audio) {
            console.error("URL audio manquante:", currentTrack);
            setAudioError("URL audio manquante");
            return;
        }

        try {
            new URL(currentTrack.audio);
        } catch (e) {
            console.error("URL audio invalide:", currentTrack.audio);
            setAudioError("URL audio invalide");
            return;
        }

        console.log("Traitement nouvelle piste:", currentTrack.id);

        const formattedTrack = {
            id: currentTrack.id || Date.now().toString(),
            name: currentTrack.name || "Sans titre",
            src: currentTrack.audio,
            img: currentTrack.songImage || ""
        };

        // Précharger l'audio pour vérifier qu'il est accessible
        preloadAudio(formattedTrack.src)
            .then(() => {
                setPlayList([formattedTrack]);
                setElapsed(currentTrack.elapsed || 0);
                setIsAudioReady(true);
                setAudioError(null);
            })
            .catch(() => {
                setAudioError("Impossible de charger l'audio");
                setIsAudioReady(false);
            });
    }, [currentTrack]);

    // Configuration du lecteur audio et synchronisation
    useEffect(() => {
        if (!isAudioReady) return;

        // Configuration de l'élément audio après montage du composant
        const setupAudio = () => {
            const audioElement = document.querySelector("audio");
            if (!audioElement) return;

            audioElementRef.current = audioElement;
            audioElement.currentTime = elapsed;

            // Synchronisation lors du play
            const handlePlay = () => {
                console.log("Play - synchronisation");
                setIsPlaying(true);
                syncWithServer(audioElement);
            };

            const handlePause = () => {
                setIsPlaying(false);
            };

            audioElement.addEventListener("play", handlePlay);
            audioElement.addEventListener("pause", handlePause);

            // Synchronisation périodique
            const syncInterval = setInterval(() => {
                if (!audioElement.paused) {
                    syncWithServer(audioElement);
                }
            }, 30000);

            return () => {
                audioElement.removeEventListener("play", handlePlay);
                audioElement.removeEventListener("pause", handlePause);
                clearInterval(syncInterval);
            };
        };

        const timerId = setTimeout(setupAudio, 300);
        return () => clearTimeout(timerId);
    }, [isAudioReady, elapsed]);

    // Nettoyage à la destruction du composant
    useEffect(() => {
        return () => {
            if (audioTestRef.current) {
                audioTestRef.current.src = '';
                audioTestRef.current = null;
            }
        };
    }, []);

    return (
        <div className={styles.audioPlayer}>
            {isAudioReady && playList.length > 0 ? (
                <AudioPlayer
                    className={styles.audioPlayer}
                    playList={playList}
                    audioInitialState={{
                        muted: false,
                        curPlayId: playList[0].id,
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
            ) : (
                <div className={styles.audioPlayerLoading}>
                    {audioError || "Chargement du lecteur..."}
                </div>
            )}
        </div>
    );
}

export default Player;
