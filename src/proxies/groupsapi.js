const platformClient = require('purecloud-platform-client-v2');
const { retry } = require('@lifeomic/attempt');

let groupsMap = {};

async function getGroup(pageNum) {
  //console.debug("#### groupsapi : Entering getGroup("+pageNum+")");
  const opts = {
    pageSize: 100,
    pageNumber: pageNum,
  };

  const apiInstance = new platformClient.GroupsApi();

  try {
    return await apiInstance.getGroups(opts);
  } catch (e) {
    console.log(`Error while retrieving group for page number: ${pageNum}: ${JSON.stringify(e, null, 4)}`);
    return null;
  }
};

async function getGroups() {
  console.debug("#### groupsapi : Entering getGroups");
  let groups = [];

  let i = 1;
  let pageCount = 0;
  do {
    const group = await getGroup(i);

    if (group != null) {
      pageCount = group.pageCount;
      groups.push(group.entities);
    }

    i++;
  }
  while (i <= pageCount);

  groups
    .flat(1)
    .filter((value) => value != null)
    .forEach((value) => { groupsMap[value.name] = value;});

  //Cloning the internal representation to keep the data immutable
  return { ...groupsMap };
}

async function getGroupByName(groupName) {
  if (groupsMap[groupName] == null) {
    await getGroups();
  }
  return { ...groupsMap[groupName] };
}

async function addUsersToAGroup(groupId, userIds) {

  console.debug("###### entering addUsersToAGroup => "+groupId );

  console.debug("###### usersids.lentgh => "+userIds.length )

  let apiInstance = new platformClient.GroupsApi();

  try {
    await retry(
      async () => {
        const groupVersion = (await apiInstance.getGroup(groupId)).version;
        await apiInstance.postGroupMembers(groupId, {
          memberIds: userIds,
          version: groupVersion,
        });
      },
      { delay: 200, factor: 2, maxAttempts: 5 }
    );
  } catch (e) {
    console.error(`Error occurred while trying create group for user.`, groupId, userIds, e);
  }
};

function getGroupIds() {
  return Object.values(groupsMap).map(value => value.id)
};

exports.getGroups = getGroups;
exports.getGroupIds = getGroupIds;
exports.getGroupByName = getGroupByName;
exports.addUsersToAGroup = addUsersToAGroup;
