# Expense Tracker

[![Live Demo](https://img.shields.io/badge/Live_App-Netlify-00C7B7?style=for-the-badge&logo=netlify)](https://your-netlify-site.netlify.app)

## Overview

Expense Tracker is a full-stack web application designed to help users manage their personal finances with ease. The app allows users to record, categorize, and analyze their expenses and incomes, providing valuable insights into their spending habits and financial health. With a clean interface and powerful features, Expense Tracker makes budgeting and financial planning simple and accessible.

## Features

- **User Authentication:** Secure registration and login with password hashing and JWT-based authentication.
- **Expense & Income Management:** Add, edit, and delete transactions, with support for categories and descriptions.
- **Visual Analytics:** Interactive charts and summaries to help users understand their financial trends.
- **Responsive Design:** Mobile-friendly interface built with Bootstrap for seamless use on any device.
- **Data Security:** User data is protected and private, with secure backend practices.

## Technologies Used

### Frontend
- **HTML5** and **CSS3** for structure and styling
- **Bootstrap 5** for responsive design and UI components
- **Bootstrap Icons** for iconography
- **Google Fonts** for typography
- **Chart.js** for data visualization
- **Vanilla JavaScript** for client-side logic

### Backend
- **Node.js** as the runtime environment
- **Express.js** for building the RESTful API
- **MongoDB** as the database
- **Mongoose** for MongoDB object modeling
- **dotenv** for environment variable management
- **bcryptjs** for password hashing
- **jsonwebtoken** for authentication (JWT)
- **CORS** for cross-origin resource sharing
- **Nodemon** for development server auto-reloading

## Getting Started

1. **Clone the repository:**
   ```
   git clone <repository-url>
   ```

2. **Install backend dependencies:**
   ```
   cd backend
   npm install
   ```

3. **Configure environment variables:**
   - Create a `.env` file in the `backend` directory with your MongoDB URI and JWT secret.

4. **Start the backend server:**
   ```
   npm start
   ```

5. **Open the frontend:**
   - Open `frontend/index.html` in your browser.

## Purpose

The main goal of this project is to provide an easy-to-use tool for tracking daily expenses and incomes, helping users to budget more effectively and make informed financial decisions.
