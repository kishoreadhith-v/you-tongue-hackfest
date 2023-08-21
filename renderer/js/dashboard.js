const searchBtn = document.getElementById('search');
searchBtn.addEventListener('click', () => {
    ipcRenderer.send('navigate', 'search');
});

window.addEventListener('DOMContentLoaded', () => {
    const usernameElement = document.getElementById('username');
    const emailElement = document.getElementById('email');
    const pointsElement = document.getElementById('points');

    // Make a request to fetch user account information
    fetch('http://localhost:5173/api/account', {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`Request failed with status: ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        const { username, email, points } = data;
        usernameElement.textContent = username;
        emailElement.textContent = email;
        pointsElement.textContent = points;
    })
    .catch(error => {
        console.error(error);
        // Handle the error, show an error message, etc.
    });
});
