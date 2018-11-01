const twilioClient = require('twilio')(process.env.TWILIO_SID, process.env.TWILIO_TOKEN);
const MessagingResponse = require('twilio').twiml.MessagingResponse;
const mongoose = require('mongoose');
const Users = mongoose.model('Users');
const Transactions = mongoose.model('Transactions');
const BudgetCategories = mongoose.model('BudgetCategory');

const sendTestSMS = function(req,res){
  console.log(req.body);
  twilioClient.messages.create({
      body: 'whats up this is a freshbudgets twilio test',
      from: process.env.TWILIO_PHONE_NUMBER,
      to: '+1' + req.body.phoneNumber
    })
    .then(message => {
      console.log(message.sid);
      res.json({ messageID: message.sid });
    })
    .done();
};

const receiveSMS = function(req, res) {
  const budgetName = req.body.Body;
  const fromPhoneNumber = parseInt(req.body.From.substring(2));
  Users.findOne({phoneNumber: fromPhoneNumber}, function(err, user) {
    const userID = user._id;
    BudgetCategories.findOne({budgetName: budgetName, user: userID}, function(err, budget) {
      Transactions.findOne({_id: user.lastTextedTransaction}, function(err, transaction) {
        transaction.budget_id = budget._id;
        budget.currentAmount -= transaction.amount;
        transaction.save();
        budget.save();
        BudgetCategories.findOne({budgetName: 'Uncategorized Transactions', user: userID}, function(err, uncategorizedBudget) {
          sendTransactionSMSToUser(userID, uncategorizedBudget._id);
        });
      });
    });
  });
};

const sendSMSVerificationCode = function(phoneNumber, verificationCode) {
  twilioClient.messages.create({
    body: 'Your Fresh Budgets verification code is: ' + verificationCode,
    from: process.env.TWILIO_PHONE_NUMBER,
    to: '+1' + phoneNumber
  })
  .then(message => {
    console.log(message.sid);
  })
  .done();
};

const verifySMSVerificationCode = function(req, res) {
  const userID = req.decoded._id;
  Users.findOne({_id: userID}, function(err, user){
    if (err) {
      res.json({
        success: false,
        message: 'failed to find user'
      });
    }
    else {
      if (parseInt(req.body.verificationCode) != user.smsVerificationCode) {
        res.json({
          success: false,
          message: 'verification code does not match'
        });
      }
      else {
        user.isVerified = true;
        user.save();
        res.json({
          success: true,
          message: 'phone number verified'
        });
      }
    }
  });
};

const sendTransactionSMSToUser = function(userID, budgetID) {
 console.log(userID);
 console.log(budgetID);
  var transaction;
  Transactions.find({user_id: userID, budget_id: budgetID}, function(err, transactions) {
    transaction = transactions[0];
    console.log(transaction);
    console.log(transactions);
   Users.findOne({_id: userID}, function(err, user){
    twilioClient.messages.create({
      body: 'Fresh Budgets received a new Transaction!\n' + 
      'Name: ' + transaction.name + '\n' +
      'Amount: ' + transaction.amount + '\n' +
      'Date: ' + transaction.date + '\n' +
      'Reply with the name of the budget you would like to add this transaction to.',
      from: process.env.TWILIO_PHONE_NUMBER,
      to: '+1' + user.phoneNumber
    })
    .then(message => {
      console.log(message.sid);
    })
    .done();
    user.lastTextedTransaction = transaction._id;
    user.save();
  });
  });

  

};

module.exports = {
  sendTestSMS,
  receiveSMS,
  sendSMSVerificationCode,
  verifySMSVerificationCode,
  sendTransactionSMSToUser
}
