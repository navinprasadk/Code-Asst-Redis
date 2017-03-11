// this route is used to get reply of questions asked by user
let express = require('express');
let router = express.Router();
let processQuestion = require('./functions/processQuestion');
let getQuestionResponse = require('./functions/getQuestionResponse');
let commonReply = require('./../../config/commonReply');
let client = require('./functions/redis');
// answerNotFoundReply json file containing response for no answer found
let answerNotFoundReply = require('./../../config/answerNotFoundReply');
let saveUnansweredQuery = require('./functions/saveUnansweredQuery');
let saveUserQueries = require('./functions/saveUserQueries');
let saveAnalyticsData = require('./functions/saveAnalyticsData');
// getKeywordResponse json file containing statements for keyword responses
let getKeywordResponse = require('./functions/getKeywordResponse');
//redis
let intentRedis = require('./../redis/functions/getIntents');
let keywordRedis = require('./../redis/functions/getKeywords');
let typeRedis = require('./../redis/functions/getTypes');

//spell checker
let getSpellChecker = require('../spellChecker/functions/spellChecker');
let detectSwear = require('../filterAbuse/functions/filterAbuse');

// router to take question and give reply to user
router.post('/askQuestion', function(req, res) {
    // get the user email
    let email = req.user.local.email || req.user.facebook.email || req.user.google.email;
    let username = req.body.username;
    let question = req.body.question;
    //  passing the input to swear checker
    let foundAbuse = detectSwear(question.value);
//  if abuse found, issue a warning
    let abuseCount = foundAbuse.count;
    let abusePresent = foundAbuse.swearPresent;
    console.log('abuse count is '+abuseCount);
    if(abusePresent == true ) {
      res.json({abuseCount : abuseCount, abusePresent : abusePresent});
    }
else{
    let spellResponse = getSpellChecker(question.value);
    console.log('in reply  '+spellResponse.question+'flag'+spellResponse.flag);
    // extract intents and keywords from the question
    let intentLexicon = [];
    let keywordLexicon = [];
    let typeLexicon = [];
    // intentRedis(intentCallBack);
    // function intentCallBack(intent)
    // {
    //   intentLexicon = intent;
    //   keywordRedis(keywordCallBack);
    //   function keywordCallBack(keyword)
    //   {
    //     keywordLexicon = keyword;
    //   }
    //   typeRedis(typeCallBack)
    //   function typeCallBack(type)
    //   {
    //     typeLexicon = type;
    //   }
    //
    //   finalCallBack();
    // }
    let count = 0;
    let lexicon = function()
    {
      client.smembers('keywords', function(err, reply) {
        keywordLexicon = reply;
      });
      client.smembers('intents', function(err, reply) {
        intentLexicon = reply;
      });
      client.smembers('types', function(err, reply) {
        typeLexicon = reply;
        finalCallBack();
      });
    }
    lexicon();
    let finalCallBack = function()
    {
      console.log("intents"+intentLexicon+"keywords"+keywordLexicon+"type"+typeLexicon);
    console.log(intentLexicon+"........here");
    let query = processQuestion(spellResponse.question.toLowerCase(),intentLexicon,keywordLexicon,typeLexicon);
    let keywords = query.keywords;
    let intents = query.intents;
    let types = query.types;

    // add keyword to redis
  let addKeywordToRedis = function(username,keyword){
    client.hmset(username, 'keywords', keyword, 'user', username, function(err, reply) {
        if (err) {
            console.log(err);
        } else {
            console.log(reply);
        }
    });
  }
    // function used to send final response
    let sendResponse = function(isUnAnswered, answerObj) {
      // function to save analytics data
        saveAnalyticsData(isUnAnswered);
        // function to save user queries
        saveUserQueries(email, isUnAnswered, question, answerObj);
        // isUnAnswered used to indentify unanswered questions
        console.log("reply "+isUnAnswered+"........"+answerObj+"......");
        res.json({isUnAnswered: isUnAnswered, answerObj: answerObj});
    };
    // callback if a answer is found in the graph database
    let answerFoundCallback = function(answerObj) {
          sendResponse(false, answerObj);
      };
    // callback method to tackle situation when answer is not present in database
    let noAnswerFoundCallback = function() {
        saveUnansweredQuery(username, email, question.value, keywords, intents);
        // get a random response string from answerNotFoundReply json
        let foundNoAnswer = answerNotFoundReply[Math.floor(Math.random() *
           answerNotFoundReply.length)];
        let resultArray = [];
        let resultObj = {};
        resultObj.value = foundNoAnswer;
        resultArray.push(resultObj);
        sendResponse(true, resultArray);
    };
    if (keywords.length === 0) {
        // getting the previously saved keyword from redis
      client.hget(username, 'keywords', function(err, value) {
          if (err) {
              console.log('Error in retrieving keyword ' + err);
          } else {
              if (value) {
                  var redisKeyword = [];
                  redisKeyword.push(value);
                  getQuestionResponse(intents, redisKeyword, email, types, answerFoundCallback, noAnswerFoundCallback, spellResponse.flag, spellResponse.question);
              } else {
                  saveUnansweredQuery(username, email, question.value);
                  // get a random response string from keyword response found
                  let foundNoAnswer = commonReply[Math.floor(Math.random() * commonReply.length)];
                  let resultArray = [];
                  let resultObj = {};
                  resultObj.value = foundNoAnswer;
                  resultArray.push(resultObj);
                  sendResponse(true, resultArray);
              }
          }
      });
    }
    else if(intents.length === 0) {
      saveUnansweredQuery(username, email, question.value);
      // if no intent is found in the question then get a keyword response
      getKeywordResponse(keywords, email, types, sendResponse, spellResponse.flag, spellResponse.question);
      // adding keyword to redis
      addKeywordToRedis(username,keywords[0]);
    }
     else {
       // checking whether the keywords arry contains this,it,that
          if(keywords.includes('it') || keywords.includes('that') || keywords.includes('this')) {
            var searchKeyword = ['this','it','that'];
             var k = '';
            for(i=0;i<searchKeyword.length;i++){
              if(keywords.includes(searchKeyword[i])) {
                k = searchKeyword[i];
              }
            }
              var index = keywords.indexOf(k);
                client.hget(username, 'keywords', function(err, value) {
                    if(err){
                      console.log(err);
                    }else{
                      // removing the identified keyword
                      var ind = keywords.splice(index,1);
                      // pushing the previous keyword
                        keywords.push(value);
                        // function to get response when both  intents and keywords are present
                        getQuestionResponse(intents, keywords, email, types, answerFoundCallback, noAnswerFoundCallback, spellResponse.flag, spellResponse.question);
                        addKeywordToRedis(username,keywords[keywords.length-1]);
                    }
                });
          }else{
            // function to get response when both  intents and keywords are present
            getQuestionResponse(intents, keywords, email, types, answerFoundCallback, noAnswerFoundCallback, spellResponse.flag, spellResponse.question);
            addKeywordToRedis(username,keywords[0]);
          }
    }
  }
  }
});
module.exports = router;
