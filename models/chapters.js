import mongoose from "mongoose";

const chapterSchema = new mongoose.Schema({
  story_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Story",
    required: true,
  },
  title: { type: String },
  content: { type: String },
  views: { type: Number, default: 0 },
  likes: { type: Number, default: 0 },
  likedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  comments: [{ type: mongoose.Schema.Types.ObjectId, ref: "Comment" }],
  is_locked: { type: Boolean, default: false },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now },
});

export default mongoose.model("Chapter", chapterSchema);
