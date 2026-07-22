(function(){const a=document.createElement("link").relList;if(a&&a.supports&&a.supports("modulepreload"))return;for(const n of document.querySelectorAll('link[rel="modulepreload"]'))s(n);new MutationObserver(n=>{for(const i of n)if(i.type==="childList")for(const o of i.addedNodes)o.tagName==="LINK"&&o.rel==="modulepreload"&&s(o)}).observe(document,{childList:!0,subtree:!0});function t(n){const i={};return n.integrity&&(i.integrity=n.integrity),n.referrerPolicy&&(i.referrerPolicy=n.referrerPolicy),n.crossOrigin==="use-credentials"?i.credentials="include":n.crossOrigin==="anonymous"?i.credentials="omit":i.credentials="same-origin",i}function s(n){if(n.ep)return;n.ep=!0;const i=t(n);fetch(n.href,i)}})();const we="https://pickgoal-backend.onrender.com/api";function Le(){return localStorage.getItem("token")}async function h(e,a={}){const t={"Content-Type":"application/json",...a.headers},s=Le();s&&(t.Authorization=`Bearer ${s}`);const n=await fetch(`${we}${e}`,{...a,headers:t}),i=await n.json().catch(()=>({}));if(!n.ok)throw{status:n.status,message:i.error||"Error desconocido"};return i}const u={get:e=>h(e),post:(e,a)=>h(e,{method:"POST",body:JSON.stringify(a)}),patch:(e,a)=>h(e,{method:"PATCH",body:JSON.stringify(a)}),delete:e=>h(e,{method:"DELETE"}),auth:{register:e=>h("/auth/register",{method:"POST",body:JSON.stringify(e)}),login:e=>h("/auth/login",{method:"POST",body:JSON.stringify(e)}),me:()=>h("/auth/me"),forgotPassword:e=>h("/auth/forgot-password",{method:"POST",body:JSON.stringify({email:e})}),resetPassword:(e,a)=>h("/auth/reset-password",{method:"POST",body:JSON.stringify({token:e,password:a})}),ranking:e=>h(`/auth/ranking${e?`?league_id=${e}`:""}`),users:()=>h("/auth/users"),toggleAdmin:e=>h(`/auth/users/${e}/toggle-admin`,{method:"PATCH"})},matches:{grouped:()=>h("/matches/grouped"),list:(e="")=>h(`/matches/${e}`),get:e=>h(`/matches/${e}`),today:()=>h("/matches/today"),setResult:(e,a,t,s=null)=>h(`/matches/${e}/result`,{method:"PATCH",body:JSON.stringify({home_score:a,away_score:t,...s?{result_90:s}:{}})}),sync:()=>h("/matches/sync",{method:"POST"}),recalculate:()=>h("/matches/recalculate",{method:"POST"})},predictions:{mine:e=>h(`/predictions/${e?`?league_id=${e}`:""}`),forMatch:(e,a)=>h(`/predictions/match/${e}${a?`?league_id=${a}`:""}`),save:e=>h("/predictions/",{method:"POST",body:JSON.stringify(e)}),forUser:(e,a)=>h(`/predictions/user/${e}${a?`?league_id=${a}`:""}`),getChampion:e=>h(`/predictions/champion${e?`?league_id=${e}`:""}`),saveChampion:(e,a)=>h("/predictions/champion",{method:"POST",body:JSON.stringify({team_name:e,league_id:a??null})}),awardChampion:e=>h("/predictions/champion/award",{method:"POST",body:JSON.stringify({team_name:e})})},leagues:{all:()=>h("/leagues/all"),public:()=>h("/leagues/public"),my:()=>h("/leagues/my"),create:e=>h("/leagues/",{method:"POST",body:JSON.stringify(e)}),join:e=>h("/leagues/join",{method:"POST",body:JSON.stringify(e)}),joinByCode:e=>h(`/leagues/join/${encodeURIComponent(e)}`),adminAll:()=>h("/leagues/admin"),get:e=>h(`/leagues/${e}`),update:(e,a)=>h(`/leagues/${e}`,{method:"PUT",body:JSON.stringify(a)}),leave:e=>h(`/leagues/${e}/leave`,{method:"DELETE"}),members:e=>h(`/leagues/${e}/members`),matchPredictions:(e,a)=>h(`/leagues/${e}/predictions/${a}`)},home:{summary:()=>h("/home/summary")},board:{messages:(e=1,a=null)=>h(`/board/?page=${e}${a?`&league_id=${a}`:""}`),unread:(e,a)=>h(`/board/unread?league_id=${e}&since=${encodeURIComponent(a)}`),post:(e,a=null)=>h("/board/",{method:"POST",body:JSON.stringify({message:e,league_id:a})}),pin:e=>h(`/board/${e}/pin`,{method:"POST"}),reply:(e,a)=>h(`/board/${e}/reply`,{method:"POST",body:JSON.stringify({message:a})}),delete:e=>h(`/board/${e}`,{method:"DELETE"})},notifications:{vapidPublicKey:()=>h("/notifications/vapid-public-key"),subscribe:e=>h("/notifications/subscribe",{method:"POST",body:JSON.stringify(e)}),send:e=>h("/notifications/send",{method:"POST",body:JSON.stringify(e)})},adminV2:{partidos:e=>h(`/v2/admin/partidos-disponibles?semana=${encodeURIComponent(e)}`),jornadas:()=>h("/v2/admin/jornadas"),createJornada:e=>h("/v2/admin/jornada",{method:"POST",body:JSON.stringify(e)}),updateJornada:(e,a)=>h(`/v2/admin/jornada/${e}`,{method:"PUT",body:JSON.stringify(a)}),deleteJornada:e=>h(`/v2/admin/jornada/${e}`,{method:"DELETE"})}};let M=null;const $={async init(){if(localStorage.getItem("token"))try{const{user:a}=await u.auth.me();M=a}catch{localStorage.removeItem("token")}},setUser(e,a){M=e,localStorage.setItem("token",a),document.dispatchEvent(new CustomEvent("auth:change",{detail:e}))},logout(){M=null,localStorage.removeItem("token"),document.dispatchEvent(new CustomEvent("auth:change",{detail:null}))},getUser(){return M},isLoggedIn(){return!!M},isAdmin(){return(M==null?void 0:M.is_admin)===!0}};let z=null;function m(e,a="success"){let t=document.getElementById("toast");t||(t=document.createElement("div"),t.id="toast",document.body.appendChild(t)),t.textContent=e,t.className=`toast toast--${a} toast--visible`,z&&clearTimeout(z),z=setTimeout(()=>{t.classList.remove("toast--visible")},3e3)}function le(){return`
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
  `}function ue(e){const a=e.querySelector("#pointsModal"),t=e.querySelector("#btnPointsInfo"),s=e.querySelector("#pointsClose"),n=e.querySelector("#pointsOverlay");function i(){a.classList.add("points-modal--open"),document.body.style.overflow="hidden"}function o(){a.classList.remove("points-modal--open"),document.body.style.overflow=""}return t==null||t.addEventListener("click",i),s==null||s.addEventListener("click",o),n==null||n.addEventListener("click",o),document.addEventListener("keydown",l=>{l.key==="Escape"&&o()},{once:!1}),i}function q(e){return e?new Date(e).toLocaleString("es-ES",{day:"2-digit",month:"2-digit",year:"numeric",hour:"2-digit",minute:"2-digit"}):"—"}async function Ie(e){if(!$.getUser()){Se(e);return}e.innerHTML='<div class="loading"><div class="loading__spinner"></div></div>';try{const{leagues_summary:t,upcoming_matches:s}=await u.home.summary();if(t.length===0){ke(e);return}const n=(()=>{const o=localStorage.getItem("activeLeagueId");return o?parseInt(o):null})(),i=[...t].sort((o,l)=>o.league_id===n?-1:l.league_id===n?1:0);e.innerHTML=`
      <div class="home-dashboard container">
        <div class="home-dashboard__topbar">
          <button class="btn btn--ghost btn--sm" id="btnPointsInfo">📊 Sistema de puntos</button>
        </div>

        ${me()}

        <h3 class="home-dashboard__section-title">Ligas del Mundial</h3>
        <div class="home-dashboard__leagues">
          ${i.map(o=>Ce(o)).join("")}
        </div>

        <div class="home-dashboard__create">
          <a href="#/ligas" class="btn btn--ghost btn--sm">+ Crear liga privada</a>
        </div>

        ${Be(s)}
      </div>
      ${ce()}
    `,ue(e),pe(e),e.querySelectorAll(".league-card[data-league-id]").forEach(o=>{o.style.cursor="pointer",o.addEventListener("click",l=>{l.target.closest("[data-go-ranking]")||l.target.closest("a")||(localStorage.setItem("activeLeagueId",o.dataset.leagueId),S.navigate(`/ligas/${o.dataset.leagueId}`))})}),e.querySelectorAll("[data-go-ranking]").forEach(o=>{o.addEventListener("click",l=>{l.stopPropagation(),localStorage.setItem("activeLeagueId",o.dataset.goRanking),S.navigate("/ranking")})})}catch(t){e.innerHTML=`<div class="container"><p class="form__error">Error cargando el inicio: ${t.message}</p></div>`}}function Se(e){e.innerHTML=`
    <section class="hero">
      <div class="hero__content">
        <img src="/assets/logo-completo.jpg" alt="PickGoal" class="hero__logo-img" />
        <div class="hero__cta">
          <a href="#/register" class="btn btn--primary btn--lg">Registrarse</a>
          <a href="#/login" class="btn btn--ghost btn--lg">Ya tengo cuenta</a>
        </div>
      </div>
    </section>

    <section class="how-it-works container">
      <h2 class="how-it-works__title">¿Cómo funciona?</h2>
      <div class="how-it-works__grid">
        <div class="how-step">
          <span class="how-step__icon">🏆</span>
          <div class="how-step__num">1</div>
          <h3 class="how-step__title">Únete a una liga</h3>
          <p class="how-step__desc">Crea tu propia liga o únete a una pública o privada</p>
        </div>
        <div class="how-step">
          <span class="how-step__icon">⚽</span>
          <div class="how-step__num">2</div>
          <h3 class="how-step__title">Predice los partidos</h3>
          <p class="how-step__desc">Elige el resultado 1X2 y el marcador exacto de cada partido del Mundial</p>
        </div>
        <div class="how-step">
          <span class="how-step__icon">🎯</span>
          <div class="how-step__num">3</div>
          <h3 class="how-step__title">Acumula puntos</h3>
          <p class="how-step__desc">Gana puntos por cada acierto. Más puntos cuanto más avanza el torneo</p>
        </div>
        <div class="how-step">
          <span class="how-step__icon">👑</span>
          <div class="how-step__num">4</div>
          <h3 class="how-step__title">Gana el Mundial</h3>
          <p class="how-step__desc">El mejor pronosticador de tu liga gana. Liga oficial con premio camiseta</p>
        </div>
      </div>

      <div class="points-table">
        <h3 class="points-table__title">Sistema de puntos</h3>
        <div class="points-table__grid">
          <div class="points-pill">
            <span class="points-pill__phase">Grupos</span>
            <span class="points-pill__pts">1<span class="points-pill__sep">+</span>1</span>
          </div>
          <div class="points-pill">
            <span class="points-pill__phase">Dieciseisavos</span>
            <span class="points-pill__pts">2<span class="points-pill__sep">+</span>2</span>
          </div>
          <div class="points-pill">
            <span class="points-pill__phase">Octavos</span>
            <span class="points-pill__pts">3<span class="points-pill__sep">+</span>3</span>
          </div>
          <div class="points-pill">
            <span class="points-pill__phase">Cuartos</span>
            <span class="points-pill__pts">4<span class="points-pill__sep">+</span>4</span>
          </div>
          <div class="points-pill">
            <span class="points-pill__phase">Semis</span>
            <span class="points-pill__pts">5<span class="points-pill__sep">+</span>5</span>
          </div>
          <div class="points-pill">
            <span class="points-pill__phase">Final</span>
            <span class="points-pill__pts">6<span class="points-pill__sep">+</span>6</span>
          </div>
          <div class="points-pill points-pill--champion">
            <span class="points-pill__phase">Campeón</span>
            <span class="points-pill__pts">+10</span>
          </div>
        </div>
        <p class="points-table__legend">Puntos por resultado 1X2 <span class="points-table__plus">+</span> puntos extra por marcador exacto</p>
      </div>
    </section>
  `}function ke(e){e.innerHTML=`
    <div class="home-dashboard container">
      ${me()}
      <div class="home-dashboard__create">
        <a href="#/ligas" class="btn btn--ghost btn--sm">+ Crear liga privada</a>
      </div>
    </div>
  `,pe(e)}function xe(e){const a=new Date,t=new Date(e),s=Math.ceil((t-a)/(1e3*60*60*24));return Math.max(0,s)}function me(){const e=xe("2026-08-15");return`
    <div class="pg-league-card">
      <div class="pg-league-card__header">
        <div>
          <span class="pg-league-card__badge">Temporada 26/27 · Próximamente</span>
          <h2 class="pg-league-card__name">PickGoal League</h2>
        </div>
        ${e>0?`<div class="pg-league-card__countdown">
         <span class="pg-league-card__countdown-num">${e}</span>
         <span class="pg-league-card__countdown-label">días para el inicio</span>
       </div>`:`<div class="pg-league-card__countdown pg-league-card__countdown--soon">
         ¡Lanzamiento inminente!
       </div>`}
      </div>
      <div class="pg-league-card__features">
        <div class="pg-league-card__feature">⚽ LaLiga · Premier League · Champions League</div>
        <div class="pg-league-card__feature">🏆 Sistema de divisiones y duelos 1vs1</div>
        <div class="pg-league-card__feature">📅 Lanzamiento: agosto 2026</div>
      </div>
      <div class="pg-league-card__actions">
        <button class="btn btn--primary btn--sm" id="btnWaitlist">Unirse a la lista de espera</button>
      </div>
    </div>
  `}function pe(e){var a;(a=e.querySelector("#btnWaitlist"))==null||a.addEventListener("click",()=>{m("¡Ya estás dentro! Te avisaremos cuando empiece la temporada 🎉")})}function Ce(e){const a=e.next_to_predict?`<div class="league-card__next">
         <span class="league-card__next-label">Próximo a predecir</span>
         <span class="league-card__next-match">${e.next_to_predict.home_team} vs ${e.next_to_predict.away_team}</span>
         <span class="league-card__next-date">${q(e.next_to_predict.match_datetime)}</span>
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
  `}function Be(e){return e.length?`
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
              <span class="upcoming-match__date">${q(a.match_datetime)}</span>
              ${t?'<span class="upcoming-match__badge upcoming-match__badge--done">Predicho</span>':'<span class="upcoming-match__badge upcoming-match__badge--pending">Sin predecir</span>'}
            </div>
          </div>
        `).join("")}
      </div>
      <a class="btn btn--ghost btn--sm" href="#/quiniela">Ver todos los pronósticos</a>
    </section>
  `:""}const ee="pickgoal_welcome_shown";function ge(e="/ligas"){if(localStorage.getItem(ee))return;localStorage.setItem(ee,"1");const a=document.createElement("div");a.innerHTML=`
    <div class="welcome-modal" id="welcomeModal">
      <div class="welcome-modal__overlay" id="welcomeOverlay"></div>
      <div class="welcome-modal__box">
        <h2 class="welcome-modal__title">¡Bienvenido a PickGoal! ⚽</h2>
        <p class="welcome-modal__subtitle">La quiniela del Mundial 2026</p>

        <ol class="welcome-modal__steps">
          <li class="welcome-modal__step">
            <span class="welcome-modal__step-num">1️⃣</span>
            <div>
              <strong>Únete a una liga</strong>
              <span>— pública o privada</span>
            </div>
          </li>
          <li class="welcome-modal__step">
            <span class="welcome-modal__step-num">2️⃣</span>
            <div>
              <strong>Predice los partidos</strong>
              <span>— 1X2 y marcador exacto</span>
            </div>
          </li>
          <li class="welcome-modal__step">
            <span class="welcome-modal__step-num">3️⃣</span>
            <div>
              <strong>Acumula puntos</strong>
              <span>— y sube en la clasificación</span>
            </div>
          </li>
        </ol>

        <div class="welcome-modal__highlight">
          🏆 Predice el campeón antes del 11 de junio y gana <strong>10 puntos extra</strong>
        </div>

        <button class="btn btn--primary btn--full btn--lg" id="welcomeCta">
          ¡Empezar a predecir!
        </button>
      </div>
    </div>
  `;const t=a.firstElementChild;document.body.appendChild(t),document.body.style.overflow="hidden",requestAnimationFrame(()=>t.classList.add("welcome-modal--open"));function s(n){t.classList.remove("welcome-modal--open"),document.body.style.overflow="",t.addEventListener("transitionend",()=>t.remove(),{once:!0}),n&&(window.location.hash=n)}document.getElementById("welcomeOverlay").addEventListener("click",()=>s()),document.getElementById("welcomeCta").addEventListener("click",()=>s(e)),document.addEventListener("keydown",function n(i){i.key==="Escape"&&(s(),document.removeEventListener("keydown",n))})}function je(e){e.innerHTML=`
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
  `,document.getElementById("loginForm").addEventListener("submit",async a=>{a.preventDefault();const t=document.getElementById("loginBtn"),s=document.getElementById("loginError"),n=document.getElementById("identifier").value.trim(),i=document.getElementById("password").value;t.disabled=!0,t.textContent="Entrando…",s.classList.add("hidden");try{const{token:o,user:l}=await u.auth.login({identifier:n,password:i});$.setUser(l,o),m(`¡Bienvenido, ${l.username}!`),S.navigate("/quiniela"),ge("/quiniela")}catch(o){s.textContent=o.message||"Error al iniciar sesión",s.classList.remove("hidden")}finally{t.disabled=!1,t.textContent="Entrar"}})}function Pe(e){e.innerHTML=`
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
  `,document.getElementById("registerForm").addEventListener("submit",async a=>{a.preventDefault();const t=document.getElementById("registerBtn"),s=document.getElementById("registerError");t.disabled=!0,t.textContent="Creando cuenta…",s.classList.add("hidden");const n={username:document.getElementById("username").value.trim(),email:document.getElementById("email").value.trim(),country:document.getElementById("country").value.trim(),password:document.getElementById("password").value};try{const{token:i,user:o}=await u.auth.register(n);$.setUser(o,i),m("¡Cuenta creada! Bienvenido a PickGoal");const l=sessionStorage.getItem("pendingInviteCode");if(l){sessionStorage.removeItem("pendingInviteCode");try{const{league:g}=await u.leagues.joinByCode(l);m(`¡Te has unido a "${g.name}"!`),S.navigate(`/ligas/${g.id}`)}catch{S.navigate("/ligas")}}else S.navigate("/campeon"),ge("/ligas")}catch(i){s.textContent=i.message||"Error al registrarse",s.classList.remove("hidden")}finally{t.disabled=!1,t.textContent="Crear cuenta"}})}const Te=new Set(["r32","r16","quarters","semis","third","final"]);let X=null;function ae(){const e=localStorage.getItem("activeLeagueId");return e?parseInt(e):null}async function Me(e){var a,t;e.innerHTML='<div class="loading"><div class="loading__spinner"></div></div>';try{let s=null;if($.isLoggedIn()){const{leagues:y}=await u.leagues.my();if(y.length===0){e.innerHTML=le();return}const w=ae(),L=y.find(r=>r.id===w);s=L?L.name:((a=y[0])==null?void 0:a.name)??null}const n=ae(),[{groups:i},o,l]=await Promise.all([u.matches.grouped(),$.isLoggedIn()?u.predictions.mine(n):Promise.resolve({predictions:[]}),$.isLoggedIn()?u.predictions.getChampion(n):Promise.resolve({champion_prediction:null})]),g={};for(const y of o.predictions)g[y.match_id]=y;const p=i.flatMap(y=>y.matches),v=new Map;for(const y of p){const w=se(y.match_datetime);v.has(w)||v.set(w,[]),v.get(w).push(y)}const d=[...v.keys()].sort(),_=se(new Date().toISOString()),b=d.find(y=>y>=_)??d[0],f=((t=l.champion_prediction)==null?void 0:t.team_name)??null,E=$.isLoggedIn()?f?`<p class="champion-banner champion-banner--set">🏆 Tu campeón: <a href="#/campeon" style="color:inherit;font-weight:bold;">${f}</a></p>`:'<p class="champion-banner champion-banner--missing">⚠️ <a href="#/campeon">¡Elige tu campeón antes del inicio del torneo!</a></p>':"";e.innerHTML=`
      ${s?`<span class="page-league-name">${s}</span>`:""}
      <div class="container">
        <h1 class="page-title">Pronósticos — Mundial 2026</h1>
        ${E}
        ${$.isLoggedIn()?"":'<p class="notice">⚠️ <a href="#/login">Inicia sesión</a> para guardar tus predicciones.</p>'}
        <nav class="date-nav" id="dateNav"></nav>
        <div id="matchesContent"></div>
      </div>
      ${ce()}
    `,X=ue(e),qe(d,b,v,g,n)}catch(s){e.innerHTML=`<div class="container"><p class="form__error">Error cargando los partidos: ${s.message}</p></div>`}}function qe(e,a,t,s,n){var o;const i=document.getElementById("dateNav");i&&(i.innerHTML=e.map(l=>`
    <button class="date-nav__btn ${l===a?"date-nav__btn--active":""}" data-day="${l}">
      ${De(l)}
    </button>
  `).join(""),(o=i.querySelector(".date-nav__btn--active"))==null||o.scrollIntoView({inline:"center",behavior:"instant",block:"nearest"}),i.querySelectorAll(".date-nav__btn").forEach(l=>{l.addEventListener("click",()=>{i.querySelectorAll(".date-nav__btn").forEach(g=>g.classList.remove("date-nav__btn--active")),l.classList.add("date-nav__btn--active"),te(t.get(l.dataset.day)??[],s,n)})}),te(t.get(a)??[],s,n))}function te(e,a,t){const s=document.getElementById("matchesContent");if(s){if(e.length===0){s.innerHTML='<p class="empty">Sin partidos este día.</p>';return}s.innerHTML=`<div class="matches-grid">${e.map(n=>Ae(n,a[n.id])).join("")}</div>`,X&&s.querySelectorAll(".knockout-info-btn").forEach(n=>{n.addEventListener("click",i=>{i.stopPropagation(),X()})}),$.isLoggedIn()&&s.querySelectorAll(".prediction-form").forEach(n=>{Oe(n,a,t)})}}function se(e){const a=new Date(e);return`${a.getFullYear()}-${String(a.getMonth()+1).padStart(2,"0")}-${String(a.getDate()).padStart(2,"0")}`}function De(e){const[a,t,s]=e.split("-").map(Number);return new Date(a,t-1,s).toLocaleDateString("es-ES",{day:"numeric",month:"short"})}function Ae(e,a){const t=e.is_locked,s=a?`<span class="pts-badge">${a.total_points} pts</span>`:"",n={scheduled:"Programado",live:"🔴 En juego",finished:"Finalizado"}[e.status];return`
    <div class="match-card ${t?"match-card--locked":""}" data-match-id="${e.id}">
      <div class="match-card__header">
        <span class="match-card__status">${n}</span>
        <span class="match-card__date">${q(e.match_datetime)}</span>
        ${s}
      </div>
      <div class="match-card__teams">
        <span class="team team--home">${e.home_team}</span>
        <div class="match-card__score">
          ${e.status!=="scheduled"?`<span class="score">${e.home_score_90??"?"} - ${e.away_score_90??"?"}</span>`:'<span class="score score--dash">vs</span>'}
        </div>
        <span class="team team--away">${e.away_team}</span>
      </div>
      ${!t&&$.isLoggedIn()?Ne(e,a):t&&a?`<div class="prediction-result">
               Tu predicción: <strong>${a.predicted_home}-${a.predicted_away}</strong>
               (${a.predicted_result}) · ${a.total_points} pts
             </div>`:""}
    </div>
  `}function Ne(e,a){const t=!!a,s=(a==null?void 0:a.predicted_home)??0,n=(a==null?void 0:a.predicted_away)??0,i=(a==null?void 0:a.predicted_result)??"X",o=t?"prediction-form--saved":"prediction-form--unsaved",l=t?'<span class="pred-status pred-status--saved">✓ Guardado</span>':'<span class="pred-status pred-status--unsaved">Sin predicción</span>',g=t?"btn btn--saved btn--sm pred-save-btn":"btn btn--ghost btn--sm pred-save-btn",p=t?"✓ Guardado":"Guardar",v=Te.has(e.phase);return`
    <form class="prediction-form ${o}" data-match-id="${e.id}" data-saved="${t}" data-is-knockout="${v?"1":"0"}">
      ${l}
      <div class="result-selector">
        ${["1","X","2"].map(d=>`
          <label class="result-selector__option">
            <input type="radio" name="predicted_result" value="${d}" ${i===d?"checked":""} required />
            ${d}
          </label>
        `).join("")}
      </div>
      ${v?'<span class="pred-hint">(90 min)</span>':""}
      <div class="prediction-form__inputs">
        <input type="number" name="predicted_home" class="score-input" min="0" max="30"
          value="${s}" placeholder="0" required />
        <span>-</span>
        <input type="number" name="predicted_away" class="score-input" min="0" max="30"
          value="${n}" placeholder="0" required />
      </div>
      ${v?`
      <div class="pred-hint-row">
        <span class="pred-hint">(partido completo)</span>
        <button class="knockout-info-btn" type="button" title="Sistema de puntos eliminatorias" aria-label="Sistema de puntos">i</button>
      </div>`:""}
      <button type="submit" class="${g}">${p}</button>
    </form>
  `}function He(e,a,t,s){return e==="1"?a>t:e==="2"?t>a:e==="X"?s?a!==t:a===t:!0}function Oe(e,a,t){const s=parseInt(e.dataset.matchId),n=e.querySelector(".pred-save-btn"),i=e.querySelector(".pred-status");let o=e.dataset.saved==="true";function l(){e.classList.contains("prediction-form--dirty")||(e.classList.remove("prediction-form--saved","prediction-form--unsaved"),e.classList.add("prediction-form--dirty"),n.className="btn btn--primary btn--sm pred-save-btn",n.textContent="Guardar",i&&(i.className="pred-status pred-status--unsaved",i.textContent="Sin guardar"))}function g(){o=!0,e.classList.remove("prediction-form--unsaved","prediction-form--dirty"),e.classList.add("prediction-form--saved"),n.className="btn btn--saved btn--sm pred-save-btn",n.textContent="✓ Guardado",n.disabled=!1,i&&(i.className="pred-status pred-status--saved",i.textContent="✓ Guardado")}e.querySelectorAll("input").forEach(p=>{p.addEventListener("change",l),p.addEventListener("input",l)}),e.addEventListener("submit",async p=>{var f;p.preventDefault();const v=parseInt(e.querySelector("[name=predicted_home]").value),d=parseInt(e.querySelector("[name=predicted_away]").value),_=(f=e.querySelector("[name=predicted_result]:checked"))==null?void 0:f.value;if(isNaN(v)||isNaN(d)||!_)return;const b=e.dataset.isKnockout==="1";if(!He(_,v,d,b)){m("El marcador no coincide con el resultado 1X2 seleccionado","error");return}n.disabled=!0,n.textContent="…";try{const{prediction:E}=await u.predictions.save({match_id:s,predicted_result:_,predicted_home:v,predicted_away:d,league_id:t??null});a[s]=E,m("Predicción guardada"),g()}catch(E){m(E.message||"Error al guardar","error"),n.disabled=!1,o?(n.className="btn btn--saved btn--sm pred-save-btn",n.textContent="✓ Guardado"):(n.className="btn btn--primary btn--sm pred-save-btn",n.textContent="Guardar")}})}function Re(){const e=localStorage.getItem("activeLeagueId");return e?parseInt(e):null}async function Fe(e){var a,t;e.innerHTML='<div class="loading"><div class="loading__spinner"></div></div>';try{if($.isLoggedIn()){const{leagues:_}=await u.leagues.my();if(_.length===0){e.innerHTML=le();return}}const s=Re(),[{ranking:n},i]=await Promise.all([u.auth.ranking(s),$.isLoggedIn()?u.leagues.my():Promise.resolve({leagues:[]})]),o=$.getUser(),l=i.leagues.find(_=>_.id===s),g=document.getElementById("tablonBadge"),p=g&&!g.classList.contains("hidden"),v=p?g.textContent:"",d=((a=n[0])==null?void 0:a.matches_played)??0;e.innerHTML=`
      ${l?`<span class="page-league-name">${l.name}</span>`:""}
      <div class="container">
        <div class="ranking-header">
          <h1 class="page-title">Clasificación</h1>
          ${s?`
            <button class="ranking-tablon-btn" data-league-id="${s}">
              💬 Tablón
              <span class="ranking-tablon-btn__badge${p?"":" hidden"}">${v}</span>
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
              ${n.map(_=>{var L,r,c;const b=_.predictions_made??0,f=`${b}/${d}`,E=`${_.correct_results??0}/${b}`,y=`${_.exact_scores??0}/${b}`;return`
                  <tr class="${o&&_.id===o.id?"ranking-table__row--me":""}">
                    <td class="ranking-table__pos" data-pos="${_.position}">${_.position}</td>
                    <td>
                      <a class="ranking-table__link" href="#/jugador/${_.id}">
                        <span class="status-emoji" title="${((L=_.status)==null?void 0:L.name)||""}">${((r=_.status)==null?void 0:r.emoji)||""}</span>${_.username}
                      </a>
                    </td>
                    <td class="ranking-table__stat ranking-table__status">${((c=_.status)==null?void 0:c.name)||"—"}</td>
                    <td class="ranking-table__stat">${f}</td>
                    <td class="ranking-table__stat">${E}</td>
                    <td class="ranking-table__stat">${y}</td>
                    <td class="ranking-table__pts">${_.total_points}</td>
                  </tr>
                `}).join("")}
            </tbody>
          </table>
        </div>
      </div>
    `,(t=e.querySelector(".ranking-tablon-btn"))==null||t.addEventListener("click",()=>{S.navigate(`/tablon?liga=${s}`)})}catch(s){e.innerHTML=`<div class="container"><p class="form__error">Error: ${s.message}</p></div>`}}async function _e(e,{query:a={}}={}){e.innerHTML='<div class="loading"><div class="loading__spinner"></div></div>';const t=$.getUser();let s=a.liga?parseInt(a.liga):null;if(s){localStorage.setItem(`tablon_last_read_${s}`,new Date().toISOString());const r=document.getElementById("tablonBadge");r&&(r.classList.add("hidden"),r.textContent="")}let n=null,i=[],o=1,l=1;try{if(!s&&t){const{leagues:r}=await u.leagues.my();r&&r.length&&(s=r[0].id,n=r[0].name)}else if(s)try{const{league:r}=await u.leagues.get(s);n=r.name}catch{}if(s&&t)try{const{members:r}=await u.leagues.members(s);i=r||[]}catch{}}catch{}async function g(){const r=await u.board.messages(o,s);return l=r.pages||1,r}try{const r=await g();p(r)}catch(r){e.innerHTML=`<div class="container"><p class="form__error">Error: ${r.message}</p></div>`}function p(r){const{pinned:c=[],messages:I=[]}=r;e.innerHTML=`
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

        ${c.length?`<section class="board-section">
               <h2 class="board-section__title">📌 Anuncios fijados</h2>
               <div class="board-pinned" id="boardPinned">
                 ${v(c)}
               </div>
             </section>`:""}

        <section class="board-section">
          ${c.length?'<h2 class="board-section__title">💬 Mensajes</h2>':""}
          <div class="board-messages" id="boardMessages">
            ${_(I)}
          </div>
          ${l>1?`<div class="pagination">
                 <button class="btn btn--ghost btn--sm" id="prevPage" ${o<=1?"disabled":""}>← Anterior</button>
                 <span>Página ${o} / ${l}</span>
                 <button class="btn btn--ghost btn--sm" id="nextPage" ${o>=l?"disabled":""}>Siguiente →</button>
               </div>`:""}
        </section>
      </div>
    `,f(),E(),y()}function v(r){return r.length?r.map(c=>`
      <div class="board-message board-message--pinned" data-id="${c.id}">
        <div class="board-message__header">
          <span class="board-message__pin-badge">📌</span>
          <strong class="board-message__author">${T(c.username)}</strong>
          <span class="board-message__date">${q(c.created_at)}</span>
          ${t!=null&&t.is_admin&&!c.is_deleted?`<button class="btn btn--ghost btn--xs unpin-msg" data-id="${c.id}" title="Desfijar">📌✕</button>`:""}
          ${!c.is_deleted&&t&&(t.id===c.user_id||t.is_admin)?`<button class="btn btn--danger btn--xs delete-msg" data-id="${c.id}">✕</button>`:""}
        </div>
        <p class="board-message__text">${b(c.message)}</p>

        ${c.replies&&c.replies.length?`<div class="board-replies">
               ${c.replies.map(I=>d(I)).join("")}
             </div>`:""}

        ${t&&!c.is_deleted?`<form class="reply-form" id="replyForm-${c.id}" data-parent="${c.id}">
               <div class="reply-form__input-wrap">
                 <input class="form__input reply-input" type="text"
                   placeholder="Responder…" maxlength="500"
                   id="replyInput-${c.id}" />
                 <div class="mention-dropdown hidden" id="mentionDropdown-${c.id}"></div>
               </div>
               <button class="btn btn--outline btn--sm" type="submit">Enviar</button>
             </form>`:""}
      </div>
    `).join(""):""}function d(r){return`
      <div class="board-reply ${r.is_deleted?"board-reply--deleted":""}" data-id="${r.id}">
        <div class="board-reply__header">
          <strong class="board-reply__author">${T(r.username)}</strong>
          <span class="board-reply__date">${q(r.created_at)}</span>
          ${!r.is_deleted&&t&&(t.id===r.user_id||t.is_admin)?`<button class="btn btn--danger btn--xs delete-msg" data-id="${r.id}">✕</button>`:""}
        </div>
        <p class="board-reply__text">${b(r.message)}</p>
      </div>
    `}function _(r){return r.length?r.map(c=>`
      <div class="board-message ${c.is_deleted?"board-message--deleted":""}" data-id="${c.id}">
        <div class="board-message__header">
          <strong class="board-message__author">${T(c.username)}</strong>
          <span class="board-message__date">${q(c.created_at)}</span>
          ${t!=null&&t.is_admin&&!c.is_deleted?`<button class="btn btn--ghost btn--xs pin-msg" data-id="${c.id}" title="Fijar">📌</button>`:""}
          ${!c.is_deleted&&t&&(t.id===c.user_id||t.is_admin)?`<button class="btn btn--danger btn--xs delete-msg" data-id="${c.id}">✕</button>`:""}
        </div>
        <p class="board-message__text">${b(c.message)}</p>
      </div>
    `).join(""):'<p class="empty">Sin mensajes aún. ¡Sé el primero!</p>'}function b(r){const c=T(r);if(!i.length)return c;const I=i.map(k=>Ue(k.username)),C=new RegExp(`@(${I.join("|")})`,"gi");return c.replace(C,'<span class="mention">@$1</span>')}function f(){const r=document.getElementById("boardForm");if(!r)return;const c=document.getElementById("boardMsg"),I=document.getElementById("charCounter"),C=document.getElementById("mentionDropdown");c.addEventListener("input",()=>{I.textContent=`${c.value.length} / 500`,L(c,C)}),r.addEventListener("submit",async k=>{k.preventDefault();const D=c.value.trim();if(D)try{await u.board.post(D,s),c.value="",I.textContent="0 / 500",C.classList.add("hidden");const P=await g();w(P),m("Mensaje publicado")}catch(P){m(P.message,"error")}})}function E(){e.querySelectorAll(".reply-form").forEach(r=>{const c=parseInt(r.dataset.parent),I=r.querySelector(".reply-input"),C=`mentionDropdown-${c}`,k=document.getElementById(C);I==null||I.addEventListener("input",()=>{L(I,k)}),r.addEventListener("submit",async D=>{D.preventDefault();const P=I.value.trim();if(P)try{await u.board.reply(c,P),I.value="",k==null||k.classList.add("hidden");const R=await g();w(R),m("Respuesta enviada")}catch(R){m(R.message,"error")}})}),e.querySelectorAll(".pin-msg").forEach(r=>{r.addEventListener("click",async()=>{try{await u.board.pin(r.dataset.id);const c=await g();w(c),m("Mensaje fijado")}catch(c){m(c.message,"error")}})}),e.querySelectorAll(".unpin-msg").forEach(r=>{r.addEventListener("click",async()=>{try{await u.board.pin(r.dataset.id);const c=await g();w(c),m("Mensaje desfijado")}catch(c){m(c.message,"error")}})})}function y(){e.querySelectorAll(".delete-msg").forEach(r=>{r.addEventListener("click",async()=>{if(confirm("¿Eliminar este mensaje?"))try{await u.board.delete(r.dataset.id);const c=await g();w(c),m("Mensaje eliminado")}catch(c){m(c.message,"error")}})})}function w(r){const{pinned:c=[],messages:I=[]}=r,C=document.getElementById("boardPinned");if(C)C.innerHTML=v(c);else if(c.length){p(r);return}const k=document.getElementById("boardMessages");k&&(k.innerHTML=_(I)),E(),y()}e.addEventListener("click",async r=>{if(r.target.id==="prevPage"&&o>1){o--;const c=await g();w(c)}else if(r.target.id==="nextPage"&&o<l){o++;const c=await g();w(c)}});function L(r,c){if(!c||!i.length)return;const I=r.value,C=r.selectionStart,k=I.slice(0,C),D=k.match(/@(\w*)$/);if(!D){c.classList.add("hidden");return}const P=D[1].toLowerCase(),R=i.filter(B=>B.username.toLowerCase().startsWith(P)&&B.id!==(t==null?void 0:t.id)),Q=[...$.isAdmin()&&"todos".startsWith(P)?[{username:"todos",description:"Notificar a todos los miembros"}]:[],...R.slice(0,6)];if(!Q.length){c.classList.add("hidden");return}c.innerHTML=Q.map(B=>B.description?`<div class="mention-item mention-item--broadcast" data-username="${T(B.username)}">
             <span class="mention-item__name">@${T(B.username)}</span>
             <span class="mention-item__desc">${T(B.description)}</span>
           </div>`:`<div class="mention-item" data-username="${T(B.username)}">${T(B.username)}</div>`).join(""),c.classList.remove("hidden"),c.querySelectorAll(".mention-item").forEach(B=>{B.addEventListener("mousedown",$e=>{$e.preventDefault();const Ee=B.dataset.username,J=k.replace(/@(\w*)$/,`@${Ee} `);if(r.value=J+I.slice(C),r.setSelectionRange(J.length,J.length),c.classList.add("hidden"),r.tagName==="TEXTAREA"){const Z=document.getElementById("charCounter");Z&&(Z.textContent=`${r.value.length} / 500`)}})})}document.addEventListener("click",r=>{!r.target.closest(".board-form__input-wrap")&&!r.target.closest(".reply-form__input-wrap")&&document.querySelectorAll(".mention-dropdown").forEach(c=>c.classList.add("hidden"))},{capture:!0})}function T(e){return String(e).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;")}function Ue(e){return e.replace(/[.*+?^${}()|[\]\\]/g,"\\$&")}async function Ge(e){var a,t,s,n;e.innerHTML='<div class="loading"><div class="loading__spinner"></div></div>';try{const i=$.getUser(),o=i==null?void 0:i.is_admin,[l,g]=await Promise.all([o?u.leagues.adminAll():u.leagues.all(),$.isLoggedIn()&&!o?u.leagues.my():Promise.resolve({leagues:[]})]),p=new Set(g.leagues.map(d=>d.id)),v=o?l.leagues:l.leagues.filter(d=>!p.has(d.id));e.innerHTML=`
      <div class="container">
        <h1 class="page-title">Ligas</h1>

        ${o?`
          <div class="admin-notice">Vista administrador — puedes acceder a cualquier liga sin participar en ella.</div>
        `:""}

        ${i&&!o&&g.leagues.length>0?`
          <section class="section">
            <h2>Mis ligas</h2>
            <div class="leagues-grid">${g.leagues.map(d=>ne(d,!0)).join("")}</div>
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
          ${v.length?`<div class="leagues-grid">${v.map(d=>ne(d,!1,p,o)).join("")}</div>`:o?'<p class="empty">No hay ligas creadas aún.</p>':g.leagues.length>0?'<p class="empty">Ya participas en todas las ligas disponibles.</p>':'<p class="empty">No hay ligas aún. ¡Crea la primera!</p>'}
        </section>
      </div>
    `,e.querySelectorAll('.league-card[data-navigate="true"]').forEach(d=>{d.addEventListener("click",()=>S.navigate(`/ligas/${d.dataset.id}`))}),e.querySelectorAll(".btn-join-league").forEach(d=>{d.addEventListener("click",async _=>{_.stopPropagation();const b=parseInt(d.dataset.id);d.disabled=!0,d.textContent="…";try{const{league:f}=await u.leagues.join({league_id:b});m(`¡Te has unido a "${f.name}"!`),S.navigate(`/ligas/${f.id}`)}catch(f){m(f.message,"error"),d.disabled=!1,d.textContent="Unirse"}})}),e.querySelectorAll(".btn-private-info").forEach(d=>{d.addEventListener("click",_=>{_.stopPropagation(),m("Esta liga es privada. Pide el enlace de invitación a cualquier miembro para unirte.","info")})}),(a=document.getElementById("btnShowCreate"))==null||a.addEventListener("click",()=>{var d,_;(d=document.getElementById("createLeaguePanel"))==null||d.classList.remove("hidden"),(_=document.getElementById("btnShowCreate"))==null||_.classList.add("hidden")}),(t=document.getElementById("btnCancelCreate"))==null||t.addEventListener("click",()=>{var d,_;(d=document.getElementById("createLeaguePanel"))==null||d.classList.add("hidden"),(_=document.getElementById("btnShowCreate"))==null||_.classList.remove("hidden")}),(s=document.getElementById("joinCodeForm"))==null||s.addEventListener("submit",async d=>{d.preventDefault();const _=document.getElementById("inviteCode").value.trim().toUpperCase();if(_)try{const{league:b}=await u.leagues.join({invite_code:_});m(`Te has unido a "${b.name}"`),S.navigate(`/ligas/${b.id}`)}catch(b){m(b.message,"error")}}),(n=document.getElementById("createLeagueForm"))==null||n.addEventListener("submit",async d=>{var L;d.preventDefault();const _=document.getElementById("createBtn");_.disabled=!0,_.textContent="Creando…";const b=document.getElementById("leagueName").value.trim(),f=document.getElementById("leagueDesc").value.trim(),E=document.getElementById("leaguePrize").value.trim(),y=document.getElementById("isPublic").checked,w=((L=document.getElementById("isOfficial"))==null?void 0:L.checked)??!1;try{const{league:r}=await u.leagues.create({name:b,description:f,prize:E,is_public:y,is_official:w});Je(r)}catch(r){m(r.message,"error"),_.disabled=!1,_.textContent="Crear liga"}})}catch(i){e.innerHTML=`<div class="container"><p class="form__error">Error: ${i.message}</p></div>`}}function ne(e,a=!1,t=new Set,s=!1){const n=e.is_official?'<span class="league-badge league-badge--official">⭐ Oficial</span>':"",i=e.is_public?"🌍":"🔒",o=s?`<button class="btn btn--sm btn--outline btn-admin-view" data-id="${e.id}">Ver (admin)</button>`:a?`<button class="btn btn--sm btn--outline" onclick="event.stopPropagation(); window.location.hash='/ligas/${e.id}'">Ver liga</button>`:e.is_public?`<button class="btn btn--sm btn--primary btn-join-league" data-id="${e.id}">Unirse</button>`:'<button class="btn btn--sm btn--ghost btn-private-info">🔒 Solicitar enlace</button>';return`
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
  `}function Je(e){var s,n;const a=e.invite_link||"",t=document.getElementById("createLeaguePanel");t&&(t.innerHTML=`
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
  `,(s=document.getElementById("btnCopyLink"))==null||s.addEventListener("click",async()=>{try{await navigator.clipboard.writeText(a),m("Enlace copiado")}catch{m("No se pudo copiar","error")}}),(n=document.getElementById("btnShare"))==null||n.addEventListener("click",async()=>{try{await navigator.share({title:`Únete a ${e.name} en PickGoal`,url:a})}catch{}}))}async function ze(e,{params:a}){var s,n,i,o,l;const t=parseInt(a.id);e.innerHTML='<div class="loading"><div class="loading__spinner"></div></div>';try{const g=await u.leagues.get(t),{league:p,ranking:v,is_member:d,is_admin_view:_}=g,b=$.getUser(),f=p.is_official?'<span class="league-badge league-badge--official">⭐ Oficial</span>':"";e.innerHTML=`
      <div class="container">
        <a href="#/ligas" class="back-link">← Volver a ligas</a>

        ${_?`
          <div class="admin-notice">Vista administrador — no participas en esta liga</div>
        `:""}

        <div class="league-header">
          <h1 class="page-title">${p.name} ${f}</h1>
          ${p.description?`<p class="league-header__desc">${p.description}</p>`:""}
          <div class="league-header__meta">
            <span>${p.is_public?"🌍 Pública":"🔒 Privada"}</span>
            <span>${p.member_count} participantes</span>
            ${p.prize?`<span>🏆 ${p.prize}</span>`:""}
          </div>
        </div>

        ${(d||b!=null&&b.is_admin)&&p.invite_link?`
          <div class="invite-share-box">
            <span class="invite-share-box__label">Enlace de invitación:</span>
            <div class="invite-link-box">
              <span class="invite-link-box__url">${p.invite_link}</span>
              <button class="btn btn--sm btn--outline" id="btnCopyInvite">Copiar</button>
              ${navigator.share?'<button class="btn btn--sm btn--ghost" id="btnShareInvite">Compartir</button>':""}
            </div>
          </div>
        `:""}

        <div class="league-actions">
          ${d?'<button class="btn btn--danger btn--sm" id="btnLeave">Abandonar liga</button>':!(b!=null&&b.is_admin)&&b?'<button class="btn btn--primary" id="btnJoin">Unirse a esta liga</button>':""}
          ${b!=null&&b.is_admin||d&&b&&p.created_by===b.id?'<button class="btn btn--outline btn--sm" id="btnEditLeague">Editar liga</button>':""}
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
              ${v.map(r=>`
                <tr class="${b&&r.id===b.id?"ranking-table__row--me":""}">
                  <td>${r.position}</td>
                  <td>${r.username}</td>
                  <td>${r.country||"—"}</td>
                  <td class="ranking-table__pts">${r.total_points}</td>
                </tr>
              `).join("")}
            </tbody>
          </table>
        </section>

        <section class="section hidden" id="sectionTablon">
          <div id="tablonEmbed"></div>
        </section>
      </div>
    `,(s=document.getElementById("btnCopyInvite"))==null||s.addEventListener("click",async()=>{try{await navigator.clipboard.writeText(p.invite_link),m("Enlace copiado")}catch{m("No se pudo copiar","error")}}),(n=document.getElementById("btnShareInvite"))==null||n.addEventListener("click",async()=>{try{await navigator.share({title:`Únete a ${p.name} en PickGoal`,url:p.invite_link})}catch{}}),(i=document.getElementById("btnLeave"))==null||i.addEventListener("click",async()=>{if(confirm("¿Seguro que quieres abandonar esta liga?"))try{await u.leagues.leave(t),m("Has abandonado la liga"),S.navigate("/ligas")}catch(r){m(r.message,"error")}}),(o=document.getElementById("btnJoin"))==null||o.addEventListener("click",async()=>{try{await u.leagues.join({league_id:t}),m("¡Te has unido a la liga!"),S.navigate(`/ligas/${t}`)}catch(r){m(r.message,"error")}}),(l=document.getElementById("btnEditLeague"))==null||l.addEventListener("click",()=>{Ve(p,t,b)});const E=document.getElementById("tabRanking"),y=document.getElementById("tabTablon"),w=document.getElementById("sectionRanking"),L=document.getElementById("sectionTablon");E&&y&&(E.addEventListener("click",()=>{E.classList.add("league-tab--active"),y.classList.remove("league-tab--active"),w.classList.remove("hidden"),L.classList.add("hidden")}),y.addEventListener("click",()=>{y.classList.add("league-tab--active"),E.classList.remove("league-tab--active"),w.classList.add("hidden"),L.classList.remove("hidden");const r=document.getElementById("tablonEmbed");r&&!r.dataset.loaded&&(r.dataset.loaded="1",_e(r,{query:{liga:String(t)}}))}))}catch(g){e.innerHTML=`<div class="container"><p class="form__error">Error: ${g.message}</p><a href="#/ligas">Volver</a></div>`}}function Ve(e,a,t){const s=document.getElementById("editLeagueModal");s&&s.remove();const n=document.createElement("div");n.id="editLeagueModal",n.className="edit-league-modal",n.innerHTML=`
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
  `,document.body.appendChild(n),requestAnimationFrame(()=>n.classList.add("edit-league-modal--open"));const i=()=>{n.classList.remove("edit-league-modal--open"),n.addEventListener("transitionend",()=>n.remove(),{once:!0})};n.querySelector(".edit-league-modal__overlay").addEventListener("click",i),document.getElementById("btnCancelEdit").addEventListener("click",i),document.getElementById("editLeagueForm").addEventListener("submit",async o=>{o.preventDefault();const l=document.getElementById("btnSaveEdit");l.disabled=!0,l.textContent="Guardando…";const g={name:document.getElementById("editName").value.trim(),description:document.getElementById("editDesc").value.trim(),prize:document.getElementById("editPrize").value.trim(),is_public:document.getElementById("editPublic").checked};t!=null&&t.is_admin&&(g.is_official=document.getElementById("editOfficial").checked);try{await u.leagues.update(a,g),m("Liga actualizada"),i(),S.navigate(`/ligas/${a}`)}catch(p){m(p.message,"error"),l.disabled=!1,l.textContent="Guardar cambios"}})}async function Xe(e){var t,s;e.innerHTML='<div class="loading"><div class="loading__spinner"></div></div>';const a=$.getUser();try{const n=(()=>{const f=localStorage.getItem("activeLeagueId");return f?parseInt(f):null})(),[i,o,l,g,p]=await Promise.all([u.predictions.mine(n),u.predictions.getChampion(n),u.leagues.my(),u.auth.me(),a!=null&&a.is_admin?u.leagues.adminAll():Promise.resolve({leagues:[]})]),v=i.predictions.reduce((f,E)=>f+E.total_points,0)+(((t=o.champion_prediction)==null?void 0:t.points_earned)||0),d=g.user,_=d.status,b=d.total_points_all_time;e.innerHTML=`
      <div class="container">
        <h1 class="page-title">Mi Perfil</h1>

        <section class="profile-card section">
          <div class="profile-card__info">
            <div class="profile-card__avatar">${a.username[0].toUpperCase()}</div>
            <div>
              <h2>${a.username}</h2>
              <p>${a.email}</p>
              <p>${a.country||"Sin país"}</p>
            </div>
          </div>
          ${We(_,b)}
          <button class="btn btn--danger" id="btnLogoutPerfil">Cerrar sesión</button>
          <div class="profile-card__stats">
            <div class="stat">
              <span class="stat__value">${v}</span>
              <span class="stat__label">Puntos totales</span>
            </div>
            <div class="stat">
              <span class="stat__value">${i.predictions.length}</span>
              <span class="stat__label">Predicciones</span>
            </div>
            <div class="stat">
              <span class="stat__value">${l.leagues.length}</span>
              <span class="stat__label">Ligas</span>
            </div>
          </div>
        </section>

        ${o.champion_prediction?`<section class="section">
               <h2>Predicción Campeón</h2>
               <p class="champion-pick">
                 🏆 <strong>${o.champion_prediction.team_name}</strong>
                 — ${o.champion_prediction.points_earned} puntos
               </p>
             </section>`:`<section class="section">
               <h2>Predicción Campeón</h2>
               <p class="notice">Aún no has predicho el campeón. <a href="#/campeon">Hacerlo ahora</a></p>
             </section>`}

        <section class="section">
          <h2>Mis predicciones</h2>
          ${i.predictions.length?`<div class="predictions-list">${i.predictions.map(Ke).join("")}</div>`:'<p class="empty">Sin predicciones aún. <a href="#/quiniela">Ir a la quiniela</a></p>'}
        </section>

        <section class="section">
          <h2>Mis ligas</h2>
          ${l.leagues.length?`<ul class="leagues-list">${l.leagues.map(f=>`<li><a href="#/ligas/${f.id}">${f.name}</a> <span class="tag">${f.is_public?"Pública":"Privada"}</span></li>`).join("")}</ul>`:'<p class="empty">No perteneces a ninguna liga. <a href="#/ligas">Ver ligas</a></p>'}
        </section>

        ${a!=null&&a.is_admin&&p.leagues.length?`
          <section class="section">
            <h2>Ligas gestionadas</h2>
            <ul class="leagues-list">
              ${p.leagues.map(f=>`
                <li>
                  <span>${f.is_official?"⭐ ":""}${f.name}</span>
                  <span class="tag">${f.is_public?"Pública":"Privada"}</span>
                  <a href="#/ligas/${f.id}" class="btn btn--sm btn--outline">Gestionar</a>
                </li>
              `).join("")}
            </ul>
          </section>
        `:""}
      </div>
    `,(s=e.querySelector("#btnLogoutPerfil"))==null||s.addEventListener("click",()=>{$.logout(),window.location.hash="/"})}catch(n){e.innerHTML=`<div class="container"><p class="form__error">Error: ${n.message}</p></div>`}}function We(e,a){if(e.next_threshold===null)return`
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
    </div>`}function Ke(e){return`
    <div class="pred-row ${e.total_points>0?"pred-row--scored":""}">
      <span class="pred-row__result">${e.predicted_result}</span>
      <span class="pred-row__score">${e.predicted_home}-${e.predicted_away}</span>
      <span class="pred-row__pts">${e.total_points} pts</span>
    </div>
  `}const ie=new Date("2026-06-11T21:00:00Z"),Ye=["Argentina","Brasil","Francia","España","Inglaterra","Alemania","Portugal","Países Bajos","Italia","Bélgica","Uruguay","Colombia","México","Estados Unidos","Canadá","Marruecos","Senegal","Nigeria","Japón","Corea del Sur","Australia","Arabia Saudí","Irán","Qatar","Ecuador","Chile","Perú","Venezuela","Bolivia","Paraguay","Costa Rica","Honduras","Panamá","Jamaica","Trinidad y Tobago","Guatemala","Turquía","Polonia","Croacia","Serbia","República Checa","Eslovaquia","Austria","Suiza","Dinamarca","Suecia","Noruega","Escocia","Ucrania","Rumanía","Hungría","Grecia","Egipto","Camerún","Ghana","Costa de Marfil","Túnez","Argelia","China","India","Irak","Uzbekistán","Nueva Zelanda","Fiji"];function Qe(){const e=localStorage.getItem("activeLeagueId");return e?parseInt(e):null}async function ve(e){var a;if(!$.isLoggedIn()){e.innerHTML='<div class="container"><p class="notice"><a href="#/login">Inicia sesión</a> para predecir el campeón.</p></div>';return}e.innerHTML='<div class="loading"><div class="loading__spinner"></div></div>';try{const t=Qe(),{champion_prediction:s}=await u.predictions.getChampion(t),n=new Date>=ie;let i;s&&n?i=`
        <div class="champion-result">
          <p>Tu predicción: <strong class="champion-result__team">${s.team_name}</strong></p>
          <p>Puntos ganados: <strong>${s.points_earned}</strong></p>
          <p class="notice">🔒 El torneo ha comenzado, tu predicción está bloqueada.</p>
        </div>
      `:!s&&n?i=`
        <p class="notice notice--warning">⚠️ El torneo ya ha comenzado. Una vez confirmado no podrás cambiarlo.</p>
        ${V(null)}
      `:s&&!n?i=`
        <p class="notice">Puedes cambiar tu predicción hasta el inicio del torneo.</p>
        ${V(s.team_name)}
      `:i=V(null),e.innerHTML=`
      <div class="container">
        <h1 class="page-title">🏆 Predice el Campeón</h1>
        <p class="champion-desc">
          Acertar el campeón del mundo vale <strong>10 puntos extra</strong>.
          Puedes modificar tu elección hasta el inicio del torneo
          (${ie.toLocaleDateString("es-ES",{day:"numeric",month:"long",year:"numeric",hour:"2-digit",minute:"2-digit"})}).
        </p>
        ${i}
      </div>
    `,(a=document.getElementById("championForm"))==null||a.addEventListener("submit",async o=>{o.preventDefault();const l=document.getElementById("champBtn"),g=document.getElementById("champError"),p=document.getElementById("teamSearch").value.trim();if(p){l.disabled=!0,l.textContent="Guardando…",g.classList.add("hidden");try{await u.predictions.saveChampion(p,t),m(`¡${p} guardado como campeón!`),ve(e)}catch(v){g.textContent=v.message,g.classList.remove("hidden"),l.disabled=!1,l.textContent=l.dataset.label||"Confirmar predicción"}}})}catch(t){e.innerHTML=`<div class="container"><p class="form__error">Error: ${t.message}</p></div>`}}function V(e){const a=e?"Actualizar predicción":"Confirmar predicción";return`
    <form class="form champion-form" id="championForm">
      <div class="form__group">
        <label class="form__label" for="teamSearch">Selecciona el equipo campeón</label>
        <input class="form__input" type="text" id="teamSearch"
          placeholder="Escribe para buscar…"
          list="teamsList" autocomplete="off"
          value="${e??""}" required />
        <datalist id="teamsList">
          ${Ye.map(t=>`<option value="${t}">`).join("")}
        </datalist>
      </div>
      <p id="champError" class="form__error hidden"></p>
      <button class="btn btn--primary" type="submit" id="champBtn" data-label="${a}">
        ${a}
      </button>
    </form>
  `}const Ze=[{key:"group",label:"Grupos"},{key:"r32",label:"Dieciseisavos"},{key:"r16",label:"Octavos"},{key:"quarters",label:"Cuartos"},{key:"semis",label:"Semis"},{key:"third",label:"3er y 4to"},{key:"final",label:"Final"}];async function ea(e){if(!$.isAdmin()){e.innerHTML='<div class="container"><p class="form__error">Acceso denegado.</p></div>';return}e.innerHTML='<div class="loading"><div class="loading__spinner"></div></div>';try{const[{users:a},{groups:t}]=await Promise.all([u.auth.users(),u.matches.grouped()]),s=aa(t);e.innerHTML=`
      <div class="container">
        <h1 class="page-title">Panel de Administración</h1>

        <section class="section admin-section">
          <h2 class="admin-section__title">Scheduler</h2>
          <p class="admin-section__desc">Sincroniza el calendario cada 24h y actualiza partidos en vivo cada 5 min.</p>
          <button class="btn btn--primary" id="btnSync">Sincronizar ahora</button>
          <div id="syncResult"></div>
        </section>

        <section class="section admin-section">
          <h2 class="admin-section__title">Premiar campeón</h2>
          <form class="form form--inline" id="awardForm">
            <input class="form__input" type="text" id="winnerTeam" placeholder="Equipo campeón" />
            <button class="btn btn--primary" type="submit">Premiar (+10 pts)</button>
          </form>
        </section>

        <section class="section admin-section">
          <h2 class="admin-section__title">Gestión de resultados</h2>
          ${ta(s)}
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
          <h2 class="admin-section__title">Usuarios (${a.length})</h2>
          <div class="admin-table-wrapper">
            <table class="admin-table">
              <thead>
                <tr>
                  <th>ID</th><th>Usuario</th><th>Email</th><th>País</th><th>Admin</th><th>Acción</th>
                </tr>
              </thead>
              <tbody id="usersTableBody">
                ${a.map(ia).join("")}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    `,na(e),K(e)}catch(a){e.innerHTML=`<div class="container"><p class="form__error">Error: ${a.message}</p></div>`}}function aa(e){const a={};for(const t of e){const s=t.phase;a[s]||(a[s]=[]),a[s].push(...t.matches)}return a}function ta(e){const a=Ze.filter(n=>{var i;return(i=e[n.key])==null?void 0:i.length});if(!a.length)return'<p class="admin-section__desc">No hay partidos cargados.</p>';const t=a.map((n,i)=>`
    <button class="admin-result-tab${i===0?" admin-result-tab--active":""}" data-phase="${n.key}">
      ${n.label}
    </button>
  `).join(""),s=a.map((n,i)=>`
    <div class="admin-result-panel${i===0?"":" admin-result-panel--hidden"}" data-phase="${n.key}">
      ${(e[n.key]||[]).map(sa).join("")}
    </div>
  `).join("");return`
    <div class="admin-result-tabs">${t}</div>
    <div id="resultPanels">${s}</div>
    <div class="admin-result-footer">
      <button class="btn btn--danger" id="btnRecalcAll">Recalcular todos los puntos</button>
      <span id="recalcResult" class="admin-result-footer__msg"></span>
    </div>
  `}function sa(e){const a=e.status==="finished",t=a&&e.home_score_90!=null?e.home_score_90:"",s=a&&e.away_score_90!=null?e.away_score_90:"",n=a&&e.result_90?e.result_90:"",i=a?'<span class="admin-match-badge admin-match-badge--done">Terminado</span>':'<span class="admin-match-badge admin-match-badge--pending">Pendiente</span>',o=he(e.match_datetime);return`
    <div class="admin-match-row" data-id="${e.id}">
      <div class="admin-match-row__info">
        <span class="admin-match-row__teams">${e.home_team} vs ${e.away_team}</span>
        <span class="admin-match-row__date">${o}</span>
        ${i}
      </div>
      <div class="admin-match-row__score">
        <input type="number" min="0" max="20" class="admin-match-row__input" value="${t}" placeholder="L" />
        <span class="admin-match-row__dash">-</span>
        <input type="number" min="0" max="20" class="admin-match-row__input" value="${s}" placeholder="V" />
        <select class="admin-match-row__result90" title="Resultado 90min (vacío = automático)">
          <option value="">Auto</option>
          <option value="1" ${n==="1"?"selected":""}>1</option>
          <option value="X" ${n==="X"?"selected":""}>X</option>
          <option value="2" ${n==="2"?"selected":""}>2</option>
        </select>
        <button class="btn btn--primary btn--xs admin-match-row__save">Guardar</button>
      </div>
    </div>
  `}function he(e){return e?new Date(e).toLocaleDateString("es-ES",{day:"2-digit",month:"2-digit"}):"—"}function na(e){var s,n,i,o,l,g;(s=document.getElementById("btnSync"))==null||s.addEventListener("click",async()=>{const p=document.getElementById("syncResult");p.textContent="Sincronizando…";try{await u.matches.sync(),p.textContent="✓ Sincronización completada",m("Sincronización completada")}catch(v){p.textContent=`Error: ${v.message}`,m(v.message,"error")}}),(n=document.getElementById("awardForm"))==null||n.addEventListener("submit",async p=>{p.preventDefault();const v=document.getElementById("winnerTeam").value.trim();if(v)try{const{message:d}=await u.predictions.awardChampion(v);m(d)}catch(d){m(d.message,"error")}}),e.querySelectorAll(".admin-result-tab").forEach(p=>{p.addEventListener("click",()=>{var v;e.querySelectorAll(".admin-result-tab").forEach(d=>d.classList.remove("admin-result-tab--active")),e.querySelectorAll(".admin-result-panel").forEach(d=>d.classList.add("admin-result-panel--hidden")),p.classList.add("admin-result-tab--active"),(v=e.querySelector(`.admin-result-panel[data-phase="${p.dataset.phase}"]`))==null||v.classList.remove("admin-result-panel--hidden")})}),(i=document.getElementById("resultPanels"))==null||i.addEventListener("click",async p=>{var w;const v=p.target.closest(".admin-match-row__save");if(!v)return;const d=v.closest(".admin-match-row"),_=parseInt(d.dataset.id),b=d.querySelectorAll(".admin-match-row__input"),f=b[0].value,E=b[1].value,y=((w=d.querySelector(".admin-match-row__result90"))==null?void 0:w.value)||null;if(f===""||E===""){m("Introduce ambos marcadores","error");return}v.disabled=!0;try{await u.matches.setResult(_,parseInt(f),parseInt(E),y);const L=d.querySelector(".admin-match-badge");L&&(L.className="admin-match-badge admin-match-badge--done",L.textContent="Terminado"),m(`Resultado ${f}-${E} guardado`)}catch(L){m(L.message,"error")}finally{v.disabled=!1}}),(o=document.getElementById("btnRecalcAll"))==null||o.addEventListener("click",async()=>{const p=document.getElementById("btnRecalcAll"),v=document.getElementById("recalcResult");p.disabled=!0,v.textContent="Recalculando…";try{const{message:d}=await u.matches.recalculate();v.textContent=`✓ ${d}`,m(d)}catch(d){v.textContent=`Error: ${d.message}`,m(d.message,"error")}finally{p.disabled=!1}});const a=document.getElementById("pushTarget"),t=document.getElementById("pushTargetIdGroup");a==null||a.addEventListener("change",()=>{t.classList.toggle("hidden",a.value==="all")}),(l=document.getElementById("pushForm"))==null||l.addEventListener("submit",async p=>{p.preventDefault();const v=document.getElementById("pushTitle").value.trim()||"Aviso",d=document.getElementById("pushBody").value.trim(),_=a.value,b=parseInt(document.getElementById("pushTargetId").value)||null,f=document.getElementById("pushResult"),E={title:`📣 PickGoal — ${v}`,body:d};_==="league"&&b&&(E.league_id=b),_==="user"&&b&&(E.user_id=b),f.textContent="Enviando…";try{const{sent:y}=await u.notifications.send(E);f.textContent=`✓ Enviada a ${y} suscripción(es)`,m(`Notificación enviada a ${y} suscripción(es)`)}catch(y){f.textContent=`Error: ${y.message}`,m(y.message,"error")}}),(g=document.getElementById("usersTableBody"))==null||g.addEventListener("click",async p=>{const v=p.target.closest(".toggle-admin");if(!v)return;const d=parseInt(v.dataset.id);try{const{user:_}=await u.auth.toggleAdmin(d);v.closest("tr").querySelector(".admin-badge").textContent=_.is_admin?"Sí":"No",m(`${_.username} ${_.is_admin?"ahora es admin":"ya no es admin"}`)}catch(_){m(_.message,"error")}})}function ia(e){return`
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
  `}const oa={PD:"🇪🇸 LaLiga",PL:"🏴󠁧󠁢󠁥󠁮󠁧󠁿 Premier League",CL:"⭐ Champions League"};let x=[],U=null;async function K(e){const a=document.getElementById("jornadasV2Content");if(a)try{const{jornadas:t}=await u.adminV2.jornadas();a.innerHTML=ra(t),la(a)}catch(t){a.innerHTML=`<p class="form__error">Error: ${t.message}</p>`}}function ra(e){const a=new Date;a.getFullYear(),String(be(a)).padStart(2,"0");const t=ga(a);return`
    <div class="jv2-panel">
      <div class="jv2-panel__actions">
        <button class="btn btn--primary btn--sm" id="btnNuevaJornada">+ Nueva jornada</button>
      </div>

      <div class="jv2-list">
        ${e.length===0?'<p class="admin-section__desc">No hay jornadas creadas.</p>':e.map(da).join("")}
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
  `}function da(e){const a={draft:'<span class="admin-match-badge" style="background:rgba(61,145,255,0.15);color:#3d91ff;border:1px solid rgba(61,145,255,0.3)">Borrador</span>',upcoming:'<span class="admin-match-badge admin-match-badge--pending">Próxima</span>',active:'<span class="admin-match-badge admin-match-badge--done">Activa</span>',finished:'<span class="admin-match-badge" style="background:rgba(255,255,255,0.05);color:#6e6e6e;border:1px solid #222">Finalizada</span>'}[e.status]||`<span class="admin-match-badge">${e.status}</span>`,t=s=>s?new Date(s).toLocaleDateString("es-ES",{day:"2-digit",month:"2-digit"}):"—";return`
    <div class="jv2-row">
      <div class="jv2-row__info">
        <span class="jv2-row__num">J${e.number}</span>
        <span class="jv2-row__dates">${t(e.date_start)} – ${t(e.date_end)}</span>
        ${a}
        <span class="jv2-row__matches">${e.match_count} partidos</span>
      </div>
      <div class="jv2-row__actions">
        ${e.status==="draft"?`
          <button class="btn btn--ghost btn--xs jv2-edit-btn" data-id="${e.id}">Editar</button>
          <button class="btn btn--danger btn--xs jv2-del-btn" data-id="${e.id}" data-num="${e.number}">Eliminar</button>
        `:""}
      </div>
    </div>
  `}function la(e){var a,t,s,n;(a=e.querySelector("#btnNuevaJornada"))==null||a.addEventListener("click",()=>{U=null,x=[],document.getElementById("jv2FormTitle").textContent="Nueva jornada",document.getElementById("jv2EditId").value="",document.getElementById("jv2Number").value="",document.getElementById("jv2DateStart").value="",document.getElementById("jv2DateEnd").value="",document.getElementById("jv2MatchPicker").style.display="none",document.getElementById("jv2Form").style.display="block",Y()}),(t=e.querySelector("#btnCancelarJornada"))==null||t.addEventListener("click",()=>{document.getElementById("jv2Form").style.display="none",x=[],U=null}),(s=e.querySelector("#btnBuscarPartidos"))==null||s.addEventListener("click",ua),(n=e.querySelector("#btnGuardarJornada"))==null||n.addEventListener("click",pa),e.querySelectorAll(".jv2-edit-btn").forEach(i=>{i.addEventListener("click",()=>ca(i.dataset.id))}),e.querySelectorAll(".jv2-del-btn").forEach(i=>{i.addEventListener("click",async()=>{if(confirm(`¿Eliminar jornada ${i.dataset.num}?`))try{await u.adminV2.deleteJornada(i.dataset.id),m("Jornada eliminada"),K(document.querySelector("#jornadasV2Content").parentElement.parentElement)}catch(o){m(o.message,"error")}})})}async function ca(e){const{jornadas:a}=await u.adminV2.jornadas(),t=a.find(s=>String(s.id)===String(e));t&&(U=t.id,x=[],document.getElementById("jv2FormTitle").textContent=`Editar jornada ${t.number}`,document.getElementById("jv2EditId").value=t.id,document.getElementById("jv2Number").value=t.number,t.date_start&&(document.getElementById("jv2DateStart").value=t.date_start.slice(0,16)),t.date_end&&(document.getElementById("jv2DateEnd").value=t.date_end.slice(0,16)),document.getElementById("jv2MatchPicker").style.display="none",document.getElementById("jv2Form").style.display="block",Y())}async function ua(){const e=document.getElementById("btnBuscarPartidos"),a=document.getElementById("jv2Week").value;if(!a){m("Selecciona una semana","error");return}e.disabled=!0,e.textContent="Buscando…";try{const{matches:t}=await u.adminV2.partidos(a);ma(t),document.getElementById("jv2MatchPicker").style.display="block"}catch(t){m(`Error: ${t.message}`,"error")}finally{e.disabled=!1,e.textContent="Buscar partidos"}}function ma(e){const a=document.getElementById("jv2MatchList");if(Object.values(e).flat().length===0){a.innerHTML='<p class="admin-section__desc">No hay partidos disponibles para esta semana.</p>';return}a.innerHTML=Object.entries(e).map(([s,n])=>n.length?`
      <div class="jv2-comp-group">
        <div class="jv2-comp-group__title">${oa[s]||s}</div>
        ${n.map(i=>`
          <label class="jv2-match-item">
            <input type="checkbox" class="jv2-match-check" data-match='${JSON.stringify(i)}' />
            <span class="jv2-match-item__teams">${i.home_team} vs ${i.away_team}</span>
            <span class="jv2-match-item__date">${he(i.match_datetime)}</span>
          </label>
        `).join("")}
      </div>
    `:"").join(""),a.querySelectorAll(".jv2-match-check").forEach(s=>{s.addEventListener("change",()=>{const n=JSON.parse(s.dataset.match);if(s.checked){if(x.length>=10){s.checked=!1,m("Máximo 10 partidos","error");return}x.push(n)}else x=x.filter(i=>i.api_id!==n.api_id);Y()})})}function Y(){const e=document.getElementById("jv2Count"),a=document.getElementById("jv2CountWarn");e&&(e.textContent=x.length),a&&(a.style.display=x.length>0&&x.length!==10?"inline":"none")}async function pa(){const e=parseInt(document.getElementById("jv2Number").value),a=document.getElementById("jv2DateStart").value,t=document.getElementById("jv2DateEnd").value,s=document.getElementById("jv2EditId").value;if(!e||!a||!t){m("Completa número y fechas","error");return}if(x.length!==10){m("Selecciona exactamente 10 partidos","error");return}const n={number:e,date_start:new Date(a).toISOString(),date_end:new Date(t).toISOString(),matches:x},i=document.getElementById("btnGuardarJornada");i.disabled=!0;try{s?(await u.adminV2.updateJornada(s,n),m(`Jornada ${e} actualizada`)):(await u.adminV2.createJornada(n),m(`Jornada ${e} guardada como borrador`)),document.getElementById("jv2Form").style.display="none",x=[],U=null,await K(document.getElementById("jornadasV2Section"))}catch(o){m(o.message,"error")}finally{i.disabled=!1}}function be(e){const a=new Date(Date.UTC(e.getFullYear(),e.getMonth(),e.getDate())),t=a.getUTCDay()||7;a.setUTCDate(a.getUTCDate()+4-t);const s=new Date(Date.UTC(a.getUTCFullYear(),0,1));return Math.ceil(((a-s)/864e5+1)/7)}function ga(e){const a=new Date(e);a.setDate(a.getDate()+7);const t=a.getFullYear(),s=String(be(a)).padStart(2,"0");return`${t}-W${s}`}function _a(e){e.innerHTML=`
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
  `,document.getElementById("forgotForm").addEventListener("submit",async a=>{a.preventDefault();const t=document.getElementById("forgotBtn"),s=document.getElementById("forgotMsg"),n=document.getElementById("email").value.trim();t.disabled=!0,t.textContent="Enviando…";try{await u.auth.forgotPassword(n),s.textContent="Si el email existe, recibirás un enlace en breve.",s.classList.remove("hidden","form__error"),s.classList.add("form__success")}catch{m("Error al enviar el email","error")}finally{t.disabled=!1,t.textContent="Enviar enlace"}})}function va(e,{query:a}){const t=a.token||"";if(!t){e.innerHTML='<div class="container"><p class="form__error">Token inválido o expirado.</p><a href="#/login">Volver</a></div>';return}e.innerHTML=`
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
  `,document.getElementById("resetForm").addEventListener("submit",async s=>{s.preventDefault();const n=document.getElementById("resetBtn"),i=document.getElementById("resetError"),o=document.getElementById("password").value;n.disabled=!0,n.textContent="Guardando…",i.classList.add("hidden");try{await u.auth.resetPassword(t,o),m("Contraseña actualizada. Ya puedes iniciar sesión."),S.navigate("/login")}catch(l){i.textContent=l.message||"Error al restablecer la contraseña",i.classList.remove("hidden")}finally{n.disabled=!1,n.textContent="Guardar contraseña"}})}const ha={r32:"Dieciseisavos",r16:"Octavos",quarters:"Cuartos",semis:"Semis",third:"3º y 4º",final:"Final"};let H=!1,j=null;async function ba(e){H=!1,j=null,e.innerHTML='<div class="loading"><div class="loading__spinner"></div></div>';try{const{groups:a}=await u.matches.grouped(),t=$.isAdmin();e.innerHTML=`
      <div class="container">
        <div class="resultados-topbar">
          <h1 class="page-title">Resultados — Mundial 2026</h1>
          ${t?'<button class="btn btn--ghost btn--sm" id="btnEditResults">✏️ Editar resultados</button>':""}
        </div>
        <nav class="phase-nav" id="phaseNav"></nav>
        <div id="phaseContent"></div>
      </div>
    `,t&&document.getElementById("btnEditResults").addEventListener("click",()=>{H=!H;const s=document.getElementById("btnEditResults");H?(s.textContent="✅ Editando — salir",s.classList.add("btn--warning")):(s.textContent="✏️ Editar resultados",s.classList.remove("btn--warning")),j&&G(j.data,j.isGroup)}),document.getElementById("phaseContent").addEventListener("click",async s=>{var v;const n=s.target.closest(".res-match__save");if(!n)return;const i=parseInt(n.dataset.id),o=n.closest(".res-match"),l=o.querySelector(".res-match__input-home").value,g=o.querySelector(".res-match__input-away").value,p=((v=o.querySelector(".res-match__result90"))==null?void 0:v.value)||null;if(l===""||g===""){m("Introduce ambos marcadores","error");return}n.disabled=!0;try{if(await u.matches.setResult(i,parseInt(l),parseInt(g),p),m(`${l} - ${g} guardado`),j){const d=j.data.matches.find(_=>_.id===i);d&&(d.home_score_90=parseInt(l),d.away_score_90=parseInt(g),d.status="finished"),G(j.data,j.isGroup)}}catch(d){m(d.message,"error"),n.disabled=!1}}),fa(a)}catch(a){e.innerHTML=`<div class="container"><p class="form__error">Error cargando los partidos: ${a.message}</p></div>`}}function fa(e){var i;const a=document.getElementById("phaseNav");if(!a)return;const t=e.filter(o=>o.phase==="group"),s=e.filter(o=>o.phase!=="group"),n=[...t.map(o=>({key:`group_${o.group_name}`,label:`Grupo ${o.group_name}`,data:o,isGroup:!0})),...s.map(o=>({key:o.phase,label:ha[o.phase]||o.label,data:o,isGroup:!1}))];n.length!==0&&(a.innerHTML=n.map((o,l)=>`
    <button class="phase-nav__btn ${l===0?"phase-nav__btn--active":""}" data-key="${o.key}">
      ${o.label}
    </button>
  `).join(""),(i=a.querySelector(".phase-nav__btn--active"))==null||i.scrollIntoView({inline:"center",behavior:"instant",block:"nearest"}),a.querySelectorAll(".phase-nav__btn").forEach(o=>{o.addEventListener("click",()=>{a.querySelectorAll(".phase-nav__btn").forEach(g=>g.classList.remove("phase-nav__btn--active")),o.classList.add("phase-nav__btn--active");const l=n.find(g=>g.key===o.dataset.key);l&&(j=l,G(l.data,l.isGroup))})}),j=n[0],G(n[0].data,n[0].isGroup))}function G(e,a){const t=document.getElementById("phaseContent");if(!t)return;const s=ya(e.matches);if(a){const n=$a(e.matches);t.innerHTML=`
      <div class="resultados-section">
        <div class="resultados-matches">${s}</div>
        <div class="standings">
          <h3 class="standings__title">Clasificación — Grupo ${e.group_name}</h3>
          ${Ea(n)}
        </div>
      </div>
    `}else t.innerHTML=`<div class="resultados-matches">${s}</div>`}function ya(e){return!e||e.length===0?'<p class="empty">Sin partidos en esta fase.</p>':e.map(a=>{const t={scheduled:"Programado",live:"🔴 En juego",finished:"Finalizado"}[a.status]||a.status;let s;if(H){const n=a.home_score_90??"",i=a.away_score_90??"",o=a.result_90??"";s=`
        <div class="res-match__edit-score">
          <input type="number" min="0" max="20" class="res-match__input-home" value="${n}" placeholder="L" />
          <span class="res-match__edit-dash">-</span>
          <input type="number" min="0" max="20" class="res-match__input-away" value="${i}" placeholder="V" />
          <select class="res-match__result90" title="Resultado 90min (vacío = automático)">
            <option value="">Auto</option>
            <option value="1" ${o==="1"?"selected":""}>1</option>
            <option value="X" ${o==="X"?"selected":""}>X</option>
            <option value="2" ${o==="2"?"selected":""}>2</option>
          </select>
          <button class="btn btn--primary btn--xs res-match__save" data-id="${a.id}">Guardar</button>
        </div>
      `}else a.status!=="scheduled"?s=`<span class="res-score">${a.home_score_90??"?"} - ${a.away_score_90??"?"}</span>`:s='<span class="res-score res-score--pending">vs</span>';return`
      <div class="res-match ${a.status==="finished"?"res-match--finished":""} ${a.status==="live"?"res-match--live":""} ${H?"res-match--editing":""}">
        <div class="res-match__meta">
          <span class="res-match__status">${t}</span>
          <span class="res-match__date">${q(a.match_datetime)}</span>
        </div>
        <div class="res-match__teams">
          <span class="res-match__team res-match__team--home">${a.home_team}</span>
          ${s}
          <span class="res-match__team res-match__team--away">${a.away_team}</span>
        </div>
      </div>
    `}).join("")}function $a(e){const a={};for(const t of e)if(a[t.home_team]||(a[t.home_team]={name:t.home_team,pj:0,g:0,e:0,p:0,gf:0,gc:0,pts:0}),a[t.away_team]||(a[t.away_team]={name:t.away_team,pj:0,g:0,e:0,p:0,gf:0,gc:0,pts:0}),t.status==="finished"&&t.home_score_90!==null&&t.away_score_90!==null){const s=a[t.home_team],n=a[t.away_team];s.pj++,n.pj++,s.gf+=t.home_score_90,s.gc+=t.away_score_90,n.gf+=t.away_score_90,n.gc+=t.home_score_90,t.home_score_90>t.away_score_90?(s.g++,s.pts+=3,n.p++):t.home_score_90<t.away_score_90?(n.g++,n.pts+=3,s.p++):(s.e++,s.pts++,n.e++,n.pts++)}return Object.values(a).sort((t,s)=>{if(s.pts!==t.pts)return s.pts-t.pts;const n=s.gf-s.gc,i=t.gf-t.gc;return n!==i?n-i:s.gf-t.gf})}function Ea(e){return e.length===0?'<p class="empty">Sin datos de clasificación.</p>':`
    <table class="standings__table">
      <thead>
        <tr>
          <th>#</th>
          <th class="standings__team-header">Equipo</th>
          <th title="Partidos jugados">PJ</th>
          <th title="Ganados">G</th>
          <th title="Empatados">E</th>
          <th title="Perdidos">P</th>
          <th title="Goles a favor">GF</th>
          <th title="Goles en contra">GC</th>
          <th title="Puntos">Pts</th>
        </tr>
      </thead>
      <tbody>${e.map((t,s)=>`
    <tr class="${s<3?"standings__row--qualify":""}">
      <td class="standings__pos">${s+1}</td>
      <td class="standings__team">${t.name}</td>
      <td>${t.pj}</td>
      <td>${t.g}</td>
      <td>${t.e}</td>
      <td>${t.p}</td>
      <td>${t.gf}</td>
      <td>${t.gc}</td>
      <td class="standings__pts">${t.pts}</td>
    </tr>
  `).join("")}</tbody>
    </table>
  `}async function wa(e,{query:a}){const t=(a.codigo||"").trim().toUpperCase();if(!t){e.innerHTML='<div class="container"><p class="form__error">Enlace de invitación inválido.</p><a href="#/ligas">Ver ligas</a></div>';return}if(!$.isLoggedIn()){sessionStorage.setItem("pendingInviteCode",t),S.navigate("/register");return}e.innerHTML='<div class="loading"><div class="loading__spinner"></div></div>';try{const{league:s}=await u.leagues.joinByCode(t);m(`¡Te has unido a "${s.name}"!`),S.navigate(`/ligas/${s.id}`)}catch(s){if(s.status===409){m("Ya eres miembro de esta liga");try{const{leagues:n}=await u.leagues.my(),i=n.find(o=>o.invite_code===t);if(i){S.navigate(`/ligas/${i.id}`);return}}catch{}}e.innerHTML=`
      <div class="container">
        <div class="league-gate">
          <div class="league-gate__icon">⚠️</div>
          <h2 class="league-gate__title">Error al unirse</h2>
          <p class="league-gate__text">${s.message}</p>
          <a href="#/ligas" class="btn btn--primary">Ver ligas</a>
        </div>
      </div>
    `}}function La(){const e=localStorage.getItem("activeLeagueId");return e?parseInt(e):null}async function Ia(e,{params:a}){const t=parseInt(a.id);if(!t){e.innerHTML='<div class="container"><p class="form__error">Usuario no válido.</p></div>';return}e.innerHTML='<div class="loading"><div class="loading__spinner"></div></div>';try{const s=La(),{user:n,predictions:i}=await u.predictions.forUser(t,s);e.innerHTML=`
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
              ${i.map(o=>Sa(o)).join("")}
            </div>`}
      </div>
    `}catch(s){e.innerHTML=`<div class="container"><p class="form__error">Error: ${s.message}</p></div>`}}function Sa(e){const a=e.match,t=e.total_points,s=e.pts_score>0,n=e.pts_result>0;let i="";return s?i='<span class="jugador__badge jugador__badge--exact">Exacto</span>':n?i='<span class="jugador__badge jugador__badge--ok">1X2 ✓</span>':i='<span class="jugador__badge jugador__badge--miss">Fallo</span>',`
    <div class="jugador__pred-row">
      <div class="jugador__pred-match">
        <span class="jugador__pred-teams">${a.home_team} vs ${a.away_team}</span>
        <span class="jugador__pred-date">${q(a.match_datetime)}</span>
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
  `}const ka={"/":Ie,"/login":je,"/register":Pe,"/quiniela":Me,"/resultados":ba,"/ranking":Fe,"/tablon":_e,"/ligas":Ge,"/ligas/:id":ze,"/perfil":Xe,"/campeon":ve,"/admin":ea,"/forgot-password":_a,"/reset-password":va,"/unirse":wa,"/jugador/:id":Ia};function xa(e){for(const[a,t]of Object.entries(ka)){const s=[],n=new RegExp("^"+a.replace(/:([^/]+)/g,(o,l)=>(s.push(l),"([^/]+)"))+"$"),i=e.match(n);if(i){const o={};return s.forEach((l,g)=>{o[l]=i[g+1]}),{handler:t,params:o}}}return null}const oe=()=>document.getElementById("mainContent"),S={init(){window.addEventListener("hashchange",()=>this.resolve()),this.resolve()},navigate(e){window.location.hash=e},resolve(){const e=window.location.hash.slice(1)||"/",[a,t]=e.split("?"),s=Object.fromEntries(new URLSearchParams(t||"")),n=xa(a);if(!n){oe().innerHTML='<div class="error-page"><h2>Página no encontrada</h2><a href="#/">Volver al inicio</a></div>';return}const{handler:i,params:o}=n;if(["/perfil","/campeon","/admin"].includes(a)&&!$.isLoggedIn()){this.navigate("/login");return}if(a==="/admin"&&!$.isAdmin()){this.navigate("/");return}const g=oe();g.innerHTML='<div class="loading"><div class="loading__spinner"></div></div>',i(g,{params:o,query:s})}};let F=[],O=null,A=null;async function Ca(){await $.init(),S.init(),Pa(),Ba(),qa()}function fe(){return localStorage.getItem("pwa_installed")==="true"||window.matchMedia("(display-mode: standalone)").matches||window.navigator.standalone===!0}function Ba(){window.addEventListener("beforeinstallprompt",e=>{e.preventDefault(),!fe()&&(O=e,ja())}),window.addEventListener("appinstalled",()=>{var e;localStorage.setItem("pwa_installed","true"),O=null,(e=document.getElementById("installBanner"))==null||e.remove()})}function ja(){if(fe()||sessionStorage.getItem("installBannerDismissed"))return;const e=document.createElement("div");e.id="installBanner",e.className="install-banner",e.innerHTML=`
    <span class="install-banner__text">⚽ Instala PickGoal en tu dispositivo</span>
    <div class="install-banner__actions">
      <button class="install-banner__btn install-banner__btn--primary" id="installBtn">Instalar</button>
      <button class="install-banner__btn install-banner__btn--ghost" id="installDismissBtn">Ahora no</button>
    </div>
  `,document.body.appendChild(e),document.getElementById("installBtn").addEventListener("click",async()=>{O&&(O.prompt(),await O.userChoice,O=null,e.remove())}),document.getElementById("installDismissBtn").addEventListener("click",()=>{sessionStorage.setItem("installBannerDismissed","1"),e.remove()})}function N(){var e,a;(e=document.getElementById("userDropdown"))==null||e.classList.add("hidden"),(a=document.getElementById("userBtn"))==null||a.classList.remove("navbar__dropdown-btn--open")}async function W(){const e=document.getElementById("tablonBadge");if(!e)return;if(!$.getUser()){e.classList.add("hidden");return}const t=localStorage.getItem("activeLeagueId");if(!t){e.classList.add("hidden");return}const s=localStorage.getItem(`tablon_last_read_${t}`)||new Date(0).toISOString();try{const{count:n}=await u.board.unread(parseInt(t),s);n>0?(e.textContent=n>99?"99+":String(n),e.classList.remove("hidden")):e.classList.add("hidden")}catch{e.classList.add("hidden")}}function Pa(){var e,a,t;document.addEventListener("auth:change",re),window.addEventListener("hashchange",()=>{N(),ye(),setTimeout(W,200)}),document.addEventListener("click",N),(e=document.getElementById("userBtn"))==null||e.addEventListener("click",s=>{var o;s.stopPropagation();const n=document.getElementById("userDropdown"),i=n==null?void 0:n.classList.contains("hidden");N(),i&&(n==null||n.classList.remove("hidden"),(o=document.getElementById("userBtn"))==null||o.classList.add("navbar__dropdown-btn--open"))}),(a=document.getElementById("userDropdown"))==null||a.addEventListener("click",s=>{s.stopPropagation(),s.target.closest("#navProfileLink")&&N()}),(t=document.getElementById("navLogoutBtn"))==null||t.addEventListener("click",()=>{F=[],localStorage.removeItem("activeLeagueId"),N(),$.logout(),S.navigate("/")}),re()}async function re(){const e=document.getElementById("navAuthLinks"),a=document.getElementById("userBtn"),t=document.getElementById("navUsername"),s=document.getElementById("bottomNav"),n=$.getUser();if(N(),n){e==null||e.classList.add("hidden"),t&&(t.textContent=n.username),a.style.visibility="visible",s==null||s.classList.remove("hidden"),document.body.classList.add("has-bottom-nav");try{const{leagues:i}=n.is_admin?await u.leagues.adminAll():await u.leagues.my();F=i}catch{F=[]}Ta(F),W(),A&&clearInterval(A),A=setInterval(W,5*60*1e3)}else e==null||e.classList.remove("hidden"),a.style.visibility="hidden",s==null||s.classList.add("hidden"),document.body.classList.remove("has-bottom-nav"),F=[],localStorage.removeItem("activeLeagueId"),A&&(clearInterval(A),A=null);ye()}function Ta(e){const a=localStorage.getItem("activeLeagueId");a&&e.some(s=>String(s.id)===String(a))||(e.length>0?localStorage.setItem("activeLeagueId",String(e[0].id)):localStorage.removeItem("activeLeagueId"))}function ye(){const e=window.location.hash.slice(1).split("?")[0]||"/";document.querySelectorAll(".bottom-nav__item").forEach(a=>{const t=a.dataset.route,s=t==="/"?e==="/":e===t||e.startsWith(t+"/");a.classList.toggle("bottom-nav__item--active",s)})}function Ma(e){const a="=".repeat((4-e.length%4)%4),t=(e+a).replace(/-/g,"+").replace(/_/g,"/"),s=atob(t);return Uint8Array.from([...s].map(n=>n.charCodeAt(0)))}async function qa(){if(!(!("serviceWorker"in navigator)||!("PushManager"in window)))try{const e=await navigator.serviceWorker.register("/sw.js");document.addEventListener("auth:change",async a=>{a.detail&&await de(e)}),$.getUser()&&await de(e)}catch{}}async function de(e){try{if(await Notification.requestPermission()!=="granted")return;const t=await e.pushManager.getSubscription();if(t){await u.notifications.subscribe(t.toJSON());return}const{public_key:s}=await u.notifications.vapidPublicKey();if(!s)return;const n=await e.pushManager.subscribe({userVisibleOnly:!0,applicationServerKey:Ma(s)});await u.notifications.subscribe(n.toJSON())}catch{}}Ca();
