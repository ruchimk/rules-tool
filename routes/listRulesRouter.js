var ManagementClient = require('auth0').ManagementClient;
const express = require('express')
var router = express.Router();

router.use(express.urlencoded())

/*
Pagination with
getRules and getClients, 
for accounts with many apps and rules
*/

//getRules is recursive function to iterate through all the rules gotten by the getRulesPage function
async function getRules(management, pagination) {
    let allRules = [];
    var rulePage = await getRulePage(management,pagination)
    allRules.push( rulePage );
    console.log( rulePage ) ;
    if ( rulePage.length > 0 ) {
        pagination.page = pagination.page + 1;
        console.log ( 'We got ' + rulePage.length + ' results with pagination of ' + pagination.per_page );
        allRules.push(await getRules(management, pagination));
    } else {
        console.log ( 'We got ' + rulePage.length + ' results with pagination of ' + pagination.per_page );
        return;
    }
    return allRules.flat();
}

//management is be auth0 client and pagination will be 
//an associated array of two numbers - rules per page and starting page
async function getRulePage(management, pagination ) {
    return await management.getRules(pagination)
        .then(function(rules) {
        return rules;
    })
}


async function getClients(management, pagination) {
    let allClients = [];
    var clientPage = await getClientPage(management,pagination)
    allClients.push( clientPage );
    console.log( clientPage ) ;
    if ( clientPage.length > 0 ) {
        pagination.page = pagination.page + 1;
        console.log ( 'We got ' + clientPage.length + ' results with pagination of ' + pagination.per_page );
        allClients.push(await getClients(management, pagination));
    } else {
        console.log ( 'We got ' + clientPage.length + ' results with pagination of ' + pagination.per_page );
    return;
    }
return allClients.flat();
}

async function getClientPage(management, pagination ) {
    return await management.getClients(pagination).then(function(clients) {
        return clients;
    })
}


function getInfo(clients, rules) {
    // Initialize variables!
    var ruleList = [];
    var prettyOutput = '';

    // Regex to match the line for client.  The parentheses will capture the client name from the object. (It should be index 1 in the array on a match).
    var clientMatch = /context.clientName === '(.*?)'/;

    // Initialziing html snippets for each app
    for ( var i = 0; i < clients.length; i++ ) {
        if ( clients[i] != undefined ) {
            ruleList[ clients[i]['name'] ] = "<b>" + clients[i]['name'] + "</b>"
        }
    }

    for( var i = 0; i < rules.length; i++ ) {
        if ( rules[i] != undefined ) {
        var match = clientMatch.exec( rules[i]['script'] );
        console.log( rules[i]['name'] )
        if (match != null ) {
          // We have found the line to tie this rule to an app. As noted above, index 1 should be the app name.
        ruleList[ match[1] ] = ruleList[ match[1] ] + '<br>' + rules[i]['name']
        } else {
            for ( var key in ruleList) {
                // We did not find the line in the script for this rule. Assuming this should apply to ALL apps.
                ruleList[ key ] = ruleList[ key ] + '<br>' + rules[i]['name']
            }
        }
        }
    }

    // Putting together all of our HTML snippets in one string to send to the res.send function below.
    for ( var key in ruleList) {
        if( key != 'All Applications' ) {
            prettyOutput = prettyOutput + ruleList[ key ] + '<br><br>';
        }
    }
    return prettyOutput;
}



router.post('/', function (req, res) {
    console.log(req);
    var token = req.body.AccessToken;
    var domain = req.body.Domain;
    var management = new ManagementClient({
        token: token,
        domain: domain
    });
    var rule_pagination = {
        per_page: 2,
        page: 0
    };
    getRules(management, rule_pagination).then(function(rules) {
        console.log( rules );
        for( var i = 0; i < rules.length; i++ ) {
            if( rules[i] != undefined ) {
                console.log( rules[i]['name']);
            }
        }
        var client_pagination = {
            per_page: 2,
            page: 0
        };
        getClients(management, client_pagination).then(function(clients) {
            for( var i = 0; i < clients.length; i++ ) {
                if( clients[i] != undefined ) {
                    console.log( clients[i]['name']);
                }
            }
            var output = getInfo(clients, rules );
            res.send( output); 
        });
        });
    })

module.exports = router;

