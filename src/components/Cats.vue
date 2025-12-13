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
    import { ref, computed, onMounted } from 'vue';

    // --- 1. 選項設定 ---
    
    // 能力選項 (針對數值或特性)
    const traitOptions =['紅色敵人','飄浮敵人','黑色敵人','鋼鐵敵人',
    '無屬性','天使','異星戰士','不死生物','古代種','惡魔'
    ];
    const abilityOptions = [
        "攻擊力上升","死前存活","善於攻城","會心一擊",
        "終結不死","靈魂攻擊","破壞護盾","破壞惡魔盾","渾身一擊","得到很多金錢",
        "鋼鐵","小波動","波動","烈波攻擊","波動滅止",
        "超生命體特效","超獸特效",
        "攻擊力下降無效","動作停止無效","動作變慢無效","打飛敵人無效","波動傷害無效",
        "烈波傷害無效","傳送無效","古代詛咒無效","毒擊傷害無效",
    ];

    // 效果選項 (針對控場效果)
    const effectOptions = [
        "攻擊力下降", "使動作停止", "使動作變慢", "只能攻擊", "善於攻擊", "很耐打", "超級耐打", 
        "超大傷害","極度傷害","打飛敵人","傳送","古代的詛咒","攻擊無效"
    ];
// --- 2. 翻譯對照表 (關鍵！) ---
    // 左邊是你 JSON 的英文欄位，右邊是你要顯示的中文
    const TRAIT_MAP = {
    'trait_red': '紅色敵人',
    'trait_floating': '飄浮敵人',
    'trait_black': '黑色敵人',
    'trait_metal': '鋼鐵敵人',
    'trait_traitless': '無屬性',
    'trait_angel': '天使',
    'trait_alien': '異星戰士',
    'trait_zombie': '不死生物',
    'trait_ancient': '古代種',
    'trait_devil': '惡魔'
    };
    const KEY_MAPPING = {
        // 能力類 (Abilities)
        'ability_attack_up': '攻擊力上升',
        'ability_survive': '死前存活',
        'ability_base_destroyer': '善於攻城',
        'ability_crit': '會心一擊',
        'ability_zombie_killer': '終結不死',
        'ability_soulstrike': '靈魂攻擊',
        'ability_shield_pierce': '破壞護盾',
        'ability_devil_shield_pierce': '破壞惡魔盾',
        'ability_savage_blow': '渾身一擊',
        'ability_extra_money': '得到很多金錢',
        'ability_metal': '鋼鐵',
        'ability_mini_wave': '小波動',
        'ability_wave': '波動',
        'ability_surge': '烈波攻擊',
        'ability_wave_blocker': '波動滅止',
        'ability_colossus_slayer': '超生命體特效',
        'ability_behemoth_slayer': '超獸特效',

        // 效果類 (Effects)
        'effect_weaken': '攻擊力下降',
        'effect_freeze': '使動作停止',
        'effect_slow': '使動作變慢',
        'ability_target_only': '只能攻擊',
        'ability_strong': '善於攻擊',
        'ability_resistant': '很耐打',
        'ability_super_resistant': '超級耐打',
        'ability_massive_dmg': '超大傷害',
        'ability_insane_dmg': '極度傷害',
        'effect_kb': '打飛敵人',
        'effect_warp': '傳送',
        'effect_curse': '古代的詛咒',
        'ability_dodge': '攻擊無效'
    };
    const IMMUNE_MAPPING={
        'immune_weaken': '攻擊力下降無效',
        'immune_freeze': '動作停止無效',
        'immune_slow': '動作變慢無效',
        'immune_kb': '打飛敵人無效',
        'immune_wave': '波動傷害無效',
        'immune_surge': '烈波傷害無效',
        'immune_warp': '傳送無效',
        'immune_curse': '古代詛咒無效',
        'immune_toxic': '毒擊傷害無效'
    };
    // --- 3. 變數狀態 ---
    const allCats = ref([]);          
    const isLoading = ref(true);

    const selectedTraits = ref([]);
    const isTraitOpen = ref(false);

    const selectedAbilities = ref([]); 
    const isAbilityOpen = ref(false);

    const selectedEffects = ref([]); 
    const isEffectOpen = ref(false);

    // --- 4. 抓取並轉換資料 ---
    const fetchData = async () => {
        isLoading.value = true;
        try {
            // 讀取放在 public 資料夾的檔案
            const res = await fetch('/battle_cats_characters.json');
            
            if (!res.ok) throw new Error('找不到 JSON 檔案');

            const jsonData = await res.json();

            // ★ 資料轉換核心邏輯
            allCats.value = jsonData.map(item => {
                
                // 1. 處理能力：檢查所有 ability_ 開頭的欄位，如果是 1 就加入清單
                const traits = [];
                const abilities = [];
                const effects = [];

                // A. 處理屬性
                for (const [key, label] of Object.entries(TRAIT_MAP)) {
                    if (item[key] && item[key] !== 0) traits.push(label);
                }

                // B. 處理能力與效果 (KEY_MAPPING)
                for (const [key, label] of Object.entries(KEY_MAPPING)) {
                    if (item[key] && item[key] !== 0) {
                        if (abilityOptions.includes(label)) abilities.push(label);
                        else if (effectOptions.includes(label)) effects.push(label);
                    }
                }

                // C. 處理無效能力 (IMMUNE_MAPPING) -> 視為能力
                for (const [key, label] of Object.entries(IMMUNE_MAPPING)) {
                    if (item[key] && item[key] !== 0) {
                        abilities.push(label);
                    }
                }

                // 2. 回傳整理好的物件
                return {
                    id: item.id,
                    id_form: item.idform,
                    name: item.name_cn || item.name_jp, // 優先顯示中文，沒有就顯示日文
                    hp: item.hp,
                    atk: item.attack, // JSON 裡的欄位是 attack
                    traits: traits,
                    abilities: abilities, // 包含功能和無效
                    effects: effects, // 包含控場
                    // 為了表格顯示方便，合併所有能力文字
                    all_abilities: [...effects, ...abilities]
                };
            });

        } catch (err) {
            console.error("錯誤位置：", err);
            alert(err.message);
        } finally {
            isLoading.value = false;
        }
    };

    // --- 5. 篩選邏輯---
    const filteredCats = computed(() => {
        return allCats.value.filter(cat => {
            const matchTrait = selectedTraits.value.length === 0 || 
                               selectedTraits.value.some(t => cat.traits.includes(t));
            const matchAbility = selectedAbilities.value.length === 0 || 
                                 selectedAbilities.value.some(opt => cat.abilities.includes(opt));
            
            const matchEffect = selectedEffects.value.length === 0 || 
                                selectedEffects.value.some(opt => cat.effects.includes(opt));
            
            return matchTrait && matchAbility && matchEffect;
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