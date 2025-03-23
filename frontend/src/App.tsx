import React, { useEffect, useState, useRef } from "react";
import AudioPlayer from "./AudioPlayer";
import LightSunoCard from "./LightSunoCard";
import styles from "./styles/App.module.css";
import SunoProjectCard from "./SunoProjectCard";
import { submitSunoLink } from "./services/suno.services";
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import Icon from '@mui/material/Icon';
import AuthModal from "./AuthModal";
import Profile from "./components/profile";
import { useAppDispatch, useAppSelector } from './store/hooks';
import { selectCurrentUser, selectCurrentAvatar, selectCurrentUserId, setAccountActivated, validateAndRefreshUserData, selectIsAuthenticated } from './store/authStore';
import { useSnackbar } from 'notistack';
import Avatar from '@mui/material/Avatar';
import Axios from './utils/Axios';
import { Dropdown } from '@mui/base/Dropdown';
import { Menu } from '@mui/base/Menu';
import { MenuButton as BaseMenuButton } from '@mui/base/MenuButton';
import { MenuItem as BaseMenuItem, menuItemClasses } from '@mui/base/MenuItem';
import { style, styled, width } from '@mui/system';
import { Button as BaseButton, buttonClasses } from '@mui/base/Button';
import Stack from '@mui/material/Stack';
import zIndex from "@mui/material/styles/zIndex";
import { Link } from "@mui/material";
import { Image } from "@mui/icons-material";

// Constants
const ERROR_MESSAGES = {
  INVALID_LINK: 'Le format du lien Suno est invalide. Exemple: https://suno.ai/song/123... ou https://suno.com/song/123...',
  LOGIN_REQUIRED: 'Veuillez vous connecter pour soumettre une musique',
  EMPTY_LINK: 'Veuillez entrer un lien Suno',
  SESSION_EXPIRED: 'Session expirée, reconnexion...'
};

const SUNO_LINK_REGEX = /suno\.(ai|com)\/song\/([a-f0-9-]+)/i;
const SSE_URL = "http://localhost:3000/player/connection";
const MAX_RECONNECT_ATTEMPTS = 5;
const RECONNECT_DELAY = 3000;

// Utility functions
const isValidAudioUrl = (url: any): boolean => {
  if (!url || typeof url !== 'string' || !url.trim()) {
    return false;
  }

  // Vérifier si l'URL a un format valide (commence par http/https)
  try {
    const urlObj = new URL(url);
    return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
  } catch (e) {
    console.error("URL audio invalide:", url, e);
    return false;
  }
};

const convertToSunoSong = (data: any): SunoSong => {
  // Vérifier que data.src existe et est une chaîne valide
  if (!isValidAudioUrl(data.src)) {
    console.error("URL audio (src) manquante ou invalide dans les données reçues:", data);
  }

  const song = {
    id: data.id,
    name: data.name,
    author: data.writer,
    songImage: data.img,
    duration: data.duration ? data.duration.toString() : "0",
    audio: data.src || "",  // Assigner une chaîne vide si src est undefined
    prompt: data.prompt || "",
    negative: data.negative || "",
    avatarImage: data.avatarImage || "",
    playCount: data.playCount || 0,
    upVoteCount: data.upVoteCount || 0,
    modelVersion: data.modelVersion || "",
    lyrics: data.lyrics || ""
  };

  return song;
};

function AppContent() {
  const [currentTrack, setCurrentTrack] = useState<SunoSong | null>(null);
  const [previousTrack, setPreviousTrack] = useState<SunoSong | null>(null);
  const [nextTrack, setNextTrack] = useState<SunoSong | null>(null);
  const [sunoLink, setSunoLink] = useState<string>("");
  const [loginModalOpen, setLoginModalOpen] = useState<boolean>(false);
  const [profileOpen, setProfileOpen] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [clickedPlusButton, setClickedPlusButton] = useState<boolean>(false);
  const { enqueueSnackbar: snackBar } = useSnackbar();

  const dispatch = useAppDispatch();
  const username = useAppSelector(selectCurrentUser);
  const userAvatar = useAppSelector(selectCurrentAvatar);
  const userId = useAppSelector(selectCurrentUserId);
  const isAuthenticated = useAppSelector(selectIsAuthenticated);

  // Refs pour éviter les dépendances cycliques
  const currentTrackRef = useRef(currentTrack);
  const snackBarRef = useRef(snackBar);

  // Vérifier la cohérence des données d'authentification au chargement
  useEffect(() => {
    // Vérifier et réparer les incohérences dans le store (par exemple, authentifié mais sans userId)
    dispatch(validateAndRefreshUserData());
  }, [dispatch]);

  useEffect(() => {
    currentTrackRef.current = currentTrack;
    snackBarRef.current = snackBar;
  }, [currentTrack, snackBar]);

  // Vérifier l'état d'activation du compte
  useEffect(() => {
    const checkActivationStatus = async () => {
      if (userId && isAuthenticated) {
        try {
          const response = await Axios.get(`/users/activation-status/${userId}`);
          const isActivated = response.data.isActivated;
          dispatch(setAccountActivated(isActivated));
        } catch (error) {
          console.error("Erreur lors de la vérification du statut d'activation:", error);
        }
      }
    };

    if (userId) {
      checkActivationStatus();
    }
  }, [userId, isAuthenticated, dispatch]);

  // SSE Connection
  useEffect(() => {
    let eventSource: EventSource | null = null;
    let reconnectTimeout: ReturnType<typeof setTimeout> | null = null;
    let isConnecting = false;
    let isMounted = true;
    let localReconnectAttempts = 0;

    const handleTrackUpdate = (data: any) => {
      if (!data || !isMounted) return;
      const sunoSong = convertToSunoSong(data);
      if (currentTrack?.audio != sunoSong.audio) {
        setCurrentTrack(sunoSong);
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
        console.error("Erreur lors de la récupération de la prochaine piste:", error);
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
            console.error('Erreur lors du parsing des données SSE:', error);
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
            snackBarRef.current('Impossible de se connecter au serveur', { variant: 'error' });
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

  const validateSunoLink = (link: string): boolean => {
    return !!link.match(SUNO_LINK_REGEX);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newLink = e.target.value;
    setSunoLink(newLink);

    if (newLink && !validateSunoLink(newLink)) {
      snackBarRef.current(ERROR_MESSAGES.INVALID_LINK, {
        variant: 'error',
        preventDuplicate: true
      });
    }
  };

  const handleSubmitSong = async () => {
    // Vérifier à nouveau si l'utilisateur est authentifié et a un ID
    if (!username || !userId) {
      snackBarRef.current(ERROR_MESSAGES.LOGIN_REQUIRED, { variant: 'warning' });
      setLoginModalOpen(true);
      return;
    }

    if (!sunoLink) {
      snackBarRef.current(ERROR_MESSAGES.EMPTY_LINK, { variant: 'warning' });
      return;
    }

    if (!validateSunoLink(sunoLink)) {
      snackBarRef.current(ERROR_MESSAGES.INVALID_LINK, { variant: 'error' });
      return;
    }

    if (isSubmitting) return;

    setIsSubmitting(true);
    try {
      await submitSunoLink(sunoLink);
      setSunoLink("");
      snackBarRef.current('Musique ajoutée avec succès !', { variant: 'success' });
    } catch (error: any) {
      snackBarRef.current(
        error.response?.data?.message || 'Erreur lors de l\'ajout de la musique',
        { variant: 'error' }
      );
    } finally {
      setIsSubmitting(false);
    }
  };


  const handleProfileOpen = () => {
    // Vérifier que l'ID existe toujours avant d'ouvrir le profil
    if (isAuthenticated && !userId) {
      // Si l'ID a disparu, forcer une validation
      dispatch(validateAndRefreshUserData());
      snackBarRef.current('Une erreur avec votre session a été détectée. Veuillez vous reconnecter.', {
        variant: 'warning'
      });
      setLoginModalOpen(true);
      return;
    }
    setProfileOpen(true);
  };

  const handleProfileClose = () => {
    setProfileOpen(false);
  };

  let sunoLinkContainer = clickedPlusButton ? (
    <div className={styles.inputSunoLinkContainer}>
      <p style={{ fontWeight: 400, fontSize: "15px" }}>Submit :</p>
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
    </div>) : <button
      className={styles.openPlusButton}
      onClick={() => setClickedPlusButton(true)}
    > + </button>;

  return (
    <div className={styles.wrapper}>
      <header className={styles.header}>
        <div className={styles.title}>PULSIFY</div>
        <Stack spacing={1} direction="row">
          <Button className={styles.button}>Hits</Button>
          <Button className={styles.button}>New</Button>
        </Stack>
        <p className={styles.dropdown}>
          <Dropdown>
            <MenuButton>Radio</MenuButton>
            <Menu slots={{ listbox: Listbox }}>
              <MenuItem>Hits</MenuItem>
              <MenuItem>New</MenuItem>
            </Menu>
          </Dropdown>
        </p>
        <div className={styles.audioPlayer}>
          <AudioPlayer currentTrack={currentTrack} />
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
                    border: '2px solid #251db9',
                    cursor: 'pointer'
                  }}
                  onClick={handleProfileOpen}
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

                  '&:hover': {
                    backgroundColor: 'rgba(255,255,255,0.1)'
                  }
                }}
                component={AccountCircleIcon}
                onClick={() => setLoginModalOpen(true)}
              />
            )}
          </div>
          <button className={`${styles.topRightButtons} ${styles.helpButton}`}>?</button>
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
        <div className={styles.footerLeftContainer}>
          <Link href="https://discord.gg/DnXUDCuFCD" target="_blank" rel="noopener noreferrer" className={styles.discordContainer}>
            <div>
              <img src='/public/discord.png' alt='Discord icon' className={styles.discordImage} />
            </div>
            <div className={styles.discordLink}>Join Discord</div>
          </Link>
        </div>
        <div className={styles.sunoLinkContainer}>{sunoLinkContainer}
          <div className={styles.explanatorytext}>{!clickedPlusButton ? "Submit your song" : "Insert your song link"}</div></div>
        <div className={styles.footerRightContainer} />
      </footer>

      <AuthModal
        open={loginModalOpen}
        onClose={() => setLoginModalOpen(false)}
      />

      <Profile
        open={profileOpen}
        onClose={handleProfileClose}
      />
    </div>
  );
}

export default AppContent;

const blue = {
  50: '#F0F7FF',
  100: '#C2E0FF',
  200: '#99CCF3',
  300: '#66B2FF',
  400: '#3399FF',
  500: '#007FFF',
  600: '#0072E6',
  700: '#0059B3',
  800: '#004C99',
  900: '#003A75',
};

const grey = {
  50: '#F3F6F9',
  100: '#E5EAF2',
  200: '#DAE2ED',
  300: '#C7D0DD',
  400: '#B0B8C4',
  500: '#9DA8B7',
  600: '#6B7A90',
  700: '#434D5B',
  800: '#303740',
  900: '#1C2025',
};

const Listbox = styled('ul')(
  ({ theme }) => `
  font-family: 'IBM Plex Sans', sans-serif;
  font-size: 0.875rem;
  box-sizing: border-box;
  padding: 6px;
  margin: 12px 0;
  min-width: 200px;
  border-radius: 12px;
  overflow: auto;
  outline: 0;
  background: ${theme.palette.mode === 'dark' ? grey[900] : '#fff'};
  border: 1px solid ${theme.palette.mode === 'dark' ? grey[700] : grey[200]};
  color: ${theme.palette.mode === 'dark' ? grey[300] : grey[900]};
  box-shadow: 0 4px 6px ${theme.palette.mode === 'dark' ? 'rgba(0,0,0, 0.50)' : 'rgba(0,0,0, 0.05)'
    };
  `,
);

const MenuItem = styled(BaseMenuItem)(
  ({ theme }) => `
  list-style: none;
  padding: 8px;
  border-radius: 8px;
  cursor: default;
  user-select: none;

  &:last-of-type {
    border-bottom: none;
  }

  &:focus {
    outline: 3px solid ${theme.palette.mode === 'dark' ? blue[600] : blue[200]};
    background-color: ${theme.palette.mode === 'dark' ? grey[800] : grey[100]};
    color: ${theme.palette.mode === 'dark' ? grey[300] : grey[900]};
  }

  &.${menuItemClasses.disabled} {
    color: ${theme.palette.mode === 'dark' ? grey[700] : grey[400]};
  }
  `,
);

const MenuButton = styled(BaseMenuButton)(
  ({ theme }) => `
  font-family: 'IBM Plex Sans', sans-serif;
  font-weight: 600;
  font-size: 0.875rem;
  line-height: 1.5;
  padding: 8px 16px;
  border-radius: 8px;
  transition: all 150ms ease;
  cursor: pointer;
  background: ${theme.palette.mode === 'dark' ? grey[900] : '#fff'};
  border: 1px solid ${theme.palette.mode === 'dark' ? grey[700] : grey[200]};
  color: ${theme.palette.mode === 'dark' ? grey[200] : grey[900]};
  box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05);

  &:hover {
    background: ${theme.palette.mode === 'dark' ? grey[800] : grey[50]};
    border-color: ${theme.palette.mode === 'dark' ? grey[600] : grey[300]};
  }

  &:active {
    background: ${theme.palette.mode === 'dark' ? grey[700] : grey[100]};
  }

  &:focus-visible {
    box-shadow: 0 0 0 4px ${theme.palette.mode === 'dark' ? blue[300] : blue[200]};
    outline: none;
  }
  `,
);

const Button = styled(BaseButton)(
  ({ theme }) => `
  font-family: 'IBM Plex Sans', sans-serif;
  font-weight: 600;
  font-size: 0.875rem;
  line-height: 1.5;
  background-color: ${blue[500]};
  padding: 8px 16px;
  border-radius: 8px;
  color: white;
  transition: all 150ms ease;
  cursor: pointer;
  border: 1px solid ${blue[500]};
  box-shadow: 0 2px 1px ${theme.palette.mode === 'dark' ? 'rgba(0, 0, 0, 0.5)' : 'rgba(45, 45, 60, 0.2)'
    }, inset 0 1.5px 1px ${blue[400]}, inset 0 -2px 1px ${blue[600]};

  &:hover {
    background-color: ${blue[600]};
  }

  &.${buttonClasses.active} {
    background-color: ${blue[700]};
    box-shadow: none;
    transform: scale(0.99);
  }

  &.${buttonClasses.focusVisible} {
    box-shadow: 0 0 0 4px ${theme.palette.mode === 'dark' ? blue[300] : blue[200]};
    outline: none;
  }

  &.${buttonClasses.disabled} {
    background-color: ${theme.palette.mode === 'dark' ? grey[700] : grey[200]};
    color: ${theme.palette.mode === 'dark' ? grey[200] : grey[700]};
    border: 0;
    cursor: default;
    box-shadow: none;
    transform: scale(1);
  }
  `,
);