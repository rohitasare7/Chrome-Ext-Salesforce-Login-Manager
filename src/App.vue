<template>
  <div class="p-5 bg-gray-100 dark:bg-gray-900 antialiased" style="max-width: 700px; min-width: 600px;">
    <Main />
  </div>
</template>

<script>
import Main from './components/Main.vue'
import './assets/index.css';

export default {
  name: 'App',
  components: {
    Main
  }
}
</script>

<style>
body {
  font-family: "Figtree", sans-serif;
}
</style>
