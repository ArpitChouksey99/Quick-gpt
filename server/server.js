import express from 'express'
import 'dotenv/config'
import cors from 'cors'
import connectDB from './configs/db.js'
import userRouter from './routes/userRoutes.js'
import chatRouter from './routes/chatRoutes.js'
import messageRouter from './routes/messageRoutrs.js'
import creditRouter from './routes/creditRoutes.js'
import documentRouter from './routes/documentRoutes.js'
import { stripeWebhooks } from './controllers/webhook.js'

const app = express()



await connectDB()

//stripe webhooks
app.post('/api/stripe',express.raw({type: 'application/json'}), stripeWebhooks)

app.use(cors())
// app.use(cors({
//     origin: 'http://localhost:5173',  // frontend URL
//     methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
//     allowedHeaders: ['Content-Type', 'Authorization'],
//     credentials: true                 // if using cookies
// }));
app.use(express.json())

app.get('/',(req,res)=>{
    res.send('server is live')
})
app.use('/api/user', userRouter)
app.use('/api/chat', chatRouter)
app.use('/api/message', messageRouter)
app.use('/api/credit', creditRouter)
app.use('/api/document', documentRouter)

const PORT = process.env.PORT || 3000

app.listen(PORT, ()=>{
    console.log(`server is running in ${PORT}`)
})