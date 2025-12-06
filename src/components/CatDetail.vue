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
        No.{{ routeId }} {{ getLastFormName() }}
      </h1>

      <div v-for="cat in catForms" :key="cat.id" class="form-card">
        
        <div class="card-header">
          <span class="form-tag">第 {{ cat.form }} 型態</span>
          <h2>{{ cat.name_cn || cat.name_jp }}</h2>
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
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';

const route = useRoute();
const routeId = route.params.id; // 取得網址上的 ID

const catForms = ref([]);
const isLoading = ref(true);

// --- 對照表：把 JSON 的英文欄位翻成中文 ---
const MAP_TRAITS = {
    'trait_red': '紅色敵人',
    'trait_floating': '漂浮敵人',
    'trait_black': '黑色敵人',
    'trait_metal': '鋼鐵敵人',
    'trait_traitless': '無屬性',
    'trait_angel': '天使敵人',
    'trait_alien': '異星戰士',
    'trait_zombie': '不死生物',
    'trait_ancient': '古代種',
    'trait_devil': '惡魔'
};

const MAP_ABILITIES = {
    'ability_strong': '善於攻擊',
    'ability_resistant': '很耐打',
    'ability_massive_dmg': '超大傷害',
    'ability_insane_dmg': '極度傷害',
    'ability_target_only': '只能攻擊',
    'ability_strengthen': '攻擊力上升',
    'ability_survive': '死前存活',
    'ability_base_destroyer': '善於攻城',
    'ability_crit': '會心一擊',
    'ability_metal': '鋼鐵體質',
    'ability_z_killer': '終結不死',
    'ability_shield_pierce': '破壞護盾',
    'ability_devil_shield_pierce': '破壞惡魔盾',
    'ability_savage_blow': '渾身一擊',
    'ability_extra_money': '金錢增加',
    'effect_kb': '擊退',
    'effect_freeze': '暫停',
    'effect_slow': '變慢',
    'effect_weaken': '降攻',
    'effect_curse': '詛咒',
    'effect_wave': '波動',
    'effect_surge': '烈波',
    'effect_warp': '傳送無效'
};

// --- 工具函式 ---

// 1. Frame 轉秒數 (貓戰是 30 frame = 1秒)
const frameToSec = (frames) => {
    if(!frames) return 0;
    return (frames / 30).toFixed(2);
}

// 2. 計算 DPS
const calculateDPS = (cat) => {
    if (!cat.attack_freq_frames || cat.attack_freq_frames === 0) return 0;
    const seconds = cat.attack_freq_frames / 30;
    return Math.round(cat.attack / seconds);
};

// 3. 取得最後型態的名字 (當標題用)
const getLastFormName = () => {
    if (catForms.value.length === 0) return '';
    const last = catForms.value[catForms.value.length - 1];
    return last.name_cn || last.name_jp;
};

// 4. 解析屬性 (Traits)
const getTraits = (cat) => {
    const list = [];
    for (const [key, label] of Object.entries(MAP_TRAITS)) {
        if (cat[key] && cat[key] !== 0) list.push(label);
    }
    return list;
};

// 5. 解析能力 (Abilities)
const getAbilities = (cat) => {
    const list = [];
    for (const [key, label] of Object.entries(MAP_ABILITIES)) {
        if (cat[key] && cat[key] !== 0) list.push(label);
    }
    return list;
};

// --- 抓取資料 ---
const fetchDetail = async () => {
    isLoading.value = true;
    try {
        const res = await fetch('/battle_cats_characters.json');
        if(!res.ok) throw new Error("讀取失敗");
        
        const data = await res.json();

        // ★ 核心邏輯：找出 id_main 等於網址參數的所有資料
        // 使用 == 來允許字串與數字比對 (例如 "1" == 1)
        const matched = data.filter(c => c.id == routeId);

        // 依照 form (1, 2, 3) 排序
        catForms.value = matched.sort((a, b) => a.form - b.form);

    } catch (err) {
        console.error(err);
    } finally {
        isLoading.value = false;
    }
};

onMounted(() => {
    fetchDetail();
});
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