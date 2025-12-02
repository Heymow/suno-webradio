const mongoose = require('mongoose');

const MetadataSchema = new mongoose.Schema({
    tags: { type: String, required: false },
    prompt: { type: String, required: true },
    concat_history: { type: [mongoose.Schema.Types.Mixed], required: false },
    type: { type: String, required: true },
    duration: { type: Number, required: true },
    persona_id: { type: String, required: false },
    video_upload_width: { type: Number, required: false },
    video_upload_height: { type: Number, required: false },
    edit_session_id: { type: String, required: false },
    can_remix: { type: Boolean, required: false },
    is_remix: { type: Boolean, required: false },
    has_vocal: { type: Boolean, required: false },
    refund_credits: { type: Boolean, required: false },
    stream: { type: Boolean, required: false },
    priority: { type: Number, required: false },
    is_audio_upload_tos_accepted: { type: Boolean, required: false },
    gpt_description_prompt: { type: String, required: false },
    cover_clip_id: { type: String, required: false },
    upsample_clip_id: { type: String, required: false },
    task: { type: String, required: false },
    free_quota_category: { type: String, required: false },
}, { _id: false });

const PersonaSchema = new mongoose.Schema({
    id: { type: String, required: true },
    name: { type: String, required: true },
    image_s3_id: { type: String, required: false },
    root_clip_id: { type: String, required: true },
    user_handle: { type: String, required: true },
    user_display_name: { type: String, required: true },
    user_image_url: { type: String, required: true },
    is_owned: { type: Boolean, required: true },
    is_public: { type: Boolean, required: true },
    is_trashed: { type: Boolean, required: true },
}, { _id: false });

const ItemSchema = new mongoose.Schema({
    id: { type: String, required: true },
    entity_type: { type: String, required: true },
    video_url: { type: String, required: false },
    video_cover_url: { type: String, required: false },
    preview_url: { type: String, required: false },
    audio_url: { type: String, required: true },
    image_url: { type: String, required: true },
    image_large_url: { type: String, required: true },
    major_model_version: { type: String, required: false },
    model_name: { type: String, required: false },
    metadata: { type: MetadataSchema, required: true },
    caption: { type: String, required: false },
    is_liked: { type: Boolean, required: true },
    user_id: { type: String, required: true },
    display_name: { type: String, required: true },
    handle: { type: String, required: true },
    is_handle_updated: { type: Boolean, required: true },
    avatar_image_url: { type: String, required: true },
    is_trashed: { type: Boolean, required: true },
    explicit: { type: Boolean, required: true },
    comment_count: { type: Number, required: true },
    flag_count: { type: Number, required: true },
    created_at: { type: String, required: true },
    status: { type: String, required: true },
    title: { type: String, required: true },
    play_count: { type: Number, required: true },
    upvote_count: { type: Number, required: true },
    is_public: { type: Boolean, required: true },
    allow_comments: { type: Boolean, required: true },
    persona: { type: PersonaSchema, required: false },
    display_tags: { type: String, required: false },
}, { _id: false });

const SectionSchema = new mongoose.Schema({
    title: { type: String, required: true },
    id: { type: String, required: true },
    options: { type: [String], required: true },
    selected_option: { type: String, required: true },
    secondary_options: { type: [String], required: true },
    secondary_selected_option: { type: String, required: true },
    section_name: { type: String, required: true },
    style_type: { type: String, required: true },
    section_type: { type: String, required: true },
    items: { type: [ItemSchema], required: true },
    preview_items_count: { type: Number, required: true },
}, { _id: false });

const TrendingResponseSchema = new mongoose.Schema({
    sections: { type: [SectionSchema], required: true },
    page: { type: Number, required: true },
    total_sections: { type: Number, required: true },
    page_size: { type: Number, required: true },
    start_index: { type: Number, required: true },
});

const Trending = mongoose.model('Trending', TrendingResponseSchema);

module.exports = Trending;


