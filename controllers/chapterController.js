import chapters from "../models/chapters.js";
import storyModel from "../models/story.js";

// create new chapters
export const createChapter = async (req, res) => {
  try {
    const { story_id, title, content, is_locked } = req.body;
    const chapter = new chapters({ story_id, title, content, is_locked });
    await chapter.save();

    await storyModel.findByIdAndUpdate(story_id, {
      $push: { chapters: chapter._id },
    });
    res.status(201).json(chapter);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const ViewChapters = async (req, res) => {
  try {
    const chapter = await chapters.find({ story_id: req.params.storyId }).sort({
      created_at: -1,
    });
    if (!chapter || chapter.length === 0) {
      return res.status(404).json({ message: "No chapters found" });
    }
    res.json(chapter);
  } catch (error) {
    console.error("Error fetching chapters:", error);
    res.status(400).json({ error: error.message });
  }
};

// get all chapters from a story
export const AllChapters = async (req, res) => {
  try {
    const chapters = await chapters
      .find({ story_id: req.params.storyId })
      .populate("comments");
    if (!chapters)
      return res.status(404).json({ message: "Chapter not found" });
    chapters.views++;
    // await chapters.save();
    res.json(chapters);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// get a single chapter
export const GetAChapter = async (req, res) => {
  try {
    const chapter = await chapters.findById(req.params.id);
    if (!chapter) {
      return res.status(404).json({ message: "Chapter not found" });
    }
    res.json(chapter);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// update a chapter
export const updateAChapter = async (req, res) => {
  try {
    const { title, content, is_locked } = req.body;
    const chapter = await chapters.findByIdAndUpdate(
      req.params.id,
      { title, content, is_locked, updated_at: Date.now() },
      { new: true }
    );
    if (!chapter) {
      return res.status(404).json({ message: "Chapter not found" });
    }
    res.json(chapter);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// delete a chapter

export const deleteAChapter = async (req, res) => {
  try {
    const chapter = await chapters.findByIdAndDelete(req.params.id);
    if (!chapter) {
      return res.status(404).json({ message: "Chapter not found" });
    }
    res.json({ message: "Chapter deleted successfully" });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const incrementChapterViews = async (req, res) => {
  try {
    const { id } = req.params;
    const chapter = await chapters.findByIdAndUpdate(
      id,
      { $inc: { views: 1 } },
      { new: true }
    );

    if (!chapter) {
      return res.status(404).json({ message: "chapter not found" });
    }

    res.json({ views: chapter.views });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const toggleChapterLike = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId;

    const chapter = await chapters.findById(id);
    if (!chapter) {
      return res.status(404).json({ message: "Story not found" });
    }

    const hasLiked = chapter.likedBy.includes(userId);
    if (hasLiked) {
      chapter.likes -= 1;
      chapter.likedBy = chapter.likedBy.filter(
        (user) => user && user.toString() !== userId.toString()
      );
    } else {
      chapter.likes += 1;
      chapter.likedBy.push(userId);
    }

    await chapter.save();
    res.json({ likes: chapter.likes, hasLiked: !hasLiked });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error.message });
  }
};
