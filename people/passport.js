const passport = require('passport')
const { Strategy: LocalStrategy } = require('passport-local')
const { Strategy: FacebookStrategy } = require('passport-facebook')
const Person = require('./model')

passport.serializeUser((user, done) => {
  done(null, user.id)
})

passport.deserializeUser((id, done) => {
  Person.findById(id, (err, user) => {
    done(err, user)
  })
})

// local strategy
passport.use(new LocalStrategy((username, password, done) => {
  Person.findOne({ username: username.toLowerCase() }, '+password', (
    err,
    user
  ) => {
    if (err) {
      return done(err)
    }
    if (!user) {
      return done(null, false, { msg: `Username ${username} not found.` })
    }
    user.comparePassword(password, user.password, (err, isMatch) => {
      if (err) {
        return done(err)
      }
      if (isMatch) {
        return done(null, user)
      }
      return done(null, false, { msg: 'Invalid email or password.' })
    })
  })
}))

// facebook
passport.use(new FacebookStrategy(
  {
    clientID: process.env.FACEBOOK_ID,
    clientSecret: process.env.FACEBOOK_SECRET,
    callbackURL: '/auth/facebook/callback',
    profileFields: [ 'name', 'email', 'link', 'locale', 'timezone' ],
    passReqToCallback: true
  },
  (req, accessToken, refreshToken, profile, done) => {
    if (req.user) {
      Person.findOne({ facebook: profile.id }).then(function (person) {
        if (person) {
          done()
        } else {
          Person.findById(req.user).then(function (person) {
            person.facebook = profile.id
            person.tokens.push({ kind: 'facebook', accessToken })
            person.profile = {}
            person.profile.name = person.profile.name ||
              `${profile.name.givenName} ${profile.name.familyName}`

            person.profile.picture = person.profile.picture ||
              `https://graph.facebook.com/${profile.id}/picture?type=large`
            person.save(function (err) {
              done(null, person)
            })
          })
        }
      })
    } else {
      Person.findOne({ facebook: profile.id }).then(function (existingUser) {
        if (existingUser) {
          done(null, existingUser)
        }
        Person
          .findOne({ email: profile._json.email })
          .then(function (existingUser) {
            if (existingUser) {
              // someone has this email, so you cant use
              done()
            }
            const person = new Person()
            person.facebook = profile.id
            person.tokens = []
            person.tokens.push({ kind: 'facebook', accessToken })
            person.profile = {}
            person.profile.name = `${profile.name.givenName} ${profile.name.familyName}`
            person.name = person.profile.name
            person.email = profile._json.email
            person.profile.picture = `https://graph.facebook.com/${profile.id}/picture?type=large`
            person.avatar = person.profile.picture
            person.save(function (err) {
              done(null, person)
            })
          })
      })
    }
  }
))

const isAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next()
  }
  res.redirect('/people/login')
}
module.exports = { isAuthenticated }
