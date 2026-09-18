(() => {
  const STATIONS = [
    { id: "A01", type: "std" },
    { id: "A02", type: "std" },
    { id: "A03", type: "std" },
    { id: "A04", type: "std" },
    { id: "A05", type: "std" },
    { id: "A06", type: "std" },
    { id: "B01", type: "std" },
    { id: "B02", type: "std" },
    { id: "B03", type: "std" },
    { id: "B04", type: "std" },
    { id: "B05", type: "std" },
    { id: "B06", type: "std" },
    { id: "C01", type: "vip" },
    { id: "C02", type: "vip" },
    { id: "C03", type: "vip" },
    { id: "C04", type: "vip" },
    { id: "D01", type: "console" },
    { id: "D02", type: "console" },
    { id: "D03", type: "console" },
    { id: "D04", type: "std" },
    { id: "D05", type: "std" },
    { id: "D06", type: "std" },
    { id: "E01", type: "std" },
    { id: "E02", type: "std" },
  ];

  const busySeed = new Set(["A03", "A06", "B02", "B05", "C02", "D01"]);

  let selected = null;

  /* ——— Lenis smooth scroll (Context7 / darkroomengineering/lenis) ——— */
  const lenis = new Lenis({
    duration: 1.15,
    smoothWheel: true,
  });

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
      lenis.scrollTo(el, { offset: -64 });
    });
  });

  /* ——— Three.js particle field (Context7 / mrdoob/three.js) ——— */
  const canvas = document.getElementById("field");
  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: false,
    alpha: true,
    powerPreference: "high-performance",
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
  renderer.setSize(window.innerWidth, window.innerHeight);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(
    55,
    window.innerWidth / window.innerHeight,
    0.1,
    100
  );
  camera.position.z = 18;

  const count = 900;
  const positions = new Float32Array(count * 3);
  const speeds = new Float32Array(count);
  for (let i = 0; i < count; i++) {
    positions[i * 3] = (Math.random() - 0.5) * 40;
    positions[i * 3 + 1] = (Math.random() - 0.5) * 24;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 30;
    speeds[i] = 0.002 + Math.random() * 0.01;
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));

  const material = new THREE.PointsMaterial({
    color: 0xff3d00,
    size: 0.045,
    transparent: true,
    opacity: 0.55,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });

  const points = new THREE.Points(geometry, material);
  scene.add(points);

  const mintMat = new THREE.PointsMaterial({
    color: 0x3ddc97,
    size: 0.03,
    transparent: true,
    opacity: 0.35,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });
  const mintGeom = geometry.clone();
  const mintPoints = new THREE.Points(mintGeom, mintMat);
  mintPoints.rotation.z = 0.4;
  scene.add(mintPoints);

  let mx = 0;
  let my = 0;
  window.addEventListener("pointermove", (e) => {
    mx = (e.clientX / window.innerWidth - 0.5) * 2;
    my = (e.clientY / window.innerHeight - 0.5) * 2;
  });

  function animateField(t) {
    const pos = geometry.attributes.position.array;
    for (let i = 0; i < count; i++) {
      pos[i * 3 + 1] += speeds[i];
      if (pos[i * 3 + 1] > 12) pos[i * 3 + 1] = -12;
    }
    geometry.attributes.position.needsUpdate = true;
    points.rotation.y = t * 0.00008 + mx * 0.15;
    points.rotation.x = my * 0.08;
    mintPoints.rotation.y = -t * 0.00005 - mx * 0.1;
    camera.position.x += (mx * 1.2 - camera.position.x) * 0.04;
    camera.position.y += (-my * 0.8 - camera.position.y) * 0.04;
    camera.lookAt(0, 0, 0);
    renderer.render(scene, camera);
    requestAnimationFrame(animateField);
  }
  requestAnimationFrame(animateField);

  window.addEventListener("resize", () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });

  /* ——— Build boards ——— */
  const flaps = document.getElementById("flaps");
  const grid = document.getElementById("stationGrid");
  const ticker = document.getElementById("ticker");
  const freeCount = document.getElementById("freeCount");
  const stationInput = document.getElementById("stationInput");
  const pickedLabel = document.getElementById("pickedLabel");

  function isBusy(id) {
    return busySeed.has(id);
  }

  function updateFree() {
    const n = STATIONS.filter((s) => !isBusy(s.id)).length;
    freeCount.textContent = String(n).padStart(2, "0");
  }

  STATIONS.forEach((s) => {
    const busy = isBusy(s.id);
    const flap = document.createElement("div");
    flap.className = `flap ${busy ? "is-busy" : "is-free"}${s.type === "vip" ? " is-vip" : ""}`;
    flap.setAttribute("role", "listitem");
    flap.innerHTML = `<p class="flap-id">${s.id}</p><p class="flap-status">${busy ? "BUSY" : "FREE"}${s.type === "vip" ? " · VIP" : s.type === "console" ? " · CON" : ""}</p>`;
    flaps.appendChild(flap);

    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = `station ${busy ? "busy" : "free"}${s.type === "vip" ? " vip" : ""}`;
    btn.textContent = s.id;
    btn.setAttribute("role", "option");
    btn.setAttribute("aria-selected", "false");
    if (busy) {
      btn.disabled = true;
      btn.title = "Занято";
    } else {
      btn.addEventListener("click", () => selectStation(s.id));
    }
    grid.appendChild(btn);

    const li = document.createElement("li");
    li.innerHTML = `<span>${s.id}</span><span class="${busy ? "bad" : "ok"}">${busy ? "BUSY" : "OPEN"}</span>`;
    ticker.appendChild(li);
  });

  updateFree();

  function selectStation(id) {
    selected = id;
    stationInput.value = id;
    pickedLabel.textContent = `Выбрана станция ${id}`;
    grid.querySelectorAll(".station").forEach((el) => {
      const on = el.textContent === id;
      el.classList.toggle("selected", on);
      el.setAttribute("aria-selected", on ? "true" : "false");
    });
  }

  /* ——— Form ——— */
  const form = document.getElementById("bookForm");
  const formNote = document.getElementById("formNote");
  const dateInput = form.querySelector('[name="date"]');
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  dateInput.value = tomorrow.toISOString().slice(0, 10);
  dateInput.min = new Date().toISOString().slice(0, 10);

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    formNote.classList.remove("is-error");

    const data = new FormData(form);
    const name = String(data.get("name") || "").trim();
    const tg = String(data.get("tg") || "").trim();
    const station = String(data.get("station") || "").trim();

    if (!name || !tg) {
      formNote.textContent = "Заполни имя и Telegram.";
      formNote.classList.add("is-error");
      return;
    }
    if (!station) {
      formNote.textContent = "Выбери станцию на схеме зала.";
      formNote.classList.add("is-error");
      lenis.scrollTo("#floor", { offset: -64 });
      return;
    }

    const hours = data.get("hours");
    const text = [
      `RAID бронь`,
      `Имя: ${name}`,
      `TG: ${tg}`,
      `Дата: ${data.get("date")} ${data.get("time")}`,
      `Часов: ${hours}`,
      `Станция: ${station}`,
    ].join("\n");

    formNote.textContent = "Заявка собрана — открываю Telegram…";
    window.open(
      `https://t.me/life_slow?text=${encodeURIComponent(text)}`,
      "_blank",
      "noopener"
    );
  });

  /* ——— GSAP (Context7 / websites/gsap_v3) ——— */
  if (window.gsap && window.ScrollTrigger) {
    gsap.registerPlugin(ScrollTrigger);

    gsap.from(".hero-brand", {
      y: 80,
      opacity: 0,
      duration: 1.1,
      ease: "power3.out",
    });
    gsap.from(".hero h1, .lede, .hero-actions", {
      y: 40,
      opacity: 0,
      duration: 0.9,
      stagger: 0.12,
      delay: 0.15,
      ease: "power3.out",
    });
    gsap.from(".hero-board > *", {
      y: 30,
      opacity: 0,
      duration: 0.8,
      stagger: 0.08,
      delay: 0.35,
      ease: "power2.out",
    });

    gsap.from(".flap", {
      scrollTrigger: {
        trigger: ".flaps",
        start: "top 80%",
      },
      y: 24,
      opacity: 0,
      duration: 0.55,
      stagger: { each: 0.03, from: "start" },
      ease: "power2.out",
    });

    gsap.from(".station", {
      scrollTrigger: {
        trigger: ".station-grid",
        start: "top 78%",
      },
      scale: 0.6,
      opacity: 0,
      duration: 0.4,
      stagger: { each: 0.025, grid: [4, 6], from: "center" },
      ease: "back.out(1.4)",
    });

    gsap.from(".rate-row", {
      scrollTrigger: {
        trigger: ".rate-rows",
        start: "top 82%",
      },
      x: -40,
      opacity: 0,
      duration: 0.65,
      stagger: 0.1,
      ease: "power3.out",
    });

    gsap.from(".book-form", {
      scrollTrigger: {
        trigger: ".book",
        start: "top 75%",
      },
      y: 50,
      opacity: 0,
      duration: 0.9,
      ease: "power3.out",
    });
  }

  function paintStatus() {
    const flapNodes = flaps.querySelectorAll(".flap");
    const stationNodes = grid.querySelectorAll(".station");
    const tickNodes = ticker.querySelectorAll("li");

    STATIONS.forEach((s, i) => {
      const busy = isBusy(s.id);
      const flap = flapNodes[i];
      if (flap) {
        flap.classList.toggle("is-busy", busy);
        flap.classList.toggle("is-free", !busy);
        const st = flap.querySelector(".flap-status");
        if (st) {
          st.textContent = `${busy ? "BUSY" : "FREE"}${s.type === "vip" ? " · VIP" : s.type === "console" ? " · CON" : ""}`;
        }
      }

      const btn = stationNodes[i];
      if (btn) {
        btn.classList.toggle("busy", busy);
        btn.classList.toggle("free", !busy);
        btn.disabled = busy;
        if (busy && selected === s.id) {
          selected = null;
          stationInput.value = "";
          pickedLabel.textContent = "Станция не выбрана";
          btn.classList.remove("selected");
        }
        btn.classList.toggle("selected", selected === s.id);
      }

      const li = tickNodes[i];
      if (li) {
        li.innerHTML = `<span>${s.id}</span><span class="${busy ? "bad" : "ok"}">${busy ? "BUSY" : "OPEN"}</span>`;
      }
    });
    updateFree();
  }

  setInterval(() => {
    const id = STATIONS[Math.floor(Math.random() * STATIONS.length)].id;
    if (busySeed.has(id)) busySeed.delete(id);
    else if (busySeed.size < 8) busySeed.add(id);
    paintStatus();
  }, 9000);
})();
