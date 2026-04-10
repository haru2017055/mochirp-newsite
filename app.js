const cfg = window.MOCHI_CONFIG;

function $(id){ return document.getElementById(id); }

// --- 時間與狀態邏輯 ---
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
    openTime.setHours(15, 0, 0, 0);
  } else {
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

// --- 渲染工具 ---
function safeText(el, text){
  if(!el) return;
  el.textContent = text ?? "";
}

function escapeHtml(str){
  return String(str ?? "").replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;").replaceAll("'","&#039;");
}

function renderCards(containerId, items){
  const host = $(containerId);
  if(!host || !items) return;
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

function renderAlbum(containerId, photos){
  const host = $(containerId);
  if(!host) return;
  if(!photos || photos.length === 0){
    host.innerHTML = `<div class="muted">相簿還沒有照片 麻糬先把相機擦亮亮</div>`;
    return;
  }
  host.innerHTML = photos.map(p => `
    <div class="album-item">
      <img src="${p.src}" alt="活動照片" loading="lazy">
      <div class="album-cap">${escapeHtml(p.caption || "")}</div>
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

// --- 基礎資料初始化 ---
function setBasics(){
  safeText($("siteName"), cfg.siteName);
  safeText($("siteTagline"), cfg.tagline);
  safeText($("heroTitle"), cfg.siteName);
  safeText($("heroTitle2"), cfg.heroTitle2);
  safeText($("heroDesc"), cfg.heroDesc);

  // 渲染所有資料卡片
  renderCards("aboutCards", cfg.aboutCards);
  renderCards("jobCards", cfg.jobs);
  renderCards("lifeCards", cfg.life);
  renderCards("industryCards", cfg.industry);
  renderCards("crimeCards", cfg.crime);
  renderCards("featureCards", cfg.features);
  renderCards("organizationCards", cfg.organization);
  renderCards("gettingStartedCards", cfg.gettingStarted);
  renderCards("supportCards", cfg.support);
  renderCards("rhythmCards", cfg.rhythm);

  renderEvents("calendarList", cfg.events);
  renderAlbum("albumGrid", cfg.album);

  // 按鈕功能綁定
  const dc = cfg.links?.discordInvite;
  $("btnDiscord")?.onclick = () => window.open(dc, "_blank");
  $("btnSponsor")?.onclick = () => window.open(cfg.links?.sponsorPage, "_blank");

  // 一鍵連線
  const connectUrl = cfg.links?.connectAddress ? `fivem://connect/${cfg.links.connectAddress}` : null;
  ["btnConnect", "btnConnect2"].forEach(id => {
    const b = $(id);
    if(b) b.onclick = () => connectUrl ? window.location.href = connectUrl : alert("未設定連線地址");
  });
}

// --- 頁面顯示邏輯 (核心改動) ---
const PAGE_IDS = ["page-guide", "page-underworld", "page-album", "page-help"];

function showHome() {
  // 隱藏所有分頁組
  PAGE_IDS.forEach(id => { if($(id)) $(id).style.display = "none"; });
  // 顯示首頁內容
  if($("hero-section")) $("hero-section").style.display = "block";
  if($("page-home-content")) $("page-home-content").style.display = "block";
  
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function showPage(target) {
  // 隱藏首頁內容
  if($("hero-section")) $("hero-section").style.display = "none";
  if($("page-home-content")) $("page-home-content").style.display = "none";
  
  // 隱藏所有分頁組，並顯示目標組
  PAGE_IDS.forEach(id => {
    const el = $(id);
    if(el) el.style.display = (id === `page-${target}`) ? "block" : "none";
  });

  window.scrollTo({ top: 0, behavior: "smooth" });
}

// --- 狀態抓取 ---
async function fetchFiveMStatus(){
  const serverId = cfg.links?.cfxJoinCode;
  const isOpen = isServerOpenNow();
  if(!isOpen){
    safeText($("svStatus"), "休息中");
    safeText($("svPlayers"), "未開放");
    const cd = getCountdownToOpen();
    safeText($("svHint"), cd ? `麻糬說 距離開城還有 ${cd.hours} 小時 ${cd.minutes} 分鐘` : "休息中");
    return;
  }
  if(serverId){
    try {
      const res = await fetch(`https://servers-frontend.fivem.net/api/servers/single/${serverId}`);
      const data = await res.json();
      const online = data?.Data?.clients ?? 0;
      const max = data?.Data?.sv_maxclients ?? "?";
      safeText($("svStatus"), "開放中");
      safeText($("svPlayers"), `${online} / ${max}`);
      safeText($("svHint"), online > 0 ? "麻糬說 城裡有人在散步" : "麻糬說 城裡很安靜");
    } catch(e) {
      safeText($("svStatus"), "開放中");
      safeText($("svPlayers"), "讀取失敗");
    }
  }
}

async function fetchDiscordMembers(){
  const invite = cfg.links?.discordInvite;
  if(!invite) return;
  const code = invite.split("/").pop();
  try {
    const res = await fetch(`https://discord.com/api/v10/invites/${code}?with_counts=true`);
    const data = await res.json();
    safeText($("dcMembers"), "已開放加入");
    if(data.approximate_member_count) safeText($("dcHint"), `目前有 ${data.approximate_member_count.toLocaleString()} 位成員`);
  } catch(e) {}
}

// --- 初始化監聽 ---
document.addEventListener("DOMContentLoaded", () => {
  setBasics();
  fetchFiveMStatus();
  fetchDiscordMembers();
  setInterval(fetchFiveMStatus, 30000);
  
  // 導覽列點擊
  document.querySelectorAll("[data-target]").forEach(link => {
    link.onclick = (e) => { e.preventDefault(); showPage(link.dataset.target); };
  });

  // Logo 回首頁
  document.querySelector(".brand").onclick = (e) => { e.preventDefault(); showHome(); };

  // 幫助中心 Tab 切換
  const tabs = document.querySelectorAll("#helpTabs .pill");
  tabs.forEach(tab => {
    tab.onclick = () => {
      tabs.forEach(t => t.classList.remove("active"));
      tab.classList.add("active");
      $("help-start").style.display = tab.dataset.tab === "start" ? "block" : "none";
      $("help-support").style.display = tab.dataset.tab === "support" ? "block" : "none";
    };
  });
});
