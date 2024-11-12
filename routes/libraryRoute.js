import express from "express";

const router = express.Router();

import {
  addLibrary,
  RemoveFromLibrary,
  ViewLibrary,
  checkLibraryStatus,
} from "../controllers/libraryController.js";

import auth from "../middleware/auth.js";

router.post("/add/library/:storyId", auth, addLibrary);
router.delete("/delete/library/:storyId", auth, RemoveFromLibrary);
router.get("/library/:storyId", auth, ViewLibrary);
router.get("/library/:storyId/status", auth, checkLibraryStatus);

export default router;
