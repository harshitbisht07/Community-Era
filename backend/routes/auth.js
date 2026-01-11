const express = require("express");
const jwt = require("jsonwebtoken");
const { body, validationResult } = require("express-validator");
const User = require("../models/User");
const { auth } = require("../middleware/auth");

const router = express.Router();

// Register
router.post(
  "/register",
  [
    body("username")
      .trim()
      .isLength({ min: 3 })
      .withMessage("Username must be at least 3 characters"),
    body("email").isEmail().withMessage("Please provide a valid email"),
    body("password")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters"),
    body("location.city").notEmpty().withMessage("City is required"),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { username, email, password, location } = req.body;

      // Check if user exists
      let user = await User.findOne({ $or: [{ email }, { username }] });
      if (user) {
        return res.status(400).json({ message: "User already exists" });
      }

      // Create user
      user = new User({
        username,
        email,
        password,
        location,
      });

      await user.save();

      // Generate token
      const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET || "fallback-secret", {
        expiresIn: "7d",
      });

      res.status(201).json({
        token,
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          role: user.role,
          location: user.location,
          profileImage: user.profileImage,
        },
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Server error" });
    }
  }
);

// Login
router.post(
  "/login",
  [
    body("email").isEmail().withMessage("Please provide a valid email"),
    body("password").exists().withMessage("Password is required"),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { email, password } = req.body;

      // Find user
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(400).json({ message: "Invalid credentials" });
      }

      // Check password
      const isMatch = await user.comparePassword(password);
      if (!isMatch) {
        return res.status(400).json({ message: "Invalid credentials" });
      }

      // Generate token
      const token = jwt.sign(
        { userId: user._id },
        process.env.JWT_SECRET || "fallback-secret",
        { expiresIn: "7d" }
      );

      res.json({
        token,
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          role: user.role,
          location: user.location,
          profileImage: user.profileImage,
        },
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Server error" });
    }
  }
);

// Get current user
router.get("/me", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");
    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// Get profile stats
router.get("/profile-stats", auth, async (req, res) => {
  try {
    const userId = req.user._id;
    const ProblemReport = require("../models/ProblemReport");

    const [totalReports, resolvedReports, impactStats] = await Promise.all([
      ProblemReport.countDocuments({ reportedBy: userId }),
      ProblemReport.countDocuments({ reportedBy: userId, status: "resolved" }),
      ProblemReport.aggregate([
        { $match: { reportedBy: userId } },
        { $group: { _id: null, totalVotes: { $sum: "$votes" } } },
      ]),
    ]);

    const recentActivity = await ProblemReport.find({ reportedBy: userId })
      .sort({ createdAt: -1 })
      .limit(5)
      .select("title status createdAt category votes");

    res.json({
      totalReports,
      resolvedReports,
      impactScore: impactStats[0]?.totalVotes || 0,
      recentActivity,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// Delete account
router.delete("/me", auth, async (req, res) => {
  try {
    const userId = req.user._id;
    const ProblemReport = require("../models/ProblemReport");
    const Vote = require("../models/Vote");

    // Optional: Anonymize reports instead of deleting?
    // For now, let's keep reports but unlink user (or just leave as is, populated as null if user gone)
    // Actually, if we delete user, populated 'reportedBy' might return null.

    // delete user
    await User.findByIdAndDelete(userId);

    // remove all votes by user
    await Vote.deleteMany({ user: userId });

    // We can choose to delete reports or keep them. keeping them for community value.
    
    res.json({ message: "Account deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// Update Profile
router.put("/profile", auth, [
  body("username").trim().isLength({ min: 3 }).withMessage("Username must be at least 3 characters")
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
       return res.status(400).json({ errors: errors.array() });
    }

    const { username, profileImage } = req.body;
    const userId = req.user._id;

    // Check uniqueness if changing
    if (username !== req.user.username) {
       const existing = await User.findOne({ username });
       if (existing) {
         return res.status(400).json({ message: "Username already taken" });
       }
    }

    const updates = { username };
    if (profileImage !== undefined) updates.profileImage = profileImage;

    const user = await User.findByIdAndUpdate(
      userId, 
      updates, 
      { new: true }
    ).select("-password");

    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;