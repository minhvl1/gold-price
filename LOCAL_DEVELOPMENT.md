# 🛠️ Local Development Guide

## Quick Start (5 phút)

### Option 1: Frontend Only (No Backend)

Bạn đã làm rồi! Chỉ cần mở:
```
file:///Users/macbook/Documents/code/gold-price/public/index.html
```

**Lưu ý**: Sẽ không có data vì không có backend.

---

### Option 2: Full Stack với Firebase Emulators (Recommended)

#### Bước 1: Setup Notion (Bắt buộc)

```bash
cd functions
cp .env.example .env
```

Chỉnh sửa `functions/.env`:
```env
NOTION_API_KEY=secret_your_key_here
NOTION_DATABASE_ID=your_database_id_here
```

**Cách lấy Notion credentials**: Xem `SETUP_GUIDE.md` phần "Bước 2: Setup Notion"

#### Bước 2: Start Firebase Emulators

```bash
# Cài Firebase CLI (nếu chưa có)
npm install -g firebase-tools

# Start emulators
firebase emulators:start
```

Bạn sẽ thấy:
```
✔  functions: Emulator started at http://127.0.0.1:5001
✔  hosting: Emulator started at http://127.0.0.1:5000
```

#### Bước 3: Truy Cập

Mở browser: **http://localhost:5000**

---

## Option 3: Simple HTTP Server (Frontend Only)

Nếu không muốn setup Firebase Emulators:

```bash
cd public
python3 -m http.server 8000
```

Truy cập: **http://localhost:8000**

**Lưu ý**: API calls sẽ fail vì không có backend.

---

## Option 4: Mock Data (Development)

Để test frontend mà không cần backend, tạo mock data:

### Tạo file `public/mock-data.js`:

```javascript
// Mock data for local development
window.MOCK_MODE = true;

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

// Mock historical data
window.mockHistoryData = [];
const now = new Date();
for (let i = 24; i >= 0; i--) {
  const timestamp = new Date(now.getTime() - i * 60 * 60 * 1000);
  window.mockHistoryData.push({
    timestamp: timestamp.toISOString(),
    source: 'Phú Quý',
    product: 'Vàng 999.9',
    buyPrice: 8450000 + Math.random() * 100000 - 50000,
    sellPrice: 8520000 + Math.random() * 100000 - 50000,
    changePercent: Math.random() * 0.5 - 0.25
  });
  window.mockHistoryData.push({
    timestamp: timestamp.toISOString(),
    source: 'Phú Quý',
    product: 'SJC',
    buyPrice: 8600000 + Math.random() * 100000 - 50000,
    sellPrice: 8700000 + Math.random() * 100000 - 50000,
    changePercent: Math.random() * 0.5 - 0.25
  });
}
```

### Update `public/index.html`:

Thêm trước `<script src="script.js">`:
```html
<!-- Mock data for local development -->
<script src="mock-data.js"></script>
```

### Update `public/script.js`:

Thêm vào đầu file:
```javascript
// Check if running in mock mode
const MOCK_MODE = window.MOCK_MODE || false;

// Update PriceService methods
const PriceService = {
    async fetchPhuQuy() {
        if (MOCK_MODE) {
            console.log('🎭 Mock mode: Using mock Phú Quý data');
            await new Promise(resolve => setTimeout(resolve, 500)); // Simulate delay
            return this.parsePhuQuyData(window.mockPhuQuyData);
        }
        // ... existing code
    },
    
    async fetchBTMC() {
        if (MOCK_MODE) {
            console.log('🎭 Mock mode: Using mock BTMC data');
            await new Promise(resolve => setTimeout(resolve, 500));
            return this.parseBTMCData(window.mockBTMCData);
        }
        // ... existing code
    },
    
    async fetchHistory(hours = 24) {
        if (MOCK_MODE) {
            console.log('🎭 Mock mode: Using mock history data');
            await new Promise(resolve => setTimeout(resolve, 500));
            return window.mockHistoryData;
        }
        // ... existing code
    }
};
```

---

## Recommended Workflow

### For Quick UI Testing:
```bash
# Option 4: Mock data
1. Tạo mock-data.js
2. Update index.html và script.js
3. Mở file:///path/to/public/index.html
```

### For Full Integration Testing:
```bash
# Option 2: Firebase Emulators
1. Setup Notion credentials
2. firebase emulators:start
3. Open http://localhost:5000
```

### For Production-like Testing:
```bash
# Deploy to Firebase
firebase deploy
# Test at your Firebase URL
```

---

## Troubleshooting

### Emulator không start

```bash
# Kill existing processes
lsof -ti:5000 | xargs kill -9
lsof -ti:5001 | xargs kill -9

# Restart
firebase emulators:start
```

### CORS errors với emulator

Emulators tự động handle CORS, nhưng nếu vẫn lỗi:
```bash
# Clear browser cache
# Restart emulators
```

### Mock data không hoạt động

1. Check Console (F12) có log "🎭 Mock mode"
2. Verify `window.MOCK_MODE = true` trong mock-data.js
3. Verify script order trong index.html

---

## Development Tips

1. **Hot Reload**: Emulators tự động reload khi code thay đổi
2. **Logs**: Check terminal running emulators để xem function logs
3. **Debugging**: Dùng Chrome DevTools (F12) → Sources tab
4. **Network**: Check Network tab để xem API calls

---

## Next Steps

Sau khi test local OK:
1. Deploy to Firebase: `firebase deploy`
2. Setup GitHub Actions cho auto-deploy
3. Monitor logs tại Firebase Console
