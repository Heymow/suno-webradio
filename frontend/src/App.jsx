import React, { useEffect, useState } from "react";
import AudioPlayer from "react-modern-audio-player";
import SunoProjectCard from "./SunoProjectCard";
import styles from "./styles/App.module.css";

function App() {

  const [sunoProject, setSunoProject] = useState(null);
  const [sunoLink, setSunoLink] = useState('');

  const playList = [
    {
      name: sunoProject ? sunoProject.name : "",
      writer: sunoProject ? sunoProject.author : "",
      img: sunoProject ? sunoProject.songImage : "",
      src: sunoProject ? sunoProject.audio : "https://cdn1.suno.ai/4e0af342-326c-42b6-9433-86a8e48a55f4.mp3",
      id: 1,
    },
  ];
  console.log(sunoProject)
  const fetchFromSuno = async () => {
    const formattedLink = sunoLink.split('https://suno.com/song/')[1];

    const fetchSuno = await fetch(`http://localhost:3000/projects/get-suno-clip/${formattedLink}`)
    const response = await fetchSuno.json();
    setSunoProject(response.project)
  }

  useEffect(() => {
    if (AudioContext) {
      const audioContext = new AudioContext();
      if (audioContext.state === "suspended") {
        audioContext.resume()
      }
    }
  }, []);

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

            }}
            rootContainerProps={{ width: "40%", }}
          />
        </div>
        <div className={styles.topRightButtonsContainer}>
          <button className={styles.topRightButtons}>Losange</button>
          <button className={styles.topRightButtons}>?</button>
        </div>
      </header>

      <div className={styles.content}>
        {sunoProject ? <SunoProjectCard project={sunoProject} /> : <div className={styles.cardContainer}>Renseignez le lien Suno pour faire apparaître votre projet</div>}

      </div>

      <footer className={styles.footer}>
        <div className={styles.inputSunoLinkContainer}>
          <p style={{ fontWeight: 500 }}>Submit : </p> <input placeholder="Collez les liens de vos morceaux Suno..." className={styles.inputSunoLink} onChange={(e) => { setSunoLink(e.target.value) }} value={sunoLink} />
          <button className={styles.plusButton}> + </button>
        </div>
      </footer>
    </div >
  );
}

export default App;
