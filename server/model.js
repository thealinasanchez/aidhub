const mongoose = require("mongoose");
const {Schema} = mongoose;
const dotenv = require('dotenv');

dotenv.config() // Import environmental variables

mongoose.set('strictQuery', false);
mongoose.connect(process.env.DB_LINK);

const JournalEntrySchema = Schema({
    orgname: {
        type: String,
        required: [true, "Organization must have a name."]
    },
    // ask if categories needs to be formatted a specific way 
    // since it is a list of strings
    categories: {
        type: [String],
    },
    city: {
        type: String,
        required: [true, "Organization must be in at least one city."]
    },
    state: {
        type: String,
        required: [true, "Organization must be in at least one state."],
        maxLength: 2,
        minLength: 2
    },
    missionStatement: {
        type: String,
    }
});

const JournalEntry = mongoose.model("JournalEntry", JournalEntrySchema);

module.exports = {
    JournalEntry: JournalEntry
}