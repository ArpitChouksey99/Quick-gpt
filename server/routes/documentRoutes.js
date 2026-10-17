import express from 'express'
import multer from 'multer'
import { protect } from '../middlewares/auth.js'
import { deleteDocument, listDocuments, uploadDocument, MAX_FILE_MB } from '../controllers/documentController.js'

const documentRouter = express.Router()

const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: MAX_FILE_MB * 1024 * 1024, files: 1 },
})

// run multer ourselves so its errors come back as JSON like the rest of the API
const handleUpload = (req, res, next) => {
    upload.single('file')(req, res, (error) => {
        if (error) {
            const message = error.code === 'LIMIT_FILE_SIZE'
                ? `File is too large (max ${MAX_FILE_MB}MB)`
                : error.message
            return res.json({ success: false, message })
        }
        next()
    })
}

documentRouter.post('/upload', protect, handleUpload, uploadDocument)
documentRouter.get('/list', protect, listDocuments)
documentRouter.post('/delete', protect, deleteDocument)

export default documentRouter
