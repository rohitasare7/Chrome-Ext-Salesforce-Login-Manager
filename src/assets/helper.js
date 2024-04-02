/*global chrome*/

import CryptoJS from "crypto-js";
const encryptionKey = "salesForceManager19032024";
let recordListArr = [];

//Encryption function
export function encrypt(data) {
  return CryptoJS.AES.encrypt(data, encryptionKey).toString();
}

//Decryption function
export function decrypt(data) {
  return CryptoJS.AES.decrypt(data, encryptionKey).toString(CryptoJS.enc.Utf8);
}

//Save Data to Chome
export function saveToChrome(itemList) {
  chrome.storage.sync.set({ recordList: itemList }, () => {
    console.log('helper method data saved successfully');
  });
}

export function fetchRecordList() {
  return getRecList();
}

const getRecList = () => {
  chrome.storage.sync.get('recordList', (result) => {
    if (!result.recordList) {
      chrome.storage.sync.set({ 'recordList': [] });
      recordListArr = [];
    }
    else {
      recordListArr = result.recordList;
      console.log('helper arr result --> ' + JSON.stringify(recordListArr));
    }
  });
}

export function fetchItemData(index) {
  let recArray = getRecList();
  let item = null;
  item = recArray.find(item => item.id === index);
  return item;
}


export async function updateRecord(id, newData) {
  const existingRecords = await new Promise((resolve, reject) => {
    chrome.storage.sync.get('recordList', (result) => {
      const existingRecords = result.recordList || [];
      resolve(existingRecords);
    });
  });

  existingRecords.map(item => {
    if (id == item.id) {
      item.username = encrypt(newData.username);
      item.password = encrypt(newData.password);
      item.orgType = newData.orgType;
      item.orgURL = newData.orgURL;
      item.name = newData.name;
      item.faviconColor = newData.faviconColor;
      item.timeStamp = Date.now();
    }
  });
  saveToChrome(existingRecords);
}