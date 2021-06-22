require('dotenv').config()
const express = require('express')
const app = express()
const methodOverride = require('method-override')
const path = require('path')
const logger = require('morgan')
const mongoose = require('mongoose')
const session = require('express-session')

const Article = require('./models/article')
const articleRouter = require('./routes/articles')

const User = require('./models/user')

app.use(express.static(path.join(__dirname, "public")))
app.use(logger("dev"))
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(methodOverride('_method'))

app.use(session({
    secret: process.env.SECRET,
    resave: true,
    saveUninitialized: true,
}))

app.set('view engine', 'ejs')

mongoose.connect(process.env.MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
    useCreateIndex: true
}).then(() => console.log('DB connected'))
  .catch(error => console.log(error))

app.get('/', (req, res) => {
    res.render('signup.ejs')
})

app.post('/signup', async (req, res) => {
    try {
        const user = new User({
            name: req.body.name,
            email: req.body.email,
            password: req.body.password
        })
        await user.save()
        console.log('user created')
        res.redirect('/login')
    } catch{
        res.redirect('/')
    }
})

app.get('/login', (req, res) => {
    res.render('login.ejs')
})

app.post('/signin',async (req, res) => {
    await User.find({ email: req.body.email }).then(data => {
        if(req.body.password == data[0].password){
            req.session.user = data[0]
            res.redirect('/home')
        }
    }).catch(e => {
        console.log(e)
        res.send('error')
    })
})

app.get('/home', permit, async (req,res) => {
    const articles = await Article.find().sort({
        createdAt: 'desc'})
    res.render('articles/index', { articles: articles, user: req.session.user })
})

app.post('/logout', (req, res) => {
    req.session.destroy()
    res.redirect('/')
})

app.use('/articles', articleRouter)

function permit(req, res, next){
    if(req.session.user){
        return next()
    }else{
        res.redirect('/')
    }
}

app.use(function (req, res){
    res.send("Page not found")
})

let port = process.env.PORT || 3000;

app.listen(port)