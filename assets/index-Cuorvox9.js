(function(){const t=document.createElement("link").relList;if(t&&t.supports&&t.supports("modulepreload"))return;for(const s of document.querySelectorAll('link[rel="modulepreload"]'))n(s);new MutationObserver(s=>{for(const i of s)if(i.type==="childList")for(const o of i.addedNodes)o.tagName==="LINK"&&o.rel==="modulepreload"&&n(o)}).observe(document,{childList:!0,subtree:!0});function a(s){const i={};return s.integrity&&(i.integrity=s.integrity),s.referrerPolicy&&(i.referrerPolicy=s.referrerPolicy),s.crossOrigin==="use-credentials"?i.credentials="include":s.crossOrigin==="anonymous"?i.credentials="omit":i.credentials="same-origin",i}function n(s){if(s.ep)return;s.ep=!0;const i=a(s);fetch(s.href,i)}})();const le="https://pickgoal-backend.onrender.com/api";function de(){return localStorage.getItem("token")}async function _(e,t={}){const a={"Content-Type":"application/json",...t.headers},n=de();n&&(a.Authorization=`Bearer ${n}`);const s=await fetch(`${le}${e}`,{...t,headers:a}),i=await s.json().catch(()=>({}));if(!s.ok)throw{status:s.status,message:i.error||"Error desconocido"};return i}const p={get:e=>_(e),post:(e,t)=>_(e,{method:"POST",body:JSON.stringify(t)}),patch:(e,t)=>_(e,{method:"PATCH",body:JSON.stringify(t)}),delete:e=>_(e,{method:"DELETE"}),auth:{register:e=>_("/auth/register",{method:"POST",body:JSON.stringify(e)}),login:e=>_("/auth/login",{method:"POST",body:JSON.stringify(e)}),me:()=>_("/auth/me"),forgotPassword:e=>_("/auth/forgot-password",{method:"POST",body:JSON.stringify({email:e})}),resetPassword:(e,t)=>_("/auth/reset-password",{method:"POST",body:JSON.stringify({token:e,password:t})}),ranking:e=>_(`/auth/ranking${e?`?league_id=${e}`:""}`),users:()=>_("/auth/users"),toggleAdmin:e=>_(`/auth/users/${e}/toggle-admin`,{method:"PATCH"})},matches:{grouped:()=>_("/matches/grouped"),list:(e="")=>_(`/matches/${e}`),get:e=>_(`/matches/${e}`),sync:()=>_("/matches/sync",{method:"POST"})},predictions:{mine:e=>_(`/predictions/${e?`?league_id=${e}`:""}`),forMatch:(e,t)=>_(`/predictions/match/${e}${t?`?league_id=${t}`:""}`),save:e=>_("/predictions/",{method:"POST",body:JSON.stringify(e)}),forUser:(e,t)=>_(`/predictions/user/${e}${t?`?league_id=${t}`:""}`),getChampion:e=>_(`/predictions/champion${e?`?league_id=${e}`:""}`),saveChampion:(e,t)=>_("/predictions/champion",{method:"POST",body:JSON.stringify({team_name:e,league_id:t??null})}),awardChampion:e=>_("/predictions/champion/award",{method:"POST",body:JSON.stringify({team_name:e})})},leagues:{all:()=>_("/leagues/all"),public:()=>_("/leagues/public"),my:()=>_("/leagues/my"),create:e=>_("/leagues/",{method:"POST",body:JSON.stringify(e)}),join:e=>_("/leagues/join",{method:"POST",body:JSON.stringify(e)}),joinByCode:e=>_(`/leagues/join/${encodeURIComponent(e)}`),adminAll:()=>_("/leagues/admin"),get:e=>_(`/leagues/${e}`),update:(e,t)=>_(`/leagues/${e}`,{method:"PUT",body:JSON.stringify(t)}),leave:e=>_(`/leagues/${e}/leave`,{method:"DELETE"}),members:e=>_(`/leagues/${e}/members`),matchPredictions:(e,t)=>_(`/leagues/${e}/predictions/${t}`)},home:{summary:()=>_("/home/summary")},board:{messages:(e=1,t=null)=>_(`/board/?page=${e}${t?`&league_id=${t}`:""}`),unread:(e,t)=>_(`/board/unread?league_id=${e}&since=${encodeURIComponent(t)}`),post:(e,t=null)=>_("/board/",{method:"POST",body:JSON.stringify({message:e,league_id:t})}),pin:e=>_(`/board/${e}/pin`,{method:"POST"}),reply:(e,t)=>_(`/board/${e}/reply`,{method:"POST",body:JSON.stringify({message:t})}),delete:e=>_(`/board/${e}`,{method:"DELETE"})}};let P=null;const y={async init(){if(localStorage.getItem("token"))try{const{user:t}=await p.auth.me();P=t}catch{localStorage.removeItem("token")}},setUser(e,t){P=e,localStorage.setItem("token",t),document.dispatchEvent(new CustomEvent("auth:change",{detail:e}))},logout(){P=null,localStorage.removeItem("token"),document.dispatchEvent(new CustomEvent("auth:change",{detail:null}))},getUser(){return P},isLoggedIn(){return!!P},isAdmin(){return(P==null?void 0:P.is_admin)===!0}};let R=null;function v(e,t="success"){let a=document.getElementById("toast");a||(a=document.createElement("div"),a.id="toast",document.body.appendChild(a)),a.textContent=e,a.className=`toast toast--${t} toast--visible`,R&&clearTimeout(R),R=setTimeout(()=>{a.classList.remove("toast--visible")},3e3)}function ee(){return`
    <div class="container">
      <div class="league-gate">
        <div class="league-gate__icon">⚽</div>
        <h2 class="league-gate__title">¡Inicia tu Liga!</h2>
        <p class="league-gate__text">Únete a una liga para empezar a predecir</p>
        <a href="#/ligas" class="btn btn--primary">Ver ligas disponibles</a>
      </div>
    </div>
  `}function T(e){return e?new Date(e).toLocaleString("es-ES",{day:"2-digit",month:"2-digit",year:"numeric",hour:"2-digit",minute:"2-digit"}):"—"}async function ce(e){if(!y.getUser()){pe(e);return}e.innerHTML='<div class="loading"><div class="loading__spinner"></div></div>';try{const{leagues_summary:a,upcoming_matches:n}=await p.home.summary();if(a.length===0){ue(e);return}const s=(()=>{const o=localStorage.getItem("activeLeagueId");return o?parseInt(o):null})(),i=[...a].sort((o,d)=>o.league_id===s?-1:d.league_id===s?1:0);e.innerHTML=`
      <div class="home-dashboard container">
        <div class="home-dashboard__topbar">
          <button class="btn btn--ghost btn--sm" id="btnPointsInfo">📊 Sistema de puntos</button>
        </div>
        <div class="home-dashboard__leagues">
          ${i.map(o=>ge(o)).join("")}
        </div>
        ${he(n)}
      </div>
      ${_e()}
    `,ve(e),e.querySelectorAll(".league-card[data-league-id]").forEach(o=>{o.style.cursor="pointer",o.addEventListener("click",d=>{d.target.closest("a")||E.navigate(`/ligas/${o.dataset.leagueId}`)})})}catch(a){e.innerHTML=`<div class="container"><p class="form__error">Error cargando el inicio: ${a.message}</p></div>`}}function pe(e){e.innerHTML=`
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
  `}function ue(e){e.innerHTML=`
    <section class="hero">
      <div class="hero__content">
        <img src="/assets/logo-completo.jpg" alt="PickGoal" class="hero__logo-img" />
        <p class="hero__subtitle">Únete a una liga y empieza a predecir el Mundial 2026</p>
        <div class="hero__cta">
          <a href="#/ligas" class="btn btn--primary btn--lg">Unirse a una liga</a>
        </div>
      </div>
    </section>
  `}function me(e){return`${e}º`}function ge(e){const t=e.next_to_predict?`<div class="league-card__next">
         <span class="league-card__next-label">Próximo a predecir</span>
         <span class="league-card__next-match">${e.next_to_predict.home_team} vs ${e.next_to_predict.away_team}</span>
         <span class="league-card__next-date">${T(e.next_to_predict.match_datetime)}</span>
       </div>`:`<div class="league-card__next league-card__next--done">
         Todos los partidos predichos
       </div>`;return`
    <div class="league-card" data-league-id="${e.league_id}">
      <div class="league-card__header">
        <h2 class="league-card__name">${e.league_name}</h2>
        <span class="league-card__rank">${me(e.rank)} de ${e.member_count}</span>
      </div>
      <div class="league-card__stats">
        <div class="league-card__stat">
          <span class="league-card__stat-val">${e.total_points}</span>
          <span class="league-card__stat-label">Puntos</span>
        </div>
        <div class="league-card__stat">
          <span class="league-card__stat-val">${e.correct_results}/${e.predictions_made}</span>
          <span class="league-card__stat-label">1X2</span>
        </div>
        <div class="league-card__stat">
          <span class="league-card__stat-val">${e.exact_scores}/${e.predictions_made}</span>
          <span class="league-card__stat-label">Exactos</span>
        </div>
      </div>
      ${t}
      <a class="league-card__cta btn btn--ghost btn--sm" href="#/ligas/${e.league_id}">Ver clasificación</a>
    </div>
  `}function _e(){return`
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
            ${[["Grupos","1+1"],["Dieciseisavos","2+2"],["Octavos","3+3"],["Cuartos","4+4"],["Semis","5+5"],["3º y 4º","5+5"],["Final","6+6"]].map(([e,t])=>`
              <div class="points-modal__phase-pill">
                <span class="points-modal__phase-name">${e}</span>
                <span class="points-modal__phase-pts">${t}</span>
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
  `}function ve(e){const t=e.querySelector("#pointsModal"),a=e.querySelector("#btnPointsInfo"),n=e.querySelector("#pointsClose"),s=e.querySelector("#pointsOverlay");function i(){t.classList.add("points-modal--open"),document.body.style.overflow="hidden"}function o(){t.classList.remove("points-modal--open"),document.body.style.overflow=""}a==null||a.addEventListener("click",i),n==null||n.addEventListener("click",o),s==null||s.addEventListener("click",o),document.addEventListener("keydown",d=>{d.key==="Escape"&&o()},{once:!1})}function he(e){return e.length?`
    <section class="upcoming-matches">
      <h2 class="upcoming-matches__title">Próximos partidos</h2>
      <div class="upcoming-matches__list">
        ${e.map(({match:t,has_prediction:a})=>`
          <div class="upcoming-match">
            <div class="upcoming-match__teams">
              <span>${t.home_team}</span>
              <span class="upcoming-match__vs">vs</span>
              <span>${t.away_team}</span>
            </div>
            <div class="upcoming-match__meta">
              <span class="upcoming-match__date">${T(t.match_datetime)}</span>
              ${a?'<span class="upcoming-match__badge upcoming-match__badge--done">Predicho</span>':'<span class="upcoming-match__badge upcoming-match__badge--pending">Sin predecir</span>'}
            </div>
          </div>
        `).join("")}
      </div>
      <a class="btn btn--ghost btn--sm" href="#/quiniela">Ver todos los pronósticos</a>
    </section>
  `:""}const z="pickgoal_welcome_shown";function ae(e="/ligas"){if(localStorage.getItem(z))return;localStorage.setItem(z,"1");const t=document.createElement("div");t.innerHTML=`
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
  `;const a=t.firstElementChild;document.body.appendChild(a),document.body.style.overflow="hidden",requestAnimationFrame(()=>a.classList.add("welcome-modal--open"));function n(s){a.classList.remove("welcome-modal--open"),document.body.style.overflow="",a.addEventListener("transitionend",()=>a.remove(),{once:!0}),s&&(window.location.hash=s)}document.getElementById("welcomeOverlay").addEventListener("click",()=>n()),document.getElementById("welcomeCta").addEventListener("click",()=>n(e)),document.addEventListener("keydown",function s(i){i.key==="Escape"&&(n(),document.removeEventListener("keydown",s))})}function be(e){e.innerHTML=`
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
  `,document.getElementById("loginForm").addEventListener("submit",async t=>{t.preventDefault();const a=document.getElementById("loginBtn"),n=document.getElementById("loginError"),s=document.getElementById("identifier").value.trim(),i=document.getElementById("password").value;a.disabled=!0,a.textContent="Entrando…",n.classList.add("hidden");try{const{token:o,user:d}=await p.auth.login({identifier:s,password:i});y.setUser(d,o),v(`¡Bienvenido, ${d.username}!`),E.navigate("/quiniela"),ae("/quiniela")}catch(o){n.textContent=o.message||"Error al iniciar sesión",n.classList.remove("hidden")}finally{a.disabled=!1,a.textContent="Entrar"}})}function fe(e){e.innerHTML=`
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
  `,document.getElementById("registerForm").addEventListener("submit",async t=>{t.preventDefault();const a=document.getElementById("registerBtn"),n=document.getElementById("registerError");a.disabled=!0,a.textContent="Creando cuenta…",n.classList.add("hidden");const s={username:document.getElementById("username").value.trim(),email:document.getElementById("email").value.trim(),country:document.getElementById("country").value.trim(),password:document.getElementById("password").value};try{const{token:i,user:o}=await p.auth.register(s);y.setUser(o,i),v("¡Cuenta creada! Bienvenido a PickGoal");const d=sessionStorage.getItem("pendingInviteCode");if(d){sessionStorage.removeItem("pendingInviteCode");try{const{league:c}=await p.leagues.joinByCode(d);v(`¡Te has unido a "${c.name}"!`),E.navigate(`/ligas/${c.id}`)}catch{E.navigate("/ligas")}}else E.navigate("/campeon"),ae("/ligas")}catch(i){n.textContent=i.message||"Error al registrarse",n.classList.remove("hidden")}finally{a.disabled=!1,a.textContent="Crear cuenta"}})}function J(){const e=localStorage.getItem("activeLeagueId");return e?parseInt(e):null}async function ye(e){var t;e.innerHTML='<div class="loading"><div class="loading__spinner"></div></div>';try{let a=null;if(y.isLoggedIn()){const{leagues:g}=await p.leagues.my();if(g.length===0){e.innerHTML=ee();return}const h=J(),f=g.find(w=>w.id===h);a=f?f.name:((t=g[0])==null?void 0:t.name)??null}const n=J(),[{groups:s},i]=await Promise.all([p.matches.grouped(),y.isLoggedIn()?p.predictions.mine(n):Promise.resolve({predictions:[]})]),o={};for(const g of i.predictions)o[g.match_id]=g;const d=s.flatMap(g=>g.matches),c=new Map;for(const g of d){const h=X(g.match_datetime);c.has(h)||c.set(h,[]),c.get(h).push(g)}const u=[...c.keys()].sort(),b=X(new Date().toISOString()),m=u.find(g=>g>=b)??u[0];e.innerHTML=`
      ${a?`<span class="page-league-name">${a}</span>`:""}
      <div class="container">
        <h1 class="page-title">Pronósticos — Mundial 2026</h1>
        ${y.isLoggedIn()?"":'<p class="notice">⚠️ <a href="#/login">Inicia sesión</a> para guardar tus predicciones.</p>'}
        <nav class="date-nav" id="dateNav"></nav>
        <div id="matchesContent"></div>
      </div>
    `,$e(u,m,c,o,n)}catch(a){e.innerHTML=`<div class="container"><p class="form__error">Error cargando los partidos: ${a.message}</p></div>`}}function $e(e,t,a,n,s){var o;const i=document.getElementById("dateNav");i&&(i.innerHTML=e.map(d=>`
    <button class="date-nav__btn ${d===t?"date-nav__btn--active":""}" data-day="${d}">
      ${Ee(d)}
    </button>
  `).join(""),(o=i.querySelector(".date-nav__btn--active"))==null||o.scrollIntoView({inline:"center",behavior:"instant",block:"nearest"}),i.querySelectorAll(".date-nav__btn").forEach(d=>{d.addEventListener("click",()=>{i.querySelectorAll(".date-nav__btn").forEach(c=>c.classList.remove("date-nav__btn--active")),d.classList.add("date-nav__btn--active"),V(a.get(d.dataset.day)??[],n,s)})}),V(a.get(t)??[],n,s))}function V(e,t,a){const n=document.getElementById("matchesContent");if(n){if(e.length===0){n.innerHTML='<p class="empty">Sin partidos este día.</p>';return}n.innerHTML=`<div class="matches-grid">${e.map(s=>Le(s,t[s.id])).join("")}</div>`,y.isLoggedIn()&&n.querySelectorAll(".prediction-form").forEach(s=>{Ie(s,t,a)})}}function X(e){const t=new Date(e);return`${t.getFullYear()}-${String(t.getMonth()+1).padStart(2,"0")}-${String(t.getDate()).padStart(2,"0")}`}function Ee(e){const[t,a,n]=e.split("-").map(Number);return new Date(t,a-1,n).toLocaleDateString("es-ES",{day:"numeric",month:"short"})}function Le(e,t){const a=e.is_locked,n=t?`<span class="pts-badge">${t.total_points} pts</span>`:"",s={scheduled:"Programado",live:"🔴 En juego",finished:"Finalizado"}[e.status];return`
    <div class="match-card ${a?"match-card--locked":""}" data-match-id="${e.id}">
      <div class="match-card__header">
        <span class="match-card__status">${s}</span>
        <span class="match-card__date">${T(e.match_datetime)}</span>
        ${n}
      </div>
      <div class="match-card__teams">
        <span class="team team--home">${e.home_team}</span>
        <div class="match-card__score">
          ${e.status!=="scheduled"?`<span class="score">${e.home_score_90??"?"} - ${e.away_score_90??"?"}</span>`:'<span class="score score--dash">vs</span>'}
        </div>
        <span class="team team--away">${e.away_team}</span>
      </div>
      ${!a&&y.isLoggedIn()?we(e,t):a&&t?`<div class="prediction-result">
               Tu predicción: <strong>${t.predicted_home}-${t.predicted_away}</strong>
               (${t.predicted_result}) · ${t.total_points} pts
             </div>`:""}
    </div>
  `}function we(e,t){const a=!!t,n=(t==null?void 0:t.predicted_home)??0,s=(t==null?void 0:t.predicted_away)??0,i=(t==null?void 0:t.predicted_result)??"X",o=a?"prediction-form--saved":"prediction-form--unsaved",d=a?'<span class="pred-status pred-status--saved">✓ Guardado</span>':'<span class="pred-status pred-status--unsaved">Sin predicción</span>',c=a?"btn btn--saved btn--sm pred-save-btn":"btn btn--ghost btn--sm pred-save-btn",u=a?"✓ Guardado":"Guardar";return`
    <form class="prediction-form ${o}" data-match-id="${e.id}" data-saved="${a}">
      ${d}
      <div class="result-selector">
        ${["1","X","2"].map(b=>`
          <label class="result-selector__option">
            <input type="radio" name="predicted_result" value="${b}" ${i===b?"checked":""} required />
            ${b}
          </label>
        `).join("")}
      </div>
      <div class="prediction-form__inputs">
        <input type="number" name="predicted_home" class="score-input" min="0" max="30"
          value="${n}" placeholder="0" required />
        <span>-</span>
        <input type="number" name="predicted_away" class="score-input" min="0" max="30"
          value="${s}" placeholder="0" required />
      </div>
      <button type="submit" class="${c}">${u}</button>
    </form>
  `}function Ie(e,t,a){const n=parseInt(e.dataset.matchId),s=e.querySelector(".pred-save-btn"),i=e.querySelector(".pred-status");let o=e.dataset.saved==="true";function d(){e.classList.contains("prediction-form--dirty")||(e.classList.remove("prediction-form--saved","prediction-form--unsaved"),e.classList.add("prediction-form--dirty"),s.className="btn btn--primary btn--sm pred-save-btn",s.textContent="Guardar",i&&(i.className="pred-status pred-status--unsaved",i.textContent="Sin guardar"))}function c(){o=!0,e.classList.remove("prediction-form--unsaved","prediction-form--dirty"),e.classList.add("prediction-form--saved"),s.className="btn btn--saved btn--sm pred-save-btn",s.textContent="✓ Guardado",s.disabled=!1,i&&(i.className="pred-status pred-status--saved",i.textContent="✓ Guardado")}e.querySelectorAll("input").forEach(u=>{u.addEventListener("change",d),u.addEventListener("input",d)}),e.addEventListener("submit",async u=>{var h;u.preventDefault();const b=parseInt(e.querySelector("[name=predicted_home]").value),m=parseInt(e.querySelector("[name=predicted_away]").value),g=(h=e.querySelector("[name=predicted_result]:checked"))==null?void 0:h.value;if(!(isNaN(b)||isNaN(m)||!g)){s.disabled=!0,s.textContent="…";try{const{prediction:f}=await p.predictions.save({match_id:n,predicted_result:g,predicted_home:b,predicted_away:m,league_id:a??null});t[n]=f,v("Predicción guardada"),c()}catch(f){v(f.message||"Error al guardar","error"),s.disabled=!1,o?(s.className="btn btn--saved btn--sm pred-save-btn",s.textContent="✓ Guardado"):(s.className="btn btn--primary btn--sm pred-save-btn",s.textContent="Guardar")}}})}function Se(){const e=localStorage.getItem("activeLeagueId");return e?parseInt(e):null}async function xe(e){var t;e.innerHTML='<div class="loading"><div class="loading__spinner"></div></div>';try{if(y.isLoggedIn()){const{leagues:b}=await p.leagues.my();if(b.length===0){e.innerHTML=ee();return}}const a=Se(),[{ranking:n},s]=await Promise.all([p.auth.ranking(a),y.isLoggedIn()?p.leagues.my():Promise.resolve({leagues:[]})]),i=y.getUser(),o=s.leagues.find(b=>b.id===a),d=document.getElementById("tablonBadge"),c=d&&!d.classList.contains("hidden"),u=c?d.textContent:"";e.innerHTML=`
      ${o?`<span class="page-league-name">${o.name}</span>`:""}
      <div class="container">
        <div class="ranking-header">
          <h1 class="page-title">Clasificación</h1>
          ${a?`
            <button class="ranking-tablon-btn" data-league-id="${a}">
              💬 Tablón
              <span class="ranking-tablon-btn__badge${c?"":" hidden"}">${u}</span>
            </button>
          `:""}
        </div>
        <div class="ranking-table-wrapper">
          <table class="ranking-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Usuario</th>
                <th>País</th>
                <th>Puntos</th>
                <th title="Pronósticos 1X2 acertados">1X2</th>
                <th title="Resultados exactos acertados">Exactos</th>
              </tr>
            </thead>
            <tbody>
              ${n.map(b=>{var m,g;return`
                <tr class="${i&&b.id===i.id?"ranking-table__row--me":""}">
                  <td class="ranking-table__pos" data-pos="${b.position}">${b.position}</td>
                  <td>
                    <a class="ranking-table__link" href="#/jugador/${b.id}">
                      <span class="status-emoji" title="${((m=b.status)==null?void 0:m.name)||""}">${((g=b.status)==null?void 0:g.emoji)||""}</span>${b.username}
                    </a>
                  </td>
                  <td>${b.country||"—"}</td>
                  <td class="ranking-table__pts">${b.total_points}</td>
                  <td class="ranking-table__stat">${b.correct_results}</td>
                  <td class="ranking-table__stat">${b.exact_scores}</td>
                </tr>
              `}).join("")}
            </tbody>
          </table>
        </div>
      </div>
    `,(t=e.querySelector(".ranking-tablon-btn"))==null||t.addEventListener("click",()=>{E.navigate(`/tablon?liga=${a}`)})}catch(a){e.innerHTML=`<div class="container"><p class="form__error">Error: ${a.message}</p></div>`}}async function te(e,{query:t={}}={}){e.innerHTML='<div class="loading"><div class="loading__spinner"></div></div>';const a=y.getUser();let n=t.liga?parseInt(t.liga):null;if(n){localStorage.setItem(`tablon_last_read_${n}`,new Date().toISOString());const r=document.getElementById("tablonBadge");r&&(r.classList.add("hidden"),r.textContent="")}let s=null,i=[],o=1,d=1;try{if(!n&&a){const{leagues:r}=await p.leagues.my();r&&r.length&&(n=r[0].id,s=r[0].name)}else if(n)try{const{league:r}=await p.leagues.get(n);s=r.name}catch{}if(n&&a)try{const{members:r}=await p.leagues.members(n);i=r||[]}catch{}}catch{}async function c(){const r=await p.board.messages(o,n);return d=r.pages||1,r}try{const r=await c();u(r)}catch(r){e.innerHTML=`<div class="container"><p class="form__error">Error: ${r.message}</p></div>`}function u(r){const{pinned:l=[],messages:$=[]}=r;e.innerHTML=`
      <div class="container">
        <div class="board-header">
          <h1 class="page-title">Tablón${s?` · ${s}`:""}</h1>
          ${s?'<span class="board-league-badge">🏆 Liga</span>':'<span class="board-general-badge">🌐 General</span>'}
        </div>

        ${a?`<form class="board-form" id="boardForm">
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

        ${l.length?`<section class="board-section">
               <h2 class="board-section__title">📌 Anuncios fijados</h2>
               <div class="board-pinned" id="boardPinned">
                 ${b(l)}
               </div>
             </section>`:""}

        <section class="board-section">
          ${l.length?'<h2 class="board-section__title">💬 Mensajes</h2>':""}
          <div class="board-messages" id="boardMessages">
            ${g($)}
          </div>
          ${d>1?`<div class="pagination">
                 <button class="btn btn--ghost btn--sm" id="prevPage" ${o<=1?"disabled":""}>← Anterior</button>
                 <span>Página ${o} / ${d}</span>
                 <button class="btn btn--ghost btn--sm" id="nextPage" ${o>=d?"disabled":""}>Siguiente →</button>
               </div>`:""}
        </section>
      </div>
    `,f(),w(),x()}function b(r){return r.length?r.map(l=>`
      <div class="board-message board-message--pinned" data-id="${l.id}">
        <div class="board-message__header">
          <span class="board-message__pin-badge">📌</span>
          <strong class="board-message__author">${H(l.username)}</strong>
          <span class="board-message__date">${T(l.created_at)}</span>
          ${a!=null&&a.is_admin&&!l.is_deleted?`<button class="btn btn--ghost btn--xs unpin-msg" data-id="${l.id}" title="Desfijar">📌✕</button>`:""}
          ${!l.is_deleted&&a&&(a.id===l.user_id||a.is_admin)?`<button class="btn btn--danger btn--xs delete-msg" data-id="${l.id}">✕</button>`:""}
        </div>
        <p class="board-message__text">${h(l.message)}</p>

        ${l.replies&&l.replies.length?`<div class="board-replies">
               ${l.replies.map($=>m($)).join("")}
             </div>`:""}

        ${a&&!l.is_deleted?`<form class="reply-form" id="replyForm-${l.id}" data-parent="${l.id}">
               <div class="reply-form__input-wrap">
                 <input class="form__input reply-input" type="text"
                   placeholder="Responder…" maxlength="500"
                   id="replyInput-${l.id}" />
                 <div class="mention-dropdown hidden" id="mentionDropdown-${l.id}"></div>
               </div>
               <button class="btn btn--outline btn--sm" type="submit">Enviar</button>
             </form>`:""}
      </div>
    `).join(""):""}function m(r){return`
      <div class="board-reply ${r.is_deleted?"board-reply--deleted":""}" data-id="${r.id}">
        <div class="board-reply__header">
          <strong class="board-reply__author">${H(r.username)}</strong>
          <span class="board-reply__date">${T(r.created_at)}</span>
          ${!r.is_deleted&&a&&(a.id===r.user_id||a.is_admin)?`<button class="btn btn--danger btn--xs delete-msg" data-id="${r.id}">✕</button>`:""}
        </div>
        <p class="board-reply__text">${h(r.message)}</p>
      </div>
    `}function g(r){return r.length?r.map(l=>`
      <div class="board-message ${l.is_deleted?"board-message--deleted":""}" data-id="${l.id}">
        <div class="board-message__header">
          <strong class="board-message__author">${H(l.username)}</strong>
          <span class="board-message__date">${T(l.created_at)}</span>
          ${a!=null&&a.is_admin&&!l.is_deleted?`<button class="btn btn--ghost btn--xs pin-msg" data-id="${l.id}" title="Fijar">📌</button>`:""}
          ${!l.is_deleted&&a&&(a.id===l.user_id||a.is_admin)?`<button class="btn btn--danger btn--xs delete-msg" data-id="${l.id}">✕</button>`:""}
        </div>
        <p class="board-message__text">${h(l.message)}</p>
      </div>
    `).join(""):'<p class="empty">Sin mensajes aún. ¡Sé el primero!</p>'}function h(r){const l=H(r);if(!i.length)return l;const $=i.map(L=>Ce(L.username)),S=new RegExp(`@(${$.join("|")})`,"gi");return l.replace(S,'<span class="mention">@$1</span>')}function f(){const r=document.getElementById("boardForm");if(!r)return;const l=document.getElementById("boardMsg"),$=document.getElementById("charCounter"),S=document.getElementById("mentionDropdown");l.addEventListener("input",()=>{$.textContent=`${l.value.length} / 500`,C(l,S)}),r.addEventListener("submit",async L=>{L.preventDefault();const M=l.value.trim();if(M)try{await p.board.post(M,n),l.value="",$.textContent="0 / 500",S.classList.add("hidden");const k=await c();I(k),v("Mensaje publicado")}catch(k){v(k.message,"error")}})}function w(){e.querySelectorAll(".reply-form").forEach(r=>{const l=parseInt(r.dataset.parent),$=r.querySelector(".reply-input"),S=`mentionDropdown-${l}`,L=document.getElementById(S);$==null||$.addEventListener("input",()=>{C($,L)}),r.addEventListener("submit",async M=>{M.preventDefault();const k=$.value.trim();if(k)try{await p.board.reply(l,k),$.value="",L==null||L.classList.add("hidden");const j=await c();I(j),v("Respuesta enviada")}catch(j){v(j.message,"error")}})}),e.querySelectorAll(".pin-msg").forEach(r=>{r.addEventListener("click",async()=>{try{await p.board.pin(r.dataset.id);const l=await c();I(l),v("Mensaje fijado")}catch(l){v(l.message,"error")}})}),e.querySelectorAll(".unpin-msg").forEach(r=>{r.addEventListener("click",async()=>{try{await p.board.pin(r.dataset.id);const l=await c();I(l),v("Mensaje desfijado")}catch(l){v(l.message,"error")}})})}function x(){e.querySelectorAll(".delete-msg").forEach(r=>{r.addEventListener("click",async()=>{if(confirm("¿Eliminar este mensaje?"))try{await p.board.delete(r.dataset.id);const l=await c();I(l),v("Mensaje eliminado")}catch(l){v(l.message,"error")}})})}function I(r){const{pinned:l=[],messages:$=[]}=r,S=document.getElementById("boardPinned");if(S)S.innerHTML=b(l);else if(l.length){u(r);return}const L=document.getElementById("boardMessages");L&&(L.innerHTML=g($)),w(),x()}e.addEventListener("click",async r=>{if(r.target.id==="prevPage"&&o>1){o--;const l=await c();I(l)}else if(r.target.id==="nextPage"&&o<d){o++;const l=await c();I(l)}});function C(r,l){if(!l||!i.length)return;const $=r.value,S=r.selectionStart,L=$.slice(0,S),M=L.match(/@(\w*)$/);if(!M){l.classList.add("hidden");return}const k=M[1].toLowerCase(),j=i.filter(B=>B.username.toLowerCase().startsWith(k)&&B.id!==(a==null?void 0:a.id));if(!j.length){l.classList.add("hidden");return}l.innerHTML=j.slice(0,6).map(B=>`<div class="mention-item" data-username="${H(B.username)}">${H(B.username)}</div>`).join(""),l.classList.remove("hidden"),l.querySelectorAll(".mention-item").forEach(B=>{B.addEventListener("mousedown",oe=>{oe.preventDefault();const re=B.dataset.username,O=L.replace(/@(\w*)$/,`@${re} `);if(r.value=O+$.slice(S),r.setSelectionRange(O.length,O.length),l.classList.add("hidden"),r.tagName==="TEXTAREA"){const F=document.getElementById("charCounter");F&&(F.textContent=`${r.value.length} / 500`)}})})}document.addEventListener("click",r=>{!r.target.closest(".board-form__input-wrap")&&!r.target.closest(".reply-form__input-wrap")&&document.querySelectorAll(".mention-dropdown").forEach(l=>l.classList.add("hidden"))},{capture:!0})}function H(e){return String(e).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;")}function Ce(e){return e.replace(/[.*+?^${}()|[\]\\]/g,"\\$&")}async function ke(e){var t,a,n,s;e.innerHTML='<div class="loading"><div class="loading__spinner"></div></div>';try{const i=y.getUser(),o=i==null?void 0:i.is_admin,[d,c]=await Promise.all([o?p.leagues.adminAll():p.leagues.all(),y.isLoggedIn()&&!o?p.leagues.my():Promise.resolve({leagues:[]})]),u=new Set(c.leagues.map(m=>m.id)),b=o?d.leagues:d.leagues.filter(m=>!u.has(m.id));e.innerHTML=`
      <div class="container">
        <h1 class="page-title">Ligas</h1>

        ${o?`
          <div class="admin-notice">Vista administrador — puedes acceder a cualquier liga sin participar en ella.</div>
        `:""}

        ${i&&!o&&c.leagues.length>0?`
          <section class="section">
            <h2>Mis ligas</h2>
            <div class="leagues-grid">${c.leagues.map(m=>Y(m,!0)).join("")}</div>
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
          ${b.length?`<div class="leagues-grid">${b.map(m=>Y(m,!1,u,o)).join("")}</div>`:o?'<p class="empty">No hay ligas creadas aún.</p>':c.leagues.length>0?'<p class="empty">Ya participas en todas las ligas disponibles.</p>':'<p class="empty">No hay ligas aún. ¡Crea la primera!</p>'}
        </section>
      </div>
    `,e.querySelectorAll('.league-card[data-navigate="true"]').forEach(m=>{m.addEventListener("click",()=>E.navigate(`/ligas/${m.dataset.id}`))}),e.querySelectorAll(".btn-join-league").forEach(m=>{m.addEventListener("click",async g=>{g.stopPropagation();const h=parseInt(m.dataset.id);m.disabled=!0,m.textContent="…";try{const{league:f}=await p.leagues.join({league_id:h});v(`¡Te has unido a "${f.name}"!`),E.navigate(`/ligas/${f.id}`)}catch(f){v(f.message,"error"),m.disabled=!1,m.textContent="Unirse"}})}),e.querySelectorAll(".btn-private-info").forEach(m=>{m.addEventListener("click",g=>{g.stopPropagation(),v("Esta liga es privada. Pide el enlace de invitación a cualquier miembro para unirte.","info")})}),(t=document.getElementById("btnShowCreate"))==null||t.addEventListener("click",()=>{var m,g;(m=document.getElementById("createLeaguePanel"))==null||m.classList.remove("hidden"),(g=document.getElementById("btnShowCreate"))==null||g.classList.add("hidden")}),(a=document.getElementById("btnCancelCreate"))==null||a.addEventListener("click",()=>{var m,g;(m=document.getElementById("createLeaguePanel"))==null||m.classList.add("hidden"),(g=document.getElementById("btnShowCreate"))==null||g.classList.remove("hidden")}),(n=document.getElementById("joinCodeForm"))==null||n.addEventListener("submit",async m=>{m.preventDefault();const g=document.getElementById("inviteCode").value.trim().toUpperCase();if(g)try{const{league:h}=await p.leagues.join({invite_code:g});v(`Te has unido a "${h.name}"`),E.navigate(`/ligas/${h.id}`)}catch(h){v(h.message,"error")}}),(s=document.getElementById("createLeagueForm"))==null||s.addEventListener("submit",async m=>{var C;m.preventDefault();const g=document.getElementById("createBtn");g.disabled=!0,g.textContent="Creando…";const h=document.getElementById("leagueName").value.trim(),f=document.getElementById("leagueDesc").value.trim(),w=document.getElementById("leaguePrize").value.trim(),x=document.getElementById("isPublic").checked,I=((C=document.getElementById("isOfficial"))==null?void 0:C.checked)??!1;try{const{league:r}=await p.leagues.create({name:h,description:f,prize:w,is_public:x,is_official:I});Be(r)}catch(r){v(r.message,"error"),g.disabled=!1,g.textContent="Crear liga"}})}catch(i){e.innerHTML=`<div class="container"><p class="form__error">Error: ${i.message}</p></div>`}}function Y(e,t=!1,a=new Set,n=!1){const s=e.is_official?'<span class="league-badge league-badge--official">⭐ Oficial</span>':"",i=e.is_public?"🌍":"🔒",o=n?`<button class="btn btn--sm btn--outline btn-admin-view" data-id="${e.id}">Ver (admin)</button>`:t?`<button class="btn btn--sm btn--outline" onclick="event.stopPropagation(); window.location.hash='/ligas/${e.id}'">Ver liga</button>`:e.is_public?`<button class="btn btn--sm btn--primary btn-join-league" data-id="${e.id}">Unirse</button>`:'<button class="btn btn--sm btn--ghost btn-private-info">🔒 Solicitar enlace</button>';return`
    <div class="league-card ${t?"league-card--mine":""}" data-id="${e.id}" data-navigate="${t||n||e.is_public}">
      <div class="league-card__top">
        <div class="league-card__name">${e.name} ${s}</div>
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
  `}function Be(e){var n,s;const t=e.invite_link||"",a=document.getElementById("createLeaguePanel");a&&(a.innerHTML=`
    <div class="invite-success">
      <div class="invite-success__title">✅ Liga "${e.name}" creada</div>
      <p class="invite-success__text">Comparte este enlace para invitar a tus amigos:</p>
      <div class="invite-link-box">
        <span class="invite-link-box__url" id="inviteLinkText">${t}</span>
        <button class="btn btn--sm btn--outline" id="btnCopyLink">Copiar</button>
      </div>
      ${navigator.share?'<button class="btn btn--primary" id="btnShare">Compartir</button>':""}
      <a href="#/ligas/${e.id}" class="btn btn--ghost">Ir a la liga</a>
    </div>
  `,(n=document.getElementById("btnCopyLink"))==null||n.addEventListener("click",async()=>{try{await navigator.clipboard.writeText(t),v("Enlace copiado")}catch{v("No se pudo copiar","error")}}),(s=document.getElementById("btnShare"))==null||s.addEventListener("click",async()=>{try{await navigator.share({title:`Únete a ${e.name} en PickGoal`,url:t})}catch{}}))}async function Pe(e,{params:t}){var n,s,i,o,d;const a=parseInt(t.id);e.innerHTML='<div class="loading"><div class="loading__spinner"></div></div>';try{const c=await p.leagues.get(a),{league:u,ranking:b,is_member:m,is_admin_view:g}=c,h=y.getUser(),f=u.is_official?'<span class="league-badge league-badge--official">⭐ Oficial</span>':"";e.innerHTML=`
      <div class="container">
        <a href="#/ligas" class="back-link">← Volver a ligas</a>

        ${g?`
          <div class="admin-notice">Vista administrador — no participas en esta liga</div>
        `:""}

        <div class="league-header">
          <h1 class="page-title">${u.name} ${f}</h1>
          ${u.description?`<p class="league-header__desc">${u.description}</p>`:""}
          <div class="league-header__meta">
            <span>${u.is_public?"🌍 Pública":"🔒 Privada"}</span>
            <span>${u.member_count} participantes</span>
            ${u.prize?`<span>🏆 ${u.prize}</span>`:""}
          </div>
        </div>

        ${(m||h!=null&&h.is_admin)&&u.invite_link?`
          <div class="invite-share-box">
            <span class="invite-share-box__label">Enlace de invitación:</span>
            <div class="invite-link-box">
              <span class="invite-link-box__url">${u.invite_link}</span>
              <button class="btn btn--sm btn--outline" id="btnCopyInvite">Copiar</button>
              ${navigator.share?'<button class="btn btn--sm btn--ghost" id="btnShareInvite">Compartir</button>':""}
            </div>
          </div>
        `:""}

        <div class="league-actions">
          ${m?'<button class="btn btn--danger btn--sm" id="btnLeave">Abandonar liga</button>':!(h!=null&&h.is_admin)&&h?'<button class="btn btn--primary" id="btnJoin">Unirse a esta liga</button>':""}
          ${h!=null&&h.is_admin||m&&h&&u.created_by===h.id?'<button class="btn btn--outline btn--sm" id="btnEditLeague">Editar liga</button>':""}
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
              ${b.map(r=>`
                <tr class="${h&&r.id===h.id?"ranking-table__row--me":""}">
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
    `,(n=document.getElementById("btnCopyInvite"))==null||n.addEventListener("click",async()=>{try{await navigator.clipboard.writeText(u.invite_link),v("Enlace copiado")}catch{v("No se pudo copiar","error")}}),(s=document.getElementById("btnShareInvite"))==null||s.addEventListener("click",async()=>{try{await navigator.share({title:`Únete a ${u.name} en PickGoal`,url:u.invite_link})}catch{}}),(i=document.getElementById("btnLeave"))==null||i.addEventListener("click",async()=>{if(confirm("¿Seguro que quieres abandonar esta liga?"))try{await p.leagues.leave(a),v("Has abandonado la liga"),E.navigate("/ligas")}catch(r){v(r.message,"error")}}),(o=document.getElementById("btnJoin"))==null||o.addEventListener("click",async()=>{try{await p.leagues.join({league_id:a}),v("¡Te has unido a la liga!"),E.navigate(`/ligas/${a}`)}catch(r){v(r.message,"error")}}),(d=document.getElementById("btnEditLeague"))==null||d.addEventListener("click",()=>{Te(u,a,h)});const w=document.getElementById("tabRanking"),x=document.getElementById("tabTablon"),I=document.getElementById("sectionRanking"),C=document.getElementById("sectionTablon");w&&x&&(w.addEventListener("click",()=>{w.classList.add("league-tab--active"),x.classList.remove("league-tab--active"),I.classList.remove("hidden"),C.classList.add("hidden")}),x.addEventListener("click",()=>{x.classList.add("league-tab--active"),w.classList.remove("league-tab--active"),I.classList.add("hidden"),C.classList.remove("hidden");const r=document.getElementById("tablonEmbed");r&&!r.dataset.loaded&&(r.dataset.loaded="1",te(r,{query:{liga:String(a)}}))}))}catch(c){e.innerHTML=`<div class="container"><p class="form__error">Error: ${c.message}</p><a href="#/ligas">Volver</a></div>`}}function Te(e,t,a){const n=document.getElementById("editLeagueModal");n&&n.remove();const s=document.createElement("div");s.id="editLeagueModal",s.className="edit-league-modal",s.innerHTML=`
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
        ${a!=null&&a.is_admin?`
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
  `,document.body.appendChild(s),requestAnimationFrame(()=>s.classList.add("edit-league-modal--open"));const i=()=>{s.classList.remove("edit-league-modal--open"),s.addEventListener("transitionend",()=>s.remove(),{once:!0})};s.querySelector(".edit-league-modal__overlay").addEventListener("click",i),document.getElementById("btnCancelEdit").addEventListener("click",i),document.getElementById("editLeagueForm").addEventListener("submit",async o=>{o.preventDefault();const d=document.getElementById("btnSaveEdit");d.disabled=!0,d.textContent="Guardando…";const c={name:document.getElementById("editName").value.trim(),description:document.getElementById("editDesc").value.trim(),prize:document.getElementById("editPrize").value.trim(),is_public:document.getElementById("editPublic").checked};a!=null&&a.is_admin&&(c.is_official=document.getElementById("editOfficial").checked);try{await p.leagues.update(t,c),v("Liga actualizada"),i(),E.navigate(`/ligas/${t}`)}catch(u){v(u.message,"error"),d.disabled=!1,d.textContent="Guardar cambios"}})}async function Me(e){var a,n;e.innerHTML='<div class="loading"><div class="loading__spinner"></div></div>';const t=y.getUser();try{const s=(()=>{const f=localStorage.getItem("activeLeagueId");return f?parseInt(f):null})(),[i,o,d,c,u]=await Promise.all([p.predictions.mine(s),p.predictions.getChampion(s),p.leagues.my(),p.auth.me(),t!=null&&t.is_admin?p.leagues.adminAll():Promise.resolve({leagues:[]})]),b=i.predictions.reduce((f,w)=>f+w.total_points,0)+(((a=o.champion_prediction)==null?void 0:a.points_earned)||0),m=c.user,g=m.status,h=m.total_points_all_time;e.innerHTML=`
      <div class="container">
        <h1 class="page-title">Mi Perfil</h1>

        <section class="profile-card section">
          <div class="profile-card__info">
            <div class="profile-card__avatar">${t.username[0].toUpperCase()}</div>
            <div>
              <h2>${t.username}</h2>
              <p>${t.email}</p>
              <p>${t.country||"Sin país"}</p>
            </div>
          </div>
          ${je(g,h)}
          <button class="btn btn--danger" id="btnLogoutPerfil">Cerrar sesión</button>
          <div class="profile-card__stats">
            <div class="stat">
              <span class="stat__value">${b}</span>
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
          ${i.predictions.length?`<div class="predictions-list">${i.predictions.map(He).join("")}</div>`:'<p class="empty">Sin predicciones aún. <a href="#/quiniela">Ir a la quiniela</a></p>'}
        </section>

        <section class="section">
          <h2>Mis ligas</h2>
          ${d.leagues.length?`<ul class="leagues-list">${d.leagues.map(f=>`<li><a href="#/ligas/${f.id}">${f.name}</a> <span class="tag">${f.is_public?"Pública":"Privada"}</span></li>`).join("")}</ul>`:'<p class="empty">No perteneces a ninguna liga. <a href="#/ligas">Ver ligas</a></p>'}
        </section>

        ${t!=null&&t.is_admin&&u.leagues.length?`
          <section class="section">
            <h2>Ligas gestionadas</h2>
            <ul class="leagues-list">
              ${u.leagues.map(f=>`
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
    `,(n=e.querySelector("#btnLogoutPerfil"))==null||n.addEventListener("click",()=>{y.logout(),window.location.hash="/"})}catch(s){e.innerHTML=`<div class="container"><p class="form__error">Error: ${s.message}</p></div>`}}function je(e,t){if(e.next_threshold===null)return`
      <div class="level-progress">
        <div class="level-progress__header">
          <span class="status-badge">${e.emoji} ${e.name}</span>
          <span class="level-progress__label">¡Nivel máximo alcanzado!</span>
        </div>
        <div class="level-progress__bar"><div class="level-progress__fill" style="width:100%"></div></div>
      </div>`;const n=Math.min(100,Math.round((t-e.threshold)/(e.next_threshold-e.threshold)*100));return`
    <div class="level-progress">
      <div class="level-progress__header">
        <span class="status-badge">${e.emoji} ${e.name}</span>
        <span class="level-progress__label">${t} / ${e.next_threshold} pts → ${e.next_emoji||""} ${e.next_name}</span>
      </div>
      <div class="level-progress__bar"><div class="level-progress__fill" style="width:${n}%"></div></div>
    </div>`}function He(e){return`
    <div class="pred-row ${e.total_points>0?"pred-row--scored":""}">
      <span class="pred-row__result">${e.predicted_result}</span>
      <span class="pred-row__score">${e.predicted_home}-${e.predicted_away}</span>
      <span class="pred-row__pts">${e.total_points} pts</span>
    </div>
  `}const W=new Date("2026-06-11T21:00:00Z"),qe=["Argentina","Brasil","Francia","España","Inglaterra","Alemania","Portugal","Países Bajos","Italia","Bélgica","Uruguay","Colombia","México","Estados Unidos","Canadá","Marruecos","Senegal","Nigeria","Japón","Corea del Sur","Australia","Arabia Saudí","Irán","Qatar","Ecuador","Chile","Perú","Venezuela","Bolivia","Paraguay","Costa Rica","Honduras","Panamá","Jamaica","Trinidad y Tobago","Guatemala","Turquía","Polonia","Croacia","Serbia","República Checa","Eslovaquia","Austria","Suiza","Dinamarca","Suecia","Noruega","Escocia","Ucrania","Rumanía","Hungría","Grecia","Egipto","Camerún","Ghana","Costa de Marfil","Túnez","Argelia","China","India","Irak","Uzbekistán","Nueva Zelanda","Fiji"];function Ae(){const e=localStorage.getItem("activeLeagueId");return e?parseInt(e):null}async function se(e){var t;if(!y.isLoggedIn()){e.innerHTML='<div class="container"><p class="notice"><a href="#/login">Inicia sesión</a> para predecir el campeón.</p></div>';return}e.innerHTML='<div class="loading"><div class="loading__spinner"></div></div>';try{const a=Ae(),{champion_prediction:n}=await p.predictions.getChampion(a),s=new Date>=W;let i;n&&s?i=`
        <div class="champion-result">
          <p>Tu predicción: <strong class="champion-result__team">${n.team_name}</strong></p>
          <p>Puntos ganados: <strong>${n.points_earned}</strong></p>
          <p class="notice">🔒 El torneo ha comenzado, tu predicción está bloqueada.</p>
        </div>
      `:!n&&s?i=`
        <p class="notice notice--warning">⚠️ El torneo ya ha comenzado. Una vez confirmado no podrás cambiarlo.</p>
        ${U(null)}
      `:n&&!s?i=`
        <p class="notice">Puedes cambiar tu predicción hasta el inicio del torneo.</p>
        ${U(n.team_name)}
      `:i=U(null),e.innerHTML=`
      <div class="container">
        <h1 class="page-title">🏆 Predice el Campeón</h1>
        <p class="champion-desc">
          Acertar el campeón del mundo vale <strong>10 puntos extra</strong>.
          Puedes modificar tu elección hasta el inicio del torneo
          (${W.toLocaleDateString("es-ES",{day:"numeric",month:"long",year:"numeric",hour:"2-digit",minute:"2-digit"})}).
        </p>
        ${i}
      </div>
    `,(t=document.getElementById("championForm"))==null||t.addEventListener("submit",async o=>{o.preventDefault();const d=document.getElementById("champBtn"),c=document.getElementById("champError"),u=document.getElementById("teamSearch").value.trim();if(u){d.disabled=!0,d.textContent="Guardando…",c.classList.add("hidden");try{await p.predictions.saveChampion(u,a),v(`¡${u} guardado como campeón!`),se(e)}catch(b){c.textContent=b.message,c.classList.remove("hidden"),d.disabled=!1,d.textContent=d.dataset.label||"Confirmar predicción"}}})}catch(a){e.innerHTML=`<div class="container"><p class="form__error">Error: ${a.message}</p></div>`}}function U(e){const t=e?"Actualizar predicción":"Confirmar predicción";return`
    <form class="form champion-form" id="championForm">
      <div class="form__group">
        <label class="form__label" for="teamSearch">Selecciona el equipo campeón</label>
        <input class="form__input" type="text" id="teamSearch"
          placeholder="Escribe para buscar…"
          list="teamsList" autocomplete="off"
          value="${e??""}" required />
        <datalist id="teamsList">
          ${qe.map(a=>`<option value="${a}">`).join("")}
        </datalist>
      </div>
      <p id="champError" class="form__error hidden"></p>
      <button class="btn btn--primary" type="submit" id="champBtn" data-label="${t}">
        ${t}
      </button>
    </form>
  `}async function Ne(e){if(!y.isAdmin()){e.innerHTML='<div class="container"><p class="form__error">Acceso denegado.</p></div>';return}e.innerHTML='<div class="loading"><div class="loading__spinner"></div></div>';try{const{users:t}=await p.auth.users();e.innerHTML=`
      <div class="container">
        <h1 class="page-title">Panel de Administración</h1>

        <section class="section admin-section">
          <h2>Scheduler</h2>
          <p>El scheduler sincroniza el calendario cada 24h y actualiza partidos en vivo cada 5 min.</p>
          <button class="btn btn--primary" id="btnSync">Sincronizar ahora</button>
          <div id="syncResult"></div>
        </section>

        <section class="section admin-section">
          <h2>Premiar campeón</h2>
          <form class="form form--inline" id="awardForm">
            <input class="form__input" type="text" id="winnerTeam" placeholder="Equipo campeón" />
            <button class="btn btn--primary" type="submit">Premiar (+10 pts)</button>
          </form>
        </section>

        <section class="section admin-section">
          <h2>Usuarios (${t.length})</h2>
          <table class="admin-table">
            <thead>
              <tr>
                <th>ID</th><th>Usuario</th><th>Email</th><th>País</th><th>Admin</th><th>Acción</th>
              </tr>
            </thead>
            <tbody id="usersTableBody">
              ${t.map(De).join("")}
            </tbody>
          </table>
        </section>
      </div>
    `,document.getElementById("btnSync").addEventListener("click",async()=>{const a=document.getElementById("syncResult");a.textContent="Sincronizando…";try{await p.matches.sync(),a.textContent="✓ Sincronización completada",v("Sincronización completada")}catch(n){a.textContent=`Error: ${n.message}`,v(n.message,"error")}}),document.getElementById("awardForm").addEventListener("submit",async a=>{a.preventDefault();const n=document.getElementById("winnerTeam").value.trim();if(n)try{const{message:s}=await p.predictions.awardChampion(n);v(s)}catch(s){v(s.message,"error")}}),document.getElementById("usersTableBody").addEventListener("click",async a=>{const n=a.target.closest(".toggle-admin");if(!n)return;const s=parseInt(n.dataset.id);try{const{user:i}=await p.auth.toggleAdmin(s);n.closest("tr").querySelector(".admin-badge").textContent=i.is_admin?"Sí":"No",v(`${i.username} ${i.is_admin?"ahora es admin":"ya no es admin"}`)}catch(i){v(i.message,"error")}})}catch(t){e.innerHTML=`<div class="container"><p class="form__error">Error: ${t.message}</p></div>`}}function De(e){return`
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
  `}function Oe(e){e.innerHTML=`
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
  `,document.getElementById("forgotForm").addEventListener("submit",async t=>{t.preventDefault();const a=document.getElementById("forgotBtn"),n=document.getElementById("forgotMsg"),s=document.getElementById("email").value.trim();a.disabled=!0,a.textContent="Enviando…";try{await p.auth.forgotPassword(s),n.textContent="Si el email existe, recibirás un enlace en breve.",n.classList.remove("hidden","form__error"),n.classList.add("form__success")}catch{v("Error al enviar el email","error")}finally{a.disabled=!1,a.textContent="Enviar enlace"}})}function Re(e,{query:t}){const a=t.token||"";if(!a){e.innerHTML='<div class="container"><p class="form__error">Token inválido o expirado.</p><a href="#/login">Volver</a></div>';return}e.innerHTML=`
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
  `,document.getElementById("resetForm").addEventListener("submit",async n=>{n.preventDefault();const s=document.getElementById("resetBtn"),i=document.getElementById("resetError"),o=document.getElementById("password").value;s.disabled=!0,s.textContent="Guardando…",i.classList.add("hidden");try{await p.auth.resetPassword(a,o),v("Contraseña actualizada. Ya puedes iniciar sesión."),E.navigate("/login")}catch(d){i.textContent=d.message||"Error al restablecer la contraseña",i.classList.remove("hidden")}finally{s.disabled=!1,s.textContent="Guardar contraseña"}})}const Ue={r32:"Dieciseisavos",r16:"Octavos",quarters:"Cuartos",semis:"Semis",third:"3º y 4º",final:"Final"};async function Ge(e){e.innerHTML='<div class="loading"><div class="loading__spinner"></div></div>';try{const{groups:t}=await p.matches.grouped();e.innerHTML=`
      <div class="container">
        <h1 class="page-title">Resultados — Mundial 2026</h1>
        <nav class="phase-nav" id="phaseNav"></nav>
        <div id="phaseContent"></div>
      </div>
    `,Fe(t)}catch(t){e.innerHTML=`<div class="container"><p class="form__error">Error cargando los partidos: ${t.message}</p></div>`}}function Fe(e){var i;const t=document.getElementById("phaseNav");if(!t)return;const a=e.filter(o=>o.phase==="group"),n=e.filter(o=>o.phase!=="group"),s=[...a.map(o=>({key:`group_${o.group_name}`,label:`Grupo ${o.group_name}`,data:o,isGroup:!0})),...n.map(o=>({key:o.phase,label:Ue[o.phase]||o.label,data:o,isGroup:!1}))];s.length!==0&&(t.innerHTML=s.map((o,d)=>`
    <button class="phase-nav__btn ${d===0?"phase-nav__btn--active":""}" data-key="${o.key}">
      ${o.label}
    </button>
  `).join(""),(i=t.querySelector(".phase-nav__btn--active"))==null||i.scrollIntoView({inline:"center",behavior:"instant",block:"nearest"}),t.querySelectorAll(".phase-nav__btn").forEach((o,d)=>{o.addEventListener("click",()=>{t.querySelectorAll(".phase-nav__btn").forEach(u=>u.classList.remove("phase-nav__btn--active")),o.classList.add("phase-nav__btn--active");const c=s.find(u=>u.key===o.dataset.key);c&&K(c.data,c.isGroup)})}),K(s[0].data,s[0].isGroup))}function K(e,t){const a=document.getElementById("phaseContent");if(!a)return;const n=ze(e.matches);if(t){const s=Je(e.matches);a.innerHTML=`
      <div class="resultados-section">
        <div class="resultados-matches">${n}</div>
        <div class="standings">
          <h3 class="standings__title">Clasificación — Grupo ${e.group_name}</h3>
          ${Ve(s)}
        </div>
      </div>
    `}else a.innerHTML=`<div class="resultados-matches">${n}</div>`}function ze(e){return!e||e.length===0?'<p class="empty">Sin partidos en esta fase.</p>':e.map(t=>{const a={scheduled:"Programado",live:"🔴 En juego",finished:"Finalizado"}[t.status]||t.status,n=t.status!=="scheduled"?`<span class="res-score">${t.home_score_90??"?"} - ${t.away_score_90??"?"}</span>`:'<span class="res-score res-score--pending">vs</span>';return`
      <div class="res-match ${t.status==="finished"?"res-match--finished":""} ${t.status==="live"?"res-match--live":""}">
        <div class="res-match__meta">
          <span class="res-match__status">${a}</span>
          <span class="res-match__date">${T(t.match_datetime)}</span>
        </div>
        <div class="res-match__teams">
          <span class="res-match__team res-match__team--home">${t.home_team}</span>
          ${n}
          <span class="res-match__team res-match__team--away">${t.away_team}</span>
        </div>
      </div>
    `}).join("")}function Je(e){const t={};for(const a of e)if(t[a.home_team]||(t[a.home_team]={name:a.home_team,pj:0,g:0,e:0,p:0,gf:0,gc:0,pts:0}),t[a.away_team]||(t[a.away_team]={name:a.away_team,pj:0,g:0,e:0,p:0,gf:0,gc:0,pts:0}),a.status==="finished"&&a.home_score_90!==null&&a.away_score_90!==null){const n=t[a.home_team],s=t[a.away_team];n.pj++,s.pj++,n.gf+=a.home_score_90,n.gc+=a.away_score_90,s.gf+=a.away_score_90,s.gc+=a.home_score_90,a.home_score_90>a.away_score_90?(n.g++,n.pts+=3,s.p++):a.home_score_90<a.away_score_90?(s.g++,s.pts+=3,n.p++):(n.e++,n.pts++,s.e++,s.pts++)}return Object.values(t).sort((a,n)=>{if(n.pts!==a.pts)return n.pts-a.pts;const s=n.gf-n.gc,i=a.gf-a.gc;return s!==i?s-i:n.gf-a.gf})}function Ve(e){return e.length===0?'<p class="empty">Sin datos de clasificación.</p>':`
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
      <tbody>${e.map((a,n)=>`
    <tr class="${n<3?"standings__row--qualify":""}">
      <td class="standings__pos">${n+1}</td>
      <td class="standings__team">${a.name}</td>
      <td>${a.pj}</td>
      <td>${a.g}</td>
      <td>${a.e}</td>
      <td>${a.p}</td>
      <td>${a.gf}</td>
      <td>${a.gc}</td>
      <td class="standings__pts">${a.pts}</td>
    </tr>
  `).join("")}</tbody>
    </table>
  `}async function Xe(e,{query:t}){const a=(t.codigo||"").trim().toUpperCase();if(!a){e.innerHTML='<div class="container"><p class="form__error">Enlace de invitación inválido.</p><a href="#/ligas">Ver ligas</a></div>';return}if(!y.isLoggedIn()){sessionStorage.setItem("pendingInviteCode",a),E.navigate("/register");return}e.innerHTML='<div class="loading"><div class="loading__spinner"></div></div>';try{const{league:n}=await p.leagues.joinByCode(a);v(`¡Te has unido a "${n.name}"!`),E.navigate(`/ligas/${n.id}`)}catch(n){if(n.status===409){v("Ya eres miembro de esta liga");try{const{leagues:s}=await p.leagues.my(),i=s.find(o=>o.invite_code===a);if(i){E.navigate(`/ligas/${i.id}`);return}}catch{}}e.innerHTML=`
      <div class="container">
        <div class="league-gate">
          <div class="league-gate__icon">⚠️</div>
          <h2 class="league-gate__title">Error al unirse</h2>
          <p class="league-gate__text">${n.message}</p>
          <a href="#/ligas" class="btn btn--primary">Ver ligas</a>
        </div>
      </div>
    `}}function Ye(){const e=localStorage.getItem("activeLeagueId");return e?parseInt(e):null}async function We(e,{params:t}){const a=parseInt(t.id);if(!a){e.innerHTML='<div class="container"><p class="form__error">Usuario no válido.</p></div>';return}e.innerHTML='<div class="loading"><div class="loading__spinner"></div></div>';try{const n=Ye(),{user:s,predictions:i}=await p.predictions.forUser(a,n);e.innerHTML=`
      <div class="container">
        <a class="jugador__back" href="#/ranking">← Tabla</a>

        <div class="jugador__header">
          <div class="jugador__avatar">${s.username.charAt(0).toUpperCase()}</div>
          <div class="jugador__info">
            <h1 class="jugador__name">${s.username}</h1>
            ${s.country?`<span class="jugador__country">${s.country}</span>`:""}
          </div>
        </div>

        <div class="jugador__stats">
          <div class="jugador__stat">
            <span class="jugador__stat-val">${s.total_points}</span>
            <span class="jugador__stat-label">Puntos</span>
          </div>
          <div class="jugador__stat">
            <span class="jugador__stat-val">${s.correct_results}</span>
            <span class="jugador__stat-label">1X2 acertados</span>
          </div>
          <div class="jugador__stat">
            <span class="jugador__stat-val">${s.exact_scores}</span>
            <span class="jugador__stat-label">Exactos</span>
          </div>
        </div>

        <h2 class="jugador__section-title">Predicciones en partidos jugados</h2>

        ${i.length===0?'<p class="empty">Sin pronósticos en partidos finalizados.</p>':`<div class="jugador__pred-list">
              ${i.map(o=>Ke(o)).join("")}
            </div>`}
      </div>
    `}catch(n){e.innerHTML=`<div class="container"><p class="form__error">Error: ${n.message}</p></div>`}}function Ke(e){const t=e.match,a=e.total_points,n=e.pts_score>0,s=e.pts_result>0;let i="";return n?i='<span class="jugador__badge jugador__badge--exact">Exacto</span>':s?i='<span class="jugador__badge jugador__badge--ok">1X2 ✓</span>':i='<span class="jugador__badge jugador__badge--miss">Fallo</span>',`
    <div class="jugador__pred-row">
      <div class="jugador__pred-match">
        <span class="jugador__pred-teams">${t.home_team} vs ${t.away_team}</span>
        <span class="jugador__pred-date">${T(t.match_datetime)}</span>
      </div>
      <div class="jugador__pred-scores">
        <span class="jugador__pred-real">${t.home_score_90} - ${t.away_score_90}</span>
        <span class="jugador__pred-arrow">→</span>
        <span class="jugador__pred-pick">${e.predicted_home} - ${e.predicted_away}</span>
      </div>
      <div class="jugador__pred-right">
        ${i}
        <span class="jugador__pred-pts">${a>0?`+${a}`:"0"} pts</span>
      </div>
    </div>
  `}const Qe={"/":ce,"/login":be,"/register":fe,"/quiniela":ye,"/resultados":Ge,"/ranking":xe,"/tablon":te,"/ligas":ke,"/ligas/:id":Pe,"/perfil":Me,"/campeon":se,"/admin":Ne,"/forgot-password":Oe,"/reset-password":Re,"/unirse":Xe,"/jugador/:id":We};function Ze(e){for(const[t,a]of Object.entries(Qe)){const n=[],s=new RegExp("^"+t.replace(/:([^/]+)/g,(o,d)=>(n.push(d),"([^/]+)"))+"$"),i=e.match(s);if(i){const o={};return n.forEach((d,c)=>{o[d]=i[c+1]}),{handler:a,params:o}}}return null}const Q=()=>document.getElementById("mainContent"),E={init(){window.addEventListener("hashchange",()=>this.resolve()),this.resolve()},navigate(e){window.location.hash=e},resolve(){const e=window.location.hash.slice(1)||"/",[t,a]=e.split("?"),n=Object.fromEntries(new URLSearchParams(a||"")),s=Ze(t);if(!s){Q().innerHTML='<div class="error-page"><h2>Página no encontrada</h2><a href="#/">Volver al inicio</a></div>';return}const{handler:i,params:o}=s;if(["/perfil","/campeon","/admin"].includes(t)&&!y.isLoggedIn()){this.navigate("/login");return}if(t==="/admin"&&!y.isAdmin()){this.navigate("/");return}const c=Q();c.innerHTML='<div class="loading"><div class="loading__spinner"></div></div>',i(c,{params:o,query:n})}};let D=[],N=null,q=null;async function ea(){await y.init(),E.init(),sa(),aa()}function ne(){return localStorage.getItem("pwa_installed")==="true"||window.matchMedia("(display-mode: standalone)").matches||window.navigator.standalone===!0}function aa(){window.addEventListener("beforeinstallprompt",e=>{e.preventDefault(),!ne()&&(N=e,ta())}),window.addEventListener("appinstalled",()=>{var e;localStorage.setItem("pwa_installed","true"),N=null,(e=document.getElementById("installBanner"))==null||e.remove()})}function ta(){if(ne()||sessionStorage.getItem("installBannerDismissed"))return;const e=document.createElement("div");e.id="installBanner",e.className="install-banner",e.innerHTML=`
    <span class="install-banner__text">⚽ Instala PickGoal en tu dispositivo</span>
    <div class="install-banner__actions">
      <button class="install-banner__btn install-banner__btn--primary" id="installBtn">Instalar</button>
      <button class="install-banner__btn install-banner__btn--ghost" id="installDismissBtn">Ahora no</button>
    </div>
  `,document.body.appendChild(e),document.getElementById("installBtn").addEventListener("click",async()=>{N&&(N.prompt(),await N.userChoice,N=null,e.remove())}),document.getElementById("installDismissBtn").addEventListener("click",()=>{sessionStorage.setItem("installBannerDismissed","1"),e.remove()})}function A(){var e,t;(e=document.getElementById("userDropdown"))==null||e.classList.add("hidden"),(t=document.getElementById("userBtn"))==null||t.classList.remove("navbar__dropdown-btn--open")}async function G(){const e=document.getElementById("tablonBadge");if(!e)return;if(!y.getUser()){e.classList.add("hidden");return}const a=localStorage.getItem("activeLeagueId");if(!a){e.classList.add("hidden");return}const n=localStorage.getItem(`tablon_last_read_${a}`)||new Date(0).toISOString();try{const{count:s}=await p.board.unread(parseInt(a),n);s>0?(e.textContent=s>99?"99+":String(s),e.classList.remove("hidden")):e.classList.add("hidden")}catch{e.classList.add("hidden")}}function sa(){var e,t,a;document.addEventListener("auth:change",Z),window.addEventListener("hashchange",()=>{A(),ie(),setTimeout(G,200)}),document.addEventListener("click",A),(e=document.getElementById("userBtn"))==null||e.addEventListener("click",n=>{var o;n.stopPropagation();const s=document.getElementById("userDropdown"),i=s==null?void 0:s.classList.contains("hidden");A(),i&&(s==null||s.classList.remove("hidden"),(o=document.getElementById("userBtn"))==null||o.classList.add("navbar__dropdown-btn--open"))}),(t=document.getElementById("userDropdown"))==null||t.addEventListener("click",n=>{n.stopPropagation(),n.target.closest("#navProfileLink")&&A()}),(a=document.getElementById("navLogoutBtn"))==null||a.addEventListener("click",()=>{D=[],localStorage.removeItem("activeLeagueId"),A(),y.logout(),E.navigate("/")}),Z()}async function Z(){const e=document.getElementById("navAuthLinks"),t=document.getElementById("userBtn"),a=document.getElementById("navUsername"),n=document.getElementById("bottomNav"),s=y.getUser();if(A(),s){e==null||e.classList.add("hidden"),a&&(a.textContent=s.username),t.style.visibility="visible",n==null||n.classList.remove("hidden"),document.body.classList.add("has-bottom-nav");try{const{leagues:i}=s.is_admin?await p.leagues.adminAll():await p.leagues.my();D=i}catch{D=[]}na(D),G(),q&&clearInterval(q),q=setInterval(G,5*60*1e3)}else e==null||e.classList.remove("hidden"),t.style.visibility="hidden",n==null||n.classList.add("hidden"),document.body.classList.remove("has-bottom-nav"),D=[],localStorage.removeItem("activeLeagueId"),q&&(clearInterval(q),q=null);ie()}function na(e){let t=localStorage.getItem("activeLeagueId"),a=e.find(n=>String(n.id)===String(t));!a&&e.length>0&&(a=e[0],localStorage.setItem("activeLeagueId",String(a.id))),a||localStorage.removeItem("activeLeagueId")}function ie(){const e=window.location.hash.slice(1).split("?")[0]||"/";document.querySelectorAll(".bottom-nav__item").forEach(t=>{const a=t.dataset.route,n=a==="/"?e==="/":e===a||e.startsWith(a+"/");t.classList.toggle("bottom-nav__item--active",n)})}ea();
