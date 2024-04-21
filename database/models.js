const mongoose = require("mongoose");

const userSchema = mongoose.Schema({
  email: String,
  name: String,
  password: String,
});

const User = mongoose.model("user", userSchema);

const studentSchema = mongoose.Schema({
  regNo: {
    type: String,
    unique: true,
  },
  year: Number,
  branch: String,
  section: String,
  attend: [{ date: { type: Date }, admin: { type: String } }], // Define the attend array to contain Date objects
  absent: [{ date: { type: Date }, admin: { type: String } }], // Define the absent array to contain Date objects
});

const Student = mongoose.model("student", studentSchema);

const attendenceSchema = mongoose.Schema({
  date: {
    type: Date,
    unique: true,
    require: true,
  },
  admin: String,
  present: [String],
  absent: [String],
});

const Attendence = mongoose.model("attendence", attendenceSchema);

module.exports = { User, Student, Attendence };
