import React, { useEffect, useState } from "react";
import AudioPlayer from "./AudioPlayer";
import LightSunoCard from "./LightSunoCard";
import styles from "./styles/App.module.css";
import SunoProjectCard from "./SunoProjectCard";
import { getSunoSong } from "./services/sunoServices";

function App() {
  const [sunoProject, setSunoProject] = useState<null | SunoSong>(null);
  const [sunoLink, setSunoLink] = useState<string>("");

  const fetchFromSuno = async (): Promise<void> => {
    const response = await getSunoSong(sunoLink);
    response && setSunoProject(response);
  };

  useEffect(() => {
    if (sunoLink) {
      fetchFromSuno();
    }
  }, [sunoLink]);

  return (
    <div className={styles.wrapper}>
      <header className={styles.header}>
        <div className={styles.title}>PULSIFY Radio</div>
        <button className={styles.button}>Hits</button>
        <button className={styles.button}>New</button>
        <div className={styles.audioPlayer}>
          {/* Le composant AudioPlayer gère lui-même la synchronisation */}
          <AudioPlayer />
        </div>
        <div className={styles.topRightButtonsContainer}>
          <button className={styles.topRightButtons}>Losange</button>
          <button className={styles.topRightButtons}>?</button>
        </div>
      </header>

      <div className={styles.content}>
        {sunoProject ? (
          <div className={styles.projectCardContainer}>
            <button className={styles.directButton}>Live</button>
            <SunoProjectCard {...sunoProject} />
          </div>
        ) : (
          <div className={styles.cardContainer}>
            Renseignez le lien Suno pour faire apparaître votre projet
          </div>
        )}
      </div>
      <div className={styles.previousAndNextSongsContainer}>
        {sunoProject ? <LightSunoCard {...sunoProject} /> : ""}
        <button className={styles.previousSongText}>← Prev Song</button>
        <button className={styles.nextSongText}>Next Song →</button>
        {sunoProject ? <LightSunoCard {...sunoProject} /> : ""}
      </div>

      <footer className={styles.footer}>
        <div className={styles.inputSunoLinkContainer}>
          <p style={{ fontWeight: 500 }}>Submit :</p>
          <input
            placeholder="Collez les liens de vos morceaux Suno..."
            className={styles.inputSunoLink}
            onChange={(e) => {
              setSunoLink(e.target.value);
            }}
            value={sunoLink}
          />
          <button className={styles.plusButton}> + </button>
        </div>
        <div className={styles.explanatorytext}>explanatory text</div>
      </footer>
    </div>
  );
}

export default App;
