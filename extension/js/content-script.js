/*global chrome*/

console.log('Content script loaded');

// Function to generate a favicon URL with the specified color
const generateFaviconUrl = (color) => {
    // Create a canvas element
    const canvas = document.createElement('canvas');
    canvas.width = 32;
    canvas.height = 32;

    // Get the context of the canvas
    const ctx = canvas.getContext('2d');

    // Draw a solid color rectangle
    ctx.fillStyle = color;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Convert the canvas to a data URL
    const faviconUrl = canvas.toDataURL('image/png');
    console.log('faviconUrl -->' + faviconUrl);
    return faviconUrl;
};

// Function to update the favicon color
const updateFaviconColor = (color) => {
    console.log('content script color --> '+color);
    const faviconUrl = generateFaviconUrl(color);

    // Get the link element for the favicon
    const linkElement = document.querySelector('link[rel="shortcut icon"]');

    // Check if the link element exists
    if (linkElement) {
        // Update the href attribute with the new favicon URL
        linkElement.href = faviconUrl;
    } else {
        // If the link element does not exist, create a new one
        const newLinkElement = document.createElement('link');
        newLinkElement.rel = 'shortcut icon';
        newLinkElement.href = faviconUrl;

        // Append the new link element to the document head
        document.head.appendChild(newLinkElement);
    }

    // Store the color value in localStorage
    localStorage.setItem('faviconColor', color);
};

// Function to set the favicon color on page load
const setFaviconColorOnLoad = () => {
    // Retrieve the color value from localStorage
    const storedColor = localStorage.getItem('faviconColor');

    // If a color is stored, update the favicon color
    if (storedColor) {
        updateFaviconColor(storedColor);
    }
};

// Listen for messages from the extension
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    console.log('inside addListener');
    if (message.type === 'updateFaviconColor') {
        console.log('inside updateFaviconColor --> '+JSON.stringify(message.color));
        // Call the function to update the favicon color
        updateFaviconColor(message.color);
    }
});

// Call the function to set the favicon color on page load
setFaviconColorOnLoad();