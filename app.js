const cfg = window.MOCHI_CONFIG;

function $(id){ return document.getElementById(id); }

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
  const host = $(containerId);
  if(!host) return;
  host.innerHTML = items.map(it => `
    <div class="card feature">
      <div class="icon">${it.icon}</div>
      <div class="title">${it.title}</div>
      <div class="text">${it.text}</div>
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

  setButtonLink($("btnApplyForm"), cfg.links?.applyForm);
  $("btnApplyJump")?.addEventListener("click", () => scrollToId("#apply"));
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

  // 有 FiveM Server ID 就抓官方 API
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
      safeText($("svStatus"), "讀取失敗");
      safeText($("svPlayers"), "讀取失敗");
      safeText($("svHint"), "麻糬說 我抓不到伺服器人數");
      return;
    }
  }

  // 沒有 server id 但有 IP
  if(connectAddr){
    safeText($("svStatus"), "開放中");
    safeText($("svPlayers"), "IP 直連");
    safeText($("svHint"), "麻糬說 可以直接進城玩");
    return;
  }

  // 真的什麼都沒有
  safeText($("svStatus"), "未設定");
  safeText($("svPlayers"), "未設定");
  safeText($("svHint"), "麻糬說 還沒設定伺服器資訊");
}



async function fetchDiscordMembers(){
  const guildId = cfg.links?.discordGuildId;
  if(!guildId){
    safeText($("dcMembers"), "未設定");
    return;
  }

  const url = `https://discord.com/api/guilds/${encodeURIComponent(guildId)}/widget.json`;

  try{
    const res = await fetch(url, { cache:"no-store" });
    if(!res.ok) throw new Error(`http ${res.status}`);
    const data = await res.json();

    const count = data?.presence_count;
    if(typeof count !== "number"){
      safeText($("dcMembers"), "讀取失敗");
      safeText($("dcHint"), "麻糬說 需要在 Discord 開啟 Server Widget");
      return;
    }

    safeText($("dcMembers"), `${count} 線上`);
    safeText($("dcHint"), "麻糬說 也可以點加入和大家聊天");

  }catch(e){
    safeText($("dcMembers"), "讀取失敗");
    safeText($("dcHint"), "麻糬說 可能沒開 Server Widget 或被跨網域限制");
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
const HOME_SECTIONS = ["about", "calendar", "album"];

// 導覽分頁區塊
const PAGE_SECTIONS = ["jobs", "life", "industry", "crime", "apply"];

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
