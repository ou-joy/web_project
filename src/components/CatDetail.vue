<template>
  <div class="detail-page-wrapper">
    <div class="detail-page">
      <div class="nav-header">
        <br><br><br>
        <button @click="$router.go(-1)" class="back-btn">
          &larr; 返回上一頁
        </button>
      </div>

      <div v-if="isLoading" class="status-msg">資料讀取中...</div>
      <div v-else-if="catForms.length === 0" class="status-msg error">
        找不到 ID: {{ routeId }} 的資料
      </div>

      <div v-else class="content">
        <h1 class="main-title">
           {{ getAllName() }}
        </h1>

        <div v-for="cat in catForms" :key="cat.id" class="form-card">
          <div class="card-header">
            <span class="form-tag" :style="{ background: getFormColor(cat.form) }">
              第 {{ cat.form }} 型態
            </span>
            <h2>{{ cat.name_cn }}({{cat.name_jp}})</h2>
          </div>

          <div class="card-body">
            <div class="img-box">
               <div class="placeholder">
                 <img :src="getPicture(cat.id,cat.form)">
                 <strong>{{ cat.id_full }}</strong>
               </div>
               </div>

            <div class="stats-box">
              <div class="stat-grid">
                <div class="stat-item">
                  <label>體力 (HP)</label>
                  <span>{{ cat.hp*2.5 }}</span>
                </div>
                <div class="stat-item">
                  <label>攻擊力 (ATK)</label>
                  <span>{{ cat.attack*2.5 }}</span>
                </div>
                <div class="stat-item dps">
                  <label>DPS (秒傷)</label>
                  <span>{{ calculateDPS(cat)*2.5 }}</span>
                </div>
                <div class="stat-item">
                  <label>射程</label>
                  <span>{{ cat.range }}</span>
                </div>
                <div class="stat-item">
                  <label>KB (擊退)</label>
                  <span>{{ cat.kb }}</span>
                </div>
                <div class="stat-item">
                  <label>跑速</label>
                  <span>{{ cat.speed }}</span>
                </div>
                <div class="stat-item">
                  <label>攻頻</label>
                  <span>{{ frameToSec(cat.attack_freq_frames) }} 秒</span>
                </div>
                <div class="stat-item">
                  <label>生產冷卻</label>
                  <span>{{ frameToSecCd(cat.recharge_frames) }} 秒</span>
                </div>
                <div class="stat-item">
                  <label>生產成本</label>
                  <span>{{ cat.cost*1.5 }}</span>
                </div>
                <div class="stat-item">
                  <label>攻擊方式</label>
                  <span>{{ cat.area_attack === 1 ? '範圍' : '單體' }}</span>
                </div>
              </div>

              <hr>

              <div class="tags-section">
                <div class="tag-row">
                  <span class="tag-label">針對屬性：</span>
                  <span v-if="getTraits(cat).length === 0" class="empty">無</span>
                  <span v-for="t in getTraits(cat)" :key="t" class="badge trait">{{ t }}</span>
                </div>

                <div class="tag-row">
                  <span class="tag-label">特殊能力：</span>
                  <span v-if="getAbilities(cat).length === 0" class="empty">無</span>
                  <span v-for="a in getAbilities(cat)" :key="a" class="badge ability">{{ a }}</span>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
  import { useCatDetail } from '../composables/useCatDetail';
  import { getPicture } from '../composables/getPicture'
  import {  TRAIT_MAP, KEY_MAPPING } from '../config/mappings';

  const getFormColor = (form) => {
    switch (form) {
      case 1: return '#CD7F32'; 
      case 2: return '#999B9B'; 
      case 3: return '#FFDB58'; 
      default: return '#e65100'; 
    }
  }

  const {
    catForms, isLoading, routeId,
    frameToSec, frameToSecCd, calculateDPS,
    getAllName, getTraits, getAbilities
  } = useCatDetail({ traitsMap: TRAIT_MAP, abilitiesMap: KEY_MAPPING });
</script>

<style scoped>
/* 背景容器：套用 catdetailsback.png */
.detail-page-wrapper {
  background-image: url('/APP_IMG/catdetailsback.png');
  background-size: cover;
  background-position: center;
  background-attachment: fixed;
  min-height: 100vh;
  width: 100%;
}

.detail-page {
  max-width: 900px;
  margin: 0 auto;
  padding: 20px;
  font-family: "Microsoft JhengHei", sans-serif;
}

@keyframes flash-colors {
  0%, 49% {
    border-color: #ff13e0;
    box-shadow: inset 0 0 0 0.3px #000000;
  }
  50%, 100% {
    border-color: #ffd013;
    box-shadow: inset 0 0 0 0.3px #000000;
  }
}

.back-btn {
  background: #ffc800;
  color: #fff;
  border: 2px solid #000000;
  padding: 8px 16px;
  border-radius: 6px;
  cursor: pointer;
  font-weight: bold;
  margin-bottom: 20px;
  transition: transform 0.1s;
}

.back-btn:hover {
  animation: flash-colors 0.2s infinite steps(1);
  transform: scale(1.05);
}

.back-btn:active {
  transform: scale(0.95);
}

.status-msg { text-align: center; color: white; margin-top: 50px; font-size: 1.2rem; text-shadow: 1px 1px 2px #000; }
.error { color: #ff5252; }

.main-title {
  text-align: center;
  margin-bottom: 30px;
  font-size: 2.5rem;
  color: white;
  text-shadow: 2px 2px 4px rgba(0,0,0,0.8);
}

/* 卡片樣式：調整為半透明毛玻璃感，配合背景 */
.form-card {
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 12px;
  overflow: hidden;
  margin-bottom: 30px;
  background: rgba(255, 255, 255, 0.66);
  backdrop-filter: blur(5px);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
}

.card-header {
  background: rgba(248, 249, 250, 0.8);
  padding: 12px 20px;
  border-bottom: 1px solid #eee;
  display: flex;
  align-items: center;
  gap: 15px;
}

.form-tag {
  color: white;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: bold;
  text-shadow: 1px 1px 1px rgba(0, 0, 0, 0.5);
}

.card-header h2 { margin: 0; font-size: 1.4rem; color: #333; }

.card-body {
  display: flex;
  flex-wrap: wrap;
}

.img-box {
  flex: 1;
  min-width: 250px;
  background: rgba(250, 250, 250, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px;
  border-right: 1px solid #eee;
}

.placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
}

.placeholder img {
  max-width: 150px;
  height: auto;
}

.stats-box {
  flex: 2;
  min-width: 300px;
  padding: 20px;
  color: #333;
}

.stat-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(110px, 1fr));
  gap: 15px;
  margin-bottom: 20px;
}

.stat-item { display: flex; flex-direction: column; }
.stat-item label { font-size: 0.8rem; color: #666; margin-bottom: 4px; }
.stat-item span { font-size: 1.1rem; font-weight: bold; }
.stat-item.dps span { color: #d32f2f; }

hr { border: 0; border-top: 1px solid #ddd; margin: 15px 0; }

.badge {
  display: inline-block;
  padding: 3px 10px;
  margin-right: 8px;
  border-radius: 6px;
  font-size: 0.9rem;
  font-weight: bold;
}
.badge.trait { background: #e3f2fd; color: #1976d2; border: 1px solid #bbdefb; }
.badge.ability { background: #ffebee; color: #c62828; border: 1px solid #ffcdd2; }
</style>