/*global chrome*/
console.log('Content script loaded');

// Listen for messages from the extension
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    console.log('inside addListener');
    if (message.type === 'updateFaviconColor') {
        console.log('inside updateFaviconColor --> ' + JSON.stringify(message.color));
        // Call the function to update the favicon color
        updateFaviconColor(message.color);
    }
});

// Function to generate a favicon URL with the specified color
const generateFaviconUrl = (color) => {
    // Create a canvas element
    const canvas = document.createElement('canvas');
    canvas.width = 32;
    canvas.height = 32;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = color;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    const faviconUrl = canvas.toDataURL('image/png');
    console.log('faviconUrl -->' + faviconUrl);
    return faviconUrl;
};

// Function to update the favicon color
const updateFaviconColor = async (colorValue) => {
    console.log('content script color --> ' + colorValue);
    const faviconUrl = generateFaviconUrl(colorValue);
    const linkElement = document.querySelector('link[rel="shortcut icon"]');
    if (linkElement) {
        linkElement.href = faviconUrl;
    } else {
        // If the link element does not exist, create a new one
        const newLinkElement = document.createElement('link');
        newLinkElement.rel = 'shortcut icon';
        newLinkElement.href = faviconUrl;
        // Append the new link element to the document head
        document.head.appendChild(newLinkElement);
    }
};

//Get Item Data
const fetchItemData = async (orgIdentifier) => {
    return new Promise((resolve, reject) => {
        chrome.storage.sync.get('recordList', (result) => {
            if (chrome.runtime.lastError) {
                console.error('Error retrieving recordList:', chrome.runtime.lastError);
                reject(chrome.runtime.lastError);
                return;
            }
            const existingRecords = result.recordList || [];
            const itemData = existingRecords.find(item => {
                return item.orgIdentifier === orgIdentifier || orgIdentifier === item.orgIdentifier + '--c';
            });
            if (itemData) {
                resolve(itemData.faviconColor);
            } else {
                resolve(null); // Return null when no item is found
            }
        });
    });
};



const getOrgUrl = (fullUrl) => {
    const urlParts = fullUrl.split('/');
    return urlParts.slice(0, 3).join('/');
};

// Function to set the favicon color on page load
const setFaviconColorOnLoad = async () => {
    try {
        // Get the current tab URL using window.location.href
        const currentURL = getOrgUrl(window.location.href);
        console.log("Current tab URL:", currentURL);
        // Use the URL to extract org identifier and fetch favicon color
        const orgIdentifier = extractValue(currentURL);
        const faviconColor = await fetchItemData(orgIdentifier);
        //alert('faviconColor --> ' + faviconColor);
        if (faviconColor) {
            await updateFaviconColor(faviconColor);
        }
        // Update favicon color

    } catch (error) {
        console.error("Error setting favicon color:", error);
    }
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

const isSalesforceDomain = () => {
    const salesforceDomains = ['salesforce.com', 'force.com', 'visualforce.com', 'lightning.com', 'salesforce-communities.com', 'salesforce-experience.com', 'site.com'];
    const currentUrl = window.location.hostname;
    return salesforceDomains.some(domain => currentUrl.includes(domain));
};

// Call the function to set the favicon color on page load
if (isSalesforceDomain()) {
    //alert('test');
    setFaviconColorOnLoad();
}