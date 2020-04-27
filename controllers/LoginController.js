

export const showLoginForm = (req, res, next) => {
  const error = req.flash('error')[0] ? req.flash('error')[0] : 'no-error'
  res.render('login', { message: error })
}


