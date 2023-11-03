const csv = require('csv-parser');
const fs = require('fs');

const platformClient = require('purecloud-platform-client-v2');
const groupsApiProxy = require('./proxies/groupsapi');
const usersApiProxy = require('./proxies/usersapi');
const { error } = require('console');

function wait(ms) {
  var start = new Date().getTime();
  var end = start;
  while (end < start + ms) {
    end = new Date().getTime();
  }
}
/**
 * Takes a list of users (sourced from a csv file) and assigns them to a group
 * @param {*} users 
 * @param {*} groupName 
 */
async function assignUsersToGroups(users, groupName) {
  console.debug("#### START assignUsersToGroups : groupName => " + groupName);

  const usersArray = await users;
  let arrayOfArrays = [];

  // Endpoint autohrize only 50 membersId, so we need to split the usersArray
  console.debug("#### START assignUsersToGroups : split");
  if (usersArray.length > 50) {
    var size = 50;
    for (var i = 0; i < usersArray.length; i += size) {
      arrayOfArrays.push(usersArray.slice(i, i + size));
    }
    console.log(arrayOfArrays);
  }
  console.debug("#### END assignUsersToGroups : split");

  //console.debug("### assignUsersToGroups : usersArray " + JSON.stringify(usersArray));

  //Search GroupId by group name
  const group = await (groupsApiProxy.getGroupByName(groupName));
  //console.debug(JSON.stringify(group));
  //console.debug("#### assignUsersToGroups : groupId =>"+group.id);

  let userInError = [];

  console.debug("#### START assignUsersToGroups : search Users");
  for (array of arrayOfArrays) {

    let userIdsInGroup = [];
    

    console.debug("#### START assignUsersToGroups : search Users : array length => " + array.length);
    for (userItem of array) {      
      console.debug("#### assignUsersToGroups : searchUser => [" + (array.indexOf(userItem) + 2 + (arrayOfArrays.indexOf(array) * 50)) + "] - " + userItem);
      const userSearch = await usersApiProxy.searchUser(userItem);
      wait(500);
      //console.debug("#### assignUsersToGroups : userFound => "+JSON.stringify(userSearch.results));
      //console.debug("#### assignUsersToGroups : userId => "+userSearch.results[0].id);
      if (userSearch !== null && userSearch.results !== null) {
        if (userSearch.results.length > 0) {
          userIdsInGroup.push(userSearch.results[0].id);
        }
      }
      else {
        console.error("##### ERROR assignUsersToGroups :" + userItem + " n\'existe pas");
        userInError.push(userItem);
      }
    }


    //console.debug("#### assignUsersToGroups : usersIdsInGroup "+JSON.stringify(userIdsInGroup));

    if (userIdsInGroup.length > 0) {
      try {
        console.debug("#### START assignUsersToGroups : addUsersToAGroup : userIdsInGroup length => " + userIdsInGroup.length);
        await groupsApiProxy.addUsersToAGroup(group.id, userIdsInGroup);
      } catch (e) {
        console.error(`Error in assignUsersToGroup`, userItem, e);
      }
    }

  }

  console.debug("#### END assignUsersToGroups : groupName => " + groupName);

  console.debug("#### END assignUsersToGroups : userInError => " + JSON.stringify(userInError));

}




/*
  The bulkGroupMembers function will parse the csv file in question and then create
  the user. 

  The code is going to use a scatter/pattern.  As each CSV record is read via a stream,
  it will call create the user.  After each createUser function is called, it will push a promise into the
  the resultsPromise array.  Then, once the file is completely process, the code will WAIT for all promises to resolve.
*/
async function bulkGroupMembers(filename, groupName) {
  let resultPromises = [];
  let users = [];

  console.log('##### Entering bulkGroupMembers')

  fs.createReadStream(filename)
    .pipe(csv())
    .on('data', async (user) => {
      resultPromises.push(groupsApiProxy.getGroups);
      users.push(user.email);
      //console.debug("##### bulkGroupMembers : on Data : users => "+JSON.stringify(users));
    })
    .on('end', async () => {
      await assignUsersToGroups(users, groupName);
    });
}


exports.bulkGroupMembers = bulkGroupMembers;
exports.assignUsersToGroups = assignUsersToGroups;

