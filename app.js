const cfg = window.MOCHI_CONFIG;

function $(id){ return document.getElementById(id); }

function getTaiwanNow() {
  const now = new Date();
  const utc = now.getTime() + now.getTimezoneOffset() * 60000;
  return new Date(utc + 8 * 60 * 60 * 1000);
}

function isServerOpenNow() {
  const t = getTaiwanNow();
  const h = t.getHours();
  return h >= 15 || h < 6;
}

function getCountdownToOpen() {
  const now = getTaiwanNow();
  const openTime = new Date(now);

  if (now.getHours() < 15) {
    // 今天 15:00
    openTime.setHours(15, 0, 0, 0);
  } else {
    // 明天 15:00
    openTime.setDate(openTime.getDate() + 1);
    openTime.setHours(15, 0, 0, 0);
  }

  const diff = openTime - now;
  if (diff <= 0) return null;

  const totalMinutes = Math.floor(diff / 60000);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  return { hours, minutes };
}


function safeText(el, text){
  if(!el) return;
  el.textContent = text ?? "";
}

function setButtonLink(btn, url){
  if(!btn) return;
  btn.addEventListener("click", () => {
    if(!url) return;
    window.open(url, "_blank", "noopener,noreferrer");
  });
}

function scrollToId(id){
  const el = document.querySelector(id);
  if(!el) return;
  el.scrollIntoView({ behavior:"smooth", block:"start" });
}

function renderCards(containerId, items){
  const host = document.getElementById(containerId);
  if(!host) return;

  host.innerHTML = items.map(it => `
    <div class="card feature">
      <div class="icon">${it.icon}</div>

      <div class="content">
        <div class="title">${it.title}</div>
        <div class="text">${it.text}</div>

        ${it.meta ? `<div class="meta"><span class="meta-icon">⏰</span>${it.meta}</div>` : ""}
      </div>
    </div>
  `).join("");
}


function renderPills(containerId, items){
  const host = $(containerId);
  if(!host) return;
  host.innerHTML = items.map(x => `<span class="pill">${x}</span>`).join("");
}

function renderChecklist(containerId, items){
  const host = $(containerId);
  if(!host) return;
  host.innerHTML = items.map(x => `<li>${x}</li>`).join("");
}

function renderMiniCards(containerId, items){
  const host = $(containerId);
  if(!host) return;
  host.innerHTML = items.map(it => `
    <div class="mini-card">
      <div class="t">${it.title}</div>
      <div class="d">${it.desc}</div>
    </div>
  `).join("");
}

function renderEvents(containerId, events){
  const host = $(containerId);
  if(!host) return;

  if(!events || events.length === 0){
    host.innerHTML = `<div class="muted">目前還沒有排程 麻糬正在寫小本本</div>`;
    return;
  }

  host.innerHTML = events.map(ev => `
    <div class="event">
      <div class="date">${escapeHtml(ev.date)}</div>
      <div>
        <div class="name">${escapeHtml(ev.name)}</div>
        <div class="meta">${escapeHtml(ev.meta || "")}</div>
      </div>
    </div>
  `).join("");
}

function renderAlbum(containerId, photos){
  const host = $(containerId);
  if(!host) return;

  if(!photos || photos.length === 0){
    host.innerHTML = `<div class="muted">相簿還沒有照片 麻糬先把相機擦亮亮</div>`;
    return;
  }

  host.innerHTML = photos.map(p => `
    <div class="album-item">
      <img src="${p.src}" alt="活動照片">
      <div class="album-cap">${escapeHtml(p.caption || "")}</div>
    </div>
  `).join("");
}

function escapeHtml(str){
  return String(str ?? "")
    .replaceAll("&","&amp;")
    .replaceAll("<","&lt;")
    .replaceAll(">","&gt;")
    .replaceAll('"',"&quot;")
    .replaceAll("'","&#039;");
}

function setRandomMochiLine(){
  const lines = cfg.mochiLines || [];
  if(lines.length === 0) return;
  const pick = lines[Math.floor(Math.random() * lines.length)];
  safeText($("mochiLine"), pick);
}

function setBasics(){
  safeText($("siteName"), cfg.siteName);
  safeText($("siteTagline"), cfg.tagline);
  safeText($("heroTitle"), cfg.siteName);
  safeText($("heroTitle2"), cfg.heroTitle2);
  safeText($("heroDesc"), cfg.heroDesc);
  safeText($("crimeNote"), cfg.crimeNote);
  

  renderCards("aboutCards", cfg.aboutCards);
  renderCards("jobCards", cfg.jobs);
  renderCards("lifeCards", cfg.life);
  renderCards("industryCards", cfg.industry);
  renderCards("crimeCards", cfg.crime);
  renderCards("featureCards", cfg.features);

  renderEvents("calendarList", cfg.events);
  renderCards("rhythmCards", cfg.rhythm);

  renderAlbum("albumGrid", cfg.album);

  renderPills("applyJobs", cfg.applyJobs);
  renderChecklist("applyReq", cfg.applyRequirements);
  renderMiniCards("policyCards", cfg.policy);

  safeText($("footerTitle"), cfg.siteName);
  safeText($("footerSub"), "麻糬陪你慢慢生活 慢慢賺錢 慢慢交朋友");

  setRandomMochiLine();
  setInterval(setRandomMochiLine, 12000);

  const dc = cfg.links?.discordInvite;
  setButtonLink($("btnDiscord"), dc);
  setButtonLink($("btnDiscord2"), dc);
  setButtonLink($("btnApplyDiscord"), cfg.links?.applyDiscordChannel || dc);
  setButtonLink($("btnSponsor"), cfg.links?.sponsorPage);

  setButtonLink($("btnApplyForm"), cfg.links?.applyForm);
  $("btnScrollFAQ")?.addEventListener("click", () => scrollToId("#about"));
  $("btnScrollCalendar")?.addEventListener("click", () => scrollToId("#calendar"));
  $("btnScrollCalendar")?.addEventListener("click", () => scrollToId("#calendar"));

  $("btnScrollCalendar")?.addEventListener("click", () => scrollToId("#calendar"));

  $("btnScrollCalendar")?.addEventListener("click", () => scrollToId("#calendar"));

  // 一鍵連線
  const connectAddr = cfg.links?.connectAddress;
  const connectUrl = connectAddr ? `fivem://connect/${connectAddr}` : null;
  const connectBtns = ["btnConnect","btnConnect2","btnConnect3"];
  connectBtns.forEach(id => {
    const b = $(id);
    if(!b) return;
    b.addEventListener("click", () => {
      if(!connectUrl){
        alert("尚未設定 connectAddress");
        return;
      }
      window.location.href = connectUrl;
    });
  });
}

async function fetchFiveMStatus(){
  const serverId = cfg.links?.cfxJoinCode;
  const connectAddr = cfg.links?.connectAddress;
  const isOpen = isServerOpenNow();

  // 🔴 休息時段 → 顯示倒數
  if(!isOpen){
    safeText($("svStatus"), "休息中");
    safeText($("svPlayers"), "未開放");

    const cd = getCountdownToOpen();
    if(cd){
      safeText(
        $("svHint"),
        `麻糬說 距離開城還有 ${cd.hours} 小時 ${cd.minutes} 分鐘`
      );
    }else{
      safeText($("svHint"), "麻糬說 城市正在休息");
    }
    return;
  }

  // 🟢 開放時段，有 FiveM Server ID → 抓人數
  if(serverId){
    const url = `https://servers-frontend.fivem.net/api/servers/single/${encodeURIComponent(serverId)}`;

    try{
      const res = await fetch(url, { cache:"no-store" });
      if(!res.ok) throw new Error(`http ${res.status}`);
      const data = await res.json();

      const sv = data?.Data;
      if(!sv) throw new Error("no data");

      const online = sv.clients ?? 0;
      const max = sv.sv_maxclients ?? sv.vars?.sv_maxclients ?? "?";

      safeText($("svStatus"), "開放中");
      safeText($("svPlayers"), `${online} / ${max}`);

      const hint =
        online >= 40 ? "麻糬說 城裡好熱鬧" :
        online >= 15 ? "麻糬說 現在很舒服" :
        online > 0 ? "麻糬說 有人在城裡散步" :
        "麻糬說 城裡很安靜 也許適合新手";
      safeText($("svHint"), hint);

      return;

    }catch(e){
      safeText($("svStatus"), "開放中");
      safeText($("svPlayers"), "讀取失敗");
      safeText($("svHint"), "麻糬說 我抓不到人數 但城市有開");
      return;
    }
  }

  // 🟢 開放時段但沒 Server ID
  if(connectAddr){
    safeText($("svStatus"), "開放中");
    safeText($("svPlayers"), "IP 直連");
    safeText($("svHint"), "麻糬說 可以直接進城玩");
    return;
  }

  safeText($("svStatus"), "未設定");
  safeText($("svPlayers"), "未設定");
  safeText($("svHint"), "麻糬說 還沒設定伺服器資訊");
}





async function fetchDiscordMembers(){
  const invite = cfg.links?.discordInvite;
  if(!invite){
    safeText($("dcMembers"), "未設定");
    safeText($("dcHint"), "麻糬說 還沒設定 Discord 邀請");
    return;
  }

  // 從邀請連結取 code
  const code = invite.split("/").pop();

  const url = `https://discord.com/api/v10/invites/${encodeURIComponent(code)}?with_counts=true`;

  try{
    const res = await fetch(url, { cache:"no-store" });
    if(!res.ok) throw new Error(`http ${res.status}`);
    const data = await res.json();

    const approx =
      data.approximate_member_count ??
      data.approximate_presence_count;

    safeText($("dcMembers"), "已開放加入");

    if(typeof approx === "number"){
      safeText($("dcHint"), `目前有 ${approx.toLocaleString()} 位成員`);
    }else{
      safeText($("dcHint"), "麻糬說 城裡的人都在 Discord 聊天");
    }

  }catch(e){
    safeText($("dcMembers"), "已開放加入");
    safeText($("dcHint"), "麻糬說 城裡的人都在 Discord 聊天");
  }
}


function startAutoRefresh(){
  fetchFiveMStatus();
  fetchDiscordMembers();

  setInterval(fetchFiveMStatus, 30000);
  setInterval(fetchDiscordMembers, 60000);
}

setBasics();
startAutoRefresh();

// ===== 分頁顯示控制（最終穩定版）=====

// 首頁會顯示的區塊
const HOME_SECTIONS = ["about", "calendar", "video", "album"];

// 導覽分頁區塊
const PAGE_SECTIONS = ["jobs", "life", "industry", "crime", "features"];

// 進入首頁模式
function showHome() {
  // 顯示首頁區塊
  HOME_SECTIONS.forEach(id => {
    const el = document.getElementById(id);
    if (el) el.style.display = "block";
  });

  // 隱藏分頁區塊
  PAGE_SECTIONS.forEach(id => {
    const el = document.getElementById(id);
    if (el) el.style.display = "none";
  });

  window.scrollTo({ top: 0, behavior: "smooth" });
}

// 顯示指定分頁
function showPage(id) {
  // 隱藏首頁區塊
  HOME_SECTIONS.forEach(sec => {
    const el = document.getElementById(sec);
    if (el) el.style.display = "none";
  });

  // 隱藏其他分頁
  PAGE_SECTIONS.forEach(sec => {
    const el = document.getElementById(sec);
    if (el) el.style.display = "none";
  });

  // 顯示目標分頁
  const target = document.getElementById(id);
  if (target) target.style.display = "block";

  window.scrollTo({ top: 0, behavior: "smooth" });
}

// 導覽點擊
document.querySelectorAll("[data-target]").forEach(link => {
  link.addEventListener("click", e => {
    e.preventDefault();
    showPage(link.dataset.target);
  });
});

// 點 Logo 回首頁
document.querySelector(".brand")?.addEventListener("click", e => {
  e.preventDefault();
  showHome();
});

// ⭐ 關鍵：頁面載入完成後，強制進首頁模式
document.addEventListener("DOMContentLoaded", () => {
  showHome();
});
