let tabTuckEnabled = true;
let maxOpenTabs = 500;
let tuckedTabsGroupName = "T";
let tuckedTabGroupId = -1;

// load user options
chrome.storage.sync.get(
	{ tabTuckEnabled: true, tabLimit: 12, tuckedTabsGroupName: "T" },
	(items) => {
		tabTuckEnabled = items.tabTuckEnabled;
		maxOpenTabs = items.tabLimit;
		tuckedTabsGroupName = items.tuckedTabsGroupName;
	}
);

// handle user configurations
chrome.storage.onChanged.addListener((changes, area) => {
	if (area === "sync") {
		if (changes.tabTuckEnabled) {
			tabTuckEnabled = changes.tabTuckEnabled.newValue;
		}
		if (changes.tabLimit) {
			maxOpenTabs = changes.tabLimit.newValue;
		}
		if (changes.tuckedTabsGroupName) {
            console.log("Tucked tabs group name changed", changes.tuckedTabsGroupName.newValue, tuckedTabsGroupName);
            chrome.tabGroups.query(
                {
                    title: tuckedTabsGroupName,
                },
                (tabGroups) => {
                    if (tabGroups.length) {
                        chrome.tabGroups.update(
                            tabGroups[0].id,
                            {
                                title: changes.tuckedTabsGroupName.newValue,
                            },
                            () => {
                                console.log("Updated tab group name");
                            }
                        );
                    }
                }
			);
			tuckedTabsGroupName = changes.tuckedTabsGroupName.newValue;
		}
		console.log("Service worker config updated from storage:", {
			tabTuckEnabled,
			maxOpenTabs,
			tuckedTabsGroupName,
		});
	}
});

chrome.tabs.onCreated.addListener(() => {
	console.log("Created new tab");
	if (!tabTuckEnabled) {
		console.log("Tab tuck is disabled");
		return;
	}

	tuckedTabGroupId = -1; // reset tucked tab group ID incase tab group was ungrouped
	chrome.tabGroups.query(
		{
			title: tuckedTabsGroupName,
		},
		(tabGroups) => {
			if (tabGroups.length) {
				// TODO: show warning if count of tucked tabs is large or disable tabs
				tuckedTabGroupId = tabGroups[0].id;
				console.log("Found tucked tab group with ID: " + tuckedTabGroupId);
			}
		}
	);

	chrome.tabs.query(
		{
			currentWindow: true,
			groupId: chrome.tabGroups.TAB_GROUP_ID_NONE,
		},
		(tabs) => {
			tabs = tabs.filter((tab) => tab.pinned === false);
			const sortedTabs = tabs.sort((a, b) => a.lastAccessed - b.lastAccessed);

			// closing older tabs
			if (sortedTabs.length > maxOpenTabs) {
				if (tuckedTabGroupId === -1) {
					chrome.tabs.group(
						{
							tabIds: sortedTabs
								.slice(0, sortedTabs.length - maxOpenTabs)
								.map((tab) => tab.id),
						},
						(groupId) => {
							console.log("Grouped tabs successfully");
							chrome.tabGroups.update(
								groupId,
								{
									title: tuckedTabsGroupName,
									color: "grey", // this will be a user option
									collapsed: true,
								},
								() => {
									console.log("Updated tab group");
								}
							);
						}
					);
				} else {
					console.log("Tucking away tabs into existing group");
					chrome.tabs.group(
						{
							tabIds: sortedTabs
								.slice(0, sortedTabs.length - maxOpenTabs)
								.map((tab) => tab.id),
							groupId: tuckedTabGroupId,
						},
						(groupId) => {
							console.log("Grouped tabs successfully");
						}
					);
				}
			}
		}
	);
});

// handle tab removal to ungroup the last tucked tab
chrome.tabs.onRemoved.addListener(() => {
	console.log("Tab removed");
	if (!tabTuckEnabled) {
		console.log("Tab tuck is disabled");
		return;
	}

	if (tuckedTabGroupId === -1) {
		console.log("No tucked tab group found, skipping tab removal from group");
		return;
	}

	chrome.tabs.query(
		{
			currentWindow: true,
			groupId: tuckedTabGroupId,
		},
		(tabs) => {
			tabs = tabs.filter((tab) => tab.pinned === false);
			const sortedTuckedTabs = tabs.sort((a, b) => a.lastAccessed - b.lastAccessed);
			console.log("Sorted tabs in tucked group:", sortedTuckedTabs);
			if (sortedTuckedTabs.length === 0) {
				return;
			}
			chrome.tabs.ungroup(sortedTuckedTabs[sortedTuckedTabs.length - 1].id);
		}
	);
});
