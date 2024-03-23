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

const showPassword = ref(false);

function toggleCustomOrgInput() {
    if (formData.value.orgType !== 'custom') {
        formData.value.orgURL = ''; // Clear custom org URL if org type changes
    }
}

async function submitForm() {
    //Encrypt the sensitive data
    formData.value.timeStamp = Date.now();
    fireEvent(formData);
    clearFormData();
}

const updateNameFromUsername = () => {
    formData.value.name = extractDomain(formData.value.username, formData.value.name);
};

const extractDomain = (username, defaultValue) => {
    const atIndex = username.lastIndexOf('@');
    if (atIndex !== -1) {
        return username.slice(atIndex + 1);
    }
    else {
        return defaultValue;
    }
};

const clearFormData = () => {
    formData.value = {
        username: '',
        password: '',
        orgType: 'dev',
        orgURL: '',
        name: '',
    };
    //console.log('formData.value --> ' + JSON.stringify(formData.value));
}

const cancelForm = () => {
    clearFormData();
    fireEvent('cancelForm');
}

const fireEvent = (data) => {
    emit('fireEvent', data);
}

//check if any other edit btn is clicked
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

const togglePasswordVisibility = () => {
    showPassword.value = !showPassword.value;
};

</script>

<template>

    <form @submit.prevent="submitForm" class="space-y-4">
        <div class="grid gap-4 mb-6 md:grid-cols-2">
            <div>
                <label for="username" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Username
                    :</label>
                <input type="text" id="username" v-model="formData.username" @input="updateNameFromUsername" required
                    class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500 !outline-none">
            </div>

            <div>
                <label for="password" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Password
                    :</label>
                <div class="relative">
                    <input :type="showPassword ? 'text' : 'password'" id="password" v-model="formData.password" required
                        class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500 !outline-none pr-12">
                    <button @click="togglePasswordVisibility" type="button"
                        class="absolute inset-y-0 right-0 flex items-center pr-3">
                        <span v-if="showPassword"
                            class="material-symbols-rounded text-gray-500 dark:text-gray-400 cursor-pointer hover:text-blue-600">
                            <svg xmlns="http://www.w3.org/2000/svg"
                                class="fill-gray-500 hover:fill-blue-600 cursor-pointer" height="24"
                                viewBox="0 -960 960 960" width="24">
                                <path
                                    d="M480-320q75 0 127.5-52.5T660-500q0-75-52.5-127.5T480-680q-75 0-127.5 52.5T300-500q0 75 52.5 127.5T480-320Zm0-72q-45 0-76.5-31.5T372-500q0-45 31.5-76.5T480-608q45 0 76.5 31.5T588-500q0 45-31.5 76.5T480-392Zm0 192q-134 0-244.5-72T61-462q-5-9-7.5-18.5T51-500q0-10 2.5-19.5T61-538q64-118 174.5-190T480-800q134 0 244.5 72T899-538q5 9 7.5 18.5T909-500q0 10-2.5 19.5T899-462q-64 118-174.5 190T480-200Zm0-300Zm0 220q113 0 207.5-59.5T832-500q-50-101-144.5-160.5T480-720q-113 0-207.5 59.5T128-500q50 101 144.5 160.5T480-280Z" />
                            </svg>
                        </span>
                        <span v-if="!showPassword"
                            class="material-symbols-rounded text-gray-500 dark:text-gray-400 cursor-pointer hover:text-blue-600">
                            <svg xmlns="http://www.w3.org/2000/svg"
                                class="fill-gray-500 hover:fill-blue-600 cursor-pointer" height="24"
                                viewBox="0 -960 960 960" width="24">
                                <path
                                    d="M607-627q29 29 42.5 66t9.5 76q0 15-11 25.5T622-449q-15 0-25.5-10.5T586-485q5-26-3-50t-25-41q-17-17-41-26t-51-4q-15 0-25.5-11T430-643q0-15 10.5-25.5T466-679q38-4 75 9.5t66 42.5Zm-127-93q-19 0-37 1.5t-36 5.5q-17 3-30.5-5T358-742q-5-16 3.5-31t24.5-18q23-5 46.5-7t47.5-2q137 0 250.5 72T904-534q4 8 6 16.5t2 17.5q0 9-1.5 17.5T905-466q-18 40-44.5 75T802-327q-12 11-28 9t-26-16q-10-14-8.5-30.5T753-392q24-23 44-50t35-58q-50-101-144.5-160.5T480-720Zm0 520q-134 0-245-72.5T60-463q-5-8-7.5-17.5T50-500q0-10 2-19t7-18q20-40 46.5-76.5T166-680l-83-84q-11-12-10.5-28.5T84-820q11-11 28-11t28 11l680 680q11 11 11.5 27.5T820-84q-11 11-28 11t-28-11L624-222q-35 11-71 16.5t-73 5.5ZM222-624q-29 26-53 57t-41 67q50 101 144.5 160.5T480-280q20 0 39-2.5t39-5.5l-36-38q-11 3-21 4.5t-21 1.5q-75 0-127.5-52.5T300-500q0-11 1.5-21t4.5-21l-84-82Zm319 93Zm-151 75Z" />
                            </svg>
                        </span>
                    </button>
                </div>
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
                    placeholder="Enter Custom Org URL"
                    class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500 !outline-none">

            </div>
            <div>
                <label for="name" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Name :</label>
                <input type="text" id="name" v-model="formData.name" required
                    class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500 !outline-none">
            </div>
            <div class="flex items-center justify-center">
                <button type="submit"
                    class="bg-blue-700 hover:bg-blue-800 text-white text-sm font-semibold py-2 px-4 rounded-md mr-2">
                    Submit
                </button>
                <button @click="cancelForm" type="button"
                    class="bg-gray-700 hover:bg-gray-800 text-white text-sm font-semibold py-2 px-4 rounded-md">
                    Cancel
                </button>
            </div>

        </div>
    </form>


</template>

<script>
export default {
    name: 'RecordFormComp',
}
</script>