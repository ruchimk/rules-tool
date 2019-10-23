var ManagementClient = require('auth0').ManagementClient;
const express = require('express')
var router = express.Router();

router.use(express.urlencoded())

/*
Pagination with
getRules and getClients, 
for accounts with many apps and rules
*/

// Recursive function to iterate through all the rules by calling getRulesPage 
async function getRules(management, pagination) {
    let allRules = [];
    var rulePage = await getRulePage(management,pagination)
    allRules.push( rulePage );
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

// management is be auth0 client and pagination will be 
// an associated array of two numbers - rules per page and starting page
async function getRulePage(management, pagination ) {
    return await management.getRules(pagination).then(function(rules) {
        return rules;
    })
}

//Recursive function to iterate through all the clients by calling getClientsPage 
async function getClients(management, pagination) {
    let allClients = [];
    var clientPage = await getClientPage(management,pagination)
    allClients.push( clientPage );
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
    // Initialize variables
    var ruleList = {};

    // Regex to match the line for client.  The parentheses will capture the client name from the object. 
    // (It should be index 1 in the array on a match).
    var clientMatch = /context.clientName (===|!==|==|!=) '(.*?)'/;

    // Add all apps to an array
    for ( var i = 0; i < clients.length; i++ ) {
        if ( clients[i] != undefined ) {
            ruleList[ clients[i]['name'] ] = [];
        }
    }

    // Iterating through all rules to tie them to their apps
    for( var i = 0; i < rules.length; i++ ) {
        if ( rules[i] != undefined ) {
        var match = clientMatch.exec( rules[i]['script'] );
        if (match != null ) {
            // We have found the line to tie this rule to an app. 
            // As noted above, index 2 should be the app name.
            ruleList[ match[2] ].push( rules[i]['name']);
        } else {
            for ( var key in ruleList) {
                // We did not find the line in the script for this rule. Assuming this should apply to ALL apps.
                ruleList[ key ].push(rules[i]['name']);
            }
            }
        }
    }
    return ruleList;
}

router.post('/', function (req, res) {
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
        for( var i = 0; i < rules.length; i++ ) {
            if( rules[i] != undefined ) {
                rules[i]['name']
            }
        }
        var client_pagination = {
            per_page: 2,
            page: 0
        };
        getClients(management, client_pagination).then(function(clients) {
            for( var i = 0; i < clients.length; i++ ) {
                if( clients[i] != undefined ) {
                    clients[i]['name'];
                }
            }
            var appsAndRulesArray = getInfo(clients, rules );
            console.log('Here comes the JSON');
            console.log( appsAndRulesArray);
            res.render("listRules", { appsAndRules: appsAndRulesArray });
        });
        
    });
    })



module.exports = router;

