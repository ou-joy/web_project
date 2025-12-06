<script setup>
import { ref } from 'vue'

const count = ref(0)
</script>

<template>
  <div class="header">
    <nav>
      <a href="/">首頁</a>
      <a href="/cats">貓咪圖鑑</a>
    </nav>
  </div>
  <RouterView />
</template>


<style>
  .header{
    width: 100%;
    display: flex;
  }
  .header nav a{
    margin-left: 15px;
    text-decoration: none;
  }
  a{
    text-decoration: none ;
  }
  @media(min-width:600px){

  }
</style>
