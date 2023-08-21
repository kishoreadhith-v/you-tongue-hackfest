// const {ipcRenderer} = require('electron');

const login = document.getElementById('login');
login.addEventListener('click', () => {
    ipcRenderer.send('navigate', 'login');
});

document.addEventListener('DOMContentLoaded', () => {
    const signupForm = document.querySelector('form');
    const emailInput = document.getElementById('email');
    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');
    const password2Input = document.getElementById('password2');
    const loginButton = document.getElementById('login');

    signupForm.addEventListener('submit', async (event) => {
        event.preventDefault();

        const email = emailInput.value;
        const username = usernameInput.value;
        const password = passwordInput.value;
        const password2 = password2Input.value;

        // Validate form fields
        if (password !== password2) {
            // Display an error message if passwords don't match
            console.error('Passwords do not match');
            return;
        }

        try {
            const response = await fetch('http://localhost:5173/api/signup', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, username, password })
            });

            const data = await response.json();
            if (data.success) {
                // Account registered successfully, you can redirect or show a success message
                console.log('Account registered successfully:', data.message);
                ipcRenderer.send('navigate', 'login');
            } else {
                // Error occurred during registration, handle and display error message
                console.error('Registration error:', data.message);
            }
        } catch (error) {
            console.error('An error occurred:', error);
        }
    });

    loginButton.addEventListener('click', () => {
        // Redirect to the login page or perform other actions
        console.log('Redirect to login page');
    });
});


// ipcRenderer.on('load-page', (event, pageName) => {
//     const filePath = '../../' + pageName + '.html';
//     document.querySelector('webview').src = filePath;
// })