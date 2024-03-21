<script setup>
/*global chrome*/
import { ref, onMounted, computed } from 'vue';
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
        url: `${chrome.runtime.getURL('login.html')}?url=${url}&pw=${pass}&un=${username}`,
    });
};

const openWindow = (index, isIncognito) => {
    //throw error if Incognito is disabled in extension settings
    if (isIncognito) {
        chrome.extension.isAllowedIncognitoAccess(function (isAllowedAccess) {
            if (!isAllowedAccess) {
                alert('please enable Incoginto Access for this extension');
                return;
            }
        });
    }
    let item = fetchItemData(index);
    let orgURL = getOrgURL(item.orgType, item.orgURL);
    const url = orgURL;
    const username = item.username;
    const pass = item.password;
    chrome.windows.create({
        url: `${chrome.runtime.getURL('login.html')}?url=${url}&pw=${pass}&un=${username}`,
        incognito: isIncognito
    });
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
        childItemData.value = null;
    }
    else {
        saveRecord(data.value);
        childItemData.value = null;
    }
}

const filteredRecords = computed(() => {
    const search = searchKey.value.toLowerCase();
    if (!search) {
        return records.value; // Return all records if search key is empty
    }
    return records.value.filter(record => record.name.toLowerCase().includes(search));
});

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

    <div v-if="!showForm && filteredRecords.length > 0" class="container mx-auto mb-4">
        <table class="table-auto w-full border-collapse" id="mainTable">
            <tbody>
                <tr v-for="(item) in filteredRecords" :key="item.id"
                    class="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
                    <td class="px-4 py-1 min-w-48">{{ item.name }}</td>
                    <td class="mr-2">
                        <div class="flex items-center justify-center my-1">
                            <button class="bg-blue-700 hover:bg-blue-800 text-white py-2 px-4 rounded-md mr-2"
                                @click="openTab(item.id)">New Tab</button>
                            <button class="bg-blue-700 hover:bg-blue-800 text-white py-2 px-4 rounded-md mr-2"
                                @click="openWindow(item.id, false)">Window</button>
                            <button class="bg-gray-600 hover:bg-gray-700 text-white py-2 px-4 rounded-md mr-2"
                                @click="openWindow(item.id, true)">Incognito</button>
                            <button @click="editItem(item.id)"
                                class="text-blue-500 mr-2 bg-blue-200 hover:text-blue-700 hover:bg-blue-300 rounded-full iconBtn transition-colors duration-300 mr-2">
                                <span class="material-symbols-rounded">
                                    edit_square
                                </span>
                            </button>
                            <button @click="deleteItem(item.id)"
                                class="text-rose-600 bg-rose-200 hover:text-rose-700 hover:bg-rose-300 rounded-full iconBtn transition-colors duration-300">
                                <span class="material-symbols-rounded">
                                    delete
                                </span>
                            </button>
                        </div>
                    </td>
                </tr>
            </tbody>
        </table>
    </div>

    <div v-else-if="filteredRecords.length == 0">
        <p class="my-6 text-base font-normal text-gray-500 lg:text-xl sm:px-16 xl:px-48 dark:text-gray-400">Please click
            "Add Org" button to create a record.</p>
    </div>

</template>

<script>
export default {
    name: 'DisplayRecordsComp',
}
</script>

<style scoped>
.iconBtn {
    padding: 7px 8px;
    margin: 5px 4px;
    line-height: 12px;
}

.iconBtn:hover {
    transition: background-color 0.3s;
}

#mainTable tbody > tr:last-child {
  border-bottom: 0;
}
</style>