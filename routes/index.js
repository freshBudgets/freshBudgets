const auth = require('./auth');
const router = require('express').Router();
router.get('/is_up', (req, res) => { res.json({success: true})});
router.post('/signup', auth.signup);
router.post('/login', auth.login);
router.post('/verifyPhone', auth.verifyPhone);

const sms = require('./sms');
router.post('/sms/receive', sms.receiveSMS);
router.post('/sms/sendTest', sms.sendTestSMS);


/********************
 * PROTECTED ROUTES *
 ********************/
router.use(auth.verifyToken);

router.post('/sms/verify', sms.verifySMSVerificationCode);
const user = require('./user');
router.get('/user', user.user);

const budget = require('./budget');
router.get('/budget', budget.getAll);
router.get('/budget/:id', budget.getOne);
router.get('/budget/set/:id', budget.setBudget);
router.post('/budget/', budget.createCategory);
router.post('/budget/edit', budget.editCategory);
router.post('/budget/delete', budget.deleteCategory);

const settings = require('./settings');
router.post('/settings/update', settings.update);
router.get('/settings', settings.getSettings);

const plaid = require('./plaid');
router.post('/plaid/link', plaid.linkPlaidAccount);
router.post('/plaid/transaction', plaid.handlePlaidTransaction);
router.post('/plaid/getTransactions', plaid.getPlaidTransactions);

const transactions = require('./transactions');
router.post('/transactions/add', transactions.addTransaction);
router.post('/transactions/remove', transactions.removeTransaction);
router.post('/transactions/update', transactions.updateTransaction);
router.get('/transactions/budget/:id', transactions.getFromBudget);
router.get('/transactions/', transactions.getAll);
router.get('/transactions/:time', transactions.getTransactionTime);

const bills = require('./bills');
router.post('/bills/add', bills.addBill);
router.post('/bills/update/:id', bills.updateBill);
router.post('/bills/remove/:id', bills.removeBill);
router.post('/bills/check', bills.checkBills);
router.post('/bills/all', bills.getAll);

const accounts = require('./accounts');
router.get('/accounts', accounts.getAll);

module.exports = router;
