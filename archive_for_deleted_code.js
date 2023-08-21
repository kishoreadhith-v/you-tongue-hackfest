app.get('/', checkAuthenticated, (req, res) => {
    res.render('home', { title: 'Home', user: req.user }); // Render the home page with user details
});


app.get('/login', checkNotAuthenticated, (req, res) => {
    if (req.isAuthenticated()) {
        return res.redirect('/'); // Redirect to the home page if already authenticated
    }
    res.render('login', { title: 'Login' , errorMessage: null})
})


app.get('/logout', (req, res) => {
    req.logout(() => {
        res.redirect('/login'); // Redirect to the login page after signing out
    });
});


app.get('/signup', checkNotAuthenticated, (req, res) => {
    res.render('signup', { title: 'Signup'})
})


app.get('/search', checkAuthenticated, (req, res) => {
    res.render('search', { title: 'Search' })
})

app.get('/player', checkAuthenticated, (req, res) => {
    res.render('player', { title: 'Player' })
})

// app.get('/api/account', (req, res) => {
//     const authToken = req.headers.authorization;
    
//     if (!authToken) {
//         return res.status(401).json({ error: 'Authorization token missing' });
//     }

//     try {
//         const decodedToken = jwt.verify(authToken.split(' ')[1], process.env.SESSION_SECRET);
    
//         const userId = decodedToken.userId;
    
//         // Fetch user information from the database using Mongoose
//         const user = await User.findById(userId);
    
//         if (!user) {
//             return res.status(404).json({ error: 'User not found' });
//         }
    
//         // Return the user information
//         return res.status(200).json({
//             username: user.username,
//             email: user.email,
//             points: user.points
//         });
//     } catch (error) {
//         return res.status(401).json({ error: 'Invalid token' });
//     }
    
// });

app.get('/about', (req, res) => {
    res.render('about', { title: 'About' })
})

function checkAuthenticated(req, res, next){
    if(req.isAuthenticated()){
        return next()
    }
    
    res.redirect('/login')
}

function checkNotAuthenticated(req, res, next){
    if(req.isAuthenticated()){
        return res.redirect('/')
    }
    next()
}
