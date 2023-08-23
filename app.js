if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

const express = require("express");
const mongoose = require("mongoose");
const app = express();
const Video = require("./models/video");
const User = require("./models/user");
const passport = require("passport");
const session = require("express-session");
const jwt = require("jsonwebtoken");
const { downloadVideo, videoInfo } = require("./downloader");
const path = require("path");
const fs = require("fs");
const user = require("./models/user");

// localhost port
const port = 5173;

const dbURI = "mongodb://0.0.0.0:27017/you-tongue";
mongoose
  .connect(dbURI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then((result) => {
    console.log("Connected to db");
    app.listen(port, () => {
      console.log(`Server running on port ${port}`);
    });
  })
  .catch((err) => console.log("error while connecting :(", err));

app.use(express.static("public"));
app.use(express.json());
app.set("view engine", "ejs");
app.set("views", "./views");
app.use(express.urlencoded({ extended: false }));

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
  })
);
app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

const LocalStrategy = require("passport-local").Strategy;
passport.use(new LocalStrategy(User.authenticate()));

// api for login
app.post("/api/login", (req, res, next) => {
  if (!req.body.username || !req.body.password) {
    return res
      .status(400)
      .json({ message: "Please provide username and password" });
  }

  passport.authenticate("local", (err, user, info) => {
    if (err) {
      return res
        .status(500)
        .json({ message: "Error during authentication", error: err });
    }
    if (!user) {
      return res
        .status(401)
        .json({ message: "Username or password incorrect" });
    }

    req.login(user, (loginErr) => {
      if (loginErr) {
        return res
          .status(500)
          .json({ message: "Error during login", error: loginErr });
      }

      const token = jwt.sign({ userId: user._id }, process.env.SESSION_SECRET, {
        expiresIn: "1d",
      });
      console.log("Token generated: ", token);
      res.status(200).json({ message: "Login successful", token: token });
    });
  })(req, res, next);
});

// api for signup

app.post("/api/signup", async (req, res) => {
  try {
    const newUser = new User({
      username: req.body.username,
      email: req.body.email,
      points: 0,
    });
    User.register(newUser, req.body.password, (err, user) => {
      if (err) {
        res.status(400).json({
          success: false,
          message: `Your account could not be saved. Error: ${err.message}`,
        });
      } else {
        req.login(user, (loginErr) => {
          if (loginErr) {
            res.status(500).json({ success: false, message: loginErr.message });
          } else {
            res.status(200).json({
              success: true,
              message: "Account registered successfully.",
            });
          }
        });
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "An error occurred while processing your request.",
    });
  }
});

// api for user info

app.get("/api/account", async (req, res) => {
  if (!req.headers.authorization) {
    return res.status(401).json({ error: "Authorization token missing" });
  }
  try {
    const decodedToken = jwt.verify(
      req.headers.authorization.split(" ")[1],
      process.env.SESSION_SECRET
    );
    const userId = decodedToken.userId;

    // Fetch user information from the database using Mongoose
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Return the user information
    return res.status(200).json({
      userId: user._id,
      username: user.username,
      email: user.email,
      points: user.points,
    });
  } catch (error) {
    return res.status(401).json({ error: "Invalid token" });
  }
});

app.post("/api/video", async (req, res) => {
  try {
    const result = await videoInfo(req.body.videoUrl);
    const existingVideo = await Video.findOne({ videoId: result.videoId });

    if (!existingVideo) {
      const newVideo = new Video({
        videoId: result.videoId,
        title: result.title,
        author: result.author,
        length: result.lengthSeconds,
        tlExists: false,
        subExists: false,
      });

      newVideo
        .save()
        .then((savedVideo) => {
          res.json({ success: true, video: savedVideo });
        })
        .catch((err) => {
          console.log(err);
          res.json({ success: false, message: "Error saving video" });
        });
    } else {
      res.status(200).json({ success: true, video: existingVideo });
    }
  } catch (error) {
    console.error("Error:", error);
    res.json({ success: false, message: "Error processing video" });
  }
});

// newly added
// api for saving tl in db, and updating user's points

app.post("/api/new-tl", async (req, res) => {
  try {
    const { videoId, tl, userId } = req.body;

    const video = await Video.findOne({ videoId: videoId });
    if (!video) {
      return res.json({ success: false, message: "Error finding video" });
    }

    if (!video.tlExists) {
      video.tlExists = true;
      video.tl = tl;
      const savedVideo = await video.save();

      const videoLength = Math.round(savedVideo.length);

      const user = await User.findByIdAndUpdate(
        userId,
        {
          $inc: { points: videoLength },
          $addToSet: { translations: video },
        },
        { new: true }
      );
    } else {
      return res.json({ success: false, message: "TL already exists" });
    }

    if (!user) {
      return res.json({ success: false, message: "Error finding user" });
    }

    res.json({ success: true, video: video, user: user });
  } catch (err) {
    console.error(err);
    res.json({ success: false, message: "An error occurred" });
  }
});

app.post("/api/unlock-video", async (req, res) => {
  try {
    const { videoId, userId } = req.body;
    const video = await Video.findOne({ videoId: videoId });
    if (!video) {
      return res.json({
        success: false,
        message: "Error finding video",
      });
    }

    const cost = Math.round(video.length / 10);

    const user = await User.findById(userId);
    if (!user) {
      return res.json({ success: false, message: "Error finding user" });
    }
    if (user.points < cost) {
      return res.json({ success: false, message: "Insufficient points" });
    }
    if (user.unlockedVideos.includes(videoId)) {
      return res.json({ success: false, message: "Video already unlocked" });
    }
    if (user.translations.includes(videoId)) {
      return res.json({ success: false, message: "Video already unlocked" });
    }
    user.points -= cost;
    user.unlockedVideos.push(video);
    const savedUser = await user.save();
    res.json({ success: true, user: savedUser });
  } catch (error) {
    console.error(err);
    res.json({ success: false, message: "An error occurred" });
  }
});

app.get("/api/list-videos/:userId", async (req, res) => {
  try {
    const userId = req.params.userId;

    const user = await User.findById(userId);
    if (!user) {
      return res.json({ success: false, message: "Error finding user" });
    }
    return res.json({
      success: true,
      unlocked: user.unlockedVideos,
      translated: user.translations,
    });
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: "An error occurred" });
  }
});
