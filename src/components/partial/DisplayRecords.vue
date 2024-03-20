<script setup>
/*global chrome*/
import { ref, onMounted } from 'vue';
import RecordForm from '@/components/partial/RecordForm';

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
    isEditing.value = false;
    // Handle edit functionality
    childItemData.value = fetchItemData(index);
    console.log('child item --> '+JSON.stringify(childItemData.value));
    isEditing.value = true;
};

const deleteItem = (id) => {
    // Find the index of the item to delete
    const index = records.value.findIndex(item => item.id === id);
    if (index !== -1) {
        // Create a copy of the records array
        const updatedRecords = [...records.value];
        // Remove the item from the copy of the array
        updatedRecords.splice(index, 1);
        // Save the updated array back to Chrome storage
        storage.set({ recordList: updatedRecords }, () => {
            console.log('Item deleted successfully');
        });
        // Update the records ref with the updated array
        records.value = updatedRecords;
    } else {
        console.error('Item not found');
    }
};

// Init
onMounted(() => {
    //Fetch existing data from Chrome storage
    initData();
});

</script>

<template>

    <div>
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
    </div>

    <RecordForm v-if="isEditing" :itemData="childItemData" />

</template>

<script>
export default {
    name: 'DisplayRecordsComp',
}
</script>