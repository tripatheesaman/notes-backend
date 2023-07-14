const User = require("../models/users");
const Note = require("../models/notes");

// @desc GET ALL NOTES
// @action GET /
// @access private
const getAllNotes = async (req, res) => {
  const notes = await Note.find().lean();
  if (!notes) {
    return res.status(400).json({ message: "No notes exist!" });
  }
  const notesWithUser = await Promise.all(
    notes.map(async (note) => {
      const user = await User.findById(note.user).lean().exec();
      return { ...note, username: user.username };
    })
  );

  res.json(notesWithUser);
};

// @desc CREATE A NOTE
// @action POST /
// @access private
const createNote = async (req, res) => {
  const { user, title, text } = req.body;
  if (!user || !title || !text) {
    return res.status(400).json({ message: "All fields are required" });
  }
  const duplicate = await Note.findOne({ title }).lean().exec();
  if (duplicate) {
    return res.status(409).json({ message: "Duplicate title" });
  }
  const note = await Note.create({ user, title, text });
  if (note) {
    return res
      .status(201)
      .json({ message: `Note for user created successfully` });
  } else {
    return res.status(400).json({ message: "Invalid note data received" });
  }
};

// @desc UPDATE A NOTE
// @action PATCH /
// @access private
const updateNote = async (req, res) => {
  const { id, user, title, text, completed } = req.body;
  if ((!user, !id, !title, !text, typeof completed !== "boolean")) {
    return res.status(400).json({ message: "All fields are required" });
  }

  const note = await Note.findById(id).exec();
  if (!note) {
    return res.status(400).json({ message: "Note not found" });
  }
  const duplicate = await Note.findOne({ title }).lean().exec();
  if (duplicate && duplicate?._id.toString() !== id) {
    return res.status(409).json({ message: "Duplicate note title" });
  }

  note.user = user;
  note.title = title;
  note.text = text;
  note.completed = completed;

  const updatedNote = note.save();
  if (updatedNote) {
    return res.status(200).json({
      message: `Note for user ${updatedNote.user} with title ${updatedNote.title} updated successfully`,
    });
  } else {
    return res.status(400).json({ message: "Invalid note data received" });
  }
};

// @desc DELETE A NOTE
// @action GET /
// @access private
const deleteNote = async (req, res) => {
  const { id } = req.body;
  if (!id) {
    return res.status(400).json({ message: "ID is required!" });
  }
  const note = await Note.findById(id).exec();
  if (!note) {
    return res.status(400).json({ message: "Note not found" });
  }
  result = await note.deleteOne();
  return res.status(200).json({
    message: `Note with id ${result.id} and title ${result.title} deleted`,
  });
};
module.exports = {
  getAllNotes,
  createNote,
  updateNote,
  deleteNote,
};
