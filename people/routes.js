const router = require('express').Router()
const {
  getAllPeople,
  getPerson,
  getPersonByUsername,
  getPersonByEmail,
  addPerson,
  deletePerson
} = require('./dal')
router
  .route('/')
  .get(async ({ query }, res) => {
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
