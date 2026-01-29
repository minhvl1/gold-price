# 💰 Gold Price Tracker

Ứng dụng theo dõi giá vàng và bạc từ **Phú Quý** và **Bảo Tín Minh Châu** với cập nhật liên tục mỗi 30 giây, biểu đồ trực quan, và lưu trữ lịch sử giá vào Notion database.

## ✨ Tính Năng

- 📊 **Biểu đồ trực quan** - Chart.js hiển thị xu hướng giá 24h/12h/6h
- 🔄 **Cập nhật tự động** - Fetch API mỗi 30 giây
- 💾 **Lưu trữ Notion** - Lịch sử giá được lưu vào Notion database
- 🎨 **Thiết kế minimal** - Giao diện tinh tế, sang trọng
- 🚀 **100% Miễn phí** - Firebase Hosting + Cloud Functions + Notion
- ⚡ **Tự động deploy** - GitHub Actions CI/CD

## 🏗️ Kiến Trúc

```
Frontend (Firebase Hosting)
    ↓
Firebase Cloud Functions (API Proxy)
    ↓
[Phú Quý API] + [BTMC API] → Notion Database
    ↓
Chart.js (Visualization)
```

## 📋 Yêu Cầu

- Node.js 20+
- Firebase CLI
- Notion account (free tier)
- GitHub account

## 🚀 Setup

### 1. Clone Repository

```bash
git clone <your-repo-url>
cd gold-price
```

### 2. Cài Đặt Firebase CLI

```bash
npm install -g firebase-tools
firebase login
```

### 3. Tạo Firebase Project

1. Truy cập [Firebase Console](https://console.firebase.google.com/)
2. Tạo project mới
3. Copy Project ID

```bash
# Update .firebaserc với project ID của bạn
{
  "projects": {
    "default": "your-project-id-here"
  }
}
```

### 4. Tạo Notion Integration

1. Truy cập [Notion Integrations](https://www.notion.so/my-integrations)
2. Click **"+ New integration"**
3. Đặt tên: `Gold Price Tracker`
4. Copy **Internal Integration Token**

### 5. Tạo Notion Database

1. Tạo database mới trong Notion với schema:

| Property | Type | Description |
|----------|------|-------------|
| Timestamp | Date | Thời gian ghi nhận |
| Source | Select | "Phú Quý" hoặc "BTMC" |
| Product | Select | "Vàng 999.9", "SJC", "Bạc" |
| Buy Price | Number | Giá mua vào |
| Sell Price | Number | Giá bán ra |
| Change % | Number | % thay đổi |
| Status | Status | "Active", "Error" |

2. Share database với integration:
   - Click **Share** → **Invite** → Chọn integration của bạn

3. Copy Database ID từ URL:
   ```
   https://notion.so/your-workspace/DATABASE_ID?v=...
                                    ^^^^^^^^^^^^
   ```

### 6. Cấu Hình Environment Variables

```bash
cd functions
cp .env.example .env
```

Chỉnh sửa `functions/.env`:

```env
NOTION_API_KEY=secret_xxxxxxxxxxxxxxxxxxxxx
NOTION_DATABASE_ID=xxxxxxxxxxxxxxxxxxxxxxxx
```

### 7. Cài Đặt Dependencies

```bash
cd functions
npm install
```

### 8. Deploy lên Firebase

```bash
# Deploy tất cả
firebase deploy

# Hoặc deploy riêng lẻ
firebase deploy --only hosting
firebase deploy --only functions
```

### 9. Cấu Hình GitHub Actions (Optional)

1. Lấy Firebase token:
```bash
firebase login:ci
```

2. Thêm secret vào GitHub:
   - Vào **Settings** → **Secrets and variables** → **Actions**
   - Tạo secret mới: `FIREBASE_TOKEN` với giá trị từ bước 1

3. Push code lên GitHub:
```bash
git add .
git commit -m "Initial commit"
git push origin main
```

## 🧪 Local Development

### Chạy Firebase Emulators

```bash
# Terminal 1: Start emulators
firebase emulators:start

# Terminal 2: Serve frontend
cd public
python3 -m http.server 5000
```

Truy cập: `http://localhost:5000`

## 📁 Cấu Trúc Thư Mục

```
gold-price/
├── .github/
│   └── workflows/
│       └── firebase-deploy.yml    # GitHub Actions
├── functions/                      # Firebase Cloud Functions
│   ├── index.js                   # Main functions
│   ├── notionClient.js            # Notion integration
│   ├── package.json
│   └── .env                       # Environment variables
├── public/                        # Frontend (Firebase Hosting)
│   ├── index.html
│   ├── style.css
│   ├── script.js
│   └── chartConfig.js
├── firebase.json
├── .firebaserc
└── README.md
```

## 🔧 API Endpoints

### Cloud Functions

- `GET /api/getPhuQuyPrice` - Lấy giá từ Phú Quý
- `GET /api/getBTMCPrice` - Lấy giá từ BTMC
- `GET /api/getHistory?hours=24` - Lấy lịch sử giá

### Scheduled Function

- `scheduledPriceSync` - Chạy mỗi 1 phút (Firebase free tier limit)
  - Lưu ý: Firebase free tier chỉ hỗ trợ tối thiểu 1 phút
  - Để cập nhật 30s, cần upgrade Blaze plan hoặc trigger từ frontend

## 💡 Troubleshooting

### Lỗi: "Permission denied" khi deploy

```bash
firebase login --reauth
```

### Lỗi: Notion API không hoạt động

1. Kiểm tra `NOTION_API_KEY` đúng format: `secret_xxxxx`
2. Verify database đã được share với integration
3. Kiểm tra `NOTION_DATABASE_ID` chính xác

### Chart không hiển thị

1. Mở Console (F12) kiểm tra lỗi
2. Verify `/api/getHistory` trả về data
3. Đảm bảo có dữ liệu trong Notion database

### CORS Error

Firebase Functions tự động xử lý CORS. Nếu vẫn gặp lỗi:
- Kiểm tra `firebase.json` có rewrites đúng
- Redeploy functions: `firebase deploy --only functions`

## 📊 Chi Phí (Free Tier)

| Service | Free Tier | Expected Usage | Status |
|---------|-----------|----------------|--------|
| Firebase Hosting | 10GB storage, 360MB/day | ~5MB total, ~10MB/day | ✅ Safe |
| Cloud Functions | 2M invocations/month | ~43K/month (1min interval) | ✅ Safe |
| Notion API | Unlimited pages | ~1,440 entries/day | ✅ Safe |
| GitHub Actions | 2,000 min/month | ~10 min/month | ✅ Safe |

**Total: $0/month** 🎉

## 🎨 Design Philosophy

- **Minimal & Elegant** - Clean lines, generous whitespace
- **Typography** - Inter font for modern feel
- **Colors** - Subtle gold accents, soft grays
- **Animations** - Smooth transitions (300ms)
- **Responsive** - Mobile-first approach

## 🔐 Security

- ✅ API keys stored in environment variables
- ✅ Notion integration với restricted permissions
- ✅ CORS configured properly
- ✅ No sensitive data in frontend

## 📝 License

MIT

## 🤝 Contributing

Pull requests are welcome!

## 📧 Contact

Nếu có vấn đề, tạo issue trên GitHub.

---

Made with ❤️ using Firebase, Notion, and Chart.js
