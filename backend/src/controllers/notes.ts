import { RequestHandler } from "express";
import NoteModel from "../models/note"
import createHttpError from "http-errors";
import mongoose from "mongoose";
import { assertIsDefined } from "../util/assertIsDefined";
//Middleware xử lý yêu cầu GET đến đường dẫn gốc
export const getNotes: RequestHandler = async (req, res, next) => {
    const authenticatedUserId = req.session.userId;

    try {
        assertIsDefined(authenticatedUserId);
        //throw createHttpError(401);
        const notes = await NoteModel.find({userId: authenticatedUserId}).exec();
        // Cố gắng lấy ra tất cả các ghi chú từ csdl thông qua: NoteModel.find().exec()
        res.status(200).json(notes);
       // console.log(notes);
        //Nếu ko có lỗi nó phản hồi JSON chứa danh sách các ghi chú.
    } catch (error) {
        //Nếu có lỗi thì nó chuyển giao cho middleware tiếp theo
        next(error);
    }
}
export const getNote: RequestHandler = async (req, res, next) => {
    const noteId = req.params.noteId;
    const authenticatedUserId = req.session.userId;
    try {
        assertIsDefined(authenticatedUserId);
        if (!mongoose.isValidObjectId(noteId)) {
            throw createHttpError(400, "Invalid note id");
        }
        const note = await NoteModel.findById(noteId).exec();
        if (!note) {
            throw createHttpError(404, "Note not found");
        }
        if(!note.userId.equals(authenticatedUserId)){
            throw createHttpError(401,"You cannot access this note")
        }
        res.status(200).json(note);
    } catch (error) {
        next(error);
    }
};
interface CreateNoteBody {
    title?: string,
    text?: string,
}
//?: dấu hỏi biểu thị nội dung cung cấp có thể là tùy chọn.
//Middleware xử lý yêu cầu POST đến đường dẫn gốc
export const createNote: RequestHandler<unknown, unknown, CreateNoteBody, unknown> = async (req, res, next) => {
    const title = req.body.title;
    const text = req.body.text;
    const authenticatedUserId = req.session.userId;
    //Nó cố gắng trích xuất title và text từ req.body
    // Then, tạo ghi chú mới trong csdl.
    try {
        assertIsDefined(authenticatedUserId);
        if (!title) {
            throw createHttpError(400, "Note must have a title")
        }
        const newNote = await NoteModel.create({
            userId: authenticatedUserId,
            title: title,
            text: text,
        });
        res.status(201).json(newNote);
    } catch (error) {
        next(error);
    }
}
interface UpdateNoteParams {
    noteId: string,
}
interface UpdateNoteBody {
    title?: string,
    text?: string,
}
export const updateNote: RequestHandler<UpdateNoteParams, unknown, UpdateNoteBody, unknown> = async (req, res, next) => {
    const noteId = req.params.noteId;
    const newTitle = req.body.title;
    const newText = req.body.text;
    const authenticatedUserId = req.session.userId;
    try {
        assertIsDefined(authenticatedUserId);
        if(!mongoose.isValidObjectId(noteId)){
            throw createHttpError(400,"Invalid note id")
        }
        if(!newTitle){
            throw createHttpError(400,"Note must have a title")
        }
        const note = await NoteModel.findById(noteId).exec();
        if (!note) {
            throw createHttpError(404, "Note not found");
        }
        if(!note.userId.equals(authenticatedUserId)){
            throw createHttpError(401,"You cannot access this note")
        }
        note.title = newTitle;
        note.text = newText;
        const updatedNote = await note.save();
        res.status(200).json(updatedNote);
    } catch (error) {
        next(error);
    }
}
interface DeleteNoteParams {
    noteId: string,
}
export const deleteNote: RequestHandler<DeleteNoteParams, unknown, unknown, unknown> = async (req, res, next) => {
    const noteId = req.params.noteId;
    const authenticatedUserId = req.session.userId;
    try {
        assertIsDefined(authenticatedUserId);

        if(!mongoose.isValidObjectId(noteId)){
            throw createHttpError(400,"Invalid note id")
        }
        const note = await NoteModel.findById(noteId).exec();
        if (!note) {
            throw createHttpError(404, "Note not found");
        }
        if(!note.userId.equals(authenticatedUserId)){
            throw createHttpError(401,"You cannot access this note")
        }
        await note.deleteOne();
        res.sendStatus(204);
    } catch (error) {
        next(error);
    }
}