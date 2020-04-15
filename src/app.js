//call database connection
require("./database/db");


// import dependencies
const express = require("express");

//imstantiate express
const app = express();




app.use(express.json());

//import Custom ROutes
const userAuthRoute = require("./routes/auth/userAuth");
const tasksRoute = require("./routes/tasks/taskRoutes");
const UserRoute = require("./routes/user/user");



app.get("/", (req, res) => {
  res.json({
    message: "Welcome to tasks app",
  });
});


// Route Custom ROutes
app.use("/auth/user", userAuthRoute);
app.use("/task",tasksRoute);
app.use("/user",UserRoute);


module.exports = app;