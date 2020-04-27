export const showRegisterationForm = (req, res, next) => {
  res.render('register', { errors: req.flash('registerError')[0] })
}
