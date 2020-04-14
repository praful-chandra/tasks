// import dependencies
const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");

//importing middlewares
const authMiddleWare = require("../../middlewares/auth");

//importing Mongoose models
const User = mongoose.model("user");


//PATH : /auth/user/test
//ACCESS : public
//DEF : tests the user auth route
router.get("/test", (req, res) => {
  res.json({
    test: "userAuth Test",
  });
});


//PATH : /auth/user/signup
//ACCESS : public
//DEF : creates a new user 
router.post("/signup", async (req, res) => {
  const mustRequire = ["name", "email", "password"];
  const reqKeys = Object.keys(req.body);

  if (!mustRequire.every((key) => reqKeys.includes(key))) {
    res.status(400).json({
      error: "all fields must be provided",
    });
    return;
  }

  const oldUser = await User.find({ email: req.body.email });

  if (oldUser.length > 0) {
    res.status(400).json({
      error: "email already exist",
    });
    return;
  }
  const newUser = new User({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
  });

  newUser
    .save()
    .then( async (usr) => {
        const token =  await newUser.genToken();

      res.json({
          user : usr,
          token 
      });
    })
    .catch((err) => {
      res.status(400).json({
        error: err.message,
      });
    });
});

//PATH : /auth/user/login
//ACCESS : public
//DEF : log's in User
router.post("/login", (req, res) => {
 const mustRequire = ['email' , 'password'];
 const reqKeys = Object.keys(req.body);

 if(!mustRequire.every(key=>reqKeys.includes(key))){

    res.status(400).json({
        error: "all fields must be provided",
      });
      return;

 }

  User.findUserByCredentials(req.body.email, req.body.password)
    .then(async(data) => {
    const token = await  data.genToken();
    res.json({
        user : data,
        token
    })
    })
    .catch((err) => {
      res.json({error : err.message});
    });
});

//PATH : /auth/user/validateuser
//ACCESS : private
//DEF : returns user information if token is valid
router.post("/validateUser",authMiddleWare,(req,res)=>{
    
    res.json(req.user)
})

//PATH : /auth/user/logout
//ACCESS : private
//DEF : logsout the user from currently logged in system
router.post("/logout",authMiddleWare,(req,res)=>{
    const token = req.token;
    const user = req.user;
    User.findOneAndUpdate({_id : user._id},{$pull : {
        tokens : {
            token 
        }
    }}).then(()=>{
        res.json({message : "bye"})
    }).catch(e=>{
        res.status(500).json({message : "error logging out"})
    })
})


//PATH : /auth/user/logoutall
//ACCESS : private
//DEF : logsout the user from all logged in systems
router.post("/logoutall",authMiddleWare,(req,res)=>{
    const user = req.user;

    User.findOneAndUpdate({_id : user._id},{$set:{tokens : []}}).then(()=>{
        res.json({message : "bye"})
    }).catch(e=>{
        res.status(500).json({message : "error logging out"})
    })

});

//PATH : /auth/user/deleteme
//ACCESS : private
//DEF : Removes the currently loggedin User
router.delete("/deleteMe",authMiddleWare,async(req,res)=>{


    req.user.remove();

    res.json({message : "success"})

    // User.findByIdAndDelete(req.user._id).then((data)=>{
    //     res.json(data);
    // }).catch(err=>{
    //     res.status(500).json({
    //         error : err
    //     })
    // })

})

module.exports = router;
