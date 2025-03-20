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

    // Garder la dernière valeur de elapsed en ref pour le listener
    const elapsedRef = useRef(elapsed);
    const audioTestRef = useRef<HTMLAudioElement | null>(null);
    const lastTrackIdRef = useRef<string | null>(null);
    const audioElementRef = useRef<HTMLAudioElement | null>(null);

    useEffect(() => {
        elapsedRef.current = elapsed;
    }, [elapsed]);

    // Fonction pour vérifier si une URL est valide
    const isValidUrl = (url: any): boolean => {
        if (!url || typeof url !== 'string' || !url.trim()) {
            return false;
        }

        try {
            new URL(url);
            return true;
        } catch (e) {
            return false;
        }
    };

    // Nettoyer l'audio test si composant démonté
    useEffect(() => {
        return () => {
            if (audioTestRef.current) {
                audioTestRef.current.src = '';
                audioTestRef.current = null;
            }
        };
    }, []);

    // Mettre à jour la playlist quand currentTrack change
    useEffect(() => {
        console.log("currentTrack reçu:", currentTrack);

        // Si c'est le même morceau, ne pas réinitialiser le lecteur
        if (currentTrack && lastTrackIdRef.current === currentTrack.id) {
            console.log("Même morceau reçu, pas de réinitialisation");
            return;
        }

        setIsAudioReady(false);
        setAudioError(null);

        // Nettoyer l'ancien audio test si existe
        if (audioTestRef.current) {
            audioTestRef.current.src = '';
            audioTestRef.current = null;
        }

        if (!currentTrack) {
            setAudioError("Aucune piste à lire");
            return;
        }

        if (!currentTrack.audio) {
            console.error("URL audio manquante dans currentTrack:", currentTrack);
            setAudioError("URL audio manquante");
            return;
        }

        if (!isValidUrl(currentTrack.audio)) {
            console.error("URL audio invalide:", currentTrack.audio);
            setAudioError("URL audio invalide");
            return;
        }

        console.log("Audio URL valide:", currentTrack.audio);

        // Mémoriser l'ID du morceau actuel
        lastTrackIdRef.current = currentTrack.id;

        // Précharger l'audio pour vérifier qu'il est accessible
        const audioTest = new Audio();
        audioTestRef.current = audioTest;

        const handleCanPlay = () => {
            console.log("L'audio peut être lu");

            const formattedTrack = {
                id: currentTrack.id || Date.now().toString(),
                name: currentTrack.name || "Sans titre",
                src: currentTrack.audio,
                img: currentTrack.songImage || ""
            };

            console.log("formattedTrack créé:", formattedTrack);

            // Conserver l'état de lecture actuel
            const wasPlaying = isPlaying;

            setPlayList([formattedTrack]);
            setElapsed(currentTrack.elapsed || 0);
            setIsAudioReady(true);
            setAudioError(null);

            // Relancer la lecture automatiquement si nécessaire
            if (wasPlaying) {
                setTimeout(() => {
                    const newAudioEl = document.querySelector("audio");
                    if (newAudioEl && !newAudioEl.paused) {
                        console.log("Relance automatique de la lecture");
                        newAudioEl.play().catch(err => {
                            console.error("Erreur lors de la relance automatique:", err);
                        });
                    }
                }, 300);
            }
        };

        const handleError = (e: any) => {
            console.error("Erreur lors du chargement de l'audio:", e);
            setIsAudioReady(false);
            setAudioError("Impossible de charger l'audio");

            if (audioTestRef.current) {
                audioTestRef.current.src = '';
                audioTestRef.current = null;
            }
        };

        audioTest.addEventListener('canplaythrough', handleCanPlay);
        audioTest.addEventListener('error', handleError);

        // Définir la source après avoir ajouté les listeners
        audioTest.src = currentTrack.audio;

        return () => {
            if (audioTest) {
                audioTest.removeEventListener('canplaythrough', handleCanPlay);
                audioTest.removeEventListener('error', handleError);
                audioTest.src = '';
            }
        };
    }, [currentTrack, isPlaying]);

    // Observer l'élément audio pour détecter les play/pause
    useEffect(() => {
        if (!isAudioReady) return;

        const checkAudioElement = () => {
            const audioEl = document.querySelector("audio");
            if (audioEl && audioEl !== audioElementRef.current) {
                audioElementRef.current = audioEl;

                // Ajouter les listeners pour détecter play/pause
                const handlePlay = () => {
                    console.log("Audio play détecté");
                    setIsPlaying(true);

                    // Synchroniser avec le serveur
                    syncWithServer();
                };

                const handlePause = () => {
                    console.log("Audio pause détecté");
                    setIsPlaying(false);
                };

                audioEl.addEventListener('play', handlePlay);
                audioEl.addEventListener('pause', handlePause);

                // Nettoyer les listeners précédents
                return () => {
                    if (audioEl) {
                        audioEl.removeEventListener('play', handlePlay);
                        audioEl.removeEventListener('pause', handlePause);
                    }
                };
            }
            return undefined;
        };

        // Vérifier immédiatement
        const cleanup = checkAudioElement();

        // Puis vérifier régulièrement si l'élément a changé
        const timer = setInterval(checkAudioElement, 1000);

        return () => {
            cleanup && cleanup();
            clearInterval(timer);
        };
    }, [isAudioReady]);

    // Synchroniser périodiquement si en lecture
    useEffect(() => {
        if (!isPlaying || !isAudioReady) return;

        // Synchroniser toutes les 30 secondes sans interrompre la lecture
        const syncTimer = setInterval(() => {
            syncWithServer(false);
        }, 30000);

        return () => clearInterval(syncTimer);
    }, [isPlaying, isAudioReady]);

    // Fonction de synchronisation avec le serveur
    const syncWithServer = async (forceSync = true) => {
        try {
            const res = await fetch("http://localhost:3000/player/status");
            const data = await res.json();
            setElapsed(data.elapsed);

            if (forceSync && audioElementRef.current) {
                // Ajuster l'heure sans interrompre la lecture
                const currentlyPlaying = !audioElementRef.current.paused;
                audioElementRef.current.currentTime = data.elapsed;

                // Assurer que la lecture continue si nécessaire
                if (currentlyPlaying && audioElementRef.current.paused) {
                    audioElementRef.current.play().catch(err => {
                        console.error("Erreur lors de la reprise de lecture:", err);
                    });
                }
            }
        } catch (error) {
            console.error("Erreur en récupérant le statut :", error);
        }
    };

    // Log la playlist quand elle change
    useEffect(() => {
        console.log("Playlist mise à jour:", playList);
    }, [playList]);

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
