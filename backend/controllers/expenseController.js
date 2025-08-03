import e from "express";
import expenseModel from "../models/expenseSchema.js";

const addExpense = async (req, res) => {
    
    const userId = req.user?.id;

    const { title, amount, income, category, description, date } = req.body;

    const parsedAmount = Number(amount);

    try {

        if (!title  || !category || !description || !date) {
            return res.status(400).json({ success: false, message: "All fields are required" });
        }

        if (isNaN(parsedAmount) || parsedAmount <= 0) {
            return res.status(400).json({ success: false, message: "Invalid amount" });
        }

        const newExpense = new expenseModel({
            userId,
            title,
            amount,
            income,
            category,
            description,
            date
        });

        await newExpense.save();
        
        res.status(200).json({ success: true, message: "Expense added successfully", data: newExpense });

    } catch (error) {
        console.error("Error during registration:", error);
        res.status(500).json({ success:false, message: "Internal server error" });             
    }
}

const deleteExpense = async (req, res) => {
    const {id} = req.params;

    try {
        const deleteExpense = await expenseModel.findOneAndDelete(id);

        if (!deleteExpense) {
            return res.status(404).json({ success: false, message: "Expense not found" });
        }

        res.status(200).json({ success: true, message: "Expense deleted successfully",deleteExpense });

    } catch (error) {
        console.error("Error deleting Expense:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
}

const updateExpense = async (req, res) => {
    const { id } = req.params;
    const { title, amount, income, category, description, date } = req.body;

    try {
        const expenseUpdate = await expenseModel.findById(id);

        if (!expenseUpdate) {
            return res.status(404).json({ success: false, message: "Expense not found" });
        }

        expenseUpdate.title = title || expenseUpdate.title;
        expenseUpdate.amount = amount || expenseUpdate.amount;
        expenseUpdate.income = income || expenseUpdate.income;
        expenseUpdate.category = category || expenseUpdate.category;
        expenseUpdate.description = description || expenseUpdate.description;
        expenseUpdate.date = date || expenseUpdate.date;

        await expenseUpdate.save();

        res.status(200).json({ success: true, message: "Expense updated successfully", data: expenseUpdate });

    } catch (error) {
        console.error("Error updating Expense:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
}

const getExpense = async (req, res) => {

    try {
        const userId = req.user?.id;
        const getExpense = await expenseModel.find({ userId: userId });    

        if (!getExpense) {
            return res.status(404).json({ success: false, message: "No Expense found" });
        }

        res.status(200).json({ success: true, message: "Expense fetched successfully", data: getExpense });

    } catch (error) {
        console.error("Error fetching Expense:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
}

export { addExpense, deleteExpense, updateExpense, getExpense };