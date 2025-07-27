const express = require("express");
const router = express.Router();
const Donation = require("../models/Donation");
const auth = require("../middleware/auth");
const User = require('../models/User');

router.post("/", auth, async (req, res) => {
  try {
    const { name, email, phone, amount, fundraiserId } = req.body;

    if (!name || !email || !phone || !amount || !fundraiserId) {
      return res.status(400).json({
        message: "Please provide all required fields",
        fields: {
          name: !name ? "Name is required" : null,
          email: !email ? "Email is required" : null,
          phone: !phone ? "Phone is required" : null,
          amount: !amount ? "Amount is required" : null,
          fundraiserId: !fundraiserId ? "Fundraiser ID is required" : null,
        },
      });
    }

    const donation = await Donation.create({
      name,
      email,
      phone,
      amount: parseFloat(amount),
      status: "pending",
      userId: req.user.id,
      fundraiserId,
    });

    donation.status = "completed";
    await donation.save();

    res.status(201).json({
      success: true,
      data: donation,
    });
  } catch (error) {
    console.error("Create donation error:", error);

    if (error.name === "ValidationError") {
      const errors = Object.values(error.errors).map(err => ({
        field: err.path,
        message: err.message,
      }));
      return res.status(400).json({
        message: "Validation error",
        errors,
      });
    }

    res.status(500).json({ message: "Server error", error: error.message });
  }
});

router.get("/", auth, async (req, res) => {
  try {
    const donations = await Donation.find()
      .populate('userId', 'name email')
      .populate('fundraiserId', 'title')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: donations,
    });
  } catch (error) {
    console.error("Get donations error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

router.get("/:id", auth, async (req, res) => {
  try {
    const donation = await Donation.findById(req.params.id)
      .populate('userId', 'name email')
      .populate('fundraiserId', 'title');

    if (!donation) {
      return res.status(404).json({ message: "Donation not found" });
    }

    res.status(200).json({
      success: true,
      data: donation,
    });
  } catch (error) {
    console.error("Get donation error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

module.exports = router;
