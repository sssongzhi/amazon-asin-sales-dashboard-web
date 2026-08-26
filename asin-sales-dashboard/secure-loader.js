(() => {
  const DATA_URL = "secure-data.enc.json";

  function fromBase64(value) {
    const binary = atob(value);
    const bytes = new Uint8Array(binary.length);
    for (let index = 0; index < binary.length; index += 1) {
      bytes[index] = binary.charCodeAt(index);
    }
    return bytes;
  }

  async function decompressGzip(bytes) {
    if (typeof DecompressionStream !== "function") {
      throw new Error("当前浏览器不支持数据解压，请使用最新版 Chrome 或 Edge。");
    }
    const stream = new Blob([bytes]).stream().pipeThrough(new DecompressionStream("gzip"));
    return new Response(stream).text();
  }

  async function decryptData(password) {
    const response = await fetch(DATA_URL, { cache: "no-store" });
    if (!response.ok) throw new Error(`无法下载看板数据（HTTP ${response.status}）`);
    const envelope = await response.json();
    const material = await crypto.subtle.importKey(
      "raw",
      new TextEncoder().encode(password),
      "PBKDF2",
      false,
      ["deriveKey"]
    );
    const key = await crypto.subtle.deriveKey(
      {
        name: "PBKDF2",
        salt: fromBase64(envelope.salt),
        iterations: envelope.iterations,
        hash: "SHA-256",
      },
      material,
      { name: "AES-GCM", length: 256 },
      false,
      ["decrypt"]
    );
    const plaintext = await crypto.subtle.decrypt(
      { name: "AES-GCM", iv: fromBase64(envelope.iv) },
      key,
      fromBase64(envelope.ciphertext)
    );
    const text = envelope.compression === "gzip"
      ? await decompressGzip(new Uint8Array(plaintext))
      : new TextDecoder().decode(plaintext);
    return JSON.parse(text);
  }

  function loadDashboardApp() {
    return new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = "app.js";
      script.onload = resolve;
      script.onerror = () => reject(new Error("看板程序加载失败"));
      document.body.appendChild(script);
    });
  }

  function createUnlockPanel() {
    const style = document.createElement("style");
    style.textContent = `
      .secure-unlock { --ink: #25272a; --muted: #6d7177; --line: #d6d9dd; --button: #4b4e53; position: fixed; inset: 0; z-index: 99999; display: grid; place-items: center; padding: 24px; background: radial-gradient(circle at 50% 43%, #fff 0, #f5f6f7 34%, #eceef0 100%); font-family: "Microsoft YaHei UI", "PingFang SC", sans-serif; }
      .secure-unlock-card { width: min(420px, 100%); padding: 34px; border: 1px solid var(--line); border-radius: 18px; background: rgba(255,255,255,.97); box-shadow: 0 22px 70px rgba(36,40,44,.13); }
      .secure-unlock-card h1 { margin: 0 0 8px; color: var(--ink); font-size: 24px; }
      .secure-unlock-card p { margin: 0 0 22px; color: var(--muted); font-size: 14px; line-height: 1.7; }
      .secure-unlock-card input { box-sizing: border-box; width: 100%; height: 46px; padding: 0 13px; border: 1px solid var(--line); border-radius: 10px; background: #fafafa; color: var(--ink); font-size: 16px; outline: none; transition: border-color .18s ease, box-shadow .18s ease, background .18s ease; }
      .secure-unlock-card input:focus { border-color: #747980; background: #fff; box-shadow: 0 0 0 3px rgba(74,78,83,.12); }
      .secure-unlock-card button { width: 100%; height: 44px; margin-top: 12px; border: 0; border-radius: 10px; background: var(--button); color: white; font-size: 15px; font-weight: 700; cursor: pointer; transition: background .18s ease, transform .18s ease; }
      .secure-unlock-card button:hover:not(:disabled) { background: #383b3f; }
      .secure-unlock-card button:active:not(:disabled) { transform: translateY(1px); }
      .secure-unlock-card button:disabled { cursor: wait; background: #92969b; }
      .secure-unlock-error { min-height: 20px; margin-top: 10px; color: #b42318; font-size: 13px; }
    `;
    document.head.appendChild(style);

    const panel = document.createElement("div");
    panel.className = "secure-unlock";
    panel.innerHTML = `
      <form class="secure-unlock-card">
        <h1>ASIN 销售看板</h1>
        <p>数据已加密，请输入团队访问密码。密码只在当前浏览器内用于解密，不会上传或保存。</p>
        <input type="password" name="password" autocomplete="current-password" placeholder="团队访问密码" required autofocus>
        <button type="submit">解锁看板</button>
        <div class="secure-unlock-error" role="alert"></div>
      </form>
    `;
    document.body.appendChild(panel);
    return panel;
  }

  async function initialize() {
    const panel = createUnlockPanel();
    const form = panel.querySelector("form");
    const input = panel.querySelector("input");
    const button = panel.querySelector("button");
    const error = panel.querySelector(".secure-unlock-error");

    form.addEventListener("submit", async event => {
      event.preventDefault();
      error.textContent = "";
      button.disabled = true;
      button.textContent = "正在解密…";
      try {
        const payload = await decryptData(input.value);
        window.SALES_DATA = payload.sales;
        window.AD_DATA = payload.ads;
        window.INVENTORY_DATA = payload.inventory;
        input.value = "";
        panel.remove();
        await loadDashboardApp();
      } catch (unlockError) {
        console.error("Dashboard unlock failed", unlockError);
        error.textContent = unlockError.name === "OperationError"
          ? "密码不正确，请重新输入。"
          : unlockError.message || "看板解锁失败，请稍后重试。";
        button.disabled = false;
        button.textContent = "解锁看板";
        input.focus();
      }
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initialize, { once: true });
  } else {
    initialize();
  }
})();
