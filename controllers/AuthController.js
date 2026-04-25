const passport = require('passport');
const Joi = require('@hapi/joi');

exports.login = (req, res) => {
    res.render("login", {
        errors: {},
        data: {},
    });
}

exports.postLogin = (req, res, next) => {
    const loginSchema = Joi.object({
            _csrf: Joi.string().required(),
            username: Joi.string().required().messages({
                'any.required': 'This field is required',
            }),
            password: Joi.string().required().messages({
                'any.required': 'This field is required',
            }),
    });

    const { error, value } = loginSchema.validate(req.body, {abortEarly: false});
    if (error) {
        console.log("Validated", error);
        const errors = {};
        error.details.forEach((detail) => {
            errors[detail.path[0]] = detail.message;
        });

        return res.render('login', {
            errors,
            data: req.body,
        });
    }

    passport.authenticate('local', (err, user, info) => {
        if (err) return next(err);
        
        if (!user) {
            // Login failed: 'info' contains the message from your LocalStrategy
            console.log("Login failed:", info.message);
            return res.render('login', { 
                errors: { general: "Username and password do not match" }, 
                data: req.body 
            });
        }

        // Passport's req.logIn is required when using a custom callback
        req.logIn(user, (err) => {
            if (err) return next(err);
            
            // Success: Redirect to dashboard
            return res.redirect('/user/accounts');
        });
  })(req, res, next);
};


exports.logout = (req, res) => {
    req.logout((err) => {
        if (err) return next(err);
    
        // This kills the session on the server
        req.session.destroy(() => {
            // Optional: This removes the cookie from the browser
            res.clearCookie('connect.sid'); 
            res.redirect('/login');
        });
    });
}
