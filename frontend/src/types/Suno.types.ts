// Type pour ObjectId MongoDB sans dépendance mongoose
export type ObjectId = string;

export interface SunoSong {
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
    playlistPlays?: {
        hits: number;
        new: number;
    };
    sunoLink?: string;
    userId?: string;
    timeUntilPlay?: string;
    votedBy?: string[];
    hasVoted?: boolean;
    // Propriétés pour la synchronisation radio
    elapsed?: number;
    isTrackChange?: boolean;
    isCountersUpdate?: boolean;
}

export interface Playlist {
    name: string;
    writer: string;
    img: string;
    src: string;
    id: number;
}
// Raw Suno API Response Types

export interface SunoClipMetadata {
    tags?: string;
    prompt?: string;
    type?: string;
    duration?: number;
    can_remix?: boolean;
    is_remix?: boolean;
    concat_history?: Array<{
        id: string;
        type?: string;
        infill?: boolean;
        source?: string;
        [key: string]: any;
    }>;
    history?: Array<{
        id: string;
        [key: string]: any;
    }>;
    upsample_clip_id?: string;
    task?: string;
    [key: string]: any;
}

export interface SunoClip {
    id: string;
    entity_type?: string;
    video_url?: string;
    audio_url: string;
    image_url: string;
    image_large_url: string;
    major_model_version: string;
    model_name?: string;
    metadata: SunoClipMetadata;
    user_id?: string;
    display_name?: string;
    handle?: string;
    avatar_image_url?: string;
    title?: string;
    play_count?: number;
    upvote_count?: number;
    is_public?: boolean;
    [key: string]: any;
}
