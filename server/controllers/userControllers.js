import User from "../models/user.js";
import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs';
import Chat from "../models/chat.js";


//genreate jwt
const genreateToken = (id)=>{
    return jwt.sign({id}, process.env.JWT_SECRET,{
        expiresIn: '30d'
    })
}


//api to register user
export const registerUser = async (req,res) => {
    const { name, email, password} = req.body;

    try{
        const userExists = await User.findOne({email})
        if(userExists){
            return res.json({success: false, message:"User already eists"})
        }
        const user = await User.create({name, email, password})

        const token = genreateToken(user._id)
        res.json({success:true,token})
    }catch (error){
       return res.json({success:false,message: error.message})
    }
}

//api to login user
export const loginUser = async (req,res) => {
    const { email, password} = req.body;
    try{
        const user = await User.findOne({email})
        if(user){
            const isMatch = await bcrypt.compare(password, user.password)

            if(isMatch){
                const token = genreateToken(user._id)
                return res.json({success:true,token})
            }
        }
        return res.json({success:false, message:"Invalid email or password"})
    }catch(error){
       return res.json({success:false,message: error.message})

    }
}

//Api to get user data
export const getUser = async (req,res) => {
    try{
        const user = req.user;
        return res.json({success:true, user})
    }catch(error){
       return res.json({success:false,message: error.message})

    }
}

//api to get published images
export const getPublishedImages = async (req,res) =>{

    try{
        const publishedImageMessage = await Chat.aggregate([
            {$unwind: "$messages"},
            {
                $match: {
                    "messages.isImage": true,
                    "messages.isPublished":true
                }
            },
            {
                $project: {
                    _id: 0,
                    imageUrl: "$messages.content",
                    userName: "$userName"
                }
            }
        ])
       res.json({success: true, images: publishedImageMessage.reverse()})
    }catch (error){
               return res.json({success:false,message: error.message})

    }
}
