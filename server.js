const express = require('express')
const mustacheExpress = require('mustache-express')
const bodyParser = require('body-parser')
const { routes: peopleRoutes } = require('./people')
const app = express()

app.engine('mustache', mustacheExpress())
app.set('view engine', 'mustache')
app.set('views', [ __dirname + '/people/views' ])

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

app.use('/people', peopleRoutes)

app.listen(3000, function () {
  console.log('server started on port: 3000')
})
