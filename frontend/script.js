// Global variables
let currentUser = null;
let authToken = localStorage.getItem(CONFIG.STORAGE_KEYS.AUTH_TOKEN);
let expenseChart = null;

// API Base URL
const API_BASE_URL = CONFIG.API_BASE_URL;

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
    setupEventListeners();
});

// Initialize the application
function initializeApp() {
    // Check if user is already logged in
    if (authToken) {
        // Validate token and load user data
        validateToken();
    } else {
        showWelcomeScreen();
    }
    
    // Set default date to today
    document.getElementById('date').value = new Date().toISOString().split('T')[0];
}

// Setup event listeners
function setupEventListeners() {
    // Form submissions
    document.getElementById('login-form').addEventListener('submit', handleLogin);
    document.getElementById('register-form').addEventListener('submit', handleRegister);
    document.getElementById('transaction-form').addEventListener('submit', handleAddTransaction);
    document.getElementById('edit-form').addEventListener('submit', handleEditTransaction);
    
    // Filter changes
    document.getElementById('filter-type').addEventListener('change', filterTransactions);
    document.getElementById('filter-category').addEventListener('change', filterTransactions);
    
    // Modal events
    const loginModal = document.getElementById('loginModal');
    const registerModal = document.getElementById('registerModal');
    
    loginModal.addEventListener('hidden.bs.modal', () => {
        document.getElementById('login-form').reset();
    });
    
    registerModal.addEventListener('hidden.bs.modal', () => {
        document.getElementById('register-form').reset();
    });
}

// Authentication Functions
async function handleLogin(event) {
    event.preventDefault();
    
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    
    try {
        const response = await fetch(`${API_BASE_URL}/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });
        
        const data = await response.json();
        
        if (data.success) {
            authToken = data.token;
            currentUser = data.user;
            localStorage.setItem('authToken', authToken);
            localStorage.setItem('user', JSON.stringify(currentUser));
            
            showToast('Success', 'Login successful!', 'success');
            bootstrap.Modal.getInstance(document.getElementById('loginModal')).hide();
            showDashboard();
            loadTransactions();
        } else {
            showToast('Error', data.message, 'error');
        }
    } catch (error) {
        console.error('Login error:', error);
        showToast('Error', 'Login failed. Please try again.', 'error');
    }
}

async function handleRegister(event) {
    event.preventDefault();
    
    const name = document.getElementById('register-name').value;
    const email = document.getElementById('register-email').value;
    const password = document.getElementById('register-password').value;
    
    try {
        const response = await fetch(`${API_BASE_URL}/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ name, email, password })
        });
        
        const data = await response.json();
        
        if (data.success) {
            authToken = data.token;
            currentUser = data.user;
            localStorage.setItem('authToken', authToken);
            localStorage.setItem('user', JSON.stringify(currentUser));
            
            showToast('Success', 'Registration successful!', 'success');
            bootstrap.Modal.getInstance(document.getElementById('registerModal')).hide();
            showDashboard();
            loadTransactions();
        } else {
            showToast('Error', data.message, 'error');
        }
    } catch (error) {
        console.error('Registration error:', error);
        showToast('Error', 'Registration failed. Please try again.', 'error');
    }
}

async function validateToken() {
    try {
        // Try to load user data to validate token
        await loadTransactions();
        currentUser = JSON.parse(localStorage.getItem('user'));
        showDashboard();
    } catch (error) {
        console.error('Token validation failed:', error);
        logout();
    }
}

function logout() {
    authToken = null;
    currentUser = null;
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    showWelcomeScreen();
    showToast('Info', 'Logged out successfully', 'info');
}

// UI Functions
function showWelcomeScreen() {
    document.getElementById('welcome-section').classList.remove('hidden');
    document.getElementById('dashboard').classList.add('hidden');
    document.getElementById('auth-buttons').classList.remove('hidden');
    document.getElementById('user-info').classList.add('hidden');
}

function showDashboard() {
    document.getElementById('welcome-section').classList.add('hidden');
    document.getElementById('dashboard').classList.remove('hidden');
    document.getElementById('auth-buttons').classList.add('hidden');
    document.getElementById('user-info').classList.remove('hidden');
    document.getElementById('user-name').textContent = currentUser.Username;
}

// Transaction Functions
async function handleAddTransaction(event) {
    event.preventDefault();
    
    const type = document.getElementById('transaction-type').value;
    const title = document.getElementById('title').value;
    const amount = document.getElementById('amount').value;
    const category = document.getElementById('category').value;
    const description = document.getElementById('description').value;
    const date = document.getElementById('date').value;
    
    try {
        const endpoint = type === 'income' ? '/add-income' : '/add-expense';
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            },
            body: JSON.stringify({
                title,
                amount: parseFloat(amount),
                category,
                description,
                date
            })
        });
        
        const data = await response.json();
        
        if (data.success) {
            showToast('Success', `${type.charAt(0).toUpperCase() + type.slice(1)} added successfully!`, 'success');
            document.getElementById('transaction-form').reset();
            document.getElementById('date').value = new Date().toISOString().split('T')[0];
            loadTransactions();
        } else {
            showToast('Error', data.message, 'error');
        }
    } catch (error) {
        console.error('Add transaction error:', error);
        showToast('Error', 'Failed to add transaction. Please try again.', 'error');
    }
}

async function loadTransactions() {
    try {
        // Load both income and expenses
        const [incomeResponse, expenseResponse] = await Promise.all([
            fetch(`${API_BASE_URL}/get-income`, {
                headers: {
                    'Authorization': `Bearer ${authToken}`
                }
            }),
            fetch(`${API_BASE_URL}/get-expense`, {
                headers: {
                    'Authorization': `Bearer ${authToken}`
                }
            })
        ]);
        
        const incomeData = await incomeResponse.json();
        const expenseData = await expenseResponse.json();
        
        let allTransactions = [];
        
        if (incomeData.success && incomeData.data) {
            allTransactions = allTransactions.concat(incomeData.data.map(item => ({
                ...item,
                type: 'income'
            })));
        }
        
        if (expenseData.success && expenseData.data) {
            allTransactions = allTransactions.concat(expenseData.data.map(item => ({
                ...item,
                type: 'expense'
            })));
        }
        
        // Sort by date (newest first)
        allTransactions.sort((a, b) => new Date(b.date) - new Date(a.date));
        
        displayTransactions(allTransactions);
        updateBalance(allTransactions);
        updateChart(allTransactions);
        
    } catch (error) {
        console.error('Load transactions error:', error);
        showToast('Error', 'Failed to load transactions', 'error');
    }
}

function displayTransactions(transactions) {
    const container = document.getElementById('transactions-list');
    
    if (transactions.length === 0) {
        container.innerHTML = '<div class="text-center text-muted py-4">No transactions found</div>';
        return;
    }
    
    container.innerHTML = transactions.map(transaction => `
        <div class="transaction-item card mb-2 ${transaction.type}-border" data-id="${transaction._id}" data-type="${transaction.type}">
            <div class="card-body d-flex justify-content-between align-items-center">
                <div class="flex-grow-1">
                    <div class="d-flex justify-content-between align-items-start">
                        <div>
                            <h6 class="card-title mb-1">${transaction.title}</h6>
                            <p class="card-text text-muted small mb-1">${transaction.description}</p>
                            <div class="d-flex align-items-center gap-2">
                                <span class="badge bg-secondary category-badge">${transaction.category}</span>
                                <small class="text-muted">${new Date(transaction.date).toLocaleDateString()}</small>
                            </div>
                        </div>
                        <div class="text-end">
                            <div class="fw-bold ${transaction.type === 'income' ? 'income-amount' : 'expense-amount'}">
                                ${transaction.type === 'income' ? '+' : '-'}$${parseFloat(transaction.amount).toFixed(2)}
                            </div>
                            <div class="btn-group btn-group-sm mt-2">
                                <button class="btn btn-outline-primary btn-sm" onclick="editTransaction('${transaction._id}', '${transaction.type}')">
                                    <i class="bi bi-pencil"></i>
                                </button>
                                <button class="btn btn-outline-danger btn-sm" onclick="deleteTransaction('${transaction._id}', '${transaction.type}')">
                                    <i class="bi bi-trash"></i>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `).join('');
}

function updateBalance(transactions) {
    const totalIncome = transactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + parseFloat(t.amount), 0);
    
    const totalExpenses = transactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + parseFloat(t.amount), 0);
    
    const balance = totalIncome - totalExpenses;
    
    document.getElementById('balance').textContent = `$${balance.toFixed(2)}`;
    document.getElementById('total-income').textContent = `$${totalIncome.toFixed(2)}`;
    document.getElementById('total-expenses').textContent = `$${totalExpenses.toFixed(2)}`;
}

function updateChart(transactions) {
    const expenses = transactions.filter(t => t.type === 'expense');
    const categoryData = {};
    
    expenses.forEach(expense => {
        const category = expense.category;
        categoryData[category] = (categoryData[category] || 0) + parseFloat(expense.amount);
    });
    
    const ctx = document.getElementById('expense-chart').getContext('2d');
    
    if (expenseChart) {
        expenseChart.destroy();
    }
    
    if (Object.keys(categoryData).length === 0) {
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        ctx.font = '16px Arial';
        ctx.fillStyle = '#666';
        ctx.textAlign = 'center';
        ctx.fillText('No expense data available', ctx.canvas.width / 2, ctx.canvas.height / 2);
        return;
    }
    
    expenseChart = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: Object.keys(categoryData),
            datasets: [{
                data: Object.values(categoryData),
                backgroundColor: [
                    '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0',
                    '#9966FF', '#FF9F40', '#FF6384', '#C9CBCF',
                    '#4BC0C0', '#FF6384', '#36A2EB'
                ]
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom'
                }
            }
        }
    });
}

// Edit and Delete Functions
async function editTransaction(id, type) {
    try {
        const endpoint = type === 'income' ? '/get-income' : '/get-expense';
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });
        
        const data = await response.json();
        const transaction = data.data.find(t => t._id === id);
        
        if (transaction) {
            document.getElementById('edit-id').value = id;
            document.getElementById('edit-transaction-type').value = type;
            document.getElementById('edit-title').value = transaction.title;
            document.getElementById('edit-amount').value = transaction.amount;
            document.getElementById('edit-category').value = transaction.category;
            document.getElementById('edit-description').value = transaction.description;
            document.getElementById('edit-date').value = transaction.date.split('T')[0];
            
            const editModal = new bootstrap.Modal(document.getElementById('editModal'));
            editModal.show();
        }
    } catch (error) {
        console.error('Edit transaction error:', error);
        showToast('Error', 'Failed to load transaction for editing', 'error');
    }
}

async function handleEditTransaction(event) {
    event.preventDefault();
    
    const id = document.getElementById('edit-id').value;
    const type = document.getElementById('edit-transaction-type').value;
    const title = document.getElementById('edit-title').value;
    const amount = document.getElementById('edit-amount').value;
    const category = document.getElementById('edit-category').value;
    const description = document.getElementById('edit-description').value;
    const date = document.getElementById('edit-date').value;
    
    try {
        const endpoint = type === 'income' ? `/update-income/${id}` : `/update-expense/${id}`;
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            },
            body: JSON.stringify({
                title,
                amount: parseFloat(amount),
                category,
                description,
                date
            })
        });
        
        const data = await response.json();
        
        if (data.success) {
            showToast('Success', 'Transaction updated successfully!', 'success');
            bootstrap.Modal.getInstance(document.getElementById('editModal')).hide();
            loadTransactions();
        } else {
            showToast('Error', data.message, 'error');
        }
    } catch (error) {
        console.error('Update transaction error:', error);
        showToast('Error', 'Failed to update transaction', 'error');
    }
}

async function deleteTransaction(id, type) {
    if (!confirm('Are you sure you want to delete this transaction?')) {
        return;
    }
    
    try {
        const endpoint = type === 'income' ? `/delete-income/${id}` : `/delete-expense/${id}`;
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });
        
        const data = await response.json();
        
        if (data.success) {
            showToast('Success', 'Transaction deleted successfully!', 'success');
            loadTransactions();
        } else {
            showToast('Error', data.message, 'error');
        }
    } catch (error) {
        console.error('Delete transaction error:', error);
        showToast('Error', 'Failed to delete transaction', 'error');
    }
}

// Filter Functions
function filterTransactions() {
    const typeFilter = document.getElementById('filter-type').value;
    const categoryFilter = document.getElementById('filter-category').value;
    
    const transactions = document.querySelectorAll('.transaction-item');
    
    transactions.forEach(transaction => {
        const type = transaction.dataset.type;
        const category = transaction.querySelector('.badge').textContent;
        
        const typeMatch = !typeFilter || type === typeFilter;
        const categoryMatch = !categoryFilter || category === categoryFilter;
        
        if (typeMatch && categoryMatch) {
            transaction.style.display = 'block';
        } else {
            transaction.style.display = 'none';
        }
    });
}

function clearFilters() {
    document.getElementById('filter-type').value = '';
    document.getElementById('filter-category').value = '';
    
    const transactions = document.querySelectorAll('.transaction-item');
    transactions.forEach(transaction => {
        transaction.style.display = 'block';
    });
}

// Data Management Functions
async function exportData() {
    try {
        const [incomeResponse, expenseResponse] = await Promise.all([
            fetch(`${API_BASE_URL}/get-income`, {
                headers: {
                    'Authorization': `Bearer ${authToken}`
                }
            }),
            fetch(`${API_BASE_URL}/get-expense`, {
                headers: {
                    'Authorization': `Bearer ${authToken}`
                }
            })
        ]);
        
        const incomeData = await incomeResponse.json();
        const expenseData = await expenseResponse.json();
        
        const exportData = {
            user: currentUser,
            exportDate: new Date().toISOString(),
            income: incomeData.success ? incomeData.data : [],
            expenses: expenseData.success ? expenseData.data : []
        };
        
        const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `expense-tracker-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        showToast('Success', 'Data exported successfully!', 'success');
    } catch (error) {
        console.error('Export error:', error);
        showToast('Error', 'Failed to export data', 'error');
    }
}

async function importData(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    try {
        const text = await file.text();
        const data = JSON.parse(text);
        
        if (!data.income || !data.expenses) {
            throw new Error('Invalid file format');
        }
        
        // Import income transactions
        for (const income of data.income) {
            await fetch(`${API_BASE_URL}/add-income`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authToken}`
                },
                body: JSON.stringify({
                    title: income.title,
                    amount: income.amount,
                    category: income.category,
                    description: income.description,
                    date: income.date
                })
            });
        }
        
        // Import expense transactions
        for (const expense of data.expenses) {
            await fetch(`${API_BASE_URL}/add-expense`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authToken}`
                },
                body: JSON.stringify({
                    title: expense.title,
                    amount: expense.amount,
                    category: expense.category,
                    description: expense.description,
                    date: expense.date
                })
            });
        }
        
        showToast('Success', 'Data imported successfully!', 'success');
        loadTransactions();
        
    } catch (error) {
        console.error('Import error:', error);
        showToast('Error', 'Failed to import data. Please check file format.', 'error');
    }
    
    // Reset file input
    event.target.value = '';
}

async function clearAllData() {
    if (!confirm('Are you sure you want to clear all data? This action cannot be undone.')) {
        return;
    }
    
    try {
        // Get all transactions
        const [incomeResponse, expenseResponse] = await Promise.all([
            fetch(`${API_BASE_URL}/get-income`, {
                headers: {
                    'Authorization': `Bearer ${authToken}`
                }
            }),
            fetch(`${API_BASE_URL}/get-expense`, {
                headers: {
                    'Authorization': `Bearer ${authToken}`
                }
            })
        ]);
        
        const incomeData = await incomeResponse.json();
        const expenseData = await expenseResponse.json();
        
        // Delete all income transactions
        if (incomeData.success && incomeData.data) {
            for (const income of incomeData.data) {
                await fetch(`${API_BASE_URL}/delete-income/${income._id}`, {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${authToken}`
                    }
                });
            }
        }
        
        // Delete all expense transactions
        if (expenseData.success && expenseData.data) {
            for (const expense of expenseData.data) {
                await fetch(`${API_BASE_URL}/delete-expense/${expense._id}`, {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${authToken}`
                    }
                });
            }
        }
        
        showToast('Success', 'All data cleared successfully!', 'success');
        loadTransactions();
        
    } catch (error) {
        console.error('Clear data error:', error);
        showToast('Error', 'Failed to clear data', 'error');
    }
}

// Utility Functions
function showToast(title, message, type = 'info') {
    const toast = document.getElementById('toast');
    const toastTitle = document.getElementById('toast-title');
    const toastMessage = document.getElementById('toast-message');
    
    toastTitle.textContent = title;
    toastMessage.textContent = message;
    
    // Update toast styling based on type
    toast.className = `toast ${type === 'error' ? 'bg-danger text-white' : type === 'success' ? 'bg-success text-white' : ''}`;
    
    const bsToast = new bootstrap.Toast(toast);
    bsToast.show();
}

// Enhanced UI Functions
function clearTransactionForm() {
    document.getElementById('transaction-form').reset();
    document.getElementById('date').value = new Date().toISOString().split('T')[0];
    showToast('Info', 'Form cleared', 'info');
}

function refreshTransactions() {
    loadTransactions();
    showToast('Info', 'Transactions refreshed', 'info');
}

function toggleTransactionView() {
    const container = document.getElementById('transactions-list');
    container.classList.toggle('grid-view');
    showToast('Info', 'View toggled', 'info');
}

function updateMonthlySummary(transactions) {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    
    const monthlyTransactions = transactions.filter(t => {
        const transactionDate = new Date(t.date);
        return transactionDate.getMonth() === currentMonth && 
               transactionDate.getFullYear() === currentYear;
    });
    
    const monthlyIncome = monthlyTransactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + parseFloat(t.amount), 0);
    
    const monthlyExpenses = monthlyTransactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + parseFloat(t.amount), 0);
    
    const monthlyBalance = monthlyIncome - monthlyExpenses;
    
    const monthlyElement = document.getElementById('monthly-summary');
    if (monthlyElement) {
        monthlyElement.textContent = `$${monthlyBalance.toFixed(2)}`;
    }
}

// Enhanced balance update function
function updateBalance(transactions) {
    const totalIncome = transactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + parseFloat(t.amount), 0);
    
    const totalExpenses = transactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + parseFloat(t.amount), 0);
    
    const balance = totalIncome - totalExpenses;
    
    document.getElementById('balance').textContent = `$${balance.toFixed(2)}`;
    document.getElementById('total-income').textContent = `$${totalIncome.toFixed(2)}`;
    document.getElementById('total-expenses').textContent = `$${totalExpenses.toFixed(2)}`;
    
    // Update monthly summary
    updateMonthlySummary(transactions);
    
    // Add animation to balance changes
    const balanceElement = document.getElementById('balance');
    balanceElement.classList.add('pulse');
    setTimeout(() => balanceElement.classList.remove('pulse'), 1000);
}

// Enhanced transaction display with better formatting
function displayTransactions(transactions) {
    const container = document.getElementById('transactions-list');
    
    if (transactions.length === 0) {
        container.innerHTML = `
            <div class="text-center text-muted py-5">
                <i class="bi bi-inbox" style="font-size: 3rem; margin-bottom: 1rem; display: block;"></i>
                <h5>No transactions found</h5>
                <p>Start by adding your first transaction!</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = transactions.map(transaction => `
        <div class="transaction-item card mb-2 ${transaction.type}-border fade-in" data-id="${transaction._id}" data-type="${transaction.type}">
            <div class="card-body d-flex justify-content-between align-items-center">
                <div class="flex-grow-1">
                    <div class="d-flex justify-content-between align-items-start">
                        <div>
                            <h6 class="card-title mb-1">${transaction.title}</h6>
                            <p class="card-text text-muted small mb-1">${transaction.description}</p>
                            <div class="d-flex align-items-center gap-2">
                                <span class="category-badge">${transaction.category}</span>
                                <small class="text-muted">
                                    <i class="bi bi-calendar3"></i> ${new Date(transaction.date).toLocaleDateString()}
                                </small>
                            </div>
                        </div>
                        <div class="text-end">
                            <div class="fw-bold ${transaction.type === 'income' ? 'income-amount' : 'expense-amount'}">
                                ${transaction.type === 'income' ? '+' : '-'}$${parseFloat(transaction.amount).toFixed(2)}
                            </div>
                            <div class="btn-group btn-group-sm mt-2">
                                <button class="btn btn-outline-primary btn-sm" onclick="editTransaction('${transaction._id}', '${transaction.type}')" title="Edit">
                                    <i class="bi bi-pencil"></i>
                                </button>
                                <button class="btn btn-outline-danger btn-sm" onclick="deleteTransaction('${transaction._id}', '${transaction.type}')" title="Delete">
                                    <i class="bi bi-trash"></i>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `).join('');
}

// Make functions globally available
window.logout = logout;
window.editTransaction = editTransaction;
window.deleteTransaction = deleteTransaction;
window.clearFilters = clearFilters;
window.exportData = exportData;
window.importData = importData;
window.clearAllData = clearAllData;
window.clearTransactionForm = clearTransactionForm;
window.refreshTransactions = refreshTransactions;
window.toggleTransactionView = toggleTransactionView; 