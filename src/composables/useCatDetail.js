import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';

// --- 工具函式 ---
export function useCatDetail({ traitsMap = {}, abilitiesMap = {} } = {}) {
    const route = useRoute();
    const routeId = route.params.id; // 取得網址上的 ID

    const catForms = ref([]);
    const isLoading = ref(true);

    
    // 1. Frame 轉秒數 (貓戰是 30 frame = 1秒)
    const frameToSec = (frames) => {
        if(!frames) return 0;
        return (frames / 30).toFixed(2);
    }
    const frameToSecCd = (frames) => {
        if(!frames) return 0;
        const cdseconds = (frames / 15 - 8.8).toFixed(2);
        if(cdseconds < 2) return 2;
        else
            return cdseconds;
    }

    // 2. 計算 DPS
    const calculateDPS = (cat) => {
        if (!cat.attack_freq_frames || cat.attack_freq_frames === 0) return 0;
        const seconds = cat.attack_freq_frames / 30;
        return Math.round(cat.attack / seconds);
    };

    // 3. 取得最後型態的名字 (當標題用)
    const getAllName = () => {
        if (catForms.value.length === 0) return '';
        return catForms.value
            .map(cat => cat.name_cn || cat.name_jp)
            .join('->');
    };

    // 4. 解析屬性 (Traits)
    const getTraits = (cat) => {
        const list = [];
        for (const [key, label] of Object.entries(traitsMap)) {
            if (cat[key] && cat[key] !== 0) list.push(label);
        }
        return list;
    };

    // 5. 解析能力 (Abilities)
    const getAbilities = (cat) => {
        const list = [];
        for (const [key, label] of Object.entries(abilitiesMap)) {
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
    return {
        catForms,
        isLoading,
        routeId,
        frameToSec,
        frameToSecCd,
        calculateDPS,
        getAllName,
        getTraits,
        getAbilities,
        fetchDetail
    };
}