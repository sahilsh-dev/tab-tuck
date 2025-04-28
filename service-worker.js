chrome.action.onClicked.addListener(
    function (tab) {
        chrome.tabGroups.query({}, function (tabGroups) {
                console.log(tabGroups);
                console.log(tabGroups[0]);
                console.log(tabGroups.length);
            }
        )
    }
)