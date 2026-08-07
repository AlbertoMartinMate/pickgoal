(function(){const a=document.createElement("link").relList;if(a&&a.supports&&a.supports("modulepreload"))return;for(const n of document.querySelectorAll('link[rel="modulepreload"]'))s(n);new MutationObserver(n=>{for(const i of n)if(i.type==="childList")for(const o of i.addedNodes)o.tagName==="LINK"&&o.rel==="modulepreload"&&s(o)}).observe(document,{childList:!0,subtree:!0});function t(n){const i={};return n.integrity&&(i.integrity=n.integrity),n.referrerPolicy&&(i.referrerPolicy=n.referrerPolicy),n.crossOrigin==="use-credentials"?i.credentials="include":n.crossOrigin==="anonymous"?i.credentials="omit":i.credentials="same-origin",i}function s(n){if(n.ep)return;n.ep=!0;const i=t(n);fetch(n.href,i)}})();const Me="https://pickgoal-backend.onrender.com/api";function De(){return localStorage.getItem("token")}async function g(e,a={}){const t={"Content-Type":"application/json",...a.headers},s=De();s&&(t.Authorization=`Bearer ${s}`);const n=await fetch(`${Me}${e}`,{...a,headers:t}),i=await n.json().catch(()=>({}));if(!n.ok)throw{status:n.status,message:i.error||"Error desconocido"};return i}const u={get:e=>g(e),post:(e,a)=>g(e,{method:"POST",body:JSON.stringify(a)}),patch:(e,a)=>g(e,{method:"PATCH",body:JSON.stringify(a)}),delete:e=>g(e,{method:"DELETE"}),auth:{register:e=>g("/auth/register",{method:"POST",body:JSON.stringify(e)}),login:e=>g("/auth/login",{method:"POST",body:JSON.stringify(e)}),me:()=>g("/auth/me"),forgotPassword:e=>g("/auth/forgot-password",{method:"POST",body:JSON.stringify({email:e})}),resetPassword:(e,a)=>g("/auth/reset-password",{method:"POST",body:JSON.stringify({token:e,password:a})}),ranking:e=>g(`/auth/ranking${e?`?league_id=${e}`:""}`),users:()=>g("/auth/users"),toggleAdmin:e=>g(`/auth/users/${e}/toggle-admin`,{method:"PATCH"})},matches:{grouped:()=>g("/matches/grouped"),list:(e="")=>g(`/matches/${e}`),get:e=>g(`/matches/${e}`),today:()=>g("/matches/today"),setResult:(e,a,t,s=null)=>g(`/matches/${e}/result`,{method:"PATCH",body:JSON.stringify({home_score:a,away_score:t,...s?{result_90:s}:{}})}),sync:()=>g("/matches/sync",{method:"POST"}),recalculate:()=>g("/matches/recalculate",{method:"POST"})},predictions:{mine:e=>g(`/predictions/${e?`?league_id=${e}`:""}`),forMatch:(e,a)=>g(`/predictions/match/${e}${a?`?league_id=${a}`:""}`),save:e=>g("/predictions/",{method:"POST",body:JSON.stringify(e)}),forUser:(e,a)=>g(`/predictions/user/${e}${a?`?league_id=${a}`:""}`),getChampion:e=>g(`/predictions/champion${e?`?league_id=${e}`:""}`),saveChampion:(e,a)=>g("/predictions/champion",{method:"POST",body:JSON.stringify({team_name:e,league_id:a??null})}),awardChampion:e=>g("/predictions/champion/award",{method:"POST",body:JSON.stringify({team_name:e})})},leagues:{all:()=>g("/leagues/all"),public:()=>g("/leagues/public"),my:()=>g("/leagues/my"),create:e=>g("/leagues/",{method:"POST",body:JSON.stringify(e)}),join:e=>g("/leagues/join",{method:"POST",body:JSON.stringify(e)}),joinByCode:e=>g(`/leagues/join/${encodeURIComponent(e)}`),adminAll:()=>g("/leagues/admin"),get:e=>g(`/leagues/${e}`),update:(e,a)=>g(`/leagues/${e}`,{method:"PUT",body:JSON.stringify(a)}),leave:e=>g(`/leagues/${e}/leave`,{method:"DELETE"}),members:e=>g(`/leagues/${e}/members`),matchPredictions:(e,a)=>g(`/leagues/${e}/predictions/${a}`)},home:{summary:()=>g("/home/summary")},board:{messages:(e=1,a=null)=>g(`/board/?page=${e}${a?`&league_id=${a}`:""}`),unread:(e,a)=>g(`/board/unread?league_id=${e}&since=${encodeURIComponent(a)}`),post:(e,a=null)=>g("/board/",{method:"POST",body:JSON.stringify({message:e,league_id:a})}),pin:e=>g(`/board/${e}/pin`,{method:"POST"}),reply:(e,a)=>g(`/board/${e}/reply`,{method:"POST",body:JSON.stringify({message:a})}),delete:e=>g(`/board/${e}`,{method:"DELETE"})},notifications:{vapidPublicKey:()=>g("/notifications/vapid-public-key"),subscribe:e=>g("/notifications/subscribe",{method:"POST",body:JSON.stringify(e)}),send:e=>g("/notifications/send",{method:"POST",body:JSON.stringify(e)})},adminV2:{partidos:e=>g(`/v2/admin/partidos-disponibles?semana=${encodeURIComponent(e)}`),jornadas:()=>g("/v2/admin/jornadas"),createJornada:e=>g("/v2/admin/jornada",{method:"POST",body:JSON.stringify(e)}),updateJornada:(e,a)=>g(`/v2/admin/jornada/${e}`,{method:"PUT",body:JSON.stringify(a)}),deleteJornada:e=>g(`/v2/admin/jornada/${e}`,{method:"DELETE"}),publishJornada:e=>g(`/v2/admin/jornada/${e}/publish`,{method:"POST"})},jornada:{current:()=>g("/v2/jornada/current"),list:()=>g("/v2/jornada/list"),predict:e=>g("/v2/jornada/predict",{method:"POST",body:JSON.stringify({predictions:e})}),history:()=>g("/v2/jornada/history")},duelo:{current:()=>g("/v2/duelo/current")},clasificacion:{division:e=>g(`/v2/clasificacion/division${e?`?league_id=${e}`:""}`),general:()=>g("/v2/clasificacion/general"),allDivisions:()=>g("/v2/clasificacion/all-divisions")}};let D=null;const y={async init(){if(localStorage.getItem("token"))try{const{user:a}=await u.auth.me();D=a}catch{localStorage.removeItem("token")}},setUser(e,a){D=e,localStorage.setItem("token",a),document.dispatchEvent(new CustomEvent("auth:change",{detail:e}))},logout(){D=null,localStorage.removeItem("token"),document.dispatchEvent(new CustomEvent("auth:change",{detail:null}))},getUser(){return D},isLoggedIn(){return!!D},isAdmin(){return(D==null?void 0:D.is_admin)===!0}};let K=null;function p(e,a="success"){let t=document.getElementById("toast");t||(t=document.createElement("div"),t.id="toast",document.body.appendChild(t)),t.textContent=e,t.className=`toast toast--${a} toast--visible`,K&&clearTimeout(K),K=setTimeout(()=>{t.classList.remove("toast--visible")},3e3)}function he(){return`
    <div class="container">
      <div class="league-gate">
        <div class="league-gate__icon">⚽</div>
        <h2 class="league-gate__title">¡Inicia tu Liga!</h2>
        <p class="league-gate__text">Únete a una liga para empezar a predecir</p>
        <a href="#/ligas" class="btn btn--primary">Ver ligas disponibles</a>
      </div>
    </div>
  `}function be(){return`
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
  `}function fe(e){const a=e.querySelector("#pointsModal"),t=e.querySelector("#btnPointsInfo"),s=e.querySelector("#pointsClose"),n=e.querySelector("#pointsOverlay");function i(){a.classList.add("points-modal--open"),document.body.style.overflow="hidden"}function o(){a.classList.remove("points-modal--open"),document.body.style.overflow=""}return t==null||t.addEventListener("click",i),s==null||s.addEventListener("click",o),n==null||n.addEventListener("click",o),document.addEventListener("keydown",d=>{d.key==="Escape"&&o()},{once:!1}),i}function M(e){return e?new Date(e).toLocaleString("es-ES",{day:"2-digit",month:"2-digit",year:"numeric",hour:"2-digit",minute:"2-digit"}):"—"}async function He(e){if(!y.getUser()){Ae(e);return}e.innerHTML='<div class="loading"><div class="loading__spinner"></div></div>';try{const{leagues_summary:t,upcoming_matches:s}=await u.home.summary();if(t.length===0){Ne(e);return}const n=(()=>{const o=localStorage.getItem("activeLeagueId");return o?parseInt(o):null})(),i=[...t].sort((o,d)=>o.league_id===n?-1:d.league_id===n?1:0);e.innerHTML=`
      <div class="home-dashboard container">
        <div class="home-dashboard__topbar">
          <button class="btn btn--ghost btn--sm" id="btnPointsInfo">📊 Sistema de puntos</button>
        </div>

        ${ye()}

        <h3 class="home-dashboard__section-title">Ligas del Mundial</h3>
        <div class="home-dashboard__leagues">
          ${i.map(o=>Oe(o)).join("")}
        </div>

        <div class="home-dashboard__create">
          <a href="#/ligas" class="btn btn--ghost btn--sm">+ Crear liga privada</a>
        </div>

        ${Ue(s)}
      </div>
      ${be()}
    `,fe(e),$e(e),e.querySelectorAll(".league-card[data-league-id]").forEach(o=>{o.style.cursor="pointer",o.addEventListener("click",d=>{d.target.closest("[data-go-ranking]")||d.target.closest("a")||(localStorage.setItem("activeLeagueId",o.dataset.leagueId),I.navigate(`/ligas/${o.dataset.leagueId}`))})}),e.querySelectorAll("[data-go-ranking]").forEach(o=>{o.addEventListener("click",d=>{d.stopPropagation(),localStorage.setItem("activeLeagueId",o.dataset.goRanking),I.navigate("/ranking")})})}catch(t){e.innerHTML=`<div class="container"><p class="form__error">Error cargando el inicio: ${t.message}</p></div>`}}function Ae(e){e.innerHTML=`
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
  `}function Ne(e){e.innerHTML=`
    <div class="home-dashboard container">
      ${ye()}
      <div class="home-dashboard__create">
        <a href="#/ligas" class="btn btn--ghost btn--sm">+ Crear liga privada</a>
      </div>
    </div>
  `,$e(e)}function qe(e){const a=new Date,t=new Date(e),s=Math.ceil((t-a)/(1e3*60*60*24));return Math.max(0,s)}function ye(){const e=qe("2026-08-15");return`
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
  `}function $e(e){var a;(a=e.querySelector("#btnWaitlist"))==null||a.addEventListener("click",()=>{p("¡Ya estás dentro! Te avisaremos cuando empiece la temporada 🎉")})}function Oe(e){const a=e.next_to_predict?`<div class="league-card__next">
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
  `}function Ue(e){return e.length?`
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
      <a class="btn btn--ghost btn--sm" href="#/quiniela">Ver todos los pronósticos</a>
    </section>
  `:""}const ie="pickgoal_welcome_shown";function Ee(e="/ligas"){if(localStorage.getItem(ie))return;localStorage.setItem(ie,"1");const a=document.createElement("div");a.innerHTML=`
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
  `;const t=a.firstElementChild;document.body.appendChild(t),document.body.style.overflow="hidden",requestAnimationFrame(()=>t.classList.add("welcome-modal--open"));function s(n){t.classList.remove("welcome-modal--open"),document.body.style.overflow="",t.addEventListener("transitionend",()=>t.remove(),{once:!0}),n&&(window.location.hash=n)}document.getElementById("welcomeOverlay").addEventListener("click",()=>s()),document.getElementById("welcomeCta").addEventListener("click",()=>s(e)),document.addEventListener("keydown",function n(i){i.key==="Escape"&&(s(),document.removeEventListener("keydown",n))})}function Ge(e){e.innerHTML=`
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
  `,document.getElementById("loginForm").addEventListener("submit",async a=>{a.preventDefault();const t=document.getElementById("loginBtn"),s=document.getElementById("loginError"),n=document.getElementById("identifier").value.trim(),i=document.getElementById("password").value;t.disabled=!0,t.textContent="Entrando…",s.classList.add("hidden");try{const{token:o,user:d}=await u.auth.login({identifier:n,password:i});y.setUser(d,o),p(`¡Bienvenido, ${d.username}!`),I.navigate("/quiniela"),Ee("/quiniela")}catch(o){s.textContent=o.message||"Error al iniciar sesión",s.classList.remove("hidden")}finally{t.disabled=!1,t.textContent="Entrar"}})}function Re(e){e.innerHTML=`
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
  `,document.getElementById("registerForm").addEventListener("submit",async a=>{a.preventDefault();const t=document.getElementById("registerBtn"),s=document.getElementById("registerError");t.disabled=!0,t.textContent="Creando cuenta…",s.classList.add("hidden");const n={username:document.getElementById("username").value.trim(),email:document.getElementById("email").value.trim(),country:document.getElementById("country").value.trim(),password:document.getElementById("password").value};try{const{token:i,user:o}=await u.auth.register(n);y.setUser(o,i),p("¡Cuenta creada! Bienvenido a PickGoal");const d=sessionStorage.getItem("pendingInviteCode");if(d){sessionStorage.removeItem("pendingInviteCode");try{const{league:l}=await u.leagues.joinByCode(d);p(`¡Te has unido a "${l.name}"!`),I.navigate(`/ligas/${l.id}`)}catch{I.navigate("/ligas")}}else I.navigate("/campeon"),Ee("/ligas")}catch(i){s.textContent=i.message||"Error al registrarse",s.classList.remove("hidden")}finally{t.disabled=!1,t.textContent="Crear cuenta"}})}const Je=new Set(["r32","r16","quarters","semis","third","final"]);let Z=null;function oe(){const e=localStorage.getItem("activeLeagueId");return e?parseInt(e):null}async function Fe(e){var a,t;e.innerHTML='<div class="loading"><div class="loading__spinner"></div></div>';try{let s=null;if(y.isLoggedIn()){const{leagues:$}=await u.leagues.my();if($.length===0){e.innerHTML=he();return}const w=oe(),S=$.find(r=>r.id===w);s=S?S.name:((a=$[0])==null?void 0:a.name)??null}const n=oe(),[{groups:i},o,d]=await Promise.all([u.matches.grouped(),y.isLoggedIn()?u.predictions.mine(n):Promise.resolve({predictions:[]}),y.isLoggedIn()?u.predictions.getChampion(n):Promise.resolve({champion_prediction:null})]),l={};for(const $ of o.predictions)l[$.match_id]=$;const _=i.flatMap($=>$.matches),h=new Map;for(const $ of _){const w=de($.match_datetime);h.has(w)||h.set(w,[]),h.get(w).push($)}const m=[...h.keys()].sort(),v=de(new Date().toISOString()),b=m.find($=>$>=v)??m[0],f=((t=d.champion_prediction)==null?void 0:t.team_name)??null,L=y.isLoggedIn()?f?`<p class="champion-banner champion-banner--set">🏆 Tu campeón: <a href="#/campeon" style="color:inherit;font-weight:bold;">${f}</a></p>`:'<p class="champion-banner champion-banner--missing">⚠️ <a href="#/campeon">¡Elige tu campeón antes del inicio del torneo!</a></p>':"";e.innerHTML=`
      ${s?`<span class="page-league-name">${s}</span>`:""}
      <div class="container">
        <h1 class="page-title">Pronósticos — Mundial 2026</h1>
        ${L}
        ${y.isLoggedIn()?"":'<p class="notice">⚠️ <a href="#/login">Inicia sesión</a> para guardar tus predicciones.</p>'}
        <nav class="date-nav" id="dateNav"></nav>
        <div id="matchesContent"></div>
      </div>
      ${be()}
    `,Z=fe(e),ze(m,b,h,l,n)}catch(s){e.innerHTML=`<div class="container"><p class="form__error">Error cargando los partidos: ${s.message}</p></div>`}}function ze(e,a,t,s,n){var o;const i=document.getElementById("dateNav");i&&(i.innerHTML=e.map(d=>`
    <button class="date-nav__btn ${d===a?"date-nav__btn--active":""}" data-day="${d}">
      ${Ve(d)}
    </button>
  `).join(""),(o=i.querySelector(".date-nav__btn--active"))==null||o.scrollIntoView({inline:"center",behavior:"instant",block:"nearest"}),i.querySelectorAll(".date-nav__btn").forEach(d=>{d.addEventListener("click",()=>{i.querySelectorAll(".date-nav__btn").forEach(l=>l.classList.remove("date-nav__btn--active")),d.classList.add("date-nav__btn--active"),re(t.get(d.dataset.day)??[],s,n)})}),re(t.get(a)??[],s,n))}function re(e,a,t){const s=document.getElementById("matchesContent");if(s){if(e.length===0){s.innerHTML='<p class="empty">Sin partidos este día.</p>';return}s.innerHTML=`<div class="matches-grid">${e.map(n=>Xe(n,a[n.id])).join("")}</div>`,Z&&s.querySelectorAll(".knockout-info-btn").forEach(n=>{n.addEventListener("click",i=>{i.stopPropagation(),Z()})}),y.isLoggedIn()&&s.querySelectorAll(".prediction-form").forEach(n=>{Ye(n,a,t)})}}function de(e){const a=new Date(e);return`${a.getFullYear()}-${String(a.getMonth()+1).padStart(2,"0")}-${String(a.getDate()).padStart(2,"0")}`}function Ve(e){const[a,t,s]=e.split("-").map(Number);return new Date(a,t-1,s).toLocaleDateString("es-ES",{day:"numeric",month:"short"})}function Xe(e,a){const t=e.is_locked,s=a?`<span class="pts-badge">${a.total_points} pts</span>`:"",n={scheduled:"Programado",live:"🔴 En juego",finished:"Finalizado"}[e.status];return`
    <div class="match-card ${t?"match-card--locked":""}" data-match-id="${e.id}">
      <div class="match-card__header">
        <span class="match-card__status">${n}</span>
        <span class="match-card__date">${M(e.match_datetime)}</span>
        ${s}
      </div>
      <div class="match-card__teams">
        <span class="team team--home">${e.home_team}</span>
        <div class="match-card__score">
          ${e.status!=="scheduled"?`<span class="score">${e.home_score_90??"?"} - ${e.away_score_90??"?"}</span>`:'<span class="score score--dash">vs</span>'}
        </div>
        <span class="team team--away">${e.away_team}</span>
      </div>
      ${!t&&y.isLoggedIn()?We(e,a):t&&a?`<div class="prediction-result">
               Tu predicción: <strong>${a.predicted_home}-${a.predicted_away}</strong>
               (${a.predicted_result}) · ${a.total_points} pts
             </div>`:""}
    </div>
  `}function We(e,a){const t=!!a,s=(a==null?void 0:a.predicted_home)??0,n=(a==null?void 0:a.predicted_away)??0,i=(a==null?void 0:a.predicted_result)??"X",o=t?"prediction-form--saved":"prediction-form--unsaved",d=t?'<span class="pred-status pred-status--saved">✓ Guardado</span>':'<span class="pred-status pred-status--unsaved">Sin predicción</span>',l=t?"btn btn--saved btn--sm pred-save-btn":"btn btn--ghost btn--sm pred-save-btn",_=t?"✓ Guardado":"Guardar",h=Je.has(e.phase);return`
    <form class="prediction-form ${o}" data-match-id="${e.id}" data-saved="${t}" data-is-knockout="${h?"1":"0"}">
      ${d}
      <div class="result-selector">
        ${["1","X","2"].map(m=>`
          <label class="result-selector__option">
            <input type="radio" name="predicted_result" value="${m}" ${i===m?"checked":""} required />
            ${m}
          </label>
        `).join("")}
      </div>
      ${h?'<span class="pred-hint">(90 min)</span>':""}
      <div class="prediction-form__inputs">
        <input type="number" name="predicted_home" class="score-input" min="0" max="30"
          value="${s}" placeholder="0" required />
        <span>-</span>
        <input type="number" name="predicted_away" class="score-input" min="0" max="30"
          value="${n}" placeholder="0" required />
      </div>
      ${h?`
      <div class="pred-hint-row">
        <span class="pred-hint">(partido completo)</span>
        <button class="knockout-info-btn" type="button" title="Sistema de puntos eliminatorias" aria-label="Sistema de puntos">i</button>
      </div>`:""}
      <button type="submit" class="${l}">${_}</button>
    </form>
  `}function Ke(e,a,t,s){return e==="1"?a>t:e==="2"?t>a:e==="X"?s?a!==t:a===t:!0}function Ye(e,a,t){const s=parseInt(e.dataset.matchId),n=e.querySelector(".pred-save-btn"),i=e.querySelector(".pred-status");let o=e.dataset.saved==="true";function d(){e.classList.contains("prediction-form--dirty")||(e.classList.remove("prediction-form--saved","prediction-form--unsaved"),e.classList.add("prediction-form--dirty"),n.className="btn btn--primary btn--sm pred-save-btn",n.textContent="Guardar",i&&(i.className="pred-status pred-status--unsaved",i.textContent="Sin guardar"))}function l(){o=!0,e.classList.remove("prediction-form--unsaved","prediction-form--dirty"),e.classList.add("prediction-form--saved"),n.className="btn btn--saved btn--sm pred-save-btn",n.textContent="✓ Guardado",n.disabled=!1,i&&(i.className="pred-status pred-status--saved",i.textContent="✓ Guardado")}e.querySelectorAll("input").forEach(_=>{_.addEventListener("change",d),_.addEventListener("input",d)}),e.addEventListener("submit",async _=>{var f;_.preventDefault();const h=parseInt(e.querySelector("[name=predicted_home]").value),m=parseInt(e.querySelector("[name=predicted_away]").value),v=(f=e.querySelector("[name=predicted_result]:checked"))==null?void 0:f.value;if(isNaN(h)||isNaN(m)||!v)return;const b=e.dataset.isKnockout==="1";if(!Ke(v,h,m,b)){p("El marcador no coincide con el resultado 1X2 seleccionado","error");return}n.disabled=!0,n.textContent="…";try{const{prediction:L}=await u.predictions.save({match_id:s,predicted_result:v,predicted_home:h,predicted_away:m,league_id:t??null});a[s]=L,p("Predicción guardada"),l()}catch(L){p(L.message||"Error al guardar","error"),n.disabled=!1,o?(n.className="btn btn--saved btn--sm pred-save-btn",n.textContent="✓ Guardado"):(n.className="btn btn--primary btn--sm pred-save-btn",n.textContent="Guardar")}})}function Qe(){const e=localStorage.getItem("activeLeagueId");return e?parseInt(e):null}async function Ze(e){var a,t;e.innerHTML='<div class="loading"><div class="loading__spinner"></div></div>';try{if(y.isLoggedIn()){const{leagues:v}=await u.leagues.my();if(v.length===0){e.innerHTML=he();return}}const s=Qe(),[{ranking:n},i]=await Promise.all([u.auth.ranking(s),y.isLoggedIn()?u.leagues.my():Promise.resolve({leagues:[]})]),o=y.getUser(),d=i.leagues.find(v=>v.id===s),l=document.getElementById("tablonBadge"),_=l&&!l.classList.contains("hidden"),h=_?l.textContent:"",m=((a=n[0])==null?void 0:a.matches_played)??0;e.innerHTML=`
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
              ${n.map(v=>{var S,r,c;const b=v.predictions_made??0,f=`${b}/${m}`,L=`${v.correct_results??0}/${b}`,$=`${v.exact_scores??0}/${b}`;return`
                  <tr class="${o&&v.id===o.id?"ranking-table__row--me":""}">
                    <td class="ranking-table__pos" data-pos="${v.position}">${v.position}</td>
                    <td>
                      <a class="ranking-table__link" href="#/jugador/${v.id}">
                        <span class="status-emoji" title="${((S=v.status)==null?void 0:S.name)||""}">${((r=v.status)==null?void 0:r.emoji)||""}</span>${v.username}
                      </a>
                    </td>
                    <td class="ranking-table__stat ranking-table__status">${((c=v.status)==null?void 0:c.name)||"—"}</td>
                    <td class="ranking-table__stat">${f}</td>
                    <td class="ranking-table__stat">${L}</td>
                    <td class="ranking-table__stat">${$}</td>
                    <td class="ranking-table__pts">${v.total_points}</td>
                  </tr>
                `}).join("")}
            </tbody>
          </table>
        </div>
      </div>
    `,(t=e.querySelector(".ranking-tablon-btn"))==null||t.addEventListener("click",()=>{I.navigate(`/tablon?liga=${s}`)})}catch(s){e.innerHTML=`<div class="container"><p class="form__error">Error: ${s.message}</p></div>`}}async function Le(e,{query:a={}}={}){e.innerHTML='<div class="loading"><div class="loading__spinner"></div></div>';const t=y.getUser();let s=a.liga?parseInt(a.liga):null;if(s){localStorage.setItem(`tablon_last_read_${s}`,new Date().toISOString());const r=document.getElementById("tablonBadge");r&&(r.classList.add("hidden"),r.textContent="")}let n=null,i=[],o=1,d=1;try{if(!s&&t){const{leagues:r}=await u.leagues.my();r&&r.length&&(s=r[0].id,n=r[0].name)}else if(s)try{const{league:r}=await u.leagues.get(s);n=r.name}catch{}if(s&&t)try{const{members:r}=await u.leagues.members(s);i=r||[]}catch{}}catch{}async function l(){const r=await u.board.messages(o,s);return d=r.pages||1,r}try{const r=await l();_(r)}catch(r){e.innerHTML=`<div class="container"><p class="form__error">Error: ${r.message}</p></div>`}function _(r){const{pinned:c=[],messages:E=[]}=r;e.innerHTML=`
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
                 ${h(c)}
               </div>
             </section>`:""}

        <section class="board-section">
          ${c.length?'<h2 class="board-section__title">💬 Mensajes</h2>':""}
          <div class="board-messages" id="boardMessages">
            ${v(E)}
          </div>
          ${d>1?`<div class="pagination">
                 <button class="btn btn--ghost btn--sm" id="prevPage" ${o<=1?"disabled":""}>← Anterior</button>
                 <span>Página ${o} / ${d}</span>
                 <button class="btn btn--ghost btn--sm" id="nextPage" ${o>=d?"disabled":""}>Siguiente →</button>
               </div>`:""}
        </section>
      </div>
    `,f(),L(),$()}function h(r){return r.length?r.map(c=>`
      <div class="board-message board-message--pinned" data-id="${c.id}">
        <div class="board-message__header">
          <span class="board-message__pin-badge">📌</span>
          <strong class="board-message__author">${T(c.username)}</strong>
          <span class="board-message__date">${M(c.created_at)}</span>
          ${t!=null&&t.is_admin&&!c.is_deleted?`<button class="btn btn--ghost btn--xs unpin-msg" data-id="${c.id}" title="Desfijar">📌✕</button>`:""}
          ${!c.is_deleted&&t&&(t.id===c.user_id||t.is_admin)?`<button class="btn btn--danger btn--xs delete-msg" data-id="${c.id}">✕</button>`:""}
        </div>
        <p class="board-message__text">${b(c.message)}</p>

        ${c.replies&&c.replies.length?`<div class="board-replies">
               ${c.replies.map(E=>m(E)).join("")}
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
    `).join(""):""}function m(r){return`
      <div class="board-reply ${r.is_deleted?"board-reply--deleted":""}" data-id="${r.id}">
        <div class="board-reply__header">
          <strong class="board-reply__author">${T(r.username)}</strong>
          <span class="board-reply__date">${M(r.created_at)}</span>
          ${!r.is_deleted&&t&&(t.id===r.user_id||t.is_admin)?`<button class="btn btn--danger btn--xs delete-msg" data-id="${r.id}">✕</button>`:""}
        </div>
        <p class="board-reply__text">${b(r.message)}</p>
      </div>
    `}function v(r){return r.length?r.map(c=>`
      <div class="board-message ${c.is_deleted?"board-message--deleted":""}" data-id="${c.id}">
        <div class="board-message__header">
          <strong class="board-message__author">${T(c.username)}</strong>
          <span class="board-message__date">${M(c.created_at)}</span>
          ${t!=null&&t.is_admin&&!c.is_deleted?`<button class="btn btn--ghost btn--xs pin-msg" data-id="${c.id}" title="Fijar">📌</button>`:""}
          ${!c.is_deleted&&t&&(t.id===c.user_id||t.is_admin)?`<button class="btn btn--danger btn--xs delete-msg" data-id="${c.id}">✕</button>`:""}
        </div>
        <p class="board-message__text">${b(c.message)}</p>
      </div>
    `).join(""):'<p class="empty">Sin mensajes aún. ¡Sé el primero!</p>'}function b(r){const c=T(r);if(!i.length)return c;const E=i.map(j=>ea(j.username)),x=new RegExp(`@(${E.join("|")})`,"gi");return c.replace(x,'<span class="mention">@$1</span>')}function f(){const r=document.getElementById("boardForm");if(!r)return;const c=document.getElementById("boardMsg"),E=document.getElementById("charCounter"),x=document.getElementById("mentionDropdown");c.addEventListener("input",()=>{E.textContent=`${c.value.length} / 500`,S(c,x)}),r.addEventListener("submit",async j=>{j.preventDefault();const H=c.value.trim();if(H)try{await u.board.post(H,s),c.value="",E.textContent="0 / 500",x.classList.add("hidden");const P=await l();w(P),p("Mensaje publicado")}catch(P){p(P.message,"error")}})}function L(){e.querySelectorAll(".reply-form").forEach(r=>{const c=parseInt(r.dataset.parent),E=r.querySelector(".reply-input"),x=`mentionDropdown-${c}`,j=document.getElementById(x);E==null||E.addEventListener("input",()=>{S(E,j)}),r.addEventListener("submit",async H=>{H.preventDefault();const P=E.value.trim();if(P)try{await u.board.reply(c,P),E.value="",j==null||j.classList.add("hidden");const R=await l();w(R),p("Respuesta enviada")}catch(R){p(R.message,"error")}})}),e.querySelectorAll(".pin-msg").forEach(r=>{r.addEventListener("click",async()=>{try{await u.board.pin(r.dataset.id);const c=await l();w(c),p("Mensaje fijado")}catch(c){p(c.message,"error")}})}),e.querySelectorAll(".unpin-msg").forEach(r=>{r.addEventListener("click",async()=>{try{await u.board.pin(r.dataset.id);const c=await l();w(c),p("Mensaje desfijado")}catch(c){p(c.message,"error")}})})}function $(){e.querySelectorAll(".delete-msg").forEach(r=>{r.addEventListener("click",async()=>{if(confirm("¿Eliminar este mensaje?"))try{await u.board.delete(r.dataset.id);const c=await l();w(c),p("Mensaje eliminado")}catch(c){p(c.message,"error")}})})}function w(r){const{pinned:c=[],messages:E=[]}=r,x=document.getElementById("boardPinned");if(x)x.innerHTML=h(c);else if(c.length){_(r);return}const j=document.getElementById("boardMessages");j&&(j.innerHTML=v(E)),L(),$()}e.addEventListener("click",async r=>{if(r.target.id==="prevPage"&&o>1){o--;const c=await l();w(c)}else if(r.target.id==="nextPage"&&o<d){o++;const c=await l();w(c)}});function S(r,c){if(!c||!i.length)return;const E=r.value,x=r.selectionStart,j=E.slice(0,x),H=j.match(/@(\w*)$/);if(!H){c.classList.add("hidden");return}const P=H[1].toLowerCase(),R=i.filter(B=>B.username.toLowerCase().startsWith(P)&&B.id!==(t==null?void 0:t.id)),se=[...y.isAdmin()&&"todos".startsWith(P)?[{username:"todos",description:"Notificar a todos los miembros"}]:[],...R.slice(0,6)];if(!se.length){c.classList.add("hidden");return}c.innerHTML=se.map(B=>B.description?`<div class="mention-item mention-item--broadcast" data-username="${T(B.username)}">
             <span class="mention-item__name">@${T(B.username)}</span>
             <span class="mention-item__desc">${T(B.description)}</span>
           </div>`:`<div class="mention-item" data-username="${T(B.username)}">${T(B.username)}</div>`).join(""),c.classList.remove("hidden"),c.querySelectorAll(".mention-item").forEach(B=>{B.addEventListener("mousedown",Pe=>{Pe.preventDefault();const Te=B.dataset.username,W=j.replace(/@(\w*)$/,`@${Te} `);if(r.value=W+E.slice(x),r.setSelectionRange(W.length,W.length),c.classList.add("hidden"),r.tagName==="TEXTAREA"){const ne=document.getElementById("charCounter");ne&&(ne.textContent=`${r.value.length} / 500`)}})})}document.addEventListener("click",r=>{!r.target.closest(".board-form__input-wrap")&&!r.target.closest(".reply-form__input-wrap")&&document.querySelectorAll(".mention-dropdown").forEach(c=>c.classList.add("hidden"))},{capture:!0})}function T(e){return String(e).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;")}function ea(e){return e.replace(/[.*+?^${}()|[\]\\]/g,"\\$&")}async function aa(e){var a,t,s,n;e.innerHTML='<div class="loading"><div class="loading__spinner"></div></div>';try{const i=y.getUser(),o=i==null?void 0:i.is_admin,[d,l]=await Promise.all([o?u.leagues.adminAll():u.leagues.all(),y.isLoggedIn()&&!o?u.leagues.my():Promise.resolve({leagues:[]})]),_=new Set(l.leagues.map(m=>m.id)),h=o?d.leagues:d.leagues.filter(m=>!_.has(m.id));e.innerHTML=`
      <div class="container">
        <h1 class="page-title">Ligas</h1>

        ${o?`
          <div class="admin-notice">Vista administrador — puedes acceder a cualquier liga sin participar en ella.</div>
        `:""}

        ${i&&!o&&l.leagues.length>0?`
          <section class="section">
            <h2>Mis ligas</h2>
            <div class="leagues-grid">${l.leagues.map(m=>le(m,!0)).join("")}</div>
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
          ${h.length?`<div class="leagues-grid">${h.map(m=>le(m,!1,_,o)).join("")}</div>`:o?'<p class="empty">No hay ligas creadas aún.</p>':l.leagues.length>0?'<p class="empty">Ya participas en todas las ligas disponibles.</p>':'<p class="empty">No hay ligas aún. ¡Crea la primera!</p>'}
        </section>
      </div>
    `,e.querySelectorAll('.league-card[data-navigate="true"]').forEach(m=>{m.addEventListener("click",()=>I.navigate(`/ligas/${m.dataset.id}`))}),e.querySelectorAll(".btn-join-league").forEach(m=>{m.addEventListener("click",async v=>{v.stopPropagation();const b=parseInt(m.dataset.id);m.disabled=!0,m.textContent="…";try{const{league:f}=await u.leagues.join({league_id:b});p(`¡Te has unido a "${f.name}"!`),I.navigate(`/ligas/${f.id}`)}catch(f){p(f.message,"error"),m.disabled=!1,m.textContent="Unirse"}})}),e.querySelectorAll(".btn-private-info").forEach(m=>{m.addEventListener("click",v=>{v.stopPropagation(),p("Esta liga es privada. Pide el enlace de invitación a cualquier miembro para unirte.","info")})}),(a=document.getElementById("btnShowCreate"))==null||a.addEventListener("click",()=>{var m,v;(m=document.getElementById("createLeaguePanel"))==null||m.classList.remove("hidden"),(v=document.getElementById("btnShowCreate"))==null||v.classList.add("hidden")}),(t=document.getElementById("btnCancelCreate"))==null||t.addEventListener("click",()=>{var m,v;(m=document.getElementById("createLeaguePanel"))==null||m.classList.add("hidden"),(v=document.getElementById("btnShowCreate"))==null||v.classList.remove("hidden")}),(s=document.getElementById("joinCodeForm"))==null||s.addEventListener("submit",async m=>{m.preventDefault();const v=document.getElementById("inviteCode").value.trim().toUpperCase();if(v)try{const{league:b}=await u.leagues.join({invite_code:v});p(`Te has unido a "${b.name}"`),I.navigate(`/ligas/${b.id}`)}catch(b){p(b.message,"error")}}),(n=document.getElementById("createLeagueForm"))==null||n.addEventListener("submit",async m=>{var S;m.preventDefault();const v=document.getElementById("createBtn");v.disabled=!0,v.textContent="Creando…";const b=document.getElementById("leagueName").value.trim(),f=document.getElementById("leagueDesc").value.trim(),L=document.getElementById("leaguePrize").value.trim(),$=document.getElementById("isPublic").checked,w=((S=document.getElementById("isOfficial"))==null?void 0:S.checked)??!1;try{const{league:r}=await u.leagues.create({name:b,description:f,prize:L,is_public:$,is_official:w});ta(r)}catch(r){p(r.message,"error"),v.disabled=!1,v.textContent="Crear liga"}})}catch(i){e.innerHTML=`<div class="container"><p class="form__error">Error: ${i.message}</p></div>`}}function le(e,a=!1,t=new Set,s=!1){const n=e.is_official?'<span class="league-badge league-badge--official">⭐ Oficial</span>':"",i=e.is_public?"🌍":"🔒",o=s?`<button class="btn btn--sm btn--outline btn-admin-view" data-id="${e.id}">Ver (admin)</button>`:a?`<button class="btn btn--sm btn--outline" onclick="event.stopPropagation(); window.location.hash='/ligas/${e.id}'">Ver liga</button>`:e.is_public?`<button class="btn btn--sm btn--primary btn-join-league" data-id="${e.id}">Unirse</button>`:'<button class="btn btn--sm btn--ghost btn-private-info">🔒 Solicitar enlace</button>';return`
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
  `}function ta(e){var s,n;const a=e.invite_link||"",t=document.getElementById("createLeaguePanel");t&&(t.innerHTML=`
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
  `,(s=document.getElementById("btnCopyLink"))==null||s.addEventListener("click",async()=>{try{await navigator.clipboard.writeText(a),p("Enlace copiado")}catch{p("No se pudo copiar","error")}}),(n=document.getElementById("btnShare"))==null||n.addEventListener("click",async()=>{try{await navigator.share({title:`Únete a ${e.name} en PickGoal`,url:a})}catch{}}))}async function sa(e,{params:a}){var s,n,i,o,d;const t=parseInt(a.id);e.innerHTML='<div class="loading"><div class="loading__spinner"></div></div>';try{const l=await u.leagues.get(t),{league:_,ranking:h,is_member:m,is_admin_view:v}=l,b=y.getUser(),f=_.is_official?'<span class="league-badge league-badge--official">⭐ Oficial</span>':"";e.innerHTML=`
      <div class="container">
        <a href="#/ligas" class="back-link">← Volver a ligas</a>

        ${v?`
          <div class="admin-notice">Vista administrador — no participas en esta liga</div>
        `:""}

        <div class="league-header">
          <h1 class="page-title">${_.name} ${f}</h1>
          ${_.description?`<p class="league-header__desc">${_.description}</p>`:""}
          <div class="league-header__meta">
            <span>${_.is_public?"🌍 Pública":"🔒 Privada"}</span>
            <span>${_.member_count} participantes</span>
            ${_.prize?`<span>🏆 ${_.prize}</span>`:""}
          </div>
        </div>

        ${(m||b!=null&&b.is_admin)&&_.invite_link?`
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
          ${m?'<button class="btn btn--danger btn--sm" id="btnLeave">Abandonar liga</button>':!(b!=null&&b.is_admin)&&b?'<button class="btn btn--primary" id="btnJoin">Unirse a esta liga</button>':""}
          ${b!=null&&b.is_admin||m&&b&&_.created_by===b.id?'<button class="btn btn--outline btn--sm" id="btnEditLeague">Editar liga</button>':""}
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
              ${h.map(r=>`
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
    `,(s=document.getElementById("btnCopyInvite"))==null||s.addEventListener("click",async()=>{try{await navigator.clipboard.writeText(_.invite_link),p("Enlace copiado")}catch{p("No se pudo copiar","error")}}),(n=document.getElementById("btnShareInvite"))==null||n.addEventListener("click",async()=>{try{await navigator.share({title:`Únete a ${_.name} en PickGoal`,url:_.invite_link})}catch{}}),(i=document.getElementById("btnLeave"))==null||i.addEventListener("click",async()=>{if(confirm("¿Seguro que quieres abandonar esta liga?"))try{await u.leagues.leave(t),p("Has abandonado la liga"),I.navigate("/ligas")}catch(r){p(r.message,"error")}}),(o=document.getElementById("btnJoin"))==null||o.addEventListener("click",async()=>{try{await u.leagues.join({league_id:t}),p("¡Te has unido a la liga!"),I.navigate(`/ligas/${t}`)}catch(r){p(r.message,"error")}}),(d=document.getElementById("btnEditLeague"))==null||d.addEventListener("click",()=>{na(_,t,b)});const L=document.getElementById("tabRanking"),$=document.getElementById("tabTablon"),w=document.getElementById("sectionRanking"),S=document.getElementById("sectionTablon");L&&$&&(L.addEventListener("click",()=>{L.classList.add("league-tab--active"),$.classList.remove("league-tab--active"),w.classList.remove("hidden"),S.classList.add("hidden")}),$.addEventListener("click",()=>{$.classList.add("league-tab--active"),L.classList.remove("league-tab--active"),w.classList.add("hidden"),S.classList.remove("hidden");const r=document.getElementById("tablonEmbed");r&&!r.dataset.loaded&&(r.dataset.loaded="1",Le(r,{query:{liga:String(t)}}))}))}catch(l){e.innerHTML=`<div class="container"><p class="form__error">Error: ${l.message}</p><a href="#/ligas">Volver</a></div>`}}function na(e,a,t){const s=document.getElementById("editLeagueModal");s&&s.remove();const n=document.createElement("div");n.id="editLeagueModal",n.className="edit-league-modal",n.innerHTML=`
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
  `,document.body.appendChild(n),requestAnimationFrame(()=>n.classList.add("edit-league-modal--open"));const i=()=>{n.classList.remove("edit-league-modal--open"),n.addEventListener("transitionend",()=>n.remove(),{once:!0})};n.querySelector(".edit-league-modal__overlay").addEventListener("click",i),document.getElementById("btnCancelEdit").addEventListener("click",i),document.getElementById("editLeagueForm").addEventListener("submit",async o=>{o.preventDefault();const d=document.getElementById("btnSaveEdit");d.disabled=!0,d.textContent="Guardando…";const l={name:document.getElementById("editName").value.trim(),description:document.getElementById("editDesc").value.trim(),prize:document.getElementById("editPrize").value.trim(),is_public:document.getElementById("editPublic").checked};t!=null&&t.is_admin&&(l.is_official=document.getElementById("editOfficial").checked);try{await u.leagues.update(a,l),p("Liga actualizada"),i(),I.navigate(`/ligas/${a}`)}catch(_){p(_.message,"error"),d.disabled=!1,d.textContent="Guardar cambios"}})}async function ia(e){var t,s;e.innerHTML='<div class="loading"><div class="loading__spinner"></div></div>';const a=y.getUser();try{const n=(()=>{const f=localStorage.getItem("activeLeagueId");return f?parseInt(f):null})(),[i,o,d,l,_]=await Promise.all([u.predictions.mine(n),u.predictions.getChampion(n),u.leagues.my(),u.auth.me(),a!=null&&a.is_admin?u.leagues.adminAll():Promise.resolve({leagues:[]})]),h=i.predictions.reduce((f,L)=>f+L.total_points,0)+(((t=o.champion_prediction)==null?void 0:t.points_earned)||0),m=l.user,v=m.status,b=m.total_points_all_time;e.innerHTML=`
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
          ${oa(v,b)}
          <button class="btn btn--danger" id="btnLogoutPerfil">Cerrar sesión</button>
          <div class="profile-card__stats">
            <div class="stat">
              <span class="stat__value">${h}</span>
              <span class="stat__label">Puntos totales</span>
            </div>
            <div class="stat">
              <span class="stat__value">${i.predictions.length}</span>
              <span class="stat__label">Predicciones</span>
            </div>
            <div class="stat">
              <span class="stat__value">${d.leagues.length}</span>
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
          ${i.predictions.length?`<div class="predictions-list">${i.predictions.map(ra).join("")}</div>`:'<p class="empty">Sin predicciones aún. <a href="#/quiniela">Ir a la quiniela</a></p>'}
        </section>

        <section class="section">
          <h2>Mis ligas</h2>
          ${d.leagues.length?`<ul class="leagues-list">${d.leagues.map(f=>`<li><a href="#/ligas/${f.id}">${f.name}</a> <span class="tag">${f.is_public?"Pública":"Privada"}</span></li>`).join("")}</ul>`:'<p class="empty">No perteneces a ninguna liga. <a href="#/ligas">Ver ligas</a></p>'}
        </section>

        ${a!=null&&a.is_admin&&_.leagues.length?`
          <section class="section">
            <h2>Ligas gestionadas</h2>
            <ul class="leagues-list">
              ${_.leagues.map(f=>`
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
    `,(s=e.querySelector("#btnLogoutPerfil"))==null||s.addEventListener("click",()=>{y.logout(),window.location.hash="/"})}catch(n){e.innerHTML=`<div class="container"><p class="form__error">Error: ${n.message}</p></div>`}}function oa(e,a){if(e.next_threshold===null)return`
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
    </div>`}function ra(e){return`
    <div class="pred-row ${e.total_points>0?"pred-row--scored":""}">
      <span class="pred-row__result">${e.predicted_result}</span>
      <span class="pred-row__score">${e.predicted_home}-${e.predicted_away}</span>
      <span class="pred-row__pts">${e.total_points} pts</span>
    </div>
  `}const ce=new Date("2026-06-11T21:00:00Z"),da=["Argentina","Brasil","Francia","España","Inglaterra","Alemania","Portugal","Países Bajos","Italia","Bélgica","Uruguay","Colombia","México","Estados Unidos","Canadá","Marruecos","Senegal","Nigeria","Japón","Corea del Sur","Australia","Arabia Saudí","Irán","Qatar","Ecuador","Chile","Perú","Venezuela","Bolivia","Paraguay","Costa Rica","Honduras","Panamá","Jamaica","Trinidad y Tobago","Guatemala","Turquía","Polonia","Croacia","Serbia","República Checa","Eslovaquia","Austria","Suiza","Dinamarca","Suecia","Noruega","Escocia","Ucrania","Rumanía","Hungría","Grecia","Egipto","Camerún","Ghana","Costa de Marfil","Túnez","Argelia","China","India","Irak","Uzbekistán","Nueva Zelanda","Fiji"];function la(){const e=localStorage.getItem("activeLeagueId");return e?parseInt(e):null}async function we(e){var a;if(!y.isLoggedIn()){e.innerHTML='<div class="container"><p class="notice"><a href="#/login">Inicia sesión</a> para predecir el campeón.</p></div>';return}e.innerHTML='<div class="loading"><div class="loading__spinner"></div></div>';try{const t=la(),{champion_prediction:s}=await u.predictions.getChampion(t),n=new Date>=ce;let i;s&&n?i=`
        <div class="champion-result">
          <p>Tu predicción: <strong class="champion-result__team">${s.team_name}</strong></p>
          <p>Puntos ganados: <strong>${s.points_earned}</strong></p>
          <p class="notice">🔒 El torneo ha comenzado, tu predicción está bloqueada.</p>
        </div>
      `:!s&&n?i=`
        <p class="notice notice--warning">⚠️ El torneo ya ha comenzado. Una vez confirmado no podrás cambiarlo.</p>
        ${Y(null)}
      `:s&&!n?i=`
        <p class="notice">Puedes cambiar tu predicción hasta el inicio del torneo.</p>
        ${Y(s.team_name)}
      `:i=Y(null),e.innerHTML=`
      <div class="container">
        <h1 class="page-title">🏆 Predice el Campeón</h1>
        <p class="champion-desc">
          Acertar el campeón del mundo vale <strong>10 puntos extra</strong>.
          Puedes modificar tu elección hasta el inicio del torneo
          (${ce.toLocaleDateString("es-ES",{day:"numeric",month:"long",year:"numeric",hour:"2-digit",minute:"2-digit"})}).
        </p>
        ${i}
      </div>
    `,(a=document.getElementById("championForm"))==null||a.addEventListener("submit",async o=>{o.preventDefault();const d=document.getElementById("champBtn"),l=document.getElementById("champError"),_=document.getElementById("teamSearch").value.trim();if(_){d.disabled=!0,d.textContent="Guardando…",l.classList.add("hidden");try{await u.predictions.saveChampion(_,t),p(`¡${_} guardado como campeón!`),we(e)}catch(h){l.textContent=h.message,l.classList.remove("hidden"),d.disabled=!1,d.textContent=d.dataset.label||"Confirmar predicción"}}})}catch(t){e.innerHTML=`<div class="container"><p class="form__error">Error: ${t.message}</p></div>`}}function Y(e){const a=e?"Actualizar predicción":"Confirmar predicción";return`
    <form class="form champion-form" id="championForm">
      <div class="form__group">
        <label class="form__label" for="teamSearch">Selecciona el equipo campeón</label>
        <input class="form__input" type="text" id="teamSearch"
          placeholder="Escribe para buscar…"
          list="teamsList" autocomplete="off"
          value="${e??""}" required />
        <datalist id="teamsList">
          ${da.map(t=>`<option value="${t}">`).join("")}
        </datalist>
      </div>
      <p id="champError" class="form__error hidden"></p>
      <button class="btn btn--primary" type="submit" id="champBtn" data-label="${a}">
        ${a}
      </button>
    </form>
  `}async function ca(e){if(!y.isAdmin()){e.innerHTML='<div class="container"><p class="form__error">Acceso denegado.</p></div>';return}e.innerHTML='<div class="loading"><div class="loading__spinner"></div></div>';try{const{users:a}=await u.auth.users();e.innerHTML=`
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
                ${a.map(pa).join("")}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    `,ua(e),V(e)}catch(a){e.innerHTML=`<div class="container"><p class="form__error">Error: ${a.message}</p></div>`}}function ua(e){var s,n,i,o;(s=document.getElementById("btnSync"))==null||s.addEventListener("click",async()=>{const d=document.getElementById("syncResult");d.textContent="Sincronizando…";try{await u.matches.sync(),d.textContent="✓ Sincronización completada",p("Sincronización completada")}catch(l){d.textContent=`Error: ${l.message}`,p(l.message,"error")}});const a=document.getElementById("pushTarget"),t=document.getElementById("pushTargetIdGroup");a==null||a.addEventListener("change",()=>{t.classList.toggle("hidden",a.value==="all")}),(n=document.getElementById("pushForm"))==null||n.addEventListener("submit",async d=>{d.preventDefault();const l=document.getElementById("pushTitle").value.trim()||"Aviso",_=document.getElementById("pushBody").value.trim(),h=a.value,m=parseInt(document.getElementById("pushTargetId").value)||null,v=document.getElementById("pushResult"),b={title:`📣 PickGoal — ${l}`,body:_};h==="league"&&m&&(b.league_id=m),h==="user"&&m&&(b.user_id=m),v.textContent="Enviando…";try{const{sent:f}=await u.notifications.send(b);v.textContent=`✓ Enviada a ${f} suscripción(es)`,p(`Notificación enviada a ${f} suscripción(es)`)}catch(f){v.textContent=`Error: ${f.message}`,p(f.message,"error")}}),(i=document.getElementById("btnCloseSeason"))==null||i.addEventListener("click",async()=>{if(!confirm("¿Cerrar la temporada actual? Esta acción es irreversible."))return;const d=document.getElementById("btnCloseSeason"),l=document.getElementById("closeSeasonResult");d.disabled=!0,l.textContent="Cerrando…";try{const{message:_}=await u.post("/v2/admin/season/1/close");l.textContent=`✓ ${_||"Temporada cerrada"}`,p("Temporada cerrada")}catch(_){l.textContent=`Error: ${_.message}`,p(_.message,"error"),d.disabled=!1}}),(o=document.getElementById("usersTableBody"))==null||o.addEventListener("click",async d=>{const l=d.target.closest(".toggle-admin");if(!l)return;const _=parseInt(l.dataset.id);try{const{user:h}=await u.auth.toggleAdmin(_);l.closest("tr").querySelector(".admin-badge").textContent=h.is_admin?"Sí":"No",p(`${h.username} ${h.is_admin?"ahora es admin":"ya no es admin"}`)}catch(h){p(h.message,"error")}})}function pa(e){return`
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
  `}const ma={PD:"🇪🇸 LaLiga",PL:"🏴󠁧󠁢󠁥󠁮󠁧󠁿 Premier League",CL:"⭐ Champions League",SA:"🇮🇹 Serie A",BL1:"🇩🇪 Bundesliga",FL1:"🇫🇷 Ligue 1",PPL:"🇵🇹 Primeira Liga"};let k=[],z=null;async function V(e){const a=document.getElementById("jornadasV2Content");if(a)try{const{jornadas:t}=await u.adminV2.jornadas();a.innerHTML=ga(t),va(a)}catch(t){a.innerHTML=`<p class="form__error">Error: ${t.message}</p>`}}function ga(e){const t=La(new Date);return`
    <div class="jv2-panel">
      <div class="jv2-panel__actions">
        <button class="btn btn--primary btn--sm" id="btnNuevaJornada">+ Nueva jornada</button>
      </div>

      <div class="jv2-list">
        ${e.length===0?'<p class="admin-section__desc">No hay jornadas creadas.</p>':e.map(_a).join("")}
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
  `}function _a(e){const a={draft:'<span class="admin-match-badge" style="background:rgba(61,145,255,0.15);color:#3d91ff;border:1px solid rgba(61,145,255,0.3)">Borrador</span>',upcoming:'<span class="admin-match-badge admin-match-badge--pending">Próxima</span>',active:'<span class="admin-match-badge admin-match-badge--done">Activa</span>',finished:'<span class="admin-match-badge" style="background:rgba(255,255,255,0.05);color:#6e6e6e;border:1px solid #222">Finalizada</span>'}[e.status]||`<span class="admin-match-badge">${e.status}</span>`,t=s=>s?new Date(s).toLocaleDateString("es-ES",{day:"2-digit",month:"2-digit"}):"—";return`
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
  `}function va(e){var a,t,s,n;(a=e.querySelector("#btnNuevaJornada"))==null||a.addEventListener("click",()=>{z=null,k=[],document.getElementById("jv2FormTitle").textContent="Nueva jornada",document.getElementById("jv2EditId").value="",document.getElementById("jv2Number").value="",document.getElementById("jv2DateStart").value="",document.getElementById("jv2DateEnd").value="",document.getElementById("jv2MatchPicker").style.display="none",document.getElementById("jv2Form").style.display="block",te()}),(t=e.querySelector("#btnCancelarJornada"))==null||t.addEventListener("click",()=>{document.getElementById("jv2Form").style.display="none",k=[],z=null}),(s=e.querySelector("#btnBuscarPartidos"))==null||s.addEventListener("click",ba),(n=e.querySelector("#btnGuardarJornada"))==null||n.addEventListener("click",ya),e.querySelectorAll(".jv2-pub-btn").forEach(i=>{i.addEventListener("click",async()=>{if(confirm(`¿Publicar jornada ${i.dataset.num}? Se calcularán cuotas, se asignarán duelos y se notificará a los usuarios.`)){i.disabled=!0,i.textContent="Publicando…";try{const o=await u.adminV2.publishJornada(i.dataset.id);p(`Jornada ${i.dataset.num} publicada — push enviado a ${o.push_sent} suscriptores`),await V(document.getElementById("jornadasV2Section"))}catch(o){p(o.message,"error"),i.disabled=!1,i.textContent="Publicar"}}})}),e.querySelectorAll(".jv2-edit-btn").forEach(i=>{i.addEventListener("click",()=>ha(i.dataset.id))}),e.querySelectorAll(".jv2-del-btn").forEach(i=>{i.addEventListener("click",async()=>{if(confirm(`¿Eliminar jornada ${i.dataset.num}?`))try{await u.adminV2.deleteJornada(i.dataset.id),p("Jornada eliminada"),V(document.querySelector("#jornadasV2Content").parentElement.parentElement)}catch(o){p(o.message,"error")}})})}async function ha(e){const{jornadas:a}=await u.adminV2.jornadas(),t=a.find(s=>String(s.id)===String(e));t&&(z=t.id,k=[],document.getElementById("jv2FormTitle").textContent=`Editar jornada ${t.number}`,document.getElementById("jv2EditId").value=t.id,document.getElementById("jv2Number").value=t.number,t.date_start&&(document.getElementById("jv2DateStart").value=t.date_start.slice(0,16)),t.date_end&&(document.getElementById("jv2DateEnd").value=t.date_end.slice(0,16)),document.getElementById("jv2MatchPicker").style.display="none",document.getElementById("jv2Form").style.display="block",te())}async function ba(){const e=document.getElementById("btnBuscarPartidos"),a=document.getElementById("jv2Week").value;if(!a){p("Selecciona una semana","error");return}e.disabled=!0,e.textContent="Buscando…";try{const{matches:t}=await u.adminV2.partidos(a);fa(t),document.getElementById("jv2MatchPicker").style.display="block"}catch(t){p(`Error: ${t.message}`,"error")}finally{e.disabled=!1,e.textContent="Buscar partidos"}}function fa(e){const a=document.getElementById("jv2MatchList");if(Object.values(e).flat().length===0){a.innerHTML='<p class="admin-section__desc">No hay partidos disponibles para esta semana.</p>';return}a.innerHTML=Object.entries(e).map(([s,n])=>n.length?`
      <div class="jv2-comp-group">
        <div class="jv2-comp-group__title">${ma[s]||s}</div>
        ${n.map(i=>`
          <label class="jv2-match-item">
            <input type="checkbox" class="jv2-match-check" data-match='${JSON.stringify(i)}' />
            <span class="jv2-match-item__teams">${i.home_team} vs ${i.away_team}</span>
            <span class="jv2-match-item__date">${$a(i.match_datetime)}</span>
          </label>
        `).join("")}
      </div>
    `:"").join(""),a.querySelectorAll(".jv2-match-check").forEach(s=>{s.addEventListener("change",()=>{const n=JSON.parse(s.dataset.match);if(s.checked){if(k.length>=10){s.checked=!1,p("Máximo 10 partidos","error");return}k.push(n)}else k=k.filter(i=>i.api_id!==n.api_id);te()})})}function te(){const e=document.getElementById("jv2Count"),a=document.getElementById("jv2CountWarn");e&&(e.textContent=k.length),a&&(a.style.display=k.length>0&&k.length!==10?"inline":"none")}async function ya(){const e=parseInt(document.getElementById("jv2Number").value),a=document.getElementById("jv2DateStart").value,t=document.getElementById("jv2DateEnd").value,s=document.getElementById("jv2EditId").value;if(!e||!a||!t){p("Completa número y fechas","error");return}if(k.length!==10){p("Selecciona exactamente 10 partidos","error");return}const n={number:e,date_start:new Date(a).toISOString(),date_end:new Date(t).toISOString(),matches:k},i=document.getElementById("btnGuardarJornada");i.disabled=!0;try{s?(await u.adminV2.updateJornada(s,n),p(`Jornada ${e} actualizada`)):(await u.adminV2.createJornada(n),p(`Jornada ${e} guardada como borrador`)),document.getElementById("jv2Form").style.display="none",k=[],z=null,await V(document.getElementById("jornadasV2Section"))}catch(o){p(o.message,"error")}finally{i.disabled=!1}}function $a(e){return e?new Date(e).toLocaleDateString("es-ES",{day:"2-digit",month:"2-digit"}):"—"}function Ea(e){const a=new Date(Date.UTC(e.getFullYear(),e.getMonth(),e.getDate())),t=a.getUTCDay()||7;a.setUTCDate(a.getUTCDate()+4-t);const s=new Date(Date.UTC(a.getUTCFullYear(),0,1));return Math.ceil(((a-s)/864e5+1)/7)}function La(e){const a=new Date(e);a.setDate(a.getDate()+7);const t=a.getFullYear(),s=String(Ea(a)).padStart(2,"0");return`${t}-W${s}`}function wa(e){e.innerHTML=`
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
  `,document.getElementById("forgotForm").addEventListener("submit",async a=>{a.preventDefault();const t=document.getElementById("forgotBtn"),s=document.getElementById("forgotMsg"),n=document.getElementById("email").value.trim();t.disabled=!0,t.textContent="Enviando…";try{await u.auth.forgotPassword(n),s.textContent="Si el email existe, recibirás un enlace en breve.",s.classList.remove("hidden","form__error"),s.classList.add("form__success")}catch{p("Error al enviar el email","error")}finally{t.disabled=!1,t.textContent="Enviar enlace"}})}function Ia(e,{query:a}){const t=a.token||"";if(!t){e.innerHTML='<div class="container"><p class="form__error">Token inválido o expirado.</p><a href="#/login">Volver</a></div>';return}e.innerHTML=`
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
  `,document.getElementById("resetForm").addEventListener("submit",async s=>{s.preventDefault();const n=document.getElementById("resetBtn"),i=document.getElementById("resetError"),o=document.getElementById("password").value;n.disabled=!0,n.textContent="Guardando…",i.classList.add("hidden");try{await u.auth.resetPassword(t,o),p("Contraseña actualizada. Ya puedes iniciar sesión."),I.navigate("/login")}catch(d){i.textContent=d.message||"Error al restablecer la contraseña",i.classList.remove("hidden")}finally{n.disabled=!1,n.textContent="Guardar contraseña"}})}const Sa={r32:"Dieciseisavos",r16:"Octavos",quarters:"Cuartos",semis:"Semis",third:"3º y 4º",final:"Final"};let O=!1,C=null;async function ja(e){O=!1,C=null,e.innerHTML='<div class="loading"><div class="loading__spinner"></div></div>';try{const{groups:a}=await u.matches.grouped(),t=y.isAdmin();e.innerHTML=`
      <div class="container">
        <div class="resultados-topbar">
          <h1 class="page-title">Resultados — Mundial 2026</h1>
          ${t?'<button class="btn btn--ghost btn--sm" id="btnEditResults">✏️ Editar resultados</button>':""}
        </div>
        <nav class="phase-nav" id="phaseNav"></nav>
        <div id="phaseContent"></div>
      </div>
    `,t&&document.getElementById("btnEditResults").addEventListener("click",()=>{O=!O;const s=document.getElementById("btnEditResults");O?(s.textContent="✅ Editando — salir",s.classList.add("btn--warning")):(s.textContent="✏️ Editar resultados",s.classList.remove("btn--warning")),C&&X(C.data,C.isGroup)}),document.getElementById("phaseContent").addEventListener("click",async s=>{var h;const n=s.target.closest(".res-match__save");if(!n)return;const i=parseInt(n.dataset.id),o=n.closest(".res-match"),d=o.querySelector(".res-match__input-home").value,l=o.querySelector(".res-match__input-away").value,_=((h=o.querySelector(".res-match__result90"))==null?void 0:h.value)||null;if(d===""||l===""){p("Introduce ambos marcadores","error");return}n.disabled=!0;try{if(await u.matches.setResult(i,parseInt(d),parseInt(l),_),p(`${d} - ${l} guardado`),C){const m=C.data.matches.find(v=>v.id===i);m&&(m.home_score_90=parseInt(d),m.away_score_90=parseInt(l),m.status="finished"),X(C.data,C.isGroup)}}catch(m){p(m.message,"error"),n.disabled=!1}}),ka(a)}catch(a){e.innerHTML=`<div class="container"><p class="form__error">Error cargando los partidos: ${a.message}</p></div>`}}function ka(e){var i;const a=document.getElementById("phaseNav");if(!a)return;const t=e.filter(o=>o.phase==="group"),s=e.filter(o=>o.phase!=="group"),n=[...t.map(o=>({key:`group_${o.group_name}`,label:`Grupo ${o.group_name}`,data:o,isGroup:!0})),...s.map(o=>({key:o.phase,label:Sa[o.phase]||o.label,data:o,isGroup:!1}))];n.length!==0&&(a.innerHTML=n.map((o,d)=>`
    <button class="phase-nav__btn ${d===0?"phase-nav__btn--active":""}" data-key="${o.key}">
      ${o.label}
    </button>
  `).join(""),(i=a.querySelector(".phase-nav__btn--active"))==null||i.scrollIntoView({inline:"center",behavior:"instant",block:"nearest"}),a.querySelectorAll(".phase-nav__btn").forEach(o=>{o.addEventListener("click",()=>{a.querySelectorAll(".phase-nav__btn").forEach(l=>l.classList.remove("phase-nav__btn--active")),o.classList.add("phase-nav__btn--active");const d=n.find(l=>l.key===o.dataset.key);d&&(C=d,X(d.data,d.isGroup))})}),C=n[0],X(n[0].data,n[0].isGroup))}function X(e,a){const t=document.getElementById("phaseContent");if(!t)return;const s=xa(e.matches);if(a){const n=Ba(e.matches);t.innerHTML=`
      <div class="resultados-section">
        <div class="resultados-matches">${s}</div>
        <div class="standings">
          <h3 class="standings__title">Clasificación — Grupo ${e.group_name}</h3>
          ${Ca(n)}
        </div>
      </div>
    `}else t.innerHTML=`<div class="resultados-matches">${s}</div>`}function xa(e){return!e||e.length===0?'<p class="empty">Sin partidos en esta fase.</p>':e.map(a=>{const t={scheduled:"Programado",live:"🔴 En juego",finished:"Finalizado"}[a.status]||a.status;let s;if(O){const n=a.home_score_90??"",i=a.away_score_90??"",o=a.result_90??"";s=`
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
      <div class="res-match ${a.status==="finished"?"res-match--finished":""} ${a.status==="live"?"res-match--live":""} ${O?"res-match--editing":""}">
        <div class="res-match__meta">
          <span class="res-match__status">${t}</span>
          <span class="res-match__date">${M(a.match_datetime)}</span>
        </div>
        <div class="res-match__teams">
          <span class="res-match__team res-match__team--home">${a.home_team}</span>
          ${s}
          <span class="res-match__team res-match__team--away">${a.away_team}</span>
        </div>
      </div>
    `}).join("")}function Ba(e){const a={};for(const t of e)if(a[t.home_team]||(a[t.home_team]={name:t.home_team,pj:0,g:0,e:0,p:0,gf:0,gc:0,pts:0}),a[t.away_team]||(a[t.away_team]={name:t.away_team,pj:0,g:0,e:0,p:0,gf:0,gc:0,pts:0}),t.status==="finished"&&t.home_score_90!==null&&t.away_score_90!==null){const s=a[t.home_team],n=a[t.away_team];s.pj++,n.pj++,s.gf+=t.home_score_90,s.gc+=t.away_score_90,n.gf+=t.away_score_90,n.gc+=t.home_score_90,t.home_score_90>t.away_score_90?(s.g++,s.pts+=3,n.p++):t.home_score_90<t.away_score_90?(n.g++,n.pts+=3,s.p++):(s.e++,s.pts++,n.e++,n.pts++)}return Object.values(a).sort((t,s)=>{if(s.pts!==t.pts)return s.pts-t.pts;const n=s.gf-s.gc,i=t.gf-t.gc;return n!==i?n-i:s.gf-t.gf})}function Ca(e){return e.length===0?'<p class="empty">Sin datos de clasificación.</p>':`
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
  `}async function Pa(e,{query:a}){const t=(a.codigo||"").trim().toUpperCase();if(!t){e.innerHTML='<div class="container"><p class="form__error">Enlace de invitación inválido.</p><a href="#/ligas">Ver ligas</a></div>';return}if(!y.isLoggedIn()){sessionStorage.setItem("pendingInviteCode",t),I.navigate("/register");return}e.innerHTML='<div class="loading"><div class="loading__spinner"></div></div>';try{const{league:s}=await u.leagues.joinByCode(t);p(`¡Te has unido a "${s.name}"!`),I.navigate(`/ligas/${s.id}`)}catch(s){if(s.status===409){p("Ya eres miembro de esta liga");try{const{leagues:n}=await u.leagues.my(),i=n.find(o=>o.invite_code===t);if(i){I.navigate(`/ligas/${i.id}`);return}}catch{}}e.innerHTML=`
      <div class="container">
        <div class="league-gate">
          <div class="league-gate__icon">⚠️</div>
          <h2 class="league-gate__title">Error al unirse</h2>
          <p class="league-gate__text">${s.message}</p>
          <a href="#/ligas" class="btn btn--primary">Ver ligas</a>
        </div>
      </div>
    `}}function Ta(){const e=localStorage.getItem("activeLeagueId");return e?parseInt(e):null}async function Ma(e,{params:a}){const t=parseInt(a.id);if(!t){e.innerHTML='<div class="container"><p class="form__error">Usuario no válido.</p></div>';return}e.innerHTML='<div class="loading"><div class="loading__spinner"></div></div>';try{const s=Ta(),{user:n,predictions:i}=await u.predictions.forUser(t,s);e.innerHTML=`
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
              ${i.map(o=>Da(o)).join("")}
            </div>`}
      </div>
    `}catch(s){e.innerHTML=`<div class="container"><p class="form__error">Error: ${s.message}</p></div>`}}function Da(e){const a=e.match,t=e.total_points,s=e.pts_score>0,n=e.pts_result>0;let i="";return s?i='<span class="jugador__badge jugador__badge--exact">Exacto</span>':n?i='<span class="jugador__badge jugador__badge--ok">1X2 ✓</span>':i='<span class="jugador__badge jugador__badge--miss">Fallo</span>',`
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
  `}const F=20,Ie=5;let A={},G=0,ee=null;async function Ha(e){e.innerHTML='<div class="loading"><div class="loading__spinner"></div></div>';try{const{jornadas:a}=await u.jornada.list();if(!a.length){e.innerHTML=Aa();return}Se(e,a,0)}catch(a){e.innerHTML=`<div class="container"><p class="form__error">Error cargando jornadas: ${a.message}</p></div>`}}function Se(e,a,t){var d,l;ee=a[t];const{jornada:s,matches:n,units_used:i}=ee;A={};for(const _ of n)A[_.jornada_match_id]={predicted_result:((d=_.prediction)==null?void 0:d.predicted_result)??null,units:((l=_.prediction)==null?void 0:l.units_wagered)??0};G=i;const o=a.length>1?`<div class="jornada-tabs">
        ${a.map((_,h)=>`
          <button class="jornada-tab ${h===t?"jornada-tab--active":""}" data-idx="${h}">
            J${_.jornada.number} · ${ue(_.jornada.date_start)}–${ue(_.jornada.date_end)}
          </button>
        `).join("")}
       </div>`:"";e.innerHTML=`
    <div class="container">
      <h1 class="page-title">Jornada ${s.number}</h1>
      ${o}
      ${s.locked?'<p class="notice">⚠️ El plazo de predicción ha cerrado (ya empezó el primer partido).</p>':s.first_match_datetime?`<p class="notice notice--info">Abierto hasta ${je(s.first_match_datetime)}</p>`:""}
      <div class="units-counter" id="unitsCounter"></div>
      <div class="jornada-matches">
        ${n.map(qa).join("")}
      </div>
      ${s.locked?"":'<button class="btn btn--primary btn--full jornada-save-btn" id="jornadaSaveBtn">Guardar predicciones</button>'}
    </div>
  `,ke(),Oa(e,s.locked,a,t)}function Aa(){return`
    <div class="container">
      <div class="jornada-empty">
        <div class="jornada-empty__icon">📅</div>
        <h2 class="jornada-empty__title">No hay jornadas disponibles</h2>
        <p class="jornada-empty__text">Todavía no hay una próxima jornada programada.</p>
      </div>
    </div>
  `}function ue(e){return new Date(e).toLocaleDateString("es-ES",{day:"2-digit",month:"2-digit"})}function je(e){return new Date(e).toLocaleString("es-ES",{day:"2-digit",month:"2-digit",hour:"2-digit",minute:"2-digit"})}function Q(e){return e!=null?e.toFixed(2):"—"}function Na(e){const a=new Date,t=new Date(e.match_datetime);return e.status==="finished"?`<span class="tag tag--done">Finalizado ${e.home_score_90??"?"}–${e.away_score_90??"?"}</span>`:e.status!=="scheduled"||t<=a?'<span class="tag tag--locked">Bloqueado</span>':`<span class="tag tag--open">Abierto hasta ${je(e.match_datetime)}</span>`}function qa(e){const a=e.status!=="scheduled"||new Date(e.match_datetime)<=new Date,t=A[e.jornada_match_id]??{predicted_result:null,units:0};return`
    <div class="match-card jornada-match ${a?"match-card--locked":""}" data-jm-id="${e.jornada_match_id}">
      <div class="match-card__header">
        <span class="match-card__date">${M(e.match_datetime)}</span>
        ${Na(e)}
      </div>
      <div class="match-card__teams">
        <span class="team team--home">${e.home_team}</span>
        <div class="match-card__score">
          ${e.status!=="scheduled"?`<span class="score">${e.home_score_90??"?"} - ${e.away_score_90??"?"}</span>`:'<span class="score score--dash">vs</span>'}
        </div>
        <span class="team team--away">${e.away_team}</span>
      </div>
      <div class="jornada-odds">
        <span class="jornada-odds__item"><b>1</b> (${Q(e.odds_1)})</span>
        <span class="jornada-odds__item"><b>X</b> (${Q(e.odds_x)})</span>
        <span class="jornada-odds__item"><b>2</b> (${Q(e.odds_2)})</span>
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
    </div>
  `}function ke(){const e=document.getElementById("unitsCounter");if(!e)return;const a=G>F;e.innerHTML=`
    <div class="units-counter__bar">
      <div class="units-counter__fill ${a?"units-counter__fill--over":""}" style="width:${Math.min(100,G/F*100)}%"></div>
    </div>
    <span class="units-counter__label ${a?"units-counter__label--over":""}">${G}/${F} unidades usadas</span>
  `}function pe(){G=Object.values(A).reduce((e,a)=>e+(a.predicted_result?a.units:0),0),ke()}function Oa(e,a,t,s){var n;e.querySelectorAll(".jornada-tab").forEach(i=>{i.addEventListener("click",()=>{const o=parseInt(i.dataset.idx);o!==s&&Se(e,t,o)})}),!a&&(e.querySelectorAll(".jornada-match").forEach(i=>{const o=parseInt(i.dataset.jmId);i.querySelectorAll('input[type="radio"]').forEach(l=>{l.addEventListener("change",()=>{A[o].predicted_result=l.value,pe()})});const d=i.querySelector(".jornada-units__input");d==null||d.addEventListener("input",()=>{let l=parseInt(d.value);isNaN(l)&&(l=0),l=Math.max(0,Math.min(Ie,l)),A[o].units=l,pe()})}),(n=document.getElementById("jornadaSaveBtn"))==null||n.addEventListener("click",()=>Ua(ee.jornada.id)))}async function Ua(e){const a=document.getElementById("jornadaSaveBtn"),t=Object.entries(A).filter(([,s])=>s.predicted_result).map(([s,n])=>({jornada_match_id:parseInt(s),predicted_result:n.predicted_result,units:n.units}));if(t.length===0){p("Selecciona al menos un resultado 1X2","error");return}if(G>F){p(`Superas el máximo de ${F} unidades`,"error");return}a.disabled=!0,a.textContent="…";try{await u.jornada.predict(t),p("Predicciones guardadas"),a.textContent="✓ Guardadas"}catch(s){p(s.message||"Error al guardar","error")}finally{a.disabled=!1,setTimeout(()=>{a&&(a.textContent="Guardar predicciones")},2e3)}}const me={en_curso:{label:"En curso",cls:"duelo-status--curso"},ganado:{label:"Ganaste",cls:"duelo-status--ganado"},perdido:{label:"Perdiste",cls:"duelo-status--perdido"},empate:{label:"Empate",cls:"duelo-status--empate"}};async function Ga(e){e.innerHTML='<div class="loading"><div class="loading__spinner"></div></div>';try{const{duelo:a}=await u.duelo.current(),t=y.getUser();if(!a){e.innerHTML=`
        <div class="container">
          <h1 class="page-title">Tu duelo esta jornada</h1>
          <div class="duelo-empty">
            <div class="duelo-empty__icon">🤝</div>
            <p class="duelo-empty__text">No tienes un duelo asignado esta jornada.</p>
          </div>
        </div>
      `;return}const s=me[a.status]??me.en_curso,n=a.rival?a.rival.username:t.username,i=!a.rival||a.rival.id===t.id;e.innerHTML=`
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
    `,Ra(a.division_league_id,t.id)}catch(a){e.innerHTML=`<div class="container"><p class="form__error">Error cargando el duelo: ${a.message}</p></div>`}}async function Ra(e,a){const t=document.getElementById("divisionStandings");if(t)try{const{standings:s}=await u.clasificacion.division(e);if(s.length===0){t.innerHTML='<p class="empty">Sin clasificación disponible.</p>';return}t.innerHTML=`
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
    `}catch(s){t.innerHTML=`<p class="form__error">Error cargando la clasificación: ${s.message}</p>`}}async function Ja(e){e.innerHTML='<div class="loading"><div class="loading__spinner"></div></div>';try{const{standings:a}=await u.clasificacion.general(),t=y.getUser();e.innerHTML=`
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
    `,Fa(t)}catch(a){e.innerHTML=`<div class="container"><p class="form__error">Error cargando la clasificación: ${a.message}</p></div>`}}function Fa(e){const a={general:{btn:document.getElementById("tabGeneral"),panel:document.getElementById("panelGeneral")},miDivision:{btn:document.getElementById("tabMiDivision"),panel:document.getElementById("panelMiDivision")},divisiones:{btn:document.getElementById("tabDivisiones"),panel:document.getElementById("panelDivisiones")}};function t(s){for(const[n,{btn:i,panel:o}]of Object.entries(a))i.classList.toggle("league-tab--active",n===s),o.classList.toggle("hidden",n!==s)}a.general.btn.addEventListener("click",()=>t("general")),a.miDivision.btn.addEventListener("click",()=>{t("miDivision"),a.miDivision.panel.dataset.loaded||(a.miDivision.panel.dataset.loaded="1",za(e))}),a.divisiones.btn.addEventListener("click",()=>{t("divisiones"),a.divisiones.panel.dataset.loaded||(a.divisiones.panel.dataset.loaded="1",Va(e))})}async function za(e){const a=document.getElementById("panelMiDivision");if(a)try{const{standings:t}=await u.clasificacion.division();if(t.length===0){a.innerHTML='<p class="empty">Todavía no perteneces a ninguna división.</p>';return}a.innerHTML=`
      <div class="ranking-table-wrapper">
        <table class="ranking-table">
          <thead>
            <tr><th>#</th><th>Usuario</th><th>PJ</th><th>G</th><th>E</th><th>P</th><th>Pts div</th></tr>
          </thead>
          <tbody>
            ${t.map(s=>xe(s,e)).join("")}
          </tbody>
        </table>
      </div>
    `}catch(t){a.innerHTML=`<p class="form__error">Error: ${t.message}</p>`}}async function Va(e){const a=document.getElementById("panelDivisiones");if(a)try{const{divisions:t}=await u.clasificacion.allDivisions();if(!t.length){a.innerHTML='<p class="empty">No hay divisiones activas.</p>';return}a.innerHTML=t.map(s=>Xa(s,e)).join(""),a.querySelectorAll(".div-accordion__header").forEach(s=>{s.addEventListener("click",()=>{const i=s.nextElementSibling.classList.toggle("hidden");s.querySelector(".div-accordion__chevron").textContent=i?"▶":"▼"})})}catch(t){a.innerHTML=`<p class="form__error">Error: ${t.message}</p>`}}function Xa(e,a){const t=e.standings.some(s=>a&&s.user_id===a.id);return`
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
              ${e.standings.map(s=>xe(s,a)).join("")}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `}function xe(e,a){const t=a&&e.user_id===a.id,s=e.zone==="promotion"?"background:rgba(0,255,135,0.08)":e.zone==="relegation"?"background:rgba(255,56,96,0.08)":"";return`
    ${e.pos===5?'<tr class="div-separator div-separator--top"><td colspan="7"></td></tr>':e.pos===13?'<tr class="div-separator div-separator--bottom"><td colspan="7"></td></tr>':""}
    <tr class="${t?"ranking-table__row--me":""}" style="${s}">
      <td class="ranking-table__pos" data-pos="${e.pos}">${e.pos}</td>
      <td>${e.username}${e.is_bot?" 🤖":""}</td>
      <td class="ranking-table__stat">${e.pj}</td>
      <td class="ranking-table__stat">${e.g}</td>
      <td class="ranking-table__stat">${e.e}</td>
      <td class="ranking-table__stat">${e.p}</td>
      <td class="ranking-table__pts">${e.pts_division}</td>
    </tr>
  `}const Wa={"/":He,"/login":Ge,"/register":Re,"/quiniela":Fe,"/resultados":ja,"/ranking":Ze,"/tablon":Le,"/ligas":aa,"/ligas/:id":sa,"/perfil":ia,"/campeon":we,"/admin":ca,"/forgot-password":wa,"/reset-password":Ia,"/unirse":Pa,"/jugador/:id":Ma,"/jornada":Ha,"/duelo":Ga,"/tabla-v2":Ja};function Ka(e){for(const[a,t]of Object.entries(Wa)){const s=[],n=new RegExp("^"+a.replace(/:([^/]+)/g,(o,d)=>(s.push(d),"([^/]+)"))+"$"),i=e.match(n);if(i){const o={};return s.forEach((d,l)=>{o[d]=i[l+1]}),{handler:t,params:o}}}return null}const ge=()=>document.getElementById("mainContent"),I={init(){window.addEventListener("hashchange",()=>this.resolve()),this.resolve()},navigate(e){window.location.hash=e},resolve(){const e=window.location.hash.slice(1)||"/",[a,t]=e.split("?"),s=Object.fromEntries(new URLSearchParams(t||"")),n=Ka(a);if(!n){ge().innerHTML='<div class="error-page"><h2>Página no encontrada</h2><a href="#/">Volver al inicio</a></div>';return}const{handler:i,params:o}=n;if(["/perfil","/campeon","/admin","/jornada","/duelo","/tabla-v2"].includes(a)&&!y.isLoggedIn()){this.navigate("/login");return}if(a==="/admin"&&!y.isAdmin()){this.navigate("/");return}const l=ge();l.innerHTML='<div class="loading"><div class="loading__spinner"></div></div>',i(l,{params:o,query:s})}};let J=[],U=null,N=null;async function Ya(){document.documentElement.dataset.build="2026-08-07T14",await y.init(),I.init(),et(),Qa(),st()}function Be(){return localStorage.getItem("pwa_installed")==="true"||window.matchMedia("(display-mode: standalone)").matches||window.navigator.standalone===!0}function Qa(){window.addEventListener("beforeinstallprompt",e=>{e.preventDefault(),!Be()&&(U=e,Za())}),window.addEventListener("appinstalled",()=>{var e;localStorage.setItem("pwa_installed","true"),U=null,(e=document.getElementById("installBanner"))==null||e.remove()})}function Za(){if(Be()||sessionStorage.getItem("installBannerDismissed"))return;const e=document.createElement("div");e.id="installBanner",e.className="install-banner",e.innerHTML=`
    <span class="install-banner__text">⚽ Instala PickGoal en tu dispositivo</span>
    <div class="install-banner__actions">
      <button class="install-banner__btn install-banner__btn--primary" id="installBtn">Instalar</button>
      <button class="install-banner__btn install-banner__btn--ghost" id="installDismissBtn">Ahora no</button>
    </div>
  `,document.body.appendChild(e),document.getElementById("installBtn").addEventListener("click",async()=>{U&&(U.prompt(),await U.userChoice,U=null,e.remove())}),document.getElementById("installDismissBtn").addEventListener("click",()=>{sessionStorage.setItem("installBannerDismissed","1"),e.remove()})}function q(){var e,a;(e=document.getElementById("userDropdown"))==null||e.classList.add("hidden"),(a=document.getElementById("userBtn"))==null||a.classList.remove("navbar__dropdown-btn--open")}async function ae(){const e=document.getElementById("tablonBadge");if(!e)return;if(!y.getUser()){e.classList.add("hidden");return}const t=localStorage.getItem("activeLeagueId");if(!t){e.classList.add("hidden");return}const s=localStorage.getItem(`tablon_last_read_${t}`)||new Date(0).toISOString();try{const{count:n}=await u.board.unread(parseInt(t),s);n>0?(e.textContent=n>99?"99+":String(n),e.classList.remove("hidden")):e.classList.add("hidden")}catch{e.classList.add("hidden")}}function et(){var e,a,t;document.addEventListener("auth:change",_e),window.addEventListener("hashchange",()=>{q(),Ce(),setTimeout(ae,200)}),document.addEventListener("click",q),(e=document.getElementById("userBtn"))==null||e.addEventListener("click",s=>{var o;s.stopPropagation();const n=document.getElementById("userDropdown"),i=n==null?void 0:n.classList.contains("hidden");q(),i&&(n==null||n.classList.remove("hidden"),(o=document.getElementById("userBtn"))==null||o.classList.add("navbar__dropdown-btn--open"))}),(a=document.getElementById("userDropdown"))==null||a.addEventListener("click",s=>{s.stopPropagation(),s.target.closest("#navProfileLink")&&q()}),(t=document.getElementById("navLogoutBtn"))==null||t.addEventListener("click",()=>{J=[],localStorage.removeItem("activeLeagueId"),q(),y.logout(),I.navigate("/")}),_e()}async function _e(){var i;const e=document.getElementById("navAuthLinks"),a=document.getElementById("userBtn"),t=document.getElementById("navUsername"),s=document.getElementById("bottomNav"),n=y.getUser();if(q(),n){e==null||e.classList.add("hidden"),t&&(t.textContent=n.username),a.style.visibility="visible",s==null||s.classList.remove("hidden"),document.body.classList.add("has-bottom-nav"),(i=document.getElementById("navAdminLink"))==null||i.classList.toggle("hidden",!n.is_admin);try{const{leagues:o}=n.is_admin?await u.leagues.adminAll():await u.leagues.my();J=o}catch{J=[]}at(J),ae(),N&&clearInterval(N),N=setInterval(ae,5*60*1e3)}else e==null||e.classList.remove("hidden"),a.style.visibility="hidden",s==null||s.classList.add("hidden"),document.body.classList.remove("has-bottom-nav"),J=[],localStorage.removeItem("activeLeagueId"),N&&(clearInterval(N),N=null);Ce()}function at(e){const a=localStorage.getItem("activeLeagueId");a&&e.some(s=>String(s.id)===String(a))||(e.length>0?localStorage.setItem("activeLeagueId",String(e[0].id)):localStorage.removeItem("activeLeagueId"))}function Ce(){const e=window.location.hash.slice(1).split("?")[0]||"/";document.querySelectorAll(".bottom-nav__item").forEach(a=>{const t=a.dataset.route,s=t==="/"?e==="/":e===t||e.startsWith(t+"/");a.classList.toggle("bottom-nav__item--active",s)})}function tt(e){const a="=".repeat((4-e.length%4)%4),t=(e+a).replace(/-/g,"+").replace(/_/g,"/"),s=atob(t);return Uint8Array.from([...s].map(n=>n.charCodeAt(0)))}async function st(){if(!(!("serviceWorker"in navigator)||!("PushManager"in window)))try{const e=await navigator.serviceWorker.register("/sw.js");document.addEventListener("auth:change",async a=>{a.detail&&await ve(e)}),y.getUser()&&await ve(e)}catch{}}async function ve(e){try{if(await Notification.requestPermission()!=="granted")return;const t=await e.pushManager.getSubscription();if(t){await u.notifications.subscribe(t.toJSON());return}const{public_key:s}=await u.notifications.vapidPublicKey();if(!s)return;const n=await e.pushManager.subscribe({userVisibleOnly:!0,applicationServerKey:tt(s)});await u.notifications.subscribe(n.toJSON())}catch{}}Ya();
