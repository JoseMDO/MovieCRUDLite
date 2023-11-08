async function getMovies() {
    await fetch('http://localhost:3000/readjson', {
        method: "GET"
    })
    .then((response) => response.json())
    .then((data) => {
        // Process the movie data
        const movieList = document.getElementById('movies');

        // Loop through the data and populate the movie list
        data.forEach((movie) => {
        const option = document.createElement('option');
        option.value = movie._id; // Use a unique identifier (e.g., _id) as the value
        option.text = movie.title; // Display the movie title
        movieList.appendChild(option);
        });
    })
    .catch((error) => {
        console.error('Failed to fetch movie data', error);
    });
}




    const updateBtn = document.getElementById('update-button')
    if (updateBtn) {
        updateBtn.addEventListener('click', () => {
            // Get the selected movie's ID and updated data from the form or input fields
            const selectedMovieId = document.getElementById('movies').value;
            const updatedTitle = document.getElementById('new-title').value;
            const updatedComments = document.getElementById('new-comment').value;
            console.log(selectedMovieId);

            // Prepare the data to send in the request body
            const updatedData = {
            title: updatedTitle,
            comments: updatedComments,
            };
        
            // Send a PUT request to your Express.js server
            fetch(`http://localhost:3000/update/${selectedMovieId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(updatedData),
            })
            .then((response) => response.json())
            .then((data) => {
                // Handle the response (e.g., show success message)
                console.log('Update successful', data);
            })
            .catch((error) => {
                // Handle errors (e.g., show error message)
                console.error('Update failed', error);
            });
        });
    }
    

const deleteBtn = document.getElementById('delete-button')
if (deleteBtn) {
    deleteBtn.addEventListener('click', () => {
    // Get the selected movie's ID and updated data from the form or input fields
    const selectedMovieId = document.getElementById('movies').value;

    // Prepare the data to send in the request body
  
    // Send a PUT request to your Express.js server
    fetch(`http://localhost:3000/delete/${selectedMovieId}`, {
      method: 'DELETE',
    })
      .then((response) => response.json())
      .then((data) => {
        // Handle the response (e.g., show success message)
        console.log('Update successful', data);
      })
      .catch((error) => {
        // Handle errors (e.g., show error message)
        console.error('Update failed', error);
      });
  });
}

getMovies()