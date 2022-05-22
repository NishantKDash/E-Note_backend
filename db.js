const mongoose = require('mongoose');
const mongourl = "mongodb://localhost:27017/e-note";

const connectToMongo = ()=>{
    mongoose.connect(mongourl,()=>{
        console.log("Connected to MongoDB successfully");
    })
}

module.exports = connectToMongo;