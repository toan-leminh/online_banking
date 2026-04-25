const express = require("express");
const router = express.Router();
const userController = require('../controllers/MainController')


router.get("/landing", userController.landing);
router.get("/register", userController.register);
router.post("/register", userController.doRegister);
router.get("/register/success", userController.registerSuccess);
// router.post("/add-new-user", userController.addUser);
// router.get("/user-list", userController.getAllUsers);

module.exports = router;