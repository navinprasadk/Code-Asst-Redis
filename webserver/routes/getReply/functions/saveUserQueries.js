// it is use to save user queries in mongodb
let UserChatHistory = require('../../../models/userChatHistory');
let User = require('./../../../models/user');

module.exports = function(email, isUnAnswered, question, answerObj) {
  User.findOne({
    $or: [ { 'local.email': email }, { 'google.email': email }, { 'facebook.email': email } ]
  }, function(error,data) {
  if (error) {
      return error;
  }
    let domain = data.local.loggedinDomain;
    console.log(domain);
    //to save chat with domain
    UserChatHistory.findOne({
        email: email
    }, function(err, data) {
      // if data is not present then initialize a new UserChatHistory or add in existing database
        if (!data) {
            let newUserChatHistory = new UserChatHistory();
            newUserChatHistory.email = email;
            let chat = {};
            chat.isUnAnswered = isUnAnswered;
            chat.question = question;
            chat.answerObj = answerObj;
            chat.domain = domain;
            newUserChatHistory.chats = [];
            newUserChatHistory.chats.push(chat);
            newUserChatHistory.save(function(err, data) {
                console.log(data);
            });
        } else {
            let chat = {};
            chat.isUnAnswered = isUnAnswered;
            chat.question = question;
            chat.answerObj = answerObj;
            chat.answerDate = new Date().toLocaleString();
            chat.domain = domain;
            data.chats.push(chat);
            data.save(function(error) {
                if (error) {
                    console.log('Error in saving chat');
                    console.log(error);
                }
            });
        }
    });
  });
};
