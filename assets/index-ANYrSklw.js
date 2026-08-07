(function(){const a=document.createElement("link").relList;if(a&&a.supports&&a.supports("modulepreload"))return;for(const n of document.querySelectorAll('link[rel="modulepreload"]'))s(n);new MutationObserver(n=>{for(const i of n)if(i.type==="childList")for(const d of i.addedNodes)d.tagName==="LINK"&&d.rel==="modulepreload"&&s(d)}).observe(document,{childList:!0,subtree:!0});function t(n){const i={};return n.integrity&&(i.integrity=n.integrity),n.referrerPolicy&&(i.referrerPolicy=n.referrerPolicy),n.crossOrigin==="use-credentials"?i.credentials="include":n.crossOrigin==="anonymous"?i.credentials="omit":i.credentials="same-origin",i}function s(n){if(n.ep)return;n.ep=!0;const i=t(n);fetch(n.href,i)}})();const we="https://pickgoal-backend.onrender.com/api";function Ie(){return localStorage.getItem("token")}async function u(e,a={}){const t={"Content-Type":"application/json",...a.headers},s=Ie();s&&(t.Authorization=`Bearer ${s}`);const n=await fetch(`${we}${e}`,{...a,headers:t}),i=await n.json().catch(()=>({}));if(!n.ok)throw{status:n.status,message:i.error||"Error desconocido"};return i}const m={get:e=>u(e),post:(e,a)=>u(e,{method:"POST",body:JSON.stringify(a)}),patch:(e,a)=>u(e,{method:"PATCH",body:JSON.stringify(a)}),delete:e=>u(e,{method:"DELETE"}),auth:{register:e=>u("/auth/register",{method:"POST",body:JSON.stringify(e)}),login:e=>u("/auth/login",{method:"POST",body:JSON.stringify(e)}),me:()=>u("/auth/me"),forgotPassword:e=>u("/auth/forgot-password",{method:"POST",body:JSON.stringify({email:e})}),resetPassword:(e,a)=>u("/auth/reset-password",{method:"POST",body:JSON.stringify({token:e,password:a})}),ranking:e=>u(`/auth/ranking${e?`?league_id=${e}`:""}`),deleteAccount:()=>u("/auth/account",{method:"DELETE"}),users:()=>u("/auth/users"),toggleAdmin:e=>u(`/auth/users/${e}/toggle-admin`,{method:"PATCH"})},matches:{grouped:()=>u("/matches/grouped"),list:(e="")=>u(`/matches/${e}`),get:e=>u(`/matches/${e}`),today:()=>u("/matches/today"),setResult:(e,a,t,s=null)=>u(`/matches/${e}/result`,{method:"PATCH",body:JSON.stringify({home_score:a,away_score:t,...s?{result_90:s}:{}})}),sync:()=>u("/matches/sync",{method:"POST"}),recalculate:()=>u("/matches/recalculate",{method:"POST"})},predictions:{mine:e=>u(`/predictions/${e?`?league_id=${e}`:""}`),forMatch:(e,a)=>u(`/predictions/match/${e}${a?`?league_id=${a}`:""}`),save:e=>u("/predictions/",{method:"POST",body:JSON.stringify(e)}),forUser:(e,a)=>u(`/predictions/user/${e}${a?`?league_id=${a}`:""}`),getChampion:e=>u(`/predictions/champion${e?`?league_id=${e}`:""}`),saveChampion:(e,a)=>u("/predictions/champion",{method:"POST",body:JSON.stringify({team_name:e,league_id:a??null})}),awardChampion:e=>u("/predictions/champion/award",{method:"POST",body:JSON.stringify({team_name:e})})},leagues:{all:()=>u("/leagues/all"),public:()=>u("/leagues/public"),my:()=>u("/leagues/my"),create:e=>u("/leagues/",{method:"POST",body:JSON.stringify(e)}),join:e=>u("/leagues/join",{method:"POST",body:JSON.stringify(e)}),joinByCode:e=>u(`/leagues/join/${encodeURIComponent(e)}`),adminAll:()=>u("/leagues/admin"),get:e=>u(`/leagues/${e}`),update:(e,a)=>u(`/leagues/${e}`,{method:"PUT",body:JSON.stringify(a)}),leave:e=>u(`/leagues/${e}/leave`,{method:"DELETE"}),members:e=>u(`/leagues/${e}/members`),matchPredictions:(e,a)=>u(`/leagues/${e}/predictions/${a}`)},home:{summary:()=>u("/home/summary")},board:{messages:(e=1,a=null)=>u(`/board/?page=${e}${a?`&league_id=${a}`:""}`),unread:(e,a)=>u(`/board/unread?league_id=${e}&since=${encodeURIComponent(a)}`),post:(e,a=null)=>u("/board/",{method:"POST",body:JSON.stringify({message:e,league_id:a})}),pin:e=>u(`/board/${e}/pin`,{method:"POST"}),reply:(e,a)=>u(`/board/${e}/reply`,{method:"POST",body:JSON.stringify({message:a})}),delete:e=>u(`/board/${e}`,{method:"DELETE"})},notifications:{vapidPublicKey:()=>u("/notifications/vapid-public-key"),subscribe:e=>u("/notifications/subscribe",{method:"POST",body:JSON.stringify(e)}),send:e=>u("/notifications/send",{method:"POST",body:JSON.stringify(e)})},adminV2:{partidos:e=>u(`/v2/admin/partidos-disponibles?semana=${encodeURIComponent(e)}`),jornadas:()=>u("/v2/admin/jornadas"),createJornada:e=>u("/v2/admin/jornada",{method:"POST",body:JSON.stringify(e)}),updateJornada:(e,a)=>u(`/v2/admin/jornada/${e}`,{method:"PUT",body:JSON.stringify(a)}),deleteJornada:e=>u(`/v2/admin/jornada/${e}`,{method:"DELETE"}),publishJornada:e=>u(`/v2/admin/jornada/${e}/publish`,{method:"POST"})},jornada:{info:()=>u("/v2/jornada/info"),current:()=>u("/v2/jornada/current"),list:()=>u("/v2/jornada/list"),predict:e=>u("/v2/jornada/predict",{method:"POST",body:JSON.stringify({predictions:e})}),history:()=>u("/v2/jornada/history")},duelo:{current:()=>u("/v2/duelo/current")},clasificacion:{division:e=>u(`/v2/clasificacion/division${e?`?league_id=${e}`:""}`),general:()=>u("/v2/clasificacion/general"),allDivisions:()=>u("/v2/clasificacion/all-divisions")}};let P=null;const h={async init(){if(localStorage.getItem("token"))try{const{user:a}=await m.auth.me();P=a}catch{localStorage.removeItem("token")}},setUser(e,a){P=e,localStorage.setItem("token",a),document.dispatchEvent(new CustomEvent("auth:change",{detail:e}))},logout(){P=null,localStorage.removeItem("token"),document.dispatchEvent(new CustomEvent("auth:change",{detail:null}))},getUser(){return P},isLoggedIn(){return!!P},isAdmin(){return(P==null?void 0:P.is_admin)===!0}};let V=null;function p(e,a="success"){let t=document.getElementById("toast");t||(t=document.createElement("div"),t.id="toast",document.body.appendChild(t)),t.textContent=e,t.className=`toast toast--${a} toast--visible`,V&&clearTimeout(V),V=setTimeout(()=>{t.classList.remove("toast--visible")},3e3)}function je(){return`
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
  `}function ae(e){const a=e.querySelector("#pointsModal"),t=e.querySelector("#btnPointsInfo"),s=e.querySelector("#pointsClose"),n=e.querySelector("#pointsOverlay");function i(){a.classList.add("points-modal--open"),document.body.style.overflow="hidden"}function d(){a.classList.remove("points-modal--open"),document.body.style.overflow=""}return t==null||t.addEventListener("click",i),s==null||s.addEventListener("click",d),n==null||n.addEventListener("click",d),document.addEventListener("keydown",l=>{l.key==="Escape"&&d()},{once:!1}),i}function D(e){return e?new Date(e).toLocaleString("es-ES",{day:"2-digit",month:"2-digit",year:"numeric",hour:"2-digit",minute:"2-digit"}):"—"}async function Se(e){if(!h.getUser()){ke(e);return}e.innerHTML='<div class="loading"><div class="loading__spinner"></div></div>';try{const{leagues_summary:t,division_summary:s,upcoming_matches:n}=await m.home.summary();if(s){e.innerHTML=`
        <div class="home-dashboard container">
          <div class="home-dashboard__topbar">
            <button class="btn btn--ghost btn--sm" id="btnPointsInfo">📊 Sistema de puntos</button>
          </div>
          ${xe(s)}
          ${Pe()}
          ${te(n)}
        </div>
        ${ee()}
      `,ae(e);return}if(!t||t.length===0){Be(e);return}const i=(()=>{const l=localStorage.getItem("activeLeagueId");return l?parseInt(l):null})(),d=[...t].sort((l,c)=>l.league_id===i?-1:c.league_id===i?1:0);e.innerHTML=`
      <div class="home-dashboard container">
        <div class="home-dashboard__topbar">
          <button class="btn btn--ghost btn--sm" id="btnPointsInfo">📊 Sistema de puntos</button>
        </div>

        <h3 class="home-dashboard__section-title">Mis ligas</h3>
        <div class="home-dashboard__leagues">
          ${d.map(l=>Te(l)).join("")}
        </div>

        <div class="home-dashboard__create">
          <a href="#/ligas" class="btn btn--ghost btn--sm">+ Crear liga privada</a>
        </div>

        ${te(n)}
      </div>
      ${ee()}
    `,ae(e),e.querySelectorAll(".league-card[data-league-id]").forEach(l=>{l.style.cursor="pointer",l.addEventListener("click",c=>{c.target.closest("[data-go-ranking]")||c.target.closest("a")||(localStorage.setItem("activeLeagueId",l.dataset.leagueId),$.navigate(`/ligas/${l.dataset.leagueId}`))})}),e.querySelectorAll("[data-go-ranking]").forEach(l=>{l.addEventListener("click",c=>{c.stopPropagation(),localStorage.setItem("activeLeagueId",l.dataset.goRanking),$.navigate("/ranking")})})}catch(t){e.innerHTML=`<div class="container"><p class="form__error">Error cargando el inicio: ${t.message}</p></div>`}}async function ke(e){const t=new Date>=new Date("2026-08-15T00:00:00Z");let s=null;if(t)try{s=await m.jornada.info()}catch{}e.innerHTML=`
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
      ${me(s,t)}
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
  `}function Be(e){e.innerHTML=`
    <div class="home-dashboard container">
      ${me()}
    </div>
  `}function xe(e){const a={promotion:"⬆️ Zona ascenso",relegation:"⬇️ Zona descenso",mid:""},t=a[e.zone]?`<span class="div-card__zone div-card__zone--${e.zone}">${a[e.zone]}</span>`:"";return`
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
  `}function Ce(e){const a=new Date,t=new Date(e),s=Math.ceil((t-a)/(1e3*60*60*24));return Math.max(0,s)}function me(e=null,a=!1){let t,s;if(a&&(e!=null&&e.jornada_number))s="Temporada 26/27 · En curso",t=`
      <div class="pg-league-card__jornada">
        <span class="pg-league-card__jornada-num">J${e.jornada_number}</span>
        <span class="pg-league-card__jornada-label">jornada actual</span>
      </div>`;else if(a)s="Temporada 26/27 · En curso",t='<div class="pg-league-card__countdown pg-league-card__countdown--soon">Temporada en curso</div>';else{const n=Ce("2026-08-15");s="Temporada 26/27 · Próximamente",t=n>0?`<div class="pg-league-card__countdown">
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
  `}function Te(e){const a=e.next_to_predict?`<div class="league-card__next">
         <span class="league-card__next-label">Próximo a predecir</span>
         <span class="league-card__next-match">${e.next_to_predict.home_team} vs ${e.next_to_predict.away_team}</span>
         <span class="league-card__next-date">${D(e.next_to_predict.match_datetime)}</span>
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
  `}function te(e){return e.length?`
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
              <span class="upcoming-match__date">${D(a.match_datetime)}</span>
              ${t?'<span class="upcoming-match__badge upcoming-match__badge--done">Predicho</span>':'<span class="upcoming-match__badge upcoming-match__badge--pending">Sin predecir</span>'}
            </div>
          </div>
        `).join("")}
      </div>
      <a class="btn btn--ghost btn--sm" href="#/jornada">Ver jornada actual</a>
    </section>
  `:""}function Pe(){return`
    <div class="prize-banner">
      <span class="prize-banner__icon">🏆</span>
      <div>
        <strong>Premio temporada 26/27</strong>
        <p>Camiseta de tu equipo favorito para el campeón de la clasificación general</p>
      </div>
    </div>
  `}const se="pickgoal_welcome_shown";function pe(e="/jornada"){if(localStorage.getItem(se))return;localStorage.setItem(se,"1");const a=document.createElement("div");a.innerHTML=`
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
  `;const t=a.firstElementChild;document.body.appendChild(t),document.body.style.overflow="hidden",requestAnimationFrame(()=>t.classList.add("welcome-modal--open"));function s(n){t.classList.remove("welcome-modal--open"),document.body.style.overflow="",t.addEventListener("transitionend",()=>t.remove(),{once:!0}),n&&(window.location.hash=n)}document.getElementById("welcomeOverlay").addEventListener("click",()=>s()),document.getElementById("welcomeCta").addEventListener("click",()=>s(e)),document.addEventListener("keydown",function n(i){i.key==="Escape"&&(s(),document.removeEventListener("keydown",n))})}function Me(e){e.innerHTML=`
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
  `,document.getElementById("loginForm").addEventListener("submit",async a=>{a.preventDefault();const t=document.getElementById("loginBtn"),s=document.getElementById("loginError"),n=document.getElementById("identifier").value.trim(),i=document.getElementById("password").value;t.disabled=!0,t.textContent="Entrando…",s.classList.add("hidden");try{const{token:d,user:l}=await m.auth.login({identifier:n,password:i});h.setUser(l,d),p(`¡Bienvenido, ${l.username}!`),$.navigate("/"),pe("/")}catch(d){s.textContent=d.message||"Error al iniciar sesión",s.classList.remove("hidden")}finally{t.disabled=!1,t.textContent="Entrar"}})}function De(e){e.innerHTML=`
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
  `,document.getElementById("registerForm").addEventListener("submit",async a=>{a.preventDefault();const t=document.getElementById("registerBtn"),s=document.getElementById("registerError");t.disabled=!0,t.textContent="Creando cuenta…",s.classList.add("hidden");const n={username:document.getElementById("username").value.trim(),email:document.getElementById("email").value.trim(),country:document.getElementById("country").value.trim(),password:document.getElementById("password").value};try{const{token:i,user:d}=await m.auth.register(n);h.setUser(d,i),p("¡Cuenta creada! Bienvenido a PickGoal");const l=sessionStorage.getItem("pendingInviteCode");if(l){sessionStorage.removeItem("pendingInviteCode");try{const{league:c}=await m.leagues.joinByCode(l);p(`¡Te has unido a "${c.name}"!`),$.navigate(`/ligas/${c.id}`)}catch{$.navigate("/ligas")}}else $.navigate("/"),pe("/")}catch(i){s.textContent=i.message||"Error al registrarse",s.classList.remove("hidden")}finally{t.disabled=!1,t.textContent="Crear cuenta"}})}function He(){const e=localStorage.getItem("activeLeagueId");return e?parseInt(e):null}async function Ae(e){var a,t;e.innerHTML='<div class="loading"><div class="loading__spinner"></div></div>';try{if(h.isLoggedIn()){const{leagues:g}=await m.leagues.my();if(g.length===0){e.innerHTML=je();return}}const s=He(),[{ranking:n},i]=await Promise.all([m.auth.ranking(s),h.isLoggedIn()?m.leagues.my():Promise.resolve({leagues:[]})]),d=h.getUser(),l=i.leagues.find(g=>g.id===s),c=document.getElementById("tablonBadge"),v=c&&!c.classList.contains("hidden"),f=v?c.textContent:"",_=((a=n[0])==null?void 0:a.matches_played)??0;e.innerHTML=`
      ${l?`<span class="page-league-name">${l.name}</span>`:""}
      <div class="container">
        <div class="ranking-header">
          <h1 class="page-title">Clasificación</h1>
          ${s?`
            <button class="ranking-tablon-btn" data-league-id="${s}">
              💬 Tablón
              <span class="ranking-tablon-btn__badge${v?"":" hidden"}">${f}</span>
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
              ${n.map(g=>{var x,o,r;const b=g.predictions_made??0,E=`${b}/${_}`,k=`${g.correct_results??0}/${b}`,B=`${g.exact_scores??0}/${b}`;return`
                  <tr class="${d&&g.id===d.id?"ranking-table__row--me":""}">
                    <td class="ranking-table__pos" data-pos="${g.position}">${g.position}</td>
                    <td>
                      <a class="ranking-table__link" href="#/jugador/${g.id}">
                        <span class="status-emoji" title="${((x=g.status)==null?void 0:x.name)||""}">${((o=g.status)==null?void 0:o.emoji)||""}</span>${g.username}
                      </a>
                    </td>
                    <td class="ranking-table__stat ranking-table__status">${((r=g.status)==null?void 0:r.name)||"—"}</td>
                    <td class="ranking-table__stat">${E}</td>
                    <td class="ranking-table__stat">${k}</td>
                    <td class="ranking-table__stat">${B}</td>
                    <td class="ranking-table__pts">${g.total_points}</td>
                  </tr>
                `}).join("")}
            </tbody>
          </table>
        </div>
      </div>
    `,(t=e.querySelector(".ranking-tablon-btn"))==null||t.addEventListener("click",()=>{$.navigate(`/tablon?liga=${s}`)})}catch(s){e.innerHTML=`<div class="container"><p class="form__error">Error: ${s.message}</p></div>`}}async function ge(e,{query:a={}}={}){e.innerHTML='<div class="loading"><div class="loading__spinner"></div></div>';const t=h.getUser();let s=a.liga?parseInt(a.liga):null;if(s){localStorage.setItem(`tablon_last_read_${s}`,new Date().toISOString());const o=document.getElementById("tablonBadge");o&&(o.classList.add("hidden"),o.textContent="")}let n=null,i=[],d=1,l=1;try{if(!s&&t){const{leagues:o}=await m.leagues.my();o&&o.length&&(s=o[0].id,n=o[0].name)}else if(s)try{const{league:o}=await m.leagues.get(s);n=o.name}catch{}if(s&&t)try{const{members:o}=await m.leagues.members(s);i=o||[]}catch{}}catch{}async function c(){const o=await m.board.messages(d,s);return l=o.pages||1,o}try{const o=await c();v(o)}catch(o){e.innerHTML=`<div class="container"><p class="form__error">Error: ${o.message}</p></div>`}function v(o){const{pinned:r=[],messages:y=[]}=o;e.innerHTML=`
      <div class="container">
        <div class="board-header">
          <h1 class="page-title">Tablón${n?` · ${n}`:""}</h1>
          ${n?'<span class="board-league-badge">🏆 Liga</span>':'<span class="board-general-badge">🌐 General</span>'}
        </div>

        ${t?`<form class="board-form" id="boardForm">
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

        ${r.length?`<section class="board-section">
               <h2 class="board-section__title">📌 Anuncios fijados</h2>
               <div class="board-pinned" id="boardPinned">
                 ${f(r)}
               </div>
             </section>`:""}

        <section class="board-section">
          ${r.length?'<h2 class="board-section__title">💬 Mensajes</h2>':""}
          <div class="board-messages" id="boardMessages">
            ${g(y)}
          </div>
          ${l>1?`<div class="pagination">
                 <button class="btn btn--ghost btn--sm" id="prevPage" ${d<=1?"disabled":""}>← Anterior</button>
                 <span>Página ${d} / ${l}</span>
                 <button class="btn btn--ghost btn--sm" id="nextPage" ${d>=l?"disabled":""}>Siguiente →</button>
               </div>`:""}
        </section>
      </div>
    `,E(),k(),B()}function f(o){return o.length?o.map(r=>`
      <div class="board-message board-message--pinned" data-id="${r.id}">
        <div class="board-message__header">
          <span class="board-message__pin-badge">📌</span>
          <strong class="board-message__author">${T(r.username)}</strong>
          <span class="board-message__date">${D(r.created_at)}</span>
          ${t!=null&&t.is_admin&&!r.is_deleted?`<button class="btn btn--ghost btn--xs unpin-msg" data-id="${r.id}" title="Desfijar">📌✕</button>`:""}
          ${!r.is_deleted&&t&&(t.id===r.user_id||t.is_admin)?`<button class="btn btn--danger btn--xs delete-msg" data-id="${r.id}">✕</button>`:""}
        </div>
        <p class="board-message__text">${b(r.message)}</p>

        ${r.replies&&r.replies.length?`<div class="board-replies">
               ${r.replies.map(y=>_(y)).join("")}
             </div>`:""}

        ${t&&!r.is_deleted?`<form class="reply-form" id="replyForm-${r.id}" data-parent="${r.id}">
               <div class="reply-form__input-wrap">
                 <input class="form__input reply-input" type="text"
                   placeholder="Responder…" maxlength="500"
                   id="replyInput-${r.id}" />
                 <div class="mention-dropdown hidden" id="mentionDropdown-${r.id}"></div>
               </div>
               <button class="btn btn--outline btn--sm" type="submit">Enviar</button>
             </form>`:""}
      </div>
    `).join(""):""}function _(o){return`
      <div class="board-reply ${o.is_deleted?"board-reply--deleted":""}" data-id="${o.id}">
        <div class="board-reply__header">
          <strong class="board-reply__author">${T(o.username)}</strong>
          <span class="board-reply__date">${D(o.created_at)}</span>
          ${!o.is_deleted&&t&&(t.id===o.user_id||t.is_admin)?`<button class="btn btn--danger btn--xs delete-msg" data-id="${o.id}">✕</button>`:""}
        </div>
        <p class="board-reply__text">${b(o.message)}</p>
      </div>
    `}function g(o){return o.length?o.map(r=>`
      <div class="board-message ${r.is_deleted?"board-message--deleted":""}" data-id="${r.id}">
        <div class="board-message__header">
          <strong class="board-message__author">${T(r.username)}</strong>
          <span class="board-message__date">${D(r.created_at)}</span>
          ${t!=null&&t.is_admin&&!r.is_deleted?`<button class="btn btn--ghost btn--xs pin-msg" data-id="${r.id}" title="Fijar">📌</button>`:""}
          ${!r.is_deleted&&t&&(t.id===r.user_id||t.is_admin)?`<button class="btn btn--danger btn--xs delete-msg" data-id="${r.id}">✕</button>`:""}
        </div>
        <p class="board-message__text">${b(r.message)}</p>
      </div>
    `).join(""):'<p class="empty">Sin mensajes aún. ¡Sé el primero!</p>'}function b(o){const r=T(o);if(!i.length)return r;const y=i.map(L=>Ne(L.username)),j=new RegExp(`@(${y.join("|")})`,"gi");return r.replace(j,'<span class="mention">@$1</span>')}function E(){const o=document.getElementById("boardForm");if(!o)return;const r=document.getElementById("boardMsg"),y=document.getElementById("charCounter"),j=document.getElementById("mentionDropdown");r.addEventListener("input",()=>{y.textContent=`${r.value.length} / 500`,x(r,j)}),o.addEventListener("submit",async L=>{L.preventDefault();const M=r.value.trim();if(M)try{await m.board.post(M,s),r.value="",y.textContent="0 / 500",j.classList.add("hidden");const C=await c();w(C),p("Mensaje publicado")}catch(C){p(C.message,"error")}})}function k(){e.querySelectorAll(".reply-form").forEach(o=>{const r=parseInt(o.dataset.parent),y=o.querySelector(".reply-input"),j=`mentionDropdown-${r}`,L=document.getElementById(j);y==null||y.addEventListener("input",()=>{x(y,L)}),o.addEventListener("submit",async M=>{M.preventDefault();const C=y.value.trim();if(C)try{await m.board.reply(r,C),y.value="",L==null||L.classList.add("hidden");const U=await c();w(U),p("Respuesta enviada")}catch(U){p(U.message,"error")}})}),e.querySelectorAll(".pin-msg").forEach(o=>{o.addEventListener("click",async()=>{try{await m.board.pin(o.dataset.id);const r=await c();w(r),p("Mensaje fijado")}catch(r){p(r.message,"error")}})}),e.querySelectorAll(".unpin-msg").forEach(o=>{o.addEventListener("click",async()=>{try{await m.board.pin(o.dataset.id);const r=await c();w(r),p("Mensaje desfijado")}catch(r){p(r.message,"error")}})})}function B(){e.querySelectorAll(".delete-msg").forEach(o=>{o.addEventListener("click",async()=>{if(confirm("¿Eliminar este mensaje?"))try{await m.board.delete(o.dataset.id);const r=await c();w(r),p("Mensaje eliminado")}catch(r){p(r.message,"error")}})})}function w(o){const{pinned:r=[],messages:y=[]}=o,j=document.getElementById("boardPinned");if(j)j.innerHTML=f(r);else if(r.length){v(o);return}const L=document.getElementById("boardMessages");L&&(L.innerHTML=g(y)),k(),B()}e.addEventListener("click",async o=>{if(o.target.id==="prevPage"&&d>1){d--;const r=await c();w(r)}else if(o.target.id==="nextPage"&&d<l){d++;const r=await c();w(r)}});function x(o,r){if(!r||!i.length)return;const y=o.value,j=o.selectionStart,L=y.slice(0,j),M=L.match(/@(\w*)$/);if(!M){r.classList.add("hidden");return}const C=M[1].toLowerCase(),U=i.filter(S=>S.username.toLowerCase().startsWith(C)&&S.id!==(t==null?void 0:t.id)),Z=[...h.isAdmin()&&"todos".startsWith(C)?[{username:"todos",description:"Notificar a todos los miembros"}]:[],...U.slice(0,6)];if(!Z.length){r.classList.add("hidden");return}r.innerHTML=Z.map(S=>S.description?`<div class="mention-item mention-item--broadcast" data-username="${T(S.username)}">
             <span class="mention-item__name">@${T(S.username)}</span>
             <span class="mention-item__desc">${T(S.description)}</span>
           </div>`:`<div class="mention-item" data-username="${T(S.username)}">${T(S.username)}</div>`).join(""),r.classList.remove("hidden"),r.querySelectorAll(".mention-item").forEach(S=>{S.addEventListener("mousedown",Ee=>{Ee.preventDefault();const Le=S.dataset.username,G=L.replace(/@(\w*)$/,`@${Le} `);if(o.value=G+y.slice(j),o.setSelectionRange(G.length,G.length),r.classList.add("hidden"),o.tagName==="TEXTAREA"){const Q=document.getElementById("charCounter");Q&&(Q.textContent=`${o.value.length} / 500`)}})})}document.addEventListener("click",o=>{!o.target.closest(".board-form__input-wrap")&&!o.target.closest(".reply-form__input-wrap")&&document.querySelectorAll(".mention-dropdown").forEach(r=>r.classList.add("hidden"))},{capture:!0})}function T(e){return String(e).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;")}function Ne(e){return e.replace(/[.*+?^${}()|[\]\\]/g,"\\$&")}async function Oe(e){var a,t,s,n;e.innerHTML='<div class="loading"><div class="loading__spinner"></div></div>';try{const i=h.getUser(),d=i==null?void 0:i.is_admin,[l,c]=await Promise.all([d?m.leagues.adminAll():m.leagues.all(),h.isLoggedIn()&&!d?m.leagues.my():Promise.resolve({leagues:[]})]),v=new Set(c.leagues.map(_=>_.id)),f=d?l.leagues:l.leagues.filter(_=>!v.has(_.id));e.innerHTML=`
      <div class="container">
        <h1 class="page-title">Ligas</h1>

        ${d?`
          <div class="admin-notice">Vista administrador — puedes acceder a cualquier liga sin participar en ella.</div>
        `:""}

        ${i&&!d&&c.leagues.length>0?`
          <section class="section">
            <h2>Mis ligas</h2>
            <div class="leagues-grid">${c.leagues.map(_=>ne(_,!0)).join("")}</div>
          </section>
        `:""}

        ${i?`
          <section class="section ligas-actions">
            <div class="ligas-actions__row">
              <button class="btn btn--primary" id="btnShowCreate">+ Crear liga</button>
              ${d?"":`
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
          <h2>${d?"Todas las ligas":"Ligas disponibles"}</h2>
          ${f.length?`<div class="leagues-grid">${f.map(_=>ne(_,!1,v,d)).join("")}</div>`:d?'<p class="empty">No hay ligas creadas aún.</p>':c.leagues.length>0?'<p class="empty">Ya participas en todas las ligas disponibles.</p>':'<p class="empty">No hay ligas aún. ¡Crea la primera!</p>'}
        </section>
      </div>
    `,e.querySelectorAll('.league-card[data-navigate="true"]').forEach(_=>{_.addEventListener("click",()=>$.navigate(`/ligas/${_.dataset.id}`))}),e.querySelectorAll(".btn-join-league").forEach(_=>{_.addEventListener("click",async g=>{g.stopPropagation();const b=parseInt(_.dataset.id);_.disabled=!0,_.textContent="…";try{const{league:E}=await m.leagues.join({league_id:b});p(`¡Te has unido a "${E.name}"!`),$.navigate(`/ligas/${E.id}`)}catch(E){p(E.message,"error"),_.disabled=!1,_.textContent="Unirse"}})}),e.querySelectorAll(".btn-private-info").forEach(_=>{_.addEventListener("click",g=>{g.stopPropagation(),p("Esta liga es privada. Pide el enlace de invitación a cualquier miembro para unirte.","info")})}),(a=document.getElementById("btnShowCreate"))==null||a.addEventListener("click",()=>{var _,g;(_=document.getElementById("createLeaguePanel"))==null||_.classList.remove("hidden"),(g=document.getElementById("btnShowCreate"))==null||g.classList.add("hidden")}),(t=document.getElementById("btnCancelCreate"))==null||t.addEventListener("click",()=>{var _,g;(_=document.getElementById("createLeaguePanel"))==null||_.classList.add("hidden"),(g=document.getElementById("btnShowCreate"))==null||g.classList.remove("hidden")}),(s=document.getElementById("joinCodeForm"))==null||s.addEventListener("submit",async _=>{_.preventDefault();const g=document.getElementById("inviteCode").value.trim().toUpperCase();if(g)try{const{league:b}=await m.leagues.join({invite_code:g});p(`Te has unido a "${b.name}"`),$.navigate(`/ligas/${b.id}`)}catch(b){p(b.message,"error")}}),(n=document.getElementById("createLeagueForm"))==null||n.addEventListener("submit",async _=>{var x;_.preventDefault();const g=document.getElementById("createBtn");g.disabled=!0,g.textContent="Creando…";const b=document.getElementById("leagueName").value.trim(),E=document.getElementById("leagueDesc").value.trim(),k=document.getElementById("leaguePrize").value.trim(),B=document.getElementById("isPublic").checked,w=((x=document.getElementById("isOfficial"))==null?void 0:x.checked)??!1;try{const{league:o}=await m.leagues.create({name:b,description:E,prize:k,is_public:B,is_official:w});qe(o)}catch(o){p(o.message,"error"),g.disabled=!1,g.textContent="Crear liga"}})}catch(i){e.innerHTML=`<div class="container"><p class="form__error">Error: ${i.message}</p></div>`}}function ne(e,a=!1,t=new Set,s=!1){const n=e.is_official?'<span class="league-badge league-badge--official">⭐ Oficial</span>':"",i=e.is_public?"🌍":"🔒",d=s?`<button class="btn btn--sm btn--outline btn-admin-view" data-id="${e.id}">Ver (admin)</button>`:a?`<button class="btn btn--sm btn--outline" onclick="event.stopPropagation(); window.location.hash='/ligas/${e.id}'">Ver liga</button>`:e.is_public?`<button class="btn btn--sm btn--primary btn-join-league" data-id="${e.id}">Unirse</button>`:'<button class="btn btn--sm btn--ghost btn-private-info">🔒 Solicitar enlace</button>';return`
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
        ${d}
      </div>
    </div>
  `}function qe(e){var s,n;const a=e.invite_link||"",t=document.getElementById("createLeaguePanel");t&&(t.innerHTML=`
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
  `,(s=document.getElementById("btnCopyLink"))==null||s.addEventListener("click",async()=>{try{await navigator.clipboard.writeText(a),p("Enlace copiado")}catch{p("No se pudo copiar","error")}}),(n=document.getElementById("btnShare"))==null||n.addEventListener("click",async()=>{try{await navigator.share({title:`Únete a ${e.name} en PickGoal`,url:a})}catch{}}))}async function Ue(e,{params:a}){var s,n,i,d,l;const t=parseInt(a.id);e.innerHTML='<div class="loading"><div class="loading__spinner"></div></div>';try{const c=await m.leagues.get(t),{league:v,ranking:f,is_member:_,is_admin_view:g}=c,b=h.getUser(),E=v.is_official?'<span class="league-badge league-badge--official">⭐ Oficial</span>':"";e.innerHTML=`
      <div class="container">
        <a href="#/ligas" class="back-link">← Volver a ligas</a>

        ${g?`
          <div class="admin-notice">Vista administrador — no participas en esta liga</div>
        `:""}

        <div class="league-header">
          <h1 class="page-title">${v.name} ${E}</h1>
          ${v.description?`<p class="league-header__desc">${v.description}</p>`:""}
          <div class="league-header__meta">
            <span>${v.is_public?"🌍 Pública":"🔒 Privada"}</span>
            <span>${v.member_count} participantes</span>
            ${v.prize?`<span>🏆 ${v.prize}</span>`:""}
          </div>
        </div>

        ${(_||b!=null&&b.is_admin)&&v.invite_link?`
          <div class="invite-share-box">
            <span class="invite-share-box__label">Enlace de invitación:</span>
            <div class="invite-link-box">
              <span class="invite-link-box__url">${v.invite_link}</span>
              <button class="btn btn--sm btn--outline" id="btnCopyInvite">Copiar</button>
              ${navigator.share?'<button class="btn btn--sm btn--ghost" id="btnShareInvite">Compartir</button>':""}
            </div>
          </div>
        `:""}

        <div class="league-actions">
          ${_?'<button class="btn btn--danger btn--sm" id="btnLeave">Abandonar liga</button>':!(b!=null&&b.is_admin)&&b?'<button class="btn btn--primary" id="btnJoin">Unirse a esta liga</button>':""}
          ${b!=null&&b.is_admin||_&&b&&v.created_by===b.id?'<button class="btn btn--outline btn--sm" id="btnEditLeague">Editar liga</button>':""}
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
              ${f.map(o=>`
                <tr class="${b&&o.id===b.id?"ranking-table__row--me":""}">
                  <td>${o.position}</td>
                  <td>${o.username}</td>
                  <td>${o.country||"—"}</td>
                  <td class="ranking-table__pts">${o.total_points}</td>
                </tr>
              `).join("")}
            </tbody>
          </table>
        </section>

        <section class="section hidden" id="sectionTablon">
          <div id="tablonEmbed"></div>
        </section>
      </div>
    `,(s=document.getElementById("btnCopyInvite"))==null||s.addEventListener("click",async()=>{try{await navigator.clipboard.writeText(v.invite_link),p("Enlace copiado")}catch{p("No se pudo copiar","error")}}),(n=document.getElementById("btnShareInvite"))==null||n.addEventListener("click",async()=>{try{await navigator.share({title:`Únete a ${v.name} en PickGoal`,url:v.invite_link})}catch{}}),(i=document.getElementById("btnLeave"))==null||i.addEventListener("click",async()=>{if(confirm("¿Seguro que quieres abandonar esta liga?"))try{await m.leagues.leave(t),p("Has abandonado la liga"),$.navigate("/ligas")}catch(o){p(o.message,"error")}}),(d=document.getElementById("btnJoin"))==null||d.addEventListener("click",async()=>{try{await m.leagues.join({league_id:t}),p("¡Te has unido a la liga!"),$.navigate(`/ligas/${t}`)}catch(o){p(o.message,"error")}}),(l=document.getElementById("btnEditLeague"))==null||l.addEventListener("click",()=>{Je(v,t,b)});const k=document.getElementById("tabRanking"),B=document.getElementById("tabTablon"),w=document.getElementById("sectionRanking"),x=document.getElementById("sectionTablon");k&&B&&(k.addEventListener("click",()=>{k.classList.add("league-tab--active"),B.classList.remove("league-tab--active"),w.classList.remove("hidden"),x.classList.add("hidden")}),B.addEventListener("click",()=>{B.classList.add("league-tab--active"),k.classList.remove("league-tab--active"),w.classList.add("hidden"),x.classList.remove("hidden");const o=document.getElementById("tablonEmbed");o&&!o.dataset.loaded&&(o.dataset.loaded="1",ge(o,{query:{liga:String(t)}}))}))}catch(c){e.innerHTML=`<div class="container"><p class="form__error">Error: ${c.message}</p><a href="#/ligas">Volver</a></div>`}}function Je(e,a,t){const s=document.getElementById("editLeagueModal");s&&s.remove();const n=document.createElement("div");n.id="editLeagueModal",n.className="edit-league-modal",n.innerHTML=`
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
  `,document.body.appendChild(n),requestAnimationFrame(()=>n.classList.add("edit-league-modal--open"));const i=()=>{n.classList.remove("edit-league-modal--open"),n.addEventListener("transitionend",()=>n.remove(),{once:!0})};n.querySelector(".edit-league-modal__overlay").addEventListener("click",i),document.getElementById("btnCancelEdit").addEventListener("click",i),document.getElementById("editLeagueForm").addEventListener("submit",async d=>{d.preventDefault();const l=document.getElementById("btnSaveEdit");l.disabled=!0,l.textContent="Guardando…";const c={name:document.getElementById("editName").value.trim(),description:document.getElementById("editDesc").value.trim(),prize:document.getElementById("editPrize").value.trim(),is_public:document.getElementById("editPublic").checked};t!=null&&t.is_admin&&(c.is_official=document.getElementById("editOfficial").checked);try{await m.leagues.update(a,c),p("Liga actualizada"),i(),$.navigate(`/ligas/${a}`)}catch(v){p(v.message,"error"),l.disabled=!1,l.textContent="Guardar cambios"}})}async function Re(e){var t,s,n;e.innerHTML='<div class="loading"><div class="loading__spinner"></div></div>';const a=h.getUser();try{const[i,d,l,c]=await Promise.all([m.predictions.mine(null),m.clasificacion.division(),m.auth.me(),a!=null&&a.is_admin?m.leagues.adminAll():Promise.resolve({leagues:[]})]),v=l.user,f=v.status,_=v.total_points_all_time,g=(t=d.standings)==null?void 0:t.find(b=>b.user_id===v.id);e.innerHTML=`
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
              <p>${a.email}</p>
              <p>${a.country||"Sin país"}</p>
            </div>
          </div>
          ${ze(f,_)}
          <button class="btn btn--danger" id="btnLogoutPerfil">Cerrar sesión</button>
          <div class="profile-card__stats">
            <div class="stat">
              <span class="stat__value">${i.predictions.length}</span>
              <span class="stat__label">Predicciones</span>
            </div>
            <div class="stat">
              <span class="stat__value">${g?`${g.pos}º`:"—"}</span>
              <span class="stat__label">Posición div.</span>
            </div>
            <div class="stat">
              <span class="stat__value">${(g==null?void 0:g.pts_division)??"—"}</span>
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
          ${g?`<div class="division-info">
                 <p class="division-info__name">${d.league_name||"PickGoal División"}</p>
                 <div class="division-info__stats">
                   <div class="division-info__stat">
                     <span>${g.pos}º</span>
                     <small>de ${d.standings.length}</small>
                   </div>
                   <div class="division-info__stat">
                     <span>${g.pts_division}</span>
                     <small>pts división</small>
                   </div>
                   <div class="division-info__stat">
                     <span>${g.pts_general}</span>
                     <small>pts total</small>
                   </div>
                   <div class="division-info__stat">
                     <span>${g.pj}</span>
                     <small>partidos</small>
                   </div>
                 </div>
                 <a href="#/tabla-v2" class="btn btn--ghost btn--sm">Ver tabla completa</a>
               </div>`:'<p class="empty">No perteneces a ninguna división todavía.</p>'}
        </section>

        ${i.predictions.length>0?`
          <section class="section">
            <h2>Mis predicciones</h2>
            <div class="predictions-list">${i.predictions.map(Fe).join("")}</div>
          </section>
        `:""}

        <section class="section section--danger">
          <h2>Zona de peligro</h2>
          <button class="btn btn--danger btn--sm" id="btnDeleteAccount">Cerrar cuenta</button>
        </section>

        ${a!=null&&a.is_admin&&c.leagues.length?`
          <section class="section">
            <h2>Ligas gestionadas</h2>
            <ul class="leagues-list">
              ${c.leagues.map(b=>`
                <li>
                  <span>${b.is_official?"⭐ ":""}${b.name}</span>
                  <span class="tag">${b.is_public?"Pública":"Privada"}</span>
                  <a href="#/ligas/${b.id}" class="btn btn--sm btn--outline">Gestionar</a>
                </li>
              `).join("")}
            </ul>
          </section>
        `:""}
      </div>
    `,(s=e.querySelector("#btnLogoutPerfil"))==null||s.addEventListener("click",()=>{h.logout(),window.location.hash="/"}),(n=e.querySelector("#btnDeleteAccount"))==null||n.addEventListener("click",()=>{Ge()})}catch(i){e.innerHTML=`<div class="container"><p class="form__error">Error: ${i.message}</p></div>`}}function ze(e,a){if(e.next_threshold===null)return`
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
    </div>`}function Fe(e){return`
    <div class="pred-row ${e.total_points>0?"pred-row--scored":""}">
      <span class="pred-row__result">${e.predicted_result}</span>
      <span class="pred-row__score">${e.predicted_home}-${e.predicted_away}</span>
      <span class="pred-row__pts">${e.total_points} pts</span>
    </div>
  `}function Ge(){const e=document.createElement("div");e.className="delete-modal",e.innerHTML=`
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
  `,document.body.appendChild(e),document.body.style.overflow="hidden",requestAnimationFrame(()=>e.classList.add("delete-modal--open"));const a=e.querySelector("#deleteConfirmInput"),t=e.querySelector("#deleteConfirmBtn"),s=e.querySelector("#deleteCancelBtn"),n=e.querySelector("#deleteOverlay"),i=e.querySelector("#deleteError");function d(){e.classList.remove("delete-modal--open"),document.body.style.overflow="",e.addEventListener("transitionend",()=>e.remove(),{once:!0})}a.addEventListener("input",()=>{t.disabled=a.value.trim()!=="CERRAR"}),s.addEventListener("click",d),n.addEventListener("click",d),t.addEventListener("click",async()=>{t.disabled=!0,t.textContent="Cerrando…",i.classList.add("hidden");try{await m.auth.deleteAccount(),d(),h.logout(),p("Cuenta cerrada. Hasta pronto."),window.location.hash="/"}catch(l){i.textContent=l.message||"Error al cerrar la cuenta",i.classList.remove("hidden"),t.disabled=!1,t.textContent="Cerrar mi cuenta"}})}function Ve(){window.location.hash="/"}async function We(e){if(!h.isAdmin()){e.innerHTML='<div class="container"><p class="form__error">Acceso denegado.</p></div>';return}e.innerHTML='<div class="loading"><div class="loading__spinner"></div></div>';try{const{users:a}=await m.auth.users();e.innerHTML=`
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
                  <th>ID</th><th>Usuario</th><th>Email</th><th>País</th><th>Admin</th><th>Acción</th>
                </tr>
              </thead>
              <tbody id="usersTableBody">
                ${a.map(Ye).join("")}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    `,Xe(e),F(e)}catch(a){e.innerHTML=`<div class="container"><p class="form__error">Error: ${a.message}</p></div>`}}function Xe(e){var s,n,i,d;(s=document.getElementById("btnSync"))==null||s.addEventListener("click",async()=>{const l=document.getElementById("syncResult");l.textContent="Sincronizando…";try{await m.matches.sync(),l.textContent="✓ Sincronización completada",p("Sincronización completada")}catch(c){l.textContent=`Error: ${c.message}`,p(c.message,"error")}});const a=document.getElementById("pushTarget"),t=document.getElementById("pushTargetIdGroup");a==null||a.addEventListener("change",()=>{t.classList.toggle("hidden",a.value==="all")}),(n=document.getElementById("pushForm"))==null||n.addEventListener("submit",async l=>{l.preventDefault();const c=document.getElementById("pushTitle").value.trim()||"Aviso",v=document.getElementById("pushBody").value.trim(),f=a.value,_=parseInt(document.getElementById("pushTargetId").value)||null,g=document.getElementById("pushResult"),b={title:`📣 PickGoal — ${c}`,body:v};f==="league"&&_&&(b.league_id=_),f==="user"&&_&&(b.user_id=_),g.textContent="Enviando…";try{const{sent:E}=await m.notifications.send(b);g.textContent=`✓ Enviada a ${E} suscripción(es)`,p(`Notificación enviada a ${E} suscripción(es)`)}catch(E){g.textContent=`Error: ${E.message}`,p(E.message,"error")}}),(i=document.getElementById("btnCloseSeason"))==null||i.addEventListener("click",async()=>{if(!confirm("¿Cerrar la temporada actual? Esta acción es irreversible."))return;const l=document.getElementById("btnCloseSeason"),c=document.getElementById("closeSeasonResult");l.disabled=!0,c.textContent="Cerrando…";try{const{message:v}=await m.post("/v2/admin/season/1/close");c.textContent=`✓ ${v||"Temporada cerrada"}`,p("Temporada cerrada")}catch(v){c.textContent=`Error: ${v.message}`,p(v.message,"error"),l.disabled=!1}}),(d=document.getElementById("usersTableBody"))==null||d.addEventListener("click",async l=>{const c=l.target.closest(".toggle-admin");if(!c)return;const v=parseInt(c.dataset.id);try{const{user:f}=await m.auth.toggleAdmin(v);c.closest("tr").querySelector(".admin-badge").textContent=f.is_admin?"Sí":"No",p(`${f.username} ${f.is_admin?"ahora es admin":"ya no es admin"}`)}catch(f){p(f.message,"error")}})}function Ye(e){return`
    <tr>
      <td>${e.id}</td>
      <td>${e.username}</td>
      <td>${e.email}</td>
      <td>${e.country||"—"}</td>
      <td><span class="admin-badge">${e.is_admin?"Sí":"No"}</span></td>
      <td>
        <button class="btn btn--ghost btn--xs toggle-admin" data-id="${e.id}">
          ${e.is_admin?"Quitar admin":"Hacer admin"}
        </button>
      </td>
    </tr>
  `}const Ke={PD:"🇪🇸 LaLiga",PL:"🏴󠁧󠁢󠁥󠁮󠁧󠁿 Premier League",CL:"⭐ Champions League",SA:"🇮🇹 Serie A",BL1:"🇩🇪 Bundesliga",FL1:"🇫🇷 Ligue 1",PPL:"🇵🇹 Primeira Liga"};let I=[],z=null;async function F(e){const a=document.getElementById("jornadasV2Content");if(a)try{const{jornadas:t}=await m.adminV2.jornadas();a.innerHTML=Ze(t),ea(a)}catch(t){a.innerHTML=`<p class="form__error">Error: ${t.message}</p>`}}function Ze(e){const t=da(new Date);return`
    <div class="jv2-panel">
      <div class="jv2-panel__actions">
        <button class="btn btn--primary btn--sm" id="btnNuevaJornada">+ Nueva jornada</button>
      </div>

      <div class="jv2-list">
        ${e.length===0?'<p class="admin-section__desc">No hay jornadas creadas.</p>':e.map(Qe).join("")}
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
  `}function Qe(e){const a={draft:'<span class="admin-match-badge" style="background:rgba(61,145,255,0.15);color:#3d91ff;border:1px solid rgba(61,145,255,0.3)">Borrador</span>',upcoming:'<span class="admin-match-badge admin-match-badge--pending">Próxima</span>',active:'<span class="admin-match-badge admin-match-badge--done">Activa</span>',finished:'<span class="admin-match-badge" style="background:rgba(255,255,255,0.05);color:#6e6e6e;border:1px solid #222">Finalizada</span>'}[e.status]||`<span class="admin-match-badge">${e.status}</span>`,t=s=>s?new Date(s).toLocaleDateString("es-ES",{day:"2-digit",month:"2-digit"}):"—";return`
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
  `}function ea(e){var a,t,s,n;(a=e.querySelector("#btnNuevaJornada"))==null||a.addEventListener("click",()=>{z=null,I=[],document.getElementById("jv2FormTitle").textContent="Nueva jornada",document.getElementById("jv2EditId").value="",document.getElementById("jv2Number").value="",document.getElementById("jv2DateStart").value="",document.getElementById("jv2DateEnd").value="",document.getElementById("jv2MatchPicker").style.display="none",document.getElementById("jv2Form").style.display="block",K()}),(t=e.querySelector("#btnCancelarJornada"))==null||t.addEventListener("click",()=>{document.getElementById("jv2Form").style.display="none",I=[],z=null}),(s=e.querySelector("#btnBuscarPartidos"))==null||s.addEventListener("click",ta),(n=e.querySelector("#btnGuardarJornada"))==null||n.addEventListener("click",na),e.querySelectorAll(".jv2-pub-btn").forEach(i=>{i.addEventListener("click",async()=>{if(confirm(`¿Publicar jornada ${i.dataset.num}? Se calcularán cuotas, se asignarán duelos y se notificará a los usuarios.`)){i.disabled=!0,i.textContent="Publicando…";try{const d=await m.adminV2.publishJornada(i.dataset.id);p(`Jornada ${i.dataset.num} publicada — push enviado a ${d.push_sent} suscriptores`),await F(document.getElementById("jornadasV2Section"))}catch(d){p(d.message,"error"),i.disabled=!1,i.textContent="Publicar"}}})}),e.querySelectorAll(".jv2-edit-btn").forEach(i=>{i.addEventListener("click",()=>aa(i.dataset.id))}),e.querySelectorAll(".jv2-del-btn").forEach(i=>{i.addEventListener("click",async()=>{if(confirm(`¿Eliminar jornada ${i.dataset.num}?`))try{await m.adminV2.deleteJornada(i.dataset.id),p("Jornada eliminada"),F(document.querySelector("#jornadasV2Content").parentElement.parentElement)}catch(d){p(d.message,"error")}})})}async function aa(e){const{jornadas:a}=await m.adminV2.jornadas(),t=a.find(s=>String(s.id)===String(e));t&&(z=t.id,I=[],document.getElementById("jv2FormTitle").textContent=`Editar jornada ${t.number}`,document.getElementById("jv2EditId").value=t.id,document.getElementById("jv2Number").value=t.number,t.date_start&&(document.getElementById("jv2DateStart").value=t.date_start.slice(0,16)),t.date_end&&(document.getElementById("jv2DateEnd").value=t.date_end.slice(0,16)),document.getElementById("jv2MatchPicker").style.display="none",document.getElementById("jv2Form").style.display="block",K())}async function ta(){const e=document.getElementById("btnBuscarPartidos"),a=document.getElementById("jv2Week").value;if(!a){p("Selecciona una semana","error");return}e.disabled=!0,e.textContent="Buscando…";try{const{matches:t}=await m.adminV2.partidos(a);sa(t),document.getElementById("jv2MatchPicker").style.display="block"}catch(t){p(`Error: ${t.message}`,"error")}finally{e.disabled=!1,e.textContent="Buscar partidos"}}function sa(e){const a=document.getElementById("jv2MatchList");if(Object.values(e).flat().length===0){a.innerHTML='<p class="admin-section__desc">No hay partidos disponibles para esta semana.</p>';return}a.innerHTML=Object.entries(e).map(([s,n])=>n.length?`
      <div class="jv2-comp-group">
        <div class="jv2-comp-group__title">${Ke[s]||s}</div>
        ${n.map(i=>`
          <label class="jv2-match-item">
            <input type="checkbox" class="jv2-match-check" data-match='${JSON.stringify(i)}' />
            <span class="jv2-match-item__teams">${i.home_team} vs ${i.away_team}</span>
            <span class="jv2-match-item__date">${ia(i.match_datetime)}</span>
          </label>
        `).join("")}
      </div>
    `:"").join(""),a.querySelectorAll(".jv2-match-check").forEach(s=>{s.addEventListener("change",()=>{const n=JSON.parse(s.dataset.match);if(s.checked){if(I.length>=10){s.checked=!1,p("Máximo 10 partidos","error");return}I.push(n)}else I=I.filter(i=>i.api_id!==n.api_id);K()})})}function K(){const e=document.getElementById("jv2Count"),a=document.getElementById("jv2CountWarn");e&&(e.textContent=I.length),a&&(a.style.display=I.length>0&&I.length!==10?"inline":"none")}async function na(){const e=parseInt(document.getElementById("jv2Number").value),a=document.getElementById("jv2DateStart").value,t=document.getElementById("jv2DateEnd").value,s=document.getElementById("jv2EditId").value;if(!e||!a||!t){p("Completa número y fechas","error");return}if(I.length!==10){p("Selecciona exactamente 10 partidos","error");return}const n={number:e,date_start:new Date(a).toISOString(),date_end:new Date(t).toISOString(),matches:I},i=document.getElementById("btnGuardarJornada");i.disabled=!0;try{s?(await m.adminV2.updateJornada(s,n),p(`Jornada ${e} actualizada`)):(await m.adminV2.createJornada(n),p(`Jornada ${e} guardada como borrador`)),document.getElementById("jv2Form").style.display="none",I=[],z=null,await F(document.getElementById("jornadasV2Section"))}catch(d){p(d.message,"error")}finally{i.disabled=!1}}function ia(e){return e?new Date(e).toLocaleDateString("es-ES",{day:"2-digit",month:"2-digit"}):"—"}function oa(e){const a=new Date(Date.UTC(e.getFullYear(),e.getMonth(),e.getDate())),t=a.getUTCDay()||7;a.setUTCDate(a.getUTCDate()+4-t);const s=new Date(Date.UTC(a.getUTCFullYear(),0,1));return Math.ceil(((a-s)/864e5+1)/7)}function da(e){const a=new Date(e);a.setDate(a.getDate()+7);const t=a.getFullYear(),s=String(oa(a)).padStart(2,"0");return`${t}-W${s}`}function ra(e){e.innerHTML=`
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
  `,document.getElementById("forgotForm").addEventListener("submit",async a=>{a.preventDefault();const t=document.getElementById("forgotBtn"),s=document.getElementById("forgotMsg"),n=document.getElementById("email").value.trim();t.disabled=!0,t.textContent="Enviando…";try{await m.auth.forgotPassword(n),s.textContent="Si el email existe, recibirás un enlace en breve.",s.classList.remove("hidden","form__error"),s.classList.add("form__success")}catch{p("Error al enviar el email","error")}finally{t.disabled=!1,t.textContent="Enviar enlace"}})}function la(e,{query:a}){const t=a.token||"";if(!t){e.innerHTML='<div class="container"><p class="form__error">Token inválido o expirado.</p><a href="#/login">Volver</a></div>';return}e.innerHTML=`
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
  `,document.getElementById("resetForm").addEventListener("submit",async s=>{s.preventDefault();const n=document.getElementById("resetBtn"),i=document.getElementById("resetError"),d=document.getElementById("password").value;n.disabled=!0,n.textContent="Guardando…",i.classList.add("hidden");try{await m.auth.resetPassword(t,d),p("Contraseña actualizada. Ya puedes iniciar sesión."),$.navigate("/login")}catch(l){i.textContent=l.message||"Error al restablecer la contraseña",i.classList.remove("hidden")}finally{n.disabled=!1,n.textContent="Guardar contraseña"}})}async function ca(e,{query:a}){const t=(a.codigo||"").trim().toUpperCase();if(!t){e.innerHTML='<div class="container"><p class="form__error">Enlace de invitación inválido.</p><a href="#/ligas">Ver ligas</a></div>';return}if(!h.isLoggedIn()){sessionStorage.setItem("pendingInviteCode",t),$.navigate("/register");return}e.innerHTML='<div class="loading"><div class="loading__spinner"></div></div>';try{const{league:s}=await m.leagues.joinByCode(t);p(`¡Te has unido a "${s.name}"!`),$.navigate(`/ligas/${s.id}`)}catch(s){if(s.status===409){p("Ya eres miembro de esta liga");try{const{leagues:n}=await m.leagues.my(),i=n.find(d=>d.invite_code===t);if(i){$.navigate(`/ligas/${i.id}`);return}}catch{}}e.innerHTML=`
      <div class="container">
        <div class="league-gate">
          <div class="league-gate__icon">⚠️</div>
          <h2 class="league-gate__title">Error al unirse</h2>
          <p class="league-gate__text">${s.message}</p>
          <a href="#/ligas" class="btn btn--primary">Ver ligas</a>
        </div>
      </div>
    `}}function ua(){const e=localStorage.getItem("activeLeagueId");return e?parseInt(e):null}async function ma(e,{params:a}){const t=parseInt(a.id);if(!t){e.innerHTML='<div class="container"><p class="form__error">Usuario no válido.</p></div>';return}e.innerHTML='<div class="loading"><div class="loading__spinner"></div></div>';try{const s=ua(),{user:n,predictions:i}=await m.predictions.forUser(t,s);e.innerHTML=`
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
              ${i.map(d=>pa(d)).join("")}
            </div>`}
      </div>
    `}catch(s){e.innerHTML=`<div class="container"><p class="form__error">Error: ${s.message}</p></div>`}}function pa(e){const a=e.match,t=e.total_points,s=e.pts_score>0,n=e.pts_result>0;let i="";return s?i='<span class="jugador__badge jugador__badge--exact">Exacto</span>':n?i='<span class="jugador__badge jugador__badge--ok">1X2 ✓</span>':i='<span class="jugador__badge jugador__badge--miss">Fallo</span>',`
    <div class="jugador__pred-row">
      <div class="jugador__pred-match">
        <span class="jugador__pred-teams">${a.home_team} vs ${a.away_team}</span>
        <span class="jugador__pred-date">${D(a.match_datetime)}</span>
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
  `}const R=20,ve=5;let H={},q=0,X=null;async function ga(e){e.innerHTML='<div class="loading"><div class="loading__spinner"></div></div>';try{const{jornadas:a}=await m.jornada.list();if(!a.length){e.innerHTML=va();return}_e(e,a,0)}catch(a){e.innerHTML=`<div class="container"><p class="form__error">Error cargando jornadas: ${a.message}</p></div>`}}function _e(e,a,t){var l,c;X=a[t];const{jornada:s,matches:n,units_used:i}=X;H={};for(const v of n)H[v.jornada_match_id]={predicted_result:((l=v.prediction)==null?void 0:l.predicted_result)??null,units:((c=v.prediction)==null?void 0:c.units_wagered)??0};q=i;const d=a.length>1?`<div class="jornada-tabs">
        ${a.map((v,f)=>`
          <button class="jornada-tab ${f===t?"jornada-tab--active":""}" data-idx="${f}">
            J${v.jornada.number} · ${ie(v.jornada.date_start)}–${ie(v.jornada.date_end)}
          </button>
        `).join("")}
       </div>`:"";e.innerHTML=`
    <div class="container">
      <h1 class="page-title">Jornada ${s.number}</h1>
      ${d}
      ${s.locked?'<p class="notice">⚠️ El plazo de predicción ha cerrado (ya empezó el primer partido).</p>':s.first_match_datetime?`<p class="notice notice--info">Abierto hasta ${be(s.first_match_datetime)}</p>`:""}
      <div class="units-counter" id="unitsCounter"></div>
      <div class="jornada-matches">
        ${n.map(ba).join("")}
      </div>
      ${s.locked?"":'<button class="btn btn--primary btn--full jornada-save-btn" id="jornadaSaveBtn">Guardar predicciones</button>'}
    </div>
  `,he(),ha(e,s.locked,a,t)}function va(){return`
    <div class="container">
      <div class="jornada-empty">
        <div class="jornada-empty__icon">📅</div>
        <h2 class="jornada-empty__title">No hay jornadas disponibles</h2>
        <p class="jornada-empty__text">Todavía no hay una próxima jornada programada.</p>
      </div>
    </div>
  `}function ie(e){return new Date(e).toLocaleDateString("es-ES",{day:"2-digit",month:"2-digit"})}function be(e){return new Date(e).toLocaleString("es-ES",{day:"2-digit",month:"2-digit",hour:"2-digit",minute:"2-digit"})}function W(e){return e!=null?e.toFixed(2):"—"}function _a(e){const a=new Date,t=new Date(e.match_datetime);return e.status==="finished"?`<span class="tag tag--done">Finalizado ${e.home_score_90??"?"}–${e.away_score_90??"?"}</span>`:e.status!=="scheduled"||t<=a?'<span class="tag tag--locked">Bloqueado</span>':`<span class="tag tag--open">Abierto hasta ${be(e.match_datetime)}</span>`}function ba(e){const a=e.status!=="scheduled"||new Date(e.match_datetime)<=new Date,t=H[e.jornada_match_id]??{predicted_result:null,units:0};return`
    <div class="match-card jornada-match ${a?"match-card--locked":""}" data-jm-id="${e.jornada_match_id}">
      <div class="match-card__header">
        <span class="match-card__date">${D(e.match_datetime)}</span>
        ${_a(e)}
      </div>
      <div class="match-card__teams">
        <span class="team team--home">${e.home_team}</span>
        <div class="match-card__score">
          ${e.status!=="scheduled"?`<span class="score">${e.home_score_90??"?"} - ${e.away_score_90??"?"}</span>`:'<span class="score score--dash">vs</span>'}
        </div>
        <span class="team team--away">${e.away_team}</span>
      </div>
      <div class="jornada-odds">
        <span class="jornada-odds__item"><b>1</b> (${W(e.odds_1)})</span>
        <span class="jornada-odds__item"><b>X</b> (${W(e.odds_x)})</span>
        <span class="jornada-odds__item"><b>2</b> (${W(e.odds_2)})</span>
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
          <input type="number" id="units-${e.jornada_match_id}" class="jornada-units__input" min="0" max="${ve}" value="${t.units}" ${a?"disabled":""} />
        </div>
      </div>
    </div>
  `}function he(){const e=document.getElementById("unitsCounter");if(!e)return;const a=q>R;e.innerHTML=`
    <div class="units-counter__bar">
      <div class="units-counter__fill ${a?"units-counter__fill--over":""}" style="width:${Math.min(100,q/R*100)}%"></div>
    </div>
    <span class="units-counter__label ${a?"units-counter__label--over":""}">${q}/${R} unidades usadas</span>
  `}function oe(){q=Object.values(H).reduce((e,a)=>e+(a.predicted_result?a.units:0),0),he()}function ha(e,a,t,s){var n;e.querySelectorAll(".jornada-tab").forEach(i=>{i.addEventListener("click",()=>{const d=parseInt(i.dataset.idx);d!==s&&_e(e,t,d)})}),!a&&(e.querySelectorAll(".jornada-match").forEach(i=>{const d=parseInt(i.dataset.jmId);i.querySelectorAll('input[type="radio"]').forEach(c=>{c.addEventListener("change",()=>{H[d].predicted_result=c.value,oe()})});const l=i.querySelector(".jornada-units__input");l==null||l.addEventListener("input",()=>{let c=parseInt(l.value);isNaN(c)&&(c=0),c=Math.max(0,Math.min(ve,c)),H[d].units=c,oe()})}),(n=document.getElementById("jornadaSaveBtn"))==null||n.addEventListener("click",()=>fa(X.jornada.id)))}async function fa(e){const a=document.getElementById("jornadaSaveBtn"),t=Object.entries(H).filter(([,s])=>s.predicted_result).map(([s,n])=>({jornada_match_id:parseInt(s),predicted_result:n.predicted_result,units:n.units}));if(t.length===0){p("Selecciona al menos un resultado 1X2","error");return}if(q>R){p(`Superas el máximo de ${R} unidades`,"error");return}a.disabled=!0,a.textContent="…";try{await m.jornada.predict(t),p("Predicciones guardadas"),a.textContent="✓ Guardadas"}catch(s){p(s.message||"Error al guardar","error")}finally{a.disabled=!1,setTimeout(()=>{a&&(a.textContent="Guardar predicciones")},2e3)}}const de={en_curso:{label:"En curso",cls:"duelo-status--curso"},ganado:{label:"Ganaste",cls:"duelo-status--ganado"},perdido:{label:"Perdiste",cls:"duelo-status--perdido"},empate:{label:"Empate",cls:"duelo-status--empate"}};async function ya(e){e.innerHTML='<div class="loading"><div class="loading__spinner"></div></div>';try{const{duelo:a}=await m.duelo.current(),t=h.getUser();if(!a){e.innerHTML=`
        <div class="container">
          <h1 class="page-title">Tu duelo esta jornada</h1>
          <div class="duelo-empty">
            <div class="duelo-empty__icon">🤝</div>
            <p class="duelo-empty__text">No tienes un duelo asignado esta jornada.</p>
          </div>
        </div>
      `;return}const s=de[a.status]??de.en_curso,n=a.rival?a.rival.username:t.username,i=!a.rival||a.rival.id===t.id;e.innerHTML=`
      <div class="container">
        <h1 class="page-title">Tu duelo esta jornada</h1>

        <div class="duelo-card">
          <span class="duelo-status ${s.cls}">${s.label}</span>
          <div class="duelo-card__matchup">
            <div class="duelo-card__player">
              <span class="duelo-card__name">${t.username}</span>
              <span class="duelo-card__pts">${a.my_points}</span>
            </div>
            <span class="duelo-card__vs">VS</span>
            <div class="duelo-card__player">
              <span class="duelo-card__name">${i?"Descanso":n}</span>
              <span class="duelo-card__pts">${i?"—":a.rival_points}</span>
            </div>
          </div>
        </div>

        <h2 class="section-title">Clasificación divisional</h2>
        <div id="divisionStandings"><div class="loading"><div class="loading__spinner"></div></div></div>
      </div>
    `,$a(a.division_league_id,t.id)}catch(a){e.innerHTML=`<div class="container"><p class="form__error">Error cargando el duelo: ${a.message}</p></div>`}}async function $a(e,a){const t=document.getElementById("divisionStandings");if(t)try{const{standings:s}=await m.clasificacion.division(e);if(s.length===0){t.innerHTML='<p class="empty">Sin clasificación disponible.</p>';return}t.innerHTML=`
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
    `}catch(s){t.innerHTML=`<p class="form__error">Error cargando la clasificación: ${s.message}</p>`}}async function Ea(e){e.innerHTML='<div class="loading"><div class="loading__spinner"></div></div>';try{const{standings:a}=await m.clasificacion.general(),t=h.getUser();e.innerHTML=`
      <div class="container">
        <h1 class="page-title">Clasificación</h1>

        <div class="league-tabs">
          <button class="league-tab league-tab--active" id="tabGeneral">General</button>
          <button class="league-tab" id="tabMiDivision">Mi División</button>
          <button class="league-tab" id="tabDivisiones">Divisiones</button>
        </div>

        <section id="panelGeneral">
          ${a.length===0?'<p class="empty">Todavía no hay clasificación disponible.</p>':`
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
                    ${a.map(s=>{var n,i;return`
                      <tr class="${t&&s.user_id===t.id?"ranking-table__row--me":""}">
                        <td class="ranking-table__pos" data-pos="${s.pos}">${s.pos}</td>
                        <td>
                          <span class="status-emoji" title="${((n=s.status)==null?void 0:n.name)||""}">${((i=s.status)==null?void 0:i.emoji)||""}</span>
                          ${s.username}
                        </td>
                        <td class="ranking-table__stat">${s.pts_jornada_actual}</td>
                        <td class="ranking-table__pts">${s.pts_general}</td>
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
      </div>
    `,La(t)}catch(a){e.innerHTML=`<div class="container"><p class="form__error">Error cargando la clasificación: ${a.message}</p></div>`}}function La(e){const a={general:{btn:document.getElementById("tabGeneral"),panel:document.getElementById("panelGeneral")},miDivision:{btn:document.getElementById("tabMiDivision"),panel:document.getElementById("panelMiDivision")},divisiones:{btn:document.getElementById("tabDivisiones"),panel:document.getElementById("panelDivisiones")}};function t(s){for(const[n,{btn:i,panel:d}]of Object.entries(a))i.classList.toggle("league-tab--active",n===s),d.classList.toggle("hidden",n!==s)}a.general.btn.addEventListener("click",()=>t("general")),a.miDivision.btn.addEventListener("click",()=>{t("miDivision"),a.miDivision.panel.dataset.loaded||(a.miDivision.panel.dataset.loaded="1",wa(e))}),a.divisiones.btn.addEventListener("click",()=>{t("divisiones"),a.divisiones.panel.dataset.loaded||(a.divisiones.panel.dataset.loaded="1",Ia(e))})}async function wa(e){const a=document.getElementById("panelMiDivision");if(a)try{const{standings:t}=await m.clasificacion.division();if(t.length===0){a.innerHTML='<p class="empty">Todavía no perteneces a ninguna división.</p>';return}a.innerHTML=`
      <div class="ranking-table-wrapper">
        <table class="ranking-table">
          <thead>
            <tr><th>#</th><th>Usuario</th><th>PJ</th><th>G</th><th>E</th><th>P</th><th>Pts div</th></tr>
          </thead>
          <tbody>
            ${t.map(s=>fe(s,e)).join("")}
          </tbody>
        </table>
      </div>
    `}catch(t){a.innerHTML=`<p class="form__error">Error: ${t.message}</p>`}}async function Ia(e){const a=document.getElementById("panelDivisiones");if(a)try{const{divisions:t}=await m.clasificacion.allDivisions();if(!t.length){a.innerHTML='<p class="empty">No hay divisiones activas.</p>';return}a.innerHTML=t.map(s=>ja(s,e)).join(""),a.querySelectorAll(".div-accordion__header").forEach(s=>{s.addEventListener("click",()=>{const i=s.nextElementSibling.classList.toggle("hidden");s.querySelector(".div-accordion__chevron").textContent=i?"▶":"▼"})})}catch(t){a.innerHTML=`<p class="form__error">Error: ${t.message}</p>`}}function ja(e,a){const t=e.standings.some(s=>a&&s.user_id===a.id);return`
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
              ${e.standings.map(s=>fe(s,a)).join("")}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `}function fe(e,a){const t=a&&e.user_id===a.id,s=e.zone==="promotion"?"background:rgba(0,255,135,0.08)":e.zone==="relegation"?"background:rgba(255,56,96,0.08)":"";return`
    ${e.pos===5?'<tr class="div-separator div-separator--top"><td colspan="7"></td></tr>':e.pos===13?'<tr class="div-separator div-separator--bottom"><td colspan="7"></td></tr>':""}
    <tr class="${t?"ranking-table__row--me":""}" style="${s}">
      <td class="ranking-table__pos" data-pos="${e.pos}">${e.pos}</td>
      <td>${e.username}</td>
      <td class="ranking-table__stat">${e.pj}</td>
      <td class="ranking-table__stat">${e.g}</td>
      <td class="ranking-table__stat">${e.e}</td>
      <td class="ranking-table__stat">${e.p}</td>
      <td class="ranking-table__pts">${e.pts_division}</td>
    </tr>
  `}const re=e=>()=>{window.location.hash=e},Sa={"/":Se,"/login":Me,"/register":De,"/quiniela":re("/jornada"),"/resultados":re("/tabla-v2"),"/ranking":Ae,"/tablon":ge,"/ligas":Oe,"/ligas/:id":Ue,"/perfil":Re,"/campeon":Ve,"/admin":We,"/forgot-password":ra,"/reset-password":la,"/unirse":ca,"/jugador/:id":ma,"/jornada":ga,"/duelo":ya,"/tabla-v2":Ea};function ka(e){for(const[a,t]of Object.entries(Sa)){const s=[],n=new RegExp("^"+a.replace(/:([^/]+)/g,(d,l)=>(s.push(l),"([^/]+)"))+"$"),i=e.match(n);if(i){const d={};return s.forEach((l,c)=>{d[l]=i[c+1]}),{handler:t,params:d}}}return null}const le=()=>document.getElementById("mainContent"),$={init(){window.addEventListener("hashchange",()=>this.resolve()),this.resolve()},navigate(e){window.location.hash=e},resolve(){const e=window.location.hash.slice(1)||"/",[a,t]=e.split("?"),s=Object.fromEntries(new URLSearchParams(t||"")),n=ka(a);if(!n){le().innerHTML='<div class="error-page"><h2>Página no encontrada</h2><a href="#/">Volver al inicio</a></div>';return}const{handler:i,params:d}=n;if(["/perfil","/admin","/jornada","/duelo","/tabla-v2"].includes(a)&&!h.isLoggedIn()){this.navigate("/login");return}if(a==="/admin"&&!h.isAdmin()){this.navigate("/");return}const c=le();c.innerHTML='<div class="loading"><div class="loading__spinner"></div></div>',i(c,{params:d,query:s})}};let J=[],O=null,A=null;async function Ba(){document.documentElement.dataset.build="2026-08-07T15",await h.init(),$.init(),Ta(),xa(),Da()}function ye(){return localStorage.getItem("pwa_installed")==="true"||window.matchMedia("(display-mode: standalone)").matches||window.navigator.standalone===!0}function xa(){window.addEventListener("beforeinstallprompt",e=>{e.preventDefault(),!ye()&&(O=e,Ca())}),window.addEventListener("appinstalled",()=>{var e;localStorage.setItem("pwa_installed","true"),O=null,(e=document.getElementById("installBanner"))==null||e.remove()})}function Ca(){if(ye()||sessionStorage.getItem("installBannerDismissed"))return;const e=document.createElement("div");e.id="installBanner",e.className="install-banner",e.innerHTML=`
    <span class="install-banner__text">⚽ Instala PickGoal en tu dispositivo</span>
    <div class="install-banner__actions">
      <button class="install-banner__btn install-banner__btn--primary" id="installBtn">Instalar</button>
      <button class="install-banner__btn install-banner__btn--ghost" id="installDismissBtn">Ahora no</button>
    </div>
  `,document.body.appendChild(e),document.getElementById("installBtn").addEventListener("click",async()=>{O&&(O.prompt(),await O.userChoice,O=null,e.remove())}),document.getElementById("installDismissBtn").addEventListener("click",()=>{sessionStorage.setItem("installBannerDismissed","1"),e.remove()})}function N(){var e,a;(e=document.getElementById("userDropdown"))==null||e.classList.add("hidden"),(a=document.getElementById("userBtn"))==null||a.classList.remove("navbar__dropdown-btn--open")}async function Y(){const e=document.getElementById("tablonBadge");if(!e)return;if(!h.getUser()){e.classList.add("hidden");return}const t=localStorage.getItem("activeLeagueId");if(!t){e.classList.add("hidden");return}const s=localStorage.getItem(`tablon_last_read_${t}`)||new Date(0).toISOString();try{const{count:n}=await m.board.unread(parseInt(t),s);n>0?(e.textContent=n>99?"99+":String(n),e.classList.remove("hidden")):e.classList.add("hidden")}catch{e.classList.add("hidden")}}function Ta(){var e,a,t;document.addEventListener("auth:change",ce),window.addEventListener("hashchange",()=>{N(),$e(),setTimeout(Y,200)}),document.addEventListener("click",N),(e=document.getElementById("userBtn"))==null||e.addEventListener("click",s=>{var d;s.stopPropagation();const n=document.getElementById("userDropdown"),i=n==null?void 0:n.classList.contains("hidden");N(),i&&(n==null||n.classList.remove("hidden"),(d=document.getElementById("userBtn"))==null||d.classList.add("navbar__dropdown-btn--open"))}),(a=document.getElementById("userDropdown"))==null||a.addEventListener("click",s=>{s.stopPropagation(),s.target.closest("#navProfileLink")&&N()}),(t=document.getElementById("navLogoutBtn"))==null||t.addEventListener("click",()=>{J=[],localStorage.removeItem("activeLeagueId"),N(),h.logout(),$.navigate("/")}),ce()}async function ce(){var i;const e=document.getElementById("navAuthLinks"),a=document.getElementById("userBtn"),t=document.getElementById("navUsername"),s=document.getElementById("bottomNav"),n=h.getUser();if(N(),n){e==null||e.classList.add("hidden"),t&&(t.textContent=n.username),a.style.visibility="visible",s==null||s.classList.remove("hidden"),document.body.classList.add("has-bottom-nav"),(i=document.getElementById("navAdminLink"))==null||i.classList.toggle("hidden",!n.is_admin);try{const{leagues:d}=n.is_admin?await m.leagues.adminAll():await m.leagues.my();J=d}catch{J=[]}Pa(J),Y(),A&&clearInterval(A),A=setInterval(Y,5*60*1e3)}else e==null||e.classList.remove("hidden"),a.style.visibility="hidden",s==null||s.classList.add("hidden"),document.body.classList.remove("has-bottom-nav"),J=[],localStorage.removeItem("activeLeagueId"),A&&(clearInterval(A),A=null);$e()}function Pa(e){const a=localStorage.getItem("activeLeagueId");a&&e.some(s=>String(s.id)===String(a))||(e.length>0?localStorage.setItem("activeLeagueId",String(e[0].id)):localStorage.removeItem("activeLeagueId"))}function $e(){const e=window.location.hash.slice(1).split("?")[0]||"/";document.querySelectorAll(".bottom-nav__item").forEach(a=>{const t=a.dataset.route,s=t==="/"?e==="/":e===t||e.startsWith(t+"/");a.classList.toggle("bottom-nav__item--active",s)})}function Ma(e){const a="=".repeat((4-e.length%4)%4),t=(e+a).replace(/-/g,"+").replace(/_/g,"/"),s=atob(t);return Uint8Array.from([...s].map(n=>n.charCodeAt(0)))}async function Da(){if(!(!("serviceWorker"in navigator)||!("PushManager"in window)))try{const e=await navigator.serviceWorker.register("/sw.js");document.addEventListener("auth:change",async a=>{a.detail&&await ue(e)}),h.getUser()&&await ue(e)}catch{}}async function ue(e){try{if(await Notification.requestPermission()!=="granted")return;const t=await e.pushManager.getSubscription();if(t){await m.notifications.subscribe(t.toJSON());return}const{public_key:s}=await m.notifications.vapidPublicKey();if(!s)return;const n=await e.pushManager.subscribe({userVisibleOnly:!0,applicationServerKey:Ma(s)});await m.notifications.subscribe(n.toJSON())}catch{}}Ba();
