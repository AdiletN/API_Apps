const apiKey = '6477d87c2a179d5bbe68ba6a1953a7e6';
const apiUrl = `https://api.themoviedb.org/3`;
const noposterImage = 'images/noposter.jpg'
let currentMovies = [];

const fetchMovies = async () => {
    showLoading(true);
    try {
        const response = await fetch(`${apiUrl}/movie/popular?api_key=${apiKey}&language=en-US&page=1`);
        if (!response.ok) throw new Error('Network response was not ok');
        const data = await response.json();
        currentMovies = data.results;
        applySorting();
    } catch (error) {
        console.error('Fetch error:', error);
        alert('Failed to load movies. Please try again later.');
    }
    showLoading(false);
};

const searchMovies = async (query) => {
    showLoading(true);
    try {
        const response = await fetch(`${apiUrl}/search/movie?api_key=${apiKey}&query=${query}`);
        if (!response.ok) throw new Error('Network response was not ok');
        const data = await response.json();
        currentMovies = data.results;
        applySorting();
    } catch (error) {
        console.error('Fetch error:', error);
        alert('Failed to search movies. Please try again later.');
    }
    showLoading(false);
};

const displayMovies = (movies) => {
    const movieGrid = document.getElementById('movieGrid');
    movieGrid.innerHTML = '';

    movies.forEach(movie => {
        const movieItem = document.createElement('div');
        movieItem.classList.add('movie-item');
        const posterUrl = movie.poster_path
            ? `https://image.tmdb.org/t/p/w200${movie.poster_path}`
            : noposterImage;

        movieItem.innerHTML = `
            <img src="${posterUrl}" alt="${movie.title}">
            <h3>${movie.title}</h3>
            <p>${movie.release_date}</p>
        `;
        movieItem.addEventListener('click', () => openModal(movie));
        movieGrid.appendChild(movieItem);
    });
};

const applySorting = () => {
    const sortOption = document.getElementById('sortOptions').value;

    if (sortOption === 'popularity.desc') {
        currentMovies.sort((a, b) => b.popularity - a.popularity);
    } else if (sortOption === 'release_date.desc') {
        currentMovies.sort((a, b) => new Date(b.release_date) - new Date(a.release_date));
    }

    displayMovies(currentMovies);
};

document.getElementById('sortOptions').addEventListener('change', applySorting);

const updateWatchlistButtons = (movie) => {
    const watchlist = JSON.parse(localStorage.getItem('watchlist')) || [];
    const isInWatchlist = watchlist.some(item => item.id === movie.id);
    
    const addToWatchlistBtn = document.querySelector('.add-to-watchlist');
    const removeFromWatchlistBtn = document.querySelector('.remove-from-watchlist');

    if (isInWatchlist) {
        addToWatchlistBtn.style.display = 'none';
        removeFromWatchlistBtn.style.display = 'inline-block';
    } else {
        addToWatchlistBtn.style.display = 'inline-block';
        removeFromWatchlistBtn.style.display = 'none';
    }
};

const addToWatchlist = (movie) => {
    let watchlist = JSON.parse(localStorage.getItem('watchlist')) || [];
    watchlist.push(movie);
    localStorage.setItem('watchlist', JSON.stringify(watchlist));

    alert(`${movie.title} added to watchlist`);

    updateWatchlistButtons(movie);
};

const removeFromWatchlist = (movie) => {
    let watchlist = JSON.parse(localStorage.getItem('watchlist')) || [];
    watchlist = watchlist.filter(item => item.id !== movie.id);
    localStorage.setItem('watchlist', JSON.stringify(watchlist));

    alert(`${movie.title} removed from watchlist`);

    updateWatchlistButtons(movie);
};

const openModal = (movie) => {
    document.getElementById('movieTitle').textContent = movie.title;
    document.getElementById('moviePoster').src = movie.poster_path 
        ? `https://image.tmdb.org/t/p/w300${movie.poster_path}` 
        : noposterImage;
    document.getElementById('movieOverview').textContent = movie.overview;
    document.getElementById('releaseDate').textContent = movie.release_date;
    document.getElementById('voteAverage').textContent = movie.vote_average;
    document.getElementById('voteCount').textContent = movie.vote_count;

    document.getElementById('movieModal').style.display = 'flex';
    document.body.classList.add('modal-open');

    updateWatchlistButtons(movie);

    document.querySelector('.add-to-watchlist').onclick = () => addToWatchlist(movie);
    document.querySelector('.remove-from-watchlist').onclick = () => removeFromWatchlist(movie);
};

document.querySelector('.close').onclick = () => {
    document.getElementById('movieModal').style.display = 'none';
    document.body.classList.remove('modal-open');
};
document.getElementById('movieModal').addEventListener('click', (e) => {
    if (e.target === document.getElementById('movieModal')) {
        document.getElementById('movieModal').style.display = 'none';
        document.body.classList.remove('modal-open');
    }
});


document.getElementById('searchInput').addEventListener('input', (e) => {
    const query = e.target.value;
    if (query.length > 2) {
        searchMovies(query);
    } else {
        fetchMovies();
    }
});

const showLoading = (isLoading) => {
    document.getElementById('loading').style.display = isLoading ? 'block' : 'none';
};

fetchMovies();
