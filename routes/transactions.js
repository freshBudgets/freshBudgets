const mongoose     = require('mongoose');
const passport     = require('passport');
const crypto       = require('crypto');
const jwt          = require('jsonwebtoken');
const Users        = mongoose.model('Users');
const Transactions = mongoose.model('Transactions');
const mongoURI     = process.env.MONGO_URI;
const jwtSecret    = process.env.JWT_SECRET;

// adds a transaction to the Transactions collection
const addTransaction = function(req, res) {
    var params = req.body; 
    const userID = mongoose.Types.ObjectId(req.decoded._id);

    //Check if all needed information is sent in request
    if (!params.amount || !params.date || !params.name || !params.budget_id) {
        res.json({
            success: false,
            message: 'Not enough information to update settings'
        });
    }

    else {
        var newTransaction = new Transactions();
        newTransaction.amount = params.amount;
        newTransaction.date = params.date;
        newTransaction.name = params.name;
        newTransaction.budget_id = params.budget_id;
        newTransaction.user_id = userID;

        newTransaction.save(function(err){
            if (err){
                res.json({
                    success: false,
                    message: 'Could not add new transaction.'
                });
            }
            else{
                res.json({
                    success: true,
                    message: 'Successfully added transaction!'
                })
            }
        });
    }
}

// removes transaction from Transactions collection
const removeTransaction = function(req, res) {
    var params = req.body;

    //Check if all needed information is sent in request
    if (!params.transaction_id) {
        res.json({
            success: false,
            message: 'Not enough information to update settings'
        });
    }
    
    else {
        Transactions.findOneAndDelete({_id:params.transaction_id}, function(err, transaction) {
            if(err) {
                res.json({
                    success: false,
                    message: 'Error finding transaction'
                });
            }
            else if(transaction == null) {
                res.json({
                    success: false,
                    message: 'Transacton not found'
                });
            }
            else {
                res.json({
                    success: true,
                    message: 'Successfully deleted transaction',
                    transaction_id: transaction._id
                });
            }
        });
    }
}

// returns all transactions for a user
const getAll = function(req, res) {
    const userID = mongoose.Types.ObjectId(req.decoded._id);
    
    Transactions.find({user_id: userID}, function(err, transactions) {
        if(transactions.length > 0) {
            res.json({
                transactions: transactions
            });
        }
        else {
            res.json({
                success: false,
                message: 'Could not find transactions for user'
            });
        }
    });
}


// returns all transactions from a specific budget for current user
const getFromBudget = function(req, res) {
    var params = req.body;
    const userID = mongoose.Types.ObjectId(req.decoded._id);
    
    Transactions.find({user_id: userID, budget_id: params.budget_id}, function(err, transactions) {
        if(transactions.length > 0) {
            res.json({
                transactions: transactions
            });
        }
        else {
            res.json({
                success: false,
                message: 'Could not find transactions for user'
            });
        }
    });
}


module.exports = {
    addTransaction,
    removeTransaction,
    getAll,
    getFromBudget
    // updateTransaction
}
