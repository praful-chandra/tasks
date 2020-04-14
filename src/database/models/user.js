const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");
const jsonWebToen = require("jsonwebtoken");
const { secretOrKey } = require("../keys/keys");

const Task = require("./Task");

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    validate: {
      validator: (val) => {
        if (!validator.isEmail(val)) {
          throw new Error("email is inValid");
        }
      },
    },
  },
  password: {
    type: String,
    required: true,
    minlength: 6,
  },

  tokens: [
    {
      token: {
        type: String,
        required: true,
      },
    },
  ],
  avatar:{
    type : Buffer
  }
});

//Hashes the password and saves it to the user
UserSchema.pre("save", async function (next) {
  const user = this;

  if (user.isModified("password")) {
    user.password = await bcrypt.hash(user.password, 8);
  }
  next();
});

//Returns the user details if token is valid
UserSchema.statics.findUserByCredentials = async (email, password) => {
  const existingUser = await User.findOne({ email });

  if (!existingUser) {
    throw new Error("Invalid credentials");
  }

  const isMatch = await bcrypt.compare(password, existingUser.password);

  if (!isMatch) {
    throw new Error("Invalid credentials");
  }

  return existingUser;
};

//generates a new token and saves it in user.tokens
UserSchema.methods.genToken = async function () {
  const token = await jsonWebToen.sign({ _id: this._id }, secretOrKey, {
    expiresIn: "7 days",
  });
  this.tokens = this.tokens.concat({ token });
  this.save();
  return token;
};

//removes critical information before converting it to JSON and sending back to user
UserSchema.methods.toJSON = function () {
  const user = this.toObject();

  delete user.tokens;
  delete user.password;
  delete user.avatar;
  
  return user;
};

//removes all the user's Tasks when the user is removed
UserSchema.pre("remove", async function (next) {
  await Task.deleteMany({ owner: this._id });

  next();
});

const User = mongoose.model("user", UserSchema);

module.exports = User;
