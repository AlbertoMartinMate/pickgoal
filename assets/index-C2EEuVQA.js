(function(){const t=document.createElement("link").relList;if(t&&t.supports&&t.supports("modulepreload"))return;for(const s of document.querySelectorAll('link[rel="modulepreload"]'))n(s);new MutationObserver(s=>{for(const i of s)if(i.type==="childList")for(const r of i.addedNodes)r.tagName==="LINK"&&r.rel==="modulepreload"&&n(r)}).observe(document,{childList:!0,subtree:!0});function a(s){const i={};return s.integrity&&(i.integrity=s.integrity),s.referrerPolicy&&(i.referrerPolicy=s.referrerPolicy),s.crossOrigin==="use-credentials"?i.credentials="include":s.crossOrigin==="anonymous"?i.credentials="omit":i.credentials="same-origin",i}function n(s){if(s.ep)return;s.ep=!0;const i=a(s);fetch(s.href,i)}})();const U="https://pickgoal-backend.onrender.com/api";function R(){return localStorage.getItem("token")}async function u(e,t={}){const a={"Content-Type":"application/json",...t.headers},n=R();n&&(a.Authorization=`Bearer ${n}`);const s=await fetch(`${U}${e}`,{...t,headers:a}),i=await s.json().catch(()=>({}));if(!s.ok)throw{status:s.status,message:i.error||"Error desconocido"};return i}const m={get:e=>u(e),post:(e,t)=>u(e,{method:"POST",body:JSON.stringify(t)}),patch:(e,t)=>u(e,{method:"PATCH",body:JSON.stringify(t)}),delete:e=>u(e,{method:"DELETE"}),auth:{register:e=>u("/auth/register",{method:"POST",body:JSON.stringify(e)}),login:e=>u("/auth/login",{method:"POST",body:JSON.stringify(e)}),me:()=>u("/auth/me"),forgotPassword:e=>u("/auth/forgot-password",{method:"POST",body:JSON.stringify({email:e})}),resetPassword:(e,t)=>u("/auth/reset-password",{method:"POST",body:JSON.stringify({token:e,password:t})}),ranking:()=>u("/auth/ranking"),users:()=>u("/auth/users"),toggleAdmin:e=>u(`/auth/users/${e}/toggle-admin`,{method:"PATCH"})},matches:{grouped:()=>u("/matches/grouped"),list:(e="")=>u(`/matches/${e}`),get:e=>u(`/matches/${e}`),sync:()=>u("/matches/sync",{method:"POST"})},predictions:{mine:()=>u("/predictions/"),forMatch:e=>u(`/predictions/match/${e}`),save:e=>u("/predictions/",{method:"POST",body:JSON.stringify(e)}),getChampion:()=>u("/predictions/champion"),saveChampion:e=>u("/predictions/champion",{method:"POST",body:JSON.stringify({team_name:e})}),awardChampion:e=>u("/predictions/champion/award",{method:"POST",body:JSON.stringify({team_name:e})})},leagues:{all:()=>u("/leagues/all"),public:()=>u("/leagues/public"),my:()=>u("/leagues/my"),create:e=>u("/leagues/",{method:"POST",body:JSON.stringify(e)}),join:e=>u("/leagues/join",{method:"POST",body:JSON.stringify(e)}),joinByCode:e=>u(`/leagues/join/${encodeURIComponent(e)}`),get:e=>u(`/leagues/${e}`),leave:e=>u(`/leagues/${e}/leave`,{method:"DELETE"}),matchPredictions:(e,t)=>u(`/leagues/${e}/predictions/${t}`)},board:{messages:(e=1)=>u(`/board/?page=${e}`),post:e=>u("/board/",{method:"POST",body:JSON.stringify({message:e})}),delete:e=>u(`/board/${e}`,{method:"DELETE"})}};let y=null;const h={async init(){if(localStorage.getItem("token"))try{const{user:t}=await m.auth.me();y=t}catch{localStorage.removeItem("token")}},setUser(e,t){y=e,localStorage.setItem("token",t),document.dispatchEvent(new CustomEvent("auth:change",{detail:e}))},logout(){y=null,localStorage.removeItem("token"),document.dispatchEvent(new CustomEvent("auth:change",{detail:null}))},getUser(){return y},isLoggedIn(){return!!y},isAdmin(){return(y==null?void 0:y.is_admin)===!0}};function G(e){const t=h.getUser();e.innerHTML=`
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
  `}let B=null;function p(e,t="success"){let a=document.getElementById("toast");a||(a=document.createElement("div"),a.id="toast",document.body.appendChild(a)),a.textContent=e,a.className=`toast toast--${t} toast--visible`,B&&clearTimeout(B),B=setTimeout(()=>{a.classList.remove("toast--visible")},3e3)}function j(){return`
    <div class="container">
      <div class="league-gate">
        <div class="league-gate__icon">⚽</div>
        <h2 class="league-gate__title">¡Inicia tu Liga!</h2>
        <p class="league-gate__text">Únete a una liga para empezar a predecir</p>
        <a href="#/ligas" class="btn btn--primary">Ver ligas disponibles</a>
      </div>
    </div>
  `}function S(e){return e?new Date(e).toLocaleString("es-ES",{day:"2-digit",month:"2-digit",year:"numeric",hour:"2-digit",minute:"2-digit"}):"—"}function F(e){e.innerHTML=`
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
  `,document.getElementById("loginForm").addEventListener("submit",async t=>{t.preventDefault();const a=document.getElementById("loginBtn"),n=document.getElementById("loginError"),s=document.getElementById("identifier").value.trim(),i=document.getElementById("password").value;a.disabled=!0,a.textContent="Entrando…",n.classList.add("hidden");try{const{token:r,user:o}=await m.auth.login({identifier:s,password:i});h.setUser(o,r),p(`¡Bienvenido, ${o.username}!`),_.navigate("/quiniela")}catch(r){n.textContent=r.message||"Error al iniciar sesión",n.classList.remove("hidden")}finally{a.disabled=!1,a.textContent="Entrar"}})}function z(e){e.innerHTML=`
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
  `,document.getElementById("registerForm").addEventListener("submit",async t=>{t.preventDefault();const a=document.getElementById("registerBtn"),n=document.getElementById("registerError");a.disabled=!0,a.textContent="Creando cuenta…",n.classList.add("hidden");const s={username:document.getElementById("username").value.trim(),email:document.getElementById("email").value.trim(),country:document.getElementById("country").value.trim(),password:document.getElementById("password").value};try{const{token:i,user:r}=await m.auth.register(s);h.setUser(r,i),p("¡Cuenta creada! Bienvenido a PickGoal");const o=sessionStorage.getItem("pendingInviteCode");if(o){sessionStorage.removeItem("pendingInviteCode");try{const{league:c}=await m.leagues.joinByCode(o);p(`¡Te has unido a "${c.name}"!`),_.navigate(`/ligas/${c.id}`)}catch{_.navigate("/ligas")}}else _.navigate("/campeon")}catch(i){n.textContent=i.message||"Error al registrarse",n.classList.remove("hidden")}finally{a.disabled=!1,a.textContent="Crear cuenta"}})}async function J(e){e.innerHTML='<div class="loading"><div class="loading__spinner"></div></div>';try{if(h.isLoggedIn()){const{leagues:d}=await m.leagues.my();if(d.length===0){e.innerHTML=j();return}}const[{groups:t},a]=await Promise.all([m.matches.grouped(),h.isLoggedIn()?m.predictions.mine():Promise.resolve({predictions:[]})]),n={};for(const d of a.predictions)n[d.match_id]=d;const s=t.flatMap(d=>d.matches),i=new Map;for(const d of s){const l=k(d.match_datetime);i.has(l)||i.set(l,[]),i.get(l).push(d)}const r=[...i.keys()].sort(),o=k(new Date().toISOString()),c=r.find(d=>d>=o)??r[0];e.innerHTML=`
      <div class="container">
        <h1 class="page-title">Pronósticos — Mundial 2026</h1>
        ${h.isLoggedIn()?"":'<p class="notice">⚠️ <a href="#/login">Inicia sesión</a> para guardar tus predicciones.</p>'}
        <nav class="date-nav" id="dateNav"></nav>
        <div id="matchesContent"></div>
      </div>
    `,V(r,c,i,n),h.isLoggedIn()&&K(s,n)}catch(t){e.innerHTML=`<div class="container"><p class="form__error">Error cargando los partidos: ${t.message}</p></div>`}}function V(e,t,a,n){var i;const s=document.getElementById("dateNav");s&&(s.innerHTML=e.map(r=>`
    <button class="date-nav__btn ${r===t?"date-nav__btn--active":""}" data-day="${r}">
      ${Y(r)}
    </button>
  `).join(""),(i=s.querySelector(".date-nav__btn--active"))==null||i.scrollIntoView({inline:"center",behavior:"instant",block:"nearest"}),s.querySelectorAll(".date-nav__btn").forEach(r=>{r.addEventListener("click",()=>{s.querySelectorAll(".date-nav__btn").forEach(o=>o.classList.remove("date-nav__btn--active")),r.classList.add("date-nav__btn--active"),P(a.get(r.dataset.day)??[],n)})}),P(a.get(t)??[],n))}function P(e,t){const a=document.getElementById("matchesContent");if(a){if(e.length===0){a.innerHTML='<p class="empty">Sin partidos este día.</p>';return}a.innerHTML=`<div class="matches-grid">${e.map(n=>Q(n,t[n.id])).join("")}</div>`,h.isLoggedIn()&&a.querySelectorAll(".prediction-form").forEach(n=>{W(n,t)})}}function k(e){const t=new Date(e);return`${t.getFullYear()}-${String(t.getMonth()+1).padStart(2,"0")}-${String(t.getDate()).padStart(2,"0")}`}function Y(e){const[t,a,n]=e.split("-").map(Number);return new Date(t,a-1,n).toLocaleDateString("es-ES",{day:"numeric",month:"short"})}function Q(e,t){const a=e.is_locked,n=t?`<span class="pts-badge">${t.total_points} pts</span>`:"",s={scheduled:"Programado",live:"🔴 En juego",finished:"Finalizado"}[e.status];return`
    <div class="match-card ${a?"match-card--locked":""}" data-match-id="${e.id}">
      <div class="match-card__header">
        <span class="match-card__status">${s}</span>
        <span class="match-card__date">${S(e.match_datetime)}</span>
        ${n}
      </div>
      <div class="match-card__teams">
        <span class="team team--home">${e.home_team}</span>
        <div class="match-card__score">
          ${e.status!=="scheduled"?`<span class="score">${e.home_score_90??"?"} - ${e.away_score_90??"?"}</span>`:'<span class="score score--dash">vs</span>'}
        </div>
        <span class="team team--away">${e.away_team}</span>
      </div>
      ${!a&&h.isLoggedIn()?X(e,t):a&&t?`<div class="prediction-result">
               Tu predicción: <strong>${t.predicted_home}-${t.predicted_away}</strong>
               (${t.predicted_result}) · ${t.total_points} pts
             </div>`:""}
    </div>
  `}function X(e,t){const a=(t==null?void 0:t.predicted_home)??0,n=(t==null?void 0:t.predicted_away)??0,s=(t==null?void 0:t.predicted_result)??"X";return`
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
          value="${a}" placeholder="0" required />
        <span>-</span>
        <input type="number" name="predicted_away" class="score-input" min="0" max="30"
          value="${n}" placeholder="0" required />
      </div>
      <button type="submit" class="btn btn--primary btn--sm">Guardar</button>
    </form>
  `}async function K(e,t){const a=e.filter(n=>!n.is_locked&&!t[n.id]);for(const n of a)try{const{prediction:s}=await m.predictions.save({match_id:n.id,predicted_result:"X",predicted_home:0,predicted_away:0});t[n.id]=s}catch{}}function W(e,t){e.addEventListener("submit",async a=>{var c;a.preventDefault();const n=parseInt(e.dataset.matchId),s=parseInt(e.querySelector("[name=predicted_home]").value),i=parseInt(e.querySelector("[name=predicted_away]").value),r=(c=e.querySelector("[name=predicted_result]:checked"))==null?void 0:c.value;if(isNaN(s)||isNaN(i)||!r)return;const o=e.querySelector("button");o.disabled=!0,o.textContent="…";try{const{prediction:d}=await m.predictions.save({match_id:n,predicted_result:r,predicted_home:s,predicted_away:i});t[n]=d,p("Predicción guardada"),o.textContent="✓ Guardado",setTimeout(()=>{o.disabled=!1,o.textContent="Guardar"},2e3)}catch(d){p(d.message||"Error al guardar","error"),o.disabled=!1,o.textContent="Guardar"}})}async function Z(e){e.innerHTML='<div class="loading"><div class="loading__spinner"></div></div>';try{if(h.isLoggedIn()){const{leagues:n}=await m.leagues.my();if(n.length===0){e.innerHTML=j();return}}const{ranking:t}=await m.auth.ranking(),a=h.getUser();e.innerHTML=`
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
              ${t.map(n=>`
                <tr class="${a&&n.id===a.id?"ranking-table__row--me":""}">
                  <td class="ranking-table__pos">${n.position}</td>
                  <td>${n.username}</td>
                  <td>${n.country||"—"}</td>
                  <td class="ranking-table__pts">${n.total_points}</td>
                  <td class="ranking-table__stat">${n.correct_results}</td>
                  <td class="ranking-table__stat">${n.exact_scores}</td>
                </tr>
              `).join("")}
            </tbody>
          </table>
        </div>
      </div>
    `}catch(t){e.innerHTML=`<div class="container"><p class="form__error">Error: ${t.message}</p></div>`}}async function ee(e){e.innerHTML='<div class="loading"><div class="loading__spinner"></div></div>';let t=1,a=1;async function n(){const{messages:o,pages:c}=await m.board.messages(t);return a=c,o}try{const o=await n();s(o)}catch(o){e.innerHTML=`<div class="container"><p class="form__error">Error: ${o.message}</p></div>`}function s(o){var d,l,v;const c=h.getUser();e.innerHTML=`
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
    `,(d=document.getElementById("boardForm"))==null||d.addEventListener("submit",async g=>{g.preventDefault();const b=document.getElementById("boardMsg"),w=b.value.trim();if(w)try{await m.board.post(w),b.value="";const $=await n();document.getElementById("boardMessages").innerHTML=i($,c),r(c),p("Mensaje publicado")}catch($){p($.message,"error")}}),(l=document.getElementById("prevPage"))==null||l.addEventListener("click",async()=>{t--;const g=await n();document.getElementById("boardMessages").innerHTML=i(g,c),r(c)}),(v=document.getElementById("nextPage"))==null||v.addEventListener("click",async()=>{t++;const g=await n();document.getElementById("boardMessages").innerHTML=i(g,c),r(c)}),r(c)}function i(o,c){return o.length?o.map(d=>`
      <div class="board-message ${d.is_deleted?"board-message--deleted":""}" data-id="${d.id}">
        <div class="board-message__header">
          <strong>${d.username}</strong>
          <span class="board-message__date">${S(d.created_at)}</span>
          ${!d.is_deleted&&c&&(c.id===d.user_id||c.is_admin)?`<button class="btn btn--danger btn--xs delete-msg" data-id="${d.id}">✕</button>`:""}
        </div>
        <p class="board-message__text">${te(d.message)}</p>
      </div>
    `).join(""):'<p class="empty">Sin mensajes aún. ¡Sé el primero!</p>'}function r(o){e.querySelectorAll(".delete-msg").forEach(c=>{c.addEventListener("click",async()=>{if(confirm("¿Eliminar este mensaje?"))try{await m.board.delete(c.dataset.id);const d=await n();document.getElementById("boardMessages").innerHTML=i(d,o),r(o),p("Mensaje eliminado")}catch(d){p(d.message,"error")}})})}}function te(e){return e.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;")}async function ae(e){var t,a,n,s;e.innerHTML='<div class="loading"><div class="loading__spinner"></div></div>';try{const[i,r]=await Promise.all([m.leagues.all(),h.isLoggedIn()?m.leagues.my():Promise.resolve({leagues:[]})]),o=h.getUser(),c=new Set(r.leagues.map(l=>l.id)),d=i.leagues.filter(l=>!c.has(l.id));e.innerHTML=`
      <div class="container">
        <h1 class="page-title">Ligas</h1>

        ${o&&r.leagues.length>0?`
          <section class="section">
            <h2>Mis ligas</h2>
            <div class="leagues-grid">${r.leagues.map(l=>T(l,!0)).join("")}</div>
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
          ${d.length?`<div class="leagues-grid">${d.map(l=>T(l,!1,c)).join("")}</div>`:r.leagues.length>0?'<p class="empty">Ya participas en todas las ligas disponibles.</p>':'<p class="empty">No hay ligas aún. ¡Crea la primera!</p>'}
        </section>
      </div>
    `,e.querySelectorAll('.league-card[data-navigate="true"]').forEach(l=>{l.addEventListener("click",()=>_.navigate(`/ligas/${l.dataset.id}`))}),e.querySelectorAll(".btn-join-league").forEach(l=>{l.addEventListener("click",async v=>{v.stopPropagation();const g=parseInt(l.dataset.id);l.disabled=!0,l.textContent="…";try{const{league:b}=await m.leagues.join({league_id:g});p(`¡Te has unido a "${b.name}"!`),_.navigate(`/ligas/${b.id}`)}catch(b){p(b.message,"error"),l.disabled=!1,l.textContent="Unirse"}})}),e.querySelectorAll(".btn-private-info").forEach(l=>{l.addEventListener("click",v=>{v.stopPropagation(),p("Esta liga es privada. Pide el enlace de invitación a cualquier miembro para unirte.","info")})}),(t=document.getElementById("btnShowCreate"))==null||t.addEventListener("click",()=>{var l,v;(l=document.getElementById("createLeaguePanel"))==null||l.classList.remove("hidden"),(v=document.getElementById("btnShowCreate"))==null||v.classList.add("hidden")}),(a=document.getElementById("btnCancelCreate"))==null||a.addEventListener("click",()=>{var l,v;(l=document.getElementById("createLeaguePanel"))==null||l.classList.add("hidden"),(v=document.getElementById("btnShowCreate"))==null||v.classList.remove("hidden")}),(n=document.getElementById("joinCodeForm"))==null||n.addEventListener("submit",async l=>{l.preventDefault();const v=document.getElementById("inviteCode").value.trim().toUpperCase();if(v)try{const{league:g}=await m.leagues.join({invite_code:v});p(`Te has unido a "${g.name}"`),_.navigate(`/ligas/${g.id}`)}catch(g){p(g.message,"error")}}),(s=document.getElementById("createLeagueForm"))==null||s.addEventListener("submit",async l=>{var C;l.preventDefault();const v=document.getElementById("createBtn");v.disabled=!0,v.textContent="Creando…";const g=document.getElementById("leagueName").value.trim(),b=document.getElementById("leagueDesc").value.trim(),w=document.getElementById("leaguePrize").value.trim(),$=document.getElementById("isPublic").checked,O=((C=document.getElementById("isOfficial"))==null?void 0:C.checked)??!1;try{const{league:I}=await m.leagues.create({name:g,description:b,prize:w,is_public:$,is_official:O});ne(I)}catch(I){p(I.message,"error"),v.disabled=!1,v.textContent="Crear liga"}})}catch(i){e.innerHTML=`<div class="container"><p class="form__error">Error: ${i.message}</p></div>`}}function T(e,t=!1,a=new Set){const n=e.is_official?'<span class="league-badge league-badge--official">⭐ Oficial</span>':"",s=e.is_public?"🌍":"🔒",i=t?`<button class="btn btn--sm btn--outline" onclick="event.stopPropagation(); window.location.hash='/ligas/${e.id}'">Ver liga</button>`:e.is_public?`<button class="btn btn--sm btn--primary btn-join-league" data-id="${e.id}">Unirse</button>`:'<button class="btn btn--sm btn--ghost btn-private-info">🔒 Solicitar enlace</button>';return`
    <div class="league-card ${t?"league-card--mine":""}" data-id="${e.id}" data-navigate="${t}">
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
  `}function ne(e){var n,s;const t=e.invite_link||"",a=document.getElementById("createLeaguePanel");a&&(a.innerHTML=`
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
  `,(n=document.getElementById("btnCopyLink"))==null||n.addEventListener("click",async()=>{try{await navigator.clipboard.writeText(t),p("Enlace copiado")}catch{p("No se pudo copiar","error")}}),(s=document.getElementById("btnShare"))==null||s.addEventListener("click",async()=>{try{await navigator.share({title:`Únete a ${e.name} en PickGoal`,url:t})}catch{}}))}async function se(e,{params:t}){var n,s,i,r;const a=parseInt(t.id);e.innerHTML='<div class="loading"><div class="loading__spinner"></div></div>';try{const{league:o,ranking:c,is_member:d}=await m.leagues.get(a),l=h.getUser(),v=o.is_official?'<span class="league-badge league-badge--official">⭐ Oficial</span>':"";e.innerHTML=`
      <div class="container">
        <a href="#/ligas" class="back-link">← Volver a ligas</a>
        <div class="league-header">
          <h1 class="page-title">${o.name} ${v}</h1>
          ${o.description?`<p class="league-header__desc">${o.description}</p>`:""}
          <div class="league-header__meta">
            <span>${o.is_public?"🌍 Pública":"🔒 Privada"}</span>
            <span>${o.member_count} participantes</span>
            ${o.prize?`<span>🏆 ${o.prize}</span>`:""}
          </div>
        </div>

        ${d&&o.invite_link?`
          <div class="invite-share-box">
            <span class="invite-share-box__label">Enlace de invitación:</span>
            <div class="invite-link-box">
              <span class="invite-link-box__url">${o.invite_link}</span>
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
              ${c.map(g=>`
                <tr class="${l&&g.id===l.id?"ranking-table__row--me":""}">
                  <td>${g.position}</td>
                  <td>${g.username}</td>
                  <td>${g.country||"—"}</td>
                  <td class="ranking-table__pts">${g.total_points}</td>
                </tr>
              `).join("")}
            </tbody>
          </table>
        </section>
      </div>
    `,(n=document.getElementById("btnCopyInvite"))==null||n.addEventListener("click",async()=>{try{await navigator.clipboard.writeText(o.invite_link),p("Enlace copiado")}catch{p("No se pudo copiar","error")}}),(s=document.getElementById("btnShareInvite"))==null||s.addEventListener("click",async()=>{try{await navigator.share({title:`Únete a ${o.name} en PickGoal`,url:o.invite_link})}catch{}}),(i=document.getElementById("btnLeave"))==null||i.addEventListener("click",async()=>{if(confirm("¿Seguro que quieres abandonar esta liga?"))try{await m.leagues.leave(a),p("Has abandonado la liga"),_.navigate("/ligas")}catch(g){p(g.message,"error")}}),(r=document.getElementById("btnJoin"))==null||r.addEventListener("click",async()=>{try{await m.leagues.join({league_id:a}),p("¡Te has unido a la liga!"),_.navigate(`/ligas/${a}`)}catch(g){p(g.message,"error")}})}catch(o){e.innerHTML=`<div class="container"><p class="form__error">Error: ${o.message}</p><a href="#/ligas">Volver</a></div>`}}async function ie(e){var a,n;e.innerHTML='<div class="loading"><div class="loading__spinner"></div></div>';const t=h.getUser();try{const[s,i,r]=await Promise.all([m.predictions.mine(),m.predictions.getChampion(),m.leagues.my()]),o=s.predictions.reduce((c,d)=>c+d.total_points,0)+(((a=i.champion_prediction)==null?void 0:a.points_earned)||0);e.innerHTML=`
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
              <span class="stat__value">${s.predictions.length}</span>
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
          ${s.predictions.length?`<div class="predictions-list">${s.predictions.map(re).join("")}</div>`:'<p class="empty">Sin predicciones aún. <a href="#/quiniela">Ir a la quiniela</a></p>'}
        </section>

        <section class="section">
          <h2>Mis ligas</h2>
          ${r.leagues.length?`<ul class="leagues-list">${r.leagues.map(c=>`<li><a href="#/ligas/${c.id}">${c.name}</a> <span class="tag">${c.is_public?"Pública":"Privada"}</span></li>`).join("")}</ul>`:'<p class="empty">No perteneces a ninguna liga. <a href="#/ligas">Ver ligas</a></p>'}
        </section>
      </div>
    `,(n=e.querySelector("#btnLogoutPerfil"))==null||n.addEventListener("click",()=>{h.logout(),window.location.hash="/"})}catch(s){e.innerHTML=`<div class="container"><p class="form__error">Error: ${s.message}</p></div>`}}function re(e){return`
    <div class="pred-row ${e.total_points>0?"pred-row--scored":""}">
      <span class="pred-row__result">${e.predicted_result}</span>
      <span class="pred-row__score">${e.predicted_home}-${e.predicted_away}</span>
      <span class="pred-row__pts">${e.total_points} pts</span>
    </div>
  `}const M=new Date("2026-06-11T00:00:00Z"),oe=["Argentina","Brasil","Francia","España","Inglaterra","Alemania","Portugal","Países Bajos","Italia","Bélgica","Uruguay","Colombia","México","Estados Unidos","Canadá","Marruecos","Senegal","Nigeria","Japón","Corea del Sur","Australia","Arabia Saudí","Irán","Qatar","Ecuador","Chile","Perú","Venezuela","Bolivia","Paraguay","Costa Rica","Honduras","Panamá","Jamaica","Trinidad y Tobago","Guatemala","Turquía","Polonia","Croacia","Serbia","República Checa","Eslovaquia","Austria","Suiza","Dinamarca","Suecia","Noruega","Escocia","Ucrania","Rumanía","Hungría","Grecia","Egipto","Camerún","Ghana","Costa de Marfil","Túnez","Argelia","China","India","Irak","Uzbekistán","Nueva Zelanda","Fiji"];async function q(e){var t;if(!h.isLoggedIn()){e.innerHTML='<div class="container"><p class="notice"><a href="#/login">Inicia sesión</a> para predecir el campeón.</p></div>';return}e.innerHTML='<div class="loading"><div class="loading__spinner"></div></div>';try{const{champion_prediction:a}=await m.predictions.getChampion(),n=new Date>=M;e.innerHTML=`
      <div class="container">
        <h1 class="page-title">🏆 Predice el Campeón</h1>
        <p class="champion-desc">
          Acertar el campeón del mundo vale <strong>10 puntos extra</strong>.
          Solo puedes predecirlo una vez y antes del inicio del torneo
          (${M.toLocaleDateString("es-ES",{day:"numeric",month:"long",year:"numeric"})}).
        </p>

        ${a?`<div class="champion-result">
               <p>Tu predicción: <strong class="champion-result__team">${a.team_name}</strong></p>
               <p>Puntos ganados: <strong>${a.points_earned}</strong></p>
               ${n?"":'<p class="notice">No puedes cambiar la predicción una vez enviada.</p>'}
             </div>`:n?'<p class="notice">El torneo ya ha comenzado. No es posible predecir el campeón.</p>':`<form class="form champion-form" id="championForm">
                 <div class="form__group">
                   <label class="form__label" for="teamSearch">Selecciona el equipo campeón</label>
                   <input class="form__input" type="text" id="teamSearch" placeholder="Escribe para buscar…"
                     list="teamsList" autocomplete="off" required />
                   <datalist id="teamsList">
                     ${oe.map(s=>`<option value="${s}">`).join("")}
                   </datalist>
                 </div>
                 <p id="champError" class="form__error hidden"></p>
                 <button class="btn btn--primary" type="submit" id="champBtn">Confirmar predicción</button>
               </form>`}
      </div>
    `,(t=document.getElementById("championForm"))==null||t.addEventListener("submit",async s=>{s.preventDefault();const i=document.getElementById("champBtn"),r=document.getElementById("champError"),o=document.getElementById("teamSearch").value.trim();if(o){i.disabled=!0,i.textContent="Guardando…",r.classList.add("hidden");try{await m.predictions.saveChampion(o),p(`¡${o} guardado como campeón!`),q(e)}catch(c){r.textContent=c.message,r.classList.remove("hidden"),i.disabled=!1,i.textContent="Confirmar predicción"}}})}catch(a){e.innerHTML=`<div class="container"><p class="form__error">Error: ${a.message}</p></div>`}}async function ce(e){if(!h.isAdmin()){e.innerHTML='<div class="container"><p class="form__error">Acceso denegado.</p></div>';return}e.innerHTML='<div class="loading"><div class="loading__spinner"></div></div>';try{const{users:t}=await m.auth.users();e.innerHTML=`
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
              ${t.map(de).join("")}
            </tbody>
          </table>
        </section>
      </div>
    `,document.getElementById("btnSync").addEventListener("click",async()=>{const a=document.getElementById("syncResult");a.textContent="Sincronizando…";try{await m.matches.sync(),a.textContent="✓ Sincronización completada",p("Sincronización completada")}catch(n){a.textContent=`Error: ${n.message}`,p(n.message,"error")}}),document.getElementById("awardForm").addEventListener("submit",async a=>{a.preventDefault();const n=document.getElementById("winnerTeam").value.trim();if(n)try{const{message:s}=await m.predictions.awardChampion(n);p(s)}catch(s){p(s.message,"error")}}),document.getElementById("usersTableBody").addEventListener("click",async a=>{const n=a.target.closest(".toggle-admin");if(!n)return;const s=parseInt(n.dataset.id);try{const{user:i}=await m.auth.toggleAdmin(s);n.closest("tr").querySelector(".admin-badge").textContent=i.is_admin?"Sí":"No",p(`${i.username} ${i.is_admin?"ahora es admin":"ya no es admin"}`)}catch(i){p(i.message,"error")}})}catch(t){e.innerHTML=`<div class="container"><p class="form__error">Error: ${t.message}</p></div>`}}function de(e){return`
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
  `}function le(e){e.innerHTML=`
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
  `,document.getElementById("forgotForm").addEventListener("submit",async t=>{t.preventDefault();const a=document.getElementById("forgotBtn"),n=document.getElementById("forgotMsg"),s=document.getElementById("email").value.trim();a.disabled=!0,a.textContent="Enviando…";try{await m.auth.forgotPassword(s),n.textContent="Si el email existe, recibirás un enlace en breve.",n.classList.remove("hidden","form__error"),n.classList.add("form__success")}catch{p("Error al enviar el email","error")}finally{a.disabled=!1,a.textContent="Enviar enlace"}})}function me(e,{query:t}){const a=t.token||"";if(!a){e.innerHTML='<div class="container"><p class="form__error">Token inválido o expirado.</p><a href="#/login">Volver</a></div>';return}e.innerHTML=`
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
  `,document.getElementById("resetForm").addEventListener("submit",async n=>{n.preventDefault();const s=document.getElementById("resetBtn"),i=document.getElementById("resetError"),r=document.getElementById("password").value;s.disabled=!0,s.textContent="Guardando…",i.classList.add("hidden");try{await m.auth.resetPassword(a,r),p("Contraseña actualizada. Ya puedes iniciar sesión."),_.navigate("/login")}catch(o){i.textContent=o.message||"Error al restablecer la contraseña",i.classList.remove("hidden")}finally{s.disabled=!1,s.textContent="Guardar contraseña"}})}const ue={r32:"Dieciseisavos",r16:"Octavos",quarters:"Cuartos",semis:"Semis",third:"3º y 4º",final:"Final"};async function pe(e){e.innerHTML='<div class="loading"><div class="loading__spinner"></div></div>';try{const{groups:t}=await m.matches.grouped();e.innerHTML=`
      <div class="container">
        <h1 class="page-title">Resultados — Mundial 2026</h1>
        <nav class="phase-nav" id="phaseNav"></nav>
        <div id="phaseContent"></div>
      </div>
    `,ge(t)}catch(t){e.innerHTML=`<div class="container"><p class="form__error">Error cargando los partidos: ${t.message}</p></div>`}}function ge(e){var i;const t=document.getElementById("phaseNav");if(!t)return;const a=e.filter(r=>r.phase==="group"),n=e.filter(r=>r.phase!=="group"),s=[...a.map(r=>({key:`group_${r.group_name}`,label:`Grupo ${r.group_name}`,data:r,isGroup:!0})),...n.map(r=>({key:r.phase,label:ue[r.phase]||r.label,data:r,isGroup:!1}))];s.length!==0&&(t.innerHTML=s.map((r,o)=>`
    <button class="phase-nav__btn ${o===0?"phase-nav__btn--active":""}" data-key="${r.key}">
      ${r.label}
    </button>
  `).join(""),(i=t.querySelector(".phase-nav__btn--active"))==null||i.scrollIntoView({inline:"center",behavior:"instant",block:"nearest"}),t.querySelectorAll(".phase-nav__btn").forEach((r,o)=>{r.addEventListener("click",()=>{t.querySelectorAll(".phase-nav__btn").forEach(d=>d.classList.remove("phase-nav__btn--active")),r.classList.add("phase-nav__btn--active");const c=s.find(d=>d.key===r.dataset.key);c&&x(c.data,c.isGroup)})}),x(s[0].data,s[0].isGroup))}function x(e,t){const a=document.getElementById("phaseContent");if(!a)return;const n=he(e.matches);if(t){const s=ve(e.matches);a.innerHTML=`
      <div class="resultados-section">
        <div class="resultados-matches">${n}</div>
        <div class="standings">
          <h3 class="standings__title">Clasificación — Grupo ${e.group_name}</h3>
          ${_e(s)}
        </div>
      </div>
    `}else a.innerHTML=`<div class="resultados-matches">${n}</div>`}function he(e){return!e||e.length===0?'<p class="empty">Sin partidos en esta fase.</p>':e.map(t=>{const a={scheduled:"Programado",live:"🔴 En juego",finished:"Finalizado"}[t.status]||t.status,n=t.status!=="scheduled"?`<span class="res-score">${t.home_score_90??"?"} - ${t.away_score_90??"?"}</span>`:'<span class="res-score res-score--pending">vs</span>';return`
      <div class="res-match ${t.status==="finished"?"res-match--finished":""} ${t.status==="live"?"res-match--live":""}">
        <div class="res-match__meta">
          <span class="res-match__status">${a}</span>
          <span class="res-match__date">${S(t.match_datetime)}</span>
        </div>
        <div class="res-match__teams">
          <span class="res-match__team res-match__team--home">${t.home_team}</span>
          ${n}
          <span class="res-match__team res-match__team--away">${t.away_team}</span>
        </div>
      </div>
    `}).join("")}function ve(e){const t={};for(const a of e)if(t[a.home_team]||(t[a.home_team]={name:a.home_team,pj:0,g:0,e:0,p:0,gf:0,gc:0,pts:0}),t[a.away_team]||(t[a.away_team]={name:a.away_team,pj:0,g:0,e:0,p:0,gf:0,gc:0,pts:0}),a.status==="finished"&&a.home_score_90!==null&&a.away_score_90!==null){const n=t[a.home_team],s=t[a.away_team];n.pj++,s.pj++,n.gf+=a.home_score_90,n.gc+=a.away_score_90,s.gf+=a.away_score_90,s.gc+=a.home_score_90,a.home_score_90>a.away_score_90?(n.g++,n.pts+=3,s.p++):a.home_score_90<a.away_score_90?(s.g++,s.pts+=3,n.p++):(n.e++,n.pts++,s.e++,s.pts++)}return Object.values(t).sort((a,n)=>{if(n.pts!==a.pts)return n.pts-a.pts;const s=n.gf-n.gc,i=a.gf-a.gc;return s!==i?s-i:n.gf-a.gf})}function _e(e){return e.length===0?'<p class="empty">Sin datos de clasificación.</p>':`
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
  `}async function be(e,{query:t}){const a=(t.codigo||"").trim().toUpperCase();if(!a){e.innerHTML='<div class="container"><p class="form__error">Enlace de invitación inválido.</p><a href="#/ligas">Ver ligas</a></div>';return}if(!h.isLoggedIn()){sessionStorage.setItem("pendingInviteCode",a),_.navigate("/register");return}e.innerHTML='<div class="loading"><div class="loading__spinner"></div></div>';try{const{league:n}=await m.leagues.joinByCode(a);p(`¡Te has unido a "${n.name}"!`),_.navigate(`/ligas/${n.id}`)}catch(n){if(n.status===409){p("Ya eres miembro de esta liga");try{const{leagues:s}=await m.leagues.my(),i=s.find(r=>r.invite_code===a);if(i){_.navigate(`/ligas/${i.id}`);return}}catch{}}e.innerHTML=`
      <div class="container">
        <div class="league-gate">
          <div class="league-gate__icon">⚠️</div>
          <h2 class="league-gate__title">Error al unirse</h2>
          <p class="league-gate__text">${n.message}</p>
          <a href="#/ligas" class="btn btn--primary">Ver ligas</a>
        </div>
      </div>
    `}}const fe={"/":G,"/login":F,"/register":z,"/quiniela":J,"/resultados":pe,"/ranking":Z,"/tablon":ee,"/ligas":ae,"/ligas/:id":se,"/perfil":ie,"/campeon":q,"/admin":ce,"/forgot-password":le,"/reset-password":me,"/unirse":be};function ye(e){for(const[t,a]of Object.entries(fe)){const n=[],s=new RegExp("^"+t.replace(/:([^/]+)/g,(r,o)=>(n.push(o),"([^/]+)"))+"$"),i=e.match(s);if(i){const r={};return n.forEach((o,c)=>{r[o]=i[c+1]}),{handler:a,params:r}}}return null}const H=()=>document.getElementById("mainContent"),_={init(){window.addEventListener("hashchange",()=>this.resolve()),this.resolve()},navigate(e){window.location.hash=e},resolve(){const e=window.location.hash.slice(1)||"/",[t,a]=e.split("?"),n=Object.fromEntries(new URLSearchParams(a||"")),s=ye(t);if(!s){H().innerHTML='<div class="error-page"><h2>Página no encontrada</h2><a href="#/">Volver al inicio</a></div>';return}const{handler:i,params:r}=s;if(["/perfil","/campeon","/admin"].includes(t)&&!h.isLoggedIn()){this.navigate("/login");return}if(t==="/admin"&&!h.isAdmin()){this.navigate("/");return}const c=H();c.innerHTML='<div class="loading"><div class="loading__spinner"></div></div>',i(c,{params:r,query:n})}};let E=[],L=null;async function Ee(){await h.init(),_.init(),we(),$e()}function $e(){window.addEventListener("beforeinstallprompt",e=>{e.preventDefault(),L=e,Le()})}function Le(){if(sessionStorage.getItem("installBannerDismissed"))return;const e=document.createElement("div");e.id="installBanner",e.className="install-banner",e.innerHTML=`
    <span class="install-banner__text">⚽ Instala PickGoal en tu dispositivo</span>
    <div class="install-banner__actions">
      <button class="install-banner__btn install-banner__btn--primary" id="installBtn">Instalar</button>
      <button class="install-banner__btn install-banner__btn--ghost" id="installDismissBtn">Ahora no</button>
    </div>
  `,document.body.appendChild(e),document.getElementById("installBtn").addEventListener("click",async()=>{L&&(L.prompt(),await L.userChoice,L=null,e.remove())}),document.getElementById("installDismissBtn").addEventListener("click",()=>{sessionStorage.setItem("installBannerDismissed","1"),e.remove()})}function f(){var e,t,a,n;(e=document.getElementById("leagueDropdown"))==null||e.classList.add("hidden"),(t=document.getElementById("leagueBtn"))==null||t.classList.remove("navbar__dropdown-btn--open"),(a=document.getElementById("userDropdown"))==null||a.classList.add("hidden"),(n=document.getElementById("userBtn"))==null||n.classList.remove("navbar__dropdown-btn--open")}function we(){var e,t,a,n,s;document.addEventListener("auth:change",N),window.addEventListener("hashchange",()=>{f(),A()}),document.addEventListener("click",f),(e=document.getElementById("leagueBtn"))==null||e.addEventListener("click",i=>{var c;i.stopPropagation();const r=document.getElementById("leagueDropdown"),o=r==null?void 0:r.classList.contains("hidden");f(),o&&(r==null||r.classList.remove("hidden"),(c=document.getElementById("leagueBtn"))==null||c.classList.add("navbar__dropdown-btn--open"))}),(t=document.getElementById("leagueDropdown"))==null||t.addEventListener("click",i=>{i.stopPropagation();const r=i.target.closest("[data-league-id]");if(r){localStorage.setItem("activeLeagueId",r.dataset.leagueId),f(),D(E);return}i.target.closest("a")&&f()}),(a=document.getElementById("userBtn"))==null||a.addEventListener("click",i=>{var c;i.stopPropagation();const r=document.getElementById("userDropdown"),o=r==null?void 0:r.classList.contains("hidden");f(),o&&(r==null||r.classList.remove("hidden"),(c=document.getElementById("userBtn"))==null||c.classList.add("navbar__dropdown-btn--open"))}),(n=document.getElementById("userDropdown"))==null||n.addEventListener("click",i=>{i.stopPropagation(),i.target.closest("#navProfileLink")&&f()}),(s=document.getElementById("navLogoutBtn"))==null||s.addEventListener("click",()=>{E=[],localStorage.removeItem("activeLeagueId"),f(),h.logout(),_.navigate("/")}),N()}async function N(){const e=document.getElementById("navAuthLinks"),t=document.getElementById("userBtn"),a=document.getElementById("navUsername"),n=document.getElementById("navLeague"),s=document.getElementById("bottomNav"),i=h.getUser();if(f(),i){e==null||e.classList.add("hidden"),a&&(a.textContent=i.username),n.style.visibility="visible",t.style.visibility="visible",s==null||s.classList.remove("hidden"),document.body.classList.add("has-bottom-nav");try{const{leagues:r}=await m.leagues.my();E=r}catch{E=[]}D(E)}else e==null||e.classList.remove("hidden"),n.style.visibility="hidden",t.style.visibility="hidden",s==null||s.classList.add("hidden"),document.body.classList.remove("has-bottom-nav"),E=[],localStorage.removeItem("activeLeagueId");A()}function D(e){const t=document.getElementById("leagueDropdown"),a=document.getElementById("navLeagueName");if(!t||!a)return;let n=localStorage.getItem("activeLeagueId"),s=e.find(r=>String(r.id)===String(n));!s&&e.length>0&&(s=e[0],localStorage.setItem("activeLeagueId",String(s.id))),s||localStorage.removeItem("activeLeagueId"),a.textContent=s?s.name:"Inicia Liga";const i=e.map(r=>`
    <button class="navbar__dropdown-item ${String(r.id)===String(s==null?void 0:s.id)?"navbar__dropdown-item--active":""}" data-league-id="${r.id}">${r.name}</button>
  `).join("");t.innerHTML=`
    ${i}
    <a href="#/ligas" class="navbar__dropdown-item navbar__dropdown-item--muted">
      <svg viewBox="0 0 24 24" fill="currentColor" width="13" height="13" aria-hidden="true"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/></svg>
      Ver ligas disponibles
    </a>
  `}function A(){const e=window.location.hash.slice(1).split("?")[0]||"/";document.querySelectorAll(".bottom-nav__item").forEach(t=>{const a=t.dataset.route,n=a==="/"?e==="/":e===a||e.startsWith(a+"/");t.classList.toggle("bottom-nav__item--active",n)})}Ee();
