(function(){const t=document.createElement("link").relList;if(t&&t.supports&&t.supports("modulepreload"))return;for(const n of document.querySelectorAll('link[rel="modulepreload"]'))s(n);new MutationObserver(n=>{for(const i of n)if(i.type==="childList")for(const r of i.addedNodes)r.tagName==="LINK"&&r.rel==="modulepreload"&&s(r)}).observe(document,{childList:!0,subtree:!0});function a(n){const i={};return n.integrity&&(i.integrity=n.integrity),n.referrerPolicy&&(i.referrerPolicy=n.referrerPolicy),n.crossOrigin==="use-credentials"?i.credentials="include":n.crossOrigin==="anonymous"?i.credentials="omit":i.credentials="same-origin",i}function s(n){if(n.ep)return;n.ep=!0;const i=a(n);fetch(n.href,i)}})();const j="https://pickgoal-backend.onrender.com/api";function A(){return localStorage.getItem("token")}async function m(e,t={}){const a={"Content-Type":"application/json",...t.headers},s=A();s&&(a.Authorization=`Bearer ${s}`);const n=await fetch(`${j}${e}`,{...t,headers:a}),i=await n.json().catch(()=>({}));if(!n.ok)throw{status:n.status,message:i.error||"Error desconocido"};return i}const l={get:e=>m(e),post:(e,t)=>m(e,{method:"POST",body:JSON.stringify(t)}),patch:(e,t)=>m(e,{method:"PATCH",body:JSON.stringify(t)}),delete:e=>m(e,{method:"DELETE"}),auth:{register:e=>m("/auth/register",{method:"POST",body:JSON.stringify(e)}),login:e=>m("/auth/login",{method:"POST",body:JSON.stringify(e)}),me:()=>m("/auth/me"),forgotPassword:e=>m("/auth/forgot-password",{method:"POST",body:JSON.stringify({email:e})}),resetPassword:(e,t)=>m("/auth/reset-password",{method:"POST",body:JSON.stringify({token:e,password:t})}),ranking:()=>m("/auth/ranking"),users:()=>m("/auth/users"),toggleAdmin:e=>m(`/auth/users/${e}/toggle-admin`,{method:"PATCH"})},matches:{grouped:()=>m("/matches/grouped"),list:(e="")=>m(`/matches/${e}`),get:e=>m(`/matches/${e}`),sync:()=>m("/matches/sync",{method:"POST"})},predictions:{mine:()=>m("/predictions/"),forMatch:e=>m(`/predictions/match/${e}`),save:e=>m("/predictions/",{method:"POST",body:JSON.stringify(e)}),getChampion:()=>m("/predictions/champion"),saveChampion:e=>m("/predictions/champion",{method:"POST",body:JSON.stringify({team_name:e})}),awardChampion:e=>m("/predictions/champion/award",{method:"POST",body:JSON.stringify({team_name:e})})},leagues:{public:()=>m("/leagues/public"),my:()=>m("/leagues/my"),create:e=>m("/leagues/",{method:"POST",body:JSON.stringify(e)}),join:e=>m("/leagues/join",{method:"POST",body:JSON.stringify(e)}),get:e=>m(`/leagues/${e}`),leave:e=>m(`/leagues/${e}/leave`,{method:"DELETE"}),matchPredictions:(e,t)=>m(`/leagues/${e}/predictions/${t}`)},board:{messages:(e=1)=>m(`/board/?page=${e}`),post:e=>m("/board/",{method:"POST",body:JSON.stringify({message:e})}),delete:e=>m(`/board/${e}`,{method:"DELETE"})}};let b=null;const p={async init(){if(localStorage.getItem("token"))try{const{user:t}=await l.auth.me();b=t}catch{localStorage.removeItem("token")}},setUser(e,t){b=e,localStorage.setItem("token",t),document.dispatchEvent(new CustomEvent("auth:change",{detail:e}))},logout(){b=null,localStorage.removeItem("token"),document.dispatchEvent(new CustomEvent("auth:change",{detail:null}))},getUser(){return b},isLoggedIn(){return!!b},isAdmin(){return(b==null?void 0:b.is_admin)===!0}};function D(e){const t=p.getUser();e.innerHTML=`
    <section class="hero">
      <div class="hero__content">
        <img src="/assets/logo-completo.jpg" alt="PickGoal" class="hero__logo-img" />
        ${t?`<div class="hero__cta">
               <a href="#/quiniela" class="btn btn--primary btn--lg">Ver Quiniela</a>
               <a href="#/campeon" class="btn btn--secondary btn--lg">Predecir Campeón</a>
             </div>`:`<div class="hero__cta">
               <a href="#/register" class="btn btn--primary btn--lg">Registrarse</a>
               <a href="#/login" class="btn btn--ghost btn--lg">Ya tengo cuenta</a>
             </div>`}
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
  `}let $=null;function u(e,t="success"){let a=document.getElementById("toast");a||(a=document.createElement("div"),a.id="toast",document.body.appendChild(a)),a.textContent=e,a.className=`toast toast--${t} toast--visible`,$&&clearTimeout($),$=setTimeout(()=>{a.classList.remove("toast--visible")},3e3)}function H(){return`
    <div class="container">
      <div class="league-gate">
        <div class="league-gate__icon">⚽</div>
        <h2 class="league-gate__title">¡Inicia tu Liga!</h2>
        <p class="league-gate__text">Únete a una liga para empezar a predecir</p>
        <a href="#/ligas" class="btn btn--primary">Ver ligas disponibles</a>
      </div>
    </div>
  `}function w(e){return e?new Date(e).toLocaleString("es-ES",{day:"2-digit",month:"2-digit",year:"numeric",hour:"2-digit",minute:"2-digit"}):"—"}function O(e){e.innerHTML=`
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
  `,document.getElementById("loginForm").addEventListener("submit",async t=>{t.preventDefault();const a=document.getElementById("loginBtn"),s=document.getElementById("loginError"),n=document.getElementById("identifier").value.trim(),i=document.getElementById("password").value;a.disabled=!0,a.textContent="Entrando…",s.classList.add("hidden");try{const{token:r,user:o}=await l.auth.login({identifier:n,password:i});p.setUser(o,r),u(`¡Bienvenido, ${o.username}!`),_.navigate("/quiniela")}catch(r){s.textContent=r.message||"Error al iniciar sesión",s.classList.remove("hidden")}finally{a.disabled=!1,a.textContent="Entrar"}})}function R(e){e.innerHTML=`
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
  `,document.getElementById("registerForm").addEventListener("submit",async t=>{t.preventDefault();const a=document.getElementById("registerBtn"),s=document.getElementById("registerError");a.disabled=!0,a.textContent="Creando cuenta…",s.classList.add("hidden");const n={username:document.getElementById("username").value.trim(),email:document.getElementById("email").value.trim(),country:document.getElementById("country").value.trim(),password:document.getElementById("password").value};try{const{token:i,user:r}=await l.auth.register(n);p.setUser(r,i),u("¡Cuenta creada! Bienvenido a PickGoal"),_.navigate("/campeon")}catch(i){s.textContent=i.message||"Error al registrarse",s.classList.remove("hidden")}finally{a.disabled=!1,a.textContent="Crear cuenta"}})}async function F(e){e.innerHTML='<div class="loading"><div class="loading__spinner"></div></div>';try{if(p.isLoggedIn()){const{leagues:d}=await l.leagues.my();if(d.length===0){e.innerHTML=H();return}}const[{groups:t},a]=await Promise.all([l.matches.grouped(),p.isLoggedIn()?l.predictions.mine():Promise.resolve({predictions:[]})]),s={};for(const d of a.predictions)s[d.match_id]=d;const n=t.flatMap(d=>d.matches),i=new Map;for(const d of n){const g=B(d.match_datetime);i.has(g)||i.set(g,[]),i.get(g).push(d)}const r=[...i.keys()].sort(),o=B(new Date().toISOString()),c=r.find(d=>d>=o)??r[0];e.innerHTML=`
      <div class="container">
        <h1 class="page-title">Pronósticos — Mundial 2026</h1>
        ${p.isLoggedIn()?"":'<p class="notice">⚠️ <a href="#/login">Inicia sesión</a> para guardar tus predicciones.</p>'}
        <nav class="date-nav" id="dateNav"></nav>
        <div id="matchesContent"></div>
      </div>
    `,U(r,c,i,s),p.isLoggedIn()&&V(n,s)}catch(t){e.innerHTML=`<div class="container"><p class="form__error">Error cargando los partidos: ${t.message}</p></div>`}}function U(e,t,a,s){var i;const n=document.getElementById("dateNav");n&&(n.innerHTML=e.map(r=>`
    <button class="date-nav__btn ${r===t?"date-nav__btn--active":""}" data-day="${r}">
      ${G(r)}
    </button>
  `).join(""),(i=n.querySelector(".date-nav__btn--active"))==null||i.scrollIntoView({inline:"center",behavior:"instant",block:"nearest"}),n.querySelectorAll(".date-nav__btn").forEach(r=>{r.addEventListener("click",()=>{n.querySelectorAll(".date-nav__btn").forEach(o=>o.classList.remove("date-nav__btn--active")),r.classList.add("date-nav__btn--active"),S(a.get(r.dataset.day)??[],s)})}),S(a.get(t)??[],s))}function S(e,t){const a=document.getElementById("matchesContent");if(a){if(e.length===0){a.innerHTML='<p class="empty">Sin partidos este día.</p>';return}a.innerHTML=`<div class="matches-grid">${e.map(s=>z(s,t[s.id])).join("")}</div>`,p.isLoggedIn()&&a.querySelectorAll(".prediction-form").forEach(s=>{Q(s,t)})}}function B(e){const t=new Date(e);return`${t.getFullYear()}-${String(t.getMonth()+1).padStart(2,"0")}-${String(t.getDate()).padStart(2,"0")}`}function G(e){const[t,a,s]=e.split("-").map(Number);return new Date(t,a-1,s).toLocaleDateString("es-ES",{day:"numeric",month:"short"})}function z(e,t){const a=e.is_locked,s=t?`<span class="pts-badge">${t.total_points} pts</span>`:"",n={scheduled:"Programado",live:"🔴 En juego",finished:"Finalizado"}[e.status];return`
    <div class="match-card ${a?"match-card--locked":""}" data-match-id="${e.id}">
      <div class="match-card__header">
        <span class="match-card__status">${n}</span>
        <span class="match-card__date">${w(e.match_datetime)}</span>
        ${s}
      </div>
      <div class="match-card__teams">
        <span class="team team--home">${e.home_team}</span>
        <div class="match-card__score">
          ${e.status!=="scheduled"?`<span class="score">${e.home_score_90??"?"} - ${e.away_score_90??"?"}</span>`:'<span class="score score--dash">vs</span>'}
        </div>
        <span class="team team--away">${e.away_team}</span>
      </div>
      ${!a&&p.isLoggedIn()?J(e,t):a&&t?`<div class="prediction-result">
               Tu predicción: <strong>${t.predicted_home}-${t.predicted_away}</strong>
               (${t.predicted_result}) · ${t.total_points} pts
             </div>`:""}
    </div>
  `}function J(e,t){const a=(t==null?void 0:t.predicted_home)??0,s=(t==null?void 0:t.predicted_away)??0,n=(t==null?void 0:t.predicted_result)??"X";return`
    <form class="prediction-form" data-match-id="${e.id}">
      <div class="result-selector">
        ${["1","X","2"].map(i=>`
          <label class="result-selector__option">
            <input type="radio" name="predicted_result" value="${i}" ${n===i?"checked":""} required />
            ${i}
          </label>
        `).join("")}
      </div>
      <div class="prediction-form__inputs">
        <input type="number" name="predicted_home" class="score-input" min="0" max="30"
          value="${a}" placeholder="0" required />
        <span>-</span>
        <input type="number" name="predicted_away" class="score-input" min="0" max="30"
          value="${s}" placeholder="0" required />
      </div>
      <button type="submit" class="btn btn--primary btn--sm">Guardar</button>
    </form>
  `}async function V(e,t){const a=e.filter(s=>!s.is_locked&&!t[s.id]);for(const s of a)try{const{prediction:n}=await l.predictions.save({match_id:s.id,predicted_result:"X",predicted_home:0,predicted_away:0});t[s.id]=n}catch{}}function Q(e,t){e.addEventListener("submit",async a=>{var c;a.preventDefault();const s=parseInt(e.dataset.matchId),n=parseInt(e.querySelector("[name=predicted_home]").value),i=parseInt(e.querySelector("[name=predicted_away]").value),r=(c=e.querySelector("[name=predicted_result]:checked"))==null?void 0:c.value;if(isNaN(n)||isNaN(i)||!r)return;const o=e.querySelector("button");o.disabled=!0,o.textContent="…";try{const{prediction:d}=await l.predictions.save({match_id:s,predicted_result:r,predicted_home:n,predicted_away:i});t[s]=d,u("Predicción guardada"),o.textContent="✓ Guardado",setTimeout(()=>{o.disabled=!1,o.textContent="Guardar"},2e3)}catch(d){u(d.message||"Error al guardar","error"),o.disabled=!1,o.textContent="Guardar"}})}async function X(e){e.innerHTML='<div class="loading"><div class="loading__spinner"></div></div>';try{if(p.isLoggedIn()){const{leagues:s}=await l.leagues.my();if(s.length===0){e.innerHTML=H();return}}const{ranking:t}=await l.auth.ranking(),a=p.getUser();e.innerHTML=`
      <div class="container">
        <h1 class="page-title">Clasificación General</h1>
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
              ${t.map(s=>`
                <tr class="${a&&s.id===a.id?"ranking-table__row--me":""}">
                  <td class="ranking-table__pos">${s.position}</td>
                  <td>${s.username}</td>
                  <td>${s.country||"—"}</td>
                  <td class="ranking-table__pts">${s.total_points}</td>
                  <td class="ranking-table__stat">${s.correct_results}</td>
                  <td class="ranking-table__stat">${s.exact_scores}</td>
                </tr>
              `).join("")}
            </tbody>
          </table>
        </div>
      </div>
    `}catch(t){e.innerHTML=`<div class="container"><p class="form__error">Error: ${t.message}</p></div>`}}async function Y(e){e.innerHTML='<div class="loading"><div class="loading__spinner"></div></div>';let t=1,a=1;async function s(){const{messages:o,pages:c}=await l.board.messages(t);return a=c,o}try{const o=await s();n(o)}catch(o){e.innerHTML=`<div class="container"><p class="form__error">Error: ${o.message}</p></div>`}function n(o){var d,g,h;const c=p.getUser();e.innerHTML=`
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
        ${a>1?`<div class="pagination">
               <button class="btn btn--ghost btn--sm" id="prevPage" ${t<=1?"disabled":""}>← Anterior</button>
               <span>Página ${t} / ${a}</span>
               <button class="btn btn--ghost btn--sm" id="nextPage" ${t>=a?"disabled":""}>Siguiente →</button>
             </div>`:""}
      </div>
    `,(d=document.getElementById("boardForm"))==null||d.addEventListener("submit",async v=>{v.preventDefault();const y=document.getElementById("boardMsg"),I=y.value.trim();if(I)try{await l.board.post(I),y.value="";const L=await s();document.getElementById("boardMessages").innerHTML=i(L,c),r(c),u("Mensaje publicado")}catch(L){u(L.message,"error")}}),(g=document.getElementById("prevPage"))==null||g.addEventListener("click",async()=>{t--;const v=await s();document.getElementById("boardMessages").innerHTML=i(v,c),r(c)}),(h=document.getElementById("nextPage"))==null||h.addEventListener("click",async()=>{t++;const v=await s();document.getElementById("boardMessages").innerHTML=i(v,c),r(c)}),r(c)}function i(o,c){return o.length?o.map(d=>`
      <div class="board-message ${d.is_deleted?"board-message--deleted":""}" data-id="${d.id}">
        <div class="board-message__header">
          <strong>${d.username}</strong>
          <span class="board-message__date">${w(d.created_at)}</span>
          ${!d.is_deleted&&c&&(c.id===d.user_id||c.is_admin)?`<button class="btn btn--danger btn--xs delete-msg" data-id="${d.id}">✕</button>`:""}
        </div>
        <p class="board-message__text">${K(d.message)}</p>
      </div>
    `).join(""):'<p class="empty">Sin mensajes aún. ¡Sé el primero!</p>'}function r(o){e.querySelectorAll(".delete-msg").forEach(c=>{c.addEventListener("click",async()=>{if(confirm("¿Eliminar este mensaje?"))try{await l.board.delete(c.dataset.id);const d=await s();document.getElementById("boardMessages").innerHTML=i(d,o),r(o),u("Mensaje eliminado")}catch(d){u(d.message,"error")}})})}}function K(e){return e.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;")}async function W(e){var t,a,s,n;e.innerHTML='<div class="loading"><div class="loading__spinner"></div></div>';try{const[i,r]=await Promise.all([l.leagues.public(),p.isLoggedIn()?l.leagues.my():Promise.resolve({leagues:[]})]),o=p.getUser(),c=new Set(r.leagues.map(g=>g.id)),d=i.leagues.filter(g=>!c.has(g.id));e.innerHTML=`
      <div class="container">
        <h1 class="page-title">Ligas</h1>

        ${o&&r.leagues.length>0?`
          <section class="section">
            <h2>Mis ligas</h2>
            <div class="leagues-grid">${r.leagues.map(P).join("")}</div>
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
                <div class="form__group form__group--checkbox">
                  <input type="checkbox" id="isPublic" />
                  <label for="isPublic">Liga pública (visible para todos)</label>
                </div>
                <div class="form__actions">
                  <button class="btn btn--primary" type="submit">Crear liga</button>
                  <button class="btn btn--ghost" type="button" id="btnCancelCreate">Cancelar</button>
                </div>
              </form>
            </div>
          </section>
        `:'<p class="notice"><a href="#/login">Inicia sesión</a> para crear o unirte a ligas.</p>'}

        <section class="section">
          <h2>Ligas disponibles</h2>
          ${d.length?`<div class="leagues-grid">${d.map(P).join("")}</div>`:r.leagues.length>0?'<p class="empty">Estás en todas las ligas públicas disponibles.</p>':'<p class="empty">No hay ligas públicas aún. ¡Crea la primera!</p>'}
        </section>
      </div>
    `,e.querySelectorAll(".league-card").forEach(g=>{g.addEventListener("click",()=>_.navigate(`/ligas/${g.dataset.id}`))}),(t=document.getElementById("btnShowCreate"))==null||t.addEventListener("click",()=>{var g,h;(g=document.getElementById("createLeaguePanel"))==null||g.classList.remove("hidden"),(h=document.getElementById("btnShowCreate"))==null||h.classList.add("hidden")}),(a=document.getElementById("btnCancelCreate"))==null||a.addEventListener("click",()=>{var g,h;(g=document.getElementById("createLeaguePanel"))==null||g.classList.add("hidden"),(h=document.getElementById("btnShowCreate"))==null||h.classList.remove("hidden")}),(s=document.getElementById("joinCodeForm"))==null||s.addEventListener("submit",async g=>{g.preventDefault();const h=document.getElementById("inviteCode").value.trim().toUpperCase();if(h)try{const{league:v}=await l.leagues.join({invite_code:h});u(`Te has unido a "${v.name}"`),_.navigate(`/ligas/${v.id}`)}catch(v){u(v.message,"error")}}),(n=document.getElementById("createLeagueForm"))==null||n.addEventListener("submit",async g=>{g.preventDefault();const h=document.getElementById("leagueName").value.trim(),v=document.getElementById("isPublic").checked;try{const{league:y}=await l.leagues.create({name:h,is_public:v});u(`Liga "${y.name}" creada`),_.navigate(`/ligas/${y.id}`)}catch(y){u(y.message,"error")}})}catch(i){e.innerHTML=`<div class="container"><p class="form__error">Error: ${i.message}</p></div>`}}function P(e){return`
    <div class="league-card" data-id="${e.id}">
      <div class="league-card__name">${e.name}</div>
      <div class="league-card__meta">
        <span>${e.is_public?"🌍 Pública":"🔒 Privada"}</span>
        <span>${e.member_count} participantes</span>
      </div>
      <div class="league-card__creator">por ${e.creator_username}</div>
    </div>
  `}async function Z(e,{params:t}){var s,n;const a=parseInt(t.id);e.innerHTML='<div class="loading"><div class="loading__spinner"></div></div>';try{const{league:i,ranking:r,is_member:o}=await l.leagues.get(a),c=p.getUser();e.innerHTML=`
      <div class="container">
        <a href="#/ligas" class="back-link">← Volver a ligas</a>
        <div class="league-header">
          <h1 class="page-title">${i.name}</h1>
          <div class="league-header__meta">
            <span>${i.is_public?"🌍 Pública":"🔒 Privada"}</span>
            <span>${i.member_count} participantes</span>
            ${i.invite_code?`<span class="invite-code">Código: <strong>${i.invite_code}</strong></span>`:""}
          </div>
        </div>

        ${o?'<button class="btn btn--danger btn--sm" id="btnLeave">Abandonar liga</button>':c?'<button class="btn btn--primary" id="btnJoin">Unirse a esta liga</button>':""}

        <section class="section">
          <h2>Clasificación</h2>
          <table class="ranking-table">
            <thead>
              <tr><th>#</th><th>Usuario</th><th>País</th><th>Puntos</th></tr>
            </thead>
            <tbody>
              ${r.map(d=>`
                <tr class="${c&&d.id===c.id?"ranking-table__row--me":""}">
                  <td>${d.position}</td>
                  <td>${d.username}</td>
                  <td>${d.country||"—"}</td>
                  <td class="ranking-table__pts">${d.total_points}</td>
                </tr>
              `).join("")}
            </tbody>
          </table>
        </section>
      </div>
    `,(s=document.getElementById("btnLeave"))==null||s.addEventListener("click",async()=>{if(confirm("¿Seguro que quieres abandonar esta liga?"))try{await l.leagues.leave(a),u("Has abandonado la liga"),_.navigate("/ligas")}catch(d){u(d.message,"error")}}),(n=document.getElementById("btnJoin"))==null||n.addEventListener("click",async()=>{try{await l.leagues.join({league_id:a}),u("¡Te has unido a la liga!"),_.navigate(`/ligas/${a}`)}catch(d){u(d.message,"error")}})}catch(i){e.innerHTML=`<div class="container"><p class="form__error">Error: ${i.message}</p><a href="#/ligas">Volver</a></div>`}}async function ee(e){var a,s;e.innerHTML='<div class="loading"><div class="loading__spinner"></div></div>';const t=p.getUser();try{const[n,i,r]=await Promise.all([l.predictions.mine(),l.predictions.getChampion(),l.leagues.my()]),o=n.predictions.reduce((c,d)=>c+d.total_points,0)+(((a=i.champion_prediction)==null?void 0:a.points_earned)||0);e.innerHTML=`
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
          <button class="btn btn--danger" id="btnLogoutPerfil">Cerrar sesión</button>
          <div class="profile-card__stats">
            <div class="stat">
              <span class="stat__value">${o}</span>
              <span class="stat__label">Puntos totales</span>
            </div>
            <div class="stat">
              <span class="stat__value">${n.predictions.length}</span>
              <span class="stat__label">Predicciones</span>
            </div>
            <div class="stat">
              <span class="stat__value">${r.leagues.length}</span>
              <span class="stat__label">Ligas</span>
            </div>
          </div>
        </section>

        ${i.champion_prediction?`<section class="section">
               <h2>Predicción Campeón</h2>
               <p class="champion-pick">
                 🏆 <strong>${i.champion_prediction.team_name}</strong>
                 — ${i.champion_prediction.points_earned} puntos
               </p>
             </section>`:`<section class="section">
               <h2>Predicción Campeón</h2>
               <p class="notice">Aún no has predicho el campeón. <a href="#/campeon">Hacerlo ahora</a></p>
             </section>`}

        <section class="section">
          <h2>Mis predicciones</h2>
          ${n.predictions.length?`<div class="predictions-list">${n.predictions.map(te).join("")}</div>`:'<p class="empty">Sin predicciones aún. <a href="#/quiniela">Ir a la quiniela</a></p>'}
        </section>

        <section class="section">
          <h2>Mis ligas</h2>
          ${r.leagues.length?`<ul class="leagues-list">${r.leagues.map(c=>`<li><a href="#/ligas/${c.id}">${c.name}</a> <span class="tag">${c.is_public?"Pública":"Privada"}</span></li>`).join("")}</ul>`:'<p class="empty">No perteneces a ninguna liga. <a href="#/ligas">Ver ligas</a></p>'}
        </section>
      </div>
    `,(s=e.querySelector("#btnLogoutPerfil"))==null||s.addEventListener("click",()=>{p.logout(),window.location.hash="/"})}catch(n){e.innerHTML=`<div class="container"><p class="form__error">Error: ${n.message}</p></div>`}}function te(e){return`
    <div class="pred-row ${e.total_points>0?"pred-row--scored":""}">
      <span class="pred-row__result">${e.predicted_result}</span>
      <span class="pred-row__score">${e.predicted_home}-${e.predicted_away}</span>
      <span class="pred-row__pts">${e.total_points} pts</span>
    </div>
  `}const C=new Date("2026-06-11T00:00:00Z"),ae=["Argentina","Brasil","Francia","España","Inglaterra","Alemania","Portugal","Países Bajos","Italia","Bélgica","Uruguay","Colombia","México","Estados Unidos","Canadá","Marruecos","Senegal","Nigeria","Japón","Corea del Sur","Australia","Arabia Saudí","Irán","Qatar","Ecuador","Chile","Perú","Venezuela","Bolivia","Paraguay","Costa Rica","Honduras","Panamá","Jamaica","Trinidad y Tobago","Guatemala","Turquía","Polonia","Croacia","Serbia","República Checa","Eslovaquia","Austria","Suiza","Dinamarca","Suecia","Noruega","Escocia","Ucrania","Rumanía","Hungría","Grecia","Egipto","Camerún","Ghana","Costa de Marfil","Túnez","Argelia","China","India","Irak","Uzbekistán","Nueva Zelanda","Fiji"];async function x(e){var t;if(!p.isLoggedIn()){e.innerHTML='<div class="container"><p class="notice"><a href="#/login">Inicia sesión</a> para predecir el campeón.</p></div>';return}e.innerHTML='<div class="loading"><div class="loading__spinner"></div></div>';try{const{champion_prediction:a}=await l.predictions.getChampion(),s=new Date>=C;e.innerHTML=`
      <div class="container">
        <h1 class="page-title">🏆 Predice el Campeón</h1>
        <p class="champion-desc">
          Acertar el campeón del mundo vale <strong>10 puntos extra</strong>.
          Solo puedes predecirlo una vez y antes del inicio del torneo
          (${C.toLocaleDateString("es-ES",{day:"numeric",month:"long",year:"numeric"})}).
        </p>

        ${a?`<div class="champion-result">
               <p>Tu predicción: <strong class="champion-result__team">${a.team_name}</strong></p>
               <p>Puntos ganados: <strong>${a.points_earned}</strong></p>
               ${s?"":'<p class="notice">No puedes cambiar la predicción una vez enviada.</p>'}
             </div>`:s?'<p class="notice">El torneo ya ha comenzado. No es posible predecir el campeón.</p>':`<form class="form champion-form" id="championForm">
                 <div class="form__group">
                   <label class="form__label" for="teamSearch">Selecciona el equipo campeón</label>
                   <input class="form__input" type="text" id="teamSearch" placeholder="Escribe para buscar…"
                     list="teamsList" autocomplete="off" required />
                   <datalist id="teamsList">
                     ${ae.map(n=>`<option value="${n}">`).join("")}
                   </datalist>
                 </div>
                 <p id="champError" class="form__error hidden"></p>
                 <button class="btn btn--primary" type="submit" id="champBtn">Confirmar predicción</button>
               </form>`}
      </div>
    `,(t=document.getElementById("championForm"))==null||t.addEventListener("submit",async n=>{n.preventDefault();const i=document.getElementById("champBtn"),r=document.getElementById("champError"),o=document.getElementById("teamSearch").value.trim();if(o){i.disabled=!0,i.textContent="Guardando…",r.classList.add("hidden");try{await l.predictions.saveChampion(o),u(`¡${o} guardado como campeón!`),x(e)}catch(c){r.textContent=c.message,r.classList.remove("hidden"),i.disabled=!1,i.textContent="Confirmar predicción"}}})}catch(a){e.innerHTML=`<div class="container"><p class="form__error">Error: ${a.message}</p></div>`}}async function se(e){if(!p.isAdmin()){e.innerHTML='<div class="container"><p class="form__error">Acceso denegado.</p></div>';return}e.innerHTML='<div class="loading"><div class="loading__spinner"></div></div>';try{const{users:t}=await l.auth.users();e.innerHTML=`
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
              ${t.map(ne).join("")}
            </tbody>
          </table>
        </section>
      </div>
    `,document.getElementById("btnSync").addEventListener("click",async()=>{const a=document.getElementById("syncResult");a.textContent="Sincronizando…";try{await l.matches.sync(),a.textContent="✓ Sincronización completada",u("Sincronización completada")}catch(s){a.textContent=`Error: ${s.message}`,u(s.message,"error")}}),document.getElementById("awardForm").addEventListener("submit",async a=>{a.preventDefault();const s=document.getElementById("winnerTeam").value.trim();if(s)try{const{message:n}=await l.predictions.awardChampion(s);u(n)}catch(n){u(n.message,"error")}}),document.getElementById("usersTableBody").addEventListener("click",async a=>{const s=a.target.closest(".toggle-admin");if(!s)return;const n=parseInt(s.dataset.id);try{const{user:i}=await l.auth.toggleAdmin(n);s.closest("tr").querySelector(".admin-badge").textContent=i.is_admin?"Sí":"No",u(`${i.username} ${i.is_admin?"ahora es admin":"ya no es admin"}`)}catch(i){u(i.message,"error")}})}catch(t){e.innerHTML=`<div class="container"><p class="form__error">Error: ${t.message}</p></div>`}}function ne(e){return`
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
  `}function ie(e){e.innerHTML=`
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
  `,document.getElementById("forgotForm").addEventListener("submit",async t=>{t.preventDefault();const a=document.getElementById("forgotBtn"),s=document.getElementById("forgotMsg"),n=document.getElementById("email").value.trim();a.disabled=!0,a.textContent="Enviando…";try{await l.auth.forgotPassword(n),s.textContent="Si el email existe, recibirás un enlace en breve.",s.classList.remove("hidden","form__error"),s.classList.add("form__success")}catch{u("Error al enviar el email","error")}finally{a.disabled=!1,a.textContent="Enviar enlace"}})}function re(e,{query:t}){const a=t.token||"";if(!a){e.innerHTML='<div class="container"><p class="form__error">Token inválido o expirado.</p><a href="#/login">Volver</a></div>';return}e.innerHTML=`
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
  `,document.getElementById("resetForm").addEventListener("submit",async s=>{s.preventDefault();const n=document.getElementById("resetBtn"),i=document.getElementById("resetError"),r=document.getElementById("password").value;n.disabled=!0,n.textContent="Guardando…",i.classList.add("hidden");try{await l.auth.resetPassword(a,r),u("Contraseña actualizada. Ya puedes iniciar sesión."),_.navigate("/login")}catch(o){i.textContent=o.message||"Error al restablecer la contraseña",i.classList.remove("hidden")}finally{n.disabled=!1,n.textContent="Guardar contraseña"}})}const oe={r32:"Dieciseisavos",r16:"Octavos",quarters:"Cuartos",semis:"Semis",third:"3º y 4º",final:"Final"};async function ce(e){e.innerHTML='<div class="loading"><div class="loading__spinner"></div></div>';try{const{groups:t}=await l.matches.grouped();e.innerHTML=`
      <div class="container">
        <h1 class="page-title">Resultados — Mundial 2026</h1>
        <nav class="phase-nav" id="phaseNav"></nav>
        <div id="phaseContent"></div>
      </div>
    `,de(t)}catch(t){e.innerHTML=`<div class="container"><p class="form__error">Error cargando los partidos: ${t.message}</p></div>`}}function de(e){var i;const t=document.getElementById("phaseNav");if(!t)return;const a=e.filter(r=>r.phase==="group"),s=e.filter(r=>r.phase!=="group"),n=[...a.map(r=>({key:`group_${r.group_name}`,label:`Grupo ${r.group_name}`,data:r,isGroup:!0})),...s.map(r=>({key:r.phase,label:oe[r.phase]||r.label,data:r,isGroup:!1}))];n.length!==0&&(t.innerHTML=n.map((r,o)=>`
    <button class="phase-nav__btn ${o===0?"phase-nav__btn--active":""}" data-key="${r.key}">
      ${r.label}
    </button>
  `).join(""),(i=t.querySelector(".phase-nav__btn--active"))==null||i.scrollIntoView({inline:"center",behavior:"instant",block:"nearest"}),t.querySelectorAll(".phase-nav__btn").forEach((r,o)=>{r.addEventListener("click",()=>{t.querySelectorAll(".phase-nav__btn").forEach(d=>d.classList.remove("phase-nav__btn--active")),r.classList.add("phase-nav__btn--active");const c=n.find(d=>d.key===r.dataset.key);c&&T(c.data,c.isGroup)})}),T(n[0].data,n[0].isGroup))}function T(e,t){const a=document.getElementById("phaseContent");if(!a)return;const s=le(e.matches);if(t){const n=me(e.matches);a.innerHTML=`
      <div class="resultados-section">
        <div class="resultados-matches">${s}</div>
        <div class="standings">
          <h3 class="standings__title">Clasificación — Grupo ${e.group_name}</h3>
          ${ue(n)}
        </div>
      </div>
    `}else a.innerHTML=`<div class="resultados-matches">${s}</div>`}function le(e){return!e||e.length===0?'<p class="empty">Sin partidos en esta fase.</p>':e.map(t=>{const a={scheduled:"Programado",live:"🔴 En juego",finished:"Finalizado"}[t.status]||t.status,s=t.status!=="scheduled"?`<span class="res-score">${t.home_score_90??"?"} - ${t.away_score_90??"?"}</span>`:'<span class="res-score res-score--pending">vs</span>';return`
      <div class="res-match ${t.status==="finished"?"res-match--finished":""} ${t.status==="live"?"res-match--live":""}">
        <div class="res-match__meta">
          <span class="res-match__status">${a}</span>
          <span class="res-match__date">${w(t.match_datetime)}</span>
        </div>
        <div class="res-match__teams">
          <span class="res-match__team res-match__team--home">${t.home_team}</span>
          ${s}
          <span class="res-match__team res-match__team--away">${t.away_team}</span>
        </div>
      </div>
    `}).join("")}function me(e){const t={};for(const a of e)if(t[a.home_team]||(t[a.home_team]={name:a.home_team,pj:0,g:0,e:0,p:0,gf:0,gc:0,pts:0}),t[a.away_team]||(t[a.away_team]={name:a.away_team,pj:0,g:0,e:0,p:0,gf:0,gc:0,pts:0}),a.status==="finished"&&a.home_score_90!==null&&a.away_score_90!==null){const s=t[a.home_team],n=t[a.away_team];s.pj++,n.pj++,s.gf+=a.home_score_90,s.gc+=a.away_score_90,n.gf+=a.away_score_90,n.gc+=a.home_score_90,a.home_score_90>a.away_score_90?(s.g++,s.pts+=3,n.p++):a.home_score_90<a.away_score_90?(n.g++,n.pts+=3,s.p++):(s.e++,s.pts++,n.e++,n.pts++)}return Object.values(t).sort((a,s)=>{if(s.pts!==a.pts)return s.pts-a.pts;const n=s.gf-s.gc,i=a.gf-a.gc;return n!==i?n-i:s.gf-a.gf})}function ue(e){return e.length===0?'<p class="empty">Sin datos de clasificación.</p>':`
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
      <tbody>${e.map((a,s)=>`
    <tr class="${s<3?"standings__row--qualify":""}">
      <td class="standings__pos">${s+1}</td>
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
  `}const pe={"/":D,"/login":O,"/register":R,"/quiniela":F,"/resultados":ce,"/ranking":X,"/tablon":Y,"/ligas":W,"/ligas/:id":Z,"/perfil":ee,"/campeon":x,"/admin":se,"/forgot-password":ie,"/reset-password":re};function ge(e){for(const[t,a]of Object.entries(pe)){const s=[],n=new RegExp("^"+t.replace(/:([^/]+)/g,(r,o)=>(s.push(o),"([^/]+)"))+"$"),i=e.match(n);if(i){const r={};return s.forEach((o,c)=>{r[o]=i[c+1]}),{handler:a,params:r}}}return null}const M=()=>document.getElementById("mainContent"),_={init(){window.addEventListener("hashchange",()=>this.resolve()),this.resolve()},navigate(e){window.location.hash=e},resolve(){const e=window.location.hash.slice(1)||"/",[t,a]=e.split("?"),s=Object.fromEntries(new URLSearchParams(a||"")),n=ge(t);if(!n){M().innerHTML='<div class="error-page"><h2>Página no encontrada</h2><a href="#/">Volver al inicio</a></div>';return}const{handler:i,params:r}=n;if(["/perfil","/campeon","/admin"].includes(t)&&!p.isLoggedIn()){this.navigate("/login");return}if(t==="/admin"&&!p.isAdmin()){this.navigate("/");return}const c=M();c.innerHTML='<div class="loading"><div class="loading__spinner"></div></div>',i(c,{params:r,query:s})}};let E=[];async function he(){await p.init(),_.init(),ve()}function f(){var e,t,a,s;(e=document.getElementById("leagueDropdown"))==null||e.classList.add("hidden"),(t=document.getElementById("leagueBtn"))==null||t.classList.remove("navbar__dropdown-btn--open"),(a=document.getElementById("userDropdown"))==null||a.classList.add("hidden"),(s=document.getElementById("userBtn"))==null||s.classList.remove("navbar__dropdown-btn--open")}function ve(){var e,t,a,s,n;document.addEventListener("auth:change",k),window.addEventListener("hashchange",()=>{f(),q()}),document.addEventListener("click",f),(e=document.getElementById("leagueBtn"))==null||e.addEventListener("click",i=>{var c;i.stopPropagation();const r=document.getElementById("leagueDropdown"),o=r==null?void 0:r.classList.contains("hidden");f(),o&&(r==null||r.classList.remove("hidden"),(c=document.getElementById("leagueBtn"))==null||c.classList.add("navbar__dropdown-btn--open"))}),(t=document.getElementById("leagueDropdown"))==null||t.addEventListener("click",i=>{i.stopPropagation();const r=i.target.closest("[data-league-id]");if(r){localStorage.setItem("activeLeagueId",r.dataset.leagueId),f(),N(E);return}i.target.closest("a")&&f()}),(a=document.getElementById("userBtn"))==null||a.addEventListener("click",i=>{var c;i.stopPropagation();const r=document.getElementById("userDropdown"),o=r==null?void 0:r.classList.contains("hidden");f(),o&&(r==null||r.classList.remove("hidden"),(c=document.getElementById("userBtn"))==null||c.classList.add("navbar__dropdown-btn--open"))}),(s=document.getElementById("userDropdown"))==null||s.addEventListener("click",i=>{i.stopPropagation(),i.target.closest("#navProfileLink")&&f()}),(n=document.getElementById("navLogoutBtn"))==null||n.addEventListener("click",()=>{E=[],localStorage.removeItem("activeLeagueId"),f(),p.logout(),_.navigate("/")}),k()}async function k(){const e=document.getElementById("navAuthLinks"),t=document.getElementById("userBtn"),a=document.getElementById("navUsername"),s=document.getElementById("navLeague"),n=document.getElementById("bottomNav"),i=p.getUser();if(f(),i){e==null||e.classList.add("hidden"),a&&(a.textContent=i.username),s.style.visibility="visible",t.style.visibility="visible",n==null||n.classList.remove("hidden"),document.body.classList.add("has-bottom-nav");try{const{leagues:r}=await l.leagues.my();E=r}catch{E=[]}N(E)}else e==null||e.classList.remove("hidden"),s.style.visibility="hidden",t.style.visibility="hidden",n==null||n.classList.add("hidden"),document.body.classList.remove("has-bottom-nav"),E=[],localStorage.removeItem("activeLeagueId");q()}function N(e){const t=document.getElementById("leagueDropdown"),a=document.getElementById("navLeagueName");if(!t||!a)return;let s=localStorage.getItem("activeLeagueId"),n=e.find(r=>String(r.id)===String(s));!n&&e.length>0&&(n=e[0],localStorage.setItem("activeLeagueId",String(n.id))),n||localStorage.removeItem("activeLeagueId"),a.textContent=n?n.name:"Inicia Liga";const i=e.map(r=>`
    <button class="navbar__dropdown-item ${String(r.id)===String(n==null?void 0:n.id)?"navbar__dropdown-item--active":""}" data-league-id="${r.id}">${r.name}</button>
  `).join("");t.innerHTML=`
    ${i}
    <a href="#/ligas" class="navbar__dropdown-item navbar__dropdown-item--muted">
      <svg viewBox="0 0 24 24" fill="currentColor" width="13" height="13" aria-hidden="true"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/></svg>
      Ver ligas disponibles
    </a>
  `}function q(){const e=window.location.hash.slice(1).split("?")[0]||"/";document.querySelectorAll(".bottom-nav__item").forEach(t=>{const a=t.dataset.route,s=a==="/"?e==="/":e===a||e.startsWith(a+"/");t.classList.toggle("bottom-nav__item--active",s)})}he();
