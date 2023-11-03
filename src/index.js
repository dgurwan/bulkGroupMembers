const dotenv = require('dotenv');
const groupsApiProxy = require('./proxies/groupsapi');
const authApiProxy = require('./proxies/authenticateapi');
const provision = require('./provision');

dotenv.config();
const filename = process.argv[2];
const groupName = process.argv[3];
const platformClient = require('purecloud-platform-client-v2');

const GENESYS_CLIENT_ID = "";
const GENESYS_CLIENT_SECRET = "";
const GENESYS_ORG_REGION = platformClient.PureCloudRegionHosts.eu_central_1;

//Main function
(async () => {
  const token = await authApiProxy.authenticate(
    GENESYS_CLIENT_ID,
    GENESYS_CLIENT_SECRET,
    GENESYS_ORG_REGION);

  const groupePage = await groupsApiProxy.getGroups();

  await provision.bulkGroupMembers(filename, groupName);

})();
