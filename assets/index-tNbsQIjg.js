(function(){const a=document.createElement("link").relList;if(a&&a.supports&&a.supports("modulepreload"))return;for(const s of document.querySelectorAll('link[rel="modulepreload"]'))n(s);new MutationObserver(s=>{for(const i of s)if(i.type==="childList")for(const o of i.addedNodes)o.tagName==="LINK"&&o.rel==="modulepreload"&&n(o)}).observe(document,{childList:!0,subtree:!0});function t(s){const i={};return s.integrity&&(i.integrity=s.integrity),s.referrerPolicy&&(i.referrerPolicy=s.referrerPolicy),s.crossOrigin==="use-credentials"?i.credentials="include":s.crossOrigin==="anonymous"?i.credentials="omit":i.credentials="same-origin",i}function n(s){if(s.ep)return;s.ep=!0;const i=t(s);fetch(s.href,i)}})();const ve="https://pickgoal-backend.onrender.com/api";function he(){return localStorage.getItem("token")}async function h(e,a={}){const t={"Content-Type":"application/json",...a.headers},n=he();n&&(t.Authorization=`Bearer ${n}`);const s=await fetch(`${ve}${e}`,{...a,headers:t}),i=await s.json().catch(()=>({}));if(!s.ok)throw{status:s.status,message:i.error||"Error desconocido"};return i}const m={get:e=>h(e),post:(e,a)=>h(e,{method:"POST",body:JSON.stringify(a)}),patch:(e,a)=>h(e,{method:"PATCH",body:JSON.stringify(a)}),delete:e=>h(e,{method:"DELETE"}),auth:{register:e=>h("/auth/register",{method:"POST",body:JSON.stringify(e)}),login:e=>h("/auth/login",{method:"POST",body:JSON.stringify(e)}),me:()=>h("/auth/me"),forgotPassword:e=>h("/auth/forgot-password",{method:"POST",body:JSON.stringify({email:e})}),resetPassword:(e,a)=>h("/auth/reset-password",{method:"POST",body:JSON.stringify({token:e,password:a})}),ranking:e=>h(`/auth/ranking${e?`?league_id=${e}`:""}`),users:()=>h("/auth/users"),toggleAdmin:e=>h(`/auth/users/${e}/toggle-admin`,{method:"PATCH"})},matches:{grouped:()=>h("/matches/grouped"),list:(e="")=>h(`/matches/${e}`),get:e=>h(`/matches/${e}`),today:()=>h("/matches/today"),setResult:(e,a,t)=>h(`/matches/${e}/result`,{method:"PATCH",body:JSON.stringify({home_score:a,away_score:t})}),sync:()=>h("/matches/sync",{method:"POST"}),recalculate:()=>h("/matches/recalculate",{method:"POST"})},predictions:{mine:e=>h(`/predictions/${e?`?league_id=${e}`:""}`),forMatch:(e,a)=>h(`/predictions/match/${e}${a?`?league_id=${a}`:""}`),save:e=>h("/predictions/",{method:"POST",body:JSON.stringify(e)}),forUser:(e,a)=>h(`/predictions/user/${e}${a?`?league_id=${a}`:""}`),getChampion:e=>h(`/predictions/champion${e?`?league_id=${e}`:""}`),saveChampion:(e,a)=>h("/predictions/champion",{method:"POST",body:JSON.stringify({team_name:e,league_id:a??null})}),awardChampion:e=>h("/predictions/champion/award",{method:"POST",body:JSON.stringify({team_name:e})})},leagues:{all:()=>h("/leagues/all"),public:()=>h("/leagues/public"),my:()=>h("/leagues/my"),create:e=>h("/leagues/",{method:"POST",body:JSON.stringify(e)}),join:e=>h("/leagues/join",{method:"POST",body:JSON.stringify(e)}),joinByCode:e=>h(`/leagues/join/${encodeURIComponent(e)}`),adminAll:()=>h("/leagues/admin"),get:e=>h(`/leagues/${e}`),update:(e,a)=>h(`/leagues/${e}`,{method:"PUT",body:JSON.stringify(a)}),leave:e=>h(`/leagues/${e}/leave`,{method:"DELETE"}),members:e=>h(`/leagues/${e}/members`),matchPredictions:(e,a)=>h(`/leagues/${e}/predictions/${a}`)},home:{summary:()=>h("/home/summary")},board:{messages:(e=1,a=null)=>h(`/board/?page=${e}${a?`&league_id=${a}`:""}`),unread:(e,a)=>h(`/board/unread?league_id=${e}&since=${encodeURIComponent(a)}`),post:(e,a=null)=>h("/board/",{method:"POST",body:JSON.stringify({message:e,league_id:a})}),pin:e=>h(`/board/${e}/pin`,{method:"POST"}),reply:(e,a)=>h(`/board/${e}/reply`,{method:"POST",body:JSON.stringify({message:a})}),delete:e=>h(`/board/${e}`,{method:"DELETE"})},notifications:{vapidPublicKey:()=>h("/notifications/vapid-public-key"),subscribe:e=>h("/notifications/subscribe",{method:"POST",body:JSON.stringify(e)}),send:e=>h("/notifications/send",{method:"POST",body:JSON.stringify(e)})}};let M=null;const $={async init(){if(localStorage.getItem("token"))try{const{user:a}=await m.auth.me();M=a}catch{localStorage.removeItem("token")}},setUser(e,a){M=e,localStorage.setItem("token",a),document.dispatchEvent(new CustomEvent("auth:change",{detail:e}))},logout(){M=null,localStorage.removeItem("token"),document.dispatchEvent(new CustomEvent("auth:change",{detail:null}))},getUser(){return M},isLoggedIn(){return!!M},isAdmin(){return(M==null?void 0:M.is_admin)===!0}};let F=null;function _(e,a="success"){let t=document.getElementById("toast");t||(t=document.createElement("div"),t.id="toast",document.body.appendChild(t)),t.textContent=e,t.className=`toast toast--${a} toast--visible`,F&&clearTimeout(F),F=setTimeout(()=>{t.classList.remove("toast--visible")},3e3)}function ie(){return`
    <div class="container">
      <div class="league-gate">
        <div class="league-gate__icon">⚽</div>
        <h2 class="league-gate__title">¡Inicia tu Liga!</h2>
        <p class="league-gate__text">Únete a una liga para empezar a predecir</p>
        <a href="#/ligas" class="btn btn--primary">Ver ligas disponibles</a>
      </div>
    </div>
  `}function oe(){return`
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
  `}function re(e){const a=e.querySelector("#pointsModal"),t=e.querySelector("#btnPointsInfo"),n=e.querySelector("#pointsClose"),s=e.querySelector("#pointsOverlay");function i(){a.classList.add("points-modal--open"),document.body.style.overflow="hidden"}function o(){a.classList.remove("points-modal--open"),document.body.style.overflow=""}return t==null||t.addEventListener("click",i),n==null||n.addEventListener("click",o),s==null||s.addEventListener("click",o),document.addEventListener("keydown",l=>{l.key==="Escape"&&o()},{once:!1}),i}function j(e){return e?new Date(e).toLocaleString("es-ES",{day:"2-digit",month:"2-digit",year:"numeric",hour:"2-digit",minute:"2-digit"}):"—"}async function be(e){if(!$.getUser()){fe(e);return}e.innerHTML='<div class="loading"><div class="loading__spinner"></div></div>';try{const{leagues_summary:t,upcoming_matches:n}=await m.home.summary();if(t.length===0){ye(e);return}const s=(()=>{const o=localStorage.getItem("activeLeagueId");return o?parseInt(o):null})(),i=[...t].sort((o,l)=>o.league_id===s?-1:l.league_id===s?1:0);e.innerHTML=`
      <div class="home-dashboard container">
        <div class="home-dashboard__topbar">
          <button class="btn btn--ghost btn--sm" id="btnPointsInfo">📊 Sistema de puntos</button>
        </div>
        <div class="home-dashboard__leagues">
          ${i.map(o=>Ee(o)).join("")}
        </div>
        ${we(n)}
      </div>
      ${oe()}
    `,re(e),e.querySelectorAll(".league-card[data-league-id]").forEach(o=>{o.style.cursor="pointer",o.addEventListener("click",l=>{l.target.closest("[data-go-ranking]")||l.target.closest("a")||(localStorage.setItem("activeLeagueId",o.dataset.leagueId),I.navigate(`/ligas/${o.dataset.leagueId}`))})}),e.querySelectorAll("[data-go-ranking]").forEach(o=>{o.addEventListener("click",l=>{l.stopPropagation(),localStorage.setItem("activeLeagueId",o.dataset.goRanking),I.navigate("/ranking")})})}catch(t){e.innerHTML=`<div class="container"><p class="form__error">Error cargando el inicio: ${t.message}</p></div>`}}function fe(e){e.innerHTML=`
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
  `}function ye(e){e.innerHTML=`
    <section class="hero">
      <div class="hero__content">
        <img src="/assets/logo-completo.jpg" alt="PickGoal" class="hero__logo-img" />
        <p class="hero__subtitle">Únete a una liga y empieza a predecir el Mundial 2026</p>
        <div class="hero__cta">
          <a href="#/ligas" class="btn btn--primary btn--lg">Unirse a una liga</a>
        </div>
      </div>
    </section>
  `}function $e(e){return`${e}º`}function Ee(e){const a=e.next_to_predict?`<div class="league-card__next">
         <span class="league-card__next-label">Próximo a predecir</span>
         <span class="league-card__next-match">${e.next_to_predict.home_team} vs ${e.next_to_predict.away_team}</span>
         <span class="league-card__next-date">${j(e.next_to_predict.match_datetime)}</span>
       </div>`:`<div class="league-card__next league-card__next--done">
         Todos los partidos predichos
       </div>`,t=e.predictions_made??0,n=e.matches_played??0;return`
    <div class="league-card" data-league-id="${e.league_id}">
      <div class="league-card__header">
        <h2 class="league-card__name">${e.league_name}</h2>
        <span class="league-card__rank">${$e(e.rank)} de ${e.member_count}</span>
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
        Pronósticos realizados: <strong>${t}/${n}</strong> partidos
      </div>
      ${a}
      <button class="league-card__cta btn btn--ghost btn--sm" data-go-ranking="${e.league_id}">Ver clasificación</button>
    </div>
  `}function we(e){return e.length?`
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
              <span class="upcoming-match__date">${j(a.match_datetime)}</span>
              ${t?'<span class="upcoming-match__badge upcoming-match__badge--done">Predicho</span>':'<span class="upcoming-match__badge upcoming-match__badge--pending">Sin predecir</span>'}
            </div>
          </div>
        `).join("")}
      </div>
      <a class="btn btn--ghost btn--sm" href="#/quiniela">Ver todos los pronósticos</a>
    </section>
  `:""}const W="pickgoal_welcome_shown";function le(e="/ligas"){if(localStorage.getItem(W))return;localStorage.setItem(W,"1");const a=document.createElement("div");a.innerHTML=`
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
  `;const t=a.firstElementChild;document.body.appendChild(t),document.body.style.overflow="hidden",requestAnimationFrame(()=>t.classList.add("welcome-modal--open"));function n(s){t.classList.remove("welcome-modal--open"),document.body.style.overflow="",t.addEventListener("transitionend",()=>t.remove(),{once:!0}),s&&(window.location.hash=s)}document.getElementById("welcomeOverlay").addEventListener("click",()=>n()),document.getElementById("welcomeCta").addEventListener("click",()=>n(e)),document.addEventListener("keydown",function s(i){i.key==="Escape"&&(n(),document.removeEventListener("keydown",s))})}function Le(e){e.innerHTML=`
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
  `,document.getElementById("loginForm").addEventListener("submit",async a=>{a.preventDefault();const t=document.getElementById("loginBtn"),n=document.getElementById("loginError"),s=document.getElementById("identifier").value.trim(),i=document.getElementById("password").value;t.disabled=!0,t.textContent="Entrando…",n.classList.add("hidden");try{const{token:o,user:l}=await m.auth.login({identifier:s,password:i});$.setUser(l,o),_(`¡Bienvenido, ${l.username}!`),I.navigate("/quiniela"),le("/quiniela")}catch(o){n.textContent=o.message||"Error al iniciar sesión",n.classList.remove("hidden")}finally{t.disabled=!1,t.textContent="Entrar"}})}function Ie(e){e.innerHTML=`
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
  `,document.getElementById("registerForm").addEventListener("submit",async a=>{a.preventDefault();const t=document.getElementById("registerBtn"),n=document.getElementById("registerError");t.disabled=!0,t.textContent="Creando cuenta…",n.classList.add("hidden");const s={username:document.getElementById("username").value.trim(),email:document.getElementById("email").value.trim(),country:document.getElementById("country").value.trim(),password:document.getElementById("password").value};try{const{token:i,user:o}=await m.auth.register(s);$.setUser(o,i),_("¡Cuenta creada! Bienvenido a PickGoal");const l=sessionStorage.getItem("pendingInviteCode");if(l){sessionStorage.removeItem("pendingInviteCode");try{const{league:p}=await m.leagues.joinByCode(l);_(`¡Te has unido a "${p.name}"!`),I.navigate(`/ligas/${p.id}`)}catch{I.navigate("/ligas")}}else I.navigate("/campeon"),le("/ligas")}catch(i){n.textContent=i.message||"Error al registrarse",n.classList.remove("hidden")}finally{t.disabled=!1,t.textContent="Crear cuenta"}})}const de=new Set(["r32","r16","quarters","semis","third","final"]);let V=null;function Y(){const e=localStorage.getItem("activeLeagueId");return e?parseInt(e):null}async function Se(e){var a,t;e.innerHTML='<div class="loading"><div class="loading__spinner"></div></div>';try{let n=null;if($.isLoggedIn()){const{leagues:y}=await m.leagues.my();if(y.length===0){e.innerHTML=ie();return}const L=Y(),S=y.find(r=>r.id===L);n=S?S.name:((a=y[0])==null?void 0:a.name)??null}const s=Y(),[{groups:i},o,l]=await Promise.all([m.matches.grouped(),$.isLoggedIn()?m.predictions.mine(s):Promise.resolve({predictions:[]}),$.isLoggedIn()?m.predictions.getChampion(s):Promise.resolve({champion_prediction:null})]),p={};for(const y of o.predictions)p[y.match_id]=y;const u=i.flatMap(y=>y.matches),v=new Map;for(const y of u){const L=Z(y.match_datetime);v.has(L)||v.set(L,[]),v.get(L).push(y)}const c=[...v.keys()].sort(),g=Z(new Date().toISOString()),b=c.find(y=>y>=g)??c[0],f=((t=l.champion_prediction)==null?void 0:t.team_name)??null,E=$.isLoggedIn()?f?`<p class="champion-banner champion-banner--set">🏆 Tu campeón: <a href="#/campeon" style="color:inherit;font-weight:bold;">${f}</a></p>`:'<p class="champion-banner champion-banner--missing">⚠️ <a href="#/campeon">¡Elige tu campeón antes del inicio del torneo!</a></p>':"";e.innerHTML=`
      ${n?`<span class="page-league-name">${n}</span>`:""}
      <div class="container">
        <h1 class="page-title">Pronósticos — Mundial 2026</h1>
        ${E}
        ${$.isLoggedIn()?"":'<p class="notice">⚠️ <a href="#/login">Inicia sesión</a> para guardar tus predicciones.</p>'}
        <nav class="date-nav" id="dateNav"></nav>
        <div id="matchesContent"></div>
      </div>
      ${oe()}
    `,V=re(e),ke(c,b,v,p,s)}catch(n){e.innerHTML=`<div class="container"><p class="form__error">Error cargando los partidos: ${n.message}</p></div>`}}function ke(e,a,t,n,s){var o;const i=document.getElementById("dateNav");i&&(i.innerHTML=e.map(l=>`
    <button class="date-nav__btn ${l===a?"date-nav__btn--active":""}" data-day="${l}">
      ${xe(l)}
    </button>
  `).join(""),(o=i.querySelector(".date-nav__btn--active"))==null||o.scrollIntoView({inline:"center",behavior:"instant",block:"nearest"}),i.querySelectorAll(".date-nav__btn").forEach(l=>{l.addEventListener("click",()=>{i.querySelectorAll(".date-nav__btn").forEach(p=>p.classList.remove("date-nav__btn--active")),l.classList.add("date-nav__btn--active"),Q(t.get(l.dataset.day)??[],n,s)})}),Q(t.get(a)??[],n,s))}function Q(e,a,t){const n=document.getElementById("matchesContent");if(n){if(e.length===0){n.innerHTML='<p class="empty">Sin partidos este día.</p>';return}n.innerHTML=`<div class="matches-grid">${e.map(s=>Ce(s,a[s.id])).join("")}</div>`,V&&n.querySelectorAll(".knockout-info-btn").forEach(s=>{s.addEventListener("click",i=>{i.stopPropagation(),V()})}),$.isLoggedIn()&&n.querySelectorAll(".prediction-form").forEach(s=>{Be(s,a,t)})}}function Z(e){const a=new Date(e);return`${a.getFullYear()}-${String(a.getMonth()+1).padStart(2,"0")}-${String(a.getDate()).padStart(2,"0")}`}function xe(e){const[a,t,n]=e.split("-").map(Number);return new Date(a,t-1,n).toLocaleDateString("es-ES",{day:"numeric",month:"short"})}function Ce(e,a){const t=e.is_locked,n=a?`<span class="pts-badge">${a.total_points} pts</span>`:"",s={scheduled:"Programado",live:"🔴 En juego",finished:"Finalizado"}[e.status],i=de.has(e.phase)?'<button class="knockout-info-btn" type="button" title="Sistema de puntos eliminatorias" aria-label="Sistema de puntos">ℹ️</button>':"";return`
    <div class="match-card ${t?"match-card--locked":""}" data-match-id="${e.id}">
      <div class="match-card__header">
        <span class="match-card__status">${s}</span>
        <span class="match-card__date">${j(e.match_datetime)}</span>
        ${n}${i}
      </div>
      <div class="match-card__teams">
        <span class="team team--home">${e.home_team}</span>
        <div class="match-card__score">
          ${e.status!=="scheduled"?`<span class="score">${e.home_score_90??"?"} - ${e.away_score_90??"?"}</span>`:'<span class="score score--dash">vs</span>'}
        </div>
        <span class="team team--away">${e.away_team}</span>
      </div>
      ${!t&&$.isLoggedIn()?Pe(e,a):t&&a?`<div class="prediction-result">
               Tu predicción: <strong>${a.predicted_home}-${a.predicted_away}</strong>
               (${a.predicted_result}) · ${a.total_points} pts
             </div>`:""}
    </div>
  `}function Pe(e,a){const t=!!a,n=(a==null?void 0:a.predicted_home)??0,s=(a==null?void 0:a.predicted_away)??0,i=(a==null?void 0:a.predicted_result)??"X",o=t?"prediction-form--saved":"prediction-form--unsaved",l=t?'<span class="pred-status pred-status--saved">✓ Guardado</span>':'<span class="pred-status pred-status--unsaved">Sin predicción</span>',p=t?"btn btn--saved btn--sm pred-save-btn":"btn btn--ghost btn--sm pred-save-btn",u=t?"✓ Guardado":"Guardar",v=de.has(e.phase);return`
    <form class="prediction-form ${o}" data-match-id="${e.id}" data-saved="${t}">
      ${l}
      <div class="result-selector">
        ${["1","X","2"].map(c=>`
          <label class="result-selector__option">
            <input type="radio" name="predicted_result" value="${c}" ${i===c?"checked":""} required />
            ${c}
          </label>
        `).join("")}
      </div>
      ${v?'<span class="pred-hint">(90 min)</span>':""}
      <div class="prediction-form__inputs">
        <input type="number" name="predicted_home" class="score-input" min="0" max="30"
          value="${n}" placeholder="0" required />
        <span>-</span>
        <input type="number" name="predicted_away" class="score-input" min="0" max="30"
          value="${s}" placeholder="0" required />
      </div>
      ${v?'<span class="pred-hint">(partido completo)</span>':""}
      <button type="submit" class="${p}">${u}</button>
    </form>
  `}function Be(e,a,t){const n=parseInt(e.dataset.matchId),s=e.querySelector(".pred-save-btn"),i=e.querySelector(".pred-status");let o=e.dataset.saved==="true";function l(){e.classList.contains("prediction-form--dirty")||(e.classList.remove("prediction-form--saved","prediction-form--unsaved"),e.classList.add("prediction-form--dirty"),s.className="btn btn--primary btn--sm pred-save-btn",s.textContent="Guardar",i&&(i.className="pred-status pred-status--unsaved",i.textContent="Sin guardar"))}function p(){o=!0,e.classList.remove("prediction-form--unsaved","prediction-form--dirty"),e.classList.add("prediction-form--saved"),s.className="btn btn--saved btn--sm pred-save-btn",s.textContent="✓ Guardado",s.disabled=!1,i&&(i.className="pred-status pred-status--saved",i.textContent="✓ Guardado")}e.querySelectorAll("input").forEach(u=>{u.addEventListener("change",l),u.addEventListener("input",l)}),e.addEventListener("submit",async u=>{var b;u.preventDefault();const v=parseInt(e.querySelector("[name=predicted_home]").value),c=parseInt(e.querySelector("[name=predicted_away]").value),g=(b=e.querySelector("[name=predicted_result]:checked"))==null?void 0:b.value;if(!(isNaN(v)||isNaN(c)||!g)){s.disabled=!0,s.textContent="…";try{const{prediction:f}=await m.predictions.save({match_id:n,predicted_result:g,predicted_home:v,predicted_away:c,league_id:t??null});a[n]=f,_("Predicción guardada"),p()}catch(f){_(f.message||"Error al guardar","error"),s.disabled=!1,o?(s.className="btn btn--saved btn--sm pred-save-btn",s.textContent="✓ Guardado"):(s.className="btn btn--primary btn--sm pred-save-btn",s.textContent="Guardar")}}})}function Te(){const e=localStorage.getItem("activeLeagueId");return e?parseInt(e):null}async function Me(e){var a,t;e.innerHTML='<div class="loading"><div class="loading__spinner"></div></div>';try{if($.isLoggedIn()){const{leagues:g}=await m.leagues.my();if(g.length===0){e.innerHTML=ie();return}}const n=Te(),[{ranking:s},i]=await Promise.all([m.auth.ranking(n),$.isLoggedIn()?m.leagues.my():Promise.resolve({leagues:[]})]),o=$.getUser(),l=i.leagues.find(g=>g.id===n),p=document.getElementById("tablonBadge"),u=p&&!p.classList.contains("hidden"),v=u?p.textContent:"",c=((a=s[0])==null?void 0:a.matches_played)??0;e.innerHTML=`
      ${l?`<span class="page-league-name">${l.name}</span>`:""}
      <div class="container">
        <div class="ranking-header">
          <h1 class="page-title">Clasificación</h1>
          ${n?`
            <button class="ranking-tablon-btn" data-league-id="${n}">
              💬 Tablón
              <span class="ranking-tablon-btn__badge${u?"":" hidden"}">${v}</span>
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
              ${s.map(g=>{var S,r,d;const b=g.predictions_made??0,f=`${b}/${c}`,E=`${g.correct_results??0}/${b}`,y=`${g.exact_scores??0}/${b}`;return`
                  <tr class="${o&&g.id===o.id?"ranking-table__row--me":""}">
                    <td class="ranking-table__pos" data-pos="${g.position}">${g.position}</td>
                    <td>
                      <a class="ranking-table__link" href="#/jugador/${g.id}">
                        <span class="status-emoji" title="${((S=g.status)==null?void 0:S.name)||""}">${((r=g.status)==null?void 0:r.emoji)||""}</span>${g.username}
                      </a>
                    </td>
                    <td class="ranking-table__stat ranking-table__status">${((d=g.status)==null?void 0:d.name)||"—"}</td>
                    <td class="ranking-table__stat">${f}</td>
                    <td class="ranking-table__stat">${E}</td>
                    <td class="ranking-table__stat">${y}</td>
                    <td class="ranking-table__pts">${g.total_points}</td>
                  </tr>
                `}).join("")}
            </tbody>
          </table>
        </div>
      </div>
    `,(t=e.querySelector(".ranking-tablon-btn"))==null||t.addEventListener("click",()=>{I.navigate(`/tablon?liga=${n}`)})}catch(n){e.innerHTML=`<div class="container"><p class="form__error">Error: ${n.message}</p></div>`}}async function ce(e,{query:a={}}={}){e.innerHTML='<div class="loading"><div class="loading__spinner"></div></div>';const t=$.getUser();let n=a.liga?parseInt(a.liga):null;if(n){localStorage.setItem(`tablon_last_read_${n}`,new Date().toISOString());const r=document.getElementById("tablonBadge");r&&(r.classList.add("hidden"),r.textContent="")}let s=null,i=[],o=1,l=1;try{if(!n&&t){const{leagues:r}=await m.leagues.my();r&&r.length&&(n=r[0].id,s=r[0].name)}else if(n)try{const{league:r}=await m.leagues.get(n);s=r.name}catch{}if(n&&t)try{const{members:r}=await m.leagues.members(n);i=r||[]}catch{}}catch{}async function p(){const r=await m.board.messages(o,n);return l=r.pages||1,r}try{const r=await p();u(r)}catch(r){e.innerHTML=`<div class="container"><p class="form__error">Error: ${r.message}</p></div>`}function u(r){const{pinned:d=[],messages:w=[]}=r;e.innerHTML=`
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
                 ${v(d)}
               </div>
             </section>`:""}

        <section class="board-section">
          ${d.length?'<h2 class="board-section__title">💬 Mensajes</h2>':""}
          <div class="board-messages" id="boardMessages">
            ${g(w)}
          </div>
          ${l>1?`<div class="pagination">
                 <button class="btn btn--ghost btn--sm" id="prevPage" ${o<=1?"disabled":""}>← Anterior</button>
                 <span>Página ${o} / ${l}</span>
                 <button class="btn btn--ghost btn--sm" id="nextPage" ${o>=l?"disabled":""}>Siguiente →</button>
               </div>`:""}
        </section>
      </div>
    `,f(),E(),y()}function v(r){return r.length?r.map(d=>`
      <div class="board-message board-message--pinned" data-id="${d.id}">
        <div class="board-message__header">
          <span class="board-message__pin-badge">📌</span>
          <strong class="board-message__author">${T(d.username)}</strong>
          <span class="board-message__date">${j(d.created_at)}</span>
          ${t!=null&&t.is_admin&&!d.is_deleted?`<button class="btn btn--ghost btn--xs unpin-msg" data-id="${d.id}" title="Desfijar">📌✕</button>`:""}
          ${!d.is_deleted&&t&&(t.id===d.user_id||t.is_admin)?`<button class="btn btn--danger btn--xs delete-msg" data-id="${d.id}">✕</button>`:""}
        </div>
        <p class="board-message__text">${b(d.message)}</p>

        ${d.replies&&d.replies.length?`<div class="board-replies">
               ${d.replies.map(w=>c(w)).join("")}
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
    `).join(""):""}function c(r){return`
      <div class="board-reply ${r.is_deleted?"board-reply--deleted":""}" data-id="${r.id}">
        <div class="board-reply__header">
          <strong class="board-reply__author">${T(r.username)}</strong>
          <span class="board-reply__date">${j(r.created_at)}</span>
          ${!r.is_deleted&&t&&(t.id===r.user_id||t.is_admin)?`<button class="btn btn--danger btn--xs delete-msg" data-id="${r.id}">✕</button>`:""}
        </div>
        <p class="board-reply__text">${b(r.message)}</p>
      </div>
    `}function g(r){return r.length?r.map(d=>`
      <div class="board-message ${d.is_deleted?"board-message--deleted":""}" data-id="${d.id}">
        <div class="board-message__header">
          <strong class="board-message__author">${T(d.username)}</strong>
          <span class="board-message__date">${j(d.created_at)}</span>
          ${t!=null&&t.is_admin&&!d.is_deleted?`<button class="btn btn--ghost btn--xs pin-msg" data-id="${d.id}" title="Fijar">📌</button>`:""}
          ${!d.is_deleted&&t&&(t.id===d.user_id||t.is_admin)?`<button class="btn btn--danger btn--xs delete-msg" data-id="${d.id}">✕</button>`:""}
        </div>
        <p class="board-message__text">${b(d.message)}</p>
      </div>
    `).join(""):'<p class="empty">Sin mensajes aún. ¡Sé el primero!</p>'}function b(r){const d=T(r);if(!i.length)return d;const w=i.map(k=>je(k.username)),x=new RegExp(`@(${w.join("|")})`,"gi");return d.replace(x,'<span class="mention">@$1</span>')}function f(){const r=document.getElementById("boardForm");if(!r)return;const d=document.getElementById("boardMsg"),w=document.getElementById("charCounter"),x=document.getElementById("mentionDropdown");d.addEventListener("input",()=>{w.textContent=`${d.value.length} / 500`,S(d,x)}),r.addEventListener("submit",async k=>{k.preventDefault();const A=d.value.trim();if(A)try{await m.board.post(A,n),d.value="",w.textContent="0 / 500",x.classList.add("hidden");const B=await p();L(B),_("Mensaje publicado")}catch(B){_(B.message,"error")}})}function E(){e.querySelectorAll(".reply-form").forEach(r=>{const d=parseInt(r.dataset.parent),w=r.querySelector(".reply-input"),x=`mentionDropdown-${d}`,k=document.getElementById(x);w==null||w.addEventListener("input",()=>{S(w,k)}),r.addEventListener("submit",async A=>{A.preventDefault();const B=w.value.trim();if(B)try{await m.board.reply(d,B),w.value="",k==null||k.classList.add("hidden");const O=await p();L(O),_("Respuesta enviada")}catch(O){_(O.message,"error")}})}),e.querySelectorAll(".pin-msg").forEach(r=>{r.addEventListener("click",async()=>{try{await m.board.pin(r.dataset.id);const d=await p();L(d),_("Mensaje fijado")}catch(d){_(d.message,"error")}})}),e.querySelectorAll(".unpin-msg").forEach(r=>{r.addEventListener("click",async()=>{try{await m.board.pin(r.dataset.id);const d=await p();L(d),_("Mensaje desfijado")}catch(d){_(d.message,"error")}})})}function y(){e.querySelectorAll(".delete-msg").forEach(r=>{r.addEventListener("click",async()=>{if(confirm("¿Eliminar este mensaje?"))try{await m.board.delete(r.dataset.id);const d=await p();L(d),_("Mensaje eliminado")}catch(d){_(d.message,"error")}})})}function L(r){const{pinned:d=[],messages:w=[]}=r,x=document.getElementById("boardPinned");if(x)x.innerHTML=v(d);else if(d.length){u(r);return}const k=document.getElementById("boardMessages");k&&(k.innerHTML=g(w)),E(),y()}e.addEventListener("click",async r=>{if(r.target.id==="prevPage"&&o>1){o--;const d=await p();L(d)}else if(r.target.id==="nextPage"&&o<l){o++;const d=await p();L(d)}});function S(r,d){if(!d||!i.length)return;const w=r.value,x=r.selectionStart,k=w.slice(0,x),A=k.match(/@(\w*)$/);if(!A){d.classList.add("hidden");return}const B=A[1].toLowerCase(),O=i.filter(C=>C.username.toLowerCase().startsWith(B)&&C.id!==(t==null?void 0:t.id)),X=[...$.isAdmin()&&"todos".startsWith(B)?[{username:"todos",description:"Notificar a todos los miembros"}]:[],...O.slice(0,6)];if(!X.length){d.classList.add("hidden");return}d.innerHTML=X.map(C=>C.description?`<div class="mention-item mention-item--broadcast" data-username="${T(C.username)}">
             <span class="mention-item__name">@${T(C.username)}</span>
             <span class="mention-item__desc">${T(C.description)}</span>
           </div>`:`<div class="mention-item" data-username="${T(C.username)}">${T(C.username)}</div>`).join(""),d.classList.remove("hidden"),d.querySelectorAll(".mention-item").forEach(C=>{C.addEventListener("mousedown",ge=>{ge.preventDefault();const _e=C.dataset.username,U=k.replace(/@(\w*)$/,`@${_e} `);if(r.value=U+w.slice(x),r.setSelectionRange(U.length,U.length),d.classList.add("hidden"),r.tagName==="TEXTAREA"){const K=document.getElementById("charCounter");K&&(K.textContent=`${r.value.length} / 500`)}})})}document.addEventListener("click",r=>{!r.target.closest(".board-form__input-wrap")&&!r.target.closest(".reply-form__input-wrap")&&document.querySelectorAll(".mention-dropdown").forEach(d=>d.classList.add("hidden"))},{capture:!0})}function T(e){return String(e).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;")}function je(e){return e.replace(/[.*+?^${}()|[\]\\]/g,"\\$&")}async function Ae(e){var a,t,n,s;e.innerHTML='<div class="loading"><div class="loading__spinner"></div></div>';try{const i=$.getUser(),o=i==null?void 0:i.is_admin,[l,p]=await Promise.all([o?m.leagues.adminAll():m.leagues.all(),$.isLoggedIn()&&!o?m.leagues.my():Promise.resolve({leagues:[]})]),u=new Set(p.leagues.map(c=>c.id)),v=o?l.leagues:l.leagues.filter(c=>!u.has(c.id));e.innerHTML=`
      <div class="container">
        <h1 class="page-title">Ligas</h1>

        ${o?`
          <div class="admin-notice">Vista administrador — puedes acceder a cualquier liga sin participar en ella.</div>
        `:""}

        ${i&&!o&&p.leagues.length>0?`
          <section class="section">
            <h2>Mis ligas</h2>
            <div class="leagues-grid">${p.leagues.map(c=>ee(c,!0)).join("")}</div>
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
          ${v.length?`<div class="leagues-grid">${v.map(c=>ee(c,!1,u,o)).join("")}</div>`:o?'<p class="empty">No hay ligas creadas aún.</p>':p.leagues.length>0?'<p class="empty">Ya participas en todas las ligas disponibles.</p>':'<p class="empty">No hay ligas aún. ¡Crea la primera!</p>'}
        </section>
      </div>
    `,e.querySelectorAll('.league-card[data-navigate="true"]').forEach(c=>{c.addEventListener("click",()=>I.navigate(`/ligas/${c.dataset.id}`))}),e.querySelectorAll(".btn-join-league").forEach(c=>{c.addEventListener("click",async g=>{g.stopPropagation();const b=parseInt(c.dataset.id);c.disabled=!0,c.textContent="…";try{const{league:f}=await m.leagues.join({league_id:b});_(`¡Te has unido a "${f.name}"!`),I.navigate(`/ligas/${f.id}`)}catch(f){_(f.message,"error"),c.disabled=!1,c.textContent="Unirse"}})}),e.querySelectorAll(".btn-private-info").forEach(c=>{c.addEventListener("click",g=>{g.stopPropagation(),_("Esta liga es privada. Pide el enlace de invitación a cualquier miembro para unirte.","info")})}),(a=document.getElementById("btnShowCreate"))==null||a.addEventListener("click",()=>{var c,g;(c=document.getElementById("createLeaguePanel"))==null||c.classList.remove("hidden"),(g=document.getElementById("btnShowCreate"))==null||g.classList.add("hidden")}),(t=document.getElementById("btnCancelCreate"))==null||t.addEventListener("click",()=>{var c,g;(c=document.getElementById("createLeaguePanel"))==null||c.classList.add("hidden"),(g=document.getElementById("btnShowCreate"))==null||g.classList.remove("hidden")}),(n=document.getElementById("joinCodeForm"))==null||n.addEventListener("submit",async c=>{c.preventDefault();const g=document.getElementById("inviteCode").value.trim().toUpperCase();if(g)try{const{league:b}=await m.leagues.join({invite_code:g});_(`Te has unido a "${b.name}"`),I.navigate(`/ligas/${b.id}`)}catch(b){_(b.message,"error")}}),(s=document.getElementById("createLeagueForm"))==null||s.addEventListener("submit",async c=>{var S;c.preventDefault();const g=document.getElementById("createBtn");g.disabled=!0,g.textContent="Creando…";const b=document.getElementById("leagueName").value.trim(),f=document.getElementById("leagueDesc").value.trim(),E=document.getElementById("leaguePrize").value.trim(),y=document.getElementById("isPublic").checked,L=((S=document.getElementById("isOfficial"))==null?void 0:S.checked)??!1;try{const{league:r}=await m.leagues.create({name:b,description:f,prize:E,is_public:y,is_official:L});qe(r)}catch(r){_(r.message,"error"),g.disabled=!1,g.textContent="Crear liga"}})}catch(i){e.innerHTML=`<div class="container"><p class="form__error">Error: ${i.message}</p></div>`}}function ee(e,a=!1,t=new Set,n=!1){const s=e.is_official?'<span class="league-badge league-badge--official">⭐ Oficial</span>':"",i=e.is_public?"🌍":"🔒",o=n?`<button class="btn btn--sm btn--outline btn-admin-view" data-id="${e.id}">Ver (admin)</button>`:a?`<button class="btn btn--sm btn--outline" onclick="event.stopPropagation(); window.location.hash='/ligas/${e.id}'">Ver liga</button>`:e.is_public?`<button class="btn btn--sm btn--primary btn-join-league" data-id="${e.id}">Unirse</button>`:'<button class="btn btn--sm btn--ghost btn-private-info">🔒 Solicitar enlace</button>';return`
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
  `}function qe(e){var n,s;const a=e.invite_link||"",t=document.getElementById("createLeaguePanel");t&&(t.innerHTML=`
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
  `,(n=document.getElementById("btnCopyLink"))==null||n.addEventListener("click",async()=>{try{await navigator.clipboard.writeText(a),_("Enlace copiado")}catch{_("No se pudo copiar","error")}}),(s=document.getElementById("btnShare"))==null||s.addEventListener("click",async()=>{try{await navigator.share({title:`Únete a ${e.name} en PickGoal`,url:a})}catch{}}))}async function He(e,{params:a}){var n,s,i,o,l;const t=parseInt(a.id);e.innerHTML='<div class="loading"><div class="loading__spinner"></div></div>';try{const p=await m.leagues.get(t),{league:u,ranking:v,is_member:c,is_admin_view:g}=p,b=$.getUser(),f=u.is_official?'<span class="league-badge league-badge--official">⭐ Oficial</span>':"";e.innerHTML=`
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

        ${(c||b!=null&&b.is_admin)&&u.invite_link?`
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
          ${c?'<button class="btn btn--danger btn--sm" id="btnLeave">Abandonar liga</button>':!(b!=null&&b.is_admin)&&b?'<button class="btn btn--primary" id="btnJoin">Unirse a esta liga</button>':""}
          ${b!=null&&b.is_admin||c&&b&&u.created_by===b.id?'<button class="btn btn--outline btn--sm" id="btnEditLeague">Editar liga</button>':""}
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
    `,(n=document.getElementById("btnCopyInvite"))==null||n.addEventListener("click",async()=>{try{await navigator.clipboard.writeText(u.invite_link),_("Enlace copiado")}catch{_("No se pudo copiar","error")}}),(s=document.getElementById("btnShareInvite"))==null||s.addEventListener("click",async()=>{try{await navigator.share({title:`Únete a ${u.name} en PickGoal`,url:u.invite_link})}catch{}}),(i=document.getElementById("btnLeave"))==null||i.addEventListener("click",async()=>{if(confirm("¿Seguro que quieres abandonar esta liga?"))try{await m.leagues.leave(t),_("Has abandonado la liga"),I.navigate("/ligas")}catch(r){_(r.message,"error")}}),(o=document.getElementById("btnJoin"))==null||o.addEventListener("click",async()=>{try{await m.leagues.join({league_id:t}),_("¡Te has unido a la liga!"),I.navigate(`/ligas/${t}`)}catch(r){_(r.message,"error")}}),(l=document.getElementById("btnEditLeague"))==null||l.addEventListener("click",()=>{Ne(u,t,b)});const E=document.getElementById("tabRanking"),y=document.getElementById("tabTablon"),L=document.getElementById("sectionRanking"),S=document.getElementById("sectionTablon");E&&y&&(E.addEventListener("click",()=>{E.classList.add("league-tab--active"),y.classList.remove("league-tab--active"),L.classList.remove("hidden"),S.classList.add("hidden")}),y.addEventListener("click",()=>{y.classList.add("league-tab--active"),E.classList.remove("league-tab--active"),L.classList.add("hidden"),S.classList.remove("hidden");const r=document.getElementById("tablonEmbed");r&&!r.dataset.loaded&&(r.dataset.loaded="1",ce(r,{query:{liga:String(t)}}))}))}catch(p){e.innerHTML=`<div class="container"><p class="form__error">Error: ${p.message}</p><a href="#/ligas">Volver</a></div>`}}function Ne(e,a,t){const n=document.getElementById("editLeagueModal");n&&n.remove();const s=document.createElement("div");s.id="editLeagueModal",s.className="edit-league-modal",s.innerHTML=`
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
  `,document.body.appendChild(s),requestAnimationFrame(()=>s.classList.add("edit-league-modal--open"));const i=()=>{s.classList.remove("edit-league-modal--open"),s.addEventListener("transitionend",()=>s.remove(),{once:!0})};s.querySelector(".edit-league-modal__overlay").addEventListener("click",i),document.getElementById("btnCancelEdit").addEventListener("click",i),document.getElementById("editLeagueForm").addEventListener("submit",async o=>{o.preventDefault();const l=document.getElementById("btnSaveEdit");l.disabled=!0,l.textContent="Guardando…";const p={name:document.getElementById("editName").value.trim(),description:document.getElementById("editDesc").value.trim(),prize:document.getElementById("editPrize").value.trim(),is_public:document.getElementById("editPublic").checked};t!=null&&t.is_admin&&(p.is_official=document.getElementById("editOfficial").checked);try{await m.leagues.update(a,p),_("Liga actualizada"),i(),I.navigate(`/ligas/${a}`)}catch(u){_(u.message,"error"),l.disabled=!1,l.textContent="Guardar cambios"}})}async function De(e){var t,n;e.innerHTML='<div class="loading"><div class="loading__spinner"></div></div>';const a=$.getUser();try{const s=(()=>{const f=localStorage.getItem("activeLeagueId");return f?parseInt(f):null})(),[i,o,l,p,u]=await Promise.all([m.predictions.mine(s),m.predictions.getChampion(s),m.leagues.my(),m.auth.me(),a!=null&&a.is_admin?m.leagues.adminAll():Promise.resolve({leagues:[]})]),v=i.predictions.reduce((f,E)=>f+E.total_points,0)+(((t=o.champion_prediction)==null?void 0:t.points_earned)||0),c=p.user,g=c.status,b=c.total_points_all_time;e.innerHTML=`
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
          ${Oe(g,b)}
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
          ${i.predictions.length?`<div class="predictions-list">${i.predictions.map(Re).join("")}</div>`:'<p class="empty">Sin predicciones aún. <a href="#/quiniela">Ir a la quiniela</a></p>'}
        </section>

        <section class="section">
          <h2>Mis ligas</h2>
          ${l.leagues.length?`<ul class="leagues-list">${l.leagues.map(f=>`<li><a href="#/ligas/${f.id}">${f.name}</a> <span class="tag">${f.is_public?"Pública":"Privada"}</span></li>`).join("")}</ul>`:'<p class="empty">No perteneces a ninguna liga. <a href="#/ligas">Ver ligas</a></p>'}
        </section>

        ${a!=null&&a.is_admin&&u.leagues.length?`
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
    `,(n=e.querySelector("#btnLogoutPerfil"))==null||n.addEventListener("click",()=>{$.logout(),window.location.hash="/"})}catch(s){e.innerHTML=`<div class="container"><p class="form__error">Error: ${s.message}</p></div>`}}function Oe(e,a){if(e.next_threshold===null)return`
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
    </div>`}function Re(e){return`
    <div class="pred-row ${e.total_points>0?"pred-row--scored":""}">
      <span class="pred-row__result">${e.predicted_result}</span>
      <span class="pred-row__score">${e.predicted_home}-${e.predicted_away}</span>
      <span class="pred-row__pts">${e.total_points} pts</span>
    </div>
  `}const ae=new Date("2026-06-11T21:00:00Z"),Ge=["Argentina","Brasil","Francia","España","Inglaterra","Alemania","Portugal","Países Bajos","Italia","Bélgica","Uruguay","Colombia","México","Estados Unidos","Canadá","Marruecos","Senegal","Nigeria","Japón","Corea del Sur","Australia","Arabia Saudí","Irán","Qatar","Ecuador","Chile","Perú","Venezuela","Bolivia","Paraguay","Costa Rica","Honduras","Panamá","Jamaica","Trinidad y Tobago","Guatemala","Turquía","Polonia","Croacia","Serbia","República Checa","Eslovaquia","Austria","Suiza","Dinamarca","Suecia","Noruega","Escocia","Ucrania","Rumanía","Hungría","Grecia","Egipto","Camerún","Ghana","Costa de Marfil","Túnez","Argelia","China","India","Irak","Uzbekistán","Nueva Zelanda","Fiji"];function Ue(){const e=localStorage.getItem("activeLeagueId");return e?parseInt(e):null}async function ue(e){var a;if(!$.isLoggedIn()){e.innerHTML='<div class="container"><p class="notice"><a href="#/login">Inicia sesión</a> para predecir el campeón.</p></div>';return}e.innerHTML='<div class="loading"><div class="loading__spinner"></div></div>';try{const t=Ue(),{champion_prediction:n}=await m.predictions.getChampion(t),s=new Date>=ae;let i;n&&s?i=`
        <div class="champion-result">
          <p>Tu predicción: <strong class="champion-result__team">${n.team_name}</strong></p>
          <p>Puntos ganados: <strong>${n.points_earned}</strong></p>
          <p class="notice">🔒 El torneo ha comenzado, tu predicción está bloqueada.</p>
        </div>
      `:!n&&s?i=`
        <p class="notice notice--warning">⚠️ El torneo ya ha comenzado. Una vez confirmado no podrás cambiarlo.</p>
        ${z(null)}
      `:n&&!s?i=`
        <p class="notice">Puedes cambiar tu predicción hasta el inicio del torneo.</p>
        ${z(n.team_name)}
      `:i=z(null),e.innerHTML=`
      <div class="container">
        <h1 class="page-title">🏆 Predice el Campeón</h1>
        <p class="champion-desc">
          Acertar el campeón del mundo vale <strong>10 puntos extra</strong>.
          Puedes modificar tu elección hasta el inicio del torneo
          (${ae.toLocaleDateString("es-ES",{day:"numeric",month:"long",year:"numeric",hour:"2-digit",minute:"2-digit"})}).
        </p>
        ${i}
      </div>
    `,(a=document.getElementById("championForm"))==null||a.addEventListener("submit",async o=>{o.preventDefault();const l=document.getElementById("champBtn"),p=document.getElementById("champError"),u=document.getElementById("teamSearch").value.trim();if(u){l.disabled=!0,l.textContent="Guardando…",p.classList.add("hidden");try{await m.predictions.saveChampion(u,t),_(`¡${u} guardado como campeón!`),ue(e)}catch(v){p.textContent=v.message,p.classList.remove("hidden"),l.disabled=!1,l.textContent=l.dataset.label||"Confirmar predicción"}}})}catch(t){e.innerHTML=`<div class="container"><p class="form__error">Error: ${t.message}</p></div>`}}function z(e){const a=e?"Actualizar predicción":"Confirmar predicción";return`
    <form class="form champion-form" id="championForm">
      <div class="form__group">
        <label class="form__label" for="teamSearch">Selecciona el equipo campeón</label>
        <input class="form__input" type="text" id="teamSearch"
          placeholder="Escribe para buscar…"
          list="teamsList" autocomplete="off"
          value="${e??""}" required />
        <datalist id="teamsList">
          ${Ge.map(t=>`<option value="${t}">`).join("")}
        </datalist>
      </div>
      <p id="champError" class="form__error hidden"></p>
      <button class="btn btn--primary" type="submit" id="champBtn" data-label="${a}">
        ${a}
      </button>
    </form>
  `}const Fe=[{key:"group",label:"Grupos"},{key:"r32",label:"Dieciseisavos"},{key:"r16",label:"Octavos"},{key:"quarters",label:"Cuartos"},{key:"semis",label:"Semis"},{key:"third",label:"3er y 4to"},{key:"final",label:"Final"}];async function ze(e){if(!$.isAdmin()){e.innerHTML='<div class="container"><p class="form__error">Acceso denegado.</p></div>';return}e.innerHTML='<div class="loading"><div class="loading__spinner"></div></div>';try{const[{users:a},{groups:t}]=await Promise.all([m.auth.users(),m.matches.grouped()]),n=Ve(t);e.innerHTML=`
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
          ${Je(n)}
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
    `,We(e)}catch(a){e.innerHTML=`<div class="container"><p class="form__error">Error: ${a.message}</p></div>`}}function Ve(e){const a={};for(const t of e){const n=t.phase;a[n]||(a[n]=[]),a[n].push(...t.matches)}return a}function Je(e){const a=Fe.filter(s=>{var i;return(i=e[s.key])==null?void 0:i.length});if(!a.length)return'<p class="admin-section__desc">No hay partidos cargados.</p>';const t=a.map((s,i)=>`
    <button class="admin-result-tab${i===0?" admin-result-tab--active":""}" data-phase="${s.key}">
      ${s.label}
    </button>
  `).join(""),n=a.map((s,i)=>`
    <div class="admin-result-panel${i===0?"":" admin-result-panel--hidden"}" data-phase="${s.key}">
      ${(e[s.key]||[]).map(Xe).join("")}
    </div>
  `).join("");return`
    <div class="admin-result-tabs">${t}</div>
    <div id="resultPanels">${n}</div>
    <div class="admin-result-footer">
      <button class="btn btn--danger" id="btnRecalcAll">Recalcular todos los puntos</button>
      <span id="recalcResult" class="admin-result-footer__msg"></span>
    </div>
  `}function Xe(e){const a=e.status==="finished",t=a&&e.home_score_90!=null?e.home_score_90:"",n=a&&e.away_score_90!=null?e.away_score_90:"",s=a?'<span class="admin-match-badge admin-match-badge--done">Terminado</span>':'<span class="admin-match-badge admin-match-badge--pending">Pendiente</span>',i=Ke(e.match_datetime);return`
    <div class="admin-match-row" data-id="${e.id}">
      <div class="admin-match-row__info">
        <span class="admin-match-row__teams">${e.home_team} vs ${e.away_team}</span>
        <span class="admin-match-row__date">${i}</span>
        ${s}
      </div>
      <div class="admin-match-row__score">
        <input type="number" min="0" max="20" class="admin-match-row__input" value="${t}" placeholder="L" />
        <span class="admin-match-row__dash">-</span>
        <input type="number" min="0" max="20" class="admin-match-row__input" value="${n}" placeholder="V" />
        <button class="btn btn--primary btn--xs admin-match-row__save">Guardar</button>
      </div>
    </div>
  `}function Ke(e){return e?new Date(e).toLocaleDateString("es-ES",{day:"2-digit",month:"2-digit"}):"—"}function We(e){var n,s,i,o,l,p;(n=document.getElementById("btnSync"))==null||n.addEventListener("click",async()=>{const u=document.getElementById("syncResult");u.textContent="Sincronizando…";try{await m.matches.sync(),u.textContent="✓ Sincronización completada",_("Sincronización completada")}catch(v){u.textContent=`Error: ${v.message}`,_(v.message,"error")}}),(s=document.getElementById("awardForm"))==null||s.addEventListener("submit",async u=>{u.preventDefault();const v=document.getElementById("winnerTeam").value.trim();if(v)try{const{message:c}=await m.predictions.awardChampion(v);_(c)}catch(c){_(c.message,"error")}}),e.querySelectorAll(".admin-result-tab").forEach(u=>{u.addEventListener("click",()=>{var v;e.querySelectorAll(".admin-result-tab").forEach(c=>c.classList.remove("admin-result-tab--active")),e.querySelectorAll(".admin-result-panel").forEach(c=>c.classList.add("admin-result-panel--hidden")),u.classList.add("admin-result-tab--active"),(v=e.querySelector(`.admin-result-panel[data-phase="${u.dataset.phase}"]`))==null||v.classList.remove("admin-result-panel--hidden")})}),(i=document.getElementById("resultPanels"))==null||i.addEventListener("click",async u=>{const v=u.target.closest(".admin-match-row__save");if(!v)return;const c=v.closest(".admin-match-row"),g=parseInt(c.dataset.id),b=c.querySelectorAll(".admin-match-row__input"),f=b[0].value,E=b[1].value;if(f===""||E===""){_("Introduce ambos marcadores","error");return}v.disabled=!0;try{await m.matches.setResult(g,parseInt(f),parseInt(E));const y=c.querySelector(".admin-match-badge");y&&(y.className="admin-match-badge admin-match-badge--done",y.textContent="Terminado"),_(`Resultado ${f}-${E} guardado`)}catch(y){_(y.message,"error")}finally{v.disabled=!1}}),(o=document.getElementById("btnRecalcAll"))==null||o.addEventListener("click",async()=>{const u=document.getElementById("btnRecalcAll"),v=document.getElementById("recalcResult");u.disabled=!0,v.textContent="Recalculando…";try{const{message:c}=await m.matches.recalculate();v.textContent=`✓ ${c}`,_(c)}catch(c){v.textContent=`Error: ${c.message}`,_(c.message,"error")}finally{u.disabled=!1}});const a=document.getElementById("pushTarget"),t=document.getElementById("pushTargetIdGroup");a==null||a.addEventListener("change",()=>{t.classList.toggle("hidden",a.value==="all")}),(l=document.getElementById("pushForm"))==null||l.addEventListener("submit",async u=>{u.preventDefault();const v=document.getElementById("pushTitle").value.trim()||"Aviso",c=document.getElementById("pushBody").value.trim(),g=a.value,b=parseInt(document.getElementById("pushTargetId").value)||null,f=document.getElementById("pushResult"),E={title:`📣 PickGoal — ${v}`,body:c};g==="league"&&b&&(E.league_id=b),g==="user"&&b&&(E.user_id=b),f.textContent="Enviando…";try{const{sent:y}=await m.notifications.send(E);f.textContent=`✓ Enviada a ${y} suscripción(es)`,_(`Notificación enviada a ${y} suscripción(es)`)}catch(y){f.textContent=`Error: ${y.message}`,_(y.message,"error")}}),(p=document.getElementById("usersTableBody"))==null||p.addEventListener("click",async u=>{const v=u.target.closest(".toggle-admin");if(!v)return;const c=parseInt(v.dataset.id);try{const{user:g}=await m.auth.toggleAdmin(c);v.closest("tr").querySelector(".admin-badge").textContent=g.is_admin?"Sí":"No",_(`${g.username} ${g.is_admin?"ahora es admin":"ya no es admin"}`)}catch(g){_(g.message,"error")}})}function Ye(e){return`
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
  `}function Qe(e){e.innerHTML=`
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
  `,document.getElementById("forgotForm").addEventListener("submit",async a=>{a.preventDefault();const t=document.getElementById("forgotBtn"),n=document.getElementById("forgotMsg"),s=document.getElementById("email").value.trim();t.disabled=!0,t.textContent="Enviando…";try{await m.auth.forgotPassword(s),n.textContent="Si el email existe, recibirás un enlace en breve.",n.classList.remove("hidden","form__error"),n.classList.add("form__success")}catch{_("Error al enviar el email","error")}finally{t.disabled=!1,t.textContent="Enviar enlace"}})}function Ze(e,{query:a}){const t=a.token||"";if(!t){e.innerHTML='<div class="container"><p class="form__error">Token inválido o expirado.</p><a href="#/login">Volver</a></div>';return}e.innerHTML=`
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
  `,document.getElementById("resetForm").addEventListener("submit",async n=>{n.preventDefault();const s=document.getElementById("resetBtn"),i=document.getElementById("resetError"),o=document.getElementById("password").value;s.disabled=!0,s.textContent="Guardando…",i.classList.add("hidden");try{await m.auth.resetPassword(t,o),_("Contraseña actualizada. Ya puedes iniciar sesión."),I.navigate("/login")}catch(l){i.textContent=l.message||"Error al restablecer la contraseña",i.classList.remove("hidden")}finally{s.disabled=!1,s.textContent="Guardar contraseña"}})}const ea={r32:"Dieciseisavos",r16:"Octavos",quarters:"Cuartos",semis:"Semis",third:"3º y 4º",final:"Final"};let N=!1,P=null;async function aa(e){N=!1,P=null,e.innerHTML='<div class="loading"><div class="loading__spinner"></div></div>';try{const{groups:a}=await m.matches.grouped(),t=$.isAdmin();e.innerHTML=`
      <div class="container">
        <div class="resultados-topbar">
          <h1 class="page-title">Resultados — Mundial 2026</h1>
          ${t?'<button class="btn btn--ghost btn--sm" id="btnEditResults">✏️ Editar resultados</button>':""}
        </div>
        <nav class="phase-nav" id="phaseNav"></nav>
        <div id="phaseContent"></div>
      </div>
    `,t&&document.getElementById("btnEditResults").addEventListener("click",()=>{N=!N;const n=document.getElementById("btnEditResults");N?(n.textContent="✅ Editando — salir",n.classList.add("btn--warning")):(n.textContent="✏️ Editar resultados",n.classList.remove("btn--warning")),P&&G(P.data,P.isGroup)}),document.getElementById("phaseContent").addEventListener("click",async n=>{const s=n.target.closest(".res-match__save");if(!s)return;const i=parseInt(s.dataset.id),o=s.closest(".res-match"),l=o.querySelector(".res-match__input-home").value,p=o.querySelector(".res-match__input-away").value;if(l===""||p===""){_("Introduce ambos marcadores","error");return}s.disabled=!0;try{if(await m.matches.setResult(i,parseInt(l),parseInt(p)),_(`${l} - ${p} guardado`),P){const u=P.data.matches.find(v=>v.id===i);u&&(u.home_score_90=parseInt(l),u.away_score_90=parseInt(p),u.status="finished"),G(P.data,P.isGroup)}}catch(u){_(u.message,"error"),s.disabled=!1}}),ta(a)}catch(a){e.innerHTML=`<div class="container"><p class="form__error">Error cargando los partidos: ${a.message}</p></div>`}}function ta(e){var i;const a=document.getElementById("phaseNav");if(!a)return;const t=e.filter(o=>o.phase==="group"),n=e.filter(o=>o.phase!=="group"),s=[...t.map(o=>({key:`group_${o.group_name}`,label:`Grupo ${o.group_name}`,data:o,isGroup:!0})),...n.map(o=>({key:o.phase,label:ea[o.phase]||o.label,data:o,isGroup:!1}))];s.length!==0&&(a.innerHTML=s.map((o,l)=>`
    <button class="phase-nav__btn ${l===0?"phase-nav__btn--active":""}" data-key="${o.key}">
      ${o.label}
    </button>
  `).join(""),(i=a.querySelector(".phase-nav__btn--active"))==null||i.scrollIntoView({inline:"center",behavior:"instant",block:"nearest"}),a.querySelectorAll(".phase-nav__btn").forEach(o=>{o.addEventListener("click",()=>{a.querySelectorAll(".phase-nav__btn").forEach(p=>p.classList.remove("phase-nav__btn--active")),o.classList.add("phase-nav__btn--active");const l=s.find(p=>p.key===o.dataset.key);l&&(P=l,G(l.data,l.isGroup))})}),P=s[0],G(s[0].data,s[0].isGroup))}function G(e,a){const t=document.getElementById("phaseContent");if(!t)return;const n=sa(e.matches);if(a){const s=na(e.matches);t.innerHTML=`
      <div class="resultados-section">
        <div class="resultados-matches">${n}</div>
        <div class="standings">
          <h3 class="standings__title">Clasificación — Grupo ${e.group_name}</h3>
          ${ia(s)}
        </div>
      </div>
    `}else t.innerHTML=`<div class="resultados-matches">${n}</div>`}function sa(e){return!e||e.length===0?'<p class="empty">Sin partidos en esta fase.</p>':e.map(a=>{const t={scheduled:"Programado",live:"🔴 En juego",finished:"Finalizado"}[a.status]||a.status;let n;if(N){const s=a.home_score_90??"",i=a.away_score_90??"";n=`
        <div class="res-match__edit-score">
          <input type="number" min="0" max="20" class="res-match__input-home" value="${s}" placeholder="L" />
          <span class="res-match__edit-dash">-</span>
          <input type="number" min="0" max="20" class="res-match__input-away" value="${i}" placeholder="V" />
          <button class="btn btn--primary btn--xs res-match__save" data-id="${a.id}">Guardar</button>
        </div>
      `}else a.status!=="scheduled"?n=`<span class="res-score">${a.home_score_90??"?"} - ${a.away_score_90??"?"}</span>`:n='<span class="res-score res-score--pending">vs</span>';return`
      <div class="res-match ${a.status==="finished"?"res-match--finished":""} ${a.status==="live"?"res-match--live":""} ${N?"res-match--editing":""}">
        <div class="res-match__meta">
          <span class="res-match__status">${t}</span>
          <span class="res-match__date">${j(a.match_datetime)}</span>
        </div>
        <div class="res-match__teams">
          <span class="res-match__team res-match__team--home">${a.home_team}</span>
          ${n}
          <span class="res-match__team res-match__team--away">${a.away_team}</span>
        </div>
      </div>
    `}).join("")}function na(e){const a={};for(const t of e)if(a[t.home_team]||(a[t.home_team]={name:t.home_team,pj:0,g:0,e:0,p:0,gf:0,gc:0,pts:0}),a[t.away_team]||(a[t.away_team]={name:t.away_team,pj:0,g:0,e:0,p:0,gf:0,gc:0,pts:0}),t.status==="finished"&&t.home_score_90!==null&&t.away_score_90!==null){const n=a[t.home_team],s=a[t.away_team];n.pj++,s.pj++,n.gf+=t.home_score_90,n.gc+=t.away_score_90,s.gf+=t.away_score_90,s.gc+=t.home_score_90,t.home_score_90>t.away_score_90?(n.g++,n.pts+=3,s.p++):t.home_score_90<t.away_score_90?(s.g++,s.pts+=3,n.p++):(n.e++,n.pts++,s.e++,s.pts++)}return Object.values(a).sort((t,n)=>{if(n.pts!==t.pts)return n.pts-t.pts;const s=n.gf-n.gc,i=t.gf-t.gc;return s!==i?s-i:n.gf-t.gf})}function ia(e){return e.length===0?'<p class="empty">Sin datos de clasificación.</p>':`
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
  `}async function oa(e,{query:a}){const t=(a.codigo||"").trim().toUpperCase();if(!t){e.innerHTML='<div class="container"><p class="form__error">Enlace de invitación inválido.</p><a href="#/ligas">Ver ligas</a></div>';return}if(!$.isLoggedIn()){sessionStorage.setItem("pendingInviteCode",t),I.navigate("/register");return}e.innerHTML='<div class="loading"><div class="loading__spinner"></div></div>';try{const{league:n}=await m.leagues.joinByCode(t);_(`¡Te has unido a "${n.name}"!`),I.navigate(`/ligas/${n.id}`)}catch(n){if(n.status===409){_("Ya eres miembro de esta liga");try{const{leagues:s}=await m.leagues.my(),i=s.find(o=>o.invite_code===t);if(i){I.navigate(`/ligas/${i.id}`);return}}catch{}}e.innerHTML=`
      <div class="container">
        <div class="league-gate">
          <div class="league-gate__icon">⚠️</div>
          <h2 class="league-gate__title">Error al unirse</h2>
          <p class="league-gate__text">${n.message}</p>
          <a href="#/ligas" class="btn btn--primary">Ver ligas</a>
        </div>
      </div>
    `}}function ra(){const e=localStorage.getItem("activeLeagueId");return e?parseInt(e):null}async function la(e,{params:a}){const t=parseInt(a.id);if(!t){e.innerHTML='<div class="container"><p class="form__error">Usuario no válido.</p></div>';return}e.innerHTML='<div class="loading"><div class="loading__spinner"></div></div>';try{const n=ra(),{user:s,predictions:i}=await m.predictions.forUser(t,n);e.innerHTML=`
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
              ${i.map(o=>da(o)).join("")}
            </div>`}
      </div>
    `}catch(n){e.innerHTML=`<div class="container"><p class="form__error">Error: ${n.message}</p></div>`}}function da(e){const a=e.match,t=e.total_points,n=e.pts_score>0,s=e.pts_result>0;let i="";return n?i='<span class="jugador__badge jugador__badge--exact">Exacto</span>':s?i='<span class="jugador__badge jugador__badge--ok">1X2 ✓</span>':i='<span class="jugador__badge jugador__badge--miss">Fallo</span>',`
    <div class="jugador__pred-row">
      <div class="jugador__pred-match">
        <span class="jugador__pred-teams">${a.home_team} vs ${a.away_team}</span>
        <span class="jugador__pred-date">${j(a.match_datetime)}</span>
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
  `}const ca={"/":be,"/login":Le,"/register":Ie,"/quiniela":Se,"/resultados":aa,"/ranking":Me,"/tablon":ce,"/ligas":Ae,"/ligas/:id":He,"/perfil":De,"/campeon":ue,"/admin":ze,"/forgot-password":Qe,"/reset-password":Ze,"/unirse":oa,"/jugador/:id":la};function ua(e){for(const[a,t]of Object.entries(ca)){const n=[],s=new RegExp("^"+a.replace(/:([^/]+)/g,(o,l)=>(n.push(l),"([^/]+)"))+"$"),i=e.match(s);if(i){const o={};return n.forEach((l,p)=>{o[l]=i[p+1]}),{handler:t,params:o}}}return null}const te=()=>document.getElementById("mainContent"),I={init(){window.addEventListener("hashchange",()=>this.resolve()),this.resolve()},navigate(e){window.location.hash=e},resolve(){const e=window.location.hash.slice(1)||"/",[a,t]=e.split("?"),n=Object.fromEntries(new URLSearchParams(t||"")),s=ua(a);if(!s){te().innerHTML='<div class="error-page"><h2>Página no encontrada</h2><a href="#/">Volver al inicio</a></div>';return}const{handler:i,params:o}=s;if(["/perfil","/campeon","/admin"].includes(a)&&!$.isLoggedIn()){this.navigate("/login");return}if(a==="/admin"&&!$.isAdmin()){this.navigate("/");return}const p=te();p.innerHTML='<div class="loading"><div class="loading__spinner"></div></div>',i(p,{params:o,query:n})}};let R=[],D=null,q=null;async function pa(){await $.init(),I.init(),_a(),ma(),ba()}function pe(){return localStorage.getItem("pwa_installed")==="true"||window.matchMedia("(display-mode: standalone)").matches||window.navigator.standalone===!0}function ma(){window.addEventListener("beforeinstallprompt",e=>{e.preventDefault(),!pe()&&(D=e,ga())}),window.addEventListener("appinstalled",()=>{var e;localStorage.setItem("pwa_installed","true"),D=null,(e=document.getElementById("installBanner"))==null||e.remove()})}function ga(){if(pe()||sessionStorage.getItem("installBannerDismissed"))return;const e=document.createElement("div");e.id="installBanner",e.className="install-banner",e.innerHTML=`
    <span class="install-banner__text">⚽ Instala PickGoal en tu dispositivo</span>
    <div class="install-banner__actions">
      <button class="install-banner__btn install-banner__btn--primary" id="installBtn">Instalar</button>
      <button class="install-banner__btn install-banner__btn--ghost" id="installDismissBtn">Ahora no</button>
    </div>
  `,document.body.appendChild(e),document.getElementById("installBtn").addEventListener("click",async()=>{D&&(D.prompt(),await D.userChoice,D=null,e.remove())}),document.getElementById("installDismissBtn").addEventListener("click",()=>{sessionStorage.setItem("installBannerDismissed","1"),e.remove()})}function H(){var e,a;(e=document.getElementById("userDropdown"))==null||e.classList.add("hidden"),(a=document.getElementById("userBtn"))==null||a.classList.remove("navbar__dropdown-btn--open")}async function J(){const e=document.getElementById("tablonBadge");if(!e)return;if(!$.getUser()){e.classList.add("hidden");return}const t=localStorage.getItem("activeLeagueId");if(!t){e.classList.add("hidden");return}const n=localStorage.getItem(`tablon_last_read_${t}`)||new Date(0).toISOString();try{const{count:s}=await m.board.unread(parseInt(t),n);s>0?(e.textContent=s>99?"99+":String(s),e.classList.remove("hidden")):e.classList.add("hidden")}catch{e.classList.add("hidden")}}function _a(){var e,a,t;document.addEventListener("auth:change",se),window.addEventListener("hashchange",()=>{H(),me(),setTimeout(J,200)}),document.addEventListener("click",H),(e=document.getElementById("userBtn"))==null||e.addEventListener("click",n=>{var o;n.stopPropagation();const s=document.getElementById("userDropdown"),i=s==null?void 0:s.classList.contains("hidden");H(),i&&(s==null||s.classList.remove("hidden"),(o=document.getElementById("userBtn"))==null||o.classList.add("navbar__dropdown-btn--open"))}),(a=document.getElementById("userDropdown"))==null||a.addEventListener("click",n=>{n.stopPropagation(),n.target.closest("#navProfileLink")&&H()}),(t=document.getElementById("navLogoutBtn"))==null||t.addEventListener("click",()=>{R=[],localStorage.removeItem("activeLeagueId"),H(),$.logout(),I.navigate("/")}),se()}async function se(){const e=document.getElementById("navAuthLinks"),a=document.getElementById("userBtn"),t=document.getElementById("navUsername"),n=document.getElementById("bottomNav"),s=$.getUser();if(H(),s){e==null||e.classList.add("hidden"),t&&(t.textContent=s.username),a.style.visibility="visible",n==null||n.classList.remove("hidden"),document.body.classList.add("has-bottom-nav");try{const{leagues:i}=s.is_admin?await m.leagues.adminAll():await m.leagues.my();R=i}catch{R=[]}va(R),J(),q&&clearInterval(q),q=setInterval(J,5*60*1e3)}else e==null||e.classList.remove("hidden"),a.style.visibility="hidden",n==null||n.classList.add("hidden"),document.body.classList.remove("has-bottom-nav"),R=[],localStorage.removeItem("activeLeagueId"),q&&(clearInterval(q),q=null);me()}function va(e){const a=localStorage.getItem("activeLeagueId");a&&e.some(n=>String(n.id)===String(a))||(e.length>0?localStorage.setItem("activeLeagueId",String(e[0].id)):localStorage.removeItem("activeLeagueId"))}function me(){const e=window.location.hash.slice(1).split("?")[0]||"/";document.querySelectorAll(".bottom-nav__item").forEach(a=>{const t=a.dataset.route,n=t==="/"?e==="/":e===t||e.startsWith(t+"/");a.classList.toggle("bottom-nav__item--active",n)})}function ha(e){const a="=".repeat((4-e.length%4)%4),t=(e+a).replace(/-/g,"+").replace(/_/g,"/"),n=atob(t);return Uint8Array.from([...n].map(s=>s.charCodeAt(0)))}async function ba(){if(!(!("serviceWorker"in navigator)||!("PushManager"in window)))try{const e=await navigator.serviceWorker.register("/sw.js");document.addEventListener("auth:change",async a=>{a.detail&&await ne(e)}),$.getUser()&&await ne(e)}catch{}}async function ne(e){try{if(await Notification.requestPermission()!=="granted")return;const t=await e.pushManager.getSubscription();if(t){await m.notifications.subscribe(t.toJSON());return}const{public_key:n}=await m.notifications.vapidPublicKey();if(!n)return;const s=await e.pushManager.subscribe({userVisibleOnly:!0,applicationServerKey:ha(n)});await m.notifications.subscribe(s.toJSON())}catch{}}pa();
