const playerService = require('../services/player.service');

exports.handleConnection = (req, res) => {
    // Les headers sont déjà définis dans le middleware app.js
    playerService.addClient(res);

    req.on("close", () => {
        playerService.removeClient(res);
    });
};

exports.getStatus = (req, res) => {
    const trackState = playerService.getTrackState();
    if (!trackState) return res.status(404).json({ message: 'Aucune piste en cours de lecture' });

    const now = Date.now();
    const elapsed = Math.floor((now - playerService.startTime) / 1000);
    
    return res.json({
        ...trackState,
        elapsed
    });
};

exports.nextTrack = (req, res) => {
    const track = playerService.forceNextTrack();
    if (!track) {
        return res.status(404).json({ message: 'Playlist vide' });
    }

    res.json({
        message: "Next track sent",
        track: {
            name: track.name,
            writer: track.writer,
            src: track.src,
            img: track.img,
            duration: track.duration,
            id: track.id
        }
    });
};

exports.getNextTrackInfo = (req, res) => {
    const nextTrack = playerService.getNextTrackInfo();
    if (!nextTrack) {
        return res.status(404).json({ message: 'Playlist vide' });
    }

    res.json({
        track: {
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
            lyrics: nextTrack.lyrics
        }
    });
};

exports.updateCurrentTrackData = async () => {
    await playerService.updateCurrentTrackData();
};
