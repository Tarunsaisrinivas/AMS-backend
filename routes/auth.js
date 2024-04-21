const express = require("express");
const router = express.Router();
const { User } = require("../database/models");

router.post("/sign-in", (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400).json({ message: "missing required fields" });
    return;
  }

  User.findOne({ email })
    .then((usr) => {
      if (usr) {
        if (usr.password === password) {
          res.status(200).json({ name: usr.name, email: usr.email });
        } else {
          res.status(401).json({ message: "Wrong Password" });
        }
      } else {
        res.status(401).json({ message: "Invalid user name" });
      }
    })
    .catch((err) => {
      console.log("Error occured");
      console.error(err);
      res.status(500).json({ message: "Internal server Error" });
    });
});

router.post("/sign-up", (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    res.status(400).json({ message: "missing required fields" });
    return;
  }

  const newUser = new User({
    name,
    email,
    password,
  });

  newUser
    .save()
    .then(() => {
      res.status(201).json({ message: "User authenticated" });
    })
    .catch((error) => {
      if (error.message.includes("duplicate key error"))
        res.status(409).json({ message: "Email already exist" });
      else {
        res.json(500).json({ message: "DataBase Error" });
        console.log("Error occured when creating new User");
        console.error(err);
      }
    });
});

router.get("/validate-user/:email", (req, res) => {
  const { email } = req.params;
  console.log(email);
  User.findOne({ email: email })
    .then((resp) => {
      if (resp) res.status(200).json({ stat: true, name: resp.name });
      else res.status(200).json({ stat: false });
    })
    .catch((err) => {
      res.status(500).json({ message: "Error in fetching data" });
    });
});

module.exports = router;
