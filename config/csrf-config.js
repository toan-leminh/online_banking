// csrf-config.js
const { csrfSync } = require("csrf-sync");

const {
  generateToken,
  csrfSynchronizedProtection, 
} = csrfSync({
  getTokenFromRequest: (req) => req.body["_csrf"], 
});

module.exports = {
  generateToken,
  csrfSynchronizedProtection,
};