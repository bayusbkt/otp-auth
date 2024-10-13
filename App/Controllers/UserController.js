import User from "../Models/User.js";

export const getAllUser = async (req, res) => {
  try {
    const user = await User.find().select("-password");
    return res.status(200).json({
      status: true,
      message: "Success Get All User",
      data: user,
    });
  } catch (error) {
    res.status(422).json({
      status: false,
      message: `${error.message}`,
    });
  }
};

export const verifyUser = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) {
      throw new Error("User not found");
    }

    return res.status(200).json({
        status: true,
        message: "Success Verify User",
        data: user
    })
  } catch (error) {
    res.status(500).json({
      status: false,
      message: `${error.message}`,
    });
  }
};
