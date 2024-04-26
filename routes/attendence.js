const express = require("express");
const router = express.Router();
const { Attendence, Student } = require("../database/models");

router.get("/get", async (req, res) => {
  try {
    const filters = req.query;
    const attendence = await Attendence.findOne({
      date: filters.date,
      admin: filters.admin,
    });

    const newFilters = { ...filters };
    delete newFilters.date;
    delete newFilters.admin;

    console.log(newFilters);

    const students = await Student.find(newFilters);
    const allStudents = students.map((student) => student.regNo);

    console.log(allStudents);

    if (!attendence) {
      console.log("no att");
      res.status(200).json({
        attendenceData: {
          date: filters.date,
          present: [],
          absent: [],
        },
        allStudents,
      });
      return;
    }

    const presentStudents = attendence.present.filter((st) =>
      allStudents.includes(st)
    );
    const absentStudents = attendence.absent.filter((st) =>
      allStudents.includes(st)
    );

    const filteredAttendence = {
      ...attendence.toObject(),
      present: presentStudents,
      absent: absentStudents,
    };

    res.status(200).json({ attendenceData: filteredAttendence, allStudents });
  } catch (err) {
    console.error("Failed to fetch attendance:", err);
    res.status(500).json({ msg: "Database error" });
  }
});

// router.put("/post", async (req, res) => {
//   console.log(req.body);
//   const { present, absent } = req.body;
//   const date = new Date(req.body.date);
//   const admin = req.body.admin;
//   console.log(req.body);
//   console.log("Received request for date:", date);
//   try {
//     let abRes;
//     let prRes;
//     const attendence = await Attendence.findOne({ date, admin });
//     if (attendence) {
//       console.log(present);
//       console.log(absent);
//       attendence.present = attendence.present.filter(
//         (item) => ![...present, ...absent].includes(item)
//       );
//       attendence.absent = attendence.absent.filter(
//         (item) => ![...present, ...absent].includes(item)
//       );
//       attendence.present = [...attendence.present, ...present];
//       attendence.absent = [...attendence.absent, ...absent];
//       console.log(attendence);
//       const promises = [];
//       present.forEach(async (st) => {
//         const updatedResp = await Student.findOne({ regNo: st });
//         updatedResp.attend = updatedResp.attend.filter(
//           (day) => day.date.getTime() !== date.getTime() && day.admin !== admin
//         );
//         updatedResp.absent = updatedResp.absent.filter(
//           (day) => day.date.getTime() !== date.getTime() && day.admin !== admin
//         );
//         updatedResp.attend.push({ date, admin });
//         promises.push(updatedResp.save());
//       });
//       absent.forEach(async (st) => {
//         const updatedResp = await Student.findOne({ regNo: st });
//         updatedResp.attend = updatedResp.attend.filter(
//           (day) => day.date.getTime() !== date.getTime() && day.admin !== admin
//         );
//         updatedResp.absent = updatedResp.absent.filter(
//           (day) => day.date.getTime() !== date.getTime() && day.admin !== admin
//         );
//         updatedResp.absent.push({ date, admin });
//         promises.push(updatedResp.save());
//       });
//       await Promise.all(promises);
//       await attendence.save();
//     } else {
//       const newAttendence = new Attendence({
//         admin,
//         date,
//         present,
//         absent,
//       });
//       const promises = [];
//       present.forEach(async (st) => {
//         const updatedResp = await Student.findOne({ regNo: st });
//         updatedResp.attend = updatedResp.attend.filter(
//           (day) => day.date.getTime() !== date.getTime() && day.admin !== admin
//         );
//         updatedResp.absent = updatedResp.absent.filter(
//           (day) => day.date.getTime() !== date.getTime() && day.admin !== admin
//         );
//         updatedResp.attend.push({ date, admin });
//         promises.push(updatedResp.save());
//       });
//       absent.forEach(async (st) => {
//         const updatedResp = await Student.findOne({ regNo: st });
//         updatedResp.attend = updatedResp.attend.filter(
//           (day) => day.date.getTime() !== date.getTime() && day.admin !== admin
//         );
//         updatedResp.absent = updatedResp.absent.filter(
//           (day) => day.date.getTime() !== date.getTime() && day.admin !== admin
//         );
//         updatedResp.absent.push({ date, admin });
//         promises.push(updatedResp.save());
//       });
//       promises.push(newAttendence.save());
//       await Promise.all(promises);
//     }
//     console.log("Response sent successfully");
//     res.status(200).json({ msg: "Success" });
//   } catch (err) {
//     console.error("Error:", err);
//     res.status(500).json({ msg: "Database error" });
//   }
// });


router.put("/post", async (req, res) => {
  try {
    const { present, absent, date, admin } = req.body;
    
    // Convert date string to Date object
    const attendanceDate = new Date(date);
    
    // Update or create attendance record
    let attendance = await Attendence.findOneAndUpdate(
      { date: attendanceDate, admin: admin },
      { $set: { present: present, absent: absent } },
      { upsert: true, new: true }
    );

    // Update student records
    const promises = [];
    const studentsToUpdate = [...present, ...absent];
    for (const student of studentsToUpdate) {
      const updatedStudent = await Student.findOneAndUpdate(
        { regNo: student },
        {
          $pull: { attend: { date: attendanceDate, admin: admin } },
          $push: {
            attend: { date: attendanceDate, admin: admin },
            absent: { date: attendanceDate, admin: admin },
          },
        },
        { upsert: true, new: true }
      );
      promises.push(updatedStudent.save());
    }
    await Promise.all(promises);

    console.log("Attendance updated successfully");
    res.status(200).json({ msg: "Success" });
  } catch (error) {
    console.error("Error submitting attendance:", error);
    res.status(500).json({ msg: "Database error" });
  }
});








module.exports = router;
