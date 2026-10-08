(() => {
  const O=window.JAM_OVERVIEW;
  let overrides={},saved={},revision=0,editing=false,ready=false,saving=false,sheetState=null,returnFocus=null;
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
  function calendar(team){
    const t=O[team],occupied=[];
    const events=t.blocks.flatMap((b,i)=>b.events.map(e=>({e,i,range:eventRange(e,i,team)})));
    events.sort((a,b)=>a.range[0]-b.range[0]||(a.range[1]-a.range[0])-(b.range[1]-b.range[0]));
    return events.map(({e,i,range:[start,end]})=>{
      let row=0;while(occupied[row]?.some(([a,b])=>start<=b&&end>=a))row++;
      (occupied[row]??=[]).push([start,end]);
      return `<button class="calendar-event" style="grid-column:${start} / ${end+1};grid-row:${row+1}" data-collaboration="${team}:${i}:${e.id}" aria-label="${t.name}, ${escape(value(`collab.${e.editTeam||team}.${e.id}.when`,e.when))}: ${escape(value(`collab.${e.editTeam||team}.${e.id}.name`,e.name))}"><span class="calendar-event-meta"><span class="calendar-timing">${text(`collab.${e.editTeam||team}.${e.id}.when`,e.when)}</span>${text(`collab.${e.editTeam||team}.${e.id}.kind`,e.kind,'span','event-kind')}</span>${text(`collab.${e.editTeam||team}.${e.id}.name`,e.name,'b')}${e.agenda?text(`collab.${e.editTeam||team}.${e.id}.focus`,e.focus,'span','weekly-focus'):''}</button>`;
    }).join('');
  }
  function render(){
    document.getElementById('page-principles').innerHTML=`<h2>Principles</h2><div class="compact-principles">${[
      ['Protect the primary focus.','Give the work that matters most the time it needs. Other demands must fit around it or explicitly displace it.'],
      ['Accountability through visibility.','The work and our working conversations show progress, readiness, and where help is needed. Reuse that context instead of manufacturing reports.'],
      ['Do what matters most.','We cannot do everything. Make the consequence and trade-off clear before adding work or meetings.']
    ].map(([title,body],i)=>`<article>${text(`challenge.single.principles.${i}.title`,title,'h3')}${text(`challenge.single.principles.${i}.body`,body,'p')}</article>`).join('')}</div><div class="compact-ownership"><h2>Ownership</h2>${[
      ['Chris, Kai, and Lee','Lead their functions and support each other as needed.'],
      ['Ryan','Facilitate the work toward leadership’s picture of success, helping teams move independently and resolve gaps.'],
      ['ICs','Own the work and drive it to the agreed outcomes.']
    ].map(([title,body],i)=>`<p>${text(`challenge.single.ownership.${i}.title`,title,'strong')} — ${text(`challenge.single.ownership.${i}.body`,body)}</p>`).join('')}</div>`;
    const C=window.JAM_CHALLENGE;
    document.getElementById('page-challenge').innerHTML=`<div class="challenge-title">${text('challenge.title',C.title,'h2')}${text('challenge.stance',C.stance,'p')}</div><div class="challenge-cards">${C.cards.map((c,i)=>`<article>${text(`challenge.${i}.title`,c.title,'h3')}${text(`challenge.${i}.response`,c.response,'p')}</article>`).join('')}</div>`;
    document.getElementById('page-focus').innerHTML=`<h2>Focus</h2><div class="calendar-scroll"><div class="calendar-inner">${weekHeader()}<div class="shared-focus-lines">${O.everybody.blocks.map((b,i)=>`<button data-focus="everybody:${i}">${focusText('everybody',i,'primary',b,'span','')}</button>`).join('')}</div>${teamOrder.filter(id=>id!=='everybody').map(id=>{const t=O[id];return `<section class="focus-lane team-${id}"><button class="team-heading" data-focus-all="${id}">${t.name}</button><div class="focus-week-grid">${t.blocks.map((b,i)=>`<button class="focus-cell ${b.cooldown?'has-cooldown':''}" data-focus="${id}:${i}" aria-label="${t.name}, weeks ${i*2+1}–${i*2+2}: focus"><span class="focus-priority"><span class="focus-priority-label">Primary</span>${focusText(id,i,'primary',b,'strong','primary-text')}</span>${renderSecondaries(id,i)}<span class="focus-meta">${focusText(id,i,'context',b,'span','overview-context')}</span></button>`).join('')}</div></section>`;}).join('')}</div></div>`;
    document.getElementById('page-collaboration').innerHTML=`<h2>Collaboration</h2><div class="calendar-scroll"><div class="calendar-inner">${weekHeader()}${teamOrder.map(id=>`<section class="collaboration-lane team-${id}"><button class="team-heading" data-collaboration-all="${id}">${O[id].name}</button><div class="collaboration-week-grid">${calendar(id)}</div></section>`).join('')}</div></div>`;
    if(sheetState)renderSheet();
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
    else body=indices.map(i=>{const events=event? t.blocks[i].events.filter(e=>e.id===event):t.blocks[i].events;return `<section class="sheet-section"><div class="eyebrow">Weeks ${i*2+1}–${i*2+2}</div>${events.map(e=>`<article class="sheet-session"><div class="overview-event-meta">${text(`collab.${e.editTeam||team}.${e.id}.when`,e.when)}${text(`collab.${e.editTeam||team}.${e.id}.kind`,e.kind,'span','event-kind')}</div>${text(`collab.${e.editTeam||team}.${e.id}.name`,e.name,'h3')}${e.agenda?text(`collab.${e.editTeam||team}.${e.id}.agenda`,e.agenda,'p','sheet-secondary')+text(`collab.${e.editTeam||team}.${e.id}.focus`,e.focus,'p','sheet-secondary'):''}${text(`collab.${e.editTeam||team}.${e.id}.note`,e.note,'p','session-purpose')}<dl>${['owner','attendees','inputs','outputs'].map(k=>`<div><dt>${k[0].toUpperCase()+k.slice(1)}</dt><dd>${text(`collab.${e.editTeam||team}.${e.id}.${k}`,e[k])}</dd></div>`).join('')}</dl>${e.evidence?`<h4>What we inspect</h4><ul class="focus-approach">${e.evidence.map((line,j)=>`<li>${text(`collab.${e.editTeam||team}.${e.id}.evidence.${j}`,line)}</li>`).join('')}</ul>${text(`collab.${e.editTeam||team}.${e.id}.readiness`,e.readinessNote,'p','session-purpose')}`:''}</article>`).join('')}</section>`;}).join('');
    dialog.innerHTML=`<header class="sheet-header"><div><div class="eyebrow">${t.name} · ${all?'All eight weeks':'Weeks '+(block*2+1)+'–'+(block*2+2)}</div><h2 id="working-sheet-title">${type==='focus'?'Focus':'Collaboration'}</h2></div><button data-sheet-close aria-label="Close panel">Close</button></header><div class="sheet-tools">${!all?'<button data-sheet-all>All eight weeks</button>':''}${editing?'<button data-sheet-save>Save</button>':''}<span id="sheet-edit-status" role="status">${escape(document.getElementById('edit-status').textContent)}</span></div><div class="sheet-body">${body}</div>`;
  }
  const status=message=>{document.getElementById('edit-status').textContent=message;const inside=document.getElementById('sheet-edit-status');if(inside)inside.textContent=message;};
  function setEditing(on){editing=on;document.body.classList.toggle('editing-map',on);document.getElementById('edit-map').hidden=on;document.getElementById('save-map').hidden=!on;document.getElementById('cancel-map').hidden=!on;render();}
  async function load(){
    document.getElementById('edit-map').disabled=true;
    try{const r=await fetch('./published-text.json',{cache:'no-store'});const data=await r.json();if(!r.ok)throw new Error(data.error||'Saved text is unavailable.');overrides=data.overrides;revision=data.revision;saved=structuredClone(overrides);ready=true;render();status('');}
    catch(error){status(error.message+' Reload to retry.');}
  }
  async function save(){
    if(!ready||saving)return;saving=true;status('Saving…');document.getElementById('save-map').disabled=true;
    try{const r=await fetch('/api/working-text',{method:'PUT',headers:{'content-type':'application/json'},body:JSON.stringify({overrides,revision})});const data=await r.json();if(!r.ok)throw new Error(data.error||'Could not save. Your edits are still here.');revision=data.revision;saved=structuredClone(overrides);setEditing(false);status('Saved');}
    catch(error){status(error.message);}
    finally{saving=false;document.getElementById('save-map').disabled=false;}
  }
  function beginEditing(){if(!ready)return;status('');setEditing(true);}
  document.getElementById('edit-map').addEventListener('click',beginEditing);
  document.getElementById('save-map').addEventListener('click',save);
  document.getElementById('cancel-map').addEventListener('click',()=>{overrides=structuredClone(saved);setEditing(false);status('');});
  document.addEventListener('input',e=>{const field=e.target.closest('[data-edit-key]');if(!editing||!field)return;overrides[field.dataset.editKey]=field.textContent;status('Unsaved changes');document.querySelectorAll('[data-edit-key="'+field.dataset.editKey+'"]').forEach(other=>{if(other!==field)other.textContent=field.textContent;});});
  document.addEventListener('keydown',e=>{if(editing&&e.target.closest('[data-edit-key]')&&e.key==='Enter'){e.preventDefault();document.execCommand('insertText',false,'\n');}});
  document.addEventListener('click',e=>{
    const b=e.target.closest('button');if(!b)return;
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
  window.addEventListener('beforeunload',e=>{if(editing&&JSON.stringify(overrides)!==JSON.stringify(saved)){e.preventDefault();e.returnValue='';}});
  window.WorkingMap={render};
  window.addEventListener('DOMContentLoaded',load);
})();
