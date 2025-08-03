import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import connetDB from './config/mongoDB.js';
import userRouter from './routes/userRouter.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;
connetDB()

app.use(express.json());
app.use(cors({
    origin: 'https://expense-trackkerr.netlify.app/', 
  }));
  

// Test endpoint for debugging
app.get('/api/test', (req, res) => {
    res.json({ message: 'Backend server is running!' });
});

app.use('/api/user' , userRouter)

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

