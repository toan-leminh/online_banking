const express = require("express");
const router = express.Router();
const mainController = require('../controllers/MainController')
const authController = require('../controllers/AuthController')



router.get("/landing", mainController.landing);
router.get("/register", mainController.register);
router.post("/register", mainController.postRegister);
router.post("/register/success", mainController.registerSuccess);
router.get("/login", authController.login);
router.post("/login", authController.postLogin);
router.get("/logout", authController.logout);


// router.post("/add-new-user", userController.addUser);
// router.get("/user-list", userController.getAllUsers);

module.exports = router;