import express from 'express';
import { register, login } from '../controllers/userController.js';
import { addIncome, updateIncome, deleteIncome, getIncome } from '../controllers/incomeController.js';
import authMiddleware from '../middlewares/authMiddleware.js';
import { addExpense, deleteExpense, getExpense, updateExpense } from '../controllers/expenseController.js';


const userRouter = express.Router();

userRouter.post('/register', register);
userRouter.post('/login', login);

userRouter.post('/add-income', authMiddleware, addIncome);
userRouter.put('/update-income/:id', authMiddleware, updateIncome);
userRouter.delete('/delete-income/:id', authMiddleware, deleteIncome);
userRouter.get('/get-income', authMiddleware, getIncome);

userRouter.post('/add-expense', authMiddleware, addExpense);
userRouter.put('/update-expense/:id', authMiddleware, updateExpense);
userRouter.delete('/delete-expense/:id', authMiddleware, deleteExpense);
userRouter.get('/get-expense', authMiddleware, getExpense);

export default userRouter;