const express = require("express");
const router = express.Router();
const adminController = require('../controllers/AdminController')
const { adminProtect } = require('../middleware/admin.middleware');

router.get("/accounts", adminProtect, adminController.listAccounts);
router.get("/accounts/:id/edit", adminProtect, adminController.editAccount);
router.post("/accounts/:id/edit", adminProtect, adminController.postEditAccount);
router.get("/users", adminProtect, adminController.listUsers);
router.get("/users/:id/edit", adminProtect, adminController.editUser);
router.post("/users/:id/edit", adminProtect, adminController.postEditUser);
router.get("/transactions", adminProtect, adminController.listTransactions);

module.exports = router;