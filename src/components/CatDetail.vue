<template>
  <div class="detail-page">
    <div class="nav-header">
      <button @click="$router.push('/')" class="back-btn">
        &larr; 返回圖鑑列表
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
          <span class="form-tag">第 {{ cat.form }} 型態</span>
          <h2>{{ cat.name_cn }}({{cat.name_jp}})</h2>
        </div>

        <div class="card-body">
          <div class="img-box">
             <div class="placeholder">
               <span>圖片 ID</span>
               <strong>{{ cat.id_full }}</strong>
             </div>
             </div>

          <div class="stats-box">
            <div class="stat-grid">
              <div class="stat-item">
                <label>體力 (HP)</label>
                <span>{{ cat.hp }}</span>
              </div>
              <div class="stat-item">
                <label>攻擊力 (ATK)</label>
                <span>{{ cat.attack }}</span>
              </div>
              <div class="stat-item dps">
                <label>DPS (秒傷)</label>
                <span>{{ calculateDPS(cat) }}</span>
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
                <span>{{ frameToSec(cat.recharge_frames) }} 秒</span>
              </div>
              <div class="stat-item">
                <label>生產成本</label>
                <span>{{ cat.cost }}</span>
              </div>
              <div class="stat-item">
                <label>範圍攻擊</label>
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
</template>

<script setup>
  import { useCatDetail } from '../composables/useCatDetail';
  import {  TRAIT_MAP, KEY_MAPPING } from '../config/mappings';

  const {
    catForms, isLoading, routeId,
    frameToSec, calculateDPS,
    getAllName, getTraits, getAbilities
  } = useCatDetail({ traitsMap: TRAIT_MAP, abilitiesMap: KEY_MAPPING });
</script>


<style scoped>
.detail-page {
  max-width: 900px;
  margin: 0 auto;
  padding: 20px;
  font-family: "Microsoft JhengHei", sans-serif;
  color: #333;
}

.back-btn {
  background: #555;
  color: #fff;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  margin-bottom: 20px;
}
.back-btn:hover { background: #333; }

.status-msg { text-align: center; margin-top: 50px; font-size: 1.2rem; }
.error { color: red; }

.main-title {
  text-align: center;
  margin-bottom: 30px;
  font-size: 2rem;
}

/* 卡片樣式 */
.form-card {
  border: 1px solid #ddd;
  border-radius: 8px;
  overflow: hidden;
  margin-bottom: 30px;
  background: #fff;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
}

.card-header {
  background: #f8f9fa;
  padding: 12px 20px;
  border-bottom: 1px solid #eee;
  display: flex;
  align-items: center;
  gap: 15px;
}

.form-tag {
  background: #e65100;
  color: white;
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: bold;
}

.card-header h2 { margin: 0; font-size: 1.4rem; }

.card-body {
  display: flex;
  flex-wrap: wrap;
}

/* 圖片區 */
.img-box {
  flex: 1;
  min-width: 250px;
  background: #fafafa;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px;
  border-right: 1px solid #eee;
}

.placeholder {
  width: 120px; height: 120px;
  background: #eee;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  color: #888;
}

/* 數值區 */
.stats-box {
  flex: 2;
  min-width: 300px;
  padding: 20px;
}

.stat-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
  gap: 15px;
  margin-bottom: 20px;
}

.stat-item { display: flex; flex-direction: column; }
.stat-item label { font-size: 0.8rem; color: #888; margin-bottom: 4px; }
.stat-item span { font-size: 1.1rem; font-weight: bold; }
.stat-item.dps span { color: #d32f2f; } /* DPS 紅色高亮 */

hr { border: 0; border-top: 1px solid #eee; margin: 15px 0; }

/* 標籤區 */
.tag-row { margin-bottom: 10px; line-height: 1.8; }
.tag-label { font-weight: bold; margin-right: 5px; }
.empty { color: #aaa; }

.badge {
  display: inline-block;
  padding: 2px 8px;
  margin-right: 5px;
  border-radius: 4px;
  font-size: 0.9rem;
}
.badge.trait { background: #e3f2fd; color: #1976d2; }
.badge.ability { background: #ffebee; color: #c62828; }
</style>