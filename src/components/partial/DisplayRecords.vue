<script setup>
/*global chrome*/
import { ref, onMounted } from 'vue';
import RecordForm from '@/components/partial/RecordForm';
import { decrypt, encrypt } from '@/assets/helper';

// note : main storage list : recordList
let records = ref([]);
let storage = chrome.storage.sync;
let isEditing = ref(false);
let childItemData = ref(null);

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
        //url: `${chrome.runtime.getURL('login.html')}`,
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
    // storage.set({ recordList: existingRecords }, () => {
    //     console.log('data saved');
    // });
    records.value = existingRecords;
    isEditing.value = false;
}

// Function to update an item in the records array
const updateRecord_old = (id, newData) => {
    console.log('newData --> ' + JSON.stringify(newData));
    const index = records.value.findIndex(record => record.id === id);
    if (index !== -1) {
        // Update the username and password fields directly
        console.log('username --> ' + newData.username);
        records.value[index].username = encrypt(newData.username);
        records.value[index].password = encrypt(newData.password);
        records.value[index].orgType = newData.orgType;
        records.value[index].orgURL = newData.orgURL;
        records.value[index].name = newData.name;
        records.value[index].timeStamp = Date.now();
        records.value.push(records.value[index]);
    }
    else {
        console.error('Record not found with id:', id);
    }
    console.log('records.value --> ' + JSON.stringify(records.value));
    //save to chrome
    storage.set({ recordList: records.value }, () => {
        console.log('data saved');
    });
    //console.log('records 2 --> ' + JSON.stringify(records.value));
    isEditing.value = false;
};

const handleEvent = (data) => {
    console.log('event data --> ' + JSON.stringify(data.value));
    updateRecord(data.value.id, data.value);
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

    <div class="container mx-auto mb-4">
        <table class="table-auto w-full border-collapse">
            <tbody>
                <tr v-for="(item) in records" :key="item.id" class="border">
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


    <RecordForm v-if="isEditing" :itemData="childItemData" @fireEvent="handleEvent" />

</template>

<script>
export default {
    name: 'DisplayRecordsComp',
}
</script>