(function(){const a=document.createElement("link").relList;if(a&&a.supports&&a.supports("modulepreload"))return;for(const s of document.querySelectorAll('link[rel="modulepreload"]'))n(s);new MutationObserver(s=>{for(const i of s)if(i.type==="childList")for(const o of i.addedNodes)o.tagName==="LINK"&&o.rel==="modulepreload"&&n(o)}).observe(document,{childList:!0,subtree:!0});function t(s){const i={};return s.integrity&&(i.integrity=s.integrity),s.referrerPolicy&&(i.referrerPolicy=s.referrerPolicy),s.crossOrigin==="use-credentials"?i.credentials="include":s.crossOrigin==="anonymous"?i.credentials="omit":i.credentials="same-origin",i}function n(s){if(s.ep)return;s.ep=!0;const i=t(s);fetch(s.href,i)}})();const ce="https://pickgoal-backend.onrender.com/api";function pe(){return localStorage.getItem("token")}async function g(e,a={}){const t={"Content-Type":"application/json",...a.headers},n=pe();n&&(t.Authorization=`Bearer ${n}`);const s=await fetch(`${ce}${e}`,{...a,headers:t}),i=await s.json().catch(()=>({}));if(!s.ok)throw{status:s.status,message:i.error||"Error desconocido"};return i}const p={get:e=>g(e),post:(e,a)=>g(e,{method:"POST",body:JSON.stringify(a)}),patch:(e,a)=>g(e,{method:"PATCH",body:JSON.stringify(a)}),delete:e=>g(e,{method:"DELETE"}),auth:{register:e=>g("/auth/register",{method:"POST",body:JSON.stringify(e)}),login:e=>g("/auth/login",{method:"POST",body:JSON.stringify(e)}),me:()=>g("/auth/me"),forgotPassword:e=>g("/auth/forgot-password",{method:"POST",body:JSON.stringify({email:e})}),resetPassword:(e,a)=>g("/auth/reset-password",{method:"POST",body:JSON.stringify({token:e,password:a})}),ranking:e=>g(`/auth/ranking${e?`?league_id=${e}`:""}`),users:()=>g("/auth/users"),toggleAdmin:e=>g(`/auth/users/${e}/toggle-admin`,{method:"PATCH"})},matches:{grouped:()=>g("/matches/grouped"),list:(e="")=>g(`/matches/${e}`),get:e=>g(`/matches/${e}`),sync:()=>g("/matches/sync",{method:"POST"})},predictions:{mine:e=>g(`/predictions/${e?`?league_id=${e}`:""}`),forMatch:(e,a)=>g(`/predictions/match/${e}${a?`?league_id=${a}`:""}`),save:e=>g("/predictions/",{method:"POST",body:JSON.stringify(e)}),forUser:(e,a)=>g(`/predictions/user/${e}${a?`?league_id=${a}`:""}`),getChampion:e=>g(`/predictions/champion${e?`?league_id=${e}`:""}`),saveChampion:(e,a)=>g("/predictions/champion",{method:"POST",body:JSON.stringify({team_name:e,league_id:a??null})}),awardChampion:e=>g("/predictions/champion/award",{method:"POST",body:JSON.stringify({team_name:e})})},leagues:{all:()=>g("/leagues/all"),public:()=>g("/leagues/public"),my:()=>g("/leagues/my"),create:e=>g("/leagues/",{method:"POST",body:JSON.stringify(e)}),join:e=>g("/leagues/join",{method:"POST",body:JSON.stringify(e)}),joinByCode:e=>g(`/leagues/join/${encodeURIComponent(e)}`),adminAll:()=>g("/leagues/admin"),get:e=>g(`/leagues/${e}`),update:(e,a)=>g(`/leagues/${e}`,{method:"PUT",body:JSON.stringify(a)}),leave:e=>g(`/leagues/${e}/leave`,{method:"DELETE"}),members:e=>g(`/leagues/${e}/members`),matchPredictions:(e,a)=>g(`/leagues/${e}/predictions/${a}`)},home:{summary:()=>g("/home/summary")},board:{messages:(e=1,a=null)=>g(`/board/?page=${e}${a?`&league_id=${a}`:""}`),unread:(e,a)=>g(`/board/unread?league_id=${e}&since=${encodeURIComponent(a)}`),post:(e,a=null)=>g("/board/",{method:"POST",body:JSON.stringify({message:e,league_id:a})}),pin:e=>g(`/board/${e}/pin`,{method:"POST"}),reply:(e,a)=>g(`/board/${e}/reply`,{method:"POST",body:JSON.stringify({message:a})}),delete:e=>g(`/board/${e}`,{method:"DELETE"})},notifications:{vapidPublicKey:()=>g("/notifications/vapid-public-key"),subscribe:e=>g("/notifications/subscribe",{method:"POST",body:JSON.stringify(e)}),send:e=>g("/notifications/send",{method:"POST",body:JSON.stringify(e)})}};let T=null;const y={async init(){if(localStorage.getItem("token"))try{const{user:a}=await p.auth.me();T=a}catch{localStorage.removeItem("token")}},setUser(e,a){T=e,localStorage.setItem("token",a),document.dispatchEvent(new CustomEvent("auth:change",{detail:e}))},logout(){T=null,localStorage.removeItem("token"),document.dispatchEvent(new CustomEvent("auth:change",{detail:null}))},getUser(){return T},isLoggedIn(){return!!T},isAdmin(){return(T==null?void 0:T.is_admin)===!0}};let R=null;function v(e,a="success"){let t=document.getElementById("toast");t||(t=document.createElement("div"),t.id="toast",document.body.appendChild(t)),t.textContent=e,t.className=`toast toast--${a} toast--visible`,R&&clearTimeout(R),R=setTimeout(()=>{t.classList.remove("toast--visible")},3e3)}function te(){return`
    <div class="container">
      <div class="league-gate">
        <div class="league-gate__icon">⚽</div>
        <h2 class="league-gate__title">¡Inicia tu Liga!</h2>
        <p class="league-gate__text">Únete a una liga para empezar a predecir</p>
        <a href="#/ligas" class="btn btn--primary">Ver ligas disponibles</a>
      </div>
    </div>
  `}function M(e){return e?new Date(e).toLocaleString("es-ES",{day:"2-digit",month:"2-digit",year:"numeric",hour:"2-digit",minute:"2-digit"}):"—"}async function ue(e){if(!y.getUser()){me(e);return}e.innerHTML='<div class="loading"><div class="loading__spinner"></div></div>';try{const{leagues_summary:t,upcoming_matches:n}=await p.home.summary();if(t.length===0){ge(e);return}const s=(()=>{const o=localStorage.getItem("activeLeagueId");return o?parseInt(o):null})(),i=[...t].sort((o,l)=>o.league_id===s?-1:l.league_id===s?1:0);e.innerHTML=`
      <div class="home-dashboard container">
        <div class="home-dashboard__topbar">
          <button class="btn btn--ghost btn--sm" id="btnPointsInfo">📊 Sistema de puntos</button>
        </div>
        <div class="home-dashboard__leagues">
          ${i.map(o=>ve(o)).join("")}
        </div>
        ${fe(n)}
      </div>
      ${he()}
    `,be(e),e.querySelectorAll(".league-card[data-league-id]").forEach(o=>{o.style.cursor="pointer",o.addEventListener("click",l=>{l.target.closest("[data-go-ranking]")||l.target.closest("a")||(localStorage.setItem("activeLeagueId",o.dataset.leagueId),L.navigate(`/ligas/${o.dataset.leagueId}`))})}),e.querySelectorAll("[data-go-ranking]").forEach(o=>{o.addEventListener("click",l=>{l.stopPropagation(),localStorage.setItem("activeLeagueId",o.dataset.goRanking),L.navigate("/ranking")})})}catch(t){e.innerHTML=`<div class="container"><p class="form__error">Error cargando el inicio: ${t.message}</p></div>`}}function me(e){e.innerHTML=`
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
  `}function ge(e){e.innerHTML=`
    <section class="hero">
      <div class="hero__content">
        <img src="/assets/logo-completo.jpg" alt="PickGoal" class="hero__logo-img" />
        <p class="hero__subtitle">Únete a una liga y empieza a predecir el Mundial 2026</p>
        <div class="hero__cta">
          <a href="#/ligas" class="btn btn--primary btn--lg">Unirse a una liga</a>
        </div>
      </div>
    </section>
  `}function _e(e){return`${e}º`}function ve(e){const a=e.next_to_predict?`<div class="league-card__next">
         <span class="league-card__next-label">Próximo a predecir</span>
         <span class="league-card__next-match">${e.next_to_predict.home_team} vs ${e.next_to_predict.away_team}</span>
         <span class="league-card__next-date">${M(e.next_to_predict.match_datetime)}</span>
       </div>`:`<div class="league-card__next league-card__next--done">
         Todos los partidos predichos
       </div>`;return`
    <div class="league-card" data-league-id="${e.league_id}">
      <div class="league-card__header">
        <h2 class="league-card__name">${e.league_name}</h2>
        <span class="league-card__rank">${_e(e.rank)} de ${e.member_count}</span>
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
      <button class="league-card__cta btn btn--ghost btn--sm" data-go-ranking="${e.league_id}">Ver clasificación</button>
    </div>
  `}function he(){return`
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
  `}function be(e){const a=e.querySelector("#pointsModal"),t=e.querySelector("#btnPointsInfo"),n=e.querySelector("#pointsClose"),s=e.querySelector("#pointsOverlay");function i(){a.classList.add("points-modal--open"),document.body.style.overflow="hidden"}function o(){a.classList.remove("points-modal--open"),document.body.style.overflow=""}t==null||t.addEventListener("click",i),n==null||n.addEventListener("click",o),s==null||s.addEventListener("click",o),document.addEventListener("keydown",l=>{l.key==="Escape"&&o()},{once:!1})}function fe(e){return e.length?`
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
  `:""}const J="pickgoal_welcome_shown";function se(e="/ligas"){if(localStorage.getItem(J))return;localStorage.setItem(J,"1");const a=document.createElement("div");a.innerHTML=`
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
  `;const t=a.firstElementChild;document.body.appendChild(t),document.body.style.overflow="hidden",requestAnimationFrame(()=>t.classList.add("welcome-modal--open"));function n(s){t.classList.remove("welcome-modal--open"),document.body.style.overflow="",t.addEventListener("transitionend",()=>t.remove(),{once:!0}),s&&(window.location.hash=s)}document.getElementById("welcomeOverlay").addEventListener("click",()=>n()),document.getElementById("welcomeCta").addEventListener("click",()=>n(e)),document.addEventListener("keydown",function s(i){i.key==="Escape"&&(n(),document.removeEventListener("keydown",s))})}function ye(e){e.innerHTML=`
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
  `,document.getElementById("loginForm").addEventListener("submit",async a=>{a.preventDefault();const t=document.getElementById("loginBtn"),n=document.getElementById("loginError"),s=document.getElementById("identifier").value.trim(),i=document.getElementById("password").value;t.disabled=!0,t.textContent="Entrando…",n.classList.add("hidden");try{const{token:o,user:l}=await p.auth.login({identifier:s,password:i});y.setUser(l,o),v(`¡Bienvenido, ${l.username}!`),L.navigate("/quiniela"),se("/quiniela")}catch(o){n.textContent=o.message||"Error al iniciar sesión",n.classList.remove("hidden")}finally{t.disabled=!1,t.textContent="Entrar"}})}function $e(e){e.innerHTML=`
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
  `,document.getElementById("registerForm").addEventListener("submit",async a=>{a.preventDefault();const t=document.getElementById("registerBtn"),n=document.getElementById("registerError");t.disabled=!0,t.textContent="Creando cuenta…",n.classList.add("hidden");const s={username:document.getElementById("username").value.trim(),email:document.getElementById("email").value.trim(),country:document.getElementById("country").value.trim(),password:document.getElementById("password").value};try{const{token:i,user:o}=await p.auth.register(s);y.setUser(o,i),v("¡Cuenta creada! Bienvenido a PickGoal");const l=sessionStorage.getItem("pendingInviteCode");if(l){sessionStorage.removeItem("pendingInviteCode");try{const{league:c}=await p.leagues.joinByCode(l);v(`¡Te has unido a "${c.name}"!`),L.navigate(`/ligas/${c.id}`)}catch{L.navigate("/ligas")}}else L.navigate("/campeon"),se("/ligas")}catch(i){n.textContent=i.message||"Error al registrarse",n.classList.remove("hidden")}finally{t.disabled=!1,t.textContent="Crear cuenta"}})}function V(){const e=localStorage.getItem("activeLeagueId");return e?parseInt(e):null}async function Ee(e){var a,t;e.innerHTML='<div class="loading"><div class="loading__spinner"></div></div>';try{let n=null;if(y.isLoggedIn()){const{leagues:$}=await p.leagues.my();if($.length===0){e.innerHTML=te();return}const w=V(),C=$.find(r=>r.id===w);n=C?C.name:((a=$[0])==null?void 0:a.name)??null}const s=V(),[{groups:i},o,l]=await Promise.all([p.matches.grouped(),y.isLoggedIn()?p.predictions.mine(s):Promise.resolve({predictions:[]}),y.isLoggedIn()?p.predictions.getChampion(s):Promise.resolve({champion_prediction:null})]),c={};for(const $ of o.predictions)c[$.match_id]=$;const m=i.flatMap($=>$.matches),_=new Map;for(const $ of m){const w=W($.match_datetime);_.has(w)||_.set(w,[]),_.get(w).push($)}const u=[..._.keys()].sort(),b=W(new Date().toISOString()),h=u.find($=>$>=b)??u[0],f=((t=l.champion_prediction)==null?void 0:t.team_name)??null,S=y.isLoggedIn()?f?`<p class="champion-banner champion-banner--set">🏆 Tu campeón: <a href="#/campeon" style="color:inherit;font-weight:bold;">${f}</a></p>`:'<p class="champion-banner champion-banner--missing">⚠️ <a href="#/campeon">¡Elige tu campeón antes del inicio del torneo!</a></p>':"";e.innerHTML=`
      ${n?`<span class="page-league-name">${n}</span>`:""}
      <div class="container">
        <h1 class="page-title">Pronósticos — Mundial 2026</h1>
        ${S}
        ${y.isLoggedIn()?"":'<p class="notice">⚠️ <a href="#/login">Inicia sesión</a> para guardar tus predicciones.</p>'}
        <nav class="date-nav" id="dateNav"></nav>
        <div id="matchesContent"></div>
      </div>
    `,Le(u,h,_,c,s)}catch(n){e.innerHTML=`<div class="container"><p class="form__error">Error cargando los partidos: ${n.message}</p></div>`}}function Le(e,a,t,n,s){var o;const i=document.getElementById("dateNav");i&&(i.innerHTML=e.map(l=>`
    <button class="date-nav__btn ${l===a?"date-nav__btn--active":""}" data-day="${l}">
      ${we(l)}
    </button>
  `).join(""),(o=i.querySelector(".date-nav__btn--active"))==null||o.scrollIntoView({inline:"center",behavior:"instant",block:"nearest"}),i.querySelectorAll(".date-nav__btn").forEach(l=>{l.addEventListener("click",()=>{i.querySelectorAll(".date-nav__btn").forEach(c=>c.classList.remove("date-nav__btn--active")),l.classList.add("date-nav__btn--active"),X(t.get(l.dataset.day)??[],n,s)})}),X(t.get(a)??[],n,s))}function X(e,a,t){const n=document.getElementById("matchesContent");if(n){if(e.length===0){n.innerHTML='<p class="empty">Sin partidos este día.</p>';return}n.innerHTML=`<div class="matches-grid">${e.map(s=>Ie(s,a[s.id])).join("")}</div>`,y.isLoggedIn()&&n.querySelectorAll(".prediction-form").forEach(s=>{xe(s,a,t)})}}function W(e){const a=new Date(e);return`${a.getFullYear()}-${String(a.getMonth()+1).padStart(2,"0")}-${String(a.getDate()).padStart(2,"0")}`}function we(e){const[a,t,n]=e.split("-").map(Number);return new Date(a,t-1,n).toLocaleDateString("es-ES",{day:"numeric",month:"short"})}function Ie(e,a){const t=e.is_locked,n=a?`<span class="pts-badge">${a.total_points} pts</span>`:"",s={scheduled:"Programado",live:"🔴 En juego",finished:"Finalizado"}[e.status];return`
    <div class="match-card ${t?"match-card--locked":""}" data-match-id="${e.id}">
      <div class="match-card__header">
        <span class="match-card__status">${s}</span>
        <span class="match-card__date">${M(e.match_datetime)}</span>
        ${n}
      </div>
      <div class="match-card__teams">
        <span class="team team--home">${e.home_team}</span>
        <div class="match-card__score">
          ${e.status!=="scheduled"?`<span class="score">${e.home_score_90??"?"} - ${e.away_score_90??"?"}</span>`:'<span class="score score--dash">vs</span>'}
        </div>
        <span class="team team--away">${e.away_team}</span>
      </div>
      ${!t&&y.isLoggedIn()?Se(e,a):t&&a?`<div class="prediction-result">
               Tu predicción: <strong>${a.predicted_home}-${a.predicted_away}</strong>
               (${a.predicted_result}) · ${a.total_points} pts
             </div>`:""}
    </div>
  `}function Se(e,a){const t=!!a,n=(a==null?void 0:a.predicted_home)??0,s=(a==null?void 0:a.predicted_away)??0,i=(a==null?void 0:a.predicted_result)??"X",o=t?"prediction-form--saved":"prediction-form--unsaved",l=t?'<span class="pred-status pred-status--saved">✓ Guardado</span>':'<span class="pred-status pred-status--unsaved">Sin predicción</span>',c=t?"btn btn--saved btn--sm pred-save-btn":"btn btn--ghost btn--sm pred-save-btn",m=t?"✓ Guardado":"Guardar";return`
    <form class="prediction-form ${o}" data-match-id="${e.id}" data-saved="${t}">
      ${l}
      <div class="result-selector">
        ${["1","X","2"].map(_=>`
          <label class="result-selector__option">
            <input type="radio" name="predicted_result" value="${_}" ${i===_?"checked":""} required />
            ${_}
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
      <button type="submit" class="${c}">${m}</button>
    </form>
  `}function xe(e,a,t){const n=parseInt(e.dataset.matchId),s=e.querySelector(".pred-save-btn"),i=e.querySelector(".pred-status");let o=e.dataset.saved==="true";function l(){e.classList.contains("prediction-form--dirty")||(e.classList.remove("prediction-form--saved","prediction-form--unsaved"),e.classList.add("prediction-form--dirty"),s.className="btn btn--primary btn--sm pred-save-btn",s.textContent="Guardar",i&&(i.className="pred-status pred-status--unsaved",i.textContent="Sin guardar"))}function c(){o=!0,e.classList.remove("prediction-form--unsaved","prediction-form--dirty"),e.classList.add("prediction-form--saved"),s.className="btn btn--saved btn--sm pred-save-btn",s.textContent="✓ Guardado",s.disabled=!1,i&&(i.className="pred-status pred-status--saved",i.textContent="✓ Guardado")}e.querySelectorAll("input").forEach(m=>{m.addEventListener("change",l),m.addEventListener("input",l)}),e.addEventListener("submit",async m=>{var h;m.preventDefault();const _=parseInt(e.querySelector("[name=predicted_home]").value),u=parseInt(e.querySelector("[name=predicted_away]").value),b=(h=e.querySelector("[name=predicted_result]:checked"))==null?void 0:h.value;if(!(isNaN(_)||isNaN(u)||!b)){s.disabled=!0,s.textContent="…";try{const{prediction:f}=await p.predictions.save({match_id:n,predicted_result:b,predicted_home:_,predicted_away:u,league_id:t??null});a[n]=f,v("Predicción guardada"),c()}catch(f){v(f.message||"Error al guardar","error"),s.disabled=!1,o?(s.className="btn btn--saved btn--sm pred-save-btn",s.textContent="✓ Guardado"):(s.className="btn btn--primary btn--sm pred-save-btn",s.textContent="Guardar")}}})}function ke(){const e=localStorage.getItem("activeLeagueId");return e?parseInt(e):null}async function Ce(e){var a;e.innerHTML='<div class="loading"><div class="loading__spinner"></div></div>';try{if(y.isLoggedIn()){const{leagues:_}=await p.leagues.my();if(_.length===0){e.innerHTML=te();return}}const t=ke(),[{ranking:n},s]=await Promise.all([p.auth.ranking(t),y.isLoggedIn()?p.leagues.my():Promise.resolve({leagues:[]})]),i=y.getUser(),o=s.leagues.find(_=>_.id===t),l=document.getElementById("tablonBadge"),c=l&&!l.classList.contains("hidden"),m=c?l.textContent:"";e.innerHTML=`
      ${o?`<span class="page-league-name">${o.name}</span>`:""}
      <div class="container">
        <div class="ranking-header">
          <h1 class="page-title">Clasificación</h1>
          ${t?`
            <button class="ranking-tablon-btn" data-league-id="${t}">
              💬 Tablón
              <span class="ranking-tablon-btn__badge${c?"":" hidden"}">${m}</span>
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
              ${n.map(_=>{var u,b;return`
                <tr class="${i&&_.id===i.id?"ranking-table__row--me":""}">
                  <td class="ranking-table__pos" data-pos="${_.position}">${_.position}</td>
                  <td>
                    <a class="ranking-table__link" href="#/jugador/${_.id}">
                      <span class="status-emoji" title="${((u=_.status)==null?void 0:u.name)||""}">${((b=_.status)==null?void 0:b.emoji)||""}</span>${_.username}
                    </a>
                  </td>
                  <td>${_.country||"—"}</td>
                  <td class="ranking-table__pts">${_.total_points}</td>
                  <td class="ranking-table__stat">${_.correct_results}</td>
                  <td class="ranking-table__stat">${_.exact_scores}</td>
                </tr>
              `}).join("")}
            </tbody>
          </table>
        </div>
      </div>
    `,(a=e.querySelector(".ranking-tablon-btn"))==null||a.addEventListener("click",()=>{L.navigate(`/tablon?liga=${t}`)})}catch(t){e.innerHTML=`<div class="container"><p class="form__error">Error: ${t.message}</p></div>`}}async function ne(e,{query:a={}}={}){e.innerHTML='<div class="loading"><div class="loading__spinner"></div></div>';const t=y.getUser();let n=a.liga?parseInt(a.liga):null;if(n){localStorage.setItem(`tablon_last_read_${n}`,new Date().toISOString());const r=document.getElementById("tablonBadge");r&&(r.classList.add("hidden"),r.textContent="")}let s=null,i=[],o=1,l=1;try{if(!n&&t){const{leagues:r}=await p.leagues.my();r&&r.length&&(n=r[0].id,s=r[0].name)}else if(n)try{const{league:r}=await p.leagues.get(n);s=r.name}catch{}if(n&&t)try{const{members:r}=await p.leagues.members(n);i=r||[]}catch{}}catch{}async function c(){const r=await p.board.messages(o,n);return l=r.pages||1,r}try{const r=await c();m(r)}catch(r){e.innerHTML=`<div class="container"><p class="form__error">Error: ${r.message}</p></div>`}function m(r){const{pinned:d=[],messages:E=[]}=r;e.innerHTML=`
      <div class="container">
        <div class="board-header">
          <h1 class="page-title">Tablón${s?` · ${s}`:""}</h1>
          ${s?'<span class="board-league-badge">🏆 Liga</span>':'<span class="board-general-badge">🌐 General</span>'}
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

        ${d.length?`<section class="board-section">
               <h2 class="board-section__title">📌 Anuncios fijados</h2>
               <div class="board-pinned" id="boardPinned">
                 ${_(d)}
               </div>
             </section>`:""}

        <section class="board-section">
          ${d.length?'<h2 class="board-section__title">💬 Mensajes</h2>':""}
          <div class="board-messages" id="boardMessages">
            ${b(E)}
          </div>
          ${l>1?`<div class="pagination">
                 <button class="btn btn--ghost btn--sm" id="prevPage" ${o<=1?"disabled":""}>← Anterior</button>
                 <span>Página ${o} / ${l}</span>
                 <button class="btn btn--ghost btn--sm" id="nextPage" ${o>=l?"disabled":""}>Siguiente →</button>
               </div>`:""}
        </section>
      </div>
    `,f(),S(),$()}function _(r){return r.length?r.map(d=>`
      <div class="board-message board-message--pinned" data-id="${d.id}">
        <div class="board-message__header">
          <span class="board-message__pin-badge">📌</span>
          <strong class="board-message__author">${B(d.username)}</strong>
          <span class="board-message__date">${M(d.created_at)}</span>
          ${t!=null&&t.is_admin&&!d.is_deleted?`<button class="btn btn--ghost btn--xs unpin-msg" data-id="${d.id}" title="Desfijar">📌✕</button>`:""}
          ${!d.is_deleted&&t&&(t.id===d.user_id||t.is_admin)?`<button class="btn btn--danger btn--xs delete-msg" data-id="${d.id}">✕</button>`:""}
        </div>
        <p class="board-message__text">${h(d.message)}</p>

        ${d.replies&&d.replies.length?`<div class="board-replies">
               ${d.replies.map(E=>u(E)).join("")}
             </div>`:""}

        ${t&&!d.is_deleted?`<form class="reply-form" id="replyForm-${d.id}" data-parent="${d.id}">
               <div class="reply-form__input-wrap">
                 <input class="form__input reply-input" type="text"
                   placeholder="Responder…" maxlength="500"
                   id="replyInput-${d.id}" />
                 <div class="mention-dropdown hidden" id="mentionDropdown-${d.id}"></div>
               </div>
               <button class="btn btn--outline btn--sm" type="submit">Enviar</button>
             </form>`:""}
      </div>
    `).join(""):""}function u(r){return`
      <div class="board-reply ${r.is_deleted?"board-reply--deleted":""}" data-id="${r.id}">
        <div class="board-reply__header">
          <strong class="board-reply__author">${B(r.username)}</strong>
          <span class="board-reply__date">${M(r.created_at)}</span>
          ${!r.is_deleted&&t&&(t.id===r.user_id||t.is_admin)?`<button class="btn btn--danger btn--xs delete-msg" data-id="${r.id}">✕</button>`:""}
        </div>
        <p class="board-reply__text">${h(r.message)}</p>
      </div>
    `}function b(r){return r.length?r.map(d=>`
      <div class="board-message ${d.is_deleted?"board-message--deleted":""}" data-id="${d.id}">
        <div class="board-message__header">
          <strong class="board-message__author">${B(d.username)}</strong>
          <span class="board-message__date">${M(d.created_at)}</span>
          ${t!=null&&t.is_admin&&!d.is_deleted?`<button class="btn btn--ghost btn--xs pin-msg" data-id="${d.id}" title="Fijar">📌</button>`:""}
          ${!d.is_deleted&&t&&(t.id===d.user_id||t.is_admin)?`<button class="btn btn--danger btn--xs delete-msg" data-id="${d.id}">✕</button>`:""}
        </div>
        <p class="board-message__text">${h(d.message)}</p>
      </div>
    `).join(""):'<p class="empty">Sin mensajes aún. ¡Sé el primero!</p>'}function h(r){const d=B(r);if(!i.length)return d;const E=i.map(I=>Pe(I.username)),x=new RegExp(`@(${E.join("|")})`,"gi");return d.replace(x,'<span class="mention">@$1</span>')}function f(){const r=document.getElementById("boardForm");if(!r)return;const d=document.getElementById("boardMsg"),E=document.getElementById("charCounter"),x=document.getElementById("mentionDropdown");d.addEventListener("input",()=>{E.textContent=`${d.value.length} / 500`,C(d,x)}),r.addEventListener("submit",async I=>{I.preventDefault();const j=d.value.trim();if(j)try{await p.board.post(j,n),d.value="",E.textContent="0 / 500",x.classList.add("hidden");const P=await c();w(P),v("Mensaje publicado")}catch(P){v(P.message,"error")}})}function S(){e.querySelectorAll(".reply-form").forEach(r=>{const d=parseInt(r.dataset.parent),E=r.querySelector(".reply-input"),x=`mentionDropdown-${d}`,I=document.getElementById(x);E==null||E.addEventListener("input",()=>{C(E,I)}),r.addEventListener("submit",async j=>{j.preventDefault();const P=E.value.trim();if(P)try{await p.board.reply(d,P),E.value="",I==null||I.classList.add("hidden");const N=await c();w(N),v("Respuesta enviada")}catch(N){v(N.message,"error")}})}),e.querySelectorAll(".pin-msg").forEach(r=>{r.addEventListener("click",async()=>{try{await p.board.pin(r.dataset.id);const d=await c();w(d),v("Mensaje fijado")}catch(d){v(d.message,"error")}})}),e.querySelectorAll(".unpin-msg").forEach(r=>{r.addEventListener("click",async()=>{try{await p.board.pin(r.dataset.id);const d=await c();w(d),v("Mensaje desfijado")}catch(d){v(d.message,"error")}})})}function $(){e.querySelectorAll(".delete-msg").forEach(r=>{r.addEventListener("click",async()=>{if(confirm("¿Eliminar este mensaje?"))try{await p.board.delete(r.dataset.id);const d=await c();w(d),v("Mensaje eliminado")}catch(d){v(d.message,"error")}})})}function w(r){const{pinned:d=[],messages:E=[]}=r,x=document.getElementById("boardPinned");if(x)x.innerHTML=_(d);else if(d.length){m(r);return}const I=document.getElementById("boardMessages");I&&(I.innerHTML=b(E)),S(),$()}e.addEventListener("click",async r=>{if(r.target.id==="prevPage"&&o>1){o--;const d=await c();w(d)}else if(r.target.id==="nextPage"&&o<l){o++;const d=await c();w(d)}});function C(r,d){if(!d||!i.length)return;const E=r.value,x=r.selectionStart,I=E.slice(0,x),j=I.match(/@(\w*)$/);if(!j){d.classList.add("hidden");return}const P=j[1].toLowerCase(),N=i.filter(k=>k.username.toLowerCase().startsWith(P)&&k.id!==(t==null?void 0:t.id)),F=[...y.isAdmin()&&"todos".startsWith(P)?[{username:"todos",description:"Notificar a todos los miembros"}]:[],...N.slice(0,6)];if(!F.length){d.classList.add("hidden");return}d.innerHTML=F.map(k=>k.description?`<div class="mention-item mention-item--broadcast" data-username="${B(k.username)}">
             <span class="mention-item__name">@${B(k.username)}</span>
             <span class="mention-item__desc">${B(k.description)}</span>
           </div>`:`<div class="mention-item" data-username="${B(k.username)}">${B(k.username)}</div>`).join(""),d.classList.remove("hidden"),d.querySelectorAll(".mention-item").forEach(k=>{k.addEventListener("mousedown",le=>{le.preventDefault();const de=k.dataset.username,O=I.replace(/@(\w*)$/,`@${de} `);if(r.value=O+E.slice(x),r.setSelectionRange(O.length,O.length),d.classList.add("hidden"),r.tagName==="TEXTAREA"){const z=document.getElementById("charCounter");z&&(z.textContent=`${r.value.length} / 500`)}})})}document.addEventListener("click",r=>{!r.target.closest(".board-form__input-wrap")&&!r.target.closest(".reply-form__input-wrap")&&document.querySelectorAll(".mention-dropdown").forEach(d=>d.classList.add("hidden"))},{capture:!0})}function B(e){return String(e).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;")}function Pe(e){return e.replace(/[.*+?^${}()|[\]\\]/g,"\\$&")}async function Be(e){var a,t,n,s;e.innerHTML='<div class="loading"><div class="loading__spinner"></div></div>';try{const i=y.getUser(),o=i==null?void 0:i.is_admin,[l,c]=await Promise.all([o?p.leagues.adminAll():p.leagues.all(),y.isLoggedIn()&&!o?p.leagues.my():Promise.resolve({leagues:[]})]),m=new Set(c.leagues.map(u=>u.id)),_=o?l.leagues:l.leagues.filter(u=>!m.has(u.id));e.innerHTML=`
      <div class="container">
        <h1 class="page-title">Ligas</h1>

        ${o?`
          <div class="admin-notice">Vista administrador — puedes acceder a cualquier liga sin participar en ella.</div>
        `:""}

        ${i&&!o&&c.leagues.length>0?`
          <section class="section">
            <h2>Mis ligas</h2>
            <div class="leagues-grid">${c.leagues.map(u=>K(u,!0)).join("")}</div>
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
          ${_.length?`<div class="leagues-grid">${_.map(u=>K(u,!1,m,o)).join("")}</div>`:o?'<p class="empty">No hay ligas creadas aún.</p>':c.leagues.length>0?'<p class="empty">Ya participas en todas las ligas disponibles.</p>':'<p class="empty">No hay ligas aún. ¡Crea la primera!</p>'}
        </section>
      </div>
    `,e.querySelectorAll('.league-card[data-navigate="true"]').forEach(u=>{u.addEventListener("click",()=>L.navigate(`/ligas/${u.dataset.id}`))}),e.querySelectorAll(".btn-join-league").forEach(u=>{u.addEventListener("click",async b=>{b.stopPropagation();const h=parseInt(u.dataset.id);u.disabled=!0,u.textContent="…";try{const{league:f}=await p.leagues.join({league_id:h});v(`¡Te has unido a "${f.name}"!`),L.navigate(`/ligas/${f.id}`)}catch(f){v(f.message,"error"),u.disabled=!1,u.textContent="Unirse"}})}),e.querySelectorAll(".btn-private-info").forEach(u=>{u.addEventListener("click",b=>{b.stopPropagation(),v("Esta liga es privada. Pide el enlace de invitación a cualquier miembro para unirte.","info")})}),(a=document.getElementById("btnShowCreate"))==null||a.addEventListener("click",()=>{var u,b;(u=document.getElementById("createLeaguePanel"))==null||u.classList.remove("hidden"),(b=document.getElementById("btnShowCreate"))==null||b.classList.add("hidden")}),(t=document.getElementById("btnCancelCreate"))==null||t.addEventListener("click",()=>{var u,b;(u=document.getElementById("createLeaguePanel"))==null||u.classList.add("hidden"),(b=document.getElementById("btnShowCreate"))==null||b.classList.remove("hidden")}),(n=document.getElementById("joinCodeForm"))==null||n.addEventListener("submit",async u=>{u.preventDefault();const b=document.getElementById("inviteCode").value.trim().toUpperCase();if(b)try{const{league:h}=await p.leagues.join({invite_code:b});v(`Te has unido a "${h.name}"`),L.navigate(`/ligas/${h.id}`)}catch(h){v(h.message,"error")}}),(s=document.getElementById("createLeagueForm"))==null||s.addEventListener("submit",async u=>{var C;u.preventDefault();const b=document.getElementById("createBtn");b.disabled=!0,b.textContent="Creando…";const h=document.getElementById("leagueName").value.trim(),f=document.getElementById("leagueDesc").value.trim(),S=document.getElementById("leaguePrize").value.trim(),$=document.getElementById("isPublic").checked,w=((C=document.getElementById("isOfficial"))==null?void 0:C.checked)??!1;try{const{league:r}=await p.leagues.create({name:h,description:f,prize:S,is_public:$,is_official:w});Te(r)}catch(r){v(r.message,"error"),b.disabled=!1,b.textContent="Crear liga"}})}catch(i){e.innerHTML=`<div class="container"><p class="form__error">Error: ${i.message}</p></div>`}}function K(e,a=!1,t=new Set,n=!1){const s=e.is_official?'<span class="league-badge league-badge--official">⭐ Oficial</span>':"",i=e.is_public?"🌍":"🔒",o=n?`<button class="btn btn--sm btn--outline btn-admin-view" data-id="${e.id}">Ver (admin)</button>`:a?`<button class="btn btn--sm btn--outline" onclick="event.stopPropagation(); window.location.hash='/ligas/${e.id}'">Ver liga</button>`:e.is_public?`<button class="btn btn--sm btn--primary btn-join-league" data-id="${e.id}">Unirse</button>`:'<button class="btn btn--sm btn--ghost btn-private-info">🔒 Solicitar enlace</button>';return`
    <div class="league-card ${a?"league-card--mine":""}" data-id="${e.id}" data-navigate="${a||n||e.is_public}">
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
  `}function Te(e){var n,s;const a=e.invite_link||"",t=document.getElementById("createLeaguePanel");t&&(t.innerHTML=`
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
  `,(n=document.getElementById("btnCopyLink"))==null||n.addEventListener("click",async()=>{try{await navigator.clipboard.writeText(a),v("Enlace copiado")}catch{v("No se pudo copiar","error")}}),(s=document.getElementById("btnShare"))==null||s.addEventListener("click",async()=>{try{await navigator.share({title:`Únete a ${e.name} en PickGoal`,url:a})}catch{}}))}async function Me(e,{params:a}){var n,s,i,o,l;const t=parseInt(a.id);e.innerHTML='<div class="loading"><div class="loading__spinner"></div></div>';try{const c=await p.leagues.get(t),{league:m,ranking:_,is_member:u,is_admin_view:b}=c,h=y.getUser(),f=m.is_official?'<span class="league-badge league-badge--official">⭐ Oficial</span>':"";e.innerHTML=`
      <div class="container">
        <a href="#/ligas" class="back-link">← Volver a ligas</a>

        ${b?`
          <div class="admin-notice">Vista administrador — no participas en esta liga</div>
        `:""}

        <div class="league-header">
          <h1 class="page-title">${m.name} ${f}</h1>
          ${m.description?`<p class="league-header__desc">${m.description}</p>`:""}
          <div class="league-header__meta">
            <span>${m.is_public?"🌍 Pública":"🔒 Privada"}</span>
            <span>${m.member_count} participantes</span>
            ${m.prize?`<span>🏆 ${m.prize}</span>`:""}
          </div>
        </div>

        ${(u||h!=null&&h.is_admin)&&m.invite_link?`
          <div class="invite-share-box">
            <span class="invite-share-box__label">Enlace de invitación:</span>
            <div class="invite-link-box">
              <span class="invite-link-box__url">${m.invite_link}</span>
              <button class="btn btn--sm btn--outline" id="btnCopyInvite">Copiar</button>
              ${navigator.share?'<button class="btn btn--sm btn--ghost" id="btnShareInvite">Compartir</button>':""}
            </div>
          </div>
        `:""}

        <div class="league-actions">
          ${u?'<button class="btn btn--danger btn--sm" id="btnLeave">Abandonar liga</button>':!(h!=null&&h.is_admin)&&h?'<button class="btn btn--primary" id="btnJoin">Unirse a esta liga</button>':""}
          ${h!=null&&h.is_admin||u&&h&&m.created_by===h.id?'<button class="btn btn--outline btn--sm" id="btnEditLeague">Editar liga</button>':""}
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
              ${_.map(r=>`
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
    `,(n=document.getElementById("btnCopyInvite"))==null||n.addEventListener("click",async()=>{try{await navigator.clipboard.writeText(m.invite_link),v("Enlace copiado")}catch{v("No se pudo copiar","error")}}),(s=document.getElementById("btnShareInvite"))==null||s.addEventListener("click",async()=>{try{await navigator.share({title:`Únete a ${m.name} en PickGoal`,url:m.invite_link})}catch{}}),(i=document.getElementById("btnLeave"))==null||i.addEventListener("click",async()=>{if(confirm("¿Seguro que quieres abandonar esta liga?"))try{await p.leagues.leave(t),v("Has abandonado la liga"),L.navigate("/ligas")}catch(r){v(r.message,"error")}}),(o=document.getElementById("btnJoin"))==null||o.addEventListener("click",async()=>{try{await p.leagues.join({league_id:t}),v("¡Te has unido a la liga!"),L.navigate(`/ligas/${t}`)}catch(r){v(r.message,"error")}}),(l=document.getElementById("btnEditLeague"))==null||l.addEventListener("click",()=>{je(m,t,h)});const S=document.getElementById("tabRanking"),$=document.getElementById("tabTablon"),w=document.getElementById("sectionRanking"),C=document.getElementById("sectionTablon");S&&$&&(S.addEventListener("click",()=>{S.classList.add("league-tab--active"),$.classList.remove("league-tab--active"),w.classList.remove("hidden"),C.classList.add("hidden")}),$.addEventListener("click",()=>{$.classList.add("league-tab--active"),S.classList.remove("league-tab--active"),w.classList.add("hidden"),C.classList.remove("hidden");const r=document.getElementById("tablonEmbed");r&&!r.dataset.loaded&&(r.dataset.loaded="1",ne(r,{query:{liga:String(t)}}))}))}catch(c){e.innerHTML=`<div class="container"><p class="form__error">Error: ${c.message}</p><a href="#/ligas">Volver</a></div>`}}function je(e,a,t){const n=document.getElementById("editLeagueModal");n&&n.remove();const s=document.createElement("div");s.id="editLeagueModal",s.className="edit-league-modal",s.innerHTML=`
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
  `,document.body.appendChild(s),requestAnimationFrame(()=>s.classList.add("edit-league-modal--open"));const i=()=>{s.classList.remove("edit-league-modal--open"),s.addEventListener("transitionend",()=>s.remove(),{once:!0})};s.querySelector(".edit-league-modal__overlay").addEventListener("click",i),document.getElementById("btnCancelEdit").addEventListener("click",i),document.getElementById("editLeagueForm").addEventListener("submit",async o=>{o.preventDefault();const l=document.getElementById("btnSaveEdit");l.disabled=!0,l.textContent="Guardando…";const c={name:document.getElementById("editName").value.trim(),description:document.getElementById("editDesc").value.trim(),prize:document.getElementById("editPrize").value.trim(),is_public:document.getElementById("editPublic").checked};t!=null&&t.is_admin&&(c.is_official=document.getElementById("editOfficial").checked);try{await p.leagues.update(a,c),v("Liga actualizada"),i(),L.navigate(`/ligas/${a}`)}catch(m){v(m.message,"error"),l.disabled=!1,l.textContent="Guardar cambios"}})}async function He(e){var t,n;e.innerHTML='<div class="loading"><div class="loading__spinner"></div></div>';const a=y.getUser();try{const s=(()=>{const f=localStorage.getItem("activeLeagueId");return f?parseInt(f):null})(),[i,o,l,c,m]=await Promise.all([p.predictions.mine(s),p.predictions.getChampion(s),p.leagues.my(),p.auth.me(),a!=null&&a.is_admin?p.leagues.adminAll():Promise.resolve({leagues:[]})]),_=i.predictions.reduce((f,S)=>f+S.total_points,0)+(((t=o.champion_prediction)==null?void 0:t.points_earned)||0),u=c.user,b=u.status,h=u.total_points_all_time;e.innerHTML=`
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
          ${qe(b,h)}
          <button class="btn btn--danger" id="btnLogoutPerfil">Cerrar sesión</button>
          <div class="profile-card__stats">
            <div class="stat">
              <span class="stat__value">${_}</span>
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
          ${i.predictions.length?`<div class="predictions-list">${i.predictions.map(Ae).join("")}</div>`:'<p class="empty">Sin predicciones aún. <a href="#/quiniela">Ir a la quiniela</a></p>'}
        </section>

        <section class="section">
          <h2>Mis ligas</h2>
          ${l.leagues.length?`<ul class="leagues-list">${l.leagues.map(f=>`<li><a href="#/ligas/${f.id}">${f.name}</a> <span class="tag">${f.is_public?"Pública":"Privada"}</span></li>`).join("")}</ul>`:'<p class="empty">No perteneces a ninguna liga. <a href="#/ligas">Ver ligas</a></p>'}
        </section>

        ${a!=null&&a.is_admin&&m.leagues.length?`
          <section class="section">
            <h2>Ligas gestionadas</h2>
            <ul class="leagues-list">
              ${m.leagues.map(f=>`
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
    `,(n=e.querySelector("#btnLogoutPerfil"))==null||n.addEventListener("click",()=>{y.logout(),window.location.hash="/"})}catch(s){e.innerHTML=`<div class="container"><p class="form__error">Error: ${s.message}</p></div>`}}function qe(e,a){if(e.next_threshold===null)return`
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
    </div>`}function Ae(e){return`
    <div class="pred-row ${e.total_points>0?"pred-row--scored":""}">
      <span class="pred-row__result">${e.predicted_result}</span>
      <span class="pred-row__score">${e.predicted_home}-${e.predicted_away}</span>
      <span class="pred-row__pts">${e.total_points} pts</span>
    </div>
  `}const Y=new Date("2026-06-11T21:00:00Z"),Ne=["Argentina","Brasil","Francia","España","Inglaterra","Alemania","Portugal","Países Bajos","Italia","Bélgica","Uruguay","Colombia","México","Estados Unidos","Canadá","Marruecos","Senegal","Nigeria","Japón","Corea del Sur","Australia","Arabia Saudí","Irán","Qatar","Ecuador","Chile","Perú","Venezuela","Bolivia","Paraguay","Costa Rica","Honduras","Panamá","Jamaica","Trinidad y Tobago","Guatemala","Turquía","Polonia","Croacia","Serbia","República Checa","Eslovaquia","Austria","Suiza","Dinamarca","Suecia","Noruega","Escocia","Ucrania","Rumanía","Hungría","Grecia","Egipto","Camerún","Ghana","Costa de Marfil","Túnez","Argelia","China","India","Irak","Uzbekistán","Nueva Zelanda","Fiji"];function De(){const e=localStorage.getItem("activeLeagueId");return e?parseInt(e):null}async function ie(e){var a;if(!y.isLoggedIn()){e.innerHTML='<div class="container"><p class="notice"><a href="#/login">Inicia sesión</a> para predecir el campeón.</p></div>';return}e.innerHTML='<div class="loading"><div class="loading__spinner"></div></div>';try{const t=De(),{champion_prediction:n}=await p.predictions.getChampion(t),s=new Date>=Y;let i;n&&s?i=`
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
          (${Y.toLocaleDateString("es-ES",{day:"numeric",month:"long",year:"numeric",hour:"2-digit",minute:"2-digit"})}).
        </p>
        ${i}
      </div>
    `,(a=document.getElementById("championForm"))==null||a.addEventListener("submit",async o=>{o.preventDefault();const l=document.getElementById("champBtn"),c=document.getElementById("champError"),m=document.getElementById("teamSearch").value.trim();if(m){l.disabled=!0,l.textContent="Guardando…",c.classList.add("hidden");try{await p.predictions.saveChampion(m,t),v(`¡${m} guardado como campeón!`),ie(e)}catch(_){c.textContent=_.message,c.classList.remove("hidden"),l.disabled=!1,l.textContent=l.dataset.label||"Confirmar predicción"}}})}catch(t){e.innerHTML=`<div class="container"><p class="form__error">Error: ${t.message}</p></div>`}}function U(e){const a=e?"Actualizar predicción":"Confirmar predicción";return`
    <form class="form champion-form" id="championForm">
      <div class="form__group">
        <label class="form__label" for="teamSearch">Selecciona el equipo campeón</label>
        <input class="form__input" type="text" id="teamSearch"
          placeholder="Escribe para buscar…"
          list="teamsList" autocomplete="off"
          value="${e??""}" required />
        <datalist id="teamsList">
          ${Ne.map(t=>`<option value="${t}">`).join("")}
        </datalist>
      </div>
      <p id="champError" class="form__error hidden"></p>
      <button class="btn btn--primary" type="submit" id="champBtn" data-label="${a}">
        ${a}
      </button>
    </form>
  `}async function Oe(e){if(!y.isAdmin()){e.innerHTML='<div class="container"><p class="form__error">Acceso denegado.</p></div>';return}e.innerHTML='<div class="loading"><div class="loading__spinner"></div></div>';try{const{users:a}=await p.auth.users();e.innerHTML=`
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
          <h2>Notificaciones push</h2>
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

        <section class="section admin-section">
          <h2>Usuarios (${a.length})</h2>
          <table class="admin-table">
            <thead>
              <tr>
                <th>ID</th><th>Usuario</th><th>Email</th><th>País</th><th>Admin</th><th>Acción</th>
              </tr>
            </thead>
            <tbody id="usersTableBody">
              ${a.map(Re).join("")}
            </tbody>
          </table>
        </section>
      </div>
    `,document.getElementById("btnSync").addEventListener("click",async()=>{const s=document.getElementById("syncResult");s.textContent="Sincronizando…";try{await p.matches.sync(),s.textContent="✓ Sincronización completada",v("Sincronización completada")}catch(i){s.textContent=`Error: ${i.message}`,v(i.message,"error")}}),document.getElementById("awardForm").addEventListener("submit",async s=>{s.preventDefault();const i=document.getElementById("winnerTeam").value.trim();if(i)try{const{message:o}=await p.predictions.awardChampion(i);v(o)}catch(o){v(o.message,"error")}});const t=document.getElementById("pushTarget"),n=document.getElementById("pushTargetIdGroup");t.addEventListener("change",()=>{n.classList.toggle("hidden",t.value==="all")}),document.getElementById("pushForm").addEventListener("submit",async s=>{s.preventDefault();const i=document.getElementById("pushTitle").value.trim()||"Aviso",o=document.getElementById("pushBody").value.trim(),l=t.value,c=parseInt(document.getElementById("pushTargetId").value)||null,m=document.getElementById("pushResult"),_={title:`📣 PickGoal — ${i}`,body:o};l==="league"&&c&&(_.league_id=c),l==="user"&&c&&(_.user_id=c),m.textContent="Enviando…";try{const{sent:u}=await p.notifications.send(_);m.textContent=`✓ Enviada a ${u} suscripción(es)`,v(`Notificación enviada a ${u} suscripción(es)`)}catch(u){m.textContent=`Error: ${u.message}`,v(u.message,"error")}}),document.getElementById("usersTableBody").addEventListener("click",async s=>{const i=s.target.closest(".toggle-admin");if(!i)return;const o=parseInt(i.dataset.id);try{const{user:l}=await p.auth.toggleAdmin(o);i.closest("tr").querySelector(".admin-badge").textContent=l.is_admin?"Sí":"No",v(`${l.username} ${l.is_admin?"ahora es admin":"ya no es admin"}`)}catch(l){v(l.message,"error")}})}catch(a){e.innerHTML=`<div class="container"><p class="form__error">Error: ${a.message}</p></div>`}}function Re(e){return`
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
  `}function Ue(e){e.innerHTML=`
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
  `,document.getElementById("forgotForm").addEventListener("submit",async a=>{a.preventDefault();const t=document.getElementById("forgotBtn"),n=document.getElementById("forgotMsg"),s=document.getElementById("email").value.trim();t.disabled=!0,t.textContent="Enviando…";try{await p.auth.forgotPassword(s),n.textContent="Si el email existe, recibirás un enlace en breve.",n.classList.remove("hidden","form__error"),n.classList.add("form__success")}catch{v("Error al enviar el email","error")}finally{t.disabled=!1,t.textContent="Enviar enlace"}})}function Ge(e,{query:a}){const t=a.token||"";if(!t){e.innerHTML='<div class="container"><p class="form__error">Token inválido o expirado.</p><a href="#/login">Volver</a></div>';return}e.innerHTML=`
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
  `,document.getElementById("resetForm").addEventListener("submit",async n=>{n.preventDefault();const s=document.getElementById("resetBtn"),i=document.getElementById("resetError"),o=document.getElementById("password").value;s.disabled=!0,s.textContent="Guardando…",i.classList.add("hidden");try{await p.auth.resetPassword(t,o),v("Contraseña actualizada. Ya puedes iniciar sesión."),L.navigate("/login")}catch(l){i.textContent=l.message||"Error al restablecer la contraseña",i.classList.remove("hidden")}finally{s.disabled=!1,s.textContent="Guardar contraseña"}})}const Fe={r32:"Dieciseisavos",r16:"Octavos",quarters:"Cuartos",semis:"Semis",third:"3º y 4º",final:"Final"};async function ze(e){e.innerHTML='<div class="loading"><div class="loading__spinner"></div></div>';try{const{groups:a}=await p.matches.grouped();e.innerHTML=`
      <div class="container">
        <h1 class="page-title">Resultados — Mundial 2026</h1>
        <nav class="phase-nav" id="phaseNav"></nav>
        <div id="phaseContent"></div>
      </div>
    `,Je(a)}catch(a){e.innerHTML=`<div class="container"><p class="form__error">Error cargando los partidos: ${a.message}</p></div>`}}function Je(e){var i;const a=document.getElementById("phaseNav");if(!a)return;const t=e.filter(o=>o.phase==="group"),n=e.filter(o=>o.phase!=="group"),s=[...t.map(o=>({key:`group_${o.group_name}`,label:`Grupo ${o.group_name}`,data:o,isGroup:!0})),...n.map(o=>({key:o.phase,label:Fe[o.phase]||o.label,data:o,isGroup:!1}))];s.length!==0&&(a.innerHTML=s.map((o,l)=>`
    <button class="phase-nav__btn ${l===0?"phase-nav__btn--active":""}" data-key="${o.key}">
      ${o.label}
    </button>
  `).join(""),(i=a.querySelector(".phase-nav__btn--active"))==null||i.scrollIntoView({inline:"center",behavior:"instant",block:"nearest"}),a.querySelectorAll(".phase-nav__btn").forEach((o,l)=>{o.addEventListener("click",()=>{a.querySelectorAll(".phase-nav__btn").forEach(m=>m.classList.remove("phase-nav__btn--active")),o.classList.add("phase-nav__btn--active");const c=s.find(m=>m.key===o.dataset.key);c&&Q(c.data,c.isGroup)})}),Q(s[0].data,s[0].isGroup))}function Q(e,a){const t=document.getElementById("phaseContent");if(!t)return;const n=Ve(e.matches);if(a){const s=Xe(e.matches);t.innerHTML=`
      <div class="resultados-section">
        <div class="resultados-matches">${n}</div>
        <div class="standings">
          <h3 class="standings__title">Clasificación — Grupo ${e.group_name}</h3>
          ${We(s)}
        </div>
      </div>
    `}else t.innerHTML=`<div class="resultados-matches">${n}</div>`}function Ve(e){return!e||e.length===0?'<p class="empty">Sin partidos en esta fase.</p>':e.map(a=>{const t={scheduled:"Programado",live:"🔴 En juego",finished:"Finalizado"}[a.status]||a.status,n=a.status!=="scheduled"?`<span class="res-score">${a.home_score_90??"?"} - ${a.away_score_90??"?"}</span>`:'<span class="res-score res-score--pending">vs</span>';return`
      <div class="res-match ${a.status==="finished"?"res-match--finished":""} ${a.status==="live"?"res-match--live":""}">
        <div class="res-match__meta">
          <span class="res-match__status">${t}</span>
          <span class="res-match__date">${M(a.match_datetime)}</span>
        </div>
        <div class="res-match__teams">
          <span class="res-match__team res-match__team--home">${a.home_team}</span>
          ${n}
          <span class="res-match__team res-match__team--away">${a.away_team}</span>
        </div>
      </div>
    `}).join("")}function Xe(e){const a={};for(const t of e)if(a[t.home_team]||(a[t.home_team]={name:t.home_team,pj:0,g:0,e:0,p:0,gf:0,gc:0,pts:0}),a[t.away_team]||(a[t.away_team]={name:t.away_team,pj:0,g:0,e:0,p:0,gf:0,gc:0,pts:0}),t.status==="finished"&&t.home_score_90!==null&&t.away_score_90!==null){const n=a[t.home_team],s=a[t.away_team];n.pj++,s.pj++,n.gf+=t.home_score_90,n.gc+=t.away_score_90,s.gf+=t.away_score_90,s.gc+=t.home_score_90,t.home_score_90>t.away_score_90?(n.g++,n.pts+=3,s.p++):t.home_score_90<t.away_score_90?(s.g++,s.pts+=3,n.p++):(n.e++,n.pts++,s.e++,s.pts++)}return Object.values(a).sort((t,n)=>{if(n.pts!==t.pts)return n.pts-t.pts;const s=n.gf-n.gc,i=t.gf-t.gc;return s!==i?s-i:n.gf-t.gf})}function We(e){return e.length===0?'<p class="empty">Sin datos de clasificación.</p>':`
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
  `}async function Ke(e,{query:a}){const t=(a.codigo||"").trim().toUpperCase();if(!t){e.innerHTML='<div class="container"><p class="form__error">Enlace de invitación inválido.</p><a href="#/ligas">Ver ligas</a></div>';return}if(!y.isLoggedIn()){sessionStorage.setItem("pendingInviteCode",t),L.navigate("/register");return}e.innerHTML='<div class="loading"><div class="loading__spinner"></div></div>';try{const{league:n}=await p.leagues.joinByCode(t);v(`¡Te has unido a "${n.name}"!`),L.navigate(`/ligas/${n.id}`)}catch(n){if(n.status===409){v("Ya eres miembro de esta liga");try{const{leagues:s}=await p.leagues.my(),i=s.find(o=>o.invite_code===t);if(i){L.navigate(`/ligas/${i.id}`);return}}catch{}}e.innerHTML=`
      <div class="container">
        <div class="league-gate">
          <div class="league-gate__icon">⚠️</div>
          <h2 class="league-gate__title">Error al unirse</h2>
          <p class="league-gate__text">${n.message}</p>
          <a href="#/ligas" class="btn btn--primary">Ver ligas</a>
        </div>
      </div>
    `}}function Ye(){const e=localStorage.getItem("activeLeagueId");return e?parseInt(e):null}async function Qe(e,{params:a}){const t=parseInt(a.id);if(!t){e.innerHTML='<div class="container"><p class="form__error">Usuario no válido.</p></div>';return}e.innerHTML='<div class="loading"><div class="loading__spinner"></div></div>';try{const n=Ye(),{user:s,predictions:i}=await p.predictions.forUser(t,n);e.innerHTML=`
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
              ${i.map(o=>Ze(o)).join("")}
            </div>`}
      </div>
    `}catch(n){e.innerHTML=`<div class="container"><p class="form__error">Error: ${n.message}</p></div>`}}function Ze(e){const a=e.match,t=e.total_points,n=e.pts_score>0,s=e.pts_result>0;let i="";return n?i='<span class="jugador__badge jugador__badge--exact">Exacto</span>':s?i='<span class="jugador__badge jugador__badge--ok">1X2 ✓</span>':i='<span class="jugador__badge jugador__badge--miss">Fallo</span>',`
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
  `}const ea={"/":ue,"/login":ye,"/register":$e,"/quiniela":Ee,"/resultados":ze,"/ranking":Ce,"/tablon":ne,"/ligas":Be,"/ligas/:id":Me,"/perfil":He,"/campeon":ie,"/admin":Oe,"/forgot-password":Ue,"/reset-password":Ge,"/unirse":Ke,"/jugador/:id":Qe};function aa(e){for(const[a,t]of Object.entries(ea)){const n=[],s=new RegExp("^"+a.replace(/:([^/]+)/g,(o,l)=>(n.push(l),"([^/]+)"))+"$"),i=e.match(s);if(i){const o={};return n.forEach((l,c)=>{o[l]=i[c+1]}),{handler:t,params:o}}}return null}const Z=()=>document.getElementById("mainContent"),L={init(){window.addEventListener("hashchange",()=>this.resolve()),this.resolve()},navigate(e){window.location.hash=e},resolve(){const e=window.location.hash.slice(1)||"/",[a,t]=e.split("?"),n=Object.fromEntries(new URLSearchParams(t||"")),s=aa(a);if(!s){Z().innerHTML='<div class="error-page"><h2>Página no encontrada</h2><a href="#/">Volver al inicio</a></div>';return}const{handler:i,params:o}=s;if(["/perfil","/campeon","/admin"].includes(a)&&!y.isLoggedIn()){this.navigate("/login");return}if(a==="/admin"&&!y.isAdmin()){this.navigate("/");return}const c=Z();c.innerHTML='<div class="loading"><div class="loading__spinner"></div></div>',i(c,{params:o,query:n})}};let D=[],A=null,H=null;async function ta(){await y.init(),L.init(),ia(),sa(),la()}function oe(){return localStorage.getItem("pwa_installed")==="true"||window.matchMedia("(display-mode: standalone)").matches||window.navigator.standalone===!0}function sa(){window.addEventListener("beforeinstallprompt",e=>{e.preventDefault(),!oe()&&(A=e,na())}),window.addEventListener("appinstalled",()=>{var e;localStorage.setItem("pwa_installed","true"),A=null,(e=document.getElementById("installBanner"))==null||e.remove()})}function na(){if(oe()||sessionStorage.getItem("installBannerDismissed"))return;const e=document.createElement("div");e.id="installBanner",e.className="install-banner",e.innerHTML=`
    <span class="install-banner__text">⚽ Instala PickGoal en tu dispositivo</span>
    <div class="install-banner__actions">
      <button class="install-banner__btn install-banner__btn--primary" id="installBtn">Instalar</button>
      <button class="install-banner__btn install-banner__btn--ghost" id="installDismissBtn">Ahora no</button>
    </div>
  `,document.body.appendChild(e),document.getElementById("installBtn").addEventListener("click",async()=>{A&&(A.prompt(),await A.userChoice,A=null,e.remove())}),document.getElementById("installDismissBtn").addEventListener("click",()=>{sessionStorage.setItem("installBannerDismissed","1"),e.remove()})}function q(){var e,a;(e=document.getElementById("userDropdown"))==null||e.classList.add("hidden"),(a=document.getElementById("userBtn"))==null||a.classList.remove("navbar__dropdown-btn--open")}async function G(){const e=document.getElementById("tablonBadge");if(!e)return;if(!y.getUser()){e.classList.add("hidden");return}const t=localStorage.getItem("activeLeagueId");if(!t){e.classList.add("hidden");return}const n=localStorage.getItem(`tablon_last_read_${t}`)||new Date(0).toISOString();try{const{count:s}=await p.board.unread(parseInt(t),n);s>0?(e.textContent=s>99?"99+":String(s),e.classList.remove("hidden")):e.classList.add("hidden")}catch{e.classList.add("hidden")}}function ia(){var e,a,t;document.addEventListener("auth:change",ee),window.addEventListener("hashchange",()=>{q(),re(),setTimeout(G,200)}),document.addEventListener("click",q),(e=document.getElementById("userBtn"))==null||e.addEventListener("click",n=>{var o;n.stopPropagation();const s=document.getElementById("userDropdown"),i=s==null?void 0:s.classList.contains("hidden");q(),i&&(s==null||s.classList.remove("hidden"),(o=document.getElementById("userBtn"))==null||o.classList.add("navbar__dropdown-btn--open"))}),(a=document.getElementById("userDropdown"))==null||a.addEventListener("click",n=>{n.stopPropagation(),n.target.closest("#navProfileLink")&&q()}),(t=document.getElementById("navLogoutBtn"))==null||t.addEventListener("click",()=>{D=[],localStorage.removeItem("activeLeagueId"),q(),y.logout(),L.navigate("/")}),ee()}async function ee(){const e=document.getElementById("navAuthLinks"),a=document.getElementById("userBtn"),t=document.getElementById("navUsername"),n=document.getElementById("bottomNav"),s=y.getUser();if(q(),s){e==null||e.classList.add("hidden"),t&&(t.textContent=s.username),a.style.visibility="visible",n==null||n.classList.remove("hidden"),document.body.classList.add("has-bottom-nav");try{const{leagues:i}=s.is_admin?await p.leagues.adminAll():await p.leagues.my();D=i}catch{D=[]}oa(D),G(),H&&clearInterval(H),H=setInterval(G,5*60*1e3)}else e==null||e.classList.remove("hidden"),a.style.visibility="hidden",n==null||n.classList.add("hidden"),document.body.classList.remove("has-bottom-nav"),D=[],localStorage.removeItem("activeLeagueId"),H&&(clearInterval(H),H=null);re()}function oa(e){const a=localStorage.getItem("activeLeagueId");a&&e.some(n=>String(n.id)===String(a))||(e.length>0?localStorage.setItem("activeLeagueId",String(e[0].id)):localStorage.removeItem("activeLeagueId"))}function re(){const e=window.location.hash.slice(1).split("?")[0]||"/";document.querySelectorAll(".bottom-nav__item").forEach(a=>{const t=a.dataset.route,n=t==="/"?e==="/":e===t||e.startsWith(t+"/");a.classList.toggle("bottom-nav__item--active",n)})}function ra(e){const a="=".repeat((4-e.length%4)%4),t=(e+a).replace(/-/g,"+").replace(/_/g,"/"),n=atob(t);return Uint8Array.from([...n].map(s=>s.charCodeAt(0)))}async function la(){if(!(!("serviceWorker"in navigator)||!("PushManager"in window)))try{const e=await navigator.serviceWorker.register("/sw.js");document.addEventListener("auth:change",async a=>{a.detail&&await ae(e)}),y.getUser()&&await ae(e)}catch{}}async function ae(e){try{if(await Notification.requestPermission()!=="granted")return;const t=await e.pushManager.getSubscription();if(t){await p.notifications.subscribe(t.toJSON());return}const{public_key:n}=await p.notifications.vapidPublicKey();if(!n)return;const s=await e.pushManager.subscribe({userVisibleOnly:!0,applicationServerKey:ra(n)});await p.notifications.subscribe(s.toJSON())}catch{}}ta();
