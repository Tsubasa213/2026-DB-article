document.addEventListener("DOMContentLoaded", () => {
  // メニューボタン
  const menuBtn = document.getElementById("menuBtn");
  if (!menuBtn) return;

  // コラム分類（演習 / SQLドリル / その他）
  const getNearestHeadingText = (element, headingTag) => {
    let current = element;
    const targetTag = headingTag.toLowerCase();
    while (current) {
      let sibling = current.previousElementSibling;
      while (sibling) {
        if (sibling.tagName?.toLowerCase() === targetTag) {
          return sibling.textContent?.trim() || "";
        }
        sibling = sibling.previousElementSibling;
      }
      current = current.parentElement;
    }
    return "";
  };

  const columns = document.querySelectorAll(".column");
  columns.forEach((column) => {
    const titleElement = column.querySelector(".column-title");
    const titleText = titleElement?.textContent?.trim() || "";
    const nearestH3Text = getNearestHeadingText(column, "h3");

    const isExercise = /^(ウォームアップ演習|追加演習|最終演習|演習[:：]|演習ステップ|ステップ[0-9０-９]|リカバリ課題)/.test(titleText);
    const isSqlDrill = /^(課題[:：]|ドリル)/.test(titleText) || /^(ex-|ドリル)/i.test(nearestH3Text);

    column.classList.remove("column-exercise", "column-sql-drill", "column-other");
    if (isSqlDrill) {
      column.classList.add("column-sql-drill");
    } else if (isExercise) {
      column.classList.add("column-exercise");
    } else {
      column.classList.add("column-other");
    }
  });

  // ボタンを3本線に初期化（既存レイアウトは維持）
  if (!menuBtn.querySelector("span")) {
    menuBtn.textContent = "";
    for (let index = 0; index < 3; index += 1) {
      const line = document.createElement("span");
      menuBtn.appendChild(line);
    }
  }

  // 記事内のh2/h3を取得してIDを付与
  const headings = Array.from(document.querySelectorAll("h2, h3"));
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
        const levelClass = heading.tagName.toLowerCase() === "h3" ? "menu-level-h3" : "menu-level-h2";
        return `<li class="${levelClass}"><a href="#${heading.id}">${text}</a></li>`;
      })
      .join("");
    menu.innerHTML = `<ul>${listItems}</ul>`;
  }

  document.body.appendChild(menu);

  // 表示状態
  let isOpen = false;

  const updateMenuButton = () => {
    menuBtn.classList.toggle("is-open", isOpen);
    menuBtn.setAttribute("aria-label", isOpen ? "メニューを閉じる" : "メニューを開く");
    menuBtn.title = isOpen ? "メニューを閉じる" : "メニューを開く";
  };

  updateMenuButton();

  // クリックで開閉
  menuBtn.addEventListener("click", () => {
    isOpen = !isOpen;
    menu.classList.toggle("open", isOpen);
    document.body.classList.toggle("menu-open", isOpen);
    updateMenuButton();
  });

  // メニュー内リンククリック時に閉じる
  menu.addEventListener("click", (event) => {
    if (event.target instanceof HTMLAnchorElement) {
      isOpen = false;
      menu.classList.remove("open");
      document.body.classList.remove("menu-open");
      updateMenuButton();
    }
  });

  // 穴埋めの表示切り替え
  document.body.addEventListener("click", (event) => {
    const target = event.target;
    if (target instanceof HTMLElement && target.classList.contains("masked")) {
      target.classList.toggle("revealed");
    }
  });

  // 穴埋め回答を含むコピーを防止
  document.addEventListener("copy", (event) => {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;

    const range = selection.getRangeAt(0);
    const fragment = range.cloneContents();
    if (fragment.querySelector(".masked:not(.revealed)")) {
      event.preventDefault();
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
