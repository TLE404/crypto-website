// app.js

const options = {
    method: 'GET',
    headers: { accept: 'application/json', 'x-cg-demo-api-key': 'CG-mDVVqLm5xBDjvcVq523LnAmB' },
};

let coins = [];

// Function to fetch coins from API
const fetchCoins = async () => {
    try {
        const response = await fetch('https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=100&page=1', options);
        coins = await response.json();
        return coins;
    } catch (err) {
        console.error(err);
    }
};

// Function to get favorites from localStorage
const getFavorites = () => {
    return JSON.parse(localStorage.getItem('favorites')) || [];
};

// Function to save favorites to localStorage
const saveFavorites = (favorites) => {
    localStorage.setItem('favorites', JSON.stringify(favorites));
};

// Function to render coins on the page
const renderCoins = (coins, page = 1, itemsPerPage = 15) => {
    const start = (page - 1) * itemsPerPage;
    const end = page * itemsPerPage;
    const coinsToDisplay = coins.slice(start, end);
    const favorites = getFavorites();
    const tableBody = document.querySelector('#crypto-table tbody');
    tableBody.innerHTML = '';

    coinsToDisplay.forEach((coin, index) => {
        const isFavorite = favorites.includes(coin.id);
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${start + index + 1}</td>
            <td><img src="${coin.image}" alt="${coin.name}" width="24" height="24" /></td>
            <td>${coin.name}</td>
            <td>$${coin.current_price.toLocaleString()}</td>
            <td>$${coin.total_volume.toLocaleString()}</td>
            <td>$${coin.market_cap.toLocaleString()}</td>
            <td>
                <i class="fas fa-star favorite-icon ${isFavorite ? 'favorite' : ''}" data-id="${coin.id}"></i>
            </td>
        `;
        row.addEventListener('click', (event) => {
            if (!event.target.classList.contains('favorite-icon')) {
                window.location.href = `coin.html?id=${coin.id}`;
            }
        });
        tableBody.appendChild(row);
    });

    const favoriteIcons = document.querySelectorAll('.favorite-icon');
    favoriteIcons.forEach(icon => {
        icon.addEventListener('click', (event) => {
            event.stopPropagation();
            const coinId = event.target.getAttribute('data-id');
            const favorites = getFavorites();
            if (favorites.includes(coinId)) {
                saveFavorites(favorites.filter(id => id !== coinId));
                event.target.classList.remove('favorite');
            } else {
                favorites.push(coinId);
                saveFavorites(favorites);
                event.target.classList.add('favorite');
            }
        });
    });
};

// Function to render pagination buttons
const renderPagination = (coins, itemsPerPage) => {
    const totalPages = Math.ceil(coins.length / itemsPerPage);
    const paginationContainer = document.querySelector('#pagination');
    paginationContainer.innerHTML = '';

    for (let i = 1; i <= totalPages; i++) {
        const pageButton = document.createElement('button');
        pageButton.textContent = i;
        pageButton.classList.add('page-button');
        if (i === 1) {
            pageButton.classList.add('active');
        }
        pageButton.addEventListener('click', () => {
            renderCoins(coins, i, itemsPerPage);
            updatePaginationButtons(i);
        });
        paginationContainer.appendChild(pageButton);
    }
};

// Function to filter coins based on search term
const filterCoins = (searchTerm) => {
    return coins.filter(coin => coin.name.toLowerCase().includes(searchTerm.toLowerCase()));
};

document.addEventListener('DOMContentLoaded', async () => {
    coins = await fetchCoins();
    renderCoins(coins, 1, 15); // Initial render with 15 coins per page
    renderPagination(coins, 15); // Initial pagination setup for 15 coins per page

    const searchBox = document.querySelector('#search-box');
    const searchIcon = document.querySelector('#search-icon');

    // Debouncing function for search
    let debounceTimeout;
    const handleSearch = () => {
        clearTimeout(debounceTimeout);
        debounceTimeout = setTimeout(() => {
            const searchTerm = searchBox.value.trim();
            const filteredCoins = filterCoins(searchTerm);
            renderCoins(filteredCoins, 1, 15); // Render filtered coins with 15 coins per page
            renderPagination(filteredCoins, 15); // Update pagination for filtered coins
        }, 300); // Adjust debounce time as needed
    };

    searchBox.addEventListener('input', handleSearch);

    searchIcon.addEventListener('click', handleSearch);

    const sortPriceAsc = document.querySelector('#sort-price-asc');
    const sortPriceDesc = document.querySelector('#sort-price-desc');
    const sortVolumeAsc = document.querySelector('#sort-volume-asc');
    const sortVolumeDesc = document.querySelector('#sort-volume-desc');

    // Function to sort coins by price
    const sortCoinsByPrice = (order) => {
        if (order === 'asc') {
            coins.sort((a, b) => a.current_price - b.current_price);
        } else if (order === 'desc') {
            coins.sort((a, b) => b.current_price - a.current_price);
        }
    };

    // Function to sort coins by volume
    const sortCoinsByVolume = (order) => {
        if (order === 'asc') {
            coins.sort((a, b) => a.total_volume - b.total_volume);
        } else if (order === 'desc') {
            coins.sort((a, b) => b.total_volume - a.total_volume);
        }
    };

    // Sorting by price ascending
    sortPriceAsc.addEventListener('click', () => {
        sortCoinsByPrice('asc');
        renderCoins(coins, 1, 15);
        renderPagination(coins, 15);
    });

    // Sorting by price descending
    sortPriceDesc.addEventListener('click', () => {
        sortCoinsByPrice('desc');
        renderCoins(coins, 1, 15);
        renderPagination(coins, 15);
    });

    // Sorting by volume ascending
    sortVolumeAsc.addEventListener('click', () => {
        sortCoinsByVolume('asc');
        renderCoins(coins, 1, 15);
        renderPagination(coins, 15);
    });

    // Sorting by volume descending
    sortVolumeDesc.addEventListener('click', () => {
        sortCoinsByVolume('desc');
        renderCoins(coins, 1, 15);
        renderPagination(coins, 15);
    });
});
