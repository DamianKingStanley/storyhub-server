import mongoose from "mongoose";

const commentSchema = new mongoose.Schema({
  chapter_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Chapter",
    required: true,
  },
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  comment: { type: String, required: true },
  created_at: { type: Date, default: Date.now },
});

export default mongoose.model("Comment", commentSchema);
