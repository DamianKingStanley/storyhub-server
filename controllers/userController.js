import userModel from "../models/user.js";
import storyModel from "../models/story.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import mongoose from "mongoose";

dotenv.config();
const secret = process.env.JWT_SECRET;

export const userRegister = async (req, res) => {
  try {
    const { fullname, username, email, password, role, secretKey } = req.body;

    // Check if the role is admin and validate the secret key
    if (role === "admin" && secretKey !== process.env.ADMIN_SECRET_KEY) {
      return res
        .status(401)
        .json({ message: "Invalid secret key for admin registration" });
    }

    const oldUser = await userModel.findOne({ email });
    if (oldUser) {
      return res.status(401).json({ message: "email already existed" });
    }

    const hashPassword = await bcrypt.hash(password, 12);
    const newUser = await userModel.create({
      fullname,
      username,
      email,
      password: hashPassword,
      role,
    });

    res
      .status(201)
      .json({ message: "Student registered successfully.", newUser });
  } catch (error) {
    res.status(400).json({ message: "Error registering User.", error });
  }
};
export const login = async (req, res) => {
  try {
    const { email, password, role } = req.body;
    const secret = process.env.JWT_SECRET;

    const oldUser = await userModel.findOne({ email });
    if (!oldUser) {
      return res.status(401).json({ message: "Email already exist!" });
    }
    if (oldUser.role !== role) {
      return res.status(401).json({ message: "Invalid role" });
    }

    const checkPassword = await bcrypt.compare(password, oldUser.password);
    if (!checkPassword) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign({ id: oldUser._id, role: oldUser.role }, secret, {
      expiresIn: "1h",
    });
    const formattedResult = {
      id: oldUser._id,
      username: oldUser.username,
      fullname: oldUser.fullname,
      email: oldUser.email,
      role: oldUser.role,
    };

    res.status(200).json({ result: formattedResult, token });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
const getUserProfile = async (req, res) => {
  try {
    const userId = req.params.userId;

    const user = await userModel.findById(userId).select("-password");

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Update user information
const updateUserProfile = async (req, res) => {
  try {
    const userId = req.params.userId;
    const { fullname, username, email, selectedProfilePicture } = req.body;

    // let profilePicture = req.file ? req.file.path : null;

    const user = await userModel.findById(userId);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    user.fullname = fullname;
    user.username = username;
    user.email = email;
    user.profilePicture = selectedProfilePicture;

    const updatedUser = await user.save();

    res.json(updatedUser);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export { getUserProfile, updateUserProfile };
// get others stories
export const getUserPosts = async (req, res) => {
  try {
    const { userId } = req.params;
    console.log("Received userId:", userId);
    const objectId = new mongoose.Types.ObjectId(userId);
    console.log("Converted to ObjectId:", objectId);
    const userPosts = await storyModel
      .find({ userId: objectId })
      .populate("userId", "username profilePicture");
    res.status(200).json({ userPosts });
  } catch (error) {
    console.error("Error fetching user posts:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
// get others
export const getUserById = async (req, res) => {
  try {
    const user = await userModel.findById(req.params.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json({ user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const likePostByUser = async (req, res) => {
  try {
    const { postId } = req.body;
    const userId = req.user.id;

    const user = await userModel.findById(userId);
    if (user.likedPosts.includes(postId)) {
      console.log("User has already liked this post.");
      return res
        .status(400)
        .json({ message: "You have already liked this post." });
    }

    user.likedPosts.push(postId);
    await user.save();

    res.status(200).json({ message: "Post liked successfully." });
  } catch (error) {
    console.error("Error liking post by user:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const getAllUsers = async (req, res) => {
  try {
    const users = await userModel.find().select("-password");
    res.json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// FORGET PASSWORD
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await userModel.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const token = uuidv4();
    const tokenExpires = Date.now() + 3600000;
    user.resetToken = token;
    user.resetTokenExpires = tokenExpires;
    await user.save();

    const mailOptions = {
      from: "inkypenadmin@inkypen.com.ng",
      to: email,
      subject: "Password Reset",
      html: ` <p> You are receiving this mail because you rquested for password reset. If you didn't, kindly ignore this. Thank you! 
            <p>Click <a href="https://inkypen.com.ng/reset-password/${token}">here</a> to reset your password.</p>
            
            `,
    };

    await transporter.sendMail(mailOptions);

    res.json({ message: "Email sent. Check your inbox." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    const user = await userModel.findOne({
      resetToken: token,
      resetTokenExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(404).json({ message: "Invalid or expired token" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 12);
    user.password = hashedPassword;
    user.resetToken = null;
    user.resetTokenExpires = null;
    await user.save();

    res.json({ success: true, message: "Password reset successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};
