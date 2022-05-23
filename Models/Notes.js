const mongoose = require('mongoose');
const { Schema } = mongoose;

const NotesSchema = new Schema ({
   //user object is like a foreign key analogous to sql
    user : {
        type : mongoose.Schema.Types.ObjectId,
        ref : 'user'  //reference from the user model
    },
  
    title:{
        type : String,
        required: true
    },

    description:{
        type : String,
        required : true

    },
    tag:{
        type : String,
        default : "General"

    },
    date:{
        type : Date,
        default : Date.now

    }
});

const Notes = mongoose.model('notes' , NotesSchema);
module.exports = Notes;