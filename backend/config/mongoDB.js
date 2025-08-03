import mongoose from 'mongoose';

const connetDB = async () => {
    mongoose.connection.on('connected', () => console.log('MongoDB connected successfully'));
    await mongoose.connect(`${process.env.MONGO_URI}/expenseTracker`)
}

export default connetDB