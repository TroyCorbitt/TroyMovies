function searchMovies() {
    let input = document.getElementById('searchInput').value;
    let apiKey = 'YOUR_API_KEY'; // Replace 'YOUR_API_KEY' with your actual API key from OMDB
    let url = `https://www.omdbapi.com/?s=${input}&apikey=${apiKey}`;

    fetch(url)
        .then(response => response.json())
        .then(data => {
            let movies = data.Search;
            let output = '';
            movies.forEach(movie => {
                output += `
                    <div class="movie">
                        <img src="${movie.Poster}" alt="Movie Poster">
                        <h3>${movie.Title}</h3>
                        <p>${movie.Year}</p>
                    </div>
                `;
            });
            document.getElementById('movies').innerHTML = output;
        })
        .catch(err => console.log(err));
}
