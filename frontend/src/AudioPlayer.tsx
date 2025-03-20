import React, { useEffect, useState, useRef } from "react";
import AudioPlayer from "react-modern-audio-player";
import styles from "./styles/AudioPlayer.module.css";

interface PlayerProps {
    currentTrack: any;
}

function Player({ currentTrack }: PlayerProps) {
    const [playList, setPlayList] = useState<any[]>([]);
    const [isAudioReady, setIsAudioReady] = useState(false);
    const [audioError, setAudioError] = useState<string | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);

    // Référence vers l'élément audio
    const audioElementRef = useRef<HTMLAudioElement | null>(null);

    // Traitement de la piste reçue
    useEffect(() => {
        if (!currentTrack) {
            setAudioError("Aucune piste à lire");
            return;
        }

        if (!currentTrack.audio) {
            setAudioError("URL audio manquante");
            return;
        }

        try {
            new URL(currentTrack.audio);
        } catch (e) {
            setAudioError("URL audio invalide");
            return;
        }

        // Créer l'entrée pour la playlist
        const formattedTrack = {
            id: currentTrack.id || Date.now().toString(),
            name: currentTrack.name || "Sans titre",
            src: currentTrack.audio,
            img: currentTrack.songImage || ""
        };

        // Mettre à jour la playlist
        setPlayList([formattedTrack]);
        setIsAudioReady(true);
        setAudioError(null);
    }, [currentTrack]);

    // Configuration du lecteur audio et synchronisation
    useEffect(() => {
        if (!isAudioReady) return;

        let isMounted = true;
        let syncInterval: ReturnType<typeof setInterval>;

        // Configuration après le montage du composant
        const setupAudio = () => {
            const audioElement = document.querySelector("audio");
            if (!audioElement || !isMounted) return;

            audioElementRef.current = audioElement;

            // Définir le temps initial
            if (currentTrack?.elapsed) {
                audioElement.currentTime = currentTrack.elapsed;
            }

            // Gestionnaires d'événements
            const handlePlay = () => {
                if (!isMounted) return;
                setIsPlaying(true);
                // Synchroniser avec le serveur au démarrage de la lecture
                syncWithServer();
            };

            const handlePause = () => {
                if (!isMounted) return;
                setIsPlaying(false);
            };

            const handleError = () => {
                if (!isMounted) return;
                setAudioError("Impossible de lire l'audio");
            };

            // Ajout des écouteurs d'événements
            audioElement.addEventListener("play", handlePlay);
            audioElement.addEventListener("pause", handlePause);
            audioElement.addEventListener("error", handleError);

            // Synchronisation périodique simple (toutes les 15 secondes)
            syncInterval = setInterval(() => {
                if (audioElement.paused || !isMounted) return;
                syncWithServer();
            }, 15000);

            return () => {
                audioElement.removeEventListener("play", handlePlay);
                audioElement.removeEventListener("pause", handlePause);
                audioElement.removeEventListener("error", handleError);
                clearInterval(syncInterval);
            };
        };

        // Synchronisation avec le serveur
        const syncWithServer = async () => {
            try {
                const res = await fetch("http://localhost:3000/player/status");
                const data = await res.json();

                if (!audioElementRef.current || typeof data.elapsed !== 'number') return;

                // Si le décalage est significatif (> 3 secondes), ajuster le temps
                const timeDiff = Math.abs(audioElementRef.current.currentTime - data.elapsed);
                if (timeDiff > 3) {
                    audioElementRef.current.currentTime = data.elapsed;
                }
            } catch (error) {
                console.error("Erreur de synchronisation:", error);
            }
        };

        // Démarrer la configuration après un court délai
        const timerId = setTimeout(setupAudio, 300);

        return () => {
            isMounted = false;
            clearTimeout(timerId);
            clearInterval(syncInterval);
        };
    }, [isAudioReady, currentTrack]);

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
