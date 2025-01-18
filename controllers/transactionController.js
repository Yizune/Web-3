const Transaction = require("../models/transactionSchema");



//Similar to other filter, needed to be at the top so it works
const getSortingFilter = async (req, res) => {
    try {
        const { sort } = req.query;

        let sortOption;
        if (sort === 'asc') {
            sortOption = { amount: -1 };
        } else if (sort === 'desc') {
            sortOption = { amount: 1 }; 
        }

        const transactions = await Transaction.find({}, '-_id').sort(sortOption);

        if (!transactions || transactions.length === 0) {
            return res.status(404).json({ message: "No transactions found" });
        }

        res.status(200).json({ message: "Fetched successfully!", data: transactions });
    } catch (error) {
        console.error("Error fetching transactions:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};



//Fetching the entire transactions database, did need some help figuring out how to call forth a schema but other than that did pretty much everything alone.
const getTransactions = async (req, res) => {
    try {
        const transactions = await Transaction.find({}, '-_id'); // Excludes the _id field
        res.status(200).json({ message: "Fetched successfully!", data: transactions});
    } catch (error) {
        console.error("Error fetching transactions:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};



//Copy pasted simple thing, wasn't a part of the assignment, made for testing purposes
const getSingleTransaction = async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const singleTransaction = await Transaction.findOne({ id: id }, '-_id'); // Excludes the _id field
        res.status(200).json({ message: "Fetched successfully!", data: singleTransaction});

        if (!singleTransaction) {
            return res.status(404).json({ message: "Transaction not found" });
        }

    } catch (error) {
        console.error("Error fetching transactions:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};



//Initially this was actually 2 separate functions that I made fully on my own with no issue, but they were so similar I just had to make 1 out of them
//That did make me bump into a small filtering problem so I had to get some help (had an issue with how they would be getting checked together)
const getFilteredTransactions = async (req, res) => {
    try {
        const { type, category } = req.query;

        if (!type && !category) {
            return res.status(400).json({ message: "At least one filter parameter must be provided" });
        }

        if (type && type !== 'income' && type !== 'expense') {
            return res.status(400).json({ message: "Invalid." });
        }

        const filter = {};
        if (type) filter.type = type;
        if (category) filter.category = category;

        const transactions = await Transaction.find(filter, '-_id');

        if (!transactions || transactions.length === 0) {
            return res.status(404).json({ message: "No transactions found for the specified filters" });
        }

        res.status(200).json({ message: "Fetched successfully!", data: transactions });
    } catch (error) {
        console.error("Error fetching transactions:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};



//Found stuff online and edited by me, remodeled by AI for the sake of keeping it cleaner
const postTransaction = async (req, res) => {
    try {
        const { type, amount, category, date, description } = req.body;
        if (!type || !amount || !category || !date) {
            return res.status(400).json({ error: "Missing required fields" });
        }
        const lastTransaction = await Transaction.findOne().sort({ id: -1 })
        console.log("Last transaction:", lastTransaction);

        const newTransaction = new Transaction({
            id: lastTransaction ? lastTransaction.id + 1 : 1,
            type,
            amount,
            category,
            date,
            description,
        });

        console.log("New transaction to save:", newTransaction);

        const savedTransaction = await newTransaction.save();

        const configuredTransaction = await Transaction.findById(savedTransaction._id, '-_id'); //to exclude _id from being added into the html table, got help from ai with this one

        res.status(200).json({ message: "Posted successfully!", data: configuredTransaction });
    } catch (error) {
        console.error("Error posting a transaction:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
}



//Okay am not gonna like this one got me fucked a lot, needed quite some help from Ai and google, majority of problems caused by that new:true and the mongoouse _id
//Still better than when I started!
const putTransaction = async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const { type, amount, category, date, description } = req.body;

        if (!id || !type || !amount || !category || !date || !description) {
            return res.status(400).json({ message: "Missing required fields" });
        }

        const updatedTransaction = await Transaction.findOneAndUpdate(
            /*req.params.id,
                type: req.body.type,
                amount: req.body.amount,
                category: req.body.category,
                date: req.body.date,
                description: req.body.description,
            }, - it was this initially and the fixed it to the lines below (replaced by the code above 'until here'). 
            I am still a little confused but mostly bcs i am aware that this line would work if mongo didn't give me their own _id */ 
            { 
                id: parseInt(id) 
            },
            { 
                type, 
                amount, 
                category, 
                date, 
                description 
            },
            // until here

            { new: true } // Option to return the updated document apparently, had no idea about it so I needed AI help
        );

        if (!updatedTransaction) {
            return res.status(404).json({ message: "Transaction not found" });
        }

        res.status(200).json({ message: "Transaction updated successfully!", data: updatedTransaction });
    } catch (error) {
        console.error("Error editing a transaction:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};



//Had a slight confusion with this one but it was somewhat because it was similar to update
//Biggest problem was having to convert it to an array of id's rather than just a single one
const deleteTransaction = async (req, res) => {
    try {
        //const id = parseInt(req.params.id);
        const { ids } = req.body;
        //if (isNaN(id)) {
        if (!Array.isArray(ids)) {
            return res.status(400).json({ message: "Invalid ID format" });
        }

        // const deletedTransaction = await Transaction.findOneAndDelete({ id });

        // if (!deletedTransaction) {
        //     return res.status(404).json({ message: "Transaction not found" });
        // }

        const deletedTransactions = await Transaction.deleteMany({ id: { $in: ids } });

        if (deletedTransactions.deletedCount === 0) {
            return res.status(404).json({ message: "No transactions found to delete." });
        }


        res.status(200).json({ message: "Transaction(s) deleted successfully!", data: deletedTransactions });
    } catch (error) {
        console.error("Error deleting a transaction:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
}



module.exports = {
    getTransactions,
    getFilteredTransactions,
    getSortingFilter,
    getSingleTransaction,
    postTransaction,
    putTransaction,
    deleteTransaction,
};