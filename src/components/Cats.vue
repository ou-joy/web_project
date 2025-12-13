<template>
  <div class="container">
    <h1>貓咪大戰爭數據表</h1>
    
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
                    <th>名稱</th>
                    <th>圖片</th>
                    <th>生命</th>
                    <th>攻擊</th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="cat in filteredCats" :key="cat.id">
                    <td>{{ cat.id_form }}</td>
                    <td>{{ cat.name }}</td>
                    <td>
                      <router-link :to="'/cat/' + cat.id" class="img-link">
                      <span class="img-placeholder">圖</span>
                      </router-link>  
                    </td>
                    <td>{{ cat.hp }}</td>
                    <td>{{ cat.atk }}</td>
                </tr>
            </tbody>
        </table>
    </div>
  </div>
</template>

<script setup>
    import { ref, computed, onMounted } from 'vue'
    import { useCatsData } from '../composables/useCatsData'
    import { traitOptions, abilityOptions, effectOptions } from '../config/options'

    const { allCats, isLoading, fetchData } = useCatsData()
    const selectedTraits = ref([]);
    const selectedAbilities = ref([]); 
    const selectedEffects = ref([]); 
    
    const isTraitOpen = ref(false);
    const isAbilityOpen = ref(false);
    const isEffectOpen = ref(false);
    

    // 篩選邏輯
    const filteredCats = computed(() => {
        if (!allCats.value) return [];
        const results= allCats.value.filter(cat => {
            const matchTrait = selectedTraits.value.length === 0 || 
                               selectedTraits.value.some(t => cat.traits.includes(t));
            const matchAbility = selectedAbilities.value.length === 0 || 
                                 selectedAbilities.value.some(opt => cat.abilities.includes(opt));
            
            const matchEffect = selectedEffects.value.length === 0 || 
                                selectedEffects.value.some(opt => cat.effects.includes(opt));
            
            return matchTrait && matchAbility && matchEffect;
        });
        return results.slice().sort((a, b) => {
            return a.id_main - b.id_main;
        });
    });

    // --- 6. 介面輔助函式---
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
  display: inline-block; width: 30px; height: 30px;
  background: #eee; text-align: center; line-height: 30px;
  border-radius: 50%; font-size: 12px;
}
</style>