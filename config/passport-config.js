const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcrypt');
const User = require('./models/UserModel');

// Config passport with Local Strategy (username/password)
function initialize(passport) {
  passport.use(new LocalStrategy({ usernameField: 'username' }, async (username, password, done) => {
    try {
      const user = await User.findOne({ username });
      if (!user) return done(null, false, { message: 'User not found' });
      if (await bcrypt.compare(password, user.password)) return done(null, user);
      
      return done(null, false, { message: 'Incorrect password' });    
    } catch (e) { 
        return done(e); 
    }
  }));
  
  // Set user to session 
  passport.serializeUser((user, done) => done(null, user.id));
  passport.deserializeUser((id, done) => User.findById(id).then(user => done(null, user)));
}
module.exports = initialize;
