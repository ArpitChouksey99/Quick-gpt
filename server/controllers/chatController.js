

//api contoller for creating a new  chat

import Chat from "../models/chat.js"
import Document from "../models/document.js"
import { deleteChatChunks } from "../utils/rag.js"

export const createChat = async (req,res) => {
    try{
        const userId = req.user._id

        const chatData = {
            userId,
            messages:[],
            name:"New Chat",
            userName: req.user.name
        }

        await Chat.create(chatData)
        res.json({success: true, message: "Chat created"})
    }catch(error){
        res.json({success:false, message: error.message})
    }
}

//api to get all chat
export const getChats = async (req,res) => {
    try{
        const userId = req.user._id
        const chats = await Chat.find({userId}).sort({updatedAt:-1})

        
        res.json({success: true, chats})
    }catch(error){
        res.json({success:false, message: error.message})
    }
}

//api to delete chat
export const deleteChat = async (req,res) => {
    try{
        const userId = req.user._id
        const {chatId} = req.body

        await Chat.deleteOne({_id:chatId, userId})
        // remove any PDFs (and their embeddings) attached to this chat
        await deleteChatChunks({chatId, userId})
        await Document.deleteMany({chatId, userId})

        res.json({success: true, message:"Chat Deleted"})
    }catch(error){
        res.json({success:false, message: error.message})
    }
}