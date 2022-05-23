const express = require("express");
const router = express.Router();
const fetchuser = require("../Middleware/fetchuser");
const Notes = require("../Models/Notes");
const { body, validationResult } = require("express-validator");

//ROUTE 1 get all the notes  GET : /api/notes/fetchallnotes   Login Required
router.get("/fetchallnotes", fetchuser, async (req, res) => {
  try {
    const notes = await Notes.find({ user: req.user.id });
    res.json(notes);
  } catch (error) {
    console.log(error);
    res.send(500).send({ error: "Some error Occured" });
  }
});
//ROUTE 2 Add a new note using   POST : /api/notes/addnote   Login Required
router.post(
  "/addnote",
  fetchuser,
  [
    body("title", "Enter a valid title").isLength({ min: 3 }),
    body("description", "Description must be atleast 5 characters").isLength({
      min: 5,
    }),
  ],
  async (req, res) => {
    try {
      const { title, description, tag } = req.body;
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const note = new Notes({
        title,
        description,
        tag,
        user: req.user.id,
      });

      const saveNote = await note.save();
      res.json(saveNote);
    } catch (error) {
      console.log(error);
      res.send(500).send({ error: "Some error Occured" });
    }
  }
);

//ROUTE 3 Update a existing note using   PUT : /api/notes/updatenote   Login Required

router.put("/updatenote/:id", fetchuser, async (req, res) => {
  try {
    //take out the title,  description and tag from textboxes
    const { title, description, tag } = req.body;
    //create a new note
    const newNote = {};

    if (title) {
      newNote.title = title;
    }
    if (description) {
      newNote.description = description;
    }
    if (tag) {
      newNote.tag = tag;
    }

    //find the note to be updated and update it

    //   const note = Notes.findByIdAndUpdate()
    let note = await Notes.findById(req.params.id);

    if (!note) {
      res.status(404).send("Note not found");
    }

    if (note.user.toString() !== req.user.id) {
      return res.status(401).send("Not Allowed"); //Unauthorized access
    }

    note = await Notes.findByIdAndUpdate(
      req.params.id,
      { $set: newNote },
      { new: true }
    );

    res.json(note);
  } catch (error) {
    console.log(error);
    res.send(500).send({ error: "Some error Occured" });
  }
});

//ROUTE 4 Delete a existing note using   DELETE : /api/notes/deletenote   Login Required
router.delete("/deletenote/:id", fetchuser, async (req, res) => {
  try {
    //find the note to be deleted and delete it

    let note = await Notes.findById(req.params.id);

    if (!note) {
      res.status(404).send("Note not found");
    }
    //check if the note belongs to the user using the foreign key
    if (note.user.toString() !== req.user.id) {
      return res.status(401).send("Not Allowed"); //Unauthorized access
    }

    note = await Notes.findByIdAndDelete(req.params.id);
    res.json({ Success: "Note has been deleted", note: note });
  } catch (error) {
    console.log(error);
    res.send(500).send({ error: "Some error Occured" });
  }
});

module.exports = router;
