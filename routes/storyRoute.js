import express from "express";
import upload from "../multer.js";
const router = express.Router();

import {
  createStory,
  getBook,
  GetAWriterStories,
  getASingleStory,
  UpdateAStory,
  deleteAStory,
  getAllStories,
  incrementStoryViews,
  toggleStoryLike,
  rateStory,
  fetchStoryByGenre,
  fetchStoriesByStage,
  ShortNovel,
  allNovel,
  Searching,
} from "../controllers/storyController.js";

import auth from "../middleware/auth.js";
import roleauth from "../middleware/authorizeAdmin.js";

router.post(
  "/create-story",
  auth,
  roleauth,
  upload.single("cover_url"),
  createStory
);
router.get("/get/:storyId", getBook);
router.get("/writer/:userId/stories", GetAWriterStories);
router.get("/story/:id", getASingleStory);
router.put("/story/edit/:id", auth, UpdateAStory);
router.delete("/posts/edit/:id", auth, deleteAStory);
router.get("/fetch/all-stories", getAllStories);
router.patch("/story/:id/views", incrementStoryViews);
router.patch("/story/:id/likes", auth, toggleStoryLike);
router.patch("/story/:id/rating", auth, rateStory);
router.get("/stories/:genre", fetchStoryByGenre);
router.get("/contests/:stage", fetchStoriesByStage);
router.get("/latest-short-novels", ShortNovel);
router.get("/all-novel/:category", allNovel);
router.get("/search/stories", Searching);

export default router;
