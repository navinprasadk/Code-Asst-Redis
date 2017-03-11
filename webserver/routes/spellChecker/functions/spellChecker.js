module.exports = function (question) {
	let natural = require('natural');
	let Spellchecker = require('./hunspell-spellchecker');
	let fs = require('fs');
	let spellchecker = new Spellchecker();
	let DICT = spellchecker.parse({
		aff: fs.readFileSync('./en_US.aff'),
	dic: fs.readFileSync('./en_US.dic')});
	let tokenizer = new natural.WordTokenizer();
	let text = fs.readFileSync('lotsofwords.txt', 'utf-8');
	let corpus = tokenizer.tokenize(text);

	let spellcheck = new natural.Spellcheck(corpus);
	let spellChecked = '';
  let flag = 0;
let sentence = question.split(' ');
sentence.forEach(function(word)
{
if(!spellchecker.check(word))
{
	spellChecked = spellcheck.getCorrections(word)[0];
	question = question.replace(word, spellChecked);
}
});
    let strArray = question.trim().split(' ');

 for(let i in sentence)
 {
    if(sentence[i] !== strArray[i])
		{
      flag = 1;
        break;
    }
  }
    return {
    question,
    flag
  };
};
