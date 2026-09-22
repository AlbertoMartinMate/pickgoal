(function(){const a=document.createElement("link").relList;if(a&&a.supports&&a.supports("modulepreload"))return;for(const n of document.querySelectorAll('link[rel="modulepreload"]'))s(n);new MutationObserver(n=>{for(const i of n)if(i.type==="childList")for(const o of i.addedNodes)o.tagName==="LINK"&&o.rel==="modulepreload"&&s(o)}).observe(document,{childList:!0,subtree:!0});function t(n){const i={};return n.integrity&&(i.integrity=n.integrity),n.referrerPolicy&&(i.referrerPolicy=n.referrerPolicy),n.crossOrigin==="use-credentials"?i.credentials="include":n.crossOrigin==="anonymous"?i.credentials="omit":i.credentials="same-origin",i}function s(n){if(n.ep)return;n.ep=!0;const i=t(n);fetch(n.href,i)}})();const Ze="https://pickgoal-backend.onrender.com/api";function Qe(){return localStorage.getItem("token")}async function m(e,a={}){const t={"Content-Type":"application/json",...a.headers},s=Qe();s&&(t.Authorization=`Bearer ${s}`);const n=await fetch(`${Ze}${e}`,{cache:"no-store",...a,headers:t}),i=await n.json().catch(()=>({}));if(!n.ok)throw{status:n.status,message:i.error||"Error desconocido"};return i}const c={get:e=>m(e),post:(e,a)=>m(e,{method:"POST",body:JSON.stringify(a)}),patch:(e,a)=>m(e,{method:"PATCH",body:JSON.stringify(a)}),delete:e=>m(e,{method:"DELETE"}),auth:{register:e=>m("/auth/register",{method:"POST",body:JSON.stringify(e)}),login:e=>m("/auth/login",{method:"POST",body:JSON.stringify(e)}),me:()=>m("/auth/me"),forgotPassword:e=>m("/auth/forgot-password",{method:"POST",body:JSON.stringify({email:e})}),resetPassword:(e,a)=>m("/auth/reset-password",{method:"POST",body:JSON.stringify({token:e,password:a})}),ranking:e=>m(`/auth/ranking${e?`?league_id=${e}`:""}`),deleteAccount:()=>m("/auth/account",{method:"DELETE"}),users:()=>m("/auth/users"),usersForMentions:()=>m("/auth/users/for-mentions"),toggleAdmin:e=>m(`/auth/users/${e}/toggle-admin`,{method:"PATCH"}),toggleMute:e=>m(`/auth/users/${e}/toggle-mute`,{method:"PATCH"}),updateEmail:e=>m("/auth/me/email",{method:"PATCH",body:JSON.stringify({email:e})})},matches:{grouped:()=>m("/matches/grouped"),list:(e="")=>m(`/matches/${e}`),get:e=>m(`/matches/${e}`),today:()=>m("/matches/today"),setResult:(e,a,t,s=null)=>m(`/matches/${e}/result`,{method:"PATCH",body:JSON.stringify({home_score:a,away_score:t,...s?{result_90:s}:{}})}),sync:()=>m("/matches/sync",{method:"POST"}),recalculate:()=>m("/matches/recalculate",{method:"POST"})},predictions:{mine:e=>m(`/predictions/${e?`?league_id=${e}`:""}`),forMatch:(e,a)=>m(`/predictions/match/${e}${a?`?league_id=${a}`:""}`),save:e=>m("/predictions/",{method:"POST",body:JSON.stringify(e)}),forUser:(e,a)=>m(`/predictions/user/${e}${a?`?league_id=${a}`:""}`),getChampion:e=>m(`/predictions/champion${e?`?league_id=${e}`:""}`),saveChampion:(e,a)=>m("/predictions/champion",{method:"POST",body:JSON.stringify({team_name:e,league_id:a??null})}),awardChampion:e=>m("/predictions/champion/award",{method:"POST",body:JSON.stringify({team_name:e})})},leagues:{all:()=>m("/leagues/all"),public:()=>m("/leagues/public"),my:()=>m("/leagues/my"),create:e=>m("/leagues/",{method:"POST",body:JSON.stringify(e)}),join:e=>m("/leagues/join",{method:"POST",body:JSON.stringify(e)}),joinByCode:e=>m(`/leagues/join/${encodeURIComponent(e)}`),adminAll:()=>m("/leagues/admin"),get:e=>m(`/leagues/${e}`),update:(e,a)=>m(`/leagues/${e}`,{method:"PUT",body:JSON.stringify(a)}),leave:e=>m(`/leagues/${e}/leave`,{method:"DELETE"}),members:e=>m(`/leagues/${e}/members`),matchPredictions:(e,a)=>m(`/leagues/${e}/predictions/${a}`)},home:{summary:()=>m("/home/summary")},board:{messages:(e=1,a=null)=>m(`/board/?page=${e}${a?`&league_id=${a}`:""}`),unread:(e,a)=>m(`/board/unread?${e?`league_id=${e}&`:""}since=${encodeURIComponent(a)}`),post:(e,a=null)=>m("/board/",{method:"POST",body:JSON.stringify({message:e,league_id:a})}),pin:e=>m(`/board/${e}/pin`,{method:"POST"}),reply:(e,a)=>m(`/board/${e}/reply`,{method:"POST",body:JSON.stringify({message:a})}),delete:e=>m(`/board/${e}`,{method:"DELETE"}),mentions:e=>m(`/board/mentions?since=${encodeURIComponent(e)}`)},notifications:{vapidPublicKey:()=>m("/notifications/vapid-public-key"),subscribe:e=>m("/notifications/subscribe",{method:"POST",body:JSON.stringify(e)}),send:e=>m("/notifications/send",{method:"POST",body:JSON.stringify(e)})},adminV2:{partidos:(e,a,t)=>m(`/v2/admin/partidos-disponibles?date_from=${encodeURIComponent(e)}&date_to=${encodeURIComponent(a)}${t&&t.length?`&competitions=${encodeURIComponent(t.join(","))}`:""}`),jornadas:()=>m("/v2/admin/jornadas"),createJornada:e=>m("/v2/admin/jornada",{method:"POST",body:JSON.stringify(e)}),updateJornada:(e,a)=>m(`/v2/admin/jornada/${e}`,{method:"PUT",body:JSON.stringify(a)}),deleteJornada:e=>m(`/v2/admin/jornada/${e}`,{method:"DELETE"}),publishJornada:e=>m(`/v2/admin/jornada/${e}/publish`,{method:"POST"}),closeJornada:e=>m(`/v2/admin/jornada/${e}/close`,{method:"POST"}),jornadaMatches:e=>m(`/v2/admin/jornada/${e}/matches`),setResultado:(e,a)=>m(`/v2/admin/jornada-match/${e}/resultado`,{method:"POST",body:JSON.stringify(a)}),cancelMatch:e=>m(`/v2/admin/jornada-match/${e}/cancel`,{method:"POST"}),addManualMatch:(e,a)=>m(`/v2/admin/jornada/${e}/match/manual`,{method:"POST",body:JSON.stringify(a)}),deleteManualMatch:e=>m(`/v2/admin/jornada-match/${e}`,{method:"DELETE"}),generateBots:()=>m("/v2/admin/bots/generate",{method:"POST"}),weeklyChecklist:()=>m("/v2/admin/weekly-checklist")},jornada:{info:()=>m("/v2/jornada/info"),current:()=>m("/v2/jornada/current"),list:()=>m("/v2/jornada/list"),predict:e=>m("/v2/jornada/predict",{method:"POST",body:JSON.stringify(e)}),history:()=>m("/v2/jornada/history"),myStats:()=>m("/v2/jornada/my-stats")},duelo:{list:()=>m("/v2/duelo/list"),current:e=>m(`/v2/duelo/current${e?`?jornada_id=${e}`:""}`),detail:e=>m(`/v2/duelo/current/detail${e?`?jornada_id=${e}`:""}`)},messages:{unread:()=>m("/messages/unread"),list:()=>m("/messages/"),get:e=>m(`/messages/${e}`),send:(e,a)=>m(`/messages/${e}`,{method:"POST",body:JSON.stringify({message:a})}),markAllRead:()=>m("/messages/mark-all-read",{method:"PATCH"})},clasificacion:{division:e=>m(`/v2/clasificacion/division${e?`?league_id=${e}`:""}`),general:()=>m("/v2/clasificacion/general"),allDivisions:()=>m("/v2/clasificacion/all-divisions")}};let H=null;const E={async init(){if(localStorage.getItem("token"))try{const{user:a}=await c.auth.me();H=a}catch{localStorage.removeItem("token")}},setUser(e,a){H=e,localStorage.setItem("token",a),document.dispatchEvent(new CustomEvent("auth:change",{detail:e}))},logout(){H=null,localStorage.removeItem("token"),document.dispatchEvent(new CustomEvent("auth:change",{detail:null}))},getUser(){return H},isLoggedIn(){return!!H},isAdmin(){return(H==null?void 0:H.is_admin)===!0}};let de=null;function v(e,a="success"){let t=document.getElementById("toast");t||(t=document.createElement("div"),t.id="toast",document.body.appendChild(t)),t.textContent=e,t.className=`toast toast--${a} toast--visible`,de&&clearTimeout(de),de=setTimeout(()=>{t.classList.remove("toast--visible")},3e3)}function ea(){return`
    <div class="container">
      <div class="league-gate">
        <div class="league-gate__icon">⚽</div>
        <h2 class="league-gate__title">¡Inicia tu Liga!</h2>
        <p class="league-gate__text">Únete a una liga para empezar a predecir</p>
        <a href="#/ligas" class="btn btn--primary">Ver ligas disponibles</a>
      </div>
    </div>
  `}function Z(){return`
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
            <li class="points-modal__note">⚠️ Si no predices un partido → <strong>-1 punto</strong> de penalización (mínimo 0).</li>
            <li>🎯 <strong>Bonificación por aciertos:</strong>
              <ul class="points-modal__list points-modal__list--inner">
                <li>8/10 → <strong>+2 pts</strong></li>
                <li>9/10 → <strong>+5 pts</strong></li>
                <li>10/10 → <strong>+10 pts</strong> (¡Pleno!)</li>
              </ul>
            </li>
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
  `}function Q(e){const a=e.querySelector("#pointsModal"),t=e.querySelector("#btnPointsInfo"),s=e.querySelector("#pointsClose"),n=e.querySelector("#pointsOverlay");function i(){a.classList.add("points-modal--open"),document.body.style.overflow="hidden"}function o(){a.classList.remove("points-modal--open"),document.body.style.overflow=""}return t==null||t.addEventListener("click",i),s==null||s.addEventListener("click",o),n==null||n.addEventListener("click",o),document.addEventListener("keydown",r=>{r.key==="Escape"&&o()},{once:!1}),i}function L(e){const a=parseFloat(e);return isNaN(a)||e==null?"—":parseFloat(a.toFixed(2)).toString()}function M(e){return e?new Date(e).toLocaleString("es-ES",{day:"2-digit",month:"2-digit",year:"numeric",hour:"2-digit",minute:"2-digit"}):"—"}const aa="/assets/icon-512-v2-CAowBaBi.png";async function ta(e){if(!E.getUser()){sa(e);return}e.innerHTML='<div class="loading"><div class="loading__spinner"></div></div>';try{const{leagues_summary:t,division_summary:s,upcoming_matches:n}=await c.home.summary();if(s){e.innerHTML=`
        <div class="home-dashboard container">
          <div class="home-dashboard__topbar">
            <button class="btn btn--ghost btn--sm" id="btnPointsInfo">📊 Sistema de puntos</button>
          </div>
          ${ia(s)}
          ${He()}
          ${fe(n)}
        </div>
        ${Z()}
      `,Q(e);return}if(!t||t.length===0){na(e);return}const i=(()=>{const r=localStorage.getItem("activeLeagueId");return r?parseInt(r):null})(),o=[...t].sort((r,d)=>r.league_id===i?-1:d.league_id===i?1:0);e.innerHTML=`
      <div class="home-dashboard container">
        <div class="home-dashboard__topbar">
          <button class="btn btn--ghost btn--sm" id="btnPointsInfo">📊 Sistema de puntos</button>
        </div>

        <h3 class="home-dashboard__section-title">Mis ligas</h3>
        <div class="home-dashboard__leagues">
          ${o.map(r=>da(r)).join("")}
        </div>

        <div class="home-dashboard__create">
          <a href="#/ligas" class="btn btn--ghost btn--sm">+ Crear liga privada</a>
        </div>

        ${fe(n)}
      </div>
      ${Z()}
    `,Q(e),e.querySelectorAll(".league-card[data-league-id]").forEach(r=>{r.style.cursor="pointer",r.addEventListener("click",d=>{d.target.closest("[data-go-ranking]")||d.target.closest("a")||(localStorage.setItem("activeLeagueId",r.dataset.leagueId),S.navigate(`/ligas/${r.dataset.leagueId}`))})}),e.querySelectorAll("[data-go-ranking]").forEach(r=>{r.addEventListener("click",d=>{d.stopPropagation(),localStorage.setItem("activeLeagueId",r.dataset.goRanking),S.navigate("/ranking")})})}catch(t){e.innerHTML=`<div class="container"><p class="form__error">Error cargando el inicio: ${t.message}</p></div>`}}function sa(e){e.innerHTML=`
    <section class="hero">
      <div class="hero__content">
        <img src="${aa}" alt="PickGoal" class="hero__logo-img" />
        <h1 class="hero__title">PickGoal</h1>
        <p class="hero__subtitle">La liga de pronósticos de fútbol</p>
        <div class="hero__cta">
          <a href="#/register" class="btn btn--primary btn--lg">🚀 Crear cuenta gratis</a>
          <a href="#/login" class="btn btn--ghost btn--lg">Ya tengo cuenta</a>
        </div>
      </div>
    </section>

    <section class="how-it-works container">
      <div class="how-it-works__grid">
        <div class="how-step">
          <span class="how-step__icon">⚽</span>
          <h3 class="how-step__title">Predice los partidos</h3>
          <p class="how-step__desc">LaLiga, Premier League y Champions League cada semana</p>
        </div>
        <div class="how-step">
          <span class="how-step__icon">🏆</span>
          <h3 class="how-step__title">Duelos 1vs1</h3>
          <p class="how-step__desc">Enfréntate a otro jugador cada jornada y sube de división</p>
        </div>
        <div class="how-step">
          <span class="how-step__icon">🎯</span>
          <h3 class="how-step__title">Sistema de unidades</h3>
          <p class="how-step__desc">20 unidades por jornada — apuesta más en los que más confías</p>
        </div>
      </div>
    </section>

    <div class="container">
      ${He()}
    </div>
  `}function na(e){e.innerHTML=`
    <div class="home-dashboard container">
      ${ra()}
    </div>
  `}function ia(e){const a={promotion:"⬆️ Zona ascenso",relegation:"⬇️ Zona descenso",mid:""},t=a[e.zone]?`<span class="div-card__zone div-card__zone--${e.zone}">${a[e.zone]}</span>`:"";return`
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
          <span class="div-card__pts-val">${L(e.pts_division)}</span>
          <span class="div-card__pts-label">pts división</span>
        </div>
      </div>
      <div class="div-card__record">
        <div class="div-card__stat"><span>${e.pj}</span><small>PJ</small></div>
        <div class="div-card__stat"><span>${e.g}</span><small>G</small></div>
        <div class="div-card__stat"><span>${e.e}</span><small>E</small></div>
        <div class="div-card__stat"><span>${e.p}</span><small>P</small></div>
        <div class="div-card__stat div-card__stat--general"><span>${L(e.pts_general)}</span><small>Pts total</small></div>
      </div>
      <div class="div-card__actions">
        <a href="#/jornada" class="btn btn--primary btn--sm">Predecir jornada</a>
        <a href="#/tabla-v2" class="btn btn--ghost btn--sm">Ver tabla</a>
      </div>
    </div>
  `}function oa(e){const a=new Date,t=new Date(e),s=Math.ceil((t-a)/(1e3*60*60*24));return Math.max(0,s)}function ra(e=null,a=!1){let t,s;if(a&&(e!=null&&e.jornada_number))s="Temporada 26/27 · En curso",t=`
      <div class="pg-league-card__jornada">
        <span class="pg-league-card__jornada-num">J${e.jornada_number}</span>
        <span class="pg-league-card__jornada-label">jornada actual</span>
      </div>`;else if(a)s="Temporada 26/27 · En curso",t='<div class="pg-league-card__countdown pg-league-card__countdown--soon">Temporada en curso</div>';else{const n=oa("2026-08-15");s="Temporada 26/27 · Próximamente",t=n>0?`<div class="pg-league-card__countdown">
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
  `}function da(e){const a=e.next_to_predict?`<div class="league-card__next">
         <span class="league-card__next-label">Próximo a predecir</span>
         <span class="league-card__next-match">${e.next_to_predict.home_team} vs ${e.next_to_predict.away_team}</span>
         <span class="league-card__next-date">${M(e.next_to_predict.match_datetime)}</span>
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
          <span class="league-card__stat-val">${L(e.total_points)}</span>
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
  `}function fe(e){return e.length?`
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
              <span class="upcoming-match__date">${M(a.match_datetime)}</span>
              ${t?'<span class="upcoming-match__badge upcoming-match__badge--done">Predicho</span>':'<span class="upcoming-match__badge upcoming-match__badge--pending">Sin predecir</span>'}
            </div>
          </div>
        `).join("")}
      </div>
      <a class="btn btn--ghost btn--sm" href="#/jornada">Ver jornada actual</a>
    </section>
  `:""}function He(){return`
    <div class="prize-banner">
      <span class="prize-banner__icon">🏆</span>
      <div>
        <strong>Premio temporada 26/27</strong>
        <p>Camiseta de tu equipo favorito para el campeón de la clasificación general</p>
      </div>
    </div>
  `}const ye="pickgoal_welcome_shown";function Ae(e="/jornada"){if(localStorage.getItem(ye))return;localStorage.setItem(ye,"1");const a=document.createElement("div");a.innerHTML=`
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
  `;const t=a.firstElementChild;document.body.appendChild(t),document.body.style.overflow="hidden",requestAnimationFrame(()=>t.classList.add("welcome-modal--open"));function s(n){t.classList.remove("welcome-modal--open"),document.body.style.overflow="",t.addEventListener("transitionend",()=>t.remove(),{once:!0}),n&&(window.location.hash=n)}document.getElementById("welcomeOverlay").addEventListener("click",()=>s()),document.getElementById("welcomeCta").addEventListener("click",()=>s(e)),document.addEventListener("keydown",function n(i){i.key==="Escape"&&(s(),document.removeEventListener("keydown",n))})}function la(e){e.innerHTML=`
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
  `,document.getElementById("loginForm").addEventListener("submit",async a=>{a.preventDefault();const t=document.getElementById("loginBtn"),s=document.getElementById("loginError"),n=document.getElementById("identifier").value.trim(),i=document.getElementById("password").value;t.disabled=!0,t.textContent="Entrando…",s.classList.add("hidden");try{const{token:o,user:r}=await c.auth.login({identifier:n,password:i});E.setUser(r,o),v(`¡Bienvenido, ${r.username}!`),S.navigate("/"),Ae("/")}catch(o){s.textContent=o.message||"Error al iniciar sesión",s.classList.remove("hidden")}finally{t.disabled=!1,t.textContent="Entrar"}})}function ca(e){e.innerHTML=`
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
  `,document.getElementById("registerForm").addEventListener("submit",async a=>{a.preventDefault();const t=document.getElementById("registerBtn"),s=document.getElementById("registerError");t.disabled=!0,t.textContent="Creando cuenta…",s.classList.add("hidden");const n={username:document.getElementById("username").value.trim(),email:document.getElementById("email").value.trim(),country:document.getElementById("country").value.trim(),password:document.getElementById("password").value};try{const{token:i,user:o}=await c.auth.register(n);E.setUser(o,i),v("¡Cuenta creada! Bienvenido a PickGoal");const r=sessionStorage.getItem("pendingInviteCode");if(r){sessionStorage.removeItem("pendingInviteCode");try{const{league:d}=await c.leagues.joinByCode(r);v(`¡Te has unido a "${d.name}"!`),S.navigate(`/ligas/${d.id}`)}catch{S.navigate("/ligas")}}else S.navigate("/"),Ae("/")}catch(i){s.textContent=i.message||"Error al registrarse",s.classList.remove("hidden")}finally{t.disabled=!1,t.textContent="Crear cuenta"}})}function ua(){const e=localStorage.getItem("activeLeagueId");return e?parseInt(e):null}async function ma(e){var a,t;e.innerHTML='<div class="loading"><div class="loading__spinner"></div></div>';try{if(E.isLoggedIn()){const{leagues:p}=await c.leagues.my();if(p.length===0){e.innerHTML=ea();return}}const s=ua(),[{ranking:n},i]=await Promise.all([c.auth.ranking(s),E.isLoggedIn()?c.leagues.my():Promise.resolve({leagues:[]})]),o=E.getUser(),r=i.leagues.find(p=>p.id===s),d=document.getElementById("tablonBadge"),l=d&&!d.classList.contains("hidden"),h=l?d.textContent:"",_=((a=n[0])==null?void 0:a.matches_played)??0;e.innerHTML=`
      ${r?`<span class="page-league-name">${r.name}</span>`:""}
      <div class="container">
        <div class="ranking-header">
          <h1 class="page-title">Clasificación</h1>
          ${s?`
            <button class="ranking-tablon-btn" data-league-id="${s}">
              💬 Tablón
              <span class="ranking-tablon-btn__badge${l?"":" hidden"}">${h}</span>
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
              ${n.map(p=>{var j,b,u;const f=p.predictions_made??0,$=`${f}/${_}`,y=`${p.correct_results??0}/${f}`,w=`${p.exact_scores??0}/${f}`;return`
                  <tr class="${o&&p.id===o.id?"ranking-table__row--me":""}">
                    <td class="ranking-table__pos" data-pos="${p.position}">${p.position}</td>
                    <td>
                      <a class="ranking-table__link" href="#/jugador/${p.id}">
                        <span class="status-emoji" title="${((j=p.status)==null?void 0:j.name)||""}">${((b=p.status)==null?void 0:b.emoji)||""}</span>${p.username}
                      </a>
                    </td>
                    <td class="ranking-table__stat ranking-table__status">${((u=p.status)==null?void 0:u.name)||"—"}</td>
                    <td class="ranking-table__stat">${$}</td>
                    <td class="ranking-table__stat">${y}</td>
                    <td class="ranking-table__stat">${w}</td>
                    <td class="ranking-table__pts">${p.total_points}</td>
                  </tr>
                `}).join("")}
            </tbody>
          </table>
        </div>
      </div>
    `,(t=e.querySelector(".ranking-tablon-btn"))==null||t.addEventListener("click",()=>{S.navigate(`/tablon?liga=${s}`)})}catch(s){e.innerHTML=`<div class="container"><p class="form__error">Error: ${s.message}</p></div>`}}async function pe(e,{query:a={},forceGeneral:t=!1}={}){e.innerHTML='<div class="loading"><div class="loading__spinner"></div></div>';const s=E.getUser();let n=t?null:a.liga?parseInt(a.liga):null;if(t)localStorage.setItem("tablon_general_last_read",new Date().toISOString()),document.dispatchEvent(new CustomEvent("tablon:read"));else if(n){localStorage.setItem(`tablon_last_read_${n}`,new Date().toISOString());const u=document.getElementById("tablonBadge");u&&(u.classList.add("hidden"),u.textContent="")}let i=null,o=[],r=1,d=1;if(t&&s)try{const{users:u}=await c.auth.usersForMentions();o=u||[],console.log("[tablon] usuarios cargados:",o.length)}catch(u){console.warn("[tablon] error cargando usuarios:",u)}if(!t)try{if(!n&&s){const{leagues:u}=await c.leagues.my();u&&u.length&&(n=u[0].id,i=u[0].name)}else if(n)try{const{league:u}=await c.leagues.get(n);i=u.name}catch{}if(n&&s)try{const{members:u}=await c.leagues.members(n);o=u||[]}catch{}}catch{}async function l(){const u=await c.board.messages(r,n);return d=u.pages||1,u}try{const u=await l();h(u)}catch(u){e.innerHTML=`<div class="container"><p class="form__error">Error: ${u.message}</p></div>`}function h(u){const{pinned:g=[],messages:k=[]}=u;e.innerHTML=`
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

        ${g.length?`<section class="board-section">
               <h2 class="board-section__title">📌 Anuncios fijados</h2>
               <div class="board-pinned" id="boardPinned">
                 ${_(g)}
               </div>
             </section>`:""}

        <section class="board-section">
          ${g.length?'<h2 class="board-section__title">💬 Mensajes</h2>':""}
          <div class="board-messages" id="boardMessages">
            ${f(k)}
          </div>
          ${d>1?`<div class="pagination">
                 <button class="btn btn--ghost btn--sm" id="prevPage" ${r<=1?"disabled":""}>← Anterior</button>
                 <span>Página ${r} / ${d}</span>
                 <button class="btn btn--ghost btn--sm" id="nextPage" ${r>=d?"disabled":""}>Siguiente →</button>
               </div>`:""}
        </section>
      </div>
    `,y(),w(),I()}function _(u){return u.length?u.map(g=>`
      <div class="board-message board-message--pinned" data-id="${g.id}">
        <div class="board-message__header">
          <span class="board-message__pin-badge">📌</span>
          <strong class="board-message__author">${q(g.username)}</strong>
          <span class="board-message__date">${M(g.created_at)}</span>
          ${s!=null&&s.is_admin&&!g.is_deleted?`<button class="btn btn--ghost btn--xs unpin-msg" data-id="${g.id}" title="Desfijar">📌✕</button>`:""}
          ${!g.is_deleted&&s&&(s.id===g.user_id||s.is_admin)?`<button class="btn btn--danger btn--xs delete-msg" data-id="${g.id}">✕</button>`:""}
        </div>
        <p class="board-message__text">${$(g.message)}</p>

        ${g.replies&&g.replies.length?`<div class="board-replies">
               ${g.replies.map(k=>p(k)).join("")}
             </div>`:""}

        ${s&&!g.is_deleted?`<form class="reply-form" id="replyForm-${g.id}" data-parent="${g.id}">
               <div class="reply-form__input-wrap">
                 <input class="form__input reply-input" type="text"
                   placeholder="Responder…" maxlength="500"
                   id="replyInput-${g.id}" />
                 <div class="mention-dropdown hidden" id="mentionDropdown-${g.id}"></div>
               </div>
               <button class="btn btn--outline btn--sm" type="submit">Enviar</button>
             </form>`:""}
      </div>
    `).join(""):""}function p(u){return`
      <div class="board-reply ${u.is_deleted?"board-reply--deleted":""}" data-id="${u.id}">
        <div class="board-reply__header">
          <strong class="board-reply__author">${q(u.username)}</strong>
          <span class="board-reply__date">${M(u.created_at)}</span>
          ${!u.is_deleted&&s&&(s.id===u.user_id||s.is_admin)?`<button class="btn btn--danger btn--xs delete-msg" data-id="${u.id}">✕</button>`:""}
        </div>
        <p class="board-reply__text">${$(u.message)}</p>
      </div>
    `}function f(u){return u.length?u.map(g=>`
      <div class="board-message ${g.is_deleted?"board-message--deleted":""}" data-id="${g.id}">
        <div class="board-message__header">
          <strong class="board-message__author">${q(g.username)}</strong>
          <span class="board-message__date">${M(g.created_at)}</span>
          ${s!=null&&s.is_admin&&!g.is_deleted?`<button class="btn btn--ghost btn--xs pin-msg" data-id="${g.id}" title="Fijar">📌</button>`:""}
          ${!g.is_deleted&&s&&(s.id===g.user_id||s.is_admin)?`<button class="btn btn--danger btn--xs delete-msg" data-id="${g.id}">✕</button>`:""}
        </div>
        <p class="board-message__text">${$(g.message)}</p>
      </div>
    `).join(""):'<p class="empty">Sin mensajes aún. ¡Sé el primero!</p>'}function $(u){const g=q(u);if(!o.length)return g.replace(/@(\w+)/g,'<span class="mention">@$1</span>');const k=o.map(x=>pa(x.username)),B=new RegExp(`@(${k.join("|")})`,"gi");return g.replace(B,'<span class="mention">@$1</span>')}function y(){const u=document.getElementById("boardForm");if(!u)return;const g=document.getElementById("boardMsg"),k=document.getElementById("charCounter"),B=document.getElementById("mentionDropdown");g.addEventListener("input",()=>{k.textContent=`${g.value.length} / 500`,b(g,B)}),u.addEventListener("submit",async x=>{x.preventDefault();const O=g.value.trim();if(O)try{await c.board.post(O,n),g.value="",k.textContent="0 / 500",B.classList.add("hidden");const D=await l();j(D),v("Mensaje publicado")}catch(D){v(D.message,"error")}})}function w(){e.querySelectorAll(".reply-form").forEach(u=>{const g=parseInt(u.dataset.parent),k=u.querySelector(".reply-input"),B=`mentionDropdown-${g}`,x=document.getElementById(B);k==null||k.addEventListener("input",()=>{b(k,x)}),u.addEventListener("submit",async O=>{O.preventDefault();const D=k.value.trim();if(D)try{await c.board.reply(g,D),k.value="",x==null||x.classList.add("hidden");const U=await l();j(U),v("Respuesta enviada")}catch(U){v(U.message,"error")}})}),e.querySelectorAll(".pin-msg").forEach(u=>{u.addEventListener("click",async()=>{try{await c.board.pin(u.dataset.id);const g=await l();j(g),v("Mensaje fijado")}catch(g){v(g.message,"error")}})}),e.querySelectorAll(".unpin-msg").forEach(u=>{u.addEventListener("click",async()=>{try{await c.board.pin(u.dataset.id);const g=await l();j(g),v("Mensaje desfijado")}catch(g){v(g.message,"error")}})})}function I(){e.querySelectorAll(".delete-msg").forEach(u=>{u.addEventListener("click",async()=>{if(confirm("¿Eliminar este mensaje?"))try{await c.board.delete(u.dataset.id);const g=await l();j(g),v("Mensaje eliminado")}catch(g){v(g.message,"error")}})})}function j(u){const{pinned:g=[],messages:k=[]}=u,B=document.getElementById("boardPinned");if(B)B.innerHTML=_(g);else if(g.length){h(u);return}const x=document.getElementById("boardMessages");x&&(x.innerHTML=f(k)),w(),I()}e.addEventListener("click",async u=>{if(u.target.id==="prevPage"&&r>1){r--;const g=await l();j(g)}else if(u.target.id==="nextPage"&&r<d){r++;const g=await l();j(g)}});function b(u,g){if(!g||!o.length){console.log("[tablon] handleMentionInput: sin dropdown o members vacío",{dropdown:!!g,membersLen:o.length});return}const k=u.value,B=u.selectionStart,x=k.slice(0,B),O=x.match(/@(\w*)$/);if(!O){g.classList.add("hidden");return}const D=O[1].toLowerCase();console.log("[tablon] mention detected, query:",D);const U=o.filter(C=>C.username.toLowerCase().startsWith(D)&&C.id!==(s==null?void 0:s.id));console.log("[tablon] matches:",U.map(C=>C.username));const be=[...E.isAdmin()&&"todos".startsWith(D)?[{username:"todos",description:"Notificar a todos los miembros"}]:[],...U.slice(0,6)];if(!be.length){g.classList.add("hidden");return}g.innerHTML=be.map(C=>C.description?`<div class="mention-item mention-item--broadcast" data-username="${q(C.username)}">
             <span class="mention-item__name">@${q(C.username)}</span>
             <span class="mention-item__desc">${q(C.description)}</span>
           </div>`:`<div class="mention-item" data-username="${q(C.username)}">${q(C.username)}</div>`).join(""),g.classList.remove("hidden"),g.querySelectorAll(".mention-item").forEach(C=>{C.addEventListener("mousedown",Ke=>{Ke.preventDefault();const Ye=C.dataset.username,re=x.replace(/@(\w*)$/,`@${Ye} `);if(u.value=re+k.slice(B),u.setSelectionRange(re.length,re.length),g.classList.add("hidden"),u.tagName==="TEXTAREA"){const he=document.getElementById("charCounter");he&&(he.textContent=`${u.value.length} / 500`)}})})}document.addEventListener("click",u=>{!u.target.closest(".board-form__input-wrap")&&!u.target.closest(".reply-form__input-wrap")&&document.querySelectorAll(".mention-dropdown").forEach(g=>g.classList.add("hidden"))},{capture:!0})}function q(e){return String(e).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;")}function pa(e){return e.replace(/[.*+?^${}()|[\]\\]/g,"\\$&")}async function va(e){var a,t,s,n;e.innerHTML='<div class="loading"><div class="loading__spinner"></div></div>';try{const i=E.getUser(),o=i==null?void 0:i.is_admin,[r,d]=await Promise.all([o?c.leagues.adminAll():c.leagues.all(),E.isLoggedIn()&&!o?c.leagues.my():Promise.resolve({leagues:[]})]),l=new Set(d.leagues.map(_=>_.id)),h=o?r.leagues:r.leagues.filter(_=>!l.has(_.id));e.innerHTML=`
      <div class="container">
        <h1 class="page-title">Ligas</h1>

        ${o?`
          <div class="admin-notice">Vista administrador — puedes acceder a cualquier liga sin participar en ella.</div>
        `:""}

        ${i&&!o&&d.leagues.length>0?`
          <section class="section">
            <h2>Mis ligas</h2>
            <div class="leagues-grid">${d.leagues.map(_=>$e(_,!0)).join("")}</div>
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
          ${h.length?`<div class="leagues-grid">${h.map(_=>$e(_,!1,l,o)).join("")}</div>`:o?'<p class="empty">No hay ligas creadas aún.</p>':d.leagues.length>0?'<p class="empty">Ya participas en todas las ligas disponibles.</p>':'<p class="empty">No hay ligas aún. ¡Crea la primera!</p>'}
        </section>
      </div>
    `,e.querySelectorAll('.league-card[data-navigate="true"]').forEach(_=>{_.addEventListener("click",()=>S.navigate(`/ligas/${_.dataset.id}`))}),e.querySelectorAll(".btn-join-league").forEach(_=>{_.addEventListener("click",async p=>{p.stopPropagation();const f=parseInt(_.dataset.id);_.disabled=!0,_.textContent="…";try{const{league:$}=await c.leagues.join({league_id:f});v(`¡Te has unido a "${$.name}"!`),S.navigate(`/ligas/${$.id}`)}catch($){v($.message,"error"),_.disabled=!1,_.textContent="Unirse"}})}),e.querySelectorAll(".btn-private-info").forEach(_=>{_.addEventListener("click",p=>{p.stopPropagation(),v("Esta liga es privada. Pide el enlace de invitación a cualquier miembro para unirte.","info")})}),(a=document.getElementById("btnShowCreate"))==null||a.addEventListener("click",()=>{var _,p;(_=document.getElementById("createLeaguePanel"))==null||_.classList.remove("hidden"),(p=document.getElementById("btnShowCreate"))==null||p.classList.add("hidden")}),(t=document.getElementById("btnCancelCreate"))==null||t.addEventListener("click",()=>{var _,p;(_=document.getElementById("createLeaguePanel"))==null||_.classList.add("hidden"),(p=document.getElementById("btnShowCreate"))==null||p.classList.remove("hidden")}),(s=document.getElementById("joinCodeForm"))==null||s.addEventListener("submit",async _=>{_.preventDefault();const p=document.getElementById("inviteCode").value.trim().toUpperCase();if(p)try{const{league:f}=await c.leagues.join({invite_code:p});v(`Te has unido a "${f.name}"`),S.navigate(`/ligas/${f.id}`)}catch(f){v(f.message,"error")}}),(n=document.getElementById("createLeagueForm"))==null||n.addEventListener("submit",async _=>{var j;_.preventDefault();const p=document.getElementById("createBtn");p.disabled=!0,p.textContent="Creando…";const f=document.getElementById("leagueName").value.trim(),$=document.getElementById("leagueDesc").value.trim(),y=document.getElementById("leaguePrize").value.trim(),w=document.getElementById("isPublic").checked,I=((j=document.getElementById("isOfficial"))==null?void 0:j.checked)??!1;try{const{league:b}=await c.leagues.create({name:f,description:$,prize:y,is_public:w,is_official:I});_a(b)}catch(b){v(b.message,"error"),p.disabled=!1,p.textContent="Crear liga"}})}catch(i){e.innerHTML=`<div class="container"><p class="form__error">Error: ${i.message}</p></div>`}}function $e(e,a=!1,t=new Set,s=!1){const n=e.is_official?'<span class="league-badge league-badge--official">⭐ Oficial</span>':"",i=e.is_public?"🌍":"🔒",o=s?`<button class="btn btn--sm btn--outline btn-admin-view" data-id="${e.id}">Ver (admin)</button>`:a?`<button class="btn btn--sm btn--outline" onclick="event.stopPropagation(); window.location.hash='/ligas/${e.id}'">Ver liga</button>`:e.is_public?`<button class="btn btn--sm btn--primary btn-join-league" data-id="${e.id}">Unirse</button>`:'<button class="btn btn--sm btn--ghost btn-private-info">🔒 Solicitar enlace</button>';return`
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
  `}function _a(e){var s,n;const a=e.invite_link||"",t=document.getElementById("createLeaguePanel");t&&(t.innerHTML=`
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
  `,(s=document.getElementById("btnCopyLink"))==null||s.addEventListener("click",async()=>{try{await navigator.clipboard.writeText(a),v("Enlace copiado")}catch{v("No se pudo copiar","error")}}),(n=document.getElementById("btnShare"))==null||n.addEventListener("click",async()=>{try{await navigator.share({title:`Únete a ${e.name} en PickGoal`,url:a})}catch{}}))}async function ga(e,{params:a}){var s,n,i,o,r;const t=parseInt(a.id);e.innerHTML='<div class="loading"><div class="loading__spinner"></div></div>';try{const d=await c.leagues.get(t),{league:l,ranking:h,is_member:_,is_admin_view:p}=d,f=E.getUser(),$=l.is_official?'<span class="league-badge league-badge--official">⭐ Oficial</span>':"";e.innerHTML=`
      <div class="container">
        <a href="#/ligas" class="back-link">← Volver a ligas</a>

        ${p?`
          <div class="admin-notice">Vista administrador — no participas en esta liga</div>
        `:""}

        <div class="league-header">
          <h1 class="page-title">${l.name} ${$}</h1>
          ${l.description?`<p class="league-header__desc">${l.description}</p>`:""}
          <div class="league-header__meta">
            <span>${l.is_public?"🌍 Pública":"🔒 Privada"}</span>
            <span>${l.member_count} participantes</span>
            ${l.prize?`<span>🏆 ${l.prize}</span>`:""}
          </div>
        </div>

        ${(_||f!=null&&f.is_admin)&&l.invite_link?`
          <div class="invite-share-box">
            <span class="invite-share-box__label">Enlace de invitación:</span>
            <div class="invite-link-box">
              <span class="invite-link-box__url">${l.invite_link}</span>
              <button class="btn btn--sm btn--outline" id="btnCopyInvite">Copiar</button>
              ${navigator.share?'<button class="btn btn--sm btn--ghost" id="btnShareInvite">Compartir</button>':""}
            </div>
          </div>
        `:""}

        <div class="league-actions">
          ${_?'<button class="btn btn--danger btn--sm" id="btnLeave">Abandonar liga</button>':!(f!=null&&f.is_admin)&&f?'<button class="btn btn--primary" id="btnJoin">Unirse a esta liga</button>':""}
          ${f!=null&&f.is_admin||_&&f&&l.created_by===f.id?'<button class="btn btn--outline btn--sm" id="btnEditLeague">Editar liga</button>':""}
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
              ${h.map(b=>`
                <tr class="${f&&b.id===f.id?"ranking-table__row--me":""}">
                  <td>${b.position}</td>
                  <td>${b.username}</td>
                  <td>${b.country||"—"}</td>
                  <td class="ranking-table__pts">${b.total_points}</td>
                </tr>
              `).join("")}
            </tbody>
          </table>
        </section>

        <section class="section hidden" id="sectionTablon">
          <div id="tablonEmbed"></div>
        </section>
      </div>
    `,(s=document.getElementById("btnCopyInvite"))==null||s.addEventListener("click",async()=>{try{await navigator.clipboard.writeText(l.invite_link),v("Enlace copiado")}catch{v("No se pudo copiar","error")}}),(n=document.getElementById("btnShareInvite"))==null||n.addEventListener("click",async()=>{try{await navigator.share({title:`Únete a ${l.name} en PickGoal`,url:l.invite_link})}catch{}}),(i=document.getElementById("btnLeave"))==null||i.addEventListener("click",async()=>{if(confirm("¿Seguro que quieres abandonar esta liga?"))try{await c.leagues.leave(t),v("Has abandonado la liga"),S.navigate("/ligas")}catch(b){v(b.message,"error")}}),(o=document.getElementById("btnJoin"))==null||o.addEventListener("click",async()=>{try{await c.leagues.join({league_id:t}),v("¡Te has unido a la liga!"),S.navigate(`/ligas/${t}`)}catch(b){v(b.message,"error")}}),(r=document.getElementById("btnEditLeague"))==null||r.addEventListener("click",()=>{ba(l,t,f)});const y=document.getElementById("tabRanking"),w=document.getElementById("tabTablon"),I=document.getElementById("sectionRanking"),j=document.getElementById("sectionTablon");y&&w&&(y.addEventListener("click",()=>{y.classList.add("league-tab--active"),w.classList.remove("league-tab--active"),I.classList.remove("hidden"),j.classList.add("hidden")}),w.addEventListener("click",()=>{w.classList.add("league-tab--active"),y.classList.remove("league-tab--active"),I.classList.add("hidden"),j.classList.remove("hidden");const b=document.getElementById("tablonEmbed");b&&!b.dataset.loaded&&(b.dataset.loaded="1",pe(b,{query:{liga:String(t)}}))}))}catch(d){e.innerHTML=`<div class="container"><p class="form__error">Error: ${d.message}</p><a href="#/ligas">Volver</a></div>`}}function ba(e,a,t){const s=document.getElementById("editLeagueModal");s&&s.remove();const n=document.createElement("div");n.id="editLeagueModal",n.className="edit-league-modal",n.innerHTML=`
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
  `,document.body.appendChild(n),requestAnimationFrame(()=>n.classList.add("edit-league-modal--open"));const i=()=>{n.classList.remove("edit-league-modal--open"),n.addEventListener("transitionend",()=>n.remove(),{once:!0})};n.querySelector(".edit-league-modal__overlay").addEventListener("click",i),document.getElementById("btnCancelEdit").addEventListener("click",i),document.getElementById("editLeagueForm").addEventListener("submit",async o=>{o.preventDefault();const r=document.getElementById("btnSaveEdit");r.disabled=!0,r.textContent="Guardando…";const d={name:document.getElementById("editName").value.trim(),description:document.getElementById("editDesc").value.trim(),prize:document.getElementById("editPrize").value.trim(),is_public:document.getElementById("editPublic").checked};t!=null&&t.is_admin&&(d.is_official=document.getElementById("editOfficial").checked);try{await c.leagues.update(a,d),v("Liga actualizada"),i(),S.navigate(`/ligas/${a}`)}catch(l){v(l.message,"error"),r.disabled=!1,r.textContent="Guardar cambios"}})}async function ha(e){var t,s,n,i,o,r;e.innerHTML='<div class="loading"><div class="loading__spinner"></div></div>';const a=E.getUser();try{const[d,l,h]=await Promise.all([c.clasificacion.division(),c.auth.me(),a!=null&&a.is_admin?c.leagues.adminAll():Promise.resolve({leagues:[]})]),_=l.user,p=_.status,f=_.total_points_all_time,$=(t=d.standings)==null?void 0:t.find(y=>y.user_id===_.id);e.innerHTML=`
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
                <p id="emailDisplay">${_.email}</p>
                <button class="btn btn--ghost btn--xs" id="btnEditEmail" title="Cambiar email">✏️</button>
              </div>
              <div class="profile-card__email-edit hidden" id="emailEditForm">
                <input class="form__input" type="email" id="emailInput" value="${_.email}" autocomplete="email" />
                <div class="profile-card__email-actions">
                  <button class="btn btn--primary btn--xs" id="btnSaveEmail">Guardar</button>
                  <button class="btn btn--ghost btn--xs" id="btnCancelEmail">Cancelar</button>
                </div>
                <p class="form__error hidden" id="emailError"></p>
              </div>
              <p>${a.country||"Sin país"}</p>
            </div>
          </div>
          ${$a(p,f)}
          <button class="btn btn--danger" id="btnLogoutPerfil">Cerrar sesión</button>
          <div class="profile-card__stats">
            <div class="stat">
              <span class="stat__value">${$?`${$.pos}º`:"—"}</span>
              <span class="stat__label">Posición div.</span>
            </div>
            <div class="stat">
              <span class="stat__value">${$?L($.pts_division):"—"}</span>
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
          ${$?`<div class="division-info">
                 <p class="division-info__name">${d.league_name||"PickGoal División"}</p>
                 <div class="division-info__stats">
                   <div class="division-info__stat">
                     <span>${$.pos}º</span>
                     <small>de ${d.standings.length}</small>
                   </div>
                   <div class="division-info__stat">
                     <span>${L($.pts_division)}</span>
                     <small>pts división</small>
                   </div>
                   <div class="division-info__stat">
                     <span>${L($.pts_general)}</span>
                     <small>pts total</small>
                   </div>
                   <div class="division-info__stat">
                     <span>${$.pj}</span>
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

        ${a!=null&&a.is_admin&&h.leagues.length?`
          <section class="section">
            <h2>Ligas gestionadas</h2>
            <ul class="leagues-list">
              ${h.leagues.map(y=>`
                <li>
                  <span>${y.is_official?"⭐ ":""}${y.name}</span>
                  <span class="tag">${y.is_public?"Pública":"Privada"}</span>
                  <a href="#/ligas/${y.id}" class="btn btn--sm btn--outline">Gestionar</a>
                </li>
              `).join("")}
            </ul>
          </section>
        `:""}
      </div>
    `,(s=e.querySelector("#btnLogoutPerfil"))==null||s.addEventListener("click",()=>{E.logout(),window.location.hash="/"}),(n=e.querySelector("#btnEditEmail"))==null||n.addEventListener("click",()=>{e.querySelector("#emailEditForm").classList.remove("hidden"),e.querySelector("#emailInput").focus()}),(i=e.querySelector("#btnCancelEmail"))==null||i.addEventListener("click",()=>{e.querySelector("#emailEditForm").classList.add("hidden"),e.querySelector("#emailError").classList.add("hidden")}),(o=e.querySelector("#btnSaveEmail"))==null||o.addEventListener("click",async()=>{const y=e.querySelector("#emailInput").value.trim(),w=e.querySelector("#emailError");if(w.classList.add("hidden"),!y){w.textContent="El email no puede estar vacío",w.classList.remove("hidden");return}if(!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(y)){w.textContent="Formato de email inválido",w.classList.remove("hidden");return}try{const{user:j}=await c.auth.updateEmail(y);E.setUser(j,localStorage.getItem("token")),e.querySelector("#emailDisplay").textContent=j.email,e.querySelector("#emailEditForm").classList.add("hidden"),v("Email actualizado")}catch(j){w.textContent=j.message,w.classList.remove("hidden")}}),(r=e.querySelector("#btnDeleteAccount"))==null||r.addEventListener("click",()=>{wa()}),Ea(e),fa(e),ya(e)}catch(d){e.innerHTML=`<div class="container"><p class="form__error">Error: ${d.message}</p></div>`}}function A(e){return String(e||"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;")}async function fa(e){const a=e.querySelector("#conversacionesList");if(a)try{const{conversations:t}=await c.messages.list();if(!t.length){a.innerHTML='<p class="empty">Sin conversaciones aún.</p>';return}a.innerHTML=t.slice(0,5).map(s=>`
      <a href="#/mensajes/${s.user_id}" class="mensajes-item">
        <div class="mensajes-item__avatar">${A(s.username[0].toUpperCase())}</div>
        <div class="mensajes-item__info">
          <div class="mensajes-item__header">
            <strong class="mensajes-item__name">${A(s.username)}</strong>
            ${s.unread_count>0?`<span class="mensajes-item__badge">${s.unread_count}</span>`:""}
          </div>
          <p class="mensajes-item__preview">${A(s.last_message)}</p>
        </div>
      </a>
    `).join("")}catch{a.innerHTML='<p class="empty">Sin conversaciones aún.</p>'}}async function ya(e){const a=e.querySelector("#mencionesTablon");if(a)try{const t=localStorage.getItem("tablon_general_last_read")||new Date(0).toISOString(),{messages:s}=await c.board.mentions(t);if(!s||!s.length){a.innerHTML='<p class="empty">Sin menciones recientes.</p>';return}a.innerHTML=s.slice(0,5).map(n=>`
      <a href="#/tabla-v2?tab=tablon" class="mensajes-item">
        <div class="mensajes-item__avatar">${A(n.username[0].toUpperCase())}</div>
        <div class="mensajes-item__info">
          <div class="mensajes-item__header">
            <strong class="mensajes-item__name">${A(n.username)}</strong>
            <span class="mensajes-item__time">${M(n.created_at)}</span>
          </div>
          <p class="mensajes-item__preview">${A(n.message)}</p>
        </div>
      </a>
    `).join("")}catch{a.innerHTML='<p class="empty">Sin menciones recientes.</p>'}}function $a(e,a){if(e.next_threshold===null)return`
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
        <span class="level-progress__label">${L(a)} / ${e.next_threshold} pts → ${e.next_emoji||""} ${e.next_name}</span>
      </div>
      <div class="level-progress__bar"><div class="level-progress__fill" style="width:${s}%"></div></div>
    </div>`}async function Ea(e){var t,s;const a=e.querySelector("#predStatsWrap");if(a)try{const{total_predictions:n,correct_results:i,predictions:o}=await c.jornada.myStats();if(n===0){a.innerHTML='<p class="empty">Aún no tienes predicciones en esta temporada.</p>';return}const r=Math.round(i/n*100),d=50,l=+(2*Math.PI*d).toFixed(2),h=+(r/100*l).toFixed(2),_=+(l-h).toFixed(2);a.innerHTML=`
      <div class="pred-circle-wrap" id="predCircleBtn" role="button" tabindex="0" title="Ver detalle">
        <div class="pred-circle__chart">
          <svg viewBox="0 0 120 120" aria-hidden="true">
            <circle cx="60" cy="60" r="${d}" fill="none" stroke="#1a1a1a" stroke-width="12"/>
            <circle cx="60" cy="60" r="${d}" fill="none" stroke="#39FF14" stroke-width="12"
              stroke-dasharray="${h} ${_}" stroke-linecap="round"
              transform="rotate(-90 60 60)" class="pred-circle__arc"/>
          </svg>
          <div class="pred-circle__label">
            <span class="pred-circle__pct">${r}%</span>
          </div>
        </div>
        <p class="pred-circle__sub">${n} predicciones · ${i} acertadas</p>
        <span class="btn btn--ghost btn--xs" style="margin-top:4px">Ver detalle →</span>
      </div>
    `,(t=a.querySelector("#predCircleBtn"))==null||t.addEventListener("click",()=>{Ee(o)}),(s=a.querySelector("#predCircleBtn"))==null||s.addEventListener("keydown",p=>{(p.key==="Enter"||p.key===" ")&&Ee(o)})}catch{a.innerHTML='<p class="empty">No se pudieron cargar las predicciones.</p>'}}function Ee(e){var i,o;let a="all";const t=document.createElement("div");t.className="pred-modal",t.innerHTML=`
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
  `,document.body.appendChild(t),document.body.style.overflow="hidden",requestAnimationFrame(()=>t.classList.add("pred-modal--open"));function s(){const r=a==="all"?e:a==="correct"?e.filter(l=>l.is_correct):e.filter(l=>l.result_known&&!l.is_correct),d=document.getElementById("predModalList");if(d){if(!r.length){d.innerHTML='<p class="empty" style="text-align:center;padding:1rem">Sin predicciones en este filtro.</p>';return}d.innerHTML=r.map(l=>{const h=l.result_known?l.is_correct?"✅":"❌":"⏳",_=l.score?`${l.score}`:"—",p=l.result_known?`+${L(l.points_earned)} pts`:"—";return`
        <div class="pred-item ${l.is_correct?"pred-item--correct":l.result_known?"pred-item--wrong":""}">
          <span class="pred-item__icon">${h}</span>
          <div class="pred-item__body">
            <p class="pred-item__teams">${A(l.home_team)} vs ${A(l.away_team)}</p>
            <div class="pred-item__row">
              <span class="pred-item__pred">Pred: <strong>${l.predicted_result}</strong></span>
              ${l.actual_result?`<span class="pred-item__actual">Real: <strong>${l.actual_result}</strong> (${_})</span>`:'<span class="pred-item__actual">Sin resultado</span>'}
              <span class="pred-item__pts ${l.is_correct?"pred-item__pts--ok":""}">${p}</span>
            </div>
          </div>
        </div>
      `}).join("")}}s(),t.querySelectorAll(".pred-filter").forEach(r=>{r.addEventListener("click",()=>{t.querySelectorAll(".pred-filter").forEach(d=>d.classList.remove("pred-filter--active")),r.classList.add("pred-filter--active"),a=r.dataset.filter,s()})});function n(){t.classList.remove("pred-modal--open"),document.body.style.overflow="",t.addEventListener("transitionend",()=>t.remove(),{once:!0})}(i=document.getElementById("predModalClose"))==null||i.addEventListener("click",n),(o=document.getElementById("predModalOverlay"))==null||o.addEventListener("click",n)}function wa(){const e=document.createElement("div");e.className="delete-modal",e.innerHTML=`
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
  `,document.body.appendChild(e),document.body.style.overflow="hidden",requestAnimationFrame(()=>e.classList.add("delete-modal--open"));const a=e.querySelector("#deleteConfirmInput"),t=e.querySelector("#deleteConfirmBtn"),s=e.querySelector("#deleteCancelBtn"),n=e.querySelector("#deleteOverlay"),i=e.querySelector("#deleteError");function o(){e.classList.remove("delete-modal--open"),document.body.style.overflow="",e.addEventListener("transitionend",()=>e.remove(),{once:!0})}a.addEventListener("input",()=>{t.disabled=a.value.trim()!=="CERRAR"}),s.addEventListener("click",o),n.addEventListener("click",o),t.addEventListener("click",async()=>{t.disabled=!0,t.textContent="Cerrando…",i.classList.add("hidden");try{await c.auth.deleteAccount(),o(),E.logout(),v("Cuenta cerrada. Hasta pronto."),window.location.hash="/"}catch(r){i.textContent=r.message||"Error al cerrar la cuenta",i.classList.remove("hidden"),t.disabled=!1,t.textContent="Cerrar mi cuenta"}})}function ja(){window.location.hash="/"}async function La(e){if(!E.isAdmin()){e.innerHTML='<div class="container"><p class="form__error">Acceso denegado.</p></div>';return}e.innerHTML='<div class="loading"><div class="loading__spinner"></div></div>';try{const{users:a}=await c.auth.users();e.innerHTML=`
      <div class="container">
        <h1 class="page-title">Panel de Administración</h1>

        <section class="section admin-section" id="weeklyChecklistSection">
          <h2 class="admin-section__title">Estado de la semana</h2>
          <div id="weeklyChecklistContent">
            <div class="loading"><div class="loading__spinner"></div></div>
          </div>
        </section>

        <section class="section admin-section">
          <h2 class="admin-section__title">Scheduler</h2>
          <p class="admin-section__desc">Sincroniza el calendario cada 24h y actualiza partidos en vivo cada 5 min.</p>
          <button class="btn btn--primary" id="btnSync">Sincronizar ahora</button>
          <div id="syncResult"></div>
          <p class="admin-section__desc" style="margin-top:12px">
            El scheduler de Render (plan gratuito) no siempre despierta a tiempo — usa este botón si alguna
            jornada se queda sin predicciones de bots.
          </p>
          <button class="btn btn--ghost" id="btnGenerateBots">🤖 Generar predicciones bots</button>
          <div id="generateBotsResult"></div>
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
                ${a.map(Sa).join("")}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    `,ka(e),X(e),Ia(e)}catch(a){e.innerHTML=`<div class="container"><p class="form__error">Error: ${a.message}</p></div>`}}function ka(e){var s,n,i,o,r;(s=document.getElementById("btnSync"))==null||s.addEventListener("click",async()=>{const d=document.getElementById("syncResult");d.textContent="Sincronizando…";try{await c.matches.sync(),d.textContent="✓ Sincronización completada",v("Sincronización completada")}catch(l){d.textContent=`Error: ${l.message}`,v(l.message,"error")}}),(n=document.getElementById("btnGenerateBots"))==null||n.addEventListener("click",async()=>{const d=document.getElementById("btnGenerateBots"),l=document.getElementById("generateBotsResult");d.disabled=!0,l.textContent="Generando…";try{const{message:h}=await c.adminV2.generateBots();l.textContent=`✓ ${h}`,v(h)}catch(h){l.textContent=`Error: ${h.message}`,v(h.message,"error")}finally{d.disabled=!1}});const a=document.getElementById("pushTarget"),t=document.getElementById("pushTargetIdGroup");a==null||a.addEventListener("change",()=>{t.classList.toggle("hidden",a.value==="all")}),(i=document.getElementById("pushForm"))==null||i.addEventListener("submit",async d=>{d.preventDefault();const l=document.getElementById("pushTitle").value.trim()||"Aviso",h=document.getElementById("pushBody").value.trim(),_=a.value,p=parseInt(document.getElementById("pushTargetId").value)||null,f=document.getElementById("pushResult"),$={title:`📣 PickGoal — ${l}`,body:h};_==="league"&&p&&($.league_id=p),_==="user"&&p&&($.user_id=p),f.textContent="Enviando…";try{const{sent:y}=await c.notifications.send($);f.textContent=`✓ Enviada a ${y} suscripción(es)`,v(`Notificación enviada a ${y} suscripción(es)`)}catch(y){f.textContent=`Error: ${y.message}`,v(y.message,"error")}}),(o=document.getElementById("btnCloseSeason"))==null||o.addEventListener("click",async()=>{if(!confirm("¿Cerrar la temporada actual? Esta acción es irreversible."))return;const d=document.getElementById("btnCloseSeason"),l=document.getElementById("closeSeasonResult");d.disabled=!0,l.textContent="Cerrando…";try{const{message:h}=await c.post("/v2/admin/season/1/close");l.textContent=`✓ ${h||"Temporada cerrada"}`,v("Temporada cerrada")}catch(h){l.textContent=`Error: ${h.message}`,v(h.message,"error"),d.disabled=!1}}),(r=document.getElementById("usersTableBody"))==null||r.addEventListener("click",async d=>{const l=d.target.closest(".toggle-admin");if(l){const _=parseInt(l.dataset.id);try{const{user:p}=await c.auth.toggleAdmin(_);l.closest("tr").querySelector(".admin-badge").textContent=p.is_admin?"Sí":"No",v(`${p.username} ${p.is_admin?"ahora es admin":"ya no es admin"}`)}catch(p){v(p.message,"error")}return}const h=d.target.closest(".toggle-mute");if(h){const _=parseInt(h.dataset.id);try{const{user:p}=await c.auth.toggleMute(_),f=h.closest("tr");f.querySelector(".mute-badge").textContent=p.is_muted?"Sí":"No",h.textContent=p.is_muted?"Activar":"Silenciar",v(`${p.username} ${p.is_muted?"silenciado":"activado"}`)}catch(p){v(p.message,"error")}}})}function Sa(e){return`
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
  `}async function Ia(e){const a=document.getElementById("weeklyChecklistContent");if(a)try{const{checklist:t}=await c.adminV2.weeklyChecklist();a.innerHTML=xa(t)}catch(t){a.innerHTML=`<p class="form__error">Error: ${t.message}</p>`}}function ae(e,a,t){return`
    <div class="jv2-checklist__item ${e?"jv2-checklist__item--ok":"jv2-checklist__item--pending"}">
      <span class="jv2-checklist__icon">${e?"✅":"⏳"}</span>
      <span class="jv2-checklist__label">${a}</span>
      <span class="jv2-checklist__detail">${t}</span>
    </div>
  `}function xa(e){return`
    <div class="jv2-checklist">
      ${ae(e.jornada_publicada.ok,"Jornada actual publicada",e.jornada_publicada.detalle)}
      ${ae(e.predicciones_bots.ok,"Predicciones bots generadas",e.predicciones_bots.detalle)}
      ${ae(e.jornada_anterior_cerrada.ok,"Jornada anterior cerrada",e.jornada_anterior_cerrada.detalle)}
      ${ae(e.resultados_sincronizados.ok,"Resultados sincronizados",e.resultados_sincronizados.detalle)}
    </div>
  `}const Oe={PD:"🇪🇸 LaLiga",PL:"🏴󠁧󠁢󠁥󠁮󠁧󠁿 Premier League",CL:"⭐ Champions League",SA:"🇮🇹 Serie A",BL1:"🇩🇪 Bundesliga",FL1:"🇫🇷 Ligue 1",PPL:"🇵🇹 Primeira Liga",DED:"🇳🇱 Eredivisie",ELC:"🇪🇸 LaLiga 2",CDR:"🇪🇸 Copa del Rey",UNL:"🌍 UEFA Nations League",EC2024:"🌍 Eliminatorias Europa",CLI:"🌎 Amistosos internacionales",BSA:"🇧🇷 Brasileirao",MLS:"🇺🇸 MLS"},Ne=[{key:"principales",label:"📌 Principales",expandable:!1,defaultChecked:!0,codes:["PD","PL","CL"]},{key:"europa",label:"🌍 Europa",expandable:!0,defaultChecked:!1,codes:["BL1","SA","FL1","PPL","DED"]},{key:"espana",label:"🇪🇸 España",expandable:!0,defaultChecked:!1,codes:["ELC","CDR"]},{key:"selecciones",label:"🌎 Selecciones",expandable:!0,defaultChecked:!1,codes:["UNL","EC2024","CLI"]},{key:"otras",label:"⚽ Otras ligas",expandable:!0,defaultChecked:!1,codes:["BSA","MLS"]}];let T=[],se=null;async function X(e){const a=document.getElementById("jornadasV2Content");if(a)try{const{jornadas:t}=await c.adminV2.jornadas();a.innerHTML=Ca(t),Pa(a)}catch(t){a.innerHTML=`<p class="form__error">Error: ${t.message}</p>`}}function Ca(e){return`
    <div class="jv2-panel">
      <div class="jv2-panel__actions">
        <button class="btn btn--primary btn--sm" id="btnNuevaJornada">+ Nueva jornada</button>
      </div>

      <div class="jv2-list">
        ${e.length===0?'<p class="admin-section__desc">No hay jornadas creadas.</p>':e.map(Ta).join("")}
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
          <label class="form__label">Buscar partidos por rango de fechas</label>
          <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap">
            <div class="form__group" style="min-width:0">
              <label class="form__label" style="font-size:11px">Desde</label>
              <input class="form__input" type="date" id="jv2DateFrom" style="width:150px" />
            </div>
            <div class="form__group" style="min-width:0">
              <label class="form__label" style="font-size:11px">Hasta</label>
              <input class="form__input" type="date" id="jv2DateTo" style="width:150px" />
            </div>
          </div>

          <div class="jv2-comp-filter-groups" id="jv2CompGroups">
            ${Ba()}
          </div>

          <button class="btn btn--ghost btn--sm" id="btnBuscarPartidos" type="button" style="align-self:flex-start">Buscar partidos</button>
        </div>

        <div id="jv2MatchPicker" style="display:none">
          <div class="jv2-counter">
            Seleccionados: <strong id="jv2Count">0</strong>
          </div>
          <div id="jv2MatchList" class="jv2-match-list"></div>
        </div>

        <div class="jv2-form__footer">
          <button class="btn btn--primary btn--sm" id="btnGuardarJornada">Guardar como borrador</button>
          <button class="btn btn--ghost btn--sm" id="btnCancelarJornada">Cancelar</button>
        </div>
      </div>
    </div>
  `}function Ba(){return Ne.map(e=>{const a=e.codes.map(s=>`<span class="jv2-comp-filter-chip">${Oe[s]||s}</span>`).join(""),t=`
      <label class="jv2-comp-filter-check">
        <input type="checkbox" class="jv2-group-check" data-group="${e.key}" ${e.defaultChecked?"checked":""} />
        <span>${e.label}</span>
      </label>
    `;return e.expandable?`
      <details class="jv2-comp-filter-group jv2-comp-filter-group--collapsible">
        <summary class="jv2-comp-filter-group__summary">${t}</summary>
        <div class="jv2-comp-filter-group__list">${a}</div>
      </details>
    `:`
        <div class="jv2-comp-filter-group jv2-comp-filter-group--main">
          ${t}
          <div class="jv2-comp-filter-group__list">${a}</div>
        </div>
      `}).join("")}function Ta(e){const a={draft:'<span class="admin-match-badge" style="background:rgba(61,145,255,0.15);color:#3d91ff;border:1px solid rgba(61,145,255,0.3)">Borrador</span>',upcoming:'<span class="admin-match-badge admin-match-badge--pending">Próxima</span>',active:'<span class="admin-match-badge admin-match-badge--done">Activa</span>',finished:'<span class="admin-match-badge" style="background:rgba(255,255,255,0.05);color:#6e6e6e;border:1px solid #222">Finalizada</span>'}[e.status]||`<span class="admin-match-badge">${e.status}</span>`,t=d=>d?new Date(d).toLocaleDateString("es-ES",{day:"2-digit",month:"2-digit"}):"—",s=e.status==="draft"||e.status==="upcoming"||e.status==="active"||e.status==="finished",i=e.date_end&&new Date(e.date_end)<new Date&&(e.status==="upcoming"||e.status==="active"),o=e.status!=="finished",r=e.status!=="finished";return`
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
        `:""}
        ${o?`
          <button class="btn btn--ghost btn--xs jv2-edit-btn" data-id="${e.id}">Editar</button>
        `:""}
        ${s?`
          <button class="btn btn--ghost btn--xs jv2-results-btn" data-id="${e.id}" data-num="${e.number}">Resultados</button>
        `:""}
        ${i?`
          <button class="btn btn--danger btn--xs jv2-close-btn" data-id="${e.id}" data-num="${e.number}">Cerrar jornada</button>
        `:""}
        ${r?`
          <button class="btn btn--danger btn--xs jv2-del-btn" data-id="${e.id}" data-num="${e.number}">🗑️ Eliminar</button>
        `:""}
      </div>
    </div>
    <div class="jv2-results-panel" id="jv2-results-${e.id}" style="display:none"></div>
  `}function Pa(e){var a,t,s,n,i,o;(a=e.querySelector("#btnNuevaJornada"))==null||a.addEventListener("click",()=>{se=null,T=[],document.getElementById("jv2FormTitle").textContent="Nueva jornada",document.getElementById("jv2EditId").value="",document.getElementById("jv2Number").value="",document.getElementById("jv2DateStart").value="",document.getElementById("jv2DateEnd").value="",document.getElementById("jv2DateFrom").value="",document.getElementById("jv2DateTo").value="",document.getElementById("jv2MatchPicker").style.display="none",document.getElementById("jv2Form").style.display="block",ve()}),(t=e.querySelector("#btnCancelarJornada"))==null||t.addEventListener("click",()=>{document.getElementById("jv2Form").style.display="none",T=[],se=null}),(s=e.querySelector("#btnBuscarPartidos"))==null||s.addEventListener("click",Da),(n=e.querySelector("#btnGuardarJornada"))==null||n.addEventListener("click",Ha),e.querySelectorAll(".jv2-results-btn").forEach(r=>{r.addEventListener("click",()=>Oa(r.dataset.id,r))}),e.querySelectorAll(".jv2-pub-btn").forEach(r=>{r.addEventListener("click",async()=>{if(confirm(`¿Publicar jornada ${r.dataset.num}? Se calcularán cuotas, se asignarán duelos y se notificará a los usuarios.`)){r.disabled=!0,r.textContent="Publicando…";try{const d=await c.adminV2.publishJornada(r.dataset.id);v(`Jornada ${r.dataset.num} publicada — push enviado a ${d.push_sent} suscriptores`),await X(document.getElementById("jornadasV2Section"))}catch(d){v(d.message,"error"),r.disabled=!1,r.textContent="Publicar"}}})}),e.querySelectorAll(".jv2-close-btn").forEach(r=>{r.addEventListener("click",async()=>{if(confirm(`¿Cerrar jornada ${r.dataset.num}? Se calcularán los puntos y se resolverán los duelos. Esta acción es irreversible.`)){r.disabled=!0,r.textContent="Cerrando…";try{const d=await c.adminV2.closeJornada(r.dataset.id);v(d.message||`Jornada ${r.dataset.num} cerrada`),await X(document.getElementById("jornadasV2Section"))}catch(d){v(d.message,"error"),r.disabled=!1,r.textContent="Cerrar jornada"}}})}),e.querySelectorAll(".jv2-edit-btn").forEach(r=>{r.addEventListener("click",()=>Ma(r.dataset.id))}),e.querySelectorAll(".jv2-del-btn").forEach(r=>{r.addEventListener("click",async()=>{if(confirm(`¿Eliminar la jornada ${r.dataset.num}?`)&&confirm("¿Seguro? Esta acción eliminará la jornada y todos sus partidos")){r.disabled=!0,r.textContent="Eliminando…";try{await c.adminV2.deleteJornada(r.dataset.id),v("Jornada eliminada"),await X(document.getElementById("jornadasV2Section"))}catch(d){v(d.message,"error"),r.disabled=!1,r.textContent="🗑️ Eliminar"}}})}),(i=e.querySelector("#jv2DateStart"))==null||i.addEventListener("input",we),(o=e.querySelector("#jv2DateEnd"))==null||o.addEventListener("input",we),e.querySelectorAll(".jv2-group-check").forEach(r=>{r.addEventListener("click",d=>d.stopPropagation())})}function we(){var n,i;const e=(n=document.getElementById("jv2DateStart"))==null?void 0:n.value,a=(i=document.getElementById("jv2DateEnd"))==null?void 0:i.value,t=document.getElementById("jv2DateFrom"),s=document.getElementById("jv2DateTo");t&&e&&(t.value=e.slice(0,10)),s&&a&&(s.value=a.slice(0,10))}async function Ma(e){const{jornadas:a}=await c.adminV2.jornadas(),t=a.find(s=>String(s.id)===String(e));t&&(se=t.id,T=[],document.getElementById("jv2FormTitle").textContent=`Editar jornada ${t.number}`,document.getElementById("jv2EditId").value=t.id,document.getElementById("jv2Number").value=t.number,t.date_start&&(document.getElementById("jv2DateStart").value=t.date_start.slice(0,16)),t.date_end&&(document.getElementById("jv2DateEnd").value=t.date_end.slice(0,16)),t.date_start&&(document.getElementById("jv2DateFrom").value=t.date_start.slice(0,10)),t.date_end&&(document.getElementById("jv2DateTo").value=t.date_end.slice(0,10)),document.getElementById("jv2MatchPicker").style.display="none",document.getElementById("jv2Form").style.display="block",ve())}async function Da(){const e=document.getElementById("btnBuscarPartidos"),a=document.getElementById("jv2DateFrom").value,t=document.getElementById("jv2DateTo").value;if(!a||!t){v("Selecciona el rango de fechas (Desde / Hasta)","error");return}if(a>t){v('"Desde" no puede ser posterior a "Hasta"',"error");return}const s=Array.from(document.querySelectorAll(".jv2-group-check:checked")).map(i=>i.dataset.group),n=Ne.filter(i=>s.includes(i.key)).flatMap(i=>i.codes);if(n.length===0){v("Selecciona al menos un grupo de competiciones","error");return}e.disabled=!0,e.textContent="Buscando…";try{const{matches:i}=await c.adminV2.partidos(a,t,n);qa(i),document.getElementById("jv2MatchPicker").style.display="block"}catch(i){v(`Error: ${i.message}`,"error")}finally{e.disabled=!1,e.textContent="Buscar partidos"}}function qa(e){const a=document.getElementById("jv2MatchList");if(Object.values(e).flat().length===0){a.innerHTML='<p class="admin-section__desc">No hay partidos disponibles para esta semana.</p>';return}a.innerHTML=Object.entries(e).map(([s,n])=>n.length?`
      <div class="jv2-comp-group">
        <div class="jv2-comp-group__title">${Oe[s]||s}</div>
        ${n.map(i=>`
          <label class="jv2-match-item">
            <input type="checkbox" class="jv2-match-check" data-match='${JSON.stringify(i)}' />
            <span class="jv2-match-item__teams">${i.home_team} vs ${i.away_team}</span>
            <span class="jv2-match-item__date">${Aa(i.match_datetime)}</span>
          </label>
        `).join("")}
      </div>
    `:"").join(""),a.querySelectorAll(".jv2-match-check").forEach(s=>{s.addEventListener("change",()=>{const n=JSON.parse(s.dataset.match);if(s.checked){if(T.length>=10){s.checked=!1,v("Máximo 10 partidos","error");return}T.push(n)}else T=T.filter(i=>i.api_id!==n.api_id);ve()})})}function ve(){const e=document.getElementById("jv2Count");e&&(e.textContent=T.length)}async function Ha(){const e=parseInt(document.getElementById("jv2Number").value),a=document.getElementById("jv2DateStart").value,t=document.getElementById("jv2DateEnd").value,s=document.getElementById("jv2EditId").value;if(!e||!a||!t){v("Completa número y fechas","error");return}const n={number:e,date_start:new Date(a).toISOString(),date_end:new Date(t).toISOString()};T.length>0&&(n.matches=T);const i=document.getElementById("btnGuardarJornada");i.disabled=!0;try{s?(await c.adminV2.updateJornada(s,n),v(`Jornada ${e} actualizada`)):(await c.adminV2.createJornada(n),v(`Jornada ${e} guardada como borrador`)),document.getElementById("jv2Form").style.display="none",T=[],se=null,await X(document.getElementById("jornadasV2Section"))}catch(o){v(o.message,"error")}finally{i.disabled=!1}}function Aa(e){return e?new Date(e).toLocaleDateString("es-ES",{day:"2-digit",month:"2-digit"}):"—"}async function Oa(e,a){const t=document.getElementById(`jv2-results-${e}`);if(t){if(t.style.display!=="none"){t.style.display="none",a.textContent="Resultados";return}a.disabled=!0,a.textContent="Cargando…";try{const{matches:s}=await c.adminV2.jornadaMatches(e);t.innerHTML=Re(s,e),t.style.display="block",Ue(t,e),a.textContent="Ocultar"}catch(s){v(`Error: ${s.message}`,"error"),a.textContent="Resultados"}finally{a.disabled=!1}}}function Na(e){if(e.jm_status==="cancelled")return'<span class="admin-match-badge admin-match-badge--cancelled">🔴 Suspendido</span>';if(e.jm_status==="finished"){const n=e.home_score_90!=null&&e.away_score_90!=null?` ${e.home_score_90}–${e.away_score_90}`:"",i=e.is_manual?' <span class="admin-match-badge admin-match-badge--manual">🔒 Manual</span>':"";return`<span class="admin-match-badge admin-match-badge--done">🟢 Finalizado${n}</span>${i}`}const a=Date.now(),t=new Date(e.match_datetime).getTime(),s=t+2*60*60*1e3;return a>=t&&a<=s?'<span class="admin-match-badge admin-match-badge--live">🔵 En juego</span>':a>s?'<span class="admin-match-badge admin-match-badge--stale">⚠️ ¿Ya se jugó? Introduce el resultado manualmente</span>':'<span class="admin-match-badge admin-match-badge--pending">🟡 Pendiente</span>'}function Ra(e){return e?new Date(e).toLocaleString("es-ES",{day:"2-digit",month:"2-digit",hour:"2-digit",minute:"2-digit"}):"—"}function Re(e,a){const t=[...e].sort((s,n)=>new Date(n.match_datetime)-new Date(s.match_datetime));return`
    <div class="jv2-results-toolbar">
      <button class="btn btn--ghost btn--xs jv2-sync-btn" data-jornada-id="${a}">🔄 Sincronizar resultados ahora</button>
      <button class="btn btn--ghost btn--xs jv2-add-manual-btn">➕ Partido manual</button>
    </div>
    <div class="jv2-manual-form" style="display:none">
      <div class="jv2-manual-form__fields">
        <input type="text" class="form__input jv2-manual-home" placeholder="Equipo / Jugador local" maxlength="60" />
        <span class="jv2-manual-form__vs">vs</span>
        <input type="text" class="form__input jv2-manual-away" placeholder="Equipo / Jugador visitante" maxlength="60" />
        <input type="datetime-local" class="form__input jv2-manual-dt" />
      </div>
      <div class="jv2-manual-form__type-row">
        <label class="jv2-manual-form__type-label">Tipo:</label>
        <label class="jv2-manual-form__type-option">
          <input type="radio" name="jv2-manual-type-${a}" class="jv2-manual-type" value="1x2" checked /> 1X2 (con empate)
        </label>
        <label class="jv2-manual-form__type-option">
          <input type="radio" name="jv2-manual-type-${a}" class="jv2-manual-type" value="12" /> 12 (sin empate — tenis, NBA…)
        </label>
      </div>
      <div class="jv2-manual-form__odds-row">
        <span class="jv2-manual-form__odds-label">Cuotas:</span>
        <label class="jv2-manual-form__odds-item">
          <span>1</span>
          <input type="number" class="form__input jv2-manual-odds1" step="0.01" min="1" max="99" placeholder="2.50" style="width:72px" />
        </label>
        <label class="jv2-manual-form__odds-item jv2-manual-oddsx-wrap">
          <span>X</span>
          <input type="number" class="form__input jv2-manual-oddsx" step="0.01" min="1" max="99" placeholder="3.20" style="width:72px" />
        </label>
        <label class="jv2-manual-form__odds-item">
          <span>2</span>
          <input type="number" class="form__input jv2-manual-odds2" step="0.01" min="1" max="99" placeholder="2.80" style="width:72px" />
        </label>
      </div>
      <div class="jv2-manual-form__actions">
        <button class="btn btn--primary btn--xs jv2-manual-save-btn">Añadir</button>
        <button class="btn btn--ghost btn--xs jv2-manual-cancel-btn">Cancelar</button>
      </div>
    </div>
    <div class="jv2-results-table">
      ${t.map(s=>{const n=s.jm_status==="cancelled";return`
          <div class="jv2-results-row ${n?"jv2-results-row--cancelled":""}" data-jm-id="${s.jornada_match_id}">
            <div class="jv2-results-row__meta">
              <span class="jv2-results-row__datetime">${Ra(s.match_datetime)}</span>
              <div class="jv2-results-row__teams">
                <span>${s.home_team}</span>
                <span class="jv2-results-row__vs">vs</span>
                <span>${s.away_team}</span>
              </div>
              ${Na(s)}
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
                <select class="form__input jv2-result-type-select" style="width:72px" title="Tipo de resultado">
                  <option value="90m" ${(s.result_type??"90m")==="90m"?"selected":""}>90 min</option>
                  <option value="ET" ${s.result_type==="ET"?"selected":""}>Prórroga</option>
                  <option value="PEN" ${s.result_type==="PEN"?"selected":""}>Penaltis</option>
                </select>
                <button class="btn btn--primary btn--xs jv2-save-result-btn" data-jm-id="${s.jornada_match_id}">Guardar</button>
                <button class="btn btn--danger btn--xs jv2-cancel-match-btn" data-jm-id="${s.jornada_match_id}" data-home="${s.home_team}" data-away="${s.away_team}">Cancelar</button>
                ${s.is_manual?`<button class="btn btn--danger btn--xs jv2-delete-manual-btn" data-jm-id="${s.jornada_match_id}" data-home="${s.home_team}" data-away="${s.away_team}">🗑️ Eliminar</button>`:""}
              `}
            </div>
          </div>
        `}).join("")}
    </div>
  `}function Ue(e,a){var t,s,n,i;(t=e.querySelector(".jv2-add-manual-btn"))==null||t.addEventListener("click",()=>{const o=e.querySelector(".jv2-manual-form");o.style.display=o.style.display==="none"?"block":"none"}),(s=e.querySelector(".jv2-manual-cancel-btn"))==null||s.addEventListener("click",()=>{e.querySelector(".jv2-manual-form").style.display="none"}),e.querySelectorAll(".jv2-manual-type").forEach(o=>{o.addEventListener("change",()=>{var l;const r=((l=e.querySelector(".jv2-manual-type:checked"))==null?void 0:l.value)==="12",d=e.querySelector(".jv2-manual-oddsx-wrap");d&&(d.style.display=r?"none":"")})}),(n=e.querySelector(".jv2-manual-save-btn"))==null||n.addEventListener("click",async()=>{var $;const o=e.querySelector(".jv2-manual-home").value.trim(),r=e.querySelector(".jv2-manual-away").value.trim(),d=e.querySelector(".jv2-manual-dt").value,l=(($=e.querySelector(".jv2-manual-type:checked"))==null?void 0:$.value)==="12",h=e.querySelector(".jv2-manual-odds1").value,_=e.querySelector(".jv2-manual-oddsx").value,p=e.querySelector(".jv2-manual-odds2").value;if(!o||!r){v("Introduce los dos equipos","error");return}if(!d){v("Introduce la fecha y hora","error");return}const f=e.querySelector(".jv2-manual-save-btn");f.disabled=!0,f.textContent="…";try{const y={home_team:o,away_team:r,match_datetime:new Date(d).toISOString(),no_draw:l};h&&(y.odds_1=parseFloat(h)),!l&&_&&(y.odds_x=parseFloat(_)),p&&(y.odds_2=parseFloat(p)),await c.adminV2.addManualMatch(a,y),v("Partido manual añadido"),await G(a)}catch(y){v(y.message,"error"),f.disabled=!1,f.textContent="Añadir"}}),(i=e.querySelector(".jv2-sync-btn"))==null||i.addEventListener("click",async o=>{const r=o.currentTarget;r.disabled=!0,r.textContent="⏳ Sincronizando…";try{await c.matches.sync(),v("Sincronización completada"),await G(a)}catch(d){v(d.message,"error"),r.disabled=!1,r.textContent="🔄 Sincronizar resultados ahora"}}),e.querySelectorAll(".jv2-save-result-btn").forEach(o=>{o.addEventListener("click",async()=>{var f,$,y,w;const r=o.dataset.jmId,d=e.querySelector(`.jv2-results-row[data-jm-id="${r}"]`),l=(f=d.querySelector('.jv2-score-input[data-side="home"]'))==null?void 0:f.value,h=($=d.querySelector('.jv2-score-input[data-side="away"]'))==null?void 0:$.value,_=((y=d.querySelector(".jv2-r90-select"))==null?void 0:y.value)||void 0,p=((w=d.querySelector(".jv2-result-type-select"))==null?void 0:w.value)||"90m";if(l===""||h===""){v("Introduce los dos marcadores","error");return}o.disabled=!0,o.textContent="…";try{const I={home_score:parseInt(l),away_score:parseInt(h),result_type:p};_&&(I.result_90=_),await c.adminV2.setResultado(r,I),v("Resultado guardado y puntos recalculados"),await G(a)}catch(I){v(I.message,"error"),o.disabled=!1,o.textContent="Guardar"}})}),e.querySelectorAll(".jv2-cancel-match-btn").forEach(o=>{o.addEventListener("click",async()=>{const{jmId:r,home:d,away:l}=o.dataset;if(confirm(`¿Cancelar el partido ${d} vs ${l}? Las unidades apostadas se devolverán a los usuarios.`)){o.disabled=!0,o.textContent="…";try{const{message:h}=await c.adminV2.cancelMatch(r);v(h),await G(a)}catch(h){v(h.message,"error"),o.disabled=!1,o.textContent="Cancelar"}}})}),e.querySelectorAll(".jv2-delete-manual-btn").forEach(o=>{o.addEventListener("click",async()=>{const{jmId:r,home:d,away:l}=o.dataset;if(confirm(`¿Eliminar el partido manual ${d} vs ${l}? Se borrarán todas las predicciones asociadas.`)){o.disabled=!0,o.textContent="…";try{const{message:h}=await c.adminV2.deleteManualMatch(r);v(h),await G(a)}catch(h){v(h.message,"error"),o.disabled=!1,o.textContent="🗑️ Eliminar"}}})})}async function G(e){const a=document.getElementById(`jv2-results-${e}`);if(!(!a||a.style.display==="none"))try{const{matches:t}=await c.adminV2.jornadaMatches(e);a.innerHTML=Re(t,e),Ue(a,e)}catch(t){v(`Error recargando: ${t.message}`,"error")}}function Ua(e){e.innerHTML=`
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
  `,document.getElementById("forgotForm").addEventListener("submit",async a=>{a.preventDefault();const t=document.getElementById("forgotBtn"),s=document.getElementById("forgotMsg"),n=document.getElementById("email").value.trim();t.disabled=!0,t.textContent="Enviando…";try{await c.auth.forgotPassword(n),s.textContent="Si el email existe, recibirás un enlace en breve.",s.classList.remove("hidden","form__error"),s.classList.add("form__success")}catch{v("Error al enviar el email","error")}finally{t.disabled=!1,t.textContent="Enviar enlace"}})}function Fa(e,{query:a}){const t=a.token||"";if(!t){e.innerHTML='<div class="container"><p class="form__error">Token inválido o expirado.</p><a href="#/login">Volver</a></div>';return}e.innerHTML=`
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
  `,document.getElementById("resetForm").addEventListener("submit",async s=>{s.preventDefault();const n=document.getElementById("resetBtn"),i=document.getElementById("resetError"),o=document.getElementById("password").value;n.disabled=!0,n.textContent="Guardando…",i.classList.add("hidden");try{await c.auth.resetPassword(t,o),v("Contraseña actualizada. Ya puedes iniciar sesión."),S.navigate("/login")}catch(r){i.textContent=r.message||"Error al restablecer la contraseña",i.classList.remove("hidden")}finally{n.disabled=!1,n.textContent="Guardar contraseña"}})}async function Ja(e,{query:a}){const t=(a.codigo||"").trim().toUpperCase();if(!t){e.innerHTML='<div class="container"><p class="form__error">Enlace de invitación inválido.</p><a href="#/ligas">Ver ligas</a></div>';return}if(!E.isLoggedIn()){sessionStorage.setItem("pendingInviteCode",t),S.navigate("/register");return}e.innerHTML='<div class="loading"><div class="loading__spinner"></div></div>';try{const{league:s}=await c.leagues.joinByCode(t);v(`¡Te has unido a "${s.name}"!`),S.navigate(`/ligas/${s.id}`)}catch(s){if(s.status===409){v("Ya eres miembro de esta liga");try{const{leagues:n}=await c.leagues.my(),i=n.find(o=>o.invite_code===t);if(i){S.navigate(`/ligas/${i.id}`);return}}catch{}}e.innerHTML=`
      <div class="container">
        <div class="league-gate">
          <div class="league-gate__icon">⚠️</div>
          <h2 class="league-gate__title">Error al unirse</h2>
          <p class="league-gate__text">${s.message}</p>
          <a href="#/ligas" class="btn btn--primary">Ver ligas</a>
        </div>
      </div>
    `}}function za(){const e=localStorage.getItem("activeLeagueId");return e?parseInt(e):null}async function Va(e,{params:a}){const t=parseInt(a.id);if(!t){e.innerHTML='<div class="container"><p class="form__error">Usuario no válido.</p></div>';return}e.innerHTML='<div class="loading"><div class="loading__spinner"></div></div>';try{const s=za(),{user:n,predictions:i}=await c.predictions.forUser(t,s);e.innerHTML=`
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
              ${i.map(o=>Ga(o)).join("")}
            </div>`}
      </div>
    `}catch(s){e.innerHTML=`<div class="container"><p class="form__error">Error: ${s.message}</p></div>`}}function Ga(e){const a=e.match,t=e.total_points,s=e.pts_score>0,n=e.pts_result>0;let i="";return s?i='<span class="jugador__badge jugador__badge--exact">Exacto</span>':n?i='<span class="jugador__badge jugador__badge--ok">1X2 ✓</span>':i='<span class="jugador__badge jugador__badge--miss">Fallo</span>',`
    <div class="jugador__pred-row">
      <div class="jugador__pred-match">
        <span class="jugador__pred-teams">${a.home_team} vs ${a.away_team}</span>
        <span class="jugador__pred-date">${M(a.match_datetime)}</span>
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
  `}const V=20,Fe=5;let P={},R=0,ce=null,je=null,ee=[];async function Wa(e){e.innerHTML='<div class="loading"><div class="loading__spinner"></div></div>';try{const{jornadas:a}=await c.jornada.list();if(!a.length){e.innerHTML=Xa();return}const t=[...a].sort((i,o)=>i.jornada.number-o.jornada.number),s=t.findIndex(i=>i.jornada.status==="active"||i.jornada.status==="upcoming"),n=s>=0?s:t.length-1;Je(e,t,n)}catch(a){e.innerHTML=`<div class="container"><p class="form__error">Error cargando jornadas: ${a.message}</p></div>`}}function Je(e,a,t){var l,h;je=a[t];const{jornada:s,matches:n,units_used:i}=je;P={};for(const _ of n)P[_.jornada_match_id]={predicted_result:((l=_.prediction)==null?void 0:l.predicted_result)??null,units:((h=_.prediction)==null?void 0:h.units_wagered)??0};R=i;const o=n.filter(_=>!_.predict_locked);ee=o,ce=o.length===1?o[0].jornada_match_id:null;const r=s.status==="finished",d=a.length>1?`<div class="jornada-tabs">
        ${a.map((_,p)=>{const f=_.jornada.status==="finished",{pts:$,cls:y}=et(_);return`
            <button class="jornada-tab jornada-tab--stacked ${p===t?"jornada-tab--active":""} ${f?"jornada-tab--finished":""}" data-idx="${p}">
              <span class="jornada-tab__num">J${_.jornada.number}</span>
              <span class="jornada-tab__pts jornada-tab__pts--${y}">${L($)}pts</span>
            </button>
          `}).join("")}
       </div>`:"";e.innerHTML=`
    <div class="container">
      <div class="page-title-row">
        <h1 class="page-title">Jornada ${s.number} — del ${Le(s.date_start)} al ${Le(s.date_end)}</h1>
        <button class="btn-info" id="btnPointsInfo" aria-label="Cómo funciona">ℹ️</button>
      </div>
      ${d}
      ${r?"":'<div class="units-counter" id="unitsCounter"></div>'}
      <div class="jornada-matches">
        ${n.map(tt).join("")}
      </div>
      ${!r&&o.length>0?`
        <div class="jornada-save-all" id="jornadaSaveAll">
          <button class="jornada-save-all__btn" id="jornadaSaveAllBtn">
            💾 Guardar predicciones (0/${o.length} predichos)
          </button>
        </div>
      `:""}
      ${Z()}
    </div>
  `,ze(),Ve(),_e(),st(e,a,t),Q(e),requestAnimationFrame(()=>{var _;(_=e.querySelector(".jornada-tab--active"))==null||_.scrollIntoView({block:"nearest",inline:"center"})})}function Xa(){return`
    <div class="container">
      <div class="jornada-empty">
        <div class="jornada-empty__icon">📅</div>
        <h2 class="jornada-empty__title">No hay jornadas disponibles</h2>
        <p class="jornada-empty__text">Todavía no hay una próxima jornada programada.</p>
      </div>
    </div>
  `}function Le(e){return new Date(e).toLocaleDateString("es-ES",{day:"2-digit",month:"2-digit"})}function Ka(e){return new Date(e).toLocaleString("es-ES",{day:"2-digit",month:"2-digit",hour:"2-digit",minute:"2-digit"})}function le(e){return e!=null?e.toFixed(2):"—"}function Ya(e){return e.jm_status==="cancelled"?'<span class="tag tag--cancelled">Suspendido</span>':e.status==="finished"?`<span class="tag tag--done">Finalizado ${e.home_score_90??"?"}–${e.away_score_90??"?"}</span>`:e.predict_locked?'<span class="tag tag--locked">Bloqueado</span>':`<span class="tag tag--open">Abierto hasta ${Ka(e.opens_until)}</span>`}const Za=new Set(["r32","r16","quarters","semis","third","final","no_draw"]);function ue(e,a,t){const n={1:t.odds_1,X:t.odds_x,2:t.odds_2}[a];return n!=null?Math.round(e.units_wagered*parseFloat(n)*100)/100:e.points_earned??0}function Qa(e){let a=0;for(const t of e.matches){if(t.jm_status==="cancelled")continue;const s=t.prediction;if(t.status==="finished"&&t.result_90!=null){if(!s){a-=1;continue}s.predicted_result===t.result_90&&(a+=ue(s,t.result_90,t));continue}t.predict_locked&&s&&s.units_wagered&&(a+=ue(s,s.predicted_result,t))}return Math.round(a*100)/100}function et(e){const a=Qa(e),t=e.jornada.status;return{pts:a,cls:t==="finished"?"finished":t==="active"?"active":"upcoming"}}function at(e){if(e.jm_status==="cancelled")return"";const a=e.prediction;if(e.status==="finished"&&e.result_90!=null){if(!a)return'<span class="jornada-pts-label jornada-pts-label--penalty">-1 pt ⚠️</span>';if(a.predicted_result===e.result_90){const n=ue(a,e.result_90,e);return`<span class="jornada-pts-label jornada-pts-label--win">+${L(n)} pts</span>`}return'<span class="jornada-pts-label jornada-pts-label--loss">0 pts</span>'}if(!a||!a.units_wagered)return"";const s=e.predict_locked;return`<span class="jornada-pts-label jornada-pts-label--${s?"live":"pending"}">${a.units_wagered}u${s?" en juego":" apostadas"}</span>`}function tt(e){const a=e.jm_status==="cancelled",t=e.predict_locked,s=P[e.jornada_match_id]??{predicted_result:null,units:0},n=Za.has(e.phase);return`
    <div class="match-card jornada-match ${t?"match-card--locked":""} ${a?"match-card--cancelled":""}" data-jm-id="${e.jornada_match_id}">
      <div class="match-card__header">
        <span class="match-card__date">${M(e.match_datetime)}</span>
        ${Ya(e)}
      </div>
      <div class="match-card__teams">
        <span class="team team--home">${e.home_team}</span>
        <div class="match-card__score">
          ${e.status!=="scheduled"?`<span class="score">${e.home_score_90??"?"} - ${e.away_score_90??"?"}</span>`:'<span class="score score--dash">vs</span>'}
          ${at(e)}
        </div>
        <span class="team team--away">${e.away_team}</span>
      </div>
      <div class="jornada-odds">
        <span class="jornada-odds__item"><b>1</b> (${le(e.odds_1)})</span>
        ${n?"":`<span class="jornada-odds__item"><b>X</b> (${le(e.odds_x)})</span>`}
        <span class="jornada-odds__item"><b>2</b> (${le(e.odds_2)})</span>
      </div>
      <div class="jornada-match__controls ${t?"jornada-match__controls--disabled":""}">
        ${n?'<p class="jornada-match__knockout-label">Ganador</p>':""}
        <div class="result-selector ${n?"result-selector--knockout":""}">
          ${(n?["1","2"]:["1","X","2"]).map(i=>`
            <label class="result-selector__option">
              <input type="radio" name="result-${e.jornada_match_id}" value="${i}" ${s.predicted_result===i?"checked":""} ${t?"disabled":""} />
              ${i}
            </label>
          `).join("")}
        </div>
        <div class="jornada-units">
          <label class="jornada-units__label" for="units-${e.jornada_match_id}">Unidades</label>
          <input type="number" id="units-${e.jornada_match_id}" class="jornada-units__input" min="0" max="${Fe}" value="${s.units}" ${t?"disabled":""} />
        </div>
      </div>
      ${t?"":`<div class="jornada-match__warning" id="warning-${e.jornada_match_id}"></div>`}
    </div>
  `}function ze(){const e=document.getElementById("unitsCounter");if(!e)return;const a=R>V;e.innerHTML=`
    <div class="units-counter__bar">
      <div class="units-counter__fill ${a?"units-counter__fill--over":""}" style="width:${Math.min(100,R/V*100)}%"></div>
    </div>
    <span class="units-counter__label ${a?"units-counter__label--over":""}">${R}/${V} unidades usadas</span>
  `}function Ve(){if(!ce)return;const e=document.getElementById(`warning-${ce}`);if(!e)return;const a=V-R;e.innerHTML=a>0?`<p class="notice">Te quedan ${a} unidades — es tu último partido.</p>`:""}function ke(){R=Object.values(P).reduce((e,a)=>e+(a.predicted_result?a.units:0),0),ze(),Ve(),_e()}function st(e,a,t){var s;e.querySelectorAll(".jornada-tab").forEach(n=>{n.addEventListener("click",()=>{const i=parseInt(n.dataset.idx);i!==t&&Je(e,a,i)})}),e.querySelectorAll(".jornada-match").forEach(n=>{const i=parseInt(n.dataset.jmId);n.querySelectorAll('input[type="radio"]').forEach(r=>{r.addEventListener("change",()=>{P[i].predicted_result=r.value,ke()})});const o=n.querySelector(".jornada-units__input");o==null||o.addEventListener("input",()=>{let r=parseInt(o.value);isNaN(r)&&(r=0),r=Math.max(0,Math.min(Fe,r)),P[i].units=r,ke()})}),(s=document.getElementById("jornadaSaveAllBtn"))==null||s.addEventListener("click",nt)}function _e(){const e=document.getElementById("jornadaSaveAllBtn");if(!e)return;const a=ee.filter(s=>{var n;return(n=P[s.jornada_match_id])==null?void 0:n.predicted_result}).length,t=ee.length;e.textContent=`💾 Guardar predicciones (${a}/${t} predichos)`}async function nt(){const e=ee.filter(i=>{var o;return!((o=P[i.jornada_match_id])!=null&&o.predicted_result)});if(e.length>0&&!confirm(`⚠️ Te quedan ${e.length} partido${e.length!==1?"s":""} sin predecir (−1 pt cada uno).

¿Guardar igualmente?`))return;if(R>V){v(`Superas el máximo de ${V} unidades`,"error");return}const a=ee.filter(i=>{var o;return(o=P[i.jornada_match_id])==null?void 0:o.predicted_result});if(!a.length){v("No hay predicciones que guardar","error");return}const t=document.getElementById("jornadaSaveAllBtn");t&&(t.disabled=!0,t.textContent="Guardando…");const n=(await Promise.allSettled(a.map(i=>c.jornada.predict({jornada_match_id:i.jornada_match_id,predicted_result:P[i.jornada_match_id].predicted_result,units:P[i.jornada_match_id].units})))).filter(i=>i.status==="rejected").length;n===0?v(`${a.length} predicción${a.length!==1?"es":""} guardadas ✓`):v(`${n} error${n!==1?"es":""} al guardar`,"error"),t&&(t.disabled=!1,_e())}let te=null;function ge(){te&&(clearInterval(te),te=null)}const Se={en_curso:{label:"En curso",cls:"duelo-status--curso"},ganado:{label:"Ganaste",cls:"duelo-status--ganado"},perdido:{label:"Perdiste",cls:"duelo-status--perdido"},empate:{label:"Empate",cls:"duelo-status--empate"}},it={ganado:"🏆 Victoria",perdido:"💔 Derrota",empate:"🤝 Empate"};function ot(e){return e.is_bye?{icon:"",cls:""}:e.jornada_status==="active"||e.jornada_status==="upcoming"?{icon:e.my_points>e.rival_points?"✓":e.my_points<e.rival_points?"✗":"=",cls:"live"}:e.status==="ganado"?{icon:"✓",cls:"win"}:e.status==="perdido"?{icon:"✗",cls:"loss"}:e.status==="empate"?{icon:"=",cls:"draw"}:{icon:"",cls:""}}async function rt(e){ge(),e.innerHTML='<div class="loading"><div class="loading__spinner"></div></div>';try{const[{duelos:a},t]=await Promise.all([c.duelo.list(),Promise.resolve(E.getUser())]);if(!a.length){e.innerHTML=`
        <div class="container">
          <h1 class="page-title">Duelos</h1>
          <div class="duelo-empty">
            <div class="duelo-empty__icon">🤝</div>
            <p class="duelo-empty__text">No tienes duelos todavía.</p>
          </div>
        </div>
      `;return}const s=a.findIndex(o=>o.jornada_status==="active"||o.jornada_status==="upcoming"),n=s>=0?s:a.length-1,i=a.map((o,r)=>{const{icon:d,cls:l}=ot(o);return`
        <button class="jornada-tab ${r===n?"jornada-tab--active":""}" data-idx="${r}">
          <span class="jornada-tab__num">J${o.jornada_number}</span>
          ${d?`<span class="jornada-tab__result jornada-tab__result--${l}">${d}</span>`:""}
        </button>
      `}).join("");e.innerHTML=`
      <div class="container">
        <div class="page-title-row">
          <h1 class="page-title">Duelos</h1>
          <button class="btn-info" id="btnPointsInfo" aria-label="Cómo funciona">ℹ️</button>
        </div>
        <div class="jornada-tabs">${i}</div>
        <div id="dueloContent"></div>
        ${Z()}
      </div>
    `,Q(e),requestAnimationFrame(()=>{var o;(o=e.querySelector(".jornada-tab--active"))==null||o.scrollIntoView({block:"nearest",inline:"center"})}),e.querySelectorAll(".jornada-tab").forEach(o=>{o.addEventListener("click",()=>{e.querySelectorAll(".jornada-tab").forEach(r=>r.classList.remove("jornada-tab--active")),o.classList.add("jornada-tab--active"),Ie(e,a[parseInt(o.dataset.idx)],t)})}),await Ie(e,a[n],t)}catch(a){e.innerHTML=`<div class="container"><p class="form__error">Error cargando duelos: ${a.message}</p></div>`}}async function Ie(e,a,t){var i;ge();const s=e.querySelector("#dueloContent");if(!s)return;s.innerHTML='<div class="loading"><div class="loading__spinner"></div></div>';const n=a.jornada_status==="active"||a.jornada_status==="upcoming";try{const{duelo:o}=await c.duelo.current(a.jornada_id);if(n){if(!o){s.innerHTML=ct();return}if(s.innerHTML=dt(o,t),Ce(s,o.division_league_id,t.id),!a.is_bye){const r=((i=a.rival)==null?void 0:i.username)??"—";xe(a.jornada_id,t.username,r),te=setInterval(()=>xe(a.jornada_id,t.username,r),6e4)}}else s.innerHTML=lt(a,o,t),Ce(s,a.division_league_id,t.id)}catch(o){s.innerHTML=`<p class="form__error">Error: ${o.message}</p>`}}function dt(e,a){var i;const t=Se[e.status]??Se.en_curso,s=e.rival?e.rival.username:a.username,n=!e.rival||e.rival.id===a.id;return`
    <div class="duelo-card">
      <span class="duelo-status ${t.cls}">${t.label}</span>
      <div class="duelo-card__matchup">
        <div class="duelo-card__player">
          <span class="duelo-card__name">${a.username}</span>
          <span class="duelo-card__pts">${L(e.my_points)}</span>
        </div>
        <span class="duelo-card__vs">VS</span>
        <div class="duelo-card__player">
          <span class="duelo-card__name">${n?"Descanso":s}</span>
          <span class="duelo-card__pts">${n?"—":L(e.rival_points)}</span>
        </div>
      </div>
    </div>

    ${n?"":'<div class="duelo-tracker" id="dueloTracker"></div>'}

    ${!n&&((i=e.matches)==null?void 0:i.length)>0?`
      <h2 class="section-title">Partido a partido</h2>
      <div class="duelo-matches">
        ${e.matches.map(o=>mt(o,s)).join("")}
      </div>
    `:""}

    <h2 class="section-title">Clasificación divisional</h2>
    <div id="divisionStandings"><div class="loading"><div class="loading__spinner"></div></div></div>
  `}function lt(e,a,t){var j;const s=((j=e.rival)==null?void 0:j.username)??(e.is_bye?"Descanso":"—"),n=it[e.status],i=(a==null?void 0:a.matches)??[];let o=0,r=0,d=0,l=0;for(const b of i)b.jm_status!=="cancelled"&&(b.my_prediction?(d+=b.my_prediction.units_wagered,b.status==="finished"&&b.result_90!=null&&(r+=b.my_prediction.points_earned??0,b.my_prediction.predicted_result===b.result_90&&o++)):b.status==="finished"&&b.result_90!=null&&l++);const h=20-d,_=o>=10?10:o>=9?5:o>=8?2:0,p=o>=10;function f(b){if(!b.result_90)return"—";const g={1:b.odds_1,X:b.odds_x,2:b.odds_2}[b.result_90];return g!=null?parseFloat(g).toFixed(2):"—"}function $(b,u){return u?b?b.predicted_result===u?`<span class="pts-label pts-label--win">+${L(b.points_earned??0)} pts</span>`:'<span class="pts-label pts-label--loss">0 pts</span>':'<span class="pts-label pts-label--penalty">-1 pt</span>':"—"}const y=i.map(b=>{const u=b.my_prediction?`${b.my_prediction.predicted_result} · ${b.my_prediction.units_wagered}u`:"—",g=b.rival_prediction?`${b.rival_prediction.predicted_result} · ${b.rival_prediction.units_wagered}u`:b.started?"—":"?",k=b.result_90!=null?`${b.home_score_90??"?"}–${b.away_score_90??"?"} (${b.result_90})`:"—";return`
      <tr>
        <td class="duelo-breakdown__teams">${b.home_team} vs ${b.away_team}</td>
        <td class="duelo-breakdown__odds">${f(b)}</td>
        <td class="duelo-breakdown__pick">${u}</td>
        <td class="duelo-breakdown__pick duelo-breakdown__pick--rival">${g}</td>
        <td class="duelo-breakdown__result">${k}</td>
        <td class="duelo-breakdown__pts">${$(b.my_prediction,b.result_90)}</td>
        <td class="duelo-breakdown__pts duelo-breakdown__pts--rival">${$(b.rival_prediction,b.result_90)}</td>
      </tr>
    `}).join(""),w=`
    <tr class="duelo-breakdown__footer-row">
      <td colspan="5" class="duelo-breakdown__total-label">Ganancias apuestas</td>
      <td class="duelo-breakdown__pts" colspan="2">+${L(r)} pts</td>
    </tr>
    <tr class="duelo-breakdown__footer-row">
      <td colspan="5" class="duelo-breakdown__total-label">Sin apostar (${h}u)</td>
      <td class="duelo-breakdown__pts" colspan="2">+${L(h)} pts</td>
    </tr>
    ${l>0?`
    <tr class="duelo-breakdown__footer-row">
      <td colspan="5" class="duelo-breakdown__total-label">Penalización (${l} partido${l>1?"s":""} sin pred.)</td>
      <td class="duelo-breakdown__pts duelo-breakdown__pts--penalty" colspan="2">−${l} pt${l>1?"s":""}</td>
    </tr>`:""}
    ${_>0?`
    <tr class="duelo-breakdown__footer-row">
      <td colspan="5" class="duelo-breakdown__total-label">
        ${p?"🎯 ¡Pleno! ":""}Bonus (${o}/10 aciertos)
      </td>
      <td class="duelo-breakdown__pts duelo-breakdown__pts--bonus" colspan="2">+${_} pts</td>
    </tr>`:""}
    <tr class="duelo-breakdown__footer-row duelo-breakdown__footer-row--total">
      <td colspan="5" class="duelo-breakdown__total-label">Total</td>
      <td class="duelo-breakdown__total-pts" colspan="2">${L(e.my_points)} pts</td>
    </tr>
  `,I=i.length>0?`
    <h2 class="section-title">Partido a partido</h2>
    <div class="duelo-breakdown">
      <table class="duelo-breakdown__table">
        <thead>
          <tr>
            <th>Partido</th>
            <th>Cuota</th>
            <th>Mi pred/u</th>
            <th>${s}</th>
            <th>Resultado</th>
            <th>Mis pts</th>
            <th>Rival pts</th>
          </tr>
        </thead>
        <tbody>${y}</tbody>
        <tfoot>${w}</tfoot>
      </table>
    </div>
  `:"";return`
    <div class="duelo-card duelo-card--finished">
      ${n?`<span class="duelo-result-badge duelo-result-badge--${e.status}">${n}</span>`:""}
      <div class="duelo-card__matchup">
        <div class="duelo-card__player">
          <span class="duelo-card__name">${t.username}</span>
          <span class="duelo-card__pts">${L(e.my_points)}</span>
        </div>
        <span class="duelo-card__vs">VS</span>
        <div class="duelo-card__player">
          <span class="duelo-card__name">${s}</span>
          <span class="duelo-card__pts">${e.is_bye?"—":L(e.rival_points)}</span>
        </div>
      </div>
    </div>

    ${I}

    <h2 class="section-title">Clasificación divisional</h2>
    <div id="divisionStandings"><div class="loading"><div class="loading__spinner"></div></div></div>
  `}function ct(){return`
    <div class="duelo-empty">
      <div class="duelo-empty__icon">🤝</div>
      <p class="duelo-empty__text">No tienes un duelo asignado esta jornada.</p>
    </div>
  `}async function xe(e,a,t){const s=document.getElementById("dueloTracker");if(!s){ge();return}try{const{detail:n}=await c.duelo.detail(e);if(!n)return;s.innerHTML=ut(n,a,t)}catch{}}function ut(e,a,t){const{me:s,rival:n}=e;function i(o,r){return`
      <div class="duelo-tracker__col">
        <div class="duelo-tracker__player">${o}</div>
        <div class="duelo-tracker__pts">${L(r.points_earned)}</div>
        <div class="duelo-tracker__rows">
          <div class="duelo-tracker__row">
            <span class="duelo-tracker__icon">✅</span>
            <span class="duelo-tracker__label">Ganados</span>
            <span class="duelo-tracker__val">${L(r.points_earned)}</span>
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
  `}function mt(e,a){var i;const t=(i=e.my_prediction)==null?void 0:i.predicted_result;let s,n;return e.started?e.rival_prediction?(s=e.rival_prediction.predicted_result,n=""):(s="—",n="duelo-pick__value--empty"):(s="?",n="duelo-pick__value--hidden"),`
    <div class="match-card duelo-pick-card">
      <div class="match-card__header">
        <span class="match-card__date">${M(e.match_datetime)}</span>
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
  `}async function Ce(e,a,t){const s=e.querySelector("#divisionStandings");if(s)try{const{standings:n}=await c.clasificacion.division(a);if(!n.length){s.innerHTML='<p class="empty">Sin clasificación disponible.</p>';return}s.innerHTML=`
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
                <td class="ranking-table__pts">${L(i.pts_division)}</td>
              </tr>
            `).join("")}
          </tbody>
        </table>
      </div>
    `}catch(n){s.innerHTML=`<p class="form__error">Error cargando la clasificación: ${n.message}</p>`}}async function pt(e,{query:a={}}={}){e.innerHTML='<div class="loading"><div class="loading__spinner"></div></div>';try{const{standings:t}=await c.clasificacion.general(),s=E.getUser();e.innerHTML=`
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
                          ${n.is_bot||s&&n.user_id===s.id?ne(n.username):`<button class="user-link" data-user-id="${n.user_id}">${ne(n.username)}</button>`}
                        </td>
                        <td class="ranking-table__stat">${L(n.pts_jornada_actual)}</td>
                        <td class="ranking-table__pts">${L(n.pts_general)}</td>
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
        ${Z()}
      </div>
    `,_t(s,a.tab),Q(e),vt(),ft(e,s)}catch(t){e.innerHTML=`<div class="container"><p class="form__error">Error cargando la clasificación: ${t.message}</p></div>`}}async function vt(){const e=document.getElementById("tablonTabDot");if(!e)return;if(!E.getUser()){e.classList.add("hidden");return}const t=localStorage.getItem("tablon_general_last_read")||new Date(0).toISOString();try{const{count:s}=await c.board.unread(null,t);console.log("[tablonDot] count:",s,"since:",t),e.classList.toggle("hidden",s===0)}catch(s){console.warn("[tablonDot] error:",s),e.classList.add("hidden")}}function _t(e,a){const t={general:{btn:document.getElementById("tabGeneral"),panel:document.getElementById("panelGeneral")},miDivision:{btn:document.getElementById("tabMiDivision"),panel:document.getElementById("panelMiDivision")},divisiones:{btn:document.getElementById("tabDivisiones"),panel:document.getElementById("panelDivisiones")},tablon:{btn:document.getElementById("tabTablon"),panel:document.getElementById("panelTablon")}};function s(i){for(const[o,{btn:r,panel:d}]of Object.entries(t))r.classList.toggle("league-tab--active",o===i),d.classList.toggle("hidden",o!==i)}t.general.btn.addEventListener("click",()=>s("general")),t.miDivision.btn.addEventListener("click",()=>{s("miDivision"),t.miDivision.panel.dataset.loaded||(t.miDivision.panel.dataset.loaded="1",gt(e))}),t.divisiones.btn.addEventListener("click",()=>{s("divisiones"),t.divisiones.panel.dataset.loaded||(t.divisiones.panel.dataset.loaded="1",bt(e))});function n(){var i;s("tablon"),localStorage.setItem("tablon_general_last_read",new Date().toISOString()),(i=document.getElementById("tablonTabDot"))==null||i.classList.add("hidden"),document.dispatchEvent(new CustomEvent("tablon:read")),t.tablon.panel.dataset.loaded||(t.tablon.panel.dataset.loaded="1",pe(t.tablon.panel,{forceGeneral:!0}))}t.tablon.btn.addEventListener("click",n),a==="tablon"&&n()}async function gt(e){const a=document.getElementById("panelMiDivision");if(a)try{const{standings:t}=await c.clasificacion.division();if(t.length===0){a.innerHTML='<p class="empty">Todavía no perteneces a ninguna división.</p>';return}a.innerHTML=`
      <div class="ranking-table-wrapper">
        <table class="ranking-table">
          <thead>
            <tr><th>#</th><th>Usuario</th><th>PJ</th><th>G</th><th>E</th><th>P</th><th>Pts div</th></tr>
          </thead>
          <tbody>
            ${t.map(s=>Ge(s,e)).join("")}
          </tbody>
        </table>
      </div>
    `}catch(t){a.innerHTML=`<p class="form__error">Error: ${t.message}</p>`}}async function bt(e){const a=document.getElementById("panelDivisiones");if(a)try{const{divisions:t}=await c.clasificacion.allDivisions();if(!t.length){a.innerHTML='<p class="empty">No hay divisiones activas.</p>';return}a.innerHTML=t.map(s=>ht(s,e)).join(""),a.querySelectorAll(".div-accordion__header").forEach(s=>{s.addEventListener("click",()=>{const i=s.nextElementSibling.classList.toggle("hidden");s.querySelector(".div-accordion__chevron").textContent=i?"▶":"▼"})})}catch(t){a.innerHTML=`<p class="form__error">Error: ${t.message}</p>`}}function ht(e,a){const t=e.standings.some(s=>a&&s.user_id===a.id);return`
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
              ${e.standings.map(s=>Ge(s,a)).join("")}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `}function ne(e){return String(e||"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;")}function ft(e,a){let t=document.getElementById("userCtxMenu");t||(t=document.createElement("div"),t.id="userCtxMenu",t.className="user-ctx-menu hidden",t.innerHTML=`
      <a class="user-ctx-menu__item" id="ctxProfile" href="#">👤 Ver jugador</a>
      <button class="user-ctx-menu__item" id="ctxMessage">💬 Enviar mensaje</button>
    `,document.body.appendChild(t),document.addEventListener("click",s=>{!s.target.closest("#userCtxMenu")&&!s.target.closest(".user-link")&&t.classList.add("hidden")},!0)),e.addEventListener("click",s=>{const n=s.target.closest(".user-link");if(!n)return;s.stopPropagation();const i=n.dataset.userId,o=n.getBoundingClientRect();t.querySelector("#ctxProfile").href=`#/jugador/${i}`,t.querySelector("#ctxMessage").onclick=()=>{t.classList.add("hidden"),window.location.hash=`/mensajes/${i}`},t.classList.remove("hidden");const r=180;let d=o.left;d+r>window.innerWidth-8&&(d=window.innerWidth-r-8),t.style.top=`${o.bottom+window.scrollY+4}px`,t.style.left=`${d}px`})}function Ge(e,a){const t=a&&e.user_id===a.id,s=e.zone==="promotion"?"background:rgba(0,255,135,0.08)":e.zone==="relegation"?"background:rgba(255,56,96,0.08)":"";return`
    ${e.pos===5?'<tr class="div-separator div-separator--top"><td colspan="7"></td></tr>':e.pos===13?'<tr class="div-separator div-separator--bottom"><td colspan="7"></td></tr>':""}
    <tr class="${t?"ranking-table__row--me":""}" style="${s}">
      <td class="ranking-table__pos" data-pos="${e.pos}">${e.pos}</td>
      <td>${t||e.is_bot?ne(e.username):`<button class="user-link" data-user-id="${e.user_id}">${ne(e.username)}</button>`}</td>
      <td class="ranking-table__stat">${e.pj}</td>
      <td class="ranking-table__stat">${e.g}</td>
      <td class="ranking-table__stat">${e.e}</td>
      <td class="ranking-table__stat">${e.p}</td>
      <td class="ranking-table__pts">${L(e.pts_division)}</td>
    </tr>
  `}async function Be(e,{params:a={}}={}){const t=a.userId?parseInt(a.userId):null;t?await Et(e,t):await yt(e)}async function yt(e){e.innerHTML='<div class="loading"><div class="loading__spinner"></div></div>';try{const{conversations:a}=await c.messages.list();e.innerHTML=`
      <div class="container">
        <h1 class="page-title">💬 Mensajes</h1>
        ${a.length===0?'<p class="empty">No tienes conversaciones aún. Pulsa el nombre de un jugador en la clasificación para enviar un mensaje.</p>':`<div class="mensajes-list">${a.map($t).join("")}</div>`}
      </div>
    `,e.querySelectorAll(".mensajes-item").forEach(t=>{t.addEventListener("click",()=>{window.location.hash=`/mensajes/${t.dataset.userId}`})})}catch(a){e.innerHTML=`<div class="container"><p class="form__error">Error: ${a.message}</p></div>`}}function $t(e){return`
    <div class="mensajes-item" data-user-id="${e.user_id}" style="cursor:pointer">
      <div class="mensajes-item__avatar">${K(e.username[0].toUpperCase())}</div>
      <div class="mensajes-item__info">
        <div class="mensajes-item__header">
          <strong class="mensajes-item__name">${K(e.username)}</strong>
          ${e.unread_count>0?`<span class="mensajes-item__badge">${e.unread_count}</span>`:""}
        </div>
        <p class="mensajes-item__preview">${K(e.last_message)}</p>
      </div>
    </div>
  `}async function Et(e,a){var s;e.innerHTML='<div class="loading"><div class="loading__spinner"></div></div>';const t=E.getUser();try{const{messages:n,partner:i}=await c.messages.get(a);document.dispatchEvent(new CustomEvent("messages:read")),e.innerHTML=`
      <div class="container">
        <div class="chat-header">
          <a href="#/mensajes" class="btn btn--ghost btn--sm">← Volver</a>
          <h2 class="chat-header__name">${K((i==null?void 0:i.username)||"Usuario")}</h2>
        </div>

        <div class="chat-messages" id="chatMessages">
          ${n.length===0?'<p class="empty" style="text-align:center">Empieza la conversación.</p>':n.map(r=>Te(r,t)).join("")}
        </div>

        <form class="chat-input" id="chatForm">
          <textarea class="form__textarea chat-input__textarea" id="chatMsg"
            placeholder="Escribe un mensaje…" maxlength="1000" rows="2" required></textarea>
          <button class="btn btn--primary chat-input__btn" type="submit">Enviar</button>
        </form>
      </div>
    `;const o=document.getElementById("chatMessages");o&&(o.scrollTop=o.scrollHeight),(s=document.getElementById("chatForm"))==null||s.addEventListener("submit",async r=>{r.preventDefault();const d=document.getElementById("chatMsg"),l=d.value.trim();if(!l)return;const h=r.target.querySelector('button[type="submit"]');h.disabled=!0;try{const{message:_}=await c.messages.send(a,l);d.value="";const p=document.getElementById("chatMessages"),f=p==null?void 0:p.querySelector(".empty");f&&f.remove(),p==null||p.insertAdjacentHTML("beforeend",Te(_,t)),p&&(p.scrollTop=p.scrollHeight)}catch(_){v(_.message,"error")}finally{h.disabled=!1}})}catch(n){e.innerHTML=`<div class="container"><p class="form__error">Error: ${n.message}</p></div>`}}function Te(e,a){return`
    <div class="chat-message ${a&&e.sender_id===a.id?"chat-message--sent":"chat-message--received"}">
      <div class="chat-message__bubble">${K(e.message)}</div>
      <div class="chat-message__time">${M(e.created_at)}</div>
    </div>
  `}function K(e){return String(e||"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;")}const Pe=e=>()=>{window.location.hash=e},wt={"/":ta,"/login":la,"/register":ca,"/quiniela":Pe("/jornada"),"/resultados":Pe("/tabla-v2"),"/ranking":ma,"/tablon":pe,"/ligas":va,"/ligas/:id":ga,"/perfil":ha,"/campeon":ja,"/admin":La,"/forgot-password":Ua,"/reset-password":Fa,"/unirse":Ja,"/jugador/:id":Va,"/jornada":Wa,"/duelo":rt,"/tabla-v2":pt,"/mensajes":Be,"/mensajes/:userId":Be};function jt(e){for(const[a,t]of Object.entries(wt)){const s=[],n=new RegExp("^"+a.replace(/:([^/]+)/g,(o,r)=>(s.push(r),"([^/]+)"))+"$"),i=e.match(n);if(i){const o={};return s.forEach((r,d)=>{o[r]=i[d+1]}),{handler:t,params:o}}}return null}const Me=()=>document.getElementById("mainContent"),S={init(){window.addEventListener("hashchange",()=>this.resolve()),this.resolve()},navigate(e){window.location.hash=e},resolve(){const e=window.location.hash.slice(1)||"/",[a,t]=e.split("?"),s=Object.fromEntries(new URLSearchParams(t||"")),n=jt(a);if(!n){Me().innerHTML='<div class="error-page"><h2>Página no encontrada</h2><a href="#/">Volver al inicio</a></div>';return}const{handler:i,params:o}=n;if(["/perfil","/admin","/jornada","/duelo","/tabla-v2","/mensajes"].includes(a)&&!E.isLoggedIn()){this.navigate("/login");return}if(a==="/admin"&&!E.isAdmin()){this.navigate("/");return}const d=Me();d.innerHTML='<div class="loading"><div class="loading__spinner"></div></div>',i(d,{params:o,query:s})}};let W=[],z=null,F=null,ie=!1;async function Lt(){document.documentElement.dataset.build="2026-09-22T09",await E.init(),S.init(),It(),kt(),Bt()}function We(){return localStorage.getItem("pwa_installed")==="true"||window.matchMedia("(display-mode: standalone)").matches||window.navigator.standalone===!0}function kt(){window.addEventListener("beforeinstallprompt",e=>{e.preventDefault(),!We()&&(z=e,St())}),window.addEventListener("appinstalled",()=>{var e;localStorage.setItem("pwa_installed","true"),z=null,(e=document.getElementById("installBanner"))==null||e.remove()})}function St(){if(We()||sessionStorage.getItem("installBannerDismissed"))return;const e=document.createElement("div");e.id="installBanner",e.className="install-banner",e.innerHTML=`
    <span class="install-banner__text">📱 Instala PickGoal en tu móvil</span>
    <div class="install-banner__actions">
      <button class="install-banner__btn install-banner__btn--primary" id="installBtn">Instalar</button>
      <button class="install-banner__btn install-banner__btn--ghost" id="installDismissBtn">Ahora no</button>
    </div>
  `,document.body.appendChild(e),document.getElementById("installBtn").addEventListener("click",async()=>{z&&(z.prompt(),await z.userChoice,z=null,e.remove())}),document.getElementById("installDismissBtn").addEventListener("click",()=>{sessionStorage.setItem("installBannerDismissed","1"),e.remove()})}function N(){var e,a;(e=document.getElementById("userDropdown"))==null||e.classList.add("hidden"),(a=document.getElementById("userBtn"))==null||a.classList.remove("navbar__dropdown-btn--open")}async function Y(){const e=document.getElementById("perfilBadge"),a=document.getElementById("navMensajesDot");if(!E.getUser()){e==null||e.classList.add("hidden"),a==null||a.classList.add("hidden");return}try{const s=localStorage.getItem("tablon_general_last_read")||new Date(0).toISOString(),[n,i]=await Promise.all([c.board.mentions(s).catch(d=>(console.warn("[perfilBadge] mentions error:",d),{count:0})),c.messages.unread().catch(d=>(console.warn("[perfilBadge] pm unread error:",d),{count:0}))]),o=n.count||0,r=i.count||0;console.log("[perfilBadge] mentions:",o,"pm:",r),e==null||e.classList.toggle("hidden",o+r===0),a==null||a.classList.toggle("hidden",r===0)}catch(s){console.warn("[perfilBadge] error:",s),e==null||e.classList.add("hidden"),a==null||a.classList.add("hidden")}}async function oe(){const e=document.getElementById("tablonBadge");if(!e)return;if(!E.getUser()){e.classList.add("hidden");return}const t=localStorage.getItem("tablon_general_last_read")||new Date(0).toISOString();try{const{count:s}=await c.board.unread(null,t);s>0?(e.textContent=s>99?"99+":String(s),e.classList.remove("hidden")):e.classList.add("hidden")}catch{e.classList.add("hidden")}}function It(){var e,a,t,s;document.addEventListener("auth:change",De),window.addEventListener("hashchange",()=>{N(),Xe(),setTimeout(oe,200),setTimeout(Y,200)}),document.addEventListener("tablon:read",()=>{Y(),oe()}),document.addEventListener("messages:read",()=>{Y()}),document.addEventListener("click",N),(e=document.getElementById("userBtn"))==null||e.addEventListener("click",n=>{var r;n.stopPropagation();const i=document.getElementById("userDropdown"),o=i==null?void 0:i.classList.contains("hidden");N(),o&&(i==null||i.classList.remove("hidden"),(r=document.getElementById("userBtn"))==null||r.classList.add("navbar__dropdown-btn--open"))}),(a=document.getElementById("userDropdown"))==null||a.addEventListener("click",n=>{n.stopPropagation(),n.target.closest("#navProfileLink")&&N()}),(t=document.getElementById("navMensajesLink"))==null||t.addEventListener("click",async n=>{n.preventDefault(),n.stopPropagation(),N(),ie?me():await Tt()}),document.addEventListener("click",n=>{ie&&!n.target.closest("#notifPanel")&&!n.target.closest("#navMensajesLink")&&me()}),(s=document.getElementById("navLogoutBtn"))==null||s.addEventListener("click",()=>{W=[],localStorage.removeItem("activeLeagueId"),N(),E.logout(),S.navigate("/")}),De()}async function De(){var i;const e=document.getElementById("navAuthLinks"),a=document.getElementById("userBtn"),t=document.getElementById("navUsername"),s=document.getElementById("bottomNav"),n=E.getUser();if(N(),n){e==null||e.classList.add("hidden"),t&&(t.textContent=n.username),a.style.visibility="visible",console.log("[navbar] userBtn visibility:",a.style.visibility,"computed:",getComputedStyle(a).visibility,"offsetWidth:",a.offsetWidth,"right rect:",a.getBoundingClientRect().right),s==null||s.classList.remove("hidden"),document.body.classList.add("has-bottom-nav"),(i=document.getElementById("navAdminLink"))==null||i.classList.toggle("hidden",!n.is_admin);try{const{leagues:o}=n.is_admin?await c.leagues.adminAll():await c.leagues.my();W=o}catch{W=[]}xt(W),oe(),Y(),F&&clearInterval(F),F=setInterval(()=>{oe(),Y()},5*60*1e3)}else e==null||e.classList.remove("hidden"),a.style.visibility="hidden",s==null||s.classList.add("hidden"),document.body.classList.remove("has-bottom-nav"),W=[],localStorage.removeItem("activeLeagueId"),F&&(clearInterval(F),F=null);Xe()}function xt(e){const a=localStorage.getItem("activeLeagueId");a&&e.some(s=>String(s.id)===String(a))||(e.length>0?localStorage.setItem("activeLeagueId",String(e[0].id)):localStorage.removeItem("activeLeagueId"))}function Xe(){const e=window.location.hash.slice(1).split("?")[0]||"/";document.querySelectorAll(".bottom-nav__item").forEach(a=>{const t=a.dataset.route,s=t==="/"?e==="/":e===t||e.startsWith(t+"/");a.classList.toggle("bottom-nav__item--active",s)})}function Ct(e){const a="=".repeat((4-e.length%4)%4),t=(e+a).replace(/-/g,"+").replace(/_/g,"/"),s=atob(t);return Uint8Array.from([...s].map(n=>n.charCodeAt(0)))}async function Bt(){if(!(!("serviceWorker"in navigator)||!("PushManager"in window)))try{const e=await navigator.serviceWorker.register("/sw.js");document.addEventListener("auth:change",async a=>{a.detail&&await qe(e)}),E.getUser()&&await qe(e)}catch{}}async function qe(e){try{if(await Notification.requestPermission()!=="granted")return;const t=await e.pushManager.getSubscription();if(t){await c.notifications.subscribe(t.toJSON());return}const{public_key:s}=await c.notifications.vapidPublicKey();if(!s)return;const n=await e.pushManager.subscribe({userVisibleOnly:!0,applicationServerKey:Ct(s)});await c.notifications.subscribe(n.toJSON())}catch{}}function me(){var e;(e=document.getElementById("notifPanel"))==null||e.classList.add("hidden"),ie=!1}async function Tt(){const e=document.getElementById("notifPanel"),a=document.getElementById("notifPanelBody");if(!(!e||!a)){ie=!0,e.classList.remove("hidden"),a.innerHTML='<div class="loading"><div class="loading__spinner"></div></div>';try{const t=new Date(Date.now()-2592e6).toISOString(),[s,n,i]=await Promise.all([c.messages.list().catch(()=>({conversations:[]})),c.board.messages(1,null).catch(()=>({messages:[]})),c.board.mentions(t).catch(()=>({messages:[]}))]),o=(s.conversations||[]).slice(0,5),r=(n.messages||[]).slice(0,5),d=new Set((i.messages||[]).map(l=>l.id));a.innerHTML=Pt(o,r,d),a.querySelectorAll(".notif-item[data-nav]").forEach(l=>{l.addEventListener("click",()=>{me(),window.location.hash=l.dataset.nav})})}catch{a.innerHTML='<p class="notif-panel__empty">Error cargando notificaciones</p>'}}}function Pt(e,a,t){const s=e.length===0?'<p class="notif-panel__empty">Aún no tienes mensajes</p>':e.map(i=>`
        <div class="notif-item" data-nav="/mensajes/${i.user_id}">
          <div class="notif-item__avatar">${J(i.username[0].toUpperCase())}</div>
          <div class="notif-item__content">
            <div class="notif-item__header">
              <strong class="notif-item__name">${J(i.username)}</strong>
              ${i.unread_count>0?`<span class="notif-item__badge">${i.unread_count}</span>`:""}
            </div>
            <p class="notif-item__text">${J((i.last_message||"").slice(0,70))}${(i.last_message||"").length>70?"…":""}</p>
          </div>
        </div>
      `).join("")+'<a class="notif-panel__link" href="#/mensajes">Ver todos los mensajes →</a>',n=a.length===0?'<p class="notif-panel__empty">Aún no hay mensajes en el tablón</p>':a.map(i=>{const o=t.has(i.id);return`
          <div class="notif-item${o?" notif-item--notable":""}" data-nav="/tabla-v2?tab=tablon">
            <div class="notif-item__avatar">${J(i.username[0].toUpperCase())}</div>
            <div class="notif-item__content">
              <div class="notif-item__header">
                <strong class="notif-item__name">${J(i.username)}</strong>
                ${o?'<span class="notif-item__mention">@tú / admin</span>':""}
                <span class="notif-item__time">${M(i.created_at)}</span>
              </div>
              <p class="notif-item__text">${J((i.message||"").slice(0,80))}${(i.message||"").length>80?"…":""}</p>
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
  `}function J(e){return String(e||"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;")}Lt();
