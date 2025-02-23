const mongoose = require("mongoose");
const connectDB = async () => {
    try{
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB connected');
    }
    catch(err){
        console.log("Error connecting with MongoDB: ",err);
        process.exit();
    }
};

module.exports = connectDB;