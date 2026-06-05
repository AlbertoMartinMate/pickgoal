(function(){const a=document.createElement("link").relList;if(a&&a.supports&&a.supports("modulepreload"))return;for(const n of document.querySelectorAll('link[rel="modulepreload"]'))s(n);new MutationObserver(n=>{for(const i of n)if(i.type==="childList")for(const r of i.addedNodes)r.tagName==="LINK"&&r.rel==="modulepreload"&&s(r)}).observe(document,{childList:!0,subtree:!0});function t(n){const i={};return n.integrity&&(i.integrity=n.integrity),n.referrerPolicy&&(i.referrerPolicy=n.referrerPolicy),n.crossOrigin==="use-credentials"?i.credentials="include":n.crossOrigin==="anonymous"?i.credentials="omit":i.credentials="same-origin",i}function s(n){if(n.ep)return;n.ep=!0;const i=t(n);fetch(n.href,i)}})();const B="https://pickgoal-backend.onrender.com/api";function M(){return localStorage.getItem("token")}async function l(e,a={}){const t={"Content-Type":"application/json",...a.headers},s=M();s&&(t.Authorization=`Bearer ${s}`);const n=await fetch(`${B}${e}`,{...a,headers:t}),i=await n.json().catch(()=>({}));if(!n.ok)throw{status:n.status,message:i.error||"Error desconocido"};return i}const m={get:e=>l(e),post:(e,a)=>l(e,{method:"POST",body:JSON.stringify(a)}),patch:(e,a)=>l(e,{method:"PATCH",body:JSON.stringify(a)}),delete:e=>l(e,{method:"DELETE"}),auth:{register:e=>l("/auth/register",{method:"POST",body:JSON.stringify(e)}),login:e=>l("/auth/login",{method:"POST",body:JSON.stringify(e)}),me:()=>l("/auth/me"),forgotPassword:e=>l("/auth/forgot-password",{method:"POST",body:JSON.stringify({email:e})}),resetPassword:(e,a)=>l("/auth/reset-password",{method:"POST",body:JSON.stringify({token:e,password:a})}),ranking:()=>l("/auth/ranking"),users:()=>l("/auth/users"),toggleAdmin:e=>l(`/auth/users/${e}/toggle-admin`,{method:"PATCH"})},matches:{grouped:()=>l("/matches/grouped"),list:(e="")=>l(`/matches/${e}`),get:e=>l(`/matches/${e}`),sync:()=>l("/matches/sync",{method:"POST"})},predictions:{mine:()=>l("/predictions/"),forMatch:e=>l(`/predictions/match/${e}`),save:e=>l("/predictions/",{method:"POST",body:JSON.stringify(e)}),getChampion:()=>l("/predictions/champion"),saveChampion:e=>l("/predictions/champion",{method:"POST",body:JSON.stringify({team_name:e})}),awardChampion:e=>l("/predictions/champion/award",{method:"POST",body:JSON.stringify({team_name:e})})},leagues:{public:()=>l("/leagues/public"),my:()=>l("/leagues/my"),create:e=>l("/leagues/",{method:"POST",body:JSON.stringify(e)}),join:e=>l("/leagues/join",{method:"POST",body:JSON.stringify(e)}),get:e=>l(`/leagues/${e}`),leave:e=>l(`/leagues/${e}/leave`,{method:"DELETE"}),matchPredictions:(e,a)=>l(`/leagues/${e}/predictions/${a}`)},board:{messages:(e=1)=>l(`/board/?page=${e}`),post:e=>l("/board/",{method:"POST",body:JSON.stringify({message:e})}),delete:e=>l(`/board/${e}`,{method:"DELETE"})}};let h=null;const p={async init(){if(localStorage.getItem("token"))try{const{user:a}=await m.auth.me();h=a}catch{localStorage.removeItem("token")}},setUser(e,a){h=e,localStorage.setItem("token",a),document.dispatchEvent(new CustomEvent("auth:change",{detail:e}))},logout(){h=null,localStorage.removeItem("token"),document.dispatchEvent(new CustomEvent("auth:change",{detail:null}))},getUser(){return h},isLoggedIn(){return!!h},isAdmin(){return(h==null?void 0:h.is_admin)===!0}};function x(e){const a=p.getUser();e.innerHTML=`
    <section class="hero">
      <div class="hero__content">
        <img src="/assets/logo-completo.jpg" alt="PickGoal" class="hero__logo-img" />
        ${a?`<div class="hero__cta">
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
  `}let _=null;function u(e,a="success"){let t=document.getElementById("toast");t||(t=document.createElement("div"),t.id="toast",document.body.appendChild(t)),t.textContent=e,t.className=`toast toast--${a} toast--visible`,_&&clearTimeout(_),_=setTimeout(()=>{t.classList.remove("toast--visible")},3e3)}function P(e){return e?new Date(e).toLocaleString("es-ES",{day:"2-digit",month:"2-digit",year:"numeric",hour:"2-digit",minute:"2-digit"}):"—"}function k(e){e.innerHTML=`
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
  `,document.getElementById("loginForm").addEventListener("submit",async a=>{a.preventDefault();const t=document.getElementById("loginBtn"),s=document.getElementById("loginError"),n=document.getElementById("identifier").value.trim(),i=document.getElementById("password").value;t.disabled=!0,t.textContent="Entrando…",s.classList.add("hidden");try{const{token:r,user:o}=await m.auth.login({identifier:n,password:i});p.setUser(o,r),u(`¡Bienvenido, ${o.username}!`),g.navigate("/quiniela")}catch(r){s.textContent=r.message||"Error al iniciar sesión",s.classList.remove("hidden")}finally{t.disabled=!1,t.textContent="Entrar"}})}function H(e){e.innerHTML=`
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
  `,document.getElementById("registerForm").addEventListener("submit",async a=>{a.preventDefault();const t=document.getElementById("registerBtn"),s=document.getElementById("registerError");t.disabled=!0,t.textContent="Creando cuenta…",s.classList.add("hidden");const n={username:document.getElementById("username").value.trim(),email:document.getElementById("email").value.trim(),country:document.getElementById("country").value.trim(),password:document.getElementById("password").value};try{const{token:i,user:r}=await m.auth.register(n);p.setUser(r,i),u("¡Cuenta creada! Bienvenido a PickGoal"),g.navigate("/campeon")}catch(i){s.textContent=i.message||"Error al registrarse",s.classList.remove("hidden")}finally{t.disabled=!1,t.textContent="Crear cuenta"}})}async function N(e){e.innerHTML='<div class="loading"><div class="loading__spinner"></div></div>';try{const[{groups:a},t]=await Promise.all([m.matches.grouped(),p.isLoggedIn()?m.predictions.mine():Promise.resolve({predictions:[]})]),s={};for(const r of t.predictions)s[r.match_id]=r;e.innerHTML=`
      <div class="container">
        <h1 class="page-title">Quiniela — Mundial 2026</h1>
        ${p.isLoggedIn()?"":'<p class="notice">⚠️ <a href="#/login">Inicia sesión</a> para guardar tus predicciones.</p>'}
        <div id="quinielaContent"></div>
      </div>
    `;const n=document.getElementById("quinielaContent"),i=["group","r32","r16","quarters","semis","third","final"];a.forEach(r=>{const o=document.createElement("section");o.className="phase-section";const c=r.group_name?`${r.label} — Grupo ${r.group_name}`:r.label;o.innerHTML=`<h2 class="phase-section__title">${c}</h2>
        <div class="matches-grid">${r.matches.map(d=>q(d,s[d.id])).join("")}</div>`,n.appendChild(o),p.isLoggedIn()&&o.querySelectorAll(".prediction-form").forEach(d=>{j(d,s)})}),p.isLoggedIn()&&O(a,s)}catch(a){e.innerHTML=`<div class="container"><p class="form__error">Error cargando los partidos: ${a.message}</p></div>`}}function q(e,a){const t=e.is_locked,s=a?`<span class="pts-badge">${a.total_points} pts</span>`:"",n={scheduled:"Programado",live:"🔴 En juego",finished:"Finalizado"}[e.status];return`
    <div class="match-card ${t?"match-card--locked":""}" data-match-id="${e.id}">
      <div class="match-card__header">
        <span class="match-card__status">${n}</span>
        <span class="match-card__date">${P(e.match_datetime)}</span>
        ${s}
      </div>
      <div class="match-card__teams">
        <span class="team team--home">${e.home_team}</span>
        <div class="match-card__score">
          ${e.status!=="scheduled"?`<span class="score">${e.home_score_90??"?"} - ${e.away_score_90??"?"}</span>`:'<span class="score score--dash">vs</span>'}
        </div>
        <span class="team team--away">${e.away_team}</span>
      </div>
      ${!t&&p.isLoggedIn()?A(e,a):t&&a?`<div class="prediction-result">
               Tu predicción: <strong>${a.predicted_home}-${a.predicted_away}</strong>
               (${a.predicted_result}) · ${a.total_points} pts
             </div>`:""}
    </div>
  `}function A(e,a){const t=(a==null?void 0:a.predicted_home)??0,s=(a==null?void 0:a.predicted_away)??0,n=(a==null?void 0:a.predicted_result)??"X";return`
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
          value="${t}" placeholder="0" required />
        <span>-</span>
        <input type="number" name="predicted_away" class="score-input" min="0" max="30"
          value="${s}" placeholder="0" required />
      </div>
      <button type="submit" class="btn btn--primary btn--sm">Guardar</button>
    </form>
  `}async function O(e,a){const t=e.flatMap(s=>s.matches).filter(s=>!s.is_locked&&!a[s.id]);for(const s of t)try{const{prediction:n}=await m.predictions.save({match_id:s.id,predicted_result:"X",predicted_home:0,predicted_away:0});a[s.id]=n}catch{}}function j(e,a){e.addEventListener("submit",async t=>{var c;t.preventDefault();const s=parseInt(e.dataset.matchId),n=parseInt(e.querySelector("[name=predicted_home]").value),i=parseInt(e.querySelector("[name=predicted_away]").value),r=(c=e.querySelector("[name=predicted_result]:checked"))==null?void 0:c.value;if(isNaN(n)||isNaN(i)||!r)return;const o=e.querySelector("button");o.disabled=!0,o.textContent="…";try{const{prediction:d}=await m.predictions.save({match_id:s,predicted_result:r,predicted_home:n,predicted_away:i});a[s]=d,u("Predicción guardada"),o.textContent="✓ Guardado",setTimeout(()=>{o.disabled=!1,o.textContent="Guardar"},2e3)}catch(d){u(d.message||"Error al guardar","error"),o.disabled=!1,o.textContent="Guardar"}})}async function R(e){e.innerHTML='<div class="loading"><div class="loading__spinner"></div></div>';try{const{ranking:a}=await m.auth.ranking(),t=p.getUser();e.innerHTML=`
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
              ${a.map(s=>`
                <tr class="${t&&s.id===t.id?"ranking-table__row--me":""}">
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
    `}catch(a){e.innerHTML=`<div class="container"><p class="form__error">Error: ${a.message}</p></div>`}}async function U(e){e.innerHTML='<div class="loading"><div class="loading__spinner"></div></div>';let a=1,t=1;async function s(){const{messages:o,pages:c}=await m.board.messages(a);return t=c,o}try{const o=await s();n(o)}catch(o){e.innerHTML=`<div class="container"><p class="form__error">Error: ${o.message}</p></div>`}function n(o){var d,f,y;const c=p.getUser();e.innerHTML=`
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
    `,(d=document.getElementById("boardForm"))==null||d.addEventListener("submit",async v=>{v.preventDefault();const E=document.getElementById("boardMsg"),$=E.value.trim();if($)try{await m.board.post($),E.value="";const b=await s();document.getElementById("boardMessages").innerHTML=i(b,c),r(c),u("Mensaje publicado")}catch(b){u(b.message,"error")}}),(f=document.getElementById("prevPage"))==null||f.addEventListener("click",async()=>{a--;const v=await s();document.getElementById("boardMessages").innerHTML=i(v,c),r(c)}),(y=document.getElementById("nextPage"))==null||y.addEventListener("click",async()=>{a++;const v=await s();document.getElementById("boardMessages").innerHTML=i(v,c),r(c)}),r(c)}function i(o,c){return o.length?o.map(d=>`
      <div class="board-message ${d.is_deleted?"board-message--deleted":""}" data-id="${d.id}">
        <div class="board-message__header">
          <strong>${d.username}</strong>
          <span class="board-message__date">${P(d.created_at)}</span>
          ${!d.is_deleted&&c&&(c.id===d.user_id||c.is_admin)?`<button class="btn btn--danger btn--xs delete-msg" data-id="${d.id}">✕</button>`:""}
        </div>
        <p class="board-message__text">${F(d.message)}</p>
      </div>
    `).join(""):'<p class="empty">Sin mensajes aún. ¡Sé el primero!</p>'}function r(o){e.querySelectorAll(".delete-msg").forEach(c=>{c.addEventListener("click",async()=>{if(confirm("¿Eliminar este mensaje?"))try{await m.board.delete(c.dataset.id);const d=await s();document.getElementById("boardMessages").innerHTML=i(d,o),r(o),u("Mensaje eliminado")}catch(d){u(d.message,"error")}})})}}function F(e){return e.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;")}async function D(e){var a,t;e.innerHTML='<div class="loading"><div class="loading__spinner"></div></div>';try{const[s,n]=await Promise.all([m.leagues.public(),p.isLoggedIn()?m.leagues.my():Promise.resolve({leagues:[]})]),i=p.getUser();e.innerHTML=`
      <div class="container">
        <h1 class="page-title">Ligas</h1>

        ${i?`
          <section class="section">
            <h2>Mis ligas</h2>
            ${n.leagues.length?`<div class="leagues-grid">${n.leagues.map(L).join("")}</div>`:'<p class="empty">No perteneces a ninguna liga aún.</p>'}
          </section>

          <section class="section">
            <h2>Unirse con código</h2>
            <form class="form form--inline" id="joinCodeForm">
              <input class="form__input" type="text" id="inviteCode" placeholder="Código de invitación" maxlength="20" />
              <button class="btn btn--primary" type="submit">Unirse</button>
            </form>
          </section>

          <section class="section">
            <h2>Crear nueva liga</h2>
            <form class="form" id="createLeagueForm">
              <div class="form__group">
                <label class="form__label" for="leagueName">Nombre</label>
                <input class="form__input" type="text" id="leagueName" placeholder="Mi Liga Épica" required maxlength="100" />
              </div>
              <div class="form__group form__group--checkbox">
                <input type="checkbox" id="isPublic" />
                <label for="isPublic">Liga pública (visible para todos)</label>
              </div>
              <button class="btn btn--primary" type="submit">Crear liga</button>
            </form>
          </section>
        `:'<p class="notice"><a href="#/login">Inicia sesión</a> para crear o unirte a ligas.</p>'}

        <section class="section">
          <h2>Ligas públicas</h2>
          ${s.leagues.length?`<div class="leagues-grid">${s.leagues.map(L).join("")}</div>`:'<p class="empty">No hay ligas públicas aún.</p>'}
        </section>
      </div>
    `,e.querySelectorAll(".league-card").forEach(r=>{r.addEventListener("click",()=>{g.navigate(`/ligas/${r.dataset.id}`)})}),(a=document.getElementById("joinCodeForm"))==null||a.addEventListener("submit",async r=>{r.preventDefault();const o=document.getElementById("inviteCode").value.trim().toUpperCase();if(o)try{const{league:c}=await m.leagues.join({invite_code:o});u(`Te has unido a "${c.name}"`),g.navigate(`/ligas/${c.id}`)}catch(c){u(c.message,"error")}}),(t=document.getElementById("createLeagueForm"))==null||t.addEventListener("submit",async r=>{r.preventDefault();const o=document.getElementById("leagueName").value.trim(),c=document.getElementById("isPublic").checked;try{const{league:d}=await m.leagues.create({name:o,is_public:c});u(`Liga "${d.name}" creada`),g.navigate(`/ligas/${d.id}`)}catch(d){u(d.message,"error")}})}catch(s){e.innerHTML=`<div class="container"><p class="form__error">Error: ${s.message}</p></div>`}}function L(e){return`
    <div class="league-card" data-id="${e.id}">
      <div class="league-card__name">${e.name}</div>
      <div class="league-card__meta">
        <span>${e.is_public?"🌍 Pública":"🔒 Privada"}</span>
        <span>${e.member_count} participantes</span>
      </div>
      <div class="league-card__creator">por ${e.creator_username}</div>
    </div>
  `}async function z(e,{params:a}){var s,n;const t=parseInt(a.id);e.innerHTML='<div class="loading"><div class="loading__spinner"></div></div>';try{const{league:i,ranking:r,is_member:o}=await m.leagues.get(t),c=p.getUser();e.innerHTML=`
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
    `,(s=document.getElementById("btnLeave"))==null||s.addEventListener("click",async()=>{if(confirm("¿Seguro que quieres abandonar esta liga?"))try{await m.leagues.leave(t),u("Has abandonado la liga"),g.navigate("/ligas")}catch(d){u(d.message,"error")}}),(n=document.getElementById("btnJoin"))==null||n.addEventListener("click",async()=>{try{await m.leagues.join({league_id:t}),u("¡Te has unido a la liga!"),g.navigate(`/ligas/${t}`)}catch(d){u(d.message,"error")}})}catch(i){e.innerHTML=`<div class="container"><p class="form__error">Error: ${i.message}</p><a href="#/ligas">Volver</a></div>`}}async function G(e){var t,s;e.innerHTML='<div class="loading"><div class="loading__spinner"></div></div>';const a=p.getUser();try{const[n,i,r]=await Promise.all([m.predictions.mine(),m.predictions.getChampion(),m.leagues.my()]),o=n.predictions.reduce((c,d)=>c+d.total_points,0)+(((t=i.champion_prediction)==null?void 0:t.points_earned)||0);e.innerHTML=`
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
          ${n.predictions.length?`<div class="predictions-list">${n.predictions.map(J).join("")}</div>`:'<p class="empty">Sin predicciones aún. <a href="#/quiniela">Ir a la quiniela</a></p>'}
        </section>

        <section class="section">
          <h2>Mis ligas</h2>
          ${r.leagues.length?`<ul class="leagues-list">${r.leagues.map(c=>`<li><a href="#/ligas/${c.id}">${c.name}</a> <span class="tag">${c.is_public?"Pública":"Privada"}</span></li>`).join("")}</ul>`:'<p class="empty">No perteneces a ninguna liga. <a href="#/ligas">Ver ligas</a></p>'}
        </section>
      </div>
    `,(s=e.querySelector("#btnLogoutPerfil"))==null||s.addEventListener("click",()=>{p.logout(),window.location.hash="/"})}catch(n){e.innerHTML=`<div class="container"><p class="form__error">Error: ${n.message}</p></div>`}}function J(e){return`
    <div class="pred-row ${e.total_points>0?"pred-row--scored":""}">
      <span class="pred-row__result">${e.predicted_result}</span>
      <span class="pred-row__score">${e.predicted_home}-${e.predicted_away}</span>
      <span class="pred-row__pts">${e.total_points} pts</span>
    </div>
  `}const w=new Date("2026-06-11T00:00:00Z"),V=["Argentina","Brasil","Francia","España","Inglaterra","Alemania","Portugal","Países Bajos","Italia","Bélgica","Uruguay","Colombia","México","Estados Unidos","Canadá","Marruecos","Senegal","Nigeria","Japón","Corea del Sur","Australia","Arabia Saudí","Irán","Qatar","Ecuador","Chile","Perú","Venezuela","Bolivia","Paraguay","Costa Rica","Honduras","Panamá","Jamaica","Trinidad y Tobago","Guatemala","Turquía","Polonia","Croacia","Serbia","República Checa","Eslovaquia","Austria","Suiza","Dinamarca","Suecia","Noruega","Escocia","Ucrania","Rumanía","Hungría","Grecia","Egipto","Camerún","Ghana","Costa de Marfil","Túnez","Argelia","China","India","Irak","Uzbekistán","Nueva Zelanda","Fiji"];async function T(e){var a;if(!p.isLoggedIn()){e.innerHTML='<div class="container"><p class="notice"><a href="#/login">Inicia sesión</a> para predecir el campeón.</p></div>';return}e.innerHTML='<div class="loading"><div class="loading__spinner"></div></div>';try{const{champion_prediction:t}=await m.predictions.getChampion(),s=new Date>=w;e.innerHTML=`
      <div class="container">
        <h1 class="page-title">🏆 Predice el Campeón</h1>
        <p class="champion-desc">
          Acertar el campeón del mundo vale <strong>10 puntos extra</strong>.
          Solo puedes predecirlo una vez y antes del inicio del torneo
          (${w.toLocaleDateString("es-ES",{day:"numeric",month:"long",year:"numeric"})}).
        </p>

        ${t?`<div class="champion-result">
               <p>Tu predicción: <strong class="champion-result__team">${t.team_name}</strong></p>
               <p>Puntos ganados: <strong>${t.points_earned}</strong></p>
               ${s?"":'<p class="notice">No puedes cambiar la predicción una vez enviada.</p>'}
             </div>`:s?'<p class="notice">El torneo ya ha comenzado. No es posible predecir el campeón.</p>':`<form class="form champion-form" id="championForm">
                 <div class="form__group">
                   <label class="form__label" for="teamSearch">Selecciona el equipo campeón</label>
                   <input class="form__input" type="text" id="teamSearch" placeholder="Escribe para buscar…"
                     list="teamsList" autocomplete="off" required />
                   <datalist id="teamsList">
                     ${V.map(n=>`<option value="${n}">`).join("")}
                   </datalist>
                 </div>
                 <p id="champError" class="form__error hidden"></p>
                 <button class="btn btn--primary" type="submit" id="champBtn">Confirmar predicción</button>
               </form>`}
      </div>
    `,(a=document.getElementById("championForm"))==null||a.addEventListener("submit",async n=>{n.preventDefault();const i=document.getElementById("champBtn"),r=document.getElementById("champError"),o=document.getElementById("teamSearch").value.trim();if(o){i.disabled=!0,i.textContent="Guardando…",r.classList.add("hidden");try{await m.predictions.saveChampion(o),u(`¡${o} guardado como campeón!`),T(e)}catch(c){r.textContent=c.message,r.classList.remove("hidden"),i.disabled=!1,i.textContent="Confirmar predicción"}}})}catch(t){e.innerHTML=`<div class="container"><p class="form__error">Error: ${t.message}</p></div>`}}async function Q(e){if(!p.isAdmin()){e.innerHTML='<div class="container"><p class="form__error">Acceso denegado.</p></div>';return}e.innerHTML='<div class="loading"><div class="loading__spinner"></div></div>';try{const{users:a}=await m.auth.users();e.innerHTML=`
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
              ${a.map(X).join("")}
            </tbody>
          </table>
        </section>
      </div>
    `,document.getElementById("btnSync").addEventListener("click",async()=>{const t=document.getElementById("syncResult");t.textContent="Sincronizando…";try{await m.matches.sync(),t.textContent="✓ Sincronización completada",u("Sincronización completada")}catch(s){t.textContent=`Error: ${s.message}`,u(s.message,"error")}}),document.getElementById("awardForm").addEventListener("submit",async t=>{t.preventDefault();const s=document.getElementById("winnerTeam").value.trim();if(s)try{const{message:n}=await m.predictions.awardChampion(s);u(n)}catch(n){u(n.message,"error")}}),document.getElementById("usersTableBody").addEventListener("click",async t=>{const s=t.target.closest(".toggle-admin");if(!s)return;const n=parseInt(s.dataset.id);try{const{user:i}=await m.auth.toggleAdmin(n);s.closest("tr").querySelector(".admin-badge").textContent=i.is_admin?"Sí":"No",u(`${i.username} ${i.is_admin?"ahora es admin":"ya no es admin"}`)}catch(i){u(i.message,"error")}})}catch(a){e.innerHTML=`<div class="container"><p class="form__error">Error: ${a.message}</p></div>`}}function X(e){return`
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
  `}function Y(e){e.innerHTML=`
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
  `,document.getElementById("forgotForm").addEventListener("submit",async a=>{a.preventDefault();const t=document.getElementById("forgotBtn"),s=document.getElementById("forgotMsg"),n=document.getElementById("email").value.trim();t.disabled=!0,t.textContent="Enviando…";try{await m.auth.forgotPassword(n),s.textContent="Si el email existe, recibirás un enlace en breve.",s.classList.remove("hidden","form__error"),s.classList.add("form__success")}catch{u("Error al enviar el email","error")}finally{t.disabled=!1,t.textContent="Enviar enlace"}})}function W(e,{query:a}){const t=a.token||"";if(!t){e.innerHTML='<div class="container"><p class="form__error">Token inválido o expirado.</p><a href="#/login">Volver</a></div>';return}e.innerHTML=`
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
  `,document.getElementById("resetForm").addEventListener("submit",async s=>{s.preventDefault();const n=document.getElementById("resetBtn"),i=document.getElementById("resetError"),r=document.getElementById("password").value;n.disabled=!0,n.textContent="Guardando…",i.classList.add("hidden");try{await m.auth.resetPassword(t,r),u("Contraseña actualizada. Ya puedes iniciar sesión."),g.navigate("/login")}catch(o){i.textContent=o.message||"Error al restablecer la contraseña",i.classList.remove("hidden")}finally{n.disabled=!1,n.textContent="Guardar contraseña"}})}const Z={"/":x,"/login":k,"/register":H,"/quiniela":N,"/ranking":R,"/tablon":U,"/ligas":D,"/ligas/:id":z,"/perfil":G,"/campeon":T,"/admin":Q,"/forgot-password":Y,"/reset-password":W};function K(e){for(const[a,t]of Object.entries(Z)){const s=[],n=new RegExp("^"+a.replace(/:([^/]+)/g,(r,o)=>(s.push(o),"([^/]+)"))+"$"),i=e.match(n);if(i){const r={};return s.forEach((o,c)=>{r[o]=i[c+1]}),{handler:t,params:r}}}return null}const I=()=>document.getElementById("mainContent"),g={init(){window.addEventListener("hashchange",()=>this.resolve()),this.resolve()},navigate(e){window.location.hash=e},resolve(){const e=window.location.hash.slice(1)||"/",[a,t]=e.split("?"),s=Object.fromEntries(new URLSearchParams(t||"")),n=K(a);if(!n){I().innerHTML='<div class="error-page"><h2>Página no encontrada</h2><a href="#/">Volver al inicio</a></div>';return}const{handler:i,params:r}=n;if(["/perfil","/campeon","/admin"].includes(a)&&!p.isLoggedIn()){this.navigate("/login");return}if(a==="/admin"&&!p.isAdmin()){this.navigate("/");return}const c=I();c.innerHTML='<div class="loading"><div class="loading__spinner"></div></div>',i(c,{params:r,query:s})}};async function ee(){await p.init(),g.init(),ae()}function ae(){document.addEventListener("auth:change",C),window.addEventListener("hashchange",S),C()}function C(){const e=document.getElementById("navAuthLinks"),a=document.getElementById("navUsername"),t=document.getElementById("bottomNav"),s=p.getUser();s?(e==null||e.classList.add("hidden"),a==null||a.classList.remove("hidden"),a&&(a.textContent=s.username),t==null||t.classList.remove("hidden"),document.body.classList.add("has-bottom-nav")):(e==null||e.classList.remove("hidden"),a==null||a.classList.add("hidden"),t==null||t.classList.add("hidden"),document.body.classList.remove("has-bottom-nav")),S()}function S(){const e=window.location.hash.slice(1).split("?")[0]||"/";document.querySelectorAll(".bottom-nav__item").forEach(a=>{const t=a.dataset.route,s=t==="/"?e==="/":e===t||e.startsWith(t+"/");a.classList.toggle("bottom-nav__item--active",s)})}ee();
