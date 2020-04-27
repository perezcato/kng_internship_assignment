import express from 'express'
import fs from 'fs'
import fsExtra from 'fs-extra'
import crypto from 'crypto'
import multer from 'multer'
import passport from 'passport'
import Joi from '@hapi/joi'

import User from '../models/User.js'

const router = express.Router()
const upload = multer()

const guard = (req, res, next) => {
  if (req.user) {
    return next()
  }
  return res.redirect('/login')
}

router.get('/', (req, res, next) => {
  res.render('home')
})

router.get('/dashboard', guard, (req, res, next) => {
  res.render('dashboard')
})

router.get('/packages', guard, (req, res, next) => {
  return res.render('packages')
})

const authValidate = (req, res, next) => {
  if (req.user) {
    return res.redirect('/dashboard')
  }
  return next()
}

router.get('/register', authValidate, (req, res, next) => {
  res.render('register', { errors: req.flash('registerError')[0] })
})

router.get('/login', authValidate, (req, res, next) => {
  const error = req.flash('error')[0] ? req.flash('error')[0] : 'no-error'
  res.render('login', { message: error })
})

router.post('/login', passport.authenticate('local', {
  successRedirect: '/dashboard',
  failureRedirect: '/login',
  failureFlash: true
}), (req, res, next) => {
  res.send('verified')
})

router.post('/register', async (req, res, next) => {
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
  } catch (e) {
    if (e.name === 'MongoError' && e.code === 11000) { req.flash('registerError', 'email already exists') }
    return res.redirect('/register')
  }
  passport.authenticate('local')(req, res, () => {
    return res.redirect('/dashboard')
  })
})

router.get('/logout', (req, res, next) => {
  req.logout()
  res.redirect('/login')
})

router.post('/upload-json', upload.any(), async (req, res) => {
  if (req.files[0].fieldname !== 'user_data') res.status(422).send('Invalid field name')
  else if (req.files[0].mimetype !== 'application/json') res.status(422).send('Please upload a json file')
  else {
    await fs.createWriteStream('./upload.json').write(req.files[0].buffer, 'utf8')
    res.status(200).render('response', { userData: await fsExtra.readJson('./upload.json') })
  }
})

router.get('/forgot-password', (req, res, next) => {
  if (req.user) {
    return res.redirect('/dashboard')
  }
  return next()
}, (req, res, next) => {
  res.render('forgot-password', { errors: req.flash('registerError')[0] })
})

router.post('/forgot-password', async (req, res, next) => {
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

  console.log(userEmail)
  res.redirect('/forgot-password')
})

export default router
