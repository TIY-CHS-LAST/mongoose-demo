const mongoose = require('mongoose')
const bcrypt = require('bcrypt')

const PersonSchema = new mongoose.Schema({
  name: { type: String, require: true },
  jobTitle: { type: String },
  email: { type: String, require: true },
  living: { type: Boolean, default: true },
  username: { type: String },
  avatar: { type: String },
  profile: { name: { type: String }, picture: { type: String } },
  password: { type: String, select: false },
  updated_at: { type: Date },
  facebook: { type: String },
  tokens: [ { kind: { type: String }, accessToken: { type: String } } ]
})

PersonSchema.pre('save', function (next) {
  const user = this
  if (!user.isModified('password')) {
    next()
  }

  bcrypt.genSalt(10, function (err, salt) {
    bcrypt.hash(user.password, salt, function (err, hash) {
      user.password = hash
      user.updated_at = new Date().toISOString()
      next()
    })
  })
})

PersonSchema.methods.comparePassword = function (pwd, dbPass, done) {
  // pwd = plain text
  bcrypt.compare(pwd, dbPass, (err, isMatch) => {
    done(err, isMatch)
  })
}

PersonSchema.statics.findByEmail = function (email, cb) {
  return this.find({ email: email })
}

const Person = mongoose.model('Person', PersonSchema)

module.exports = Person
