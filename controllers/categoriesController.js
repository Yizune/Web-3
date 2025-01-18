//I made this just for testing (I forgot to just check mongo db xd)

const Categories = require("../models/categoriesSchema");

const getCategories = async (req, res) => {
    try {
        const categories = await Categories.find({}, '-_id');
        res.status(200).json({ message: "Fetched successfully!", data: categories});
    } catch (error) {
        console.error("Error fetching transactions:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};
module.exports = {
    getCategories,
}