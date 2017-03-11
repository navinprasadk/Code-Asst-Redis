/* @navinprasad: redis routes */
let express = require('express');
let router = express.Router();
let fetchIntents = require('./functions/getIntents');
let fetchKeywords = require('./functions/getKeywords');
let fetchTypes = require('./functions/getTypes');

router.get('/getIntents', function(req, res) {
  let resultCallback = function(fetchIntents){
  res.json({
    fetchIntents
  });
}
  fetchIntents(resultCallback);
});

router.get('/getKeywords', function(req, res) {
  let resultCallback = function(fetchKeywords) {
      res.json({
        fetchKeywords
      });
};
  fetchKeywords(resultCallback);
});

router.get('/getTypes', function(req, res) {
  let resultCallback = function(fetchTypes) {
      res.json({
        fetchTypes
      });
};
  fetchTypes(resultCallback);
});


module.exports = router;
