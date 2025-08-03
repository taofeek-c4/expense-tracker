import usermodel from "../models/userSchema.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const register = async (req, res) => {
    try {
        const { name, email, password } = req.body
        if (!name || !email || !password) {
            return res.status(401).json({ success: false, message: "All fields are required" });
        }

        const existingUser = await usermodel.findOne({ email });

        if (existingUser) {
            return res.status(400).json({ success: false, message: "User already exists" });
        } 

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = new usermodel({
            name,
            email,
            password: hashedPassword
        });

        await newUser.save();

        const token = jwt.sign(
            { id: newUser._id, email: newUser.email },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.cookie(token, { httpOnly: false, secure: false, sameSite: 'Lax' , maxAge: 7 * 24 * 60 * 60 * 1000 });

        const userResponse = {
            id: newUser._id,
            Username: newUser.name,
            email: newUser.email
        };

        res.status(201).json({ success: true, message: "User registered successfully", user: userResponse, token });
    }

    catch (error) {
        console.error("Error during registration:", error);
        res.status(500).json({ success:false, message: "Internal server error" });
    }
}

const login = async (req, res) => {
    try {

        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(401).json({ success: false, message: "All fields are required" });
        }

        const user = await usermodel.findOne({ email });
        if (!user){
            return res.status(404).json({ success: false, message: "User not found" });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ success: false, message: "Invalid credentials" });
        }

        const token = jwt.sign(
            { id: user._id, email: user.email },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.cookie(token, { httpOnly: false, secure: false, sameSite: 'Lax', maxAge: 7 * 24 * 60 * 60 * 1000 });

        const userResponse = {
            id: user._id,
            Username: user.name,
            email: user.email
        };

        res.status(200).json({ success: true, message: "Login successful", user: userResponse, token });

    } catch (error) {
        console.error("Error during login:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
}

export {register, login};