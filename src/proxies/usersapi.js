const platformClient = require('purecloud-platform-client-v2');

async function searchUser(userInfo){
  apiInstance = new platformClient.UsersApi();

  const opts = {
      pageNumber:1,
      query : [
         {
            type: "QUERY_STRING",
            fields:[
               "email"
            ],
            value: userInfo
         }
      ]
  }

  try {
    const user = await apiInstance.postUsersSearch(opts);
    // console.log(user);
    return user;
  } catch (e) {
    console.error(`Error has occurred while trying to search user ${userInfo.name}`, e);
    return null;
  }
  

}

exports.searchUser = searchUser;
