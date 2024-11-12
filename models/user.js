import mongoose from "mongoose";
const userSchema = mongoose.Schema(
  {
    userId: { type: String },
    fullname: { type: String, required: true },
    username: { type: String, required: true },
    email: { type: String, required: true },
    password: { type: String, required: true },
    role: {
      type: String,
      enum: ["user", "admin"],
      required: true,
    },
    profilePicture: { type: String },
    resetToken: { type: String },
    resetTokenExpires: { type: Date },
    library: [{ type: mongoose.Schema.Types.ObjectId, ref: "Story" }],
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("User", userSchema);
