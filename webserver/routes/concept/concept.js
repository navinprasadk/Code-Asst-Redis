let express = require('express');
let router = express.Router();
let fetchConcepts = require('./functions/fetchConcepts');
let createConcept = require('./functions/createConcept');
let getConceptsAndRelations = require('./functions/getConceptsAndRelations');

router.get('/', function(req, res) {
    let resultCallback = function(concepts) {
        res.json({
            concepts
        });
    };
    fetchConcepts(resultCallback);
});

router.post('/createConcept', function(req, res) {
    let newConcept = req.body.newConcept;
    let relationship = req.body.relationship;
    let oldConcept = req.body.oldConcept;
    let resultCallback = function(result) {
        res.json(result);
    };
    createConcept(newConcept, relationship, oldConcept, resultCallback);
});

router.post('/createConcept', function(req, res) {
    let newConcept = req.body.newConcept;
    let relationship = req.body.relationship;
    let oldConcept = req.body.oldConcept;
    let resultCallback = function(result) {
        res.json(result);
    };
    createConcept(newConcept, relationship, oldConcept, resultCallback);
});

// version 2
router.get('/rc', function(req, res) {
    let resultCallback = function(rc) {
        res.json({
            rc
        });
    };
    getConceptsAndRelations(resultCallback);
});

module.exports = router;
