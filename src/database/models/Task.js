const mongoose = require("mongoose");

const TaskSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  owner: {
    type: mongoose.Types.ObjectId,
    required: true,
  },
  completed: {
    type: Boolean,
    default: false,
  },
},{
    timestamps : true
});

//returns userTasks based upon matching ID
TaskSchema.statics.getUserTasks = async function (userId, limit, skip, filter,sort) {
  return await Tasks.find({ owner: userId, ...filter })
    .limit(limit)
    .skip(skip)
    .sort(sort);
};

const Tasks = mongoose.model("task", TaskSchema);
module.exports = Tasks;
