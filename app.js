if(process.env.NODE_ENV !== 'production'){
    require('dotenv').config();
}


const express = require('express');
const mongoose = require('mongoose');
const app = express();
const Video = require('./models/video');
const User = require('./models/user');
// const bcrypt = require('bcrypt');
const passport = require('passport');
// const flash = require('express-flash');
const session = require('express-session');
const jwt = require('jsonwebtoken');


// const initializePassport = require('./passport-config');
// initializePassport(
//     passport, 
//     email =>  {
//         User.findOne({email: email}).then((user) => {
//             return user;
//         })
//     },
//     async id => {
//         const user = await User.findById(id);
//         return user;
//         })




const port = 5173;

const dbURI = 'mongodb://0.0.0.0:27017/you-tongue';
mongoose.connect(dbURI, { useNewUrlParser: true, useUnifiedTopology: true })
.then((result) => {
    console.log('Connected to db');
    app.listen(port, () => {
        console.log(`Server running on port ${port}`);
    })
})
.catch((err) => console.log(err));

app.use(express.static('public'));
app.use(express.json());
app.set('view engine', 'ejs');
app.set('views', './views');
app.use(express.urlencoded({ extended: false }));

// app.use(flash());
app.use(session({
    secret : process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser(User.serializeUser()); 
passport.deserializeUser(User.deserializeUser());

const LocalStrategy = require('passport-local').Strategy;
passport.use(new LocalStrategy(User.authenticate()));

app.get('/', (req, res) => {
    if (!req.isAuthenticated()) {
        return res.redirect('/login'); // Redirect to the login page if not authenticated
    }

    res.render('home', { title: 'Home', user: req.user }); // Render the home page with user details
});


app.get('/login', (req, res) => {
    res.render('login', { title: 'Login' })
})

app.post('/login', (req, res, next) => {
    if (!req.body.username || !req.body.password) {
        const errorMessage = "Please enter username and password";
        return res.render('login', { title: 'Login', errorMessage: null });
    }

    passport.authenticate('local', (err, user, info) => {
        if (err) {
            return res.render('login', { title: 'Login', errorMessage: err });
        }
        if (!user) {
            const errorMessage = "Username or password incorrect";
            return res.render('login', { title: 'Login', errorMessage });
        }

        req.login(user, (loginErr) => {
            if (loginErr) {
                return res.render('login', { title: 'Login', errorMessage: loginErr });
            }

            const token = jwt.sign({ userId: user._id }, process.env.SESSION_SECRET, { expiresIn: '1d' });
            res.redirect('/'); // Redirect to the root URL after successful login
        });
    })(req, res, next);
});


app.get('/logout', (req, res) => {
    req.logout(); // Terminate the user's session
    res.redirect('/login'); // Redirect to the login page after signing out
});


app.get('/signup', (req, res) => {
    res.render('signup', { title: 'Signup'})
})

app.post('/signup', async (req, res) => {
    User.register(new User({username: req.body.username, email: req.body.email, points: 0}), req.body.password, (err, user) => {
        if (err) {
            res.json({success: false, message: "Your account could not be saved. Error: ", err});
        } else {
            req.login(user, (err) => {
                if (err) {
                    res.json({success: false, message: err});
                } else {
                    res.json({success: true, message: "Your account has been saved"});
                }
            });
        }
    })
})

app.get('/search', (req, res) => {
    res.render('search', { title: 'Search' })
})

app.get('/player', (req, res) => {
    res.render('player', { title: 'Player' })
})

app.get('/account', (req, res) => {
    res.render('account', { title: 'Account' })
})

app.get('/about', (req, res) => {
    res.render('about', { title: 'About' })
})

// app.get('/add-user', (req, res) => {
//     const user = new User({
//         username: 'test',
//         password: 'test',
//         points: 0
//     })

//     user.save()
//         .then((result) => {
//             res.send(result);
//         })
//         .catch((err) => console.log(err));
// })

app.get('/users', (req, res) => {
    User.find()
        .then((result) => {
            res.send(result);
        })
        .catch((err) => console.log(err));
})



// app.post('/users', async (req, res) => {
//     try{
//         const hashedPassword = await bcrypt.hash(req.body.password, 10);
//         const user = {username: req.body.username, password: hashedPassword, points: req.body.points};
//         users.push(user);
//         res.status(201).send(`User with username ${user.username} added to the database`);
//     } catch {
//         res.status(500).send();    
//     }
// })

// app.post('/users/login', async (req, res) => {
//     const user = users.find(user => user.username === req.body.username);
//     if(user == null){
//         return res.status(400).send('Cannot find user');
//     }
//     try{
//         if(await bcrypt.compare(req.body.password, user.password)){
//             res.send('Success');
//         } else {
//             res.send('Not allowed');
//         }
//     } catch {
//         res.status(500).send();
//     }
// })

// app.get()

