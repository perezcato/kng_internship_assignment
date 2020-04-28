export const dashboardGuard = (req, res, next) => req.user ? next() : res.redirect('/login')

export const authValidate = (req, res, next) => req.user ? res.redirect('/dashboard') : next()
