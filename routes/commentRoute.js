import express from "express";
const router = express.Router();

import {
  createComment,
  getCommentsByPost,
} from "../controllers/commentController.js";

router.post("/comments", createComment);
router.get("/:chapterId", getCommentsByPost);

export default router;
