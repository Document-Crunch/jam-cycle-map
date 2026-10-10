(() => {
  const O=window.JAM_OVERVIEW;
  let layout='function',overrides={},saved={},revision=0,editing=false,ready=false,saving=false,sheetState=null,returnFocus=null;
  const escape=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const value=(key,base)=>Object.hasOwn(overrides,key)?overrides[key]:base;
  const text=(key,base,tag='span',className='')=>`<${tag} class="${className}" data-edit-key="${key}" data-edit-base="${escape(base)}" ${editing?'contenteditable="plaintext-only" role="textbox" tabindex="0" aria-label="'+escape(key)+'"':''}>${escape(value(key,base))}</${tag}>`;
  const focusText=(id,i,key,b,tag,className)=>text(`map.${id}.${i}.${key}`,b[key],tag,className);
  function secondaryItems(team,i){
    const b=O[team].blocks[i],key=`map.${team}.${i}.secondary-list`;
    if(Object.hasOwn(overrides,key)){
      try{const ids=JSON.parse(overrides[key]);if(Array.isArray(ids)&&ids.every(id=>typeof id==='string'&&/^[a-z0-9-]+$/.test(id)))return ids;}catch{}
    }
    const ids=[];
    if(value(`map.${team}.${i}.secondary`,b.secondary))ids.push('secondary');
    if(b.cooldown&&team!=='engineering'&&value(`map.${team}.${i}.cooldown`,'Cool down'))ids.push('cooldown');
    return ids;
  }
  function secondaryText(team,i,id,tag='span',className='secondary-text'){
    const b=O[team].blocks[i];
    return text(`map.${team}.${i}.${id}`,id==='secondary'?b.secondary:id==='cooldown'?'Cool down':'',tag,className);
  }
  function renderSecondaries(team,i,controls=false){
    const ids=secondaryItems(team,i);
    const items=ids.map(id=>controls?`<div class="secondary-edit-row">${secondaryText(team,i,id,'span','sheet-secondary')}${editing?`<button class="remove-secondary" data-remove-secondary="${team}:${i}:${id}" aria-label="Remove secondary focus">Remove</button>`:''}</div>`:`<span class="focus-priority focus-support"><span class="focus-priority-label">Secondary</span>${secondaryText(team,i,id)}</span>`).join('');
    return controls?`<div class="secondary-list">${items}${editing?`<button class="add-secondary" data-add-secondary="${team}:${i}">+ Add secondary focus</button>`:''}</div>`:items;
  }
  function changeSecondaries(team,i,remove){
    const ids=secondaryItems(team,i);
    let next;
    if(remove)next=ids.filter(id=>id!==remove);
    else{const id='secondary-'+Date.now().toString(36);next=[...ids,id];overrides[`map.${team}.${i}.${id}`]='New secondary focus';}
    overrides[`map.${team}.${i}.secondary-list`]=JSON.stringify(next);
    render();status('Unsaved changes');
  }
  const teamOrder=['product','design','engineering','everybody'];
  const weekHeader=()=>`<div class="week-calendar-header">${Array.from({length:8},(_,i)=>`<span>Week ${i+1}</span>`).join('')}</div>`;
  function eventRange(e,i,team){
    const label=value(`collab.${e.editTeam||team}.${e.id}.when`,e.when);
    const numbers=label.match(/[1-8]/g)?.map(Number);
    if(numbers?.length)return [Math.min(...numbers),Math.max(...numbers)];
    if(/end|review/i.test(label))return [i*2+2,i*2+2];
    return [i*2+1,i*2+2];
  }
  const meetingsKey='collab.editor.meetings';
  function meetingChanges(){try{return JSON.parse(value(meetingsKey,'{}'));}catch{return {};}}
  function meetings(){
    const changes=meetingChanges(),list=[];
    teamOrder.forEach(team=>O[team].blocks.forEach((b,i)=>b.events.forEach(e=>{
      const key=(e.editTeam||team)+'.'+e.id,change=changes[key]||{};
      if(change.deleted)return;
      const range=eventRange(e,i,team);
      list.push({e:{...e,editTeam:e.editTeam||team},key,team:change.team||team,start:change.start||range[0],width:change.width||range[1]-range[0]+1});
    })));
    Object.entries(changes).forEach(([key,c])=>{if(c.custom&&!c.deleted)list.push({key,e:{id:key.split('.')[1],editTeam:'custom',name:'New meeting',when:'W'+c.start,kind:'Meeting',note:'',owner:'',attendees:'',inputs:'',outputs:''},team:c.team,start:c.start,width:c.width});});
    return list;
  }
  function updateMeeting(key,patch){
    const m=meetings().find(m=>m.key===key);if(!m)return;
    const changes=meetingChanges(),next={...changes[key],team:m.team,start:m.start,width:Math.min(2,m.width),...patch};
    next.width=Number(next.width)===2?2:1;next.start=Math.max(1,Math.min(9-next.width,Number(next.start)||1));
    changes[key]=next;overrides[meetingsKey]=JSON.stringify(changes);
    overrides['collab.'+key+'.when']='W'+next.start+(next.width===2?'–'+(next.start+1):'');
    if(sheetState?.event===m.e.id){if(next.deleted)closeSheet();else sheetState={type:'collaboration',team:next.team,block:Math.floor((next.start-1)/2),event:m.e.id};}
    render();status('Unsaved changes');
  }
  function addMeeting(team){
    const id='meeting-'+Date.now().toString(36),key='custom.'+id,changes=meetingChanges();
    changes[key]={custom:true,team,start:1,width:1};overrides[meetingsKey]=JSON.stringify(changes);
    render();status('Unsaved changes');openSheet({type:'collaboration',team,block:0,event:id},null);
  }
  function meetingControls(m){return `<div class="meeting-controls" data-meeting-key="${m.key}"><label>Function<select data-meeting-field="team">${teamOrder.map(t=>`<option value="${t}" ${m.team===t?'selected':''}>${O[t].name}</option>`).join('')}</select></label><label>Start week<select data-meeting-field="start">${Array.from({length:9-Math.min(m.width,2)},(_,i)=>`<option value="${i+1}" ${m.start===i+1?'selected':''}>Week ${i+1}</option>`).join('')}</select></label><label>Width<select data-meeting-field="width"><option value="1" ${m.width===1?'selected':''}>1 week</option><option value="2" ${m.width!==1?'selected':''}>2 weeks</option></select></label><button data-delete-meeting="${m.key}">Delete meeting</button></div>`;}
  function calendar(team){
    const t=O[team],occupied=[];
    const events=meetings().filter(m=>m.team===team).map(m=>({...m,i:Math.floor((m.start-1)/2),range:[m.start,m.start+m.width-1]}));
    events.sort((a,b)=>a.range[0]-b.range[0]||(a.range[1]-a.range[0])-(b.range[1]-b.range[0]));
    return events.map(({e,i,key,range:[start,end]})=>{
      let row=0;while(occupied[row]?.some(([a,b])=>start<=b&&end>=a))row++;
      (occupied[row]??=[]).push([start,end]);
      return `<button class="calendar-event" style="grid-column:${start} / ${end+1};grid-row:${row+1}" data-collaboration="${team}:${i}:${e.id}" aria-label="${t.name}, ${escape(value(`collab.${e.editTeam||team}.${e.id}.when`,e.when))}: ${escape(value(`collab.${e.editTeam||team}.${e.id}.name`,e.name))}">${editing?`<span class="meeting-drag" data-move-meeting="${key}" title="Drag to move">Move</span><span class="meeting-resize" data-resize-meeting="${key}" title="Drag to resize">↔</span>`:''}<span class="calendar-event-meta"><span class="calendar-timing">${text(`collab.${e.editTeam||team}.${e.id}.when`,e.when)}</span>${text(`collab.${e.editTeam||team}.${e.id}.kind`,e.kind,'span','event-kind')}</span>${text(`collab.${e.editTeam||team}.${e.id}.name`,e.name,'b')}${e.agenda?text(`collab.${e.editTeam||team}.${e.id}.focus`,e.focus,'span','weekly-focus'):''}</button>`;
    }).join('');
  }
  const introDefaults={
    principles:'Explicit principles guide how we lead our teams.',
    ownership:'Ryan organizes and drives the program; senior ICs facilitate recurring functional meetings; ICs own the work toward outcomes leadership sets.',
    focus:'Each function has an established focus for every two-week segment of JAM.',
    meetings:'Each function has one weekly meeting to check in with the team and advance that focus. No other functional meetings recur by default; leaders add 1:1s and working sessions as needed.',
    cooldown:'Cooldown now extends to Product and Design as well as Engineering.'
  };
  function introItems(){
    try{const ids=JSON.parse(value('challenge.tweaks.items','null'));if(Array.isArray(ids)&&ids.every(id=>typeof id==='string'&&/^[a-z0-9-]+$/.test(id)))return ids;}catch{}
    return Object.keys(introDefaults);
  }
  function changeIntro(remove){
    const ids=introItems();let next;
    if(remove)next=ids.filter(id=>id!==remove);
    else{const id='change-'+Date.now().toString(36);next=[...ids,id];overrides[`challenge.tweaks.${id}.body`]='Describe what changes.';}
    overrides['challenge.tweaks.items']=JSON.stringify(next);render();status('Unsaved changes');
  }
  function render(){
    document.getElementById('page-introduction').innerHTML=`${text('challenge.changes.title','Latest JAM tweaks: what should feel different','h1')}<ul class="intro-changes">${introItems().map(id=>`<li><div>${text(`challenge.tweaks.${id}.body`,introDefaults[id]||'Describe what changes.','span')}</div>${editing?`<button data-remove-intro="${id}" aria-label="Remove change">Remove</button>`:''}</li>`).join('')}</ul>${editing?'<button class="add-secondary" data-add-intro>+ Add change</button>':''}`;
    document.getElementById('page-principles').innerHTML=`<h2>Principles</h2><div class="compact-principles">${[
      ['Protect the primary focus.','Give the work that matters most the time it needs. Other demands must fit around it or explicitly displace it.'],
      ['Accountability through visibility.','The work and our working conversations show progress, readiness, and where help is needed. Reuse that context instead of manufacturing reports.'],
      ['Accountability',''],
    ].map(([title,body],i)=>`<article>${text(`challenge.single.principles.${i===2?3:i}.title`,title,'h3')}${text(`challenge.single.principles.${i===2?3:i}.body`,body,'p')}</article>`).join('')}</div><div class="compact-ownership"><h2>Ownership</h2>${[
      ['Chris, Kai, and Lee','Lead their functions and support each other as needed.'],
      ['Ryan','Facilitate the work toward leadership’s picture of success, helping teams move independently and resolve gaps.'],
      ['Leaders and senior ICs','Facilitate recurring functional meetings.'],
      ['ICs','Own the work and drive it to the agreed outcomes.']
    ].map(([title,body],i)=>`<p>${text(`challenge.single.ownership.${i===2?3:i===3?2:i}.title`,title,'strong')} — ${text(`challenge.single.ownership.${i===2?3:i===3?2:i}.body`,body)}</p>`).join('')}</div>`;
    const C=window.JAM_CHALLENGE;
    document.getElementById('page-challenge').innerHTML=`<div class="challenge-title">${text('challenge.title',C.title,'h2')}</div><div class="challenge-cards">${C.cards.map((c,i)=>`<article>${text(`challenge.${i}.title`,c.title,'h3')}${text(`challenge.${i}.response`,c.response,'p')}</article>`).join('')}</div>`;
    document.getElementById('page-focus').innerHTML=`<h2>Focus</h2><div class="calendar-scroll"><div class="calendar-inner">${weekHeader()}${teamOrder.filter(id=>id!=='everybody').map(id=>{const t=O[id];return `<section class="focus-lane team-${id}"><button class="team-heading" data-focus-all="${id}">${t.name}</button><div class="focus-week-grid">${t.blocks.map((b,i)=>`<button class="focus-cell ${b.cooldown?'has-cooldown':''}" data-focus="${id}:${i}" aria-label="${t.name}, weeks ${i*2+1}–${i*2+2}: focus"><span class="focus-priority"><span class="focus-priority-label">Primary</span>${focusText(id,i,'primary',b,'strong','primary-text')}</span>${renderSecondaries(id,i)}<span class="focus-meta">${focusText(id,i,'context',b,'span','overview-context')}</span></button>`).join('')}</div></section>`;}).join('')}</div></div>`;
    document.getElementById('page-collaboration').innerHTML=`<h2>Collaboration</h2><div class="calendar-scroll"><div class="calendar-inner">${weekHeader()}${teamOrder.map(id=>`<section class="collaboration-lane team-${id}"><button class="team-heading" data-collaboration-all="${id}">${O[id].name}</button><div class="collaboration-week-grid">${calendar(id)}</div>${editing?`<button class="add-meeting" data-add-meeting="${id}">+ Add meeting</button>`:''}</section>`).join('')}</div></div>`;
    renderFunctionView();
    applyLayout();
    if(sheetState)renderSheet();
  }
  function renderFunctionView(){
    const sourceFocus=document.getElementById('page-focus'),sourceCollab=document.getElementById('page-collaboration');
    document.getElementById('function-view').innerHTML=teamOrder.map(id=>`<section class="function-group team-${id}"><h2>${O[id].name}</h2>${id!=='everybody'?`<h3>Focus</h3><div class="calendar-scroll"><div class="calendar-inner">${weekHeader()}${sourceFocus.querySelector('.focus-lane.team-'+id).outerHTML}</div></div>`:''}<h3>Collaboration</h3><div class="calendar-scroll"><div class="calendar-inner">${weekHeader()}${sourceCollab.querySelector('.collaboration-lane.team-'+id).outerHTML}</div></div></section>`).join('');
  }
  function applyLayout(){
    document.getElementById('combined-view').hidden=layout!=='combined';
    document.getElementById('function-view').hidden=layout!=='function';
    document.querySelectorAll('[data-layout]').forEach(b=>{const active=b.dataset.layout===layout;b.setAttribute('aria-selected',String(active));b.tabIndex=active?0:-1;});
  }
  const dialog=document.createElement('dialog');dialog.className='working-sheet';dialog.setAttribute('aria-labelledby','working-sheet-title');document.body.append(dialog);
  function closeSheet(){dialog.close();sheetState=null;if(returnFocus?.isConnected)returnFocus.focus();}
  dialog.addEventListener('cancel',e=>{e.preventDefault();closeSheet();});
  dialog.addEventListener('click',e=>{if(e.target===dialog)closeSheet();});
  function openSheet(state,trigger){sheetState=state;returnFocus=trigger;renderSheet();if(!dialog.open)dialog.showModal();dialog.querySelector('[data-sheet-close]').focus();}
  function renderSheet(){
    const {type,team,block,event}=sheetState,t=O[team],all=block===null;
    const indices=all?[0,1,2,3]:[block];
    let body='';
    if(type==='focus')body=indices.map(i=>{const b=t.blocks[i];return `<section class="sheet-section team-${team}"><div class="eyebrow">Weeks ${i*2+1}–${i*2+2}</div>${focusText(team,i,'primary',b,'h3','sheet-focus-title')}${renderSecondaries(team,i,true)}<h4>How we work</h4><ul class="focus-approach">${b.approach.map((line,j)=>`<li>${text(`focus.${team}.${i}.approach.${j}`,line)}</li>`).join('')}</ul><h4>What needs to be true</h4>${b.conditions.map((condition,j)=>`<div class="week-condition"><b>Week ${i*2+j+1}</b>${text(`focus.${team}.${i}.${j}`,condition,'p')}</div>`).join('')}<details class="phase-context"><summary>Alongside this work</summary>${Object.entries(O).filter(([id])=>id!==team).map(([id,other])=>`<div><b>${other.name}</b>${focusText(id,i,'primary',other.blocks[i],'p','')}${secondaryItems(id,i).map(key=>secondaryText(id,i,key,'p','sheet-secondary')).join('')}</div>`).join('')}</details></section>`;}).join('')+`<section class="sheet-inspect"><h3>Accountability through visibility</h3>${text('challenge.single.principles.1.body','The work and our working conversations show progress, readiness, and where help is needed. Reuse that context instead of manufacturing reports.','p')}</section>`;
    else body=indices.map(i=>{const events=meetings().filter(m=>m.team===team&&(event?m.e.id===event:Math.floor((m.start-1)/2)===i));return `<section class="sheet-section"><div class="eyebrow">Weeks ${i*2+1}–${i*2+2}</div>${events.map(m=>{const e=m.e;return `<article class="sheet-session">${editing?meetingControls(m):''}<div class="overview-event-meta">${text(`collab.${e.editTeam||team}.${e.id}.when`,e.when)}${text(`collab.${e.editTeam||team}.${e.id}.kind`,e.kind,'span','event-kind')}</div>${text(`collab.${e.editTeam||team}.${e.id}.name`,e.name,'h3')}${e.agenda?text(`collab.${e.editTeam||team}.${e.id}.agenda`,e.agenda,'p','sheet-secondary')+text(`collab.${e.editTeam||team}.${e.id}.focus`,e.focus,'p','sheet-secondary'):''}${text(`collab.${e.editTeam||team}.${e.id}.note`,e.note,'p','session-purpose')}<dl>${['owner','attendees','inputs','outputs'].map(k=>`<div><dt>${k[0].toUpperCase()+k.slice(1)}</dt><dd>${text(`collab.${e.editTeam||team}.${e.id}.${k}`,e[k])}</dd></div>`).join('')}</dl>${e.evidence?`<h4>What we inspect</h4><ul class="focus-approach">${e.evidence.map((line,j)=>`<li>${text(`collab.${e.editTeam||team}.${e.id}.evidence.${j}`,line)}</li>`).join('')}</ul>${text(`collab.${e.editTeam||team}.${e.id}.readiness`,e.readinessNote,'p','session-purpose')}`:''}</article>`;}).join('')}</section>`;}).join('');
    dialog.innerHTML=`<header class="sheet-header"><div><div class="eyebrow">${t.name} · ${all?'All eight weeks':'Weeks '+(block*2+1)+'–'+(block*2+2)}</div><h2 id="working-sheet-title">${type==='focus'?'Focus':'Collaboration'}</h2></div><button data-sheet-close aria-label="Close panel">Close</button></header><div class="sheet-tools">${!all?'<button data-sheet-all>All eight weeks</button>':''}${editing?'<button data-sheet-save>Save</button>':''}<span id="sheet-edit-status" role="status">${escape(document.getElementById('edit-status').textContent)}</span></div><div class="sheet-body">${body}</div>`;
  }
  const status=message=>{document.getElementById('edit-status').textContent=message;const inside=document.getElementById('sheet-edit-status');if(inside)inside.textContent=message;};
  function setEditing(on){editing=on;document.body.classList.toggle('editing-map',on);document.getElementById('edit-map').hidden=on;document.getElementById('save-map').hidden=!on;document.getElementById('cancel-map').hidden=!on;render();}
  async function load(){
    document.getElementById('edit-map').disabled=true;
    try{const r=await fetch('./published-text.json',{cache:'no-store'});const data=await r.json();if(!r.ok)throw new Error(data.error||'Saved text is unavailable.');overrides=data.overrides;revision=data.revision;saved=structuredClone(overrides);ready=true;render();status('');}
    catch(error){status(error.message+' Reload to retry.');}
  }
  async function save(){}
  function beginEditing(){if(!ready)return;status('');setEditing(true);}
  document.getElementById('edit-map').addEventListener('click',beginEditing);
  document.getElementById('save-map').addEventListener('click',save);
  document.getElementById('cancel-map').addEventListener('click',()=>{overrides=structuredClone(saved);setEditing(false);status('');});
  document.addEventListener('input',e=>{const field=e.target.closest('[data-edit-key]');if(!editing||!field)return;overrides[field.dataset.editKey]=field.textContent;status('Unsaved changes');document.querySelectorAll('[data-edit-key="'+field.dataset.editKey+'"]').forEach(other=>{if(other!==field)other.textContent=field.textContent;});});
  const itemButtonSelector='button[data-focus],button[data-focus-all],button[data-collaboration],button[data-collaboration-all]';
  document.addEventListener('keydown',e=>{
    if(e.key!==' '||!e.target.closest(itemButtonSelector))return;
    e.preventDefault();
    if(editing&&e.target.closest('[contenteditable]'))document.execCommand('insertText',false,' ');
  });
  document.addEventListener('keyup',e=>{if(e.key===' '&&e.target.closest(itemButtonSelector))e.preventDefault();});
  document.addEventListener('keydown',e=>{if(editing&&e.target.closest('[data-edit-key]')&&e.key==='Enter'){e.preventDefault();document.execCommand('insertText',false,'\n');}});
  document.addEventListener('click',e=>{
    const b=e.target.closest('button');if(!b)return;
    if(editing&&e.detail===0&&b.matches(itemButtonSelector)&&document.activeElement?.closest('[contenteditable]')&&b.contains(document.activeElement))return;
    if(editing&&b.dataset.addMeeting){addMeeting(b.dataset.addMeeting);return;}
    if(editing&&b.dataset.deleteMeeting){updateMeeting(b.dataset.deleteMeeting,{deleted:true});return;}
    if(editing&&b.hasAttribute('data-add-intro')){changeIntro();return;}
    if(editing&&b.dataset.removeIntro){changeIntro(b.dataset.removeIntro);return;}
    if(b.dataset.layout){layout=b.dataset.layout;applyLayout();return;}
    if(editing&&b.dataset.addSecondary){const [team,i]=b.dataset.addSecondary.split(':');changeSecondaries(team,Number(i));return;}
    if(editing&&b.dataset.removeSecondary){const [team,i,id]=b.dataset.removeSecondary.split(':');changeSecondaries(team,Number(i),id);return;}
    if(b.hasAttribute('data-sheet-close')){closeSheet();return;}
    if(b.hasAttribute('data-sheet-all')){sheetState={...sheetState,block:null,event:null};renderSheet();return;}
    if(b.hasAttribute('data-sheet-edit')){beginEditing();return;}
    if(b.hasAttribute('data-sheet-save')){save();return;}
    if(editing&&e.target.closest('[data-edit-key]'))return;
    if(b.dataset.focus){const [team,index]=b.dataset.focus.split(':');openSheet({type:'focus',team,block:Number(index)},b);}
    if(b.dataset.focusAll)openSheet({type:'focus',team:b.dataset.focusAll,block:null},b);
    if(b.dataset.collaboration){const [team,index,event]=b.dataset.collaboration.split(':');openSheet({type:'collaboration',team,block:Number(index),event},b);}
    if(b.dataset.collaborationAll)openSheet({type:'collaboration',team:b.dataset.collaborationAll,block:null},b);
  });
  document.addEventListener('change',e=>{
    if(!editing||!e.target.dataset.meetingField)return;
    updateMeeting(e.target.closest('[data-meeting-key]').dataset.meetingKey,{[e.target.dataset.meetingField]:e.target.value});
  });
  let moving=null,suppressClick=false;
  document.addEventListener('pointerdown',e=>{
    const handle=e.target.closest('[data-move-meeting],[data-resize-meeting]');if(!editing||!handle)return;
    e.preventDefault();const key=handle.dataset.moveMeeting||handle.dataset.resizeMeeting,m=meetings().find(m=>m.key===key);
    moving={key,m,resize:!!handle.dataset.resizeMeeting,x:e.clientX,step:handle.closest('.collaboration-week-grid').getBoundingClientRect().width/8,handle};handle.setPointerCapture(e.pointerId);
  });
  document.addEventListener('pointermove',e=>{if(moving){e.preventDefault();const delta=Math.round((e.clientX-moving.x)/moving.step);moving.handle.title=moving.resize?'Width: '+Math.max(1,Math.min(2,moving.m.width+delta))+' weeks':'Week '+Math.max(1,Math.min(9-Math.min(2,moving.m.width),moving.m.start+delta));}});
  document.addEventListener('pointerup',e=>{
    if(!moving)return;const {key,m,resize,x,step}=moving;moving=null;const delta=Math.round((e.clientX-x)/step);
    suppressClick=true;updateMeeting(key,resize?{width:Math.max(1,Math.min(2,m.width+delta))}:{start:m.start+delta});setTimeout(()=>suppressClick=false,0);
  });
  document.addEventListener('pointercancel',()=>{moving=null;});
  document.addEventListener('click',e=>{if(suppressClick||e.target.closest('[data-move-meeting],[data-resize-meeting]')){e.preventDefault();e.stopImmediatePropagation();}},true);
  window.addEventListener('beforeunload',e=>{if(editing&&JSON.stringify(overrides)!==JSON.stringify(saved)){e.preventDefault();e.returnValue='';}});
  document.querySelector('.layout-tabs').addEventListener('keydown',e=>{
    if(!['ArrowLeft','ArrowRight','Home','End'].includes(e.key))return;
    e.preventDefault();layout=e.key==='Home'?'function':e.key==='End'?'combined':layout==='combined'?'function':'combined';applyLayout();document.querySelector(`[data-layout="${layout}"]`).focus();
  });
  window.WorkingMap={render};
  window.addEventListener('DOMContentLoaded',load);
})();
