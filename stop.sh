#!/bin/bash
if pgrep -f "gold_server.py" > /dev/null; then
    pkill -f "gold_server.py"
    echo "🛑 Server đã được tắt thành công."
else
    echo "⚠️  Không tìm thấy server nào đang chạy."
fi
