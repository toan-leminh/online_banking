require('dotenv').config(); 
const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const userRoutes = require('./routes/user.routes')
const adminRoutes = require('./routes/admin.routes');
const homeRouter = require('./routes/home.routes');
const session = require('express-session');
const { generateToken } = require("./config/csrf-config");

// Database
const dbURI = process.env.MONGO_URI;
const port = process.env.PORT || 3000;
const sessionSecret = process.env.SESSION_SECRET || '';
const sessionTimeout = process.env.SESSION_TIMEOUT || 3600000;
console.log(sessionTimeout)
const app = express();

// Set Pug as the template engine
app.set('view engine', 'pug');
// Define the directory where template files are located
app.set('views', path.join(__dirname, 'views'));

// Middleware configuration
app.use(express.urlencoded({ extended: false }));  // Parse URL-encoded data
app.use(express.static(path.join(__dirname, 'public'))); // Serve static files from the 'public' directory
app.use(session({
    secret: sessionSecret, // Nên để trong .env
    resave: false,
    saveUninitialized: false,
    cookie: { 
        httpOnly: true,
        secure: false,
        maxAge: parseInt(sessionTimeout) // 1 hour
    }
}));
app.use((req, res, next) => {
    const token = generateToken(req);
    if (req.session) { 
        res.locals.csrfToken = generateToken(req);
    }    
    next();
});


// Route configuration
app.use('/', homeRouter);
app.use('/user', userRoutes);
app.use('/admin', adminRoutes);

mongoose.connect(dbURI)
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('Connection error:', err));

// Listening to the server
app.listen(port, () => {
   console.log(`Server started at port ${port}`);
});
