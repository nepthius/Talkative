const express = require('express');
const app = express();
const dotenv = require("dotenv");
dotenv.config()
const bcrypt = require('bcrypt')
const passport = require('passport')
const flash = require('express-flash')
const session = require('express-session')
const methodOverride = require('method-override')
const initializePassport =  require('./passport-config')
initializePassport(
    passport, 
    email => users.find(user=>user.email === email),
    id => users.find(user => user.id === id)
)


//You need to fix this from a local variable to connecting with a databse
const users = []
 

//connect to CockroachDB
app.listen(3000)


//register view engine 
app.set('view engine', 'ejs');

//setting up flash, session, and method override for later use
app.use(flash())
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false
}))
app.use(passport.initialize())
app.use(passport.session())
app.use(methodOverride('_method'))

//middleware and static file
app.use(express.static('public'));
app.use(express.urlencoded({extended:true})) //Accepts form data from register and login and converts


//Direct to homepage
app.get('/', checkAuthenticated, (req, res) => {
    res.render('home.ejs', {title: 'Homepage', name: req.user.name}) 
})

//Login routes
//Directs to login page
app.get('/login', checkNotAuthenticated, (req,res) => {
    res.render('login.ejs') 

})

app.post('/login', checkNotAuthenticated, passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/login',
    failureFlash: true
}))

//Register routes
//Directs to register page
app.get('/register', checkNotAuthenticated, (req,res) => {
    res.render('register.ejs')
})

//registers user and then redirects to login page
app.post('/register', checkNotAuthenticated, async (req, res) => {
    try{
        const hashedPassword = await bcrypt.hash(req.body.password, 10)
        users.push({
            id: Date.now().toString(),
            name: req.body.name,
            email: req.body.email,
            password: hashedPassword
        })
        res.redirect('/login')
    }
    catch{
        res.redirect('/register')
        res.status(500).send()
    }
    
    console.log(users)
})

//logs user out
app.delete('/logout', (req, res) => {
    req.logOut(function(err){
        if (err){return next(err)}
        res.redirect('/login')
    })
})


//middleware that redirects user to login if they are not authenticated
function checkAuthenticated(req, res, next){
    if (req.isAuthenticated()){
        return next()
    }

    res.redirect('/login')
}

function checkNotAuthenticated(req, res, next){
    if (req.isAuthenticated()){
        return res.redirect('/')
    }
    next()
}

