const adminProtect = (req, res, next) => {
    // Check if user exists and has is_admin: true
    if (req.user && req.user.is_admin) {
        next(); // User is admin, proceed to the controller
    } else {
        req.flash('error', 'Unauthorized access. Admins only.');
        res.status(403).redirect('/login'); // Redirect to login or show error
    }
};

module.exports = { adminProtect };