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
  /* 頂部容器：改為左對齊並縮小間距 */
  .header {
    width: 100%;
    display: flex;
    justify-content: flex-start; /* 改為左對齊 */
    padding: 10px 15px;          /* 縮小上下內距 */
    background-color: transparent; 
    position: absolute; /* 關鍵：讓導覽列浮在頁面內容上方 */
    z-index: 1000;
  }

  /* 縮小後的導覽框框 */
  .nav-container {
    display: flex;
    gap: 2px;             /* 縮小按鈕間距 */
    padding: 4px;         /* 縮小框內襯距 */
    background-color: #ffffff;
    border: 1.5px solid #555; /* 稍微細一點的邊框 */
    border-radius: 8px;      /* 稍微小一點的圓角 */
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  }

  /* 縮小後的按鈕樣式 */
  .nav-item {
    padding: 5px 12px;    /* 縮小按鈕大小 */
    font-size: 0.9em;     /* 字體稍微縮小 */
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
  html, body {
    margin: 0;
    padding: 0;
    width: 100%;
    height: 100%;
    overflow-x: hidden; 
    overscroll-behavior: none;
  }
  #app {
    width: 100%;
    height: 100%;
}
</style>