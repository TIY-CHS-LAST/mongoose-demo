const router = require('express').Router()
const Person = require('./model')
const {
  getAllPeople,
  getPerson,
  getPersonByUsername,
  getPersonByEmail,
  addPerson,
  deletePerson
} = require('./dal')
const passport = require('passport')
const { isAuthenticated } = require('./passport')

router
  .route('/login')
  .get(function (req, res) {
    // req.session.destroy()
    res.render('login')
  })
  .post((req, res, next) => {
    passport.authenticate('local', (err, user, info) => {
      if (err) {
        return next(err)
      }
      if (!user) {
        return res.redirect('/people/login')
      }
      req.logIn(user, (err, obj) => {
        if (err) {
          return next(err)
        }
        res.redirect('/people/new')
      })
    })(req, res, next)
  })
router.route('/logout').get(function (req, res) {
  req.logout()
  res.redirect('/people')
})
router.route('/register').get(function (req, res) {
  // / use createUser dal methods
  // send back success or redirect
  res.render('add')
})

router
  .route('/')
  .get(async ({ query }, res) => {
    console.log('QUERYSTRING!!!!!!!', query)
    const { email, username } = query
    if (email || username) {
      const [ person ] = email
        ? (await getPersonByEmail(email))
        : (await getPersonByUsername(username))
      person.title = person.name
      return res.render('show', person)
    }
    const people = await getAllPeople()
    res.render('list', { people, title: 'People List' })
  })
  .post(async ({ body }, res) => {
    const result = await addPerson(body)
    res.send(result)
  })

router.route('/new').get(isAuthenticated, (req, res) => {
  console.log(req.session)
  res.render('add')
})

router
  .route('/:personId')
  .get(async ({ params }, res) => {
    const [ person ] = await getPerson(params.personId)
    res.render('show', person)
  })
  .delete(async ({ params }, res) => {
    const result = await deletePerson(params.personId)
    res.send(result)
  })

module.exports = router
