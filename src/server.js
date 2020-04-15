//import App
const app = require("./app");

//set PORT
const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`listening on port : ${PORT}`);
});