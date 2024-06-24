// favorites.js

const options = {
    method: 'GET',
    headers: { accept: 'application/json', 'x-cg-demo-api-key': 'CG-mDVVqLm5xBDjvcVq523LnAmB' },
};

const getFavorites = () => {
    return JSON.parse(localStorage.getItem('favorites')) || [];
};

const fetchFavoriteCoins = async (ids) => {
    try {
        showShimmer(); // Show shimmer effect before fetching data
        const response = await fetch(`https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=${ids.join(',')}`, options);
        const coins = await response.json();
        hideShimmer(); // Hide shimmer effect after data is fetched
        return coins;
    } catch (err) {
        console.error(err);
        hideShimmer(); // Ensure shimmer is hidden in case of an error
    }
};

const renderFavorites = (coins) => {
    const tableBody = document.querySelector('#favorite-table tbody');
    const noFavoritesMessage = document.querySelector('#no-favorites');
    tableBody.innerHTML = '';

    if (coins.length === 0) {
        noFavoritesMessage.style.display = 'block';
        return;
    } else {
        noFavoritesMessage.style.display = 'none';
    }

    coins.forEach((coin, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${index + 1}</td>
            <td><img src="${coin.image}" alt="${coin.name}" width="24" height="24" /></td>
            <td>${coin.name}</td>
            <td>$${coin.current_price.toLocaleString()}</td>
            <td>$${coin.total_volume.toLocaleString()}</td>
            <td>$${coin.market_cap.toLocaleString()}</td>
        `;
        row.addEventListener('click', () => {
            window.location.href = `coin.html?id=${coin.id}`;
        });
        tableBody.appendChild(row);
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
    const favorites = getFavorites();
    if (favorites.length === 0) {
        renderFavorites([]);
    } else {
        const favoriteCoins = await fetchFavoriteCoins(favorites);
        renderFavorites(favoriteCoins);
    }
});
