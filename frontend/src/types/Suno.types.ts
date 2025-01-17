interface SunoSong {
    name: string;
    author: string;
    prompt: string;
    negative: string;
    lyrics?: string;
    songImage: string;
    avatarImage: string;
    playCount: number;
    upVoteCount: number;
    modelVersion: string;
    audio: string;
}

interface Playlist {
    name: string;
    writer: string;
    img: string;
    src: string;
    id: number;
}