// Saves options to chrome.storage
const saveOptions = () => {
    const tabTuckEnabled = document.getElementById('tabTuckEnabled').checked;
    const tabLimit = document.getElementById('tabLimit').value;
    const tuckedTabsGroupName = document.getElementById('tuckedTabsGroupName').value;

    chrome.storage.sync.set(
        { tabTuckEnabled, tabLimit, tuckedTabsGroupName },
        () => {
            // Update status to let user know options were saved.
            const status = document.getElementById('status');
            status.textContent = 'Options saved!!';
            setTimeout(() => {
                status.textContent = '';
            }, 750);
        }
    );
};

// Restores options using the preference stored in chrome.storage.
const restoreOptions = () => {
    chrome.storage.sync.get(
        { tabTuckEnabled: true, tabLimit: 12, tuckedTabsGroupName: 'T' },
        (items) => {
            document.getElementById('tabTuckEnabled').checked = items.tabTuckEnabled;
            document.getElementById('tabLimit').value = items.tabLimit;
            document.getElementById('tuckedTabsGroupName').value = items.tuckedTabsGroupName;
        }
    );
};

document.addEventListener('DOMContentLoaded', restoreOptions);
document.getElementById('save').addEventListener('click', saveOptions);