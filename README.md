# MovieLovers

MovieLovers is a web application that lets users search for movies, view popular and top-rated movies from [The Movie Database (TMDb)](https://www.themoviedb.org/), and get additional details such as trailers, cast/crew information, and user reviews. The project is built using HTML, CSS, and JavaScript and leverages the TMDb API for movie data.

## Features

- **Popular Movies:**  
  Displays a list of popular movies retrieved from TMDb.

- **Top Rated Movies:**  
  Displays a list of top-rated movies (with filters like vote count and excluding specific genres).

- **Movie Search:**  
  Users can search for movies by title.

- **Genre Filter:**  
  Users can filter movies by genre.

- **Movie Details:**  
  When a movie tile (poster or details button) is clicked, the app fetches and displays:
  - A YouTube trailer (if available)
  - A grid of cast information

- **User Reviews:**  
  Users can view reviews fetched from TMDb and submit their own reviews (stored in local storage).

## Setup

1. **Clone the Repository:**

   ```bash
   git clone <repository-url>
   cd <repository-folder>
