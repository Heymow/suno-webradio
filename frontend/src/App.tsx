import React, { useEffect, useState } from "react";
import AudioPlayer from "react-modern-audio-player";
import LightSunoCard from "./LightSunoCard";
import styles from "./styles/App.module.css";
import SunoProjectCard from "./SunoProjectCard";
import { getSunoSong } from "./services/sunoServices";

function App() {

  const [sunoProject, setSunoProject] = useState<null | SunoSong>(null);
  const [sunoLink, setSunoLink] = useState<string>('');

  const playList: Playlist[] = [
    {
      name: sunoProject ? sunoProject.name : "",
      writer: sunoProject ? sunoProject.author : "",
      img: sunoProject ? sunoProject.songImage : "https://cdn1.suno.ai/4e0af342-326c-42b6-9433-86a8e48a55f4.jpg",
      src: sunoProject ? sunoProject.audio : "https://cdn1.suno.ai/4e0af342-326c-42b6-9433-86a8e48a55f4.mp3",
      id: 1,
    },
  ];

  const fetchFromSuno = async (): Promise<void> => {
    const response = await getSunoSong(sunoLink)
    response && setSunoProject(response)
  }

  console.log("variable d'état", sunoProject)

  useEffect(() => {
    if (sunoLink) {
      fetchFromSuno()

    }
  }, [sunoLink]);


  return (
    <div className={styles.wrapper}>
      <header className={styles.header}>
        <div className={styles.title}>PULSIFY Radio </div>
        <button className={styles.button}>Hits</button>
        <button className={styles.button}>New</button>
        <div className={styles.audioPlayer}>
          <AudioPlayer className={styles.audioPlayer}
            playList={playList}

            audioInitialState={{
              muted: false,
              volume: 0.5,
              curPlayId: 1,
            }}
            placement={{
              player: "top",
            }}
            activeUI={{
              all: true,
              progress: "waveform",
              artwork: true,
              repeatType: false,
              prevNnext: false,
              playList: false
            }}
            rootContainerProps={{ width: "40%" }}
          />
        </div>
        <div className={styles.topRightButtonsContainer}>
          <button className={styles.topRightButtons}>Losange</button>
          <button className={styles.topRightButtons}>?</button>
        </div>
      </header>

      <div className={styles.content}>
        {sunoProject ? <div className={styles.projectCardContainer}>
          <button className={styles.directButton}>Live</button>
          <SunoProjectCard {...sunoProject} /></div> :
          <div className={styles.cardContainer}>Renseignez le lien Suno pour faire apparaître votre projet
          </div>}
        <div className={styles.previousNextContainer}></div>
        <div className={styles.previousAndNextSongsContainer}>
          {sunoProject ? <LightSunoCard {...sunoProject} /> : ""}

          <button className={styles.previousSongText} >
            ← Prev Song
          </button>
          <button className={styles.nextSongText}>
            Next Song →
          </button>
          {sunoProject ? <LightSunoCard {...sunoProject} /> : ""}
        </div>
      </div>


      <footer className={styles.footer}>
        <div className={styles.inputSunoLinkContainer}>
          <p style={{ fontWeight: 500 }}>Submit : </p> <input placeholder="Collez les liens de vos morceaux Suno..." className={styles.inputSunoLink} onChange={(e) => { setSunoLink(e.target.value) }} value={sunoLink} />
          <button className={styles.plusButton}> + </button>
        </div>
        <div className={styles.explanatorytext}>explanatory text</div>
      </footer>
    </div >
  );
}

export default App;
