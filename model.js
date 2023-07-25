const mongoose = require("mongoose");
const { Schema } = mongoose;
const dotenv = require('dotenv');
const bcrypt = require("bcrypt");

dotenv.config() // Import environmental variables

mongoose.set('strictQuery', false);
mongoose.connect(process.env.DB_LINK)
    .then(() => console.log("Connected to database"))
    .catch((error) => console.log("Failed to connect to database", error));


const VolunteerFormSchema = Schema({
    postedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "RedactedUser",
        required: [true, "Must have a user"]
    },
    title: {
        type: String,
        required: [true, "Volunteer opportunity must have a title."]
    },
    orgname: {
        type: String,
        required: [true, "Volunteer opportunity must be hosted by am organization."]
    },
    city: { type: String },
    state: {
        type: String,
        required: [true, "Volunteer opportunity must be hosted in at least one state."]
    },
    dateStart: {
        type: Date,
        required: [true, "Volunteer opportunity must have a start date."]
    },
    dateEnd: { type: Date },
    description: { type: String },
    num_people: {
        type: Number,
        required: true
    },
    website: { type: String },
    numLikes: {
        type: Number,
        default: 0
    },
    // likedPost: {
    //     type: Boolean,
    //     default: false
    // }
})

// const likesSchema = Schema({
//     postId: {
//         type: Schema.Types.ObjectId,
//         ref: 'VolunteerForm',
//         required: true
//     }, 
//     userId: {
//         type: Schema.Types.ObjectId,
//         ref: 'User',
//         required: true
//     }, 
//     numLikes: { type: Number, default: 0 }, 
//     likedPost: { type: Boolean, default: false }, 
// })

const DonationFormSchema = Schema({
    user: {
        type: String,
        required: [true, "Must have a username."]
    },
    title: { type: String },
    orgname: {
        type: String,
        required: [true, "Donation opportunity must be hosted by am organization."]
    },
    description: { type: String },
    website: {
        type: String,
        required: [true, "Donation opportunity must have a donation website."]
    },
    min_d: {
        type: Number,
        required: [true, "Donation opportunity must have a minimum donation amount."]
    },
    goal: { type: Number }

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

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Must have a name"],
        unique: true
    },
    about: {
        type: String
    },
    email: {
        type: String,
        required: [true, "A email is required"],
        unique: true
    },
    password: {
        type: String,
        required: [true, "A password is required"]
    },
    liked: [
        {
            type: Schema.Types.ObjectId,
            ref: "VolunteerForm"
        }
    ]
});

userSchema.methods.setPassword = function (plainTextpassword) {
    var promise = new Promise((resolve, reject) => {
        bcrypt.hash(plainTextpassword, 12).then(password => {
            this.password = password;
            resolve();
        }).catch(() => {
            reject();
        });
    });
    return promise;
}

userSchema.methods.verifyPassword = function (plainTextPassword) {
    var promise = new Promise((resolve, reject) => {
        bcrypt.compare(plainTextPassword, this.password).then(result => {
            resolve(result);
        }).catch(() => {
            reject();
        });
    })
    return promise;
}

const User = mongoose.model("User", userSchema);
const RedactedUser = mongoose.model("RedactedUser", userSchema);

User.createCollection();
RedactedUser.createCollection({
    viewOn: "users",
    pipeline: [{
        $set: {
            name: "$name",
            about: "$about",
            email: "$email",
            password: "***"
        }
    }]
});

const JournalEntry = mongoose.model("JournalEntry", JournalEntrySchema);
const VolunteerForm = mongoose.model("VolunteerForm", VolunteerFormSchema);
const DonationForm = mongoose.model("DonationForm", DonationFormSchema);


module.exports = {
    JournalEntry: JournalEntry,
    VolunteerForm: VolunteerForm,
    DonationForm: DonationForm,
    User: User,
    RedactedUser, RedactedUser
}