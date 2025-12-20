import { ref, shallowRef } from 'vue';
import { TRAIT_MAP, KEY_MAPPING, IMMUNE_MAPPING } from '../config/mappings'
import { abilityOptions, effectOptions } from '../config/options'

const RARITY_MAP = {
    0: '基本',
    1: 'EX',
    2: '稀有',
    3: '激稀有',
    4: '超激稀有',
    5: '傳說稀有'
};

export function useCatsData() {
    const allCats = shallowRef([]);          
    const isLoading = ref(true);

    const fetchData = async () => {
        isLoading.value = true;
        try {
            const res = await fetch('/battle_cats_characters.json');
            if (!res.ok) throw new Error('找不到 JSON 檔案');
            const jsonData = await res.json();

            // 資料轉換核心邏輯
            const processedList= jsonData.map(item => {
                
                // 處理能力：檢查所有 ability_ 開頭的欄位，如果是 1 就加入清單
                const traits = [];
                const abilities = [];
                const effects = [];

                //屬性
                for (const [key, label] of Object.entries(TRAIT_MAP)) {
                    if (item[key] && item[key] !== 0) traits.push(label);
                }

                //能力與效果
                for (const [key, label] of Object.entries(KEY_MAPPING)) {
                    if (item[key] && item[key] !== 0) {
                        if (abilityOptions.includes(label)) abilities.push(label);
                        else if (effectOptions.includes(label)) effects.push(label);
                    }
                }

                //能力
                for (const [key, label] of Object.entries(IMMUNE_MAPPING)) {
                    if (item[key] && item[key] !== 0) {
                        abilities.push(label);
                    }
                }

                return {
                    id: item.id,
                    form: item.form,
                    rarity: RARITY_MAP[item.rarity],    
                    id_form: item.idform,
                    name: item.name_cn || item.name_jp, 
                    hp: (item.hp*2.5),
                    atk: (item.attack*2.5), 
                    range: item.range,
                    kb: item.kb,
                    traits: traits,
                    abilities: abilities, 
                    effects: effects, 
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