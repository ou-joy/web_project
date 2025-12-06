<template>
  <div class="home">
    <h1>貓咪大戰爭圖鑑</h1>
    <router-link to="/cats">
      <button>前往貓咪圖鑑</button>
    </router-link>
    <a href="" target="_blank"><p>about us</p></a>
  </div>
</template>

<script setup>

</script>

<style scoped>
  .home{
    text-align: center;
  }
  button{
    width: 33%;
    padding:10px;
    background-color: yellow;
  }
  p{
    text-decoration: none;
  }
</style>
