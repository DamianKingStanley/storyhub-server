import userModel from "../models/user.js";

export const addLibrary = async (req, res) => {
  try {
    const { storyId } = req.params;
    const user = await userModel.findById(req.userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (!user.library.includes(storyId)) {
      user.library.push(storyId);
      await user.save();
    }
    res.status(200).json({ message: "Story added to library" });
  } catch (error) {
    res.status(500).json({ message: "Failed to add story to library", error });
    console.log(error);
  }
};

export const RemoveFromLibrary = async (req, res) => {
  try {
    const { storyId } = req.params;
    const user = await userModel.findById(req.userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const index = user.library.indexOf(storyId);
    if (index !== -1) {
      user.library.splice(index, 1); // Remove storyId from the library
      await user.save();
    }
    res.status(200).json({ message: "Story removed from library" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to remove story from library", error });
    console.log(error);
  }
};

export const ViewLibrary = async (req, res) => {
  try {
    const user = await userModel.findById(req.userId).populate("library");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ stories: user.library });
  } catch (error) {
    res.status(500).json({ message: "Failed to retrieve library", error });
    console.log(error);
  }
};

export const checkLibraryStatus = async (req, res) => {
  try {
    const { storyId } = req.params;
    const user = await userModel.findById(req.userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const isInLibrary = user.library.includes(storyId);
    res.status(200).json({ isInLibrary });
  } catch (error) {
    res.status(500).json({ message: "Failed to check library status", error });
    console.log(error);
  }
};
