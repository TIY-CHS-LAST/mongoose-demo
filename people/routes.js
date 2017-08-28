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

router
  .route('/login')
  .get(function (req, res) {
    res.render('login')
  })
  .post(function (req, res) {
    // user special dal for login
    // redirect to secret site
    Person.findOne({ username: req.body.username }, '+password', function (
      err,
      user,
      next
    ) {
      if (err) return next(err)
      if (!user) {
        return res.status(401).send({ message: 'Wrong email and/or password' })
      }
      user.comparePassword(req.body.password, user.password, function (
        err,
        isMatch
      ) {
        if (!isMatch) {
          return res
            .status(401)
            .send({ message: 'Wrong email and/or password' })
        }
        res.send({ status: 'success', user: user.name })
      })
    })
  })
router.route('/logout').post(function (req, res) {
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

router.route('/new').get((req, res) => {
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
