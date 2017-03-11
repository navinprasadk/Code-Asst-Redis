let getNeo4jDriver = require('../neo4j/connection');
let fs = require('fs');
let redis = require('redis');
let client = redis.createClient(); // Creating redis client with default port name and host name as 127.0.0.1 and 6379 respectively

// delete require.cache[require.resolve('./intentLexicon.json')];
function createLexiconFiles(result) {
    let intentTerms = result.records[0]._fields[0].sort();
    let reactTerms = result.records[0]._fields[1].sort();
    let typeTerms = result.records[0]._fields[2].sort();
    // fs.writeFile(__dirname + '/keywordLexicon.json', JSON.stringify(reactTerms), 'utf8');
    // fs.writeFile(__dirname + '/intentLexicon.json', JSON.stringify(intentTerms), 'utf8');
    // fs.writeFile(__dirname + '/typeLexicon.json', JSON.stringify(typeTerms), 'utf8');

    /* writing  in redis */
    for (let i = 0; i < intentTerms.length; i = i + 1) {
        /* inserting 'intent' in redis */
        client.sadd(['intents', intentTerms[i]], function(err, reply) {
            console.log('intents: ', reply);
        });
    }

    for (let i = 0; i < reactTerms.length; i = i + 1) {
         /* inserting 'keyword' in redis */
         client.sadd('keywords', reactTerms[i], function(err, reply) {
            console.log('keywords: ', reply);
        });
    }

    for (let i = 0; i < typeTerms.length; i = i + 1) {
         /* inserting 'types' in redis */
         client.sadd('types', typeTerms[i], function(err, reply) {
            console.log('types: ', reply);
        });
    }


}
module.exports = function() {
    /* query to get all concept words, types and intents */
    let query = `MATCH (concept:concept)WITH COLLECT(concept.name)as concepts
                 MATCH (type:type) WITH COLLECT(type.name) as types,concepts as concepts
                 MATCH (intent:intent) return COLLECT(intent.name),concepts,types`;

    let session = getNeo4jDriver().session();
    session
        .run(query)
        .then(function(result) {
            // Completed!
            session.close();
            createLexiconFiles(result);
        })
        .catch(function(error) {
            console.log(error);
        });
};
