const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(
  cors({
    origin: ["http://localhost:5173"],
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    credentials: true,
  })
);



const userAuth = require("./routes/auth");
app.use("/user/auth", userAuth);
const students = require("./routes/student");
app.use("/students", students);
const attendance = require("./routes/attendence");
app.use("/attendence", attendance);

mongoose
  .connect(process.env.DB_CONNECTOR)
  .then(() => console.log("DB_Connected"))
  .catch((err) => {
    console.log("Error in DB_Connection");
    console.error(err);
  });

app.use("/",(req,res)=>{
  res.send("Hello");
})

app.listen(3000, () => {
  console.log("Server is runnong on port 3000");
});

module.exports = app;
