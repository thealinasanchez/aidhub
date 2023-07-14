const express = require('express');
const cors = require('cors');
const axios = require('axios');
const model = require('./model');

// const { createProxyMiddleware } = require('http-proxy-middleware');

const app = express();
const port = 8080;

app.use(express.json());
app.use(express.static('public'));
app.use(cors());
// app.use('/', createProxyMiddleware({
//     target: 'https://projects.propublica.org',
//     changeOrigin: true,
//     pathRewrite: {
//         '/^api': '/nonprofits/api/v2/search.json?q=', // Rewrite the path to match the ProPublica API
//     },
// }));

// GET
app.get("/organizations", function (req, res) {
    model.JournalEntry.find().then(entries => {
        res.json(entries);
    });
});

app.get('/api', async (req, res) => {
    try {
        const url = req.query.url;
        const response = await axios.get(url);
        res.json(response.data);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'An error occurred' });
    }
});

app.get("/organizations/:orgId", function (req, res) {
    model.JournalEntry.findOne({ "_id": req.params.orgId }).then(expense => {
        if (expense) {
            res.json(expense);
        }
        else {
            console.log("Organization not found.");
            res.status(404).send("Organization not found.");
        }
    }).catch(() => {
        console.log("Bad request (GET by ID).");
        res.status(400).send("Organization not found.");
    })
});

// POST
app.post("/organizations", function (req, res) {
    const newEntry = new model.JournalEntry({
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

// PUT
app.put("/organizations/:orgId", function (req, res) {
    // console.log(req.body.categories);
    const updatedOrg = {
        orgname: req.body.orgname,
        categories: req.body.categories,
        city: req.body.city,
        state: req.body.state,
        missionStatement: req.body.missionStatement
    }

    model.JournalEntry.findByIdAndUpdate({ "_id": req.params.orgId }, updatedOrg, { "new": true }).then(org => {
        if (org) {
            res.status(204).send("Organization updated.");
        }
        else {
            res.status(404).send("Organization not found.");
        }
    }).catch(() => {
        res.status(422).send("Unable to update.");
    });
});

// DELETE
app.delete("/organizations/:orgId", function (req, res) {
    model.JournalEntry.findOneAndDelete({ "_id": req.params.orgId }).then(org => {
        if (org) {
            res.status(204).send("Organization deleted.");
        }
        else {
            res.status(404).send("Organization not found.");
        }
    }).catch(() => {
        res.status(422).send("Unable to delete.");
    });
});

app.listen(port, function () {
    console.log(`Running server on port ${port}...`);
});