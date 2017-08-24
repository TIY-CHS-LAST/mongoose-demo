const express = require('express')
const mustacheExpress = require('mustache-express')
const bodyParser = require('body-parser')
const {
  getAllPeople,
  getPerson,
  getPersonByUsername,
  getPersonByEmail,
  addPerson,
  deletePerson
} = require('./dal')
const app = express()

app.engine('mustache', mustacheExpress())
app.set('view engine', 'mustache')
app.set('views', __dirname + '/views')

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

app.get('/people', (req, res) => {
  getAllPeople().then(function (people) {
    res.json(people)
  })
})
app.post('/new', function (req, res) {
  console.log('req.body', req.body)
  addPerson(req.body).then(function () {
    res.send('it worked')
  })
})
app.get('/new', function (req, res) {
  res.render('newPerson')
})
app.get('/people/:personId', function (req, res) {
  const personId = req.params.personId
  getPerson(personId).then(function (person) {
    res.json(person[0])
  })
})
app.delete('/people/:personId', function (req, res) {
  const personId = req.params.personId
  deletePerson(personId).then(function (response) {
    console.log(response)
    res.send('yay you did it, its gone')
  })
})
app.get('/person', function (req, res) {
  const email = req.query.email
  getPersonByEmail(email).then(function (person) {
    res.json(person)
  })
})
app.get('/person/:username', function (req, res) {
  const username = req.params.username
  getPersonByUsername(username).then(function (person) {
    res.json(person)
  })
})

app.listen(3000, function () {
  console.log('server started on port: 3000')
})
