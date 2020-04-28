import express from 'express'
import session from 'express-session'
import cookieParser from 'cookie-parser'
import morgan from 'morgan'
import path from 'path'
import mongoose from 'mongoose'
import flash from 'connect-flash'
import passport from './services/passport-setup.js'
import createError from 'http-errors'
import dotenv from 'dotenv'

import indexRouter from './routes/index.js'

const app = express()
dotenv.config()

mongoose.connect(process.env.DB_URL, { useNewUrlParser: true, useUnifiedTopology: true })

app.set('views', path.join(process.cwd(), 'views'))
app.set('view engine', 'ejs')

app.use(express.static(path.join(process.cwd(), 'public')))
app.set(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(session({
  secret: 'kng_internship',
  resave: true,
  saveUninitialized: true
}))
app.use(cookieParser())
app.use(morgan('dev'))
app.use(flash())
app.use(passport.initialize())
app.use(passport.session())

app.use('/', indexRouter)

app.use('*', (req, res, next) => {
  res.status(404)
  next(createError(404, 'Page Not found'))
})

app.use((error, req, res, next) => {
  console.log(res.statusCode)
  res.render('404', { statusCode: res.statusCode, message: error.message })
})

app.listen(3000, () => {
  console.log('server started listening on port 3000')
})
