window.JAM_OVERVIEW = {
  product: {
    name: 'Product',
    blocks: [
      {primary:'Refine with the pods',secondary:'Finish previous releases',context:'Current + previous',events:[
        {when:'W1–2',kind:'Self-led',name:'Refinement with the pods',note:'PMs stay available as pods refine the selected work.'},
        {when:'W2',kind:'Meeting',name:'PM planning check-in',note:'Check that the pods have what they need to begin delivery.'},
        {when:'End W2',kind:'Pod-led',name:'Delivery pitchback',note:'The pod pitches its delivery approach back to the PM.'},
        {when:'W2 / 3',kind:'Engineering-led',name:'Delivery kickoff',note:'Engineering shares the delivery plans with the full group.'}
      ]},
      {primary:'Build the next opportunity list',secondary:'',context:'Next cycle',cooldown:true,events:[
        {when:'W3–4',kind:'Self-led',name:'Develop the shared list',note:'PMs work independently and connect with Product leaders. Include ideas from all functions and the business; keep the list visible and work mostly async.'},
        {when:'End W4',kind:'Meeting',name:'Opportunity list walkthrough',note:'Confirm and understand the full candidate set. This starts portfolio selection; it does not select the portfolio.'}
      ]},
      {primary:'Choose the next portfolio',secondary:'',context:'Next cycle',events:[
        {when:'W5–6',kind:'Self-led',name:'Select and stack rank',note:'PMs and the Product team compare the full list, trade priorities against capacity, and form a smaller, stack-ranked portfolio.'},
        {when:'W5 / early W6',kind:'Meeting',name:'Portfolio selection check-in',note:'Compare the emerging choices. The exact slot is still open.'},
        {when:'End W6',kind:'Business meeting',name:'Portfolio Review',note:'The business reviews and commits to the selected investments.'}
      ]},
      {primary:'Enable the front line',secondary:'Next-cycle opportunity intake',context:'Current + next',events:[
        {when:'Start W7',kind:'Meeting',name:'Frontline enablement',note:'Prepare the business for the current releases.'},
        {when:'Start W8',kind:'Meeting',name:'Frontline enablement',note:'Close the remaining release context and readiness gaps.'},
        {when:'W7–8',kind:'Self-led',name:'Intake with pod leaders',note:'Work through the selected opportunities with Engineering and Design leaders. Keep early context and collaboration light.'}
      ]}
    ]
  },
  design: {
    name:'Design',
    blocks:[
      {primary:'Refine the solution',secondary:'Prepare the V1 design',context:'Current cycle',events:[
        {when:'W1–2',kind:'Pod-led',name:'Solution refinement',note:'Work directly with PMs and engineers to refine the solution.'},
        {when:'Start W2',kind:'Meeting',name:'Designer alignment check-in',note:'Compare work across designers. Continue mostly async toward V1.'},
        {when:'End W2',kind:'Milestone',name:'V1 design',note:'A meaningful, revisable solution increment, not a final design.'},
        {when:'End W2',kind:'Pod-led',name:'Delivery pitchback',note:'Design is part of the pod’s pitchback to the PM.'},
        {when:'W2 / 3',kind:'Engineering-led',name:'Delivery kickoff',note:'Design attends while Engineering presents the delivery plans.'}
      ]},
      {primary:'Iterate on designs',secondary:'Prepare for Design Demo Day',context:'Current cycle',events:[
        {when:'W3–4',kind:'Focused work',name:'Iterate, align, harden, and test',note:'Stay close to the implementation and refine the experience.'},
        {when:'W3–4',kind:'Meeting',name:'2. Pod + stakeholder review',note:'Work through the direction with the pod and relevant stakeholders next.'},
        {when:'Phase end',kind:'Company meeting',name:'3. Design Demo Day',note:'Show the emerging experience to the whole company. Exact review slots remain open.'}
      ]},
      {primary:'Harden and finish designs',secondary:'Prepare the pod handoff',context:'Current cycle',events:[
        {when:'End W6',kind:'Milestone',name:'Design pencils down',note:'Most design work is complete before Engineering’s final push. This is not a separate required meeting or the end of pod support.'}
      ]},
      {primary:'Support the final delivery',secondary:'Next-cycle opportunity intake',context:'Current + next',cooldown:true,events:[
        {when:'W7–8',kind:'Self-led',name:'Intake with pod leaders',note:'Think through the next opportunities with the other leaders. Keep this light alongside cooldown and finishing support.'}
      ]}
    ]
  },
  engineering: {
    name:'Engineering',
    blocks:[
      {primary:'Plan & ramp up',secondary:'Cool down after the last delivery',context:'Current cycle',cooldown:true,events:[
        {when:'W1–2',kind:'Pod-led',name:'Planning and refinement',note:'The pod organizes its plan and balances preparation with cooldown.'},
        {when:'W2',kind:'Function meeting',name:'Cross-pod planning',note:'Engineering leaders discuss dependencies and work across pods.'},
        {when:'End W2',kind:'Pod-led',name:'Delivery pitchback',note:'Engineering leads the pod’s delivery approach back to the PM, with Design participating.'},
        {when:'W2 / 3',kind:'Engineering-led',name:'Delivery kickoff',note:'Engineering presents the plans to the full group; Product and Design attend.'}
      ]},
      {primary:'Explore & prototype',secondary:'Uncover the big pieces',context:'Current cycle',events:[
        {when:'W3–4',kind:'Focused work',name:'Explore the implementation',note:'Learn, uncover unknowns, prototype, and flesh out the large pieces while Design iterates.'},
        {when:'W3–4',kind:'Evidence',name:'Working prototype, where useful',note:'Make the early work tangible. This does not add an Engineering meeting.'}
      ]},
      {primary:'Mature the increment',secondary:'Round out implementation',context:'Current cycle',events:[
        {when:'W5–6',kind:'Focused work',name:'Round out the increment',note:'Develop working behavior and resolve design questions progressively with Design.'},
        {when:'W5–6',kind:'Pod + Product',name:'Delivery check-in',note:'Make actual delivery state clear enough for Product to explain and enable the business. Exact timing remains open.'}
      ]},
      {primary:'Finish & deliver',secondary:'Look at next work lightly',context:'Current + next',events:[
        {when:'W7–8',kind:'Focused work',name:'Finish and verify',note:'Round out the current increment with Design’s remaining spot checks and quality support.'},
        {when:'W7–8',kind:'Self-led',name:'Next-opportunity intake',note:'Keep next-cycle thinking light during the final delivery push.'},
        {when:'End W8',kind:'Shared meeting',name:'Demo Day & delivery',note:'Show the viable working increment and actual release state.'}
      ]}
    ]
  }
};
