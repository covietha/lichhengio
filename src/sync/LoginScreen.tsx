import { useRef, useState, type FormEvent } from "react";
import { login } from "./cloud";
import { btnPrimary, errText, field, lbl } from "../ui";

const MESSAGES = {
  wrong: "Mật khẩu chưa đúng. Thử lại.",
  locked: "Nhập sai nhiều lần. Chờ 15 phút rồi thử lại.",
  error: "Không kết nối được máy chủ. Kiểm tra mạng rồi thử lại.",
} as const;

export function LoginScreen({ onSuccess }: { onSuccess: () => void }) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const lock = useRef(false);

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (lock.current || !password) return;
    lock.current = true; setBusy(true); setError(null);
    const r = await login(password);
    lock.current = false; setBusy(false);
    if (r === "ok") onSuccess();
    else setError(MESSAGES[r]);
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <form onSubmit={submit} className="panel w-full max-w-sm" aria-label="Đăng nhập">
        <div className="flex items-center gap-2.5">
          <svg width="32" height="32" viewBox="0 0 32 32" aria-hidden>
            <rect width="32" height="32" rx="8" className="fill-pen" />
            <rect x="10" y="5" width="2" height="22" className="fill-margin" />
            <path d="M15 11h10M15 16h10M15 21h7" className="stroke-on-pen" strokeWidth="2" strokeLinecap="round" fill="none" />
          </svg>
          <span className="font-display text-xl font-bold tracking-tight">Đăng 360</span>
        </div>
        <h1 className="mt-5 text-2xl font-bold tracking-tight">Đăng nhập</h1>
        <p className="mt-1 text-sm text-muted">Mở công việc, dự án và mục tiêu của bạn trên mọi máy.</p>
        <label className={`${lbl} mt-5`}>Mật khẩu
          <input
            type="password" className={field} value={password} autoFocus
            autoComplete="current-password" onChange={(e) => setPassword(e.target.value)}
          />
        </label>
        {error && <p role="alert" className={`mt-3 ${errText}`}>{error}</p>}
        <button disabled={busy || !password} className={`${btnPrimary} mt-4 w-full`}>{busy ? "Đang đăng nhập..." : "Đăng nhập"}</button>
      </form>
    </main>
  );
}
