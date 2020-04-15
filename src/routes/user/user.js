const mongoose = require("mongoose");
const express = require("express");
const multer = require("multer");
const sharp = require("sharp");

const router = express.Router();

const authMiddleware = require("../../middlewares/auth");

const User = mongoose.model("user");

const upload = multer({
  limits: {
    fileSize: 1000000 * 2,
  },
  fileFilter(req, file, cb) {
    if (!file.originalname.match(/\.(jpg|png|jpeg)$/)) {
      return cb(new Error("only .jpg,jpeg,png files are accepted"));
    }

    cb(undefined, true);
  },
});

router.get("/test", (req, res) => {
  res.json({
    message: "user test route",
  });
});

router.post(
  "/addProfilePicture",
  authMiddleware,
  upload.single("avatar"),
 async (req, res) => {

    const avatarBuffer = await sharp(req.file.buffer).resize({width : 300 , height : 300}).png().toBuffer();

    req.user.avatar = avatarBuffer;

    req.user
      .save()
      .then((user) => {
        res.json({ user });
      })
      .catch((e) => {
        throw Error(e);
      });
  },
  (err, req, res, next) => {
    if (err) {
      res.status(500).json({
        error: err.message,
      });
    }
  }
);

router.get("/:id/avatar", async (req, res) => {
  try {
    const user = await User.findById(req.params.id, { avatar: 1 });

    if (!user) {
      throw new Error("User Avatar not found");
    }

    res.set("content-type", "image/png");
    res.send(user.avatar);
  } catch (e) {
    res.status(404).json({
      error: "avatar not found",
    });
  }
});

module.exports = router;
