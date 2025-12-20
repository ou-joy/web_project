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

      <div class="tool-group logic-group">
        <span class="logiclable">篩選邏輯</span>
        <div class="btn-group logic-toggle">
          <button @click="searchLogic='OR'" :class="{active: searchLogic==='OR'}">OR</button>
          <button @click="searchLogic='AND'" :class="{active: searchLogic==='AND'}">AND</button>
        </div>
      </div>
    <div class="btn-group reset-all-btn">
      <button @click="resetAll">一鍵清除</button>
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
        <svg v-if="currentPage > 1" @click="prevPage" class="nav-svg" viewBox="0 0 26 26">
          <path d="M20 4 L6 13 L20 22 Z" fill="#ffc800" stroke="black" stroke-width="2" stroke-linejoin="round"/>
        </svg>
        <div v-else class="nav-svg-spacer"></div>
        
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

        <svg v-if="currentPage < totalPages" @click="nextPage" class="nav-svg" viewBox="0 0 26 26">
          <path d="M6 4 L20 13 L6 22 Z" fill="#ffc800" stroke="black" stroke-width="2" stroke-linejoin="round"/>
        </svg>
        <div v-else class="nav-svg-spacer"></div>
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

// 新增：查詢邏輯狀態
const searchLogic = ref('OR')

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
        // 修改：根據 searchLogic 判斷標籤篩選邏輯
        let matchTrait, matchAbility, matchEffect;

        if (searchLogic.value === 'OR') {
          matchTrait = selectedTraits.value.length === 0 || selectedTraits.value.some(t => cat.traits.includes(t));
          matchAbility = selectedAbilities.value.length === 0 || selectedAbilities.value.some(opt => cat.abilities.includes(opt));
          matchEffect = selectedEffects.value.length === 0 || selectedEffects.value.some(opt => cat.effects.includes(opt));
        } else {
          // AND 邏輯：必須包含所有選中的標籤
          matchTrait = selectedTraits.value.length === 0 || selectedTraits.value.every(t => cat.traits.includes(t));
          matchAbility = selectedAbilities.value.length === 0 || selectedAbilities.value.every(opt => cat.abilities.includes(opt));
          matchEffect = selectedEffects.value.length === 0 || selectedEffects.value.every(opt => cat.effects.includes(opt));
        }
        
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
const resetAll = () => {
  formMode.value = 'highest'; 
  searchType.value = 'hp';
  minVal.value = '0';
  maxVal.value = '';
  selectedTraits.value = [];
  selectedAbilities.value = [];
  selectedEffects.value = [];
  searchLogic.value = 'OR'; 
  currentPage.value = 1;
  jumpPage.value = 1;
  isTraitOpen.value = false;
  isAbilityOpen.value = false;
  isEffectOpen.value = false;
};

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

// 修改：監聽 searchLogic
watch([selectedTraits, selectedAbilities, selectedEffects, minVal, maxVal, formMode, searchLogic], () => {
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
/* 僅修改背景部分，其餘完全保留原本樣子 */
.container {
  background-image: url('/APP_IMG/catsback.png'); /* 替換原本的 #e9fffd */
  background-repeat: repeat; 
  background-size: 25%;
  background-attachment: fixed;
  min-height: 100vh;
  padding: 20px;
  font-family: "Microsoft JhengHei", sans-serif;
}

.table-page { 
  border-radius: 8px;
  overflow-x: auto; 
}

table {
  width: 100%;
  border-collapse: collapse;
  white-space: nowrap;
  background-color: rgba(255, 255, 255, 0.525); /* 確保表格背景是白的，不然格子會透出來 */
}

th, td {
  border: 1.5px solid #aaaaaa;
  padding: 8px;
  text-align: left;
}

th { 
  background-color: #d99426; 
}

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

.img-placeholder {
  display: inline-block; width: 100px; height: 80px;
  background: #eee; text-align: center; line-height: 30px;
  font-size: 12px;
}

.toolbar {
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
  align-items: center;
  background-color: #f8f9fae4;
  padding: 10px 15px;
  border-radius: 8px;
  margin-bottom: 20px;
  border: 1px solid #dee2e6;
}

.tool-group { display: flex; align-items: center; gap: 8px; }
.label { font-weight: bold; color: #555; font-size: 0.9em; }
.filter-row { display: flex; gap: 15px; margin-bottom: 15px; align-items: center; justify-content: center; }
p.hint { color: #333; font-size: 0.9em; margin-top: 5px; font-weight: bold; }

.dropdown-wrapper { position: relative; width: 200px; }
.dropdown-trigger { border: 1px solid #ccc; padding: 8px 12px; background: white; border-radius: 4px; cursor: pointer; display: flex; justify-content: space-between; align-items: center; user-select: none; }
.dropdown-menu { position: absolute; top: 105%; left: 0; width: 100%; background: white; border: 1px solid #ccc; border-radius: 4px; box-shadow: 0 4px 8px rgba(0,0,0,0.15); max-height: 250px; overflow-y: auto; z-index: 100; }
.dropdown-item { display: flex; align-items: center; padding: 8px 10px; cursor: pointer; border-bottom: 1px solid #f0f0f0; }
.overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; z-index: 90; }

.btn-group button { 
  padding: 5px 10px; 
  border: 1px solid #ced4da; 
  background: white; 
  cursor: pointer; 
  font-size: 0.9em; 
  border-radius:10px;
  margin: 2px;
}
.btn-group button:hover { 
  padding: 5px 10px; 
  border: 1px solid #ced4da; 
  color: white;
  background: #9e9e9e; 
  cursor: pointer; 
  font-size: 0.9em; 
  border-radius:10px;
  margin: 2px;
}
.btn-group button.active { 
  background: #0d51fd; 
  color: white; 
}
.btn-group button.active:hover { 
  background: #9e9e9e; 
  color: white; 
}
.search-group { background: white; padding: 4px 8px; border: 1px solid #ced4da; border-radius: 20px; }
.search-select { border: none; background: transparent; color: #0d6efd; font-weight: bold; outline: none; }
.num-input { width: 50px; border: none; background: #f1f3f5; text-align: center; border-radius: 4px; padding: 2px; }

.pagination-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 15px;
  margin-top: 20px;
}
.pagination { display: flex; align-items: center; gap: 20px; }
.page-numbers { display: flex; gap: 5px; }
.page-item { padding: 5px 10px; border: 1px solid #ced4da; background: white; cursor: pointer; border-radius: 4px; min-width: 35px; text-align: center; }
.page-item:hover { padding: 5px 10px; border: 1px solid #ced4da; color:white; background: #949494; cursor: pointer; border-radius: 4px; min-width: 35px; text-align: center; }
.page-item.active:hover { padding: 5px 10px; border: 1px solid #ced4da; color:white; background: #949494; cursor: pointer; border-radius: 4px; min-width: 35px; text-align: center; }
.page-item.active { background-color: #cacaca; color: white; }

/* 三角形樣式修改：36px 並半透明 */
.nav-svg {
  width: 42px;
  height: 42px;
  cursor: pointer;
  opacity: 0.5;
  transition: transform 0.1s, opacity 0.1s;
}

.nav-svg:hover {
  opacity: 0.7;
}

.nav-svg-spacer {
  width: 36px;
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
  font-size: 1em;
  font-weight: bold;
}

.jump-input {
  width: 45px;
  height: 27px;
  border: 2px solid #ced4da;
  border-radius: 8px;
  text-align: center;
}
.logiclable {
  width: 100px;
  font-weight: bold; 
  color: #2f2f2f; 
  font-size: 1em; 
  margin-right: -10px;
  margin-left: 5px;
}
/* 新增：篩選邏輯樣式微調 */
.logic-group {
  width:220px;
  border: 1.5px solid #9b9b9b;
  background-color: #f0f0f0;
  border-radius: 8px;
  margin-right: 5px;
  padding-left: 6px;
  display: inline-flex;
}
.logic-toggle {
  display: inline-flex;
}
.logic-toggle button {
  width: 70px;
  padding: 6px 15px;
}
.logic-toggle button:hover {
  padding: 6px 15px;
}
</style>