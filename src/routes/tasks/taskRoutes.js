//import the dependencies
const express = require("express");
const mongoose = require("mongoose");
const router = express.Router();

//import Middelwares
const authMiddleWare = require("../../middlewares/auth");

//import mongoose models
const Task = mongoose.model("task");

//PATH : /task/test
//ACCESS : public
//DEF : tests the tasks route
router.get("/test", (req, res) => {
  res.json({
    test: "tasks route Test",
  });
});

//PATH : /task/add
//ACCESS : private
//DEF : adds a new task under a user
router.post("/add", authMiddleWare, (req, res) => {
  const mustRequire = ["title"];
  const reqKeys = Object.keys(req.body);

  if (!mustRequire.every((key) => reqKeys.includes(key))) {
    res.status(400).json({
      error: "all fields must be provided",
    });
    return;
  }

  const newTask = new Task({
    title: req.body.title,
    owner: req.user._id,
  });

  if (req.body.completed) {
    newTask.completed = req.body.completed;
  }

  newTask
    .save()
    .then((data) => {
      res.status(201).json({task : data});
    })
    .catch((e) => {
      res.status(500).json({ error: "coud not create new task" });
    });
});

//PATH : /task/mytasks
//ACCESS : private
//DEF : returns all the tasks of currently loggedin user
//QUERIES : /tasks/mytasks/?limit:{num}&skip:{num}&completed:1
router.get("/mytasks", authMiddleWare, async (req, res) => {
  const limit = parseInt(req.query.limit);
  const skip = parseInt(req.query.skip);

  const filter = {};

  if (req.query.completed) {
    filter.completed = req.query.completed === "true";
  }

  const sort = {};

  if (req.query.sort) {
    const sortStr = req.query.sort;

    if (sortStr.includes("completed:")) {
      const completedIndex = sortStr.indexOf("completed:");
      const completedNum = sortStr.substr(completedIndex + 10, 1);

      sort.completed = completedNum == 1 ? 1 : -1;
    }

    if (sortStr.includes("created:")) {
      const createdIndex = sortStr.indexOf("created:");
      const createdNum = sortStr.substr(createdIndex + 8, 1);

      sort.createdAt = createdNum == 1 ? 1 : -1;
    }
  }


  const tasks = await Task.getUserTasks(
    req.user._id,
    limit,
    skip,
    filter,
    sort
  );
  res.json({tasks});
});

router.delete("/deleteTask", authMiddleWare, async (req, res) => {
  const taskToDel = await Task.findOne({
    _id: req.body.id,
    owner: req.user._id,
  });

  if (!taskToDel) {
    res.status(500).json({
      error: "unable to delete task",
    });

    return;
  }

  taskToDel.remove();
  res.json({
    message: "success",
  });
});

//PATH : /task/togglecomplete
//ACCESS : private
//DEF : toggles the status of "completed" field in task
router.patch("/togglecomplete", authMiddleWare, async (req, res) => {
  const taskToPatch = await Task.findOne({
    _id: req.body.id,
    owner: req.user._id,
  });

  if (!taskToPatch) {
    res.status(500).json({
      error: "unable to Modify task",
    });

    return;
  }

  taskToPatch.completed = !taskToPatch.completed;

  taskToPatch
    .save()
    .then((data) => {
      res.json(data);
    })
    .catch((err) => {
      res.status(500).json(err);
    });
});

//PATH : /task/edit
//ACCESS : private
//DEF : edit the title of the task
router.patch("/edit", authMiddleWare, async (req, res) => {
  if (!req.body.title || !req.body.id) {
    res.status(400).json({
      error: "must provide a new title with id",
    });
    return;
  }

  const taskToPatch = await Task.findOne({
    _id: req.body.id,
    owner: req.user._id,
  });

  if (!taskToPatch) {
    res.status(500).json({
      error: "unable to Modify task",
    });

    return;
  }

  taskToPatch.title = req.body.title;

  taskToPatch
    .save()
    .then((data) => {
      res.json(data);
    })
    .catch((err) => {
      res.status(500).json(err);
    });
});

module.exports = router;
