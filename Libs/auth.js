'use strict'

const jwt = require('./jwt')
const { header } = require('express-validator')
const valid = require('./validation')
const Promise = require('bluebird')

module.exports = [
  header('Authorization')
    .exists()
    .isJWT(),
  valid,
  async (req, res, next) => {
    jwt.verify(req.get('Authorization'))
      .then(valid => {
        req.token = valid
        next()
      })
      .catch(err => {
        console.log(err)
        jwt.refresh(req.get('refreshToken'))
          .then(valid => {
            Promise.props({
              token: jwt.sign(valid, process.env.TOKEN_HS512, process.env.TOKEN_EXPIRE),
              refresh: jwt.sign(valid, process.env.REFRESH_HS512, process.env.REFRESH_EXPIRE)
            }).then(props => {
              res.header('Authorization', props.token)
              res.header('RefreshToken', props.refresh)
              req.token = props.token
              req.refresh = props.refresh
              next()
            })
              .catch(err => { return next(err) })
          })
          .catch(err => { return next(err) })
      })
  }
]