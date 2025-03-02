function searchMovies() {
    const input = document.getElementById('searchInput').value;
    const apiKey = 'f2f241baa959edc9cefc4c406d947fad';  // Replace this with your actual TMDb API key
    const url = `https://api.themoviedb.org/3/search/movie?api_key=${apiKey}&query=${encodeURI(input)}`;

    fetch(url)
        .then(response => response.json())
        .then(data => {
            if (data.results && data.results.length > 0) {
                displayMovies(data.results);
            } else {
                document.getElementById('movies').innerHTML = '<p>No movies found.</p>';
            }
        })
        .catch(err => {
            console.error('Error fetching the movie data:', err);
            document.getElementById('movies').innerHTML = '<p>Error fetching data.</p>';
        });
}

function displayMovies(movies) {
    let output = '';
    movies.forEach(movie => {
        const posterPath = movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : 'https://via.placeholder.com/500x750?text=No+Image';
        output += `
            <div class="movie">
                <img src="${posterPath}" alt="Movie Poster">
                <h3>${movie.title}</h3>
                <p>${movie.release_date}</p>
            </div>
        `;
    });
    document.getElementById('movies').innerHTML = output;
}
