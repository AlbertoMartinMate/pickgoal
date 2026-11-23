(function(){const a=document.createElement("link").relList;if(a&&a.supports&&a.supports("modulepreload"))return;for(const n of document.querySelectorAll('link[rel="modulepreload"]'))s(n);new MutationObserver(n=>{for(const i of n)if(i.type==="childList")for(const o of i.addedNodes)o.tagName==="LINK"&&o.rel==="modulepreload"&&s(o)}).observe(document,{childList:!0,subtree:!0});function t(n){const i={};return n.integrity&&(i.integrity=n.integrity),n.referrerPolicy&&(i.referrerPolicy=n.referrerPolicy),n.crossOrigin==="use-credentials"?i.credentials="include":n.crossOrigin==="anonymous"?i.credentials="omit":i.credentials="same-origin",i}function s(n){if(n.ep)return;n.ep=!0;const i=t(n);fetch(n.href,i)}})();const ta="https://pickgoal-backend.onrender.com/api";function sa(){return localStorage.getItem("token")}async function v(e,a={}){const t={"Content-Type":"application/json",...a.headers},s=sa();s&&(t.Authorization=`Bearer ${s}`);const n=await fetch(`${ta}${e}`,{cache:"no-store",...a,headers:t}),i=await n.json().catch(()=>({}));if(!n.ok)throw{status:n.status,message:i.error||"Error desconocido"};return i}const m={get:e=>v(e),post:(e,a)=>v(e,{method:"POST",body:JSON.stringify(a)}),patch:(e,a)=>v(e,{method:"PATCH",body:JSON.stringify(a)}),delete:e=>v(e,{method:"DELETE"}),auth:{register:e=>v("/auth/register",{method:"POST",body:JSON.stringify(e)}),login:e=>v("/auth/login",{method:"POST",body:JSON.stringify(e)}),me:()=>v("/auth/me"),forgotPassword:e=>v("/auth/forgot-password",{method:"POST",body:JSON.stringify({email:e})}),resetPassword:(e,a)=>v("/auth/reset-password",{method:"POST",body:JSON.stringify({token:e,password:a})}),ranking:e=>v(`/auth/ranking${e?`?league_id=${e}`:""}`),deleteAccount:()=>v("/auth/account",{method:"DELETE"}),users:()=>v("/auth/users"),usersForMentions:()=>v("/auth/users/for-mentions"),toggleAdmin:e=>v(`/auth/users/${e}/toggle-admin`,{method:"PATCH"}),toggleMute:e=>v(`/auth/users/${e}/toggle-mute`,{method:"PATCH"}),updateEmail:e=>v("/auth/me/email",{method:"PATCH",body:JSON.stringify({email:e})})},matches:{grouped:()=>v("/matches/grouped"),list:(e="")=>v(`/matches/${e}`),get:e=>v(`/matches/${e}`),today:()=>v("/matches/today"),setResult:(e,a,t,s=null)=>v(`/matches/${e}/result`,{method:"PATCH",body:JSON.stringify({home_score:a,away_score:t,...s?{result_90:s}:{}})}),sync:()=>v("/matches/sync",{method:"POST"}),recalculate:()=>v("/matches/recalculate",{method:"POST"})},predictions:{mine:e=>v(`/predictions/${e?`?league_id=${e}`:""}`),forMatch:(e,a)=>v(`/predictions/match/${e}${a?`?league_id=${a}`:""}`),save:e=>v("/predictions/",{method:"POST",body:JSON.stringify(e)}),forUser:(e,a)=>v(`/predictions/user/${e}${a?`?league_id=${a}`:""}`),getChampion:e=>v(`/predictions/champion${e?`?league_id=${e}`:""}`),saveChampion:(e,a)=>v("/predictions/champion",{method:"POST",body:JSON.stringify({team_name:e,league_id:a??null})}),awardChampion:e=>v("/predictions/champion/award",{method:"POST",body:JSON.stringify({team_name:e})})},leagues:{all:()=>v("/leagues/all"),public:()=>v("/leagues/public"),my:()=>v("/leagues/my"),create:e=>v("/leagues/",{method:"POST",body:JSON.stringify(e)}),join:e=>v("/leagues/join",{method:"POST",body:JSON.stringify(e)}),joinByCode:e=>v(`/leagues/join/${encodeURIComponent(e)}`),adminAll:()=>v("/leagues/admin"),get:e=>v(`/leagues/${e}`),update:(e,a)=>v(`/leagues/${e}`,{method:"PUT",body:JSON.stringify(a)}),leave:e=>v(`/leagues/${e}/leave`,{method:"DELETE"}),members:e=>v(`/leagues/${e}/members`),matchPredictions:(e,a)=>v(`/leagues/${e}/predictions/${a}`)},home:{summary:()=>v("/home/summary")},board:{messages:(e=1,a=null)=>v(`/board/?page=${e}${a?`&league_id=${a}`:""}`),unread:(e,a)=>v(`/board/unread?${e?`league_id=${e}&`:""}since=${encodeURIComponent(a)}`),post:(e,a=null)=>v("/board/",{method:"POST",body:JSON.stringify({message:e,league_id:a})}),pin:e=>v(`/board/${e}/pin`,{method:"POST"}),reply:(e,a)=>v(`/board/${e}/reply`,{method:"POST",body:JSON.stringify({message:a})}),delete:e=>v(`/board/${e}`,{method:"DELETE"}),mentions:e=>v(`/board/mentions?since=${encodeURIComponent(e)}`)},notifications:{vapidPublicKey:()=>v("/notifications/vapid-public-key"),subscribe:e=>v("/notifications/subscribe",{method:"POST",body:JSON.stringify(e)}),send:e=>v("/notifications/send",{method:"POST",body:JSON.stringify(e)})},adminV2:{partidos:(e,a,t)=>v(`/v2/admin/partidos-disponibles?date_from=${encodeURIComponent(e)}&date_to=${encodeURIComponent(a)}${t&&t.length?`&competitions=${encodeURIComponent(t.join(","))}`:""}`),jornadas:()=>v("/v2/admin/jornadas"),createJornada:e=>v("/v2/admin/jornada",{method:"POST",body:JSON.stringify(e)}),updateJornada:(e,a)=>v(`/v2/admin/jornada/${e}`,{method:"PUT",body:JSON.stringify(a)}),deleteJornada:e=>v(`/v2/admin/jornada/${e}`,{method:"DELETE"}),publishJornada:e=>v(`/v2/admin/jornada/${e}/publish`,{method:"POST"}),closeJornada:e=>v(`/v2/admin/jornada/${e}/close`,{method:"POST"}),jornadaMatches:e=>v(`/v2/admin/jornada/${e}/matches`),setResultado:(e,a)=>v(`/v2/admin/jornada-match/${e}/resultado`,{method:"POST",body:JSON.stringify(a)}),cancelMatch:e=>v(`/v2/admin/jornada-match/${e}/cancel`,{method:"POST"}),addManualMatch:(e,a)=>v(`/v2/admin/jornada/${e}/match/manual`,{method:"POST",body:JSON.stringify(a)}),deleteManualMatch:e=>v(`/v2/admin/jornada-match/${e}`,{method:"DELETE"}),generateBots:()=>v("/v2/admin/bots/generate",{method:"POST"}),weeklyChecklist:()=>v("/v2/admin/weekly-checklist")},jornada:{info:()=>v("/v2/jornada/info"),current:()=>v("/v2/jornada/current"),list:()=>v("/v2/jornada/list"),predict:e=>v("/v2/jornada/predict",{method:"POST",body:JSON.stringify(e)}),history:()=>v("/v2/jornada/history"),myStats:()=>v("/v2/jornada/my-stats")},duelo:{list:()=>v("/v2/duelo/list"),current:e=>v(`/v2/duelo/current${e?`?jornada_id=${e}`:""}`),detail:e=>v(`/v2/duelo/current/detail${e?`?jornada_id=${e}`:""}`)},messages:{unread:()=>v("/messages/unread"),list:()=>v("/messages/"),get:e=>v(`/messages/${e}`),send:(e,a)=>v(`/messages/${e}`,{method:"POST",body:JSON.stringify({message:a})}),markAllRead:()=>v("/messages/mark-all-read",{method:"PATCH"})},clasificacion:{division:e=>v(`/v2/clasificacion/division${e?`?league_id=${e}`:""}`),general:()=>v("/v2/clasificacion/general"),allDivisions:()=>v("/v2/clasificacion/all-divisions"),jornadas:()=>v("/v2/clasificacion/jornadas"),jornadaStandings:e=>v(`/v2/clasificacion/jornada/${e}`)}};let H=null;const w={async init(){if(localStorage.getItem("token"))try{const{user:a}=await m.auth.me();H=a}catch{localStorage.removeItem("token")}},setUser(e,a){H=e,localStorage.setItem("token",a),document.dispatchEvent(new CustomEvent("auth:change",{detail:e}))},logout(){H=null,localStorage.removeItem("token"),document.dispatchEvent(new CustomEvent("auth:change",{detail:null}))},getUser(){return H},isLoggedIn(){return!!H},isAdmin(){return(H==null?void 0:H.is_admin)===!0}};let le=null;function g(e,a="success"){let t=document.getElementById("toast");t||(t=document.createElement("div"),t.id="toast",document.body.appendChild(t)),t.textContent=e,t.className=`toast toast--${a} toast--visible`,le&&clearTimeout(le),le=setTimeout(()=>{t.classList.remove("toast--visible")},3e3)}function na(){return`
    <div class="container">
      <div class="league-gate">
        <div class="league-gate__icon">⚽</div>
        <h2 class="league-gate__title">¡Inicia tu Liga!</h2>
        <p class="league-gate__text">Únete a una liga para empezar a predecir</p>
        <a href="#/ligas" class="btn btn--primary">Ver ligas disponibles</a>
      </div>
    </div>
  `}function ee(){return`
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
  `}function ae(e){const a=e.querySelector("#pointsModal"),t=e.querySelector("#btnPointsInfo"),s=e.querySelector("#pointsClose"),n=e.querySelector("#pointsOverlay");function i(){a.classList.add("points-modal--open"),document.body.style.overflow="hidden"}function o(){a.classList.remove("points-modal--open"),document.body.style.overflow=""}return t==null||t.addEventListener("click",i),s==null||s.addEventListener("click",o),n==null||n.addEventListener("click",o),document.addEventListener("keydown",r=>{r.key==="Escape"&&o()},{once:!1}),i}function L(e){const a=parseFloat(e);return isNaN(a)||e==null?"—":parseFloat(a.toFixed(2)).toString()}function M(e){return e?new Date(e).toLocaleString("es-ES",{day:"2-digit",month:"2-digit",year:"numeric",hour:"2-digit",minute:"2-digit"}):"—"}const ye='<span class="team-logo team-logo--empty" aria-hidden="true"></span>';function N(e,a=""){const t=a?` team-logo--${a}`:"";return e?`<img class="team-logo${t}" src="${e}" alt="" loading="lazy" onerror="this.outerHTML='${ye.replace("team-logo ",`team-logo${t} `).replace(/"/g,"&quot;")}'" />`:ye.replace("team-logo ",`team-logo${t} `)}const ia="/assets/icon-512-v2-CAowBaBi.png";async function oa(e){if(!w.getUser()){ra(e);return}e.innerHTML='<div class="loading"><div class="loading__spinner"></div></div>';try{const{leagues_summary:t,division_summary:s,upcoming_matches:n}=await m.home.summary();if(s){e.innerHTML=`
        <div class="home-dashboard container">
          <div class="home-dashboard__topbar">
            <button class="btn btn--ghost btn--sm" id="btnPointsInfo">📊 Sistema de puntos</button>
          </div>
          ${la(s)}
          ${Ne()}
          ${$e(n)}
        </div>
        ${ee()}
      `,ae(e);return}if(!t||t.length===0){da(e);return}const i=(()=>{const r=localStorage.getItem("activeLeagueId");return r?parseInt(r):null})(),o=[...t].sort((r,d)=>r.league_id===i?-1:d.league_id===i?1:0);e.innerHTML=`
      <div class="home-dashboard container">
        <div class="home-dashboard__topbar">
          <button class="btn btn--ghost btn--sm" id="btnPointsInfo">📊 Sistema de puntos</button>
        </div>

        <h3 class="home-dashboard__section-title">Mis ligas</h3>
        <div class="home-dashboard__leagues">
          ${o.map(r=>ma(r)).join("")}
        </div>

        <div class="home-dashboard__create">
          <a href="#/ligas" class="btn btn--ghost btn--sm">+ Crear liga privada</a>
        </div>

        ${$e(n)}
      </div>
      ${ee()}
    `,ae(e),e.querySelectorAll(".league-card[data-league-id]").forEach(r=>{r.style.cursor="pointer",r.addEventListener("click",d=>{d.target.closest("[data-go-ranking]")||d.target.closest("a")||(localStorage.setItem("activeLeagueId",r.dataset.leagueId),I.navigate(`/ligas/${r.dataset.leagueId}`))})}),e.querySelectorAll("[data-go-ranking]").forEach(r=>{r.addEventListener("click",d=>{d.stopPropagation(),localStorage.setItem("activeLeagueId",r.dataset.goRanking),I.navigate("/ranking")})})}catch(t){e.innerHTML=`<div class="container"><p class="form__error">Error cargando el inicio: ${t.message}</p></div>`}}function ra(e){e.innerHTML=`
    <section class="hero">
      <div class="hero__content">
        <img src="${ia}" alt="PickGoal" class="hero__logo-img" />
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
      ${Ne()}
    </div>
  `}function da(e){e.innerHTML=`
    <div class="home-dashboard container">
      ${ua()}
    </div>
  `}function la(e){const a={promotion:"⬆️ Zona ascenso",relegation:"⬇️ Zona descenso",mid:""},t=a[e.zone]?`<span class="div-card__zone div-card__zone--${e.zone}">${a[e.zone]}</span>`:"";return`
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
  `}function ca(e){const a=new Date,t=new Date(e),s=Math.ceil((t-a)/(1e3*60*60*24));return Math.max(0,s)}function ua(e=null,a=!1){let t,s;if(a&&(e!=null&&e.jornada_number))s="Temporada 26/27 · En curso",t=`
      <div class="pg-league-card__jornada">
        <span class="pg-league-card__jornada-num">J${e.jornada_number}</span>
        <span class="pg-league-card__jornada-label">jornada actual</span>
      </div>`;else if(a)s="Temporada 26/27 · En curso",t='<div class="pg-league-card__countdown pg-league-card__countdown--soon">Temporada en curso</div>';else{const n=ca("2026-08-15");s="Temporada 26/27 · Próximamente",t=n>0?`<div class="pg-league-card__countdown">
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
  `}function ma(e){const a=e.next_to_predict?`<div class="league-card__next">
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
  `}function $e(e){return e.length?`
    <section class="upcoming-matches">
      <h2 class="upcoming-matches__title">Próximos partidos</h2>
      <div class="upcoming-matches__list">
        ${e.map(({match:a,has_prediction:t})=>`
          <div class="upcoming-match">
            <div class="upcoming-match__teams">
              <span>${N(a.home_logo)}${a.home_team}</span>
              <span class="upcoming-match__vs">vs</span>
              <span>${N(a.away_logo)}${a.away_team}</span>
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
  `:""}function Ne(){return`
    <div class="prize-banner">
      <span class="prize-banner__icon">🏆</span>
      <div>
        <strong>Premio temporada 26/27</strong>
        <p>Camiseta de tu equipo favorito para el campeón de la clasificación general</p>
      </div>
    </div>
  `}const Ee="pickgoal_welcome_shown";function Oe(e="/jornada"){if(localStorage.getItem(Ee))return;localStorage.setItem(Ee,"1");const a=document.createElement("div");a.innerHTML=`
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
  `;const t=a.firstElementChild;document.body.appendChild(t),document.body.style.overflow="hidden",requestAnimationFrame(()=>t.classList.add("welcome-modal--open"));function s(n){t.classList.remove("welcome-modal--open"),document.body.style.overflow="",t.addEventListener("transitionend",()=>t.remove(),{once:!0}),n&&(window.location.hash=n)}document.getElementById("welcomeOverlay").addEventListener("click",()=>s()),document.getElementById("welcomeCta").addEventListener("click",()=>s(e)),document.addEventListener("keydown",function n(i){i.key==="Escape"&&(s(),document.removeEventListener("keydown",n))})}function pa(e){e.innerHTML=`
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
  `,document.getElementById("loginForm").addEventListener("submit",async a=>{a.preventDefault();const t=document.getElementById("loginBtn"),s=document.getElementById("loginError"),n=document.getElementById("identifier").value.trim(),i=document.getElementById("password").value;t.disabled=!0,t.textContent="Entrando…",s.classList.add("hidden");try{const{token:o,user:r}=await m.auth.login({identifier:n,password:i});w.setUser(r,o),g(`¡Bienvenido, ${r.username}!`),I.navigate("/"),Oe("/")}catch(o){s.textContent=o.message||"Error al iniciar sesión",s.classList.remove("hidden")}finally{t.disabled=!1,t.textContent="Entrar"}})}function _a(e){e.innerHTML=`
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
  `,document.getElementById("registerForm").addEventListener("submit",async a=>{a.preventDefault();const t=document.getElementById("registerBtn"),s=document.getElementById("registerError");t.disabled=!0,t.textContent="Creando cuenta…",s.classList.add("hidden");const n={username:document.getElementById("username").value.trim(),email:document.getElementById("email").value.trim(),country:document.getElementById("country").value.trim(),password:document.getElementById("password").value};try{const{token:i,user:o}=await m.auth.register(n);w.setUser(o,i),g("¡Cuenta creada! Bienvenido a PickGoal");const r=sessionStorage.getItem("pendingInviteCode");if(r){sessionStorage.removeItem("pendingInviteCode");try{const{league:d}=await m.leagues.joinByCode(r);g(`¡Te has unido a "${d.name}"!`),I.navigate(`/ligas/${d.id}`)}catch{I.navigate("/ligas")}}else I.navigate("/"),Oe("/")}catch(i){s.textContent=i.message||"Error al registrarse",s.classList.remove("hidden")}finally{t.disabled=!1,t.textContent="Crear cuenta"}})}function va(){const e=localStorage.getItem("activeLeagueId");return e?parseInt(e):null}async function ga(e){var a,t;e.innerHTML='<div class="loading"><div class="loading__spinner"></div></div>';try{if(w.isLoggedIn()){const{leagues:b}=await m.leagues.my();if(b.length===0){e.innerHTML=na();return}}const s=va(),[{ranking:n},i]=await Promise.all([m.auth.ranking(s),w.isLoggedIn()?m.leagues.my():Promise.resolve({leagues:[]})]),o=w.getUser(),r=i.leagues.find(b=>b.id===s),d=document.getElementById("tablonBadge"),l=d&&!d.classList.contains("hidden"),f=l?d.textContent:"",p=((a=n[0])==null?void 0:a.matches_played)??0;e.innerHTML=`
      ${r?`<span class="page-league-name">${r.name}</span>`:""}
      <div class="container">
        <div class="ranking-header">
          <h1 class="page-title">Clasificación</h1>
          ${s?`
            <button class="ranking-tablon-btn" data-league-id="${s}">
              💬 Tablón
              <span class="ranking-tablon-btn__badge${l?"":" hidden"}">${f}</span>
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
              ${n.map(b=>{var j,h,_;const c=b.predictions_made??0,y=`${c}/${p}`,$=`${b.correct_results??0}/${c}`,E=`${b.exact_scores??0}/${c}`;return`
                  <tr class="${o&&b.id===o.id?"ranking-table__row--me":""}">
                    <td class="ranking-table__pos" data-pos="${b.position}">${b.position}</td>
                    <td>
                      <a class="ranking-table__link" href="#/jugador/${b.id}">
                        <span class="status-emoji" title="${((j=b.status)==null?void 0:j.name)||""}">${((h=b.status)==null?void 0:h.emoji)||""}</span>${b.username}
                      </a>
                    </td>
                    <td class="ranking-table__stat ranking-table__status">${((_=b.status)==null?void 0:_.name)||"—"}</td>
                    <td class="ranking-table__stat">${y}</td>
                    <td class="ranking-table__stat">${$}</td>
                    <td class="ranking-table__stat">${E}</td>
                    <td class="ranking-table__pts">${b.total_points}</td>
                  </tr>
                `}).join("")}
            </tbody>
          </table>
        </div>
      </div>
    `,(t=e.querySelector(".ranking-tablon-btn"))==null||t.addEventListener("click",()=>{I.navigate(`/tablon?liga=${s}`)})}catch(s){e.innerHTML=`<div class="container"><p class="form__error">Error: ${s.message}</p></div>`}}async function _e(e,{query:a={},forceGeneral:t=!1}={}){e.innerHTML='<div class="loading"><div class="loading__spinner"></div></div>';const s=w.getUser();let n=t?null:a.liga?parseInt(a.liga):null;if(t)localStorage.setItem("tablon_general_last_read",new Date().toISOString()),document.dispatchEvent(new CustomEvent("tablon:read"));else if(n){localStorage.setItem(`tablon_last_read_${n}`,new Date().toISOString());const _=document.getElementById("tablonBadge");_&&(_.classList.add("hidden"),_.textContent="")}let i=null,o=[],r=1,d=1;if(t&&s)try{const{users:_}=await m.auth.usersForMentions();o=_||[],console.log("[tablon] usuarios cargados:",o.length)}catch(_){console.warn("[tablon] error cargando usuarios:",_)}if(!t)try{if(!n&&s){const{leagues:_}=await m.leagues.my();_&&_.length&&(n=_[0].id,i=_[0].name)}else if(n)try{const{league:_}=await m.leagues.get(n);i=_.name}catch{}if(n&&s)try{const{members:_}=await m.leagues.members(n);o=_||[]}catch{}}catch{}async function l(){const _=await m.board.messages(r,n);return d=_.pages||1,_}try{const _=await l();f(_)}catch(_){e.innerHTML=`<div class="container"><p class="form__error">Error: ${_.message}</p></div>`}function f(_){const{pinned:u=[],messages:S=[]}=_;e.innerHTML=`
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

        ${u.length?`<section class="board-section">
               <h2 class="board-section__title">📌 Anuncios fijados</h2>
               <div class="board-pinned" id="boardPinned">
                 ${p(u)}
               </div>
             </section>`:""}

        <section class="board-section">
          ${u.length?'<h2 class="board-section__title">💬 Mensajes</h2>':""}
          <div class="board-messages" id="boardMessages">
            ${c(S)}
          </div>
          ${d>1?`<div class="pagination">
                 <button class="btn btn--ghost btn--sm" id="prevPage" ${r<=1?"disabled":""}>← Anterior</button>
                 <span>Página ${r} / ${d}</span>
                 <button class="btn btn--ghost btn--sm" id="nextPage" ${r>=d?"disabled":""}>Siguiente →</button>
               </div>`:""}
        </section>
      </div>
    `,$(),E(),k()}function p(_){return _.length?_.map(u=>`
      <div class="board-message board-message--pinned" data-id="${u.id}">
        <div class="board-message__header">
          <span class="board-message__pin-badge">📌</span>
          <strong class="board-message__author">${q(u.username)}</strong>
          <span class="board-message__date">${M(u.created_at)}</span>
          ${s!=null&&s.is_admin&&!u.is_deleted?`<button class="btn btn--ghost btn--xs unpin-msg" data-id="${u.id}" title="Desfijar">📌✕</button>`:""}
          ${!u.is_deleted&&s&&(s.id===u.user_id||s.is_admin)?`<button class="btn btn--danger btn--xs delete-msg" data-id="${u.id}">✕</button>`:""}
        </div>
        <p class="board-message__text">${y(u.message)}</p>

        ${u.replies&&u.replies.length?`<div class="board-replies">
               ${u.replies.map(S=>b(S)).join("")}
             </div>`:""}

        ${s&&!u.is_deleted?`<form class="reply-form" id="replyForm-${u.id}" data-parent="${u.id}">
               <div class="reply-form__input-wrap">
                 <input class="form__input reply-input" type="text"
                   placeholder="Responder…" maxlength="500"
                   id="replyInput-${u.id}" />
                 <div class="mention-dropdown hidden" id="mentionDropdown-${u.id}"></div>
               </div>
               <button class="btn btn--outline btn--sm" type="submit">Enviar</button>
             </form>`:""}
      </div>
    `).join(""):""}function b(_){return`
      <div class="board-reply ${_.is_deleted?"board-reply--deleted":""}" data-id="${_.id}">
        <div class="board-reply__header">
          <strong class="board-reply__author">${q(_.username)}</strong>
          <span class="board-reply__date">${M(_.created_at)}</span>
          ${!_.is_deleted&&s&&(s.id===_.user_id||s.is_admin)?`<button class="btn btn--danger btn--xs delete-msg" data-id="${_.id}">✕</button>`:""}
        </div>
        <p class="board-reply__text">${y(_.message)}</p>
      </div>
    `}function c(_){return _.length?_.map(u=>`
      <div class="board-message ${u.is_deleted?"board-message--deleted":""}" data-id="${u.id}">
        <div class="board-message__header">
          <strong class="board-message__author">${q(u.username)}</strong>
          <span class="board-message__date">${M(u.created_at)}</span>
          ${s!=null&&s.is_admin&&!u.is_deleted?`<button class="btn btn--ghost btn--xs pin-msg" data-id="${u.id}" title="Fijar">📌</button>`:""}
          ${!u.is_deleted&&s&&(s.id===u.user_id||s.is_admin)?`<button class="btn btn--danger btn--xs delete-msg" data-id="${u.id}">✕</button>`:""}
        </div>
        <p class="board-message__text">${y(u.message)}</p>
      </div>
    `).join(""):'<p class="empty">Sin mensajes aún. ¡Sé el primero!</p>'}function y(_){const u=q(_);if(!o.length)return u.replace(/@(\w+)/g,'<span class="mention">@$1</span>');const S=o.map(C=>ba(C.username)),x=new RegExp(`@(${S.join("|")})`,"gi");return u.replace(x,'<span class="mention">@$1</span>')}function $(){const _=document.getElementById("boardForm");if(!_)return;const u=document.getElementById("boardMsg"),S=document.getElementById("charCounter"),x=document.getElementById("mentionDropdown");u.addEventListener("input",()=>{S.textContent=`${u.value.length} / 500`,h(u,x)}),_.addEventListener("submit",async C=>{C.preventDefault();const O=u.value.trim();if(O)try{await m.board.post(O,n),u.value="",S.textContent="0 / 500",x.classList.add("hidden");const D=await l();j(D),g("Mensaje publicado")}catch(D){g(D.message,"error")}})}function E(){e.querySelectorAll(".reply-form").forEach(_=>{const u=parseInt(_.dataset.parent),S=_.querySelector(".reply-input"),x=`mentionDropdown-${u}`,C=document.getElementById(x);S==null||S.addEventListener("input",()=>{h(S,C)}),_.addEventListener("submit",async O=>{O.preventDefault();const D=S.value.trim();if(D)try{await m.board.reply(u,D),S.value="",C==null||C.classList.add("hidden");const U=await l();j(U),g("Respuesta enviada")}catch(U){g(U.message,"error")}})}),e.querySelectorAll(".pin-msg").forEach(_=>{_.addEventListener("click",async()=>{try{await m.board.pin(_.dataset.id);const u=await l();j(u),g("Mensaje fijado")}catch(u){g(u.message,"error")}})}),e.querySelectorAll(".unpin-msg").forEach(_=>{_.addEventListener("click",async()=>{try{await m.board.pin(_.dataset.id);const u=await l();j(u),g("Mensaje desfijado")}catch(u){g(u.message,"error")}})})}function k(){e.querySelectorAll(".delete-msg").forEach(_=>{_.addEventListener("click",async()=>{if(confirm("¿Eliminar este mensaje?"))try{await m.board.delete(_.dataset.id);const u=await l();j(u),g("Mensaje eliminado")}catch(u){g(u.message,"error")}})})}function j(_){const{pinned:u=[],messages:S=[]}=_,x=document.getElementById("boardPinned");if(x)x.innerHTML=p(u);else if(u.length){f(_);return}const C=document.getElementById("boardMessages");C&&(C.innerHTML=c(S)),E(),k()}e.addEventListener("click",async _=>{if(_.target.id==="prevPage"&&r>1){r--;const u=await l();j(u)}else if(_.target.id==="nextPage"&&r<d){r++;const u=await l();j(u)}});function h(_,u){if(!u||!o.length){console.log("[tablon] handleMentionInput: sin dropdown o members vacío",{dropdown:!!u,membersLen:o.length});return}const S=_.value,x=_.selectionStart,C=S.slice(0,x),O=C.match(/@(\w*)$/);if(!O){u.classList.add("hidden");return}const D=O[1].toLowerCase();console.log("[tablon] mention detected, query:",D);const U=o.filter(B=>B.username.toLowerCase().startsWith(D)&&B.id!==(s==null?void 0:s.id));console.log("[tablon] matches:",U.map(B=>B.username));const he=[...w.isAdmin()&&"todos".startsWith(D)?[{username:"todos",description:"Notificar a todos los miembros"}]:[],...U.slice(0,6)];if(!he.length){u.classList.add("hidden");return}u.innerHTML=he.map(B=>B.description?`<div class="mention-item mention-item--broadcast" data-username="${q(B.username)}">
             <span class="mention-item__name">@${q(B.username)}</span>
             <span class="mention-item__desc">${q(B.description)}</span>
           </div>`:`<div class="mention-item" data-username="${q(B.username)}">${q(B.username)}</div>`).join(""),u.classList.remove("hidden"),u.querySelectorAll(".mention-item").forEach(B=>{B.addEventListener("mousedown",ea=>{ea.preventDefault();const aa=B.dataset.username,de=C.replace(/@(\w*)$/,`@${aa} `);if(_.value=de+S.slice(x),_.setSelectionRange(de.length,de.length),u.classList.add("hidden"),_.tagName==="TEXTAREA"){const fe=document.getElementById("charCounter");fe&&(fe.textContent=`${_.value.length} / 500`)}})})}document.addEventListener("click",_=>{!_.target.closest(".board-form__input-wrap")&&!_.target.closest(".reply-form__input-wrap")&&document.querySelectorAll(".mention-dropdown").forEach(u=>u.classList.add("hidden"))},{capture:!0})}function q(e){return String(e).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;")}function ba(e){return e.replace(/[.*+?^${}()|[\]\\]/g,"\\$&")}async function ha(e){var a,t,s,n;e.innerHTML='<div class="loading"><div class="loading__spinner"></div></div>';try{const i=w.getUser(),o=i==null?void 0:i.is_admin,[r,d]=await Promise.all([o?m.leagues.adminAll():m.leagues.all(),w.isLoggedIn()&&!o?m.leagues.my():Promise.resolve({leagues:[]})]),l=new Set(d.leagues.map(p=>p.id)),f=o?r.leagues:r.leagues.filter(p=>!l.has(p.id));e.innerHTML=`
      <div class="container">
        <h1 class="page-title">Ligas</h1>

        ${o?`
          <div class="admin-notice">Vista administrador — puedes acceder a cualquier liga sin participar en ella.</div>
        `:""}

        ${i&&!o&&d.leagues.length>0?`
          <section class="section">
            <h2>Mis ligas</h2>
            <div class="leagues-grid">${d.leagues.map(p=>je(p,!0)).join("")}</div>
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
          ${f.length?`<div class="leagues-grid">${f.map(p=>je(p,!1,l,o)).join("")}</div>`:o?'<p class="empty">No hay ligas creadas aún.</p>':d.leagues.length>0?'<p class="empty">Ya participas en todas las ligas disponibles.</p>':'<p class="empty">No hay ligas aún. ¡Crea la primera!</p>'}
        </section>
      </div>
    `,e.querySelectorAll('.league-card[data-navigate="true"]').forEach(p=>{p.addEventListener("click",()=>I.navigate(`/ligas/${p.dataset.id}`))}),e.querySelectorAll(".btn-join-league").forEach(p=>{p.addEventListener("click",async b=>{b.stopPropagation();const c=parseInt(p.dataset.id);p.disabled=!0,p.textContent="…";try{const{league:y}=await m.leagues.join({league_id:c});g(`¡Te has unido a "${y.name}"!`),I.navigate(`/ligas/${y.id}`)}catch(y){g(y.message,"error"),p.disabled=!1,p.textContent="Unirse"}})}),e.querySelectorAll(".btn-private-info").forEach(p=>{p.addEventListener("click",b=>{b.stopPropagation(),g("Esta liga es privada. Pide el enlace de invitación a cualquier miembro para unirte.","info")})}),(a=document.getElementById("btnShowCreate"))==null||a.addEventListener("click",()=>{var p,b;(p=document.getElementById("createLeaguePanel"))==null||p.classList.remove("hidden"),(b=document.getElementById("btnShowCreate"))==null||b.classList.add("hidden")}),(t=document.getElementById("btnCancelCreate"))==null||t.addEventListener("click",()=>{var p,b;(p=document.getElementById("createLeaguePanel"))==null||p.classList.add("hidden"),(b=document.getElementById("btnShowCreate"))==null||b.classList.remove("hidden")}),(s=document.getElementById("joinCodeForm"))==null||s.addEventListener("submit",async p=>{p.preventDefault();const b=document.getElementById("inviteCode").value.trim().toUpperCase();if(b)try{const{league:c}=await m.leagues.join({invite_code:b});g(`Te has unido a "${c.name}"`),I.navigate(`/ligas/${c.id}`)}catch(c){g(c.message,"error")}}),(n=document.getElementById("createLeagueForm"))==null||n.addEventListener("submit",async p=>{var j;p.preventDefault();const b=document.getElementById("createBtn");b.disabled=!0,b.textContent="Creando…";const c=document.getElementById("leagueName").value.trim(),y=document.getElementById("leagueDesc").value.trim(),$=document.getElementById("leaguePrize").value.trim(),E=document.getElementById("isPublic").checked,k=((j=document.getElementById("isOfficial"))==null?void 0:j.checked)??!1;try{const{league:h}=await m.leagues.create({name:c,description:y,prize:$,is_public:E,is_official:k});fa(h)}catch(h){g(h.message,"error"),b.disabled=!1,b.textContent="Crear liga"}})}catch(i){e.innerHTML=`<div class="container"><p class="form__error">Error: ${i.message}</p></div>`}}function je(e,a=!1,t=new Set,s=!1){const n=e.is_official?'<span class="league-badge league-badge--official">⭐ Oficial</span>':"",i=e.is_public?"🌍":"🔒",o=s?`<button class="btn btn--sm btn--outline btn-admin-view" data-id="${e.id}">Ver (admin)</button>`:a?`<button class="btn btn--sm btn--outline" onclick="event.stopPropagation(); window.location.hash='/ligas/${e.id}'">Ver liga</button>`:e.is_public?`<button class="btn btn--sm btn--primary btn-join-league" data-id="${e.id}">Unirse</button>`:'<button class="btn btn--sm btn--ghost btn-private-info">🔒 Solicitar enlace</button>';return`
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
  `}function fa(e){var s,n;const a=e.invite_link||"",t=document.getElementById("createLeaguePanel");t&&(t.innerHTML=`
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
  `,(s=document.getElementById("btnCopyLink"))==null||s.addEventListener("click",async()=>{try{await navigator.clipboard.writeText(a),g("Enlace copiado")}catch{g("No se pudo copiar","error")}}),(n=document.getElementById("btnShare"))==null||n.addEventListener("click",async()=>{try{await navigator.share({title:`Únete a ${e.name} en PickGoal`,url:a})}catch{}}))}async function ya(e,{params:a}){var s,n,i,o,r;const t=parseInt(a.id);e.innerHTML='<div class="loading"><div class="loading__spinner"></div></div>';try{const d=await m.leagues.get(t),{league:l,ranking:f,is_member:p,is_admin_view:b}=d,c=w.getUser(),y=l.is_official?'<span class="league-badge league-badge--official">⭐ Oficial</span>':"";e.innerHTML=`
      <div class="container">
        <a href="#/ligas" class="back-link">← Volver a ligas</a>

        ${b?`
          <div class="admin-notice">Vista administrador — no participas en esta liga</div>
        `:""}

        <div class="league-header">
          <h1 class="page-title">${l.name} ${y}</h1>
          ${l.description?`<p class="league-header__desc">${l.description}</p>`:""}
          <div class="league-header__meta">
            <span>${l.is_public?"🌍 Pública":"🔒 Privada"}</span>
            <span>${l.member_count} participantes</span>
            ${l.prize?`<span>🏆 ${l.prize}</span>`:""}
          </div>
        </div>

        ${(p||c!=null&&c.is_admin)&&l.invite_link?`
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
          ${p?'<button class="btn btn--danger btn--sm" id="btnLeave">Abandonar liga</button>':!(c!=null&&c.is_admin)&&c?'<button class="btn btn--primary" id="btnJoin">Unirse a esta liga</button>':""}
          ${c!=null&&c.is_admin||p&&c&&l.created_by===c.id?'<button class="btn btn--outline btn--sm" id="btnEditLeague">Editar liga</button>':""}
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
              ${f.map(h=>`
                <tr class="${c&&h.id===c.id?"ranking-table__row--me":""}">
                  <td>${h.position}</td>
                  <td>${h.username}</td>
                  <td>${h.country||"—"}</td>
                  <td class="ranking-table__pts">${h.total_points}</td>
                </tr>
              `).join("")}
            </tbody>
          </table>
        </section>

        <section class="section hidden" id="sectionTablon">
          <div id="tablonEmbed"></div>
        </section>
      </div>
    `,(s=document.getElementById("btnCopyInvite"))==null||s.addEventListener("click",async()=>{try{await navigator.clipboard.writeText(l.invite_link),g("Enlace copiado")}catch{g("No se pudo copiar","error")}}),(n=document.getElementById("btnShareInvite"))==null||n.addEventListener("click",async()=>{try{await navigator.share({title:`Únete a ${l.name} en PickGoal`,url:l.invite_link})}catch{}}),(i=document.getElementById("btnLeave"))==null||i.addEventListener("click",async()=>{if(confirm("¿Seguro que quieres abandonar esta liga?"))try{await m.leagues.leave(t),g("Has abandonado la liga"),I.navigate("/ligas")}catch(h){g(h.message,"error")}}),(o=document.getElementById("btnJoin"))==null||o.addEventListener("click",async()=>{try{await m.leagues.join({league_id:t}),g("¡Te has unido a la liga!"),I.navigate(`/ligas/${t}`)}catch(h){g(h.message,"error")}}),(r=document.getElementById("btnEditLeague"))==null||r.addEventListener("click",()=>{$a(l,t,c)});const $=document.getElementById("tabRanking"),E=document.getElementById("tabTablon"),k=document.getElementById("sectionRanking"),j=document.getElementById("sectionTablon");$&&E&&($.addEventListener("click",()=>{$.classList.add("league-tab--active"),E.classList.remove("league-tab--active"),k.classList.remove("hidden"),j.classList.add("hidden")}),E.addEventListener("click",()=>{E.classList.add("league-tab--active"),$.classList.remove("league-tab--active"),k.classList.add("hidden"),j.classList.remove("hidden");const h=document.getElementById("tablonEmbed");h&&!h.dataset.loaded&&(h.dataset.loaded="1",_e(h,{query:{liga:String(t)}}))}))}catch(d){e.innerHTML=`<div class="container"><p class="form__error">Error: ${d.message}</p><a href="#/ligas">Volver</a></div>`}}function $a(e,a,t){const s=document.getElementById("editLeagueModal");s&&s.remove();const n=document.createElement("div");n.id="editLeagueModal",n.className="edit-league-modal",n.innerHTML=`
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
  `,document.body.appendChild(n),requestAnimationFrame(()=>n.classList.add("edit-league-modal--open"));const i=()=>{n.classList.remove("edit-league-modal--open"),n.addEventListener("transitionend",()=>n.remove(),{once:!0})};n.querySelector(".edit-league-modal__overlay").addEventListener("click",i),document.getElementById("btnCancelEdit").addEventListener("click",i),document.getElementById("editLeagueForm").addEventListener("submit",async o=>{o.preventDefault();const r=document.getElementById("btnSaveEdit");r.disabled=!0,r.textContent="Guardando…";const d={name:document.getElementById("editName").value.trim(),description:document.getElementById("editDesc").value.trim(),prize:document.getElementById("editPrize").value.trim(),is_public:document.getElementById("editPublic").checked};t!=null&&t.is_admin&&(d.is_official=document.getElementById("editOfficial").checked);try{await m.leagues.update(a,d),g("Liga actualizada"),i(),I.navigate(`/ligas/${a}`)}catch(l){g(l.message,"error"),r.disabled=!1,r.textContent="Guardar cambios"}})}async function Ea(e){var t,s,n,i,o,r;e.innerHTML='<div class="loading"><div class="loading__spinner"></div></div>';const a=w.getUser();try{const[d,l,f]=await Promise.all([m.clasificacion.division(),m.auth.me(),a!=null&&a.is_admin?m.leagues.adminAll():Promise.resolve({leagues:[]})]),p=l.user,b=p.status,c=p.total_points_all_time,y=(t=d.standings)==null?void 0:t.find($=>$.user_id===p.id);e.innerHTML=`
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
          ${La(b,c)}
          <button class="btn btn--danger" id="btnLogoutPerfil">Cerrar sesión</button>
          <div class="profile-card__stats">
            <div class="stat">
              <span class="stat__value">${y?`${y.pos}º`:"—"}</span>
              <span class="stat__label">Posición div.</span>
            </div>
            <div class="stat">
              <span class="stat__value">${y?L(y.pts_division):"—"}</span>
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
          ${y?`<div class="division-info">
                 <p class="division-info__name">${d.league_name||"PickGoal División"}</p>
                 <div class="division-info__stats">
                   <div class="division-info__stat">
                     <span>${y.pos}º</span>
                     <small>de ${d.standings.length}</small>
                   </div>
                   <div class="division-info__stat">
                     <span>${L(y.pts_division)}</span>
                     <small>pts división</small>
                   </div>
                   <div class="division-info__stat">
                     <span>${L(y.pts_general)}</span>
                     <small>pts total</small>
                   </div>
                   <div class="division-info__stat">
                     <span>${y.pj}</span>
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

        ${a!=null&&a.is_admin&&f.leagues.length?`
          <section class="section">
            <h2>Ligas gestionadas</h2>
            <ul class="leagues-list">
              ${f.leagues.map($=>`
                <li>
                  <span>${$.is_official?"⭐ ":""}${$.name}</span>
                  <span class="tag">${$.is_public?"Pública":"Privada"}</span>
                  <a href="#/ligas/${$.id}" class="btn btn--sm btn--outline">Gestionar</a>
                </li>
              `).join("")}
            </ul>
          </section>
        `:""}
      </div>
    `,(s=e.querySelector("#btnLogoutPerfil"))==null||s.addEventListener("click",()=>{w.logout(),window.location.hash="/"}),(n=e.querySelector("#btnEditEmail"))==null||n.addEventListener("click",()=>{e.querySelector("#emailEditForm").classList.remove("hidden"),e.querySelector("#emailInput").focus()}),(i=e.querySelector("#btnCancelEmail"))==null||i.addEventListener("click",()=>{e.querySelector("#emailEditForm").classList.add("hidden"),e.querySelector("#emailError").classList.add("hidden")}),(o=e.querySelector("#btnSaveEmail"))==null||o.addEventListener("click",async()=>{const $=e.querySelector("#emailInput").value.trim(),E=e.querySelector("#emailError");if(E.classList.add("hidden"),!$){E.textContent="El email no puede estar vacío",E.classList.remove("hidden");return}if(!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test($)){E.textContent="Formato de email inválido",E.classList.remove("hidden");return}try{const{user:j}=await m.auth.updateEmail($);w.setUser(j,localStorage.getItem("token")),e.querySelector("#emailDisplay").textContent=j.email,e.querySelector("#emailEditForm").classList.add("hidden"),g("Email actualizado")}catch(j){E.textContent=j.message,E.classList.remove("hidden")}}),(r=e.querySelector("#btnDeleteAccount"))==null||r.addEventListener("click",()=>{Sa()}),ka(e),ja(e),wa(e)}catch(d){e.innerHTML=`<div class="container"><p class="form__error">Error: ${d.message}</p></div>`}}function A(e){return String(e||"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;")}async function ja(e){const a=e.querySelector("#conversacionesList");if(a)try{const{conversations:t}=await m.messages.list();if(!t.length){a.innerHTML='<p class="empty">Sin conversaciones aún.</p>';return}a.innerHTML=t.slice(0,5).map(s=>`
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
    `).join("")}catch{a.innerHTML='<p class="empty">Sin conversaciones aún.</p>'}}async function wa(e){const a=e.querySelector("#mencionesTablon");if(a)try{const t=localStorage.getItem("tablon_general_last_read")||new Date(0).toISOString(),{messages:s}=await m.board.mentions(t);if(!s||!s.length){a.innerHTML='<p class="empty">Sin menciones recientes.</p>';return}a.innerHTML=s.slice(0,5).map(n=>`
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
    `).join("")}catch{a.innerHTML='<p class="empty">Sin menciones recientes.</p>'}}function La(e,a){if(e.next_threshold===null)return`
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
    </div>`}async function ka(e){var t,s;const a=e.querySelector("#predStatsWrap");if(a)try{const{total_predictions:n,correct_results:i,predictions:o}=await m.jornada.myStats();if(n===0){a.innerHTML='<p class="empty">Aún no tienes predicciones en esta temporada.</p>';return}const r=Math.round(i/n*100),d=50,l=+(2*Math.PI*d).toFixed(2),f=+(r/100*l).toFixed(2),p=+(l-f).toFixed(2);a.innerHTML=`
      <div class="pred-circle-wrap" id="predCircleBtn" role="button" tabindex="0" title="Ver detalle">
        <div class="pred-circle__chart">
          <svg viewBox="0 0 120 120" aria-hidden="true">
            <circle cx="60" cy="60" r="${d}" fill="none" stroke="#1a1a1a" stroke-width="12"/>
            <circle cx="60" cy="60" r="${d}" fill="none" stroke="#39FF14" stroke-width="12"
              stroke-dasharray="${f} ${p}" stroke-linecap="round"
              transform="rotate(-90 60 60)" class="pred-circle__arc"/>
          </svg>
          <div class="pred-circle__label">
            <span class="pred-circle__pct">${r}%</span>
          </div>
        </div>
        <p class="pred-circle__sub">${n} predicciones · ${i} acertadas</p>
        <span class="btn btn--ghost btn--xs" style="margin-top:4px">Ver detalle →</span>
      </div>
    `,(t=a.querySelector("#predCircleBtn"))==null||t.addEventListener("click",()=>{we(o)}),(s=a.querySelector("#predCircleBtn"))==null||s.addEventListener("keydown",b=>{(b.key==="Enter"||b.key===" ")&&we(o)})}catch{a.innerHTML='<p class="empty">No se pudieron cargar las predicciones.</p>'}}function we(e){var i,o;let a="all";const t=document.createElement("div");t.className="pred-modal",t.innerHTML=`
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
  `,document.body.appendChild(t),document.body.style.overflow="hidden",requestAnimationFrame(()=>t.classList.add("pred-modal--open"));function s(){const r=a==="all"?e:a==="correct"?e.filter(l=>l.is_correct):e.filter(l=>l.result_known&&!l.is_correct),d=document.getElementById("predModalList");if(d){if(!r.length){d.innerHTML='<p class="empty" style="text-align:center;padding:1rem">Sin predicciones en este filtro.</p>';return}d.innerHTML=r.map(l=>{const f=l.result_known?l.is_correct?"✅":"❌":"⏳",p=l.score?`${l.score}`:"—",b=l.result_known?`+${L(l.points_earned)} pts`:"—";return`
        <div class="pred-item ${l.is_correct?"pred-item--correct":l.result_known?"pred-item--wrong":""}">
          <span class="pred-item__icon">${f}</span>
          <div class="pred-item__body">
            <p class="pred-item__teams">${A(l.home_team)} vs ${A(l.away_team)}</p>
            <div class="pred-item__row">
              <span class="pred-item__pred">Pred: <strong>${l.predicted_result}</strong></span>
              ${l.actual_result?`<span class="pred-item__actual">Real: <strong>${l.actual_result}</strong> (${p})</span>`:'<span class="pred-item__actual">Sin resultado</span>'}
              <span class="pred-item__pts ${l.is_correct?"pred-item__pts--ok":""}">${b}</span>
            </div>
          </div>
        </div>
      `}).join("")}}s(),t.querySelectorAll(".pred-filter").forEach(r=>{r.addEventListener("click",()=>{t.querySelectorAll(".pred-filter").forEach(d=>d.classList.remove("pred-filter--active")),r.classList.add("pred-filter--active"),a=r.dataset.filter,s()})});function n(){t.classList.remove("pred-modal--open"),document.body.style.overflow="",t.addEventListener("transitionend",()=>t.remove(),{once:!0})}(i=document.getElementById("predModalClose"))==null||i.addEventListener("click",n),(o=document.getElementById("predModalOverlay"))==null||o.addEventListener("click",n)}function Sa(){const e=document.createElement("div");e.className="delete-modal",e.innerHTML=`
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
  `,document.body.appendChild(e),document.body.style.overflow="hidden",requestAnimationFrame(()=>e.classList.add("delete-modal--open"));const a=e.querySelector("#deleteConfirmInput"),t=e.querySelector("#deleteConfirmBtn"),s=e.querySelector("#deleteCancelBtn"),n=e.querySelector("#deleteOverlay"),i=e.querySelector("#deleteError");function o(){e.classList.remove("delete-modal--open"),document.body.style.overflow="",e.addEventListener("transitionend",()=>e.remove(),{once:!0})}a.addEventListener("input",()=>{t.disabled=a.value.trim()!=="CERRAR"}),s.addEventListener("click",o),n.addEventListener("click",o),t.addEventListener("click",async()=>{t.disabled=!0,t.textContent="Cerrando…",i.classList.add("hidden");try{await m.auth.deleteAccount(),o(),w.logout(),g("Cuenta cerrada. Hasta pronto."),window.location.hash="/"}catch(r){i.textContent=r.message||"Error al cerrar la cuenta",i.classList.remove("hidden"),t.disabled=!1,t.textContent="Cerrar mi cuenta"}})}function Ia(){window.location.hash="/"}async function xa(e){if(!w.isAdmin()){e.innerHTML='<div class="container"><p class="form__error">Acceso denegado.</p></div>';return}e.innerHTML='<div class="loading"><div class="loading__spinner"></div></div>';try{const{users:a}=await m.auth.users();e.innerHTML=`
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
          <h2 class="admin-section__title">Cerrar fase</h2>
          <p class="admin-section__desc">Ascensos y descensos, puntos al 50%, bots nuevos en Primera y duelos regenerados. Solo se puede hacer una vez por fase y no hay vuelta atrás.</p>
          <button class="btn btn--danger" id="btnCloseFase">Cerrar fase</button>
          <span id="closeFaseResult" style="margin-left:12px;font-size:13px;"></span>
          <div id="closeFaseSummary" style="margin-top:12px;font-size:13px;"></div>
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
                ${a.map(Ba).join("")}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    `,Ca(e),Y(e),Ta(e)}catch(a){e.innerHTML=`<div class="container"><p class="form__error">Error: ${a.message}</p></div>`}}function Ca(e){var s,n,i,o,r,d;(s=document.getElementById("btnSync"))==null||s.addEventListener("click",async()=>{const l=document.getElementById("syncResult");l.textContent="Sincronizando…";try{await m.matches.sync(),l.textContent="✓ Sincronización completada",g("Sincronización completada")}catch(f){l.textContent=`Error: ${f.message}`,g(f.message,"error")}}),(n=document.getElementById("btnGenerateBots"))==null||n.addEventListener("click",async()=>{const l=document.getElementById("btnGenerateBots"),f=document.getElementById("generateBotsResult");l.disabled=!0,f.textContent="Generando…";try{const{message:p}=await m.adminV2.generateBots();f.textContent=`✓ ${p}`,g(p)}catch(p){f.textContent=`Error: ${p.message}`,g(p.message,"error")}finally{l.disabled=!1}});const a=document.getElementById("pushTarget"),t=document.getElementById("pushTargetIdGroup");a==null||a.addEventListener("change",()=>{t.classList.toggle("hidden",a.value==="all")}),(i=document.getElementById("pushForm"))==null||i.addEventListener("submit",async l=>{l.preventDefault();const f=document.getElementById("pushTitle").value.trim()||"Aviso",p=document.getElementById("pushBody").value.trim(),b=a.value,c=parseInt(document.getElementById("pushTargetId").value)||null,y=document.getElementById("pushResult"),$={title:`📣 PickGoal — ${f}`,body:p};b==="league"&&c&&($.league_id=c),b==="user"&&c&&($.user_id=c),y.textContent="Enviando…";try{const{sent:E}=await m.notifications.send($);y.textContent=`✓ Enviada a ${E} suscripción(es)`,g(`Notificación enviada a ${E} suscripción(es)`)}catch(E){y.textContent=`Error: ${E.message}`,g(E.message,"error")}}),(o=document.getElementById("btnCloseFase"))==null||o.addEventListener("click",async()=>{if(!confirm("¿Cerrar la fase actual? Se aplicarán ascensos/descensos, los puntos se reducirán al 50% y se regenerarán los duelos. Esta acción es irreversible."))return;const l=document.getElementById("btnCloseFase"),f=document.getElementById("closeFaseResult"),p=document.getElementById("closeFaseSummary");l.disabled=!0,f.textContent="Cerrando fase…",p.innerHTML="";try{const{message:b,summary:c}=await m.post("/v2/admin/close_fase");if(f.textContent=`✓ ${b||"Fase cerrada"}`,g("Fase cerrada"),c){const y=k=>(k||[]).map(j=>Ga(j.username)).join(", ")||"—",$=c.primera||{},E=c.segunda||{};p.innerHTML=`
          <p><strong>Ascienden a Primera:</strong> ${y(E.promoted_to_primera)}</p>
          <p><strong>Descienden a Segunda:</strong> ${y($.relegated)}</p>
          <p><strong>Eliminados de Segunda:</strong> ${y(E.eliminated)}</p>
          <p><strong>Bots añadidos a Primera:</strong> ${y($.bots_added)}</p>
          <p><strong>Miembros con puntos al 50%:</strong> ${c.total_members_halved??"—"}</p>
          <p><strong>Duelos regenerados:</strong> ${(c.duelos_reassigned||[]).map(k=>`J${k.jornada} (liga ${k.league_id})`).join(", ")||"—"}</p>`}}catch(b){f.textContent=`Error: ${b.message}`,g(b.message,"error"),l.disabled=!1}}),(r=document.getElementById("btnCloseSeason"))==null||r.addEventListener("click",async()=>{if(!confirm("¿Cerrar la temporada actual? Esta acción es irreversible."))return;const l=document.getElementById("btnCloseSeason"),f=document.getElementById("closeSeasonResult");l.disabled=!0,f.textContent="Cerrando…";try{const{message:p}=await m.post("/v2/admin/season/1/close");f.textContent=`✓ ${p||"Temporada cerrada"}`,g("Temporada cerrada")}catch(p){f.textContent=`Error: ${p.message}`,g(p.message,"error"),l.disabled=!1}}),(d=document.getElementById("usersTableBody"))==null||d.addEventListener("click",async l=>{const f=l.target.closest(".toggle-admin");if(f){const b=parseInt(f.dataset.id);try{const{user:c}=await m.auth.toggleAdmin(b);f.closest("tr").querySelector(".admin-badge").textContent=c.is_admin?"Sí":"No",g(`${c.username} ${c.is_admin?"ahora es admin":"ya no es admin"}`)}catch(c){g(c.message,"error")}return}const p=l.target.closest(".toggle-mute");if(p){const b=parseInt(p.dataset.id);try{const{user:c}=await m.auth.toggleMute(b),y=p.closest("tr");y.querySelector(".mute-badge").textContent=c.is_muted?"Sí":"No",p.textContent=c.is_muted?"Activar":"Silenciar",g(`${c.username} ${c.is_muted?"silenciado":"activado"}`)}catch(c){g(c.message,"error")}}})}function Ba(e){return`
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
  `}async function Ta(e){const a=document.getElementById("weeklyChecklistContent");if(a)try{const{checklist:t}=await m.adminV2.weeklyChecklist();a.innerHTML=Pa(t)}catch(t){a.innerHTML=`<p class="form__error">Error: ${t.message}</p>`}}function se(e,a,t){return`
    <div class="jv2-checklist__item ${e?"jv2-checklist__item--ok":"jv2-checklist__item--pending"}">
      <span class="jv2-checklist__icon">${e?"✅":"⏳"}</span>
      <span class="jv2-checklist__label">${a}</span>
      <span class="jv2-checklist__detail">${t}</span>
    </div>
  `}function Pa(e){return`
    <div class="jv2-checklist">
      ${se(e.jornada_publicada.ok,"Jornada actual publicada",e.jornada_publicada.detalle)}
      ${se(e.predicciones_bots.ok,"Predicciones bots generadas",e.predicciones_bots.detalle)}
      ${se(e.jornada_anterior_cerrada.ok,"Jornada anterior cerrada",e.jornada_anterior_cerrada.detalle)}
      ${se(e.resultados_sincronizados.ok,"Resultados sincronizados",e.resultados_sincronizados.detalle)}
    </div>
  `}const Re={PD:"🇪🇸 LaLiga",PL:"🏴󠁧󠁢󠁥󠁮󠁧󠁿 Premier League",CL:"⭐ Champions League",SA:"🇮🇹 Serie A",BL1:"🇩🇪 Bundesliga",FL1:"🇫🇷 Ligue 1",PPL:"🇵🇹 Primeira Liga",DED:"🇳🇱 Eredivisie",SD:"🇪🇸 LaLiga 2",CDR:"🇪🇸 Copa del Rey",UNL:"🌍 UEFA Nations League",EC2024:"🌍 Eliminatorias Europa",CLI:"🌎 Amistosos internacionales",BSA:"🇧🇷 Brasileirao",MLS:"🇺🇸 MLS"},Je=[{key:"principales",label:"📌 Principales",expandable:!1,defaultChecked:!0,codes:["PD","PL","CL"]},{key:"europa",label:"🌍 Europa",expandable:!0,defaultChecked:!1,codes:["BL1","SA","FL1","PPL","DED"]},{key:"espana",label:"🇪🇸 España",expandable:!0,defaultChecked:!1,codes:["SD","CDR"]},{key:"selecciones",label:"🌎 Selecciones",expandable:!0,defaultChecked:!1,codes:["UNL","EC2024","CLI"]},{key:"otras",label:"⚽ Otras ligas",expandable:!0,defaultChecked:!1,codes:["BSA","MLS"]}];let T=[],ie=null;async function Y(e){const a=document.getElementById("jornadasV2Content");if(a)try{const{jornadas:t}=await m.adminV2.jornadas();a.innerHTML=Ma(t),Ha(a)}catch(t){a.innerHTML=`<p class="form__error">Error: ${t.message}</p>`}}function Ma(e){return`
    <div class="jv2-panel">
      <div class="jv2-panel__actions">
        <button class="btn btn--primary btn--sm" id="btnNuevaJornada">+ Nueva jornada</button>
      </div>

      <div class="jv2-list">
        ${e.length===0?'<p class="admin-section__desc">No hay jornadas creadas.</p>':e.map(qa).join("")}
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
            ${Da()}
          </div>

          <button class="btn btn--ghost btn--sm" id="btnBuscarPartidos" type="button" style="align-self:flex-start">Buscar partidos</button>
        </div>

        <div id="jv2MatchPicker" style="display:none">
          <div class="jv2-counter jv2-counter--incomplete" id="jv2Counter">
            <strong id="jv2Count">0/10</strong> partidos seleccionados
          </div>
          <div id="jv2MatchList" class="jv2-match-list"></div>
        </div>

        <div class="jv2-form__footer">
          <button class="btn btn--primary btn--sm" id="btnGuardarJornada">Guardar como borrador</button>
          <button class="btn btn--ghost btn--sm" id="btnCancelarJornada">Cancelar</button>
        </div>
      </div>
    </div>
  `}function Da(){return Je.map(e=>{const a=e.codes.map(s=>`<span class="jv2-comp-filter-chip">${Re[s]||s}</span>`).join(""),t=`
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
      `}).join("")}function qa(e){const a={draft:'<span class="admin-match-badge" style="background:rgba(61,145,255,0.15);color:#3d91ff;border:1px solid rgba(61,145,255,0.3)">Borrador</span>',upcoming:'<span class="admin-match-badge admin-match-badge--pending">Próxima</span>',active:'<span class="admin-match-badge admin-match-badge--done">Activa</span>',finished:'<span class="admin-match-badge" style="background:rgba(255,255,255,0.05);color:#6e6e6e;border:1px solid #222">Finalizada</span>'}[e.status]||`<span class="admin-match-badge">${e.status}</span>`,t=d=>d?new Date(d).toLocaleDateString("es-ES",{day:"2-digit",month:"2-digit"}):"—",s=e.status==="draft"||e.status==="upcoming"||e.status==="active"||e.status==="finished",i=e.date_end&&new Date(e.date_end)<new Date&&(e.status==="upcoming"||e.status==="active"),o=e.status!=="finished",r=e.status!=="finished";return`
    <div class="jv2-row" data-jornada-id="${e.id}">
      <div class="jv2-row__info">
        <span class="jv2-row__num">J${e.number}</span>
        <span class="jv2-row__dates">${t(e.date_start)} – ${t(e.date_end)}</span>
        ${a}
        <span class="jv2-row__matches">${e.match_count} partidos</span>
      </div>
      <div class="jv2-row__actions">
        ${e.status==="draft"?`
          <button class="btn btn--primary btn--xs jv2-pub-btn" data-id="${e.id}" data-num="${e.number}" data-count="${e.match_count}">Publicar</button>
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
  `}function Ha(e){var a,t,s,n,i,o;(a=e.querySelector("#btnNuevaJornada"))==null||a.addEventListener("click",()=>{ie=null,T=[],document.getElementById("jv2FormTitle").textContent="Nueva jornada",document.getElementById("jv2EditId").value="",document.getElementById("jv2Number").value="",document.getElementById("jv2DateStart").value="",document.getElementById("jv2DateEnd").value="",document.getElementById("jv2DateFrom").value="",document.getElementById("jv2DateTo").value="",document.getElementById("jv2MatchPicker").style.display="none",document.getElementById("jv2Form").style.display="block",ve()}),(t=e.querySelector("#btnCancelarJornada"))==null||t.addEventListener("click",()=>{document.getElementById("jv2Form").style.display="none",T=[],ie=null}),(s=e.querySelector("#btnBuscarPartidos"))==null||s.addEventListener("click",Na),(n=e.querySelector("#btnGuardarJornada"))==null||n.addEventListener("click",Ra),e.querySelectorAll(".jv2-results-btn").forEach(r=>{r.addEventListener("click",()=>Fa(r.dataset.id,r))}),e.querySelectorAll(".jv2-pub-btn").forEach(r=>{r.addEventListener("click",async()=>{if(confirm(`¿Publicar jornada ${r.dataset.num}? Se calcularán cuotas, se asignarán duelos y se notificará a los usuarios.`)){r.disabled=!0,r.textContent="Publicando…";try{const d=await m.adminV2.publishJornada(r.dataset.id);g(`Jornada ${r.dataset.num} publicada — push enviado a ${d.push_sent} suscriptores`),await Y(document.getElementById("jornadasV2Section"))}catch(d){g(d.message,"error"),r.disabled=!1,r.textContent="Publicar"}}})}),e.querySelectorAll(".jv2-close-btn").forEach(r=>{r.addEventListener("click",async()=>{if(confirm(`¿Cerrar jornada ${r.dataset.num}? Se calcularán los puntos y se resolverán los duelos. Esta acción es irreversible.`)){r.disabled=!0,r.textContent="Cerrando…";try{const d=await m.adminV2.closeJornada(r.dataset.id);g(d.message||`Jornada ${r.dataset.num} cerrada`),await Y(document.getElementById("jornadasV2Section"))}catch(d){g(d.message,"error"),r.disabled=!1,r.textContent="Cerrar jornada"}}})}),e.querySelectorAll(".jv2-edit-btn").forEach(r=>{r.addEventListener("click",()=>Aa(r.dataset.id))}),e.querySelectorAll(".jv2-del-btn").forEach(r=>{r.addEventListener("click",async()=>{if(confirm(`¿Eliminar la jornada ${r.dataset.num}?`)&&confirm("¿Seguro? Esta acción eliminará la jornada y todos sus partidos")){r.disabled=!0,r.textContent="Eliminando…";try{await m.adminV2.deleteJornada(r.dataset.id),g("Jornada eliminada"),await Y(document.getElementById("jornadasV2Section"))}catch(d){g(d.message,"error"),r.disabled=!1,r.textContent="🗑️ Eliminar"}}})}),(i=e.querySelector("#jv2DateStart"))==null||i.addEventListener("input",Le),(o=e.querySelector("#jv2DateEnd"))==null||o.addEventListener("input",Le),e.querySelectorAll(".jv2-group-check").forEach(r=>{r.addEventListener("click",d=>d.stopPropagation())})}function Le(){var n,i;const e=(n=document.getElementById("jv2DateStart"))==null?void 0:n.value,a=(i=document.getElementById("jv2DateEnd"))==null?void 0:i.value,t=document.getElementById("jv2DateFrom"),s=document.getElementById("jv2DateTo");t&&e&&(t.value=e.slice(0,10)),s&&a&&(s.value=a.slice(0,10))}async function Aa(e){const{jornadas:a}=await m.adminV2.jornadas(),t=a.find(s=>String(s.id)===String(e));t&&(ie=t.id,T=[],document.getElementById("jv2FormTitle").textContent=`Editar jornada ${t.number}`,document.getElementById("jv2EditId").value=t.id,document.getElementById("jv2Number").value=t.number,t.date_start&&(document.getElementById("jv2DateStart").value=t.date_start.slice(0,16)),t.date_end&&(document.getElementById("jv2DateEnd").value=t.date_end.slice(0,16)),t.date_start&&(document.getElementById("jv2DateFrom").value=t.date_start.slice(0,10)),t.date_end&&(document.getElementById("jv2DateTo").value=t.date_end.slice(0,10)),document.getElementById("jv2MatchPicker").style.display="none",document.getElementById("jv2Form").style.display="block",ve())}async function Na(){const e=document.getElementById("btnBuscarPartidos"),a=document.getElementById("jv2DateFrom").value,t=document.getElementById("jv2DateTo").value;if(!a||!t){g("Selecciona el rango de fechas (Desde / Hasta)","error");return}if(a>t){g('"Desde" no puede ser posterior a "Hasta"',"error");return}const s=Array.from(document.querySelectorAll(".jv2-group-check:checked")).map(i=>i.dataset.group),n=Je.filter(i=>s.includes(i.key)).flatMap(i=>i.codes);if(n.length===0){g("Selecciona al menos un grupo de competiciones","error");return}e.disabled=!0,e.textContent="Buscando…";try{const{matches:i}=await m.adminV2.partidos(a,t,n);Oa(i),document.getElementById("jv2MatchPicker").style.display="block"}catch(i){g(`Error: ${i.message}`,"error")}finally{e.disabled=!1,e.textContent="Buscar partidos"}}function Oa(e){const a=document.getElementById("jv2MatchList");if(Object.values(e).flat().length===0){a.innerHTML='<p class="admin-section__desc">No hay partidos disponibles para esta semana.</p>';return}a.innerHTML=Object.entries(e).map(([s,n])=>n.length?`
      <div class="jv2-comp-group">
        <div class="jv2-comp-group__title">${Re[s]||s}</div>
        ${n.map(i=>`
          <label class="jv2-match-item">
            <input type="checkbox" class="jv2-match-check" data-match='${JSON.stringify(i)}' />
            <span class="jv2-match-item__teams">${i.home_team} vs ${i.away_team}</span>
            <span class="jv2-match-item__date">${Ja(i.match_datetime)}</span>
          </label>
        `).join("")}
      </div>
    `:"").join(""),a.querySelectorAll(".jv2-match-check").forEach(s=>{s.addEventListener("change",()=>{const n=JSON.parse(s.dataset.match);if(s.checked){if(T.length>=10){s.checked=!1,g("Máximo 10 partidos","error");return}T.push(n)}else T=T.filter(i=>i.api_id!==n.api_id);ve()})})}function ve(){const e=document.getElementById("jv2Count");e&&(e.textContent=`${T.length}/10`);const a=document.getElementById("jv2Counter");if(a){const t=T.length===10;a.classList.toggle("jv2-counter--complete",t),a.classList.toggle("jv2-counter--incomplete",!t)}}async function Ra(){const e=parseInt(document.getElementById("jv2Number").value),a=document.getElementById("jv2DateStart").value,t=document.getElementById("jv2DateEnd").value,s=document.getElementById("jv2EditId").value;if(!e||!a||!t){g("Completa número y fechas","error");return}const n={number:e,date_start:new Date(a).toISOString(),date_end:new Date(t).toISOString()};T.length>0&&(n.matches=T);const i=document.getElementById("btnGuardarJornada");i.disabled=!0;try{s?(await m.adminV2.updateJornada(s,n),g(`Jornada ${e} actualizada`)):(await m.adminV2.createJornada(n),g(`Jornada ${e} guardada como borrador`)),document.getElementById("jv2Form").style.display="none",T=[],ie=null,await Y(document.getElementById("jornadasV2Section"))}catch(o){g(o.message,"error")}finally{i.disabled=!1}}function Ja(e){return e?new Date(e).toLocaleDateString("es-ES",{day:"2-digit",month:"2-digit"}):"—"}async function Fa(e,a){const t=document.getElementById(`jv2-results-${e}`);if(t){if(t.style.display!=="none"){t.style.display="none",a.textContent="Resultados";return}a.disabled=!0,a.textContent="Cargando…";try{const{matches:s}=await m.adminV2.jornadaMatches(e);t.innerHTML=Fe(s,e),t.style.display="block",Ue(t,e),a.textContent="Ocultar"}catch(s){g(`Error: ${s.message}`,"error"),a.textContent="Resultados"}finally{a.disabled=!1}}}function Ua(e){if(e.jm_status==="cancelled")return'<span class="admin-match-badge admin-match-badge--cancelled">🔴 Suspendido</span>';if(e.jm_status==="finished"){const n=e.home_score_90!=null&&e.away_score_90!=null?` ${e.home_score_90}–${e.away_score_90}`:"",i=e.is_manual?' <span class="admin-match-badge admin-match-badge--manual">🔒 Manual</span>':"";return`<span class="admin-match-badge admin-match-badge--done">🟢 Finalizado${n}</span>${i}`}const a=Date.now(),t=new Date(e.match_datetime).getTime(),s=t+2*60*60*1e3;return a>=t&&a<=s?'<span class="admin-match-badge admin-match-badge--live">🔵 En juego</span>':a>s?'<span class="admin-match-badge admin-match-badge--stale">⚠️ ¿Ya se jugó? Introduce el resultado manualmente</span>':'<span class="admin-match-badge admin-match-badge--pending">🟡 Pendiente</span>'}function za(e){return e?new Date(e).toLocaleString("es-ES",{day:"2-digit",month:"2-digit",hour:"2-digit",minute:"2-digit"}):"—"}function Fe(e,a){const t=[...e].sort((s,n)=>new Date(n.match_datetime)-new Date(s.match_datetime));return`
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
              <span class="jv2-results-row__datetime">${za(s.match_datetime)}</span>
              <div class="jv2-results-row__teams">
                <span>${s.home_team}</span>
                <span class="jv2-results-row__vs">vs</span>
                <span>${s.away_team}</span>
              </div>
              ${Ua(s)}
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
  `}function Ue(e,a){var t,s,n,i;(t=e.querySelector(".jv2-add-manual-btn"))==null||t.addEventListener("click",()=>{const o=e.querySelector(".jv2-manual-form");o.style.display=o.style.display==="none"?"block":"none"}),(s=e.querySelector(".jv2-manual-cancel-btn"))==null||s.addEventListener("click",()=>{e.querySelector(".jv2-manual-form").style.display="none"}),e.querySelectorAll(".jv2-manual-type").forEach(o=>{o.addEventListener("change",()=>{var l;const r=((l=e.querySelector(".jv2-manual-type:checked"))==null?void 0:l.value)==="12",d=e.querySelector(".jv2-manual-oddsx-wrap");d&&(d.style.display=r?"none":"")})}),(n=e.querySelector(".jv2-manual-save-btn"))==null||n.addEventListener("click",async()=>{var y;const o=e.querySelector(".jv2-manual-home").value.trim(),r=e.querySelector(".jv2-manual-away").value.trim(),d=e.querySelector(".jv2-manual-dt").value,l=((y=e.querySelector(".jv2-manual-type:checked"))==null?void 0:y.value)==="12",f=e.querySelector(".jv2-manual-odds1").value,p=e.querySelector(".jv2-manual-oddsx").value,b=e.querySelector(".jv2-manual-odds2").value;if(!o||!r){g("Introduce los dos equipos","error");return}if(!d){g("Introduce la fecha y hora","error");return}const c=e.querySelector(".jv2-manual-save-btn");c.disabled=!0,c.textContent="…";try{const $={home_team:o,away_team:r,match_datetime:new Date(d).toISOString(),no_draw:l};f&&($.odds_1=parseFloat(f)),!l&&p&&($.odds_x=parseFloat(p)),b&&($.odds_2=parseFloat(b)),await m.adminV2.addManualMatch(a,$),g("Partido manual añadido"),await X(a)}catch($){g($.message,"error"),c.disabled=!1,c.textContent="Añadir"}}),(i=e.querySelector(".jv2-sync-btn"))==null||i.addEventListener("click",async o=>{const r=o.currentTarget;r.disabled=!0,r.textContent="⏳ Sincronizando…";try{await m.matches.sync(),g("Sincronización completada"),await X(a)}catch(d){g(d.message,"error"),r.disabled=!1,r.textContent="🔄 Sincronizar resultados ahora"}}),e.querySelectorAll(".jv2-save-result-btn").forEach(o=>{o.addEventListener("click",async()=>{var c,y,$,E;const r=o.dataset.jmId,d=e.querySelector(`.jv2-results-row[data-jm-id="${r}"]`),l=(c=d.querySelector('.jv2-score-input[data-side="home"]'))==null?void 0:c.value,f=(y=d.querySelector('.jv2-score-input[data-side="away"]'))==null?void 0:y.value,p=(($=d.querySelector(".jv2-r90-select"))==null?void 0:$.value)||void 0,b=((E=d.querySelector(".jv2-result-type-select"))==null?void 0:E.value)||"90m";if(l===""||f===""){g("Introduce los dos marcadores","error");return}o.disabled=!0,o.textContent="…";try{const k={home_score:parseInt(l),away_score:parseInt(f),result_type:b};p&&(k.result_90=p),await m.adminV2.setResultado(r,k),g("Resultado guardado y puntos recalculados"),await X(a)}catch(k){g(k.message,"error"),o.disabled=!1,o.textContent="Guardar"}})}),e.querySelectorAll(".jv2-cancel-match-btn").forEach(o=>{o.addEventListener("click",async()=>{const{jmId:r,home:d,away:l}=o.dataset;if(confirm(`¿Cancelar el partido ${d} vs ${l}? Las unidades apostadas se devolverán a los usuarios.`)){o.disabled=!0,o.textContent="…";try{const{message:f}=await m.adminV2.cancelMatch(r);g(f),await X(a)}catch(f){g(f.message,"error"),o.disabled=!1,o.textContent="Cancelar"}}})}),e.querySelectorAll(".jv2-delete-manual-btn").forEach(o=>{o.addEventListener("click",async()=>{const{jmId:r,home:d,away:l}=o.dataset;if(confirm(`¿Eliminar el partido manual ${d} vs ${l}? Se borrarán todas las predicciones asociadas.`)){o.disabled=!0,o.textContent="…";try{const{message:f}=await m.adminV2.deleteManualMatch(r);g(f),await X(a)}catch(f){g(f.message,"error"),o.disabled=!1,o.textContent="🗑️ Eliminar"}}})})}async function X(e){const a=document.getElementById(`jv2-results-${e}`);if(!(!a||a.style.display==="none"))try{const{matches:t}=await m.adminV2.jornadaMatches(e);a.innerHTML=Fe(t,e),Ue(a,e);const s=document.querySelector(`.jv2-row[data-jornada-id="${e}"]`),n=s==null?void 0:s.querySelector(".jv2-row__matches");n&&(n.textContent=`${t.length} partidos`);const i=s==null?void 0:s.querySelector(".jv2-pub-btn");i&&(i.dataset.count=t.length)}catch(t){g(`Error recargando: ${t.message}`,"error")}}function Ga(e){return String(e??"").replace(/[&<>"']/g,a=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[a])}function Va(e){e.innerHTML=`
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
  `,document.getElementById("forgotForm").addEventListener("submit",async a=>{a.preventDefault();const t=document.getElementById("forgotBtn"),s=document.getElementById("forgotMsg"),n=document.getElementById("email").value.trim();t.disabled=!0,t.textContent="Enviando…";try{await m.auth.forgotPassword(n),s.textContent="Si el email existe, recibirás un enlace en breve.",s.classList.remove("hidden","form__error"),s.classList.add("form__success")}catch{g("Error al enviar el email","error")}finally{t.disabled=!1,t.textContent="Enviar enlace"}})}function Wa(e,{query:a}){const t=a.token||"";if(!t){e.innerHTML='<div class="container"><p class="form__error">Token inválido o expirado.</p><a href="#/login">Volver</a></div>';return}e.innerHTML=`
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
  `,document.getElementById("resetForm").addEventListener("submit",async s=>{s.preventDefault();const n=document.getElementById("resetBtn"),i=document.getElementById("resetError"),o=document.getElementById("password").value;n.disabled=!0,n.textContent="Guardando…",i.classList.add("hidden");try{await m.auth.resetPassword(t,o),g("Contraseña actualizada. Ya puedes iniciar sesión."),I.navigate("/login")}catch(r){i.textContent=r.message||"Error al restablecer la contraseña",i.classList.remove("hidden")}finally{n.disabled=!1,n.textContent="Guardar contraseña"}})}async function Xa(e,{query:a}){const t=(a.codigo||"").trim().toUpperCase();if(!t){e.innerHTML='<div class="container"><p class="form__error">Enlace de invitación inválido.</p><a href="#/ligas">Ver ligas</a></div>';return}if(!w.isLoggedIn()){sessionStorage.setItem("pendingInviteCode",t),I.navigate("/register");return}e.innerHTML='<div class="loading"><div class="loading__spinner"></div></div>';try{const{league:s}=await m.leagues.joinByCode(t);g(`¡Te has unido a "${s.name}"!`),I.navigate(`/ligas/${s.id}`)}catch(s){if(s.status===409){g("Ya eres miembro de esta liga");try{const{leagues:n}=await m.leagues.my(),i=n.find(o=>o.invite_code===t);if(i){I.navigate(`/ligas/${i.id}`);return}}catch{}}e.innerHTML=`
      <div class="container">
        <div class="league-gate">
          <div class="league-gate__icon">⚠️</div>
          <h2 class="league-gate__title">Error al unirse</h2>
          <p class="league-gate__text">${s.message}</p>
          <a href="#/ligas" class="btn btn--primary">Ver ligas</a>
        </div>
      </div>
    `}}function Ka(){const e=localStorage.getItem("activeLeagueId");return e?parseInt(e):null}async function Ya(e,{params:a}){const t=parseInt(a.id);if(!t){e.innerHTML='<div class="container"><p class="form__error">Usuario no válido.</p></div>';return}e.innerHTML='<div class="loading"><div class="loading__spinner"></div></div>';try{const s=Ka(),{user:n,predictions:i}=await m.predictions.forUser(t,s);e.innerHTML=`
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
              ${i.map(o=>Za(o)).join("")}
            </div>`}
      </div>
    `}catch(s){e.innerHTML=`<div class="container"><p class="form__error">Error: ${s.message}</p></div>`}}function Za(e){const a=e.match,t=e.total_points,s=e.pts_score>0,n=e.pts_result>0;let i="";return s?i='<span class="jugador__badge jugador__badge--exact">Exacto</span>':n?i='<span class="jugador__badge jugador__badge--ok">1X2 ✓</span>':i='<span class="jugador__badge jugador__badge--miss">Fallo</span>',`
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
  `}const J=20,ze=5;let P={},F=0,me=null,ce=null,te=[];async function Qa(e){e.innerHTML='<div class="loading"><div class="loading__spinner"></div></div>';try{const{jornadas:a}=await m.jornada.list();if(!a.length){e.innerHTML=et();return}const t=[...a].sort((i,o)=>i.jornada.number-o.jornada.number),s=t.findIndex(i=>i.jornada.status==="active"||i.jornada.status==="upcoming"),n=s>=0?s:t.length-1;Ge(e,t,n)}catch(a){e.innerHTML=`<div class="container"><p class="form__error">Error cargando jornadas: ${a.message}</p></div>`}}function Ge(e,a,t){var p,b;ce=a[t];const{jornada:s,matches:n,units_used:i}=ce;P={};for(const c of n)P[c.jornada_match_id]={predicted_result:((p=c.prediction)==null?void 0:p.predicted_result)??null,units:((b=c.prediction)==null?void 0:b.units_wagered)??0};F=i;const o=n.filter(c=>!c.predict_locked);te=o,me=o.length===1?o[0].jornada_match_id:null;const r=s.status==="finished",d=Se(ce);console.log("[hits] jornada",s.number,"| matches:",n.length),console.log("[hits] result_90 values:",n.map(c=>{var y;return{id:c.jornada_match_id,jm_status:c.jm_status,result_90:c.result_90,pred:(y=c.prediction)==null?void 0:y.predicted_result}})),console.log("[hits] calcHits result:",d);const l=d.with_result>0?`<span class="hits-badge">${d.correct}/${d.with_result}</span>`:"",f=a.length>1?`<div class="jornada-tabs">
        ${a.map((c,y)=>{const $=c.jornada.status==="finished",{pts:E,cls:k}=it(c),{correct:j,with_result:h}=Se(c);return`
            <button class="jornada-tab jornada-tab--stacked ${y===t?"jornada-tab--active":""} ${$?"jornada-tab--finished":""}" data-idx="${y}">
              <span class="jornada-tab__num">J${c.jornada.number}</span>
              <span class="jornada-tab__pts jornada-tab__pts--${k}">${L(E)}pts</span>
              ${h>0?`<span class="jornada-tab__hits">${j}/${h}</span>`:""}
              ${$?'<span class="jornada-tab__badge">Finalizada</span>':""}
            </button>
          `}).join("")}
       </div>`:"";e.innerHTML=`
    <div class="container">
      <div class="page-title-row">
        <h1 class="page-title">Jornada ${s.number} — del ${ke(s.date_start)} al ${ke(s.date_end)} ${l}</h1>
        <button class="btn-info" id="btnPointsInfo" aria-label="Cómo funciona">ℹ️</button>
      </div>
      ${f}
      ${r?"":'<div class="units-counter" id="unitsCounter"></div>'}
      <div class="jornada-matches">
        ${n.map(rt).join("")}
      </div>
      ${!r&&o.length>0?`
        <div class="jornada-save-all" id="jornadaSaveAll">
          <button class="jornada-save-all__btn" id="jornadaSaveAllBtn">
            💾 Guardar predicciones (0/${o.length} predichos)
          </button>
        </div>
      `:""}
      ${ee()}
    </div>
  `,console.log("[hits] .hits-badge en DOM:",e.querySelector(".hits-badge")),console.log("[hits] .jornada-tab__hits en DOM:",e.querySelectorAll(".jornada-tab__hits").length,"elementos"),We(),Xe(),ge(),dt(e,a,t),ae(e),requestAnimationFrame(()=>{var c;(c=e.querySelector(".jornada-tab--active"))==null||c.scrollIntoView({block:"nearest",inline:"center"})})}function et(){return`
    <div class="container">
      <div class="jornada-empty">
        <div class="jornada-empty__icon">📅</div>
        <h2 class="jornada-empty__title">No hay jornadas disponibles</h2>
        <p class="jornada-empty__text">Todavía no hay una próxima jornada programada.</p>
      </div>
    </div>
  `}function ke(e){return new Date(e).toLocaleDateString("es-ES",{day:"2-digit",month:"2-digit"})}function at(e){return new Date(e).toLocaleString("es-ES",{day:"2-digit",month:"2-digit",hour:"2-digit",minute:"2-digit"})}function ue(e){return e!=null?e.toFixed(2):"—"}function tt(e){return e.jm_status==="cancelled"?'<span class="tag tag--cancelled">Suspendido</span>':e.status==="finished"?`<span class="tag tag--done">Finalizado ${e.home_score_90??"?"}–${e.away_score_90??"?"}</span>`:e.predict_locked?'<span class="tag tag--locked">Bloqueado</span>':`<span class="tag tag--open">Abierto hasta ${at(e.opens_until)}</span>`}const st=new Set(["r32","r16","quarters","semis","third","final","no_draw"]);function Ve(e,a,t){const n={1:t.odds_1,X:t.odds_x,2:t.odds_2}[a];return n!=null?Math.round(e.units_wagered*parseFloat(n)*100)/100:e.points_earned??0}function nt(e){let a=0,t=0,s=0,n=0;for(const r of e.matches){if(r.jm_status==="cancelled")continue;const d=r.prediction,l=r.status==="finished"&&r.result_90!=null;if(d&&d.units_wagered&&(a+=d.units_wagered),l){if(!d){n+=1;continue}d.predicted_result===r.result_90&&(t+=Ve(d,r.result_90,r));continue}d&&d.units_wagered&&(s+=d.units_wagered)}const i=Math.max(0,J-a),o=Math.max(0,t+s+i-n);return Math.round(o*100)/100}function Se(e){var s;let a=0,t=0;for(const n of e.matches)n.jm_status!=="cancelled"&&n.result_90!=null&&(t++,((s=n.prediction)==null?void 0:s.predicted_result)===n.result_90&&a++);return{correct:a,with_result:t}}function it(e){const a=nt(e),t=e.jornada.status;return{pts:a,cls:t==="finished"?"finished":t==="active"?"active":"upcoming"}}function ot(e){if(e.jm_status==="cancelled")return"";const a=e.prediction;if(e.status==="finished"&&e.result_90!=null){if(!a)return'<span class="jornada-pts-label jornada-pts-label--penalty">-1 pt ⚠️</span>';if(a.predicted_result===e.result_90){const n=Ve(a,e.result_90,e);return`<span class="jornada-pts-label jornada-pts-label--win">+${L(n)} pts</span>`}return'<span class="jornada-pts-label jornada-pts-label--loss">0 pts</span>'}if(!a||!a.units_wagered)return"";const s=e.predict_locked;return`<span class="jornada-pts-label jornada-pts-label--${s?"live":"pending"}">${a.units_wagered}u${s?" en juego":" apostadas"}</span>`}function rt(e){const a=e.jm_status==="cancelled",t=e.predict_locked,s=P[e.jornada_match_id]??{predicted_result:null,units:0},n=st.has(e.phase);return`
    <div class="match-card jornada-match ${t?"match-card--locked":""} ${a?"match-card--cancelled":""}" data-jm-id="${e.jornada_match_id}">
      <div class="match-card__header">
        <span class="match-card__date">${M(e.match_datetime)}</span>
        ${tt(e)}
      </div>
      <div class="match-card__teams">
        <span class="team team--home">${e.home_team}${N(e.home_logo)}</span>
        <div class="match-card__score">
          ${e.status!=="scheduled"?`<span class="score">${e.home_score_90??"?"} - ${e.away_score_90??"?"}</span>`:'<span class="score score--dash">vs</span>'}
          ${ot(e)}
        </div>
        <span class="team team--away">${N(e.away_logo)}${e.away_team}</span>
      </div>
      <div class="jornada-odds">
        <span class="jornada-odds__item"><b>1</b> (${ue(e.odds_1)})</span>
        ${n?"":`<span class="jornada-odds__item"><b>X</b> (${ue(e.odds_x)})</span>`}
        <span class="jornada-odds__item"><b>2</b> (${ue(e.odds_2)})</span>
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
          <input type="number" id="units-${e.jornada_match_id}" class="jornada-units__input" min="0" max="${ze}" value="${s.units}" ${t?"disabled":""} />
        </div>
      </div>
      ${t?"":`<div class="jornada-match__warning" id="warning-${e.jornada_match_id}"></div>`}
    </div>
  `}function We(){const e=document.getElementById("unitsCounter");if(!e)return;const a=F>J;e.innerHTML=`
    <div class="units-counter__bar">
      <div class="units-counter__fill ${a?"units-counter__fill--over":""}" style="width:${Math.min(100,F/J*100)}%"></div>
    </div>
    <span class="units-counter__label ${a?"units-counter__label--over":""}">${F}/${J} unidades usadas</span>
  `}function Xe(){if(!me)return;const e=document.getElementById(`warning-${me}`);if(!e)return;const a=J-F;e.innerHTML=a>0?`<p class="notice">Te quedan ${a} unidades — es tu último partido.</p>`:""}function Ie(){F=Object.values(P).reduce((e,a)=>e+(a.predicted_result?a.units:0),0),We(),Xe(),ge()}function dt(e,a,t){var s;e.querySelectorAll(".jornada-tab").forEach(n=>{n.addEventListener("click",()=>{const i=parseInt(n.dataset.idx);i!==t&&Ge(e,a,i)})}),e.querySelectorAll(".jornada-match").forEach(n=>{const i=parseInt(n.dataset.jmId);n.querySelectorAll('input[type="radio"]').forEach(r=>{r.addEventListener("change",()=>{P[i].predicted_result=r.value,Ie()})});const o=n.querySelector(".jornada-units__input");o==null||o.addEventListener("input",()=>{let r=parseInt(o.value);isNaN(r)&&(r=0),r=Math.max(0,Math.min(ze,r)),P[i].units=r,Ie()})}),(s=document.getElementById("jornadaSaveAllBtn"))==null||s.addEventListener("click",lt)}function ge(){const e=document.getElementById("jornadaSaveAllBtn");if(!e)return;const a=te.filter(s=>{var n;return(n=P[s.jornada_match_id])==null?void 0:n.predicted_result}).length,t=te.length;e.textContent=`💾 Guardar predicciones (${a}/${t} predichos)`}async function lt(){const e=te.filter(i=>{var o;return!((o=P[i.jornada_match_id])!=null&&o.predicted_result)});if(e.length>0&&!confirm(`⚠️ Te quedan ${e.length} partido${e.length!==1?"s":""} sin predecir (−1 pt cada uno).

¿Guardar igualmente?`))return;if(F>J){g(`Superas el máximo de ${J} unidades`,"error");return}const a=te.filter(i=>{var o;return(o=P[i.jornada_match_id])==null?void 0:o.predicted_result});if(!a.length){g("No hay predicciones que guardar","error");return}const t=document.getElementById("jornadaSaveAllBtn");t&&(t.disabled=!0,t.textContent="Guardando…");const n=(await Promise.allSettled(a.map(i=>m.jornada.predict({jornada_match_id:i.jornada_match_id,predicted_result:P[i.jornada_match_id].predicted_result,units:P[i.jornada_match_id].units})))).filter(i=>i.status==="rejected").length;n===0?g(`${a.length} predicción${a.length!==1?"es":""} guardadas ✓`):g(`${n} error${n!==1?"es":""} al guardar`,"error"),t&&(t.disabled=!1,ge())}let ne=null;function be(){ne&&(clearInterval(ne),ne=null)}const xe={en_curso:{label:"En curso",cls:"duelo-status--curso"},ganado:{label:"Ganaste",cls:"duelo-status--ganado"},perdido:{label:"Perdiste",cls:"duelo-status--perdido"},empate:{label:"Empate",cls:"duelo-status--empate"}},ct={ganado:"🏆 Victoria",perdido:"💔 Derrota",empate:"🤝 Empate"};function ut(e){return e.is_bye?{icon:"",cls:""}:e.jornada_status==="upcoming"?{icon:"",cls:""}:e.jornada_status==="active"?{icon:e.my_points>e.rival_points?"✓":e.my_points<e.rival_points?"✗":"=",cls:"live"}:e.status==="ganado"?{icon:"✓",cls:"win"}:e.status==="perdido"?{icon:"✗",cls:"loss"}:e.status==="empate"?{icon:"=",cls:"draw"}:{icon:"",cls:""}}async function mt(e){be(),e.innerHTML='<div class="loading"><div class="loading__spinner"></div></div>';try{const[{duelos:a},t]=await Promise.all([m.duelo.list(),Promise.resolve(w.getUser())]);if(!a.length){e.innerHTML=`
        <div class="container">
          <h1 class="page-title">Duelos</h1>
          <div class="duelo-empty">
            <div class="duelo-empty__icon">🤝</div>
            <p class="duelo-empty__text">No tienes duelos todavía.</p>
          </div>
        </div>
      `;return}const s=a.findIndex(o=>o.jornada_status==="active"||o.jornada_status==="upcoming"),n=s>=0?s:a.length-1,i=a.map((o,r)=>{const{icon:d,cls:l}=ut(o),f=o.jornada_status!=="upcoming",p=o.jornada_status==="finished"?"finished":"active",b=`${L(o.my_points)}-${o.is_bye?"—":L(o.rival_points)}`;return`
        <button class="jornada-tab jornada-tab--stacked ${r===n?"jornada-tab--active":""}" data-idx="${r}">
          <span class="jornada-tab__num">J${o.jornada_number}</span>
          ${f?`
            <span class="jornada-tab__pts jornada-tab__pts--${p}">
              ${b}${d?` <span class="jornada-tab__result jornada-tab__result--${l}">${d}</span>`:""}
            </span>
          `:""}
        </button>
      `}).join("");e.innerHTML=`
      <div class="container">
        <div class="page-title-row">
          <h1 class="page-title">Duelos</h1>
          <button class="btn-info" id="btnPointsInfo" aria-label="Cómo funciona">ℹ️</button>
        </div>
        <div class="jornada-tabs">${i}</div>
        <div id="dueloContent"></div>
        ${ee()}
      </div>
    `,ae(e),requestAnimationFrame(()=>{var o;(o=e.querySelector(".jornada-tab--active"))==null||o.scrollIntoView({block:"nearest",inline:"center"})}),e.querySelectorAll(".jornada-tab").forEach(o=>{o.addEventListener("click",()=>{e.querySelectorAll(".jornada-tab").forEach(r=>r.classList.remove("jornada-tab--active")),o.classList.add("jornada-tab--active"),Ce(e,a[parseInt(o.dataset.idx)],t)})}),await Ce(e,a[n],t)}catch(a){e.innerHTML=`<div class="container"><p class="form__error">Error cargando duelos: ${a.message}</p></div>`}}async function Ce(e,a,t){var i;be();const s=e.querySelector("#dueloContent");if(!s)return;s.innerHTML='<div class="loading"><div class="loading__spinner"></div></div>';const n=a.jornada_status==="active"||a.jornada_status==="upcoming";try{const{duelo:o}=await m.duelo.current(a.jornada_id);if(n){if(!o){s.innerHTML=vt();return}if(s.innerHTML=pt(o,t),Te(s,o.division_league_id,t.id),!a.is_bye){const r=((i=a.rival)==null?void 0:i.username)??"—";Be(a.jornada_id,t.username,r),ne=setInterval(()=>Be(a.jornada_id,t.username,r),6e4)}}else s.innerHTML=_t(a,o,t),Te(s,a.division_league_id,t.id)}catch(o){s.innerHTML=`<p class="form__error">Error: ${o.message}</p>`}}function pt(e,a){var i;const t=xe[e.status]??xe.en_curso,s=e.rival?e.rival.username:a.username,n=!e.rival||e.rival.id===a.id;return`
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
        ${e.matches.map(o=>bt(o,s)).join("")}
      </div>
    `:""}

    <h2 class="section-title">Clasificación divisional</h2>
    <div id="divisionStandings"><div class="loading"><div class="loading__spinner"></div></div></div>
  `}function _t(e,a,t){var j;const s=((j=e.rival)==null?void 0:j.username)??(e.is_bye?"Descanso":"—"),n=ct[e.status],i=(a==null?void 0:a.matches)??[];let o=0,r=0,d=0,l=0;for(const h of i)h.jm_status!=="cancelled"&&(h.my_prediction?(d+=h.my_prediction.units_wagered,h.status==="finished"&&h.result_90!=null&&(r+=h.my_prediction.points_earned??0,h.my_prediction.predicted_result===h.result_90&&o++)):h.status==="finished"&&h.result_90!=null&&l++);const f=20-d,p=o>=10?10:o>=9?5:o>=8?2:0,b=o>=10;function c(h){if(!h.result_90)return"—";const u={1:h.odds_1,X:h.odds_x,2:h.odds_2}[h.result_90];return u!=null?parseFloat(u).toFixed(2):"—"}function y(h,_){return _?h?h.predicted_result===_?`<span class="pts-label pts-label--win">+${L(h.points_earned??0)} pts</span>`:'<span class="pts-label pts-label--loss">0 pts</span>':'<span class="pts-label pts-label--penalty">-1 pt</span>':"—"}const $=i.map(h=>{const _=h.my_prediction?`${h.my_prediction.predicted_result} · ${h.my_prediction.units_wagered}u`:"—",u=h.rival_prediction?`${h.rival_prediction.predicted_result} · ${h.rival_prediction.units_wagered}u`:h.started?"—":"?",S=h.result_90!=null?`${h.home_score_90??"?"}–${h.away_score_90??"?"} (${h.result_90})`:"—";return`
      <tr>
        <td class="duelo-breakdown__teams">${N(h.home_logo,"sm")}${h.home_team} vs ${N(h.away_logo,"sm")}${h.away_team}</td>
        <td class="duelo-breakdown__odds">${c(h)}</td>
        <td class="duelo-breakdown__pick">${_}</td>
        <td class="duelo-breakdown__pick duelo-breakdown__pick--rival">${u}</td>
        <td class="duelo-breakdown__result">${S}</td>
        <td class="duelo-breakdown__pts">${y(h.my_prediction,h.result_90)}</td>
        <td class="duelo-breakdown__pts duelo-breakdown__pts--rival">${y(h.rival_prediction,h.result_90)}</td>
      </tr>
    `}).join(""),E=`
    <tr class="duelo-breakdown__footer-row">
      <td colspan="5" class="duelo-breakdown__total-label">Ganancias apuestas</td>
      <td class="duelo-breakdown__pts" colspan="2">+${L(r)} pts</td>
    </tr>
    <tr class="duelo-breakdown__footer-row">
      <td colspan="5" class="duelo-breakdown__total-label">Sin apostar (${f}u)</td>
      <td class="duelo-breakdown__pts" colspan="2">+${L(f)} pts</td>
    </tr>
    ${l>0?`
    <tr class="duelo-breakdown__footer-row">
      <td colspan="5" class="duelo-breakdown__total-label">Penalización (${l} partido${l>1?"s":""} sin pred.)</td>
      <td class="duelo-breakdown__pts duelo-breakdown__pts--penalty" colspan="2">−${l} pt${l>1?"s":""}</td>
    </tr>`:""}
    ${p>0?`
    <tr class="duelo-breakdown__footer-row">
      <td colspan="5" class="duelo-breakdown__total-label">
        ${b?"🎯 ¡Pleno! ":""}Bonus (${o}/10 aciertos)
      </td>
      <td class="duelo-breakdown__pts duelo-breakdown__pts--bonus" colspan="2">+${p} pts</td>
    </tr>`:""}
    <tr class="duelo-breakdown__footer-row duelo-breakdown__footer-row--total">
      <td colspan="5" class="duelo-breakdown__total-label">Total</td>
      <td class="duelo-breakdown__total-pts" colspan="2">${L(e.my_points)} pts</td>
    </tr>
  `,k=i.length>0?`
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
        <tbody>${$}</tbody>
        <tfoot>${E}</tfoot>
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

    ${k}

    <h2 class="section-title">Clasificación divisional</h2>
    <div id="divisionStandings"><div class="loading"><div class="loading__spinner"></div></div></div>
  `}function vt(){return`
    <div class="duelo-empty">
      <div class="duelo-empty__icon">🤝</div>
      <p class="duelo-empty__text">No tienes un duelo asignado esta jornada.</p>
    </div>
  `}async function Be(e,a,t){const s=document.getElementById("dueloTracker");if(!s){be();return}try{const{detail:n}=await m.duelo.detail(e);if(!n)return;s.innerHTML=gt(n,a,t)}catch{}}function gt(e,a,t){const{me:s,rival:n}=e;function i(o,r){return`
      <div class="duelo-tracker__col">
        <div class="duelo-tracker__player">${o}</div>
        <div class="duelo-tracker__pts">${L(r.estimated_points)}</div>
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
      ${i(t,n??{points_earned:0,units_at_stake:0,units_unbet:null,estimated_points:0})}
    </div>
    <div class="duelo-tracker__note">Actualizado hace unos segundos · se refresca cada minuto</div>
  `}function bt(e,a){var i;const t=(i=e.my_prediction)==null?void 0:i.predicted_result;let s,n;return e.started?e.rival_prediction?(s=e.rival_prediction.predicted_result,n=""):(s="—",n="duelo-pick__value--empty"):(s="?",n="duelo-pick__value--hidden"),`
    <div class="match-card duelo-pick-card">
      <div class="match-card__header">
        <span class="match-card__date">${M(e.match_datetime)}</span>
      </div>
      <div class="match-card__teams">
        <span class="team team--home">${e.home_team}${N(e.home_logo)}</span>
        <div class="match-card__score">
          ${e.status!=="scheduled"?`<span class="score">${e.home_score_90??"?"} - ${e.away_score_90??"?"}</span>`:'<span class="score score--dash">vs</span>'}
        </div>
        <span class="team team--away">${N(e.away_logo)}${e.away_team}</span>
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
  `}async function Te(e,a,t){const s=e.querySelector("#divisionStandings");if(s)try{const{standings:n}=await m.clasificacion.division(a);if(!n.length){s.innerHTML='<p class="empty">Sin clasificación disponible.</p>';return}s.innerHTML=`
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
    `}catch(n){s.innerHTML=`<p class="form__error">Error cargando la clasificación: ${n.message}</p>`}}async function ht(e,{query:a={}}={}){e.innerHTML='<div class="loading"><div class="loading__spinner"></div></div>';try{const{standings:t}=await m.clasificacion.general(),s=w.getUser(),i=new Date().getDay()===2?"total":"jornada";e.innerHTML=`
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
          <div class="ranking-subtabs">
            <button class="ranking-subtab ${i==="total"?"ranking-subtab--active":""}" data-subtab="total">Total</button>
            <button class="ranking-subtab ${i==="jornada"?"ranking-subtab--active":""}" data-subtab="jornada" id="subtabJornada">Jornada</button>
          </div>

          <div id="subpanelTotal" class="${i==="total"?"":"hidden"}">
            ${t.length===0?'<p class="empty">Todavía no hay clasificación disponible.</p>':`
                <div class="ranking-table-wrapper">
                  <table class="ranking-table">
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>Usuario</th>
                        <th title="Puntos de la jornada actual">Pts J.</th>
                        <th title="Puntos acumulados totales">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      ${t.map(o=>{var r,d;return`
                        <tr class="${s&&o.user_id===s.id?"ranking-table__row--me":""}">
                          <td class="ranking-table__pos" data-pos="${o.pos}">${o.pos}</td>
                          <td class="ranking-table__user-cell">
                            <span class="status-emoji" title="${((r=o.status)==null?void 0:r.name)||""}">${((d=o.status)==null?void 0:d.emoji)||""}</span>
                            ${o.is_bot||s&&o.user_id===s.id?`<span class="ranking-table__username">${W(o.username)}</span>`:`<button class="user-link ranking-table__username" data-user-id="${o.user_id}">${W(o.username)}</button>`}
                          </td>
                          <td class="ranking-table__stat">${L(o.pts_jornada_actual)}</td>
                          <td class="ranking-table__pts">${L(o.pts_general)}</td>
                        </tr>
                      `}).join("")}
                    </tbody>
                  </table>
                </div>
              `}
          </div>

          <div id="subpanelJornada" class="${i==="jornada"?"":"hidden"}">
            <div class="loading"><div class="loading__spinner"></div></div>
          </div>
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
        ${ee()}
      </div>
    `,$t(s,a.tab),ae(e),yt(),Ke(e,s),ft(e,s,i)}catch(t){e.innerHTML=`<div class="container"><p class="form__error">Error cargando la clasificación: ${t.message}</p></div>`}}function ft(e,a,t){let s=null,n=-1,i=!1;const o=e.querySelector('[data-subtab="total"]'),r=e.querySelector('[data-subtab="jornada"]'),d=e.querySelector("#subpanelTotal"),l=e.querySelector("#subpanelJornada");function f(c){o.classList.toggle("ranking-subtab--active",c==="total"),r.classList.toggle("ranking-subtab--active",c==="jornada"),d.classList.toggle("hidden",c!=="total"),l.classList.toggle("hidden",c!=="jornada"),c==="jornada"&&!i&&(i=!0,p())}async function p(){try{const{jornadas:c}=await m.clasificacion.jornadas();s=c.sort(($,E)=>$.number-E.number);const y=s.findIndex($=>$.status==="active");if(y>=0)n=y;else{for(let $=s.length-1;$>=0;$--)if(s[$].status==="finished"){n=$;break}n<0&&(n=s.length-1)}await b()}catch(c){l.innerHTML=`<p class="form__error">Error: ${c.message}</p>`}}async function b(){var y,$;if(!s||n<0)return;const c=s[n];l.innerHTML='<div class="loading"><div class="loading__spinner"></div></div>';try{const{standings:E,jornada_number:k,jornada_status:j}=await m.clasificacion.jornadaStandings(c.id),h=n>0,_=n<s.length-1;r.textContent=`J${k}`,l.innerHTML=`
        <div class="jornada-rank-nav">
          <button class="jornada-rank-nav__btn" id="jrNavPrev" ${h?"":"disabled"}>
            ← ${h?`J${s[n-1].number}`:""}
          </button>
          <span class="jornada-rank-nav__title">
            J${k}${j==="active"?" · en curso":""}
          </span>
          <button class="jornada-rank-nav__btn" id="jrNavNext" ${_?"":"disabled"}>
            ${_?`J${s[n+1].number}`:""} →
          </button>
        </div>
        <div class="ranking-table-wrapper">
          <table class="ranking-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Usuario</th>
                <th title="Puntos conseguidos en esta jornada">Pts</th>
              </tr>
            </thead>
            <tbody>
              ${E.map(u=>{var S,x;return`
                <tr class="${a&&u.user_id===a.id?"ranking-table__row--me":""}">
                  <td class="ranking-table__pos" data-pos="${u.pos}">${u.pos}</td>
                  <td class="ranking-table__user-cell">
                    <span class="status-emoji" title="${((S=u.status)==null?void 0:S.name)||""}">${((x=u.status)==null?void 0:x.emoji)||""}</span>
                    ${u.is_bot||a&&u.user_id===a.id?`<span class="ranking-table__username">${W(u.username)}</span>`:`<button class="user-link ranking-table__username" data-user-id="${u.user_id}">${W(u.username)}</button>`}
                  </td>
                  <td class="ranking-table__pts">${L(u.pts)}</td>
                </tr>
              `}).join("")}
            </tbody>
          </table>
        </div>
      `,(y=l.querySelector("#jrNavPrev"))==null||y.addEventListener("click",()=>{n>0&&(n--,b())}),($=l.querySelector("#jrNavNext"))==null||$.addEventListener("click",()=>{n<s.length-1&&(n++,b())}),Ke(l,a)}catch(E){l.innerHTML=`<p class="form__error">Error: ${E.message}</p>`}}o.addEventListener("click",()=>f("total")),r.addEventListener("click",()=>f("jornada")),f(t)}async function yt(){const e=document.getElementById("tablonTabDot");if(!e)return;if(!w.getUser()){e.classList.add("hidden");return}const t=localStorage.getItem("tablon_general_last_read")||new Date(0).toISOString();try{const{count:s}=await m.board.unread(null,t);e.classList.toggle("hidden",s===0)}catch{e.classList.add("hidden")}}function $t(e,a){const t={general:{btn:document.getElementById("tabGeneral"),panel:document.getElementById("panelGeneral")},miDivision:{btn:document.getElementById("tabMiDivision"),panel:document.getElementById("panelMiDivision")},divisiones:{btn:document.getElementById("tabDivisiones"),panel:document.getElementById("panelDivisiones")},tablon:{btn:document.getElementById("tabTablon"),panel:document.getElementById("panelTablon")}};function s(i){for(const[o,{btn:r,panel:d}]of Object.entries(t))r.classList.toggle("league-tab--active",o===i),d.classList.toggle("hidden",o!==i)}t.general.btn.addEventListener("click",()=>s("general")),t.miDivision.btn.addEventListener("click",()=>{s("miDivision"),t.miDivision.panel.dataset.loaded||(t.miDivision.panel.dataset.loaded="1",Et(e))}),t.divisiones.btn.addEventListener("click",()=>{s("divisiones"),t.divisiones.panel.dataset.loaded||(t.divisiones.panel.dataset.loaded="1",jt(e))});function n(){var i;s("tablon"),localStorage.setItem("tablon_general_last_read",new Date().toISOString()),(i=document.getElementById("tablonTabDot"))==null||i.classList.add("hidden"),document.dispatchEvent(new CustomEvent("tablon:read")),t.tablon.panel.dataset.loaded||(t.tablon.panel.dataset.loaded="1",_e(t.tablon.panel,{forceGeneral:!0}))}t.tablon.btn.addEventListener("click",n),a==="tablon"&&n()}async function Et(e){const a=document.getElementById("panelMiDivision");if(a)try{const{standings:t}=await m.clasificacion.division();if(t.length===0){a.innerHTML='<p class="empty">Todavía no perteneces a ninguna división.</p>';return}a.innerHTML=`
      <div class="ranking-table-wrapper">
        <table class="ranking-table">
          <thead>
            <tr><th>#</th><th>Usuario</th><th>PJ</th><th>G</th><th>E</th><th>P</th><th>Pts</th></tr>
          </thead>
          <tbody>
            ${t.map(s=>Ye(s,e)).join("")}
          </tbody>
        </table>
      </div>
    `}catch(t){a.innerHTML=`<p class="form__error">Error: ${t.message}</p>`}}async function jt(e){const a=document.getElementById("panelDivisiones");if(a)try{const{divisions:t}=await m.clasificacion.allDivisions();if(!t.length){a.innerHTML='<p class="empty">No hay divisiones activas.</p>';return}a.innerHTML=t.map(s=>wt(s,e)).join(""),a.querySelectorAll(".div-accordion__header").forEach(s=>{s.addEventListener("click",()=>{const i=s.nextElementSibling.classList.toggle("hidden");s.querySelector(".div-accordion__chevron").textContent=i?"▶":"▼"})})}catch(t){a.innerHTML=`<p class="form__error">Error: ${t.message}</p>`}}function wt(e,a){const t=e.standings.some(s=>a&&s.user_id===a.id);return`
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
              <tr><th>#</th><th>Usuario</th><th>PJ</th><th>G</th><th>E</th><th>P</th><th>Pts</th></tr>
            </thead>
            <tbody>
              ${e.standings.map(s=>Ye(s,a)).join("")}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `}function W(e){return String(e||"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;")}function Ke(e,a){let t=document.getElementById("userCtxMenu");t||(t=document.createElement("div"),t.id="userCtxMenu",t.className="user-ctx-menu hidden",t.innerHTML=`
      <a class="user-ctx-menu__item" id="ctxProfile" href="#">👤 Ver jugador</a>
      <button class="user-ctx-menu__item" id="ctxMessage">💬 Enviar mensaje</button>
    `,document.body.appendChild(t),document.addEventListener("click",s=>{!s.target.closest("#userCtxMenu")&&!s.target.closest(".user-link")&&t.classList.add("hidden")},!0)),e.addEventListener("click",s=>{const n=s.target.closest(".user-link");if(!n)return;s.stopPropagation();const i=n.dataset.userId,o=n.getBoundingClientRect();t.querySelector("#ctxProfile").href=`#/jugador/${i}`,t.querySelector("#ctxMessage").onclick=()=>{t.classList.add("hidden"),window.location.hash=`/mensajes/${i}`},t.classList.remove("hidden");const r=180;let d=o.left;d+r>window.innerWidth-8&&(d=window.innerWidth-r-8),t.style.top=`${o.bottom+window.scrollY+4}px`,t.style.left=`${d}px`})}function Ye(e,a){const t=a&&e.user_id===a.id,s=e.zone==="promotion"?"background:rgba(0,255,135,0.08)":e.zone==="relegation"?"background:rgba(255,56,96,0.08)":"";return`
    ${e.pos===5?'<tr class="div-separator div-separator--top"><td colspan="7"></td></tr>':e.pos===13?'<tr class="div-separator div-separator--bottom"><td colspan="7"></td></tr>':""}
    <tr class="${t?"ranking-table__row--me":""}" style="${s}">
      <td class="ranking-table__pos" data-pos="${e.pos}">${e.pos}</td>
      <td class="ranking-table__user-cell">${t||e.is_bot?`<span class="ranking-table__username">${W(e.username)}</span>`:`<button class="user-link ranking-table__username" data-user-id="${e.user_id}">${W(e.username)}</button>`}</td>
      <td class="ranking-table__stat">${e.pj}</td>
      <td class="ranking-table__stat">${e.g}</td>
      <td class="ranking-table__stat">${e.e}</td>
      <td class="ranking-table__stat">${e.p}</td>
      <td class="ranking-table__pts">${L(e.pts_division)}</td>
    </tr>
  `}async function Pe(e,{params:a={}}={}){const t=a.userId?parseInt(a.userId):null;t?await St(e,t):await Lt(e)}async function Lt(e){e.innerHTML='<div class="loading"><div class="loading__spinner"></div></div>';try{const{conversations:a}=await m.messages.list();e.innerHTML=`
      <div class="container">
        <h1 class="page-title">💬 Mensajes</h1>
        ${a.length===0?'<p class="empty">No tienes conversaciones aún. Pulsa el nombre de un jugador en la clasificación para enviar un mensaje.</p>':`<div class="mensajes-list">${a.map(kt).join("")}</div>`}
      </div>
    `,e.querySelectorAll(".mensajes-item").forEach(t=>{t.addEventListener("click",()=>{window.location.hash=`/mensajes/${t.dataset.userId}`})})}catch(a){e.innerHTML=`<div class="container"><p class="form__error">Error: ${a.message}</p></div>`}}function kt(e){return`
    <div class="mensajes-item" data-user-id="${e.user_id}" style="cursor:pointer">
      <div class="mensajes-item__avatar">${Z(e.username[0].toUpperCase())}</div>
      <div class="mensajes-item__info">
        <div class="mensajes-item__header">
          <strong class="mensajes-item__name">${Z(e.username)}</strong>
          ${e.unread_count>0?`<span class="mensajes-item__badge">${e.unread_count}</span>`:""}
        </div>
        <p class="mensajes-item__preview">${Z(e.last_message)}</p>
      </div>
    </div>
  `}async function St(e,a){var s;e.innerHTML='<div class="loading"><div class="loading__spinner"></div></div>';const t=w.getUser();try{const{messages:n,partner:i}=await m.messages.get(a);document.dispatchEvent(new CustomEvent("messages:read")),e.innerHTML=`
      <div class="container">
        <div class="chat-header">
          <a href="#/mensajes" class="btn btn--ghost btn--sm">← Volver</a>
          <h2 class="chat-header__name">${Z((i==null?void 0:i.username)||"Usuario")}</h2>
        </div>

        <div class="chat-messages" id="chatMessages">
          ${n.length===0?'<p class="empty" style="text-align:center">Empieza la conversación.</p>':n.map(r=>Me(r,t)).join("")}
        </div>

        <form class="chat-input" id="chatForm">
          <textarea class="form__textarea chat-input__textarea" id="chatMsg"
            placeholder="Escribe un mensaje…" maxlength="1000" rows="2" required></textarea>
          <button class="btn btn--primary chat-input__btn" type="submit">Enviar</button>
        </form>
      </div>
    `;const o=document.getElementById("chatMessages");o&&(o.scrollTop=o.scrollHeight),(s=document.getElementById("chatForm"))==null||s.addEventListener("submit",async r=>{r.preventDefault();const d=document.getElementById("chatMsg"),l=d.value.trim();if(!l)return;const f=r.target.querySelector('button[type="submit"]');f.disabled=!0;try{const{message:p}=await m.messages.send(a,l);d.value="";const b=document.getElementById("chatMessages"),c=b==null?void 0:b.querySelector(".empty");c&&c.remove(),b==null||b.insertAdjacentHTML("beforeend",Me(p,t)),b&&(b.scrollTop=b.scrollHeight)}catch(p){g(p.message,"error")}finally{f.disabled=!1}})}catch(n){e.innerHTML=`<div class="container"><p class="form__error">Error: ${n.message}</p></div>`}}function Me(e,a){return`
    <div class="chat-message ${a&&e.sender_id===a.id?"chat-message--sent":"chat-message--received"}">
      <div class="chat-message__bubble">${Z(e.message)}</div>
      <div class="chat-message__time">${M(e.created_at)}</div>
    </div>
  `}function Z(e){return String(e||"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;")}const De=e=>()=>{window.location.hash=e},It={"/":oa,"/login":pa,"/register":_a,"/quiniela":De("/jornada"),"/resultados":De("/tabla-v2"),"/ranking":ga,"/tablon":_e,"/ligas":ha,"/ligas/:id":ya,"/perfil":Ea,"/campeon":Ia,"/admin":xa,"/forgot-password":Va,"/reset-password":Wa,"/unirse":Xa,"/jugador/:id":Ya,"/jornada":Qa,"/duelo":mt,"/tabla-v2":ht,"/mensajes":Pe,"/mensajes/:userId":Pe};function xt(e){for(const[a,t]of Object.entries(It)){const s=[],n=new RegExp("^"+a.replace(/:([^/]+)/g,(o,r)=>(s.push(r),"([^/]+)"))+"$"),i=e.match(n);if(i){const o={};return s.forEach((r,d)=>{o[r]=i[d+1]}),{handler:t,params:o}}}return null}const qe=()=>document.getElementById("mainContent"),I={init(){window.addEventListener("hashchange",()=>this.resolve()),this.resolve()},navigate(e){window.location.hash=e},resolve(){const e=window.location.hash.slice(1)||"/",[a,t]=e.split("?"),s=Object.fromEntries(new URLSearchParams(t||"")),n=xt(a);if(!n){qe().innerHTML='<div class="error-page"><h2>Página no encontrada</h2><a href="#/">Volver al inicio</a></div>';return}const{handler:i,params:o}=n;if(["/perfil","/admin","/jornada","/duelo","/tabla-v2","/mensajes"].includes(a)&&!w.isLoggedIn()){this.navigate("/login");return}if(a==="/admin"&&!w.isAdmin()){this.navigate("/");return}const d=qe();d.innerHTML='<div class="loading"><div class="loading__spinner"></div></div>',i(d,{params:o,query:s})}};let K=[],V=null,z=null,oe=!1;async function Ct(){document.documentElement.dataset.build="2026-11-23T22",await w.init(),I.init(),Pt(),Bt(),qt()}function Ze(){return localStorage.getItem("pwa_installed")==="true"||window.matchMedia("(display-mode: standalone)").matches||window.navigator.standalone===!0}function Bt(){window.addEventListener("beforeinstallprompt",e=>{e.preventDefault(),!Ze()&&(V=e,Tt())}),window.addEventListener("appinstalled",()=>{var e;localStorage.setItem("pwa_installed","true"),V=null,(e=document.getElementById("installBanner"))==null||e.remove()})}function Tt(){if(Ze()||sessionStorage.getItem("installBannerDismissed"))return;const e=document.createElement("div");e.id="installBanner",e.className="install-banner",e.innerHTML=`
    <span class="install-banner__text">📱 Instala PickGoal en tu móvil</span>
    <div class="install-banner__actions">
      <button class="install-banner__btn install-banner__btn--primary" id="installBtn">Instalar</button>
      <button class="install-banner__btn install-banner__btn--ghost" id="installDismissBtn">Ahora no</button>
    </div>
  `,document.body.appendChild(e),document.getElementById("installBtn").addEventListener("click",async()=>{V&&(V.prompt(),await V.userChoice,V=null,e.remove())}),document.getElementById("installDismissBtn").addEventListener("click",()=>{sessionStorage.setItem("installBannerDismissed","1"),e.remove()})}function R(){var e,a;(e=document.getElementById("userDropdown"))==null||e.classList.add("hidden"),(a=document.getElementById("userBtn"))==null||a.classList.remove("navbar__dropdown-btn--open")}async function Q(){const e=document.getElementById("perfilBadge"),a=document.getElementById("navMensajesDot");if(!w.getUser()){e==null||e.classList.add("hidden"),a==null||a.classList.add("hidden");return}try{const s=localStorage.getItem("tablon_general_last_read")||new Date(0).toISOString(),[n,i]=await Promise.all([m.board.mentions(s).catch(d=>(console.warn("[perfilBadge] mentions error:",d),{count:0})),m.messages.unread().catch(d=>(console.warn("[perfilBadge] pm unread error:",d),{count:0}))]),o=n.count||0,r=i.count||0;console.log("[perfilBadge] mentions:",o,"pm:",r),e==null||e.classList.toggle("hidden",o+r===0),a==null||a.classList.toggle("hidden",r===0)}catch(s){console.warn("[perfilBadge] error:",s),e==null||e.classList.add("hidden"),a==null||a.classList.add("hidden")}}async function re(){const e=document.getElementById("tablonBadge");if(!e)return;if(!w.getUser()){e.classList.add("hidden");return}const t=localStorage.getItem("tablon_general_last_read")||new Date(0).toISOString();try{const{count:s}=await m.board.unread(null,t);s>0?(e.textContent=s>99?"99+":String(s),e.classList.remove("hidden")):e.classList.add("hidden")}catch{e.classList.add("hidden")}}function Pt(){var e,a,t,s;document.addEventListener("auth:change",He),window.addEventListener("hashchange",()=>{R(),Qe(),setTimeout(re,200),setTimeout(Q,200)}),document.addEventListener("tablon:read",()=>{Q(),re()}),document.addEventListener("messages:read",()=>{Q()}),document.addEventListener("click",R),(e=document.getElementById("userBtn"))==null||e.addEventListener("click",n=>{var r;n.stopPropagation();const i=document.getElementById("userDropdown"),o=i==null?void 0:i.classList.contains("hidden");R(),o&&(i==null||i.classList.remove("hidden"),(r=document.getElementById("userBtn"))==null||r.classList.add("navbar__dropdown-btn--open"))}),(a=document.getElementById("userDropdown"))==null||a.addEventListener("click",n=>{n.stopPropagation(),n.target.closest("#navProfileLink")&&R()}),(t=document.getElementById("navMensajesLink"))==null||t.addEventListener("click",async n=>{n.preventDefault(),n.stopPropagation(),R(),oe?pe():await Ht()}),document.addEventListener("click",n=>{oe&&!n.target.closest("#notifPanel")&&!n.target.closest("#navMensajesLink")&&pe()}),(s=document.getElementById("navLogoutBtn"))==null||s.addEventListener("click",()=>{K=[],localStorage.removeItem("activeLeagueId"),R(),w.logout(),I.navigate("/")}),He()}async function He(){var i;const e=document.getElementById("navAuthLinks"),a=document.getElementById("userBtn"),t=document.getElementById("navUsername"),s=document.getElementById("bottomNav"),n=w.getUser();if(R(),n){e==null||e.classList.add("hidden"),t&&(t.textContent=n.username),a.style.visibility="visible",console.log("[navbar] userBtn visibility:",a.style.visibility,"computed:",getComputedStyle(a).visibility,"offsetWidth:",a.offsetWidth,"right rect:",a.getBoundingClientRect().right),s==null||s.classList.remove("hidden"),document.body.classList.add("has-bottom-nav"),(i=document.getElementById("navAdminLink"))==null||i.classList.toggle("hidden",!n.is_admin);try{const{leagues:o}=n.is_admin?await m.leagues.adminAll():await m.leagues.my();K=o}catch{K=[]}Mt(K),re(),Q(),z&&clearInterval(z),z=setInterval(()=>{re(),Q()},5*60*1e3)}else e==null||e.classList.remove("hidden"),a.style.visibility="hidden",s==null||s.classList.add("hidden"),document.body.classList.remove("has-bottom-nav"),K=[],localStorage.removeItem("activeLeagueId"),z&&(clearInterval(z),z=null);Qe()}function Mt(e){const a=localStorage.getItem("activeLeagueId");a&&e.some(s=>String(s.id)===String(a))||(e.length>0?localStorage.setItem("activeLeagueId",String(e[0].id)):localStorage.removeItem("activeLeagueId"))}function Qe(){const e=window.location.hash.slice(1).split("?")[0]||"/";document.querySelectorAll(".bottom-nav__item").forEach(a=>{const t=a.dataset.route,s=t==="/"?e==="/":e===t||e.startsWith(t+"/");a.classList.toggle("bottom-nav__item--active",s)})}function Dt(e){const a="=".repeat((4-e.length%4)%4),t=(e+a).replace(/-/g,"+").replace(/_/g,"/"),s=atob(t);return Uint8Array.from([...s].map(n=>n.charCodeAt(0)))}async function qt(){if(!(!("serviceWorker"in navigator)||!("PushManager"in window)))try{const e=await navigator.serviceWorker.register("/sw.js");document.addEventListener("auth:change",async a=>{a.detail&&await Ae(e)}),w.getUser()&&await Ae(e)}catch{}}async function Ae(e){try{if(await Notification.requestPermission()!=="granted")return;const t=await e.pushManager.getSubscription();if(t){await m.notifications.subscribe(t.toJSON());return}const{public_key:s}=await m.notifications.vapidPublicKey();if(!s)return;const n=await e.pushManager.subscribe({userVisibleOnly:!0,applicationServerKey:Dt(s)});await m.notifications.subscribe(n.toJSON())}catch{}}function pe(){var e;(e=document.getElementById("notifPanel"))==null||e.classList.add("hidden"),oe=!1}async function Ht(){const e=document.getElementById("notifPanel"),a=document.getElementById("notifPanelBody");if(!(!e||!a)){oe=!0,e.classList.remove("hidden"),a.innerHTML='<div class="loading"><div class="loading__spinner"></div></div>';try{const t=new Date(Date.now()-2592e6).toISOString(),[s,n,i]=await Promise.all([m.messages.list().catch(()=>({conversations:[]})),m.board.messages(1,null).catch(()=>({messages:[]})),m.board.mentions(t).catch(()=>({messages:[]}))]),o=(s.conversations||[]).slice(0,5),r=(n.messages||[]).slice(0,5),d=new Set((i.messages||[]).map(l=>l.id));a.innerHTML=At(o,r,d),a.querySelectorAll(".notif-item[data-nav]").forEach(l=>{l.addEventListener("click",()=>{pe(),window.location.hash=l.dataset.nav})})}catch{a.innerHTML='<p class="notif-panel__empty">Error cargando notificaciones</p>'}}}function At(e,a,t){const s=e.length===0?'<p class="notif-panel__empty">Aún no tienes mensajes</p>':e.map(i=>`
        <div class="notif-item" data-nav="/mensajes/${i.user_id}">
          <div class="notif-item__avatar">${G(i.username[0].toUpperCase())}</div>
          <div class="notif-item__content">
            <div class="notif-item__header">
              <strong class="notif-item__name">${G(i.username)}</strong>
              ${i.unread_count>0?`<span class="notif-item__badge">${i.unread_count}</span>`:""}
            </div>
            <p class="notif-item__text">${G((i.last_message||"").slice(0,70))}${(i.last_message||"").length>70?"…":""}</p>
          </div>
        </div>
      `).join("")+'<a class="notif-panel__link" href="#/mensajes">Ver todos los mensajes →</a>',n=a.length===0?'<p class="notif-panel__empty">Aún no hay mensajes en el tablón</p>':a.map(i=>{const o=t.has(i.id);return`
          <div class="notif-item${o?" notif-item--notable":""}" data-nav="/tabla-v2?tab=tablon">
            <div class="notif-item__avatar">${G(i.username[0].toUpperCase())}</div>
            <div class="notif-item__content">
              <div class="notif-item__header">
                <strong class="notif-item__name">${G(i.username)}</strong>
                ${o?'<span class="notif-item__mention">@tú / admin</span>':""}
                <span class="notif-item__time">${M(i.created_at)}</span>
              </div>
              <p class="notif-item__text">${G((i.message||"").slice(0,80))}${(i.message||"").length>80?"…":""}</p>
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
  `}function G(e){return String(e||"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;")}Ct();
