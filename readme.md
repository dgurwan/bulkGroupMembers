# Introduction

Welcome to the bulkGroupMembers repo. This repo contains a node.js-based command line script that will take a input file and group name

1. Search users defined in data
    example :
        email
        foo@foo.fr
        foo1@foo.fr
2. Assign the user to a group within Genesys Cloud.

## Installing and running the code

All code was run using node version 14.3.0. The code should work with Node 11 and above. To run the code you need to first:

1. Ensure that node 14 or higher is running on your server.
2. Run `npm i` to install all of the packages and dependencies.
3. Setup a OAuth client Credential grant in your OAUTH instance. For the purposes of this tutorial, an OAuth client was configured with the Communicate Admin and Telephony Admin roles.

4. Set the following environment variables in index.js

   - GENESYS_CLIENT_ID=`<<YOUR CLIENT ID>>`
   - GENESYS_CLIENT_SECRET=`<<YOUR CLIENT SECRET>>`
   - GENESYS_ORG_REGION=`<<YOUR GENESYS CLOUD ORG REGION>>`

   **Notes**:
   - The GENESYS_ORG_REGION is the AWS Region where your Genesys Cloud org is hosted (eg. us-east-1). For more info on the regions and how to identify them, consult the [Platform API](https://developer.mypurecloud.com/api/rest/#authentication) page.
   - You can also set the above environment variables in .env file.


5. To run the actual code, you can change to the src directory and run: `node .\index.js ../data/userdata_foo.csv foo`

