const fs = require('fs');

try {
    const rawData = fs.readFileSync('btmc_data.json', 'utf8');
    const result = JSON.parse(rawData);
    const data = result.DataList.Data;

    console.log(`Loaded ${data.length} items from BTMC data.`);

    const findItem = (predicate) => {
        let searchedCount = 0;
        for (const item of data) {
            const i = item['@row'];
            if (!i) continue;

            searchedCount++;
            const name = item[`@n_${i}`];
            const buyStr = item[`@pb_${i}`];
            const sellStr = item[`@ps_${i}`];
            const h = item[`@h_${i}`] || '';

            if (name && buyStr && sellStr) {
                if (predicate(name, h)) {
                    console.log(`Found match at row ${i}: ${name}`);
                    return {
                        buy: parseFloat(buyStr),
                        sell: parseFloat(sellStr)
                    };
                }
            }
        }
        console.log(`Searched ${searchedCount} items, match not found.`);
        return null;
    };

    console.log("Searching for Gold 999.9...");
    const gold999 = findItem((name, h) => h === '999.9' || name.includes('TRANG SỨC'));
    console.log("Gold 999.9 result:", gold999);

    console.log("Searching for SJC...");
    const sjc = findItem((name) => name.includes('SJC'));
    console.log("SJC result:", sjc);

} catch (err) {
    console.error("Error:", err);
}
