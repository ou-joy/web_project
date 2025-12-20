<script setup>
import { ref } from 'vue'
const count = ref(0)
</script>

<template>
  <div class="header">
    <nav class="nav-container">
      <router-link to="/" class="nav-item">首頁</router-link>
      <router-link to="/cats" class="nav-item">貓咪圖鑑</router-link>
    </nav>
  </div>
  
  <router-view v-slot="{ Component }">
    <keep-alive include="Cats">
      <component :is="Component" :key="$route.fullPath" />
    </keep-alive>
  </router-view>
</template>

<style>
  html, body {
    margin: 0;
    padding: 0;
    width: 100%;
    height: 100%;
    overscroll-behavior: none; 
  }
  .header {
    width: 100%;
    display: flex;
    justify-content: flex-start; 
    padding: 10px 15px;          
    background-color: transparent; 
    position: absolute; 
    z-index: 1000;
  }

  .nav-container {
    display: flex;
    gap: 2px;             
    padding: 4px;       
    background-color: #ffffff;
    border: 1.5px solid #555; 
    border-radius: 8px;     
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  }

  .nav-item {
    padding: 5px 12px;   
    font-size: 0.9em;    
    text-decoration: none;
    color: #444;
    font-weight: bold;
    border-radius: 5px;
    transition: all 0.2s ease;
  }

  .nav-item:hover {
    background-color: #9e9e9e;
    color: #ffffff;
  }

  .router-link-active {
    background-color: #0d51fd;
    color: white !important;
  }

  a {
    text-decoration: none;
  }
  #app {
  width: 100%;
  height: 100%;
}
</style>