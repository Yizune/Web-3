const mongoose = require("mongoose");
const { Schema } = mongoose;

const transactionsSchema = new Schema({
    id: {
        type: Number, 
        required: true, 
        unique: true, 
        index: true,  
    },
    type: {
        type: String,
        enum: ['income', 'expenses'],
        require: true
    },
    amount: {
        type: Number,
        require: true
    },

    category: {
        type: String,
        enum: 
        [
            'Salary', 
            'Freelance', 
            'Food', 
            'Entertainment', 
            'Rent', 
            'Utilities', 
            'Transportation', 
            'Investment', 
            'Part-time Job', 
            'Shopping', 
            'Miscellaneous'
        ],
        require: true
    },

    date: {
        type: String, //Not Date so i don't get the full time and stuff, this was a cheap way of doing it, I don't know if smart one too
        require: true
    },

    description: {
        type: String,
        require: false
    },
},
{ versionKey: false }); // Disable __v field

module.exports = mongoose.model('Transaction', transactionsSchema);