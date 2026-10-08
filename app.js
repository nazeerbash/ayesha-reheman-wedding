document.documentElement.classList.add("js");

const config = window.WEDDING_CONFIG;
const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
const $ = (selector, scope = document) => scope.querySelector(selector);
const $$ = (selector, scope = document) => [...scope.querySelectorAll(selector)];

function applyConfig() {
  document.title = `${config.couple.display} — The Moonlit Courtyard`;
  const absoluteImage = new URL(config.ogImagePath, config.deploymentUrl).href;
  $('meta[property="og:url"]').content = config.deploymentUrl;
  $('meta[property="og:image"]').content = absoluteImage;
  $("#schedule-list").innerHTML = config.schedule.map(item => `<li><span>${item.label}</span><time>${item.time}</time></li>`).join("");
  const personal = config.personalization || {};
  $("#host-line").textContent = personal.hostLine || "Together with our families";
  const familyItems = [
    personal.brideFamily && `<div><span>Ayesha's family</span><strong>${personal.brideFamily}</strong></div>`,
    personal.groomFamily && `<div><span>Reheman's family</span><strong>${personal.groomFamily}</strong></div>`
  ].filter(Boolean);
  const guidanceItems = [
    personal.dressGuidance && `<p><span>Dress guidance</span>${personal.dressGuidance}</p>`,
    personal.contactPhone && `<p><span>Guest contact</span>${personal.contactName ? `${personal.contactName} · ` : ""}<a href="tel:${personal.contactPhone.replace(/[^+\d]/g, "")}">${personal.contactPhone}</a></p>`
  ].filter(Boolean);
  if (familyItems.length || guidanceItems.length) {
    $("#personal-details").hidden = false;
    $("#family-details").innerHTML = familyItems.join("");
    $("#guest-guidance").innerHTML = guidanceItems.join("");
  }
  $("#gallery").innerHTML = config.gallery.map((image, index) => `<figure><button type="button" data-index="${index}" aria-label="Open image ${index + 1} of ${config.gallery.length}: ${image.caption}"><img src="${image.src}" alt="${image.alt}" loading="lazy" decoding="async" width="1200" height="1500"></button><figcaption>${image.caption}</figcaption></figure>`).join("");
}

function initEntrance() {
  const cover = $("#cover");
  const button = $("#enter-button");
  const audio = $("#wedding-audio");
  const sound = $("#sound-control");
  fetch(config.audioPath, { method: "HEAD" }).then(response => {
    if (!response.ok) throw new Error("Audio unavailable");
    audio.src = config.audioPath;
  }).catch(() => { sound.hidden = true; sound.setAttribute("aria-label", "Background music unavailable"); });
  audio.addEventListener("canplay", () => { sound.hidden = false; }, { once: true });
  audio.addEventListener("error", () => { sound.hidden = true; sound.setAttribute("aria-label", "Background music unavailable"); });
  const setSound = playing => {
    sound.setAttribute("aria-pressed", String(playing));
    sound.setAttribute("aria-label", playing ? "Mute background music" : "Play background music");
  };
  async function tryPlay() { try { await audio.play(); sound.hidden = false; setSound(true); } catch { setSound(false); } }
  button.addEventListener("click", () => {
    cover.classList.add("is-open");
    document.body.classList.remove("is-covered");
    tryPlay();
    setTimeout(() => { cover.classList.add("is-gone"); $("#main").focus?.(); }, reducedMotion ? 30 : 1200);
  });
  sound.addEventListener("click", async () => {
    if (audio.paused) await tryPlay(); else { audio.pause(); setSound(false); }
  });
}

function initCountdown() {
  const target = new Date(config.event.start).getTime();
  const units = { days: 86400000, hours: 3600000, minutes: 60000, seconds: 1000 };
  const update = () => {
    let delta = Math.max(0, target - Date.now());
    Object.entries(units).forEach(([name, size]) => { const value = Math.floor(delta / size); $(`[data-unit="${name}"]`).textContent = String(value).padStart(2, "0"); delta %= size; });
    if (target <= Date.now()) $("#countdown-title").textContent = "Today is the day";
  };
  update(); setInterval(update, 1000);
}

function initGallery() {
  const dialog = $("#lightbox"), image = $("img", dialog), caption = $("#lightbox-caption"), close = $(".lightbox__close", dialog);
  let activeIndex = 0, opener = null;
  const show = index => {
    activeIndex = (index + config.gallery.length) % config.gallery.length;
    const item = config.gallery[activeIndex];
    image.src = item.src; image.alt = item.alt;
    caption.textContent = `${item.caption} — ${activeIndex + 1} of ${config.gallery.length}`;
  };
  $("#gallery").addEventListener("click", event => {
    const button = event.target.closest("button"); if (!button) return;
    opener = button; show(Number(button.dataset.index)); dialog.showModal(); document.body.classList.add("lightbox-open");
  });
  $(".lightbox__nav--prev").addEventListener("click", () => show(activeIndex - 1));
  $(".lightbox__nav--next").addEventListener("click", () => show(activeIndex + 1));
  const closeDialog = () => dialog.close();
  close.addEventListener("click", closeDialog);
  dialog.addEventListener("click", event => { if (event.target === dialog) dialog.close(); });
  dialog.addEventListener("keydown", event => { if (event.key === "ArrowLeft") show(activeIndex - 1); if (event.key === "ArrowRight") show(activeIndex + 1); });
  dialog.addEventListener("close", () => { document.body.classList.remove("lightbox-open"); opener?.focus(); });
}

function escapeICS(value) { return value.replace(/[\\,;]/g, "\\$&").replace(/\n/g, "\\n"); }
function toICSDate(iso) { return new Date(iso).toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, ""); }
function initCalendar() {
  $("#calendar-button").addEventListener("click", () => {
    const lines = ["BEGIN:VCALENDAR","VERSION:2.0","PRODID:-//Ayesha and Reheman//Wedding//EN","CALSCALE:GREGORIAN","BEGIN:VEVENT",`UID:ayesha-reheman-20261220@moonlit-courtyard`,`DTSTAMP:${toICSDate(new Date().toISOString())}`,`DTSTART:${toICSDate(config.event.start)}`,`DTEND:${toICSDate(config.event.end)}`,`SUMMARY:${escapeICS(config.event.title)}`,`LOCATION:${escapeICS(config.event.city)}`,`DESCRIPTION:${escapeICS(`${config.couple.display} — ${config.event.venue}`)}`,"END:VEVENT","END:VCALENDAR"];
    const url = URL.createObjectURL(new Blob([lines.join("\r\n")], { type: "text/calendar;charset=utf-8" }));
    const link = Object.assign(document.createElement("a"), { href: url, download: "ayesha-reheman-wedding.ics" }); link.click(); setTimeout(() => URL.revokeObjectURL(url), 1000);
  });
}

const rsvpAdapter = {
  async submit(payload) {
    // Replace this demo adapter with a Supabase anon-key client call. Never use a service-role key in browser code.
    return { ok: true, demo: true, payload };
  }
};
window.rsvpAdapter = rsvpAdapter;

function initRSVP() {
  const form = $("#rsvp-form"), status = $("#form-status");
  form.addEventListener("submit", async event => {
    event.preventDefault(); $$(".error", form).forEach(el => el.textContent = ""); $$("[aria-invalid=true]", form).forEach(el => el.removeAttribute("aria-invalid")); status.textContent = ""; status.className = "form-status";
    const data = Object.fromEntries(new FormData(form)); let valid = true;
    if (!data.guestName?.trim()) { $("#guest-name-error").textContent = "Please enter your name."; $("#guest-name").setAttribute("aria-invalid", "true"); valid = false; }
    if (!data.attendance) { $("#attendance-error").textContent = "Please choose an attendance option."; $$("input[name=attendance]").forEach(el => el.setAttribute("aria-invalid", "true")); valid = false; }
    const count = Number(data.guestCount); if (!Number.isInteger(count) || count < 1 || count > 10) { $("#guest-count-error").textContent = "Enter a number from 1 to 10."; $("#guest-count").setAttribute("aria-invalid", "true"); valid = false; }
    if (!valid) { const first = $(".error:not(:empty)", form); first?.previousElementSibling?.focus?.(); return; }
    await rsvpAdapter.submit({ ...data, guestCount: count });
    status.className = "form-status success"; status.innerHTML = "<strong>Thank you — your response is saved in this demo only.</strong><br>It has not been sent to Ayesha and Reheman. Connect the Supabase adapter before publishing RSVP collection."; status.focus();
  });
}

function initMotion() {
  $$(".reveal").forEach(el => { el.style.opacity = 1; el.style.transform = "none"; });
  if (reducedMotion) return;
  let ticking = false;
  addEventListener("scroll", () => {
    if (ticking || scrollY > innerHeight * 1.2) return;
    ticking = true;
    requestAnimationFrame(() => { $$(".depth-layer").forEach(el => { el.style.transform = `translate3d(0, ${scrollY * Number(el.dataset.depth)}px, 0)`; }); ticking = false; });
  }, { passive: true });
}

applyConfig(); initEntrance(); initCountdown(); initGallery(); initCalendar(); initRSVP(); initMotion();
