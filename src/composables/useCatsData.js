import { ref, shallowRef } from 'vue';
import { TRAIT_MAP, KEY_MAPPING, IMMUNE_MAPPING } from '../config/mappings'
import { abilityOptions, effectOptions } from '../config/options'

export function useCatsData() {
    const allCats = shallowRef([]);          
    const isLoading = ref(true);

    // 抓取並轉換資料
    const fetchData = async () => {
        isLoading.value = true;
        try {
            // 讀取json
            const res = await fetch('/battle_cats_characters.json');
            if (!res.ok) throw new Error('找不到 JSON 檔案');
            const jsonData = await res.json();

            // ★ 資料轉換核心邏輯
            const processedList= jsonData.map(item => {
                
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
                    form: item.form,    
                    id_form: item.idform,
                    name: item.name_cn || item.name_jp, // 優先顯示中文，沒有就顯示日文
                    hp: item.hp,
                    atk: item.attack, 
                    range: item.range,
                    kb: item.kb,
                    traits: traits,
                    abilities: abilities, 
                    effects: effects, 
                    // 為了表格顯示方便，合併所有能力文字
                    all_abilities: [...effects, ...abilities]
                };
            });
            allCats.value = Object.freeze(processedList);
            console.log(`成功載入 ${allCats.value.length} 筆資料`);

        } catch (err) {
            console.error("錯誤位置：", err);
            alert(err.message);
        } finally {
            isLoading.value = false;
        }
    };
    return { allCats, isLoading, fetchData }
}