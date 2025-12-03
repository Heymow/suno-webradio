import { useState, useEffect, useRef } from 'react';
import Axios from '../utils/Axios';
import { useSnackbar } from 'notistack';

// Constants
const ERROR_MESSAGES = {
    SESSION_EXPIRED: 'Session expirée, reconnexion...'
};

const SSE_URL = `${import.meta.env.VITE_API_URL || 'http://localhost:4000'}/player/connection`;
const MAX_RECONNECT_ATTEMPTS = 5;
const RECONNECT_DELAY = 3000;

// Utility functions
const isValidAudioUrl = (url: any): boolean => {
    if (!url || typeof url !== 'string' || !url.trim()) {
        return false;
    }

    try {
        const urlObj = new URL(url);
        return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
    } catch (e) {
        console.error("URL audio invalide:", url, e);
        return false;
    }
};

const convertToSunoSong = (data: any): SunoSong => {
    if (!isValidAudioUrl(data.src)) {
        console.error("URL audio (src) manquante ou invalide dans les données reçues:", data);
    }

    const song = {
        _id: data.id,
        name: data.name,
        author: data.writer,
        songImage: data.img,
        duration: data.duration ? data.duration.toString() : "0",
        audio: data.src || "",
        prompt: data.prompt || "",
        negative: data.negative || "",
        avatarImage: data.avatarImage || "",
        playCount: data.playCount || 0,
        upVoteCount: data.upVoteCount || 0,
        radioVoteCount: data.radioVoteCount || 0,
        radioPlayCount: data.radioPlayCount || 0,
        playlistPlays: data.playlistPlays || { hits: 0, new: 0 },
        modelVersion: data.modelVersion || "",
        lyrics: data.lyrics || "",
        elapsed: data.elapsed,
        isTrackChange: data.isTrackChange || false,
    };

    return song;
};

export const useRadioStream = () => {
    const [currentTrack, setCurrentTrack] = useState<SunoSong | null>(null);
    const [previousTrack, setPreviousTrack] = useState<SunoSong | null>(null);
    const [nextTrack, setNextTrack] = useState<SunoSong | null>(null);
    const { enqueueSnackbar } = useSnackbar();

    const currentTrackRef = useRef(currentTrack);
    const snackBarRef = useRef(enqueueSnackbar);

    useEffect(() => {
        currentTrackRef.current = currentTrack;
        snackBarRef.current = enqueueSnackbar;
    }, [currentTrack, enqueueSnackbar]);

    useEffect(() => {
        let eventSource: EventSource | null = null;
        let reconnectTimeout: ReturnType<typeof setTimeout> | null = null;
        let isConnecting = false;
        let isMounted = true;
        let localReconnectAttempts = 0;

        const handleTrackUpdate = (data: any) => {
            if (!data || !isMounted) return;
            console.log('SSE Data received:', {
                isTrackChange: data.isTrackChange,
                isCountersUpdate: data.isCountersUpdate,
                elapsed: data.elapsed,
                id: data.id,
                currentTrackId: currentTrackRef.current?._id,
                radioVoteCount: data.radioVoteCount,
                radioPlayCount: data.radioPlayCount
            });

            const sunoSong = convertToSunoSong(data);

            if (data.isCountersUpdate && currentTrack?._id === sunoSong._id) {
                console.log('Counters update only - updating without affecting audio');
                setCurrentTrack(prev => prev ? {
                    ...prev,
                    radioVoteCount: sunoSong.radioVoteCount,
                    radioPlayCount: sunoSong.radioPlayCount,
                    playCount: sunoSong.playCount,
                    upVoteCount: sunoSong.upVoteCount,
                    isTrackChange: false
                } : null);
                return;
            }

            if (data.isTrackChange || currentTrack?.audio !== sunoSong.audio) {
                console.log('Setting new track:', data.isTrackChange ? 'Track change' : 'New audio URL');
                setCurrentTrack(sunoSong);
            } else if (currentTrack?._id === sunoSong._id) {
                const hasSignificantChanges =
                    currentTrack.radioVoteCount !== sunoSong.radioVoteCount ||
                    currentTrack.radioPlayCount !== sunoSong.radioPlayCount ||
                    currentTrack.playCount !== sunoSong.playCount ||
                    currentTrack.upVoteCount !== sunoSong.upVoteCount;

                if (hasSignificantChanges) {
                    console.log('Updating same track data with significant changes (counters)');
                    setCurrentTrack(prev => prev ? {
                        ...prev,
                        radioVoteCount: sunoSong.radioVoteCount,
                        radioPlayCount: sunoSong.radioPlayCount,
                        playCount: sunoSong.playCount,
                        upVoteCount: sunoSong.upVoteCount,
                        elapsed: data.elapsed,
                        isTrackChange: false
                    } : null);
                } else {
                    if (currentTrackRef.current && data.elapsed !== undefined) {
                        const lastElapsed = currentTrackRef.current.elapsed || 0;
                        const elapsedDiff = Math.abs(data.elapsed - lastElapsed);

                        if (elapsedDiff > 5 || lastElapsed === 0) {
                            currentTrackRef.current = {
                                ...currentTrackRef.current,
                                elapsed: data.elapsed
                            };
                            console.log('Silent elapsed update:', data.elapsed, `(diff: ${elapsedDiff}s)`);
                        }
                    }
                }
            }

            if (data.previousTrack) {
                setPreviousTrack(convertToSunoSong(data.previousTrack));
            } else if (data.isTrackChange && currentTrackRef.current) {
                setPreviousTrack(currentTrackRef.current);
            }

            if (data.nextTrack) {
                setNextTrack(convertToSunoSong(data.nextTrack));
            } else if (data.isTrackChange) {
                fetchNextTrack();
            }
        };

        const fetchNextTrack = async () => {
            try {
                const { data } = await Axios.get("/player/next-track-info");
                if (data.track && isMounted) {
                    setNextTrack(convertToSunoSong(data.track));
                }
            } catch (error: any) {
                console.error("Error fetching next track:", error);
                if (error.response?.status === 401) {
                    snackBarRef.current(ERROR_MESSAGES.SESSION_EXPIRED, { variant: 'warning' });
                }
            }
        };

        const connectSSE = async () => {
            if (isConnecting || !isMounted) return;
            isConnecting = true;

            if (eventSource) {
                eventSource.close();
            }

            try {
                eventSource = new EventSource(SSE_URL, { withCredentials: true });

                eventSource.onopen = () => {
                    if (!isMounted) return;
                    localReconnectAttempts = 0;
                    isConnecting = false;
                };

                eventSource.onmessage = (event) => {
                    if (!isMounted) return;
                    try {
                        const data = JSON.parse(event.data);
                        handleTrackUpdate(data);
                    } catch (error) {
                        console.error('Error parsing SSE data:', error);
                    }
                };

                eventSource.onerror = (error) => {
                    if (!isMounted) return;
                    console.error('SSE Connection error:', error);
                    if (eventSource) {
                        eventSource.close();
                    }

                    isConnecting = false;

                    if (localReconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
                        if (reconnectTimeout) {
                            clearTimeout(reconnectTimeout);
                        }
                        reconnectTimeout = setTimeout(() => {
                            if (!isMounted) return;
                            localReconnectAttempts++;
                            connectSSE();
                        }, RECONNECT_DELAY * Math.pow(2, localReconnectAttempts));
                    } else {
                        snackBarRef.current('Unable to connect to server', { variant: 'error' });
                    }
                };
            } catch (error) {
                console.error('Error creating EventSource:', error);
                isConnecting = false;
            }
        };

        connectSSE();

        return () => {
            isMounted = false;
            if (eventSource) {
                eventSource.close();
            }
            if (reconnectTimeout) {
                clearTimeout(reconnectTimeout);
            }
        };
    }, []);

    return { currentTrack, previousTrack, nextTrack };
};
