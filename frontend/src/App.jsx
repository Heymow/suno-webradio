import React, { useEffect, useState } from "react";
import AudioPlayer from "react-modern-audio-player";
import SunoProjectCard from "./SunoProjectCard";
import styles from "./styles/App.module.css";
import LightSongCard from "./LightSongCard";

function App() {

  const [sunoProject, setSunoProject] = useState(null);
  const [sunoLink, setSunoLink] = useState('');

  const playList = [
    {
      name: sunoProject ? sunoProject.name : "",
      writer: sunoProject ? sunoProject.author : "",
      img: sunoProject ? sunoProject.songImage : "https://cdn1.suno.ai/4e0af342-326c-42b6-9433-86a8e48a55f4.jpg",
      src: sunoProject ? sunoProject.audio : "https://cdn1.suno.ai/4e0af342-326c-42b6-9433-86a8e48a55f4.mp3",
      id: 1,
    },
  ];
  console.log(sunoProject)

  let audioContext;

  const fetchFromSuno = async () => {
    const formattedLink = sunoLink.split('https://suno.com/song/')[1];

    const fetchSuno = await fetch(`http://localhost:3000/projects/get-suno-clip/${formattedLink}`)
    const response = await fetchSuno.json();
    setSunoProject(response.project)
  }


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
              repeatType: 0,
              prevNnext: 0,
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
        {sunoProject ? <div className={styles.projectCardContainer}> <button className={styles.directButton}>Live</button> <SunoProjectCard project={sunoProject} /></div> :
          <div className={styles.cardContainer}>Renseignez le lien Suno pour faire apparaître votre projet
          </div>}
        <div className={styles.previousNextContainer}></div>
        <div className={styles.previousAndNextSongsContainer}>
          {sunoProject ? <LightSongCard project={sunoProject} /> : ""}

          <button className={styles.previousSongText} >
            ← Prev Song
          </button>
          <button className={styles.nextSongText}>
            Next Song →
          </button>
          {sunoProject ? <LightSongCard project={sunoProject} /> : ""}
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
