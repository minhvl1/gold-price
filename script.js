/**
 * Application Constants
 */
const CONFIG = {
    API: {
        BTMC: '/api/btmc',
        PHU_QUY: '/api/phuquy'
    },
    REFRESH_INTERVAL: 30000,
    LOCALE: 'vi-VN'
};

/**
 * Utility Functions
 */
const Utils = {
    formatPrice(price) {
        if (!price || price === 0) return '--';
        return new Intl.NumberFormat(CONFIG.LOCALE).format(price);
    },

    formatChange(percent) {
        if (typeof percent !== 'number') return '';
        const sign = percent > 0 ? '+' : '';
        return `${sign}${percent.toFixed(2)}%`;
    },

    getCurrentTime() {
        const now = new Date();
        const time = now.toLocaleTimeString(CONFIG.LOCALE, { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        const date = now.toLocaleDateString(CONFIG.LOCALE, { day: '2-digit', month: '2-digit', year: 'numeric' });
        return { time, date };
    }
};

/**
 * Service Layer - Handles Data Fetching & Processing
 */
const PriceService = {
    async fetchPhuQuy() {
        try {
            const response = await fetch(CONFIG.API.PHU_QUY);
            const result = await response.json();

            if (result.errorCode !== '0' || !result.data) {
                console.error('Phú Quý API error:', result);
                return null;
            }

            const data = result.data;
            const parseItem = (id) => {
                const item = data.find(i => i.id === id);
                if (!item) return null;
                // Convert from tael (lượng) to chi (chỉ) -> divide by 10
                return {
                    buy: item.priceBuyTael / 10,
                    sell: item.priceSellTael / 10,
                    change: item.priceChangePercent
                };
            };

            return {
                gold: parseItem('V'),
                sjc: parseItem('S'),
                silver: parseItem('B')
            };
        } catch (error) {
            console.error('Error fetching Phú Quý:', error);
            return null;
        }
    },

    async fetchBTMC() {
        try {
            const response = await fetch(CONFIG.API.BTMC);
            const result = await response.json();

            // Guard clause for invalid data structure
            if (!result.DataList || !Array.isArray(result.DataList.Data)) {
                console.error('BTMC API Data Invalid (Expected Array):', result);
                return null;
            }

            const data = result.DataList.Data;

            // 1. & 2. Find Gold items using a more robust search
            const findItem = (predicate) => {
                for (const item of data) {
                    const i = item['@row'];
                    if (!i) continue;

                    const name = item[`@n_${i}`];
                    const buyStr = item[`@pb_${i}`];
                    const sellStr = item[`@ps_${i}`];
                    const h = item[`@h_${i}`] || '';

                    if (name && buyStr && sellStr) {
                        if (predicate(name, h)) {
                            // console.log(`Found item: ${name} (Row ${i})`, { buy: buyStr, sell: sellStr });
                            return {
                                buy: parseFloat(buyStr),
                                sell: parseFloat(sellStr)
                            };
                        }
                    }
                }
                return null;
            };

            // 1. Gold 999.9 (Prefer TRANG SỨC items if available)
            const gold999 = findItem((name, h) => h === '999.9' || name.includes('TRANG SỨC'));
            console.log('BTMC Gold 999.9:', gold999);

            // 2. SJC
            const sjc = findItem((name) => name.includes('SJC'));
            console.log('BTMC SJC:', sjc);

            // 3. Silver
            let silver = null;
            for (const item of data) {
                const i = item['@row'];
                if (!i) continue;

                const name = item[`@n_${i}`];
                const buyStr = item[`@pb_${i}`];
                const sellStr = item[`@@ps_${i}`];

                if (name && (name.includes('BẠC') || name.includes('BAC')) && buyStr && sellStr) {
                    const buy = parseFloat(buyStr);
                    const sell = parseFloat(sellStr);
                    let factor = 1;

                    if (name.includes('1 KG') || name.includes('1000 GRAM')) factor = 0.00375;
                    else if (name.includes('10 LƯỢNG')) factor = 0.01;
                    else if (name.includes('1 LƯỢNG')) factor = 0.1;

                    silver = { buy: buy * factor, sell: sell * factor };
                    // console.log('BTMC Silver:', silver);
                    break;
                }
            }

            return {
                gold: gold999,
                sjc: sjc,
                silver: silver
            };

        } catch (error) {
            console.error('Error fetching BTMC:', error);
            return null;
        }
    }
};

/**
 * UI Layer - Handles DOM Updates
 */
class UIManager {
    constructor() {
        this.els = {
            lastUpdate: document.getElementById('lastUpdate'),
            // Phu Quy
            pqGoldBuy: document.getElementById('pq-gold-buy'),
            pqGoldSell: document.getElementById('pq-gold-sell'),
            pqGoldChange: document.getElementById('pq-gold-change'),
            pqSjcBuy: document.getElementById('pq-sjc-buy'),
            pqSjcSell: document.getElementById('pq-sjc-sell'),
            pqSjcChange: document.getElementById('pq-sjc-change'),
            pqSilverBuy: document.getElementById('pq-silver-buy'),
            pqSilverSell: document.getElementById('pq-silver-sell'),
            pqSilverChange: document.getElementById('pq-silver-change'),
            // BTMC
            btmcGoldBuy: document.getElementById('btmc-gold-buy'),
            btmcGoldSell: document.getElementById('btmc-gold-sell'),
            btmcSjcBuy: document.getElementById('btmc-sjc-buy'),
            btmcSjcSell: document.getElementById('btmc-sjc-sell'),
            btmcSilverBuy: document.getElementById('btmc-silver-buy'),
            btmcSilverSell: document.getElementById('btmc-silver-sell')
        };
    }

    updatePriceRow(buyEl, sellEl, changeEl, data) {
        if (!data) return;
        if (buyEl) buyEl.textContent = Utils.formatPrice(data.buy);
        if (sellEl) sellEl.textContent = Utils.formatPrice(data.sell);
        if (changeEl && data.change !== undefined) {
            changeEl.textContent = Utils.formatChange(data.change);
            changeEl.className = 'change ' + (data.change >= 0 ? 'positive' : 'negative');
        }
    }

    renderLastUpdate() {
        const { time, date } = Utils.getCurrentTime();
        if (this.els.lastUpdate) {
            this.els.lastUpdate.textContent = `Cập nhật lúc: ${time} - ${date}`;
        }
    }

    renderPhuQuy(data) {
        if (!data) return;
        this.updatePriceRow(this.els.pqGoldBuy, this.els.pqGoldSell, this.els.pqGoldChange, data.gold);
        this.updatePriceRow(this.els.pqSjcBuy, this.els.pqSjcSell, this.els.pqSjcChange, data.sjc);
        this.updatePriceRow(this.els.pqSilverBuy, this.els.pqSilverSell, this.els.pqSilverChange, data.silver);
    }

    renderBTMC(data) {
        if (!data) return;
        this.updatePriceRow(this.els.btmcGoldBuy, this.els.btmcGoldSell, null, data.gold);
        this.updatePriceRow(this.els.btmcSjcBuy, this.els.btmcSjcSell, null, data.sjc);
        this.updatePriceRow(this.els.btmcSilverBuy, this.els.btmcSilverSell, null, data.silver);
    }
}

/**
 * Main Application
 */
const App = {
    ui: null,

    async refresh() {
        console.log('Refreshing data...');
        const [pqData, btmcData] = await Promise.all([
            PriceService.fetchPhuQuy(),
            PriceService.fetchBTMC()
        ]);

        this.ui.renderPhuQuy(pqData);
        this.ui.renderBTMC(btmcData);
        this.ui.renderLastUpdate();
    },

    init() {
        this.ui = new UIManager();
        this.refresh();
        setInterval(() => this.refresh(), CONFIG.REFRESH_INTERVAL);
    }
};

document.addEventListener('DOMContentLoaded', () => App.init());
