# Hướng Dẫn Deploy & Setup (Git + Firebase + Custom Domain)

Tài liệu này hướng dẫn chi tiết các bước để đưa ứng dụng **Gold Price Tracker** lên môi trường online sử dụng dữ liệu thật.

## 1. Git Setup (Quản lý mã nguồn)

Nếu bạn chưa đưa code lên GitHub/GitLab, hãy làm theo các bước sau:

1.  **Khởi tạo Git repository (nếu chưa có):**
    ```bash
    git init
    ```

2.  **Thêm tất cả file và commit:**
    ```bash
    git add .
    git commit -m "Initial commit - Gold Price Tracker complete"
    ```

3.  **Tạo một repository mới trên GitHub** (hoặc GitLab/Bitbucket).

4.  **Kết nối và đẩy code lên:**
    ```bash
    git remote add origin <LINK_REPOSITORY_CUA_BAN>
    # Ví dụ: git remote add origin https://github.com/username/gold-price-tracker.git
    
    git branch -M main
    git push -u origin main
    ```

## 2. Chuẩn bị cho "Real DB" (Tắt Mock Data)

Để ứng dụng chạy với dữ liệu thật từ Cloud Functions thay vì dữ liệu giả:

1.  **Mở file `public/index.html`**.
2.  **Tìm và comment (hoặc xóa) dòng import mock data**:
    ```html
    <!-- Comment bỏ dòng này khi deploy lên production -->
    <!-- <script src="mock-data.js"></script> -->
    ```
    *Lưu ý: Tôi sẽ giúp bạn làm bước này tự động ở bên dưới.*

3.  **Kiểm tra `public/script.js`**: Đảm bảo biến `MOCK_MODE` sẽ là `false` khi không có file `mock-data.js`. Code hiện tại đã xử lý việc này (`const MOCK_MODE = window.MOCK_MODE || false;`).

## 3. Setup Firebase Project (Database & Functions)

Nếu bạn chưa tạo project trên Firebase Console:

1.  Truy cập [Firebase Console](https://console.firebase.google.com/).
2.  Tạo project mới (ví dụ: `gold-price-tracker`).
3.  **Tạo Firestore Database**:
    *   Vào mục **Build** -> **Firestore Database**.
    *   Click **Create database**.
    *   Chọn location (nên chọn `asia-southeast1` - Singapore để nhanh nhất cho VN).
    *   Chọn **Start in production mode**.
4.  **Cài đặt Firebase CLI (nếu chưa có):**
    ```bash
    npm install -g firebase-tools
    ```
5.  **Đăng nhập và khởi tạo:**
    ```bash
    firebase login
    firebase use --add
    # Chọn project bạn vừa tạo trên console
    ```

## 4. Deploy lên Firebase (Hosting + Functions)

Chạy lệnh sau để deploy toàn bộ (Frontend + Backend):

```bash
firebase deploy
```

*Lệnh này sẽ:*
*   Deploy thư mục `public/` lên Firebase Hosting.
*   Deploy thư mục `functions/` lên Cloud Functions.
*   Cập nhật `firestore.rules` (nếu có).

### Troubleshooting Function Deploy:
Nếu deploy functions bị lỗi, hãy đảm bảo bạn đã cài dependencies trong thư mục functions:
```bash
cd functions
npm install
cd ..
firebase deploy --only functions
```

## 5. Setup Custom Domain (Tên miền riêng)

Để gắn tên miền (ví dụ: `giavang.vn`) vào ứng dụng:

1.  Truy cập [Firebase Console](https://console.firebase.google.com/).
2.  Vào project của bạn -> **Hosting**.
3.  Bấm vào **Add custom domain**.
4.  Nhập tên miền của bạn (ví dụ: `yourdomain.com`).
5.  **Cấu hình DNS**:
    *   Firebase sẽ cung cấp cho bạn các bản ghi **A Records** hoặc **TXT Records**.
    *   Truy cập trang quản lý tên miền (GoDaddy, Namecheap, Mắt Bão, v.v.).
    *   Thêm các bản ghi này vào cấu hình DNS của tên miền.
6.  Đợi vài phút (hoặc tối đa 24h) để DNS lan truyền và chứng chỉ SSL được cấp phát tự động.

## 6. Kiểm tra sau khi Deploy

1.  Truy cập URL mặc định (ví dụ: `https://your-project-id.web.app`).
2.  Mở Developer Tools (F12) -> Console.
3.  Đảm bảo **không** thấy dòng chữ `Running in MOCK MODE`.
4.  Kiểm tra tab Network để xem các request gọi API (ví dụ: `/api/getPhuQuyPrice`) có trả về dữ liệu thật từ Cloud Function không.
