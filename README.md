# Trợ lý cá nhân Đăng 360 — Phase 2

## Chạy trên máy tính
Cần Node.js 18 trở lên.
```
npm install
npm run typecheck   # kiểm tra kiểu TypeScript
npm test            # chạy toàn bộ test (Vitest)
npm run dev         # mở http://localhost:5173
npm run build && npm run preview
```
Trên điện thoại: chạy `npm run dev -- --host`, mở địa chỉ mạng LAN mà Vite in ra.

## Đã có
- **Hôm nay / Công việc:** thêm, sửa, hoàn thành, mở lại, chuyển hôm nay, hủy, xóa mềm; lọc theo trạng thái và dự án.
- **Dự án:** thêm, sửa, lưu trữ, xóa mềm; tiến độ tự tính từ việc; danh sách việc của dự án.
- **Mục tiêu:** thêm, sửa, hoàn thành, xóa mềm; khung thời gian (Hôm nay/Tuần/Tháng/Dài hạn); liên kết dự án; tiến độ tự tính.
- **Liên kết:** mỗi việc gắn được vào một dự án và một mục tiêu; bỏ liên kết bằng cách chọn "Không có".
- **Lịch:** xem Ngày / Tuần / Tháng từ dữ liệu thật; ở xem Ngày bấm giờ để thêm việc đúng giờ đó.
- **Responsive:** thanh điều hướng dưới trên điện thoại, thanh bên trên máy tính; hỗ trợ chế độ tối theo hệ thống.
- **Lưu trữ:** IndexedDB (Dexie). Mỗi thay đổi ghi kèm một dòng trong `outbox` trong cùng transaction.

## Quy ước dữ liệu
- Gửi `""` cho trường tùy chọn khi sửa nghĩa là xóa trường đó (bỏ hạn, bỏ liên kết...).
- Xóa dự án/mục tiêu là xóa mềm. Việc bên trong KHÔNG bị xóa, chỉ hiển thị là không thuộc dự án nào.
- Tiến độ = việc hoàn thành / (tất cả việc trừ việc đã hủy). Chưa có việc thì hiện "Chưa có việc", không bịa 0%.

## Chưa có (cố ý, không giả lập)
- Đăng nhập, đồng bộ đám mây, Firebase: chưa có Firebase project. Dữ liệu chỉ nằm trên trình duyệt này.
  Xóa dữ liệu trình duyệt hoặc dùng cửa sổ ẩn danh sẽ mất dữ liệu. Chưa có Export/Import (Phase 5).
- Nhắc việc, thông báo, AI, PWA cài đặt được, thống kê.
- Sự kiện lịch riêng và Google Calendar: lịch chỉ hiển thị việc có hạn.
- Việc lặp lại, việc con, ghi chú, danh mục chưa có giao diện.
- Test giao diện (React Testing Library) và E2E (Playwright).
