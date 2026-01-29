import { onRequest, onSchedule } from 'firebase-functions/v2/https';
import { setGlobalOptions } from 'firebase-functions/v2';
import fetch from 'node-fetch';
import { savePriceData, getHistoricalData } from './notionClient.js';

setGlobalOptions({ region: 'asia-southeast1' });

// API Proxy for Phú Quý
export const getPhuQuyPrice = onRequest(async (req, res) => {
    res.set('Access-Control-Allow-Origin', '*');

    if (req.method === 'OPTIONS') {
        res.set('Access-Control-Allow-Methods', 'GET');
        res.set('Access-Control-Allow-Headers', 'Content-Type');
        return res.status(204).send('');
    }

    try {
        const response = await fetch('https://be.phuquy.com.vn/jewelry/product-payment-service/api/products/get-price', {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
            }
        });

        if (!response.ok) throw new Error('API response not ok');

        const data = await response.json();
        res.set('Cache-Control', 'public, max-age=30');
        return res.status(200).json(data);
    } catch (error) {
        console.error('Phú Quý API error:', error);
        return res.status(500).json({ error: 'Failed to fetch Phú Quý price' });
    }
});

// API Proxy for BTMC
export const getBTMCPrice = onRequest(async (req, res) => {
    res.set('Access-Control-Allow-Origin', '*');

    if (req.method === 'OPTIONS') {
        res.set('Access-Control-Allow-Methods', 'GET');
        res.set('Access-Control-Allow-Headers', 'Content-Type');
        return res.status(204).send('');
    }

    try {
        const response = await fetch('http://api.btmc.vn/api/BTMCAPI/getpricebtmc?key=3kd8ub1llcg9t45hnoh8hmn7t5kc2v', {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
            }
        });

        if (!response.ok) throw new Error('API response not ok');

        const data = await response.json();
        res.set('Cache-Control', 'public, max-age=30');
        return res.status(200).json(data);
    } catch (error) {
        console.error('BTMC API error:', error);
        return res.status(500).json({ error: 'Failed to fetch BTMC price' });
    }
});

// Get Historical Data
export const getHistory = onRequest(async (req, res) => {
    res.set('Access-Control-Allow-Origin', '*');

    if (req.method === 'OPTIONS') {
        res.set('Access-Control-Allow-Methods', 'GET');
        res.set('Access-Control-Allow-Headers', 'Content-Type');
        return res.status(204).send('');
    }

    try {
        const hours = parseInt(req.query.hours) || 24;
        const result = await getHistoricalData(hours);

        if (result.success) {
            res.set('Cache-Control', 'public, max-age=60');
            return res.status(200).json(result.data);
        } else {
            return res.status(500).json({ error: result.error });
        }
    } catch (error) {
        console.error('History fetch error:', error);
        return res.status(500).json({ error: 'Failed to fetch history' });
    }
});

// Scheduled function to save prices every 30 seconds
// Note: Firebase free tier supports minimum 1 minute intervals
// For 30s, you'll need to trigger from frontend or upgrade to Blaze plan
export const scheduledPriceSync = onSchedule('*/1 * * * *', async (event) => {
    console.log('Running scheduled price sync...');

    try {
        // Fetch both APIs
        const [pqResponse, btmcResponse] = await Promise.all([
            fetch('https://be.phuquy.com.vn/jewelry/product-payment-service/api/products/get-price'),
            fetch('http://api.btmc.vn/api/BTMCAPI/getpricebtmc?key=3kd8ub1llcg9t45hnoh8hmn7t5kc2v')
        ]);

        // Process Phú Quý data
        if (pqResponse.ok) {
            const pqData = await pqResponse.json();
            if (pqData.errorCode === '0' && pqData.data) {
                const data = pqData.data;

                // Save Vàng 999.9
                const gold = data.find(i => i.id === 'V');
                if (gold) {
                    await savePriceData('Phú Quý', 'Vàng 999.9', gold.priceBuyTael / 10, gold.priceSellTael / 10, gold.priceChangePercent);
                }

                // Save SJC
                const sjc = data.find(i => i.id === 'S');
                if (sjc) {
                    await savePriceData('Phú Quý', 'SJC', sjc.priceBuyTael / 10, sjc.priceSellTael / 10, sjc.priceChangePercent);
                }

                // Save Bạc
                const silver = data.find(i => i.id === 'B');
                if (silver) {
                    await savePriceData('Phú Quý', 'Bạc', silver.priceBuyTael / 10, silver.priceSellTael / 10, silver.priceChangePercent);
                }
            }
        }

        // Process BTMC data
        if (btmcResponse.ok) {
            const btmcData = await btmcResponse.json();
            if (btmcData.DataList?.Data) {
                const data = btmcData.DataList.Data;

                // Find and save gold prices (simplified parsing)
                for (const item of data) {
                    const i = item['@row'];
                    if (!i) continue;

                    const name = item[`@n_${i}`];
                    const buyStr = item[`@pb_${i}`];
                    const sellStr = item[`@ps_${i}`];
                    const h = item[`@h_${i}`] || '';

                    if (name && buyStr && sellStr) {
                        const buy = parseFloat(buyStr);
                        const sell = parseFloat(sellStr);

                        if (name.includes('SJC')) {
                            await savePriceData('BTMC', 'SJC', buy, sell);
                        } else if ((h === '999.9' && !name.includes('SJC')) || name.includes('TRANG SỨC')) {
                            await savePriceData('BTMC', 'Vàng 999.9', buy, sell);
                        } else if (name.includes('BẠC') || name.includes('BAC')) {
                            // Apply conversion factor for silver
                            let factor = 1;
                            if (name.includes('1 KG') || name.includes('1000 GRAM')) factor = 0.00375;
                            else if (name.includes('10 LƯỢNG')) factor = 0.01;
                            else if (name.includes('1 LƯỢNG')) factor = 0.1;

                            await savePriceData('BTMC', 'Bạc', buy * factor, sell * factor);
                            break;
                        }
                    }
                }
            }
        }

        console.log('Price sync completed successfully');
    } catch (error) {
        console.error('Scheduled sync error:', error);
    }
});
