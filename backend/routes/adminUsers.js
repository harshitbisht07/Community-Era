const express = require("express");
const User = require("../models/User");
const { adminAuth } = require("../middleware/auth");

const router = express.Router();

/**
 * Get all users (Admin only)
 */
router.get("/users", adminAuth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const search = req.query.search || "";
    const skip = (page - 1) * limit;

    const query = {};
    if (search) {
      query.$or = [
        { username: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }

    const users = await User.find(query)
      .select("-password")
      .sort({ lastActive: -1, createdAt: -1 }) // Sort by activity then creation
      .skip(skip)
      .limit(limit);

    const total = await User.countDocuments(query);

    res.json({
      users,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

/**
 * Promote user to admin
 */
/**
 * Update user role (Promote/Demote)
 */
router.patch("/users/:id/role", adminAuth, async (req, res) => {
  try {
    const { role } = req.body;
    if (!["user", "admin"].includes(role)) {
      return res.status(400).json({ message: "Invalid role" });
    }

    if (req.user._id.toString() === req.params.id && role !== 'admin') {
       // Optional: Prevent admins from demoting themselves to avoid lockout, 
       // but strictly speaking, they might want to. Let's warn or allow.
       // For safety, let's allow it but frontend should warn.
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true }
    ).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

/**
 * Promote user to admin (Legacy support, redirecting logic to above or keeping as alias)
 */
router.patch("/users/:id/make-admin", adminAuth, async (req, res) => {
   // Reusing the role update logic specifically for admin promotion
   req.body.role = 'admin';
   // ... code duplication avoided by forwarding or just reimplementing simply:
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role: "admin" },
      { new: true }
    ).select("-password");
    res.json(user);
  } catch(err) {
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
