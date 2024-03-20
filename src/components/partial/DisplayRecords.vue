<script setup>
/*global chrome*/
import { ref, onMounted } from 'vue';
import RecordForm from '@/components/partial/RecordForm';
import { decrypt, encrypt } from '@/assets/helper';

// note : main storage list : recordList
let records = ref([]);
let storage = chrome.storage.sync;
let isEditing = ref(false);
let showForm = ref(false);
let childItemData = ref(null);
const searchKey = ref('');

const initData = () => {
    storage.get('recordList', (result) => {
        //console.log('rec list --> ' + JSON.stringify(result));
        records.value = result.recordList;
    });
}

const fetchItemData = (index) => {
    let item = null;
    item = records.value.find(item => item.id === index);
    return item;
}

const saveToChrome = (itemList) => {
    let result = Array.isArray(itemList);
    console.log('result 2 --> ' + result);
    storage.set({ recordList: itemList }, () => {
        console.log('Record list updated successfully');
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

    //Handle open in tab functionality
    console.log('Open in tab:', index);
    chrome.tabs.create({
        url: `${chrome.runtime.getURL('login.html')}?url=${url}&pw=${pass}&un=${username}`,
    });
};

const openWindow = (index, isIncognito) => {
    // Handle open in new window functionality
    console.log('Open in window:', index);
    chrome.windows.create({
        url: `${chrome.runtime.getURL('login.html')}`,
        // url: `${chrome.runtime.getURL('login.html')}?a=${ url }&b=${ePassword}&c=${eUsername}`,
        incognito: isIncognito
    });
};

const editItem = (index) => {
    // Handle edit functionality
    childItemData.value = fetchItemData(index);
    // childItemData.value.username = decrypt(childItemData.value.username);
    // childItemData.value.password = decrypt(childItemData.value.password);
    console.log('child item --> ' + JSON.stringify(childItemData.value));
    isEditing.value = true;
    showForm.value = true;
};

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
            console.log('item found --> ' + JSON.stringify(item));
            item.username = encrypt(newData.username);
            item.password = encrypt(newData.password);
            item.orgType = newData.orgType;
            item.orgURL = newData.orgURL;
            item.name = newData.name;
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
            console.log('result --> ' + JSON.stringify(result));
            if (result.recordList && result.recordList.length > 0) {
                const idList = result.recordList.map(item => item.id);
                console.log('idList --> ' + idList);
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
    item.timeStamp = Date.now();

    existingRecords.push(item);
    saveToChrome(existingRecords);
    records.value = existingRecords;
    isEditing.value = false;
    showForm.value = false;
}

const handleEvent = (data) => {
    if (data == 'cancelForm') {
        showForm.value = false;
        return;
    }
    console.log('event data --> ' + JSON.stringify(data.value));
    if (isEditing.value) {
        updateRecord(data.value.id, data.value);
    }
    else {
        saveRecord(data.value);
    }
}

// Init
onMounted(() => {
    //Fetch existing data from Chrome storage
    initData();
});

/* legacy code
const saveRecordsToChromeOld = (itemList) => {
    // Convert itemList to an array if it's not already an array
    const recordArray = Array.isArray(itemList) ? itemList : [itemList];
    // Store recordList as an array in Chrome storage
    storage.set({ recordList: recordArray }, () => {
        console.log('Record list updated successfully');
    });
}
*/
</script>

<template>

    <div class="flex mb-4">
        <input type="text" id="searchRecord" v-model="searchKey" placeholder="Search.."
            class="max-w-64 bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-md focus:ring-blue-500 focus:border-blue-500 block w-full py-1.5 px-4 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500 !outline-none">

        <button @click="showForm = true"
            class="flex items-center py-[1.5] px-4 text-white bg-blue-700 rounded-md hover:bg-blue-800 dark:bg-blue-600 dark:hover:bg-blue-700 mx-4">
            <span class="material-symbols-rounded">add</span>
            <span class="ml-1">Add Org </span>
        </button>

        <button @click="showForm = true"
            class="flex items-center py-[1.5] px-4 text-white bg-blue-700 rounded-md hover:bg-blue-800 dark:bg-blue-600 dark:hover:bg-blue-700 mr-4">
            <span class="material-symbols-rounded">upload</span>
            <span class="ml-1">Export </span>
        </button>
    </div>
    <RecordForm v-if="showForm" :itemData="childItemData" @fireEvent="handleEvent" />

    <div v-if="!showForm" class="container mx-auto mb-4">
        <table class="table-auto w-full border-collapse">
            <tbody>
                <tr v-for="(item) in records" :key="item.id" class="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
                    <td class="px-4 py-2">{{ item.name }}</td>
                    <td class="px-4 py-2">
                        <button @click="editItem(item.id)" class="text-blue-500">
                            <span class="material-symbols-rounded">
                                edit_square
                            </span>
                        </button>
                    </td>
                    <td class="px-4 py-2">
                        <button @click="deleteItem(item.id)" class="text-rose-600">
                            <span class="material-symbols-rounded">
                                delete
                            </span>
                        </button>
                    </td>
                    <td class="px-4 py-2">
                        <button class="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded mr-2"
                            @click="openTab(item.id)">New Tab</button>
                        <button class="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded mr-2"
                            @click="openWindow(item.id, false)">Window</button>
                        <button class="bg-gray-600 hover:bg-gray-700 text-white py-2 px-4 rounded"
                            @click="openWindow(item.id, true)">Incognito</button>
                    </td>
                </tr>
            </tbody>
        </table>
    </div>


</template>

<script>
export default {
    name: 'DisplayRecordsComp',
}
</script>