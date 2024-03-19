<script setup>
/*global chrome*/
import { ref, onMounted } from 'vue';
import { encrypt } from '@/assets/helper';

// note : main storage list : recordList
const encryptionKey = 'salesForceManager19032024';
let records = [];
let dataEntries = ref([]); // to render on UI but ignore for now
let storage = chrome.storage.sync;

const formData = ref({
    username: '',
    password: '',
    orgType: 'dev',
    customOrgUrl: '',
    name: '',
    timeStamp: '',
    id: 0
});

onMounted(() => {
    //Fetch existing data from Chrome storage
    //fetchData();
});

const fetchData = () => {
    storage.get('recordList', (result) => {
        console.log('result --> ' + JSON.stringify(result));
    });
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

function toggleCustomOrgInput() {
    if (formData.value.orgType !== 'custom') {
        formData.value.customOrgUrl = ''; // Clear custom org URL if org type changes
    }
}

async function submitForm() {
    //Encrypt the sensitive data
    formData.value.username = encrypt(formData.value.username, encryptionKey);
    formData.value.password = encrypt(formData.value.password, encryptionKey);
    //get last index for record
    const indexId = await fetchLastIndex() + 1;
    formData.value.id = indexId;
    //Add timestamp
    formData.value.timeStamp = Date.now();
    //push data to list
    records.push(formData.value);
    //set data in chrome storage
    storage.set({ recordList: records }, () => {
        console.log('data saved');
    });
    clearForm();
}

function clearForm() {
    formData.value = {
        username: '',
        password: '',
        orgType: 'dev',
        customOrgUrl: '',
        name: ''
    };
}
</script>

<template>
    <div class="row">
        <div class="col col-6-lg">
        <form @submit.prevent="submitForm">
            <label for="username">Username:</label>
            <input type="text" id="username" v-model="formData.username" required>

            <label for="password">Password:</label>
            <input type="password" id="password" v-model="formData.password" required>

            <label for="orgType">Organization Type:</label>
            <select id="orgType" v-model="formData.orgType" @change="toggleCustomOrgInput">
                <option value="dev">Development</option>
                <option value="prod">Production</option>
                <option value="custom">Custom</option>
            </select>

            <input v-if="formData.orgType === 'custom'" type="text" id="customOrgUrl" v-model="formData.customOrgUrl"
                placeholder="Custom Org URL">

            <label for="name">Name:</label>
            <input type="text" id="name" v-model="formData.name" required>

            <button type="submit" class="button primary">Submit</button>
        </form>
        <button @click="fetchData">fetch</button>
    </div>
        <ul>
            <li v-for="(entry, index) in dataEntries" :key="index">
                <span>{{ entry.username }}</span>
                <span>{{ entry.orgType }}</span>
                <span v-if="entry.orgType === 'custom'">{{ entry.customOrgUrl }}</span>
                <span>{{ entry.name }}</span>
            </li>
        </ul>
    </div>
</template>

<script>
export default {
    name: 'TestA',
    props: {
        msg: String
    }
}
</script>