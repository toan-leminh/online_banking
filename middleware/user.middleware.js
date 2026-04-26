const userProtect = (req, res, next) => {
    // Check if user is logged in
    if (req.user) {
        next(); // User is logged in, proceed to the controller
    } else {
        req.flash('error', 'Please log in to access this page.');
        res.status(401).redirect('/login'); // Redirect to login or show error
    }
};

module.exports = userProtect;