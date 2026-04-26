const Joi = require('@hapi/joi');
const { csrfSynchronizedProtection } = require("../config/csrf.config");
const UserModel = require("../models/UserModel")

// Landing page
exports.landing = (req, res) => {
  res.render('landing');
};

// Register screen
exports.register = async (req, res) => {
  // const userData = req.body;
  // const newUser = await userService.createUser(userData);
  res.render('register', {
    errors: {},
    data: {},
  });
};

// Post register
exports.postRegister = async (req, res, next) => {
    const registerSchema = Joi.object({
        _csrf: Joi.string().required(),
        name: Joi.string().required().messages({
            'any.required': 'This field is required',
        }),
        username: Joi.string().min(3).max(30).required().messages({
            'string.min': 'Username has at least 3 characters ',
            'any.required': 'This field is required',
        }),
        // email: Joi.string().email().required().messages({
        //     'string.email': 'Email is not valid',
        // }),
        password: Joi.string().min(6).required().messages({
            'string.min': 'Password must be at least 6 characters',
        }),
        confirm_password: Joi.any().equal(Joi.ref('password')).required().messages({ 
            'any.only': 'Confirm password does not match' })
    });

    const { error, value } = registerSchema.validate(req.body, {abortEarly: false});
    if (error) {
        console.log("Validated", error);
        const errors = {};
        error.details.forEach((detail) => {
            errors[detail.path[0]] = detail.message;
        });

        return res.render('register', {
            errors,
            data: req.body,
        });
    }

    try {
        // Check username unique
        const userExists = await UserModel.findOne({ username: value.username });
        if (userExists) {
            return res.render('register', { 
                errors: {others: 'User already exists'}, 
                data: req.body 
            });
        }
        console.log("Check uniqued user");
        // Save user to MongoDB
        const newUser = new UserModel({ name: value.name, username: value.username, password: value.password });
        await newUser.save();

        console.log("Saved user");

        // Redirect to infor page
        req.session.register = {
            message: 'You have registered successfully.',
            username: newUser.username
        };
        res.redirect("/register/success");

    } catch (err) {
        console.error(err);
        res.status(500).send('System error');
    }

  // const userData = req.body;
  // const newUser = await userService.createUser(userData);
  res.render('register', {
    status: 'success',
    message: 'User created successfully.',
    data: {
      //newUser,
    },
  });
};

// Register success
exports.registerSuccess = (req, res) => {
    const data = req.session.register;

    delete req.session.register;

    res.render('register_success', { data: data });
};