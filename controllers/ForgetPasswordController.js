import Joi from '@hapi/joi'
import User from '../models/User.js'
import crypto from 'crypto'
import createError from 'http-errors'
import sgMail from '@sendgrid/mail'
import dotenv from 'dotenv'
import mailGun from '../services/mail.js'

dotenv.config()
sgMail.setApiKey(process.env.SENDGRID_KEY)

export const requestToken = async (req, res, next) => {
  const validEmail = Joi.object({
    email: Joi.string().email().required()
  }).validate(req.body)

  if (validEmail.error) {
    req.flash('registerError', validEmail.error.details[0].message)
    return res.redirect('/forgot-password')
  }

  const userEmail = await User.findOne({ email: validEmail.value.email.toLowerCase() })
  if (!userEmail) {
    req.flash('registerError', 'Email not found')
    return res.redirect('/forgot-password')
  }
  try {
    userEmail.forgot_password_token = await crypto.createHmac('sha256', 'kng')
      .update(userEmail.email)
      .digest('hex')
    await userEmail.save()
    const msg = {
      to: userEmail.email,
      from: 'perezcatoc@gmail.com',
      subject: 'Reset Password',
      html: `please click <a href="${process.env.APP_URL}/reset-password?token=${userEmail.forgot_password_token}">here</a>the link to change your password`
    }
    await sgMail.send(msg)
    req.session.resetLink = 'reset link successfully sent to your email'
    return res.redirect('/forgot-password')
  } catch (e) {
    console.log(e)
    req.flash('registerError', 'Something went wrong please try again later')
    return res.redirect('/forgot-password')
  }
}

export const showResetPasswordForm = async (req, res, next) => {
  if (req.session.errors) {
    return res.render('reset-password', { error: req.session.errors, success: '' })
  }
  const resetToken = req.query.token
  try {
    const user = await User.findOne({ forgot_password_token: resetToken })
    if (!user) {
      res.status(404)
      return next(404, 'Page not found')
    }
    user.forgot_password_token = ''
    await user.save()
    req.session.email = user.email
    return res.render('reset-password', { error: '' })
  } catch (e) {
    res.status(500)
    return next(createError(500, 'something went wrong'))
  }
}

export const resetPassword = async (req, res, next) => {
  console.log('reset Password')

  const verifiedBody = Joi.object({
    password: Joi.string().required(),
    cpassword: Joi.string().required()
  }).validate(req.body)
  if (verifiedBody.error) {
    console.log('reset - 2')
    console.log(verifiedBody)
    req.session.errors = 'Invalid password'
    return res.redirect('/reset-password')
  }
  if (verifiedBody.value.password !== verifiedBody.value.cpassword) {
    req.session.errors = 'Passwords must match'
    return res.redirect('/reset-password')
  }
  console.log('here')
  try {
    const user = await User.findOne({ email: req.session.email })
    user.password = crypto.createHmac('sha256', 'kng').update(verifiedBody.value.password).digest('hex')
    await user.save()
    console.log('here-beforedestroy')
    await req.session.destroy()
    console.log('here-login')
    return res.redirect('/login')
  } catch (e) {
    req.session.errors = 'something went wrong try again'
    console.log(e.message)
    return res.redirect('/reset-password')
  }
}
