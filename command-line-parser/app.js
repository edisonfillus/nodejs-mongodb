var MongoClient = require('mongodb').MongoClient,
    commandLineArgs = require('command-line-args'),
    commandLineUsage = require('command-line-usage')
    assert = require('assert');


var options = commandLineOptions();

MongoClient.connect('mongodb://localhost:27017/crunchbase', function (err, db) {

    assert.equal(err, null);
    console.log("Successfully connected to MongoDB.");

    var query = queryDocument(options);
    var projection = {
        "_id": 1, "name": 1, "founded_year": 1,
        "number_of_employees": 1, "crunchbase_url": 1
    };

    var cursor = db.collection('companies').find(query, projection);
    var numMatches = 0;

    cursor.forEach(
        function (doc) {
            numMatches = numMatches + 1;
            console.log(doc);
        },
        function (err) {
            assert.equal(err, null);
            console.log("Our query was:" + JSON.stringify(query));
            console.log("Matching documents: " + numMatches);
            return db.close();
        }
    );

});


function queryDocument(options) {

    console.log(options);

    var query = {
        "founded_year": {
            "$gte": options.firstYear,
            "$lte": options.lastYear
        }
    };

    if ("employees" in options) {
        query.number_of_employees = { "$gte": options.employees };
    }

    return query;

}


function commandLineOptions() {

    const optionDefinitions = [
        { name: "firstYear", alias: "f", type: Number },
        { name: "lastYear", alias: "l", type: Number },
        { name: "employees", alias: "e", type: Number }
    ];

    const options = commandLineArgs(optionDefinitions)
    

    if (!(("firstYear" in options) && ("lastYear" in options))) {
        const sections = [
            {
                header: 'Usage',
                content: 'The first two options below are required. The rest are optional.'
            },
            {
                header: 'Options',
                optionList: [
                    {
                        name: 'firstYear', alias: 'f'
                    },
                    {
                        name: 'lastYear', alias: 'l'
                    },
                    {
                        name: 'employees', alias: 'e'
                    }
                ]
            }
        ]
        const usage = commandLineUsage(sections)
        console.log(usage)
        process.exit();
    }

    return options;

}

