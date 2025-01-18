require('dotenv').config({ path: './config/.env' });
const mongoose = require('mongoose');
const uri = process.env.mongo;
console.log("Connecting to:", uri); // .env test
const clientOptions = { serverApi: { version: '1', strict: false, deprecationErrors: true } }; //Implemented by AI to fix connections
async function connectDB() {
  try {
    // Create a Mongoose client with a MongoClientOptions object to set the Stable API version
    await mongoose.connect(uri, clientOptions);
    await mongoose.connection.db.admin().command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
    process.exit(1); 
  }
}
module.exports = connectDB;