const express = require("express");
const router = express.Router();
const accountController = require('../controllers/AccountController');
const transactionController = require('../controllers/TransactionController');

router.get("/accounts", accountController.listAccounts);
router.get("/accounts/create", accountController.createAccount);
router.post("/accounts/create", accountController.postCreateAccount);
router.get("/accounts/:id", accountController.viewAccount);
router.get("/accounts/:id/edit", accountController.editAccount);
router.post("/accounts/:id/edit", accountController.postEditAccount);

router.get("/transactions", transactionController.listTransactions);
router.get("/transactions/create", transactionController.createTransaction);
router.post("/transactions/create", transactionController.postCreateTransaction);


// router.get("/register", userController.register);
// router.post("/register", userController.postRegister);
// router.get("/register/success", userController.registerSuccess);
// router.post("/add-new-user", userController.addUser);
// router.get("/user-list", userController.getAllUsers);

module.exports = router;