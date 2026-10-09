import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Xin trình duyệt giữ dữ liệu IndexedDB lâu dài (không bị tự dọn khi thiếu bộ nhớ).
// Trình duyệt có thể từ chối; khi đó dữ liệu vẫn lưu nhưng kém bền hơn.
void navigator.storage?.persist?.();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
