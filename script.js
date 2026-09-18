(() => {
  const form = document.getElementById("bookForm");
  const note = document.getElementById("formNote");
  const zoneSelect = document.getElementById("zoneSelect");
  const dateInput = form.querySelector('[name="date"]');
  const burger = document.querySelector(".burger");
  const mobileNav = document.querySelector(".mobile-nav");

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  dateInput.min = new Date().toISOString().slice(0, 10);
  dateInput.value = tomorrow.toISOString().slice(0, 10);

  document.querySelectorAll("[data-zone]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const zone = btn.getAttribute("data-zone");
      if (zone && zoneSelect) zoneSelect.value = zone;
    });
  });

  burger?.addEventListener("click", () => {
    const open = mobileNav.classList.toggle("is-open");
    mobileNav.hidden = !open;
    burger.setAttribute("aria-expanded", open ? "true" : "false");
  });

  mobileNav?.querySelectorAll("a").forEach((a) => {
    a.addEventListener("click", () => {
      mobileNav.classList.remove("is-open");
      mobileNav.hidden = true;
      burger?.setAttribute("aria-expanded", "false");
    });
  });

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    note.classList.remove("is-error");

    const data = new FormData(form);
    const name = String(data.get("name") || "").trim();
    const tg = String(data.get("tg") || "").trim();

    if (!name || !tg) {
      note.textContent = "Заполни имя и Telegram.";
      note.classList.add("is-error");
      return;
    }

    const text = [
      "RAID Arena — бронь",
      `Имя: ${name}`,
      `TG: ${tg}`,
      `Зона: ${data.get("zone")}`,
      `Дата: ${data.get("date")} ${data.get("time")}`,
      `Часов: ${data.get("hours")}`,
    ].join("\n");

    note.textContent = "Открываю Telegram для подтверждения…";
    window.open(
      `https://t.me/life_slow?text=${encodeURIComponent(text)}`,
      "_blank",
      "noopener"
    );
  });
})();
