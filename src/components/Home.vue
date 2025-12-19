<template>
  <div :style="backgroundStyle" class="home-wrapper">
    <div class="home">
      <h1 class="main-title">貓咪大戰爭圖鑑</h1>
      
      <router-link to="/cats" class="wood-btn-link">
        <div class="wood-button">
          <span>前往貓咪圖鑑</span>
        </div>
      </router-link>

      <a href="" target="_blank" class="about-link">
        <p>about us</p>
      </a>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'

// --- 背景切換邏輯 ---

// 取得當前小時
const currentHour = ref(new Date().getHours())
let timer = null

const backgroundStyle = computed(() => {
  const hour = currentHour.value
  let bgPath = ''

  // 7~17 使用 day / 19~5 使用 night / 5~7 & 17~19 使用 sun
  if (hour >= 7 && hour < 17) {
    bgPath = '/APP_IMG/day.png'
  } else if (hour >= 19 || hour < 5) {
    bgPath = '/APP_IMG/night.png'
  } else {
    bgPath = '/APP_IMG/sun.png'
  }

  return {
    backgroundImage: `url(${bgPath})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center bottom',
    backgroundRepeat: 'no-repeat',
    backgroundAttachment: 'fixed',
    minHeight: '100vh',
    transition: 'background-image 1.2s ease-in-out'
  }
})

// 每秒更新一次時間，確保切換即時
onMounted(() => {
  timer = setInterval(() => {
    currentHour.value = new Date().getHours()
  }, 1000)
})

onUnmounted(() => {
  if (timer) clearInterval(timer)
})
</script>

<style scoped>
/* 確保背景鋪滿全螢幕 */
.home-wrapper {
  width: 100%;
  min-height: 100vh;
}

.home {
  text-align: center;
  padding-top: 20vh; /* 稍微增加頂部距離讓標題置中感更好 */
}

.main-title {
  font-size: 3rem;
  color: #fff;
  text-shadow: 
    3px 3px 0 #000, 
    -1px -1px 0 #000, 
    1px -1px 0 #000, 
    -1px 1px 0 #000;
  margin-bottom: 50px;
}

.wood-btn-link {
  text-decoration: none;
  display: inline-block;
}

/* ★ 木板按鈕主體 ★ */
.wood-button {
  width: 320px;
  height: 120px;
  display: flex;
  align-items: center;
  justify-content: center;
  
  background-image: url('/APP_IMG/wood.png');
  background-size: 100% 100%;
  background-repeat: no-repeat;
  
  cursor: pointer;
  transition: transform 0.2s ease, filter 0.2s ease;
}

.wood-button span {
  font-size: 1.8rem;
  font-weight: bold;
  color: #ffffff;
  text-shadow: 
    2px 2px 0px #000,
    -1px -1px 0px #000,
    1px -1px 0px #000,
    -1px 1px 0px #000;
  letter-spacing: 2px;
}

.wood-button:hover {
  transform: scale(1.1);
  filter: brightness(1.1);
}

.wood-button:active {
  transform: scale(0.95);
}

.about-link {
  text-decoration: none;
}

.about-link p {
  margin-top: 40px;
  color: #fff;
  font-weight: bold;
  text-shadow: 1px 1px 2px #000;
  opacity: 0.8;
  transition: opacity 0.2s;
}

.about-link p:hover {
  opacity: 1;
  text-decoration: underline;
}
</style>