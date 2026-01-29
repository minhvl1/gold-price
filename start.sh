#!/bin/bash
# Kiểm tra nếu server đã chạy thì không chạy lại
if pgrep -f "gold_server.py" > /dev/null; then
    echo "⚠️  Server đã đang chạy!"
else
    nohup python3 gold_server.py > server.log 2>&1 &
    echo "✅ Server đã khởi động tại http://localhost:8000"
    echo "   (Log được ghi vào file server.log)"
fi
