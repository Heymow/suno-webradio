const { Playlist } = require("../models/playlists");
const { SunoSong } = require("../models/sunoSongs");

class PlayerService {
  constructor() {
    this.clients = [];
    this.currentTrackIndex = 0;
    this.startTime = Date.now();
    this.track = null;
    this.previousTrack = null;
    this.playlist = [];
    this.playedTracks = new Set();
    this.nextTrackTimeout = null;

    // Bind methods to ensure 'this' context
    this.loadPlaylist = this.loadPlaylist.bind(this);
    this.scheduleNextTrack = this.scheduleNextTrack.bind(this);
    this.sendEventToClients = this.sendEventToClients.bind(this);

    // Initialize
    this.loadPlaylist();
    setInterval(this.loadPlaylist, 30000);
    setInterval(() => {
      if (this.playlist.length > 0 && this.track) {
        this.sendEventToClients();
      }
    }, 10000);
  }

  async loadPlaylist() {
    try {
      const newPlaylist = await Playlist.findOne({ name: "New" }).populate(
        "songs"
      );

      if (!newPlaylist) {
        console.log("Playlist 'New' not found in database.");
        return;
      }

      if (newPlaylist.songs.length === 0) {
        console.log("Playlist 'New' is empty.");
        return;
      }

      if (newPlaylist && newPlaylist.songs.length > 0) {
        console.log(
          `Loading playlist 'New' with ${newPlaylist.songs.length} songs.`
        );
        const newSongs = newPlaylist.songs
          .map((song) => {
            if (!song) {
              console.warn(
                "Found null song in playlist (possibly deleted), skipping."
              );
              return null;
            }
            let duration = parseFloat(song.duration);
            if (isNaN(duration) || duration <= 0) {
              console.warn(
                `Invalid duration for song ${song.name} (${song._id}): ${song.duration}. Defaulting to 120s.`
              );
              duration = 120;
            }
            return {
              name: song.name,
              writer: song.author,
              src: song.audio,
              img: song.songImage,
              duration: duration,
              id: song._id.toString(),
              prompt: song.prompt,
              negative: song.negative,
              avatarImage: song.avatarImage,
              playCount: song.playCount,
              upVoteCount: song.upVoteCount,
              modelVersion: song.modelVersion,
              lyrics: song.lyrics,
            };
          })
          .filter((song) => song !== null);

        console.log(`Loaded ${newSongs.length} valid songs.`);

        if (this.hasPlaylistChanged(this.playlist, newSongs)) {
          this.playlist = newSongs;
          this.currentTrackIndex = 0;
          this.playedTracks.clear();
          this.track = this.playlist[this.currentTrackIndex];
          this.startTime = Date.now();
          this.playedTracks.add(this.track.id);
          this.scheduleNextTrack();
        } else if (!this.track && newSongs.length > 0) {
          this.playlist = newSongs;
          this.track = this.playlist[this.currentTrackIndex];
          this.startTime = Date.now();
          this.playedTracks.add(this.track.id);
          this.scheduleNextTrack();
        }
      }
    } catch (error) {
      console.error("Error loading playlist:", error);
    }
  }

  hasPlaylistChanged(oldPlaylist, newPlaylist) {
    if (oldPlaylist.length !== newPlaylist.length) return true;
    const oldIds = new Set(oldPlaylist.map((track) => track.id));
    return newPlaylist.some((track) => !oldIds.has(track.id));
  }

  getNextTrackIndex() {
    if (this.playedTracks.size >= this.playlist.length) {
      this.playedTracks.clear();
      return 0;
    }

    let nextIndex = (this.currentTrackIndex + 1) % this.playlist.length;
    while (this.playedTracks.has(this.playlist[nextIndex].id)) {
      nextIndex = (nextIndex + 1) % this.playlist.length;
    }
    return nextIndex;
  }

  scheduleNextTrack() {
    if (this.nextTrackTimeout) clearTimeout(this.nextTrackTimeout);
    if (!this.track || this.playlist.length === 0) return;

    const now = Date.now();
    const elapsed = Math.floor((now - this.startTime) / 1000);
    const remainingTime = Math.max(0, this.track.duration - elapsed);
    const timeUntilNext = (remainingTime + 1) * 1000;

    this.nextTrackTimeout = setTimeout(async () => {
      this.previousTrack = { ...this.track };
      this.currentTrackIndex = this.getNextTrackIndex();
      this.track = this.playlist[this.currentTrackIndex];
      this.playedTracks.add(this.track.id);
      this.startTime = Date.now();

      this.scheduleNextTrack();

      const trackChangeUpdate = {
        ...this.getTrackState(),
        elapsed: 0,
        isTrackChange: true,
        previousTrack: this.previousTrack,
      };

      this.broadcast(trackChangeUpdate);

      if (this.playedTracks.size === this.playlist.length - 1) {
        await this.loadPlaylist();
      }
    }, timeUntilNext);
  }

  async updateCurrentTrackData() {
    if (!this.track) return;
    try {
      const updatedSong = await SunoSong.findById(this.track.id);
      if (updatedSong) {
        // Update counters in the current track object
        this.track.radioVoteCount = updatedSong.radioVoteCount;
        this.track.upVoteCount = updatedSong.upVoteCount;
        this.track.playCount = updatedSong.playCount;
        this.track.radioPlayCount = updatedSong.radioPlayCount;

        // Broadcast update with isCountersUpdate flag
        const now = Date.now();
        const elapsed = Math.floor((now - this.startTime) / 1000);

        const trackUpdate = {
          ...this.getTrackState(),
          elapsed,
          isTrackChange: false,
          isCountersUpdate: true
        };
        this.broadcast(trackUpdate);
      }
    } catch (error) {
      console.error("Error updating current track data:", error);
    }
  }

  getTrackState() {
    if (!this.track) return null;
    return {
      name: this.track.name,
      writer: this.track.writer,
      src: this.track.src,
      img: this.track.img,
      duration: this.track.duration,
      id: this.track.id,
      prompt: this.track.prompt,
      negative: this.track.negative,
      avatarImage: this.track.avatarImage,
      playCount: this.track.playCount,
      upVoteCount: this.track.upVoteCount,
      modelVersion: this.track.modelVersion,
      lyrics: this.track.lyrics,
    };
  }

  sendEventToClients() {
    if (this.playlist.length === 0 || !this.track) return;
    const now = Date.now();
    const elapsed = Math.floor((now - this.startTime) / 1000);

    const trackUpdate = {
      ...this.getTrackState(),
      elapsed,
      isTrackChange: false,
      previousTrack: this.previousTrack,
    };

    this.broadcast(trackUpdate);
  }

  broadcast(data) {
    this.clients.forEach((res) => {
      res.write(`data: ${JSON.stringify(data)}\n\n`);
    });
  }

  addClient(res) {
    console.log("PlayerService: Adding new client");
    this.clients.push(res);
    // Send a comment to flush headers immediately and ensure connection is alive
    res.write(": connected\n\n");

    if (this.track) {
      console.log("PlayerService: Sending initial state to client");
      const nextIndex = (this.currentTrackIndex + 1) % this.playlist.length;
      const nextTrack = this.playlist[nextIndex];

      const initialState = {
        ...this.getTrackState(),
        elapsed: Math.floor((Date.now() - this.startTime) / 1000),
        isTrackChange: false,
        previousTrack: this.previousTrack,
        nextTrack: nextTrack
          ? {
              name: nextTrack.name,
              writer: nextTrack.writer,
              src: nextTrack.src,
              img: nextTrack.img,
              duration: nextTrack.duration,
              id: nextTrack.id,
              prompt: nextTrack.prompt,
              negative: nextTrack.negative,
              avatarImage: nextTrack.avatarImage,
              playCount: nextTrack.playCount,
              upVoteCount: nextTrack.upVoteCount,
              modelVersion: nextTrack.modelVersion,
              lyrics: nextTrack.lyrics,
            }
          : null,
      };
      res.write(`data: ${JSON.stringify(initialState)}\n\n`);
    } else {
      console.log("PlayerService: No track playing, skipping initial state");
    }
  }

  removeClient(res) {
    this.clients = this.clients.filter((client) => client !== res);
  }

  forceNextTrack() {
    if (this.playlist.length === 0) return null;

    this.currentTrackIndex =
      (this.currentTrackIndex + 1) % this.playlist.length;
    this.track = this.playlist[this.currentTrackIndex];
    this.startTime = Date.now();
    this.sendEventToClients();

    return this.track;
  }

  getNextTrackInfo() {
    if (this.playlist.length === 0) return null;
    const nextIndex = (this.currentTrackIndex + 1) % this.playlist.length;
    return this.playlist[nextIndex];
  }
}

module.exports = new PlayerService();
