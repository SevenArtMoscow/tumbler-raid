(() => {
  const PRICES = {
    "Main Floor": 180,
    "VIP Booth": 320,
    "Console Lounge": 220,
    "Night Raid": 990,
  };

  const GEAR = {
    main: {
      title: "Main Floor",
      zone: "Main Floor",
      img: "https://images.unsplash.com/photo-1593305841991-05c297ba4575?auto=format&fit=crop&w=1000&q=80",
      specs: [
        ["GPU", "RTX 4070 12 GB"],
        ["CPU", "Intel i5-13600"],
        ["RAM", "32 GB DDR5"],
        ["Monitor", "27\" 240 Hz IPS"],
        ["Periphery", "Logitech G Pro + HyperX"],
      ],
    },
    vip: {
      title: "VIP Booth",
      zone: "VIP Booth",
      img: "https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=1000&q=80",
      specs: [
        ["GPU", "RTX 4080 16 GB"],
        ["CPU", "Intel i7-14700"],
        ["RAM", "64 GB DDR5"],
        ["Monitor", "27\" 360 Hz OLED"],
        ["Booth", "Закрытая кабина + диван"],
      ],
    },
    console: {
      title: "Console Lounge",
      zone: "Console Lounge",
      img: "https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?auto=format&fit=crop&w=1000&q=80",
      specs: [
        ["Console", "PS5 / Xbox Series X"],
        ["Display", 'TV 55" 4K 120 Hz'],
        ["Pads", "2 геймпада + зарядка"],
        ["Audio", "Саундбар"],
        ["Library", "FIFA, Tekken, It Takes Two"],
      ],
    },
  };

  const SEATS = [];
  for (let i = 1; i <= 16; i++) {
    SEATS.push({
      id: `A${String(i).padStart(2, "0")}`,
      zone: "Main Floor",
      vip: false,
    });
  }
  for (let i = 1; i <= 4; i++) {
    SEATS.push({
      id: `V${String(i).padStart(2, "0")}`,
      zone: "VIP Booth",
      vip: true,
    });
  }
  for (let i = 1; i <= 4; i++) {
    SEATS.push({
      id: `C${String(i).padStart(2, "0")}`,
      zone: "Console Lounge",
      vip: false,
    });
  }

  const busy = new Set(["A03", "A07", "A12", "A15", "V02", "C01"]);
  const state = {
    seat: null,
    zone: "Main Floor",
    time: "18:00",
    hours: "2",
  };

  const form = document.getElementById("bookForm");
  const note = document.getElementById("formNote");
  const zoneSelect = document.getElementById("zoneSelect");
  const seatInput = document.getElementById("seatInput");
  const timeInput = document.getElementById("timeInput");
  const hoursSelect = document.getElementById("hoursSelect");
  const dateInput = form.querySelector('[name="date"]');
  const burger = document.querySelector(".burger");
  const mobileNav = document.querySelector(".mobile-nav");
  const seatMap = document.getElementById("seatMap");
  const timeSlots = document.getElementById("timeSlots");
  const mapPicked = document.getElementById("mapPicked");
  const freeLive = document.getElementById("freeLive");
  const onlineNow = document.getElementById("onlineNow");
  const bookSummary = document.getElementById("bookSummary");
  const calcHours = document.getElementById("calcHours");

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  dateInput.min = new Date().toISOString().slice(0, 10);
  dateInput.value = tomorrow.toISOString().slice(0, 10);

  function priceFor() {
    if (state.hours === "night" || state.zone === "Night Raid") return PRICES["Night Raid"];
    const base = PRICES[state.zone] || 180;
    return base * Number(state.hours || 1);
  }

  function formatMoney(n) {
    return `${n.toLocaleString("ru-RU")} ₽`;
  }

  function updateFree() {
    const free = SEATS.filter((s) => !busy.has(s.id)).length;
    if (freeLive) freeLive.textContent = String(free);
  }

  function syncCalc() {
    document.getElementById("calcSeat").textContent = state.seat || "—";
    document.getElementById("calcZone").textContent = state.zone || "—";
    document.getElementById("calcTime").textContent = state.time || "—";
    document.getElementById("calcTotal").textContent = formatMoney(priceFor());
    document.getElementById("formTotal").textContent = formatMoney(priceFor());
    if (seatInput) seatInput.value = state.seat || "";
    if (zoneSelect && state.zone !== "Night Raid") zoneSelect.value = state.zone;
    if (timeInput) timeInput.value = state.time;
    if (hoursSelect) hoursSelect.value = state.hours;
    if (calcHours) calcHours.value = state.hours;
    if (mapPicked) {
      mapPicked.textContent = state.seat
        ? `Выбрано: ${state.seat} · ${state.zone}`
        : "Место не выбрано";
    }
    if (bookSummary) {
      bookSummary.innerHTML = state.seat
        ? `<strong>${state.seat}</strong> · ${state.zone} · ${state.time} · ${
            state.hours === "night" ? "ночь" : state.hours + " ч"
          } · <strong>${formatMoney(priceFor())}</strong>`
        : "Пока без выбора места — можно указать зону вручную или кликнуть на схеме выше.";
    }
  }

  function selectSeat(id) {
    const seat = SEATS.find((s) => s.id === id);
    if (!seat || busy.has(id)) return;
    state.seat = id;
    state.zone = seat.zone;
    seatMap.querySelectorAll(".seat").forEach((el) => {
      el.classList.toggle("selected", el.dataset.id === id);
      el.setAttribute("aria-selected", el.dataset.id === id ? "true" : "false");
    });
    syncCalc();
  }

  function paintSeats() {
    seatMap.innerHTML = "";
    SEATS.forEach((s) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = `seat ${busy.has(s.id) ? "busy" : "free"}${s.vip ? " vip" : ""}${
        state.seat === s.id ? " selected" : ""
      }`;
      btn.textContent = s.id;
      btn.dataset.id = s.id;
      btn.setAttribute("role", "option");
      btn.setAttribute("aria-selected", state.seat === s.id ? "true" : "false");
      if (busy.has(s.id)) btn.disabled = true;
      else btn.addEventListener("click", () => selectSeat(s.id));
      seatMap.appendChild(btn);
    });
    updateFree();
  }

  function paintSlots() {
    const hours = [];
    for (let h = 12; h <= 23; h++) hours.push(`${String(h).padStart(2, "0")}:00`);
    hours.push("00:00", "02:00", "04:00");
    timeSlots.innerHTML = "";
    hours.forEach((t, i) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = `slot${t === state.time ? " is-active" : ""}`;
      btn.textContent = t;
      btn.setAttribute("role", "option");
      if (i % 7 === 3) btn.disabled = true;
      btn.addEventListener("click", () => {
        if (btn.disabled) return;
        state.time = t;
        timeSlots.querySelectorAll(".slot").forEach((el) => el.classList.remove("is-active"));
        btn.classList.add("is-active");
        syncCalc();
      });
      timeSlots.appendChild(btn);
    });
  }

  function setGear(key) {
    const data = GEAR[key];
    if (!data) return;
    document.querySelectorAll(".gear-tab").forEach((tab) => {
      const on = tab.dataset.gear === key;
      tab.classList.toggle("is-active", on);
      tab.setAttribute("aria-selected", on ? "true" : "false");
    });
    document.getElementById("gearTitle").textContent = data.title;
    document.getElementById("gearImg").src = data.img;
    document.getElementById("gearImg").alt = data.title;
    const list = document.getElementById("gearList");
    list.innerHTML = data.specs
      .map(([k, v]) => `<div><dt>${k}</dt><dd>${v}</dd></div>`)
      .join("");
    const book = document.getElementById("gearBook");
    book.dataset.zone = data.zone;
    book.setAttribute("href", "#book");
  }

  paintSeats();
  paintSlots();
  setGear("main");
  syncCalc();

  document.querySelectorAll(".gear-tab").forEach((tab) => {
    tab.addEventListener("click", () => setGear(tab.dataset.gear));
  });

  calcHours?.addEventListener("change", () => {
    state.hours = calcHours.value;
    if (calcHours.value === "night") state.zone = "Night Raid";
    syncCalc();
  });

  hoursSelect?.addEventListener("change", () => {
    state.hours = hoursSelect.value;
    if (hoursSelect.value === "night") state.zone = "Night Raid";
    syncCalc();
  });

  zoneSelect?.addEventListener("change", () => {
    state.zone = zoneSelect.value;
    syncCalc();
  });

  timeInput?.addEventListener("change", () => {
    state.time = timeInput.value;
    syncCalc();
  });

  document.querySelectorAll("[data-zone]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const zone = btn.getAttribute("data-zone");
      if (!zone) return;
      state.zone = zone;
      if (zone === "Night Raid") state.hours = "night";
      syncCalc();
    });
  });

  document.getElementById("toBook")?.addEventListener("click", () => syncCalc());

  /* live occupancy simulation */
  setInterval(() => {
    const id = SEATS[Math.floor(Math.random() * SEATS.length)].id;
    if (busy.has(id)) busy.delete(id);
    else if (busy.size < 10) busy.add(id);
    if (state.seat && busy.has(state.seat)) {
      state.seat = null;
    }
    paintSeats();
    syncCalc();
    if (onlineNow) {
      const n = 28 + Math.floor(Math.random() * 25);
      onlineNow.textContent = String(n);
    }
  }, 8000);

  /* lightbox */
  const lightbox = document.getElementById("lightbox");
  const lightboxImg = lightbox.querySelector("img");
  document.querySelectorAll("[data-lightbox]").forEach((fig) => {
    fig.addEventListener("click", () => {
      const img = fig.querySelector("img");
      lightboxImg.src = img.src.replace("w=800", "w=1600").replace("w=1400", "w=1800");
      lightboxImg.alt = img.alt;
      lightbox.hidden = false;
      document.body.style.overflow = "hidden";
    });
  });
  lightbox.querySelector(".lightbox-close").addEventListener("click", () => {
    lightbox.hidden = true;
    document.body.style.overflow = "";
  });
  lightbox.addEventListener("click", (e) => {
    if (e.target === lightbox) {
      lightbox.hidden = true;
      document.body.style.overflow = "";
    }
  });

  /* mobile nav */
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

  /* form */
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
      `Место: ${data.get("seat") || "любое"}`,
      `Дата: ${data.get("date")} ${data.get("time")}`,
      `Часов: ${data.get("hours")}`,
      `Сумма: ${formatMoney(priceFor())}`,
    ].join("\n");
    note.textContent = "Открываю Telegram для подтверждения…";
    window.open(`https://t.me/life_slow?text=${encodeURIComponent(text)}`, "_blank", "noopener");
  });

  /* custom cursor */
  const cursor = document.querySelector(".cursor");
  const cursorDot = document.querySelector(".cursor-dot");
  if (window.matchMedia("(pointer: fine)").matches) {
    cursor.classList.add("is-on");
    cursorDot.classList.add("is-on");
    window.addEventListener("pointermove", (e) => {
      cursor.style.transform = `translate(${e.clientX}px, ${e.clientY}px) translate(-50%, -50%)`;
      cursorDot.style.transform = `translate(${e.clientX}px, ${e.clientY}px) translate(-50%, -50%)`;
    });
    document.querySelectorAll("a, button, .seat, .slot, [data-lightbox]").forEach((el) => {
      el.addEventListener("pointerenter", () => cursor.classList.add("is-hover"));
      el.addEventListener("pointerleave", () => cursor.classList.remove("is-hover"));
    });
  }

  /* Lenis + GSAP */
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (!reduce && window.Lenis) {
    const lenis = new Lenis({ duration: 1.1, smoothWheel: true });
    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);
    document.querySelectorAll('a[href^="#"]').forEach((a) => {
      a.addEventListener("click", (e) => {
        const id = a.getAttribute("href");
        if (!id || id === "#") return;
        const el = document.querySelector(id);
        if (!el) return;
        e.preventDefault();
        lenis.scrollTo(el, { offset: -72 });
      });
    });
  }

  if (!reduce && window.gsap && window.ScrollTrigger) {
    gsap.registerPlugin(ScrollTrigger);

    gsap.from(".hero-inner > *", {
      y: 36,
      opacity: 0,
      duration: 0.9,
      stagger: 0.1,
      ease: "power3.out",
    });

    gsap.utils.toArray(".reveal").forEach((el) => {
      gsap.to(el, {
        scrollTrigger: { trigger: el, start: "top 88%" },
        y: 0,
        opacity: 1,
        duration: 0.75,
        ease: "power3.out",
      });
    });

    document.querySelectorAll("[data-count]").forEach((el) => {
      const target = Number(el.dataset.count);
      const prefix = el.dataset.prefix || "";
      const suffix = el.dataset.suffix || "";
      const obj = { n: 0 };
      ScrollTrigger.create({
        trigger: el,
        start: "top 90%",
        once: true,
        onEnter: () => {
          gsap.to(obj, {
            n: target,
            duration: 1.4,
            ease: "power2.out",
            onUpdate: () => {
              el.textContent = `${prefix}${Math.round(obj.n)}${suffix}`;
            },
          });
        },
      });
    });

    const media = document.querySelector("[data-parallax] img");
    if (media) {
      gsap.to(media, {
        yPercent: 12,
        ease: "none",
        scrollTrigger: {
          trigger: ".hero",
          start: "top top",
          end: "bottom top",
          scrub: true,
        },
      });
    }

    document.querySelectorAll(".magnetic").forEach((btn) => {
      btn.addEventListener("pointermove", (e) => {
        const r = btn.getBoundingClientRect();
        const x = e.clientX - r.left - r.width / 2;
        const y = e.clientY - r.top - r.height / 2;
        gsap.to(btn, { x: x * 0.18, y: y * 0.18, duration: 0.3 });
      });
      btn.addEventListener("pointerleave", () => {
        gsap.to(btn, { x: 0, y: 0, duration: 0.45, ease: "power3.out" });
      });
    });
  } else {
    document.querySelectorAll(".reveal").forEach((el) => {
      el.style.opacity = "1";
      el.style.transform = "none";
    });
    document.querySelectorAll("[data-count]").forEach((el) => {
      el.textContent = `${el.dataset.prefix || ""}${el.dataset.count}${el.dataset.suffix || ""}`;
    });
  }
})();
