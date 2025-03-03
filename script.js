document.addEventListener('DOMContentLoaded', function () {
    console.log("DOM fully loaded and parsed");
  
    // Verify that theMovieDb library is available
    if (typeof theMovieDb === 'undefined') {
      console.error("theMovieDb library is not loaded!");
      return;
    } else {
      console.log("theMovieDb library loaded:", theMovieDb);
    }
  
    // Declare API constants
    const API_KEY = 'f2f241baa959edc9cefc4c406d947fad';
    const BASE_URL = 'https://api.themoviedb.org/3';
    theMovieDb.common.apiBaseUrl = BASE_URL;
    theMovieDb.common.api_key = API_KEY; // Ensure our key is used
    if (typeof theMovieDb.common.useHttps !== 'undefined') {
      theMovieDb.common.useHttps = true;
    }
  
    let lastSearchedMovieId = null; // Store the last searched movie ID
  
    // Event listeners for buttons
    document.getElementById('filterByGenreButton').addEventListener('click', function () {
      console.log("Filter by Genre button clicked.");
      filterMovies();
    });
  
    document.getElementById('refreshButton').addEventListener('click', function () {
      console.log("Page reload triggered");
      location.reload();
    });
  
    // Call fetchGenres after variables are declared
    fetchGenres();
  
    // --- Fetch Popular & Top Rated Movies ---
    const MAX_MOVIES_DISPLAY = 6; // Limit number of movies displayed
  
    // Endpoints for popular and top rated movies
    const POPULAR_URL =
      BASE_URL +
      '/discover/movie?include_adult=false&include_video=false&language=en-US&page=1&sort_by=popularity.desc';
    const TOP_RATED_URL =
      BASE_URL +
      '/discover/movie?include_adult=false&include_video=false&language=en-US&page=1&sort_by=vote_average.desc&without_genres=99,10755&vote_count.gte=200';
  
    // Bearer token for authentication for fetch calls
    const token =
      'Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJmMmYyNDFiYWE5NTllZGM5Y2VmYzRjNDA2ZDk0N2ZhZCIsIm5iZiI6MTc0MDg5ODc1Ni42MDksInN1YiI6IjY3YzQwMWM0NzA1M2I5NWE3M2I0OGU4NSIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.qxRJUHz5gOonr0gdb_nZmjF7UeRgM0zr44VRqFD102s';
    const fetchHeaders = {
      Authorization: token,
      accept: 'application/json'
    };
  
    // Check that containers exist
    const popularMoviesContainer = document.getElementById('popularMovies');
    if (!popularMoviesContainer) {
      console.error("popularMovies container not found!");
    } else {
      console.log("popularMovies container found.");
    }
  
    const topRatedMoviesContainer = document.getElementById('topRatedMovies');
    if (!topRatedMoviesContainer) {
      console.error("topRatedMovies container not found!");
    } else {
      console.log("topRatedMovies container found.");
    }
  
    // Helper function to build movie HTML with poster and details.
    function buildMovieHTML(movie) {
      const posterPath = movie.poster_path
        ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
        : 'https://via.placeholder.com/500x750?text=No+Image';
      return `<div class="movie">
                <img src="${posterPath}" alt="${movie.title} Poster" data-id="${movie.id}">
                <h3>${movie.title}</h3>
                <p>${movie.release_date ? new Date(movie.release_date).getFullYear() : 'Unknown Year'}</p>
                <p class="overview">${
                  movie.overview
                    ? movie.overview.substring(0, 150) + '...'
                    : 'No description available'
                }</p>
                <button class="details-btn" data-id="${movie.id}">Details</button>
              </div>`;
    }
  
    // --- Fetch Popular Movies ---
    console.log("Fetching popular movies from URL:", POPULAR_URL);
    fetch(POPULAR_URL, { headers: fetchHeaders })
      .then((response) => {
        console.log("Popular movies response received:", response);
        return response.json();
      })
      .then((data) => {
        console.log("Popular movies fetched:", data);
        let html = '';
        if (data.results && data.results.length) {
          data.results.slice(0, MAX_MOVIES_DISPLAY).forEach((movie) => {
            console.log("Processing popular movie:", movie.title);
            html += buildMovieHTML(movie);
          });
        } else {
          html = '<p>No popular movies found.</p>';
        }
        popularMoviesContainer.innerHTML = html;
        // Attach event listeners for details buttons and images
        document
          .querySelectorAll('#popularMovies .details-btn, #popularMovies .movie img')
          .forEach((element) => {
            element.addEventListener('click', function () {
              const movieId = this.getAttribute('data-id');
              console.log("Popular movie clicked, movieId:", movieId);
              displayMovieDetails(movieId);
            });
          });
      })
      .catch((error) => {
        console.error("Error fetching popular movies:", error);
        popularMoviesContainer.innerHTML = '<p>Error loading popular movies.</p>';
      });
  
    // --- Fetch Top Rated Movies ---
    console.log("Fetching top rated movies from URL:", TOP_RATED_URL);
    fetch(TOP_RATED_URL, { headers: fetchHeaders })
      .then((response) => {
        console.log("Top rated movies response received:", response);
        return response.json();
      })
      .then((data) => {
        console.log("Top rated movies fetched:", data);
        let html = '';
        if (data.results && data.results.length) {
          data.results.slice(0, MAX_MOVIES_DISPLAY).forEach((movie) => {
            console.log("Processing top rated movie:", movie.title);
            html += buildMovieHTML(movie);
          });
        } else {
          html = '<p>No top rated movies found.</p>';
        }
        topRatedMoviesContainer.innerHTML = html;
        // Attach event listeners for details buttons and images
        document
          .querySelectorAll('#topRatedMovies .details-btn, #topRatedMovies .movie img')
          .forEach((element) => {
            element.addEventListener('click', function () {
              const movieId = this.getAttribute('data-id');
              console.log("Top rated movie clicked, movieId:", movieId);
              displayMovieDetails(movieId);
            });
          });
      })
      .catch((error) => {
        console.error("Error fetching top rated movies:", error);
        topRatedMoviesContainer.innerHTML = '<p>Error loading top rated movies.</p>';
      });
  
    // --- Combined Display of Trailer & Credits ---
    function displayMovieDetails(movieId) {
      console.log("Display movie details for movieId:", movieId);
      // Fetch both videos and credits concurrently using callbacks.
      fetchMovieVideos(movieId, function (videoData) {
        fetchMovieCredits(movieId, function (creditsData) {
          displayMovieDetailsOverlay(videoData, creditsData);
        });
      });
    }
  
    // Use fetch to retrieve videos directly via HTTPS.
    function fetchMovieVideos(movieId, callback) {
      const videoUrl = `${BASE_URL}/movie/${movieId}/videos?language=en-US`;
      console.log("Fetching videos from:", videoUrl);
      fetch(videoUrl, { headers: fetchHeaders })
        .then((response) => response.json())
        .then((data) => {
          console.log("Videos fetched:", data);
          callback(data);
        })
        .catch((error) => {
          console.error("Error fetching videos:", error);
          callback(null);
        });
    }
  
    function fetchMovieCredits(movieId, callback) {
      const creditsUrl = `${BASE_URL}/movie/${movieId}/credits?api_key=${API_KEY}`;
      console.log("Fetching credits from:", creditsUrl);
      fetch(creditsUrl)
        .then((response) => response.json())
        .then((data) => {
          console.log("Movie credits fetched:", data);
          callback(data);
        })
        .catch((error) => {
          console.error("Error fetching movie credits:", error);
          callback(null);
        });
    }
  
    // Combined overlay display for trailer and cast.
    function displayMovieDetailsOverlay(videoData, creditsData) {
      console.log("Displaying movie details overlay");
      let trailer = null;
      if (videoData && videoData.results && videoData.results.length) {
        trailer = videoData.results.find(
          (video) => video.type === "Trailer" && video.site === "YouTube"
        );
      }
      let overlayContent = document.getElementById('videoOverlayContent');
      let html = "";
      if (trailer) {
        html += `<iframe width="100%" height="415" src="https://www.youtube.com/embed/${trailer.key}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>`;
      } else {
        html += `<p>No trailer available for this movie.</p>`;
      }
      if (creditsData && creditsData.cast && creditsData.cast.length) {
        html += `<h3>Cast</h3><div class="person-grid">`;
        creditsData.cast.slice(0, 10).forEach((person) => {
          const profilePath = person.profile_path
            ? `https://image.tmdb.org/t/p/w185${person.profile_path}`
            : 'https://via.placeholder.com/185x278?text=No+Image';
          html += `<div class="person">
                    <img src="${profilePath}" alt="${person.name}">
                    <p><strong>${person.name}</strong></p>
                    <p class="character">${person.character}</p>
                   </div>`;
        });
        html += `</div>`;
      } else {
        html += `<p>No cast information available.</p>`;
      }
      overlayContent.innerHTML = html;
      document.getElementById('videoOverlay').classList.add('active');
    }
  
    // Close the combined overlay.
    document.getElementById('closeVideoOverlay').addEventListener('click', function () {
      document.getElementById('videoOverlay').classList.remove('active');
    });
  
    // --- Remaining Functions (fetchGenres, searchMovies, etc.) ---
    function fetchGenres() {
      console.log("Fetching genres...");
      const url = `${BASE_URL}/genre/movie/list?api_key=${API_KEY}&language=en-US`;
      fetch(url)
        .then((response) => response.json())
        .then((data) => {
          console.log("Genres fetched:", data.genres);
          populateGenresDropdown(data.genres);
        })
        .catch((err) => console.error("Failed to fetch genres:", err));
    }
  
    function populateGenresDropdown(genres) {
      console.log("Populating genre dropdown");
      const select = document.getElementById("genreSelect");
      genres.forEach((genre) => {
        const option = document.createElement("option");
        option.value = genre.id;
        option.textContent = genre.name;
        select.appendChild(option);
      });
    }
  
    document.getElementById("searchButton").addEventListener("click", searchMovies);
    document.getElementById("searchInput").addEventListener("keypress", function (e) {
      if (e.key === "Enter") {
        searchMovies();
      }
    });
  
    function searchMovies() {
      const input = document.getElementById("searchInput").value;
      console.log("Search input received:", input);
      if (!input) {
        console.log("Empty search input.");
        document.getElementById("movies").innerHTML = '<p>Please enter a movie title to search.</p>';
        return;
      }
      fetchMovies(input);
    }
  
    function fetchMovies(query) {
      console.log("Fetching movies for query:", query);
      const url = `${BASE_URL}/search/movie?api_key=${API_KEY}&language=en-US&query=${encodeURIComponent(
        query
      )}&page=1&include_adult=false`;
      fetch(url)
        .then((response) => response.json())
        .then((data) => {
          console.log("Movies fetched:", data.results);
          if (data.results && data.results.length > 0) {
            lastSearchedMovieId = data.results[0].id;
            displayMovies(data.results);
          } else {
            document.getElementById("movies").innerHTML = '<p>No movies found.</p>';
          }
        })
        .catch((error) => {
          console.error("Error fetching the movie data:", error);
          document.getElementById("movies").innerHTML =
            '<p>Error fetching data. Check console for details.</p>';
        });
    }
  
    function displayMovies(movies) {
      let output = "";
      console.log("Displaying movies:", movies);
      movies.forEach((movie) => {
        const posterPath = movie.poster_path
          ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
          : 'https://via.placeholder.com/500x750?text=No+Image';
        console.log("Processing movie:", movie.title);
        output += `<div class="movie">
          <img src="${posterPath}" alt="${movie.title} Poster" data-id="${movie.id}">
          <h3>${movie.title}</h3>
          <p>${movie.release_date ? new Date(movie.release_date).getFullYear() : 'Unknown Year'}</p>
          <p class="overview">${movie.overview ? movie.overview.substring(0, 150) + '...' : 'No description available'}</p>
          <button class="details-btn" data-id="${movie.id}">Details</button>
        </div>`;
      });
      document.getElementById("movies").innerHTML = output;
      document.querySelectorAll(".details-btn, .movie img").forEach((button) => {
        button.addEventListener("click", function () {
          const movieId = this.getAttribute("data-id");
          console.log("Movie clicked in search results, movieId:", movieId);
          displayMovieDetails(movieId);
        });
      });
    }
  
    function filterMovies() {
      const genreId = document.getElementById("genreSelect").value;
      if (!genreId) {
        console.warn("No genre selected.");
        alert("Please select a genre.");
        return;
      }
      console.log(`Filtering movies for genre ID: ${genreId}`);
      const url = `${BASE_URL}/discover/movie?api_key=${API_KEY}&language=en-US&with_genres=${genreId}`;
      fetch(url)
        .then((response) => response.json())
        .then((data) => {
          console.log("Movies fetched for genre:", data.results);
          if (data.results && data.results.length > 0) {
            displayMovies(data.results);
          } else {
            console.warn("No movies found for this genre.");
            document.getElementById("movies").innerHTML = '<p>No movies found for this genre.</p>';
          }
        })
        .catch((error) => {
          console.error("Error fetching the movies by genre:", error);
          document.getElementById("movies").innerHTML =
            '<p>Error fetching data. Check console for details.</p>';
        });
    }
  
    function fetchReviewsByMovieId(movieId) {
      const url = `${BASE_URL}/movie/${movieId}/reviews?api_key=${API_KEY}`;
      fetch(url)
        .then((response) => response.json())
        .then((data) => {
          console.log("Reviews received:", data);
          document.getElementById("reviewDetails").innerHTML = "";
          let allReviews = [];
          if (data.results && data.results.length > 0) {
            allReviews = data.results.map((review) => ({
              author: review.author,
              content: review.content,
            }));
          }
          let userReviews = JSON.parse(localStorage.getItem("userReviews")) || {};
          if (userReviews[movieId]) {
            userReviews[movieId].forEach((review) => {
              allReviews.push({
                author: "User",
                content: review,
              });
            });
          }
          if (allReviews.length > 0) {
            displayReviews(allReviews);
          } else {
            document.getElementById("reviewDetails").innerHTML =
              '<p>No reviews found for this movie.</p>';
          }
        })
        .catch((error) => {
          console.error("Error fetching reviews:", error);
          document.getElementById("reviewDetails").innerHTML =
            '<p>Error fetching reviews. Check console for details.</p>';
        });
    }
  
    function displayReviews(reviews) {
      const reviewDetails = document.getElementById("reviewDetails");
      reviewDetails.innerHTML = "<h3>Movie Reviews</h3>";
      reviews.forEach((review) => {
        reviewDetails.innerHTML += `
                  <div class="review">
                      <h4>Review by ${review.author}</h4>
                      <p>${review.content}</p>
                  </div>`;
      });
    }
  
    function submitUserReview() {
      const reviewText = document.getElementById("userReview").value;
      if (!reviewText) return alert("Please write a review!");
      if (!lastSearchedMovieId) {
        alert("Search for a movie before adding a review.");
        return;
      }
      let reviews = JSON.parse(localStorage.getItem("userReviews")) || {};
      if (!reviews[lastSearchedMovieId]) {
        reviews[lastSearchedMovieId] = [];
      }
      reviews[lastSearchedMovieId].push(reviewText);
      localStorage.setItem("userReviews", JSON.stringify(reviews));
      fetchReviewsByMovieId(lastSearchedMovieId);
      document.getElementById("userReview").value = "";
    }
  
    document.getElementById("submitReview").addEventListener("click", submitUserReview);
    document.getElementById("reviewButton").addEventListener("click", function () {
      if (lastSearchedMovieId) {
        fetchReviewsByMovieId(lastSearchedMovieId);
      } else {
        document.getElementById("reviewDetails").innerHTML =
          '<p>No movie selected. Search for a movie first!</p>';
      }
    });
  
    function fetchMovieCredits(movieId) {
      const url = `${BASE_URL}/movie/${movieId}/credits?api_key=${API_KEY}`;
      fetch(url)
        .then((response) => response.json())
        .then((data) => {
          console.log("Movie Credits:", data);
          displayCreditsOverlay(data.cast, data.crew);
        })
        .catch((error) => {
          console.error("Error fetching movie credits:", error);
        });
    }
  
    function displayCreditsOverlay(cast, crew) {
      const overlay = document.getElementById("creditsOverlay");
      const content = document.getElementById("creditsContent");
      content.innerHTML = `<h2>Cast & Crew</h2>`;
      if (cast.length > 0) {
        content.innerHTML += `<h3>Cast</h3><div class="person-grid">`;
        cast.slice(0, 10).forEach((person) => {
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
        crew.slice(0, 5).forEach((person) => {
          content.innerHTML += `
                      <div class="person">
                          <p><strong>${person.name}</strong></p>
                          <p class="job">${person.job}</p>
                      </div>`;
        });
        content.innerHTML += `</div>`;
      }
      overlay.style.display = "block";
    }
  
    document.getElementById("closeOverlay").addEventListener("click", function () {
      document.getElementById("creditsOverlay").style.display = "none";
    });
  });
  