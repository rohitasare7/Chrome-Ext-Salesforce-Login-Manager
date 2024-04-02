/*global chrome*/
let recIdReceived = false;
let faviconColorReceived = false;
let recIdToUpdateFavicon = null;
let faviconColorToUpdateFavicon = null;

// Listen for messages from login.js
chrome.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
    if (message.type === 'passRecId') {
        recIdToUpdateFavicon = message.recId;
        recIdReceived = true;
        const faviconColorFromStorage = await fetchItemData(message.recId);
        if (faviconColorFromStorage) {
            faviconColorToUpdateFavicon = faviconColorFromStorage;
        }
    }
});

// Listen for tab updates
chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
    //console.log('inside onUpdated');
    // Check if the tab has finished loading and has a valid URL
    if (changeInfo.status === 'complete' && tab.url) {
        const orgUrl = getOrgUrl(tab.url);
        if (orgUrl && isSalesforceUrl(orgUrl)) {
            if (recIdToUpdateFavicon && faviconColorToUpdateFavicon) {
                const faviconColorFromStorage = await fetchItemData(recIdToUpdateFavicon);
                sendMessageToUpdateFavicon(tabId, faviconColorFromStorage, extractValue(orgUrl));
                const updateOrgURL = await updateRecordItem(recIdToUpdateFavicon, extractValue(orgUrl));
                // Reset recIdToUpdateFavicon and faviconColorToUpdateFavicon after use
                recIdToUpdateFavicon = null;
                faviconColorToUpdateFavicon = null;
            }
        } else {
            //console.log('Invalid org URL:', tab.url);
        }
    } else {
        //console.log('Tab status not complete or URL is invalid.');
    }
});

// Function to send message to content script to update favicon
const sendMessageToUpdateFavicon = (tabId, color, orgIdentifierValue) => {
    chrome.tabs.sendMessage(tabId, { type: 'updateFaviconColor', color: color, orgIdentifier: orgIdentifierValue });
};

const isSalesforceUrl = (url) => {
    const salesforceDomains = ['salesforce.com', 'force.com', 'visualforce.com', 'lightning.com', 'salesforce-communities.com', 'salesforce-experience.com', 'site.com']; // Add more Salesforce domain formats as needed
    return salesforceDomains.some(domain => url.includes(domain));
};

// Function to extract the org URL from the full URL
const getOrgUrl = (fullUrl) => {
    const urlParts = fullUrl.split('/');
    return urlParts.slice(0, 3).join('/');
};

// Function to extract the desired value from the URL
function extractValue(url) {
    const prodPattern = /https:\/\/([^.]+)\.(lightning\.force\.com|my\.salesforce\.com|vf\.force\.com|my\.site\.com)$/;
    const prodMatch = url.match(prodPattern);
    if (prodMatch) {
        return prodMatch[1];
    }

    const sandboxPattern = /https:\/\/([^.]+)\.sandbox\.(lightning\.force\.com|my\.salesforce\.com|vf\.force\.com|my\.site\.com)$/;
    const sandboxMatch = url.match(sandboxPattern);
    if (sandboxMatch) {
        return sandboxMatch[1];
    }

    const devPattern = /https:\/\/([^.]+)\.develop\.(lightning\.force\.com|my\.salesforce\.com|vf\.force\.com|my\.site\.com)$/;
    const devMatch = url.match(devPattern);
    if (devMatch) {
        return devMatch[1];
    }

    const trailblazePattern = /https:\/\/([^-]+)-([^.]+)\.trailblaze\.(lightning\.force\.com|my\.salesforce\.com|vf\.force\.com|my\.site\.com)$/;
    const trailblazeMatch = url.match(trailblazePattern);
    if (trailblazeMatch) {
        return trailblazeMatch[2];
    }

    return null;
}

// Check if the extractValue is present in the current URL
function isValidUrl(url, extractValue) {
    return url.includes(extractValue);
}

//Get Item Data
const fetchItemData = async (index) => {
    // Parse index as a number
    index = parseInt(index, 10);

    return new Promise((resolve, reject) => {
        chrome.storage.sync.get('recordList', (result) => {
            if (chrome.runtime.lastError) {
                console.error('Error retrieving recordList:', chrome.runtime.lastError);
                reject(chrome.runtime.lastError);
                return;
            }
            const existingRecords = result.recordList || [];
            const itemData = existingRecords.find(item => {
                if (index === item.id) {
                    return item;
                }
                else {
                    return null;
                }
            });
            resolve(itemData.faviconColor);
        });
    });
};

// Update the Org identifier on first login
async function updateRecordItem(id, orgIdenifierValue) {
    let updateChromeStorage = false;
    const existingRecords = await new Promise((resolve, reject) => {
        chrome.storage.sync.get('recordList', (result) => {
            const existingRecords = result.recordList || [];
            resolve(existingRecords);
        });
    });

    existingRecords.map(item => {
        if (id == item.id && item.orgIdentifier != orgIdenifierValue) {
            item.orgIdentifier = orgIdenifierValue;
            item.timeStamp = Date.now();
            updateChromeStorage = true;
        }
    });

    chrome.storage.sync.set({ recordList: existingRecords }, () => {
        // console.log('bg.js data saved successfully');
    });
}
