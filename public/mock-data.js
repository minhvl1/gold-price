// Mock data for local development
window.MOCK_MODE = true;

console.log('🎭 Mock Mode Enabled - Using sample data');

window.mockPhuQuyData = {
    errorCode: '0',
    data: [
        {
            id: 'V',
            priceBuyTael: 84500000,
            priceSellTael: 85200000,
            priceChangePercent: 0.15
        },
        {
            id: 'S',
            priceBuyTael: 86000000,
            priceSellTael: 87000000,
            priceChangePercent: -0.05
        },
        {
            id: 'B',
            priceBuyTael: 7500000,
            priceSellTael: 7800000,
            priceChangePercent: 0.02
        }
    ]
};

window.mockBTMCData = {
    DataList: {
        Data: [
            {
                '@row': '1',
                '@n_1': 'VÀNG TRANG SỨC 999.9',
                '@pb_1': '8450000',
                '@ps_1': '8520000',
                '@h_1': '999.9'
            },
            {
                '@row': '2',
                '@n_2': 'VÀNG SJC 1L, 5C',
                '@pb_2': '8600000',
                '@ps_2': '8700000',
                '@h_2': ''
            },
            {
                '@row': '3',
                '@n_3': 'BẠC 1 LƯỢNG',
                '@pb_3': '750000',
                '@ps_3': '780000',
                '@h_3': ''
            }
        ]
    }
};

// Generate mock historical data for charts
window.mockHistoryData = [];
const now = new Date();
const baseGoldPrice = 8500000;
const baseSJCPrice = 8650000;

for (let i = 24; i >= 0; i--) {
    const timestamp = new Date(now.getTime() - i * 60 * 60 * 1000);
    const variance = Math.sin(i / 3) * 50000;

    // Phú Quý - Vàng 999.9
    window.mockHistoryData.push({
        timestamp: timestamp.toISOString(),
        source: 'Phú Quý',
        product: 'Vàng 999.9',
        buyPrice: baseGoldPrice - 50000 + variance,
        sellPrice: baseGoldPrice + variance,
        changePercent: (variance / baseGoldPrice) * 100
    });

    // Phú Quý - SJC
    window.mockHistoryData.push({
        timestamp: timestamp.toISOString(),
        source: 'Phú Quý',
        product: 'SJC',
        buyPrice: baseSJCPrice - 50000 + variance * 1.1,
        sellPrice: baseSJCPrice + variance * 1.1,
        changePercent: (variance * 1.1 / baseSJCPrice) * 100
    });

    // BTMC - Vàng 999.9
    window.mockHistoryData.push({
        timestamp: timestamp.toISOString(),
        source: 'BTMC',
        product: 'Vàng 999.9',
        buyPrice: baseGoldPrice - 30000 + variance * 0.9,
        sellPrice: baseGoldPrice + 20000 + variance * 0.9,
        changePercent: (variance * 0.9 / baseGoldPrice) * 100
    });

    // BTMC - SJC
    window.mockHistoryData.push({
        timestamp: timestamp.toISOString(),
        source: 'BTMC',
        product: 'SJC',
        buyPrice: baseSJCPrice - 40000 + variance * 0.95,
        sellPrice: baseSJCPrice + 10000 + variance * 0.95,
        changePercent: (variance * 0.95 / baseSJCPrice) * 100
    });
}

console.log('✅ Mock data loaded:', {
    phuQuy: window.mockPhuQuyData.data.length + ' items',
    btmc: window.mockBTMCData.DataList.Data.length + ' items',
    history: window.mockHistoryData.length + ' data points'
});
