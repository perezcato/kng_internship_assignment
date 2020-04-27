import passport from 'passport'
import strategy from 'passport-local'
import crypto from 'crypto'
import User from '../models/User.js'

const LocalStrategy = strategy.Strategy

passport.use(new LocalStrategy({ usernameField: 'email' }, async (email, password, done) => {
  let user
  try {
    user = await User.findOne({ email: email })
    if (!user) { return done(null, false, { message: 'Invalid email' }) }
  } catch (e) {
    return done(e)
  }
  const hashedPass = await crypto.createHmac('sha256', 'kng').update(password).digest('hex')
  if (user.password !== hashedPass) { return done(null, false, { message: 'Invalid Password' }) }
  return done(null, user)
}))

passport.serializeUser((user, done) => {
  done(null, user)
})

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id)
    done(null, user)
  } catch (e) {
    done(e)
  }
})

export default passport
