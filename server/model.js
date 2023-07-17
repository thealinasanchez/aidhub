const mongoose = require("mongoose");
const { Schema } = mongoose;
const dotenv = require('dotenv');

dotenv.config() // Import environmental variables

/*
mongoose.set('strictQuery', false);
mongoose.connect(process.env.DB_LINK);
*/

const VolunteerFormSchema = Schema ({
    user: {
        type: String,
        required: [true, "Must have a username."]
    },
    title: {
        type: String,
        required: [true, "Volunteer opportunity must have a title."]
    },
    orgname: {
        type: String,
        required: [true, "Volunteer opportunity must be hosted by am organization."]
    },
    city: {type: String},
    state: {
        type: String,
        required: [true, "Volunteer opportunity must be hosted in at least one state."],
        maxLength: 2,
        minLength: 2
    },
    dateStart: {
        type: Date,
        required: [true, "Volunteer opportunity must have a start date."]
    },
    dateEnd: {type: Date},
    description: {type: String},
    num_people: {
        type: Number,
        required: true
    },
    website: {type: String}
})

const DonationFormSchema = Schema ({
    user: {
        type: String,
        required: [true, "Must have a username."]
    },
    title: {type: String},
    orgname: {
        type: String,
        required: [true, "Donation opportunity must be hosted by am organization."]
    },
    description: {type: String},
    website: {
        type: String,
        required: [true, "Donation opportunity must have a donation website."]
    },
    min_d: {
        type: Number,
        required: [true, "Donation opportunity must have a minimum donation amount."]
    },
    goal: {type: Number}

})

const JournalEntrySchema = Schema({
    orgname: {
        type: String,
        required: [true, "Organization must have a name."]
    },
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
const VolunteerForm = mongoose.model("VolunteerForm", VolunteerFormSchema);
const DonationForm = mongoose.model("DonationForm", DonationFormSchema);

module.exports = {
    JournalEntry: JournalEntry,
    VolunteerForm: VolunteerForm,
    DonationForm: DonationForm
}