(() => {
  const O=window.JAM_OVERVIEW;
  O.product.blocks[0].secondary='Finish previous releases and enablement';
  O.product.blocks[2].primary='Build the next portfolio';
  O.product.blocks[2].secondary='Prepare frontline enablement';
  const focus={
    product:[
      ['The pod has access to the PM and can refine the selected work. Previous releases and their frontline context keep moving toward completion.','The pod and PM understand the delivery approach. Pitchback and the Engineering-led kickoff feed what the front line needs to know; previous-release gaps are being closed.'],
      ['The shared opportunity list is taking shape, with each problem and its basis visible. PMs can think, connect, and cool down without another delivery crunch.','The full opportunity list is visible and understood, including proposals from other functions and the business. It is the candidate set, not the selected portfolio.'],
      ['The full list is becoming a smaller, stack-ranked portfolio. The trade-offs against capacity are clear enough to discuss. Enablement builds on what the pods and Design have already shared.','The proposed portfolio is coherent enough for the business to decide where to invest. Frontline context is already taking shape, rather than starting from scratch in week seven.'],
      ['The front line can explain the current work from the context built throughout the cycle. Remaining release questions are visible, and leaders can begin light next-opportunity intake.','The front line is ready for the known release state. Remaining details carry into week one where needed; intake has given the next pods enough context to start refinement.']
    ],
    design:[
      ['Design is refining the solution with the pod and PM, using early versions to make its thinking concrete without treating them as final.','V1 gives the pod a meaningful, revisable solution. Design participates in pitchback and attends the Engineering-led kickoff.'],
      ['The solution is being tested and iterated with implementation. Review the direction with the pod and relevant stakeholders.','The pod and stakeholders understand the direction, and Design Demo Day makes it visible to the company. Learning keeps informing the design and frontline context.'],
      ['Design is hardening the experience and progressively giving the pod what it needs to finish. Important unresolved questions are being settled with Engineering.','Most design work is complete. Engineering has the context it needs for the final push, without substantial design work arriving too late.'],
      ['Design is available for spot checks and finishing support while leaving real room for cooldown and light next-opportunity intake.','The delivered experience has been checked. Support continues where needed, and next-opportunity thinking remains light enough to preserve cooldown.']
    ],
    engineering:[
      ['The pod is working out its delivery approach while leaving space to cool down. Cross-pod dependencies are visible.','The pod can pitch its plan back to the PM. Engineering can lead the delivery kickoff with a shared understanding of the work and delivery approach.'],
      ['Implementation is exposing the important unknowns and large pieces of work. Prototypes give the pod something concrete to learn from.','Early working evidence makes the implementation path clearer. Design is iterating alongside the pod.'],
      ['The broad pieces are becoming working behavior, and remaining design questions are being resolved progressively.','The increment is tangible and describable. Product understands actual delivery state well enough to keep enabling the business.'],
      ['The increment is being rounded out and verified, with Design supporting the remaining checks. Next intake stays light.','Demo Day shows the working increment and its real release state. Finishing work and release exceptions are clear enough to carry forward intentionally.']
    ]
  };
  const focuses={product:{2:'PM planning check-in',4:'Opportunity list walkthrough',6:'Portfolio selection check-in'},design:{2:'Designer alignment check-in'},engineering:{2:'Cross-pod planning'}};
  const replaced=new Set(['PM planning check-in','Opportunity list walkthrough','Portfolio selection check-in','Designer alignment check-in','Cross-pod planning']);
  for(const [id,t] of Object.entries(O))t.blocks.forEach((b,i)=>{
    b.conditions=focus[id][i];
    b.events=b.events.filter(e=>!replaced.has(e.name)&&!['Milestone','Evidence','Focused work'].includes(e.kind));
    b.events.forEach(e=>{
      e.id=(e.when+'-'+e.name).toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
      if(e.name==='Develop the shared list')e.name='Opportunity working sessions';
      if(e.name==='Select and stack rank')e.name='Portfolio working sessions';
      if(e.name==='Prepare the investment proposal')e.name='Portfolio alignment';
      e.owner='To agree';e.attendees='To agree';e.inputs='To agree';e.outputs='To agree';
      if(e.name==='Delivery pitchback'){e.owner='Engineering / the delivery pod';e.attendees='The pod, its PM, and Design';e.inputs='The refined opportunity and the pod’s delivery approach';e.outputs='Shared understanding of the work and how the pod plans to deliver it';}
      if(e.name==='Delivery kickoff'){e.owner='Engineering';e.attendees='The full Build group; Design attends';e.inputs='The pods’ agreed delivery plans';e.outputs='A shared picture of the work beginning delivery';}
      if(e.name==='Portfolio Review'){e.attendees='Product and the business';e.inputs='The proposed, stack-ranked portfolio and trade-offs against capacity';e.outputs='The next investments the business has agreed to fund';}
      if(e.name==='Frontline enablement'){e.attendees='Product and the front line';e.inputs='Context accumulated from pitchback, kickoff, Design Demo Day, and delivery check-ins';e.outputs='The front line can explain and support the known work; remaining questions are explicit';}
      if(e.name.includes('Intake with pod leaders')||e.name==='Next-opportunity intake'){e.attendees='Product, Engineering leaders, and designers';e.inputs='Selected next opportunities and Product’s current thinking';e.outputs='Enough shared context to begin the next refinement';}
      if(e.name==='Delivery check-in'){e.attendees='The delivery pod and Product';e.inputs='The working increment, release state, and remaining risks';e.outputs='Product understands the work and can prepare the business';}
    });
    const weekly=[i*2+1,i*2+2].map(week=>({id:'weekly-'+week,when:'W'+week,kind:'Weekly meeting',name:t.name+' weekly',agenda:'Bring your agenda',focus:focuses[id][week]||'Focus TBD',note:'Bring the questions and decisions that matter now. Use the work already in progress, not a separate set of reporting deadlines.',owner:'To agree',attendees:t.name+' team',inputs:'Current work, questions, and decisions brought by participants',outputs:'Shared understanding and the decisions or help the work needs'}));
    if(id==='product'&&i===1)weekly[1].note='Walk through and understand the full opportunity list. This is not the portfolio selection meeting.';
    if(id==='product'&&i===2)weekly[1].note='Check the emerging, stack-ranked portfolio before Portfolio Review. Keep follow-up mostly asynchronous.';
    b.events=[...weekly,...b.events];
  });
  window.JAM_CHALLENGE={title:'Do what matters most. Change my mind.',stance:'This is the focus I’m proposing. If something else matters more, make the case and name what it should displace.',cards:[
    {title:'We have more work to do.',response:'Name it. What happens if we don’t do it? If the work on this map is already suffering, explain why doing it worse is worth adding something else.',ask:'Bring the consequence and the trade-off, not another list of things that feel important.'},
    {title:'I can’t skip those meetings.',response:'Why not? An invitation is not a strategic priority. For a 1:1, a Trimble meeting, or a new leadership request, explain what requires you to be there and why it is worth taking time from this work.',ask:'Keep the weekly function meeting and the collaboration that moves the work forward. Make the case for anything else.'},
    {title:'Important work is missing.',response:'Put it forward. Some belongs inside these focus areas. Some deserves to replace them. Some matters, but not as much. We cannot do everything, so let’s do what matters most and do it well.',ask:'Challenge the focus with a concrete alternative and say what should give way.'}
  ],inspectionTitle:'Inspect the work, not a calendar of artifacts.',inspection:'The work itself and simple weekly check-ins should show whether we are on track. Don’t add document deadlines for their own sake. Build enablement progressively from the work we already share, then close remaining release details as they become known.'};
})();

window.JAM_OPERATING_PLAN={"title": "Our delivery model needs to catch up.", "message": ["Growing operational strain threatens quality, reliable delivery, and our ability to scale.", "This reset gives Product, Design, and Engineering a clear focus, a way to collaborate, and explicit ownership.", "It protects time to do the work, coach the teams, and make the decisions that need leadership.", "It carries forward onboarding, practice, and reinforcement through clear expectations and accessible support.", "Our teams are delivering a lot with limited capacity. I’ll carry the operating changes through so we can sustain that success as we grow."], "principles": [["Protect the primary focus.", "Other demands must fit around it or explicitly displace it. Make SME work, support, and learning visible alongside delivery."], ["Collaborate from the work.", "Use shared context and working sessions. Combine repeated reporting and translations that add no distinct decision or understanding."], ["Keep support close.", "Preserve onboarding, coaching, and repeated practice. Match support to experience and work risk; make help easy to reach."], ["Inspect what is true.", "Use the work and focused check-ins to see readiness, risk, and capacity. Avoid extra document deadlines that exist only to report progress."], ["Make cooldown possible.", "Reduce competing demands during each function’s cooldown window. Responsibility for finishing and intake must leave actual room to reset."]], "owners": [["Chris · Product leadership", "Set Product direction and priorities, resolve capacity trade-offs, and preserve the coaching and reinforcement PMs need. Retain Product judgment; delegate routine operating coordination."], ["Kai · Design leadership", "Set Design direction and quality expectations, protect designer focus and cooldown, and coach where judgment is needed. While covering Product, make capacity limits and decisions requiring additional support explicit."], ["Ryan · Operating changes", "Turn this model into the working cadence: combine or stop duplicate touchpoints, maintain shared visibility, coordinate adoption, surface friction, and bring material trade-offs to the relevant leader. Carry the follow-through."], ["Lee · Engineering partnership", "Proposed: protect pod access to Product and Design, resolve cross-pod dependencies, and align the Engineering-led planning, pitchback, kickoff, and delivery rhythm with this model. Confirm this remit with Lee."], ["PMs · Product work", "Own opportunity framing, portfolio recommendations, pod collaboration, and progressive frontline context. Make SME demands and competing work visible; surface trade-offs before absorbing more."], ["Designers · Design work", "Own solution exploration, iteration, quality, and progressive readiness with their pods. Organize collaboration, surface unresolved decisions, and balance finishing support with cooldown."], ["Engineers and QA · Delivery work", "Own implementation planning, working increments, verification, and clear delivery state within the pod. Bring unknowns and dependencies forward while there is time to act."], ["Each functional team and delivery pod", "Organize work between shared checkpoints, keep context visible, and seek help when capacity or readiness is at risk. Leaders own priority and capacity decisions; teams should not have to resolve overload by working longer."]], "execution": [["Align", "Chris, Kai, Ryan, and Lee confirm focus, retained decision rights, essential support, and Ryan’s operating remit. Resolve material objections against concrete alternatives."], ["Translate", "Ryan maps current meetings, reporting, and support into the new cadence with the teams: keep, combine, stop, or replace. Name owners and preserve useful onboarding and coaching."], ["Run", "Introduce the agreed changes in the work already underway, with a clear start point for each. Ryan coordinates follow-through; teams organize the work; functional leaders remain available for judgment and coaching."], ["Adjust", "Use existing weekly meetings and the cycle-end review to check access to collaborators, competing demands, readiness, and cooldown. Ryan brings friction and proposed adjustments; the relevant leader resolves priority or capacity changes."]]};

(() => {
  const O=window.JAM_OVERVIEW,M=window.JAM_MODEL;
  const approaches={
    product:[['Keep open time for pod conversations; settle the delivery approach together.','Close previous-release and frontline gaps alongside refinement.'],['Learn from customer and business evidence, recent releases, and available capacity.','Keep the full candidate set visible and open to ideas from across the business; avoid prescribing the solution.'],['Compare the full list against capacity; make the investment rationale and trade-offs explicit.','Give the business enough context to invest while leaving pods room to shape the solution.'],['Build frontline understanding from the work already shared throughout the cycle.','Keep next-opportunity intake light; close remaining release details as they stabilize.']],
    design:[['Use successive, disposable solution versions to build understanding with the PM and engineers.','V1 is meaningful and revisable; keep the early investment affordable to throw away.'],['Test and refine alongside implementation; carry what the pod learns back into the experience.','Review with the pod and stakeholders before showing the direction at Design Demo Day.'],['Settle the experience and remaining context progressively with the pod.','Week-six pencils down means Engineering can finish without substantial late design work; support continues.'],['Spot-check and support QA while keeping next-opportunity thinking light and disposable.','Stay available to the pod without filling the cooldown window with another design push.']],
    engineering:[['Self-organize planning and cooldown; surface dependencies across pods.','Pitch the delivery approach back to the PM, then lead the shared kickoff.'],['Use prototypes and working evidence to uncover unknowns and the large implementation pieces.','Learn with Design as the solution takes shape.'],['Turn the broad pieces into working behavior and settle design questions progressively.','Make the increment, release state, and remaining risks clear enough for Product to explain.'],['Round out and verify the increment with Design and QA.','Show actual value and release state at Demo Day; keep next intake light.']]
  };
  const matches={
    'Delivery pitchback':'pitchback','Delivery kickoff':'pitchback',
    '3. Design Demo Day':'designdemo','Portfolio Review':'portfolio',
    'Delivery check-in':'deliverycheck','Frontline enablement':'enablement',
    'Intake with pod leaders':'intake','Next-opportunity intake':'intake','Demo Day & delivery':'demoday'
  };
  Object.entries(O).forEach(([team,t])=>t.blocks.forEach((b,i)=>{
    b.approach=approaches[team][i];
    b.events.forEach(e=>{
      const match=e.id==='weekly-4'&&team==='product'?'candidates':matches[e.name];
      const m=M.milestones.find(m=>m.id===match);
      if(!m)return;
      e.evidence=m.evidence;e.readinessNote=m.note;
      if(e.name==='Delivery pitchback'||e.name==='Delivery kickoff')e.readinessNote='Pods self-organize pitchbacks with their PMs; Engineering leads the full-group kickoff. Use the agreed delivery approach to build shared understanding.';
      if(match==='candidates')e.readinessNote='Walk through the full candidate set in the week-four Product weekly. Understand the possibilities before selecting the portfolio.';
      e.inputs=m.evidence.join('; ');
      e.outputs=m.outcomes.join('; ');
      if(e.attendees==='To agree')e.attendees=m.people;
    });
  }));
})();

(() => {
  const O=window.JAM_OVERVIEW;
  const shared=[
    ['Agree on the delivery approach','', 'Current cycle', ['Pods, Product, and Design refine the selected work together.','Delivery kickoff gives everybody a shared understanding of the plans.']],
    ['Understand the emerging experience','', 'Current cycle', ['Working evidence and design iteration make the direction concrete.','Design Demo Day shares the emerging experience across the organization.']],
    ['Make readiness and trade-offs clear','', 'Current + next', ['Current delivery state and remaining questions are visible.','Design, delivery readiness, and next investment decisions give teams the context to finish and prepare.']],
    ['Finish and share the work','', 'Current + next', ['Teams support current delivery and keep next intake light.','Demo Day shows the working increment, its value, and its actual release state.']]
  ];
  O.everybody={name:'Everybody',blocks:shared.map(([primary,secondary,context,conditions])=>({primary,secondary,context,conditions,approach:[conditions[0]],events:[]}))};
  const selected=[['engineering',0,'Delivery kickoff'],['design',1,'3. Design Demo Day'],['engineering',3,'Demo Day & delivery']];
  selected.forEach(([team,i,name])=>{
    const e=O[team].blocks[i].events.find(e=>e.name===name);
    if(e)O.everybody.blocks[i].events.push({...e,editTeam:team});
  });
  for(const team of ['product','design','engineering'])O[team].blocks.forEach(b=>{
    b.events=b.events.filter(e=>!['Delivery kickoff','3. Design Demo Day','Demo Day & delivery'].includes(e.name));
  });
})();
