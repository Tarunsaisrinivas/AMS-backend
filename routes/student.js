const express = require("express");
const router = express.Router();

const { Student } = require("../database/models.js");

router.post("/add-students", async (req, res) => {
  const { students } = req.body;

  try {
    const existingStudents = await Student.find({
      regNo: { $in: students.map((student) => student.regNo) },
    });

    const newStudents = students.filter(
      (student) =>
        !existingStudents.some(
          (existingStudent) => existingStudent.regNo === student.regNo
        )
    );

    const insertedStudents = await Student.insertMany(newStudents);

    if (insertedStudents.length === students.length) {
      res.status(201).json({ msg: "Students saved successfully" });
    } else if (insertedStudents.length === 0) {
      const duplicateStudents = students.filter((student) =>
        existingStudents.some(
          (existingStudent) => existingStudent.regNo === student.regNo
        )
      );
      res.status(406).json({
        msg: "All the students already exist",
        unSaved: duplicateStudents,
      });
    } else {
      const duplicateStudents = students.filter((student) =>
        existingStudents.some(
          (existingStudent) => existingStudent.regNo === student.regNo
        )
      );
      res.status(206).json({
        msg: "Partial success, some students were not inserted due to duplicate regNo",
        unSaved: duplicateStudents,
      });
    }
  } catch (err) {
    console.error("Error inserting students:", err);
    res.status(500).json({ msg: "Database error" });
  }
});

router.get("/get-students", (req, res) => {
  const filter = req.query;
  Student.find(filter)
    .then((students) => {
      res.status(200).json({ students });
    })
    .catch((err) => {
      console.log("Error in fetching students");
      console.log(err);
      res.status(500).json({ msg: "data base error" });
    });
});

router.get("/student-info/:regNo", (req, res) => {
  const { regNo } = req.params;
  Student.findOne({ regNo })
    .then((info) => {
      if (info) {
        res
          .status(200)
          .json({ message: "detailes fetched success", details: info });
      } else {
        res.status(400).json({ message: "Student not found" });
      }
    })
    .catch((err) => {
      console.error(err);
      res.status(500).json({ message: "Internal server error" });
    });
});

module.exports = router;
