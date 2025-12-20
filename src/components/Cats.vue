<template>
  <div class="container">
    <br>
    <h1>貓咪大戰爭數據表</h1>

    <div class="toolbar">
      <div class="tool-group">
        <span class="label">模式</span>
        <div class="btn-group">
          <button @click="formMode='all'" :class="{active: formMode==='all'}">全部</button>
          <button @click="formMode='highest'" :class="{active: formMode==='highest'}">最高型態</button>
          <button @click="formMode='1'" :class="{active: formMode==='1'}">一階</button>
          <button @click="formMode='2'" :class="{active: formMode==='2'}">二階</button>
          <button @click="formMode='3'" :class="{active: formMode==='3'}">三階</button>
        </div>
      </div>

      <div class="tool-group search-group">
        <select v-model="searchType" class="search-select">
          <option value="hp">體力</option>
          <option value="atk">攻擊</option>
          <option value="range">射程</option>
          <option value="kb">KB</option>
        </select>
        <input type="number" v-model.number="minVal" min="0" placeholder="Min" class="num-input">
        <span class="divider">~</span>
        <input type="number" v-model.number="maxVal"  min="0" placeholder="Max" class="num-input">
        <button v-if="minVal!=='' || maxVal!==''" @click="clearSearch" class="clear-btn">✕</button>
      </div>
    </div>

    <div class="filter-row">
      <div class="dropdown-wrapper">
        <div class="dropdown-trigger" @click="toggleTrait">
          <span>{{ traitButtonText }}</span>
          <span class="arrow">▼</span>
        </div>
        <div v-if="isTraitOpen" class="dropdown-menu">
          <label v-for="opt in traitOptions" :key="opt" class="dropdown-item">
            <input type="checkbox" :value="opt" v-model="selectedTraits"> {{ opt }}
          </label>
        </div>
        <div v-if="isTraitOpen" class="overlay" @click="isTraitOpen = false"></div>
      </div>

      <div class="dropdown-wrapper">
        <div class="dropdown-trigger" @click="toggleAbility">
          <span>{{ abilityButtonText }}</span>
          <span class="arrow">▼</span>
        </div>
        <div v-if="isAbilityOpen" class="dropdown-menu">
          <label v-for="opt in abilityOptions" :key="opt" class="dropdown-item">
            <input type="checkbox" :value="opt" v-model="selectedAbilities"> {{ opt }}
          </label>
        </div>
        <div v-if="isAbilityOpen" class="overlay" @click="isAbilityOpen = false"></div>
      </div>

      <div class="dropdown-wrapper">
        <div class="dropdown-trigger" @click="toggleEffect">
          <span>{{ effectButtonText }}</span>
          <span class="arrow">▼</span>
        </div>
        <div v-if="isEffectOpen" class="dropdown-menu">
          <label v-for="opt in effectOptions" :key="opt" class="dropdown-item">
            <input type="checkbox" :value="opt" v-model="selectedEffects"> {{ opt }}
          </label>
        </div>
        <div v-if="isEffectOpen" class="overlay" @click="isEffectOpen = false"></div>
      </div>
    </div>
    
    <p class="hint">找到 {{ filteredCats.length }} 筆資料</p>

    <div class="table-page">
      <div v-if="isLoading">資料讀取中...</div>
      <table v-else>
        <thead>
          <tr>
            <th>編號</th>
            <th>圖片</th>
            <th>名稱</th>
            <th>生命</th>
            <th>攻擊</th>
            <th>射程</th>
            <th>擊退</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="cat in paginatedCats" :key="cat.id_form">
            <td>{{ cat.id_form }}</td>
            <td>
              <router-link :to="'/cat/' + cat.id" class="img-link">
                <img :src="getPicture(cat.id, cat.form)" class="img-placeholder">
              </router-link>
            </td>
            <td>{{ cat.name }}</td>
            <td>{{ cat.hp }}</td>
            <td>{{ cat.atk }}</td>
            <td>{{ cat.range }}</td>
            <td>{{ cat.kb }}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="pagination-container" v-if="totalPages > 1">
      <div class="pagination">
        <button @click="prevPage" :disabled="currentPage === 1">上一頁</button>
        
        <div class="page-numbers">
          <span 
            v-for="(page, index) in displayedPages" 
            :key="index"
            :class="['page-item', { active: page === currentPage, dots: page === '...' }]"
            @click="setPage(page)"
          >
            {{ page }}
          </span>
        </div>

        <button @click="nextPage" :disabled="currentPage === totalPages">下一頁</button>
      </div>

      <div class="page-jump">
        <span>跳至</span>
        <input 
            type="number" 
            v-model.number="jumpPage" 
            class="jump-input"
            @keyup.enter="goToJumpPage"
        >
        <button @click="goToJumpPage" class="go-btn">GO</button>
        </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useCatsData } from '../composables/useCatsData'
import { getPicture } from '../composables/getPicture'
import { traitOptions, abilityOptions, effectOptions } from '../config/options'

const { allCats, isLoading, fetchData } = useCatsData()

const formMode = ref('highest')
const searchType = ref('hp')
const minVal = ref('0')
const maxVal = ref('')

const selectedTraits = ref([])
const selectedAbilities = ref([]) 
const selectedEffects = ref([]) 
const isTraitOpen = ref(false)
const isAbilityOpen = ref(false)
const isEffectOpen = ref(false)

const currentPage = ref(1)
const pageSize = ref(10)
const jumpPage = ref(1)

const filteredCats = computed(() => {
    if (!allCats.value) return [];
    let data = allCats.value;

    if (formMode.value === 'highest') {
        const catMap = new Map();
        data.forEach(item => {
            if (item.id !== undefined) {
                if (!catMap.has(item.id) || item.form > catMap.get(item.id).form) {
                    catMap.set(item.id, item);
                }
            }
        });
        data = Array.from(catMap.values());
    } else if (formMode.value !== 'all') {
        const targetForm = parseInt(formMode.value);
        data = data.filter(item => item.form === targetForm);
    }

    const results = data.filter(cat => {
        const matchTrait = selectedTraits.value.length === 0 || selectedTraits.value.some(t => cat.traits.includes(t));
        const matchAbility = selectedAbilities.value.length === 0 || selectedAbilities.value.some(opt => cat.abilities.includes(opt));
        const matchEffect = selectedEffects.value.length === 0 || selectedEffects.value.some(opt => cat.effects.includes(opt));
        
        let isValueMatch = true;
        if (minVal.value !== '' || maxVal.value !== '') {
            let targetValue = Number(cat[searchType.value]);
            isValueMatch = (minVal.value === '' || targetValue >= minVal.value) && 
                           (maxVal.value === '' || targetValue <= maxVal.value);
        }
        return matchTrait && matchAbility && matchEffect && isValueMatch;
    });

    return results.slice().sort((a, b) => Number(a.id) - Number(b.id) || a.form - b.form);
});

const totalPages = computed(() => Math.ceil(filteredCats.value.length / pageSize.value));

const displayedPages = computed(() => {
    const total = totalPages.value;
    const current = currentPage.value;
    const delta = 2; 
    const range = [];
    const rangeWithDots = [];
    let l;

    for (let i = 1; i <= total; i++) {
        if (i === 1 || i === total || (i >= current - delta && i <= current + delta)) {
            range.push(i);
        }
    }
    for (let i of range) {
        if (l) {
            if (i - l === 2) rangeWithDots.push(l + 1);
            else if (i - l !== 1) rangeWithDots.push('...');
        }
        rangeWithDots.push(i);
        l = i;
    }
    return rangeWithDots;
});

const paginatedCats = computed(() => {
    const start = (currentPage.value - 1) * pageSize.value;
    return filteredCats.value.slice(start, start + pageSize.value);
});

const setPage = (page) => {
  if (page === '...') return;
  currentPage.value = page;
  window.scrollTo(0, 0);
};

const nextPage = () => {
  if (currentPage.value < totalPages.value) setPage(currentPage.value + 1); 
};
const prevPage = () => { if (currentPage.value > 1) setPage(currentPage.value - 1); };

const goToJumpPage = () => {
  let page = Math.floor(jumpPage.value);
  if (page < 1) page = 1;
  if (page > totalPages.value) page = totalPages.value;
  setPage(page);
};

const clearSearch = () => { minVal.value = '0'; maxVal.value = ''; };

watch([selectedTraits, selectedAbilities, selectedEffects, minVal, maxVal, formMode], () => {
    currentPage.value = 1; 
});
watch(currentPage, (newVal) => { jumpPage.value = newVal; });

const traitButtonText = computed(() => 
  selectedTraits.value.length === 0 ? '選擇屬性...' : `屬性 (${selectedTraits.value.length})`
);
const abilityButtonText = computed(() => 
  selectedAbilities.value.length === 0 ? '選擇能力...' : `能力 (${selectedAbilities.value.length})`
);
const effectButtonText = computed(() => 
  selectedEffects.value.length === 0 ? '選擇效果...' : `效果 (${selectedEffects.value.length})`
);

const toggleTrait = () => { 
  isTraitOpen.value = !isTraitOpen.value; isAbilityOpen.value = isEffectOpen.value = false; 
};
const toggleAbility = () => { 
  isAbilityOpen.value = !isAbilityOpen.value; isTraitOpen.value = isEffectOpen.value = false;
};
const toggleEffect = () => { 
  isEffectOpen.value = !isEffectOpen.value; isTraitOpen.value = isAbilityOpen.value = false; 
};

onMounted(fetchData);
</script>

<style scoped>
/* 核心容器樣式恢復 */
.container {
  background-color: #e9fffd;
  padding: 20px;
  font-family: "Microsoft JhengHei", sans-serif;
}

/* 表格原始樣式恢復 */
.table-page { overflow-x: auto; }

table {
  width: 100%;
  border-collapse: collapse;
  white-space: nowrap;
}

th, td {
  border: 1px solid #ccc;
  padding: 8px;
  text-align: left;
}

th { 
  background-color: #f0f0f0; 
}

.img-placeholder {
  display: inline-block; width: 100px; height: 80px;
  background: #eee; text-align: center; line-height: 30px;
  font-size: 12px;
}

/* 篩選與工具列樣式 */
.toolbar {
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
  align-items: center;
  background-color: #f8f9fa;
  padding: 10px 15px;
  border-radius: 8px;
  margin-bottom: 20px;
  border: 1px solid #dee2e6;
}

.tool-group { display: flex; align-items: center; gap: 8px; }
.label { font-weight: bold; color: #555; font-size: 0.9em; }
.filter-row { display: flex; gap: 15px; margin-bottom: 15px; align-items: center; }
p.hint { color: gray; font-size: 0.9em; margin-top: 5px; }

/* 下拉選單 */
.dropdown-wrapper { position: relative; width: 200px; }
.dropdown-trigger { border: 1px solid #ccc; padding: 8px 12px; background: white; border-radius: 4px; cursor: pointer; display: flex; justify-content: space-between; align-items: center; user-select: none; }
.dropdown-menu { position: absolute; top: 105%; left: 0; width: 100%; background: white; border: 1px solid #ccc; border-radius: 4px; box-shadow: 0 4px 8px rgba(0,0,0,0.15); max-height: 250px; overflow-y: auto; z-index: 100; }
.dropdown-item { display: flex; align-items: center; padding: 8px 10px; cursor: pointer; border-bottom: 1px solid #f0f0f0; }
.overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; z-index: 90; }

/* 按鈕與搜尋 */
.btn-group button { 
  padding: 5px 10px; 
  border: 1px solid #ced4da; 
  background: white; 
  cursor: pointer; 
  font-size: 0.9em; 
  border-radius:10px;
  margin: 2px;
}
.btn-group button:hover{
  background: #9e9e9e;
  color: #ffffff;
}
.btn-group button.active { 
  background: #0d51fd; 
  color: white; 
}
.btn-group button.active:hover { 
  background: #9e9e9e;
  color: #ffffff;
}
.search-group { background: white; padding: 4px 8px; border: 1px solid #ced4da; border-radius: 20px; }
.search-select { border: none; background: transparent; color: #0d6efd; font-weight: bold; outline: none; }
.num-input { width: 50px; border: none; background: #f1f3f5; text-align: center; border-radius: 4px; padding: 2px; }
.clear-btn {
  background: #dc3545;
  color: white;
  border: none;
  border-radius: 50%;
  width: 18px;
  height: 18px;
  cursor: pointer;
  font-size: 0.7em;
  margin-left: 5px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  line-height: 1;
}

/* 懸停效果微調 */
.clear-btn:hover {
  background: #bd2130;
}

/* 整合後的分頁樣式 */
.pagination-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 15px;
  margin-top: 20px;
}

.pagination {
  display: flex;
  align-items: center;
  gap: 10px;
}

.page-numbers {
  display: flex;
  gap: 5px;
}

.page-item {
  padding: 5px 10px;
  border: 1px solid #ced4da;
  background: white;
  cursor: pointer;
  border-radius: 4px;
  min-width: 35px;
  text-align: center;
}

.page-item.active {
  background-color: #949494;
  color: white;
  border-color: #494949;
}

.page-item.dots {
  border: none;
  cursor: default;
  background: transparent;
}

.page-jump {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 0.9em;
}

.jump-input {
  font-size: 1em;
  width: 60px;
  padding: 4px;
  border: 1px solid #ced4da;
  border-radius: 4px;
  text-align: center;
}

/* 遊戲風格紅色立體按鈕 */
.go-btn {
  width: 40px;
  height: 40px;
  border-radius: 50%; /* 圓形 */
  background: linear-gradient(145deg, #ff3b3b, #d60000); /* 漸層增加立體感 */
  color: white;
  border: none;
  cursor: pointer;
  font-weight: bold;
  font-size: 1em;
  
  /* 立體陰影：第一個是按鈕本身的厚度，第二個是投射在地面的陰影 */
  box-shadow: 
    0 4px 0 #990000, 
    0 6px 10px rgba(0, 0, 0, 0.3);
    
  transition: all 0.1s ease; /* 讓動作更流暢 */
  display: flex;
  align-items: center;
  justify-content: center;
  outline: none;
  user-select: none;
}

/* 懸停時稍微亮一點 */
.go-btn:hover {
  background: linear-gradient(145deg, #ff5252, #e60000);
}

/* ★ 按下時的動作 ★ */
.go-btn:active {
  /* 減少厚度陰影，並向下移動，營造「壓下去」的感覺 */
  box-shadow: 
    0 1px 0 #990000, 
    0 2px 5px rgba(0, 0, 0, 0.3);
  transform: translateY(3px); /* 物理位移 */
}

/* 針對輸入框旁邊的佈局微調 */
.page-jump {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 0.9em;
  font-weight: bold;
}

.jump-input {
  width: 50px;
  height: 30px;
  border: 2px solid #ced4da;
  border-radius: 8px;
  text-align: center;
}
</style>