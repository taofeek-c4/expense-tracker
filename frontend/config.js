// Configuration file for Expense Tracker
const CONFIG = {
    // API Configuration
    API_BASE_URL: 'http://localhost:4000/api/user',
    
    // Application Settings
    APP_NAME: 'Expense Tracker',
    VERSION: '1.0.0',
    
    // Chart Configuration
    CHART_COLORS: [
        '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0',
        '#9966FF', '#FF9F40', '#FF6384', '#C9CBCF',
        '#4BC0C0', '#FF6384', '#36A2EB'
    ],
    
    // Transaction Categories
    CATEGORIES: {
        EXPENSE: ['Food', 'Transportation', 'Entertainment', 'Shopping', 'Bills', 'Healthcare', 'Education', 'Other'],
        INCOME: ['Salary', 'Freelance', 'Investment', 'Other']
    },
    
    // Local Storage Keys
    STORAGE_KEYS: {
        AUTH_TOKEN: 'authToken',
        USER_DATA: 'user'
    },
    
    // Validation Rules
    VALIDATION: {
        PASSWORD_MIN_LENGTH: 6,
        TITLE_MAX_LENGTH: 50,
        AMOUNT_MIN: 0.01
    }
};

// Make config globally available
window.CONFIG = CONFIG; 