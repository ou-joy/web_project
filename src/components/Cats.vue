<template>
  <div class="container">
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
            <input type="number" v-model.number="minVal" placeholder="Min" class="num-input">
            <span class="divider">~</span>
            <input type="number" v-model.number="maxVal" placeholder="Max" class="num-input">
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
                    <input type="checkbox" :value="opt" v-model="selectedTraits">
                    {{ opt }}
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
                    <input type="checkbox" :value="opt" v-model="selectedAbilities">
                    {{ opt }}
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
                    <input type="checkbox" :value="opt" v-model="selectedEffects">
                    {{ opt }}
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
                      <img :src="getPicture(cat.id,cat.form)" class="img-placeholder">
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
        <div class="pagination" v-if="totalPages > 1">
            <button @click="prevPage" :disabled="currentPage === 1">上一頁</button>
            <span>第 {{ currentPage }} / {{ totalPages }} 頁</span>
            <button @click="nextPage" :disabled="currentPage === totalPages">下一頁</button>
        </div>
    </div>
</template>

<script setup>
    import { ref, computed, onMounted, watch } from 'vue'
    import { useCatsData } from '../composables/useCatsData'
    import { getPicture } from '../composables/getPicture'
    import { traitOptions, abilityOptions, effectOptions } from '../config/options'

    const { allCats, isLoading, fetchData } = useCatsData()

    const formMode = ref('highest');// 控制顯示模式
    const searchType = ref('hp'); // 預設搜尋體力
    const minVal = ref('0');
    const maxVal = ref('');

    const selectedTraits = ref([]);
    const selectedAbilities = ref([]); 
    const selectedEffects = ref([]); 
    
    const isTraitOpen = ref(false);
    const isAbilityOpen = ref(false);
    const isEffectOpen = ref(false);
    
    // 分頁相關變數
    const isFiltering = ref(false);
    const currentPage = ref(1);
    const pageSize = ref(10); // 設定為 20

    // 篩選邏輯
    const filteredCats = computed(() => {
        if (!allCats.value) return [];
        let data = allCats.value;
        // 根據 formMode 過濾型態
        if (formMode.value === 'all') {
            // 模式：全部顯示 (不做任何過濾)
        } 
        else if (formMode.value === 'highest') {
            const catMap = new Map();
            data.forEach(item => {
                const unitId = item.id; // 取得家族 ID (例如 0)
                
                // 防呆：確保 unitId 存在
                if (unitId !== undefined) {
                    // 邏輯：如果 Map 還沒存這隻貓，或者目前這隻的 form (階級) 比較大
                    // 就把它存進去 (覆蓋舊的低階型態)
                    if (!catMap.has(unitId) || item.form > catMap.get(unitId).form) {
                        catMap.set(unitId, item);
                    }
                }
            });
            
            // 將 Map 的值轉回陣列 -> 這就是只剩最高型態的清單了
            data = Array.from(catMap.values());
        } 
        else {
            // 模式：指定階級 ('1', '2', '3')
            const targetForm = parseInt(formMode.value);
            data = data.filter(item => item.form === targetForm);
        }

        // 接著執行屬性/能力篩選
        const results = data.filter(cat => {
            const matchTrait = selectedTraits.value.length === 0 || 
                               selectedTraits.value.some(t => cat.traits.includes(t));
            const matchAbility = selectedAbilities.value.length === 0 || 
                                 selectedAbilities.value.some(opt => cat.abilities.includes(opt));
            const matchEffect = selectedEffects.value.length === 0 || 
                                selectedEffects.value.some(opt => cat.effects.includes(opt));
            // 動態數值篩選邏輯
        let isValueMatch = true;
        
        // 只有當使用者有輸入數字時，才進行比較
        if (minVal.value !== '' || maxVal.value !== '') {
            let targetValue = 0;
            
            // 根據選擇的類型，抓取對應的數值
            if (searchType.value === 'hp') targetValue = Number(cat.hp);
            else if (searchType.value === 'atk') targetValue = Number(cat.atk);
            else if (searchType.value === 'range') targetValue =  Number(cat.range);
            else if (searchType.value === 'kb') targetValue = Number(cat.kb);

            const matchMin = minVal.value === '' || targetValue >= minVal.value;
            const matchMax = maxVal.value === '' || targetValue <= maxVal.value;
            
            isValueMatch = matchMin && matchMax;
        }
            return matchTrait && matchAbility && matchEffect && isValueMatch;
        });

        // 最後排序：先排 ID，如果 ID 一樣(開了全顯示)再排階級
        return results.slice().sort((a, b) => {
            const idA = Number(a.id);
            const idB = Number(b.id);

            // 第一層：先比「家族編號」(No.1 < No.2)
            if (idA !== idB) {
                return idA - idB;
            }
            return a.form - b.form; // 1階 -> 2階 -> 3階
        });
    });

    // ★ 分頁計算邏輯 ★
    const totalPages = computed(() => Math.ceil(filteredCats.value.length / pageSize.value));
    
    // 這就是目前這一頁要顯示的 20 筆資料
    const paginatedCats = computed(() => {
        const start = (currentPage.value - 1) * pageSize.value;
        const end = start + pageSize.value;
        return filteredCats.value.slice(start, end);
    });

    const nextPage = () => { 
        if (currentPage.value < totalPages.value) { currentPage.value++; window.scrollTo(0, 0); } 
    };

    const prevPage = () => { 
        if (currentPage.value > 1) { currentPage.value--; window.scrollTo(0, 0); } 
    };

    const clearSearch = () => {// 清除函式
        minVal.value = '0';
        maxVal.value = '';
    };

    // 監聽器
    watch(searchType, () => { clearSearch(); });

    watch([selectedTraits, selectedAbilities, selectedEffects, 
           minVal, maxVal, formMode], () => {
        isFiltering.value = true;
        currentPage.value = 1; // 篩選變動時，跳回第一頁
        setTimeout(() => { isFiltering.value = false; }, 300);
    });

    // 介面輔助函式
    const traitButtonText = computed(() => {
        const count = selectedTraits.value.length;
        return count === 0 ? '選擇屬性...' : `屬性 (${count})`;
    });
    const abilityButtonText = computed(() => {
        const count = selectedAbilities.value.length;
        return count === 0 ? '選擇能力...' : `能力 (${count})`;
    });

    const effectButtonText = computed(() => {
        const count = selectedEffects.value.length;
        return count === 0 ? '選擇效果...' : `效果 (${count})`;
    });

    const toggleTrait = () => {
        isTraitOpen.value = !isTraitOpen.value;
        if(isTraitOpen.value) { isAbilityOpen.value = false; isEffectOpen.value = false; }
    };

    const toggleAbility = () => {
        isAbilityOpen.value = !isAbilityOpen.value;
        if (isAbilityOpen.value) isEffectOpen.value = false;
    };

    const toggleEffect = () => {
        isEffectOpen.value = !isEffectOpen.value;
        if (isEffectOpen.value) isAbilityOpen.value = false;
    };

    onMounted(() => {
        fetchData();
    });
</script>

<style scoped>

.container {
  background-color: #e0fffd;
  padding: 20px;
  font-family: "Microsoft JhengHei", sans-serif;
}

/* 讓兩個篩選器並排 */
.filter-row {
    display: flex;
    gap: 15px; /* 兩個選單中間的空隙 */
    margin-bottom: 15px;
    align-items: center;
}

p.hint { color: gray; font-size: 0.9em; margin-top: 5px; }

.dropdown-wrapper {
  position: relative;
  width: 200px; /* 控制按鈕寬度 */
}

.dropdown-trigger {
  border: 1px solid #ccc;
  padding: 8px 12px;
  background: white;
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: center;
  user-select: none;
}

.dropdown-menu {
  position: absolute;
  top: 105%; 
  left: 0;
  width: 100%;
  background: white;
  border: 1px solid #ccc;
  border-radius: 4px;
  box-shadow: 0 4px 8px rgba(0,0,0,0.15);
  max-height: 250px; 
  overflow-y: auto;
  z-index: 100;
}

.dropdown-item {
  display: flex;
  align-items: center;
  padding: 8px 10px;
  cursor: pointer;
  border-bottom: 1px solid #f0f0f0;
}

.dropdown-item:hover {
  background-color: #f5faff; 
}

.dropdown-item input {
  margin-right: 8px;
  transform: scale(1.2); 
}

.overlay {
  position: fixed; top: 0; left: 0; right: 0; bottom: 0; z-index: 90;
}

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

th { background-color: #f0f0f0; }

.img-placeholder {
    display: inline-block; width: 100px; height: 80px;
    background: #eee; text-align: center; line-height: 30px;
    font-size: 12px;
}
/* 工具列容器：讓東西排在同一行 */
.toolbar {
    display: flex;
    flex-wrap: wrap; /* 螢幕小自動換行 */
    gap: 15px;
    align-items: center;
    background-color: #f8f9fa;
    padding: 10px 15px;
    border-radius: 8px;
    margin-bottom: 20px;
    border: 1px solid #dee2e6;
}

.tool-group {
    display: flex;
    align-items: center;
    gap: 8px;
}

.label { 
    font-weight: bold; color: #555; font-size: 0.9em; 
}

/* 按鈕群組 */
.btn-group { 
    display: flex; gap: 2px; 
    }
.btn-group button {
    padding: 5px 10px;
    border: 1px solid #ced4da;
    background: white;
    cursor: pointer;
    font-size: 0.9em;
}
.btn-group button:first-child { 
    border-radius: 4px 0 0 4px; 
}
.btn-group button:last-child { 
    border-radius: 0 4px 4px 0; 
    }
.btn-group button:hover { 
    background: #e9ecef; 
    }y
.btn-group button.active { 
    background: #0d51fd; color: white; border-color: #0d6efd; 
}

/* 搜尋區 */
.search-group {
    background: white;
    padding: 4px 8px;
    border: 1px solid #ced4da;
    border-radius: 20px;
}
.search-select { 
    border: none; background: transparent; color: #0d6efd; font-weight: bold; cursor: pointer; outline: none; 
}
.num-input { 
    width: 50px; border: none; background: #f1f3f5; text-align: center; border-radius: 4px; padding: 2px; 
}
.clear-btn { 
    background: #dc3545; color: white; border: none; border-radius: 50%; width: 18px; height: 18px; cursor: pointer; font-size: 0.7em; margin-left: 5px; 
}

/* 筆數靠右 */
.count-info { 
    margin-left: auto; color: #666; font-size: 0.9em; 
}
</style>