import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import { AuthGate } from "./sync/AuthGate";
import { migrateLegacyIdentity } from "./sync/migrate";
import "./index.css";

// Xin trình duyệt giữ dữ liệu IndexedDB lâu dài (không bị tự dọn khi thiếu bộ nhớ).
// Trình duyệt có thể từ chối; khi đó dữ liệu vẫn lưu nhưng kém bền hơn.
void navigator.storage?.persist?.();

// Gán dữ liệu cũ sang mã chủ chung trước khi hiển thị, rồi mới dựng giao diện.
void migrateLegacyIdentity()
  .catch(() => undefined)
  .then(() => {
    createRoot(document.getElementById("root")!).render(
      <StrictMode>
        <AuthGate><App /></AuthGate>
      </StrictMode>,
    );
  });
