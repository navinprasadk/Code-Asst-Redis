let Filter = require('bad-words');
let filter = new Filter();
let count = 0;
module.exports = function (word) {
  //  cleaning the sentence will replace the swear word with '*'

  let findAbuse = filter.clean(word);
  let firstIndexOfAbuse = 0;
  let lastIndexOfAbuse = 0;
  let swearWord = '';
  let swearPresent = false;
  //  find out if there was a swear word by using *
  if(findAbuse.includes('*')) {
    swearPresent = true;
    count = count + 1;
}
// if count is greater than 0 , swear is present so variable swearPresent becomes true
//  find out the swear word
firstIndexOfAbuse = findAbuse.indexOf('*');
lastIndexOfAbuse = findAbuse.lastIndexOf('*');
swearWord = word.substring(firstIndexOfAbuse, lastIndexOfAbuse + 1);
//  issue a warning
return{
   count,
   swearPresent
};
};
