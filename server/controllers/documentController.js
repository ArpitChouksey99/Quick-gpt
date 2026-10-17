// pdf-parse's index.js runs a debug routine when it isn't loaded via require(),
// which crashes under ESM. Import the inner module directly.
import mongoose from "mongoose"
import pdf from "pdf-parse/lib/pdf-parse.js"
import Chat from "../models/chat.js"
import Document from "../models/document.js"
import { splitPdfText, addChunks, deleteDocumentChunks } from "../utils/rag.js"

export const MAX_FILE_MB = Number(process.env.MAX_PDF_MB) || 4 // Vercel rejects request bodies above ~4.5MB
const MAX_DOCS_PER_CHAT = 5
const MAX_CHUNKS_PER_DOC = 300

// POST /api/document/upload  (multipart: file, chatId)
export const uploadDocument = async (req, res) => {
    try {
        const userId = req.user._id
        const { chatId } = req.body

        if (!req.file) {
            return res.json({ success: false, message: "No file uploaded" })
        }

        const chat = await Chat.findOne({ _id: chatId, userId })
        if (!chat) {
            return res.json({ success: false, message: "Chat not found" })
        }

        // check the real content, not just the declared mime type
        if (req.file.buffer.subarray(0, 5).toString() !== "%PDF-") {
            return res.json({ success: false, message: "Only PDF files are supported" })
        }

        const existing = await Document.countDocuments({ chatId, userId })
        if (existing >= MAX_DOCS_PER_CHAT) {
            return res.json({
                success: false,
                message: `You can attach up to ${MAX_DOCS_PER_CHAT} PDFs per chat`,
            })
        }

        const parsed = await pdf(req.file.buffer)
        const docs = await splitPdfText(parsed.text)

        if (docs.length === 0) {
            return res.json({
                success: false,
                message: "No selectable text found in this PDF (it may be a scanned image)",
            })
        }
        if (docs.length > MAX_CHUNKS_PER_DOC) {
            return res.json({
                success: false,
                message: "This PDF is too long. Please upload a shorter one or split it",
            })
        }

        // multer reads filenames as latin1; convert back so non-ASCII names survive
        const fileName = Buffer.from(req.file.originalname, "latin1").toString("utf8")

        // the id is chosen up front so every chunk can point at its document
        const documentId = new mongoose.Types.ObjectId()

        try {
            await addChunks({ docs, documentId, chatId, userId, fileName })
            const document = await Document.create({
                _id: documentId,
                userId,
                chatId,
                fileName,
                pages: parsed.numpages || 0,
                chunkCount: docs.length,
            })
            res.json({ success: true, document })
        } catch (error) {
            // never leave chunks behind without a document record
            await deleteDocumentChunks(documentId).catch(() => {})
            throw error
        }
    } catch (error) {
        res.json({ success: false, message: error.message })
    }
}

// GET /api/document/list?chatId=...
export const listDocuments = async (req, res) => {
    try {
        const userId = req.user._id
        const { chatId } = req.query
        const documents = await Document.find({ chatId, userId }).sort({ createdAt: 1 })
        res.json({ success: true, documents })
    } catch (error) {
        res.json({ success: false, message: error.message })
    }
}

// POST /api/document/delete  { documentId }
export const deleteDocument = async (req, res) => {
    try {
        const userId = req.user._id
        const { documentId } = req.body

        const document = await Document.findOne({ _id: documentId, userId })
        if (!document) {
            return res.json({ success: false, message: "Document not found" })
        }

        await deleteDocumentChunks(documentId)
        await Document.deleteOne({ _id: documentId })
        res.json({ success: true, message: "Document removed" })
    } catch (error) {
        res.json({ success: false, message: error.message })
    }
}
