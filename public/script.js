/**
 * Gold Price Tracker - Main Application
 * Integrates with Firebase Cloud Functions and Chart.js
 */

// Check if running in mock mode (for local development)
const MOCK_MODE = window.MOCK_MODE || false;

if (MOCK_MODE) {
    console.log('🎭 Running in MOCK MODE - Using sample data');
}

const CONFIG = {
    API: {
        BTMC: '/api/getBTMCPrice',
        PHU_QUY: '/api/getPhuQuyPrice',
        HISTORY: '/api/getHistory'
    },
    REFRESH_INTERVAL: 30000, // 30 seconds
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
        const time = now.toLocaleTimeString(CONFIG.LOCALE, {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
        const date = now.toLocaleDateString(CONFIG.LOCALE, {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
        return { time, date };
    }
};

/**
 * Service Layer - Data Fetching
 */
const PriceService = {
    async fetchPhuQuy() {
        // Mock mode for local development
        if (MOCK_MODE && window.mockPhuQuyData) {
            console.log('📊 Fetching Phú Quý data (MOCK)');
            await new Promise(resolve => setTimeout(resolve, 300)); // Simulate delay
            const result = window.mockPhuQuyData;

            if (result.errorCode !== '0' || !result.data) {
                return null;
            }

            const data = result.data;
            const parseItem = (id) => {
                const item = data.find(i => i.id === id);
                if (!item) return null;
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
        }

        // Real API call
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
        // Mock mode for local development
        if (MOCK_MODE && window.mockBTMCData) {
            console.log('📊 Fetching BTMC data (MOCK)');
            await new Promise(resolve => setTimeout(resolve, 300));
            const result = window.mockBTMCData;

            if (!result.DataList || !Array.isArray(result.DataList.Data)) {
                return null;
            }

            const data = result.DataList.Data;

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
                            return {
                                buy: parseFloat(buyStr),
                                sell: parseFloat(sellStr)
                            };
                        }
                    }
                }
                return null;
            };

            const gold999 = findItem((name, h) =>
                (h === '999.9' && !name.includes('SJC')) || name.includes('TRANG SỨC')
            );

            const sjc = findItem((name) => name.includes('SJC'));

            let silver = null;
            for (const item of data) {
                const i = item['@row'];
                if (!i) continue;

                const name = item[`@n_${i}`];
                const buyStr = item[`@pb_${i}`];
                const sellStr = item[`@ps_${i}`];

                if (name && (name.includes('BẠC') || name.includes('BAC')) && buyStr && sellStr) {
                    const buy = parseFloat(buyStr);
                    const sell = parseFloat(sellStr);
                    let factor = 1;

                    if (name.includes('1 KG') || name.includes('1000 GRAM')) factor = 0.00375;
                    else if (name.includes('10 LƯỢNG')) factor = 0.01;
                    else if (name.includes('1 LƯỢNG')) factor = 0.1;

                    silver = { buy: buy * factor, sell: sell * factor };
                    break;
                }
            }

            return {
                gold: gold999,
                sjc: sjc,
                silver: silver
            };
        }

        // Real API call
        try {
            const response = await fetch(CONFIG.API.BTMC);
            const result = await response.json();

            if (!result.DataList || !Array.isArray(result.DataList.Data)) {
                console.error('BTMC API Data Invalid:', result);
                return null;
            }

            const data = result.DataList.Data;

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
                            return {
                                buy: parseFloat(buyStr),
                                sell: parseFloat(sellStr)
                            };
                        }
                    }
                }
                return null;
            };

            const gold999 = findItem((name, h) =>
                (h === '999.9' && !name.includes('SJC')) || name.includes('TRANG SỨC')
            );

            const sjc = findItem((name) => name.includes('SJC'));

            let silver = null;
            for (const item of data) {
                const i = item['@row'];
                if (!i) continue;

                const name = item[`@n_${i}`];
                const buyStr = item[`@pb_${i}`];
                const sellStr = item[`@ps_${i}`];

                if (name && (name.includes('BẠC') || name.includes('BAC')) && buyStr && sellStr) {
                    const buy = parseFloat(buyStr);
                    const sell = parseFloat(sellStr);
                    let factor = 1;

                    if (name.includes('1 KG') || name.includes('1000 GRAM')) factor = 0.00375;
                    else if (name.includes('10 LƯỢNG')) factor = 0.01;
                    else if (name.includes('1 LƯỢNG')) factor = 0.1;

                    silver = { buy: buy * factor, sell: sell * factor };
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
    },

    async fetchHistory(hours = 24) {
        // Mock mode for local development
        if (MOCK_MODE && window.mockHistoryData) {
            console.log('📊 Fetching history data (MOCK)');
            await new Promise(resolve => setTimeout(resolve, 300));

            // Filter by hours
            const cutoffTime = new Date();
            cutoffTime.setHours(cutoffTime.getHours() - hours);

            return window.mockHistoryData.filter(entry => {
                return new Date(entry.timestamp) >= cutoffTime;
            });
        }

        // Real API call
        try {
            const response = await fetch(`${CONFIG.API.HISTORY}?hours=${hours}`);
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error fetching history:', error);
            return [];
        }
    }
};

/**
 * Chart Manager
 */
class ChartManager {
    constructor() {
        this.chart = null;
        this.currentHours = 24;
        this.currentSource = 'pq'; // Default to Phú Quý
        this.initChart();
        this.initControls();
    }

    initChart() {
        const ctx = document.getElementById('priceChart');
        if (!ctx) return;

        this.chart = new Chart(ctx, {
            type: 'line',
            data: {
                datasets: []
            },
            options: window.ChartConfig.getDefaultOptions()
        });
    }

    initControls() {
        // Time controls
        document.querySelectorAll('.time-controls .chart-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.time-controls .chart-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                this.currentHours = parseInt(e.target.dataset.hours);
                this.updateChart();
            });
        });

        // Source controls
        document.querySelectorAll('.source-controls .chart-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.source-controls .chart-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                this.currentSource = e.target.dataset.source;
                this.updateChart();
            });
        });
    }

    updateVisibility() {
        const pqSection = document.getElementById('phu-quy-section');
        const btmcSection = document.getElementById('btmc-section');

        if (!pqSection || !btmcSection) {
            console.warn('⚠️ Sections not found');
            return;
        }

        console.log('🔄 updateVisibility:', this.currentSource);

        if (this.currentSource === 'pq') {
            pqSection.classList.remove('hidden');
            btmcSection.classList.add('hidden');
        } else if (this.currentSource === 'btmc') {
            pqSection.classList.add('hidden');
            btmcSection.classList.remove('hidden');
        }
    }

    async updateChart() {
        const history = await PriceService.fetchHistory(this.currentHours);

        if (!history || history.length === 0) {
            console.log('No historical data available');
            return;
        }

        // Group data by source and product
        const grouped = this.groupData(history);

        // Create datasets based on currentSource
        const datasets = [];

        const showPQ = this.currentSource === 'pq';
        const showBTMC = this.currentSource === 'btmc';

        // Vàng 999.9
        if (showPQ && grouped['Phú Quý']?.['Vàng 999.9']) {
            datasets.push(
                window.ChartConfig.createDataset(
                    'Vàng 999.9',
                    grouped['Phú Quý']['Vàng 999.9'],
                    'gold'
                )
            );
        } else if (showBTMC && grouped['BTMC']?.['Vàng 999.9']) {
            datasets.push(
                window.ChartConfig.createDataset(
                    'Vàng 999.9',
                    grouped['BTMC']['Vàng 999.9'],
                    'gold'
                )
            );
        }

        // SJC
        if (showPQ && grouped['Phú Quý']?.['SJC']) {
            datasets.push(
                window.ChartConfig.createDataset(
                    'SJC',
                    grouped['Phú Quý']['SJC'],
                    'sjc'
                )
            );
        } else if (showBTMC && grouped['BTMC']?.['SJC']) {
            datasets.push(
                window.ChartConfig.createDataset(
                    'SJC',
                    grouped['BTMC']['SJC'],
                    'sjc'
                )
            );
        }

        this.chart.data.datasets = datasets;
        this.chart.update('none');
    }

    groupData(history) {
        const grouped = {};

        history.forEach(entry => {
            const { source, product, timestamp, sellPrice } = entry;

            if (!grouped[source]) grouped[source] = {};
            if (!grouped[source][product]) grouped[source][product] = [];

            grouped[source][product].push({
                x: new Date(timestamp),
                y: sellPrice
            });
        });

        return grouped;
    }
}

/**
 * UI Manager
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
    chartManager: null,

    async refresh() {
        console.log('Refreshing data...');
        const [pqData, btmcData] = await Promise.all([
            PriceService.fetchPhuQuy(),
            PriceService.fetchBTMC()
        ]);

        this.ui.renderPhuQuy(pqData);
        this.ui.renderBTMC(btmcData);
        this.ui.renderLastUpdate();

        // Update chart with latest data
        if (this.chartManager) {
            this.chartManager.updateChart();
        }
    },

    init() {
        this.ui = new UIManager();
        this.chartManager = new ChartManager();

        this.refresh();
        setInterval(() => this.refresh(), CONFIG.REFRESH_INTERVAL);
    }
};

document.addEventListener('DOMContentLoaded', () => App.init());
