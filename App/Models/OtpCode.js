import mongoose from "mongoose";

const { Schema } = mongoose;

const otpCodeSchema = new Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },
  otp: {
    type: String,
    required: true
  },
  validUntil: {
    type: Date,
    required: true,
    expires: 300
  }
})

const OtpCode = mongoose.model("OtpCode", otpCodeSchema);
export default OtpCode;