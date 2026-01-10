const express = require("express");
const User = require("../models/User");
const { adminAuth } = require("../middleware/auth");

const router = express.Router();

/**
 * Get all users (Admin only)
 */
router.get("/users", adminAuth, async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

/**
 * Promote user to admin
 */
router.patch("/users/:id/make-admin", adminAuth, async (req, res) => {
  try {
    if (req.user._id.toString() === req.params.id) {
      return res.status(400).json({ message: "You are already admin" });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role: "admin" },
      { new: true }
    ).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({
      message: "User promoted to admin",
      user,
    });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

/**
 * Delete user (Admin only)
 */
router.delete("/users/:id", adminAuth, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.role === "admin") {
      // Prevent deleting other admins if needed, or self-delete.
      // For now allowing admin to delete admin, but maybe check if self
      if (req.user._id.toString() === req.params.id) {
        return res.status(400).json({ message: "Cannot delete yourself" });
      }
    }

    await User.findByIdAndDelete(req.params.id);
    res.json({ message: "User deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
