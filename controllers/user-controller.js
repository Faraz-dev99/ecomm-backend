const User = require('../models/user-model');
const { uploadOnCloudnary, destroyImage } = require('../utils/cloudinary');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');



exports.getUser = async (req, resp) => {
    try {

        const id = req.user._id;
        const user = await User.findById(id);
        if (!user) {
            return resp.status(404).json({
                success: false,
                message: "user not found"
            })
        }
        resp.status(200).json({
            success: true,
            user,
        })

    }
    catch (err) {
        resp.status(500).json({
            success: false,
            message: "something went wrong",
            error: err.message
        }
        )
    }
}

exports.updateProfilePicture = async (req, resp) => {
  try {
    const userId = req.user._id; // set by your authorization middleware
    const { username, currentPassword, newPassword, confirmPassword } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return resp.status(404).json({ success: false, message: "User not found" });
    }

    let somethingChanged = false;

    // 1) Username (optional)
    if (typeof username === 'string' && username.trim() && username.trim() !== user.username) {
      const existingUser = await User.findOne({ username: username.trim() });
      if (existingUser && existingUser._id.toString() !== userId.toString()) {
        return resp.status(400).json({ success: false, message: "Username already taken" });
      }
      user.username = username.trim();
      somethingChanged = true;
    }

    // 2) Profile picture (optional)
    if (req.file) {
      const file = req.file;

      const publicId =
        file.fieldname +
        '-' +
        Date.now() +
        '-' +
        Math.round(Math.random() * 1e9) +
        path.extname(file.originalname);

      const uploadedImage = await uploadOnCloudnary(
        file,
        'Mern Practice/E com project(1)/profile',
        publicId
      );

      // remove temp file
      try { fs.unlinkSync(file.path); } catch {}

      // delete old image if exists
      if (user.profilePicture && user.profilePicture.public_id) {
        await destroyImage(user.profilePicture.public_id);
      }

      user.profilePicture = {
        public_id: uploadedImage.public_id,
        secure_url: uploadedImage.secure_url,
      };
      somethingChanged = true;
    }

    // 3) Password change (optional)
    const wantsPasswordChange = currentPassword || newPassword || confirmPassword;
    if (wantsPasswordChange) {
      if (!currentPassword || !newPassword || !confirmPassword) {
        return resp.status(400).json({
          success: false,
          message: "All password fields are required",
        });
      }

      if (newPassword !== confirmPassword) {
        return resp.status(400).json({
          success: false,
          message: "New password and confirm password do not match",
        });
      }

      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch) {
        return resp.status(400).json({
          success: false,
          message: "Current password is incorrect",
        });
      }

      user.password = await bcrypt.hash(newPassword, 10);
      somethingChanged = true;
    }

    if (!somethingChanged) {
      return resp.status(400).json({
        success: false,
        message: "Nothing to update",
      });
    }

    await user.save();

    return resp.status(200).json({
      success: true,
      message: "Profile updated successfully",
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        profilePicture: user.profilePicture,
      },
    });
  } catch (err) {
    console.error(err);
    return resp.status(500).json({
      success: false,
      message: "Something went wrong",
      error: err.message,
    });
  }
};