(function(){const a=document.createElement("link").relList;if(a&&a.supports&&a.supports("modulepreload"))return;for(const s of document.querySelectorAll('link[rel="modulepreload"]'))n(s);new MutationObserver(s=>{for(const i of s)if(i.type==="childList")for(const o of i.addedNodes)o.tagName==="LINK"&&o.rel==="modulepreload"&&n(o)}).observe(document,{childList:!0,subtree:!0});function t(s){const i={};return s.integrity&&(i.integrity=s.integrity),s.referrerPolicy&&(i.referrerPolicy=s.referrerPolicy),s.crossOrigin==="use-credentials"?i.credentials="include":s.crossOrigin==="anonymous"?i.credentials="omit":i.credentials="same-origin",i}function n(s){if(s.ep)return;s.ep=!0;const i=t(s);fetch(s.href,i)}})();const z="https://pickgoal-backend.onrender.com/api";function R(){return localStorage.getItem("token")}async function u(e,a={}){const t={"Content-Type":"application/json",...a.headers},n=R();n&&(t.Authorization=`Bearer ${n}`);const s=await fetch(`${z}${e}`,{...a,headers:t}),i=await s.json().catch(()=>({}));if(!s.ok)throw{status:s.status,message:i.error||"Error desconocido"};return i}const p={get:e=>u(e),post:(e,a)=>u(e,{method:"POST",body:JSON.stringify(a)}),patch:(e,a)=>u(e,{method:"PATCH",body:JSON.stringify(a)}),delete:e=>u(e,{method:"DELETE"}),auth:{register:e=>u("/auth/register",{method:"POST",body:JSON.stringify(e)}),login:e=>u("/auth/login",{method:"POST",body:JSON.stringify(e)}),me:()=>u("/auth/me"),forgotPassword:e=>u("/auth/forgot-password",{method:"POST",body:JSON.stringify({email:e})}),resetPassword:(e,a)=>u("/auth/reset-password",{method:"POST",body:JSON.stringify({token:e,password:a})}),ranking:e=>u(`/auth/ranking${e?`?league_id=${e}`:""}`),users:()=>u("/auth/users"),toggleAdmin:e=>u(`/auth/users/${e}/toggle-admin`,{method:"PATCH"})},matches:{grouped:()=>u("/matches/grouped"),list:(e="")=>u(`/matches/${e}`),get:e=>u(`/matches/${e}`),sync:()=>u("/matches/sync",{method:"POST"})},predictions:{mine:e=>u(`/predictions/${e?`?league_id=${e}`:""}`),forMatch:(e,a)=>u(`/predictions/match/${e}${a?`?league_id=${a}`:""}`),save:e=>u("/predictions/",{method:"POST",body:JSON.stringify(e)}),forUser:(e,a)=>u(`/predictions/user/${e}${a?`?league_id=${a}`:""}`),getChampion:e=>u(`/predictions/champion${e?`?league_id=${e}`:""}`),saveChampion:(e,a)=>u("/predictions/champion",{method:"POST",body:JSON.stringify({team_name:e,league_id:a??null})}),awardChampion:e=>u("/predictions/champion/award",{method:"POST",body:JSON.stringify({team_name:e})})},leagues:{all:()=>u("/leagues/all"),public:()=>u("/leagues/public"),my:()=>u("/leagues/my"),create:e=>u("/leagues/",{method:"POST",body:JSON.stringify(e)}),join:e=>u("/leagues/join",{method:"POST",body:JSON.stringify(e)}),joinByCode:e=>u(`/leagues/join/${encodeURIComponent(e)}`),get:e=>u(`/leagues/${e}`),leave:e=>u(`/leagues/${e}/leave`,{method:"DELETE"}),matchPredictions:(e,a)=>u(`/leagues/${e}/predictions/${a}`)},home:{summary:()=>u("/home/summary")},board:{messages:(e=1)=>u(`/board/?page=${e}`),post:e=>u("/board/",{method:"POST",body:JSON.stringify({message:e})}),delete:e=>u(`/board/${e}`,{method:"DELETE"})}};let $=null;const v={async init(){if(localStorage.getItem("token"))try{const{user:a}=await p.auth.me();$=a}catch{localStorage.removeItem("token")}},setUser(e,a){$=e,localStorage.setItem("token",a),document.dispatchEvent(new CustomEvent("auth:change",{detail:e}))},logout(){$=null,localStorage.removeItem("token"),document.dispatchEvent(new CustomEvent("auth:change",{detail:null}))},getUser(){return $},isLoggedIn(){return!!$},isAdmin(){return($==null?void 0:$.is_admin)===!0}};let C=null;function m(e,a="success"){let t=document.getElementById("toast");t||(t=document.createElement("div"),t.id="toast",document.body.appendChild(t)),t.textContent=e,t.className=`toast toast--${a} toast--visible`,C&&clearTimeout(C),C=setTimeout(()=>{t.classList.remove("toast--visible")},3e3)}function A(){return`
    <div class="container">
      <div class="league-gate">
        <div class="league-gate__icon">⚽</div>
        <h2 class="league-gate__title">¡Inicia tu Liga!</h2>
        <p class="league-gate__text">Únete a una liga para empezar a predecir</p>
        <a href="#/ligas" class="btn btn--primary">Ver ligas disponibles</a>
      </div>
    </div>
  `}function w(e){return e?new Date(e).toLocaleString("es-ES",{day:"2-digit",month:"2-digit",year:"numeric",hour:"2-digit",minute:"2-digit"}):"—"}async function J(e){if(!v.getUser()){V(e);return}e.innerHTML='<div class="loading"><div class="loading__spinner"></div></div>';try{const{leagues_summary:t,upcoming_matches:n}=await p.home.summary();if(t.length===0){X(e);return}const s=(()=>{const o=localStorage.getItem("activeLeagueId");return o?parseInt(o):null})(),i=[...t].sort((o,r)=>o.league_id===s?-1:r.league_id===s?1:0);e.innerHTML=`
      <div class="home-dashboard container">
        <div class="home-dashboard__topbar">
          <button class="btn btn--ghost btn--sm" id="btnPointsInfo">📊 Sistema de puntos</button>
        </div>
        <div class="home-dashboard__leagues">
          ${i.map(o=>K(o)).join("")}
        </div>
        ${Z(n)}
      </div>
      ${Q()}
    `,W(e)}catch(t){e.innerHTML=`<div class="container"><p class="form__error">Error cargando el inicio: ${t.message}</p></div>`}}function V(e){e.innerHTML=`
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
  `}function X(e){e.innerHTML=`
    <section class="hero">
      <div class="hero__content">
        <img src="/assets/logo-completo.jpg" alt="PickGoal" class="hero__logo-img" />
        <p class="hero__subtitle">Únete a una liga y empieza a predecir el Mundial 2026</p>
        <div class="hero__cta">
          <a href="#/ligas" class="btn btn--primary btn--lg">Unirse a una liga</a>
        </div>
      </div>
    </section>
  `}function Y(e){return`${e}º`}function K(e){const a=e.next_to_predict?`<div class="league-card__next">
         <span class="league-card__next-label">Próximo a predecir</span>
         <span class="league-card__next-match">${e.next_to_predict.home_team} vs ${e.next_to_predict.away_team}</span>
         <span class="league-card__next-date">${w(e.next_to_predict.match_datetime)}</span>
       </div>`:`<div class="league-card__next league-card__next--done">
         Todos los partidos predichos
       </div>`;return`
    <div class="league-card">
      <div class="league-card__header">
        <h2 class="league-card__name">${e.league_name}</h2>
        <span class="league-card__rank">${Y(e.rank)} de ${e.member_count}</span>
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
      ${a}
      <a class="league-card__cta btn btn--ghost btn--sm" href="#/ranking">Ver clasificación</a>
    </div>
  `}function Q(){return`
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
  `}function W(e){const a=e.querySelector("#pointsModal"),t=e.querySelector("#btnPointsInfo"),n=e.querySelector("#pointsClose"),s=e.querySelector("#pointsOverlay");function i(){a.classList.add("points-modal--open"),document.body.style.overflow="hidden"}function o(){a.classList.remove("points-modal--open"),document.body.style.overflow=""}t==null||t.addEventListener("click",i),n==null||n.addEventListener("click",o),s==null||s.addEventListener("click",o),document.addEventListener("keydown",r=>{r.key==="Escape"&&o()},{once:!1})}function Z(e){return e.length?`
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
              <span class="upcoming-match__date">${w(a.match_datetime)}</span>
              ${t?'<span class="upcoming-match__badge upcoming-match__badge--done">Predicho</span>':'<span class="upcoming-match__badge upcoming-match__badge--pending">Sin predecir</span>'}
            </div>
          </div>
        `).join("")}
      </div>
      <a class="btn btn--ghost btn--sm" href="#/quiniela">Ver todos los pronósticos</a>
    </section>
  `:""}const P="pickgoal_welcome_shown";function D(e="/ligas"){if(localStorage.getItem(P))return;localStorage.setItem(P,"1");const a=document.createElement("div");a.innerHTML=`
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
  `;const t=a.firstElementChild;document.body.appendChild(t),document.body.style.overflow="hidden",requestAnimationFrame(()=>t.classList.add("welcome-modal--open"));function n(s){t.classList.remove("welcome-modal--open"),document.body.style.overflow="",t.addEventListener("transitionend",()=>t.remove(),{once:!0}),s&&(window.location.hash=s)}document.getElementById("welcomeOverlay").addEventListener("click",()=>n()),document.getElementById("welcomeCta").addEventListener("click",()=>n(e)),document.addEventListener("keydown",function s(i){i.key==="Escape"&&(n(),document.removeEventListener("keydown",s))})}function ee(e){e.innerHTML=`
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
  `,document.getElementById("loginForm").addEventListener("submit",async a=>{a.preventDefault();const t=document.getElementById("loginBtn"),n=document.getElementById("loginError"),s=document.getElementById("identifier").value.trim(),i=document.getElementById("password").value;t.disabled=!0,t.textContent="Entrando…",n.classList.add("hidden");try{const{token:o,user:r}=await p.auth.login({identifier:s,password:i});v.setUser(r,o),m(`¡Bienvenido, ${r.username}!`),b.navigate("/quiniela"),D("/quiniela")}catch(o){n.textContent=o.message||"Error al iniciar sesión",n.classList.remove("hidden")}finally{t.disabled=!1,t.textContent="Entrar"}})}function ae(e){e.innerHTML=`
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
  `,document.getElementById("registerForm").addEventListener("submit",async a=>{a.preventDefault();const t=document.getElementById("registerBtn"),n=document.getElementById("registerError");t.disabled=!0,t.textContent="Creando cuenta…",n.classList.add("hidden");const s={username:document.getElementById("username").value.trim(),email:document.getElementById("email").value.trim(),country:document.getElementById("country").value.trim(),password:document.getElementById("password").value};try{const{token:i,user:o}=await p.auth.register(s);v.setUser(o,i),m("¡Cuenta creada! Bienvenido a PickGoal");const r=sessionStorage.getItem("pendingInviteCode");if(r){sessionStorage.removeItem("pendingInviteCode");try{const{league:c}=await p.leagues.joinByCode(r);m(`¡Te has unido a "${c.name}"!`),b.navigate(`/ligas/${c.id}`)}catch{b.navigate("/ligas")}}else b.navigate("/campeon"),D("/ligas")}catch(i){n.textContent=i.message||"Error al registrarse",n.classList.remove("hidden")}finally{t.disabled=!1,t.textContent="Crear cuenta"}})}function te(){const e=localStorage.getItem("activeLeagueId");return e?parseInt(e):null}async function se(e){e.innerHTML='<div class="loading"><div class="loading__spinner"></div></div>';try{if(v.isLoggedIn()){const{leagues:l}=await p.leagues.my();if(l.length===0){e.innerHTML=A();return}}const a=te(),[{groups:t},n]=await Promise.all([p.matches.grouped(),v.isLoggedIn()?p.predictions.mine(a):Promise.resolve({predictions:[]})]),s={};for(const l of n.predictions)s[l.match_id]=l;const i=t.flatMap(l=>l.matches),o=new Map;for(const l of i){const g=T(l.match_datetime);o.has(g)||o.set(g,[]),o.get(g).push(l)}const r=[...o.keys()].sort(),c=T(new Date().toISOString()),d=r.find(l=>l>=c)??r[0];e.innerHTML=`
      <div class="container">
        <h1 class="page-title">Pronósticos — Mundial 2026</h1>
        ${v.isLoggedIn()?"":'<p class="notice">⚠️ <a href="#/login">Inicia sesión</a> para guardar tus predicciones.</p>'}
        <nav class="date-nav" id="dateNav"></nav>
        <div id="matchesContent"></div>
      </div>
    `,ne(r,d,o,s,a)}catch(a){e.innerHTML=`<div class="container"><p class="form__error">Error cargando los partidos: ${a.message}</p></div>`}}function ne(e,a,t,n,s){var o;const i=document.getElementById("dateNav");i&&(i.innerHTML=e.map(r=>`
    <button class="date-nav__btn ${r===a?"date-nav__btn--active":""}" data-day="${r}">
      ${ie(r)}
    </button>
  `).join(""),(o=i.querySelector(".date-nav__btn--active"))==null||o.scrollIntoView({inline:"center",behavior:"instant",block:"nearest"}),i.querySelectorAll(".date-nav__btn").forEach(r=>{r.addEventListener("click",()=>{i.querySelectorAll(".date-nav__btn").forEach(c=>c.classList.remove("date-nav__btn--active")),r.classList.add("date-nav__btn--active"),k(t.get(r.dataset.day)??[],n,s)})}),k(t.get(a)??[],n,s))}function k(e,a,t){const n=document.getElementById("matchesContent");if(n){if(e.length===0){n.innerHTML='<p class="empty">Sin partidos este día.</p>';return}n.innerHTML=`<div class="matches-grid">${e.map(s=>oe(s,a[s.id])).join("")}</div>`,v.isLoggedIn()&&n.querySelectorAll(".prediction-form").forEach(s=>{le(s,a,t)})}}function T(e){const a=new Date(e);return`${a.getFullYear()}-${String(a.getMonth()+1).padStart(2,"0")}-${String(a.getDate()).padStart(2,"0")}`}function ie(e){const[a,t,n]=e.split("-").map(Number);return new Date(a,t-1,n).toLocaleDateString("es-ES",{day:"numeric",month:"short"})}function oe(e,a){const t=e.is_locked,n=a?`<span class="pts-badge">${a.total_points} pts</span>`:"",s={scheduled:"Programado",live:"🔴 En juego",finished:"Finalizado"}[e.status];return`
    <div class="match-card ${t?"match-card--locked":""}" data-match-id="${e.id}">
      <div class="match-card__header">
        <span class="match-card__status">${s}</span>
        <span class="match-card__date">${w(e.match_datetime)}</span>
        ${n}
      </div>
      <div class="match-card__teams">
        <span class="team team--home">${e.home_team}</span>
        <div class="match-card__score">
          ${e.status!=="scheduled"?`<span class="score">${e.home_score_90??"?"} - ${e.away_score_90??"?"}</span>`:'<span class="score score--dash">vs</span>'}
        </div>
        <span class="team team--away">${e.away_team}</span>
      </div>
      ${!t&&v.isLoggedIn()?re(e,a):t&&a?`<div class="prediction-result">
               Tu predicción: <strong>${a.predicted_home}-${a.predicted_away}</strong>
               (${a.predicted_result}) · ${a.total_points} pts
             </div>`:""}
    </div>
  `}function re(e,a){const t=!!a,n=(a==null?void 0:a.predicted_home)??0,s=(a==null?void 0:a.predicted_away)??0,i=(a==null?void 0:a.predicted_result)??"X",o=t?"prediction-form--saved":"prediction-form--unsaved",r=t?'<span class="pred-status pred-status--saved">✓ Guardado</span>':'<span class="pred-status pred-status--unsaved">Sin predicción</span>',c=t?"btn btn--saved btn--sm pred-save-btn":"btn btn--ghost btn--sm pred-save-btn",d=t?"✓ Guardado":"Guardar";return`
    <form class="prediction-form ${o}" data-match-id="${e.id}" data-saved="${t}">
      ${r}
      <div class="result-selector">
        ${["1","X","2"].map(l=>`
          <label class="result-selector__option">
            <input type="radio" name="predicted_result" value="${l}" ${i===l?"checked":""} required />
            ${l}
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
      <button type="submit" class="${c}">${d}</button>
    </form>
  `}function le(e,a,t){const n=parseInt(e.dataset.matchId),s=e.querySelector(".pred-save-btn"),i=e.querySelector(".pred-status");let o=e.dataset.saved==="true";function r(){e.classList.contains("prediction-form--dirty")||(e.classList.remove("prediction-form--saved","prediction-form--unsaved"),e.classList.add("prediction-form--dirty"),s.className="btn btn--primary btn--sm pred-save-btn",s.textContent="Guardar",i&&(i.className="pred-status pred-status--unsaved",i.textContent="Sin guardar"))}function c(){o=!0,e.classList.remove("prediction-form--unsaved","prediction-form--dirty"),e.classList.add("prediction-form--saved"),s.className="btn btn--saved btn--sm pred-save-btn",s.textContent="✓ Guardado",s.disabled=!1,i&&(i.className="pred-status pred-status--saved",i.textContent="✓ Guardado")}e.querySelectorAll("input").forEach(d=>{d.addEventListener("change",r),d.addEventListener("input",r)}),e.addEventListener("submit",async d=>{var h;d.preventDefault();const l=parseInt(e.querySelector("[name=predicted_home]").value),g=parseInt(e.querySelector("[name=predicted_away]").value),_=(h=e.querySelector("[name=predicted_result]:checked"))==null?void 0:h.value;if(!(isNaN(l)||isNaN(g)||!_)){s.disabled=!0,s.textContent="…";try{const{prediction:f}=await p.predictions.save({match_id:n,predicted_result:_,predicted_home:l,predicted_away:g,league_id:t??null});a[n]=f,m("Predicción guardada"),c()}catch(f){m(f.message||"Error al guardar","error"),s.disabled=!1,o?(s.className="btn btn--saved btn--sm pred-save-btn",s.textContent="✓ Guardado"):(s.className="btn btn--primary btn--sm pred-save-btn",s.textContent="Guardar")}}})}function ce(){const e=localStorage.getItem("activeLeagueId");return e?parseInt(e):null}async function de(e){e.innerHTML='<div class="loading"><div class="loading__spinner"></div></div>';try{if(v.isLoggedIn()){const{leagues:r}=await p.leagues.my();if(r.length===0){e.innerHTML=A();return}}const a=ce(),[{ranking:t},n]=await Promise.all([p.auth.ranking(a),v.isLoggedIn()?p.leagues.my():Promise.resolve({leagues:[]})]),s=v.getUser(),i=n.leagues.find(r=>r.id===a),o=i?i.name:"Clasificación General";e.innerHTML=`
      <div class="container">
        <h1 class="page-title">${o}</h1>
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
              ${t.map(r=>{var c,d;return`
                <tr class="${s&&r.id===s.id?"ranking-table__row--me":""}">
                  <td class="ranking-table__pos" data-pos="${r.position}">${r.position}</td>
                  <td>
                    <a class="ranking-table__link" href="#/jugador/${r.id}">
                      <span class="status-emoji" title="${((c=r.status)==null?void 0:c.name)||""}">${((d=r.status)==null?void 0:d.emoji)||""}</span>${r.username}
                    </a>
                  </td>
                  <td>${r.country||"—"}</td>
                  <td class="ranking-table__pts">${r.total_points}</td>
                  <td class="ranking-table__stat">${r.correct_results}</td>
                  <td class="ranking-table__stat">${r.exact_scores}</td>
                </tr>
              `}).join("")}
            </tbody>
          </table>
        </div>
      </div>
    `}catch(a){e.innerHTML=`<div class="container"><p class="form__error">Error: ${a.message}</p></div>`}}async function pe(e){e.innerHTML='<div class="loading"><div class="loading__spinner"></div></div>';let a=1,t=1;async function n(){const{messages:r,pages:c}=await p.board.messages(a);return t=c,r}try{const r=await n();s(r)}catch(r){e.innerHTML=`<div class="container"><p class="form__error">Error: ${r.message}</p></div>`}function s(r){var d,l,g;const c=v.getUser();e.innerHTML=`
      <div class="container">
        <h1 class="page-title">Tablón</h1>
        ${c?`<form class="board-form" id="boardForm">
               <textarea class="form__textarea" id="boardMsg" placeholder="Escribe un mensaje…"
                 maxlength="500" rows="3" required></textarea>
               <button class="btn btn--primary" type="submit">Publicar</button>
             </form>`:'<p class="notice"><a href="#/login">Inicia sesión</a> para participar en el tablón.</p>'}
        <div class="board-messages" id="boardMessages">
          ${i(r,c)}
        </div>
        ${t>1?`<div class="pagination">
               <button class="btn btn--ghost btn--sm" id="prevPage" ${a<=1?"disabled":""}>← Anterior</button>
               <span>Página ${a} / ${t}</span>
               <button class="btn btn--ghost btn--sm" id="nextPage" ${a>=t?"disabled":""}>Siguiente →</button>
             </div>`:""}
      </div>
    `,(d=document.getElementById("boardForm"))==null||d.addEventListener("submit",async _=>{_.preventDefault();const h=document.getElementById("boardMsg"),f=h.value.trim();if(f)try{await p.board.post(f),h.value="";const L=await n();document.getElementById("boardMessages").innerHTML=i(L,c),o(c),m("Mensaje publicado")}catch(L){m(L.message,"error")}}),(l=document.getElementById("prevPage"))==null||l.addEventListener("click",async()=>{a--;const _=await n();document.getElementById("boardMessages").innerHTML=i(_,c),o(c)}),(g=document.getElementById("nextPage"))==null||g.addEventListener("click",async()=>{a++;const _=await n();document.getElementById("boardMessages").innerHTML=i(_,c),o(c)}),o(c)}function i(r,c){return r.length?r.map(d=>`
      <div class="board-message ${d.is_deleted?"board-message--deleted":""}" data-id="${d.id}">
        <div class="board-message__header">
          <strong>${d.username}</strong>
          <span class="board-message__date">${w(d.created_at)}</span>
          ${!d.is_deleted&&c&&(c.id===d.user_id||c.is_admin)?`<button class="btn btn--danger btn--xs delete-msg" data-id="${d.id}">✕</button>`:""}
        </div>
        <p class="board-message__text">${ue(d.message)}</p>
      </div>
    `).join(""):'<p class="empty">Sin mensajes aún. ¡Sé el primero!</p>'}function o(r){e.querySelectorAll(".delete-msg").forEach(c=>{c.addEventListener("click",async()=>{if(confirm("¿Eliminar este mensaje?"))try{await p.board.delete(c.dataset.id);const d=await n();document.getElementById("boardMessages").innerHTML=i(d,r),o(r),m("Mensaje eliminado")}catch(d){m(d.message,"error")}})})}}function ue(e){return e.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;")}async function me(e){var a,t,n,s;e.innerHTML='<div class="loading"><div class="loading__spinner"></div></div>';try{const[i,o]=await Promise.all([p.leagues.all(),v.isLoggedIn()?p.leagues.my():Promise.resolve({leagues:[]})]),r=v.getUser(),c=new Set(o.leagues.map(l=>l.id)),d=i.leagues.filter(l=>!c.has(l.id));e.innerHTML=`
      <div class="container">
        <h1 class="page-title">Ligas</h1>

        ${r&&o.leagues.length>0?`
          <section class="section">
            <h2>Mis ligas</h2>
            <div class="leagues-grid">${o.leagues.map(l=>M(l,!0)).join("")}</div>
          </section>
        `:""}

        ${r?`
          <section class="section ligas-actions">
            <div class="ligas-actions__row">
              <button class="btn btn--primary" id="btnShowCreate">+ Crear liga</button>
              <form class="form form--inline" id="joinCodeForm">
                <input class="form__input" type="text" id="inviteCode" placeholder="Código de invitación" maxlength="20" />
                <button class="btn btn--outline" type="submit">Unirse</button>
              </form>
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
                ${r.is_admin?`
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
          <h2>Ligas disponibles</h2>
          ${d.length?`<div class="leagues-grid">${d.map(l=>M(l,!1,c)).join("")}</div>`:o.leagues.length>0?'<p class="empty">Ya participas en todas las ligas disponibles.</p>':'<p class="empty">No hay ligas aún. ¡Crea la primera!</p>'}
        </section>
      </div>
    `,e.querySelectorAll('.league-card[data-navigate="true"]').forEach(l=>{l.addEventListener("click",()=>b.navigate(`/ligas/${l.dataset.id}`))}),e.querySelectorAll(".btn-join-league").forEach(l=>{l.addEventListener("click",async g=>{g.stopPropagation();const _=parseInt(l.dataset.id);l.disabled=!0,l.textContent="…";try{const{league:h}=await p.leagues.join({league_id:_});m(`¡Te has unido a "${h.name}"!`),b.navigate(`/ligas/${h.id}`)}catch(h){m(h.message,"error"),l.disabled=!1,l.textContent="Unirse"}})}),e.querySelectorAll(".btn-private-info").forEach(l=>{l.addEventListener("click",g=>{g.stopPropagation(),m("Esta liga es privada. Pide el enlace de invitación a cualquier miembro para unirte.","info")})}),(a=document.getElementById("btnShowCreate"))==null||a.addEventListener("click",()=>{var l,g;(l=document.getElementById("createLeaguePanel"))==null||l.classList.remove("hidden"),(g=document.getElementById("btnShowCreate"))==null||g.classList.add("hidden")}),(t=document.getElementById("btnCancelCreate"))==null||t.addEventListener("click",()=>{var l,g;(l=document.getElementById("createLeaguePanel"))==null||l.classList.add("hidden"),(g=document.getElementById("btnShowCreate"))==null||g.classList.remove("hidden")}),(n=document.getElementById("joinCodeForm"))==null||n.addEventListener("submit",async l=>{l.preventDefault();const g=document.getElementById("inviteCode").value.trim().toUpperCase();if(g)try{const{league:_}=await p.leagues.join({invite_code:g});m(`Te has unido a "${_.name}"`),b.navigate(`/ligas/${_.id}`)}catch(_){m(_.message,"error")}}),(s=document.getElementById("createLeagueForm"))==null||s.addEventListener("submit",async l=>{var x;l.preventDefault();const g=document.getElementById("createBtn");g.disabled=!0,g.textContent="Creando…";const _=document.getElementById("leagueName").value.trim(),h=document.getElementById("leagueDesc").value.trim(),f=document.getElementById("leaguePrize").value.trim(),L=document.getElementById("isPublic").checked,F=((x=document.getElementById("isOfficial"))==null?void 0:x.checked)??!1;try{const{league:S}=await p.leagues.create({name:_,description:h,prize:f,is_public:L,is_official:F});ge(S)}catch(S){m(S.message,"error"),g.disabled=!1,g.textContent="Crear liga"}})}catch(i){e.innerHTML=`<div class="container"><p class="form__error">Error: ${i.message}</p></div>`}}function M(e,a=!1,t=new Set){const n=e.is_official?'<span class="league-badge league-badge--official">⭐ Oficial</span>':"",s=e.is_public?"🌍":"🔒",i=a?`<button class="btn btn--sm btn--outline" onclick="event.stopPropagation(); window.location.hash='/ligas/${e.id}'">Ver liga</button>`:e.is_public?`<button class="btn btn--sm btn--primary btn-join-league" data-id="${e.id}">Unirse</button>`:'<button class="btn btn--sm btn--ghost btn-private-info">🔒 Solicitar enlace</button>';return`
    <div class="league-card ${a?"league-card--mine":""}" data-id="${e.id}" data-navigate="${a}">
      <div class="league-card__top">
        <div class="league-card__name">${e.name} ${n}</div>
      </div>
      ${e.description?`<p class="league-card__desc">${e.description}</p>`:""}
      <div class="league-card__meta">
        <span>${s} ${e.is_public?"Pública":"Privada"}</span>
        <span>${e.member_count} participantes</span>
        ${e.prize?`<span>🏆 ${e.prize}</span>`:""}
      </div>
      <div class="league-card__footer">
        <span class="league-card__creator">por ${e.creator_username}</span>
        ${i}
      </div>
    </div>
  `}function ge(e){var n,s;const a=e.invite_link||"",t=document.getElementById("createLeaguePanel");t&&(t.innerHTML=`
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
  `,(n=document.getElementById("btnCopyLink"))==null||n.addEventListener("click",async()=>{try{await navigator.clipboard.writeText(a),m("Enlace copiado")}catch{m("No se pudo copiar","error")}}),(s=document.getElementById("btnShare"))==null||s.addEventListener("click",async()=>{try{await navigator.share({title:`Únete a ${e.name} en PickGoal`,url:a})}catch{}}))}async function _e(e,{params:a}){var n,s,i,o;const t=parseInt(a.id);e.innerHTML='<div class="loading"><div class="loading__spinner"></div></div>';try{const{league:r,ranking:c,is_member:d}=await p.leagues.get(t),l=v.getUser(),g=r.is_official?'<span class="league-badge league-badge--official">⭐ Oficial</span>':"";e.innerHTML=`
      <div class="container">
        <a href="#/ligas" class="back-link">← Volver a ligas</a>
        <div class="league-header">
          <h1 class="page-title">${r.name} ${g}</h1>
          ${r.description?`<p class="league-header__desc">${r.description}</p>`:""}
          <div class="league-header__meta">
            <span>${r.is_public?"🌍 Pública":"🔒 Privada"}</span>
            <span>${r.member_count} participantes</span>
            ${r.prize?`<span>🏆 ${r.prize}</span>`:""}
          </div>
        </div>

        ${d&&r.invite_link?`
          <div class="invite-share-box">
            <span class="invite-share-box__label">Enlace de invitación:</span>
            <div class="invite-link-box">
              <span class="invite-link-box__url">${r.invite_link}</span>
              <button class="btn btn--sm btn--outline" id="btnCopyInvite">Copiar</button>
              ${navigator.share?'<button class="btn btn--sm btn--ghost" id="btnShareInvite">Compartir</button>':""}
            </div>
          </div>
        `:""}

        ${d?'<button class="btn btn--danger btn--sm" id="btnLeave">Abandonar liga</button>':l?'<button class="btn btn--primary" id="btnJoin">Unirse a esta liga</button>':""}

        <section class="section">
          <h2>Clasificación</h2>
          <table class="ranking-table">
            <thead>
              <tr><th>#</th><th>Usuario</th><th>País</th><th>Puntos</th></tr>
            </thead>
            <tbody>
              ${c.map(_=>`
                <tr class="${l&&_.id===l.id?"ranking-table__row--me":""}">
                  <td>${_.position}</td>
                  <td>${_.username}</td>
                  <td>${_.country||"—"}</td>
                  <td class="ranking-table__pts">${_.total_points}</td>
                </tr>
              `).join("")}
            </tbody>
          </table>
        </section>
      </div>
    `,(n=document.getElementById("btnCopyInvite"))==null||n.addEventListener("click",async()=>{try{await navigator.clipboard.writeText(r.invite_link),m("Enlace copiado")}catch{m("No se pudo copiar","error")}}),(s=document.getElementById("btnShareInvite"))==null||s.addEventListener("click",async()=>{try{await navigator.share({title:`Únete a ${r.name} en PickGoal`,url:r.invite_link})}catch{}}),(i=document.getElementById("btnLeave"))==null||i.addEventListener("click",async()=>{if(confirm("¿Seguro que quieres abandonar esta liga?"))try{await p.leagues.leave(t),m("Has abandonado la liga"),b.navigate("/ligas")}catch(_){m(_.message,"error")}}),(o=document.getElementById("btnJoin"))==null||o.addEventListener("click",async()=>{try{await p.leagues.join({league_id:t}),m("¡Te has unido a la liga!"),b.navigate(`/ligas/${t}`)}catch(_){m(_.message,"error")}})}catch(r){e.innerHTML=`<div class="container"><p class="form__error">Error: ${r.message}</p><a href="#/ligas">Volver</a></div>`}}async function ve(e){var t,n;e.innerHTML='<div class="loading"><div class="loading__spinner"></div></div>';const a=v.getUser();try{const s=(()=>{const h=localStorage.getItem("activeLeagueId");return h?parseInt(h):null})(),[i,o,r,c]=await Promise.all([p.predictions.mine(s),p.predictions.getChampion(s),p.leagues.my(),p.auth.me()]),d=i.predictions.reduce((h,f)=>h+f.total_points,0)+(((t=o.champion_prediction)==null?void 0:t.points_earned)||0),l=c.user,g=l.status,_=l.total_points_all_time;e.innerHTML=`
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
          ${he(g,_)}
          <button class="btn btn--danger" id="btnLogoutPerfil">Cerrar sesión</button>
          <div class="profile-card__stats">
            <div class="stat">
              <span class="stat__value">${d}</span>
              <span class="stat__label">Puntos totales</span>
            </div>
            <div class="stat">
              <span class="stat__value">${i.predictions.length}</span>
              <span class="stat__label">Predicciones</span>
            </div>
            <div class="stat">
              <span class="stat__value">${r.leagues.length}</span>
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
          ${i.predictions.length?`<div class="predictions-list">${i.predictions.map(be).join("")}</div>`:'<p class="empty">Sin predicciones aún. <a href="#/quiniela">Ir a la quiniela</a></p>'}
        </section>

        <section class="section">
          <h2>Mis ligas</h2>
          ${r.leagues.length?`<ul class="leagues-list">${r.leagues.map(h=>`<li><a href="#/ligas/${h.id}">${h.name}</a> <span class="tag">${h.is_public?"Pública":"Privada"}</span></li>`).join("")}</ul>`:'<p class="empty">No perteneces a ninguna liga. <a href="#/ligas">Ver ligas</a></p>'}
        </section>
      </div>
    `,(n=e.querySelector("#btnLogoutPerfil"))==null||n.addEventListener("click",()=>{v.logout(),window.location.hash="/"})}catch(s){e.innerHTML=`<div class="container"><p class="form__error">Error: ${s.message}</p></div>`}}function he(e,a){if(e.next_threshold===null)return`
      <div class="level-progress">
        <div class="level-progress__header">
          <span class="status-badge">${e.emoji} ${e.name}</span>
          <span class="level-progress__label">¡Nivel máximo alcanzado!</span>
        </div>
        <div class="level-progress__bar"><div class="level-progress__fill" style="width:100%"></div></div>
      </div>`;const n=Math.min(100,Math.round((a-e.threshold)/(e.next_threshold-e.threshold)*100));return`
    <div class="level-progress">
      <div class="level-progress__header">
        <span class="status-badge">${e.emoji} ${e.name}</span>
        <span class="level-progress__label">${a} / ${e.next_threshold} pts → ${e.next_emoji||""} ${e.next_name}</span>
      </div>
      <div class="level-progress__bar"><div class="level-progress__fill" style="width:${n}%"></div></div>
    </div>`}function be(e){return`
    <div class="pred-row ${e.total_points>0?"pred-row--scored":""}">
      <span class="pred-row__result">${e.predicted_result}</span>
      <span class="pred-row__score">${e.predicted_home}-${e.predicted_away}</span>
      <span class="pred-row__pts">${e.total_points} pts</span>
    </div>
  `}const j=new Date("2026-06-11T21:00:00Z"),fe=["Argentina","Brasil","Francia","España","Inglaterra","Alemania","Portugal","Países Bajos","Italia","Bélgica","Uruguay","Colombia","México","Estados Unidos","Canadá","Marruecos","Senegal","Nigeria","Japón","Corea del Sur","Australia","Arabia Saudí","Irán","Qatar","Ecuador","Chile","Perú","Venezuela","Bolivia","Paraguay","Costa Rica","Honduras","Panamá","Jamaica","Trinidad y Tobago","Guatemala","Turquía","Polonia","Croacia","Serbia","República Checa","Eslovaquia","Austria","Suiza","Dinamarca","Suecia","Noruega","Escocia","Ucrania","Rumanía","Hungría","Grecia","Egipto","Camerún","Ghana","Costa de Marfil","Túnez","Argelia","China","India","Irak","Uzbekistán","Nueva Zelanda","Fiji"];function ye(){const e=localStorage.getItem("activeLeagueId");return e?parseInt(e):null}async function O(e){var a;if(!v.isLoggedIn()){e.innerHTML='<div class="container"><p class="notice"><a href="#/login">Inicia sesión</a> para predecir el campeón.</p></div>';return}e.innerHTML='<div class="loading"><div class="loading__spinner"></div></div>';try{const t=ye(),{champion_prediction:n}=await p.predictions.getChampion(t),s=new Date>=j;let i;n&&s?i=`
        <div class="champion-result">
          <p>Tu predicción: <strong class="champion-result__team">${n.team_name}</strong></p>
          <p>Puntos ganados: <strong>${n.points_earned}</strong></p>
          <p class="notice">🔒 El torneo ha comenzado, tu predicción está bloqueada.</p>
        </div>
      `:!n&&s?i=`
        <p class="notice notice--warning">⚠️ El torneo ya ha comenzado. Una vez confirmado no podrás cambiarlo.</p>
        ${B(null)}
      `:n&&!s?i=`
        <p class="notice">Puedes cambiar tu predicción hasta el inicio del torneo.</p>
        ${B(n.team_name)}
      `:i=B(null),e.innerHTML=`
      <div class="container">
        <h1 class="page-title">🏆 Predice el Campeón</h1>
        <p class="champion-desc">
          Acertar el campeón del mundo vale <strong>10 puntos extra</strong>.
          Puedes modificar tu elección hasta el inicio del torneo
          (${j.toLocaleDateString("es-ES",{day:"numeric",month:"long",year:"numeric",hour:"2-digit",minute:"2-digit"})}).
        </p>
        ${i}
      </div>
    `,(a=document.getElementById("championForm"))==null||a.addEventListener("submit",async o=>{o.preventDefault();const r=document.getElementById("champBtn"),c=document.getElementById("champError"),d=document.getElementById("teamSearch").value.trim();if(d){r.disabled=!0,r.textContent="Guardando…",c.classList.add("hidden");try{await p.predictions.saveChampion(d,t),m(`¡${d} guardado como campeón!`),O(e)}catch(l){c.textContent=l.message,c.classList.remove("hidden"),r.disabled=!1,r.textContent=r.dataset.label||"Confirmar predicción"}}})}catch(t){e.innerHTML=`<div class="container"><p class="form__error">Error: ${t.message}</p></div>`}}function B(e){const a=e?"Actualizar predicción":"Confirmar predicción";return`
    <form class="form champion-form" id="championForm">
      <div class="form__group">
        <label class="form__label" for="teamSearch">Selecciona el equipo campeón</label>
        <input class="form__input" type="text" id="teamSearch"
          placeholder="Escribe para buscar…"
          list="teamsList" autocomplete="off"
          value="${e??""}" required />
        <datalist id="teamsList">
          ${fe.map(t=>`<option value="${t}">`).join("")}
        </datalist>
      </div>
      <p id="champError" class="form__error hidden"></p>
      <button class="btn btn--primary" type="submit" id="champBtn" data-label="${a}">
        ${a}
      </button>
    </form>
  `}async function $e(e){if(!v.isAdmin()){e.innerHTML='<div class="container"><p class="form__error">Acceso denegado.</p></div>';return}e.innerHTML='<div class="loading"><div class="loading__spinner"></div></div>';try{const{users:a}=await p.auth.users();e.innerHTML=`
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
          <h2>Usuarios (${a.length})</h2>
          <table class="admin-table">
            <thead>
              <tr>
                <th>ID</th><th>Usuario</th><th>Email</th><th>País</th><th>Admin</th><th>Acción</th>
              </tr>
            </thead>
            <tbody id="usersTableBody">
              ${a.map(Ee).join("")}
            </tbody>
          </table>
        </section>
      </div>
    `,document.getElementById("btnSync").addEventListener("click",async()=>{const t=document.getElementById("syncResult");t.textContent="Sincronizando…";try{await p.matches.sync(),t.textContent="✓ Sincronización completada",m("Sincronización completada")}catch(n){t.textContent=`Error: ${n.message}`,m(n.message,"error")}}),document.getElementById("awardForm").addEventListener("submit",async t=>{t.preventDefault();const n=document.getElementById("winnerTeam").value.trim();if(n)try{const{message:s}=await p.predictions.awardChampion(n);m(s)}catch(s){m(s.message,"error")}}),document.getElementById("usersTableBody").addEventListener("click",async t=>{const n=t.target.closest(".toggle-admin");if(!n)return;const s=parseInt(n.dataset.id);try{const{user:i}=await p.auth.toggleAdmin(s);n.closest("tr").querySelector(".admin-badge").textContent=i.is_admin?"Sí":"No",m(`${i.username} ${i.is_admin?"ahora es admin":"ya no es admin"}`)}catch(i){m(i.message,"error")}})}catch(a){e.innerHTML=`<div class="container"><p class="form__error">Error: ${a.message}</p></div>`}}function Ee(e){return`
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
  `}function we(e){e.innerHTML=`
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
  `,document.getElementById("forgotForm").addEventListener("submit",async a=>{a.preventDefault();const t=document.getElementById("forgotBtn"),n=document.getElementById("forgotMsg"),s=document.getElementById("email").value.trim();t.disabled=!0,t.textContent="Enviando…";try{await p.auth.forgotPassword(s),n.textContent="Si el email existe, recibirás un enlace en breve.",n.classList.remove("hidden","form__error"),n.classList.add("form__success")}catch{m("Error al enviar el email","error")}finally{t.disabled=!1,t.textContent="Enviar enlace"}})}function Le(e,{query:a}){const t=a.token||"";if(!t){e.innerHTML='<div class="container"><p class="form__error">Token inválido o expirado.</p><a href="#/login">Volver</a></div>';return}e.innerHTML=`
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
  `,document.getElementById("resetForm").addEventListener("submit",async n=>{n.preventDefault();const s=document.getElementById("resetBtn"),i=document.getElementById("resetError"),o=document.getElementById("password").value;s.disabled=!0,s.textContent="Guardando…",i.classList.add("hidden");try{await p.auth.resetPassword(t,o),m("Contraseña actualizada. Ya puedes iniciar sesión."),b.navigate("/login")}catch(r){i.textContent=r.message||"Error al restablecer la contraseña",i.classList.remove("hidden")}finally{s.disabled=!1,s.textContent="Guardar contraseña"}})}const Ie={r32:"Dieciseisavos",r16:"Octavos",quarters:"Cuartos",semis:"Semis",third:"3º y 4º",final:"Final"};async function Se(e){e.innerHTML='<div class="loading"><div class="loading__spinner"></div></div>';try{const{groups:a}=await p.matches.grouped();e.innerHTML=`
      <div class="container">
        <h1 class="page-title">Resultados — Mundial 2026</h1>
        <nav class="phase-nav" id="phaseNav"></nav>
        <div id="phaseContent"></div>
      </div>
    `,Ce(a)}catch(a){e.innerHTML=`<div class="container"><p class="form__error">Error cargando los partidos: ${a.message}</p></div>`}}function Ce(e){var i;const a=document.getElementById("phaseNav");if(!a)return;const t=e.filter(o=>o.phase==="group"),n=e.filter(o=>o.phase!=="group"),s=[...t.map(o=>({key:`group_${o.group_name}`,label:`Grupo ${o.group_name}`,data:o,isGroup:!0})),...n.map(o=>({key:o.phase,label:Ie[o.phase]||o.label,data:o,isGroup:!1}))];s.length!==0&&(a.innerHTML=s.map((o,r)=>`
    <button class="phase-nav__btn ${r===0?"phase-nav__btn--active":""}" data-key="${o.key}">
      ${o.label}
    </button>
  `).join(""),(i=a.querySelector(".phase-nav__btn--active"))==null||i.scrollIntoView({inline:"center",behavior:"instant",block:"nearest"}),a.querySelectorAll(".phase-nav__btn").forEach((o,r)=>{o.addEventListener("click",()=>{a.querySelectorAll(".phase-nav__btn").forEach(d=>d.classList.remove("phase-nav__btn--active")),o.classList.add("phase-nav__btn--active");const c=s.find(d=>d.key===o.dataset.key);c&&H(c.data,c.isGroup)})}),H(s[0].data,s[0].isGroup))}function H(e,a){const t=document.getElementById("phaseContent");if(!t)return;const n=Be(e.matches);if(a){const s=xe(e.matches);t.innerHTML=`
      <div class="resultados-section">
        <div class="resultados-matches">${n}</div>
        <div class="standings">
          <h3 class="standings__title">Clasificación — Grupo ${e.group_name}</h3>
          ${Pe(s)}
        </div>
      </div>
    `}else t.innerHTML=`<div class="resultados-matches">${n}</div>`}function Be(e){return!e||e.length===0?'<p class="empty">Sin partidos en esta fase.</p>':e.map(a=>{const t={scheduled:"Programado",live:"🔴 En juego",finished:"Finalizado"}[a.status]||a.status,n=a.status!=="scheduled"?`<span class="res-score">${a.home_score_90??"?"} - ${a.away_score_90??"?"}</span>`:'<span class="res-score res-score--pending">vs</span>';return`
      <div class="res-match ${a.status==="finished"?"res-match--finished":""} ${a.status==="live"?"res-match--live":""}">
        <div class="res-match__meta">
          <span class="res-match__status">${t}</span>
          <span class="res-match__date">${w(a.match_datetime)}</span>
        </div>
        <div class="res-match__teams">
          <span class="res-match__team res-match__team--home">${a.home_team}</span>
          ${n}
          <span class="res-match__team res-match__team--away">${a.away_team}</span>
        </div>
      </div>
    `}).join("")}function xe(e){const a={};for(const t of e)if(a[t.home_team]||(a[t.home_team]={name:t.home_team,pj:0,g:0,e:0,p:0,gf:0,gc:0,pts:0}),a[t.away_team]||(a[t.away_team]={name:t.away_team,pj:0,g:0,e:0,p:0,gf:0,gc:0,pts:0}),t.status==="finished"&&t.home_score_90!==null&&t.away_score_90!==null){const n=a[t.home_team],s=a[t.away_team];n.pj++,s.pj++,n.gf+=t.home_score_90,n.gc+=t.away_score_90,s.gf+=t.away_score_90,s.gc+=t.home_score_90,t.home_score_90>t.away_score_90?(n.g++,n.pts+=3,s.p++):t.home_score_90<t.away_score_90?(s.g++,s.pts+=3,n.p++):(n.e++,n.pts++,s.e++,s.pts++)}return Object.values(a).sort((t,n)=>{if(n.pts!==t.pts)return n.pts-t.pts;const s=n.gf-n.gc,i=t.gf-t.gc;return s!==i?s-i:n.gf-t.gf})}function Pe(e){return e.length===0?'<p class="empty">Sin datos de clasificación.</p>':`
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
      <tbody>${e.map((t,n)=>`
    <tr class="${n<3?"standings__row--qualify":""}">
      <td class="standings__pos">${n+1}</td>
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
  `}async function ke(e,{query:a}){const t=(a.codigo||"").trim().toUpperCase();if(!t){e.innerHTML='<div class="container"><p class="form__error">Enlace de invitación inválido.</p><a href="#/ligas">Ver ligas</a></div>';return}if(!v.isLoggedIn()){sessionStorage.setItem("pendingInviteCode",t),b.navigate("/register");return}e.innerHTML='<div class="loading"><div class="loading__spinner"></div></div>';try{const{league:n}=await p.leagues.joinByCode(t);m(`¡Te has unido a "${n.name}"!`),b.navigate(`/ligas/${n.id}`)}catch(n){if(n.status===409){m("Ya eres miembro de esta liga");try{const{leagues:s}=await p.leagues.my(),i=s.find(o=>o.invite_code===t);if(i){b.navigate(`/ligas/${i.id}`);return}}catch{}}e.innerHTML=`
      <div class="container">
        <div class="league-gate">
          <div class="league-gate__icon">⚠️</div>
          <h2 class="league-gate__title">Error al unirse</h2>
          <p class="league-gate__text">${n.message}</p>
          <a href="#/ligas" class="btn btn--primary">Ver ligas</a>
        </div>
      </div>
    `}}function Te(){const e=localStorage.getItem("activeLeagueId");return e?parseInt(e):null}async function Me(e,{params:a}){const t=parseInt(a.id);if(!t){e.innerHTML='<div class="container"><p class="form__error">Usuario no válido.</p></div>';return}e.innerHTML='<div class="loading"><div class="loading__spinner"></div></div>';try{const n=Te(),{user:s,predictions:i}=await p.predictions.forUser(t,n);e.innerHTML=`
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
              ${i.map(o=>je(o)).join("")}
            </div>`}
      </div>
    `}catch(n){e.innerHTML=`<div class="container"><p class="form__error">Error: ${n.message}</p></div>`}}function je(e){const a=e.match,t=e.total_points,n=e.pts_score>0,s=e.pts_result>0;let i="";return n?i='<span class="jugador__badge jugador__badge--exact">Exacto</span>':s?i='<span class="jugador__badge jugador__badge--ok">1X2 ✓</span>':i='<span class="jugador__badge jugador__badge--miss">Fallo</span>',`
    <div class="jugador__pred-row">
      <div class="jugador__pred-match">
        <span class="jugador__pred-teams">${a.home_team} vs ${a.away_team}</span>
        <span class="jugador__pred-date">${w(a.match_datetime)}</span>
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
  `}const He={"/":J,"/login":ee,"/register":ae,"/quiniela":se,"/resultados":Se,"/ranking":de,"/tablon":pe,"/ligas":me,"/ligas/:id":_e,"/perfil":ve,"/campeon":O,"/admin":$e,"/forgot-password":we,"/reset-password":Le,"/unirse":ke,"/jugador/:id":Me};function qe(e){for(const[a,t]of Object.entries(He)){const n=[],s=new RegExp("^"+a.replace(/:([^/]+)/g,(o,r)=>(n.push(r),"([^/]+)"))+"$"),i=e.match(s);if(i){const o={};return n.forEach((r,c)=>{o[r]=i[c+1]}),{handler:t,params:o}}}return null}const q=()=>document.getElementById("mainContent"),b={init(){window.addEventListener("hashchange",()=>this.resolve()),this.resolve()},navigate(e){window.location.hash=e},resolve(){const e=window.location.hash.slice(1)||"/",[a,t]=e.split("?"),n=Object.fromEntries(new URLSearchParams(t||"")),s=qe(a);if(!s){q().innerHTML='<div class="error-page"><h2>Página no encontrada</h2><a href="#/">Volver al inicio</a></div>';return}const{handler:i,params:o}=s;if(["/perfil","/campeon","/admin"].includes(a)&&!v.isLoggedIn()){this.navigate("/login");return}if(a==="/admin"&&!v.isAdmin()){this.navigate("/");return}const c=q();c.innerHTML='<div class="loading"><div class="loading__spinner"></div></div>',i(c,{params:o,query:n})}};let E=[],I=null;async function Ne(){await v.init(),b.init(),Oe(),Ae()}function Ae(){window.addEventListener("beforeinstallprompt",e=>{e.preventDefault(),I=e,De()})}function De(){if(sessionStorage.getItem("installBannerDismissed"))return;const e=document.createElement("div");e.id="installBanner",e.className="install-banner",e.innerHTML=`
    <span class="install-banner__text">⚽ Instala PickGoal en tu dispositivo</span>
    <div class="install-banner__actions">
      <button class="install-banner__btn install-banner__btn--primary" id="installBtn">Instalar</button>
      <button class="install-banner__btn install-banner__btn--ghost" id="installDismissBtn">Ahora no</button>
    </div>
  `,document.body.appendChild(e),document.getElementById("installBtn").addEventListener("click",async()=>{I&&(I.prompt(),await I.userChoice,I=null,e.remove())}),document.getElementById("installDismissBtn").addEventListener("click",()=>{sessionStorage.setItem("installBannerDismissed","1"),e.remove()})}function y(){var e,a,t,n;(e=document.getElementById("leagueDropdown"))==null||e.classList.add("hidden"),(a=document.getElementById("leagueBtn"))==null||a.classList.remove("navbar__dropdown-btn--open"),(t=document.getElementById("userDropdown"))==null||t.classList.add("hidden"),(n=document.getElementById("userBtn"))==null||n.classList.remove("navbar__dropdown-btn--open")}function Oe(){var e,a,t,n,s;document.addEventListener("auth:change",N),window.addEventListener("hashchange",()=>{y(),G()}),document.addEventListener("click",y),(e=document.getElementById("leagueBtn"))==null||e.addEventListener("click",i=>{var c;i.stopPropagation();const o=document.getElementById("leagueDropdown"),r=o==null?void 0:o.classList.contains("hidden");y(),r&&(o==null||o.classList.remove("hidden"),(c=document.getElementById("leagueBtn"))==null||c.classList.add("navbar__dropdown-btn--open"))}),(a=document.getElementById("leagueDropdown"))==null||a.addEventListener("click",i=>{i.stopPropagation();const o=i.target.closest("[data-league-id]");if(o){localStorage.setItem("activeLeagueId",o.dataset.leagueId),y(),U(E),b.resolve();return}i.target.closest("a")&&y()}),(t=document.getElementById("userBtn"))==null||t.addEventListener("click",i=>{var c;i.stopPropagation();const o=document.getElementById("userDropdown"),r=o==null?void 0:o.classList.contains("hidden");y(),r&&(o==null||o.classList.remove("hidden"),(c=document.getElementById("userBtn"))==null||c.classList.add("navbar__dropdown-btn--open"))}),(n=document.getElementById("userDropdown"))==null||n.addEventListener("click",i=>{i.stopPropagation(),i.target.closest("#navProfileLink")&&y()}),(s=document.getElementById("navLogoutBtn"))==null||s.addEventListener("click",()=>{E=[],localStorage.removeItem("activeLeagueId"),y(),v.logout(),b.navigate("/")}),N()}async function N(){const e=document.getElementById("navAuthLinks"),a=document.getElementById("userBtn"),t=document.getElementById("navUsername"),n=document.getElementById("navLeague"),s=document.getElementById("bottomNav"),i=v.getUser();if(y(),i){e==null||e.classList.add("hidden"),t&&(t.textContent=i.username),n.style.visibility="visible",a.style.visibility="visible",s==null||s.classList.remove("hidden"),document.body.classList.add("has-bottom-nav");try{const{leagues:o}=await p.leagues.my();E=o}catch{E=[]}U(E)}else e==null||e.classList.remove("hidden"),n.style.visibility="hidden",a.style.visibility="hidden",s==null||s.classList.add("hidden"),document.body.classList.remove("has-bottom-nav"),E=[],localStorage.removeItem("activeLeagueId");G()}function U(e){const a=document.getElementById("leagueDropdown"),t=document.getElementById("navLeagueName");if(!a||!t)return;let n=localStorage.getItem("activeLeagueId"),s=e.find(o=>String(o.id)===String(n));!s&&e.length>0&&(s=e[0],localStorage.setItem("activeLeagueId",String(s.id))),s||localStorage.removeItem("activeLeagueId"),t.textContent=s?s.name:"Inicia Liga";const i=e.map(o=>`
    <button class="navbar__dropdown-item ${String(o.id)===String(s==null?void 0:s.id)?"navbar__dropdown-item--active":""}" data-league-id="${o.id}">${o.name}</button>
  `).join("");a.innerHTML=`
    ${i}
    <a href="#/ligas" class="navbar__dropdown-item navbar__dropdown-item--muted">
      <svg viewBox="0 0 24 24" fill="currentColor" width="13" height="13" aria-hidden="true"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/></svg>
      Ver ligas disponibles
    </a>
  `}function G(){const e=window.location.hash.slice(1).split("?")[0]||"/";document.querySelectorAll(".bottom-nav__item").forEach(a=>{const t=a.dataset.route,n=t==="/"?e==="/":e===t||e.startsWith(t+"/");a.classList.toggle("bottom-nav__item--active",n)})}Ne();
