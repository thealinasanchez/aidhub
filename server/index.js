const express = require('express');
const cors = require('cors');
const axios = require('axios');
const model = require('./model');

const NTEEDATA = require('./ntee_codes.json')["codes"];
const STATES = require('./states.json')["states"];
const NTEENUMS = require('./ntee_num.json')["code_nums"];

const app = express();
const port = 6300;

app.use(express.json());
app.use(express.static('public'));
app.use(cors());

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

POST
app.post("/volunteerOpportunities", function (req, res) {
    const newEntry = new model.VolunteerForm({
        orgname: req.body.orgname,
        categories: req.body.categories,
        city: req.body.city,
        state: req.body.state,
        missionStatement: req.body.missionStatement
    });

    newEntry.save().then(() => {
        console.log("New organization/journal entry added.");
        res.status(201).send(newEntry);
    }).catch((errors) => {
        let error_list = [];
        for (var key in errors.errors) {
            error_list.push(errors.errors[key].message)
        }
        res.status(422).send(error_list);
    })
})

// // PUT
// app.put("/organizations/:orgId", function (req, res) {
//     // console.log(req.body.categories);
//     const updatedOrg = {
//         orgname: req.body.orgname,
//         categories: req.body.categories,
//         city: req.body.city,
//         state: req.body.state,
//         missionStatement: req.body.missionStatement
//     }

//     model.JournalEntry.findByIdAndUpdate({ "_id": req.params.orgId }, updatedOrg, { "new": true }).then(org => {
//         if (org) {
//             res.status(204).send("Organization updated.");
//         }
//         else {
//             res.status(404).send("Organization not found.");
//         }
//     }).catch(() => {
//         res.status(422).send("Unable to update.");
//     });
// });

// // DELETE
// app.delete("/organizations/:orgId", function (req, res) {
//     model.JournalEntry.findOneAndDelete({ "_id": req.params.orgId }).then(org => {
//         if (org) {
//             res.status(204).send("Organization deleted.");
//         }
//         else {
//             res.status(404).send("Organization not found.");
//         }
//     }).catch(() => {
//         res.status(422).send("Unable to delete.");
//     });
// });

app.listen(port, function () {
    console.log(`Running server on port ${port}...`);
});