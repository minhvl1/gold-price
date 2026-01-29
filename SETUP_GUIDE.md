# 🚀 Quick Setup Guide

Hướng dẫn nhanh để setup Gold Price Tracker trong 15 phút.

## Bước 1: Setup Firebase (5 phút)

### 1.1 Cài Firebase CLI

```bash
npm install -g firebase-tools
firebase login
```

### 1.2 Tạo Firebase Project

1. Truy cập: https://console.firebase.google.com/
2. Click **"Add project"**
3. Đặt tên project: `gold-price-tracker`
4. Disable Google Analytics (không cần thiết)
5. Click **"Create project"**

### 1.3 Copy Project ID

Sau khi tạo xong, copy **Project ID** (ví dụ: `gold-price-tracker-abc123`)

### 1.4 Update .firebaserc

Mở file `.firebaserc` và thay đổi:

```json
{
  "projects": {
    "default": "gold-price-tracker-abc123"
  }
}
```

## Bước 2: Setup Notion (5 phút)

### 2.1 Tạo Integration

1. Truy cập: https://www.notion.so/my-integrations
2. Click **"+ New integration"**
3. Điền thông tin:
   - Name: `Gold Price Tracker`
   - Associated workspace: Chọn workspace của bạn
   - Type: Internal
4. Click **"Submit"**
5. Copy **Internal Integration Token** (bắt đầu với `secret_`)

### 2.2 Tạo Database

1. Mở Notion, tạo page mới
2. Gõ `/database` → Chọn **"Table - Inline"**
3. Đặt tên: **"Gold Price History"**

4. Tạo các columns (properties):

| Column Name | Type | Options |
|-------------|------|---------|
| Timestamp | Date | Include time |
| Source | Select | Options: "Phú Quý", "BTMC" |
| Product | Select | Options: "Vàng 999.9", "SJC", "Bạc" |
| Buy Price | Number | Format: Number |
| Sell Price | Number | Format: Number |
| Change % | Number | Format: Number |
| Status | Status | Options: "Active", "Error" |

### 2.3 Share Database với Integration

1. Click nút **"Share"** ở góc trên bên phải
2. Click **"Invite"**
3. Tìm và chọn integration **"Gold Price Tracker"**
4. Click **"Invite"**

### 2.4 Copy Database ID

1. Click **"..."** → **"Copy link to view"**
2. URL sẽ có dạng:
   ```
   https://www.notion.so/your-workspace/abc123def456?v=...
                                        ^^^^^^^^^^^^
                                        Database ID
   ```
3. Copy phần `abc123def456` (32 ký tự)

## Bước 3: Cấu Hình Environment (2 phút)

### 3.1 Tạo .env file

```bash
cd functions
cp .env.example .env
```

### 3.2 Chỉnh sửa functions/.env

```env
NOTION_API_KEY=secret_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
NOTION_DATABASE_ID=abc123def456789
```

Thay thế:
- `NOTION_API_KEY`: Token từ bước 2.1
- `NOTION_DATABASE_ID`: Database ID từ bước 2.4

## Bước 4: Deploy (3 phút)

### 4.1 Cài Dependencies

```bash
cd functions
npm install
cd ..
```

### 4.2 Deploy lên Firebase

```bash
firebase deploy
```

Chờ khoảng 2-3 phút. Khi xong, bạn sẽ thấy:

```
✔  Deploy complete!

Hosting URL: https://gold-price-tracker-abc123.web.app
```

### 4.3 Truy cập Website

Mở URL từ output ở trên trong browser.

## Bước 5: Verify (Optional)

### 5.1 Kiểm tra giá hiển thị

- Giá từ Phú Quý và BTMC phải hiển thị
- Không có lỗi trong Console (F12)

### 5.2 Kiểm tra Notion

- Sau 1-2 phút, check Notion database
- Phải có entries mới được tạo

### 5.3 Kiểm tra Chart

- Chart phải hiển thị sau khi có data trong Notion
- Thử click các nút "24 Giờ", "12 Giờ", "6 Giờ"

## 🎉 Hoàn Thành!

Website của bạn đã live tại: `https://your-project-id.web.app`

## Bước Tiếp Theo (Optional)

### Setup GitHub Actions Auto-Deploy

1. Lấy Firebase token:
```bash
firebase login:ci
```

2. Copy token hiển thị

3. Trên GitHub repo:
   - Settings → Secrets and variables → Actions
   - New repository secret
   - Name: `FIREBASE_TOKEN`
   - Value: Paste token từ bước 1

4. Push code:
```bash
git add .
git commit -m "Setup complete"
git push origin main
```

Từ giờ mỗi lần push code, GitHub Actions sẽ tự động deploy!

## ⚠️ Lưu Ý Quan Trọng

1. **Không commit .env file** - Đã có trong .gitignore
2. **Free tier limits**:
   - Cloud Functions: 2M invocations/month
   - Scheduled function chạy mỗi 1 phút (Firebase limit)
   - Để chạy 30s cần upgrade Blaze plan
3. **Notion rate limit**: 3 requests/second (đủ cho use case này)

## 🆘 Cần Giúp Đỡ?

Nếu gặp vấn đề, check:
1. README.md → Troubleshooting section
2. Firebase Console → Functions logs
3. Browser Console (F12) → Errors
4. Notion integration permissions

---

Happy tracking! 📈✨
