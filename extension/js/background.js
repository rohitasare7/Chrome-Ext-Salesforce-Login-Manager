/*global chrome*/
console.log('background.js loaded');
let recIdReceived = false;
let faviconColorReceived = false;
let recIdToUpdateFavicon = null;
let faviconColorToUpdateFavicon = null;

// Listen for messages from login.js
chrome.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
    if (message.type === 'passRecId') {
        console.log('inside passRecId event -->' + message.recId);
        recIdToUpdateFavicon = message.recId;
        recIdReceived = true;
        const faviconColorFromStorage = await fetchItemData(message.recId);
        console.log('favicon color :', faviconColorFromStorage);
        if (faviconColorFromStorage) {
            faviconColorToUpdateFavicon = faviconColorFromStorage;
            sendMessageToUpdateFavicon1(faviconColorFromStorage);
        }
    }
});

// Fetch favicon color from storage
async function fetchFaviconColor() {
    console.log('recIdToUpdateFavicon 1 --> ' + recIdToUpdateFavicon);
    const faviconColorFromStorage = await fetchItemData(recIdToUpdateFavicon);
    console.log('favicon color 2 :', faviconColorFromStorage);
    return faviconColorFromStorage;
}

// Function to send message to content script to update favicon
const sendMessageToUpdateFavicon1 = (colorValue) => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs.length > 0) {
            chrome.tabs.sendMessage(tabs[0].id, { type: 'updateFaviconColor', color: colorValue });
        }
    });
};

// Listen for tab updates
chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
    //console.log('Tab updated:', tabId, changeInfo, tab);
    // Check if the tab has finished loading and has a valid URL
    if (changeInfo.status === 'complete' && tab.url) {
        //console.log('Tab URL:', tab.url);
        const orgUrl = getOrgUrl(tab.url);
        //console.log('Org URL:', orgUrl);
        if (orgUrl && isSalesforceUrl(orgUrl)) {
            const faviconColor = calculateFaviconColor(orgUrl);
            console.log('Favicon color:', faviconColor);
            if (recIdToUpdateFavicon && faviconColorToUpdateFavicon) {
                console.log('recIdToUpdateFavicon 1 --> ' + recIdToUpdateFavicon);
                const faviconColorFromStorage = await fetchItemData(recIdToUpdateFavicon);
                console.log('favicon color 3 :', faviconColorFromStorage);
                sendMessageToUpdateFavicon(tabId, faviconColorFromStorage);
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

const isSalesforceUrl = (url) => {
    const salesforceDomains = ['salesforce.com', 'force.com']; // Add more Salesforce domain formats as needed
    return salesforceDomains.some(domain => url.includes(domain));
};


// Function to extract the org URL from the full URL
const getOrgUrl = (fullUrl) => {
    const urlParts = fullUrl.split('/');
    return urlParts.slice(0, 3).join('/');
};

// Function to calculate the favicon color based on the org URL
const calculateFaviconColor = (value) => {
    faviconColorToUpdateFavicon = value; // Example color (blue)
};

// Function to send message to content script to update favicon
const sendMessageToUpdateFavicon = (tabId, color) => {
    chrome.tabs.sendMessage(tabId, { type: 'updateFaviconColor', color: color });
};




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
            console.log('existingRecords:', existingRecords);
            const itemData = existingRecords.find(item => {
                console.log('Comparing:', item.id, index);
                return index === item.id;
            });
            console.log('itemData:', itemData);
            resolve(itemData ? itemData.faviconColor : null);
        });
    });
};