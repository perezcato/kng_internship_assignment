import Joi from '@hapi/joi'
import User from '../models/User.js'
import crypto from 'crypto'
import passport from 'passport'
import createError from 'http-errors'
import dotenv from 'dotenv'
import sgMail from '@sendgrid/mail'
import mailGun from '../services/mail.js'

dotenv.config()
sgMail.setApiKey(process.env.SENDGRID_KEY)

export const showRegisterationForm = (req, res, next) => {
  res.render('register', { errors: req.flash('registerError')[0] })
}

export const register = async (req, res, next) => {
  const frmDetails = req.body
  const frmValidation = Joi.object({
    name: Joi.string().required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(8).required(),
    cpassword: Joi.string().required()
  }).validate(frmDetails)
  if (frmValidation.error) {
    req.flash('registerError', frmValidation.error.details[0].message)
    return res.redirect('/register')
  }

  if (frmValidation.value.password !== frmValidation.value.cpassword) {
    req.flash('registerError', 'Password should match')
    return res.redirect('/register')
  }
  try {
    const user = new User()
    user.name = frmValidation.value.name.toLowerCase()
    user.email = frmValidation.value.email.toLowerCase()
    user.password = await crypto.createHmac('sha256', 'kng').update(frmValidation.value.password).digest('hex')
    user.activation_token = await crypto.createHmac('sha256', 'kng').update(frmValidation.value.email).digest('hex')
    await user.save()
    const msg = {
      from: 'perezcatoc@gmail.com',
      to: user.email,
      subject: 'Account verification',
      html: `Please click <a href="${process.env.APP_URL}/verify?token=${user.activation_token}">here</a> here to verify your password`
    }
    await sgMail.send(msg)
  } catch (e) {
    if (e.name === 'MongoError' && e.code === 11000) { req.flash('registerError', 'email already exists') } else req.flash('registerError', 'something went wrong')
    return res.redirect('/register')
  }
  req.session.timeIn = new Date().toISOString()
  passport.authenticate('local')(req, res, () => {
    return res.redirect('/dashboard')
  })
}

export const verify = async (req, res, next) => {
  const verifyId = req.query.token
  console.log(verifyId)
  try {
    const user = await User.findOne({ activation_token: verifyId })
    console.log(user)
    if (!user) {
      res.status(404)
      return next(createError(404, 'Page not found'))
    }
    user.user_is_verified = true
    await user.save()
    return res.render('verify')
  } catch (e) {
    res.status(500)
    return next(createError(500, 'something went wrong'))
  }
}
