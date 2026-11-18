const $=s=>document.querySelector(s),mem={};
const st={get(k,d){try{const v=localStorage.getItem(k);if(v)return JSON.parse(v)}catch(e){}return k in mem?mem[k]:d},set(k,v){mem[k]=v;try{localStorage.setItem(k,JSON.stringify(v))}catch(e){}}};
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const fdt=t=>new Date(t).toLocaleString('pt-BR',{day:'2-digit',month:'2-digit',hour:'2-digit',minute:'2-digit'});
const pct=(n,t)=>t?Math.round(n/t*100):0;
let S={view:'dash',period:30,tab:'in',err:'',t:null};
async function hash(s){try{const b=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(s));return [...new Uint8Array(b)].map(x=>x.toString(16).padStart(2,'0')).join('')}catch(e){return btoa(unescape(encodeURIComponent(s)))}}
function seed(){const U=['Estou sofrendo bullying na escola e não sei o que fazer.','Alguns colegas me excluem do grupo da turma.','Quero conversar com alguém de confiança.'],n=Date.now(),o=[];
[['demo1','Ana (exemplo)'],['demo2','Bruno (exemplo)'],['demo3','Carla (exemplo)']].forEach(([t,fn],i)=>{const ts=n-(i*2.2+.5)*864e5,b={t,demo:1};
o.push({...b,id:'d'+i,from:t,fn,role:'simples',text:U[i],ts,rd:i!==2});
if(i<2)o.push({...b,id:'e'+i,from:'mestre',fn:'Mestre',role:'master',text:i?'Sinto muito por isso. Pode me dizer quando começou?':'Obrigado por contar. Você não está sozinho(a). Vamos conversar.',ts:ts+36e5,rd:1});
if(i===1)o.push({...b,id:'f1',from:t,fn,role:'simples',text:'Começou no mês passado, nos intervalos.',ts:ts+72e5,rd:0})});return o.sort((a,b)=>a.ts-b.ts)}
let chat=st.get('nb_chat',null);if(!chat){chat=seed();st.set('nb_chat',chat)}
const save=()=>st.set('nb_chat',chat),user=()=>st.get('nb_session',null),isMaster=()=>(user()?.r||'master')==='master';
function toast(t){const e=$('#toast');e.textContent=t;e.classList.add('on');setTimeout(()=>e.classList.remove('on'),2600)}
function fail(m){S.err=m;const x=$('#err');if(x)x.textContent=m}

function authView(){const T=S.tab,up=T==='up',sp=T==='sp';
return `<div class="auth"><div class="card"><div class="logo"><b>N</b>No Bullying</div>
<p class="sub">Converse com o usuário mestre.</p>
<p class="note">Esta versão não usa banco online. Contas e conversas ficam salvas somente neste navegador e não aparecem para outros visitantes ou aparelhos.</p>
<div class="row"><button class="chip ${T==='in'?'on':''}" data-a="tab" data-v="in">Entrar</button><button class="chip ${sp?'on':''}" data-a="tab" data-v="sp">Cadastrar usuário simples</button><button class="chip ${up?'on':''}" data-a="tab" data-v="up">Cadastrar usuário mestre</button></div>
<div id="f">${T!=='in'?'<label for="n">Nome</label><input id="n" type="text" autocomplete="name">':''}
<label for="e">${up?'E-mail':T==='in'?'E-mail ou usuário':'Usuário (login)'}</label><input id="e" type="${up?'email':'text'}" autocapitalize="none" autocomplete="${T==='in'?'username':'off'}">
<label for="p">Senha${sp?' simples (mínimo 4 caracteres)':''}</label><input id="p" type="password" autocomplete="${T==='in'?'current-password':'new-password'}">
${up?'<label for="p2">Repetir senha</label><input id="p2" type="password" autocomplete="new-password">':''}
<p class="err" id="err">${esc(S.err)}</p><button class="btn" data-a="${T==='in'?'signin':'signup'}">${T==='in'?'Entrar':sp?'Cadastrar usuário simples':'Cadastrar usuário mestre'}</button></div></div></div>`}
async function signup(){const M=S.tab==='up',n=$('#n').value.trim(),e=$('#e').value.trim().toLowerCase(),p=$('#p').value,us=st.get('nb_users',[]);
if(!n)return fail('Informe o nome.');
if(M){if(!/^\S+@\S+\.\S+$/.test(e))return fail('Informe um e-mail válido.');if(p.length<6)return fail('A senha precisa ter pelo menos 6 caracteres.');if(p!==$('#p2').value)return fail('As senhas não são iguais.')}
else{if(!/^[a-z0-9._-]{3,20}$/.test(e))return fail('O login precisa ter de 3 a 20 caracteres: letras minúsculas, números, ponto ou traço.');if(p.length<4)return fail('A senha precisa ter pelo menos 4 caracteres.')}
if(us.some(u=>u.e===e))return fail('Este login já está cadastrado. Use a aba Entrar.');
const r=M?'master':'simples';us.push({n,e,h:await hash(p),r});st.set('nb_users',us);st.set('nb_session',{n,e,r});S.err='';S.view=M?'dash':'chat';render()}
async function signin(){const e=$('#e').value.trim().toLowerCase(),h=await hash($('#p').value),u=st.get('nb_users',[]).find(u=>u.e===e&&u.h===h);
if(!u)return fail('Usuário ou senha incorretos.');st.set('nb_session',{n:u.n,e:u.e,r:u.r||'master'});S.err='';S.view=u.r==='simples'?'chat':'dash';render()}

function convs(){const m={};chat.forEach(x=>(m[x.t]=m[x.t]||[]).push(x));
return Object.entries(m).map(([t,a])=>{a.sort((x,y)=>x.ts-y.ts);const l=a[a.length-1];return{t,a,l,name:(a.find(x=>x.role==='simples')||{}).fn||t,un:a.filter(x=>x.role==='simples'&&!x.rd).length,wait:l.role==='simples'}}).sort((x,y)=>y.l.ts-x.l.ts)}

function dash(){const lim=S.period?Date.now()-S.period*864e5:0,l=chat.filter(m=>m.ts>=lim),t=l.length,us=l.filter(m=>m.role==='simples').length,pu=pct(us,t),pm=t?100-pu:0,
cs=convs(),aw=cs.filter(c=>c.wait).length,an=cs.length-aw,un=cs.reduce((s,c)=>s+c.un,0),C=2*Math.PI*52,dA=cs.length?an/cs.length*C:0;
const dys=[...Array(7)].map((_,i)=>{const d=new Date();d.setHours(0,0,0,0);d.setDate(d.getDate()-6+i);const a=d.getTime(),x=chat.filter(m=>m.ts>=a&&m.ts<a+864e5);return{l:d.toLocaleDateString('pt-BR',{weekday:'short'}).replace('.',''),s:x.filter(m=>m.role==='simples').length,m:x.filter(m=>m.role==='master').length}});
const mx=Math.max(1,...dys.map(d=>d.s+d.m));
return `<h1>Painel</h1><p class="sub">Veja quem está escrevendo, quanto já foi respondido e o que ainda espera por você.</p>
${chat.some(m=>m.demo)?'<div class="note">Os números incluem conversas de exemplo. <button class="chip" data-a="clear">Limpar exemplos</button></div>':''}
<div class="row">${[[7,'7 dias'],[30,'30 dias'],[0,'Tudo']].map(([v,n])=>`<button class="chip ${S.period===v?'on':''}" data-a="period" data-v="${v}">${n}</button>`).join('')}</div>
<div class="card" style="margin-bottom:14px"><h2>Quem escreve nas conversas</h2>
<div class="ribbon" role="img" aria-label="Usuários ${pu}%, mestre ${pm}%">${t?`<span class="s" style="flex-basis:${pu}%;flex-shrink:1">${pu?pu+'%':''}</span><span class="w" style="flex-basis:${pm}%;flex-grow:1;flex-shrink:1">${pm?pm+'%':''}</span>`:'<span style="background:var(--line);flex:1;color:var(--muted);font-size:16px">Sem mensagens neste período</span>'}</div>
<div class="leg"><span><i class="dot" style="background:#3b6fd4"></i> Usuários simples: ${us}</span><span><i class="dot" style="background:#0e8f8a"></i> Mestre: ${t-us}</span></div></div>
<div class="grid k4" style="margin-bottom:14px">
<div class="card kpi"><small>Mensagens</small><strong>${t}</strong></div>
<div class="card kpi"><small>Conversas ativas</small><strong>${cs.length}</strong></div>
<div class="card kpi"><small>Taxa de resposta</small><strong>${pct(an,cs.length)}%</strong><div class="bar"><i style="width:${pct(an,cs.length)}%"></i></div></div>
<div class="card kpi"><small>Mensagens não lidas</small><strong>${un}</strong><div class="bar"><i style="width:${pct(aw,cs.length)}%;background:var(--coral)"></i></div></div></div>
<div class="grid k2"><div class="card"><h2>Situação das conversas</h2><div class="donut"><svg width="140" height="140" viewBox="0 0 140 140" role="img" aria-label="Respondidas ${pct(an,cs.length)}%"><circle r="52" cx="70" cy="70" fill="none" stroke="${cs.length?'#f2b632':'var(--line)'}" stroke-width="22"/>${cs.length?`<circle r="52" cx="70" cy="70" fill="none" stroke="#0e8f8a" stroke-width="22" stroke-dasharray="${dA} ${C-dA}" transform="rotate(-90 70 70)"/>`:''}<text x="70" y="76" text-anchor="middle" font-size="22" font-weight="800" fill="currentColor">${pct(an,cs.length)}%</text></svg>
<div class="leg" style="flex-direction:column;margin:0"><button data-a="gochat"><i class="dot" style="background:#0e8f8a"></i>Respondidas: ${an} (${pct(an,cs.length)}%)</button><button data-a="gochat"><i class="dot" style="background:#f2b632"></i>Aguardando resposta: ${aw} (${pct(aw,cs.length)}%)</button></div></div></div>
<div class="card"><h2>Mensagens nos últimos 7 dias</h2><div class="days">${dys.map(d=>`<div class="day" title="${d.s} de usuários, ${d.m} do mestre"><div class="stack" style="height:${(d.s+d.m)/mx*120}px"><i style="background:#3b6fd4;flex:${d.s}"></i><i style="background:#0e8f8a;flex:${d.m}"></i></div>${esc(d.l)}</div>`).join('')}</div></div></div>`}

function chatView(){const M=isMaster();
return `<h1>${M?'Conversas':'Mensagem ao mestre'}</h1><p class="sub">${M?'Responda aos usuários simples. Cada conversa é entre um usuário e os mestres.':'Escreva para o usuário mestre. A resposta aparece aqui, na mesma conversa.'}</p>
<div class="chat ${M?'two':''}">${M?'<div class="card" id="lst"></div>':''}<div class="card"><div id="thr" class="thr"></div><div class="cmp"><textarea id="tx" rows="2" maxlength="500" placeholder="Escreva sua mensagem" aria-label="Mensagem"></textarea><button class="btn" data-a="send">Enviar</button></div></div></div>`}
function fillChat(){const M=isMaster(),u=user();let cs=convs();
if(M){if(!S.t||!cs.some(c=>c.t===S.t))S.t=cs[0]?.t||null;let ch=0;chat.forEach(m=>{if(m.t===S.t&&m.role==='simples'&&!m.rd){m.rd=1;ch=1}});if(ch){save();cs=convs()}
const l=$('#lst');if(l)l.innerHTML='<h2>Usuários</h2>'+(cs.length?cs.map(c=>`<button class="cv ${c.t===S.t?'on':''}" data-a="th" data-v="${esc(c.t)}"><b>${esc(c.name)}</b>${c.un?`<span class="pill" style="background:var(--coral)">${c.un}</span>`:''}<small>${esc(c.l.text.slice(0,40))}</small></button>`).join(''):'<div class="empty">Nenhuma conversa ainda. Quando um usuário simples escrever, ela aparece aqui.</div>')}
const t=M?S.t:u.e,a=chat.filter(m=>m.t===t).sort((x,y)=>x.ts-y.ts),th=$('#thr');
if(th){th.innerHTML=(M&&t?`<h2>${esc(cs.find(c=>c.t===t)?.name||t)}</h2>`:'')+(a.length?a.map(m=>`<div class="msg ${(m.role==='master')===M?'me':''}"><span>${esc(m.fn)}, ${fdt(m.ts)}</span><p>${esc(m.text)}</p></div>`).join(''):`<div class="empty">${M?'Escolha uma conversa na lista.':'Nenhuma mensagem ainda. Escreva a primeira abaixo.'}</div>`);th.scrollTop=th.scrollHeight}}
function send(){const x=$('#tx'),tx=x.value.trim(),u=user(),M=isMaster(),t=M?S.t:u.e;if(!tx)return;if(!t)return toast('Escolha uma conversa antes de responder.');
chat.push({id:'m'+Date.now(),t,from:u.e,fn:u.n,role:M?'master':'simples',text:tx,ts:Date.now(),rd:M?1:0});save();x.value='';fillChat()}

function usersView(){const us=st.get('nb_users',[]);
return `<h1>Usuários</h1><p class="sub">Usuários simples se cadastram sozinhos na tela de entrada. Aqui você acompanha e remove acessos.</p>
<div class="card tw">${us.length?`<table><thead><tr><th>Nome</th><th>Login</th><th>Tipo</th><th></th></tr></thead><tbody>${us.map(u=>`<tr><td>${esc(u.n)}</td><td>${esc(u.e)}</td><td><span class="pill" style="background:${u.r==='simples'?'#3b6fd4':'#0e8f8a'}">${u.r==='simples'?'Simples':'Mestre'}</span></td><td>${u.r==='simples'?`<button class="chip" data-a="deluser" data-v="${esc(u.e)}">Remover</button>`:''}</td></tr>`).join('')}</tbody></table>`:'<div class="empty">Nenhum usuário cadastrado.</div>'}</div>`}

function render(){const r=$('#root'),u=user();if(!u){r.innerHTML=authView();return}
const M=isMaster();if(!M)S.view='chat';
const V=M?[['dash','Painel'],['chat','Conversas'],['users','Usuários']]:[['chat','Enviar mensagem ao mestre']];
r.innerHTML=`<div class="app"><aside><div class="logo"><b>N</b>No Bullying</div>${V.map(([k,n])=>`<button class="nav ${S.view===k?'on':''}" data-a="view" data-v="${k}">${n}</button>`).join('')}<div class="who">${esc(u.n)}<br><small>${M?'Usuário mestre':'Usuário simples'}</small><br><button data-a="out">Sair</button></div></aside><main>${S.view==='dash'&&M?dash():S.view==='users'&&M?usersView():chatView()}</main></div>`;
if(S.view==='chat')fillChat()}

document.addEventListener('click',e=>{const b=e.target.closest('[data-a]');if(!b)return;const a=b.dataset.a,v=b.dataset.v;
if(a==='tab'){S.tab=v;S.err='';render()}else if(a==='signup')signup();else if(a==='signin')signin();
else if(a==='out'){st.set('nb_session',null);S.tab='in';render()}
else if(a==='view'){S.view=v;render()}else if(a==='period'){S.period=+v;render()}
else if(a==='clear'){chat=chat.filter(m=>!m.demo);save();render()}
else if(a==='gochat'){S.view='chat';render()}else if(a==='th'){S.t=v;fillChat()}
else if(a==='send')send();
else if(a==='deluser'){st.set('nb_users',st.get('nb_users',[]).filter(u=>u.e!==v||u.r!=='simples'));chat=chat.filter(m=>m.t!==v);save();render()}});
document.addEventListener('keydown',e=>{if(e.key!=='Enter')return;
if(e.target.closest('#f')){e.preventDefault();S.tab==='in'?signin():signup()}
else if(e.target.id==='tx'&&!e.shiftKey){e.preventDefault();send()}});
setInterval(()=>{const m=st.get('nb_chat',null);if(m&&user()&&m.length!==chat.length){chat=m;if(S.view==='chat')fillChat();else if(S.view==='dash')render()}},2500);
render();
