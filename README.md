# Auth0 - Rules Tool 
## Know your apps and rules!
### Introduction

This App was made to suplement the admin dashboard for an Auth0 user to view all their apps (clients in Auth0 lingo) in their account (tenant) and the rules within those apps.

#### What are [rules](https://docs.auth0.com/rules)?
- Rules in Auth0 are custom JavaScript code that lives in Auth0's servers and can be used to customize your apps.
- Auth0 has Rule templates that can be used to customize rules for a specific apps, such  as **"Whitelist for a specific app"** or **"Allow access during weekdays for a specific app"**
- You can also pull data from other sources and add it to the user profile, through rules.

These templates contain code that can be customized to apply to a particular app by name or id:

```javascript
function (user, context, callback) {
    if (context.clientName === 'NameOfAppToCheckAccessTo') {
        // do something
    }
    callback(null, user, context);
}
```

### Getting all the Rules in an App

This app makes use of Auth0's [management API](https://auth0.com/docs/api/management/v2/) to get all apps within an account and all the rules within them.

To get all clients we make use of JavaScript's async/await feature to call `getClients` endpoint from the Management API to paginate a list of all apps (and do a similar call for getRules, not shown. *To see complete logic of how we were able to retrieve all your clients and rules within them, please see `listRulesRouter.js` file.*):
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
** Note: to see the complete functions, see code in listRulesRouter.js file** 

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


### To run the app locally:

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

### Instructions

1. Clone the repo and run `npm install && start`

2. Navigate to Auth0 dashboard -> Applications -> Settings and add `http://localhost:3000/callback` and `http://localhost:3000/` to your application's Allowed Callback URLs and Allowed Logout URLs. Like so:
![Alt text](./public/auth0-dashboard-settings-page.png?raw=true "Auth0 App Settings")

3. Navigate to Management API page and update your scope/permissions for your app to include these 3 scopes to get your API token:
    - read:rules
    - read:clients
    - read:clients_keys
![Alt text](./public/update-scope-permissions.png?raw=true "Auth0 Management API Permissions")
4. Enter your API token and tenant name with `auth0.com` and find out all your apps and corresponding rules!

### Acknowledgements:

1. Auth0's [blog on Creating Simple and Secure NodeJS app with Authentication](https://auth0.com/blog/create-a-simple-and-secure-node-express-app/#Setting-Up-Real-World-Authentication-for-Node-js): Used to add authentication into this app

2. [Auth0's Management API](https://auth0.com/docs/api/management/v2/): Management client was used to get all clients and rules (the meat of the application)

3. [Pug templating library](https://pugjs.org/api/getting-started.html): JS Template library used in this app

##### Please feel free to reach out with any questions or suggestions you may have!
