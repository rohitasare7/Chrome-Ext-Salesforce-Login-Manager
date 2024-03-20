<script setup>
import CreateRecord from '@/components/partial/CreateRecord';
import DisplayRecords from '@/components/partial/DisplayRecords';
</script>

<template>

    <p>Existing Records</p>
    <DisplayRecords />
    <!-- Create Login Record -->
    <p class="mt-4">Create new record</p>
    <CreateRecord />

</template>

<script>
export default {
    name: 'MainSFLoginComp',
}
</script>