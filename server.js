const express = require('express')
const mustacheExpress = require('mustache-express')
const bodyParser = require('body-parser')
const { peopleRoutes, passportConfig } = require('./people')

const session = require('express-session')
const app = express()
const Person = require('./people/model')
const passport = require('passport')
const MongoStore = require('connect-mongo')(session)
console.log(process.env.FACEBOOK_ID, 'facebook id!!!!')
app.use(
  session({
    resave: true,
    saveUninitialized: true,
    secret: process.env.SESSION_SECRET || 'super secret',
    store: new MongoStore({
      url: process.env.MONGODB_URI ||
        process.env.MONGOLAB_URI ||
        'mongodb://localhost:27017/sesh',
      autoReconnect: true,
      clear_interval: 3600
    })
  })
)
app.use(passport.initialize())
app.use(passport.session())
app.engine('mustache', mustacheExpress())
app.set('view engine', 'mustache')
app.set('views', __dirname + '/people/views')

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

app.use('/people', peopleRoutes)
app.get(
  '/auth/facebook',
  passport.authenticate('facebook', { scope: [ 'email', 'public_profile' ] })
)
app.get(
  '/auth/facebook/callback',
  passport.authenticate('facebook', { failureRedirect: '/people/login' }),
  (req, res) => {
    console.log('do we get here!!!')
    res.redirect(req.session.returnTo || '/')
  }
)
app.listen(3000, function () {
  console.log('server started on port: 3000')
})
