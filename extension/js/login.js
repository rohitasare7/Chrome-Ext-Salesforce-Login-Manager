//Get Username, Password, URL From Login.html url
//import { decrypt } from "/js/crypto.js";
/*global chrome*/

function getParams() {
  const params = {};
  const search = window.location.search.substring(1);
  const pairs = search.split("&");

  for (const pairString of pairs) {
    const [key, value] = pairString.split("=");
    const decodedValue = decodeURIComponent(value);

    if (params[key] === undefined) {
      params[key] = decodedValue;
    } else if (typeof params[key] === "string") {
      params[key] = [params[key], decodedValue];
    } else {
      params[key].push(decodedValue);
    }
  }
  return params;
}

function decryptItem(data) {
  const encryptionKey = "salesForceManager19032024";
  // eslint-disable-next-line no-undef
  return CryptoJS.AES.decrypt(data, encryptionKey).toString(CryptoJS.enc.Utf8);
}

// Function to pass the record ID to the background script
function passRecordId(recId) {
  chrome.runtime.sendMessage({ type: 'passRecId', recId: recId });
}

// Submit the form and pass the item ID
document.onreadystatechange = function () {
  if (document.readyState === 'complete') {
    
    const item = getParams();
    //alert('item -> '+JSON.stringify(item));
    const form = document.querySelector("form");
    form.action = item.url;
    document.getElementById("username").value = decryptItem(item.un);
    document.getElementById("password").value = decryptItem(item.pw);
    form.submit();
    // Pass the current login record ID after submitting the form
    passRecordId(item.index);
  }
};