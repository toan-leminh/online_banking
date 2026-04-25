const passport = require('passport');

exports.login = (req, res) => {
    res.render("login", {
        errors: {},
        data: {},
    });
}

exports.postLogin = (req, res, next) => {
  passport.authenticate('local', (err, user, info) => {
    if (err) return next(err);
    
    if (!user) {
        // Login failed: 'info' contains the message from your LocalStrategy
        return res.render('login', { 
        error: info.message, 
        oldData: req.body 
        });
    }

    // Passport's req.logIn is required when using a custom callback
    req.logIn(user, (err) => {
        if (err) return next(err);
        
        // Success: Redirect to dashboard
        return res.redirect('/dashboard');
    });
  })(req, res, next);
};
