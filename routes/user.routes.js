const express = require("express");
const router = express.Router();
const accountController = require('../controllers/AccountController');
const transactionController = require('../controllers/TransactionController');
const userProtect = require('../middleware/user.middleware');

router.get("/accounts", userProtect, accountController.listAccounts);
router.get("/accounts/create", userProtect, accountController.createAccount);
router.post("/accounts/create", userProtect, accountController.postCreateAccount);
router.get("/accounts/:id", userProtect, accountController.viewAccount);
router.get("/accounts/:id/edit", userProtect, accountController.editAccount);
router.post("/accounts/:id/edit", userProtect, accountController.postEditAccount);
router.get("/transactions", userProtect, transactionController.listTransactions);
router.get("/transactions/create", userProtect, transactionController.createTransaction);
router.post("/transactions/create", userProtect, transactionController.postCreateTransaction);

module.exports = router;