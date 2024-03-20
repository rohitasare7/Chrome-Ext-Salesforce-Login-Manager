<script setup>
/*global chrome*/
import { ref, onMounted, watch, defineEmits } from 'vue';
import { encrypt, decrypt } from '@/assets/helper';

// note : main storage list : recordList
const props = defineProps({
    itemData: Object,
});

const emit = defineEmits(["fireEvent"]);

const formData = ref({
    username: props.itemData?.username ? decrypt(props.itemData.username) : '',
    password: props.itemData?.password ? decrypt(props.itemData.password) : '',
    orgType: props.itemData?.orgType ?? 'dev',
    orgURL: props.itemData?.orgURL ?? '',
    name: props.itemData?.name ?? '',
    timeStamp: props.itemData?.timeStamp ?? '',
    id: props.itemData?.id ?? 0,
});

function toggleCustomOrgInput() {
    if (formData.value.orgType !== 'custom') {
        formData.value.orgURL = ''; // Clear custom org URL if org type changes
    }
}

async function submitForm() {
    //Encrypt the sensitive data
    formData.value.timeStamp = Date.now();
    fireEvent(formData);
}

watch(() => props.itemData, (newValue) => {
    if (newValue) {
        formData.value.username = decrypt(newValue.username) || '';
        formData.value.password = decrypt(newValue.password) || '';
        formData.value.orgType = newValue.orgType || 'dev';
        formData.value.orgURL = newValue.orgURL || '';
        formData.value.name = newValue.name || '';
        formData.value.timeStamp = newValue.timeStamp || '';
        formData.value.id = newValue.id || 0;
    }
});

const clearFormData = () => {
    formData.value = {
        username: '',
        password: '',
        orgType: 'dev',
        orgURL: '',
        name: '',
    };
    console.log('formData.value --> '+JSON.stringify(formData.value));
}

const cancelForm = () => {
    clearFormData();
    fireEvent('cancelForm');
}

const fireEvent = (data) => {
    emit('fireEvent', data);
}

onMounted(() => {
    //Fetch existing data from Chrome storage
    //fetchData();
});

</script>

<template>

    
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
            <div class="flex items-center justify-center">
                <button @click="submitForm"
                    class="bg-blue-700 hover:bg-blue-800 text-white text-sm py-2 px-4 rounded-md mr-2">
                    Submit
                </button>
                <button @click="cancelForm" class="bg-red-700 hover:bg-red-800 text-white text-sm py-2 px-4 rounded-md">
                    Cancel
                </button>
            </div>

        </div>
    

</template>

<script>
export default {
    name: 'RecordFormComp',
}
</script>