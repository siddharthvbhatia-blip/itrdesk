(function(){
  'use strict';
  const byId=id=>document.getElementById(id);
  const form=byId('taxCalculator');
  if(!form) return;
  const inputIds=['salaryIncome','houseIncome','businessIncome','otherIncome','deduction80C','deduction80D','deductionNPS','otherDeductions'];
  const rupees=value=>'₹'+Math.round(Math.max(0,value)).toLocaleString('en-IN');
  function number(id){const raw=String(byId(id).value||'').replace(/,/g,'').trim();if(raw===''||raw==='-')return 0;const value=Number(raw);return Number.isFinite(value)?value:NaN}
  function taxBySlabs(income,slabs){let tax=0,lower=0;for(const [upper,rate] of slabs){tax+=Math.max(0,Math.min(income,upper)-lower)*rate;if(income<=upper)break;lower=upper}return tax}
  const newSlabs=[[400000,0],[800000,.05],[1200000,.10],[1600000,.15],[2000000,.20],[2400000,.25],[Infinity,.30]];
  function oldSlabs(age,resident){let exemption=250000;if(resident&&age==='60to79')exemption=300000;if(resident&&age==='80plus')exemption=500000;return [[exemption,0],[500000,.05],[1000000,.20],[Infinity,.30]]}
  function surchargeRate(income,isNew){if(income>50000000)return isNew?.25:.37;if(income>20000000)return .25;if(income>10000000)return .15;if(income>5000000)return .10;return 0}
  function taxAt(income,isNew,age,resident){return taxBySlabs(income,isNew?newSlabs:oldSlabs(age,resident))*(1+surchargeRate(income,isNew))}
  function applySurcharge(baseTax,income,isNew,age,resident){const rate=surchargeRate(income,isNew);if(!rate)return {combined:baseTax,surcharge:0};let combined=baseTax*(1+rate);const thresholds=[50000000,20000000,10000000,5000000];const threshold=thresholds.find(item=>income>item&&surchargeRate(item,isNew)<rate);if(threshold)combined=Math.min(combined,taxAt(threshold,isNew,age,resident)+(income-threshold));return {combined,surcharge:Math.max(0,combined-baseTax)}}
  function calculateRegime(isNew,gross,salary,age,resident,oldDeductions){
    const standardDeduction=Math.min(salary,isNew?75000:50000);
    const deductions=standardDeduction+(isNew?0:oldDeductions);
    const taxable=Math.max(0,Math.round((gross-deductions)/10)*10);
    const beforeRebate=taxBySlabs(taxable,isNew?newSlabs:oldSlabs(age,resident));
    let rebate=0;
    if(resident&&isNew&&taxable<=1200000)rebate=Math.min(beforeRebate,60000);
    if(resident&&!isNew&&taxable<=500000)rebate=Math.min(beforeRebate,12500);
    let baseTax=Math.max(0,beforeRebate-rebate);
    if(resident&&isNew&&taxable>1200000)baseTax=Math.min(baseTax,taxable-1200000);
    const surchargeResult=applySurcharge(baseTax,taxable,isNew,age,resident);
    const cess=surchargeResult.combined*.04;
    return {gross,deductions,taxable,beforeRebate,rebate,surcharge:surchargeResult.surcharge,cess,total:Math.round(surchargeResult.combined+cess)};
  }
  function showError(message){const box=byId('calcError');box.textContent=message;box.hidden=!message}
  function render(){
    const values={};for(const id of inputIds){values[id]=number(id);if(!Number.isFinite(values[id])){showError('Please enter valid numeric amounts only.');return false}}
    if(values.salaryIncome<0||values.businessIncome<0||values.otherIncome<0||values.deduction80C<0||values.deduction80D<0||values.deductionNPS<0||values.otherDeductions<0){showError('Only house-property income can be entered as a negative amount.');return false}
    showError('');
    const resident=byId('residentialStatus').value==='resident',age=byId('taxpayerAge').value;
    byId('taxpayerAge').disabled=!resident;
    const baseIncome=values.salaryIncome+values.businessIncome+values.otherIncome;
    const newGross=Math.max(0,baseIncome+Math.max(0,values.houseIncome));
    const oldGross=Math.max(0,baseIncome+Math.max(-200000,values.houseIncome));
    const oldDeductions=Math.min(150000,values.deduction80C)+values.deduction80D+Math.min(50000,values.deductionNPS)+values.otherDeductions;
    const newer=calculateRegime(true,newGross,values.salaryIncome,age,resident,oldDeductions);
    const older=calculateRegime(false,oldGross,values.salaryIncome,age,resident,oldDeductions);
    const rows={Gross:'gross',Deductions:'deductions',Taxable:'taxable',BeforeRebate:'beforeRebate',Rebate:'rebate',Surcharge:'surcharge',Cess:'cess'};
    for(const [suffix,key] of Object.entries(rows)){byId('new'+suffix).textContent=rupees(newer[key]);byId('old'+suffix).textContent=rupees(older[key])}
    byId('newTotalTax').textContent=rupees(newer.total);byId('oldTotalTax').textContent=rupees(older.total);
    if(baseIncome===0&&values.houseIncome===0){byId('bestRegime').textContent='Enter your income';byId('estimatedSaving').textContent='Your comparison will appear here.'}
    else if(newer.total===older.total){byId('bestRegime').textContent='Both estimates are equal';byId('estimatedSaving').textContent='Review eligibility and non-tax factors before choosing.'}
    else{const newWins=newer.total<older.total;byId('bestRegime').textContent=(newWins?'New':'Old')+' regime estimates lower';byId('estimatedSaving').textContent='Estimated difference: '+rupees(Math.abs(newer.total-older.total));}
    return true;
  }
  form.addEventListener('submit',event=>{event.preventDefault();if(render())document.querySelector('.calc-results').scrollIntoView({behavior:'smooth',block:'start'})});
  byId('resetCalculator').addEventListener('click',()=>{inputIds.forEach(id=>byId(id).value='0');byId('residentialStatus').value='resident';byId('taxpayerAge').value='below60';render()});
  byId('residentialStatus').addEventListener('change',render);byId('taxpayerAge').addEventListener('change',render);
  inputIds.forEach(id=>byId(id).addEventListener('blur',()=>{const value=number(id);if(Number.isFinite(value))byId(id).value=value.toLocaleString('en-IN')}));
  render();
})();
