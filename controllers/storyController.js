import storyModel from "../models/story.js";
import multer from "multer";

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, `${Date.now()}_${file.originalname}`);
  },
});

const upload = multer({ storage: storage });

//create posts
export const createStory = async (req, res) => {
  try {
    const {
      userId,
      title,
      author,
      age_rating,
      genre,
      trope,
      character,
      synopsis,
      stage,
      category,
    } = req.body;

    const cover_url = req.file ? `uploads/${req.file.filename}` : null;

    if (!cover_url) {
      return res.status(400).json({ error: "Cover picture is required" });
    }

    const newStory = await storyModel.create({
      userId,
      title,
      author,
      age_rating,
      genre,
      trope,
      character,
      synopsis,
      cover_url,
      stage,
      category,
    });

    await newStory.save();

    res.status(201).json(newStory);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// fetch a  story
export const getBook = async (req, res) => {
  try {
    const stories = await storyModel
      .findById(req.params.storyId)
      .populate("chapters");
    if (!stories) return res.status(404).json({ message: "Story not found" });
    stories.views++;
    await stories.save();
    res.json(stories);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// fetch a writer's stories
export const GetAWriterStories = async (req, res) => {
  try {
    const stories = await storyModel
      .find()
      .populate("userId")
      .sort({ created_at: -1 });
    res.json(stories);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// single story
export const getASingleStory = async (req, res) => {
  try {
    const { id } = req.params;
    const story = await storyModel.findById(id).populate("chapters");

    if (!story) {
      return res.status(404).json({ message: "Story not found" });
    }

    res.json(story);
  } catch (error) {
    console.error("Error fetching story:", error);
    res.status(500).json({ message: "Failed to fetch story details" });
  }
};
// update a story
export const UpdateAStory = async (req, res) => {
  try {
    const {
      cover_url,
      author,
      title,
      age_rating,
      genre,
      trope,
      character,
      synopsis,
    } = req.body;
    const story = await storyModel.findByIdAndUpdate(
      req.params.id,
      {
        cover_url,
        author,
        title,
        age_rating,
        genre,
        trope,
        character,
        synopsis,
        updated_at: Date.now(),
      },
      { new: true }
    );
    if (!story) {
      return res.status(404).json({ message: "Story not found" });
    }
    res.json(story);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// delete a story
export const deleteAStory = async (req, res) => {
  try {
    const story = await storyModel.findByIdAndDelete(req.params.id);
    if (!story) {
      return res.status(404).json({ message: "Story not found" });
    }
    res.json({ message: "Story deleted successfully" });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const getAllStories = async (req, res) => {
  try {
    const stories = await storyModel.find().sort({ created_at: -1 });
    res.status(200).json(stories);
  } catch (error) {
    console.error("Error fetching stories:", error);
    res.status(400).json({ error: error.message });
  }
};

export const incrementStoryViews = async (req, res) => {
  try {
    const { id } = req.params;
    const story = await storyModel.findByIdAndUpdate(
      id,
      { $inc: { views: 1 } },
      { new: true }
    );

    if (!story) {
      return res.status(404).json({ message: "Story not found" });
    }

    res.json({ views: story.views });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// export const toggleStoryLike = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const userId = req.userId;

//     if (!userId) {
//       return res.status(400).json({ message: "User ID is required" });
//     }

//     const story = await storyModel.findById(id);
//     if (!story) {
//       return res.status(404).json({ message: "Story not found" });
//     }

//     const hasLiked = story.likedBy.includes(userId);
//     if (hasLiked) {
//       // story.likes -= 1;
//       story.likedBy = story.likedBy.filter(
//         (user) => user && user.toString() !== userId.toString()
//       );
//     } else {
//       // story.likes += 1;
//       story.likedBy.push(userId);
//     }
//     story.likes = story.likedBy.length;
//     await story.save();
//     res.json({ likes: story.likes, hasLiked: !hasLiked });
//   } catch (error) {
//     console.log(error);
//     res.status(500).json({ error: error.message });
//   }
// };

export const toggleStoryLike = async (req, res) => {
  try {
    const { id } = req.params;
    const { liked } = req.body;

    const story = await storyModel.findById(id);
    if (!story) {
      return res.status(404).json({ message: "Story not found" });
    }

    // Update the liked status and likes count in the database
    if (liked) {
      story.likes += 1;
    } else {
      story.likes = Math.max(story.likes - 1, 0); // Ensure likes count doesn't go negative
    }

    await story.save();

    res.json({ likes: story.likes, hasLiked: liked });
  } catch (error) {
    console.error("Error updating like:", error);
    res.status(500).json({ error: error.message });
  }
};

export const rateStory = async (req, res) => {
  try {
    const { id } = req.params;
    const { rating } = req.body;
    const userId = req.userId;

    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }

    if (rating < 0 || rating > 5) {
      return res
        .status(400)
        .json({ message: "Rating must be between 0 and 5" });
    }

    const story = await storyModel.findById(id);
    if (!story) {
      return res.status(404).json({ message: "Story not found" });
    }

    // Update or add user's rating
    const existingRating = story.ratings.find(
      (r) => r.userId && r.userId.toString() === userId
    );

    if (existingRating) {
      existingRating.ratingValue = rating;
    } else {
      story.ratings.push({ userId, ratingValue: rating });
    }

    // Calculate the average rating
    const totalRating = story.ratings.reduce(
      (sum, r) => sum + r.ratingValue,
      0
    );
    story.rating = totalRating / story.ratings.length;

    await story.save();
    res.json({ rating: story.rating });
  } catch (error) {
    console.log("Error in rating:", error);
    res.status(500).json({ error: error.message });
  }
};

export const fetchStoryByGenre = async (req, res) => {
  try {
    const { genre } = req.params;
    const stories = await storyModel.find({ genre });

    if (stories.length > 0) {
      res.json({ stories });
    } else {
      res.json({ message: "No story yet" });
    }
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
};
export const fetchStoriesByStage = async (req, res) => {
  try {
    const { stage } = req.params;
    const stories = await storyModel.find({ stage });

    if (stories.length > 0) {
      res.json({ stories });
    } else {
      res.json({ message: "No story for this stage yet" });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
export const ShortNovel = async (req, res) => {
  try {
    const { category } = req.query;
    if (!category) {
      return res.status(400).json({ message: "Category is required" });
    }

    const stories = await storyModel
      .find({ category })
      .sort({ created_at: -1 })
      .limit(7);

    res.json({ stories });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const allNovel = async (req, res) => {
  try {
    const { category } = req.params; // Accessing category from URL parameters

    if (!category) {
      return res.status(400).json({ message: "Category is required" });
    }

    const stories = await storyModel
      .find({ category })
      .sort({ created_at: -1 });

    res.json({ stories });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error.message });
  }
};

export const Searching = async (req, res) => {
  try {
    const searchQuery = req.query.query;

    if (!searchQuery) {
      return res.status(400).json({ message: "Search query is required" });
    }
    const stories = await storyModel.find({
      $or: [
        { title: { $regex: searchQuery, $options: "i" } },
        { author: { $regex: searchQuery, $options: "i" } },
        { genre: { $regex: searchQuery, $options: "i" } },
      ],
    });

    if (stories.length === 0) {
      return res.status(404).json({ message: "No stories found" });
    }

    res.json(stories);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
