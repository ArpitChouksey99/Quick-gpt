import mongoose from "mongoose";

const documentSchema = new mongoose.Schema({
    userId: {type: String, ref: 'User', required: true},
    chatId: {type: mongoose.Schema.Types.ObjectId, ref: 'Chat', required: true},
    fileName: {type: String, required: true},
    pages: {type: Number, default: 0},
    chunkCount: {type: Number, required: true},
}, {timestamps: true})

documentSchema.index({chatId: 1, userId: 1})

const Document = mongoose.model('Document', documentSchema)

export default Document;
