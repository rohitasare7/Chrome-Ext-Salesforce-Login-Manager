<script setup>
/*global chrome*/
import { ref, onMounted } from 'vue';

// note : main storage list : recordList
const encryptionKey = 'salesForceManager19032024';
let records = ref([]);
let storage = chrome.storage.sync;

const fetchData = () => {
    storage.get('recordList', (result) => {
        console.log('rec list --> ' + JSON.stringify(result));
        records.value = result.recordList;
    });
}

onMounted(() => {
    //Fetch existing data from Chrome storage
    fetchData();
});

const fetchItemData = (index) => {
    let item = null;
    item = records.value.find(item => item.id === index);
    return item;
}

const editItem = (index) => {
    // Handle edit functionality
    console.log('Edit item:', index);
};

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

const deleteItem = (id) => {
    // Handle edit functionality
    const index = records.value.findIndex(item => item.id === id);
    if (index !== -1) {
        records.value.splice(index, 1);
        storage.set({ recordList: records.value }, () => {
            console.log('Item deleted successfully');
        });
    } else {
        console.error('Item not found');
    }
};

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

</template>

<script>
export default {
    name: 'DisplayRecordsComp',
}
</script>