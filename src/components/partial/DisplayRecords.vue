<script setup>
/*global chrome*/
import { ref, onMounted, computed } from 'vue';
import RecordForm from '@/components/partial/RecordForm';
import { encrypt } from '@/assets/helper';
import TextDesc from '../elements/TextDesc.vue';

// note : main storage list : recordList
let records = ref([]);
let storage = chrome.storage.local;
let isEditing = ref(false);
let showForm = ref(false);
let childItemData = ref(null);
const searchKey = ref('');
let showSettings = ref(false);
const showHelp = ref(false);

const initData = () => {
    // storage.get('recordList', (result) => {
    //     records.value = result.recordList;
    // });
    storage.get('recordList', (result) => {
        if (!result.recordList) {
            storage.set({ 'recordList': [] });
            records.value = [];
        }
        else {
            records.value = result.recordList;
        }
    });
}

const fetchItemData = (index) => {
    let item = null;
    item = records.value.find(item => item.id === index);
    return item;
}

const saveToChrome = (itemList) => {
    storage.set({ recordList: itemList }, () => {
        //console.log('Record list updated successfully');
    });
}

const getOrgURL = (orgType, orgUrl) => {
    if (orgType === 'dev') {
        return 'https://test.salesforce.com';
    }
    else if (orgType === 'prod') {
        return 'https://login.salesforce.com';
    }
    else {
        return orgUrl;
    }
}

const openTab = (index) => {
    let item = fetchItemData(index);
    let orgURL = getOrgURL(item.orgType, item.orgURL);
    const url = orgURL;
    const username = item.username;
    const pass = item.password;
    chrome.tabs.create({
        url: `${chrome.runtime.getURL('login.html')}?url=${url}&pw=${pass}&un=${username}&index=${index}`,
    });
};

// Function to check if incognito access is allowed (async)
const checkIncognitoAccess = () => {
    return new Promise((resolve) => {
        chrome.extension.isAllowedIncognitoAccess(function (isAllowedAccess) {
            if (!isAllowedAccess) {
                alert('Please enable Incognito Access for this extension');
                resolve(false);
            } else {
                resolve(true);
            }
        });
    });
};

const openWindow = async (index, isIncognito) => {
    //throw error if Incognito is disabled in extension settings
    let triggerWindow = true;

    // Check if incognito access is required
    if (isIncognito) {
        triggerWindow = await checkIncognitoAccess();
    }
    console.log('triggerWindow --> ' + triggerWindow);

    if (triggerWindow) {
        let item = fetchItemData(index);
        let orgURL = getOrgURL(item.orgType, item.orgURL);
        const url = orgURL;
        const username = item.username;
        const pass = item.password;
        chrome.windows.create({
            url: `${chrome.runtime.getURL('login.html')}?url=${url}&pw=${pass}&un=${username}`,
            incognito: isIncognito
        });
    }
};

// Handle edit functionality
const editItem = (index) => {
    childItemData.value = fetchItemData(index);
    //console.log('child item --> ' + JSON.stringify(childItemData.value));
    isEditing.value = true;
    showForm.value = true;
};

// Handle delete functionality
const deleteItem = (id) => {
    const index = records.value.findIndex(item => item.id === id);
    if (index !== -1) {
        const updatedRecords = [...records.value];
        updatedRecords.splice(index, 1);
        saveToChrome(updatedRecords);
        records.value = updatedRecords;
    } else {
        console.error('Item not found');
    }
};

const updateRecord = async (id, newData) => {
    const existingRecords = await new Promise((resolve, reject) => {
        storage.get('recordList', (result) => {
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
    records.value = existingRecords;
    isEditing.value = false;
    showForm.value = false;
}

const getLastIndex = (array) => {
    if (array.length === 0) {
        return 1; // Return 1 if the array is empty
    }
    let maxNumber = array[0]; // Initialize maxNumber with the first element of the array
    for (let i = 1; i < array.length; i++) {
        if (array[i] > maxNumber) {
            maxNumber = array[i]; // Update maxNumber if a larger number is found
        }
    }
    return maxNumber;
};

const fetchLastIndex = () => {
    return new Promise((resolve, reject) => {
        storage.get('recordList', (result) => {
            if (result.recordList && result.recordList.length > 0) {
                const idList = result.recordList.map(item => item.id);
                const recordIndex = getLastIndex(idList);
                resolve(recordIndex);
            } else {
                resolve(0); // If no records found, return 0
            }
        });
    });
};

const saveRecord = async (newData) => {
    const existingRecords = await new Promise((resolve, reject) => {
        storage.get('recordList', (result) => {
            const existingRecords = result.recordList || [];
            resolve(existingRecords);
        });
    });
    let item = {};
    let indexId = await fetchLastIndex();
    item.id = indexId + 1;
    item.username = encrypt(newData.username);
    item.password = encrypt(newData.password);
    item.orgType = newData.orgType;
    item.orgURL = newData.orgURL;
    item.name = newData.name;
    item.faviconColor = newData.faviconColor;
    item.timeStamp = Date.now();

    existingRecords.push(item);
    saveToChrome(existingRecords);
    records.value = existingRecords;
    isEditing.value = false;
    showForm.value = false;
}

const handleEvent = (data) => {
    if (data == 'cancelForm') {
        childItemData.value = null;
        showForm.value = false;
        return;
    }
    if (isEditing.value) {
        updateRecord(data.value.id, data.value);
        //console.log('updateRecord --> ' + JSON.stringify(data.value));
        //childItemData.value = null;
        resetChildData();
    }
    else {
        saveRecord(data.value);
        childItemData.value = null;
    }
}

const resetChildData = () => {
    for (const key in childItemData.value) {
        if (Object.hasOwnProperty.call(childItemData.value, key)) {
            if (key === 'faviconColor') {
                childItemData.value[key] = "#0d9dda";
            } else {
                childItemData.value[key] = null;
            }
        }
    }
}

const filteredRecords = computed(() => {
    const search = searchKey.value.toLowerCase();
    if (!search) {
        return records.value; // Return all records if search key is empty
    }
    return records.value.filter(record => record.name.toLowerCase().includes(search));
});

const exportRecords = () => {
    const url = 'data:application/json;base64,' + btoa(JSON.stringify(records.value)); // Encode data
    const filename = 'export.json';
    chrome.downloads.download({ url: url, filename: filename, saveAs: true });
};

// Function to handle file change event
const handleFileChange = (event) => {
    const file = event.target.files[0];
    importRecords(file);
};

const importRecords = (file) => {
    const reader = new FileReader();
    reader.onload = (event) => {
        const importedData = JSON.parse(event.target.result);
        console.log('imported data --> ' + importedData);
        // Assuming importedData is an array of records
        //records.value = importedData;
        saveImportedRecords(importedData);
    };
    reader.readAsText(file);
};

const saveImportedRecords = async (itemList) => {
    // Retrieve existing records from storage
    const existingRecords = await new Promise((resolve, reject) => {
        storage.get('recordList', (result) => {
            const existingRecords = result.recordList || [];
            resolve(existingRecords);
        });
    });
    // Create a map to store unique records by their IDs
    const uniqueRecordsMap = new Map();
    // Iterate over itemList and add/update records in the map
    itemList.forEach(data => {
        uniqueRecordsMap.set(data.id, {
            id: data.id,
            username: data.username,
            password: data.password,
            orgType: data.orgType,
            orgURL: data.orgURL,
            faviconColor: data.faviconColor,
            name: data.name,
            timeStamp: Date.now()
        });
    });
    // Convert the map values to an array of records
    const uniqueRecords = Array.from(uniqueRecordsMap.values());
    // Replace existing records with unique records
    const updatedRecords = existingRecords.filter(record => !uniqueRecordsMap.has(record.id)).concat(uniqueRecords);
    // Save updated records to storage
    saveToChrome(updatedRecords);
    // Update the records.value with the updated records
    records.value = updatedRecords;
    showSettings.value = !showSettings.value;
};

const importFile = ref(null);

const openFileDialog = () => {
    importFile.value.click();
}

const callFaviconMethod = () => {
    // Send a message to the content script to update the favicon color
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        const activeTab = tabs[0];
        console.log('activeTab --> ' + JSON.stringify(activeTab));
        chrome.tabs.sendMessage(activeTab.id, { type: 'updateFaviconColor', color: '#FF5733' });
        console.log('inside callFaviconMethod');
    });
}

//Show help

const toggleShowHelp = () => {
    showHelp.value = !showHelp.value;
};

const webStoreURL = 'https://chromewebstore.google.com/detail/salesforce-login-manager/beemdmmeeddbifmjlaiboldgnffddibd';

const triggerEmail = () => {
    const shareMessage = "Hey! checkout the Salesforce Login Manager! This Chrome extension will help you to log into your Salesforce org with ease! Check it out at Official Chrome Web Store : " + webStoreURL;
    window.open('mailto:?subject=[Chrome Extension] Salesforce Login Manager&body=' + shareMessage);
}

// Init
onMounted(() => {
    //Fetch existing data from Chrome storage
    initData();
});

</script>

<template>

    <div class="flex mb-4" v-if="!showForm">

        <input type="text" id="searchRecord" v-model="searchKey" placeholder="Search.."
            class="max-w-64 bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-md focus:ring-blue-500 focus:border-blue-500 block w-full py-1.5 px-4 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500 !outline-none">

        <button @click="showForm = true" title="Add a new Salesforce Org"
            class="flex items-center py-[1.5] px-4 text-white text-sm font-semibold bg-blue-700 rounded-md hover:bg-blue-800 dark:bg-blue-600 dark:hover:bg-blue-700 mx-4">
            <svg class="fill-white" width="24" height="24" viewBox="0 -960 960 960">
                <path
                    d="M440-501Zm0 381L313-234q-72-65-123.5-116t-85-96q-33.5-45-49-87T40-621q0-94 63-156.5T260-840q52 0 99 22t81 62q34-40 81-62t99-22q81 0 136 45.5T831-680h-85q-18-40-53-60t-73-20q-51 0-88 27.5T463-660h-46q-31-45-70.5-72.5T260-760q-57 0-98.5 39.5T120-621q0 33 14 67t50 78.5q36 44.5 98 104T440-228q26-23 61-53t56-50l9 9 19.5 19.5L605-283l9 9q-22 20-56 49.5T498-172l-58 52Zm280-160v-120H600v-80h120v-120h80v120h120v80H800v120h-80Z" />
            </svg>
            <span class="ml-2">Save Login</span>
        </button>
        <button @click="showSettings = !showSettings" class="flex items-end mr-2" title="Export or Import Data">
            <svg class="bg-gray-200/80 dark:bg-gray-700 hover:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-100 hover:text-white fill-current h-10 w-10 p-2 rounded-full transition-colors duration-300"
                viewBox="0 -960 960 960">
                <path
                    d="M480-480Zm280 360H440q-17 0-28.5-11.5T400-160q0-17 11.5-28.5T440-200h320v-560H200v120q0 17-11.5 28.5T160-600q-17 0-28.5-11.5T120-640v-120q0-33 23.5-56.5T200-840h560q33 0 56.5 23.5T840-760v560q0 33-23.5 56.5T760-120ZM265-80q-79 0-134.5-55.5T75-270q0-57 29.5-102t77.5-68h-62q-17 0-28.5-11.5T80-480q0-17 11.5-28.5T120-520h160q17 0 28.5 11.5T320-480v160q0 17-11.5 28.5T280-280q-17 0-28.5-11.5T240-320v-57q-37 8-61 38t-24 69q0 46 32.5 78t77.5 32q17 0 28.5 11.5T305-120q0 17-11.5 28.5T265-80Zm175-200h80q17 0 28.5-11.5T560-320q0-17-11.5-28.5T520-360h-80q-17 0-28.5 11.5T400-320q0 17 11.5 28.5T440-280Zm0-160h200q17 0 28.5-11.5T680-480q0-17-11.5-28.5T640-520H440q-17 0-28.5 11.5T400-480q0 17 11.5 28.5T440-440ZM320-600h320q17 0 28.5-11.5T680-640q0-17-11.5-28.5T640-680H320q-17 0-28.5 11.5T280-640q0 17 11.5 28.5T320-600Z" />
            </svg>
        </button>

        <button @click="toggleShowHelp" class="flex items-end mr-2" title="Need Help? Click Me!">
            <svg class="h-10 w-10 rounded-full bg-green-100 fill-current p-2 text-green-600 transition-colors duration-300 hover:bg-green-200 dark:bg-gray-700 dark:text-gray-100 dark:hover:bg-gray-600"
                xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                <path fill="currentColor"
                    d="M12 7q-.825 0-1.412-.587T10 5t.588-1.412T12 3t1.413.588T14 5t-.587 1.413T12 7m0 14q-.625 0-1.062-.437T10.5 19.5v-9q0-.625.438-1.062T12 9t1.063.438t.437 1.062v9q0 .625-.437 1.063T12 21" />
            </svg>
        </button>

    </div>

    <RecordForm v-if="showForm" :itemData="childItemData" @fireEvent="handleEvent" />

    <div v-if="!showSettings && !showForm && !showHelp && filteredRecords.length > 0" class="container mx-auto mb-4">
        <table class="table-auto w-full border-collapse" id="mainTable">
            <tbody>
                <tr v-for="(item) in filteredRecords" :key="item.id" class="border-b  dark:border-gray-700">
                    <td class=" px-4 py-1">
                        <div class="flex items-center my-1">
                            <div class="h-2 w-2 rounded-full mr-2" :class="{
                                'bg-green-500 dark:bg-green-400': item.orgType === 'dev',
                                'bg-blue-500 dark:bg-blue-400': item.orgType === 'prod',
                                'bg-gray-500 dark:bg-gray-400': !item.orgType || (item.orgType !== 'dev' && item.orgType !== 'prod')
                            }"></div>
                            <span class="break-all max-w-44 text-sm text-gray-700 dark:text-gray-100">
                                {{ item.name }}
                            </span>
                        </div>
                    </td>
                    <td class="mr-2">
                        <div class="flex items-center justify-center my-1">
                            <button class="bg-blue-700 hover:bg-blue-800 text-white py-2 px-4 rounded-md mr-2"
                                @click="openTab(item.id)" title="Open Salesforce Org in New Tab">New Tab</button>
                            <button class="bg-blue-700 hover:bg-blue-800 text-white py-2 px-4 rounded-md mr-2"
                                @click="openWindow(item.id, false)"
                                title="Open Salesforce Org in New Window">Window</button>
                            <button @click="openWindow(item.id, true)" class="mr-2"
                                title="Open Salesforce Org in New Incognito Tab">
                                <svg class="bg-gray-200/80 hover:bg-gray-600 dark:bg-gray-700 dark:text-gray-100 text-gray-700 hover:text-white fill-current p-2 h-10 w-10 rounded-full transition-colors duration-300"
                                    xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                                    <path
                                        d="M17.06 13C15.2 13 13.64 14.33 13.24 16.1C12.29 15.69 11.42 15.8 10.76 16.09C10.35 14.31 8.79 13 6.94 13C4.77 13 3 14.79 3 17C3 19.21 4.77 21 6.94 21C9 21 10.68 19.38 10.84 17.32C11.18 17.08 12.07 16.63 13.16 17.34C13.34 19.39 15 21 17.06 21C19.23 21 21 19.21 21 17C21 14.79 19.23 13 17.06 13M6.94 19.86C5.38 19.86 4.13 18.58 4.13 17S5.39 14.14 6.94 14.14C8.5 14.14 9.75 15.42 9.75 17S8.5 19.86 6.94 19.86M17.06 19.86C15.5 19.86 14.25 18.58 14.25 17S15.5 14.14 17.06 14.14C18.62 14.14 19.88 15.42 19.88 17S18.61 19.86 17.06 19.86M22 10.5H2V12H22V10.5M15.53 2.63C15.31 2.14 14.75 1.88 14.22 2.05L12 2.79L9.77 2.05L9.72 2.04C9.19 1.89 8.63 2.17 8.43 2.68L6 9H18L15.56 2.68L15.53 2.63Z" />
                                </svg>
                            </button>
                            <button @click="editItem(item.id)" class="mr-2" title="Edit record">
                                <svg class="bg-gray-200/80 hover:bg-blue-600 dark:bg-blue-800 dark:text-gray-100 text-blue-700 hover:text-white fill-current h-10 w-10 p-2 rounded-full transition-colors duration-300"
                                    viewBox="0 -960 960 960">
                                    <path
                                        d="M200-120q-33 0-56.5-23.5T120-200v-560q0-33 23.5-56.5T200-840h261q20 0 30 12.5t10 27.5q0 15-10.5 27.5T460-760H200v560h560v-261q0-20 12.5-30t27.5-10q15 0 27.5 10t12.5 30v261q0 33-23.5 56.5T760-120H200Zm280-360Zm-120 80v-97q0-16 6-30.5t17-25.5l344-344q12-12 27-18t30-6q16 0 30.5 6t26.5 18l56 57q11 12 17 26.5t6 29.5q0 15-5.5 29.5T897-728L553-384q-11 11-25.5 17.5T497-360h-97q-17 0-28.5-11.5T360-400Zm481-384-56-56 56 56ZM440-440h56l232-232-28-28-29-28-231 231v57Zm260-260-29-28 29 28 28 28-28-28Z" />
                                </svg>
                            </button>
                            <button @click="deleteItem(item.id)" title="Delete record" class="">
                                <svg class="bg-gray-200/80 hover:bg-rose-600 text-rose-700 dark:bg-rose-800/80 dark:text-gray-100 hover:text-white fill-current h-10 w-10 p-2 rounded-full transition-colors duration-300"
                                    viewBox="0 -960 960 960">
                                    <path
                                        d="M280-120q-33 0-56.5-23.5T200-200v-520q-17 0-28.5-11.5T160-760q0-17 11.5-28.5T200-800h160q0-17 11.5-28.5T400-840h160q17 0 28.5 11.5T600-800h160q17 0 28.5 11.5T800-760q0 17-11.5 28.5T760-720v520q0 33-23.5 56.5T680-120H280Zm400-600H280v520h400v-520ZM400-280q17 0 28.5-11.5T440-320v-280q0-17-11.5-28.5T400-640q-17 0-28.5 11.5T360-600v280q0 17 11.5 28.5T400-280Zm160 0q17 0 28.5-11.5T600-320v-280q0-17-11.5-28.5T560-640q-17 0-28.5 11.5T520-600v280q0 17 11.5 28.5T560-280ZM280-720v520-520Z" />
                                </svg>
                            </button>
                        </div>
                    </td>
                </tr>
            </tbody>
        </table>
    </div>

    <div v-else-if="!showSettings && !showForm && filteredRecords.length == 0 && searchKey == ''">
        <p class="my-6 text-base font-normal text-gray-500 dark:text-gray-100 lg:text-xl sm:px-16 xl:px-48">Please click
            "Save Login" button to create a record.</p>
    </div>

    <div v-if="showSettings && !showForm && !showHelp">
        <div class="flex items-center justify-center mt-8">
            <h3 class="text-3xl font-bold dark:text-white text-blue-950 m-5">Import or Export your credentials.</h3>
            <button @click="exportRecords"
                class="flex items-center py-2 px-4 text-white text-sm font-semibold bg-blue-700 rounded-md hover:bg-blue-800 dark:bg-blue-600 dark:hover:bg-blue-700 mr-4">
                <svg class="fill-white" width="24" height="24" viewBox="0 -960 960 960">
                    <path
                        d="M480-337q-8 0-15-2.5t-13-8.5L308-492q-12-12-11.5-28t11.5-28q12-12 28.5-12.5T365-549l75 75v-286q0-17 11.5-28.5T480-800q17 0 28.5 11.5T520-760v286l75-75q12-12 28.5-11.5T652-548q11 12 11.5 28T652-492L508-348q-6 6-13 8.5t-15 2.5ZM240-160q-33 0-56.5-23.5T160-240v-80q0-17 11.5-28.5T200-360q17 0 28.5 11.5T240-320v80h480v-80q0-17 11.5-28.5T760-360q17 0 28.5 11.5T800-320v80q0 33-23.5 56.5T720-160H240Z" />
                </svg>
                <span class="ml-1">Export </span>
            </button>

            <button @click="openFileDialog"
                class="flex items-center py-2 px-4 text-white text-sm font-semibold bg-blue-700 rounded-md hover:bg-blue-800 dark:bg-blue-600 dark:hover:bg-blue-700 mr-4">
                <svg class="fill-white" width="24" height="24" viewBox="0 -960 960 960">
                    <path
                        d="M480-337q-8 0-15-2.5t-13-8.5L308-492q-12-12-11.5-28t11.5-28q12-12 28.5-12.5T365-549l75 75v-286q0-17 11.5-28.5T480-800q17 0 28.5 11.5T520-760v286l75-75q12-12 28.5-11.5T652-548q11 12 11.5 28T652-492L508-348q-6 6-13 8.5t-15 2.5ZM240-160q-33 0-56.5-23.5T160-240v-80q0-17 11.5-28.5T200-360q17 0 28.5 11.5T240-320v80h480v-80q0-17 11.5-28.5T760-360q17 0 28.5 11.5T800-320v80q0 33-23.5 56.5T720-160H240Z" />
                </svg>
                <span class="ml-1">Import</span>
            </button>
            <input type="file" id="importFile" ref="importFile" @change="handleFileChange" class="hidden">
            <!-- <input type="file" id="importFile" ref="importFile" @change="handleFileChange" class="hidden"> -->
            <button @click="showSettings = !showSettings"
                class="flex items-center py-2 px-4 text-white text-sm font-semibold bg-gray-700 rounded-md hover:bg-gray-800 dark:bg-blue-600 dark:hover:bg-blue-700 mr-4">
                <svg class="fill-white" width="24" height="24" viewBox="0 -960 960 960">
                    <path
                        d="m273-480 116 116q12 12 11.5 28T388-308q-12 11-28 11.5T332-308L148-492q-12-12-12-28t12-28l184-184q11-11 27.5-11t28.5 11q12 12 12 28.5T388-675L273-560h367q83 0 141.5 58.5T840-360v120q0 17-11.5 28.5T800-200q-17 0-28.5-11.5T760-240v-120q0-50-35-85t-85-35H273Z" />
                </svg>
                <span class="ml-1">Back</span>
            </button>
        </div>
        <div class="flex items-end justify-end mt-10">
            <p class="text-gray-600 dark:text-gray-400">Salesforce Login Manager by <a
                    href="https://www.youtube.com/@ThatSalesforceGuy" target="_blank"
                    class="text-blue-700 dark:text-blue-200 font-semibold">That Salesforce Guy</a></p>
        </div>
    </div>

    <div v-if="showHelp" class="bg-white dark:bg-gray-700 p-4 rounded-xl mt-4">
        <div class="text-gray-900 dark:text-gray-100">
            <h2 class="text-xl font-bold mb-4">Frequently Asked Questions (FAQ)</h2>

            <div class="mb-6">
                <h3 class="text-lg font-semibold">1. How is data stored?</h3>
                <p class="text-sm">Your data is saved locally in Chrome's Local Storage and not on any external server.
                    Check the security policy <a
                        href="https://rohitasare7.github.io/Chrome-Ext-Salesforce-Login-Manager/#security"
                        class="text-blue-600 dark:text-blue-400 underline" target="_blank">here</a>.</p>
            </div>

            <div class="mb-4">
                <h3 class="text-lg font-semibold">2. How to identify org - the colored dot before the name</h3>
                <p class="text-sm mb-1">You'll see a small colored dot before the saved login name:</p>

                <ul class="list-none list-inside text-sm flex flex-col">
                    <li class="inline-flex items-center mb-2">
                        <div class="h-2 w-2 rounded-full mr-2 bg-green-500 dark:bg-green-400"></div>
                        <span>Green = Sandbox</span>
                    </li>
                    <li class="inline-flex items-center mb-2">
                        <div class="h-2 w-2 rounded-full mr-2 bg-blue-500 dark:bg-blue-400"></div>
                        <span>Blue = Production</span>
                    </li>
                    <li class="inline-flex items-center mb-2">
                        <div class="h-2 w-2 rounded-full mr-2 bg-gray-500 dark:bg-gray-400"></div>
                        <span>Gray = Custom org</span>
                    </li>
                </ul>
            </div>

            <div class="mb-6">
                <h3 class="text-base font-semibold">3. What are the ways to log in to a Salesforce org?</h3>
                <p class="text-sm">You can log in using:</p>
                <ul class="list-disc list-inside text-sm">
                    <li>New Tab</li>
                    <li>New Window</li>
                    <li>Incognito (Enable this in Extension Settings)</li>
                </ul>
            </div>

            <div class="mb-6">
                <h3 class="text-base font-semibold">4. Can I edit saved logins?</h3>
                <p class="text-sm">Yes, you can edit any saved login.</p>
            </div>

            <div class="mb-6">
                <h3 class="text-base font-semibold">5. Can I delete a login?</h3>
                <p class="text-sm">Yes, you can delete it permanently from Chrome's Local Storage.</p>
            </div>

            <div class="mb-6">
                <h3 class="text-base font-semibold">6. Can I save my logins?</h3>
                <p class="text-sm">Yes, use the Export feature to save your logins as a JSON file with encrypted
                    usernames and passwords.</p>
            </div>

            <div class="mb-6">
                <h3 class="text-base font-semibold">7. Will my data be lost if I uninstall the extension?</h3>
                <p class="text-sm">Yes, uninstalling will delete all saved data from Chrome's Local Storage. After
                    reinstalling, the data will be lost.</p>
            </div>
        </div>


        <div class="flex items-center justify-start mt-6 py-6 border-t">
            <a class="text-blue-700 font-semibold mr-4" :href="webStoreURL" target="_blank">
                <button class="bg-blue-700 hover:bg-blue-800 text-white py-2 px-4 rounded-md mr-2">Web Store
                    Link</button>
            </a>

            <button class="bg-blue-700 hover:bg-blue-800 text-white py-2 px-4 rounded-md mr-2"
                @click="triggerEmail">Share Extension</button>
        </div>

        <TextDesc class="my-2">If you'd like to show your support, please consider subscribing to
            <a class="text-blue-600 dark:text-blue-400 font-semibold" href="https://www.youtube.com/@ThatSalesforceGuy" target="_blank">That Salesforce Guy</a> YouTube
            channel or sharing it with your colleagues.
        </TextDesc>

        <div class="mt-6 flex items-center justify-end">
            <button @click="toggleShowHelp"
                class="bg-gray-700 hover:bg-gray-800 dark:bg-gray-600 text-white py-2 px-4 rounded-md mr-2">Go
                Back</button>
        </div>

    </div>

</template>

<script>
export default {
    name: 'DisplayRecordsComp',
}
</script>

<style scoped>
.iconBtn {
    padding: 5px 6px;
    margin: 5px 4px;
    line-height: 12px;
}

.iconBtn:hover,
.settingIcon:hover {
    transition: all ease-out .3s;
}

.settingIcon {
    padding: 7px;
    line-height: 12px;
}

#mainTable tbody>tr:last-child {
    border-bottom: 0;
}
</style>