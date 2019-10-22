var ManagementClient = require('auth0').ManagementClient;
const express = require('express')
var router = express.Router();

router.use(express.urlencoded())

function getInfo(clients, rules) {
    // Initialize variables!
    var ruleList = [];
    var prettyOutput = '';

    // Regex to match the line for client.  The parentheses will capture the client name from the object. (It should be index 1 in the array on a match).
    var clientMatch = /context.clientName === '(.*?)'/;

    // Initialziing html snippets for each app
    for ( var i = 0; i < clients.length; i++ ) {
        ruleList[ clients[i]['name'] ] = "<b>" + clients[i]['name'] + "</b>"
    }

    for( var i = 0; i < rules.length; i++ ) {
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

    management
        .getClients()
        .then(function(clients) {
            management
                .getRules()
                .then(function(rules) {
                    var info = getInfo(clients, rules);
                    res.send('Here are your rules for each app:<br><br>' + info)
            })
        })
        .catch(function(err) {
            console.log( err);
        });
})
module.exports = router;

