<script setup>
/*global chrome*/
import { ref, onMounted } from 'vue';
import { encrypt, decrypt } from '@/assets/helper';

// note : main storage list : recordList
let records = [];
//let dataEntries = ref([]); // to render on UI but ignore for now
let storage = chrome.storage.sync;

const formData = ref({
    username: '',
    password: '',
    orgType: 'dev',
    orgURL: '',
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
        result.recordList.forEach(item => {
            console.log(decrypt(item.username));
        });
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
        formData.value.orgURL = ''; // Clear custom org URL if org type changes
    }
}


async function submitForm() {
    //Encrypt the sensitive data
    formData.value.username = encrypt(formData.value.username);
    formData.value.password = encrypt(formData.value.password);
    //get last index for record
    let indexId = await fetchLastIndex();
    formData.value.id = indexId + 1;
    //Add timestamp
    formData.value.timeStamp = Date.now();
    //formData.value.orgURL = getOrgURL(formData.value.orgType);
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
        orgURL: '',
        name: ''
    };
}
</script>

<template>

    <form @submit.prevent="submitForm" class="space-y-4">
        <div class="grid gap-6 mb-6 md:grid-cols-2">
            <div>
                <label for="username"
                    class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Username:</label>
                <input type="text" id="username" v-model="formData.username" required
                    class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500 !outline-none">
            </div>
            <div>
                <label for="password"
                    class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Password:</label>
                <input type="password" id="password" v-model="formData.password" required
                    class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500 !outline-none">
            </div>
            <div>
                <label for="orgType" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Org Type
                    :</label>
                <select id="orgType" v-model="formData.orgType" @change="toggleCustomOrgInput"
                    class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500 !outline-none">
                    <option value="dev">Sandbox</option>
                    <option value="prod">Production</option>
                    <option value="custom">Custom</option>
                </select>
            </div>
            <div v-if="formData.orgType === 'custom'">
                <input v-if="formData.orgType === 'custom'" type="text" id="orgURL" v-model="formData.orgURL"
                    placeholder="Custom Org URL"
                    class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500 !outline-none">

            </div>
            <div>
                <label for="name" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Name:</label>
                <input type="text" id="name" v-model="formData.name" required
                    class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500 !outline-none">
            </div>
            <button type="submit" class="bg-blue-500 hover:bg-blue-700 text-white text-sm font-bold py-2 px-4 rounded">
                Submit
            </button>
        </div>
    </form>

    <button @click="fetchData"
        class="bg-gray-200 hover:bg-gray-300 text-gray-800 text-sm font-bold py-2 px-4 rounded inline-block mt-4 ml-2">
        Fetch
    </button>


</template>

<script>
export default {
    name: 'MainSFLoginComp',
}
</script>