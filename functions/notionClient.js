import { Client } from '@notionhq/client';

const notion = new Client({
    auth: process.env.NOTION_API_KEY
});

const DATABASE_ID = process.env.NOTION_DATABASE_ID;

export async function savePriceData(source, product, buyPrice, sellPrice, changePercent = null) {
    try {
        const properties = {
            'Timestamp': {
                date: {
                    start: new Date().toISOString()
                }
            },
            'Source': {
                select: {
                    name: source
                }
            },
            'Product': {
                select: {
                    name: product
                }
            },
            'Buy Price': {
                number: buyPrice
            },
            'Sell Price': {
                number: sellPrice
            },
            'Status': {
                status: {
                    name: 'Active'
                }
            }
        };

        if (changePercent !== null && changePercent !== undefined) {
            properties['Change %'] = {
                number: changePercent
            };
        }

        await notion.pages.create({
            parent: { database_id: DATABASE_ID },
            properties
        });

        return { success: true };
    } catch (error) {
        console.error('Notion save error:', error);
        return { success: false, error: error.message };
    }
}

export async function getHistoricalData(hours = 24) {
    try {
        const startTime = new Date();
        startTime.setHours(startTime.getHours() - hours);

        const response = await notion.databases.query({
            database_id: DATABASE_ID,
            filter: {
                property: 'Timestamp',
                date: {
                    after: startTime.toISOString()
                }
            },
            sorts: [
                {
                    property: 'Timestamp',
                    direction: 'ascending'
                }
            ]
        });

        const data = response.results.map(page => ({
            timestamp: page.properties.Timestamp.date.start,
            source: page.properties.Source.select?.name,
            product: page.properties.Product.select?.name,
            buyPrice: page.properties['Buy Price'].number,
            sellPrice: page.properties['Sell Price'].number,
            changePercent: page.properties['Change %']?.number
        }));

        return { success: true, data };
    } catch (error) {
        console.error('Notion fetch error:', error);
        return { success: false, error: error.message, data: [] };
    }
}
