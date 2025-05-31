const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const Fundraiser = require("../models/Fundraiser");
const auth = require("../middleware/auth");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5000000 },
  fileFilter: function (req, file, cb) {
    checkFileType(file, cb);
  },
});

function checkFileType(file, cb) {
  const filetypes = /jpeg|jpg|png|gif/;
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = filetypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb("Error: Images Only!");
  }
}

router.post("/", auth, upload.single("image"), async (req, res) => {
  try {
    const { title, category, targetAmount, description } = req.body;
    const imageUrl = `/uploads/${req.file.filename}`;

    const fundraiser = await Fundraiser.create({
      title,
      category,
      targetAmount,
      description,
      imageUrl,
      creatorId: req.user.id,
    });

    res.status(201).json({
      success: true,
      data: fundraiser,
    });
  } catch (error) {
    console.error("Create fundraiser error:", error);

    if (error.name === "SequelizeValidationError") {
      return res.status(400).json({
        message: "Validation error",
        errors: error.errors.map((err) => ({
          field: err.path,
          message: err.message,
        })),
      });
    }

    res.status(500).json({ message: "Server error", error: error.message });
  }
});

router.get("/", async (req, res) => {
  try {
    const fundraisers = await Fundraiser.findAll({
      include: [
        {
          model: User,
          as: "creator",
          attributes: ["id", "name", "email"],
        },
      ],
    });

    res.status(200).json({
      success: true,
      data: fundraisers,
    });
  } catch (error) {
    console.error("Get fundraisers error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const fundraiser = await Fundraiser.findByPk(req.params.id, {
      include: [
        {
          model: User,
          as: "creator",
          attributes: ["id", "name", "email"],
        },
      ],
    });

    if (!fundraiser) {
      return res.status(404).json({ message: "Fundraiser not found" });
    }

    res.status(200).json({
      success: true,
      data: fundraiser,
    });
  } catch (error) {
    console.error("Get fundraiser error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

module.exports = router;
