import mongoose from "mongoose";

const transactionSchema =   new mongoose.Schema({
    userId: {type: mongoose.Schema.Types.ObjectId, ref:"User"},
    planId: {type: String, required:true},
    amounts: {type: Number, required:true},
    credits: {type: Number, required:true},
    isPaid: {type: Boolean, default:false},
},{timestamps: true})

const Transaction = mongoose.model('Transaction', transactionSchema);

export default Transaction;