const userTabCount = 3; // number of tabs to be kept open at a time, set by user

chrome.action.onClicked.addListener(
    function (tab) {
        // chrome.tabGroups.query({}, function (tabGroups) {
        //         console.log(tabGroups);
        //         console.log(tabGroups[0]);
        //         console.log(tabGroups.length);
        //     }
        // )

        chrome.tabs.query(
            { 
                currentWindow: true, 
                groupId: chrome.tabGroups.TAB_GROUP_ID_NONE
            }, function (tabs) {
                console.log(tabs);
                const sortedTabs = tabs.sort((a, b) => a.lastAccessed - b.lastAccessed);
                console.log(sortedTabs);

                // closing older tabs
                if (sortedTabs.length > userTabCount) {
                    chrome.tabs.group(
                        {tabIds: sortedTabs.slice(0, sortedTabs.length - userTabCount).map(tab => tab.id)},
                        function () {
                            console.log("Grouped tabs successfully");
                        }
                    )
                }
            }
        );
    }
)