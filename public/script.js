document.addEventListener("DOMContentLoaded", function () {

    // DOM Elements
    const baseCurrencySelect = document.getElementById('base-currency');
    const targetCurrencySelect = document.getElementById('target-currency');
    const amountInput = document.getElementById('amount');
    const convertedAmountDisplay = document.getElementById('converted-amount');
    const historicalRatesBtn = document.getElementById('historical-rates');
    const historicalRatesContainer = document.getElementById('historical-rates-container');
    const saveFavoriteBtn = document.getElementById('save-favorite');
    const favoritePairsContainer = document.getElementById('favorite-currency-pairs');

    // API Key and URL
    const API_KEY ="fca_live_eqwa4Y1SBLXtFVcujsJRiGheQ1irQB3X2feFphp1"; 
    const API_URL = "https://api.freecurrencyapi.com/v1/latest?apikey=fca_live_eqwa4Y1SBLXtFVcujsJRiGheQ1irQB3X2feFphp1"; 

    // Function to fetch available currencies from the API
    function fetchCurrencies() {
        const myHeaders = new Headers();
        myHeaders.append("apikey", API_KEY);

        fetch(`${API_URL}/currencies`, {
            method: 'GET',
            headers: myHeaders
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok' + response.statusText);
            }
            return response.json();
        })
        .then(data => {
            populateCurrencySelects(data.data);
        })
        .catch(error => console.error('Error fetching currencies:', error));
    }

    // Function to populate currency dropdown menus
    function populateCurrencySelects(currencies) {
        for (let currency in currencies) {
            const option1 = document.createElement('option');
            option1.value = currency;
            option1.textContent = currency;
            baseCurrencySelect.appendChild(option1);

            const option2 = document.createElement('option');
            option2.value = currency;
            option2.textContent = currency;
            targetCurrencySelect.appendChild(option2);
        }
    }

    // Function to fetch current exchange rates based on selected base currency
    function fetchExchangeRates(baseCurrency) {
        const myHeaders = new Headers();
        myHeaders.append("apikey", API_KEY);

        fetch(`${API_URL}/latest?base_currency=${baseCurrency}&currencies=EUR,USD,CAD,AUD,BGN,BRL,CAD,CHF,CNY,CZK,DKK`, {
            method: 'GET',
            headers: myHeaders
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok' + response.statusText);
            }
            return response.json();
        })
        .then(data => {
            updateConvertedAmount(data.data);
        })
        .catch(error => {
            console.error('Error fetching exchange rates:', error);
            convertedAmountDisplay.textContent = 'Error fetching data';
        });
    }

    // Function to update displayed converted amount
    function updateConvertedAmount(rates) {
        const amount = parseFloat(amountInput.value);
        const rate = rates[targetCurrencySelect.value];

        if (isNaN(amount) || amount <= 0) {
            convertedAmountDisplay.textContent = 'Enter a valid amount';
            return;
        }

        if (rate) {
            const convertedAmount = amount * rate;
            convertedAmountDisplay.textContent = convertedAmount.toFixed(2);
        } else {
            convertedAmountDisplay.textContent = 'Rate not available';
        }
    }

    // Function to fetch historical rates for a specific date
    function fetchHistoricalRates(baseCurrency, targetCurrency, date) {
        const myHeaders = new Headers();
        myHeaders.append("apikey", API_KEY);

        fetch(`${API_URL}/historical?base_currency=${baseCurrency}&date=${date}&currencies=${targetCurrency}`, {
            method: 'GET',
            headers: myHeaders
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok' + response.statusText);
            }
            return response.json();
        })
        .then(data => {
            displayHistoricalRates(data.data, date);
        })
        .catch(error => {
            console.error('Error fetching historical rates:', error);
            historicalRatesContainer.textContent = 'Error fetching historical rates';
        });
    }

    // Function to display historical exchange rates
    function displayHistoricalRates(rates, date) {
        const rate = rates[targetCurrencySelect.value];

        if (rate) {
            historicalRatesContainer.textContent = `Historical exchange rate on ${date}: 1 ${baseCurrencySelect.value} = ${rate} ${targetCurrencySelect.value}`;
        } else {
            historicalRatesContainer.textContent = `Rate not available for ${date}`;
        }
    }

    // Function to save the current currency pair as a favorite
    function saveFavoritePair() {
        const baseCurrency = baseCurrencySelect.value;
        const targetCurrency = targetCurrencySelect.value;
        const pair = `${baseCurrency}/${targetCurrency}`;

        let favorites = JSON.parse(localStorage.getItem('favoritePairs')) || [];

        if (!favorites.includes(pair)) {
            favorites.push(pair);
            localStorage.setItem('favoritePairs', JSON.stringify(favorites));
            displayFavoritePairs();
        }
    }

    // Function to display saved favorite currency pairs
    function displayFavoritePairs() {
        favoritePairsContainer.innerHTML = '';

        let favorites = JSON.parse(localStorage.getItem('favoritePairs')) || [];

        favorites.forEach(pair => {
            const button = document.createElement('button');
            button.textContent = pair;
            button.addEventListener('click', () => {
                const currencies = pair.split('/');
                baseCurrencySelect.value = currencies[0];
                targetCurrencySelect.value = currencies[1];
                fetchExchangeRates(currencies[0]);
            });
            favoritePairsContainer.appendChild(button);
        });
    }

    // Event listeners
    baseCurrencySelect.addEventListener('change', () => fetchExchangeRates(baseCurrencySelect.value));
    targetCurrencySelect.addEventListener('change', () => fetchExchangeRates(baseCurrencySelect.value));
    amountInput.addEventListener('input', () => updateConvertedAmount(baseCurrencySelect.value));
    historicalRatesBtn.addEventListener('click', () => {
        const date = prompt('Enter a date (YYYY-MM-DD):', '2021-01-01');
        if (date) {
            fetchHistoricalRates(baseCurrencySelect.value, targetCurrencySelect.value, date);
        }
    });
    saveFavoriteBtn.addEventListener('click', saveFavoritePair);

    // Initialize application
    fetchCurrencies();
    displayFavoritePairs();

});



