# Auth0 - Rules Tool 
## Know your apps and rules!
### Introduction

This App was made to suplement the admin dashboard for an Auth0 user to view all their apps in their account (tenant) and the rules within those apps.

#### What are rules?
- Rules in Auth0 are custom JavaScript code that lives in Auth0's servers and can be used to customize your apps.
- Auth0 has Rule templates that can be used to customize rules for a specific apps (clients in Auth0), such  as "Whitelist for a specific app" or "Allow access during weekdays for a specific app"
- You can also pull data from other sources and add it to the user profile, through [ rules](https://docs.auth0.com/rules).

These templates contain code that can be customized to apply to a particular app by name or id:

```javascript
function (user, context, callback) {
    if (context.clientName === 'NameOfAppToCheckAccessTo') {
        // do something
    }
    callback(null, user, context);
}
```

### Apps and their Rules

This app makes use of Auth0's [management API](https://auth0.com/docs/api/management/v2/) to get all apps within an account and all the rules within them

To get all clients we make use of async await to call paginate a list of all apps:
```javascript
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
```

To get all rules that belong to an app, we use regex to match the line for client.  The parentheses will capture the client name from the object. (It should be index 2 in the array on a match).
```javascript
    var clientMatch = /context.clientName (===|!==|==|!=) '(.*?)'/;
```

Next, we use the clientMatch variable to find the rules tied to a particular client(app):
```javascript
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
```

## Screenshots 

### Dashboard page after login:
![Alt text](./public/dashboardPage.png?raw=true "Dashboard view once logged in")

### Dashboard page with error validation: 
![Alt text](./public/dashboardWithErrorValidation.png?raw=true "Dashboard with error validation")

### List Rules page: 
![Alt text](./public/listRulesPage.png?raw=true "List Rules Page")


### To run the app:

1. Install the dependencies.

```bash
npm install && npm start
```

 2. Rename `.env.example` to `.env` and replace the values for `AUTH0_CLIENT_ID`, `AUTH0_DOMAIN`, and `AUTH0_CLIENT_SECRET` with your Auth0 credentials. If you don't yet have an Auth0 account, [sign up](https://auth0.com/signup) for free.

```bash
# copy configuration and replace with your own
cp .env.example .env
```

3. Run the app.

```bash
npm start
```

The app will be served at `localhost:3000`.
