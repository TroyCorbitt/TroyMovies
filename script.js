document.addEventListener('DOMContentLoaded', function () {
    console.log("DOM fully loaded");

    document.getElementById('refreshButton').addEventListener('click', function() {
        location.reload(); // Reloads the current page
    });

    const API_KEY = 'f2f241baa959edc9cefc4c406d947fad';
    const BASE_URL = 'https://api.themoviedb.org/3';

    let lastSearchedMovieId = null; // Store the last searched movie ID

    
    function searchMovies() {
        const input = document.getElementById('searchInput').value;
        if (!input) {
            console.log("Empty search input.");
            document.getElementById('movies').innerHTML = '<p>Please enter a movie title to search.</p>';
            return;
        }

        console.log("Search initiated for:", input);
        const url = `${BASE_URL}/search/movie?api_key=${API_KEY}&language=en-US&query=${encodeURIComponent(input)}&page=1&include_adult=false`;

        fetch(url)
            .then(response => response.json())
            .then(data => {
                console.log("Results received:", data);
                if (data.results && data.results.length > 0) {
                    lastSearchedMovieId = data.results[0].id; // Store first movie's ID
                    displayMovies(data.results);
                } else {
                    document.getElementById('movies').innerHTML = '<p>No movies found.</p>';
                }
            })
            .catch(error => {
                console.error('Error fetching the movie data:', error);
                document.getElementById('movies').innerHTML = '<p>Error fetching data. Check console for details.</p>';
            });
    }

    function displayMovies(movies) {
        let output = '';
        console.log("Displaying movies:", movies);

        movies.forEach(movie => {
            const posterPath = movie.poster_path 
                ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` 
                : 'https://via.placeholder.com/500x750?text=No+Image';

            console.log("Processing movie:", movie.title);

            output += `<div class="movie">
                <img src="${posterPath}" alt="${movie.title} Poster">
                <h3>${movie.title}</h3>
                <p>${movie.release_date ? new Date(movie.release_date).getFullYear() : 'Unknown Year'}</p>
                <p class="overview">${movie.overview ? movie.overview.substring(0, 150) + '...' : 'No description available'}</p>
            </div>`;
        });

        document.getElementById('movies').innerHTML = output;
    }

    function fetchReviewsByMovieId(movieId) {
        const url = `${BASE_URL}/movie/${movieId}/reviews?api_key=${API_KEY}`;

        fetch(url)
            .then(response => response.json())
            .then(data => {
                console.log("Reviews received:", data);
                document.getElementById('reviewDetails').innerHTML = '';

                let allReviews = [];

                // Store API reviews
                if (data.results && data.results.length > 0) {
                    allReviews = data.results.map(review => ({
                        author: review.author,
                        content: review.content,
                    }));
                }

                // Retrieve user-submitted reviews
                let userReviews = JSON.parse(localStorage.getItem("userReviews")) || {};
                if (userReviews[movieId]) {
                    userReviews[movieId].forEach(review => {
                        allReviews.push({
                            author: "User",
                            content: review,
                        });
                    });
                }

                if (allReviews.length > 0) {
                    displayReviews(allReviews);
                } else {
                    document.getElementById('reviewDetails').innerHTML = '<p>No reviews found for this movie.</p>';
                }
            })
            .catch(error => {
                console.error('Error fetching reviews:', error);
                document.getElementById('reviewDetails').innerHTML = '<p>Error fetching reviews. Check console for details.</p>';
            });
    }

    function displayReviews(reviews) {
        const reviewDetails = document.getElementById('reviewDetails');
        reviewDetails.innerHTML = "<h3>Movie Reviews</h3>";

        reviews.forEach(review => {
            reviewDetails.innerHTML += `
                <div>
                    <h4>Review by ${review.author}</h4>
                    <p>${review.content}</p>
                </div>`;
        });
    }

    // 🔹 Handle User Reviews 🔹
    function submitUserReview() {
        const reviewText = document.getElementById('userReview').value;
        if (!reviewText) return alert("Please write a review!");

        if (!lastSearchedMovieId) {
            alert("Search for a movie before adding a review.");
            return;
        }

        // Get stored reviews or initialize new
        let reviews = JSON.parse(localStorage.getItem("userReviews")) || {};
        if (!reviews[lastSearchedMovieId]) {
            reviews[lastSearchedMovieId] = [];
        }

        // Add new review
        reviews[lastSearchedMovieId].push(reviewText);
        localStorage.setItem("userReviews", JSON.stringify(reviews));

        // Refresh displayed reviews
        fetchReviewsByMovieId(lastSearchedMovieId);
        document.getElementById('userReview').value = ''; // Clear input field
    }

    // 🔹 Link "Submit Review" Button to Function
    document.getElementById('submitReview').addEventListener('click', submitUserReview);

    // 🔹 Update #reviewButton to fetch reviews for the last searched movie
    document.getElementById('reviewButton').addEventListener('click', function() {
        if (lastSearchedMovieId) {
            fetchReviewsByMovieId(lastSearchedMovieId);
        } else {
            document.getElementById('reviewDetails').innerHTML = '<p>No movie selected. Search for a movie first!</p>';
        }
    });

    // Event listeners
    document.getElementById('searchButton').addEventListener('click', searchMovies);
    document.getElementById('searchInput').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            searchMovies();
        }
    });

    function displayMovies(movies) {
        let output = '';
        console.log("Displaying movies:", movies);
    
        movies.forEach(movie => {
            const posterPath = movie.poster_path 
                ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` 
                : 'https://via.placeholder.com/500x750?text=No+Image';
    
            console.log("Processing movie:", movie.title);
    
            output += `<div class="movie">
                <img src="${posterPath}" alt="${movie.title} Poster">
                <h3>${movie.title}</h3>
                <p>${movie.release_date ? new Date(movie.release_date).getFullYear() : 'Unknown Year'}</p>
                <p class="overview">${movie.overview ? movie.overview.substring(0, 150) + '...' : 'No description available'}</p>
                <button class="details-btn" data-id="${movie.id}">Details</button>
            </div>`;
        });
    
        document.getElementById('movies').innerHTML = output;
    
        // Attach event listeners to Details buttons
        document.querySelectorAll('.details-btn').forEach(button => {
            button.addEventListener('click', function() {
                const movieId = this.getAttribute('data-id');
                fetchMovieCredits(movieId);
            });
        });
    }
    
    // 🔹 Fetch Movie Cast & Crew and Show in Overlay
    function fetchMovieCredits(movieId) {
        const url = `${BASE_URL}/movie/${movieId}/credits?api_key=${API_KEY}`;
    
        fetch(url)
            .then(response => response.json())
            .then(data => {
                console.log("Movie Credits:", data);
                displayCreditsOverlay(data.cast, data.crew);
            })
            .catch(error => {
                console.error('Error fetching credits:', error);
            });
    }
    
    // 🔹 Display Cast & Crew in an Overlay
    function fetchMovieCredits(movieId) {
        const url = `${BASE_URL}/movie/${movieId}/credits?api_key=${API_KEY}`;
    
        fetch(url)
            .then(response => response.json())
            .then(data => {
                console.log("Movie Credits:", data);
                displayCreditsOverlay(data.cast, data.crew);
            })
            .catch(error => {
                console.error('Error fetching movie credits:', error);
            });
    }
    
    function displayCreditsOverlay(cast, crew) {
        const overlay = document.getElementById('creditsOverlay');
        const content = document.getElementById('creditsContent');
        content.innerHTML = `<h2>Cast & Crew</h2>`;
    
        if (cast.length > 0) {
            content.innerHTML += `<h3>Cast</h3><div class="person-grid">`;
            cast.slice(0, 10).forEach(person => {
                const profilePath = person.profile_path
                    ? `https://image.tmdb.org/t/p/w185${person.profile_path}`
                    : 'https://via.placeholder.com/185x278?text=No+Image';
    
                content.innerHTML += `
                    <div class="person">
                        <img src="${profilePath}" alt="${person.name}">
                        <p><strong>${person.name}</strong></p>
                        <p class="character">${person.character}</p>
                    </div>`;
            });
            content.innerHTML += `</div>`;
        }
    
        if (crew.length > 0) {
            content.innerHTML += `<h3>Crew</h3><div class="person-grid">`;
            crew.slice(0, 5).forEach(person => {
                content.innerHTML += `
                    <div class="person">
                        <p><strong>${person.name}</strong></p>
                        <p class="job">${person.job}</p>
                    </div>`;
            });
            content.innerHTML += `</div>`;
        }
    
        overlay.style.display = 'block';
    }
    
    // Close Overlay Button
    document.getElementById('closeOverlay').addEventListener('click', function() {
        document.getElementById('creditsOverlay').style.display = 'none';
    });
    

    function displayReviews(reviews) {
        const reviewDetails = document.getElementById('reviewDetails');
        reviewDetails.innerHTML = "<h3>Movie Reviews</h3>";
    
        reviews.forEach(review => {
            reviewDetails.innerHTML += `
                <div class="review">
                    <h4>Review by ${review.author}</h4>
                    <p>${review.content}</p>
                </div>`;
        });
    }

});
