import React, { useEffect, useState } from "react";
import AudioPlayer from "./AudioPlayer";
import LightSunoCard from "./LightSunoCard";
import styles from "./styles/App.module.css";
import SunoProjectCard from "./SunoProjectCard";
import { getSunoSong, submitSunoLink } from "./services/sunoServices";
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import LogoutIcon from '@mui/icons-material/Logout';
import Icon from '@mui/material/Icon';
import AuthModal from "./AuthModal";
import { useAppDispatch, useAppSelector } from './store/hooks';
import { selectCurrentUser, selectCurrentAvatar, logout } from './store/authStore';
import { SnackbarProvider, useSnackbar } from 'notistack';
import Avatar from '@mui/material/Avatar';

function AppContent() {
  const [currentTrack, setCurrentTrack] = useState<SunoSong | null>(null);
  const [previousTrack, setPreviousTrack] = useState<SunoSong | null>(null);
  const [nextTrack, setNextTrack] = useState<SunoSong | null>(null);
  const [sunoLink, setSunoLink] = useState<string>("");
  const [loginModalOpen, setLoginModalOpen] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const { enqueueSnackbar: snackBar } = useSnackbar();

  const dispatch = useAppDispatch();
  const username = useAppSelector(selectCurrentUser);
  const userAvatar = useAppSelector(selectCurrentAvatar);

  // Connexion SSE pour les mises à jour du player
  useEffect(() => {
    const eventSource = new EventSource("http://localhost:3000/player/connection");
    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data);

      // Conversion des données du player en format SunoSong
      const trackData: SunoSong = {
        id: data.id,
        name: data.name,
        author: data.writer,
        songImage: data.img,
        duration: data.duration.toString(),
        audio: data.src,
        prompt: data.prompt || "",
        negative: data.negative || "",
        avatarImage: data.avatarImage || "",
        playCount: data.playCount || 0,
        upVoteCount: data.upVoteCount || 0,
        modelVersion: data.modelVersion || "",
        lyrics: data.lyrics || ""
      };

      setCurrentTrack(trackData);

      // Gérer la piste précédente
      if (data.previousTrack) {
        const previousTrackData: SunoSong = {
          id: data.previousTrack.id,
          name: data.previousTrack.name,
          author: data.previousTrack.writer,
          songImage: data.previousTrack.img,
          duration: data.previousTrack.duration.toString(),
          audio: data.previousTrack.src,
          prompt: data.previousTrack.prompt || "",
          negative: data.previousTrack.negative || "",
          avatarImage: data.previousTrack.avatarImage || "",
          playCount: data.previousTrack.playCount || 0,
          upVoteCount: data.previousTrack.upVoteCount || 0,
          modelVersion: data.previousTrack.modelVersion || "",
          lyrics: data.previousTrack.lyrics || ""
        };
        setPreviousTrack(previousTrackData);
      } else if (data.isTrackChange && currentTrack) {
        setPreviousTrack(currentTrack);
      }
    };

    return () => eventSource.close();
  }, [currentTrack]);

  // Récupérer la prochaine piste
  useEffect(() => {
    const fetchNextTrack = async () => {
      try {
        const response = await fetch("http://localhost:3000/player/next-track-info");
        const data = await response.json();
        if (data.track) {
          const nextTrackData: SunoSong = {
            id: data.track.id,
            name: data.track.name,
            author: data.track.writer,
            songImage: data.track.img,
            duration: data.track.duration.toString(),
            audio: data.track.src,
            prompt: data.track.prompt || "",
            negative: data.track.negative || "",
            avatarImage: data.track.avatarImage || "",
            playCount: data.track.playCount || 0,
            upVoteCount: data.track.upVoteCount || 0,
            modelVersion: data.track.modelVersion || "",
            lyrics: data.track.lyrics || ""
          };
          setNextTrack(nextTrackData);
        }
      } catch (error) {
        console.error("Erreur lors de la récupération de la prochaine piste:", error);
      }
    };

    fetchNextTrack();
  }, [currentTrack]);

  const validateSunoLink = (link: string): boolean => {
    return !!(link.match(/suno\.ai\/song\/([a-f0-9-]+)/i) || link.match(/suno\.com\/song\/([a-f0-9-]+)/i));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newLink = e.target.value;
    setSunoLink(newLink);

    if (newLink && !validateSunoLink(newLink)) {
      snackBar('Le format du lien Suno est invalide. Exemple: https://suno.ai/song/123... ou https://suno.com/song/123...', {
        variant: 'error',
        preventDuplicate: true
      });
    }
  };

  const handleSubmitSong = async () => {
    if (!username) {
      snackBar('Veuillez vous connecter pour soumettre une musique', { variant: 'warning' });
      openLoginModal();
      return;
    }

    if (!sunoLink) {
      snackBar('Veuillez entrer un lien Suno', { variant: 'warning' });
      return;
    }

    if (!validateSunoLink(sunoLink)) {
      snackBar('Le format du lien Suno est invalide. Exemple: https://suno.ai/song/123... ou https://suno.com/song/123...', { variant: 'error' });
      return;
    }

    if (isSubmitting) return;

    setIsSubmitting(true);
    try {
      await submitSunoLink(sunoLink);
      setSunoLink("");
      snackBar('Musique ajoutée avec succès !', { variant: 'success' });
    } catch (error: any) {
      snackBar(
        error.response?.data?.message || 'Erreur lors de l\'ajout de la musique',
        { variant: 'error' }
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const openLoginModal = () => {
    setLoginModalOpen(true);
  };

  const closeLoginModal = () => {
    setLoginModalOpen(false);
  };

  const handleLogout = () => {
    dispatch(logout());
    snackBar('Déconnexion réussie', { variant: 'info' });
  };

  return (
    <div className={styles.wrapper}>
      <header className={styles.header}>
        <div className={styles.title}>PULSIFY Radio</div>
        <button className={styles.button}>Hits</button>
        <button className={styles.button}>New</button>
        <div className={styles.audioPlayer}>
          <AudioPlayer />
          <div className={styles.clickBlocker}></div>
        </div>
        <div className={styles.topRightButtonsContainer}>
          <div className={styles.userContainer}>
            {username ? (
              <>
                <span className={styles.username}>{username}</span>
                <Avatar
                  src={userAvatar || undefined}
                  alt={username}
                  sx={{
                    width: 40,
                    height: 40,
                    marginLeft: 1,
                    marginRight: 1,
                    border: '2px solid #251db9'
                  }}
                />
                <Icon
                  sx={{
                    width: 35,
                    height: 30,
                    cursor: "pointer",
                    backgroundColor: '#251db9',
                    borderRadius: '20%',
                    padding: '5px',
                    color: 'white',
                    '&:hover': {
                      backgroundColor: '#1f1ba0'
                    }
                  }}
                  component={LogoutIcon}
                  onClick={handleLogout}
                />
              </>
            ) : (
              <Icon
                sx={{
                  width: 40,
                  height: 40,
                  cursor: "pointer",
                  backgroundColor: 'transparent',
                  borderRadius: '50%',
                  padding: '5px',
                  color: 'white',
                  '&:hover': {
                    backgroundColor: 'rgba(255,255,255,0.1)'
                  }
                }}
                component={AccountCircleIcon}
                onClick={openLoginModal}
              />
            )}
          </div>
          <button className={styles.topRightButtons}>?</button>
        </div>
      </header>

      <div className={styles.content}>
        {currentTrack ? (
          <div className={styles.projectCardContainer}>
            <button className={styles.directButton}>Live</button>
            <SunoProjectCard {...currentTrack} />
          </div>
        ) : (
          <div className={styles.cardContainer}>
            Awaiting Radio...
          </div>
        )}
      </div>
      <div className={styles.previousAndNextSongsContainer}>
        {previousTrack && <LightSunoCard {...previousTrack} />}
        <button className={styles.previousSongText}>← Prev Song</button>
        <button className={styles.nextSongText}>Next Song →</button>
        {nextTrack && <LightSunoCard {...nextTrack} />}
      </div>

      <footer className={styles.footer}>
        <div className={styles.inputSunoLinkContainer}>
          <p style={{ fontWeight: 500 }}>Submit :</p>
          <input
            placeholder="Paste your Suno song link here..."
            className={styles.inputSunoLink}
            onChange={handleInputChange}
            value={sunoLink}
          />
          <button
            className={styles.plusButton}
            onClick={handleSubmitSong}
            disabled={isSubmitting}
          > + </button>
        </div>
        <div className={styles.explanatorytext}>Explanatory text</div>
      </footer>

      <AuthModal open={loginModalOpen} onClose={closeLoginModal} />
    </div>
  );
}

export default AppContent;
