const express = require('express');
const cors = require('cors');
const model = require('./model');

const app = express();
const port = 8080;

app.use(express.json());
app.use(cors());

// GET
app.get("/organizations", function(req, res) {
    model.JournalEntry.find().then(entries => {
        res.json(entries);
    });
});

app.get("/organizations/:orgId", function(req,res) {
    model.JournalEntry.findOne({"_id":req.params.orgId}).then(expense => {
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
app.post("/organizations", function(req,res) {
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
app.put("/organizations/:orgId", function(req,res) {
    // console.log(req.body.categories);
    const updatedOrg = {
        orgname: req.body.orgname,
        categories: req.body.categories,
        city: req.body.city,
        state: req.body.state,
        missionStatement: req.body.missionStatement
    }

    model.JournalEntry.findByIdAndUpdate({"_id": req.params.orgId}, updatedOrg, {"new": true}).then(org => {
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
app.delete("/organizations/:orgId", function(req,res) {
    model.JournalEntry.findOneAndDelete({"_id":req.params.orgId}).then(org => {
        if(org) {
            res.status(204).send("Organization deleted.");
        }
        else {
            res.status(404).send("Organization not found.");
        }
    }).catch(() => {
        res.status(422).send("Unable to delete.");
    });
});

app.listen(port, function() {
    console.log(`Running server on port ${port}...`);
});