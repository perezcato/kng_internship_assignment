import express from 'express'
import fs from 'fs'
import fsExtra from 'fs-extra'
import multer from 'multer'
import passport from 'passport'
import dotenv from 'dotenv'
import sgMail from '@sendgrid/mail'

import { showLoginForm, logout } from '../controllers/LoginController.js'
import { showRegisterationForm, register, verify } from '../controllers/RegisterController.js'
import { requestToken, showResetPasswordForm, resetPassword } from '../controllers/ForgetPasswordController.js'
import { dashboardGuard, authValidate } from '../middlwares/AuthMiddleware.js'

const router = express.Router()
const upload = multer()
dotenv.config()
sgMail.setApiKey(process.env.API_KEY)

router.get('/', (req, res, next) => res.redirect('/login'))

router.get('/dashboard', dashboardGuard, (req, res, next) => res.render('dashboard'))

router.get('/packages', dashboardGuard, (req, res, next) => res.render('packages'))

router.get('/register', authValidate, showRegisterationForm)

router.get('/verify', verify)

router.get('/login', authValidate, showLoginForm)

router.get('/reset-password', showResetPasswordForm)

router.post('/reset-password', resetPassword)

router.post('/login', passport.authenticate('local', {
  successRedirect: '/dashboard',
  failureRedirect: '/login',
  failureFlash: true
}))

router.post('/register', register)

router.get('/logout', logout)

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
}, (req, res, next) => res.render('forgot-password',
  { errors: req.flash('registerError')[0], success: req.session.resetLink }))

router.post('/forgot-password', requestToken)

router.get('/verifyTest', (req, res, next) => res.render('verify'))

export default router
