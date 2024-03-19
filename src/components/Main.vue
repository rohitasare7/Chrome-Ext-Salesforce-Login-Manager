<template>
    <div>
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

            <button type="submit">Submit</button>
        </form>
        <button @click="fetchData">fetch</button>
        <ul>
            <li v-for="(entry, index) in dataEntries" :key="index">
                <span>{{ entry.username }}</span>
                <span>{{ entry.password }}</span>
                <span>{{ entry.orgType }}</span>
                <span v-if="entry.orgType === 'custom'">{{ entry.customOrgUrl }}</span>
                <span>{{ entry.name }}</span>
            </li>
        </ul>
    </div>
</template>

<script setup>
/*global chrome*/
import { ref, onMounted } from 'vue';
let records = [];
let storage = chrome.storage.sync;
// main storage list : recordList

const formData = ref({
    username: '',
    password: '',
    orgType: 'dev',
    customOrgUrl: '',
    name: '',
    timeStamp: '',
    id : 0
});

let dataEntries = ref([]);

onMounted(() => {
    //Fetch existing data from Chrome storage
    //fetchData();
});

const fetchData = () => {
    storage.get('recordList', (result) => {
        console.log('result --> '+JSON.stringify(result));
        // if (result.formData) {
        //     let resultArry = [];
        //     resultArry.push()
        //     dataEntries.value = result.formData;
        // }
        
    });
}


const findLargestNumber = (array) => {
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
        console.log('result --> '+JSON.stringify(result));
      if (result.recordList && result.recordList.length > 0) {
        const idList = result.recordList.map(item => item.id);
        console.log('idList --> '+idList);
        const recordIndex = findLargestNumber(idList);
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
  const indexId = await fetchLastIndex() + 1;
  console.log('indexId final --> ' + indexId);
  formData.value.id = indexId;
  formData.value.timeStamp = Date.now();
  records.push(formData.value);
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

<script>
export default {
    name: 'TestA',
    props: {
        msg: String
    }
}
</script>