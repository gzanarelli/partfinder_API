'use strict'

const router = require('express').Router()
const valid = require('../Libs/validation')
const _ = require('lodash')
const boom = require('boom')
const { body } = require('express-validator')
const crypt = require('../Libs/crypt')
const User = require('../Models/UserModel')
const jwt = require('../Libs/jwt')
const Promise = require('bluebird')

router.post('/signin',
  body('email')
    .exists()
    .withMessage('This field is required.')
    .isEmail()
    .withMessage('A valid email is required.'),
  body('password')
    .exists()
    .withMessage('This field is required.')
    .isLength(8),
  valid,
  (req, res, next) => {
    const { email, password } = req.body
    User.findOne({ email: email })
      .then(user => {
        if (!user) {
          return next(boom.unauthorized())
        }
        crypt.compare(password, user.password)
          .then(confirm => {
            if (!confirm) {
              return next(boom.unauthorized())
            }
            Promise.props({
              token: jwt.sign(user, process.env.TOKEN_HS512, process.env.TOKEN_EXPIRE),
              refresh: jwt.sign(user, process.env.REFRESH_HS512, process.env.REFRESH_EXPIRE)
            }).then(props => {
              res.header('Authorization', props.token)
              res.header('RefreshToken', props.refresh)
              res.json({ auth: props, user: _.omit(user, 'password') })
            })
              .catch(err => { return next(err) })
          })
          .catch(err => { return next(err) })
      })
      .catch(err => { return next(err) })
  }
)

router.post('/signup',
  body('email')
    .exists()
    .withMessage('This field is required.')
    .isEmail()
    .withMessage('A valid email is required.'),
  body('password')
    .exists()
    .withMessage('This field is required.')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long.'),
  valid,
  (req, res, next) => {
    console.log('entrer')
    const { email, password } = req.body
    User.findOne({ email })
      .then(user => {
        console.log(user)
        if (user) {
          return next(boom.conflict())
        }
        crypt.hash(password, 10)
          .then(async (crypto) => {
            console.log(crypto)
            const user = await new User({
              email,
              password: crypto,
              roles: 'user',
              createOn: Date.now()
            }).save()
            res.json({ user: _.omit(user, ['password']) })
          })
          .catch(err => { return next(err) })
      })
      .catch(err => { return next(err) })
  }
)

module.exports = (app) => {
  app.use('/', router)
}
