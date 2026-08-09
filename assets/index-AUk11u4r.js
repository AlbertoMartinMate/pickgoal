(function(){const a=document.createElement("link").relList;if(a&&a.supports&&a.supports("modulepreload"))return;for(const n of document.querySelectorAll('link[rel="modulepreload"]'))s(n);new MutationObserver(n=>{for(const i of n)if(i.type==="childList")for(const o of i.addedNodes)o.tagName==="LINK"&&o.rel==="modulepreload"&&s(o)}).observe(document,{childList:!0,subtree:!0});function t(n){const i={};return n.integrity&&(i.integrity=n.integrity),n.referrerPolicy&&(i.referrerPolicy=n.referrerPolicy),n.crossOrigin==="use-credentials"?i.credentials="include":n.crossOrigin==="anonymous"?i.credentials="omit":i.credentials="same-origin",i}function s(n){if(n.ep)return;n.ep=!0;const i=t(n);fetch(n.href,i)}})();const De="https://pickgoal-backend.onrender.com/api";function He(){return localStorage.getItem("token")}async function m(e,a={}){const t={"Content-Type":"application/json",...a.headers},s=He();s&&(t.Authorization=`Bearer ${s}`);const n=await fetch(`${De}${e}`,{...a,headers:t}),i=await n.json().catch(()=>({}));if(!n.ok)throw{status:n.status,message:i.error||"Error desconocido"};return i}const l={get:e=>m(e),post:(e,a)=>m(e,{method:"POST",body:JSON.stringify(a)}),patch:(e,a)=>m(e,{method:"PATCH",body:JSON.stringify(a)}),delete:e=>m(e,{method:"DELETE"}),auth:{register:e=>m("/auth/register",{method:"POST",body:JSON.stringify(e)}),login:e=>m("/auth/login",{method:"POST",body:JSON.stringify(e)}),me:()=>m("/auth/me"),forgotPassword:e=>m("/auth/forgot-password",{method:"POST",body:JSON.stringify({email:e})}),resetPassword:(e,a)=>m("/auth/reset-password",{method:"POST",body:JSON.stringify({token:e,password:a})}),ranking:e=>m(`/auth/ranking${e?`?league_id=${e}`:""}`),deleteAccount:()=>m("/auth/account",{method:"DELETE"}),users:()=>m("/auth/users"),usersForMentions:()=>m("/auth/users/for-mentions"),toggleAdmin:e=>m(`/auth/users/${e}/toggle-admin`,{method:"PATCH"}),toggleMute:e=>m(`/auth/users/${e}/toggle-mute`,{method:"PATCH"}),updateEmail:e=>m("/auth/me/email",{method:"PATCH",body:JSON.stringify({email:e})})},matches:{grouped:()=>m("/matches/grouped"),list:(e="")=>m(`/matches/${e}`),get:e=>m(`/matches/${e}`),today:()=>m("/matches/today"),setResult:(e,a,t,s=null)=>m(`/matches/${e}/result`,{method:"PATCH",body:JSON.stringify({home_score:a,away_score:t,...s?{result_90:s}:{}})}),sync:()=>m("/matches/sync",{method:"POST"}),recalculate:()=>m("/matches/recalculate",{method:"POST"})},predictions:{mine:e=>m(`/predictions/${e?`?league_id=${e}`:""}`),forMatch:(e,a)=>m(`/predictions/match/${e}${a?`?league_id=${a}`:""}`),save:e=>m("/predictions/",{method:"POST",body:JSON.stringify(e)}),forUser:(e,a)=>m(`/predictions/user/${e}${a?`?league_id=${a}`:""}`),getChampion:e=>m(`/predictions/champion${e?`?league_id=${e}`:""}`),saveChampion:(e,a)=>m("/predictions/champion",{method:"POST",body:JSON.stringify({team_name:e,league_id:a??null})}),awardChampion:e=>m("/predictions/champion/award",{method:"POST",body:JSON.stringify({team_name:e})})},leagues:{all:()=>m("/leagues/all"),public:()=>m("/leagues/public"),my:()=>m("/leagues/my"),create:e=>m("/leagues/",{method:"POST",body:JSON.stringify(e)}),join:e=>m("/leagues/join",{method:"POST",body:JSON.stringify(e)}),joinByCode:e=>m(`/leagues/join/${encodeURIComponent(e)}`),adminAll:()=>m("/leagues/admin"),get:e=>m(`/leagues/${e}`),update:(e,a)=>m(`/leagues/${e}`,{method:"PUT",body:JSON.stringify(a)}),leave:e=>m(`/leagues/${e}/leave`,{method:"DELETE"}),members:e=>m(`/leagues/${e}/members`),matchPredictions:(e,a)=>m(`/leagues/${e}/predictions/${a}`)},home:{summary:()=>m("/home/summary")},board:{messages:(e=1,a=null)=>m(`/board/?page=${e}${a?`&league_id=${a}`:""}`),unread:(e,a)=>m(`/board/unread?${e?`league_id=${e}&`:""}since=${encodeURIComponent(a)}`),post:(e,a=null)=>m("/board/",{method:"POST",body:JSON.stringify({message:e,league_id:a})}),pin:e=>m(`/board/${e}/pin`,{method:"POST"}),reply:(e,a)=>m(`/board/${e}/reply`,{method:"POST",body:JSON.stringify({message:a})}),delete:e=>m(`/board/${e}`,{method:"DELETE"}),mentions:e=>m(`/board/mentions?since=${encodeURIComponent(e)}`)},notifications:{vapidPublicKey:()=>m("/notifications/vapid-public-key"),subscribe:e=>m("/notifications/subscribe",{method:"POST",body:JSON.stringify(e)}),send:e=>m("/notifications/send",{method:"POST",body:JSON.stringify(e)})},adminV2:{partidos:e=>m(`/v2/admin/partidos-disponibles?semana=${encodeURIComponent(e)}`),jornadas:()=>m("/v2/admin/jornadas"),createJornada:e=>m("/v2/admin/jornada",{method:"POST",body:JSON.stringify(e)}),updateJornada:(e,a)=>m(`/v2/admin/jornada/${e}`,{method:"PUT",body:JSON.stringify(a)}),deleteJornada:e=>m(`/v2/admin/jornada/${e}`,{method:"DELETE"}),publishJornada:e=>m(`/v2/admin/jornada/${e}/publish`,{method:"POST"})},jornada:{info:()=>m("/v2/jornada/info"),current:()=>m("/v2/jornada/current"),list:()=>m("/v2/jornada/list"),predict:e=>m("/v2/jornada/predict",{method:"POST",body:JSON.stringify(e)}),history:()=>m("/v2/jornada/history")},duelo:{current:()=>m("/v2/duelo/current")},messages:{unread:()=>m("/messages/unread"),list:()=>m("/messages/"),get:e=>m(`/messages/${e}`),send:(e,a)=>m(`/messages/${e}`,{method:"POST",body:JSON.stringify({message:a})}),markAllRead:()=>m("/messages/mark-all-read",{method:"PATCH"})},clasificacion:{division:e=>m(`/v2/clasificacion/division${e?`?league_id=${e}`:""}`),general:()=>m("/v2/clasificacion/general"),allDivisions:()=>m("/v2/clasificacion/all-divisions")}};let D=null;const y={async init(){if(localStorage.getItem("token"))try{const{user:a}=await l.auth.me();D=a}catch{localStorage.removeItem("token")}},setUser(e,a){D=e,localStorage.setItem("token",a),document.dispatchEvent(new CustomEvent("auth:change",{detail:e}))},logout(){D=null,localStorage.removeItem("token"),document.dispatchEvent(new CustomEvent("auth:change",{detail:null}))},getUser(){return D},isLoggedIn(){return!!D},isAdmin(){return(D==null?void 0:D.is_admin)===!0}};let ae=null;function g(e,a="success"){let t=document.getElementById("toast");t||(t=document.createElement("div"),t.id="toast",document.body.appendChild(t)),t.textContent=e,t.className=`toast toast--${a} toast--visible`,ae&&clearTimeout(ae),ae=setTimeout(()=>{t.classList.remove("toast--visible")},3e3)}function qe(){return`
    <div class="container">
      <div class="league-gate">
        <div class="league-gate__icon">⚽</div>
        <h2 class="league-gate__title">¡Inicia tu Liga!</h2>
        <p class="league-gate__text">Únete a una liga para empezar a predecir</p>
        <a href="#/ligas" class="btn btn--primary">Ver ligas disponibles</a>
      </div>
    </div>
  `}function ce(){return`
    <div class="points-modal" id="pointsModal" aria-hidden="true">
      <div class="points-modal__overlay" id="pointsOverlay"></div>
      <div class="points-modal__box" role="dialog" aria-modal="true" aria-label="Sistema de puntos">
        <button class="points-modal__close" id="pointsClose" aria-label="Cerrar">✕</button>

        <h2 class="points-modal__heading">📊 Sistema de puntos</h2>

        <div class="points-modal__section">
          <h3 class="points-modal__subheading">Fase de grupos</h3>
          <ul class="points-modal__list">
            <li><span class="pts-tag">+1</span> por acertar el resultado 1X2</li>
            <li><span class="pts-tag">+1</span> extra por acertar el marcador exacto</li>
            <li class="points-modal__note">Máximo 2 puntos por partido</li>
          </ul>
        </div>

        <div class="points-modal__section">
          <h3 class="points-modal__subheading">Eliminatorias (desde dieciseisavos)</h3>
          <ul class="points-modal__list">
            <li>El <strong>1X2</strong> se refiere al resultado <strong>a 90 minutos</strong> — puede haber empate (el partido continúa en prórroga o penaltis)</li>
            <li>El <strong>marcador exacto</strong> tiene en cuenta prórroga y penaltis: si el partido acaba 2-2 y gana el local en penaltis, el resultado de quiniela es <strong>3-2</strong> (el ganador suma 1 gol simbólico)</li>
          </ul>
          <div class="points-modal__example">
            <span class="points-modal__example-label">Ejemplo</span>
            Predices 2-3 → el visitante gana en penaltis desde 1-1 → resultado quiniela: 1-2 → no acertaste el exacto
          </div>
        </div>

        <div class="points-modal__section">
          <h3 class="points-modal__subheading">Puntos por fase</h3>
          <div class="points-modal__phases">
            ${[["Grupos","1+1"],["Dieciseisavos","2+2"],["Octavos","3+3"],["Cuartos","4+4"],["Semis","5+5"],["3º y 4º","5+5"],["Final","6+6"]].map(([e,a])=>`
              <div class="points-modal__phase-pill">
                <span class="points-modal__phase-name">${e}</span>
                <span class="points-modal__phase-pts">${a}</span>
              </div>`).join("")}
          </div>
        </div>

        <div class="points-modal__section">
          <h3 class="points-modal__subheading">Campeón del Mundial</h3>
          <ul class="points-modal__list">
            <li><span class="pts-tag pts-tag--gold">+10</span> puntos extra por acertar el campeón</li>
            <li class="points-modal__note">Solo se puede predecir antes del inicio del torneo, o una vez si te unes con el torneo ya empezado</li>
          </ul>
        </div>

        <div class="points-modal__max">
          <span class="points-modal__max-label">Puntuación máxima posible</span>
          <span class="points-modal__max-val">292 pts</span>
        </div>

        <div class="points-modal__section">
          <h3 class="points-modal__subheading">Desempate</h3>
          <ol class="points-modal__list points-modal__list--ordered">
            <li>Quién acertó el campeón del Mundial</li>
            <li>Más resultados exactos en total</li>
            <li>Resultados exactos por fase (Final › Semis › Cuartos…)</li>
            <li>Fecha de registro — quien antes se registró</li>
          </ol>
        </div>
      </div>
    </div>
  `}function ue(e){const a=e.querySelector("#pointsModal"),t=e.querySelector("#btnPointsInfo"),s=e.querySelector("#pointsClose"),n=e.querySelector("#pointsOverlay");function i(){a.classList.add("points-modal--open"),document.body.style.overflow="hidden"}function o(){a.classList.remove("points-modal--open"),document.body.style.overflow=""}return t==null||t.addEventListener("click",i),s==null||s.addEventListener("click",o),n==null||n.addEventListener("click",o),document.addEventListener("keydown",d=>{d.key==="Escape"&&o()},{once:!1}),i}function T(e){return e?new Date(e).toLocaleString("es-ES",{day:"2-digit",month:"2-digit",year:"numeric",hour:"2-digit",minute:"2-digit"}):"—"}async function Ae(e){if(!y.getUser()){Ne(e);return}e.innerHTML='<div class="loading"><div class="loading__spinner"></div></div>';try{const{leagues_summary:t,division_summary:s,upcoming_matches:n}=await l.home.summary();if(s){e.innerHTML=`
        <div class="home-dashboard container">
          <div class="home-dashboard__topbar">
            <button class="btn btn--ghost btn--sm" id="btnPointsInfo">📊 Sistema de puntos</button>
          </div>
          ${Ue(s)}
          ${ze()}
          ${me(n)}
        </div>
        ${ce()}
      `,ue(e);return}if(!t||t.length===0){Oe(e);return}const i=(()=>{const d=localStorage.getItem("activeLeagueId");return d?parseInt(d):null})(),o=[...t].sort((d,c)=>d.league_id===i?-1:c.league_id===i?1:0);e.innerHTML=`
      <div class="home-dashboard container">
        <div class="home-dashboard__topbar">
          <button class="btn btn--ghost btn--sm" id="btnPointsInfo">📊 Sistema de puntos</button>
        </div>

        <h3 class="home-dashboard__section-title">Mis ligas</h3>
        <div class="home-dashboard__leagues">
          ${o.map(d=>Je(d)).join("")}
        </div>

        <div class="home-dashboard__create">
          <a href="#/ligas" class="btn btn--ghost btn--sm">+ Crear liga privada</a>
        </div>

        ${me(n)}
      </div>
      ${ce()}
    `,ue(e),e.querySelectorAll(".league-card[data-league-id]").forEach(d=>{d.style.cursor="pointer",d.addEventListener("click",c=>{c.target.closest("[data-go-ranking]")||c.target.closest("a")||(localStorage.setItem("activeLeagueId",d.dataset.leagueId),j.navigate(`/ligas/${d.dataset.leagueId}`))})}),e.querySelectorAll("[data-go-ranking]").forEach(d=>{d.addEventListener("click",c=>{c.stopPropagation(),localStorage.setItem("activeLeagueId",d.dataset.goRanking),j.navigate("/ranking")})})}catch(t){e.innerHTML=`<div class="container"><p class="form__error">Error cargando el inicio: ${t.message}</p></div>`}}async function Ne(e){const t=new Date>=new Date("2026-08-15T00:00:00Z");let s=null;if(t)try{s=await l.jornada.info()}catch{}e.innerHTML=`
    <section class="hero">
      <div class="hero__content">
        <img src="/assets/logo-completo.jpg" alt="PickGoal" class="hero__logo-img" />
        <div class="hero__cta">
          <a href="#/register" class="btn btn--primary btn--lg">Registrarse</a>
          <a href="#/login" class="btn btn--ghost btn--lg">Ya tengo cuenta</a>
        </div>
      </div>
    </section>

    <div class="container">
      ${we(s,t)}
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
  `}function Oe(e){e.innerHTML=`
    <div class="home-dashboard container">
      ${we()}
    </div>
  `}function Ue(e){const a={promotion:"⬆️ Zona ascenso",relegation:"⬇️ Zona descenso",mid:""},t=a[e.zone]?`<span class="div-card__zone div-card__zone--${e.zone}">${a[e.zone]}</span>`:"";return`
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
          <span class="div-card__pts-val">${e.pts_division}</span>
          <span class="div-card__pts-label">pts división</span>
        </div>
      </div>
      <div class="div-card__record">
        <div class="div-card__stat"><span>${e.pj}</span><small>PJ</small></div>
        <div class="div-card__stat"><span>${e.g}</span><small>G</small></div>
        <div class="div-card__stat"><span>${e.e}</span><small>E</small></div>
        <div class="div-card__stat"><span>${e.p}</span><small>P</small></div>
        <div class="div-card__stat div-card__stat--general"><span>${e.pts_general}</span><small>Pts total</small></div>
      </div>
      <div class="div-card__actions">
        <a href="#/jornada" class="btn btn--primary btn--sm">Predecir jornada</a>
        <a href="#/tabla-v2" class="btn btn--ghost btn--sm">Ver tabla</a>
      </div>
    </div>
  `}function Re(e){const a=new Date,t=new Date(e),s=Math.ceil((t-a)/(1e3*60*60*24));return Math.max(0,s)}function we(e=null,a=!1){let t,s;if(a&&(e!=null&&e.jornada_number))s="Temporada 26/27 · En curso",t=`
      <div class="pg-league-card__jornada">
        <span class="pg-league-card__jornada-num">J${e.jornada_number}</span>
        <span class="pg-league-card__jornada-label">jornada actual</span>
      </div>`;else if(a)s="Temporada 26/27 · En curso",t='<div class="pg-league-card__countdown pg-league-card__countdown--soon">Temporada en curso</div>';else{const n=Re("2026-08-15");s="Temporada 26/27 · Próximamente",t=n>0?`<div class="pg-league-card__countdown">
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
  `}function Je(e){const a=e.next_to_predict?`<div class="league-card__next">
         <span class="league-card__next-label">Próximo a predecir</span>
         <span class="league-card__next-match">${e.next_to_predict.home_team} vs ${e.next_to_predict.away_team}</span>
         <span class="league-card__next-date">${T(e.next_to_predict.match_datetime)}</span>
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
          <span class="league-card__stat-val">${e.total_points}</span>
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
  `}function me(e){return e.length?`
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
              <span class="upcoming-match__date">${T(a.match_datetime)}</span>
              ${t?'<span class="upcoming-match__badge upcoming-match__badge--done">Predicho</span>':'<span class="upcoming-match__badge upcoming-match__badge--pending">Sin predecir</span>'}
            </div>
          </div>
        `).join("")}
      </div>
      <a class="btn btn--ghost btn--sm" href="#/jornada">Ver jornada actual</a>
    </section>
  `:""}function ze(){return`
    <div class="prize-banner">
      <span class="prize-banner__icon">🏆</span>
      <div>
        <strong>Premio temporada 26/27</strong>
        <p>Camiseta de tu equipo favorito para el campeón de la clasificación general</p>
      </div>
    </div>
  `}const pe="pickgoal_welcome_shown";function je(e="/jornada"){if(localStorage.getItem(pe))return;localStorage.setItem(pe,"1");const a=document.createElement("div");a.innerHTML=`
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
  `;const t=a.firstElementChild;document.body.appendChild(t),document.body.style.overflow="hidden",requestAnimationFrame(()=>t.classList.add("welcome-modal--open"));function s(n){t.classList.remove("welcome-modal--open"),document.body.style.overflow="",t.addEventListener("transitionend",()=>t.remove(),{once:!0}),n&&(window.location.hash=n)}document.getElementById("welcomeOverlay").addEventListener("click",()=>s()),document.getElementById("welcomeCta").addEventListener("click",()=>s(e)),document.addEventListener("keydown",function n(i){i.key==="Escape"&&(s(),document.removeEventListener("keydown",n))})}function Fe(e){e.innerHTML=`
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
  `,document.getElementById("loginForm").addEventListener("submit",async a=>{a.preventDefault();const t=document.getElementById("loginBtn"),s=document.getElementById("loginError"),n=document.getElementById("identifier").value.trim(),i=document.getElementById("password").value;t.disabled=!0,t.textContent="Entrando…",s.classList.add("hidden");try{const{token:o,user:d}=await l.auth.login({identifier:n,password:i});y.setUser(d,o),g(`¡Bienvenido, ${d.username}!`),j.navigate("/"),je("/")}catch(o){s.textContent=o.message||"Error al iniciar sesión",s.classList.remove("hidden")}finally{t.disabled=!1,t.textContent="Entrar"}})}function Ge(e){e.innerHTML=`
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
  `,document.getElementById("registerForm").addEventListener("submit",async a=>{a.preventDefault();const t=document.getElementById("registerBtn"),s=document.getElementById("registerError");t.disabled=!0,t.textContent="Creando cuenta…",s.classList.add("hidden");const n={username:document.getElementById("username").value.trim(),email:document.getElementById("email").value.trim(),country:document.getElementById("country").value.trim(),password:document.getElementById("password").value};try{const{token:i,user:o}=await l.auth.register(n);y.setUser(o,i),g("¡Cuenta creada! Bienvenido a PickGoal");const d=sessionStorage.getItem("pendingInviteCode");if(d){sessionStorage.removeItem("pendingInviteCode");try{const{league:c}=await l.leagues.joinByCode(d);g(`¡Te has unido a "${c.name}"!`),j.navigate(`/ligas/${c.id}`)}catch{j.navigate("/ligas")}}else j.navigate("/"),je("/")}catch(i){s.textContent=i.message||"Error al registrarse",s.classList.remove("hidden")}finally{t.disabled=!1,t.textContent="Crear cuenta"}})}function Ve(){const e=localStorage.getItem("activeLeagueId");return e?parseInt(e):null}async function We(e){var a,t;e.innerHTML='<div class="loading"><div class="loading__spinner"></div></div>';try{if(y.isLoggedIn()){const{leagues:v}=await l.leagues.my();if(v.length===0){e.innerHTML=qe();return}}const s=Ve(),[{ranking:n},i]=await Promise.all([l.auth.ranking(s),y.isLoggedIn()?l.leagues.my():Promise.resolve({leagues:[]})]),o=y.getUser(),d=i.leagues.find(v=>v.id===s),c=document.getElementById("tablonBadge"),_=c&&!c.classList.contains("hidden"),h=_?c.textContent:"",p=((a=n[0])==null?void 0:a.matches_played)??0;e.innerHTML=`
      ${d?`<span class="page-league-name">${d.name}</span>`:""}
      <div class="container">
        <div class="ranking-header">
          <h1 class="page-title">Clasificación</h1>
          ${s?`
            <button class="ranking-tablon-btn" data-league-id="${s}">
              💬 Tablón
              <span class="ranking-tablon-btn__badge${_?"":" hidden"}">${h}</span>
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
              ${n.map(v=>{var I,f,r;const b=v.predictions_made??0,$=`${b}/${p}`,L=`${v.correct_results??0}/${b}`,E=`${v.exact_scores??0}/${b}`;return`
                  <tr class="${o&&v.id===o.id?"ranking-table__row--me":""}">
                    <td class="ranking-table__pos" data-pos="${v.position}">${v.position}</td>
                    <td>
                      <a class="ranking-table__link" href="#/jugador/${v.id}">
                        <span class="status-emoji" title="${((I=v.status)==null?void 0:I.name)||""}">${((f=v.status)==null?void 0:f.emoji)||""}</span>${v.username}
                      </a>
                    </td>
                    <td class="ranking-table__stat ranking-table__status">${((r=v.status)==null?void 0:r.name)||"—"}</td>
                    <td class="ranking-table__stat">${$}</td>
                    <td class="ranking-table__stat">${L}</td>
                    <td class="ranking-table__stat">${E}</td>
                    <td class="ranking-table__pts">${v.total_points}</td>
                  </tr>
                `}).join("")}
            </tbody>
          </table>
        </div>
      </div>
    `,(t=e.querySelector(".ranking-tablon-btn"))==null||t.addEventListener("click",()=>{j.navigate(`/tablon?liga=${s}`)})}catch(s){e.innerHTML=`<div class="container"><p class="form__error">Error: ${s.message}</p></div>`}}async function oe(e,{query:a={},forceGeneral:t=!1}={}){e.innerHTML='<div class="loading"><div class="loading__spinner"></div></div>';const s=y.getUser();let n=t?null:a.liga?parseInt(a.liga):null;if(t)localStorage.setItem("tablon_general_last_read",new Date().toISOString()),document.dispatchEvent(new CustomEvent("tablon:read"));else if(n){localStorage.setItem(`tablon_last_read_${n}`,new Date().toISOString());const r=document.getElementById("tablonBadge");r&&(r.classList.add("hidden"),r.textContent="")}let i=null,o=[],d=1,c=1;if(t&&s)try{const{users:r}=await l.auth.usersForMentions();o=r||[],console.log("[tablon] usuarios cargados:",o.length)}catch(r){console.warn("[tablon] error cargando usuarios:",r)}if(!t)try{if(!n&&s){const{leagues:r}=await l.leagues.my();r&&r.length&&(n=r[0].id,i=r[0].name)}else if(n)try{const{league:r}=await l.leagues.get(n);i=r.name}catch{}if(n&&s)try{const{members:r}=await l.leagues.members(n);o=r||[]}catch{}}catch{}async function _(){const r=await l.board.messages(d,n);return c=r.pages||1,r}try{const r=await _();h(r)}catch(r){e.innerHTML=`<div class="container"><p class="form__error">Error: ${r.message}</p></div>`}function h(r){const{pinned:u=[],messages:w=[]}=r;e.innerHTML=`
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
            ${b(w)}
          </div>
          ${c>1?`<div class="pagination">
                 <button class="btn btn--ghost btn--sm" id="prevPage" ${d<=1?"disabled":""}>← Anterior</button>
                 <span>Página ${d} / ${c}</span>
                 <button class="btn btn--ghost btn--sm" id="nextPage" ${d>=c?"disabled":""}>Siguiente →</button>
               </div>`:""}
        </section>
      </div>
    `,L(),E(),S()}function p(r){return r.length?r.map(u=>`
      <div class="board-message board-message--pinned" data-id="${u.id}">
        <div class="board-message__header">
          <span class="board-message__pin-badge">📌</span>
          <strong class="board-message__author">${M(u.username)}</strong>
          <span class="board-message__date">${T(u.created_at)}</span>
          ${s!=null&&s.is_admin&&!u.is_deleted?`<button class="btn btn--ghost btn--xs unpin-msg" data-id="${u.id}" title="Desfijar">📌✕</button>`:""}
          ${!u.is_deleted&&s&&(s.id===u.user_id||s.is_admin)?`<button class="btn btn--danger btn--xs delete-msg" data-id="${u.id}">✕</button>`:""}
        </div>
        <p class="board-message__text">${$(u.message)}</p>

        ${u.replies&&u.replies.length?`<div class="board-replies">
               ${u.replies.map(w=>v(w)).join("")}
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
    `).join(""):""}function v(r){return`
      <div class="board-reply ${r.is_deleted?"board-reply--deleted":""}" data-id="${r.id}">
        <div class="board-reply__header">
          <strong class="board-reply__author">${M(r.username)}</strong>
          <span class="board-reply__date">${T(r.created_at)}</span>
          ${!r.is_deleted&&s&&(s.id===r.user_id||s.is_admin)?`<button class="btn btn--danger btn--xs delete-msg" data-id="${r.id}">✕</button>`:""}
        </div>
        <p class="board-reply__text">${$(r.message)}</p>
      </div>
    `}function b(r){return r.length?r.map(u=>`
      <div class="board-message ${u.is_deleted?"board-message--deleted":""}" data-id="${u.id}">
        <div class="board-message__header">
          <strong class="board-message__author">${M(u.username)}</strong>
          <span class="board-message__date">${T(u.created_at)}</span>
          ${s!=null&&s.is_admin&&!u.is_deleted?`<button class="btn btn--ghost btn--xs pin-msg" data-id="${u.id}" title="Fijar">📌</button>`:""}
          ${!u.is_deleted&&s&&(s.id===u.user_id||s.is_admin)?`<button class="btn btn--danger btn--xs delete-msg" data-id="${u.id}">✕</button>`:""}
        </div>
        <p class="board-message__text">${$(u.message)}</p>
      </div>
    `).join(""):'<p class="empty">Sin mensajes aún. ¡Sé el primero!</p>'}function $(r){const u=M(r);if(!o.length)return u.replace(/@(\w+)/g,'<span class="mention">@$1</span>');const w=o.map(k=>Xe(k.username)),C=new RegExp(`@(${w.join("|")})`,"gi");return u.replace(C,'<span class="mention">@$1</span>')}function L(){const r=document.getElementById("boardForm");if(!r)return;const u=document.getElementById("boardMsg"),w=document.getElementById("charCounter"),C=document.getElementById("mentionDropdown");u.addEventListener("input",()=>{w.textContent=`${u.value.length} / 500`,f(u,C)}),r.addEventListener("submit",async k=>{k.preventDefault();const H=u.value.trim();if(H)try{await l.board.post(H,n),u.value="",w.textContent="0 / 500",C.classList.add("hidden");const P=await _();I(P),g("Mensaje publicado")}catch(P){g(P.message,"error")}})}function E(){e.querySelectorAll(".reply-form").forEach(r=>{const u=parseInt(r.dataset.parent),w=r.querySelector(".reply-input"),C=`mentionDropdown-${u}`,k=document.getElementById(C);w==null||w.addEventListener("input",()=>{f(w,k)}),r.addEventListener("submit",async H=>{H.preventDefault();const P=w.value.trim();if(P)try{await l.board.reply(u,P),w.value="",k==null||k.classList.add("hidden");const O=await _();I(O),g("Respuesta enviada")}catch(O){g(O.message,"error")}})}),e.querySelectorAll(".pin-msg").forEach(r=>{r.addEventListener("click",async()=>{try{await l.board.pin(r.dataset.id);const u=await _();I(u),g("Mensaje fijado")}catch(u){g(u.message,"error")}})}),e.querySelectorAll(".unpin-msg").forEach(r=>{r.addEventListener("click",async()=>{try{await l.board.pin(r.dataset.id);const u=await _();I(u),g("Mensaje desfijado")}catch(u){g(u.message,"error")}})})}function S(){e.querySelectorAll(".delete-msg").forEach(r=>{r.addEventListener("click",async()=>{if(confirm("¿Eliminar este mensaje?"))try{await l.board.delete(r.dataset.id);const u=await _();I(u),g("Mensaje eliminado")}catch(u){g(u.message,"error")}})})}function I(r){const{pinned:u=[],messages:w=[]}=r,C=document.getElementById("boardPinned");if(C)C.innerHTML=p(u);else if(u.length){h(r);return}const k=document.getElementById("boardMessages");k&&(k.innerHTML=b(w)),E(),S()}e.addEventListener("click",async r=>{if(r.target.id==="prevPage"&&d>1){d--;const u=await _();I(u)}else if(r.target.id==="nextPage"&&d<c){d++;const u=await _();I(u)}});function f(r,u){if(!u||!o.length){console.log("[tablon] handleMentionInput: sin dropdown o members vacío",{dropdown:!!u,membersLen:o.length});return}const w=r.value,C=r.selectionStart,k=w.slice(0,C),H=k.match(/@(\w*)$/);if(!H){u.classList.add("hidden");return}const P=H[1].toLowerCase();console.log("[tablon] mention detected, query:",P);const O=o.filter(x=>x.username.toLowerCase().startsWith(P)&&x.id!==(s==null?void 0:s.id));console.log("[tablon] matches:",O.map(x=>x.username));const re=[...y.isAdmin()&&"todos".startsWith(P)?[{username:"todos",description:"Notificar a todos los miembros"}]:[],...O.slice(0,6)];if(!re.length){u.classList.add("hidden");return}u.innerHTML=re.map(x=>x.description?`<div class="mention-item mention-item--broadcast" data-username="${M(x.username)}">
             <span class="mention-item__name">@${M(x.username)}</span>
             <span class="mention-item__desc">${M(x.description)}</span>
           </div>`:`<div class="mention-item" data-username="${M(x.username)}">${M(x.username)}</div>`).join(""),u.classList.remove("hidden"),u.querySelectorAll(".mention-item").forEach(x=>{x.addEventListener("mousedown",Pe=>{Pe.preventDefault();const Me=x.dataset.username,ee=k.replace(/@(\w*)$/,`@${Me} `);if(r.value=ee+w.slice(C),r.setSelectionRange(ee.length,ee.length),u.classList.add("hidden"),r.tagName==="TEXTAREA"){const le=document.getElementById("charCounter");le&&(le.textContent=`${r.value.length} / 500`)}})})}document.addEventListener("click",r=>{!r.target.closest(".board-form__input-wrap")&&!r.target.closest(".reply-form__input-wrap")&&document.querySelectorAll(".mention-dropdown").forEach(u=>u.classList.add("hidden"))},{capture:!0})}function M(e){return String(e).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;")}function Xe(e){return e.replace(/[.*+?^${}()|[\]\\]/g,"\\$&")}async function Ye(e){var a,t,s,n;e.innerHTML='<div class="loading"><div class="loading__spinner"></div></div>';try{const i=y.getUser(),o=i==null?void 0:i.is_admin,[d,c]=await Promise.all([o?l.leagues.adminAll():l.leagues.all(),y.isLoggedIn()&&!o?l.leagues.my():Promise.resolve({leagues:[]})]),_=new Set(c.leagues.map(p=>p.id)),h=o?d.leagues:d.leagues.filter(p=>!_.has(p.id));e.innerHTML=`
      <div class="container">
        <h1 class="page-title">Ligas</h1>

        ${o?`
          <div class="admin-notice">Vista administrador — puedes acceder a cualquier liga sin participar en ella.</div>
        `:""}

        ${i&&!o&&c.leagues.length>0?`
          <section class="section">
            <h2>Mis ligas</h2>
            <div class="leagues-grid">${c.leagues.map(p=>ge(p,!0)).join("")}</div>
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
          ${h.length?`<div class="leagues-grid">${h.map(p=>ge(p,!1,_,o)).join("")}</div>`:o?'<p class="empty">No hay ligas creadas aún.</p>':c.leagues.length>0?'<p class="empty">Ya participas en todas las ligas disponibles.</p>':'<p class="empty">No hay ligas aún. ¡Crea la primera!</p>'}
        </section>
      </div>
    `,e.querySelectorAll('.league-card[data-navigate="true"]').forEach(p=>{p.addEventListener("click",()=>j.navigate(`/ligas/${p.dataset.id}`))}),e.querySelectorAll(".btn-join-league").forEach(p=>{p.addEventListener("click",async v=>{v.stopPropagation();const b=parseInt(p.dataset.id);p.disabled=!0,p.textContent="…";try{const{league:$}=await l.leagues.join({league_id:b});g(`¡Te has unido a "${$.name}"!`),j.navigate(`/ligas/${$.id}`)}catch($){g($.message,"error"),p.disabled=!1,p.textContent="Unirse"}})}),e.querySelectorAll(".btn-private-info").forEach(p=>{p.addEventListener("click",v=>{v.stopPropagation(),g("Esta liga es privada. Pide el enlace de invitación a cualquier miembro para unirte.","info")})}),(a=document.getElementById("btnShowCreate"))==null||a.addEventListener("click",()=>{var p,v;(p=document.getElementById("createLeaguePanel"))==null||p.classList.remove("hidden"),(v=document.getElementById("btnShowCreate"))==null||v.classList.add("hidden")}),(t=document.getElementById("btnCancelCreate"))==null||t.addEventListener("click",()=>{var p,v;(p=document.getElementById("createLeaguePanel"))==null||p.classList.add("hidden"),(v=document.getElementById("btnShowCreate"))==null||v.classList.remove("hidden")}),(s=document.getElementById("joinCodeForm"))==null||s.addEventListener("submit",async p=>{p.preventDefault();const v=document.getElementById("inviteCode").value.trim().toUpperCase();if(v)try{const{league:b}=await l.leagues.join({invite_code:v});g(`Te has unido a "${b.name}"`),j.navigate(`/ligas/${b.id}`)}catch(b){g(b.message,"error")}}),(n=document.getElementById("createLeagueForm"))==null||n.addEventListener("submit",async p=>{var I;p.preventDefault();const v=document.getElementById("createBtn");v.disabled=!0,v.textContent="Creando…";const b=document.getElementById("leagueName").value.trim(),$=document.getElementById("leagueDesc").value.trim(),L=document.getElementById("leaguePrize").value.trim(),E=document.getElementById("isPublic").checked,S=((I=document.getElementById("isOfficial"))==null?void 0:I.checked)??!1;try{const{league:f}=await l.leagues.create({name:b,description:$,prize:L,is_public:E,is_official:S});Ze(f)}catch(f){g(f.message,"error"),v.disabled=!1,v.textContent="Crear liga"}})}catch(i){e.innerHTML=`<div class="container"><p class="form__error">Error: ${i.message}</p></div>`}}function ge(e,a=!1,t=new Set,s=!1){const n=e.is_official?'<span class="league-badge league-badge--official">⭐ Oficial</span>':"",i=e.is_public?"🌍":"🔒",o=s?`<button class="btn btn--sm btn--outline btn-admin-view" data-id="${e.id}">Ver (admin)</button>`:a?`<button class="btn btn--sm btn--outline" onclick="event.stopPropagation(); window.location.hash='/ligas/${e.id}'">Ver liga</button>`:e.is_public?`<button class="btn btn--sm btn--primary btn-join-league" data-id="${e.id}">Unirse</button>`:'<button class="btn btn--sm btn--ghost btn-private-info">🔒 Solicitar enlace</button>';return`
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
  `}function Ze(e){var s,n;const a=e.invite_link||"",t=document.getElementById("createLeaguePanel");t&&(t.innerHTML=`
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
  `,(s=document.getElementById("btnCopyLink"))==null||s.addEventListener("click",async()=>{try{await navigator.clipboard.writeText(a),g("Enlace copiado")}catch{g("No se pudo copiar","error")}}),(n=document.getElementById("btnShare"))==null||n.addEventListener("click",async()=>{try{await navigator.share({title:`Únete a ${e.name} en PickGoal`,url:a})}catch{}}))}async function Ke(e,{params:a}){var s,n,i,o,d;const t=parseInt(a.id);e.innerHTML='<div class="loading"><div class="loading__spinner"></div></div>';try{const c=await l.leagues.get(t),{league:_,ranking:h,is_member:p,is_admin_view:v}=c,b=y.getUser(),$=_.is_official?'<span class="league-badge league-badge--official">⭐ Oficial</span>':"";e.innerHTML=`
      <div class="container">
        <a href="#/ligas" class="back-link">← Volver a ligas</a>

        ${v?`
          <div class="admin-notice">Vista administrador — no participas en esta liga</div>
        `:""}

        <div class="league-header">
          <h1 class="page-title">${_.name} ${$}</h1>
          ${_.description?`<p class="league-header__desc">${_.description}</p>`:""}
          <div class="league-header__meta">
            <span>${_.is_public?"🌍 Pública":"🔒 Privada"}</span>
            <span>${_.member_count} participantes</span>
            ${_.prize?`<span>🏆 ${_.prize}</span>`:""}
          </div>
        </div>

        ${(p||b!=null&&b.is_admin)&&_.invite_link?`
          <div class="invite-share-box">
            <span class="invite-share-box__label">Enlace de invitación:</span>
            <div class="invite-link-box">
              <span class="invite-link-box__url">${_.invite_link}</span>
              <button class="btn btn--sm btn--outline" id="btnCopyInvite">Copiar</button>
              ${navigator.share?'<button class="btn btn--sm btn--ghost" id="btnShareInvite">Compartir</button>':""}
            </div>
          </div>
        `:""}

        <div class="league-actions">
          ${p?'<button class="btn btn--danger btn--sm" id="btnLeave">Abandonar liga</button>':!(b!=null&&b.is_admin)&&b?'<button class="btn btn--primary" id="btnJoin">Unirse a esta liga</button>':""}
          ${b!=null&&b.is_admin||p&&b&&_.created_by===b.id?'<button class="btn btn--outline btn--sm" id="btnEditLeague">Editar liga</button>':""}
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
              ${h.map(f=>`
                <tr class="${b&&f.id===b.id?"ranking-table__row--me":""}">
                  <td>${f.position}</td>
                  <td>${f.username}</td>
                  <td>${f.country||"—"}</td>
                  <td class="ranking-table__pts">${f.total_points}</td>
                </tr>
              `).join("")}
            </tbody>
          </table>
        </section>

        <section class="section hidden" id="sectionTablon">
          <div id="tablonEmbed"></div>
        </section>
      </div>
    `,(s=document.getElementById("btnCopyInvite"))==null||s.addEventListener("click",async()=>{try{await navigator.clipboard.writeText(_.invite_link),g("Enlace copiado")}catch{g("No se pudo copiar","error")}}),(n=document.getElementById("btnShareInvite"))==null||n.addEventListener("click",async()=>{try{await navigator.share({title:`Únete a ${_.name} en PickGoal`,url:_.invite_link})}catch{}}),(i=document.getElementById("btnLeave"))==null||i.addEventListener("click",async()=>{if(confirm("¿Seguro que quieres abandonar esta liga?"))try{await l.leagues.leave(t),g("Has abandonado la liga"),j.navigate("/ligas")}catch(f){g(f.message,"error")}}),(o=document.getElementById("btnJoin"))==null||o.addEventListener("click",async()=>{try{await l.leagues.join({league_id:t}),g("¡Te has unido a la liga!"),j.navigate(`/ligas/${t}`)}catch(f){g(f.message,"error")}}),(d=document.getElementById("btnEditLeague"))==null||d.addEventListener("click",()=>{Qe(_,t,b)});const L=document.getElementById("tabRanking"),E=document.getElementById("tabTablon"),S=document.getElementById("sectionRanking"),I=document.getElementById("sectionTablon");L&&E&&(L.addEventListener("click",()=>{L.classList.add("league-tab--active"),E.classList.remove("league-tab--active"),S.classList.remove("hidden"),I.classList.add("hidden")}),E.addEventListener("click",()=>{E.classList.add("league-tab--active"),L.classList.remove("league-tab--active"),S.classList.add("hidden"),I.classList.remove("hidden");const f=document.getElementById("tablonEmbed");f&&!f.dataset.loaded&&(f.dataset.loaded="1",oe(f,{query:{liga:String(t)}}))}))}catch(c){e.innerHTML=`<div class="container"><p class="form__error">Error: ${c.message}</p><a href="#/ligas">Volver</a></div>`}}function Qe(e,a,t){const s=document.getElementById("editLeagueModal");s&&s.remove();const n=document.createElement("div");n.id="editLeagueModal",n.className="edit-league-modal",n.innerHTML=`
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
  `,document.body.appendChild(n),requestAnimationFrame(()=>n.classList.add("edit-league-modal--open"));const i=()=>{n.classList.remove("edit-league-modal--open"),n.addEventListener("transitionend",()=>n.remove(),{once:!0})};n.querySelector(".edit-league-modal__overlay").addEventListener("click",i),document.getElementById("btnCancelEdit").addEventListener("click",i),document.getElementById("editLeagueForm").addEventListener("submit",async o=>{o.preventDefault();const d=document.getElementById("btnSaveEdit");d.disabled=!0,d.textContent="Guardando…";const c={name:document.getElementById("editName").value.trim(),description:document.getElementById("editDesc").value.trim(),prize:document.getElementById("editPrize").value.trim(),is_public:document.getElementById("editPublic").checked};t!=null&&t.is_admin&&(c.is_official=document.getElementById("editOfficial").checked);try{await l.leagues.update(a,c),g("Liga actualizada"),i(),j.navigate(`/ligas/${a}`)}catch(_){g(_.message,"error"),d.disabled=!1,d.textContent="Guardar cambios"}})}async function ea(e){var t,s,n,i,o,d;e.innerHTML='<div class="loading"><div class="loading__spinner"></div></div>';const a=y.getUser();try{const[c,_,h,p]=await Promise.all([l.predictions.mine(null),l.clasificacion.division(),l.auth.me(),a!=null&&a.is_admin?l.leagues.adminAll():Promise.resolve({leagues:[]})]),v=h.user,b=v.status,$=v.total_points_all_time,L=(t=_.standings)==null?void 0:t.find(E=>E.user_id===v.id);e.innerHTML=`
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
                <p id="emailDisplay">${v.email}</p>
                <button class="btn btn--ghost btn--xs" id="btnEditEmail" title="Cambiar email">✏️</button>
              </div>
              <div class="profile-card__email-edit hidden" id="emailEditForm">
                <input class="form__input" type="email" id="emailInput" value="${v.email}" autocomplete="email" />
                <div class="profile-card__email-actions">
                  <button class="btn btn--primary btn--xs" id="btnSaveEmail">Guardar</button>
                  <button class="btn btn--ghost btn--xs" id="btnCancelEmail">Cancelar</button>
                </div>
                <p class="form__error hidden" id="emailError"></p>
              </div>
              <p>${a.country||"Sin país"}</p>
            </div>
          </div>
          ${sa(b,$)}
          <button class="btn btn--danger" id="btnLogoutPerfil">Cerrar sesión</button>
          <div class="profile-card__stats">
            <div class="stat">
              <span class="stat__value">${c.predictions.length}</span>
              <span class="stat__label">Predicciones</span>
            </div>
            <div class="stat">
              <span class="stat__value">${L?`${L.pos}º`:"—"}</span>
              <span class="stat__label">Posición div.</span>
            </div>
            <div class="stat">
              <span class="stat__value">${(L==null?void 0:L.pts_division)??"—"}</span>
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
          ${L?`<div class="division-info">
                 <p class="division-info__name">${_.league_name||"PickGoal División"}</p>
                 <div class="division-info__stats">
                   <div class="division-info__stat">
                     <span>${L.pos}º</span>
                     <small>de ${_.standings.length}</small>
                   </div>
                   <div class="division-info__stat">
                     <span>${L.pts_division}</span>
                     <small>pts división</small>
                   </div>
                   <div class="division-info__stat">
                     <span>${L.pts_general}</span>
                     <small>pts total</small>
                   </div>
                   <div class="division-info__stat">
                     <span>${L.pj}</span>
                     <small>partidos</small>
                   </div>
                 </div>
                 <a href="#/tabla-v2" class="btn btn--ghost btn--sm">Ver tabla completa</a>
               </div>`:'<p class="empty">No perteneces a ninguna división todavía.</p>'}
        </section>

        ${c.predictions.length>0?`
          <section class="section">
            <h2>Mis predicciones</h2>
            <div class="predictions-list">${c.predictions.map(na).join("")}</div>
          </section>
        `:""}

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

        ${a!=null&&a.is_admin&&p.leagues.length?`
          <section class="section">
            <h2>Ligas gestionadas</h2>
            <ul class="leagues-list">
              ${p.leagues.map(E=>`
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
    `,(s=e.querySelector("#btnLogoutPerfil"))==null||s.addEventListener("click",()=>{y.logout(),window.location.hash="/"}),(n=e.querySelector("#btnEditEmail"))==null||n.addEventListener("click",()=>{e.querySelector("#emailEditForm").classList.remove("hidden"),e.querySelector("#emailInput").focus()}),(i=e.querySelector("#btnCancelEmail"))==null||i.addEventListener("click",()=>{e.querySelector("#emailEditForm").classList.add("hidden"),e.querySelector("#emailError").classList.add("hidden")}),(o=e.querySelector("#btnSaveEmail"))==null||o.addEventListener("click",async()=>{const E=e.querySelector("#emailInput").value.trim(),S=e.querySelector("#emailError");if(S.classList.add("hidden"),!E){S.textContent="El email no puede estar vacío",S.classList.remove("hidden");return}if(!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(E)){S.textContent="Formato de email inválido",S.classList.remove("hidden");return}try{const{user:f}=await l.auth.updateEmail(E);y.setUser(f,localStorage.getItem("token")),e.querySelector("#emailDisplay").textContent=f.email,e.querySelector("#emailEditForm").classList.add("hidden"),g("Email actualizado")}catch(f){S.textContent=f.message,S.classList.remove("hidden")}}),(d=e.querySelector("#btnDeleteAccount"))==null||d.addEventListener("click",()=>{ia()}),aa(e),ta(e)}catch(c){e.innerHTML=`<div class="container"><p class="form__error">Error: ${c.message}</p></div>`}}function z(e){return String(e||"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;")}async function aa(e){const a=e.querySelector("#conversacionesList");if(a)try{const{conversations:t}=await l.messages.list();if(!t.length){a.innerHTML='<p class="empty">Sin conversaciones aún.</p>';return}a.innerHTML=t.slice(0,5).map(s=>`
      <a href="#/mensajes/${s.user_id}" class="mensajes-item">
        <div class="mensajes-item__avatar">${z(s.username[0].toUpperCase())}</div>
        <div class="mensajes-item__info">
          <div class="mensajes-item__header">
            <strong class="mensajes-item__name">${z(s.username)}</strong>
            ${s.unread_count>0?`<span class="mensajes-item__badge">${s.unread_count}</span>`:""}
          </div>
          <p class="mensajes-item__preview">${z(s.last_message)}</p>
        </div>
      </a>
    `).join("")}catch{a.innerHTML='<p class="empty">Sin conversaciones aún.</p>'}}async function ta(e){const a=e.querySelector("#mencionesTablon");if(a)try{const t=localStorage.getItem("tablon_general_last_read")||new Date(0).toISOString(),{messages:s}=await l.board.mentions(t);if(!s||!s.length){a.innerHTML='<p class="empty">Sin menciones recientes.</p>';return}a.innerHTML=s.slice(0,5).map(n=>`
      <a href="#/tabla-v2?tab=tablon" class="mensajes-item">
        <div class="mensajes-item__avatar">${z(n.username[0].toUpperCase())}</div>
        <div class="mensajes-item__info">
          <div class="mensajes-item__header">
            <strong class="mensajes-item__name">${z(n.username)}</strong>
            <span class="mensajes-item__time">${T(n.created_at)}</span>
          </div>
          <p class="mensajes-item__preview">${z(n.message)}</p>
        </div>
      </a>
    `).join("")}catch{a.innerHTML='<p class="empty">Sin menciones recientes.</p>'}}function sa(e,a){if(e.next_threshold===null)return`
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
        <span class="level-progress__label">${a} / ${e.next_threshold} pts → ${e.next_emoji||""} ${e.next_name}</span>
      </div>
      <div class="level-progress__bar"><div class="level-progress__fill" style="width:${s}%"></div></div>
    </div>`}function na(e){return`
    <div class="pred-row ${e.total_points>0?"pred-row--scored":""}">
      <span class="pred-row__result">${e.predicted_result}</span>
      <span class="pred-row__score">${e.predicted_home}-${e.predicted_away}</span>
      <span class="pred-row__pts">${e.total_points} pts</span>
    </div>
  `}function ia(){const e=document.createElement("div");e.className="delete-modal",e.innerHTML=`
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
  `,document.body.appendChild(e),document.body.style.overflow="hidden",requestAnimationFrame(()=>e.classList.add("delete-modal--open"));const a=e.querySelector("#deleteConfirmInput"),t=e.querySelector("#deleteConfirmBtn"),s=e.querySelector("#deleteCancelBtn"),n=e.querySelector("#deleteOverlay"),i=e.querySelector("#deleteError");function o(){e.classList.remove("delete-modal--open"),document.body.style.overflow="",e.addEventListener("transitionend",()=>e.remove(),{once:!0})}a.addEventListener("input",()=>{t.disabled=a.value.trim()!=="CERRAR"}),s.addEventListener("click",o),n.addEventListener("click",o),t.addEventListener("click",async()=>{t.disabled=!0,t.textContent="Cerrando…",i.classList.add("hidden");try{await l.auth.deleteAccount(),o(),y.logout(),g("Cuenta cerrada. Hasta pronto."),window.location.hash="/"}catch(d){i.textContent=d.message||"Error al cerrar la cuenta",i.classList.remove("hidden"),t.disabled=!1,t.textContent="Cerrar mi cuenta"}})}function oa(){window.location.hash="/"}async function da(e){if(!y.isAdmin()){e.innerHTML='<div class="container"><p class="form__error">Acceso denegado.</p></div>';return}e.innerHTML='<div class="loading"><div class="loading__spinner"></div></div>';try{const{users:a}=await l.auth.users();e.innerHTML=`
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
                ${a.map(la).join("")}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    `,ra(e),Z(e)}catch(a){e.innerHTML=`<div class="container"><p class="form__error">Error: ${a.message}</p></div>`}}function ra(e){var s,n,i,o;(s=document.getElementById("btnSync"))==null||s.addEventListener("click",async()=>{const d=document.getElementById("syncResult");d.textContent="Sincronizando…";try{await l.matches.sync(),d.textContent="✓ Sincronización completada",g("Sincronización completada")}catch(c){d.textContent=`Error: ${c.message}`,g(c.message,"error")}});const a=document.getElementById("pushTarget"),t=document.getElementById("pushTargetIdGroup");a==null||a.addEventListener("change",()=>{t.classList.toggle("hidden",a.value==="all")}),(n=document.getElementById("pushForm"))==null||n.addEventListener("submit",async d=>{d.preventDefault();const c=document.getElementById("pushTitle").value.trim()||"Aviso",_=document.getElementById("pushBody").value.trim(),h=a.value,p=parseInt(document.getElementById("pushTargetId").value)||null,v=document.getElementById("pushResult"),b={title:`📣 PickGoal — ${c}`,body:_};h==="league"&&p&&(b.league_id=p),h==="user"&&p&&(b.user_id=p),v.textContent="Enviando…";try{const{sent:$}=await l.notifications.send(b);v.textContent=`✓ Enviada a ${$} suscripción(es)`,g(`Notificación enviada a ${$} suscripción(es)`)}catch($){v.textContent=`Error: ${$.message}`,g($.message,"error")}}),(i=document.getElementById("btnCloseSeason"))==null||i.addEventListener("click",async()=>{if(!confirm("¿Cerrar la temporada actual? Esta acción es irreversible."))return;const d=document.getElementById("btnCloseSeason"),c=document.getElementById("closeSeasonResult");d.disabled=!0,c.textContent="Cerrando…";try{const{message:_}=await l.post("/v2/admin/season/1/close");c.textContent=`✓ ${_||"Temporada cerrada"}`,g("Temporada cerrada")}catch(_){c.textContent=`Error: ${_.message}`,g(_.message,"error"),d.disabled=!1}}),(o=document.getElementById("usersTableBody"))==null||o.addEventListener("click",async d=>{const c=d.target.closest(".toggle-admin");if(c){const h=parseInt(c.dataset.id);try{const{user:p}=await l.auth.toggleAdmin(h);c.closest("tr").querySelector(".admin-badge").textContent=p.is_admin?"Sí":"No",g(`${p.username} ${p.is_admin?"ahora es admin":"ya no es admin"}`)}catch(p){g(p.message,"error")}return}const _=d.target.closest(".toggle-mute");if(_){const h=parseInt(_.dataset.id);try{const{user:p}=await l.auth.toggleMute(h),v=_.closest("tr");v.querySelector(".mute-badge").textContent=p.is_muted?"Sí":"No",_.textContent=p.is_muted?"Activar":"Silenciar",g(`${p.username} ${p.is_muted?"silenciado":"activado"}`)}catch(p){g(p.message,"error")}}})}function la(e){return`
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
  `}const ca={PD:"🇪🇸 LaLiga",PL:"🏴󠁧󠁢󠁥󠁮󠁧󠁿 Premier League",CL:"⭐ Champions League",SA:"🇮🇹 Serie A",BL1:"🇩🇪 Bundesliga",FL1:"🇫🇷 Ligue 1",PPL:"🇵🇹 Primeira Liga"};let B=[],Y=null;async function Z(e){const a=document.getElementById("jornadasV2Content");if(a)try{const{jornadas:t}=await l.adminV2.jornadas();a.innerHTML=ua(t),pa(a)}catch(t){a.innerHTML=`<p class="form__error">Error: ${t.message}</p>`}}function ua(e){const t=ya(new Date);return`
    <div class="jv2-panel">
      <div class="jv2-panel__actions">
        <button class="btn btn--primary btn--sm" id="btnNuevaJornada">+ Nueva jornada</button>
      </div>

      <div class="jv2-list">
        ${e.length===0?'<p class="admin-section__desc">No hay jornadas creadas.</p>':e.map(ma).join("")}
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
  `}function ma(e){const a={draft:'<span class="admin-match-badge" style="background:rgba(61,145,255,0.15);color:#3d91ff;border:1px solid rgba(61,145,255,0.3)">Borrador</span>',upcoming:'<span class="admin-match-badge admin-match-badge--pending">Próxima</span>',active:'<span class="admin-match-badge admin-match-badge--done">Activa</span>',finished:'<span class="admin-match-badge" style="background:rgba(255,255,255,0.05);color:#6e6e6e;border:1px solid #222">Finalizada</span>'}[e.status]||`<span class="admin-match-badge">${e.status}</span>`,t=s=>s?new Date(s).toLocaleDateString("es-ES",{day:"2-digit",month:"2-digit"}):"—";return`
    <div class="jv2-row">
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
      </div>
    </div>
  `}function pa(e){var a,t,s,n;(a=e.querySelector("#btnNuevaJornada"))==null||a.addEventListener("click",()=>{Y=null,B=[],document.getElementById("jv2FormTitle").textContent="Nueva jornada",document.getElementById("jv2EditId").value="",document.getElementById("jv2Number").value="",document.getElementById("jv2DateStart").value="",document.getElementById("jv2DateEnd").value="",document.getElementById("jv2MatchPicker").style.display="none",document.getElementById("jv2Form").style.display="block",de()}),(t=e.querySelector("#btnCancelarJornada"))==null||t.addEventListener("click",()=>{document.getElementById("jv2Form").style.display="none",B=[],Y=null}),(s=e.querySelector("#btnBuscarPartidos"))==null||s.addEventListener("click",va),(n=e.querySelector("#btnGuardarJornada"))==null||n.addEventListener("click",ba),e.querySelectorAll(".jv2-pub-btn").forEach(i=>{i.addEventListener("click",async()=>{if(confirm(`¿Publicar jornada ${i.dataset.num}? Se calcularán cuotas, se asignarán duelos y se notificará a los usuarios.`)){i.disabled=!0,i.textContent="Publicando…";try{const o=await l.adminV2.publishJornada(i.dataset.id);g(`Jornada ${i.dataset.num} publicada — push enviado a ${o.push_sent} suscriptores`),await Z(document.getElementById("jornadasV2Section"))}catch(o){g(o.message,"error"),i.disabled=!1,i.textContent="Publicar"}}})}),e.querySelectorAll(".jv2-edit-btn").forEach(i=>{i.addEventListener("click",()=>ga(i.dataset.id))}),e.querySelectorAll(".jv2-del-btn").forEach(i=>{i.addEventListener("click",async()=>{if(confirm(`¿Eliminar jornada ${i.dataset.num}?`))try{await l.adminV2.deleteJornada(i.dataset.id),g("Jornada eliminada"),Z(document.querySelector("#jornadasV2Content").parentElement.parentElement)}catch(o){g(o.message,"error")}})})}async function ga(e){const{jornadas:a}=await l.adminV2.jornadas(),t=a.find(s=>String(s.id)===String(e));t&&(Y=t.id,B=[],document.getElementById("jv2FormTitle").textContent=`Editar jornada ${t.number}`,document.getElementById("jv2EditId").value=t.id,document.getElementById("jv2Number").value=t.number,t.date_start&&(document.getElementById("jv2DateStart").value=t.date_start.slice(0,16)),t.date_end&&(document.getElementById("jv2DateEnd").value=t.date_end.slice(0,16)),document.getElementById("jv2MatchPicker").style.display="none",document.getElementById("jv2Form").style.display="block",de())}async function va(){const e=document.getElementById("btnBuscarPartidos"),a=document.getElementById("jv2Week").value;if(!a){g("Selecciona una semana","error");return}e.disabled=!0,e.textContent="Buscando…";try{const{matches:t}=await l.adminV2.partidos(a);_a(t),document.getElementById("jv2MatchPicker").style.display="block"}catch(t){g(`Error: ${t.message}`,"error")}finally{e.disabled=!1,e.textContent="Buscar partidos"}}function _a(e){const a=document.getElementById("jv2MatchList");if(Object.values(e).flat().length===0){a.innerHTML='<p class="admin-section__desc">No hay partidos disponibles para esta semana.</p>';return}a.innerHTML=Object.entries(e).map(([s,n])=>n.length?`
      <div class="jv2-comp-group">
        <div class="jv2-comp-group__title">${ca[s]||s}</div>
        ${n.map(i=>`
          <label class="jv2-match-item">
            <input type="checkbox" class="jv2-match-check" data-match='${JSON.stringify(i)}' />
            <span class="jv2-match-item__teams">${i.home_team} vs ${i.away_team}</span>
            <span class="jv2-match-item__date">${ha(i.match_datetime)}</span>
          </label>
        `).join("")}
      </div>
    `:"").join(""),a.querySelectorAll(".jv2-match-check").forEach(s=>{s.addEventListener("change",()=>{const n=JSON.parse(s.dataset.match);if(s.checked){if(B.length>=10){s.checked=!1,g("Máximo 10 partidos","error");return}B.push(n)}else B=B.filter(i=>i.api_id!==n.api_id);de()})})}function de(){const e=document.getElementById("jv2Count"),a=document.getElementById("jv2CountWarn");e&&(e.textContent=B.length),a&&(a.style.display=B.length>0&&B.length!==10?"inline":"none")}async function ba(){const e=parseInt(document.getElementById("jv2Number").value),a=document.getElementById("jv2DateStart").value,t=document.getElementById("jv2DateEnd").value,s=document.getElementById("jv2EditId").value;if(!e||!a||!t){g("Completa número y fechas","error");return}if(B.length!==10){g("Selecciona exactamente 10 partidos","error");return}const n={number:e,date_start:new Date(a).toISOString(),date_end:new Date(t).toISOString(),matches:B},i=document.getElementById("btnGuardarJornada");i.disabled=!0;try{s?(await l.adminV2.updateJornada(s,n),g(`Jornada ${e} actualizada`)):(await l.adminV2.createJornada(n),g(`Jornada ${e} guardada como borrador`)),document.getElementById("jv2Form").style.display="none",B=[],Y=null,await Z(document.getElementById("jornadasV2Section"))}catch(o){g(o.message,"error")}finally{i.disabled=!1}}function ha(e){return e?new Date(e).toLocaleDateString("es-ES",{day:"2-digit",month:"2-digit"}):"—"}function fa(e){const a=new Date(Date.UTC(e.getFullYear(),e.getMonth(),e.getDate())),t=a.getUTCDay()||7;a.setUTCDate(a.getUTCDate()+4-t);const s=new Date(Date.UTC(a.getUTCFullYear(),0,1));return Math.ceil(((a-s)/864e5+1)/7)}function ya(e){const a=new Date(e);a.setDate(a.getDate()+7);const t=a.getFullYear(),s=String(fa(a)).padStart(2,"0");return`${t}-W${s}`}function $a(e){e.innerHTML=`
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
  `,document.getElementById("forgotForm").addEventListener("submit",async a=>{a.preventDefault();const t=document.getElementById("forgotBtn"),s=document.getElementById("forgotMsg"),n=document.getElementById("email").value.trim();t.disabled=!0,t.textContent="Enviando…";try{await l.auth.forgotPassword(n),s.textContent="Si el email existe, recibirás un enlace en breve.",s.classList.remove("hidden","form__error"),s.classList.add("form__success")}catch{g("Error al enviar el email","error")}finally{t.disabled=!1,t.textContent="Enviar enlace"}})}function Ea(e,{query:a}){const t=a.token||"";if(!t){e.innerHTML='<div class="container"><p class="form__error">Token inválido o expirado.</p><a href="#/login">Volver</a></div>';return}e.innerHTML=`
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
  `,document.getElementById("resetForm").addEventListener("submit",async s=>{s.preventDefault();const n=document.getElementById("resetBtn"),i=document.getElementById("resetError"),o=document.getElementById("password").value;n.disabled=!0,n.textContent="Guardando…",i.classList.add("hidden");try{await l.auth.resetPassword(t,o),g("Contraseña actualizada. Ya puedes iniciar sesión."),j.navigate("/login")}catch(d){i.textContent=d.message||"Error al restablecer la contraseña",i.classList.remove("hidden")}finally{n.disabled=!1,n.textContent="Guardar contraseña"}})}async function La(e,{query:a}){const t=(a.codigo||"").trim().toUpperCase();if(!t){e.innerHTML='<div class="container"><p class="form__error">Enlace de invitación inválido.</p><a href="#/ligas">Ver ligas</a></div>';return}if(!y.isLoggedIn()){sessionStorage.setItem("pendingInviteCode",t),j.navigate("/register");return}e.innerHTML='<div class="loading"><div class="loading__spinner"></div></div>';try{const{league:s}=await l.leagues.joinByCode(t);g(`¡Te has unido a "${s.name}"!`),j.navigate(`/ligas/${s.id}`)}catch(s){if(s.status===409){g("Ya eres miembro de esta liga");try{const{leagues:n}=await l.leagues.my(),i=n.find(o=>o.invite_code===t);if(i){j.navigate(`/ligas/${i.id}`);return}}catch{}}e.innerHTML=`
      <div class="container">
        <div class="league-gate">
          <div class="league-gate__icon">⚠️</div>
          <h2 class="league-gate__title">Error al unirse</h2>
          <p class="league-gate__text">${s.message}</p>
          <a href="#/ligas" class="btn btn--primary">Ver ligas</a>
        </div>
      </div>
    `}}function wa(){const e=localStorage.getItem("activeLeagueId");return e?parseInt(e):null}async function ja(e,{params:a}){const t=parseInt(a.id);if(!t){e.innerHTML='<div class="container"><p class="form__error">Usuario no válido.</p></div>';return}e.innerHTML='<div class="loading"><div class="loading__spinner"></div></div>';try{const s=wa(),{user:n,predictions:i}=await l.predictions.forUser(t,s);e.innerHTML=`
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
              ${i.map(o=>Ia(o)).join("")}
            </div>`}
      </div>
    `}catch(s){e.innerHTML=`<div class="container"><p class="form__error">Error: ${s.message}</p></div>`}}function Ia(e){const a=e.match,t=e.total_points,s=e.pts_score>0,n=e.pts_result>0;let i="";return s?i='<span class="jugador__badge jugador__badge--exact">Exacto</span>':n?i='<span class="jugador__badge jugador__badge--ok">1X2 ✓</span>':i='<span class="jugador__badge jugador__badge--miss">Fallo</span>',`
    <div class="jugador__pred-row">
      <div class="jugador__pred-match">
        <span class="jugador__pred-teams">${a.home_team} vs ${a.away_team}</span>
        <span class="jugador__pred-date">${T(a.match_datetime)}</span>
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
  `}const F=20,Ie=5;let N={},A=0,se=null,ve=null;async function Sa(e){e.innerHTML='<div class="loading"><div class="loading__spinner"></div></div>';try{const{jornadas:a}=await l.jornada.list();if(!a.length){e.innerHTML=ka();return}Se(e,a,0)}catch(a){e.innerHTML=`<div class="container"><p class="form__error">Error cargando jornadas: ${a.message}</p></div>`}}function Se(e,a,t){var c,_;ve=a[t];const{jornada:s,matches:n,units_used:i}=ve;N={};for(const h of n)N[h.jornada_match_id]={predicted_result:((c=h.prediction)==null?void 0:c.predicted_result)??null,units:((_=h.prediction)==null?void 0:_.units_wagered)??0};A=i;const o=n.filter(h=>!h.predict_locked);se=o.length===1?o[0].jornada_match_id:null;const d=a.length>1?`<div class="jornada-tabs">
        ${a.map((h,p)=>`
          <button class="jornada-tab ${p===t?"jornada-tab--active":""}" data-idx="${p}">
            J${h.jornada.number} · ${X(h.jornada.date_start)}–${X(h.jornada.date_end)}
          </button>
        `).join("")}
       </div>`:"";e.innerHTML=`
    <div class="container">
      <h1 class="page-title">Jornada ${s.number} — del ${X(s.date_start)} al ${X(s.date_end)}</h1>
      ${d}
      ${s.locked?'<p class="notice">⚠️ El plazo de predicción ha cerrado (ya empezó el primer partido).</p>':s.first_match_datetime?`<p class="notice notice--info">Abierto hasta ${Ba(s.first_match_datetime)}</p>`:""}
      <div class="units-counter" id="unitsCounter"></div>
      <div class="jornada-matches">
        ${n.map(Ta).join("")}
      </div>
    </div>
  `,ke(),xe(),Pa(e,a,t)}function ka(){return`
    <div class="container">
      <div class="jornada-empty">
        <div class="jornada-empty__icon">📅</div>
        <h2 class="jornada-empty__title">No hay jornadas disponibles</h2>
        <p class="jornada-empty__text">Todavía no hay una próxima jornada programada.</p>
      </div>
    </div>
  `}function X(e){return new Date(e).toLocaleDateString("es-ES",{day:"2-digit",month:"2-digit"})}function xa(e){return new Date(e).toLocaleTimeString("es-ES",{hour:"2-digit",minute:"2-digit"})}function Ba(e){return new Date(e).toLocaleString("es-ES",{day:"2-digit",month:"2-digit",hour:"2-digit",minute:"2-digit"})}function te(e){return e!=null?e.toFixed(2):"—"}function Ca(e){return e.status==="finished"?`<span class="tag tag--done">Finalizado ${e.home_score_90??"?"}–${e.away_score_90??"?"}</span>`:e.predict_locked?'<span class="tag tag--locked">Bloqueado</span>':`<span class="tag tag--open">Abierto hasta ${xa(e.opens_until)}</span>`}function Ta(e){const a=e.predict_locked,t=N[e.jornada_match_id]??{predicted_result:null,units:0};return`
    <div class="match-card jornada-match ${a?"match-card--locked":""}" data-jm-id="${e.jornada_match_id}">
      <div class="match-card__header">
        <span class="match-card__date">${T(e.match_datetime)}</span>
        ${Ca(e)}
      </div>
      <div class="match-card__teams">
        <span class="team team--home">${e.home_team}</span>
        <div class="match-card__score">
          ${e.status!=="scheduled"?`<span class="score">${e.home_score_90??"?"} - ${e.away_score_90??"?"}</span>`:'<span class="score score--dash">vs</span>'}
        </div>
        <span class="team team--away">${e.away_team}</span>
      </div>
      <div class="jornada-odds">
        <span class="jornada-odds__item"><b>1</b> (${te(e.odds_1)})</span>
        <span class="jornada-odds__item"><b>X</b> (${te(e.odds_x)})</span>
        <span class="jornada-odds__item"><b>2</b> (${te(e.odds_2)})</span>
      </div>
      <div class="jornada-match__controls ${a?"jornada-match__controls--disabled":""}">
        <div class="result-selector">
          ${["1","X","2"].map(s=>`
            <label class="result-selector__option">
              <input type="radio" name="result-${e.jornada_match_id}" value="${s}" ${t.predicted_result===s?"checked":""} ${a?"disabled":""} />
              ${s}
            </label>
          `).join("")}
        </div>
        <div class="jornada-units">
          <label class="jornada-units__label" for="units-${e.jornada_match_id}">Unidades</label>
          <input type="number" id="units-${e.jornada_match_id}" class="jornada-units__input" min="0" max="${Ie}" value="${t.units}" ${a?"disabled":""} />
        </div>
      </div>
      ${a?"":`
        <div class="jornada-match__warning" id="warning-${e.jornada_match_id}"></div>
        <button class="btn btn--primary btn--full jornada-match__save-btn" data-jm-id="${e.jornada_match_id}">Guardar</button>
      `}
    </div>
  `}function ke(){const e=document.getElementById("unitsCounter");if(!e)return;const a=A>F;e.innerHTML=`
    <div class="units-counter__bar">
      <div class="units-counter__fill ${a?"units-counter__fill--over":""}" style="width:${Math.min(100,A/F*100)}%"></div>
    </div>
    <span class="units-counter__label ${a?"units-counter__label--over":""}">${A}/${F} unidades usadas</span>
  `}function xe(){if(!se)return;const e=document.getElementById(`warning-${se}`);if(!e)return;const a=F-A;e.innerHTML=a>0?`<p class="notice">Te quedan ${a} unidades — es tu último partido.</p>`:""}function _e(){A=Object.values(N).reduce((e,a)=>e+(a.predicted_result?a.units:0),0),ke(),xe()}function Pa(e,a,t){e.querySelectorAll(".jornada-tab").forEach(s=>{s.addEventListener("click",()=>{const n=parseInt(s.dataset.idx);n!==t&&Se(e,a,n)})}),e.querySelectorAll(".jornada-match").forEach(s=>{var o;const n=parseInt(s.dataset.jmId);s.querySelectorAll('input[type="radio"]').forEach(d=>{d.addEventListener("change",()=>{N[n].predicted_result=d.value,_e()})});const i=s.querySelector(".jornada-units__input");i==null||i.addEventListener("input",()=>{let d=parseInt(i.value);isNaN(d)&&(d=0),d=Math.max(0,Math.min(Ie,d)),N[n].units=d,_e()}),(o=s.querySelector(".jornada-match__save-btn"))==null||o.addEventListener("click",()=>Ma(n))})}async function Ma(e){const a=N[e];if(!a.predicted_result){g("Selecciona un resultado 1X2","error");return}if(A>F){g(`Superas el máximo de ${F} unidades`,"error");return}const t=document.querySelector(`.jornada-match__save-btn[data-jm-id="${e}"]`);t&&(t.disabled=!0,t.textContent="…");try{await l.jornada.predict({jornada_match_id:e,predicted_result:a.predicted_result,units:a.units}),g("Predicción guardada"),t&&(t.textContent="✓ Guardada")}catch(s){g(s.message||"Error al guardar","error")}finally{t&&(t.disabled=!1,setTimeout(()=>{t&&(t.textContent="Guardar")},2e3))}}const be={en_curso:{label:"En curso",cls:"duelo-status--curso"},ganado:{label:"Ganaste",cls:"duelo-status--ganado"},perdido:{label:"Perdiste",cls:"duelo-status--perdido"},empate:{label:"Empate",cls:"duelo-status--empate"}};async function Da(e){var a;e.innerHTML='<div class="loading"><div class="loading__spinner"></div></div>';try{const{duelo:t}=await l.duelo.current(),s=y.getUser();if(!t){e.innerHTML=`
        <div class="container">
          <h1 class="page-title">Tu duelo esta jornada</h1>
          <div class="duelo-empty">
            <div class="duelo-empty__icon">🤝</div>
            <p class="duelo-empty__text">No tienes un duelo asignado esta jornada.</p>
          </div>
        </div>
      `;return}const n=be[t.status]??be.en_curso,i=t.rival?t.rival.username:s.username,o=!t.rival||t.rival.id===s.id;e.innerHTML=`
      <div class="container">
        <h1 class="page-title">Tu duelo esta jornada</h1>

        <div class="duelo-card">
          <span class="duelo-status ${n.cls}">${n.label}</span>
          <div class="duelo-card__matchup">
            <div class="duelo-card__player">
              <span class="duelo-card__name">${s.username}</span>
              <span class="duelo-card__pts">${t.my_points}</span>
            </div>
            <span class="duelo-card__vs">VS</span>
            <div class="duelo-card__player">
              <span class="duelo-card__name">${o?"Descanso":i}</span>
              <span class="duelo-card__pts">${o?"—":t.rival_points}</span>
            </div>
          </div>
        </div>

        ${!o&&((a=t.matches)==null?void 0:a.length)>0?`
          <h2 class="section-title">Partido a partido</h2>
          <div class="duelo-matches">
            ${t.matches.map(d=>Ha(d,i)).join("")}
          </div>
        `:""}

        <h2 class="section-title">Clasificación divisional</h2>
        <div id="divisionStandings"><div class="loading"><div class="loading__spinner"></div></div></div>
      </div>
    `,qa(t.division_league_id,s.id)}catch(t){e.innerHTML=`<div class="container"><p class="form__error">Error cargando el duelo: ${t.message}</p></div>`}}function Ha(e,a){var i;const t=(i=e.my_prediction)==null?void 0:i.predicted_result;let s,n;return e.started?e.rival_prediction?(s=e.rival_prediction.predicted_result,n=""):(s="—",n="duelo-pick__value--empty"):(s="?",n="duelo-pick__value--hidden"),`
    <div class="match-card duelo-pick-card">
      <div class="match-card__header">
        <span class="match-card__date">${T(e.match_datetime)}</span>
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
  `}async function qa(e,a){const t=document.getElementById("divisionStandings");if(t)try{const{standings:s}=await l.clasificacion.division(e);if(s.length===0){t.innerHTML='<p class="empty">Sin clasificación disponible.</p>';return}t.innerHTML=`
      <div class="ranking-table-wrapper">
        <table class="ranking-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Usuario</th>
              <th>PJ</th>
              <th>G</th>
              <th>E</th>
              <th>P</th>
              <th>Pts división</th>
            </tr>
          </thead>
          <tbody>
            ${s.map(n=>`
              <tr class="${n.user_id===a?"ranking-table__row--me":""}">
                <td class="ranking-table__pos" data-pos="${n.pos}">${n.pos}</td>
                <td>${n.username}${n.is_bot?" 🤖":""}</td>
                <td class="ranking-table__stat">${n.pj}</td>
                <td class="ranking-table__stat">${n.g}</td>
                <td class="ranking-table__stat">${n.e}</td>
                <td class="ranking-table__stat">${n.p}</td>
                <td class="ranking-table__pts">${n.pts_division}</td>
              </tr>
            `).join("")}
          </tbody>
        </table>
      </div>
    `}catch(s){t.innerHTML=`<p class="form__error">Error cargando la clasificación: ${s.message}</p>`}}async function Aa(e,{query:a={}}={}){e.innerHTML='<div class="loading"><div class="loading__spinner"></div></div>';try{const{standings:t}=await l.clasificacion.general(),s=y.getUser();e.innerHTML=`
      <div class="container">
        <h1 class="page-title">Clasificación</h1>

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
                          ${n.is_bot||s&&n.user_id===s.id?K(n.username):`<button class="user-link" data-user-id="${n.user_id}">${K(n.username)}</button>`}
                        </td>
                        <td class="ranking-table__stat">${n.pts_jornada_actual}</td>
                        <td class="ranking-table__pts">${n.pts_general}</td>
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
      </div>
    `,Oa(s,a.tab),Na(),za(e,s)}catch(t){e.innerHTML=`<div class="container"><p class="form__error">Error cargando la clasificación: ${t.message}</p></div>`}}async function Na(){const e=document.getElementById("tablonTabDot");if(!e)return;if(!y.getUser()){e.classList.add("hidden");return}const t=localStorage.getItem("tablon_general_last_read")||new Date(0).toISOString();try{const{count:s}=await l.board.unread(null,t);console.log("[tablonDot] count:",s,"since:",t),e.classList.toggle("hidden",s===0)}catch(s){console.warn("[tablonDot] error:",s),e.classList.add("hidden")}}function Oa(e,a){const t={general:{btn:document.getElementById("tabGeneral"),panel:document.getElementById("panelGeneral")},miDivision:{btn:document.getElementById("tabMiDivision"),panel:document.getElementById("panelMiDivision")},divisiones:{btn:document.getElementById("tabDivisiones"),panel:document.getElementById("panelDivisiones")},tablon:{btn:document.getElementById("tabTablon"),panel:document.getElementById("panelTablon")}};function s(i){for(const[o,{btn:d,panel:c}]of Object.entries(t))d.classList.toggle("league-tab--active",o===i),c.classList.toggle("hidden",o!==i)}t.general.btn.addEventListener("click",()=>s("general")),t.miDivision.btn.addEventListener("click",()=>{s("miDivision"),t.miDivision.panel.dataset.loaded||(t.miDivision.panel.dataset.loaded="1",Ua(e))}),t.divisiones.btn.addEventListener("click",()=>{s("divisiones"),t.divisiones.panel.dataset.loaded||(t.divisiones.panel.dataset.loaded="1",Ra(e))});function n(){var i;s("tablon"),localStorage.setItem("tablon_general_last_read",new Date().toISOString()),(i=document.getElementById("tablonTabDot"))==null||i.classList.add("hidden"),document.dispatchEvent(new CustomEvent("tablon:read")),t.tablon.panel.dataset.loaded||(t.tablon.panel.dataset.loaded="1",oe(t.tablon.panel,{forceGeneral:!0}))}t.tablon.btn.addEventListener("click",n),a==="tablon"&&n()}async function Ua(e){const a=document.getElementById("panelMiDivision");if(a)try{const{standings:t}=await l.clasificacion.division();if(t.length===0){a.innerHTML='<p class="empty">Todavía no perteneces a ninguna división.</p>';return}a.innerHTML=`
      <div class="ranking-table-wrapper">
        <table class="ranking-table">
          <thead>
            <tr><th>#</th><th>Usuario</th><th>PJ</th><th>G</th><th>E</th><th>P</th><th>Pts div</th></tr>
          </thead>
          <tbody>
            ${t.map(s=>Be(s,e)).join("")}
          </tbody>
        </table>
      </div>
    `}catch(t){a.innerHTML=`<p class="form__error">Error: ${t.message}</p>`}}async function Ra(e){const a=document.getElementById("panelDivisiones");if(a)try{const{divisions:t}=await l.clasificacion.allDivisions();if(!t.length){a.innerHTML='<p class="empty">No hay divisiones activas.</p>';return}a.innerHTML=t.map(s=>Ja(s,e)).join(""),a.querySelectorAll(".div-accordion__header").forEach(s=>{s.addEventListener("click",()=>{const i=s.nextElementSibling.classList.toggle("hidden");s.querySelector(".div-accordion__chevron").textContent=i?"▶":"▼"})})}catch(t){a.innerHTML=`<p class="form__error">Error: ${t.message}</p>`}}function Ja(e,a){const t=e.standings.some(s=>a&&s.user_id===a.id);return`
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
              ${e.standings.map(s=>Be(s,a)).join("")}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `}function K(e){return String(e||"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;")}function za(e,a){let t=document.getElementById("userCtxMenu");t||(t=document.createElement("div"),t.id="userCtxMenu",t.className="user-ctx-menu hidden",t.innerHTML=`
      <a class="user-ctx-menu__item" id="ctxProfile" href="#">👤 Ver jugador</a>
      <button class="user-ctx-menu__item" id="ctxMessage">💬 Enviar mensaje</button>
    `,document.body.appendChild(t),document.addEventListener("click",s=>{!s.target.closest("#userCtxMenu")&&!s.target.closest(".user-link")&&t.classList.add("hidden")},!0)),e.addEventListener("click",s=>{const n=s.target.closest(".user-link");if(!n)return;s.stopPropagation();const i=n.dataset.userId,o=n.getBoundingClientRect();t.querySelector("#ctxProfile").href=`#/jugador/${i}`,t.querySelector("#ctxMessage").onclick=()=>{t.classList.add("hidden"),window.location.hash=`/mensajes/${i}`},t.classList.remove("hidden");const d=180;let c=o.left;c+d>window.innerWidth-8&&(c=window.innerWidth-d-8),t.style.top=`${o.bottom+window.scrollY+4}px`,t.style.left=`${c}px`})}function Be(e,a){const t=a&&e.user_id===a.id,s=e.zone==="promotion"?"background:rgba(0,255,135,0.08)":e.zone==="relegation"?"background:rgba(255,56,96,0.08)":"";return`
    ${e.pos===5?'<tr class="div-separator div-separator--top"><td colspan="7"></td></tr>':e.pos===13?'<tr class="div-separator div-separator--bottom"><td colspan="7"></td></tr>':""}
    <tr class="${t?"ranking-table__row--me":""}" style="${s}">
      <td class="ranking-table__pos" data-pos="${e.pos}">${e.pos}</td>
      <td>${t||e.is_bot?K(e.username):`<button class="user-link" data-user-id="${e.user_id}">${K(e.username)}</button>`}</td>
      <td class="ranking-table__stat">${e.pj}</td>
      <td class="ranking-table__stat">${e.g}</td>
      <td class="ranking-table__stat">${e.e}</td>
      <td class="ranking-table__stat">${e.p}</td>
      <td class="ranking-table__pts">${e.pts_division}</td>
    </tr>
  `}async function he(e,{params:a={}}={}){const t=a.userId?parseInt(a.userId):null;t?await Va(e,t):await Fa(e)}async function Fa(e){e.innerHTML='<div class="loading"><div class="loading__spinner"></div></div>';try{const{conversations:a}=await l.messages.list();e.innerHTML=`
      <div class="container">
        <h1 class="page-title">💬 Mensajes</h1>
        ${a.length===0?'<p class="empty">No tienes conversaciones aún. Pulsa el nombre de un jugador en la clasificación para enviar un mensaje.</p>':`<div class="mensajes-list">${a.map(Ga).join("")}</div>`}
      </div>
    `,e.querySelectorAll(".mensajes-item").forEach(t=>{t.addEventListener("click",()=>{window.location.hash=`/mensajes/${t.dataset.userId}`})})}catch(a){e.innerHTML=`<div class="container"><p class="form__error">Error: ${a.message}</p></div>`}}function Ga(e){return`
    <div class="mensajes-item" data-user-id="${e.user_id}" style="cursor:pointer">
      <div class="mensajes-item__avatar">${V(e.username[0].toUpperCase())}</div>
      <div class="mensajes-item__info">
        <div class="mensajes-item__header">
          <strong class="mensajes-item__name">${V(e.username)}</strong>
          ${e.unread_count>0?`<span class="mensajes-item__badge">${e.unread_count}</span>`:""}
        </div>
        <p class="mensajes-item__preview">${V(e.last_message)}</p>
      </div>
    </div>
  `}async function Va(e,a){var s;e.innerHTML='<div class="loading"><div class="loading__spinner"></div></div>';const t=y.getUser();try{const{messages:n,partner:i}=await l.messages.get(a);document.dispatchEvent(new CustomEvent("messages:read")),e.innerHTML=`
      <div class="container">
        <div class="chat-header">
          <a href="#/mensajes" class="btn btn--ghost btn--sm">← Volver</a>
          <h2 class="chat-header__name">${V((i==null?void 0:i.username)||"Usuario")}</h2>
        </div>

        <div class="chat-messages" id="chatMessages">
          ${n.length===0?'<p class="empty" style="text-align:center">Empieza la conversación.</p>':n.map(d=>fe(d,t)).join("")}
        </div>

        <form class="chat-input" id="chatForm">
          <textarea class="form__textarea chat-input__textarea" id="chatMsg"
            placeholder="Escribe un mensaje…" maxlength="1000" rows="2" required></textarea>
          <button class="btn btn--primary chat-input__btn" type="submit">Enviar</button>
        </form>
      </div>
    `;const o=document.getElementById("chatMessages");o&&(o.scrollTop=o.scrollHeight),(s=document.getElementById("chatForm"))==null||s.addEventListener("submit",async d=>{d.preventDefault();const c=document.getElementById("chatMsg"),_=c.value.trim();if(!_)return;const h=d.target.querySelector('button[type="submit"]');h.disabled=!0;try{const{message:p}=await l.messages.send(a,_);c.value="";const v=document.getElementById("chatMessages"),b=v==null?void 0:v.querySelector(".empty");b&&b.remove(),v==null||v.insertAdjacentHTML("beforeend",fe(p,t)),v&&(v.scrollTop=v.scrollHeight)}catch(p){g(p.message,"error")}finally{h.disabled=!1}})}catch(n){e.innerHTML=`<div class="container"><p class="form__error">Error: ${n.message}</p></div>`}}function fe(e,a){return`
    <div class="chat-message ${a&&e.sender_id===a.id?"chat-message--sent":"chat-message--received"}">
      <div class="chat-message__bubble">${V(e.message)}</div>
      <div class="chat-message__time">${T(e.created_at)}</div>
    </div>
  `}function V(e){return String(e||"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;")}const ye=e=>()=>{window.location.hash=e},Wa={"/":Ae,"/login":Fe,"/register":Ge,"/quiniela":ye("/jornada"),"/resultados":ye("/tabla-v2"),"/ranking":We,"/tablon":oe,"/ligas":Ye,"/ligas/:id":Ke,"/perfil":ea,"/campeon":oa,"/admin":da,"/forgot-password":$a,"/reset-password":Ea,"/unirse":La,"/jugador/:id":ja,"/jornada":Sa,"/duelo":Da,"/tabla-v2":Aa,"/mensajes":he,"/mensajes/:userId":he};function Xa(e){for(const[a,t]of Object.entries(Wa)){const s=[],n=new RegExp("^"+a.replace(/:([^/]+)/g,(o,d)=>(s.push(d),"([^/]+)"))+"$"),i=e.match(n);if(i){const o={};return s.forEach((d,c)=>{o[d]=i[c+1]}),{handler:t,params:o}}}return null}const $e=()=>document.getElementById("mainContent"),j={init(){window.addEventListener("hashchange",()=>this.resolve()),this.resolve()},navigate(e){window.location.hash=e},resolve(){const e=window.location.hash.slice(1)||"/",[a,t]=e.split("?"),s=Object.fromEntries(new URLSearchParams(t||"")),n=Xa(a);if(!n){$e().innerHTML='<div class="error-page"><h2>Página no encontrada</h2><a href="#/">Volver al inicio</a></div>';return}const{handler:i,params:o}=n;if(["/perfil","/admin","/jornada","/duelo","/tabla-v2","/mensajes"].includes(a)&&!y.isLoggedIn()){this.navigate("/login");return}if(a==="/admin"&&!y.isAdmin()){this.navigate("/");return}const c=$e();c.innerHTML='<div class="loading"><div class="loading__spinner"></div></div>',i(c,{params:o,query:s})}};let G=[],J=null,U=null,Q=!1;async function Ya(){document.documentElement.dataset.build="2026-08-09T11",await y.init(),j.init(),Qa(),Za(),tt()}function Ce(){return localStorage.getItem("pwa_installed")==="true"||window.matchMedia("(display-mode: standalone)").matches||window.navigator.standalone===!0}function Za(){window.addEventListener("beforeinstallprompt",e=>{e.preventDefault(),!Ce()&&(J=e,Ka())}),window.addEventListener("appinstalled",()=>{var e;localStorage.setItem("pwa_installed","true"),J=null,(e=document.getElementById("installBanner"))==null||e.remove()})}function Ka(){if(Ce()||sessionStorage.getItem("installBannerDismissed"))return;const e=document.createElement("div");e.id="installBanner",e.className="install-banner",e.innerHTML=`
    <span class="install-banner__text">⚽ Instala PickGoal en tu dispositivo</span>
    <div class="install-banner__actions">
      <button class="install-banner__btn install-banner__btn--primary" id="installBtn">Instalar</button>
      <button class="install-banner__btn install-banner__btn--ghost" id="installDismissBtn">Ahora no</button>
    </div>
  `,document.body.appendChild(e),document.getElementById("installBtn").addEventListener("click",async()=>{J&&(J.prompt(),await J.userChoice,J=null,e.remove())}),document.getElementById("installDismissBtn").addEventListener("click",()=>{sessionStorage.setItem("installBannerDismissed","1"),e.remove()})}function q(){var e,a;(e=document.getElementById("userDropdown"))==null||e.classList.add("hidden"),(a=document.getElementById("userBtn"))==null||a.classList.remove("navbar__dropdown-btn--open")}async function W(){const e=document.getElementById("perfilBadge"),a=document.getElementById("navMensajesDot");if(!y.getUser()){e==null||e.classList.add("hidden"),a==null||a.classList.add("hidden");return}try{const s=localStorage.getItem("tablon_general_last_read")||new Date(0).toISOString(),[n,i]=await Promise.all([l.board.mentions(s).catch(c=>(console.warn("[perfilBadge] mentions error:",c),{count:0})),l.messages.unread().catch(c=>(console.warn("[perfilBadge] pm unread error:",c),{count:0}))]),o=n.count||0,d=i.count||0;console.log("[perfilBadge] mentions:",o,"pm:",d),e==null||e.classList.toggle("hidden",o+d===0),a==null||a.classList.toggle("hidden",d===0)}catch(s){console.warn("[perfilBadge] error:",s),e==null||e.classList.add("hidden"),a==null||a.classList.add("hidden")}}async function ne(){const e=document.getElementById("tablonBadge");if(!e)return;if(!y.getUser()){e.classList.add("hidden");return}const t=localStorage.getItem("activeLeagueId");if(!t){e.classList.add("hidden");return}const s=localStorage.getItem(`tablon_last_read_${t}`)||new Date(0).toISOString();try{const{count:n}=await l.board.unread(parseInt(t),s);n>0?(e.textContent=n>99?"99+":String(n),e.classList.remove("hidden")):e.classList.add("hidden")}catch{e.classList.add("hidden")}}function Qa(){var e,a,t,s;document.addEventListener("auth:change",Ee),window.addEventListener("hashchange",()=>{q(),Te(),setTimeout(ne,200),setTimeout(W,200)}),document.addEventListener("tablon:read",()=>{W()}),document.addEventListener("messages:read",()=>{W()}),document.addEventListener("click",q),(e=document.getElementById("userBtn"))==null||e.addEventListener("click",n=>{var d;n.stopPropagation();const i=document.getElementById("userDropdown"),o=i==null?void 0:i.classList.contains("hidden");q(),o&&(i==null||i.classList.remove("hidden"),(d=document.getElementById("userBtn"))==null||d.classList.add("navbar__dropdown-btn--open"))}),(a=document.getElementById("userDropdown"))==null||a.addEventListener("click",n=>{n.stopPropagation(),n.target.closest("#navProfileLink")&&q()}),(t=document.getElementById("navMensajesLink"))==null||t.addEventListener("click",async n=>{n.preventDefault(),n.stopPropagation(),q(),Q?ie():await st()}),document.addEventListener("click",n=>{Q&&!n.target.closest("#notifPanel")&&!n.target.closest("#navMensajesLink")&&ie()}),(s=document.getElementById("navLogoutBtn"))==null||s.addEventListener("click",()=>{G=[],localStorage.removeItem("activeLeagueId"),q(),y.logout(),j.navigate("/")}),Ee()}async function Ee(){var i;const e=document.getElementById("navAuthLinks"),a=document.getElementById("userBtn"),t=document.getElementById("navUsername"),s=document.getElementById("bottomNav"),n=y.getUser();if(q(),n){e==null||e.classList.add("hidden"),t&&(t.textContent=n.username),a.style.visibility="visible",s==null||s.classList.remove("hidden"),document.body.classList.add("has-bottom-nav"),(i=document.getElementById("navAdminLink"))==null||i.classList.toggle("hidden",!n.is_admin);try{const{leagues:o}=n.is_admin?await l.leagues.adminAll():await l.leagues.my();G=o}catch{G=[]}et(G),ne(),W(),U&&clearInterval(U),U=setInterval(()=>{ne(),W()},5*60*1e3)}else e==null||e.classList.remove("hidden"),a.style.visibility="hidden",s==null||s.classList.add("hidden"),document.body.classList.remove("has-bottom-nav"),G=[],localStorage.removeItem("activeLeagueId"),U&&(clearInterval(U),U=null);Te()}function et(e){const a=localStorage.getItem("activeLeagueId");a&&e.some(s=>String(s.id)===String(a))||(e.length>0?localStorage.setItem("activeLeagueId",String(e[0].id)):localStorage.removeItem("activeLeagueId"))}function Te(){const e=window.location.hash.slice(1).split("?")[0]||"/";document.querySelectorAll(".bottom-nav__item").forEach(a=>{const t=a.dataset.route,s=t==="/"?e==="/":e===t||e.startsWith(t+"/");a.classList.toggle("bottom-nav__item--active",s)})}function at(e){const a="=".repeat((4-e.length%4)%4),t=(e+a).replace(/-/g,"+").replace(/_/g,"/"),s=atob(t);return Uint8Array.from([...s].map(n=>n.charCodeAt(0)))}async function tt(){if(!(!("serviceWorker"in navigator)||!("PushManager"in window)))try{const e=await navigator.serviceWorker.register("/sw.js");document.addEventListener("auth:change",async a=>{a.detail&&await Le(e)}),y.getUser()&&await Le(e)}catch{}}async function Le(e){try{if(await Notification.requestPermission()!=="granted")return;const t=await e.pushManager.getSubscription();if(t){await l.notifications.subscribe(t.toJSON());return}const{public_key:s}=await l.notifications.vapidPublicKey();if(!s)return;const n=await e.pushManager.subscribe({userVisibleOnly:!0,applicationServerKey:at(s)});await l.notifications.subscribe(n.toJSON())}catch{}}function ie(){var e;(e=document.getElementById("notifPanel"))==null||e.classList.add("hidden"),Q=!1}async function st(){const e=document.getElementById("notifPanel"),a=document.getElementById("notifPanelBody");if(!(!e||!a)){Q=!0,e.classList.remove("hidden"),a.innerHTML='<div class="loading"><div class="loading__spinner"></div></div>';try{const t=new Date(Date.now()-2592e6).toISOString(),[s,n,i]=await Promise.all([l.messages.list().catch(()=>({conversations:[]})),l.board.messages(1,null).catch(()=>({messages:[]})),l.board.mentions(t).catch(()=>({messages:[]}))]),o=(s.conversations||[]).slice(0,5),d=(n.messages||[]).slice(0,5),c=new Set((i.messages||[]).map(_=>_.id));a.innerHTML=nt(o,d,c),a.querySelectorAll(".notif-item[data-nav]").forEach(_=>{_.addEventListener("click",()=>{ie(),window.location.hash=_.dataset.nav})})}catch{a.innerHTML='<p class="notif-panel__empty">Error cargando notificaciones</p>'}}}function nt(e,a,t){const s=e.length===0?'<p class="notif-panel__empty">Aún no tienes mensajes</p>':e.map(i=>`
        <div class="notif-item" data-nav="/mensajes/${i.user_id}">
          <div class="notif-item__avatar">${R(i.username[0].toUpperCase())}</div>
          <div class="notif-item__content">
            <div class="notif-item__header">
              <strong class="notif-item__name">${R(i.username)}</strong>
              ${i.unread_count>0?`<span class="notif-item__badge">${i.unread_count}</span>`:""}
            </div>
            <p class="notif-item__text">${R((i.last_message||"").slice(0,70))}${(i.last_message||"").length>70?"…":""}</p>
          </div>
        </div>
      `).join("")+'<a class="notif-panel__link" href="#/mensajes">Ver todos los mensajes →</a>',n=a.length===0?'<p class="notif-panel__empty">Aún no hay mensajes en el tablón</p>':a.map(i=>{const o=t.has(i.id);return`
          <div class="notif-item${o?" notif-item--notable":""}" data-nav="/tabla-v2?tab=tablon">
            <div class="notif-item__avatar">${R(i.username[0].toUpperCase())}</div>
            <div class="notif-item__content">
              <div class="notif-item__header">
                <strong class="notif-item__name">${R(i.username)}</strong>
                ${o?'<span class="notif-item__mention">@tú / admin</span>':""}
                <span class="notif-item__time">${T(i.created_at)}</span>
              </div>
              <p class="notif-item__text">${R((i.message||"").slice(0,80))}${(i.message||"").length>80?"…":""}</p>
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
  `}function R(e){return String(e||"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;")}Ya();
