import mongoose from 'mongoose';

const incomeSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    title: {
        type: String,
        required: true,
        trim: true,
        maxlength: 50
    },
    amount: {
        type: Number,
        required: true
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

const IncomeModel = mongoose.model('Income', incomeSchema);

export default IncomeModel;