/*global chrome*/

// Listen for messages from the extension
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === 'updateFaviconColor') {
        // Call the function to update the favicon color
        updateFaviconColor(message.color);
    }
});

// Function to generate a favicon URL with the specified color
const FAVICON_IMAGE_SRC = 'data:image/png;base64,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';
//console.log('FAVICON_IMAGE_SRC --> ' + FAVICON_IMAGE_SRC);

const generateFaviconUrl = (color) => {
    return new Promise((resolve, reject) => {
        // Create a canvas element
        const canvas = document.createElement('canvas');
        canvas.width = 32;
        canvas.height = 32;
        const ctx = canvas.getContext('2d');
        // Create an image element
        const img = new Image();
        // Set the image source
        img.src = FAVICON_IMAGE_SRC;
        img.onload = () => {
            // Draw the image on the canvas
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            // Apply the color overlay
            ctx.fillStyle = color;
            ctx.globalCompositeOperation = 'source-atop';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            // Generate the favicon URL
            const faviconUrl = canvas.toDataURL('image/png');
            resolve(faviconUrl);
        };
        img.onerror = () => {
            reject(new Error('Failed to load the favicon image'));
        };
    });
};


// Function to update the favicon color
const updateFaviconColor = async (colorValue) => {
    const faviconUrl = await generateFaviconUrl(colorValue);
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
        // Use the URL to extract org identifier and fetch favicon color
        const orgIdentifier = extractValue(currentURL);
        const faviconColor = await fetchItemData(orgIdentifier);
        if (faviconColor) {
            await updateFaviconColor(faviconColor);
        }
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
    setFaviconColorOnLoad();
}