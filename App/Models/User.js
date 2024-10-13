import mongoose from "mongoose";

const { Schema } = mongoose;

const userSchema = new Schema({
    username: {
        type: String,
        required: true,
        min: 3
    },
    email: {
        type: String,
        required: true,
    },
    password: {
        type: String,
        required: true,
        min: 6
    },
    role: {
        type: String,
        enum: ["User", "Admin"],
        default: "User"
    },
    refreshToken: {
        type: String
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    EmailVerifiedAt: {
        type: Date
    }
})

const User = mongoose.model("User", userSchema);
export default User;