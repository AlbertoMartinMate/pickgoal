(function(){const a=document.createElement("link").relList;if(a&&a.supports&&a.supports("modulepreload"))return;for(const s of document.querySelectorAll('link[rel="modulepreload"]'))n(s);new MutationObserver(s=>{for(const i of s)if(i.type==="childList")for(const r of i.addedNodes)r.tagName==="LINK"&&r.rel==="modulepreload"&&n(r)}).observe(document,{childList:!0,subtree:!0});function t(s){const i={};return s.integrity&&(i.integrity=s.integrity),s.referrerPolicy&&(i.referrerPolicy=s.referrerPolicy),s.crossOrigin==="use-credentials"?i.credentials="include":s.crossOrigin==="anonymous"?i.credentials="omit":i.credentials="same-origin",i}function n(s){if(s.ep)return;s.ep=!0;const i=t(s);fetch(s.href,i)}})();const R="https://pickgoal-backend.onrender.com/api";function G(){return localStorage.getItem("token")}async function m(e,a={}){const t={"Content-Type":"application/json",...a.headers},n=G();n&&(t.Authorization=`Bearer ${n}`);const s=await fetch(`${R}${e}`,{...a,headers:t}),i=await s.json().catch(()=>({}));if(!s.ok)throw{status:s.status,message:i.error||"Error desconocido"};return i}const u={get:e=>m(e),post:(e,a)=>m(e,{method:"POST",body:JSON.stringify(a)}),patch:(e,a)=>m(e,{method:"PATCH",body:JSON.stringify(a)}),delete:e=>m(e,{method:"DELETE"}),auth:{register:e=>m("/auth/register",{method:"POST",body:JSON.stringify(e)}),login:e=>m("/auth/login",{method:"POST",body:JSON.stringify(e)}),me:()=>m("/auth/me"),forgotPassword:e=>m("/auth/forgot-password",{method:"POST",body:JSON.stringify({email:e})}),resetPassword:(e,a)=>m("/auth/reset-password",{method:"POST",body:JSON.stringify({token:e,password:a})}),ranking:e=>m(`/auth/ranking${e?`?league_id=${e}`:""}`),users:()=>m("/auth/users"),toggleAdmin:e=>m(`/auth/users/${e}/toggle-admin`,{method:"PATCH"})},matches:{grouped:()=>m("/matches/grouped"),list:(e="")=>m(`/matches/${e}`),get:e=>m(`/matches/${e}`),sync:()=>m("/matches/sync",{method:"POST"})},predictions:{mine:e=>m(`/predictions/${e?`?league_id=${e}`:""}`),forMatch:(e,a)=>m(`/predictions/match/${e}${a?`?league_id=${a}`:""}`),save:e=>m("/predictions/",{method:"POST",body:JSON.stringify(e)}),forUser:(e,a)=>m(`/predictions/user/${e}${a?`?league_id=${a}`:""}`),getChampion:e=>m(`/predictions/champion${e?`?league_id=${e}`:""}`),saveChampion:(e,a)=>m("/predictions/champion",{method:"POST",body:JSON.stringify({team_name:e,league_id:a??null})}),awardChampion:e=>m("/predictions/champion/award",{method:"POST",body:JSON.stringify({team_name:e})})},leagues:{all:()=>m("/leagues/all"),public:()=>m("/leagues/public"),my:()=>m("/leagues/my"),create:e=>m("/leagues/",{method:"POST",body:JSON.stringify(e)}),join:e=>m("/leagues/join",{method:"POST",body:JSON.stringify(e)}),joinByCode:e=>m(`/leagues/join/${encodeURIComponent(e)}`),get:e=>m(`/leagues/${e}`),leave:e=>m(`/leagues/${e}/leave`,{method:"DELETE"}),matchPredictions:(e,a)=>m(`/leagues/${e}/predictions/${a}`)},home:{summary:()=>m("/home/summary")},board:{messages:(e=1)=>m(`/board/?page=${e}`),post:e=>m("/board/",{method:"POST",body:JSON.stringify({message:e})}),delete:e=>m(`/board/${e}`,{method:"DELETE"})}};let y=null;const v={async init(){if(localStorage.getItem("token"))try{const{user:a}=await u.auth.me();y=a}catch{localStorage.removeItem("token")}},setUser(e,a){y=e,localStorage.setItem("token",a),document.dispatchEvent(new CustomEvent("auth:change",{detail:e}))},logout(){y=null,localStorage.removeItem("token"),document.dispatchEvent(new CustomEvent("auth:change",{detail:null}))},getUser(){return y},isLoggedIn(){return!!y},isAdmin(){return(y==null?void 0:y.is_admin)===!0}};let B=null;function p(e,a="success"){let t=document.getElementById("toast");t||(t=document.createElement("div"),t.id="toast",document.body.appendChild(t)),t.textContent=e,t.className=`toast toast--${a} toast--visible`,B&&clearTimeout(B),B=setTimeout(()=>{t.classList.remove("toast--visible")},3e3)}function q(){return`
    <div class="container">
      <div class="league-gate">
        <div class="league-gate__icon">⚽</div>
        <h2 class="league-gate__title">¡Inicia tu Liga!</h2>
        <p class="league-gate__text">Únete a una liga para empezar a predecir</p>
        <a href="#/ligas" class="btn btn--primary">Ver ligas disponibles</a>
      </div>
    </div>
  `}function E(e){return e?new Date(e).toLocaleString("es-ES",{day:"2-digit",month:"2-digit",year:"numeric",hour:"2-digit",minute:"2-digit"}):"—"}async function F(e){if(!v.getUser()){z(e);return}e.innerHTML='<div class="loading"><div class="loading__spinner"></div></div>';try{const{leagues_summary:t,upcoming_matches:n}=await u.home.summary();if(t.length===0){J(e);return}const s=(()=>{const r=localStorage.getItem("activeLeagueId");return r?parseInt(r):null})(),i=[...t].sort((r,o)=>r.league_id===s?-1:o.league_id===s?1:0);e.innerHTML=`
      <div class="home-dashboard container">
        <div class="home-dashboard__leagues">
          ${i.map(r=>X(r)).join("")}
        </div>
        ${Y(n)}
      </div>
    `}catch(t){e.innerHTML=`<div class="container"><p class="form__error">Error cargando el inicio: ${t.message}</p></div>`}}function z(e){e.innerHTML=`
    <section class="hero">
      <div class="hero__content">
        <img src="/assets/logo-completo.jpg" alt="PickGoal" class="hero__logo-img" />
        <div class="hero__cta">
          <a href="#/register" class="btn btn--primary btn--lg">Registrarse</a>
          <a href="#/login" class="btn btn--ghost btn--lg">Ya tengo cuenta</a>
        </div>
      </div>
    </section>
    <section class="features container">
      <div class="features__grid">
        <div class="feature-card">
          <span class="feature-card__icon">📋</span>
          <h3>Quiniela completa</h3>
          <p>Predice los 104 partidos del Mundial, desde grupos hasta la final.</p>
        </div>
        <div class="feature-card">
          <span class="feature-card__icon">🏆</span>
          <h3>Ligas privadas y públicas</h3>
          <p>Compite con amigos en ligas privadas o únete a ligas públicas.</p>
        </div>
        <div class="feature-card">
          <span class="feature-card__icon">⚡</span>
          <h3>Resultados en tiempo real</h3>
          <p>Los puntos se calculan automáticamente al terminar cada partido.</p>
        </div>
        <div class="feature-card">
          <span class="feature-card__icon">🌟</span>
          <h3>Predice el campeón</h3>
          <p>Gana 10 puntos extra si aciertas el campeón del mundo antes del inicio.</p>
        </div>
      </div>
    </section>
  `}function J(e){e.innerHTML=`
    <section class="hero">
      <div class="hero__content">
        <img src="/assets/logo-completo.jpg" alt="PickGoal" class="hero__logo-img" />
        <p class="hero__subtitle">Únete a una liga y empieza a predecir el Mundial 2026</p>
        <div class="hero__cta">
          <a href="#/ligas" class="btn btn--primary btn--lg">Unirse a una liga</a>
        </div>
      </div>
    </section>
  `}function V(e){return`${e}º`}function X(e){const a=e.next_to_predict?`<div class="league-card__next">
         <span class="league-card__next-label">Próximo a predecir</span>
         <span class="league-card__next-match">${e.next_to_predict.home_team} vs ${e.next_to_predict.away_team}</span>
         <span class="league-card__next-date">${E(e.next_to_predict.match_datetime)}</span>
       </div>`:`<div class="league-card__next league-card__next--done">
         Todos los partidos predichos
       </div>`;return`
    <div class="league-card">
      <div class="league-card__header">
        <h2 class="league-card__name">${e.league_name}</h2>
        <span class="league-card__rank">${V(e.rank)} de ${e.member_count}</span>
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
  `}function Y(e){return e.length?`
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
              <span class="upcoming-match__date">${E(a.match_datetime)}</span>
              ${t?'<span class="upcoming-match__badge upcoming-match__badge--done">Predicho</span>':'<span class="upcoming-match__badge upcoming-match__badge--pending">Sin predecir</span>'}
            </div>
          </div>
        `).join("")}
      </div>
      <a class="btn btn--ghost btn--sm" href="#/quiniela">Ver todos los pronósticos</a>
    </section>
  `:""}function Q(e){e.innerHTML=`
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
  `,document.getElementById("loginForm").addEventListener("submit",async a=>{a.preventDefault();const t=document.getElementById("loginBtn"),n=document.getElementById("loginError"),s=document.getElementById("identifier").value.trim(),i=document.getElementById("password").value;t.disabled=!0,t.textContent="Entrando…",n.classList.add("hidden");try{const{token:r,user:o}=await u.auth.login({identifier:s,password:i});v.setUser(o,r),p(`¡Bienvenido, ${o.username}!`),h.navigate("/quiniela")}catch(r){n.textContent=r.message||"Error al iniciar sesión",n.classList.remove("hidden")}finally{t.disabled=!1,t.textContent="Entrar"}})}function K(e){e.innerHTML=`
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
  `,document.getElementById("registerForm").addEventListener("submit",async a=>{a.preventDefault();const t=document.getElementById("registerBtn"),n=document.getElementById("registerError");t.disabled=!0,t.textContent="Creando cuenta…",n.classList.add("hidden");const s={username:document.getElementById("username").value.trim(),email:document.getElementById("email").value.trim(),country:document.getElementById("country").value.trim(),password:document.getElementById("password").value};try{const{token:i,user:r}=await u.auth.register(s);v.setUser(r,i),p("¡Cuenta creada! Bienvenido a PickGoal");const o=sessionStorage.getItem("pendingInviteCode");if(o){sessionStorage.removeItem("pendingInviteCode");try{const{league:c}=await u.leagues.joinByCode(o);p(`¡Te has unido a "${c.name}"!`),h.navigate(`/ligas/${c.id}`)}catch{h.navigate("/ligas")}}else h.navigate("/campeon")}catch(i){n.textContent=i.message||"Error al registrarse",n.classList.remove("hidden")}finally{t.disabled=!1,t.textContent="Crear cuenta"}})}function W(){const e=localStorage.getItem("activeLeagueId");return e?parseInt(e):null}async function Z(e){e.innerHTML='<div class="loading"><div class="loading__spinner"></div></div>';try{if(v.isLoggedIn()){const{leagues:d}=await u.leagues.my();if(d.length===0){e.innerHTML=q();return}}const a=W(),[{groups:t},n]=await Promise.all([u.matches.grouped(),v.isLoggedIn()?u.predictions.mine(a):Promise.resolve({predictions:[]})]),s={};for(const d of n.predictions)s[d.match_id]=d;const i=t.flatMap(d=>d.matches),r=new Map;for(const d of i){const g=k(d.match_datetime);r.has(g)||r.set(g,[]),r.get(g).push(d)}const o=[...r.keys()].sort(),c=k(new Date().toISOString()),l=o.find(d=>d>=c)??o[0];e.innerHTML=`
      <div class="container">
        <h1 class="page-title">Pronósticos — Mundial 2026</h1>
        ${v.isLoggedIn()?"":'<p class="notice">⚠️ <a href="#/login">Inicia sesión</a> para guardar tus predicciones.</p>'}
        <nav class="date-nav" id="dateNav"></nav>
        <div id="matchesContent"></div>
      </div>
    `,ee(o,l,r,s,a)}catch(a){e.innerHTML=`<div class="container"><p class="form__error">Error cargando los partidos: ${a.message}</p></div>`}}function ee(e,a,t,n,s){var r;const i=document.getElementById("dateNav");i&&(i.innerHTML=e.map(o=>`
    <button class="date-nav__btn ${o===a?"date-nav__btn--active":""}" data-day="${o}">
      ${ae(o)}
    </button>
  `).join(""),(r=i.querySelector(".date-nav__btn--active"))==null||r.scrollIntoView({inline:"center",behavior:"instant",block:"nearest"}),i.querySelectorAll(".date-nav__btn").forEach(o=>{o.addEventListener("click",()=>{i.querySelectorAll(".date-nav__btn").forEach(c=>c.classList.remove("date-nav__btn--active")),o.classList.add("date-nav__btn--active"),T(t.get(o.dataset.day)??[],n,s)})}),T(t.get(a)??[],n,s))}function T(e,a,t){const n=document.getElementById("matchesContent");if(n){if(e.length===0){n.innerHTML='<p class="empty">Sin partidos este día.</p>';return}n.innerHTML=`<div class="matches-grid">${e.map(s=>te(s,a[s.id])).join("")}</div>`,v.isLoggedIn()&&n.querySelectorAll(".prediction-form").forEach(s=>{ne(s,a,t)})}}function k(e){const a=new Date(e);return`${a.getFullYear()}-${String(a.getMonth()+1).padStart(2,"0")}-${String(a.getDate()).padStart(2,"0")}`}function ae(e){const[a,t,n]=e.split("-").map(Number);return new Date(a,t-1,n).toLocaleDateString("es-ES",{day:"numeric",month:"short"})}function te(e,a){const t=e.is_locked,n=a?`<span class="pts-badge">${a.total_points} pts</span>`:"",s={scheduled:"Programado",live:"🔴 En juego",finished:"Finalizado"}[e.status];return`
    <div class="match-card ${t?"match-card--locked":""}" data-match-id="${e.id}">
      <div class="match-card__header">
        <span class="match-card__status">${s}</span>
        <span class="match-card__date">${E(e.match_datetime)}</span>
        ${n}
      </div>
      <div class="match-card__teams">
        <span class="team team--home">${e.home_team}</span>
        <div class="match-card__score">
          ${e.status!=="scheduled"?`<span class="score">${e.home_score_90??"?"} - ${e.away_score_90??"?"}</span>`:'<span class="score score--dash">vs</span>'}
        </div>
        <span class="team team--away">${e.away_team}</span>
      </div>
      ${!t&&v.isLoggedIn()?se(e,a):t&&a?`<div class="prediction-result">
               Tu predicción: <strong>${a.predicted_home}-${a.predicted_away}</strong>
               (${a.predicted_result}) · ${a.total_points} pts
             </div>`:""}
    </div>
  `}function se(e,a){const t=(a==null?void 0:a.predicted_home)??0,n=(a==null?void 0:a.predicted_away)??0,s=(a==null?void 0:a.predicted_result)??"X";return`
    <form class="prediction-form" data-match-id="${e.id}">
      <div class="result-selector">
        ${["1","X","2"].map(i=>`
          <label class="result-selector__option">
            <input type="radio" name="predicted_result" value="${i}" ${s===i?"checked":""} required />
            ${i}
          </label>
        `).join("")}
      </div>
      <div class="prediction-form__inputs">
        <input type="number" name="predicted_home" class="score-input" min="0" max="30"
          value="${t}" placeholder="0" required />
        <span>-</span>
        <input type="number" name="predicted_away" class="score-input" min="0" max="30"
          value="${n}" placeholder="0" required />
      </div>
      <button type="submit" class="btn btn--primary btn--sm">Guardar</button>
    </form>
  `}function ne(e,a,t){e.addEventListener("submit",async n=>{var l;n.preventDefault();const s=parseInt(e.dataset.matchId),i=parseInt(e.querySelector("[name=predicted_home]").value),r=parseInt(e.querySelector("[name=predicted_away]").value),o=(l=e.querySelector("[name=predicted_result]:checked"))==null?void 0:l.value;if(isNaN(i)||isNaN(r)||!o)return;const c=e.querySelector("button");c.disabled=!0,c.textContent="…";try{const{prediction:d}=await u.predictions.save({match_id:s,predicted_result:o,predicted_home:i,predicted_away:r,league_id:t??null});a[s]=d,p("Predicción guardada"),c.textContent="✓ Guardado",setTimeout(()=>{c.disabled=!1,c.textContent="Guardar"},2e3)}catch(d){p(d.message||"Error al guardar","error"),c.disabled=!1,c.textContent="Guardar"}})}function ie(){const e=localStorage.getItem("activeLeagueId");return e?parseInt(e):null}async function re(e){e.innerHTML='<div class="loading"><div class="loading__spinner"></div></div>';try{if(v.isLoggedIn()){const{leagues:o}=await u.leagues.my();if(o.length===0){e.innerHTML=q();return}}const a=ie(),[{ranking:t},n]=await Promise.all([u.auth.ranking(a),v.isLoggedIn()?u.leagues.my():Promise.resolve({leagues:[]})]),s=v.getUser(),i=n.leagues.find(o=>o.id===a),r=i?i.name:"Clasificación General";e.innerHTML=`
      <div class="container">
        <h1 class="page-title">${r}</h1>
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
              ${t.map(o=>`
                <tr class="${s&&o.id===s.id?"ranking-table__row--me":""}">
                  <td class="ranking-table__pos" data-pos="${o.position}">${o.position}</td>
                  <td><a class="ranking-table__link" href="#/jugador/${o.id}">${o.username}</a></td>
                  <td>${o.country||"—"}</td>
                  <td class="ranking-table__pts">${o.total_points}</td>
                  <td class="ranking-table__stat">${o.correct_results}</td>
                  <td class="ranking-table__stat">${o.exact_scores}</td>
                </tr>
              `).join("")}
            </tbody>
          </table>
        </div>
      </div>
    `}catch(a){e.innerHTML=`<div class="container"><p class="form__error">Error: ${a.message}</p></div>`}}async function oe(e){e.innerHTML='<div class="loading"><div class="loading__spinner"></div></div>';let a=1,t=1;async function n(){const{messages:o,pages:c}=await u.board.messages(a);return t=c,o}try{const o=await n();s(o)}catch(o){e.innerHTML=`<div class="container"><p class="form__error">Error: ${o.message}</p></div>`}function s(o){var l,d,g;const c=v.getUser();e.innerHTML=`
      <div class="container">
        <h1 class="page-title">Tablón</h1>
        ${c?`<form class="board-form" id="boardForm">
               <textarea class="form__textarea" id="boardMsg" placeholder="Escribe un mensaje…"
                 maxlength="500" rows="3" required></textarea>
               <button class="btn btn--primary" type="submit">Publicar</button>
             </form>`:'<p class="notice"><a href="#/login">Inicia sesión</a> para participar en el tablón.</p>'}
        <div class="board-messages" id="boardMessages">
          ${i(o,c)}
        </div>
        ${t>1?`<div class="pagination">
               <button class="btn btn--ghost btn--sm" id="prevPage" ${a<=1?"disabled":""}>← Anterior</button>
               <span>Página ${a} / ${t}</span>
               <button class="btn btn--ghost btn--sm" id="nextPage" ${a>=t?"disabled":""}>Siguiente →</button>
             </div>`:""}
      </div>
    `,(l=document.getElementById("boardForm"))==null||l.addEventListener("submit",async _=>{_.preventDefault();const b=document.getElementById("boardMsg"),w=b.value.trim();if(w)try{await u.board.post(w),b.value="";const L=await n();document.getElementById("boardMessages").innerHTML=i(L,c),r(c),p("Mensaje publicado")}catch(L){p(L.message,"error")}}),(d=document.getElementById("prevPage"))==null||d.addEventListener("click",async()=>{a--;const _=await n();document.getElementById("boardMessages").innerHTML=i(_,c),r(c)}),(g=document.getElementById("nextPage"))==null||g.addEventListener("click",async()=>{a++;const _=await n();document.getElementById("boardMessages").innerHTML=i(_,c),r(c)}),r(c)}function i(o,c){return o.length?o.map(l=>`
      <div class="board-message ${l.is_deleted?"board-message--deleted":""}" data-id="${l.id}">
        <div class="board-message__header">
          <strong>${l.username}</strong>
          <span class="board-message__date">${E(l.created_at)}</span>
          ${!l.is_deleted&&c&&(c.id===l.user_id||c.is_admin)?`<button class="btn btn--danger btn--xs delete-msg" data-id="${l.id}">✕</button>`:""}
        </div>
        <p class="board-message__text">${ce(l.message)}</p>
      </div>
    `).join(""):'<p class="empty">Sin mensajes aún. ¡Sé el primero!</p>'}function r(o){e.querySelectorAll(".delete-msg").forEach(c=>{c.addEventListener("click",async()=>{if(confirm("¿Eliminar este mensaje?"))try{await u.board.delete(c.dataset.id);const l=await n();document.getElementById("boardMessages").innerHTML=i(l,o),r(o),p("Mensaje eliminado")}catch(l){p(l.message,"error")}})})}}function ce(e){return e.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;")}async function de(e){var a,t,n,s;e.innerHTML='<div class="loading"><div class="loading__spinner"></div></div>';try{const[i,r]=await Promise.all([u.leagues.all(),v.isLoggedIn()?u.leagues.my():Promise.resolve({leagues:[]})]),o=v.getUser(),c=new Set(r.leagues.map(d=>d.id)),l=i.leagues.filter(d=>!c.has(d.id));e.innerHTML=`
      <div class="container">
        <h1 class="page-title">Ligas</h1>

        ${o&&r.leagues.length>0?`
          <section class="section">
            <h2>Mis ligas</h2>
            <div class="leagues-grid">${r.leagues.map(d=>x(d,!0)).join("")}</div>
          </section>
        `:""}

        ${o?`
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
                ${o.is_admin?`
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
          ${l.length?`<div class="leagues-grid">${l.map(d=>x(d,!1,c)).join("")}</div>`:r.leagues.length>0?'<p class="empty">Ya participas en todas las ligas disponibles.</p>':'<p class="empty">No hay ligas aún. ¡Crea la primera!</p>'}
        </section>
      </div>
    `,e.querySelectorAll('.league-card[data-navigate="true"]').forEach(d=>{d.addEventListener("click",()=>h.navigate(`/ligas/${d.dataset.id}`))}),e.querySelectorAll(".btn-join-league").forEach(d=>{d.addEventListener("click",async g=>{g.stopPropagation();const _=parseInt(d.dataset.id);d.disabled=!0,d.textContent="…";try{const{league:b}=await u.leagues.join({league_id:_});p(`¡Te has unido a "${b.name}"!`),h.navigate(`/ligas/${b.id}`)}catch(b){p(b.message,"error"),d.disabled=!1,d.textContent="Unirse"}})}),e.querySelectorAll(".btn-private-info").forEach(d=>{d.addEventListener("click",g=>{g.stopPropagation(),p("Esta liga es privada. Pide el enlace de invitación a cualquier miembro para unirte.","info")})}),(a=document.getElementById("btnShowCreate"))==null||a.addEventListener("click",()=>{var d,g;(d=document.getElementById("createLeaguePanel"))==null||d.classList.remove("hidden"),(g=document.getElementById("btnShowCreate"))==null||g.classList.add("hidden")}),(t=document.getElementById("btnCancelCreate"))==null||t.addEventListener("click",()=>{var d,g;(d=document.getElementById("createLeaguePanel"))==null||d.classList.add("hidden"),(g=document.getElementById("btnShowCreate"))==null||g.classList.remove("hidden")}),(n=document.getElementById("joinCodeForm"))==null||n.addEventListener("submit",async d=>{d.preventDefault();const g=document.getElementById("inviteCode").value.trim().toUpperCase();if(g)try{const{league:_}=await u.leagues.join({invite_code:g});p(`Te has unido a "${_.name}"`),h.navigate(`/ligas/${_.id}`)}catch(_){p(_.message,"error")}}),(s=document.getElementById("createLeagueForm"))==null||s.addEventListener("submit",async d=>{var P;d.preventDefault();const g=document.getElementById("createBtn");g.disabled=!0,g.textContent="Creando…";const _=document.getElementById("leagueName").value.trim(),b=document.getElementById("leagueDesc").value.trim(),w=document.getElementById("leaguePrize").value.trim(),L=document.getElementById("isPublic").checked,U=((P=document.getElementById("isOfficial"))==null?void 0:P.checked)??!1;try{const{league:S}=await u.leagues.create({name:_,description:b,prize:w,is_public:L,is_official:U});le(S)}catch(S){p(S.message,"error"),g.disabled=!1,g.textContent="Crear liga"}})}catch(i){e.innerHTML=`<div class="container"><p class="form__error">Error: ${i.message}</p></div>`}}function x(e,a=!1,t=new Set){const n=e.is_official?'<span class="league-badge league-badge--official">⭐ Oficial</span>':"",s=e.is_public?"🌍":"🔒",i=a?`<button class="btn btn--sm btn--outline" onclick="event.stopPropagation(); window.location.hash='/ligas/${e.id}'">Ver liga</button>`:e.is_public?`<button class="btn btn--sm btn--primary btn-join-league" data-id="${e.id}">Unirse</button>`:'<button class="btn btn--sm btn--ghost btn-private-info">🔒 Solicitar enlace</button>';return`
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
  `}function le(e){var n,s;const a=e.invite_link||"",t=document.getElementById("createLeaguePanel");t&&(t.innerHTML=`
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
  `,(n=document.getElementById("btnCopyLink"))==null||n.addEventListener("click",async()=>{try{await navigator.clipboard.writeText(a),p("Enlace copiado")}catch{p("No se pudo copiar","error")}}),(s=document.getElementById("btnShare"))==null||s.addEventListener("click",async()=>{try{await navigator.share({title:`Únete a ${e.name} en PickGoal`,url:a})}catch{}}))}async function ue(e,{params:a}){var n,s,i,r;const t=parseInt(a.id);e.innerHTML='<div class="loading"><div class="loading__spinner"></div></div>';try{const{league:o,ranking:c,is_member:l}=await u.leagues.get(t),d=v.getUser(),g=o.is_official?'<span class="league-badge league-badge--official">⭐ Oficial</span>':"";e.innerHTML=`
      <div class="container">
        <a href="#/ligas" class="back-link">← Volver a ligas</a>
        <div class="league-header">
          <h1 class="page-title">${o.name} ${g}</h1>
          ${o.description?`<p class="league-header__desc">${o.description}</p>`:""}
          <div class="league-header__meta">
            <span>${o.is_public?"🌍 Pública":"🔒 Privada"}</span>
            <span>${o.member_count} participantes</span>
            ${o.prize?`<span>🏆 ${o.prize}</span>`:""}
          </div>
        </div>

        ${l&&o.invite_link?`
          <div class="invite-share-box">
            <span class="invite-share-box__label">Enlace de invitación:</span>
            <div class="invite-link-box">
              <span class="invite-link-box__url">${o.invite_link}</span>
              <button class="btn btn--sm btn--outline" id="btnCopyInvite">Copiar</button>
              ${navigator.share?'<button class="btn btn--sm btn--ghost" id="btnShareInvite">Compartir</button>':""}
            </div>
          </div>
        `:""}

        ${l?'<button class="btn btn--danger btn--sm" id="btnLeave">Abandonar liga</button>':d?'<button class="btn btn--primary" id="btnJoin">Unirse a esta liga</button>':""}

        <section class="section">
          <h2>Clasificación</h2>
          <table class="ranking-table">
            <thead>
              <tr><th>#</th><th>Usuario</th><th>País</th><th>Puntos</th></tr>
            </thead>
            <tbody>
              ${c.map(_=>`
                <tr class="${d&&_.id===d.id?"ranking-table__row--me":""}">
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
    `,(n=document.getElementById("btnCopyInvite"))==null||n.addEventListener("click",async()=>{try{await navigator.clipboard.writeText(o.invite_link),p("Enlace copiado")}catch{p("No se pudo copiar","error")}}),(s=document.getElementById("btnShareInvite"))==null||s.addEventListener("click",async()=>{try{await navigator.share({title:`Únete a ${o.name} en PickGoal`,url:o.invite_link})}catch{}}),(i=document.getElementById("btnLeave"))==null||i.addEventListener("click",async()=>{if(confirm("¿Seguro que quieres abandonar esta liga?"))try{await u.leagues.leave(t),p("Has abandonado la liga"),h.navigate("/ligas")}catch(_){p(_.message,"error")}}),(r=document.getElementById("btnJoin"))==null||r.addEventListener("click",async()=>{try{await u.leagues.join({league_id:t}),p("¡Te has unido a la liga!"),h.navigate(`/ligas/${t}`)}catch(_){p(_.message,"error")}})}catch(o){e.innerHTML=`<div class="container"><p class="form__error">Error: ${o.message}</p><a href="#/ligas">Volver</a></div>`}}async function me(e){var t,n;e.innerHTML='<div class="loading"><div class="loading__spinner"></div></div>';const a=v.getUser();try{const s=(()=>{const l=localStorage.getItem("activeLeagueId");return l?parseInt(l):null})(),[i,r,o]=await Promise.all([u.predictions.mine(s),u.predictions.getChampion(s),u.leagues.my()]),c=i.predictions.reduce((l,d)=>l+d.total_points,0)+(((t=r.champion_prediction)==null?void 0:t.points_earned)||0);e.innerHTML=`
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
          <button class="btn btn--danger" id="btnLogoutPerfil">Cerrar sesión</button>
          <div class="profile-card__stats">
            <div class="stat">
              <span class="stat__value">${c}</span>
              <span class="stat__label">Puntos totales</span>
            </div>
            <div class="stat">
              <span class="stat__value">${i.predictions.length}</span>
              <span class="stat__label">Predicciones</span>
            </div>
            <div class="stat">
              <span class="stat__value">${o.leagues.length}</span>
              <span class="stat__label">Ligas</span>
            </div>
          </div>
        </section>

        ${r.champion_prediction?`<section class="section">
               <h2>Predicción Campeón</h2>
               <p class="champion-pick">
                 🏆 <strong>${r.champion_prediction.team_name}</strong>
                 — ${r.champion_prediction.points_earned} puntos
               </p>
             </section>`:`<section class="section">
               <h2>Predicción Campeón</h2>
               <p class="notice">Aún no has predicho el campeón. <a href="#/campeon">Hacerlo ahora</a></p>
             </section>`}

        <section class="section">
          <h2>Mis predicciones</h2>
          ${i.predictions.length?`<div class="predictions-list">${i.predictions.map(pe).join("")}</div>`:'<p class="empty">Sin predicciones aún. <a href="#/quiniela">Ir a la quiniela</a></p>'}
        </section>

        <section class="section">
          <h2>Mis ligas</h2>
          ${o.leagues.length?`<ul class="leagues-list">${o.leagues.map(l=>`<li><a href="#/ligas/${l.id}">${l.name}</a> <span class="tag">${l.is_public?"Pública":"Privada"}</span></li>`).join("")}</ul>`:'<p class="empty">No perteneces a ninguna liga. <a href="#/ligas">Ver ligas</a></p>'}
        </section>
      </div>
    `,(n=e.querySelector("#btnLogoutPerfil"))==null||n.addEventListener("click",()=>{v.logout(),window.location.hash="/"})}catch(s){e.innerHTML=`<div class="container"><p class="form__error">Error: ${s.message}</p></div>`}}function pe(e){return`
    <div class="pred-row ${e.total_points>0?"pred-row--scored":""}">
      <span class="pred-row__result">${e.predicted_result}</span>
      <span class="pred-row__score">${e.predicted_home}-${e.predicted_away}</span>
      <span class="pred-row__pts">${e.total_points} pts</span>
    </div>
  `}const M=new Date("2026-06-11T21:00:00Z"),ge=["Argentina","Brasil","Francia","España","Inglaterra","Alemania","Portugal","Países Bajos","Italia","Bélgica","Uruguay","Colombia","México","Estados Unidos","Canadá","Marruecos","Senegal","Nigeria","Japón","Corea del Sur","Australia","Arabia Saudí","Irán","Qatar","Ecuador","Chile","Perú","Venezuela","Bolivia","Paraguay","Costa Rica","Honduras","Panamá","Jamaica","Trinidad y Tobago","Guatemala","Turquía","Polonia","Croacia","Serbia","República Checa","Eslovaquia","Austria","Suiza","Dinamarca","Suecia","Noruega","Escocia","Ucrania","Rumanía","Hungría","Grecia","Egipto","Camerún","Ghana","Costa de Marfil","Túnez","Argelia","China","India","Irak","Uzbekistán","Nueva Zelanda","Fiji"];function _e(){const e=localStorage.getItem("activeLeagueId");return e?parseInt(e):null}async function N(e){var a;if(!v.isLoggedIn()){e.innerHTML='<div class="container"><p class="notice"><a href="#/login">Inicia sesión</a> para predecir el campeón.</p></div>';return}e.innerHTML='<div class="loading"><div class="loading__spinner"></div></div>';try{const t=_e(),{champion_prediction:n}=await u.predictions.getChampion(t),s=new Date>=M;let i;n&&s?i=`
        <div class="champion-result">
          <p>Tu predicción: <strong class="champion-result__team">${n.team_name}</strong></p>
          <p>Puntos ganados: <strong>${n.points_earned}</strong></p>
          <p class="notice">🔒 El torneo ha comenzado, tu predicción está bloqueada.</p>
        </div>
      `:!n&&s?i=`
        <p class="notice notice--warning">⚠️ El torneo ya ha comenzado. Una vez confirmado no podrás cambiarlo.</p>
        ${C(null)}
      `:n&&!s?i=`
        <p class="notice">Puedes cambiar tu predicción hasta el inicio del torneo.</p>
        ${C(n.team_name)}
      `:i=C(null),e.innerHTML=`
      <div class="container">
        <h1 class="page-title">🏆 Predice el Campeón</h1>
        <p class="champion-desc">
          Acertar el campeón del mundo vale <strong>10 puntos extra</strong>.
          Puedes modificar tu elección hasta el inicio del torneo
          (${M.toLocaleDateString("es-ES",{day:"numeric",month:"long",year:"numeric",hour:"2-digit",minute:"2-digit"})}).
        </p>
        ${i}
      </div>
    `,(a=document.getElementById("championForm"))==null||a.addEventListener("submit",async r=>{r.preventDefault();const o=document.getElementById("champBtn"),c=document.getElementById("champError"),l=document.getElementById("teamSearch").value.trim();if(l){o.disabled=!0,o.textContent="Guardando…",c.classList.add("hidden");try{await u.predictions.saveChampion(l,t),p(`¡${l} guardado como campeón!`),N(e)}catch(d){c.textContent=d.message,c.classList.remove("hidden"),o.disabled=!1,o.textContent=o.dataset.label||"Confirmar predicción"}}})}catch(t){e.innerHTML=`<div class="container"><p class="form__error">Error: ${t.message}</p></div>`}}function C(e){const a=e?"Actualizar predicción":"Confirmar predicción";return`
    <form class="form champion-form" id="championForm">
      <div class="form__group">
        <label class="form__label" for="teamSearch">Selecciona el equipo campeón</label>
        <input class="form__input" type="text" id="teamSearch"
          placeholder="Escribe para buscar…"
          list="teamsList" autocomplete="off"
          value="${e??""}" required />
        <datalist id="teamsList">
          ${ge.map(t=>`<option value="${t}">`).join("")}
        </datalist>
      </div>
      <p id="champError" class="form__error hidden"></p>
      <button class="btn btn--primary" type="submit" id="champBtn" data-label="${a}">
        ${a}
      </button>
    </form>
  `}async function ve(e){if(!v.isAdmin()){e.innerHTML='<div class="container"><p class="form__error">Acceso denegado.</p></div>';return}e.innerHTML='<div class="loading"><div class="loading__spinner"></div></div>';try{const{users:a}=await u.auth.users();e.innerHTML=`
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
              ${a.map(he).join("")}
            </tbody>
          </table>
        </section>
      </div>
    `,document.getElementById("btnSync").addEventListener("click",async()=>{const t=document.getElementById("syncResult");t.textContent="Sincronizando…";try{await u.matches.sync(),t.textContent="✓ Sincronización completada",p("Sincronización completada")}catch(n){t.textContent=`Error: ${n.message}`,p(n.message,"error")}}),document.getElementById("awardForm").addEventListener("submit",async t=>{t.preventDefault();const n=document.getElementById("winnerTeam").value.trim();if(n)try{const{message:s}=await u.predictions.awardChampion(n);p(s)}catch(s){p(s.message,"error")}}),document.getElementById("usersTableBody").addEventListener("click",async t=>{const n=t.target.closest(".toggle-admin");if(!n)return;const s=parseInt(n.dataset.id);try{const{user:i}=await u.auth.toggleAdmin(s);n.closest("tr").querySelector(".admin-badge").textContent=i.is_admin?"Sí":"No",p(`${i.username} ${i.is_admin?"ahora es admin":"ya no es admin"}`)}catch(i){p(i.message,"error")}})}catch(a){e.innerHTML=`<div class="container"><p class="form__error">Error: ${a.message}</p></div>`}}function he(e){return`
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
  `}function be(e){e.innerHTML=`
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
  `,document.getElementById("forgotForm").addEventListener("submit",async a=>{a.preventDefault();const t=document.getElementById("forgotBtn"),n=document.getElementById("forgotMsg"),s=document.getElementById("email").value.trim();t.disabled=!0,t.textContent="Enviando…";try{await u.auth.forgotPassword(s),n.textContent="Si el email existe, recibirás un enlace en breve.",n.classList.remove("hidden","form__error"),n.classList.add("form__success")}catch{p("Error al enviar el email","error")}finally{t.disabled=!1,t.textContent="Enviar enlace"}})}function fe(e,{query:a}){const t=a.token||"";if(!t){e.innerHTML='<div class="container"><p class="form__error">Token inválido o expirado.</p><a href="#/login">Volver</a></div>';return}e.innerHTML=`
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
  `,document.getElementById("resetForm").addEventListener("submit",async n=>{n.preventDefault();const s=document.getElementById("resetBtn"),i=document.getElementById("resetError"),r=document.getElementById("password").value;s.disabled=!0,s.textContent="Guardando…",i.classList.add("hidden");try{await u.auth.resetPassword(t,r),p("Contraseña actualizada. Ya puedes iniciar sesión."),h.navigate("/login")}catch(o){i.textContent=o.message||"Error al restablecer la contraseña",i.classList.remove("hidden")}finally{s.disabled=!1,s.textContent="Guardar contraseña"}})}const ye={r32:"Dieciseisavos",r16:"Octavos",quarters:"Cuartos",semis:"Semis",third:"3º y 4º",final:"Final"};async function $e(e){e.innerHTML='<div class="loading"><div class="loading__spinner"></div></div>';try{const{groups:a}=await u.matches.grouped();e.innerHTML=`
      <div class="container">
        <h1 class="page-title">Resultados — Mundial 2026</h1>
        <nav class="phase-nav" id="phaseNav"></nav>
        <div id="phaseContent"></div>
      </div>
    `,Ee(a)}catch(a){e.innerHTML=`<div class="container"><p class="form__error">Error cargando los partidos: ${a.message}</p></div>`}}function Ee(e){var i;const a=document.getElementById("phaseNav");if(!a)return;const t=e.filter(r=>r.phase==="group"),n=e.filter(r=>r.phase!=="group"),s=[...t.map(r=>({key:`group_${r.group_name}`,label:`Grupo ${r.group_name}`,data:r,isGroup:!0})),...n.map(r=>({key:r.phase,label:ye[r.phase]||r.label,data:r,isGroup:!1}))];s.length!==0&&(a.innerHTML=s.map((r,o)=>`
    <button class="phase-nav__btn ${o===0?"phase-nav__btn--active":""}" data-key="${r.key}">
      ${r.label}
    </button>
  `).join(""),(i=a.querySelector(".phase-nav__btn--active"))==null||i.scrollIntoView({inline:"center",behavior:"instant",block:"nearest"}),a.querySelectorAll(".phase-nav__btn").forEach((r,o)=>{r.addEventListener("click",()=>{a.querySelectorAll(".phase-nav__btn").forEach(l=>l.classList.remove("phase-nav__btn--active")),r.classList.add("phase-nav__btn--active");const c=s.find(l=>l.key===r.dataset.key);c&&j(c.data,c.isGroup)})}),j(s[0].data,s[0].isGroup))}function j(e,a){const t=document.getElementById("phaseContent");if(!t)return;const n=Le(e.matches);if(a){const s=Ie(e.matches);t.innerHTML=`
      <div class="resultados-section">
        <div class="resultados-matches">${n}</div>
        <div class="standings">
          <h3 class="standings__title">Clasificación — Grupo ${e.group_name}</h3>
          ${we(s)}
        </div>
      </div>
    `}else t.innerHTML=`<div class="resultados-matches">${n}</div>`}function Le(e){return!e||e.length===0?'<p class="empty">Sin partidos en esta fase.</p>':e.map(a=>{const t={scheduled:"Programado",live:"🔴 En juego",finished:"Finalizado"}[a.status]||a.status,n=a.status!=="scheduled"?`<span class="res-score">${a.home_score_90??"?"} - ${a.away_score_90??"?"}</span>`:'<span class="res-score res-score--pending">vs</span>';return`
      <div class="res-match ${a.status==="finished"?"res-match--finished":""} ${a.status==="live"?"res-match--live":""}">
        <div class="res-match__meta">
          <span class="res-match__status">${t}</span>
          <span class="res-match__date">${E(a.match_datetime)}</span>
        </div>
        <div class="res-match__teams">
          <span class="res-match__team res-match__team--home">${a.home_team}</span>
          ${n}
          <span class="res-match__team res-match__team--away">${a.away_team}</span>
        </div>
      </div>
    `}).join("")}function Ie(e){const a={};for(const t of e)if(a[t.home_team]||(a[t.home_team]={name:t.home_team,pj:0,g:0,e:0,p:0,gf:0,gc:0,pts:0}),a[t.away_team]||(a[t.away_team]={name:t.away_team,pj:0,g:0,e:0,p:0,gf:0,gc:0,pts:0}),t.status==="finished"&&t.home_score_90!==null&&t.away_score_90!==null){const n=a[t.home_team],s=a[t.away_team];n.pj++,s.pj++,n.gf+=t.home_score_90,n.gc+=t.away_score_90,s.gf+=t.away_score_90,s.gc+=t.home_score_90,t.home_score_90>t.away_score_90?(n.g++,n.pts+=3,s.p++):t.home_score_90<t.away_score_90?(s.g++,s.pts+=3,n.p++):(n.e++,n.pts++,s.e++,s.pts++)}return Object.values(a).sort((t,n)=>{if(n.pts!==t.pts)return n.pts-t.pts;const s=n.gf-n.gc,i=t.gf-t.gc;return s!==i?s-i:n.gf-t.gf})}function we(e){return e.length===0?'<p class="empty">Sin datos de clasificación.</p>':`
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
  `}async function Se(e,{query:a}){const t=(a.codigo||"").trim().toUpperCase();if(!t){e.innerHTML='<div class="container"><p class="form__error">Enlace de invitación inválido.</p><a href="#/ligas">Ver ligas</a></div>';return}if(!v.isLoggedIn()){sessionStorage.setItem("pendingInviteCode",t),h.navigate("/register");return}e.innerHTML='<div class="loading"><div class="loading__spinner"></div></div>';try{const{league:n}=await u.leagues.joinByCode(t);p(`¡Te has unido a "${n.name}"!`),h.navigate(`/ligas/${n.id}`)}catch(n){if(n.status===409){p("Ya eres miembro de esta liga");try{const{leagues:s}=await u.leagues.my(),i=s.find(r=>r.invite_code===t);if(i){h.navigate(`/ligas/${i.id}`);return}}catch{}}e.innerHTML=`
      <div class="container">
        <div class="league-gate">
          <div class="league-gate__icon">⚠️</div>
          <h2 class="league-gate__title">Error al unirse</h2>
          <p class="league-gate__text">${n.message}</p>
          <a href="#/ligas" class="btn btn--primary">Ver ligas</a>
        </div>
      </div>
    `}}function Be(){const e=localStorage.getItem("activeLeagueId");return e?parseInt(e):null}async function Ce(e,{params:a}){const t=parseInt(a.id);if(!t){e.innerHTML='<div class="container"><p class="form__error">Usuario no válido.</p></div>';return}e.innerHTML='<div class="loading"><div class="loading__spinner"></div></div>';try{const n=Be(),{user:s,predictions:i}=await u.predictions.forUser(t,n);e.innerHTML=`
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
              ${i.map(r=>Pe(r)).join("")}
            </div>`}
      </div>
    `}catch(n){e.innerHTML=`<div class="container"><p class="form__error">Error: ${n.message}</p></div>`}}function Pe(e){const a=e.match,t=e.total_points,n=e.pts_score>0,s=e.pts_result>0;let i="";return n?i='<span class="jugador__badge jugador__badge--exact">Exacto</span>':s?i='<span class="jugador__badge jugador__badge--ok">1X2 ✓</span>':i='<span class="jugador__badge jugador__badge--miss">Fallo</span>',`
    <div class="jugador__pred-row">
      <div class="jugador__pred-match">
        <span class="jugador__pred-teams">${a.home_team} vs ${a.away_team}</span>
        <span class="jugador__pred-date">${E(a.match_datetime)}</span>
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
  `}const Te={"/":F,"/login":Q,"/register":K,"/quiniela":Z,"/resultados":$e,"/ranking":re,"/tablon":oe,"/ligas":de,"/ligas/:id":ue,"/perfil":me,"/campeon":N,"/admin":ve,"/forgot-password":be,"/reset-password":fe,"/unirse":Se,"/jugador/:id":Ce};function ke(e){for(const[a,t]of Object.entries(Te)){const n=[],s=new RegExp("^"+a.replace(/:([^/]+)/g,(r,o)=>(n.push(o),"([^/]+)"))+"$"),i=e.match(s);if(i){const r={};return n.forEach((o,c)=>{r[o]=i[c+1]}),{handler:t,params:r}}}return null}const H=()=>document.getElementById("mainContent"),h={init(){window.addEventListener("hashchange",()=>this.resolve()),this.resolve()},navigate(e){window.location.hash=e},resolve(){const e=window.location.hash.slice(1)||"/",[a,t]=e.split("?"),n=Object.fromEntries(new URLSearchParams(t||"")),s=ke(a);if(!s){H().innerHTML='<div class="error-page"><h2>Página no encontrada</h2><a href="#/">Volver al inicio</a></div>';return}const{handler:i,params:r}=s;if(["/perfil","/campeon","/admin"].includes(a)&&!v.isLoggedIn()){this.navigate("/login");return}if(a==="/admin"&&!v.isAdmin()){this.navigate("/");return}const c=H();c.innerHTML='<div class="loading"><div class="loading__spinner"></div></div>',i(c,{params:r,query:n})}};let $=[],I=null;async function xe(){await v.init(),h.init(),He(),Me()}function Me(){window.addEventListener("beforeinstallprompt",e=>{e.preventDefault(),I=e,je()})}function je(){if(sessionStorage.getItem("installBannerDismissed"))return;const e=document.createElement("div");e.id="installBanner",e.className="install-banner",e.innerHTML=`
    <span class="install-banner__text">⚽ Instala PickGoal en tu dispositivo</span>
    <div class="install-banner__actions">
      <button class="install-banner__btn install-banner__btn--primary" id="installBtn">Instalar</button>
      <button class="install-banner__btn install-banner__btn--ghost" id="installDismissBtn">Ahora no</button>
    </div>
  `,document.body.appendChild(e),document.getElementById("installBtn").addEventListener("click",async()=>{I&&(I.prompt(),await I.userChoice,I=null,e.remove())}),document.getElementById("installDismissBtn").addEventListener("click",()=>{sessionStorage.setItem("installBannerDismissed","1"),e.remove()})}function f(){var e,a,t,n;(e=document.getElementById("leagueDropdown"))==null||e.classList.add("hidden"),(a=document.getElementById("leagueBtn"))==null||a.classList.remove("navbar__dropdown-btn--open"),(t=document.getElementById("userDropdown"))==null||t.classList.add("hidden"),(n=document.getElementById("userBtn"))==null||n.classList.remove("navbar__dropdown-btn--open")}function He(){var e,a,t,n,s;document.addEventListener("auth:change",A),window.addEventListener("hashchange",()=>{f(),O()}),document.addEventListener("click",f),(e=document.getElementById("leagueBtn"))==null||e.addEventListener("click",i=>{var c;i.stopPropagation();const r=document.getElementById("leagueDropdown"),o=r==null?void 0:r.classList.contains("hidden");f(),o&&(r==null||r.classList.remove("hidden"),(c=document.getElementById("leagueBtn"))==null||c.classList.add("navbar__dropdown-btn--open"))}),(a=document.getElementById("leagueDropdown"))==null||a.addEventListener("click",i=>{i.stopPropagation();const r=i.target.closest("[data-league-id]");if(r){localStorage.setItem("activeLeagueId",r.dataset.leagueId),f(),D($),h.resolve();return}i.target.closest("a")&&f()}),(t=document.getElementById("userBtn"))==null||t.addEventListener("click",i=>{var c;i.stopPropagation();const r=document.getElementById("userDropdown"),o=r==null?void 0:r.classList.contains("hidden");f(),o&&(r==null||r.classList.remove("hidden"),(c=document.getElementById("userBtn"))==null||c.classList.add("navbar__dropdown-btn--open"))}),(n=document.getElementById("userDropdown"))==null||n.addEventListener("click",i=>{i.stopPropagation(),i.target.closest("#navProfileLink")&&f()}),(s=document.getElementById("navLogoutBtn"))==null||s.addEventListener("click",()=>{$=[],localStorage.removeItem("activeLeagueId"),f(),v.logout(),h.navigate("/")}),A()}async function A(){const e=document.getElementById("navAuthLinks"),a=document.getElementById("userBtn"),t=document.getElementById("navUsername"),n=document.getElementById("navLeague"),s=document.getElementById("bottomNav"),i=v.getUser();if(f(),i){e==null||e.classList.add("hidden"),t&&(t.textContent=i.username),n.style.visibility="visible",a.style.visibility="visible",s==null||s.classList.remove("hidden"),document.body.classList.add("has-bottom-nav");try{const{leagues:r}=await u.leagues.my();$=r}catch{$=[]}D($)}else e==null||e.classList.remove("hidden"),n.style.visibility="hidden",a.style.visibility="hidden",s==null||s.classList.add("hidden"),document.body.classList.remove("has-bottom-nav"),$=[],localStorage.removeItem("activeLeagueId");O()}function D(e){const a=document.getElementById("leagueDropdown"),t=document.getElementById("navLeagueName");if(!a||!t)return;let n=localStorage.getItem("activeLeagueId"),s=e.find(r=>String(r.id)===String(n));!s&&e.length>0&&(s=e[0],localStorage.setItem("activeLeagueId",String(s.id))),s||localStorage.removeItem("activeLeagueId"),t.textContent=s?s.name:"Inicia Liga";const i=e.map(r=>`
    <button class="navbar__dropdown-item ${String(r.id)===String(s==null?void 0:s.id)?"navbar__dropdown-item--active":""}" data-league-id="${r.id}">${r.name}</button>
  `).join("");a.innerHTML=`
    ${i}
    <a href="#/ligas" class="navbar__dropdown-item navbar__dropdown-item--muted">
      <svg viewBox="0 0 24 24" fill="currentColor" width="13" height="13" aria-hidden="true"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/></svg>
      Ver ligas disponibles
    </a>
  `}function O(){const e=window.location.hash.slice(1).split("?")[0]||"/";document.querySelectorAll(".bottom-nav__item").forEach(a=>{const t=a.dataset.route,n=t==="/"?e==="/":e===t||e.startsWith(t+"/");a.classList.toggle("bottom-nav__item--active",n)})}xe();
