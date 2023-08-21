// const { response } = require("express");

const loginForm = document.getElementById('loginForm');
    loginForm.addEventListener('submit', async (event) => {
      event.preventDefault();
      const username = document.getElementById('username').value;
      const password = document.getElementById('password').value;

      try {
        const response = await fetch('http://localhost:5173/api/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username, password }),
        });
        const data = await response.json();
        const authToken = data.token;
        localStorage.setItem('authToken', authToken);
        console.log('Authentication response:', data);
        if(data.message === 'Login successful') {
          ipcRenderer.send('navigate', 'dashboard');
        }
      } catch (error) {
        console.error('Authentication error:', response.message);
      }
    });

const signup = document.getElementById('signup');
signup.addEventListener('click', () => {
    console.log('Clicked signup button');
    ipcRenderer.send('navigate', 'signup');
});

ipcRenderer.on('showLoginForm', (event, data) => {
    console.log('showLoginForm event received');
    const errorMessage = document.createElement('p');
    errorMessage.classList.add('error-message');
    errorMessage.innerHTML = data.errorMessage;
})