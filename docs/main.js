document.addEventListener("DOMContentLoaded", () => {
  // メニューボタン
  const menuBtn = document.getElementById("menuBtn");
  if (!menuBtn) return;

  // 記事内のh2を取得してIDを付与
  const headings = Array.from(document.querySelectorAll("h2"));
  const idCount = new Map();
  headings.forEach((heading) => {
    if (!heading.id) {
      const base = heading.textContent
        .trim()
        .replace(/\s+/g, "-")
        .replace(/["'`]/g, "");
      const current = idCount.get(base) || 0;
      const id = current === 0 ? base : `${base}-${current}`;
      idCount.set(base, current + 1);
      heading.id = id;
    }
  });

  // メニュー本体を生成
  const menu = document.createElement("nav");
  menu.id = "sideMenu";

  if (headings.length === 0) {
    menu.innerHTML = "<p>見出しがありません</p>";
  } else {
    const listItems = headings
      .map((heading) => {
        const text = heading.textContent.trim();
        return `<li><a href="#${heading.id}">${text}</a></li>`;
      })
      .join("");
    menu.innerHTML = `<ul>${listItems}</ul>`;
  }

  document.body.appendChild(menu);

  // 表示状態
  let isOpen = false;

  // クリックで開閉
  menuBtn.addEventListener("click", () => {
    isOpen = !isOpen;
    menu.classList.toggle("open", isOpen);
    document.body.classList.toggle("menu-open", isOpen);
  });

  // メニュー内リンククリック時に閉じる
  menu.addEventListener("click", (event) => {
    if (event.target instanceof HTMLAnchorElement) {
      isOpen = false;
      menu.classList.remove("open");
      document.body.classList.remove("menu-open");
    }
  });

  // 穴埋めの表示切り替え
  document.body.addEventListener("click", (event) => {
    const target = event.target;
    if (target instanceof HTMLElement && target.classList.contains("masked")) {
      target.classList.toggle("revealed");
    }
  });

  // コードブロックにコピー用ボタンを追加（行を消費しない）
  const codeBlocks = document.querySelectorAll("pre");
  codeBlocks.forEach((pre) => {
    if (pre.parentElement?.classList.contains("code-wrapper")) return;

    const wrapper = document.createElement("div");
    wrapper.className = "code-wrapper";

    pre.parentNode?.insertBefore(wrapper, pre);
    wrapper.appendChild(pre);

    const button = document.createElement("button");
    button.type = "button";
    button.className = "code-copy-btn";
    button.textContent = "コピー";
    button.setAttribute("aria-label", "コードをコピー");

    button.addEventListener("click", async () => {
      const code = pre.querySelector("code");
      const text = code ? code.innerText : pre.innerText;

      try {
        await navigator.clipboard.writeText(text);
        button.textContent = "コピー済み";
        setTimeout(() => {
          button.textContent = "コピー";
        }, 1200);
      } catch (error) {
        const textarea = document.createElement("textarea");
        textarea.value = text;
        textarea.style.position = "fixed";
        textarea.style.opacity = "0";
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand("copy");
        document.body.removeChild(textarea);
        button.textContent = "コピー済み";
        setTimeout(() => {
          button.textContent = "コピー";
        }, 1200);
      }
    });

    wrapper.appendChild(button);
  });

  // DocsBot iframe の表示/非表示トグル
  const docsbotFrame = document.querySelector(".docsbot-frame");
  if (docsbotFrame instanceof HTMLIFrameElement) {
    docsbotFrame.classList.add("is-hidden");

    const toggleButton = document.createElement("button");
    toggleButton.type = "button";
    toggleButton.className = "docsbot-toggle-btn";
    toggleButton.setAttribute("aria-label", "チャット表示");
    toggleButton.innerHTML = '<i class="fa-solid fa-comment" aria-hidden="true"></i>';

    const updateToggleLabel = () => {
      const isHidden = docsbotFrame.classList.contains("is-hidden");
      toggleButton.setAttribute("aria-label", isHidden ? "チャット表示" : "チャット非表示");
      toggleButton.title = isHidden ? "チャット表示" : "チャット非表示";
      toggleButton.classList.toggle("is-chat-hidden", isHidden);
    };

    updateToggleLabel();

    toggleButton.addEventListener("click", () => {
      docsbotFrame.classList.toggle("is-hidden");
      updateToggleLabel();
    });

    document.body.appendChild(toggleButton);
  }
});
