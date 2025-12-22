<template>
  <div :style="backgroundStyle" class="home-wrapper">
    <div class="fixed-bg" :style="backgroundStyle"></div>
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
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'

// 取得當前小時
const currentHour = ref(new Date().getHours())  
const currentBgUrl = ref('')
let timer = null

const targetBgPath = computed(() => {
  const hour = currentHour.value
  // 7~17 使用 day; 19~5 使用 night; 5~7 & 17~19 使用 sun
  if (hour >= 7 && hour < 17) {
    return '/APP_IMG/day.png'
  } else if (hour >= 19 || hour < 5) {
    return '/APP_IMG/night.png'
  } else {
    return '/APP_IMG/sun.png'
  }
})

//背景切換
const backgroundStyle = computed(() => {
  return {
    backgroundImage:currentBgUrl.value ? `url(${currentBgUrl.value})` : 'none',
    backgroundSize: 'cover',
    backgroundPosition: 'center bottom',
    backgroundRepeat: 'no-repeat',
  }
})

const preloadBackground = (path) => {
  // 如果路徑沒變，就不重新下載
  if (path === currentBgUrl.value) return

  const img = new Image()
  img.src = path
  
  img.onload = () => {
    // 圖片下載好了 更新畫面
    currentBgUrl.value = path
  }
}

// 監聽時間或路徑變化 當需要換圖 執行預載
watch(targetBgPath, (newPath) => {
  preloadBackground(newPath)
}, { immediate: true })

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

.home-wrapper {
  width: 100%;
  min-height: 100vh;
  position: relative;
}
.fixed-bg {
  position: fixed; 
  left: 0;
  width: 100%;
  height: 100%;
  z-index: -1;
  background-position: center bottom;
  background-size: cover;
}
.home {
  text-align: center;
  padding-top: 20vh; 
  position: relative; 
  z-index: 1;
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