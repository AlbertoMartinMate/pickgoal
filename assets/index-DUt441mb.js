(function(){const a=document.createElement("link").relList;if(a&&a.supports&&a.supports("modulepreload"))return;for(const n of document.querySelectorAll('link[rel="modulepreload"]'))s(n);new MutationObserver(n=>{for(const i of n)if(i.type==="childList")for(const o of i.addedNodes)o.tagName==="LINK"&&o.rel==="modulepreload"&&s(o)}).observe(document,{childList:!0,subtree:!0});function t(n){const i={};return n.integrity&&(i.integrity=n.integrity),n.referrerPolicy&&(i.referrerPolicy=n.referrerPolicy),n.crossOrigin==="use-credentials"?i.credentials="include":n.crossOrigin==="anonymous"?i.credentials="omit":i.credentials="same-origin",i}function s(n){if(n.ep)return;n.ep=!0;const i=t(n);fetch(n.href,i)}})();const Ve="https://pickgoal-backend.onrender.com/api";function Ge(){return localStorage.getItem("token")}async function m(e,a={}){const t={"Content-Type":"application/json",...a.headers},s=Ge();s&&(t.Authorization=`Bearer ${s}`);const n=await fetch(`${Ve}${e}`,{cache:"no-store",...a,headers:t}),i=await n.json().catch(()=>({}));if(!n.ok)throw{status:n.status,message:i.error||"Error desconocido"};return i}const l={get:e=>m(e),post:(e,a)=>m(e,{method:"POST",body:JSON.stringify(a)}),patch:(e,a)=>m(e,{method:"PATCH",body:JSON.stringify(a)}),delete:e=>m(e,{method:"DELETE"}),auth:{register:e=>m("/auth/register",{method:"POST",body:JSON.stringify(e)}),login:e=>m("/auth/login",{method:"POST",body:JSON.stringify(e)}),me:()=>m("/auth/me"),forgotPassword:e=>m("/auth/forgot-password",{method:"POST",body:JSON.stringify({email:e})}),resetPassword:(e,a)=>m("/auth/reset-password",{method:"POST",body:JSON.stringify({token:e,password:a})}),ranking:e=>m(`/auth/ranking${e?`?league_id=${e}`:""}`),deleteAccount:()=>m("/auth/account",{method:"DELETE"}),users:()=>m("/auth/users"),usersForMentions:()=>m("/auth/users/for-mentions"),toggleAdmin:e=>m(`/auth/users/${e}/toggle-admin`,{method:"PATCH"}),toggleMute:e=>m(`/auth/users/${e}/toggle-mute`,{method:"PATCH"}),updateEmail:e=>m("/auth/me/email",{method:"PATCH",body:JSON.stringify({email:e})})},matches:{grouped:()=>m("/matches/grouped"),list:(e="")=>m(`/matches/${e}`),get:e=>m(`/matches/${e}`),today:()=>m("/matches/today"),setResult:(e,a,t,s=null)=>m(`/matches/${e}/result`,{method:"PATCH",body:JSON.stringify({home_score:a,away_score:t,...s?{result_90:s}:{}})}),sync:()=>m("/matches/sync",{method:"POST"}),recalculate:()=>m("/matches/recalculate",{method:"POST"})},predictions:{mine:e=>m(`/predictions/${e?`?league_id=${e}`:""}`),forMatch:(e,a)=>m(`/predictions/match/${e}${a?`?league_id=${a}`:""}`),save:e=>m("/predictions/",{method:"POST",body:JSON.stringify(e)}),forUser:(e,a)=>m(`/predictions/user/${e}${a?`?league_id=${a}`:""}`),getChampion:e=>m(`/predictions/champion${e?`?league_id=${e}`:""}`),saveChampion:(e,a)=>m("/predictions/champion",{method:"POST",body:JSON.stringify({team_name:e,league_id:a??null})}),awardChampion:e=>m("/predictions/champion/award",{method:"POST",body:JSON.stringify({team_name:e})})},leagues:{all:()=>m("/leagues/all"),public:()=>m("/leagues/public"),my:()=>m("/leagues/my"),create:e=>m("/leagues/",{method:"POST",body:JSON.stringify(e)}),join:e=>m("/leagues/join",{method:"POST",body:JSON.stringify(e)}),joinByCode:e=>m(`/leagues/join/${encodeURIComponent(e)}`),adminAll:()=>m("/leagues/admin"),get:e=>m(`/leagues/${e}`),update:(e,a)=>m(`/leagues/${e}`,{method:"PUT",body:JSON.stringify(a)}),leave:e=>m(`/leagues/${e}/leave`,{method:"DELETE"}),members:e=>m(`/leagues/${e}/members`),matchPredictions:(e,a)=>m(`/leagues/${e}/predictions/${a}`)},home:{summary:()=>m("/home/summary")},board:{messages:(e=1,a=null)=>m(`/board/?page=${e}${a?`&league_id=${a}`:""}`),unread:(e,a)=>m(`/board/unread?${e?`league_id=${e}&`:""}since=${encodeURIComponent(a)}`),post:(e,a=null)=>m("/board/",{method:"POST",body:JSON.stringify({message:e,league_id:a})}),pin:e=>m(`/board/${e}/pin`,{method:"POST"}),reply:(e,a)=>m(`/board/${e}/reply`,{method:"POST",body:JSON.stringify({message:a})}),delete:e=>m(`/board/${e}`,{method:"DELETE"}),mentions:e=>m(`/board/mentions?since=${encodeURIComponent(e)}`)},notifications:{vapidPublicKey:()=>m("/notifications/vapid-public-key"),subscribe:e=>m("/notifications/subscribe",{method:"POST",body:JSON.stringify(e)}),send:e=>m("/notifications/send",{method:"POST",body:JSON.stringify(e)})},adminV2:{partidos:e=>m(`/v2/admin/partidos-disponibles?semana=${encodeURIComponent(e)}`),jornadas:()=>m("/v2/admin/jornadas"),createJornada:e=>m("/v2/admin/jornada",{method:"POST",body:JSON.stringify(e)}),updateJornada:(e,a)=>m(`/v2/admin/jornada/${e}`,{method:"PUT",body:JSON.stringify(a)}),deleteJornada:e=>m(`/v2/admin/jornada/${e}`,{method:"DELETE"}),publishJornada:e=>m(`/v2/admin/jornada/${e}/publish`,{method:"POST"}),jornadaMatches:e=>m(`/v2/admin/jornada/${e}/matches`),setResultado:(e,a)=>m(`/v2/admin/jornada-match/${e}/resultado`,{method:"POST",body:JSON.stringify(a)}),cancelMatch:e=>m(`/v2/admin/jornada-match/${e}/cancel`,{method:"POST"})},jornada:{info:()=>m("/v2/jornada/info"),current:()=>m("/v2/jornada/current"),list:()=>m("/v2/jornada/list"),predict:e=>m("/v2/jornada/predict",{method:"POST",body:JSON.stringify(e)}),history:()=>m("/v2/jornada/history"),myStats:()=>m("/v2/jornada/my-stats")},duelo:{list:()=>m("/v2/duelo/list"),current:()=>m("/v2/duelo/current"),detail:()=>m("/v2/duelo/current/detail")},messages:{unread:()=>m("/messages/unread"),list:()=>m("/messages/"),get:e=>m(`/messages/${e}`),send:(e,a)=>m(`/messages/${e}`,{method:"POST",body:JSON.stringify({message:a})}),markAllRead:()=>m("/messages/mark-all-read",{method:"PATCH"})},clasificacion:{division:e=>m(`/v2/clasificacion/division${e?`?league_id=${e}`:""}`),general:()=>m("/v2/clasificacion/general"),allDivisions:()=>m("/v2/clasificacion/all-divisions")}};let H=null;const y={async init(){if(localStorage.getItem("token"))try{const{user:a}=await l.auth.me();H=a}catch{localStorage.removeItem("token")}},setUser(e,a){H=e,localStorage.setItem("token",a),document.dispatchEvent(new CustomEvent("auth:change",{detail:e}))},logout(){H=null,localStorage.removeItem("token"),document.dispatchEvent(new CustomEvent("auth:change",{detail:null}))},getUser(){return H},isLoggedIn(){return!!H},isAdmin(){return(H==null?void 0:H.is_admin)===!0}};let oe=null;function g(e,a="success"){let t=document.getElementById("toast");t||(t=document.createElement("div"),t.id="toast",document.body.appendChild(t)),t.textContent=e,t.className=`toast toast--${a} toast--visible`,oe&&clearTimeout(oe),oe=setTimeout(()=>{t.classList.remove("toast--visible")},3e3)}function We(){return`
    <div class="container">
      <div class="league-gate">
        <div class="league-gate__icon">⚽</div>
        <h2 class="league-gate__title">¡Inicia tu Liga!</h2>
        <p class="league-gate__text">Únete a una liga para empezar a predecir</p>
        <a href="#/ligas" class="btn btn--primary">Ver ligas disponibles</a>
      </div>
    </div>
  `}function Y(){return`
    <div class="points-modal" id="pointsModal" aria-hidden="true">
      <div class="points-modal__overlay" id="pointsOverlay"></div>
      <div class="points-modal__box" role="dialog" aria-modal="true" aria-label="Cómo funciona PickGoal">
        <button class="points-modal__close" id="pointsClose" aria-label="Cerrar">✕</button>

        <h2 class="points-modal__heading">¿Cómo funciona PickGoal?</h2>

        <div class="points-modal__section">
          <h3 class="points-modal__subheading">⚽ Pronósticos</h3>
          <ul class="points-modal__list">
            <li>Cada jornada tienes <strong>20 unidades</strong> para repartir entre los partidos.</li>
            <li>Por cada partido puedes apostar entre <strong>1 y 5 unidades</strong>.</li>
            <li>Si aciertas el resultado (1X2), ganas <strong>unidades × cuota</strong> del partido.</li>
            <li>Las unidades que no uses se convierten directamente en puntos.</li>
            <li class="points-modal__note">Si un partido se cancela, sus unidades van al bote de "no usadas".</li>
          </ul>
        </div>

        <div class="points-modal__section">
          <h3 class="points-modal__subheading">🤝 Duelos 1vs1</h3>
          <ul class="points-modal__list">
            <li>Cada jornada te enfrentas a otro jugador de tu división.</li>
            <li>Gana quien consiga más puntos en esa jornada.</li>
            <li><span class="pts-tag pts-tag--win">Victoria</span> 3 pts de duelo &nbsp; <span class="pts-tag pts-tag--draw">Empate</span> 1 pt &nbsp; <span class="pts-tag pts-tag--loss">Derrota</span> 0 pts</li>
            <li>Los puntos de duelo determinan tu posición en la clasificación divisional.</li>
          </ul>
        </div>

        <div class="points-modal__section">
          <h3 class="points-modal__subheading">🏆 Clasificación divisional</h3>
          <ul class="points-modal__list">
            <li>Cada liga está formada por <strong>16 jugadores</strong>.</li>
            <li>Al final de cada vuelta (15 jornadas) se producen ascensos y descensos:
              <ul class="points-modal__list points-modal__list--inner">
                <li>Top 4 → suben de división</li>
                <li>Últimos 4 → bajan de división</li>
              </ul>
            </li>
          </ul>
        </div>

        <div class="points-modal__section">
          <h3 class="points-modal__subheading">📊 Clasificación general</h3>
          <ul class="points-modal__list">
            <li>Suma total de puntos de todas las jornadas.</li>
            <li>Al final de la temporada (45 jornadas / 3 vueltas) se entregan los premios a los mejores de la clasificación general.</li>
            <li>🏆 Premio: camiseta de tu equipo favorito</li>
          </ul>
        </div>
      </div>
    </div>
  `}function Z(e){const a=e.querySelector("#pointsModal"),t=e.querySelector("#btnPointsInfo"),s=e.querySelector("#pointsClose"),n=e.querySelector("#pointsOverlay");function i(){a.classList.add("points-modal--open"),document.body.style.overflow="hidden"}function o(){a.classList.remove("points-modal--open"),document.body.style.overflow=""}return t==null||t.addEventListener("click",i),s==null||s.addEventListener("click",o),n==null||n.addEventListener("click",o),document.addEventListener("keydown",r=>{r.key==="Escape"&&o()},{once:!1}),i}function k(e){const a=parseFloat(e);return isNaN(a)||e==null?"—":parseFloat(a.toFixed(2)).toString()}function B(e){return e?new Date(e).toLocaleString("es-ES",{day:"2-digit",month:"2-digit",year:"numeric",hour:"2-digit",minute:"2-digit"}):"—"}const Xe="/assets/icon-512-v2-CAowBaBi.png";async function Ye(e){if(!y.getUser()){Ze(e);return}e.innerHTML='<div class="loading"><div class="loading__spinner"></div></div>';try{const{leagues_summary:t,division_summary:s,upcoming_matches:n}=await l.home.summary();if(s){e.innerHTML=`
        <div class="home-dashboard container">
          <div class="home-dashboard__topbar">
            <button class="btn btn--ghost btn--sm" id="btnPointsInfo">📊 Sistema de puntos</button>
          </div>
          ${Qe(s)}
          ${ta()}
          ${_e(n)}
        </div>
        ${Y()}
      `,Z(e);return}if(!t||t.length===0){Ke(e);return}const i=(()=>{const r=localStorage.getItem("activeLeagueId");return r?parseInt(r):null})(),o=[...t].sort((r,d)=>r.league_id===i?-1:d.league_id===i?1:0);e.innerHTML=`
      <div class="home-dashboard container">
        <div class="home-dashboard__topbar">
          <button class="btn btn--ghost btn--sm" id="btnPointsInfo">📊 Sistema de puntos</button>
        </div>

        <h3 class="home-dashboard__section-title">Mis ligas</h3>
        <div class="home-dashboard__leagues">
          ${o.map(r=>aa(r)).join("")}
        </div>

        <div class="home-dashboard__create">
          <a href="#/ligas" class="btn btn--ghost btn--sm">+ Crear liga privada</a>
        </div>

        ${_e(n)}
      </div>
      ${Y()}
    `,Z(e),e.querySelectorAll(".league-card[data-league-id]").forEach(r=>{r.style.cursor="pointer",r.addEventListener("click",d=>{d.target.closest("[data-go-ranking]")||d.target.closest("a")||(localStorage.setItem("activeLeagueId",r.dataset.leagueId),S.navigate(`/ligas/${r.dataset.leagueId}`))})}),e.querySelectorAll("[data-go-ranking]").forEach(r=>{r.addEventListener("click",d=>{d.stopPropagation(),localStorage.setItem("activeLeagueId",r.dataset.goRanking),S.navigate("/ranking")})})}catch(t){e.innerHTML=`<div class="container"><p class="form__error">Error cargando el inicio: ${t.message}</p></div>`}}async function Ze(e){const t=new Date>=new Date("2026-08-15T00:00:00Z");let s=null;if(t)try{s=await l.jornada.info()}catch{}e.innerHTML=`
    <section class="hero">
      <div class="hero__content">
        <img src="${Xe}" alt="PickGoal" class="hero__logo-img" />
        <div class="hero__cta">
          <a href="#/register" class="btn btn--primary btn--lg">Registrarse</a>
          <a href="#/login" class="btn btn--ghost btn--lg">Ya tengo cuenta</a>
        </div>
      </div>
    </section>

    <div class="container">
      ${Pe(s,t)}
    </div>

    <section class="how-it-works container">
      <h2 class="how-it-works__title">¿Cómo funciona?</h2>
      <div class="how-it-works__grid">
        <div class="how-step">
          <span class="how-step__icon">⚽</span>
          <div class="how-step__num">1</div>
          <h3 class="how-step__title">Predice los partidos</h3>
          <p class="how-step__desc">Elige el resultado 1X2 de LaLiga, Premier League y Champions cada jornada</p>
        </div>
        <div class="how-step">
          <span class="how-step__icon">⚔️</span>
          <div class="how-step__num">2</div>
          <h3 class="how-step__title">Gana duelos 1vs1</h3>
          <p class="how-step__desc">Cada jornada te enfrentas a un rival de tu división para sumar puntos</p>
        </div>
        <div class="how-step">
          <span class="how-step__icon">👑</span>
          <div class="how-step__num">3</div>
          <h3 class="how-step__title">Sube de división</h3>
          <p class="how-step__desc">Los mejores ascienden. ¿Llegarás a lo más alto de la PickGoal League?</p>
        </div>
      </div>
    </section>
  `}function Ke(e){e.innerHTML=`
    <div class="home-dashboard container">
      ${Pe()}
    </div>
  `}function Qe(e){const a={promotion:"⬆️ Zona ascenso",relegation:"⬇️ Zona descenso",mid:""},t=a[e.zone]?`<span class="div-card__zone div-card__zone--${e.zone}">${a[e.zone]}</span>`:"";return`
    <div class="div-card">
      <div class="div-card__header">
        <div>
          <span class="div-card__league">${e.league_name}</span>
          <div class="div-card__pos-row">
            <span class="div-card__pos">${e.rank??"—"}º</span>
            <span class="div-card__of">de ${e.member_count}</span>
            ${t}
          </div>
        </div>
        <div class="div-card__pts-block">
          <span class="div-card__pts-val">${k(e.pts_division)}</span>
          <span class="div-card__pts-label">pts división</span>
        </div>
      </div>
      <div class="div-card__record">
        <div class="div-card__stat"><span>${e.pj}</span><small>PJ</small></div>
        <div class="div-card__stat"><span>${e.g}</span><small>G</small></div>
        <div class="div-card__stat"><span>${e.e}</span><small>E</small></div>
        <div class="div-card__stat"><span>${e.p}</span><small>P</small></div>
        <div class="div-card__stat div-card__stat--general"><span>${k(e.pts_general)}</span><small>Pts total</small></div>
      </div>
      <div class="div-card__actions">
        <a href="#/jornada" class="btn btn--primary btn--sm">Predecir jornada</a>
        <a href="#/tabla-v2" class="btn btn--ghost btn--sm">Ver tabla</a>
      </div>
    </div>
  `}function ea(e){const a=new Date,t=new Date(e),s=Math.ceil((t-a)/(1e3*60*60*24));return Math.max(0,s)}function Pe(e=null,a=!1){let t,s;if(a&&(e!=null&&e.jornada_number))s="Temporada 26/27 · En curso",t=`
      <div class="pg-league-card__jornada">
        <span class="pg-league-card__jornada-num">J${e.jornada_number}</span>
        <span class="pg-league-card__jornada-label">jornada actual</span>
      </div>`;else if(a)s="Temporada 26/27 · En curso",t='<div class="pg-league-card__countdown pg-league-card__countdown--soon">Temporada en curso</div>';else{const n=ea("2026-08-15");s="Temporada 26/27 · Próximamente",t=n>0?`<div class="pg-league-card__countdown">
           <span class="pg-league-card__countdown-num">${n}</span>
           <span class="pg-league-card__countdown-label">días para el inicio</span>
         </div>`:'<div class="pg-league-card__countdown pg-league-card__countdown--soon">¡Lanzamiento inminente!</div>'}return`
    <div class="pg-league-card">
      <div class="pg-league-card__header">
        <div>
          <span class="pg-league-card__badge">${s}</span>
          <h2 class="pg-league-card__name">PickGoal League</h2>
        </div>
        ${t}
      </div>
      <div class="pg-league-card__features">
        <div class="pg-league-card__feature">⚽ LaLiga · Premier League · Champions League</div>
        <div class="pg-league-card__feature">🏆 Sistema de divisiones y duelos 1vs1</div>
        <div class="pg-league-card__feature">📅 Temporada 26/27 · agosto 2026</div>
      </div>
      <div class="pg-league-card__actions">
        <a href="#/register" class="btn btn--primary btn--sm">Inscribirme</a>
      </div>
    </div>
  `}function aa(e){const a=e.next_to_predict?`<div class="league-card__next">
         <span class="league-card__next-label">Próximo a predecir</span>
         <span class="league-card__next-match">${e.next_to_predict.home_team} vs ${e.next_to_predict.away_team}</span>
         <span class="league-card__next-date">${B(e.next_to_predict.match_datetime)}</span>
       </div>`:`<div class="league-card__next league-card__next--done">
         Todos los partidos predichos
       </div>`,t=e.predictions_made??0,s=e.matches_played??0;return`
    <div class="league-card league-card--finished" data-league-id="${e.league_id}">
      <div class="league-card__header">
        <h2 class="league-card__name">${e.league_name}</h2>
        <span class="league-card__finished-badge">Finalizada 🏁</span>
      </div>
      <div class="league-card__stats">
        <div class="league-card__stat">
          <span class="league-card__stat-val">${k(e.total_points)}</span>
          <span class="league-card__stat-label">Puntos</span>
        </div>
        <div class="league-card__stat">
          <span class="league-card__stat-val">${e.correct_results}/${t}</span>
          <span class="league-card__stat-label">1X2</span>
        </div>
        <div class="league-card__stat">
          <span class="league-card__stat-val">${e.exact_scores}/${t}</span>
          <span class="league-card__stat-label">Exactos</span>
        </div>
      </div>
      <div class="league-card__pred-row">
        Pronósticos realizados: <strong>${t}/${s}</strong> partidos
      </div>
      ${a}
      <button class="league-card__cta btn btn--ghost btn--sm" data-go-ranking="${e.league_id}">Ver clasificación</button>
    </div>
  `}function _e(e){return e.length?`
    <section class="upcoming-matches">
      <h2 class="upcoming-matches__title">Próximos partidos</h2>
      <div class="upcoming-matches__list">
        ${e.map(({match:a,has_prediction:t})=>`
          <div class="upcoming-match">
            <div class="upcoming-match__teams">
              <span>${a.home_team}</span>
              <span class="upcoming-match__vs">vs</span>
              <span>${a.away_team}</span>
            </div>
            <div class="upcoming-match__meta">
              <span class="upcoming-match__date">${B(a.match_datetime)}</span>
              ${t?'<span class="upcoming-match__badge upcoming-match__badge--done">Predicho</span>':'<span class="upcoming-match__badge upcoming-match__badge--pending">Sin predecir</span>'}
            </div>
          </div>
        `).join("")}
      </div>
      <a class="btn btn--ghost btn--sm" href="#/jornada">Ver jornada actual</a>
    </section>
  `:""}function ta(){return`
    <div class="prize-banner">
      <span class="prize-banner__icon">🏆</span>
      <div>
        <strong>Premio temporada 26/27</strong>
        <p>Camiseta de tu equipo favorito para el campeón de la clasificación general</p>
      </div>
    </div>
  `}const be="pickgoal_welcome_shown";function Me(e="/jornada"){if(localStorage.getItem(be))return;localStorage.setItem(be,"1");const a=document.createElement("div");a.innerHTML=`
    <div class="welcome-modal" id="welcomeModal">
      <div class="welcome-modal__overlay" id="welcomeOverlay"></div>
      <div class="welcome-modal__box">
        <h2 class="welcome-modal__title">¡Bienvenido a PickGoal! ⚽</h2>
        <p class="welcome-modal__subtitle">La liga de predicciones · Temporada 26/27</p>

        <ol class="welcome-modal__steps">
          <li class="welcome-modal__step">
            <span class="welcome-modal__step-num">1️⃣</span>
            <div>
              <strong>Predice los partidos</strong>
              <span>— LaLiga, Premier League y Champions cada jornada</span>
            </div>
          </li>
          <li class="welcome-modal__step">
            <span class="welcome-modal__step-num">2️⃣</span>
            <div>
              <strong>Gana duelos 1vs1</strong>
              <span>— cada jornada te enfrentas a un rival de tu división</span>
            </div>
          </li>
          <li class="welcome-modal__step">
            <span class="welcome-modal__step-num">3️⃣</span>
            <div>
              <strong>Sube de división</strong>
              <span>— compite por el título de la PickGoal League</span>
            </div>
          </li>
        </ol>

        <div class="welcome-modal__highlight">
          🏆 Sistema de divisiones con duelos 1vs1 cada jornada
        </div>

        <button class="btn btn--primary btn--full btn--lg" id="welcomeCta">
          ¡Empezar a jugar!
        </button>
      </div>
    </div>
  `;const t=a.firstElementChild;document.body.appendChild(t),document.body.style.overflow="hidden",requestAnimationFrame(()=>t.classList.add("welcome-modal--open"));function s(n){t.classList.remove("welcome-modal--open"),document.body.style.overflow="",t.addEventListener("transitionend",()=>t.remove(),{once:!0}),n&&(window.location.hash=n)}document.getElementById("welcomeOverlay").addEventListener("click",()=>s()),document.getElementById("welcomeCta").addEventListener("click",()=>s(e)),document.addEventListener("keydown",function n(i){i.key==="Escape"&&(s(),document.removeEventListener("keydown",n))})}function sa(e){e.innerHTML=`
    <div class="auth-container container">
      <div class="auth-card">
        <h2 class="auth-card__title">Iniciar sesión</h2>
        <form class="form" id="loginForm">
          <div class="form__group">
            <label class="form__label" for="identifier">Email o usuario</label>
            <input class="form__input" type="text" id="identifier" name="identifier"
              placeholder="tu@email.com" required autocomplete="username" />
          </div>
          <div class="form__group">
            <label class="form__label" for="password">Contraseña</label>
            <input class="form__input" type="password" id="password" name="password"
              placeholder="••••••••" required autocomplete="current-password" />
          </div>
          <p id="loginError" class="form__error hidden"></p>
          <button class="btn btn--primary btn--full" type="submit" id="loginBtn">Entrar</button>
        </form>
        <div class="auth-card__links">
          <a href="#/forgot-password">¿Olvidaste tu contraseña?</a>
          <span>·</span>
          <a href="#/register">Crear cuenta</a>
        </div>
      </div>
    </div>
  `,document.getElementById("loginForm").addEventListener("submit",async a=>{a.preventDefault();const t=document.getElementById("loginBtn"),s=document.getElementById("loginError"),n=document.getElementById("identifier").value.trim(),i=document.getElementById("password").value;t.disabled=!0,t.textContent="Entrando…",s.classList.add("hidden");try{const{token:o,user:r}=await l.auth.login({identifier:n,password:i});y.setUser(r,o),g(`¡Bienvenido, ${r.username}!`),S.navigate("/"),Me("/")}catch(o){s.textContent=o.message||"Error al iniciar sesión",s.classList.remove("hidden")}finally{t.disabled=!1,t.textContent="Entrar"}})}function na(e){e.innerHTML=`
    <div class="auth-container container">
      <div class="auth-card">
        <h2 class="auth-card__title">Crear cuenta</h2>
        <form class="form" id="registerForm">
          <div class="form__group">
            <label class="form__label" for="username">Nombre de usuario</label>
            <input class="form__input" type="text" id="username" name="username"
              placeholder="tu_nombre" required maxlength="50" autocomplete="username" />
          </div>
          <div class="form__group">
            <label class="form__label" for="email">Email</label>
            <input class="form__input" type="email" id="email" name="email"
              placeholder="tu@email.com" required autocomplete="email" />
          </div>
          <div class="form__group">
            <label class="form__label" for="country">País</label>
            <input class="form__input" type="text" id="country" name="country"
              placeholder="España" maxlength="60" />
          </div>
          <div class="form__group">
            <label class="form__label" for="password">Contraseña</label>
            <input class="form__input" type="password" id="password" name="password"
              placeholder="Mínimo 6 caracteres" required minlength="6" autocomplete="new-password" />
          </div>
          <p id="registerError" class="form__error hidden"></p>
          <button class="btn btn--primary btn--full" type="submit" id="registerBtn">Crear cuenta</button>
        </form>
        <div class="auth-card__links">
          <a href="#/login">Ya tengo cuenta</a>
        </div>
      </div>
    </div>
  `,document.getElementById("registerForm").addEventListener("submit",async a=>{a.preventDefault();const t=document.getElementById("registerBtn"),s=document.getElementById("registerError");t.disabled=!0,t.textContent="Creando cuenta…",s.classList.add("hidden");const n={username:document.getElementById("username").value.trim(),email:document.getElementById("email").value.trim(),country:document.getElementById("country").value.trim(),password:document.getElementById("password").value};try{const{token:i,user:o}=await l.auth.register(n);y.setUser(o,i),g("¡Cuenta creada! Bienvenido a PickGoal");const r=sessionStorage.getItem("pendingInviteCode");if(r){sessionStorage.removeItem("pendingInviteCode");try{const{league:d}=await l.leagues.joinByCode(r);g(`¡Te has unido a "${d.name}"!`),S.navigate(`/ligas/${d.id}`)}catch{S.navigate("/ligas")}}else S.navigate("/"),Me("/")}catch(i){s.textContent=i.message||"Error al registrarse",s.classList.remove("hidden")}finally{t.disabled=!1,t.textContent="Crear cuenta"}})}function ia(){const e=localStorage.getItem("activeLeagueId");return e?parseInt(e):null}async function oa(e){var a,t;e.innerHTML='<div class="loading"><div class="loading__spinner"></div></div>';try{if(y.isLoggedIn()){const{leagues:_}=await l.leagues.my();if(_.length===0){e.innerHTML=We();return}}const s=ia(),[{ranking:n},i]=await Promise.all([l.auth.ranking(s),y.isLoggedIn()?l.leagues.my():Promise.resolve({leagues:[]})]),o=y.getUser(),r=i.leagues.find(_=>_.id===s),d=document.getElementById("tablonBadge"),c=d&&!d.classList.contains("hidden"),b=c?d.textContent:"",p=((a=n[0])==null?void 0:a.matches_played)??0;e.innerHTML=`
      ${r?`<span class="page-league-name">${r.name}</span>`:""}
      <div class="container">
        <div class="ranking-header">
          <h1 class="page-title">Clasificación</h1>
          ${s?`
            <button class="ranking-tablon-btn" data-league-id="${s}">
              💬 Tablón
              <span class="ranking-tablon-btn__badge${c?"":" hidden"}">${b}</span>
            </button>
          `:""}
        </div>
        <div class="ranking-table-wrapper">
          <table class="ranking-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Usuario</th>
                <th>Status</th>
                <th title="Predicciones hechas / partidos jugados">Pronósticos</th>
                <th title="Resultados 1X2 acertados / predicciones hechas">1X2</th>
                <th title="Marcadores exactos acertados / predicciones hechas">Exactos</th>
                <th>Puntos</th>
              </tr>
            </thead>
            <tbody>
              ${n.map(_=>{var L,$,u;const h=_.predictions_made??0,f=`${h}/${p}`,E=`${_.correct_results??0}/${h}`,j=`${_.exact_scores??0}/${h}`;return`
                  <tr class="${o&&_.id===o.id?"ranking-table__row--me":""}">
                    <td class="ranking-table__pos" data-pos="${_.position}">${_.position}</td>
                    <td>
                      <a class="ranking-table__link" href="#/jugador/${_.id}">
                        <span class="status-emoji" title="${((L=_.status)==null?void 0:L.name)||""}">${(($=_.status)==null?void 0:$.emoji)||""}</span>${_.username}
                      </a>
                    </td>
                    <td class="ranking-table__stat ranking-table__status">${((u=_.status)==null?void 0:u.name)||"—"}</td>
                    <td class="ranking-table__stat">${f}</td>
                    <td class="ranking-table__stat">${E}</td>
                    <td class="ranking-table__stat">${j}</td>
                    <td class="ranking-table__pts">${_.total_points}</td>
                  </tr>
                `}).join("")}
            </tbody>
          </table>
        </div>
      </div>
    `,(t=e.querySelector(".ranking-tablon-btn"))==null||t.addEventListener("click",()=>{S.navigate(`/tablon?liga=${s}`)})}catch(s){e.innerHTML=`<div class="container"><p class="form__error">Error: ${s.message}</p></div>`}}async function ue(e,{query:a={},forceGeneral:t=!1}={}){e.innerHTML='<div class="loading"><div class="loading__spinner"></div></div>';const s=y.getUser();let n=t?null:a.liga?parseInt(a.liga):null;if(t)localStorage.setItem("tablon_general_last_read",new Date().toISOString()),document.dispatchEvent(new CustomEvent("tablon:read"));else if(n){localStorage.setItem(`tablon_last_read_${n}`,new Date().toISOString());const u=document.getElementById("tablonBadge");u&&(u.classList.add("hidden"),u.textContent="")}let i=null,o=[],r=1,d=1;if(t&&s)try{const{users:u}=await l.auth.usersForMentions();o=u||[],console.log("[tablon] usuarios cargados:",o.length)}catch(u){console.warn("[tablon] error cargando usuarios:",u)}if(!t)try{if(!n&&s){const{leagues:u}=await l.leagues.my();u&&u.length&&(n=u[0].id,i=u[0].name)}else if(n)try{const{league:u}=await l.leagues.get(n);i=u.name}catch{}if(n&&s)try{const{members:u}=await l.leagues.members(n);o=u||[]}catch{}}catch{}async function c(){const u=await l.board.messages(r,n);return d=u.pages||1,u}try{const u=await c();b(u)}catch(u){e.innerHTML=`<div class="container"><p class="form__error">Error: ${u.message}</p></div>`}function b(u){const{pinned:v=[],messages:w=[]}=u;e.innerHTML=`
      <div class="container">
        <div class="board-header">
          <h1 class="page-title">Tablón${i?` · ${i}`:""}</h1>
          ${i?'<span class="board-league-badge">🏆 Liga</span>':'<span class="board-general-badge">🌐 General</span>'}
        </div>

        ${s?`<form class="board-form" id="boardForm">
               <div class="board-form__input-wrap">
                 <textarea class="form__textarea" id="boardMsg" placeholder="Escribe un mensaje…"
                   maxlength="500" rows="3" required></textarea>
                 <div class="mention-dropdown hidden" id="mentionDropdown"></div>
               </div>
               <div class="board-form__footer">
                 <span class="board-form__counter" id="charCounter">0 / 500</span>
                 <button class="btn btn--primary" type="submit">Publicar</button>
               </div>
             </form>`:'<p class="notice"><a href="#/login">Inicia sesión</a> para participar en el tablón.</p>'}

        ${v.length?`<section class="board-section">
               <h2 class="board-section__title">📌 Anuncios fijados</h2>
               <div class="board-pinned" id="boardPinned">
                 ${p(v)}
               </div>
             </section>`:""}

        <section class="board-section">
          ${v.length?'<h2 class="board-section__title">💬 Mensajes</h2>':""}
          <div class="board-messages" id="boardMessages">
            ${h(w)}
          </div>
          ${d>1?`<div class="pagination">
                 <button class="btn btn--ghost btn--sm" id="prevPage" ${r<=1?"disabled":""}>← Anterior</button>
                 <span>Página ${r} / ${d}</span>
                 <button class="btn btn--ghost btn--sm" id="nextPage" ${r>=d?"disabled":""}>Siguiente →</button>
               </div>`:""}
        </section>
      </div>
    `,E(),j(),M()}function p(u){return u.length?u.map(v=>`
      <div class="board-message board-message--pinned" data-id="${v.id}">
        <div class="board-message__header">
          <span class="board-message__pin-badge">📌</span>
          <strong class="board-message__author">${D(v.username)}</strong>
          <span class="board-message__date">${B(v.created_at)}</span>
          ${s!=null&&s.is_admin&&!v.is_deleted?`<button class="btn btn--ghost btn--xs unpin-msg" data-id="${v.id}" title="Desfijar">📌✕</button>`:""}
          ${!v.is_deleted&&s&&(s.id===v.user_id||s.is_admin)?`<button class="btn btn--danger btn--xs delete-msg" data-id="${v.id}">✕</button>`:""}
        </div>
        <p class="board-message__text">${f(v.message)}</p>

        ${v.replies&&v.replies.length?`<div class="board-replies">
               ${v.replies.map(w=>_(w)).join("")}
             </div>`:""}

        ${s&&!v.is_deleted?`<form class="reply-form" id="replyForm-${v.id}" data-parent="${v.id}">
               <div class="reply-form__input-wrap">
                 <input class="form__input reply-input" type="text"
                   placeholder="Responder…" maxlength="500"
                   id="replyInput-${v.id}" />
                 <div class="mention-dropdown hidden" id="mentionDropdown-${v.id}"></div>
               </div>
               <button class="btn btn--outline btn--sm" type="submit">Enviar</button>
             </form>`:""}
      </div>
    `).join(""):""}function _(u){return`
      <div class="board-reply ${u.is_deleted?"board-reply--deleted":""}" data-id="${u.id}">
        <div class="board-reply__header">
          <strong class="board-reply__author">${D(u.username)}</strong>
          <span class="board-reply__date">${B(u.created_at)}</span>
          ${!u.is_deleted&&s&&(s.id===u.user_id||s.is_admin)?`<button class="btn btn--danger btn--xs delete-msg" data-id="${u.id}">✕</button>`:""}
        </div>
        <p class="board-reply__text">${f(u.message)}</p>
      </div>
    `}function h(u){return u.length?u.map(v=>`
      <div class="board-message ${v.is_deleted?"board-message--deleted":""}" data-id="${v.id}">
        <div class="board-message__header">
          <strong class="board-message__author">${D(v.username)}</strong>
          <span class="board-message__date">${B(v.created_at)}</span>
          ${s!=null&&s.is_admin&&!v.is_deleted?`<button class="btn btn--ghost btn--xs pin-msg" data-id="${v.id}" title="Fijar">📌</button>`:""}
          ${!v.is_deleted&&s&&(s.id===v.user_id||s.is_admin)?`<button class="btn btn--danger btn--xs delete-msg" data-id="${v.id}">✕</button>`:""}
        </div>
        <p class="board-message__text">${f(v.message)}</p>
      </div>
    `).join(""):'<p class="empty">Sin mensajes aún. ¡Sé el primero!</p>'}function f(u){const v=D(u);if(!o.length)return v.replace(/@(\w+)/g,'<span class="mention">@$1</span>');const w=o.map(I=>ra(I.username)),T=new RegExp(`@(${w.join("|")})`,"gi");return v.replace(T,'<span class="mention">@$1</span>')}function E(){const u=document.getElementById("boardForm");if(!u)return;const v=document.getElementById("boardMsg"),w=document.getElementById("charCounter"),T=document.getElementById("mentionDropdown");v.addEventListener("input",()=>{w.textContent=`${v.value.length} / 500`,$(v,T)}),u.addEventListener("submit",async I=>{I.preventDefault();const A=v.value.trim();if(A)try{await l.board.post(A,n),v.value="",w.textContent="0 / 500",T.classList.add("hidden");const P=await c();L(P),g("Mensaje publicado")}catch(P){g(P.message,"error")}})}function j(){e.querySelectorAll(".reply-form").forEach(u=>{const v=parseInt(u.dataset.parent),w=u.querySelector(".reply-input"),T=`mentionDropdown-${v}`,I=document.getElementById(T);w==null||w.addEventListener("input",()=>{$(w,I)}),u.addEventListener("submit",async A=>{A.preventDefault();const P=w.value.trim();if(P)try{await l.board.reply(v,P),w.value="",I==null||I.classList.add("hidden");const U=await c();L(U),g("Respuesta enviada")}catch(U){g(U.message,"error")}})}),e.querySelectorAll(".pin-msg").forEach(u=>{u.addEventListener("click",async()=>{try{await l.board.pin(u.dataset.id);const v=await c();L(v),g("Mensaje fijado")}catch(v){g(v.message,"error")}})}),e.querySelectorAll(".unpin-msg").forEach(u=>{u.addEventListener("click",async()=>{try{await l.board.pin(u.dataset.id);const v=await c();L(v),g("Mensaje desfijado")}catch(v){g(v.message,"error")}})})}function M(){e.querySelectorAll(".delete-msg").forEach(u=>{u.addEventListener("click",async()=>{if(confirm("¿Eliminar este mensaje?"))try{await l.board.delete(u.dataset.id);const v=await c();L(v),g("Mensaje eliminado")}catch(v){g(v.message,"error")}})})}function L(u){const{pinned:v=[],messages:w=[]}=u,T=document.getElementById("boardPinned");if(T)T.innerHTML=p(v);else if(v.length){b(u);return}const I=document.getElementById("boardMessages");I&&(I.innerHTML=h(w)),j(),M()}e.addEventListener("click",async u=>{if(u.target.id==="prevPage"&&r>1){r--;const v=await c();L(v)}else if(u.target.id==="nextPage"&&r<d){r++;const v=await c();L(v)}});function $(u,v){if(!v||!o.length){console.log("[tablon] handleMentionInput: sin dropdown o members vacío",{dropdown:!!v,membersLen:o.length});return}const w=u.value,T=u.selectionStart,I=w.slice(0,T),A=I.match(/@(\w*)$/);if(!A){v.classList.add("hidden");return}const P=A[1].toLowerCase();console.log("[tablon] mention detected, query:",P);const U=o.filter(C=>C.username.toLowerCase().startsWith(P)&&C.id!==(s==null?void 0:s.id));console.log("[tablon] matches:",U.map(C=>C.username));const ve=[...y.isAdmin()&&"todos".startsWith(P)?[{username:"todos",description:"Notificar a todos los miembros"}]:[],...U.slice(0,6)];if(!ve.length){v.classList.add("hidden");return}v.innerHTML=ve.map(C=>C.description?`<div class="mention-item mention-item--broadcast" data-username="${D(C.username)}">
             <span class="mention-item__name">@${D(C.username)}</span>
             <span class="mention-item__desc">${D(C.description)}</span>
           </div>`:`<div class="mention-item" data-username="${D(C.username)}">${D(C.username)}</div>`).join(""),v.classList.remove("hidden"),v.querySelectorAll(".mention-item").forEach(C=>{C.addEventListener("mousedown",Fe=>{Fe.preventDefault();const ze=C.dataset.username,ie=I.replace(/@(\w*)$/,`@${ze} `);if(u.value=ie+w.slice(T),u.setSelectionRange(ie.length,ie.length),v.classList.add("hidden"),u.tagName==="TEXTAREA"){const ge=document.getElementById("charCounter");ge&&(ge.textContent=`${u.value.length} / 500`)}})})}document.addEventListener("click",u=>{!u.target.closest(".board-form__input-wrap")&&!u.target.closest(".reply-form__input-wrap")&&document.querySelectorAll(".mention-dropdown").forEach(v=>v.classList.add("hidden"))},{capture:!0})}function D(e){return String(e).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;")}function ra(e){return e.replace(/[.*+?^${}()|[\]\\]/g,"\\$&")}async function da(e){var a,t,s,n;e.innerHTML='<div class="loading"><div class="loading__spinner"></div></div>';try{const i=y.getUser(),o=i==null?void 0:i.is_admin,[r,d]=await Promise.all([o?l.leagues.adminAll():l.leagues.all(),y.isLoggedIn()&&!o?l.leagues.my():Promise.resolve({leagues:[]})]),c=new Set(d.leagues.map(p=>p.id)),b=o?r.leagues:r.leagues.filter(p=>!c.has(p.id));e.innerHTML=`
      <div class="container">
        <h1 class="page-title">Ligas</h1>

        ${o?`
          <div class="admin-notice">Vista administrador — puedes acceder a cualquier liga sin participar en ella.</div>
        `:""}

        ${i&&!o&&d.leagues.length>0?`
          <section class="section">
            <h2>Mis ligas</h2>
            <div class="leagues-grid">${d.leagues.map(p=>he(p,!0)).join("")}</div>
          </section>
        `:""}

        ${i?`
          <section class="section ligas-actions">
            <div class="ligas-actions__row">
              <button class="btn btn--primary" id="btnShowCreate">+ Crear liga</button>
              ${o?"":`
              <form class="form form--inline" id="joinCodeForm">
                <input class="form__input" type="text" id="inviteCode" placeholder="Código de invitación" maxlength="20" />
                <button class="btn btn--outline" type="submit">Unirse</button>
              </form>`}
            </div>
            <div class="create-league-panel hidden" id="createLeaguePanel">
              <form class="form" id="createLeagueForm">
                <div class="form__group">
                  <label class="form__label" for="leagueName">Nombre de la liga</label>
                  <input class="form__input" type="text" id="leagueName" placeholder="Mi Liga Épica" required maxlength="100" />
                </div>
                <div class="form__group">
                  <label class="form__label" for="leagueDesc">Descripción (opcional)</label>
                  <input class="form__input" type="text" id="leagueDesc" placeholder="Una liga entre amigos..." maxlength="300" />
                </div>
                <div class="form__group">
                  <label class="form__label" for="leaguePrize">Premio (opcional)</label>
                  <input class="form__input" type="text" id="leaguePrize" placeholder="Una cena, un trofeo..." maxlength="200" />
                </div>
                <div class="form__group form__group--checkbox">
                  <input type="checkbox" id="isPublic" checked />
                  <label for="isPublic">Liga pública (visible para todos)</label>
                </div>
                ${i.is_admin?`
                  <div class="form__group form__group--checkbox">
                    <input type="checkbox" id="isOfficial" />
                    <label for="isOfficial">⭐ Liga Oficial</label>
                  </div>
                `:""}
                <div class="form__actions">
                  <button class="btn btn--primary" type="submit" id="createBtn">Crear liga</button>
                  <button class="btn btn--ghost" type="button" id="btnCancelCreate">Cancelar</button>
                </div>
              </form>
            </div>
          </section>
        `:'<p class="notice"><a href="#/login">Inicia sesión</a> para crear o unirte a ligas.</p>'}

        <section class="section">
          <h2>${o?"Todas las ligas":"Ligas disponibles"}</h2>
          ${b.length?`<div class="leagues-grid">${b.map(p=>he(p,!1,c,o)).join("")}</div>`:o?'<p class="empty">No hay ligas creadas aún.</p>':d.leagues.length>0?'<p class="empty">Ya participas en todas las ligas disponibles.</p>':'<p class="empty">No hay ligas aún. ¡Crea la primera!</p>'}
        </section>
      </div>
    `,e.querySelectorAll('.league-card[data-navigate="true"]').forEach(p=>{p.addEventListener("click",()=>S.navigate(`/ligas/${p.dataset.id}`))}),e.querySelectorAll(".btn-join-league").forEach(p=>{p.addEventListener("click",async _=>{_.stopPropagation();const h=parseInt(p.dataset.id);p.disabled=!0,p.textContent="…";try{const{league:f}=await l.leagues.join({league_id:h});g(`¡Te has unido a "${f.name}"!`),S.navigate(`/ligas/${f.id}`)}catch(f){g(f.message,"error"),p.disabled=!1,p.textContent="Unirse"}})}),e.querySelectorAll(".btn-private-info").forEach(p=>{p.addEventListener("click",_=>{_.stopPropagation(),g("Esta liga es privada. Pide el enlace de invitación a cualquier miembro para unirte.","info")})}),(a=document.getElementById("btnShowCreate"))==null||a.addEventListener("click",()=>{var p,_;(p=document.getElementById("createLeaguePanel"))==null||p.classList.remove("hidden"),(_=document.getElementById("btnShowCreate"))==null||_.classList.add("hidden")}),(t=document.getElementById("btnCancelCreate"))==null||t.addEventListener("click",()=>{var p,_;(p=document.getElementById("createLeaguePanel"))==null||p.classList.add("hidden"),(_=document.getElementById("btnShowCreate"))==null||_.classList.remove("hidden")}),(s=document.getElementById("joinCodeForm"))==null||s.addEventListener("submit",async p=>{p.preventDefault();const _=document.getElementById("inviteCode").value.trim().toUpperCase();if(_)try{const{league:h}=await l.leagues.join({invite_code:_});g(`Te has unido a "${h.name}"`),S.navigate(`/ligas/${h.id}`)}catch(h){g(h.message,"error")}}),(n=document.getElementById("createLeagueForm"))==null||n.addEventListener("submit",async p=>{var L;p.preventDefault();const _=document.getElementById("createBtn");_.disabled=!0,_.textContent="Creando…";const h=document.getElementById("leagueName").value.trim(),f=document.getElementById("leagueDesc").value.trim(),E=document.getElementById("leaguePrize").value.trim(),j=document.getElementById("isPublic").checked,M=((L=document.getElementById("isOfficial"))==null?void 0:L.checked)??!1;try{const{league:$}=await l.leagues.create({name:h,description:f,prize:E,is_public:j,is_official:M});la($)}catch($){g($.message,"error"),_.disabled=!1,_.textContent="Crear liga"}})}catch(i){e.innerHTML=`<div class="container"><p class="form__error">Error: ${i.message}</p></div>`}}function he(e,a=!1,t=new Set,s=!1){const n=e.is_official?'<span class="league-badge league-badge--official">⭐ Oficial</span>':"",i=e.is_public?"🌍":"🔒",o=s?`<button class="btn btn--sm btn--outline btn-admin-view" data-id="${e.id}">Ver (admin)</button>`:a?`<button class="btn btn--sm btn--outline" onclick="event.stopPropagation(); window.location.hash='/ligas/${e.id}'">Ver liga</button>`:e.is_public?`<button class="btn btn--sm btn--primary btn-join-league" data-id="${e.id}">Unirse</button>`:'<button class="btn btn--sm btn--ghost btn-private-info">🔒 Solicitar enlace</button>';return`
    <div class="league-card ${a?"league-card--mine":""}" data-id="${e.id}" data-navigate="${a||s||e.is_public}">
      <div class="league-card__top">
        <div class="league-card__name">${e.name} ${n}</div>
      </div>
      ${e.description?`<p class="league-card__desc">${e.description}</p>`:""}
      <div class="league-card__meta">
        <span>${i} ${e.is_public?"Pública":"Privada"}</span>
        <span>${e.member_count} participantes</span>
        ${e.prize?`<span>🏆 ${e.prize}</span>`:""}
      </div>
      <div class="league-card__footer">
        <span class="league-card__creator">por ${e.creator_username}</span>
        ${o}
      </div>
    </div>
  `}function la(e){var s,n;const a=e.invite_link||"",t=document.getElementById("createLeaguePanel");t&&(t.innerHTML=`
    <div class="invite-success">
      <div class="invite-success__title">✅ Liga "${e.name}" creada</div>
      <p class="invite-success__text">Comparte este enlace para invitar a tus amigos:</p>
      <div class="invite-link-box">
        <span class="invite-link-box__url" id="inviteLinkText">${a}</span>
        <button class="btn btn--sm btn--outline" id="btnCopyLink">Copiar</button>
      </div>
      ${navigator.share?'<button class="btn btn--primary" id="btnShare">Compartir</button>':""}
      <a href="#/ligas/${e.id}" class="btn btn--ghost">Ir a la liga</a>
    </div>
  `,(s=document.getElementById("btnCopyLink"))==null||s.addEventListener("click",async()=>{try{await navigator.clipboard.writeText(a),g("Enlace copiado")}catch{g("No se pudo copiar","error")}}),(n=document.getElementById("btnShare"))==null||n.addEventListener("click",async()=>{try{await navigator.share({title:`Únete a ${e.name} en PickGoal`,url:a})}catch{}}))}async function ca(e,{params:a}){var s,n,i,o,r;const t=parseInt(a.id);e.innerHTML='<div class="loading"><div class="loading__spinner"></div></div>';try{const d=await l.leagues.get(t),{league:c,ranking:b,is_member:p,is_admin_view:_}=d,h=y.getUser(),f=c.is_official?'<span class="league-badge league-badge--official">⭐ Oficial</span>':"";e.innerHTML=`
      <div class="container">
        <a href="#/ligas" class="back-link">← Volver a ligas</a>

        ${_?`
          <div class="admin-notice">Vista administrador — no participas en esta liga</div>
        `:""}

        <div class="league-header">
          <h1 class="page-title">${c.name} ${f}</h1>
          ${c.description?`<p class="league-header__desc">${c.description}</p>`:""}
          <div class="league-header__meta">
            <span>${c.is_public?"🌍 Pública":"🔒 Privada"}</span>
            <span>${c.member_count} participantes</span>
            ${c.prize?`<span>🏆 ${c.prize}</span>`:""}
          </div>
        </div>

        ${(p||h!=null&&h.is_admin)&&c.invite_link?`
          <div class="invite-share-box">
            <span class="invite-share-box__label">Enlace de invitación:</span>
            <div class="invite-link-box">
              <span class="invite-link-box__url">${c.invite_link}</span>
              <button class="btn btn--sm btn--outline" id="btnCopyInvite">Copiar</button>
              ${navigator.share?'<button class="btn btn--sm btn--ghost" id="btnShareInvite">Compartir</button>':""}
            </div>
          </div>
        `:""}

        <div class="league-actions">
          ${p?'<button class="btn btn--danger btn--sm" id="btnLeave">Abandonar liga</button>':!(h!=null&&h.is_admin)&&h?'<button class="btn btn--primary" id="btnJoin">Unirse a esta liga</button>':""}
          ${h!=null&&h.is_admin||p&&h&&c.created_by===h.id?'<button class="btn btn--outline btn--sm" id="btnEditLeague">Editar liga</button>':""}
        </div>

        <div class="league-tabs">
          <button class="league-tab league-tab--active" id="tabRanking">Clasificación</button>
          <button class="league-tab" id="tabTablon">💬 Tablón</button>
        </div>

        <section class="section" id="sectionRanking">
          <table class="ranking-table">
            <thead>
              <tr><th>#</th><th>Usuario</th><th>País</th><th>Puntos</th></tr>
            </thead>
            <tbody>
              ${b.map($=>`
                <tr class="${h&&$.id===h.id?"ranking-table__row--me":""}">
                  <td>${$.position}</td>
                  <td>${$.username}</td>
                  <td>${$.country||"—"}</td>
                  <td class="ranking-table__pts">${$.total_points}</td>
                </tr>
              `).join("")}
            </tbody>
          </table>
        </section>

        <section class="section hidden" id="sectionTablon">
          <div id="tablonEmbed"></div>
        </section>
      </div>
    `,(s=document.getElementById("btnCopyInvite"))==null||s.addEventListener("click",async()=>{try{await navigator.clipboard.writeText(c.invite_link),g("Enlace copiado")}catch{g("No se pudo copiar","error")}}),(n=document.getElementById("btnShareInvite"))==null||n.addEventListener("click",async()=>{try{await navigator.share({title:`Únete a ${c.name} en PickGoal`,url:c.invite_link})}catch{}}),(i=document.getElementById("btnLeave"))==null||i.addEventListener("click",async()=>{if(confirm("¿Seguro que quieres abandonar esta liga?"))try{await l.leagues.leave(t),g("Has abandonado la liga"),S.navigate("/ligas")}catch($){g($.message,"error")}}),(o=document.getElementById("btnJoin"))==null||o.addEventListener("click",async()=>{try{await l.leagues.join({league_id:t}),g("¡Te has unido a la liga!"),S.navigate(`/ligas/${t}`)}catch($){g($.message,"error")}}),(r=document.getElementById("btnEditLeague"))==null||r.addEventListener("click",()=>{ua(c,t,h)});const E=document.getElementById("tabRanking"),j=document.getElementById("tabTablon"),M=document.getElementById("sectionRanking"),L=document.getElementById("sectionTablon");E&&j&&(E.addEventListener("click",()=>{E.classList.add("league-tab--active"),j.classList.remove("league-tab--active"),M.classList.remove("hidden"),L.classList.add("hidden")}),j.addEventListener("click",()=>{j.classList.add("league-tab--active"),E.classList.remove("league-tab--active"),M.classList.add("hidden"),L.classList.remove("hidden");const $=document.getElementById("tablonEmbed");$&&!$.dataset.loaded&&($.dataset.loaded="1",ue($,{query:{liga:String(t)}}))}))}catch(d){e.innerHTML=`<div class="container"><p class="form__error">Error: ${d.message}</p><a href="#/ligas">Volver</a></div>`}}function ua(e,a,t){const s=document.getElementById("editLeagueModal");s&&s.remove();const n=document.createElement("div");n.id="editLeagueModal",n.className="edit-league-modal",n.innerHTML=`
    <div class="edit-league-modal__overlay"></div>
    <div class="edit-league-modal__box">
      <h2 class="edit-league-modal__title">Editar liga</h2>
      <form class="form" id="editLeagueForm">
        <div class="form__group">
          <label class="form__label" for="editName">Nombre</label>
          <input class="form__input" type="text" id="editName" value="${e.name}" required maxlength="100" />
        </div>
        <div class="form__group">
          <label class="form__label" for="editDesc">Descripción</label>
          <input class="form__input" type="text" id="editDesc" value="${e.description||""}" maxlength="300" />
        </div>
        <div class="form__group">
          <label class="form__label" for="editPrize">Premio</label>
          <input class="form__input" type="text" id="editPrize" value="${e.prize||""}" maxlength="200" />
        </div>
        <div class="form__group form__group--checkbox">
          <input type="checkbox" id="editPublic" ${e.is_public?"checked":""} />
          <label for="editPublic">Liga pública</label>
        </div>
        ${t!=null&&t.is_admin?`
          <div class="form__group form__group--checkbox">
            <input type="checkbox" id="editOfficial" ${e.is_official?"checked":""} />
            <label for="editOfficial">⭐ Liga Oficial</label>
          </div>
        `:""}
        <div class="form__actions">
          <button class="btn btn--primary" type="submit" id="btnSaveEdit">Guardar cambios</button>
          <button class="btn btn--ghost" type="button" id="btnCancelEdit">Cancelar</button>
        </div>
      </form>
    </div>
  `,document.body.appendChild(n),requestAnimationFrame(()=>n.classList.add("edit-league-modal--open"));const i=()=>{n.classList.remove("edit-league-modal--open"),n.addEventListener("transitionend",()=>n.remove(),{once:!0})};n.querySelector(".edit-league-modal__overlay").addEventListener("click",i),document.getElementById("btnCancelEdit").addEventListener("click",i),document.getElementById("editLeagueForm").addEventListener("submit",async o=>{o.preventDefault();const r=document.getElementById("btnSaveEdit");r.disabled=!0,r.textContent="Guardando…";const d={name:document.getElementById("editName").value.trim(),description:document.getElementById("editDesc").value.trim(),prize:document.getElementById("editPrize").value.trim(),is_public:document.getElementById("editPublic").checked};t!=null&&t.is_admin&&(d.is_official=document.getElementById("editOfficial").checked);try{await l.leagues.update(a,d),g("Liga actualizada"),i(),S.navigate(`/ligas/${a}`)}catch(c){g(c.message,"error"),r.disabled=!1,r.textContent="Guardar cambios"}})}async function ma(e){var t,s,n,i,o,r;e.innerHTML='<div class="loading"><div class="loading__spinner"></div></div>';const a=y.getUser();try{const[d,c,b]=await Promise.all([l.clasificacion.division(),l.auth.me(),a!=null&&a.is_admin?l.leagues.adminAll():Promise.resolve({leagues:[]})]),p=c.user,_=p.status,h=p.total_points_all_time,f=(t=d.standings)==null?void 0:t.find(E=>E.user_id===p.id);e.innerHTML=`
      <div class="container">
        <h1 class="page-title">Mi Perfil</h1>

        ${a!=null&&a.is_admin?`
          <a href="#/admin" class="admin-shortcut">
            🛠️ Panel de Administración
          </a>
        `:""}

        <section class="profile-card section">
          <div class="profile-card__info">
            <div class="profile-card__avatar">${a.username[0].toUpperCase()}</div>
            <div>
              <h2>${a.username}</h2>
              <div class="profile-card__email-row">
                <p id="emailDisplay">${p.email}</p>
                <button class="btn btn--ghost btn--xs" id="btnEditEmail" title="Cambiar email">✏️</button>
              </div>
              <div class="profile-card__email-edit hidden" id="emailEditForm">
                <input class="form__input" type="email" id="emailInput" value="${p.email}" autocomplete="email" />
                <div class="profile-card__email-actions">
                  <button class="btn btn--primary btn--xs" id="btnSaveEmail">Guardar</button>
                  <button class="btn btn--ghost btn--xs" id="btnCancelEmail">Cancelar</button>
                </div>
                <p class="form__error hidden" id="emailError"></p>
              </div>
              <p>${a.country||"Sin país"}</p>
            </div>
          </div>
          ${ga(_,h)}
          <button class="btn btn--danger" id="btnLogoutPerfil">Cerrar sesión</button>
          <div class="profile-card__stats">
            <div class="stat">
              <span class="stat__value">${f?`${f.pos}º`:"—"}</span>
              <span class="stat__label">Posición div.</span>
            </div>
            <div class="stat">
              <span class="stat__value">${f?k(f.pts_division):"—"}</span>
              <span class="stat__label">Pts división</span>
            </div>
          </div>
        </section>

        <section class="section prize-banner">
          <span class="prize-banner__icon">🏆</span>
          <div>
            <strong>Premio temporada 26/27</strong>
            <p>Camiseta de tu equipo favorito para el campeón de la clasificación general</p>
          </div>
        </section>

        <section class="section">
          <h2>Mi División</h2>
          ${f?`<div class="division-info">
                 <p class="division-info__name">${d.league_name||"PickGoal División"}</p>
                 <div class="division-info__stats">
                   <div class="division-info__stat">
                     <span>${f.pos}º</span>
                     <small>de ${d.standings.length}</small>
                   </div>
                   <div class="division-info__stat">
                     <span>${k(f.pts_division)}</span>
                     <small>pts división</small>
                   </div>
                   <div class="division-info__stat">
                     <span>${k(f.pts_general)}</span>
                     <small>pts total</small>
                   </div>
                   <div class="division-info__stat">
                     <span>${f.pj}</span>
                     <small>partidos</small>
                   </div>
                 </div>
                 <a href="#/tabla-v2" class="btn btn--ghost btn--sm">Ver tabla completa</a>
               </div>`:'<p class="empty">No perteneces a ninguna división todavía.</p>'}
        </section>

        <section class="section" id="predStatsSection">
          <h2>Mis predicciones</h2>
          <div id="predStatsWrap"><div class="loading"><div class="loading__spinner"></div></div></div>
        </section>

        <section class="section">
          <div class="mensajes-header">
            <h2>💬 Mensajes privados</h2>
            <a href="#/mensajes" class="btn btn--ghost btn--xs">Ver todos</a>
          </div>
          <div id="conversacionesList"><div class="loading"><div class="loading__spinner"></div></div></div>

          <div class="mensajes-header" style="margin-top:1.5rem">
            <h3 style="font-size:1rem;font-weight:600">📣 Menciones en tablón</h3>
            <a href="#/tabla-v2?tab=tablon" class="btn btn--ghost btn--xs">Ver tablón</a>
          </div>
          <div id="mencionesTablon"><div class="loading"><div class="loading__spinner"></div></div></div>
        </section>

        <section class="section section--danger">
          <h2>Zona de peligro</h2>
          <button class="btn btn--danger btn--sm" id="btnDeleteAccount">Cerrar cuenta</button>
        </section>

        ${a!=null&&a.is_admin&&b.leagues.length?`
          <section class="section">
            <h2>Ligas gestionadas</h2>
            <ul class="leagues-list">
              ${b.leagues.map(E=>`
                <li>
                  <span>${E.is_official?"⭐ ":""}${E.name}</span>
                  <span class="tag">${E.is_public?"Pública":"Privada"}</span>
                  <a href="#/ligas/${E.id}" class="btn btn--sm btn--outline">Gestionar</a>
                </li>
              `).join("")}
            </ul>
          </section>
        `:""}
      </div>
    `,(s=e.querySelector("#btnLogoutPerfil"))==null||s.addEventListener("click",()=>{y.logout(),window.location.hash="/"}),(n=e.querySelector("#btnEditEmail"))==null||n.addEventListener("click",()=>{e.querySelector("#emailEditForm").classList.remove("hidden"),e.querySelector("#emailInput").focus()}),(i=e.querySelector("#btnCancelEmail"))==null||i.addEventListener("click",()=>{e.querySelector("#emailEditForm").classList.add("hidden"),e.querySelector("#emailError").classList.add("hidden")}),(o=e.querySelector("#btnSaveEmail"))==null||o.addEventListener("click",async()=>{const E=e.querySelector("#emailInput").value.trim(),j=e.querySelector("#emailError");if(j.classList.add("hidden"),!E){j.textContent="El email no puede estar vacío",j.classList.remove("hidden");return}if(!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(E)){j.textContent="Formato de email inválido",j.classList.remove("hidden");return}try{const{user:L}=await l.auth.updateEmail(E);y.setUser(L,localStorage.getItem("token")),e.querySelector("#emailDisplay").textContent=L.email,e.querySelector("#emailEditForm").classList.add("hidden"),g("Email actualizado")}catch(L){j.textContent=L.message,j.classList.remove("hidden")}}),(r=e.querySelector("#btnDeleteAccount"))==null||r.addEventListener("click",()=>{ba()}),_a(e),pa(e),va(e)}catch(d){e.innerHTML=`<div class="container"><p class="form__error">Error: ${d.message}</p></div>`}}function q(e){return String(e||"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;")}async function pa(e){const a=e.querySelector("#conversacionesList");if(a)try{const{conversations:t}=await l.messages.list();if(!t.length){a.innerHTML='<p class="empty">Sin conversaciones aún.</p>';return}a.innerHTML=t.slice(0,5).map(s=>`
      <a href="#/mensajes/${s.user_id}" class="mensajes-item">
        <div class="mensajes-item__avatar">${q(s.username[0].toUpperCase())}</div>
        <div class="mensajes-item__info">
          <div class="mensajes-item__header">
            <strong class="mensajes-item__name">${q(s.username)}</strong>
            ${s.unread_count>0?`<span class="mensajes-item__badge">${s.unread_count}</span>`:""}
          </div>
          <p class="mensajes-item__preview">${q(s.last_message)}</p>
        </div>
      </a>
    `).join("")}catch{a.innerHTML='<p class="empty">Sin conversaciones aún.</p>'}}async function va(e){const a=e.querySelector("#mencionesTablon");if(a)try{const t=localStorage.getItem("tablon_general_last_read")||new Date(0).toISOString(),{messages:s}=await l.board.mentions(t);if(!s||!s.length){a.innerHTML='<p class="empty">Sin menciones recientes.</p>';return}a.innerHTML=s.slice(0,5).map(n=>`
      <a href="#/tabla-v2?tab=tablon" class="mensajes-item">
        <div class="mensajes-item__avatar">${q(n.username[0].toUpperCase())}</div>
        <div class="mensajes-item__info">
          <div class="mensajes-item__header">
            <strong class="mensajes-item__name">${q(n.username)}</strong>
            <span class="mensajes-item__time">${B(n.created_at)}</span>
          </div>
          <p class="mensajes-item__preview">${q(n.message)}</p>
        </div>
      </a>
    `).join("")}catch{a.innerHTML='<p class="empty">Sin menciones recientes.</p>'}}function ga(e,a){if(e.next_threshold===null)return`
      <div class="level-progress">
        <div class="level-progress__header">
          <span class="status-badge">${e.emoji} ${e.name}</span>
          <span class="level-progress__label">¡Nivel máximo alcanzado!</span>
        </div>
        <div class="level-progress__bar"><div class="level-progress__fill" style="width:100%"></div></div>
      </div>`;const s=Math.min(100,Math.round((a-e.threshold)/(e.next_threshold-e.threshold)*100));return`
    <div class="level-progress">
      <div class="level-progress__header">
        <span class="status-badge">${e.emoji} ${e.name}</span>
        <span class="level-progress__label">${k(a)} / ${e.next_threshold} pts → ${e.next_emoji||""} ${e.next_name}</span>
      </div>
      <div class="level-progress__bar"><div class="level-progress__fill" style="width:${s}%"></div></div>
    </div>`}async function _a(e){var t,s;const a=e.querySelector("#predStatsWrap");if(a)try{const{total_predictions:n,correct_results:i,predictions:o}=await l.jornada.myStats();if(n===0){a.innerHTML='<p class="empty">Aún no tienes predicciones en esta temporada.</p>';return}const r=Math.round(i/n*100),d=50,c=+(2*Math.PI*d).toFixed(2),b=+(r/100*c).toFixed(2),p=+(c-b).toFixed(2);a.innerHTML=`
      <div class="pred-circle-wrap" id="predCircleBtn" role="button" tabindex="0" title="Ver detalle">
        <div class="pred-circle__chart">
          <svg viewBox="0 0 120 120" aria-hidden="true">
            <circle cx="60" cy="60" r="${d}" fill="none" stroke="#1a1a1a" stroke-width="12"/>
            <circle cx="60" cy="60" r="${d}" fill="none" stroke="#39FF14" stroke-width="12"
              stroke-dasharray="${b} ${p}" stroke-linecap="round"
              transform="rotate(-90 60 60)" class="pred-circle__arc"/>
          </svg>
          <div class="pred-circle__label">
            <span class="pred-circle__pct">${r}%</span>
          </div>
        </div>
        <p class="pred-circle__sub">${n} predicciones · ${i} acertadas</p>
        <span class="btn btn--ghost btn--xs" style="margin-top:4px">Ver detalle →</span>
      </div>
    `,(t=a.querySelector("#predCircleBtn"))==null||t.addEventListener("click",()=>{fe(o)}),(s=a.querySelector("#predCircleBtn"))==null||s.addEventListener("keydown",_=>{(_.key==="Enter"||_.key===" ")&&fe(o)})}catch{a.innerHTML='<p class="empty">No se pudieron cargar las predicciones.</p>'}}function fe(e){var i,o;let a="all";const t=document.createElement("div");t.className="pred-modal",t.innerHTML=`
    <div class="pred-modal__overlay" id="predModalOverlay"></div>
    <div class="pred-modal__box">
      <div class="pred-modal__header">
        <h3 class="pred-modal__title">Mis predicciones</h3>
        <button class="pred-modal__close" id="predModalClose" aria-label="Cerrar">✕</button>
      </div>
      <div class="pred-modal__filters">
        <button class="pred-filter pred-filter--active" data-filter="all">Todos</button>
        <button class="pred-filter" data-filter="correct">✅ Acertados</button>
        <button class="pred-filter" data-filter="wrong">❌ Fallados</button>
      </div>
      <div class="pred-modal__list" id="predModalList"></div>
    </div>
  `,document.body.appendChild(t),document.body.style.overflow="hidden",requestAnimationFrame(()=>t.classList.add("pred-modal--open"));function s(){const r=a==="all"?e:a==="correct"?e.filter(c=>c.is_correct):e.filter(c=>c.result_known&&!c.is_correct),d=document.getElementById("predModalList");if(d){if(!r.length){d.innerHTML='<p class="empty" style="text-align:center;padding:1rem">Sin predicciones en este filtro.</p>';return}d.innerHTML=r.map(c=>{const b=c.result_known?c.is_correct?"✅":"❌":"⏳",p=c.score?`${c.score}`:"—",_=c.result_known?`+${k(c.points_earned)} pts`:"—";return`
        <div class="pred-item ${c.is_correct?"pred-item--correct":c.result_known?"pred-item--wrong":""}">
          <span class="pred-item__icon">${b}</span>
          <div class="pred-item__body">
            <p class="pred-item__teams">${q(c.home_team)} vs ${q(c.away_team)}</p>
            <div class="pred-item__row">
              <span class="pred-item__pred">Pred: <strong>${c.predicted_result}</strong></span>
              ${c.actual_result?`<span class="pred-item__actual">Real: <strong>${c.actual_result}</strong> (${p})</span>`:'<span class="pred-item__actual">Sin resultado</span>'}
              <span class="pred-item__pts ${c.is_correct?"pred-item__pts--ok":""}">${_}</span>
            </div>
          </div>
        </div>
      `}).join("")}}s(),t.querySelectorAll(".pred-filter").forEach(r=>{r.addEventListener("click",()=>{t.querySelectorAll(".pred-filter").forEach(d=>d.classList.remove("pred-filter--active")),r.classList.add("pred-filter--active"),a=r.dataset.filter,s()})});function n(){t.classList.remove("pred-modal--open"),document.body.style.overflow="",t.addEventListener("transitionend",()=>t.remove(),{once:!0})}(i=document.getElementById("predModalClose"))==null||i.addEventListener("click",n),(o=document.getElementById("predModalOverlay"))==null||o.addEventListener("click",n)}function ba(){const e=document.createElement("div");e.className="delete-modal",e.innerHTML=`
    <div class="delete-modal__overlay" id="deleteOverlay"></div>
    <div class="delete-modal__box">
      <h3 class="delete-modal__title">⚠️ Cerrar cuenta</h3>
      <p class="delete-modal__text">
        Esta acción es irreversible. Tu posición en la división será ocupada por un bot.
      </p>
      <p class="delete-modal__confirm-label">Escribe <strong>CERRAR</strong> para confirmar:</p>
      <input class="form__input" id="deleteConfirmInput" type="text" placeholder="CERRAR" autocomplete="off" />
      <div class="delete-modal__actions">
        <button class="btn btn--ghost btn--sm" id="deleteCancelBtn">Cancelar</button>
        <button class="btn btn--danger btn--sm" id="deleteConfirmBtn" disabled>Cerrar mi cuenta</button>
      </div>
      <p id="deleteError" class="form__error hidden"></p>
    </div>
  `,document.body.appendChild(e),document.body.style.overflow="hidden",requestAnimationFrame(()=>e.classList.add("delete-modal--open"));const a=e.querySelector("#deleteConfirmInput"),t=e.querySelector("#deleteConfirmBtn"),s=e.querySelector("#deleteCancelBtn"),n=e.querySelector("#deleteOverlay"),i=e.querySelector("#deleteError");function o(){e.classList.remove("delete-modal--open"),document.body.style.overflow="",e.addEventListener("transitionend",()=>e.remove(),{once:!0})}a.addEventListener("input",()=>{t.disabled=a.value.trim()!=="CERRAR"}),s.addEventListener("click",o),n.addEventListener("click",o),t.addEventListener("click",async()=>{t.disabled=!0,t.textContent="Cerrando…",i.classList.add("hidden");try{await l.auth.deleteAccount(),o(),y.logout(),g("Cuenta cerrada. Hasta pronto."),window.location.hash="/"}catch(r){i.textContent=r.message||"Error al cerrar la cuenta",i.classList.remove("hidden"),t.disabled=!1,t.textContent="Cerrar mi cuenta"}})}function ha(){window.location.hash="/"}async function fa(e){if(!y.isAdmin()){e.innerHTML='<div class="container"><p class="form__error">Acceso denegado.</p></div>';return}e.innerHTML='<div class="loading"><div class="loading__spinner"></div></div>';try{const{users:a}=await l.auth.users();e.innerHTML=`
      <div class="container">
        <h1 class="page-title">Panel de Administración</h1>

        <section class="section admin-section">
          <h2 class="admin-section__title">Scheduler</h2>
          <p class="admin-section__desc">Sincroniza el calendario cada 24h y actualiza partidos en vivo cada 5 min.</p>
          <button class="btn btn--primary" id="btnSync">Sincronizar ahora</button>
          <div id="syncResult"></div>
        </section>

        <section class="section admin-section">
          <h2 class="admin-section__title">Notificaciones push</h2>
          <form class="form" id="pushForm">
            <div class="form__group">
              <label class="form__label">Título</label>
              <input class="form__input" type="text" id="pushTitle" placeholder="PickGoal" maxlength="80" />
            </div>
            <div class="form__group">
              <label class="form__label">Mensaje</label>
              <input class="form__input" type="text" id="pushBody" placeholder="Texto de la notificación" maxlength="200" />
            </div>
            <div class="form__group">
              <label class="form__label">Destinatario</label>
              <select class="form__input" id="pushTarget">
                <option value="all">Todos los usuarios</option>
                <option value="league">Liga (por ID)</option>
                <option value="user">Usuario (por ID)</option>
              </select>
            </div>
            <div class="form__group hidden" id="pushTargetIdGroup">
              <label class="form__label">ID</label>
              <input class="form__input" type="number" id="pushTargetId" placeholder="ID de liga o usuario" min="1" />
            </div>
            <button class="btn btn--primary" type="submit">Enviar notificación</button>
            <span id="pushResult" style="margin-left:12px;font-size:13px;"></span>
          </form>
        </section>

        <section class="section admin-section" id="jornadasV2Section">
          <h2 class="admin-section__title">Gestión de Jornadas v2</h2>
          <div id="jornadasV2Content">
            <div class="loading"><div class="loading__spinner"></div></div>
          </div>
        </section>

        <section class="section admin-section">
          <h2 class="admin-section__title">Cerrar temporada</h2>
          <p class="admin-section__desc">Marca la temporada actual como finalizada. Esta acción es irreversible.</p>
          <button class="btn btn--danger" id="btnCloseSeason">Cerrar temporada</button>
          <span id="closeSeasonResult" style="margin-left:12px;font-size:13px;"></span>
        </section>

        <section class="section admin-section">
          <h2 class="admin-section__title">Usuarios (${a.length})</h2>
          <div class="admin-table-wrapper">
            <table class="admin-table">
              <thead>
                <tr>
                  <th>ID</th><th>Usuario</th><th>Email</th><th>País</th><th>Admin</th><th>Muted</th><th>Acción</th>
                </tr>
              </thead>
              <tbody id="usersTableBody">
                ${a.map($a).join("")}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    `,ya(e),ae(e)}catch(a){e.innerHTML=`<div class="container"><p class="form__error">Error: ${a.message}</p></div>`}}function ya(e){var s,n,i,o;(s=document.getElementById("btnSync"))==null||s.addEventListener("click",async()=>{const r=document.getElementById("syncResult");r.textContent="Sincronizando…";try{await l.matches.sync(),r.textContent="✓ Sincronización completada",g("Sincronización completada")}catch(d){r.textContent=`Error: ${d.message}`,g(d.message,"error")}});const a=document.getElementById("pushTarget"),t=document.getElementById("pushTargetIdGroup");a==null||a.addEventListener("change",()=>{t.classList.toggle("hidden",a.value==="all")}),(n=document.getElementById("pushForm"))==null||n.addEventListener("submit",async r=>{r.preventDefault();const d=document.getElementById("pushTitle").value.trim()||"Aviso",c=document.getElementById("pushBody").value.trim(),b=a.value,p=parseInt(document.getElementById("pushTargetId").value)||null,_=document.getElementById("pushResult"),h={title:`📣 PickGoal — ${d}`,body:c};b==="league"&&p&&(h.league_id=p),b==="user"&&p&&(h.user_id=p),_.textContent="Enviando…";try{const{sent:f}=await l.notifications.send(h);_.textContent=`✓ Enviada a ${f} suscripción(es)`,g(`Notificación enviada a ${f} suscripción(es)`)}catch(f){_.textContent=`Error: ${f.message}`,g(f.message,"error")}}),(i=document.getElementById("btnCloseSeason"))==null||i.addEventListener("click",async()=>{if(!confirm("¿Cerrar la temporada actual? Esta acción es irreversible."))return;const r=document.getElementById("btnCloseSeason"),d=document.getElementById("closeSeasonResult");r.disabled=!0,d.textContent="Cerrando…";try{const{message:c}=await l.post("/v2/admin/season/1/close");d.textContent=`✓ ${c||"Temporada cerrada"}`,g("Temporada cerrada")}catch(c){d.textContent=`Error: ${c.message}`,g(c.message,"error"),r.disabled=!1}}),(o=document.getElementById("usersTableBody"))==null||o.addEventListener("click",async r=>{const d=r.target.closest(".toggle-admin");if(d){const b=parseInt(d.dataset.id);try{const{user:p}=await l.auth.toggleAdmin(b);d.closest("tr").querySelector(".admin-badge").textContent=p.is_admin?"Sí":"No",g(`${p.username} ${p.is_admin?"ahora es admin":"ya no es admin"}`)}catch(p){g(p.message,"error")}return}const c=r.target.closest(".toggle-mute");if(c){const b=parseInt(c.dataset.id);try{const{user:p}=await l.auth.toggleMute(b),_=c.closest("tr");_.querySelector(".mute-badge").textContent=p.is_muted?"Sí":"No",c.textContent=p.is_muted?"Activar":"Silenciar",g(`${p.username} ${p.is_muted?"silenciado":"activado"}`)}catch(p){g(p.message,"error")}}})}function $a(e){return`
    <tr>
      <td>${e.id}</td>
      <td>${e.username}</td>
      <td>${e.email}</td>
      <td>${e.country||"—"}</td>
      <td><span class="admin-badge">${e.is_admin?"Sí":"No"}</span></td>
      <td><span class="mute-badge">${e.is_muted?"Sí":"No"}</span></td>
      <td style="display:flex;gap:6px;flex-wrap:wrap">
        <button class="btn btn--ghost btn--xs toggle-admin" data-id="${e.id}">
          ${e.is_admin?"Quitar admin":"Hacer admin"}
        </button>
        <button class="btn btn--ghost btn--xs toggle-mute" data-id="${e.id}">
          ${e.is_muted?"Activar":"Silenciar"}
        </button>
      </td>
    </tr>
  `}const Ea={PD:"🇪🇸 LaLiga",PL:"🏴󠁧󠁢󠁥󠁮󠁧󠁿 Premier League",CL:"⭐ Champions League",SA:"🇮🇹 Serie A",BL1:"🇩🇪 Bundesliga",FL1:"🇫🇷 Ligue 1",PPL:"🇵🇹 Primeira Liga"};let x=[],ee=null;async function ae(e){const a=document.getElementById("jornadasV2Content");if(a)try{const{jornadas:t}=await l.adminV2.jornadas();a.innerHTML=La(t),ja(a)}catch(t){a.innerHTML=`<p class="form__error">Error: ${t.message}</p>`}}function La(e){const t=Da(new Date);return`
    <div class="jv2-panel">
      <div class="jv2-panel__actions">
        <button class="btn btn--primary btn--sm" id="btnNuevaJornada">+ Nueva jornada</button>
      </div>

      <div class="jv2-list">
        ${e.length===0?'<p class="admin-section__desc">No hay jornadas creadas.</p>':e.map(wa).join("")}
      </div>

      <div class="jv2-form" id="jv2Form" style="display:none">
        <h3 class="jv2-form__title" id="jv2FormTitle">Nueva jornada</h3>
        <input type="hidden" id="jv2EditId" value="" />

        <div class="jv2-form__row">
          <div class="form__group">
            <label class="form__label">Nº jornada</label>
            <input class="form__input" type="number" id="jv2Number" min="1" placeholder="1" style="width:90px" />
          </div>
          <div class="form__group">
            <label class="form__label">Fecha inicio</label>
            <input class="form__input" type="datetime-local" id="jv2DateStart" />
          </div>
          <div class="form__group">
            <label class="form__label">Fecha fin</label>
            <input class="form__input" type="datetime-local" id="jv2DateEnd" />
          </div>
        </div>

        <div class="jv2-form__week-row">
          <label class="form__label">Semana de partidos</label>
          <div style="display:flex;gap:8px;align-items:center">
            <input class="form__input" type="week" id="jv2Week" value="${t}" style="width:180px" />
            <button class="btn btn--ghost btn--sm" id="btnBuscarPartidos" type="button">Buscar partidos</button>
          </div>
        </div>

        <div id="jv2MatchPicker" style="display:none">
          <div class="jv2-counter">
            Seleccionados: <strong id="jv2Count">0</strong> / 10
            <span id="jv2CountWarn" class="jv2-counter__warn" style="display:none">Selecciona exactamente 10</span>
          </div>
          <div id="jv2MatchList" class="jv2-match-list"></div>
        </div>

        <div class="jv2-form__footer">
          <button class="btn btn--primary btn--sm" id="btnGuardarJornada">Guardar como borrador</button>
          <button class="btn btn--ghost btn--sm" id="btnCancelarJornada">Cancelar</button>
        </div>
      </div>
    </div>
  `}function wa(e){const a={draft:'<span class="admin-match-badge" style="background:rgba(61,145,255,0.15);color:#3d91ff;border:1px solid rgba(61,145,255,0.3)">Borrador</span>',upcoming:'<span class="admin-match-badge admin-match-badge--pending">Próxima</span>',active:'<span class="admin-match-badge admin-match-badge--done">Activa</span>',finished:'<span class="admin-match-badge" style="background:rgba(255,255,255,0.05);color:#6e6e6e;border:1px solid #222">Finalizada</span>'}[e.status]||`<span class="admin-match-badge">${e.status}</span>`,t=n=>n?new Date(n).toLocaleDateString("es-ES",{day:"2-digit",month:"2-digit"}):"—",s=e.status==="upcoming"||e.status==="active"||e.status==="finished";return`
    <div class="jv2-row" data-jornada-id="${e.id}">
      <div class="jv2-row__info">
        <span class="jv2-row__num">J${e.number}</span>
        <span class="jv2-row__dates">${t(e.date_start)} – ${t(e.date_end)}</span>
        ${a}
        <span class="jv2-row__matches">${e.match_count} partidos</span>
      </div>
      <div class="jv2-row__actions">
        ${e.status==="draft"?`
          <button class="btn btn--primary btn--xs jv2-pub-btn" data-id="${e.id}" data-num="${e.number}">Publicar</button>
          <button class="btn btn--ghost btn--xs jv2-edit-btn" data-id="${e.id}">Editar</button>
          <button class="btn btn--danger btn--xs jv2-del-btn" data-id="${e.id}" data-num="${e.number}">Eliminar</button>
        `:""}
        ${s?`
          <button class="btn btn--ghost btn--xs jv2-results-btn" data-id="${e.id}" data-num="${e.number}">Resultados</button>
        `:""}
      </div>
    </div>
    <div class="jv2-results-panel" id="jv2-results-${e.id}" style="display:none"></div>
  `}function ja(e){var a,t,s,n;(a=e.querySelector("#btnNuevaJornada"))==null||a.addEventListener("click",()=>{ee=null,x=[],document.getElementById("jv2FormTitle").textContent="Nueva jornada",document.getElementById("jv2EditId").value="",document.getElementById("jv2Number").value="",document.getElementById("jv2DateStart").value="",document.getElementById("jv2DateEnd").value="",document.getElementById("jv2MatchPicker").style.display="none",document.getElementById("jv2Form").style.display="block",me()}),(t=e.querySelector("#btnCancelarJornada"))==null||t.addEventListener("click",()=>{document.getElementById("jv2Form").style.display="none",x=[],ee=null}),(s=e.querySelector("#btnBuscarPartidos"))==null||s.addEventListener("click",ka),(n=e.querySelector("#btnGuardarJornada"))==null||n.addEventListener("click",Ca),e.querySelectorAll(".jv2-results-btn").forEach(i=>{i.addEventListener("click",()=>Ta(i.dataset.id,i))}),e.querySelectorAll(".jv2-pub-btn").forEach(i=>{i.addEventListener("click",async()=>{if(confirm(`¿Publicar jornada ${i.dataset.num}? Se calcularán cuotas, se asignarán duelos y se notificará a los usuarios.`)){i.disabled=!0,i.textContent="Publicando…";try{const o=await l.adminV2.publishJornada(i.dataset.id);g(`Jornada ${i.dataset.num} publicada — push enviado a ${o.push_sent} suscriptores`),await ae(document.getElementById("jornadasV2Section"))}catch(o){g(o.message,"error"),i.disabled=!1,i.textContent="Publicar"}}})}),e.querySelectorAll(".jv2-edit-btn").forEach(i=>{i.addEventListener("click",()=>Sa(i.dataset.id))}),e.querySelectorAll(".jv2-del-btn").forEach(i=>{i.addEventListener("click",async()=>{if(confirm(`¿Eliminar jornada ${i.dataset.num}?`))try{await l.adminV2.deleteJornada(i.dataset.id),g("Jornada eliminada"),ae(document.querySelector("#jornadasV2Content").parentElement.parentElement)}catch(o){g(o.message,"error")}})})}async function Sa(e){const{jornadas:a}=await l.adminV2.jornadas(),t=a.find(s=>String(s.id)===String(e));t&&(ee=t.id,x=[],document.getElementById("jv2FormTitle").textContent=`Editar jornada ${t.number}`,document.getElementById("jv2EditId").value=t.id,document.getElementById("jv2Number").value=t.number,t.date_start&&(document.getElementById("jv2DateStart").value=t.date_start.slice(0,16)),t.date_end&&(document.getElementById("jv2DateEnd").value=t.date_end.slice(0,16)),document.getElementById("jv2MatchPicker").style.display="none",document.getElementById("jv2Form").style.display="block",me())}async function ka(){const e=document.getElementById("btnBuscarPartidos"),a=document.getElementById("jv2Week").value;if(!a){g("Selecciona una semana","error");return}e.disabled=!0,e.textContent="Buscando…";try{const{matches:t}=await l.adminV2.partidos(a);Ia(t),document.getElementById("jv2MatchPicker").style.display="block"}catch(t){g(`Error: ${t.message}`,"error")}finally{e.disabled=!1,e.textContent="Buscar partidos"}}function Ia(e){const a=document.getElementById("jv2MatchList");if(Object.values(e).flat().length===0){a.innerHTML='<p class="admin-section__desc">No hay partidos disponibles para esta semana.</p>';return}a.innerHTML=Object.entries(e).map(([s,n])=>n.length?`
      <div class="jv2-comp-group">
        <div class="jv2-comp-group__title">${Ea[s]||s}</div>
        ${n.map(i=>`
          <label class="jv2-match-item">
            <input type="checkbox" class="jv2-match-check" data-match='${JSON.stringify(i)}' />
            <span class="jv2-match-item__teams">${i.home_team} vs ${i.away_team}</span>
            <span class="jv2-match-item__date">${xa(i.match_datetime)}</span>
          </label>
        `).join("")}
      </div>
    `:"").join(""),a.querySelectorAll(".jv2-match-check").forEach(s=>{s.addEventListener("change",()=>{const n=JSON.parse(s.dataset.match);if(s.checked){if(x.length>=10){s.checked=!1,g("Máximo 10 partidos","error");return}x.push(n)}else x=x.filter(i=>i.api_id!==n.api_id);me()})})}function me(){const e=document.getElementById("jv2Count"),a=document.getElementById("jv2CountWarn");e&&(e.textContent=x.length),a&&(a.style.display=x.length>0&&x.length!==10?"inline":"none")}async function Ca(){const e=parseInt(document.getElementById("jv2Number").value),a=document.getElementById("jv2DateStart").value,t=document.getElementById("jv2DateEnd").value,s=document.getElementById("jv2EditId").value;if(!e||!a||!t){g("Completa número y fechas","error");return}if(x.length!==10){g("Selecciona exactamente 10 partidos","error");return}const n={number:e,date_start:new Date(a).toISOString(),date_end:new Date(t).toISOString(),matches:x},i=document.getElementById("btnGuardarJornada");i.disabled=!0;try{s?(await l.adminV2.updateJornada(s,n),g(`Jornada ${e} actualizada`)):(await l.adminV2.createJornada(n),g(`Jornada ${e} guardada como borrador`)),document.getElementById("jv2Form").style.display="none",x=[],ee=null,await ae(document.getElementById("jornadasV2Section"))}catch(o){g(o.message,"error")}finally{i.disabled=!1}}function xa(e){return e?new Date(e).toLocaleDateString("es-ES",{day:"2-digit",month:"2-digit"}):"—"}async function Ta(e,a){const t=document.getElementById(`jv2-results-${e}`);if(t){if(t.style.display!=="none"){t.style.display="none",a.textContent="Resultados";return}a.disabled=!0,a.textContent="Cargando…";try{const{matches:s}=await l.adminV2.jornadaMatches(e);t.innerHTML=De(s,e),t.style.display="block",He(t,e),a.textContent="Ocultar"}catch(s){g(`Error: ${s.message}`,"error"),a.textContent="Resultados"}finally{a.disabled=!1}}}function Ba(e){if(e.jm_status==="cancelled")return'<span class="admin-match-badge admin-match-badge--cancelled">🔴 Suspendido</span>';if(e.jm_status==="finished")return`<span class="admin-match-badge admin-match-badge--done">🟢 Finalizado${e.home_score_90!=null&&e.away_score_90!=null?` ${e.home_score_90}–${e.away_score_90}`:""}</span>`;const a=Date.now(),t=new Date(e.match_datetime).getTime(),s=t+2*60*60*1e3;return a>=t&&a<=s?'<span class="admin-match-badge admin-match-badge--live">🔵 En juego</span>':a>s?'<span class="admin-match-badge admin-match-badge--stale">⚠️ ¿Ya se jugó? Introduce el resultado manualmente</span>':'<span class="admin-match-badge admin-match-badge--pending">🟡 Pendiente</span>'}function Pa(e){return e?new Date(e).toLocaleString("es-ES",{day:"2-digit",month:"2-digit",hour:"2-digit",minute:"2-digit"}):"—"}function De(e,a){const t=[...e].sort((s,n)=>new Date(n.match_datetime)-new Date(s.match_datetime));return`
    <div class="jv2-results-toolbar">
      <button class="btn btn--ghost btn--xs jv2-sync-btn" data-jornada-id="${a}">🔄 Sincronizar resultados ahora</button>
    </div>
    <div class="jv2-results-table">
      ${t.map(s=>{const n=s.jm_status==="cancelled";return`
          <div class="jv2-results-row ${n?"jv2-results-row--cancelled":""}" data-jm-id="${s.jornada_match_id}">
            <div class="jv2-results-row__meta">
              <span class="jv2-results-row__datetime">${Pa(s.match_datetime)}</span>
              <div class="jv2-results-row__teams">
                <span>${s.home_team}</span>
                <span class="jv2-results-row__vs">vs</span>
                <span>${s.away_team}</span>
              </div>
              ${Ba(s)}
            </div>
            <div class="jv2-results-row__controls">
              ${n?'<span style="color:var(--text-muted)">—</span>':`
                <input type="number" class="form__input jv2-score-input" data-side="home" min="0" max="99" value="${s.home_score_90??""}" placeholder="L" style="width:52px" />
                <span style="padding:0 4px">–</span>
                <input type="number" class="form__input jv2-score-input" data-side="away" min="0" max="99" value="${s.away_score_90??""}" placeholder="V" style="width:52px" />
                <select class="form__input jv2-r90-select" style="width:68px">
                  <option value="" ${s.result_90?"":"selected"}>Auto</option>
                  <option value="1" ${s.result_90==="1"?"selected":""}>1</option>
                  <option value="X" ${s.result_90==="X"?"selected":""}>X</option>
                  <option value="2" ${s.result_90==="2"?"selected":""}>2</option>
                </select>
                <button class="btn btn--primary btn--xs jv2-save-result-btn" data-jm-id="${s.jornada_match_id}">Guardar</button>
                <button class="btn btn--danger btn--xs jv2-cancel-match-btn" data-jm-id="${s.jornada_match_id}" data-home="${s.home_team}" data-away="${s.away_team}">Cancelar</button>
              `}
            </div>
          </div>
        `}).join("")}
    </div>
  `}function He(e,a){var t;(t=e.querySelector(".jv2-sync-btn"))==null||t.addEventListener("click",async s=>{const n=s.currentTarget;n.disabled=!0,n.textContent="⏳ Sincronizando…";try{await l.matches.sync(),g("Sincronización completada"),await re(a)}catch(i){g(i.message,"error"),n.disabled=!1,n.textContent="🔄 Sincronizar resultados ahora"}}),e.querySelectorAll(".jv2-save-result-btn").forEach(s=>{s.addEventListener("click",async()=>{var c,b,p;const n=s.dataset.jmId,i=e.querySelector(`.jv2-results-row[data-jm-id="${n}"]`),o=(c=i.querySelector('.jv2-score-input[data-side="home"]'))==null?void 0:c.value,r=(b=i.querySelector('.jv2-score-input[data-side="away"]'))==null?void 0:b.value,d=((p=i.querySelector(".jv2-r90-select"))==null?void 0:p.value)||void 0;if(o===""||r===""){g("Introduce los dos marcadores","error");return}s.disabled=!0,s.textContent="…";try{const _={home_score:parseInt(o),away_score:parseInt(r)};d&&(_.result_90=d),await l.adminV2.setResultado(n,_),g("Resultado guardado y puntos recalculados"),await re(a)}catch(_){g(_.message,"error"),s.disabled=!1,s.textContent="Guardar"}})}),e.querySelectorAll(".jv2-cancel-match-btn").forEach(s=>{s.addEventListener("click",async()=>{const{jmId:n,home:i,away:o}=s.dataset;if(confirm(`¿Cancelar el partido ${i} vs ${o}? Las unidades apostadas se devolverán a los usuarios.`)){s.disabled=!0,s.textContent="…";try{const{message:r}=await l.adminV2.cancelMatch(n);g(r),await re(a)}catch(r){g(r.message,"error"),s.disabled=!1,s.textContent="Cancelar"}}})})}async function re(e){const a=document.getElementById(`jv2-results-${e}`);if(!(!a||a.style.display==="none"))try{const{matches:t}=await l.adminV2.jornadaMatches(e);a.innerHTML=De(t,e),He(a,e)}catch(t){g(`Error recargando: ${t.message}`,"error")}}function Ma(e){const a=new Date(Date.UTC(e.getFullYear(),e.getMonth(),e.getDate())),t=a.getUTCDay()||7;a.setUTCDate(a.getUTCDate()+4-t);const s=new Date(Date.UTC(a.getUTCFullYear(),0,1));return Math.ceil(((a-s)/864e5+1)/7)}function Da(e){const a=new Date(e);a.setDate(a.getDate()+7);const t=a.getFullYear(),s=String(Ma(a)).padStart(2,"0");return`${t}-W${s}`}function Ha(e){e.innerHTML=`
    <div class="auth-container container">
      <div class="auth-card">
        <h2 class="auth-card__title">Recuperar contraseña</h2>
        <form class="form" id="forgotForm">
          <div class="form__group">
            <label class="form__label" for="email">Email</label>
            <input class="form__input" type="email" id="email" name="email"
              placeholder="tu@email.com" required />
          </div>
          <p id="forgotMsg" class="form__message hidden"></p>
          <button class="btn btn--primary btn--full" type="submit" id="forgotBtn">Enviar enlace</button>
        </form>
        <div class="auth-card__links">
          <a href="#/login">Volver al login</a>
        </div>
      </div>
    </div>
  `,document.getElementById("forgotForm").addEventListener("submit",async a=>{a.preventDefault();const t=document.getElementById("forgotBtn"),s=document.getElementById("forgotMsg"),n=document.getElementById("email").value.trim();t.disabled=!0,t.textContent="Enviando…";try{await l.auth.forgotPassword(n),s.textContent="Si el email existe, recibirás un enlace en breve.",s.classList.remove("hidden","form__error"),s.classList.add("form__success")}catch{g("Error al enviar el email","error")}finally{t.disabled=!1,t.textContent="Enviar enlace"}})}function qa(e,{query:a}){const t=a.token||"";if(!t){e.innerHTML='<div class="container"><p class="form__error">Token inválido o expirado.</p><a href="#/login">Volver</a></div>';return}e.innerHTML=`
    <div class="auth-container container">
      <div class="auth-card">
        <h2 class="auth-card__title">Nueva contraseña</h2>
        <form class="form" id="resetForm">
          <div class="form__group">
            <label class="form__label" for="password">Nueva contraseña</label>
            <input class="form__input" type="password" id="password" name="password"
              placeholder="Mínimo 6 caracteres" required minlength="6" />
          </div>
          <p id="resetError" class="form__error hidden"></p>
          <button class="btn btn--primary btn--full" type="submit" id="resetBtn">Guardar contraseña</button>
        </form>
      </div>
    </div>
  `,document.getElementById("resetForm").addEventListener("submit",async s=>{s.preventDefault();const n=document.getElementById("resetBtn"),i=document.getElementById("resetError"),o=document.getElementById("password").value;n.disabled=!0,n.textContent="Guardando…",i.classList.add("hidden");try{await l.auth.resetPassword(t,o),g("Contraseña actualizada. Ya puedes iniciar sesión."),S.navigate("/login")}catch(r){i.textContent=r.message||"Error al restablecer la contraseña",i.classList.remove("hidden")}finally{n.disabled=!1,n.textContent="Guardar contraseña"}})}async function Aa(e,{query:a}){const t=(a.codigo||"").trim().toUpperCase();if(!t){e.innerHTML='<div class="container"><p class="form__error">Enlace de invitación inválido.</p><a href="#/ligas">Ver ligas</a></div>';return}if(!y.isLoggedIn()){sessionStorage.setItem("pendingInviteCode",t),S.navigate("/register");return}e.innerHTML='<div class="loading"><div class="loading__spinner"></div></div>';try{const{league:s}=await l.leagues.joinByCode(t);g(`¡Te has unido a "${s.name}"!`),S.navigate(`/ligas/${s.id}`)}catch(s){if(s.status===409){g("Ya eres miembro de esta liga");try{const{leagues:n}=await l.leagues.my(),i=n.find(o=>o.invite_code===t);if(i){S.navigate(`/ligas/${i.id}`);return}}catch{}}e.innerHTML=`
      <div class="container">
        <div class="league-gate">
          <div class="league-gate__icon">⚠️</div>
          <h2 class="league-gate__title">Error al unirse</h2>
          <p class="league-gate__text">${s.message}</p>
          <a href="#/ligas" class="btn btn--primary">Ver ligas</a>
        </div>
      </div>
    `}}function Na(){const e=localStorage.getItem("activeLeagueId");return e?parseInt(e):null}async function Oa(e,{params:a}){const t=parseInt(a.id);if(!t){e.innerHTML='<div class="container"><p class="form__error">Usuario no válido.</p></div>';return}e.innerHTML='<div class="loading"><div class="loading__spinner"></div></div>';try{const s=Na(),{user:n,predictions:i}=await l.predictions.forUser(t,s);e.innerHTML=`
      <div class="container">
        <a class="jugador__back" href="#/ranking">← Tabla</a>

        <div class="jugador__header">
          <div class="jugador__avatar">${n.username.charAt(0).toUpperCase()}</div>
          <div class="jugador__info">
            <h1 class="jugador__name">${n.username}</h1>
            ${n.country?`<span class="jugador__country">${n.country}</span>`:""}
          </div>
        </div>

        <div class="jugador__stats">
          <div class="jugador__stat">
            <span class="jugador__stat-val">${n.total_points}</span>
            <span class="jugador__stat-label">Puntos</span>
          </div>
          <div class="jugador__stat">
            <span class="jugador__stat-val">${n.correct_results}</span>
            <span class="jugador__stat-label">1X2 acertados</span>
          </div>
          <div class="jugador__stat">
            <span class="jugador__stat-val">${n.exact_scores}</span>
            <span class="jugador__stat-label">Exactos</span>
          </div>
        </div>

        <h2 class="jugador__section-title">Predicciones en partidos jugados</h2>

        ${i.length===0?'<p class="empty">Sin pronósticos en partidos finalizados.</p>':`<div class="jugador__pred-list">
              ${i.map(o=>Ra(o)).join("")}
            </div>`}
      </div>
    `}catch(s){e.innerHTML=`<div class="container"><p class="form__error">Error: ${s.message}</p></div>`}}function Ra(e){const a=e.match,t=e.total_points,s=e.pts_score>0,n=e.pts_result>0;let i="";return s?i='<span class="jugador__badge jugador__badge--exact">Exacto</span>':n?i='<span class="jugador__badge jugador__badge--ok">1X2 ✓</span>':i='<span class="jugador__badge jugador__badge--miss">Fallo</span>',`
    <div class="jugador__pred-row">
      <div class="jugador__pred-match">
        <span class="jugador__pred-teams">${a.home_team} vs ${a.away_team}</span>
        <span class="jugador__pred-date">${B(a.match_datetime)}</span>
      </div>
      <div class="jugador__pred-scores">
        <span class="jugador__pred-real">${a.home_score_90} - ${a.away_score_90}</span>
        <span class="jugador__pred-arrow">→</span>
        <span class="jugador__pred-pick">${e.predicted_home} - ${e.predicted_away}</span>
      </div>
      <div class="jugador__pred-right">
        ${i}
        <span class="jugador__pred-pts">${t>0?`+${t}`:"0"} pts</span>
      </div>
    </div>
  `}const V=20,qe=5;let R={},O=0,le=null,ye=null;async function Ua(e){e.innerHTML='<div class="loading"><div class="loading__spinner"></div></div>';try{const{jornadas:a}=await l.jornada.list();if(!a.length){e.innerHTML=Ja();return}Ae(e,a,0)}catch(a){e.innerHTML=`<div class="container"><p class="form__error">Error cargando jornadas: ${a.message}</p></div>`}}function Ae(e,a,t){var d,c;ye=a[t];const{jornada:s,matches:n,units_used:i}=ye;R={};for(const b of n)R[b.jornada_match_id]={predicted_result:((d=b.prediction)==null?void 0:d.predicted_result)??null,units:((c=b.prediction)==null?void 0:c.units_wagered)??0};O=i;const o=n.filter(b=>!b.predict_locked);le=o.length===1?o[0].jornada_match_id:null;const r=a.length>1?`<div class="jornada-tabs">
        ${a.map((b,p)=>`
          <button class="jornada-tab ${p===t?"jornada-tab--active":""}" data-idx="${p}">
            J${b.jornada.number} · ${K(b.jornada.date_start)}–${K(b.jornada.date_end)}
          </button>
        `).join("")}
       </div>`:"";e.innerHTML=`
    <div class="container">
      <div class="page-title-row">
        <h1 class="page-title">Jornada ${s.number} — del ${K(s.date_start)} al ${K(s.date_end)}</h1>
        <button class="btn-info" id="btnPointsInfo" aria-label="Cómo funciona">ℹ️</button>
      </div>
      ${r}
      <div class="units-counter" id="unitsCounter"></div>
      <div class="jornada-matches">
        ${n.map(Va).join("")}
      </div>
      ${Y()}
    </div>
  `,Ne(),Oe(),Ga(e,a,t),Z(e)}function Ja(){return`
    <div class="container">
      <div class="jornada-empty">
        <div class="jornada-empty__icon">📅</div>
        <h2 class="jornada-empty__title">No hay jornadas disponibles</h2>
        <p class="jornada-empty__text">Todavía no hay una próxima jornada programada.</p>
      </div>
    </div>
  `}function K(e){return new Date(e).toLocaleDateString("es-ES",{day:"2-digit",month:"2-digit"})}function Fa(e){return new Date(e).toLocaleString("es-ES",{day:"2-digit",month:"2-digit",hour:"2-digit",minute:"2-digit"})}function de(e){return e!=null?e.toFixed(2):"—"}function za(e){return e.jm_status==="cancelled"?'<span class="tag tag--cancelled">Suspendido</span>':e.status==="finished"?`<span class="tag tag--done">Finalizado ${e.home_score_90??"?"}–${e.away_score_90??"?"}</span>`:e.predict_locked?'<span class="tag tag--locked">Bloqueado</span>':`<span class="tag tag--open">Abierto hasta ${Fa(e.opens_until)}</span>`}function Va(e){const a=e.jm_status==="cancelled",t=e.predict_locked,s=R[e.jornada_match_id]??{predicted_result:null,units:0};return`
    <div class="match-card jornada-match ${t?"match-card--locked":""} ${a?"match-card--cancelled":""}" data-jm-id="${e.jornada_match_id}">
      <div class="match-card__header">
        <span class="match-card__date">${B(e.match_datetime)}</span>
        ${za(e)}
      </div>
      <div class="match-card__teams">
        <span class="team team--home">${e.home_team}</span>
        <div class="match-card__score">
          ${e.status!=="scheduled"?`<span class="score">${e.home_score_90??"?"} - ${e.away_score_90??"?"}</span>`:'<span class="score score--dash">vs</span>'}
        </div>
        <span class="team team--away">${e.away_team}</span>
      </div>
      <div class="jornada-odds">
        <span class="jornada-odds__item"><b>1</b> (${de(e.odds_1)})</span>
        <span class="jornada-odds__item"><b>X</b> (${de(e.odds_x)})</span>
        <span class="jornada-odds__item"><b>2</b> (${de(e.odds_2)})</span>
      </div>
      <div class="jornada-match__controls ${t?"jornada-match__controls--disabled":""}">
        <div class="result-selector">
          ${["1","X","2"].map(n=>`
            <label class="result-selector__option">
              <input type="radio" name="result-${e.jornada_match_id}" value="${n}" ${s.predicted_result===n?"checked":""} ${t?"disabled":""} />
              ${n}
            </label>
          `).join("")}
        </div>
        <div class="jornada-units">
          <label class="jornada-units__label" for="units-${e.jornada_match_id}">Unidades</label>
          <input type="number" id="units-${e.jornada_match_id}" class="jornada-units__input" min="0" max="${qe}" value="${s.units}" ${t?"disabled":""} />
        </div>
      </div>
      ${t?"":`
        <div class="jornada-match__warning" id="warning-${e.jornada_match_id}"></div>
        <button class="btn btn--primary btn--full jornada-match__save-btn" data-jm-id="${e.jornada_match_id}">Guardar</button>
      `}
    </div>
  `}function Ne(){const e=document.getElementById("unitsCounter");if(!e)return;const a=O>V;e.innerHTML=`
    <div class="units-counter__bar">
      <div class="units-counter__fill ${a?"units-counter__fill--over":""}" style="width:${Math.min(100,O/V*100)}%"></div>
    </div>
    <span class="units-counter__label ${a?"units-counter__label--over":""}">${O}/${V} unidades usadas</span>
  `}function Oe(){if(!le)return;const e=document.getElementById(`warning-${le}`);if(!e)return;const a=V-O;e.innerHTML=a>0?`<p class="notice">Te quedan ${a} unidades — es tu último partido.</p>`:""}function $e(){O=Object.values(R).reduce((e,a)=>e+(a.predicted_result?a.units:0),0),Ne(),Oe()}function Ga(e,a,t){e.querySelectorAll(".jornada-tab").forEach(s=>{s.addEventListener("click",()=>{const n=parseInt(s.dataset.idx);n!==t&&Ae(e,a,n)})}),e.querySelectorAll(".jornada-match").forEach(s=>{var o;const n=parseInt(s.dataset.jmId);s.querySelectorAll('input[type="radio"]').forEach(r=>{r.addEventListener("change",()=>{R[n].predicted_result=r.value,$e()})});const i=s.querySelector(".jornada-units__input");i==null||i.addEventListener("input",()=>{let r=parseInt(i.value);isNaN(r)&&(r=0),r=Math.max(0,Math.min(qe,r)),R[n].units=r,$e()}),(o=s.querySelector(".jornada-match__save-btn"))==null||o.addEventListener("click",()=>Wa(n))})}async function Wa(e){const a=R[e];if(!a.predicted_result){g("Selecciona un resultado 1X2","error");return}if(O>V){g(`Superas el máximo de ${V} unidades`,"error");return}const t=document.querySelector(`.jornada-match__save-btn[data-jm-id="${e}"]`);t&&(t.disabled=!0,t.textContent="…");try{await l.jornada.predict({jornada_match_id:e,predicted_result:a.predicted_result,units:a.units}),g("Predicción guardada"),t&&(t.textContent="✓ Guardada")}catch(s){g(s.message||"Error al guardar","error")}finally{t&&(t.disabled=!1,setTimeout(()=>{t&&(t.textContent="Guardar")},2e3))}}let Q=null;function pe(){Q&&(clearInterval(Q),Q=null)}const Ee={en_curso:{label:"En curso",cls:"duelo-status--curso"},ganado:{label:"Ganaste",cls:"duelo-status--ganado"},perdido:{label:"Perdiste",cls:"duelo-status--perdido"},empate:{label:"Empate",cls:"duelo-status--empate"}},Xa={ganado:"🏆 Victoria",perdido:"💔 Derrota",empate:"🤝 Empate"};function Le(e){return new Date(e).toLocaleDateString("es-ES",{day:"2-digit",month:"2-digit"})}async function Ya(e){pe(),e.innerHTML='<div class="loading"><div class="loading__spinner"></div></div>';try{const[{duelos:a},t]=await Promise.all([l.duelo.list(),Promise.resolve(y.getUser())]);if(!a.length){e.innerHTML=`
        <div class="container">
          <h1 class="page-title">Duelos</h1>
          <div class="duelo-empty">
            <div class="duelo-empty__icon">🤝</div>
            <p class="duelo-empty__text">No tienes duelos todavía.</p>
          </div>
        </div>
      `;return}const s=a.findIndex(o=>o.jornada_status==="active"||o.jornada_status==="upcoming"),n=s>=0?s:a.length-1,i=a.map((o,r)=>`
      <button class="jornada-tab ${r===n?"jornada-tab--active":""}" data-idx="${r}">
        J${o.jornada_number} · ${Le(o.jornada_date_start)}–${Le(o.jornada_date_end)}
      </button>
    `).join("");e.innerHTML=`
      <div class="container">
        <div class="page-title-row">
          <h1 class="page-title">Duelos</h1>
          <button class="btn-info" id="btnPointsInfo" aria-label="Cómo funciona">ℹ️</button>
        </div>
        <div class="jornada-tabs">${i}</div>
        <div id="dueloContent"></div>
        ${Y()}
      </div>
    `,Z(e),e.querySelectorAll(".jornada-tab").forEach(o=>{o.addEventListener("click",()=>{e.querySelectorAll(".jornada-tab").forEach(r=>r.classList.remove("jornada-tab--active")),o.classList.add("jornada-tab--active"),we(e,a[parseInt(o.dataset.idx)],t)})}),await we(e,a[n],t)}catch(a){e.innerHTML=`<div class="container"><p class="form__error">Error cargando duelos: ${a.message}</p></div>`}}async function we(e,a,t){var i;pe();const s=e.querySelector("#dueloContent");if(!s)return;if(s.innerHTML='<div class="loading"><div class="loading__spinner"></div></div>',a.jornada_status==="active"||a.jornada_status==="upcoming")try{const{duelo:o}=await l.duelo.current();if(!o){s.innerHTML=Qa();return}if(s.innerHTML=Za(o,t),Se(s,o.division_league_id,t.id),!a.is_bye){const r=((i=a.rival)==null?void 0:i.username)??"—";je(t.username,r),Q=setInterval(()=>je(t.username,r),6e4)}}catch(o){s.innerHTML=`<p class="form__error">Error: ${o.message}</p>`}else s.innerHTML=Ka(a,t),Se(s,a.division_league_id,t.id)}function Za(e,a){var i;const t=Ee[e.status]??Ee.en_curso,s=e.rival?e.rival.username:a.username,n=!e.rival||e.rival.id===a.id;return`
    <div class="duelo-card">
      <span class="duelo-status ${t.cls}">${t.label}</span>
      <div class="duelo-card__matchup">
        <div class="duelo-card__player">
          <span class="duelo-card__name">${a.username}</span>
          <span class="duelo-card__pts">${k(e.my_points)}</span>
        </div>
        <span class="duelo-card__vs">VS</span>
        <div class="duelo-card__player">
          <span class="duelo-card__name">${n?"Descanso":s}</span>
          <span class="duelo-card__pts">${n?"—":k(e.rival_points)}</span>
        </div>
      </div>
    </div>

    ${n?"":'<div class="duelo-tracker" id="dueloTracker"></div>'}

    ${!n&&((i=e.matches)==null?void 0:i.length)>0?`
      <h2 class="section-title">Partido a partido</h2>
      <div class="duelo-matches">
        ${e.matches.map(o=>at(o,s)).join("")}
      </div>
    `:""}

    <h2 class="section-title">Clasificación divisional</h2>
    <div id="divisionStandings"><div class="loading"><div class="loading__spinner"></div></div></div>
  `}function Ka(e,a){var n;const t=((n=e.rival)==null?void 0:n.username)??(e.is_bye?"Descanso":"—"),s=Xa[e.status];return`
    <div class="duelo-card duelo-card--finished">
      ${s?`<span class="duelo-result-badge duelo-result-badge--${e.status}">${s}</span>`:""}
      <div class="duelo-card__matchup">
        <div class="duelo-card__player">
          <span class="duelo-card__name">${a.username}</span>
          <span class="duelo-card__pts">${k(e.my_points)}</span>
        </div>
        <span class="duelo-card__vs">VS</span>
        <div class="duelo-card__player">
          <span class="duelo-card__name">${t}</span>
          <span class="duelo-card__pts">${e.is_bye?"—":k(e.rival_points)}</span>
        </div>
      </div>
    </div>

    <h2 class="section-title">Clasificación divisional</h2>
    <div id="divisionStandings"><div class="loading"><div class="loading__spinner"></div></div></div>
  `}function Qa(){return`
    <div class="duelo-empty">
      <div class="duelo-empty__icon">🤝</div>
      <p class="duelo-empty__text">No tienes un duelo asignado esta jornada.</p>
    </div>
  `}async function je(e,a){const t=document.getElementById("dueloTracker");if(!t){pe();return}try{const{detail:s}=await l.duelo.detail();if(!s)return;t.innerHTML=et(s,e,a)}catch{}}function et(e,a,t){const{me:s,rival:n}=e;function i(o,r){return`
      <div class="duelo-tracker__col">
        <div class="duelo-tracker__player">${o}</div>
        <div class="duelo-tracker__pts">${k(r.points_earned)}</div>
        <div class="duelo-tracker__rows">
          <div class="duelo-tracker__row">
            <span class="duelo-tracker__icon">✅</span>
            <span class="duelo-tracker__label">Ganados</span>
            <span class="duelo-tracker__val">${k(r.points_earned)}</span>
          </div>
          <div class="duelo-tracker__row">
            <span class="duelo-tracker__icon">⏳</span>
            <span class="duelo-tracker__label">En juego</span>
            <span class="duelo-tracker__val">${r.units_at_stake+" u"}</span>
          </div>
          <div class="duelo-tracker__row">
            <span class="duelo-tracker__icon">💰</span>
            <span class="duelo-tracker__label">Sin apostar</span>
            <span class="duelo-tracker__val">${r.units_unbet!=null?r.units_unbet+" u":"?"}</span>
          </div>
        </div>
      </div>
    `}return`
    <div class="duelo-tracker__inner">
      ${i(a,s)}
      <div class="duelo-tracker__divider">VS</div>
      ${i(t,n??{points_earned:0,units_at_stake:0,units_unbet:null})}
    </div>
    <div class="duelo-tracker__note">Actualizado hace unos segundos · se refresca cada minuto</div>
  `}function at(e,a){var i;const t=(i=e.my_prediction)==null?void 0:i.predicted_result;let s,n;return e.started?e.rival_prediction?(s=e.rival_prediction.predicted_result,n=""):(s="—",n="duelo-pick__value--empty"):(s="?",n="duelo-pick__value--hidden"),`
    <div class="match-card duelo-pick-card">
      <div class="match-card__header">
        <span class="match-card__date">${B(e.match_datetime)}</span>
      </div>
      <div class="match-card__teams">
        <span class="team team--home">${e.home_team}</span>
        <div class="match-card__score">
          ${e.status!=="scheduled"?`<span class="score">${e.home_score_90??"?"} - ${e.away_score_90??"?"}</span>`:'<span class="score score--dash">vs</span>'}
        </div>
        <span class="team team--away">${e.away_team}</span>
      </div>
      <div class="duelo-pick-row">
        <div class="duelo-pick">
          <span class="duelo-pick__label">Tú</span>
          <span class="duelo-pick__value ${t?"":"duelo-pick__value--empty"}">${t??"—"}</span>
        </div>
        <div class="duelo-pick">
          <span class="duelo-pick__label">${a}</span>
          <span class="duelo-pick__value ${n}">${s}</span>
        </div>
      </div>
    </div>
  `}async function Se(e,a,t){const s=e.querySelector("#divisionStandings");if(s)try{const{standings:n}=await l.clasificacion.division(a);if(!n.length){s.innerHTML='<p class="empty">Sin clasificación disponible.</p>';return}s.innerHTML=`
      <div class="ranking-table-wrapper">
        <table class="ranking-table">
          <thead>
            <tr>
              <th>#</th><th>Usuario</th><th>PJ</th><th>G</th><th>E</th><th>P</th><th>Pts división</th>
            </tr>
          </thead>
          <tbody>
            ${n.map(i=>`
              <tr class="${i.user_id===t?"ranking-table__row--me":""}">
                <td class="ranking-table__pos" data-pos="${i.pos}">${i.pos}</td>
                <td>${i.username}${i.is_bot?" 🤖":""}</td>
                <td class="ranking-table__stat">${i.pj}</td>
                <td class="ranking-table__stat">${i.g}</td>
                <td class="ranking-table__stat">${i.e}</td>
                <td class="ranking-table__stat">${i.p}</td>
                <td class="ranking-table__pts">${k(i.pts_division)}</td>
              </tr>
            `).join("")}
          </tbody>
        </table>
      </div>
    `}catch(n){s.innerHTML=`<p class="form__error">Error cargando la clasificación: ${n.message}</p>`}}async function tt(e,{query:a={}}={}){e.innerHTML='<div class="loading"><div class="loading__spinner"></div></div>';try{const{standings:t}=await l.clasificacion.general(),s=y.getUser();e.innerHTML=`
      <div class="container">
        <div class="page-title-row">
          <h1 class="page-title">Clasificación</h1>
          <button class="btn-info" id="btnPointsInfo" aria-label="Cómo funciona">ℹ️</button>
        </div>

        <div class="league-tabs">
          <button class="league-tab league-tab--active" id="tabGeneral">General</button>
          <button class="league-tab" id="tabMiDivision">Mi División</button>
          <button class="league-tab" id="tabDivisiones">Divisiones</button>
          <button class="league-tab" id="tabTablon">
            Tablón<span class="tablon-tab-dot hidden" id="tablonTabDot">●</span>
          </button>
        </div>

        <section id="panelGeneral">
          ${t.length===0?'<p class="empty">Todavía no hay clasificación disponible.</p>':`
              <div class="ranking-table-wrapper">
                <table class="ranking-table">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Usuario</th>
                      <th>Pts jornada</th>
                      <th>Pts total</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${t.map(n=>{var i,o;return`
                      <tr class="${s&&n.user_id===s.id?"ranking-table__row--me":""}">
                        <td class="ranking-table__pos" data-pos="${n.pos}">${n.pos}</td>
                        <td>
                          <span class="status-emoji" title="${((i=n.status)==null?void 0:i.name)||""}">${((o=n.status)==null?void 0:o.emoji)||""}</span>
                          ${n.is_bot||s&&n.user_id===s.id?te(n.username):`<button class="user-link" data-user-id="${n.user_id}">${te(n.username)}</button>`}
                        </td>
                        <td class="ranking-table__stat">${k(n.pts_jornada_actual)}</td>
                        <td class="ranking-table__pts">${k(n.pts_general)}</td>
                      </tr>
                    `}).join("")}
                  </tbody>
                </table>
              </div>
            `}
        </section>

        <section id="panelMiDivision" class="hidden">
          <div class="loading"><div class="loading__spinner"></div></div>
        </section>

        <section id="panelDivisiones" class="hidden">
          <div class="loading"><div class="loading__spinner"></div></div>
        </section>

        <section id="panelTablon" class="hidden">
          <div class="loading"><div class="loading__spinner"></div></div>
        </section>
        ${Y()}
      </div>
    `,nt(s,a.tab),Z(e),st(),dt(e,s)}catch(t){e.innerHTML=`<div class="container"><p class="form__error">Error cargando la clasificación: ${t.message}</p></div>`}}async function st(){const e=document.getElementById("tablonTabDot");if(!e)return;if(!y.getUser()){e.classList.add("hidden");return}const t=localStorage.getItem("tablon_general_last_read")||new Date(0).toISOString();try{const{count:s}=await l.board.unread(null,t);console.log("[tablonDot] count:",s,"since:",t),e.classList.toggle("hidden",s===0)}catch(s){console.warn("[tablonDot] error:",s),e.classList.add("hidden")}}function nt(e,a){const t={general:{btn:document.getElementById("tabGeneral"),panel:document.getElementById("panelGeneral")},miDivision:{btn:document.getElementById("tabMiDivision"),panel:document.getElementById("panelMiDivision")},divisiones:{btn:document.getElementById("tabDivisiones"),panel:document.getElementById("panelDivisiones")},tablon:{btn:document.getElementById("tabTablon"),panel:document.getElementById("panelTablon")}};function s(i){for(const[o,{btn:r,panel:d}]of Object.entries(t))r.classList.toggle("league-tab--active",o===i),d.classList.toggle("hidden",o!==i)}t.general.btn.addEventListener("click",()=>s("general")),t.miDivision.btn.addEventListener("click",()=>{s("miDivision"),t.miDivision.panel.dataset.loaded||(t.miDivision.panel.dataset.loaded="1",it(e))}),t.divisiones.btn.addEventListener("click",()=>{s("divisiones"),t.divisiones.panel.dataset.loaded||(t.divisiones.panel.dataset.loaded="1",ot(e))});function n(){var i;s("tablon"),localStorage.setItem("tablon_general_last_read",new Date().toISOString()),(i=document.getElementById("tablonTabDot"))==null||i.classList.add("hidden"),document.dispatchEvent(new CustomEvent("tablon:read")),t.tablon.panel.dataset.loaded||(t.tablon.panel.dataset.loaded="1",ue(t.tablon.panel,{forceGeneral:!0}))}t.tablon.btn.addEventListener("click",n),a==="tablon"&&n()}async function it(e){const a=document.getElementById("panelMiDivision");if(a)try{const{standings:t}=await l.clasificacion.division();if(t.length===0){a.innerHTML='<p class="empty">Todavía no perteneces a ninguna división.</p>';return}a.innerHTML=`
      <div class="ranking-table-wrapper">
        <table class="ranking-table">
          <thead>
            <tr><th>#</th><th>Usuario</th><th>PJ</th><th>G</th><th>E</th><th>P</th><th>Pts div</th></tr>
          </thead>
          <tbody>
            ${t.map(s=>Re(s,e)).join("")}
          </tbody>
        </table>
      </div>
    `}catch(t){a.innerHTML=`<p class="form__error">Error: ${t.message}</p>`}}async function ot(e){const a=document.getElementById("panelDivisiones");if(a)try{const{divisions:t}=await l.clasificacion.allDivisions();if(!t.length){a.innerHTML='<p class="empty">No hay divisiones activas.</p>';return}a.innerHTML=t.map(s=>rt(s,e)).join(""),a.querySelectorAll(".div-accordion__header").forEach(s=>{s.addEventListener("click",()=>{const i=s.nextElementSibling.classList.toggle("hidden");s.querySelector(".div-accordion__chevron").textContent=i?"▶":"▼"})})}catch(t){a.innerHTML=`<p class="form__error">Error: ${t.message}</p>`}}function rt(e,a){const t=e.standings.some(s=>a&&s.user_id===a.id);return`
    <div class="div-accordion ${t?"div-accordion--mine":""}">
      <button class="div-accordion__header">
        <span class="div-accordion__title">División ${e.division_number} · Grupo ${e.division_number}</span>
        ${t?'<span class="div-accordion__badge">Tú</span>':""}
        <span class="div-accordion__chevron">▼</span>
      </button>
      <div class="div-accordion__body">
        <div class="ranking-table-wrapper">
          <table class="ranking-table">
            <thead>
              <tr><th>#</th><th>Usuario</th><th>PJ</th><th>G</th><th>E</th><th>P</th><th>Pts div</th></tr>
            </thead>
            <tbody>
              ${e.standings.map(s=>Re(s,a)).join("")}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `}function te(e){return String(e||"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;")}function dt(e,a){let t=document.getElementById("userCtxMenu");t||(t=document.createElement("div"),t.id="userCtxMenu",t.className="user-ctx-menu hidden",t.innerHTML=`
      <a class="user-ctx-menu__item" id="ctxProfile" href="#">👤 Ver jugador</a>
      <button class="user-ctx-menu__item" id="ctxMessage">💬 Enviar mensaje</button>
    `,document.body.appendChild(t),document.addEventListener("click",s=>{!s.target.closest("#userCtxMenu")&&!s.target.closest(".user-link")&&t.classList.add("hidden")},!0)),e.addEventListener("click",s=>{const n=s.target.closest(".user-link");if(!n)return;s.stopPropagation();const i=n.dataset.userId,o=n.getBoundingClientRect();t.querySelector("#ctxProfile").href=`#/jugador/${i}`,t.querySelector("#ctxMessage").onclick=()=>{t.classList.add("hidden"),window.location.hash=`/mensajes/${i}`},t.classList.remove("hidden");const r=180;let d=o.left;d+r>window.innerWidth-8&&(d=window.innerWidth-r-8),t.style.top=`${o.bottom+window.scrollY+4}px`,t.style.left=`${d}px`})}function Re(e,a){const t=a&&e.user_id===a.id,s=e.zone==="promotion"?"background:rgba(0,255,135,0.08)":e.zone==="relegation"?"background:rgba(255,56,96,0.08)":"";return`
    ${e.pos===5?'<tr class="div-separator div-separator--top"><td colspan="7"></td></tr>':e.pos===13?'<tr class="div-separator div-separator--bottom"><td colspan="7"></td></tr>':""}
    <tr class="${t?"ranking-table__row--me":""}" style="${s}">
      <td class="ranking-table__pos" data-pos="${e.pos}">${e.pos}</td>
      <td>${t||e.is_bot?te(e.username):`<button class="user-link" data-user-id="${e.user_id}">${te(e.username)}</button>`}</td>
      <td class="ranking-table__stat">${e.pj}</td>
      <td class="ranking-table__stat">${e.g}</td>
      <td class="ranking-table__stat">${e.e}</td>
      <td class="ranking-table__stat">${e.p}</td>
      <td class="ranking-table__pts">${k(e.pts_division)}</td>
    </tr>
  `}async function ke(e,{params:a={}}={}){const t=a.userId?parseInt(a.userId):null;t?await ut(e,t):await lt(e)}async function lt(e){e.innerHTML='<div class="loading"><div class="loading__spinner"></div></div>';try{const{conversations:a}=await l.messages.list();e.innerHTML=`
      <div class="container">
        <h1 class="page-title">💬 Mensajes</h1>
        ${a.length===0?'<p class="empty">No tienes conversaciones aún. Pulsa el nombre de un jugador en la clasificación para enviar un mensaje.</p>':`<div class="mensajes-list">${a.map(ct).join("")}</div>`}
      </div>
    `,e.querySelectorAll(".mensajes-item").forEach(t=>{t.addEventListener("click",()=>{window.location.hash=`/mensajes/${t.dataset.userId}`})})}catch(a){e.innerHTML=`<div class="container"><p class="form__error">Error: ${a.message}</p></div>`}}function ct(e){return`
    <div class="mensajes-item" data-user-id="${e.user_id}" style="cursor:pointer">
      <div class="mensajes-item__avatar">${W(e.username[0].toUpperCase())}</div>
      <div class="mensajes-item__info">
        <div class="mensajes-item__header">
          <strong class="mensajes-item__name">${W(e.username)}</strong>
          ${e.unread_count>0?`<span class="mensajes-item__badge">${e.unread_count}</span>`:""}
        </div>
        <p class="mensajes-item__preview">${W(e.last_message)}</p>
      </div>
    </div>
  `}async function ut(e,a){var s;e.innerHTML='<div class="loading"><div class="loading__spinner"></div></div>';const t=y.getUser();try{const{messages:n,partner:i}=await l.messages.get(a);document.dispatchEvent(new CustomEvent("messages:read")),e.innerHTML=`
      <div class="container">
        <div class="chat-header">
          <a href="#/mensajes" class="btn btn--ghost btn--sm">← Volver</a>
          <h2 class="chat-header__name">${W((i==null?void 0:i.username)||"Usuario")}</h2>
        </div>

        <div class="chat-messages" id="chatMessages">
          ${n.length===0?'<p class="empty" style="text-align:center">Empieza la conversación.</p>':n.map(r=>Ie(r,t)).join("")}
        </div>

        <form class="chat-input" id="chatForm">
          <textarea class="form__textarea chat-input__textarea" id="chatMsg"
            placeholder="Escribe un mensaje…" maxlength="1000" rows="2" required></textarea>
          <button class="btn btn--primary chat-input__btn" type="submit">Enviar</button>
        </form>
      </div>
    `;const o=document.getElementById("chatMessages");o&&(o.scrollTop=o.scrollHeight),(s=document.getElementById("chatForm"))==null||s.addEventListener("submit",async r=>{r.preventDefault();const d=document.getElementById("chatMsg"),c=d.value.trim();if(!c)return;const b=r.target.querySelector('button[type="submit"]');b.disabled=!0;try{const{message:p}=await l.messages.send(a,c);d.value="";const _=document.getElementById("chatMessages"),h=_==null?void 0:_.querySelector(".empty");h&&h.remove(),_==null||_.insertAdjacentHTML("beforeend",Ie(p,t)),_&&(_.scrollTop=_.scrollHeight)}catch(p){g(p.message,"error")}finally{b.disabled=!1}})}catch(n){e.innerHTML=`<div class="container"><p class="form__error">Error: ${n.message}</p></div>`}}function Ie(e,a){return`
    <div class="chat-message ${a&&e.sender_id===a.id?"chat-message--sent":"chat-message--received"}">
      <div class="chat-message__bubble">${W(e.message)}</div>
      <div class="chat-message__time">${B(e.created_at)}</div>
    </div>
  `}function W(e){return String(e||"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;")}const Ce=e=>()=>{window.location.hash=e},mt={"/":Ye,"/login":sa,"/register":na,"/quiniela":Ce("/jornada"),"/resultados":Ce("/tabla-v2"),"/ranking":oa,"/tablon":ue,"/ligas":da,"/ligas/:id":ca,"/perfil":ma,"/campeon":ha,"/admin":fa,"/forgot-password":Ha,"/reset-password":qa,"/unirse":Aa,"/jugador/:id":Oa,"/jornada":Ua,"/duelo":Ya,"/tabla-v2":tt,"/mensajes":ke,"/mensajes/:userId":ke};function pt(e){for(const[a,t]of Object.entries(mt)){const s=[],n=new RegExp("^"+a.replace(/:([^/]+)/g,(o,r)=>(s.push(r),"([^/]+)"))+"$"),i=e.match(n);if(i){const o={};return s.forEach((r,d)=>{o[r]=i[d+1]}),{handler:t,params:o}}}return null}const xe=()=>document.getElementById("mainContent"),S={init(){window.addEventListener("hashchange",()=>this.resolve()),this.resolve()},navigate(e){window.location.hash=e},resolve(){const e=window.location.hash.slice(1)||"/",[a,t]=e.split("?"),s=Object.fromEntries(new URLSearchParams(t||"")),n=pt(a);if(!n){xe().innerHTML='<div class="error-page"><h2>Página no encontrada</h2><a href="#/">Volver al inicio</a></div>';return}const{handler:i,params:o}=n;if(["/perfil","/admin","/jornada","/duelo","/tabla-v2","/mensajes"].includes(a)&&!y.isLoggedIn()){this.navigate("/login");return}if(a==="/admin"&&!y.isAdmin()){this.navigate("/");return}const d=xe();d.innerHTML='<div class="loading"><div class="loading__spinner"></div></div>',i(d,{params:o,query:s})}};let G=[],z=null,J=null,se=!1;async function vt(){document.documentElement.dataset.build="2026-08-13T21",await y.init(),S.init(),bt(),gt(),yt()}function Ue(){return localStorage.getItem("pwa_installed")==="true"||window.matchMedia("(display-mode: standalone)").matches||window.navigator.standalone===!0}function gt(){window.addEventListener("beforeinstallprompt",e=>{e.preventDefault(),!Ue()&&(z=e,_t())}),window.addEventListener("appinstalled",()=>{var e;localStorage.setItem("pwa_installed","true"),z=null,(e=document.getElementById("installBanner"))==null||e.remove()})}function _t(){if(Ue()||sessionStorage.getItem("installBannerDismissed"))return;const e=document.createElement("div");e.id="installBanner",e.className="install-banner",e.innerHTML=`
    <span class="install-banner__text">📱 Instala PickGoal en tu móvil</span>
    <div class="install-banner__actions">
      <button class="install-banner__btn install-banner__btn--primary" id="installBtn">Instalar</button>
      <button class="install-banner__btn install-banner__btn--ghost" id="installDismissBtn">Ahora no</button>
    </div>
  `,document.body.appendChild(e),document.getElementById("installBtn").addEventListener("click",async()=>{z&&(z.prompt(),await z.userChoice,z=null,e.remove())}),document.getElementById("installDismissBtn").addEventListener("click",()=>{sessionStorage.setItem("installBannerDismissed","1"),e.remove()})}function N(){var e,a;(e=document.getElementById("userDropdown"))==null||e.classList.add("hidden"),(a=document.getElementById("userBtn"))==null||a.classList.remove("navbar__dropdown-btn--open")}async function X(){const e=document.getElementById("perfilBadge"),a=document.getElementById("navMensajesDot");if(!y.getUser()){e==null||e.classList.add("hidden"),a==null||a.classList.add("hidden");return}try{const s=localStorage.getItem("tablon_general_last_read")||new Date(0).toISOString(),[n,i]=await Promise.all([l.board.mentions(s).catch(d=>(console.warn("[perfilBadge] mentions error:",d),{count:0})),l.messages.unread().catch(d=>(console.warn("[perfilBadge] pm unread error:",d),{count:0}))]),o=n.count||0,r=i.count||0;console.log("[perfilBadge] mentions:",o,"pm:",r),e==null||e.classList.toggle("hidden",o+r===0),a==null||a.classList.toggle("hidden",r===0)}catch(s){console.warn("[perfilBadge] error:",s),e==null||e.classList.add("hidden"),a==null||a.classList.add("hidden")}}async function ne(){const e=document.getElementById("tablonBadge");if(!e)return;if(!y.getUser()){e.classList.add("hidden");return}const t=localStorage.getItem("tablon_general_last_read")||new Date(0).toISOString();try{const{count:s}=await l.board.unread(null,t);s>0?(e.textContent=s>99?"99+":String(s),e.classList.remove("hidden")):e.classList.add("hidden")}catch{e.classList.add("hidden")}}function bt(){var e,a,t,s;document.addEventListener("auth:change",Te),window.addEventListener("hashchange",()=>{N(),Je(),setTimeout(ne,200),setTimeout(X,200)}),document.addEventListener("tablon:read",()=>{X(),ne()}),document.addEventListener("messages:read",()=>{X()}),document.addEventListener("click",N),(e=document.getElementById("userBtn"))==null||e.addEventListener("click",n=>{var r;n.stopPropagation();const i=document.getElementById("userDropdown"),o=i==null?void 0:i.classList.contains("hidden");N(),o&&(i==null||i.classList.remove("hidden"),(r=document.getElementById("userBtn"))==null||r.classList.add("navbar__dropdown-btn--open"))}),(a=document.getElementById("userDropdown"))==null||a.addEventListener("click",n=>{n.stopPropagation(),n.target.closest("#navProfileLink")&&N()}),(t=document.getElementById("navMensajesLink"))==null||t.addEventListener("click",async n=>{n.preventDefault(),n.stopPropagation(),N(),se?ce():await $t()}),document.addEventListener("click",n=>{se&&!n.target.closest("#notifPanel")&&!n.target.closest("#navMensajesLink")&&ce()}),(s=document.getElementById("navLogoutBtn"))==null||s.addEventListener("click",()=>{G=[],localStorage.removeItem("activeLeagueId"),N(),y.logout(),S.navigate("/")}),Te()}async function Te(){var i;const e=document.getElementById("navAuthLinks"),a=document.getElementById("userBtn"),t=document.getElementById("navUsername"),s=document.getElementById("bottomNav"),n=y.getUser();if(N(),n){e==null||e.classList.add("hidden"),t&&(t.textContent=n.username),a.style.visibility="visible",console.log("[navbar] userBtn visibility:",a.style.visibility,"computed:",getComputedStyle(a).visibility,"offsetWidth:",a.offsetWidth,"right rect:",a.getBoundingClientRect().right),s==null||s.classList.remove("hidden"),document.body.classList.add("has-bottom-nav"),(i=document.getElementById("navAdminLink"))==null||i.classList.toggle("hidden",!n.is_admin);try{const{leagues:o}=n.is_admin?await l.leagues.adminAll():await l.leagues.my();G=o}catch{G=[]}ht(G),ne(),X(),J&&clearInterval(J),J=setInterval(()=>{ne(),X()},5*60*1e3)}else e==null||e.classList.remove("hidden"),a.style.visibility="hidden",s==null||s.classList.add("hidden"),document.body.classList.remove("has-bottom-nav"),G=[],localStorage.removeItem("activeLeagueId"),J&&(clearInterval(J),J=null);Je()}function ht(e){const a=localStorage.getItem("activeLeagueId");a&&e.some(s=>String(s.id)===String(a))||(e.length>0?localStorage.setItem("activeLeagueId",String(e[0].id)):localStorage.removeItem("activeLeagueId"))}function Je(){const e=window.location.hash.slice(1).split("?")[0]||"/";document.querySelectorAll(".bottom-nav__item").forEach(a=>{const t=a.dataset.route,s=t==="/"?e==="/":e===t||e.startsWith(t+"/");a.classList.toggle("bottom-nav__item--active",s)})}function ft(e){const a="=".repeat((4-e.length%4)%4),t=(e+a).replace(/-/g,"+").replace(/_/g,"/"),s=atob(t);return Uint8Array.from([...s].map(n=>n.charCodeAt(0)))}async function yt(){if(!(!("serviceWorker"in navigator)||!("PushManager"in window)))try{const e=await navigator.serviceWorker.register("/sw.js");document.addEventListener("auth:change",async a=>{a.detail&&await Be(e)}),y.getUser()&&await Be(e)}catch{}}async function Be(e){try{if(await Notification.requestPermission()!=="granted")return;const t=await e.pushManager.getSubscription();if(t){await l.notifications.subscribe(t.toJSON());return}const{public_key:s}=await l.notifications.vapidPublicKey();if(!s)return;const n=await e.pushManager.subscribe({userVisibleOnly:!0,applicationServerKey:ft(s)});await l.notifications.subscribe(n.toJSON())}catch{}}function ce(){var e;(e=document.getElementById("notifPanel"))==null||e.classList.add("hidden"),se=!1}async function $t(){const e=document.getElementById("notifPanel"),a=document.getElementById("notifPanelBody");if(!(!e||!a)){se=!0,e.classList.remove("hidden"),a.innerHTML='<div class="loading"><div class="loading__spinner"></div></div>';try{const t=new Date(Date.now()-2592e6).toISOString(),[s,n,i]=await Promise.all([l.messages.list().catch(()=>({conversations:[]})),l.board.messages(1,null).catch(()=>({messages:[]})),l.board.mentions(t).catch(()=>({messages:[]}))]),o=(s.conversations||[]).slice(0,5),r=(n.messages||[]).slice(0,5),d=new Set((i.messages||[]).map(c=>c.id));a.innerHTML=Et(o,r,d),a.querySelectorAll(".notif-item[data-nav]").forEach(c=>{c.addEventListener("click",()=>{ce(),window.location.hash=c.dataset.nav})})}catch{a.innerHTML='<p class="notif-panel__empty">Error cargando notificaciones</p>'}}}function Et(e,a,t){const s=e.length===0?'<p class="notif-panel__empty">Aún no tienes mensajes</p>':e.map(i=>`
        <div class="notif-item" data-nav="/mensajes/${i.user_id}">
          <div class="notif-item__avatar">${F(i.username[0].toUpperCase())}</div>
          <div class="notif-item__content">
            <div class="notif-item__header">
              <strong class="notif-item__name">${F(i.username)}</strong>
              ${i.unread_count>0?`<span class="notif-item__badge">${i.unread_count}</span>`:""}
            </div>
            <p class="notif-item__text">${F((i.last_message||"").slice(0,70))}${(i.last_message||"").length>70?"…":""}</p>
          </div>
        </div>
      `).join("")+'<a class="notif-panel__link" href="#/mensajes">Ver todos los mensajes →</a>',n=a.length===0?'<p class="notif-panel__empty">Aún no hay mensajes en el tablón</p>':a.map(i=>{const o=t.has(i.id);return`
          <div class="notif-item${o?" notif-item--notable":""}" data-nav="/tabla-v2?tab=tablon">
            <div class="notif-item__avatar">${F(i.username[0].toUpperCase())}</div>
            <div class="notif-item__content">
              <div class="notif-item__header">
                <strong class="notif-item__name">${F(i.username)}</strong>
                ${o?'<span class="notif-item__mention">@tú / admin</span>':""}
                <span class="notif-item__time">${B(i.created_at)}</span>
              </div>
              <p class="notif-item__text">${F((i.message||"").slice(0,80))}${(i.message||"").length>80?"…":""}</p>
            </div>
          </div>
        `}).join("")+'<a class="notif-panel__link" href="#/tabla-v2?tab=tablon">Ver tablón →</a>';return`
    <div class="notif-panel__section">
      <h4 class="notif-panel__title">💬 Mensajes privados</h4>
      ${s}
    </div>
    <div class="notif-panel__section">
      <h4 class="notif-panel__title">📣 Tablón general</h4>
      ${n}
    </div>
  `}function F(e){return String(e||"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;")}vt();
