# Suno API Response Structures

This document lists the different JSON response structures encountered from the Suno API, including v4 and v5 variations.

## 1. Standard v4 Response (and v5 without history)

This is the standard structure for generated songs.

```json
{
  "id": "5067b2fd-4ad4-47e5-8140-43a29e7ac9d6",
  "entity_type": "song_schema",
  "video_url": "https://cdn1.suno.ai/5067b2fd-4ad4-47e5-8140-43a29e7ac9d6.mp4",
  "audio_url": "https://cdn1.suno.ai/5067b2fd-4ad4-47e5-8140-43a29e7ac9d6.mp3",
  "image_url": "https://cdn2.suno.ai/image_5067b2fd-4ad4-47e5-8140-43a29e7ac9d6.jpeg",
  "image_large_url": "https://cdn2.suno.ai/image_large_5067b2fd-4ad4-47e5-8140-43a29e7ac9d6.jpeg",
  "major_model_version": "v4",
  "model_name": "chirp-v4",
  "metadata": {
    "tags": "reggey, ska stealdrumm, up beat, kölsch",
    "prompt": "(Intro)\nEy, ich stonn he am Strand...",
    "type": "gen",
    "duration": 184.92,
    "can_remix": true,
    "is_remix": false
  },
  "user_id": "6f37e09d-0c89-43b5-bc69-0225ec367b14",
  "display_name": "DiggerMc",
  "handle": "diggermc",
  "avatar_image_url": "https://cdn1.suno.ai/b9dbe5f2.webp",
  "title": "Neu-Deutsch Jamaika (Usedom Vibes op Kölsch)",
  "play_count": 107,
  "upvote_count": 39,
  "is_public": true
}
```

## 2. v5 Response with `concat_history`

In v5, the `history` array is sometimes replaced by `concat_history` inside `metadata`. This is used to determine the `originId` (the first song in the chain).

```json
{
  "id": "6f2a9077-43ff-4a80-b6b4-c1cf09ea1264",
  "major_model_version": "v5",
  "metadata": {
    "concat_history": [
      {
        "id": "c88bc7f8-1800-4235-ac89-b31947f5ae0f",
        "type": "concat_infilling",
        "infill": true,
        "source": "web"
      },
      {
        "id": "6ba96bb9-e209-4b2a-a73b-81ca409f231e"
      }
    ],
    "type": "concat_infilling"
  }
  // ... other fields
}
```

## 3. v5 Upsample Response

When a song is an upsample, it has `type: "upsample"` and an `upsample_clip_id` in `metadata`.

```json
{
  "id": "5e0fc175-2b2f-4134-b329-67084ed55cdd",
  "major_model_version": "v5",
  "metadata": {
    "type": "upsample",
    "upsample_clip_id": "1f058b3b-a2e5-48a1-acb4-80e13d5a53e9",
    "task": "upsample"
  }
  // ... other fields
}
```

## 4. v5 Cover Response

When a song is a cover, it has `task: "cover"`.

```json
{
  "id": "9670b89d-2c99-448b-9319-88dca39a6ec4",
  "major_model_version": "v5",
  "metadata": {
    "type": "gen",
    "task": "cover"
  }
  // ... other fields
}
```

## Logic for `originId`

The backend logic determines the `originId` (the root song ID) in the following order:

1.  **Upsample**: If `metadata.upsample_clip_id` exists, use it.
2.  **Concat History**: If `metadata.concat_history` exists and has elements, use the `id` of the first element.
3.  **History**: If `metadata.history` exists (v4), use the `id` of the first element.
4.  **Fallback**: Use the song's own `id`.

## 5. Studio Export Response

This structure appears for songs exported from the studio (e.g., post-processing or specific generation flows).
Note that `major_model_version` can be empty, and `metadata.type` is "studio_export".

```json
{
  "id": "dfa4cf3e-8fe4-4bbb-bb02-c25d96f5c45d",
  "entity_type": "song_schema",
  "major_model_version": "",
  "model_name": "chirp-chirp",
  "metadata": {
    "tags": "",
    "prompt": "Lyrics...",
    "type": "studio_export",
    "duration": 328.3442083333333,
    "can_remix": false,
    "is_remix": false
  },
  "title": "Stove Light On",
  // ... other fields
}
```

## 6. Speed Edit Response

This structure appears for songs that have been speed-adjusted (e.g., 0.94x).
Like Studio Export, `major_model_version` can be empty, and `metadata.type` is "edit_speed".

```json
{
  "id": "8537b0fb-eb3d-4c2a-b85e-f4b47640c285",
  "entity_type": "song_schema",
  "major_model_version": "",
  "model_name": "chirp-chirp",
  "metadata": {
    "tags": "",
    "prompt": "",
    "type": "edit_speed",
    "duration": 347.85910416666667,
    "can_remix": true,
    "is_remix": true
  },
  "title": "Stove Light On (0.94x)",
  // ... other fields
}
```
