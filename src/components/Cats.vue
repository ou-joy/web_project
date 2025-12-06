<template>
  <!-- 頁面 HTML 內容 -->
  <div class="container">
    <h1>貓咪大戰爭數據表</h1>
    <div class="mul-select">
        <div class="dropdown-wrapper">
            <div class="dropdown-trigger" @click="isDropdownOpen = !isDropdownOpen">
            <span>{{ buttonText }}</span>
            <span class="arrow">▼</span>
            </div>

            <div v-if="isDropdownOpen" class="dropdown-menu">
            <label v-for="opt in abilityOptions" :key="opt" class="dropdown-item">
                <input type="checkbox" :value="opt" v-model="selectedAbilities">
                {{ opt }}
            </label>
            </div>
        <div v-if="isDropdownOpen" class="overlay" @click="isDropdownOpen = false">
        </div>
      </div>
      
      <p class="hint">找到 {{ filteredCats.length }} 筆資料</p>
    </div>
    <div class="table-page">
        <table>
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
            <td>{{ cat.id }}</td>
            <td>{{ cat.name }}</td>
            <td><span class="img-placeholder">圖</span></td>
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

    // --- 設定區 ---
    const abilityOptions = [
    "攻擊力上升","死前存活","善於攻城","會心一擊","鋼鐵殺手",
    "終結不死","靈魂攻擊","破壞護盾","破壞惡魔盾","渾身一擊","得到很多金錢",
    "鋼鐵","小波動","波動","小烈波","烈波攻擊","烈波反擊",
    "爆波攻擊","波動滅止","召喚","終結魔女","終結使徒",
    "超生命體特效","超獸特效","超賢者特效","怪人特效","一次攻擊",
    "攻擊力下降無效","動作停止無效","動作變慢無效","打飛敵人無效","波動傷害無效",
    "烈波傷害無效","爆波傷害無效","傳送無效","古代詛咒無效","毒擊傷害無效",
    "魔王震波無效",
    "抗擊耐性","動止耐性","動慢耐性","抗飛耐性","抗波耐性",
    "抗烈波耐性","抗傳耐性","抗古代詛咒耐性","抗毒擊耐性"
    ];

    // ⚠️ 重要：欄位對照表 (請依 catstat.tsv 實際位置修改)
    // 陣列索引是從 0 開始 (第1欄是0, 第2欄是1...)
    const COL_INDEX = {
    ID: 0,
    NAME: 1,
    HP: 5,      
    ATK: 12,  
    ABILITY:20   
    };

    // --- 變數狀態 ---
    const allCats = ref([]);          // 所有貓咪資料
    const selectedAbilities = ref([]); // 使用者勾選的能力
    const isLoading = ref(true);
    const isDropdownOpen = ref(false); // 控制選單是否打開

    // --- 1. 抓取資料 ---
    const fetchData = async () => {
    try {
        const res = await fetch('https://raw.githubusercontent.com/battlecatsinfo/battlecatsinfo.github.io/master/data/catstat.tsv');
        const text = await res.text();
        const rows = text.trim().split('\n');

        // 解析資料 (跳過第 0 行標題)
        allCats.value = rows.slice(1).map(rowStr => {
        const row = rowStr.split('\t');
        return {
            id: row[COL_INDEX.ID],
            name: row[COL_INDEX.NAME],
            hp: row[COL_INDEX.HP],
            atk: row[COL_INDEX.ATK],
            ability: (row[COL_INDEX.ABILITY] || '').trim()
        };
        });
    } catch (err) {
        console.error(err);
    } finally {
        isLoading.value = false;
    }
    };

    // --- 2. 自動篩選 (Computed) ---
    // 只要 selectedAbilities 一變動，這裡就會自動重算，不用按按鈕
    const filteredCats = computed(() => {
    // 如果沒選，就回傳全部
    if (selectedAbilities.value.length === 0) return allCats.value;

    return allCats.value.filter(cat => {
        // 檢查這隻貓的能力是否有包含「任一個」被選中的選項
        return selectedAbilities.value.some(opt => cat.ability.includes(opt));
    });
    });

    // --- 介面輔助邏輯 ---
    const buttonText = computed(() => {
    const count = selectedAbilities.value.length;
    if (count === 0) 
        return '選擇能力 (可多選)...';
    return `已選擇 ${count} 項能力`;
    });

    // 判斷是否要變色 (紅字)
    const hasSelectedAbility = (text) => {
    if (!text) 
        return false;
    return selectedAbilities.value.some(opt => text.includes(opt));
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

/* 提示文字 */
p.hint { color: gray; margin-left: 10px; font-size: 0.9em; display: inline-block; }

/* --- 下拉選單樣式區 --- */
.mul-select { 
  margin-bottom: 20px; 
  display: flex; 
  align-items: center; 
}

.dropdown-wrapper {
  position: relative; /* 重要：讓選單可以定位在按鈕下方 */
  width: 220px;
}

/* 模擬按鈕的外觀 */
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

/* 彈出的選單 */
.dropdown-menu {
  position: absolute;
  top: 105%; /* 在按鈕正下方 */
  left: 0;
  width: 100%;
  background: white;
  border: 1px solid #ccc;
  border-radius: 4px;
  box-shadow: 0 4px 8px rgba(0,0,0,0.15);
  max-height: 250px; /* 太長會有卷軸 */
  overflow-y: auto;
  z-index: 100; /* 重要：確保蓋在表格上面 */
}

.dropdown-item {
  display: flex;
  align-items: center;
  padding: 8px 10px;
  cursor: pointer;
  border-bottom: 1px solid #f0f0f0;
}

.dropdown-item:hover {
  background-color: #f5faff; /* 滑鼠移過去變色 */
}

.dropdown-item input {
  margin-right: 8px;
  transform: scale(1.2); /* 放大一點點 Checkbox */
}

/* 全螢幕透明遮罩 (點擊外部關閉用) */
.overlay {
  position: fixed; top: 0; left: 0; right: 0; bottom: 0; z-index: 90;
}

/* --- 表格樣式區 --- */
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

/* 關鍵字變紅 */
.highlight { color: red; font-weight: bold; }
</style>