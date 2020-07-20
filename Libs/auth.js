'use strict'

const jwt = require('./jwt')
const { header } = require('express-validator')
const valid = require('./validation')
const crypto = require('crypto')
const createTokens = require('./refreshToken')
const _ = require('lodash')
const UserModel = require('../Models/UserModel')
const boom = require('boom')

module.exports = [
  header('x-access-token')
    .exists()
    .isJWT(),
  header('x-refresh-token')
    .exists()
    .isJWT(),
  header('x-xsrf-token')
    .exists()
    .isBase64(),
  valid,
  async (req, res, next) => {
    jwt.verify(req.get('x-access-token'), req.get('x-xsrf-token'))
      .then(valid => {
        req.token = valid
        next()
      })
      .catch(err => {
        if (err.name === 'TokenExpiredError') {
          jwt.refresh(req.get('x-refresh-token'))
            .then(valid => {
              console.log('refresh valid')
              console.log(valid)
              UserModel.findOne({ email: _.get(valid, 'payload.user.email') })
                .then(user => {
                  if (!user) {
                    console.log('user')
                    return next(boom.unauthorized())
                  }
                  const payload = {
                    user: _.pick(valid, ['email', '_id'])
                  }
                  const xsrfToken = crypto.randomBytes(64).toString('hex')
                  createTokens(payload, xsrfToken, user, req.headers['user-agent'])
                    .then(props => {
                      res.cookie('x-access-token', props['x-access-token'])
                      res.cookie('x-refresh-token', props['x-refresh-token'])
                      req.token = props
                      next()
                    })
                    .catch(next)
                })
                .catch(err)
            })
            .catch(err => { return next(err) })
        } else {
          return next(err)
        }
      })
  }
]
