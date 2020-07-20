'use strict'

const router = require('express').Router()
const valid = require('../Libs/validation')
const _ = require('lodash')
const boom = require('boom')
const { body } = require('express-validator')
const crypt = require('../Libs/crypt')
const UserModel = require('../Models/UserModel')
const crypto = require('crypto')
const createTokens = require('../Libs/refreshToken')
// A finir module refreshToken
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
    UserModel.findOne({ email: email })
      .then(user => {
        if (!user) {
          return next(boom.unauthorized())
        }
        crypt.compare(password, user.password)
          .then(confirm => {
            if (!confirm) {
              return next(boom.unauthorized())
            }
            const xsrfToken = crypto.randomBytes(64).toString('hex')
            const payload = {
              user: _.pick(user, ['email', '_id'])
            }
            createTokens(payload, xsrfToken, user)
              .then(props => {
                res.cookie('x-access-token', props['x-access-token'])
                res.cookie('x-refresh-token', props['x-refresh-token'])
                res.json({ tokenExpireIn: props.tokenExpireIn, refreshTokenExpireIn: props.refreshTokenExpireIn, xsrf: props.xsrfToken, user: props.user })
              })
              .catch(next)
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
    UserModel.findOne({ email })
      .then(user => {
        console.log(user)
        if (user) {
          return next(boom.conflict())
        }
        crypt.hash(password, 10)
          .then(async (crypto) => {
            console.log(crypto)
            const user = await new UserModel({
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
