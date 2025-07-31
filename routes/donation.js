const express = require("express");
const router = express.Router();
const Donation = require("../models/Donation");
const auth = require("../middleware/auth");
const Fundraiser = require("../models/Fundraiser");

router.post("/", auth, async (req, res) => {
  try {
    // Use `let` to allow fundraiserId to be modified
    let { name, email, phone, amount, fundraiserId } = req.body;

    // Only require the fields the user actually fills out in the form
    if (!name || !email || !phone || !amount) {
      return res.status(400).json({
        message: "Please provide name, email, phone, and amount.",
        fields: {
          name: !name ? "Name is required" : null,
          email: !email ? "Email is required" : null,
          phone: !phone ? "Phone is required" : null,
          amount: !amount ? "Amount is required" : null,
        },
      });
    }

    // If no fundraiserId is provided, find the latest one automatically.
    if (!fundraiserId) {
      const latestFundraiser = await Fundraiser.findOne().sort({ createdAt: -1 });
      if (!latestFundraiser) {
        return res.status(400).json({ message: "Cannot make a donation because no fundraisers exist." });
      }
      fundraiserId = latestFundraiser._id;
    }

    const donation = await Donation.create({
      name,
      email,
      phone,
      amount: parseFloat(amount),
      status: "completed", // Set status directly to avoid a second database call
      fundraiserId,
      userId: req.user.id,
    });

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
