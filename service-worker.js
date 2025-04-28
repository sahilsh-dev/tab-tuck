// number of tabs to be kept open at a time, set by user
// this will be a user option
const maxOpenTabs = 3; 

// name of the group containing the tabs that are to be tucked away
// this will be a user option
const tuckedTabsGroupName = "T";

chrome.action.onClicked.addListener(
    function (tab) {
        let tuckedTabGroupId = -1;
        chrome.tabGroups.query({
                title: tuckedTabsGroupName
            }, (tabGroups) => {
                if (tabGroups.length) {
                    console.log(tabGroups);
                    tuckedTabGroupId = tabGroups[0].id
                    console.log("Found tucked tab group with ID: " + tuckedTabGroupId);
                }
            }
        )

        chrome.tabs.query({ 
                currentWindow: true, 
                groupId: chrome.tabGroups.TAB_GROUP_ID_NONE
            }, (tabs) => {
                const sortedTabs = tabs.sort((a, b) => a.lastAccessed - b.lastAccessed);
                console.log(sortedTabs);

                // closing older tabs
                if (sortedTabs.length > maxOpenTabs) {
                    if (tuckedTabGroupId === -1) {
                        chrome.tabs.group({
                                tabIds: sortedTabs.slice(0, sortedTabs.length - maxOpenTabs).map(tab => tab.id)
                            }, (groupId) => {
                                console.log("Grouped tabs successfully");
                                chrome.tabGroups.update(groupId, {
                                    title: tuckedTabsGroupName,
                                    color: "grey" // this will be a user option
                                }, () => {
                                    console.log("Updated group title and color");
                                });
                            }
                        )
                    } else {
                        console.log("Tucking away tabs into existing group");
                        chrome.tabs.group({
                                tabIds: sortedTabs.slice(0, sortedTabs.length - maxOpenTabs).map(tab => tab.id),
                                groupId: tuckedTabGroupId
                            }, (groupId) => {
                                console.log("Grouped tabs successfully");
                            }
                        )
                    }
                }
            }
        );
    }
)