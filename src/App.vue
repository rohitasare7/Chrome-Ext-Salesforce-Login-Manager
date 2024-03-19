<template>
  <!-- <img alt="Vue logo" src="./assets/logo.png"> -->
  <div class="p-5 bg-white dark:bg-gray-900 antialiased" style="max-width: 600px; min-width: 400px;">
    <Main />
  </div>
  
</template>

<script>
//import HelloWorld from './components/HelloWorld.vue'
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
#app {
  margin-top: 60px;
  font-family: "Figtree", sans-serif;
}

body {
    font-family: "Figtree", sans-serif;
}
</style>
