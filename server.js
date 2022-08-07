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
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);
const cohere = require('cohere-ai');
cohere.init(process.env.API);
initializePassport(
    passport, 
    email => users.find(user=>user.email === email),
    id => users.find(user => user.id === id)
)


//You need to fix this from a local variable to connecting with a databse
const users = []
 
//Username
let username = ''

//Stores whether it is generating or classifying
test = 0

//connect to CockroachDB
server.listen(3000)


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
    username = String(req.user.name)
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

//talk to chatbot
app.get('/generate', (req,res) => {
    test = 1
    res.render('generate.ejs')
})

app.get('/classify', (req,res) => {
    test = 2
    res.render('classify.ejs')
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

//Stores prompt
p = 'Question: How do I stay focused?\nAnswer: Eliminate distractions \n--\nQuestion: How do I eat less?\nAnswer: Drink more water.\n--\nQuestion: How can I stay calm?\nAnswer: Take deep breaths.\n--\nQuestion: How to become less hungry?\nAnswer: Don\'t eat too much.\n--\nQuestion: How to stay happy?\nAnswer: Eat more.\n--\n'

io.on('connection', (socket) => {
    socket.on('chat message', (msg) => {
      console.log(username)
      io.emit('chat message', (username + ': ' + msg));
      console.log(test)

      //Generates chatbot text to talk to user
      if(test == 1){
        p += `Question: ${msg}` + '\nAnswer: ';
        console.log(p);
        (async () => {
            const response = await cohere.generate({
                model: 'small',
                prompt: p,
                max_tokens: 50,
                temperature: 0.9,
                k: 0,
                p: 0.75,
                frequency_penalty: 0,
                presence_penalty: 0,
                stop_sequences: ["--"],
                return_likelihoods: 'NONE'
            });
            s = `${response.body.generations[0].text}`
            s = s.split("--")
            for(let i = 0; i < s.length; i++){
                console.log("String piece:" + s[i])
                if(s[i].includes('Question:') || s[i].includes('Answer:') || s[i].includes('                           ')){
                    console.log("it has a question or answer")
                    break
                }
                else{
                    if(s != '\n' || s != '' || s!=null){
                        io.emit('chat message', ("Chatbot: " + s[i]))
                        p += s[i]
                    }
            }
            p+= '\n--\n'
            
            }
            
        })();
      }

      else if(test == 2){
        (async () => {
            const response = await cohere.classify({
              model: '489cf173-a605-4ed6-9a90-67a97244673f-ft',
              inputs: [msg]
            });
            io.emit('chat message', (`Chatbot: Your statement is perceived as ${((response.body.classifications)[0]).prediction}`));
          })();
      }
    });
});








