(function(){
  'use strict';
  const $=id=>document.getElementById(id), form=$('taxCalculator');
  if(!form)return;
  const moneyIds=['salaryIncome','houseIncome','businessIncome','dividendIncome','otherIncome','agriculturalIncome','deduction80C','deduction80D','deductionNPS','otherOldDeductions','commonDeductions','stcg111A','stcg115AD','ltcg112A','ltcg112','propertyGainNoIndex','propertyGainIndexed','customCapitalGain','lotteryIncome','onlineGamingIncome','vdaIncome','unexplainedIncome','patentIncome','carbonCreditIncome','nriDividendIncome','nriInterestIncome','nriRoyaltyFtsIncome','otherSpecialIncome','otherSpecialIncome2','adjustedTotalIncome','amtCredit','relief89','foreignTaxRelief','interest234','lateFee','tdsPaid','tcsPaid','advanceTaxPaid','selfAssessmentPaid'];
  const rateIds=['customCapitalRate','otherSpecialRate','otherSpecialRate2'];
  let lastComputation=null;
  const rupees=n=>{const sign=n<0?'-':'';return sign+'₹'+Math.round(Math.abs(n)).toLocaleString('en-IN')};
  const round10=n=>Math.round(n/10)*10;
  function num(id){const raw=String($(id).value||'').replace(/,/g,'').trim();if(raw===''||raw==='-')return 0;const value=Number(raw);return Number.isFinite(value)?value:NaN}
  function slabTax(income,slabs){let tax=0,lower=0;for(const [upper,rate] of slabs){tax+=Math.max(0,Math.min(income,upper)-lower)*rate;if(income<=upper)break;lower=upper}return tax}
  const newSlabs=[[400000,0],[800000,.05],[1200000,.10],[1600000,.15],[2000000,.20],[2400000,.25],[Infinity,.30]];
  function oldSlabs(age,resident,type){let basic=250000;if(type==='individual'&&resident&&age==='60to79')basic=300000;if(type==='individual'&&resident&&age==='80plus')basic=500000;return [[basic,0],[500000,.05],[1000000,.20],[Infinity,.30]]}
  function basicExemption(isNew,age,resident,type){if(isNew)return 400000;if(type==='individual'&&resident&&age==='60to79')return 300000;if(type==='individual'&&resident&&age==='80plus')return 500000;return 250000}
  function surchargeRate(income,isNew){if(income>50000000)return isNew?.25:.37;if(income>20000000)return .25;if(income>10000000)return .15;if(income>5000000)return .10;return 0}
  function priorSurchargeBand(income,isNew){if(income>50000000&&!isNew)return [50000000,.25];if(income>20000000)return [20000000,.15];if(income>10000000)return [10000000,.10];if(income>5000000)return [5000000,0];return null}
  function normalTax(income,agri,isNew,age,resident,type){const slabs=isNew?newSlabs:oldSlabs(age,resident,type),basic=basicExemption(isNew,age,resident,type);if(agri>5000&&income>basic&&resident){return Math.max(0,slabTax(income+agri,slabs)-slabTax(basic+agri,slabs))}return slabTax(income,slabs)}
  function showError(message){const el=$('calcError');el.textContent=message;el.hidden=!message}
  function component(key,label,amount,rate,surchargeMode='general',fixedSurcharge=0){return {key,label,amount:Math.max(0,amount),tax:Math.max(0,amount)*rate,surchargeMode,fixedSurcharge}}
  function prepareInputs(){const v={};for(const id of moneyIds.concat(rateIds)){v[id]=num(id);if(!Number.isFinite(v[id]))throw new Error('Please enter valid numeric amounts only.')}for(const id of moneyIds.filter(id=>id!=='houseIncome'))if(v[id]<0)throw new Error('Only house-property income may be entered as a negative amount. Enter capital gains and other special income after permitted loss set-off.');for(const id of rateIds)if(v[id]<0||v[id]>100)throw new Error('Custom special rates must be between 0% and 100%.');v.type=$('assesseeType').value;v.resident=$('residentialStatus').value==='resident';v.age=$('taxpayerAge').value;v.customCapitalSurcharge=$('customCapitalSurcharge').value;v.otherSpecialSurcharge=$('otherSpecialSurcharge').value;v.otherSpecialSurcharge2=$('otherSpecialSurcharge2').value;if(v.type==='huf'&&v.salaryIncome>0)throw new Error('A HUF cannot report salary or pension income. Move only eligible HUF income to the correct head.');if(v.type==='huf'&&v.relief89>0)throw new Error('Relief under section 89 cannot be claimed by a HUF.');return v}
  function calculate(isNew,v){
    const basic=basicExemption(isNew,v.age,v.resident,v.type),standard=Math.min(v.salaryIncome,isNew?75000:50000);
    const house=isNew?Math.max(0,v.houseIncome):Math.max(-200000,v.houseIncome);
    const grossNormal=Math.max(0,v.salaryIncome+v.businessIncome+v.dividendIncome+v.otherIncome+house);
    const oldOnly=Math.min(150000,v.deduction80C)+v.deduction80D+Math.min(50000,v.deductionNPS)+v.otherOldDeductions;
    const deductions=Math.min(grossNormal,standard+v.commonDeductions+(isNew?0:oldOnly));
    const normalIncome=Math.max(0,round10(grossNormal-deductions));
    const specialGross=v.stcg111A+v.stcg115AD+v.ltcg112A+v.ltcg112+v.propertyGainNoIndex+v.customCapitalGain+v.lotteryIncome+v.onlineGamingIncome+v.vdaIncome+v.unexplainedIncome+v.patentIncome+v.carbonCreditIncome+v.nriDividendIncome+v.nriInterestIncome+v.nriRoyaltyFtsIncome+v.otherSpecialIncome+v.otherSpecialIncome2;
    const totalIncome=round10(normalIncome+specialGross);
    let gap=(v.resident&&(v.type==='individual'||v.type==='huf'))?Math.max(0,basic-normalIncome):0;
    function absorb(amount){const used=Math.min(gap,Math.max(0,amount));gap-=used;return Math.max(0,amount-used)}
    const adj111A=absorb(v.stcg111A);
    const propertyNoIndex=absorb(v.propertyGainNoIndex);
    const propertyIndexed=v.propertyGainNoIndex>0?Math.max(0,v.propertyGainIndexed-(v.propertyGainNoIndex-propertyNoIndex)):0;
    const adj112=absorb(v.ltcg112);
    const adjCustomCG=absorb(v.customCapitalGain);
    const adj112A=absorb(v.ltcg112A);
    const taxable112A=Math.max(0,adj112A-125000);
    const propertyTax=(v.resident&&(v.type==='individual'||v.type==='huf')&&v.propertyGainNoIndex>0&&v.propertyGainIndexed>=0)?Math.min(propertyNoIndex*.125,propertyIndexed*.20):propertyNoIndex*.125;
    const propertyEffectiveRate=propertyNoIndex?propertyTax/propertyNoIndex:0;
    const components=[
      component('111A','STCG — section 111A',adj111A,.20,'cap15'),
      component('115AD30','FII/FPI STCG — section 115AD',v.stcg115AD,.30),
      component('112A','LTCG — section 112A (after ₹1.25 lakh threshold)',taxable112A,.125,'cap15'),
      component('112','Other LTCG — section 112',adj112,.125,'cap15'),
      component('property','Legacy property LTCG — lower-tax comparison',propertyNoIndex,propertyEffectiveRate,'cap15'),
      component('customCG','Other / DTAA capital gain',adjCustomCG,v.customCapitalRate/100,v.customCapitalSurcharge),
      component('115BB','Lottery / race / specified games — section 115BB',v.lotteryIncome,.30),
      component('115BBJ','Online gaming — section 115BBJ',v.onlineGamingIncome,.30),
      component('115BBH','Virtual digital assets — section 115BBH',v.vdaIncome,.30),
      component('115BBE','Unexplained income — section 115BBE',v.unexplainedIncome,.60,'fixed',.25),
      component('115BBF','Patent royalty — section 115BBF',v.patentIncome,.10),
      component('115BBG','Carbon credits — section 115BBG',v.carbonCreditIncome,.10),
      component('115ADividend','Non-resident dividend — section 115A',v.nriDividendIncome,.20,'cap15'),
      component('115AInterest','Specified non-resident interest',v.nriInterestIncome,.05),
      component('115ARoyalty','Non-resident royalty / FTS — section 115A',v.nriRoyaltyFtsIncome,.20),
      component('otherSpecial','Other / DTAA special-rate income 1',v.otherSpecialIncome,v.otherSpecialRate/100,v.otherSpecialSurcharge),
      component('otherSpecial2','Other / DTAA special-rate income 2',v.otherSpecialIncome2,v.otherSpecialRate2/100,v.otherSpecialSurcharge2)
    ];
    let slab=normalTax(normalIncome,v.agriculturalIncome,isNew,v.age,v.resident,v.type);
    const taxableDividend=Math.min(v.dividendIncome,normalIncome);
    const slabWithoutDividend=normalTax(Math.max(0,normalIncome-taxableDividend),v.agriculturalIncome,isNew,v.age,v.resident,v.type);
    let dividendTax=Math.max(0,slab-slabWithoutDividend),otherNormalTax=Math.max(0,slab-dividendTax);
    let specialTax=components.reduce((sum,c)=>sum+c.tax,0),baseTax=slab+specialTax,rebate=0;
    if(v.type==='individual'&&v.resident){
      if(isNew&&totalIncome<=1200000)rebate=Math.min(60000,slab);
      if(isNew&&totalIncome>1200000)rebate=Math.max(0,slab-Math.min(slab,Math.max(0,totalIncome-1200000)));
      if(!isNew&&totalIncome<=500000){const excluded=(components.find(c=>c.key==='112A')?.tax||0)+(components.find(c=>c.key==='115BBE')?.tax||0);rebate=Math.min(12500,Math.max(0,baseTax-excluded));}
    }
    const normalAfter=Math.max(0,slab-rebate),normalRatio=slab?normalAfter/slab:0;otherNormalTax*=normalRatio;dividendTax*=normalRatio;
    const generalSurcharge=surchargeRate(totalIncome,isNew);
    let surcharge=otherNormalTax*generalSurcharge+dividendTax*Math.min(.15,generalSurcharge);
    for(const c of components){let rate=generalSurcharge;if(c.surchargeMode==='cap15')rate=Math.min(.15,generalSurcharge);if(c.surchargeMode==='none')rate=0;if(c.surchargeMode==='fixed')rate=c.fixedSurcharge;c.surcharge=c.tax*rate;}
    surcharge+=components.reduce((sum,c)=>sum+c.surcharge,0);
    const priorBand=priorSurchargeBand(totalIncome,isNew);
    if(priorBand&&specialGross===0&&v.dividendIncome===0){const [threshold,lowerRate]=priorBand,referenceTax=normalTax(threshold,v.agriculturalIncome,isNew,v.age,v.resident,v.type),referenceWithSurcharge=referenceTax*(1+lowerRate),maximumTaxAndSurcharge=referenceWithSurcharge+(totalIncome-threshold);surcharge=Math.min(surcharge,Math.max(0,maximumTaxAndSurcharge-(baseTax-rebate)));}
    let taxAfterRebate=baseTax-rebate,regularBeforeCess=taxAfterRebate+surcharge,cess=regularBeforeCess*.04,regularGrossTax=regularBeforeCess+cess,amtTotal=0;
    if(!isNew&&v.adjustedTotalIncome>2000000){const amtBase=v.adjustedTotalIncome*.185,amtSurcharge=amtBase*surchargeRate(v.adjustedTotalIncome,false);amtTotal=(amtBase+amtSurcharge)*1.04;}
    const grossBeforeCredit=Math.max(regularGrossTax,amtTotal),amtIncrease=Math.max(0,amtTotal-regularGrossTax),amtCreditAllowed=isNew?0:Math.min(v.amtCredit,Math.max(0,regularGrossTax-amtTotal));
    const afterAmtCredit=Math.max(0,grossBeforeCredit-amtCreditAllowed),otherReliefs=Math.min(afterAmtCredit,v.relief89+v.foreignTaxRelief),reliefs=amtCreditAllowed+otherReliefs,afterRelief=Math.max(0,grossBeforeCredit-reliefs),interestFee=v.interest234+v.lateFee,taxesPaid=v.tdsPaid+v.tcsPaid+v.advanceTaxPaid+v.selfAssessmentPaid,balance=round10(afterRelief+interestFee-taxesPaid),grossTax=grossBeforeCredit;
    return {isNew,normalIncome,specialGross,totalIncome,slab,specialTax,baseTax,rebate,surcharge,cess,amtIncrease,grossTax:round10(grossTax),reliefs:round10(reliefs),netTax:round10(afterRelief),interestFee:round10(interestFee),taxesPaid:round10(taxesPaid),balance,components,basic,deductions,propertyTax};
  }
  function render(){let v;try{v=prepareInputs()}catch(error){showError(error.message);return false}showError('');$('taxpayerAge').disabled=v.type!=='individual'||!v.resident;
    const newer=calculate(true,v),older=calculate(false,v),map={NormalIncome:'normalIncome',SpecialIncome:'specialGross',Taxable:'totalIncome',NormalTax:'slab',SpecialTax:'specialTax',Rebate:'rebate',Surcharge:'surcharge',Cess:'cess',AmtIncrease:'amtIncrease',GrossTax:'grossTax',Reliefs:'reliefs',InterestFee:'interestFee',TaxesPaid:'taxesPaid',Balance:'balance'};
    for(const [suffix,key] of Object.entries(map)){if($('new'+suffix))$('new'+suffix).textContent=rupees(newer[key]);if($('old'+suffix))$('old'+suffix).textContent=rupees(older[key]);}
    $('newTotalTax').textContent=rupees(newer.grossTax);$('oldTotalTax').textContent=rupees(older.grossTax);
    const hasIncome=newer.totalIncome>0||v.agriculturalIncome>0;if(!hasIncome){$('bestRegime').textContent='Enter your income';$('estimatedSaving').textContent='Your complete comparison will appear here.'}
    else if(newer.netTax===older.netTax){$('bestRegime').textContent='Both estimates are equal';$('estimatedSaving').textContent='Check regime eligibility and non-tax considerations.'}
    else{const n=newer.netTax<older.netTax;$('bestRegime').textContent=(n?'New':'Old')+' regime estimates lower';$('estimatedSaving').textContent='Estimated tax-after-relief difference: '+rupees(Math.abs(newer.netTax-older.netTax));}
    const chosen=newer.netTax<=older.netTax?newer:older;$('positionRegime').textContent='Using the '+(chosen.isNew?'new':'old')+' regime estimate';$('positionLabel').textContent=chosen.balance>=0?'Estimated balance payable':'Estimated refund';$('finalPosition').textContent=rupees(Math.abs(chosen.balance));
    lastComputation={version:'AY2026-27-v1',assessmentYear:'2026-27',financialYear:'2025-26',calculatedAt:new Date().toISOString(),inputs:v,newRegime:newer,oldRegime:older,recommendedRegime:chosen.isNew?'new':'old'};
    const rows=[];for(let i=0;i<newer.components.length;i++){const n=newer.components[i],o=older.components[i];if(n.amount>0||o.amount>0)rows.push('<tr><td>'+n.label+'</td><td>'+rupees(n.tax)+'</td><td>'+rupees(o.tax)+'</td></tr>');}$('specialBreakdown').innerHTML=rows.length?rows.join(''):'<tr><td colspan="3">No special-rate income entered.</td></tr>';
    const warnings=[];if(v.businessIncome>0)warnings.push('Business/profession income entered: verify section 115BAC regime-switching and Form 10-IEA requirements.');if(!v.resident&&v.dividendIncome>0)warnings.push('Non-resident dividend was entered at normal slab rates. If section 115A or a DTAA applies, move it to the non-resident dividend or a custom special-rate field.');if(v.resident&&(v.nriDividendIncome>0||v.nriInterestIncome>0||v.nriRoyaltyFtsIncome>0))warnings.push('A non-resident special-rate field was used for a resident taxpayer. Confirm that the selected section is legally available.');if(v.customCapitalGain>0||v.otherSpecialIncome>0||v.otherSpecialIncome2>0)warnings.push('A custom/DTAA rate was used. Confirm treaty eligibility, TRC/Form 10F, surcharge, cess and beneficial-rate conditions.');if(v.propertyGainNoIndex>0&&!v.resident)warnings.push('Legacy-property lower-tax protection requires a resident individual or HUF and qualifying acquisition date.');if(v.ltcg112A>0)warnings.push('Section 112A threshold is applied after basic-exemption adjustment; verify STT and grandfathering conditions.');if(newer.totalIncome>5000000||older.totalIncome>5000000)warnings.push('Surcharge rates and category caps are applied; mixed-income marginal-relief edge cases should be reconciled with the ITR utility.');if(v.agriculturalIncome>5000)warnings.push('Agricultural-income rate integration is applied where the statutory conditions are met.');if(v.adjustedTotalIncome>0&&v.adjustedTotalIncome<=2000000)warnings.push('AMT was not applied because entered adjusted total income does not exceed ₹20 lakh.');if(v.amtCredit>0)warnings.push('AMT credit is ignored under the new regime and restricted under the old regime to regular tax exceeding current-year AMT. Reconcile it with Schedule AMTC.');if(v.relief89>0&&v.salaryIncome===0)warnings.push('Section 89 relief requires eligible salary or family-pension income; confirm the amount with Form 10E.');if(v.interest234===0&&(chosen.balance>10000))warnings.push('Interest under sections 234A/234B/234C was entered as nil. Check advance-tax and filing dates before relying on the balance.');$('calculationWarnings').hidden=!warnings.length;$('warningList').innerHTML=warnings.map(w=>'<li>'+w+'</li>').join('');return true;
  }
  form.addEventListener('submit',e=>{e.preventDefault();if(render())document.querySelector('.calc-results').scrollIntoView({behavior:'smooth',block:'start'})});
  $('resetCalculator').addEventListener('click',()=>{moneyIds.forEach(id=>$(id).value='0');$('customCapitalRate').value='12.5';$('otherSpecialRate').value='20';$('otherSpecialRate2').value='10';$('customCapitalSurcharge').value='cap15';$('otherSpecialSurcharge').value='general';$('otherSpecialSurcharge2').value='general';$('assesseeType').value='individual';$('residentialStatus').value='resident';$('taxpayerAge').value='below60';render()});
  ['assesseeType','residentialStatus','taxpayerAge','customCapitalSurcharge','otherSpecialSurcharge','otherSpecialSurcharge2'].forEach(id=>$(id).addEventListener('change',render));moneyIds.forEach(id=>$(id).addEventListener('blur',()=>{const v=num(id);if(Number.isFinite(v))$(id).value=v.toLocaleString('en-IN')}));window.ITRDeskCalculator={getComputation:()=>lastComputation?JSON.parse(JSON.stringify(lastComputation)):null,recalculate:render};render();
})();
