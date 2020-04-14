const mongoose = require("mongoose");
const jsonWebToken = require("jsonwebtoken");
const { secretOrKey } = require("../database/keys/keys");

const User = mongoose.model("user");

const auth = async (req, res, next) => {
 

  try {

    const userToken = req.headers.authorization.replace("Bearer ", "");
    const verifiedToken = await jsonWebToken.verify(userToken, secretOrKey);

    const user = await User.findOne({
      _id: verifiedToken._id,
      "tokens.token": userToken,
    });

    if (!user) {
      throw new Error();
    }

    req.user = user;
    req.token = userToken;
    next();
  } catch (e) {
    res.status(401).json({
      error: "not AUthorized !",
    });
  }
};

module.exports = auth;
