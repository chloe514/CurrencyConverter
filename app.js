const express = require('express');
const axios = require('axios');
const path = require('path');
const { Sequelize, DataTypes } = require('sequelize');

const app = express();
const port = 3000;

// Initialize Sequelize with SQLite
const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: 'database.sqlite' // This will create a file named 'database.sqlite' in your project directory
});


const User = sequelize.define('User', {
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    }
);


// Sync the database (remove { force: true } to preserve data between restarts)
sequelize.sync({ force: true }).then(() => {
    console.log('Database & tables created!');
}).catch(error => {
    console.error('Unable to sync database:', error);
});

// Middleware to parse form data and JSON
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Serve static files from the "public" directory
app.use(express.static(path.join(__dirname, 'public')));

// API key and URL
const API_KEY = 'fca_live_eqwa4Y1SBLXtFVcujsJRiGheQ1irQB3X2feFphp1';
const API_URL = 'https://api.freecurrencyapi.com/v1/latest?apikey=fca_live_eqwa4Y1SBLXtFVcujsJRiGheQ1irQB3X2feFphp1';

// Route to serve the main HTML file
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Route to handle currency conversion
app.post('/convert', async (req, res) => {
    const { baseCurrency, targetCurrency, amount } = req.body;

    try {
        const response = await axios.get(API_URL, {
            headers: {
                'apikey': API_KEY
            }
        });

        const rates = response.data.data;
        const rate = rates[targetCurrency];

        if (rate) {
            const convertedAmount = amount * rate;
            res.json({
                baseCurrency,
                targetCurrency,
                amount,
                convertedAmount: convertedAmount.toFixed(2)
            });
        } else {
            res.status(404).json({ error: 'Rate not available' });
        }

    } catch (error) {
        console.error('Error fetching exchange rates:', error);
        res.status(500).json({ error: 'Error fetching exchange rates' });
    }
});

// Start the server
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});

