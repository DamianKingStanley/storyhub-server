import mongoose from "mongoose";

const storySchema = mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    author: { type: String, required: true },
    cover_url: { type: String, required: true },
    title: { type: String, required: true },
    age_rating: { type: String, required: true },
    genre: { type: String, required: true },
    trope: [{ type: String, required: true }],
    character: [{ type: String, required: true }],
    synopsis: { type: String, required: true },
    stage: { type: String },
    category: { type: String },
    views: { type: Number, default: 0 },
    likes: { type: Number, default: 0 },
    rating: { type: Number, default: 0 },
    ratings: [
      {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        ratingValue: Number,
      },
    ],
    likedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    chapters: [{ type: mongoose.Schema.Types.ObjectId, ref: "Chapter" }],
    opinion: {
      type: String,
      enum: ["trending", "popular", "rising"],
    },
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Story", storySchema);
