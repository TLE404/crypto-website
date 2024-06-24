// app.js

const options = {
    method: 'GET',
    headers: { accept: 'application/json', 'x-cg-demo-api-key': 'CG-mDVVqLm5xBDjvcVq523LnAmB' },
};

let coins = [];
let currentPage = 1; // Track current page globally

// Function to fetch coins from API
const fetchCoins = async () => {
    try {
        showShimmer(); // Show shimmer effect before fetching data
        const response = await fetch('https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=100&page=1', options);
        coins = await response.json();
        hideShimmer(); // Hide shimmer effect after data is fetched
        return coins;
    } catch (err) {
        console.error(err);
        hideShimmer(); // Ensure shimmer is hidden in case of an error
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

// Function to handle favorite icon click
const handleFavoriteClick = (coinId) => {
    let favorites = getFavorites();
    if (favorites.includes(coinId)) {
        favorites = favorites.filter(id => id !== coinId);
    } else {
        favorites.push(coinId);
    }
    saveFavorites(favorites);
    renderCoins(getCoinsForPage(coins, currentPage, 15), currentPage, 15);
};

// Function to render coins on the page
const renderCoins = (coinsToDisplay, page, itemsPerPage) => {
    const start = (page - 1) * itemsPerPage + 1; // Calculate starting rank
    const end = start + itemsPerPage - 1; // Calculate ending rank
    const favorites = getFavorites();
    const tableBody = document.querySelector('#crypto-table tbody');
    tableBody.innerHTML = '';

    coinsToDisplay.forEach((coin, index) => {
        const isFavorite = favorites.includes(coin.id);
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${start + index}</td>
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
        row.querySelector('.favorite-icon').addEventListener('click', (event) => {
            event.stopPropagation();
            handleFavoriteClick(coin.id);
        });
        tableBody.appendChild(row);
    });

    // Hide shimmer effect after rendering coins
    hideShimmer();
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
        if (i === currentPage) {
            pageButton.classList.add('active');
        }
        pageButton.addEventListener('click', () => {
            currentPage = i; // Update current page globally
            showShimmer(); // Show shimmer effect before rendering new page
            setTimeout(() => {
                renderCoins(getCoinsForPage(coins, currentPage, itemsPerPage), currentPage, itemsPerPage);
                updatePaginationButtons();
            }, 500); // Simulate delay for demo purposes
        });
        paginationContainer.appendChild(pageButton);
    }
};

// Function to filter coins based on search term
const filterCoins = (searchTerm) => {
    return coins.filter(coin => coin.name.toLowerCase().includes(searchTerm.toLowerCase()));
};

// Function to get coins for a specific page
const getCoinsForPage = (coins, page, itemsPerPage) => {
    const start = (page - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    return coins.slice(start, end);
};

// Function to update pagination button states
const updatePaginationButtons = () => {
    const pageButtons = document.querySelectorAll('.page-button');
    pageButtons.forEach((button, index) => {
        if (index + 1 === currentPage) {
            button.classList.add('active');
        } else {
            button.classList.remove('active');
        }
    });
};

// Function to show shimmer effect
const showShimmer = () => {
    const shimmerContainer = document.querySelector('.shimmer-container');
    shimmerContainer.style.display = 'flex';
};

// Function to hide shimmer effect
const hideShimmer = () => {
    const shimmerContainer = document.querySelector('.shimmer-container');
    shimmerContainer.style.display = 'none';
};

document.addEventListener('DOMContentLoaded', async () => {
    const shimmerContainer = document.querySelector('.shimmer-container');

    // Show shimmer effect initially
    showShimmer();

    // Fetch coins from API
    coins = await fetchCoins();

    // Simulate delay for initial render
    setTimeout(() => {
        renderCoins(getCoinsForPage(coins, currentPage, 15), currentPage, 15); // Initial render with 15 coins per page
        renderPagination(coins, 15); // Initial pagination setup for 15 coins per page
    }, 1000); // Simulate delay for demo purposes

    const searchBox = document.querySelector('#search-box');
    const searchIcon = document.querySelector('#search-icon');

    // Debouncing function for search
    let debounceTimeout;
    const handleSearch = () => {
        clearTimeout(debounceTimeout);
        debounceTimeout = setTimeout(() => {
            const searchTerm = searchBox.value.trim();
            const filteredCoins = filterCoins(searchTerm);
            currentPage = 1; // Reset to first page when searching
            showShimmer(); // Show shimmer effect before rendering filtered coins
            setTimeout(() => {
                renderCoins(getCoinsForPage(filteredCoins, currentPage, 15), currentPage, 15); // Render filtered coins with 15 coins per page
                renderPagination(filteredCoins, 15); // Update pagination for filtered coins
            }, 500); // Simulate delay for demo purposes
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
        currentPage = 1; // Reset to first page after sorting
        showShimmer(); // Show shimmer effect before rendering sorted coins
        setTimeout(() => {
            renderCoins(getCoinsForPage(coins, currentPage, 15), currentPage, 15);
            renderPagination(coins, 15);
        }, 500); // Simulate delay for demo purposes
    };

    // Function to sort coins by volume
    const sortCoinsByVolume = (order) => {
        if (order === 'asc') {
            coins.sort((a, b) => a.total_volume - b.total_volume);
        } else if (order === 'desc') {
            coins.sort((a, b) => b.total_volume - a.total_volume);
        }
        currentPage = 1; // Reset to first page after sorting
        showShimmer(); // Show shimmer effect before rendering sorted coins
        setTimeout(() => {
            renderCoins(getCoinsForPage(coins, currentPage, 15), currentPage, 15);
            renderPagination(coins, 15);
        }, 500); // Simulate delay for demo purposes
    };

    // Sorting by price ascending
    sortPriceAsc.addEventListener('click', () => {
        sortCoinsByPrice('asc');
    });

    // Sorting by price descending
    sortPriceDesc.addEventListener('click', () => {
        sortCoinsByPrice('desc');
    });

    // Sorting by volume ascending
    sortVolumeAsc.addEventListener('click', () => {
        sortCoinsByVolume('asc');
    });

    // Sorting by volume descending
    sortVolumeDesc.addEventListener('click', () => {
        sortCoinsByVolume('desc');
    });

    // Function to initialize the page
    const initializePage = async () => {
        showShimmer(); // Show shimmer effect initially
        coins = await fetchCoins(); // Fetch coins from API
        setTimeout(() => {
            renderCoins(getCoinsForPage(coins, currentPage, 15), currentPage, 15); // Initial render with 15 coins per page
            renderPagination(coins, 15); // Initial pagination setup for 15 coins per page
        }, 1000); // Simulate delay for demo purposes
    };

    // Initialize the page
    initializePage();
});
