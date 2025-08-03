import e from "express";
import IncomeModel from "../models/incomeSchema.js";

const addIncome = async (req, res) => {
    
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

        const newIncome = new IncomeModel({
            userId,
            title,
            amount,
            income,
            category,
            description,
            date
        });

        await newIncome.save();
        
        res.status(200).json({ success: true, message: "Income added successfully", data: newIncome });

    } catch (error) {
        console.error("Error during registration:", error);
        res.status(500).json({ success:false, message: "Internal server error" });             
    }
}

const deleteIncome = async (req, res) => {
    const {id} = req.params;

    try {
        const deleteIncome = await IncomeModel.findOneAndDelete(id);

        if (!deleteIncome) {
            return res.status(404).json({ success: false, message: "Income not found" });
        }

        res.status(200).json({ success: true, message: "Income deleted successfully",deleteIncome });

    } catch (error) {
        console.error("Error deleting income:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
}

const updateIncome = async (req, res) => {
    const { id } = req.params;
    const { title, amount, income, category, description, date } = req.body;

    try {
        const incomeUpdate = await IncomeModel.findById(id);

        if (!incomeUpdate) {
            return res.status(404).json({ success: false, message: "Income not found" });
        }

        incomeUpdate.title = title || incomeUpdate.title;
        incomeUpdate.amount = amount || incomeUpdate.amount;
        incomeUpdate.income = income || incomeUpdate.income;
        incomeUpdate.category = category || incomeUpdate.category;
        incomeUpdate.description = description || incomeUpdate.description;
        incomeUpdate.date = date || incomeUpdate.date;

        await incomeUpdate.save();

        res.status(200).json({ success: true, message: "Income updated successfully", data: incomeUpdate });

    } catch (error) {
        console.error("Error updating income:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
}

const getIncome = async (req, res) => {

    try {
        const userId = req.user?.id;
        const getIncome = await IncomeModel.find({ userId: userId });    

        if (!getIncome) {
            return res.status(404).json({ success: false, message: "No incomes found" });
        }

        res.status(200).json({ success: true, message: "Incomes fetched successfully", data: getIncome });

    } catch (error) {
        console.error("Error fetching incomes:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
}

export { addIncome, deleteIncome, updateIncome,getIncome };