import mongoose from "mongoose";    

const expenseSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    title: {
        type: String,
        required: true,
        trim: true,
        maxlenghth: 50
    },
    amount: {
        type: Number,
        required: true,
        trim: true  
    },
    type: {
        type: String,
        default: 'income'
    },
    date:{
        type: Date,
        required:true
    },
    category:{
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    }
}, {timestamps:true})

const expenseModel = mongoose.model.expense || mongoose.model('expense', expenseSchema);

export default expenseModel;