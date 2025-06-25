import React, { useEffect, useState, useRef } from "react";
import AudioPlayer from "./components/CustomAudioPlayer";
import styles from "./styles/AudioPlayer.module.css";
import { Height } from "@mui/icons-material";
import { height, margin, maxHeight, maxWidth, minWidth } from "@mui/system";
import { incrementRadioPlayCount } from "./services/suno.services";

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

    // Traitement de la piste reçue - optimisé pour éviter les re-renders inutiles
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
            id: currentTrack._id || Date.now().toString(),
            name: currentTrack.name || "Sans titre",
            src: currentTrack.audio,
            img: currentTrack.songImage || ""
        };

        // Mettre à jour la playlist seulement si c'est vraiment une nouvelle chanson
        const isNewTrack = playList.length === 0 || playList[0].src !== formattedTrack.src;
        if (isNewTrack) {
            console.log('Loading new track in player:', formattedTrack.name);
            setPlayList([formattedTrack]);
            setIsAudioReady(true);
        }

        setAudioError(null);

        // Si c'est un changement de piste (nouvelle chanson), synchroniser automatiquement avec fade
        if (currentTrack.isTrackChange && audioElementRef.current) {
            setTimeout(() => {
                if (audioElementRef.current && currentTrack.elapsed !== undefined) {
                    console.log(`Track change detected, syncing to ${currentTrack.elapsed}s`);

                    // Pour un changement de piste, démarrer avec un fade in très doux
                    const targetTime = currentTrack.elapsed;
                    audioElementRef.current.currentTime = targetTime;
                    audioElementRef.current.volume = 0.1; // Volume bas au démarrage

                    // Fade in très progressif pour éviter les à-coups
                    let currentVol = 0.1;
                    const fadeInterval = setInterval(() => {
                        if (audioElementRef.current && currentVol < 1.0) {
                            currentVol += 0.05; // Augmentation très graduelle
                            audioElementRef.current.volume = Math.min(currentVol, 1.0);
                        } else {
                            clearInterval(fadeInterval);
                        }
                    }, 50); // Fade in sur ~1 seconde
                }
            }, 800); // Délai augmenté pour permettre un chargement complet
        }
    }, [currentTrack?.audio, currentTrack?._id, currentTrack?.isTrackChange, playList.length]); // Dépendances optimisées

    // Configuration du lecteur audio et synchronisation
    useEffect(() => {
        if (!isAudioReady) return;

        let isMounted = true;

        // Configuration après le montage du composant
        const setupAudio = () => {
            const audioElement = document.querySelector("audio");
            if (!audioElement || !isMounted) return;

            audioElementRef.current = audioElement;

            // Définir le temps initial selon les données SSE
            if (currentTrack?.elapsed) {
                audioElement.currentTime = currentTrack.elapsed;
            }

            // Gestionnaires d'événements
            const handlePlay = async () => {
                if (!isMounted) return;
                setIsPlaying(true);
                // À chaque fois que l'utilisateur appuie sur play, se synchroniser avec la radio
                await syncWithRadio();
            };

            const handlePause = () => {
                if (!isMounted) return;
                setIsPlaying(false);
                // L'utilisateur peut mettre en pause, la radio continue côté serveur
            };

            const handleError = () => {
                if (!isMounted) return;
                setAudioError("Impossible de lire l'audio");
            };

            const handleEnded = async () => {
                if (!isMounted || !currentTrack?._id) return;
                try {
                    await incrementRadioPlayCount(currentTrack._id);
                    console.log("Radio play count incremented for song:", currentTrack._id);
                } catch (error) {
                    console.error("Error incrementing radio play count:", error);
                }
            };

            // Ajout des écouteurs d'événements
            audioElement.addEventListener("play", handlePlay);
            audioElement.addEventListener("pause", handlePause);
            audioElement.addEventListener("error", handleError);
            audioElement.addEventListener("ended", handleEnded);

            return () => {
                audioElement.removeEventListener("play", handlePlay);
                audioElement.removeEventListener("pause", handlePause);
                audioElement.removeEventListener("error", handleError);
                audioElement.removeEventListener("ended", handleEnded);
            };
        };

        // Synchronisation intelligente avec la radio (position actuelle)
        const syncWithRadio = async () => {
            try {
                const res = await fetch("http://localhost:3000/player/status");
                const data = await res.json();

                if (!audioElementRef.current || typeof data.elapsed !== 'number') return;

                // Synchroniser seulement si c'est la même chanson
                if (data.id === currentTrack?._id) {
                    const currentTime = audioElementRef.current.currentTime;
                    const serverTime = data.elapsed;
                    const timeDiff = Math.abs(currentTime - serverTime);

                    // Synchroniser seulement si la différence est significative (> 3 secondes)
                    // Augmenté de 2 à 3 secondes pour être plus tolérant
                    if (timeDiff > 3) {
                        console.log(`User clicked play - syncing with radio: ${currentTime}s -> ${serverTime}s (diff: ${timeDiff.toFixed(1)}s)`);

                        // Fade out très rapide, changement de position, puis fade in progressif
                        const originalVolume = audioElementRef.current.volume;

                        // Fade out ultra-rapide (50ms)
                        audioElementRef.current.volume = originalVolume * 0.05;

                        setTimeout(() => {
                            if (audioElementRef.current) {
                                audioElementRef.current.currentTime = serverTime;
                                // Fade in progressif plus doux
                                let currentVol = 0.05;
                                const fadeInterval = setInterval(() => {
                                    if (audioElementRef.current && currentVol < originalVolume) {
                                        currentVol += 0.1;
                                        audioElementRef.current.volume = Math.min(currentVol, originalVolume);
                                    } else {
                                        clearInterval(fadeInterval);
                                    }
                                }, 20);
                            }
                        }, 50);
                    } else {
                        console.log(`User clicked play - no sync needed (diff: ${timeDiff.toFixed(1)}s)`);
                    }
                }
            } catch (error) {
                console.error("Erreur de synchronisation avec la radio:", error);
            }
        };

        // Démarrer la configuration après un court délai
        const timerId = setTimeout(setupAudio, 300);

        return () => {
            isMounted = false;
            clearTimeout(timerId);
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
