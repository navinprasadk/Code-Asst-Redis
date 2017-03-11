let getNeo4jDriver = require('../../../neo4j/connection');

module.exports = function(resultCallback) {
    // get all the concepts and relations
    let query = `MATCH(n:concept) WITH COLLECT(n.name) AS concepts
                 MATCH(n:concept)-[r]->(m:concept)
                 RETURN COLLECT(DISTINCT type(r)) AS relations, concepts`;

    let session = getNeo4jDriver().session();

    session.run(query)
        .then((result) => {
            // Completed!
            session.close();
            resultCallback(result.records[0]);
        })
        .catch((error) => {
            console.log(error);
        });
};
