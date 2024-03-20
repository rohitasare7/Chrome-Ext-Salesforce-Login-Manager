<script setup>
/*global chrome*/
import { ref, onMounted, watch } from 'vue';
import { encrypt, decrypt } from '@/assets/helper';

// note : main storage list : recordList
const props = defineProps({
    itemData: Object,
});

const formData = ref({
    username: props.itemData.username ? decrypt(props.itemData.username) : '',
    password: props.itemData.password ? decrypt(props.itemData.password) : '',
    orgType: props.itemData.orgType ?? 'dev',
    orgURL: props.itemData.orgURL ?? '',
    name: props.itemData.name ?? '',
    timeStamp: props.itemData.timeStamp ?? '',
    id: props.itemData.id ?? 0,
});

function toggleCustomOrgInput() {
    if (formData.value.orgType !== 'custom') {
        formData.value.orgURL = ''; // Clear custom org URL if org type changes
    }
}

async function submitForm() {
    //Encrypt the sensitive data
    formData.value.username = encrypt(formData.value.username);
    formData.value.password = encrypt(formData.value.password);
    formData.value.timeStamp = Date.now();

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

onMounted(() => {
    //Fetch existing data from Chrome storage
    //fetchData();
});

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
    name: 'RecordFormComp',
}
</script>