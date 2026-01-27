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
  });

  // メニュー内リンククリック時に閉じる
  menu.addEventListener("click", (event) => {
    if (event.target instanceof HTMLAnchorElement) {
      isOpen = false;
      menu.classList.remove("open");
    }
  });
});
