const User = require("../models/users");
const Note = require("../models/notes");
const bcrypt = require("bcrypt");

// @desc GET ALL USERS
// @route GET /users
// @access private

const getAllUsers = async (req, res) => {
  const users = await User.find().select("-password").lean();
  if (users && !users.length) {
    return res.status(400).json({ message: "No users found." });
  }
  res.json(users);
};

// @desc CREATE USER
// @route POST /users
// @access private
const createUser = async (req, res) => {
  const { username, password, role } = req.body;
  if (!username || !password || !role) {
    return res.status(400).json({ message: "All fields are required" });
  }
  const duplicate = await User.findOne({ username })
    .collation({ locale: "en", strength: 2 })
    .lean()
    .exec();
  if (duplicate) {
    return res.status(409).json({ message: "Duplicate username" });
  }
  hashedPassword = await bcrypt.hash(password, 10);
  const userObject = { username, password: hashedPassword, role };
  const user = User.create(userObject);
  if (user) {
    return res
      .status(201)
      .json({ message: `New User ${username} successfully created!` });
  } else {
    return res.status(400).json({ message: "Invalid User data received!" });
  }
};
// @desc UPDATE user
// @route PATCH /users
// @access private
const updateUser = async (req, res) => {
  const { id, username, password, role, active } = req.body;
  if ((!id, !username.length, !role, typeof active != "boolean")) {
    return res.status(404).json({ message: "All fields are required" });
  }
  const user = await User.findById(id).exec();
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }
  const duplicate = await User.findOne({ username })
    .collation({ locale: "en", strength: 2 })
    .exec();
  if (duplicate && duplicate?._id.toString() !== id) {
    return res.status(409).json({ message: "Duplicate User" });
  }
  user.username = username;
  user.active = active;
  user.role = role;
  if (password) {
    hashedPassword = await bcrypt.hash(password, 10);
    user.password = hashedPassword;
  }
  const updatedUser = user.save();
  res
    .status(200)
    .json({ messsage: `User ${updatedUser.username} updated succesfully` });
};

// @desc DELETE ALL USERS
// @route DELETE /users
// @access private
const deleteUser = async (req, res) => {
  const { id } = req.body;
  if (!id) {
    res.status(404).json({ message: "Please enter the ID" });
  }
  const note = await Note.findOne({ user: id }).lean().exec();
  if (note) {
    return res.status(400).json({ message: "User has assigned notes" });
  }
  const user = await User.findById(id).exec();
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }
  const result = await user.deleteOne();
  res.status(200).json({
    message: `User with username ${result.username} and ID ${result._id} has been deleted`,
  });
};

module.exports = {
  getAllUsers,
  createUser,
  updateUser,
  deleteUser,
};
