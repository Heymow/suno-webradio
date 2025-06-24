// Type pour ObjectId MongoDB sans dépendance mongoose
type ObjectId = string;

interface SunoSong {
    _id: ObjectId;
    name: string;
    author: string;
    prompt: string;
    negative?: string;
    lyrics?: string;
    songImage: string;
    avatarImage: string;
    playCount: number;
    upVoteCount: number;
    modelVersion: string;
    audio: string;
    duration: string;
    radioVoteCount?: number;
    radioPlayCount?: number;
    sunoLink?: string;
    userId?: string;
    timeUntilPlay?: string;
}

interface Playlist {
    name: string;
    writer: string;
    img: string;
    src: string;
    id: number;
} 