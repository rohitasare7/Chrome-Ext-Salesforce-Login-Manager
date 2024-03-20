<script setup>
import CreateRecord from '@/components/partial/CreateRecord';
import DisplayRecords from '@/components/partial/DisplayRecords';
</script>

<template>

    <DisplayRecords />
    <!-- Create Login Record -->
    <CreateRecord />

</template>

<script>
export default {
    name: 'MainSFLoginComp',
}
</script>