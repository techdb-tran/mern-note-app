import * as NotesController from "../controllers/notes";
import express from "express";
const router = express.Router() // Định nghĩa các tuyến đường và gắn kết các hàm xử lý với chúng.
router.get("/", NotesController.getNotes);
router.get("/:noteId", NotesController.getNote);
router.post("/", NotesController.createNote);
router.patch("/:noteId", NotesController.updateNote);
router.delete("/:noteId", NotesController.deleteNote);
export default router;