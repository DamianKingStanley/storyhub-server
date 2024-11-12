import commentModel from "../models/comment.js";
import chapters from "../models/chapters.js";

// create a comment
export const createComment = async (req, res) => {
  try {
    const { chapter_id, user_id, comment } = req.body;
    const newComment = new commentModel({ chapter_id, user_id, comment });
    await newComment.save();

    await chapters.findByIdAndUpdate(chapters._id, {
      $push: { comments: comment._id },
    });

    res.status(201).json(newComment);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
// get all comments on a chapter
export const getCommentsByPost = async (req, res) => {
  try {
    const comments = await commentModel
      .find({
        chapter_id: req.params.chapterId,
      })
      .populate("userId");
    res.json(comments);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
