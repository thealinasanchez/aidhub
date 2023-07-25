const express = require('express');
const cors = require('cors');
const axios = require('axios');
const model = require('./model');
const session = require('express-session');

const fs = require('fs');
const { Upload } = require("@aws-sdk/lib-storage");
const { S3Client } = require("@aws-sdk/client-s3");

const fileparser = require('./fileParser');

const NTEEDATA = require('./ntee_codes.json')["codes"];
const STATES = require('./states.json')["states"];
const NTEENUMS = require('./ntee_num.json')["code_nums"];
const LOCALORGANIZATIONS = require('./organizationLocations.json')["organizations"];

const app = express();
const port = process.env.PORT || 6300;

app.use(express.json());
app.use(express.static('public'));
app.use(session({
    secret: process.env.SESSION_SECRET,
    cookie: { secure: false, httpOnly: false, sameSite: "none" },
    resave: false,
    saveUninitialized: true
}));

app.use(cors({
    credentials: true,
    origin: function (origin, callback) {
        callback(null, origin);
    }
}));

function AuthMiddleware(request, response, next) {
    if (request.session && request.session.userId) {
        model.User.findOne({ "_id": request.session.userId }).then(user => {
            if (user) {
                request.user = user;
                next();
            } else {
                console.log("no user");
                response.status(401).send("Unauthenticated");
            }
        })
    } else {
        response.status(401).send("Unauthenticated");
    }
}

app.get("/users", AuthMiddleware, function (request, response) {
    model.RedactedUser.find().then(user => {
        response.status(200).send(user);
    })
});

app.get("/users/:userId", AuthMiddleware, function (request, response) {
    model.RedactedUser.findOne({ "_id": request.params.userId }).then(user => {
        if (user) {
            if (user.password != "***") {
                user.password = "***";
            }
            console.log(user);
            response.status(200).send(user);
        } else {
            response.status(404).send("User not found");
        }
    })
});

app.put("/users/:userId", AuthMiddleware, function (request, response) {
    model.User.findOne({ "_id": request.params.userId }).then(user => {
        if (user) {
            if (request.body.hasOwnProperty("name")) {
                user.name = request.body.name;
                user.markModified("name");
            }
            if (request.body.hasOwnProperty("about")) {
                user.about = request.body.about;
                user.markModified("about");
            }
            if (request.body.hasOwnProperty("email")) {
                user.email = request.body.email;
                user.markModified("email");
            }
            if (request.body.hasOwnProperty("password")) {
                user.setPassword(request.body.password);
                user.markModified("password");
            }
            user.save().then(() => {
                response.status(200).json(user);
            }).catch((errors) => {
                if (errors.code === 11000) {
                    if (errors.keyPattern.hasOwnProperty("email")) {
                        response.status(422).send("This email or username already has an account. Please sign in.");
                    }
                    if (errors.keyPattern.hasOwnProperty("name")) {
                        response.status(422).send("This username is already taken. Please choose another.");
                    }
                } else {
                    let error_list = [];
                    for (key in errors.errors) {
                        error_list.push(errors.errors[key].properties.message)
                    }
                    response.status(422).send(error_list.join(" "));
                }
            })
        } else {
            response.status(404).send("User not found");
        }
    })
});

app.post('/userProfile/:userId', AuthMiddleware, (req, res) => {
    fileparser(req, req.params.userId)
        .then(data => {
            res.sendStatus(201)
        })
        .catch(error => {
            console.log("ERROR: ", error);
            res.status(400).json({
                message: "An error occurred.",
                error
            })
        })
});

app.get("/session", (request, response) => {
    response.status(200).send(request.session);
});

app.post("/users", function (request, response) {
    const newUser = new model.User({
        name: request.body.name,
        about: request.body.about,
        email: request.body.email
    });
    if (!request.body.password || request.body.password === "") {
        response.status(422).send(["Needs a password"])
    } else {
        newUser.setPassword(request.body.password).then(() => {
            newUser.save().then(function () {
                new Upload({
                    client: new S3Client({
                        credentials: {
                            accessKeyId: process.env.AWS_ACCESS_KEY_ID,
                            secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
                        },
                        region: process.env.S3_REGION
                    }),
                    params: {
                        ACL: 'public-read',
                        Bucket: process.env.S3_BUCKET,
                        Key: `${newUser._id}-profile-picture.jpg`,
                        Body: fs.readFileSync(`./public/images/default.jpg`),
                        ContentType: 'image/jpeg'
                    }
                }).done()
                    .then(() => {
                        console.log("New user added.");
                        response.status(201).send("Created a user");
                    })
                    .catch((error) => {
                        console.log(error);
                        response.status(500).send("AWS error");
                    });
            }).catch((errors) => {
                console.log(errors)
                if (errors.code === 11000) {
                    if (errors.keyPattern.hasOwnProperty("email")) {
                        response.status(422).send("This email or username already has an account. Please sign in.");
                    }
                    if (errors.keyPattern.hasOwnProperty("name")) {
                        response.status(422).send("This username is already taken. Please choose another.");
                    }
                } else {
                    let error_list = [];
                    for (key in errors.errors) {
                        error_list.push(errors.errors[key].properties.message)
                    }
                    response.status(422).send(error_list.join(" "));
                }
            })
        })
    }
})

app.post("/session", (request, response) => {
    // email
    // password
    model.User.findOne({ "email": request.body.email }).then(async (user) => {
        if (user) {
            if (!request.body.password) {
                response.status(400).send("Must have password");
            }
            else if (await user.verifyPassword(request.body.password)
                .then((result) => {
                    return result;
                }).catch(() => false)) {
                request.session.name = user.name;
                request.session.userId = user._id;
                response.status(201).send(request.session);
            } else {
                response.status(401).send("Username and/or Password are incorrect");
            }
        } else {
            // 404 would expose user information
            response.status(401).send("Username and/or Password are incorrect");
        }
    }).catch(error => {
        console.log(error);
        response.status(400).send("couldn't understand your request");
    })
});

app.delete("/session", (request, response) => {
    if (request.session.userId != undefined) {
        request.session.userId = undefined;
        request.session.name = undefined;
        response.sendStatus(204);
    } else {
        response.status(404).send("No session started");
    }
})

app.delete("/users/:userId", AuthMiddleware, function (request, response) {
    model.VolunteerForm.deleteMany({ "postedBy": request.params.userId }).then(() => {
    }).catch(() => {
        response.status(422).send("Volunteer posts not deleted.");
    });
    model.User.findOneAndDelete({ "_id": request.params.userId }).then(user => {
        if (user) {
            response.status(204).send("User deleted.");
        }
        else {
            response.status(404).send("User not found.");
        }
    }).catch(() => {
        response.status(422).send("Unable to delete.");
    });
});

// GET
app.get("/organizations", async function (req, res) {
    let url = "https://projects.propublica.org/nonprofits/api/v2/search.json?";
    try {
        let prev = false;
        if (req.query.hasOwnProperty("q") && req.query.q != "") {
            prev = true;
            url += `q=${req.query.q.replace(" ", "+")}`;
        }
        if (req.query.hasOwnProperty("state")) {
            url += (prev) ? '&' : '';
            prev = true;
            url += `state%5Bid%5D=${req.query.state.id}`;
        }
        if (req.query.hasOwnProperty("ntee")) {
            url += (prev) ? '&' : ''
            url += `ntee%5Bid%5D=${req.query.ntee.id}`;
        }
        if (req.query.hasOwnProperty("page")) {
            url += (prev) ? '&' : ''
            url += `page=${req.query.page}`;
        }
        const response = await axios.get(url);
        res.json(response.data);
    } catch (error) {
        if (error.message === "Request failed with status code 404") {
            res.status(404).json({ total_results: 0, error: "No results found.", organizations: [], num_pages: 0, cur_page: -1 });
        } else {
            console.log(error);
            res.status(500).json({ error: error });
        }
    }
});

app.get('/ntee', function (req, res) {
    response = {};
    if (req.query.hasOwnProperty("code")) {
        if (!Array.isArray(req.query["code"])) {
            req.query["code"] = [req.query["code"]];
        }
        req.query["code"].forEach(code => {
            if (NTEEDATA.hasOwnProperty(code)) {
                response[code] =
                {
                    category: NTEEDATA[code].category,
                    description: NTEEDATA[code].description
                };
            } else if (code || code == "None") {
                response[code] =
                {
                    category: "N/A",
                    description: "N/A"
                }
            } else {
                response[code] =
                {
                    category: "N/A",
                    description: "N/A"
                }
                console.log("NTEE code not found.");
            }
        });
        res.status(200).json(response);
    }
    else {
        res.status(404);
    }
});

app.get("/states", function (req, res) {
    res.status(200).json(STATES);
});

app.get("/categories", function (req, res) {
    res.status(200).json(NTEENUMS);
});

app.get("/location", function (req, res) {
    let url = `http://ipinfo.io/${req.query.ip}?token=${process.env.IPINFO_TOKEN}`;
    fetch(url).then(response => {
        if (response.status == 200) {
            return response.json();
        }
        else {
            console.log(response)
            res.status(404).json({ error: "Location not found." });
        }
    }
    ).then(data => {
        res.status(200).json(data);
    }).catch(error => {
        res.status(500).json({ error: error });
    });
});

app.get("/findLatLong", function (req, res) {
    let url = `https://nominatim.openstreetmap.org/search?q=${req.query.address}&format=json&limit=1`;
    fetch(url).then(response => {
        if (response.status == 200 && response.hasOwnProperty("lat") && response.hasOwnProperty("lon")) {
            return response.json({
                latitude: response[0].lat,
                longitude: response[0].lon
            });
        }
        else {
            console.log(response)
            res.status(404).json({ error: "Location not found." });
        }
    }).then(data => {
        res.status(200).json(data);
    }).catch(error => {
        res.status(500).json({ error: error });
    });
});

app.get("/localOrganizations", function (req, res) {
    res.json(LOCALORGANIZATIONS);
});

// GET FOR VOLUNTEERFORM SCHEMA
app.get("/volunteerOpportunities", function (req, res) {
    model.VolunteerForm.find().populate("postedBy").then(entries => {
        res.json(entries);
    });
});

app.get("/volunteerOpportunities/user/:userId", function (req, res) {
    model.VolunteerForm.find({ "postedBy": req.params.userId }).populate("postedBy").then(entries => {
        res.json(entries);
    });
});

app.get("/volunteerOpportunities/:volpostId", function (req, res) {
    model.VolunteerForm.findOne({ "_id": req.params.volpostId }).then(post => {
        if (post) {
            res.json(post);
        }
        else {
            console.log("Volunteer post not found.");
            res.status(404).send("Volunteer post not found.");
        }
    }).catch(() => {
        console.log("Bad request (GET by ID).");
        res.status(400).send("Volunteer post not found.");
    })
});

// POST FOR VOLUNTEERFORM SCHEMA
app.post("/volunteerOpportunities", AuthMiddleware, function (req, res) {
    const newEntry = new model.VolunteerForm({
        postedBy: req.user._id,
        title: req.body.title,
        orgname: req.body.orgname,
        city: req.body.city,
        state: req.body.state,
        dateStart: req.body.dateStart,
        dateEnd: req.body.dateEnd,
        description: req.body.description,
        num_people: req.body.num_people,
        website: req.body.website
    });
    newEntry.save().then(() => {
        console.log("New post/volunteer form entry added.");
        res.status(201).send(newEntry.populate("postedBy"));
    }).catch((errors) => {
        console.log(errors);
        let error_list = [];
        for (var key in errors.errors) {
            error_list.push(errors.errors[key].message)
        }
        res.status(422).send(error_list);
    })
})

app.get("/like", function(req,res) {
    model.Likes.find().then(entries => {
        res.json(entries);
    });
});

app.get("/like/:likeId", function(req, res) {
    model.Likes.fineOne({"_id": req.params.likeId}).then(like => {
        if (like) {
            res.json(like);
        }
        else {
            console.log("like not found.");
            res.status(404).send("like not found.");
        }
    }).catch(() => {
        console.log("Bad request (GET by ID).");
        res.status(400).send("like not found.");
    })
});

app.post('/like', async(req,res) => {
    let {postId, userId} = req.body;

    try {
        // Check if the user has already liked the post
        let existingLike = await model.Likes.findOne({postId, userId});

        if (existingLike) {
            return res.status(409).json({message: 'Post already liked by the user.'});
        }

        // If the user hasn't liked the post, create a new like
        let newLike = new model.Likes({postId, userId});
        await newLike.save();

        res.status(201).json({message: "Post liked successfully."});
    } catch (error) {
        console.error("Error liking post:", error);
        res.status(500).json({message: "Error liking post."});
    }
})



// PUT FOR VOLUNTEERFORM SCHEMA
app.put("/volunteerOpportunities/:volpostId", AuthMiddleware, function (req, res) {
    // console.log(req.body.categories);
    const updatedVolunteerOpportunities = {
        user: req.body.user,
        title: req.body.title,
        orgname: req.body.orgname,
        city: req.body.city,
        state: req.body.state,
        dateStart: req.body.dateStart,
        dateEnd: req.body.dateEnd,
        description: req.body.description,
        num_people: req.body.num_people,
        website: req.body.website
    }

    model.VolunteerForm.findByIdAndUpdate({ "_id": req.params.volpostId }, updatedVolunteerOpportunities, { "new": true }).then(post => {
        if (post) {
            res.status(204).send("Volunteer post updated.");
        }
        else {
            res.status(404).send("Volunteer post not found.");
        }
    }).catch(() => {
        res.status(422).send("Unable to update.");
    });
});

// DELETE FOR VOLUNTEERFORM SCHEMA
app.delete("/volunteerOpportunities/:volpostId", AuthMiddleware, function (req, res) {
    model.VolunteerForm.findOneAndDelete({ "_id": req.params.volpostId }).then(post => {
        if (post) {
            res.status(204).send("Volunteer post deleted.");
        }
        else {
            res.status(404).send("Volunteer post not found.");
        }
    }).catch(() => {
        res.status(422).send("Unable to delete.");
    });
});

app.listen(port, function () {
    console.log(`Running server on port ${port}...`);
});

// // GET FOR DONATIONFORM SCHEMA
// app.get("/donationOpportunities", function (req,res) {
//     model.DonationForm.find().then(entries => {
//         res.json(entries);
//     });
// });

// app.get("/donationOpportunities/donationpostId", function(req, res) {
//     model.DonationForm.findOne({"_id": req.params.donationpostId}).then (donationpost => {
//         if (donationpost) {
//             res.json(donationpost);
//         }
//         else {
//             console.log("Donation post not found.");
//             res.status(404).send("Donation post not found.");
//         }
//     }).catch(() => {
//         console.log("Bad request (GET by ID).");
//         res.status(400).send("Donation post not found.");
//     })
// });

// // POST FOR DONATIONFORM SCHEMA
// app.post("/donationOpportunities", function (req, res) {
//     const newEntry = new model.DonationForm({
//         user: req.body.user,
//         title: req.body.title,
//         orgname: req.body.orgname,
//         description: req.body.description,
//         website: req.body.website,
//         min_d: req.body.min_d,
//         goal: req.body.goal
//     });

//     newEntry.save().then(() => {
//         console.log("New post/donation form entry added.");
//         res.status(201).send(newEntry);
//     }).catch((errors) => {
//         let error_list = [];
//         for (var key in errors.errors) {
//             error_list.push(errors.errors[key].message)
//         }
//         res.status(422).send(error_list);
//     })
// })

// // PUT FOR DONATIONFORM SCHEMA
// app.put("/donationOpportunities/:donationpostId", function (req, res) {
//     // console.log(req.body.categories);
//     const updatedDonationOpportunities = {
//         user: req.body.user,
//         title: req.body.title,
//         orgname: req.body.orgname,
//         description: req.body.description,
//         website: req.body.website,
//         min_d: req.body.min_d,
//         goal: req.body.goal
//     }

//     model.DonationForm.findByIdAndUpdate({ "_id": req.params.donationpostId }, updatedVolunteerOpportunities, { "new": true }).then(post => {
//         if (post) {
//             res.status(204).send("Volunteer post updated.");
//         }
//         else {
//             res.status(404).send("Volunteer post not found.");
//         }
//     }).catch(() => {
//         res.status(422).send("Unable to update.");
//     });
// });