import React, { useEffect, useState, useRef } from "react";
import AudioPlayer from "./CustomAudioPlayer";
import styles from "../styles/AudioPlayer.module.css";
import { Height } from "@mui/icons-material";
import { height, margin, maxHeight, maxWidth, minWidth } from "@mui/system";
import { incrementRadioPlayCount } from "../services/suno.services";

interface PlayerProps {
    currentTrack: any;
    isEmbed?: boolean;
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

function Player({ currentTrack, isEmbed = false }: PlayerProps) {
    const [playList, setPlayList] = useState<any[]>([]);
    const [isAudioReady, setIsAudioReady] = useState(false);
    const [audioError, setAudioError] = useState<string | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [waitingForInteraction, setWaitingForInteraction] = useState(false);
    const width = useWindowWidth();
    let screenSize = width > 1400 ? 'big' : 'medium';
    width < 1100 && (screenSize = 'small');

    // Référence vers l'élément audio
    const audioElementRef = useRef<HTMLAudioElement | null>(null);
    // Référence pour suivre la dernière piste jouée et éviter les sauts
    const lastTrackIdRef = useRef<string | null>(null);
    // Référence pour savoir si on doit lire la prochaine piste automatiquement
    const shouldAutoPlayRef = useRef(false);
    // Référence pour savoir si l'utilisateur a déjà interagi avec le lecteur
    const hasUserInteractedRef = useRef(false);
    // Référence pour éviter la double synchronisation lors du changement de piste
    const isChangingTrackRef = useRef(false);

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

            // Si la lecture automatique est demandée (fin de piste précédente)
            if (shouldAutoPlayRef.current) {
                setIsPlaying(true);
                shouldAutoPlayRef.current = false;
            }
        }

        setAudioError(null);
    }, [currentTrack?.audio, currentTrack?._id, currentTrack?.isTrackChange, playList.length]); // Dépendances optimisées

    // Configuration du lecteur audio et synchronisation
    useEffect(() => {
        if (!isAudioReady) return;

        let isMounted = true;

        // Configuration après le montage du composant
        const setupAudio = (retryCount = 0) => {
            if (!isMounted) return;

            // Utiliser la ref si disponible, sinon chercher dans le DOM
            const audioElement = audioElementRef.current || document.querySelector("audio");

            // Si l'élément audio n'est pas encore présent, réessayer
            if (!audioElement) {
                if (retryCount < 50) { // Essayer pendant 5 secondes max (50 * 100ms)
                    setTimeout(() => setupAudio(retryCount + 1), 100);
                } else {
                    console.error("Audio element not found after 5 seconds");
                }
                return;
            }

            // Assurer que la ref est à jour si on l'a trouvé via querySelector
            if (!audioElementRef.current) {
                audioElementRef.current = audioElement as HTMLAudioElement;
            }

            // Définir le temps initial seulement si c'est une nouvelle piste
            if (currentTrack?._id && currentTrack._id !== lastTrackIdRef.current) {
                if (currentTrack.elapsed) {
                    audioElement.currentTime = currentTrack.elapsed;
                }

                // Si c'est un changement de piste, appliquer un fade-in immédiat
                if (currentTrack.isTrackChange) {
                    isChangingTrackRef.current = true;
                    // Réactiver la synchro après 5 secondes (le temps que tout se stabilise)
                    setTimeout(() => {
                        isChangingTrackRef.current = false;
                    }, 5000);

                    audioElement.volume = 0;
                    let currentVol = 0;
                    const fadeInterval = setInterval(() => {
                        if (!isMounted) {
                            clearInterval(fadeInterval);
                            return;
                        }
                        if (currentVol < 1.0) {
                            currentVol += 0.05;
                            audioElement.volume = Math.min(currentVol, 1.0);
                        } else {
                            clearInterval(fadeInterval);
                        }
                    }, 50);
                }

                lastTrackIdRef.current = currentTrack._id;
            }

            // Tentative d'autoplay intelligent
            const attemptPlay = async () => {
                try {
                    await audioElement.play();
                } catch (error) {
                    console.log("Autoplay prevented by browser, waiting for interaction");
                    // Attendre 4 secondes avant d'afficher le message
                    setTimeout(() => {
                        // Vérifier si l'audio est toujours en pause et si l'utilisateur n'a pas interagi entre temps
                        if (audioElement.paused && !hasUserInteractedRef.current) {
                            setWaitingForInteraction(true);
                        }
                    }, 4000);
                }
            };

            // Fallback : Jouer au premier clic/touche sur la page
            const handleInteraction = (e: Event) => {
                // Si l'utilisateur a déjà interagi, on ne fait rien
                if (hasUserInteractedRef.current) {
                    document.removeEventListener('click', handleInteraction);
                    document.removeEventListener('keydown', handleInteraction);
                    return;
                }

                // Si l'élément cliqué est un bouton ou un lien, on ne force pas la lecture
                // sauf si c'est l'overlay d'interaction
                const target = e.target as HTMLElement;
                const isInteractive = target.closest('button') || target.closest('a') || target.closest('[role="button"]');

                if (isInteractive && !target.closest(`.${styles.interactionOverlay}`)) {
                    // On considère que c'est une interaction utilisateur valide
                    hasUserInteractedRef.current = true;
                    document.removeEventListener('click', handleInteraction);
                    document.removeEventListener('keydown', handleInteraction);
                    return;
                }

                attemptPlay();
                setWaitingForInteraction(false);
                hasUserInteractedRef.current = true;
                // On retire les écouteurs après la première interaction
                document.removeEventListener('click', handleInteraction);
                document.removeEventListener('keydown', handleInteraction);
            };

            // Gestionnaires d'événements
            const handlePlay = async () => {
                if (!isMounted) return;
                setIsPlaying(true);
                setWaitingForInteraction(false);
                shouldAutoPlayRef.current = false; // Reset on manual play
                hasUserInteractedRef.current = true;

                // Si la lecture a commencé, on n'a plus besoin des écouteurs d'interaction
                document.removeEventListener('click', handleInteraction);
                document.removeEventListener('keydown', handleInteraction);

                // À chaque fois que l'utilisateur appuie sur play, se synchroniser avec la radio
                await syncWithRadio();
            };

            const handlePause = () => {
                if (!isMounted) return;
                setIsPlaying(false);
                hasUserInteractedRef.current = true;
                // L'utilisateur peut mettre en pause, la radio continue côté serveur
            };

            const handleError = () => {
                if (!isMounted) return;
                setAudioError("Impossible de lire l'audio");
            };

            const handleEnded = async () => {
                if (!isMounted || !currentTrack?._id) return;
                shouldAutoPlayRef.current = true; // Set on ended
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


            // Définir le temps initial seulement si c'est une nouvelle piste
            if (currentTrack?._id && currentTrack._id !== lastTrackIdRef.current) {
                if (currentTrack.elapsed) {
                    audioElement.currentTime = currentTrack.elapsed;
                }
                lastTrackIdRef.current = currentTrack._id;
                // Essayer de jouer seulement si c'est une nouvelle piste
                attemptPlay();
            } else if (!lastTrackIdRef.current) {
                // Première initialisation
                attemptPlay();
            } else if (audioElement.paused && !hasUserInteractedRef.current && !waitingForInteraction) {
                // Si on est en pause, qu'on n'a pas interagi, et qu'on n'attend pas d'interaction
                // C'est probablement un raté de l'autoplay (ex: Strict Mode), on réessaie
                attemptPlay();
            }

            if (!hasUserInteractedRef.current) {
                document.addEventListener('click', handleInteraction);
                document.addEventListener('keydown', handleInteraction);
            }

            return () => {
                audioElement.removeEventListener("play", handlePlay);
                audioElement.removeEventListener("pause", handlePause);
                audioElement.removeEventListener("error", handleError);
                audioElement.removeEventListener("ended", handleEnded);
                document.removeEventListener('click', handleInteraction);
                document.removeEventListener('keydown', handleInteraction);
            };
        };

        // Synchronisation intelligente avec la radio (position actuelle)
        const syncWithRadio = async () => {
            // Ne pas synchroniser si on est en train de changer de piste
            if (isChangingTrackRef.current) {
                console.log("Sync skipped: Track change in progress");
                return;
            }

            try {
                const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:4000'}/player/status`);
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

        // Démarrer la configuration
        setupAudio();

        return () => {
            isMounted = false;
        };
    }, [isAudioReady, currentTrack]);

    return (
        <>
            {waitingForInteraction && (
                <div className={styles.interactionOverlay} onClick={() => {
                    const audioElement = document.querySelector("audio");
                    if (audioElement) audioElement.play();
                    setWaitingForInteraction(false);
                }}>
                    <div className={styles.interactionMessage}>
                        Click anywhere to start the radio 🎵
                    </div>
                </div>
            )}
            <div className={`${styles.audioPlayer} ${isEmbed ? styles.embedPlayer : ''}`}>
                {isAudioReady && playList.length > 0 ? (
                    <AudioPlayer
                        audioRef={audioElementRef}
                        playList={playList}
                        audioInitialState={{
                            muted: false,
                            isPlaying: isPlaying,
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
                            progress: isEmbed ? false : (screenSize === "small" ? false : "waveform"),
                            playList: false,
                            repeatType: false,
                            prevNnext: false,
                            trackInfo: isEmbed ? false : screenSize === "big",
                            artwork: isEmbed ? false : !(screenSize === "small"),
                            volume: isEmbed ? false : screenSize !== "small",
                            volumeSlider: isEmbed ? false : screenSize !== "small",
                            trackTime: isEmbed ? false : screenSize !== "small",
                        }}
                        rootContainerProps={{
                            width: isEmbed ? "auto" : ((screenSize === "small") ? "100%" : "52.2%"),
                            minWidth: isEmbed ? "auto" : ((screenSize === "small") ? "auto" : "300px"),
                            maxWidth: "2000px",
                            UNSAFE_className: isEmbed ? undefined : ((screenSize === "small") ? styles.mobileRoot : undefined)
                        }}
                    />
                ) : (
                    <div className={styles.audioPlayerLoading}>
                        {audioError || "Chargement du lecteur..."}
                    </div>
                )}
            </div>
        </>
    );
}

export default Player;
