import express from "express";
const router = express.Router();

import {
  createChapter,
  ViewChapters,
  AllChapters,
  GetAChapter,
  updateAChapter,
  deleteAChapter,
  incrementChapterViews,
  toggleChapterLike,
} from "../controllers/chapterController.js";

import auth from "../middleware/auth.js";

router.post("/create-chapter", createChapter);
router.get("/stories/:storyId/chapters", ViewChapters);
router.get("/:storyId", AllChapters);
router.get("/chapter/:id", GetAChapter);
router.put("/chapter/:id", auth, updateAChapter);
router.delete("/chapter/:id", auth, deleteAChapter);
router.patch("/chapter/:id/views", incrementChapterViews);
router.patch("/chapter/:id/likes", auth, toggleChapterLike);

export default router;
