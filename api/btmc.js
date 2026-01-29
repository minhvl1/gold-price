export default async function handler(request, response) {
    try {
        const apiRes = await fetch('http://api.btmc.vn/api/BTMCAPI/getpricebtmc?key=3kd8ub1llcg9t45hnoh8hmn7t5kc2v', {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            }
        });

        if (!apiRes.ok) throw new Error('API response not ok');

        const data = await apiRes.json();

        // Cache kết quả trong 60 giây
        response.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate');
        return response.status(200).json(data);
    } catch (error) {
        return response.status(500).json({ error: 'Failed to fetch BTMC price' });
    }
}
