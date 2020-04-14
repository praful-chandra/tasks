// import dependencies
const mongoose = require("mongoose");
const { MongoURI } = require("./keys/keys");

//import models
require("./models/user")
require("./models/Task")


mongoose.connect(
  MongoURI,
  { useCreateIndex: true, useNewUrlParser: true, useUnifiedTopology: true ,useFindAndModify : false},
  (err) => {
      if(err){
        return console.log("can't connect to MongoDB");
        
      }
      console.log("MongoDB connected!");
      
  }
);


