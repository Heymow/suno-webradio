import React, { useEffect, useState, useRef } from "react";
import AudioPlayer from "./components/CustomAudioPlayer";
import styles from "./styles/AudioPlayer.module.css";
import { Height } from "@mui/icons-material";
import { height, margin, maxHeight, maxWidth, minWidth } from "@mui/system";

interface PlayerProps {
    currentTrack: any;
}

// Hook personnalisé pour suivre la largeur de la fenêtre
function useWindowWidth() {
    const [width, setWidth] = useState(window.innerWidth);

    useEffect(() => {
        const handleResize = () => setWidth(window.innerWidth);

        window.addEventListener('resize', handleResize);
        // Nettoyage de l'événement lors du démontage du composant
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    return width;
}

function Player({ currentTrack }: PlayerProps) {
    const [playList, setPlayList] = useState<any[]>([]);
    const [isAudioReady, setIsAudioReady] = useState(false);
    const [audioError, setAudioError] = useState<string | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const width = useWindowWidth();
    let screenSize = width > 1400 ? 'big' : 'medium';
    width < 1100 && (screenSize = 'small');

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
                <div className={styles.audioPlayer}>
                    <AudioPlayer
                        playList={playList}
                        audioInitialState={{
                            muted: false,
                            curPlayId: playList[0].id,
                        }}
                        placement={{
                            player: "top",
                            volumeSlider: "right",
                            interface: {
                                templateArea: {
                                    volume: "row1-8 / col1-9",
                                    trackTimeDuration: "row1-5",
                                }
                            }
                        }}
                        activeUI={{
                            all: true,
                            progress: "waveform",
                            playList: false,
                            repeatType: false,
                            prevNnext: false,
                            trackInfo: screenSize === "big",
                            artwork: !(screenSize === "small"),
                        }}
                        rootContainerProps={{ width: (screenSize === "small") ? "45%" : "52.2%", minWidth: "300px", maxWidth: "2000px" }}
                    />
                </div>
            ) : (
                <div className={styles.audioPlayerLoading}>
                    {audioError || "Chargement du lecteur..."}
                </div>
            )}
        </div>
    );
}

export default Player;
