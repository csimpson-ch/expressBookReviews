// import some required packages
const express = require('express');
const jwt = require('jsonwebtoken');
const session = require('express-session');

// import the provided router code
const customer_routes = require('./router/auth_users.js').authenticated;
const genl_routes = require('./router/general.js').general;

// create the express server
const app = express();

// middleware for working with JSON
app.use(express.json());

// middleware for authentication
app.use("/customer",session({secret:"fingerprint_customer", resave: true, saveUninitialized: true}))


// authentication mechanism for all resources in this endpoint
app.use("/customer/auth/*", function auth(req, res, next){
    
    // use conditional to check that session.authorisation exists
    if (req.session.authorization) {

        // get the access token
        token = req.session.authorization['accessToken'];

        // use jwt to verify token
        jwt.verify(token, "access", (err, user) => {
            
            // set user and go next if token verified
            if (!err) {
                req.user = user;
                next();
            
            // return error if token not verified
            } else {
                return res.status(403).json({message: "User not authenticated"})
            }
        });

    // if session.authorization invalid, give an error message
    } else {
        return res.status(403).json({message: "User not logged in"})
    }
});

// set the port to be used
const PORT = 5000;

// set the routing to be used
app.use("/customer", customer_routes);
app.use("/", genl_routes);

// have the server listen at the port
app.listen(PORT, () => console.log("Server is running"));
