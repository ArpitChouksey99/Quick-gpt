import Chat from "../models/chat.js"
import User from "../models/user.js"
import axios from "axios"
import genAI from "../configs/gemini.js";
import imagekit from "../configs/imageKit.js"
import openai from '../configs/openai.js'
import Document from "../models/document.js"
import { buildRagPrompt, retrieveChunks } from "../utils/rag.js"
import { generateText } from "../utils/generate.js"
import { buildHistory, buildContents, buildSearchQuery } from "../utils/history.js"


//text based ai caht msg controller
export const textMessageController = async (req,res)=>{
    console.log("CONTROLLER HIT");
    try{
        const userId = req.user._id

        //check credits
         if(req.user.credits < 1){
            return res.json({success:false, message:"You don't have enough credits to use this feature"})
        }

        const {chatId,prompt} =req.body

        const chat = await Chat.findOne({userId, _id:chatId})

        // memory: earlier messages of this chat, taken before the new one is added
        const history = buildHistory(chat.messages)
        const searchQuery = buildSearchQuery(prompt, chat.messages)

        chat.messages.push({role: "user", content:prompt, timestamp:Date.now(),isImage:false})

        // RAG: if PDFs are attached to this chat, fetch the most relevant excerpts
        let finalPrompt = prompt
        let sources = []
        if (await Document.exists({chatId, userId})) {
            const hits = await retrieveChunks({chatId, userId, query: searchQuery})
            if (hits.length) {
                finalPrompt = buildRagPrompt(prompt, hits)
                sources = [...new Set(hits.map(h => h.fileName))]
            }
        }

//         const {choices} = await openai.chat.completions.create({
// model: "gemini-2.0-flash",
//     messages: [
       
//         {
//             role: "user",
//             content: prompt,
//         },
//     ],
// });

//     const reply = {...choices[0].message, timestamp:Date.now(), isImage:false}  

const response = await generateText(buildContents(history, finalPrompt));

const reply = {
    role: "assistant",
    content: response,
    timestamp: Date.now(),
    isImage: false,
    ...(sources.length && {sources})
};

        res.json({success:true, reply})

    chat.messages.push(reply)
    await chat.save()

    await User.updateOne({_id: userId}, {$inc: {credits:-1}})
    

    }catch (error){

   console.log("FULL ERROR => ", error);

   console.log("STATUS => ", error.status);

   console.log("RESPONSE => ", error.response?.data);

   return res.json({
      success:false,
      message:error.response?.data?.error?.message || error.message
   })
}
    // catch (error){
    //    return res.json({success:false,message: error.message})
    // }
}

// image gen msg controller
export const imageMessageController = async (req,res) => {
    try{
        const userId = req.user._id;

        if(req.user.credits < 2){
            return res.json({success:false, message:"You don't have enough credits to use this feature"})
        }
        const {prompt,chatId,isPublished} = req.body

        const chat = await Chat.findOne({userId, _id: chatId})

        chat.messages.push({
            role: "user", 
            content:prompt, 
            timestamp:Date.now(),
            isImage:false});

            const encodedPrompt = encodeURIComponent(prompt)

            const generatedImageUrl = `${process.env.IMAGEKIT_URL_ENDPOINT}/ik-genimg-prompt-${encodedPrompt}/quickgpt/${Date.now()}.png?tr=w-800,h-800`

            // trigger gen bu fetching from imageKit
            const aiImageResponse = await axios.get(generatedImageUrl,{responseType: "arraybuffer"})

            // Convert to BAse64
            const base64Image = `data:image/png;base64,${Buffer.from(aiImageResponse.data,"binary").toString('base64')})`

            //Upload to Imagekit media library
            const uploadResponse = await imagekit.upload({
                file:base64Image,
                fileName: `${Date.now()}.png`,
                folder: "quickgpt"
            })
            const reply = {
                role: 'assistant',
                content: uploadResponse.url,
                timestamp:Date.now(), 
                isImage:true,
                isPublished
            }   
        res.json({success:true, reply})

        chat.messages.push(reply)
        await chat.save()

        await User.updateOne({_id: userId}, {$inc: {credits:-2}})



    }catch (error){ 
        res.json({success:false, message:error.message})
    }
}