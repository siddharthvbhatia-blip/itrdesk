(function(){
  'use strict';
  const format=value=>'₹'+Math.round(Math.max(0,Number(value)||0)).toLocaleString('en-IN');
  function calculateHra({basic=0,da=0,commission=0,hra=0,rent=0,metroRate=40}){
    const salary=Math.max(0,basic)+Math.max(0,da)+Math.max(0,commission);
    const actual=Math.max(0,hra),rentTest=Math.max(0,Math.max(0,rent)-(salary*.10)),locationTest=salary*(Number(metroRate)/100);
    return {salary,actual,rentTest,locationTest,exemption:Math.min(actual,rentTest,locationTest)};
  }
  function calculateAdvancePlan({netTax=0,route='regular',seniorException=false}){
    const tax=Math.max(0,Number(netTax)||0);
    if(seniorException)return {kind:'senior-exception',tax,schedule:[]};
    if(tax<10000)return {kind:'below-threshold',tax,schedule:[]};
    if(route==='presumptive')return {kind:'presumptive',tax,schedule:[{date:'15 March 2026',percent:100,amount:tax}]};
    return {kind:'regular',tax,schedule:[['15 June 2025',15],['15 September 2025',45],['15 December 2025',75],['15 March 2026',100]].map(([date,percent])=>({date,percent,amount:tax*percent/100}))};
  }
  function calculateLateFee({mandatory=true,totalIncome=0,dueDate,filingDate}){
    const income=Math.max(0,Number(totalIncome)||0),due=new Date(`${dueDate}T00:00:00`),filed=new Date(`${filingDate}T00:00:00`);
    if(Number.isNaN(due.getTime())||Number.isNaN(filed.getTime()))return {invalid:true,fee:0};
    const late=mandatory&&filed>due;
    return {invalid:false,mandatory,late,fee:late?(income<=500000?1000:5000):0,due,filed,afterBelated:filed>new Date('2026-12-31T00:00:00')};
  }
  if(typeof document==='undefined'){
    if(typeof module!=='undefined')module.exports={calculateHra,calculateAdvancePlan,calculateLateFee};
    return;
  }
  const number=(data,name)=>Math.max(0,Number(data.get(name))||0);
  const show=(id,html)=>{const element=document.getElementById(id);element.innerHTML=html;element.hidden=false;};
  const track=(name,details)=>{if(typeof window.ITRDeskTrack==='function')window.ITRDeskTrack(name,details);};

  const hra=document.getElementById('hraTool');
  if(hra)hra.addEventListener('submit',event=>{
    event.preventDefault();
    const data=new FormData(hra);
    const result=calculateHra({basic:number(data,'basic'),da:number(data,'da'),commission:number(data,'commission'),hra:number(data,'hra'),rent:number(data,'rent'),metroRate:Number(data.get('metro'))});
    show('hraResult',`<h3>Indicative HRA exemption</h3><strong class="big-result">${format(result.exemption)}</strong><ul class="result-list"><li><span>Actual HRA received</span><strong>${format(result.actual)}</strong></li><li><span>Rent minus 10% of salary</span><strong>${format(result.rentTest)}</strong></li><li><span>${data.get('metro')}% of eligible salary</span><strong>${format(result.locationTest)}</strong></li></ul><small>Least of the three amounts is shown. Nil is used where rent minus 10% of salary is negative. Confirm the relevant salary period, rent evidence and old-regime eligibility.</small>`);
    track('hra_result',{metro:data.get('metro')});
  });

  const advance=document.getElementById('advanceTaxTool');
  if(advance)advance.addEventListener('submit',event=>{
    event.preventDefault();
    const data=new FormData(advance);
    const exception=data.get('seniorException')==='on';
    const route=data.get('route');
    const plan=calculateAdvancePlan({netTax:number(data,'netTax'),route,seniorException:exception});
    const tax=plan.tax;
    let html='<h3>Advance-tax starting check</h3>';
    if(plan.kind==='senior-exception')html+=`<strong class="big-result">No advance-tax liability indicated</strong><p>The selected resident-senior-citizen exception applies only where there is no income chargeable under “Profits and gains of business or profession”. Confirm both conditions.</p>`;
    else if(plan.kind==='below-threshold')html+=`<strong class="big-result">Below the ₹10,000 threshold</strong><p>On the amount entered, section 208 advance tax is not indicated. Recalculate if estimated tax changes.</p>`;
    else if(plan.kind==='presumptive')html+=`<strong class="big-result">${format(tax)} by 15 March 2026</strong><p>An eligible section 44AD or 44ADA presumptive taxpayer may pay the whole advance tax by 15 March. Tax paid by 31 March is also treated as advance tax, but interest consequences require separate checking.</p>`;
    else{
      html+=`<strong class="big-result">${format(tax)} estimated net tax</strong><ul class="result-list">${plan.schedule.map(item=>`<li><span>${item.date} • cumulative ${item.percent}%</span><strong>${format(item.amount)}</strong></li>`).join('')}</ul><small>Amounts are cumulative, not additional instalments. Capital gains, dividend and other later-arising income can affect section 234C treatment.</small>`;
    }
    show('advanceTaxResult',html);track('advance_tax_result',{route,exception:String(exception)});
  });

  const late=document.getElementById('lateFeeTool');
  if(late)late.addEventListener('submit',event=>{
    event.preventDefault();
    const data=new FormData(late);
    const income=number(data,'totalIncome');
    const result=calculateLateFee({mandatory:data.get('mandatory')==='yes',totalIncome:income,dueDate:data.get('dueDate'),filingDate:data.get('filingDate')});
    if(result.invalid){show('lateFeeResult','<h3>Please enter valid dates.</h3>');return;}
    let reason='No section 234F fee is indicated.';
    if(!result.mandatory)reason='You selected that filing was not mandatory. Section 234F ordinarily applies where a person required to furnish the return fails to do so within the prescribed time.';
    else if(result.late)reason=`The selected filing date is after ${result.due.toLocaleDateString('en-IN',{day:'numeric',month:'long',year:'numeric'})}.`;
    else reason='The selected filing date is on or before the selected due date.';
    show('lateFeeResult',`<h3>Indicative section 234F fee</h3><strong class="big-result">${format(result.fee)}</strong><p>${reason}</p>${result.afterBelated?'<p><strong>Separate check required:</strong> the selected date is after 31 December 2026, so ordinary belated-return availability and any updated-return route require independent review.</p>':''}<small>This result excludes interest, additional tax, loss restrictions and every consequence other than section 234F.</small>`);
    track('late_fee_result',{fee:String(result.fee)});
  });
})();
