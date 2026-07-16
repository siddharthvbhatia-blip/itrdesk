(function(){
  'use strict';

  const MAX_FILES=8;
  const MAX_FILE_BYTES=12*1024*1024;
  const MAX_TOTAL_BYTES=40*1024*1024;
  const FIELD_LABELS={
    pan:'PAN',salary:'Salary / taxable pension',houseProperty:'House-property income / loss',
    business:'Business / profession income',dividend:'Dividend income',otherSources:'Other-source income',
    agriculturalIncome:'Agricultural income',deduction80C:'Section 80C deduction',deduction80D:'Section 80D deduction',
    deductionNPS:'Section 80CCD(1B) deduction',oldDeductions:'Other / aggregate old-regime deductions',
    tds:'TDS',tcs:'TCS',advanceTax:'Advance tax',selfAssessmentTax:'Self-assessment tax'
  };
  const TYPE_LABELS={form16:'Form 16 / 16A',ais:'Annual Information Statement (AIS)',tis:'Taxpayer Information Summary (TIS)',form26as:'Form 26AS',unknown:'Unclassified record'};
  const CALCULATOR_MAP={salary:'salaryIncome',houseProperty:'houseIncome',business:'businessIncome',dividend:'dividendIncome',otherSources:'otherIncome',agriculturalIncome:'agriculturalIncome',deduction80C:'deduction80C',deduction80D:'deduction80D',deductionNPS:'deductionNPS',oldDeductions:'otherOldDeductions',tds:'tdsPaid',tcs:'tcsPaid',advanceTax:'advanceTaxPaid',selfAssessmentTax:'selfAssessmentPaid'};
  const JSON_MAP={pan:'jsonPan',salary:'jsonSalary',houseProperty:'jsonHouseProperty',business:'jsonBusiness',dividend:'jsonOtherSources',otherSources:'jsonOtherSources',agriculturalIncome:'jsonAgriculturalIncome',deduction80C:'jsonOldDeductions',deduction80D:'jsonOldDeductions',deductionNPS:'jsonOldDeductions',oldDeductions:'jsonOldDeductions',tds:'jsonTdsTcs',tcs:'jsonTdsTcs',advanceTax:'jsonAdvanceTax',selfAssessmentTax:'jsonSelfAssessmentTax'};

  let pdfModulePromise=null;
  let pdfWorkerUrlPromise=null;
  async function loadPdfWorkerUrl(){
    if(pdfWorkerUrlPromise)return pdfWorkerUrlPromise;
    pdfWorkerUrlPromise=(async()=>{
      if(typeof DecompressionStream!=='function')throw new Error('This browser cannot open PDFs locally. Use the current Chrome, Edge, Firefox or Safari browser, or import an official JSON/CSV record.');
      const sourceUrl=new URL('assets/vendor/pdf.worker.min.mjs.gz.b64',document.baseURI).href;
      const response=await fetch(sourceUrl,{cache:'force-cache'});
      if(!response.ok)throw new Error('The local PDF reader component could not be loaded.');
      const encoded=(await response.text()).replace(/\s+/g,'');
      if(!encoded||encoded.length>900000||!/^[A-Za-z0-9+/]+={0,2}$/.test(encoded))throw new Error('The local PDF reader component is invalid.');
      const binary=atob(encoded);const compressed=new Uint8Array(binary.length);
      for(let index=0;index<binary.length;index++)compressed[index]=binary.charCodeAt(index);
      const stream=new Blob([compressed]).stream().pipeThrough(new DecompressionStream('gzip'));
      const buffer=await new Response(stream).arrayBuffer();
      if(buffer.byteLength<100000||buffer.byteLength>4000000)throw new Error('The local PDF reader component did not decompress correctly.');
      const workerUrl=URL.createObjectURL(new Blob([buffer],{type:'text/javascript'}));
      window.addEventListener('pagehide',()=>URL.revokeObjectURL(workerUrl),{once:true});
      return workerUrl;
    })().catch(error=>{pdfWorkerUrlPromise=null;throw error;});
    return pdfWorkerUrlPromise;
  }
  function loadPdfModule(){
    if(pdfModulePromise)return pdfModulePromise;
    const moduleUrl=new URL('assets/vendor/pdf.min.mjs',document.baseURI).href;
    pdfModulePromise=Promise.all([import(moduleUrl),loadPdfWorkerUrl()])
      .then(([pdfjs,workerUrl])=>{pdfjs.GlobalWorkerOptions.workerSrc=workerUrl;return pdfjs;})
      .catch(()=>{pdfModulePromise=null;throw new Error('The local PDF reader could not load. Refresh the page and try again, or use an official JSON, CSV or searchable TXT record.');});
    return pdfModulePromise;
  }

  function cleanText(value,max=500){return String(value==null?'':value).replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/g,' ').replace(/\s+/g,' ').trim().slice(0,max);}
  function normalise(value,max=3000){return cleanText(value,max).toLowerCase().replace(/[–—]/g,'-');}
  function escapeRegExp(value){return String(value).replace(/[.*+?^${}()|[\]\\]/g,'\\$&');}
  function unique(values){return Array.from(new Set(values.filter(Boolean)));}
  function validAmount(value){return Number.isFinite(value)&&Math.abs(value)<=1e12;}
  function parseAmount(value){
    if(typeof value==='number')return validAmount(value)?value:null;
    let raw=String(value==null?'':value).trim();
    if(!raw||/^(?:na|n\/a|nil|--?)$/i.test(raw))return null;
    const negative=/^\s*\(.*\)\s*$/.test(raw)||/^\s*-/.test(raw);
    raw=raw.replace(/[₹,\s]/g,'').replace(/[()]/g,'').replace(/[^0-9.+-]/g,'');
    if(!/^[+-]?(?:\d+\.?\d*|\.\d+)$/.test(raw))return null;
    const number=Number(raw);
    if(!validAmount(number))return null;
    return negative?-Math.abs(number):number;
  }
  function numberTokens(value){
    const text=String(value==null?'':value);
    const matches=text.match(/\(?\s*-?\s*(?:₹\s*)?\d[\d,]*(?:\.\d{1,2})?\s*\)?/g)||[];
    return matches.map(parseAmount).filter(validAmount);
  }
  function money(value){return (value<0?'-':'')+'₹'+Math.abs(Math.round(value)).toLocaleString('en-IN');}
  function confidenceLabel(value){return value==='high'?'High':value==='medium'?'Medium':'Review carefully';}

  function amountAfterLabel(lines,patterns,lookAhead=2){
    for(const pattern of patterns){
      for(let index=0;index<lines.length;index++){
        const line=String(lines[index]||'');
        const match=line.match(pattern);
        if(!match)continue;
        const after=line.slice((match.index||0)+match[0].length);
        let values=numberTokens(after);
        if(values.length)return values[values.length-1];
        for(let offset=1;offset<=lookAhead&&index+offset<lines.length;offset++){
          const next=String(lines[index+offset]||'');
          if(/[A-Za-z]{4,}/.test(next)&&offset>1)break;
          values=numberTokens(next);
          if(values.length)return values[values.length-1];
        }
      }
    }
    return null;
  }
  function panNearLabel(lines){
    const panPattern=/\b[A-Z]{5}[0-9]{4}[A-Z]\b/g;
    for(let index=0;index<lines.length;index++){
      const line=String(lines[index]||'');
      const employee=line.match(/PAN\s+of\s+(?:the\s+)?(?:employee|deductee|assessee|taxpayer)/i);
      if(!employee)continue;
      const same=line.slice((employee.index||0)+employee[0].length).toUpperCase().match(panPattern);
      if(same&&same.length)return same[0];
      const nearby=lines.slice(index+1,index+4).join(' ').toUpperCase().match(panPattern);
      if(nearby&&nearby.length)return nearby[nearby.length-1];
    }
    return null;
  }

  function flattenObjects(value,objects,depth=0){
    if(depth>18||objects.length>12000||value==null)return;
    if(Array.isArray(value)){value.forEach(item=>flattenObjects(item,objects,depth+1));return;}
    if(typeof value!=='object')return;
    const primitive={};
    Object.entries(value).forEach(([key,item])=>{if(item==null||['string','number','boolean'].includes(typeof item))primitive[cleanText(key,100)]=item;});
    if(Object.keys(primitive).length)objects.push(primitive);
    Object.values(value).forEach(item=>{if(item&&typeof item==='object')flattenObjects(item,objects,depth+1);});
  }
  function objectAmount(object){
    const entries=Object.entries(object);
    const priorities=[/derived.*value|derived.*amount/i,/processed.*value|processed.*amount/i,/tax.*deducted|tds.*amount|tcs.*amount/i,/gross.*amount|total.*amount/i,/amount|value/i,/reported/i];
    for(const pattern of priorities){
      for(const [key,value] of entries){
        if(!pattern.test(key))continue;
        const parsed=parseAmount(value);
        if(parsed!==null)return parsed;
      }
    }
    return null;
  }
  function objectCategoryValues(documentData,pattern){
    const values=[];
    (documentData.objects||[]).forEach(object=>{
      const joined=normalise(Object.entries(object).map(([key,value])=>key+': '+value).join(' | '));
      if(!pattern.test(joined))return;
      const amount=objectAmount(object);
      if(amount!==null&&amount>=0)values.push(amount);
    });
    return values;
  }
  function rowCategoryValues(documentData,pattern){
    const values=[];
    const seen=new Set();
    (documentData.rows||[]).forEach(row=>{
      const joined=cleanText(Array.isArray(row)?row.join(' | '):row,3000);
      const fingerprint=normalise(joined);
      if(seen.has(fingerprint)||!pattern.test(fingerprint))return;
      seen.add(fingerprint);
      const amounts=numberTokens(joined);
      if(amounts.length)values.push(amounts[amounts.length-1]);
    });
    return values.filter(value=>value>=0);
  }
  function categoryValue(documentData,pattern,mode='max'){
    const objectValues=objectCategoryValues(documentData,pattern);
    const rowValues=rowCategoryValues(documentData,pattern);
    const values=(objectValues.length?objectValues:rowValues).filter(value=>validAmount(value)&&value>=0);
    if(!values.length)return null;
    return mode==='sum'?values.reduce((sum,value)=>sum+value,0):Math.max(...values);
  }
  function categoryParts(documentData,patterns){
    const values=[];
    patterns.forEach(pattern=>{const value=categoryValue(documentData,pattern);if(value!==null)values.push(value);});
    return values.length?values.reduce((sum,value)=>sum+value,0):null;
  }

  function detectDocumentType(name,text){
    const haystack=normalise(name+' '+String(text||'').slice(0,40000),50000);
    if(/form\s*(?:no\.?\s*)?16(?:a)?\b|certificate\s+under\s+section\s+203/.test(haystack))return 'form16';
    if(/form\s*(?:no\.?\s*)?26as\b|(?:^|[\s_.-])26as(?:[\s_.-]|$)|tax\s+credit\s+statement|annual\s+tax\s+statement/.test(haystack))return 'form26as';
    if(/taxpayer[\s_.-]+information[\s_.-]+summary|(?:^|[\s_.-])tis(?:[\s_.-]|$)/.test(haystack))return 'tis';
    if(/annual[\s_.-]+information[\s_.-]+statement|(?:^|[\s_.-])ais(?:[\s_.-]|$)/.test(haystack))return 'ais';
    return 'unknown';
  }

  function pdfLines(content){
    const groups=new Map();
    content.items.forEach(item=>{
      if(!item||!cleanText(item.str))return;
      const y=Math.round(Number(item.transform&&item.transform[5]||0)/3)*3;
      if(!groups.has(y))groups.set(y,[]);
      groups.get(y).push({x:Number(item.transform&&item.transform[4]||0),text:cleanText(item.str,1000)});
    });
    return Array.from(groups.entries()).sort((a,b)=>b[0]-a[0]).map(([,items])=>items.sort((a,b)=>a.x-b.x).map(item=>item.text).join(' '));
  }
  async function readPdf(file,password){
    const pdfjs=await loadPdfModule();
    const options={data:await file.arrayBuffer()};if(password)options.password=password;
    options.isEvalSupported=false;
    const task=pdfjs.getDocument(options);
    const pdf=await task.promise;
    const lines=[];
    for(let pageNumber=1;pageNumber<=pdf.numPages;pageNumber++){
      const page=await pdf.getPage(pageNumber);
      lines.push(...pdfLines(await page.getTextContent()));
    }
    return {lines,rows:lines.map(line=>[line]),objects:[],text:lines.join('\n')};
  }
  async function readJson(file){
    const text=await file.text();
    let value;
    try{value=JSON.parse(text);}catch(_){throw new Error('This JSON file is not valid JSON.');}
    const objects=[];flattenObjects(value,objects);
    const rows=objects.map(object=>Object.entries(object).map(([key,item])=>key+': '+cleanText(item,1000)));
    const lines=rows.map(row=>row.join(' | '));
    return {lines,rows,objects,text:lines.join('\n')};
  }
  async function readText(file){
    const text=await file.text();
    const lines=text.split(/\r?\n/).map(line=>cleanText(line,3000)).filter(Boolean).slice(0,30000);
    let rows=lines.map(line=>line.split(/\t|,(?=(?:[^\"]*\"[^\"]*\")*[^\"]*$)/).map(value=>cleanText(value.replace(/^\"|\"$/g,''),1000)));
    return {lines:rows.map(row=>row.join(' | ')),rows,objects:[],text};
  }
  async function readFile(file,password){
    const extension=(file.name.split('.').pop()||'').toLowerCase();
    let data;
    if(extension==='pdf')data=await readPdf(file,password);
    else if(extension==='json')data=await readJson(file);
    else if(extension==='csv'||extension==='txt')data=await readText(file);
    else throw new Error('Unsupported file type. Use PDF, JSON, CSV or TXT.');
    data.name=cleanText(file.name,180);
    data.type=detectDocumentType(data.name,data.text);
    return data;
  }

  function record(key,value,documentData,confidence,note){return {key,value,sourceType:documentData.type,fileName:documentData.name,confidence,note:cleanText(note,300),selected:confidence!=='review'};}
  function extractForm16(documentData){
    const lines=documentData.lines;
    const records=[];const alerts=[];
    const gross=amountAfterLabel(lines,[/gross\s+salary(?:\s*\([^)]*\))?/i,/total\s+amount\s+of\s+salary\s+received/i]);
    const chargeable=amountAfterLabel(lines,[/income\s+chargeable\s+under\s+the\s+head\s*[\"“']?salar(?:y|ies)/i]);
    const section16=amountAfterLabel(lines,[/total\s+amount\s+of\s+deductions?\s+under\s+section\s+16/i,/deductions?\s+under\s+section\s+16/i]);
    if(gross!==null&&gross>=0)records.push(record('salary',gross,documentData,'high','Gross salary identified; the calculator applies its own standard deduction.'));
    else if(chargeable!==null&&chargeable>=0){const restored=section16!==null&&section16>=0?chargeable+section16:chargeable;records.push(record('salary',restored,documentData,section16!==null?'medium':'review',section16!==null?'Income chargeable under Salaries plus identified section 16 deductions.':'Only income chargeable under Salaries was found; verify that standard deduction is not counted twice.'));}
    const oldDeductions=amountAfterLabel(lines,[/aggregate\s+of\s+deductible\s+amount\s+under\s+chapter\s+vi[-\s]?a/i,/total\s+deductions?\s+under\s+chapter\s+vi[-\s]?a/i]);
    if(oldDeductions!==null&&oldDeductions>=0)records.push(record('oldDeductions',oldDeductions,documentData,'medium','Aggregate Chapter VI-A amount; eligibility and duplicate declarations require review.'));
    const tds=amountAfterLabel(lines,[/total\s+(?:amount\s+of\s+)?tax\s+deducted(?:\s+and\s+deposited)?/i,/tax\s+deducted\s+at\s+source/i]);
    if(tds!==null&&tds>=0)records.push(record('tds',tds,documentData,'medium','Compare the employer certificate with Form 26AS before claiming credit.'));
    const pan=panNearLabel(lines);
    if(pan)records.push(record('pan',pan,documentData,'medium','PAN found near an employee/deductee label; confirm visually.'));
    if(!records.some(item=>item.key==='salary'))alerts.push(documentData.name+': no salary total could be extracted safely. Enter it manually from Part B.');
    return {records,alerts};
  }
  function extractSummary(documentData,isTis){
    const records=[];const alerts=[];
    const salary=categoryValue(documentData,/\bsalary(?:\s+income)?\b/);
    const interest=categoryParts(documentData,[/interest\s+from\s+savings/,/interest\s+from\s+(?:term\s+)?deposit/,/interest\s+on\s+income\s+tax\s+refund/,/interest\s+from\s+recurring\s+deposit/,/other\s+interest/]);
    const genericInterest=interest===null?categoryValue(documentData,/\binterest(?:\s+income)?\b/):null;
    const dividend=categoryValue(documentData,/\bdividend(?:\s+income)?\b/);
    const confidence=isTis?'medium':'review';
    if(salary!==null)records.push(record('salary',salary,documentData,confidence,isTis?'TIS category value; compare with all Form 16 certificates.':'AIS value is shown for reconciliation only; Form 16/TIS is preferred for salary.'));
    if((interest!==null?interest:genericInterest)!==null)records.push(record('otherSources',interest!==null?interest:genericInterest,documentData,confidence,isTis?'Sum of identified TIS interest categories.':'AIS interest proposal; verify duplicates, feedback and the TIS derived value.'));
    if(dividend!==null)records.push(record('dividend',dividend,documentData,confidence,isTis?'TIS dividend category value.':'AIS dividend proposal; verify duplicates and TIS.'));
    const text=normalise(documentData.text,100000);
    if(/sale\s+of\s+(?:securities|shares|mutual\s+fund)|securities\s+transactions|immovable\s+property/.test(text))alerts.push(documentData.name+': transaction/sale values were found but were not treated as capital gains. Cost, holding period, exemptions and loss set-off are still required.');
    if(/business\s+(?:receipts|turnover)|gross\s+receipts/.test(text))alerts.push(documentData.name+': receipts/turnover were found but were not treated as business income. Profit must be derived from books or the applicable presumptive provisions.');
    if(/rent\s+received/.test(text))alerts.push(documentData.name+': rent receipts were found but were not treated as house-property income. Municipal taxes, annual value and section 24 adjustments must be reviewed.');
    return {records,alerts};
  }
  function sectionLines(lines,startPattern,endPattern){
    const start=lines.findIndex(line=>startPattern.test(normalise(line)));
    if(start<0)return [];
    const rest=lines.slice(start+1);
    const end=rest.findIndex(line=>endPattern.test(normalise(line)));
    return end<0?rest:rest.slice(0,end);
  }
  function sumTanRows(lines){
    const seen=new Set();let total=0;let count=0;
    lines.forEach(line=>{
      const tan=(String(line).toUpperCase().match(/\b[A-Z]{4}[0-9]{5}[A-Z]\b/)||[])[0];
      if(!tan)return;
      const fingerprint=tan+'|'+normalise(line);
      if(seen.has(fingerprint))return;seen.add(fingerprint);
      const values=numberTokens(String(line).replace(tan,''));
      if(values.length<2)return;
      const candidate=values.length>=3?values[values.length-2]:values[values.length-1];
      if(candidate>=0&&validAmount(candidate)){total+=candidate;count++;}
    });
    return count?total:null;
  }
  function extract26as(documentData){
    const records=[];const alerts=[];
    const tdsSection=sectionLines(documentData.lines,/part\s*[-:]?\s*i\b.*tax\s+deducted/,/part\s*[-:]?\s*ii\b/);
    const tcsSection=sectionLines(documentData.lines,/part\s*[-:]?\s*ii\b.*tax\s+collected/,/part\s*[-:]?\s*iii\b/);
    let tds=sumTanRows(tdsSection);
    let tcs=sumTanRows(tcsSection);
    if(tds===null)tds=amountAfterLabel(documentData.lines,[/total\s+(?:tds|tax\s+deducted)(?:\s+deposited)?/i]);
    if(tcs===null)tcs=amountAfterLabel(documentData.lines,[/total\s+(?:tcs|tax\s+collected)(?:\s+deposited)?/i]);
    if(tds!==null&&tds>=0)records.push(record('tds',tds,documentData,'medium','Consolidated Form 26AS proposal; compare it with certificates and the current portal statement.'));
    if(tcs!==null&&tcs>=0)records.push(record('tcs',tcs,documentData,'medium','Consolidated Form 26AS TCS proposal; confirm the credit.'));
    const pan=panNearLabel(documentData.lines);
    if(pan)records.push(record('pan',pan,documentData,'medium','PAN found near a taxpayer/assessee label; confirm visually.'));
    if(!records.some(item=>item.key==='tds'||item.key==='tcs'))alerts.push(documentData.name+': tax-credit totals could not be extracted safely. Use the Form 26AS totals and enter them manually.');
    return {records,alerts};
  }
  function extractDocument(documentData){
    if(documentData.type==='form16')return extractForm16(documentData);
    if(documentData.type==='tis')return extractSummary(documentData,true);
    if(documentData.type==='ais')return extractSummary(documentData,false);
    if(documentData.type==='form26as')return extract26as(documentData);
    return {records:[],alerts:[documentData.name+': document type was not recognised. No values were applied. Rename or classify the record manually and enter verified totals.']};
  }

  function sum(records){return records.reduce((total,item)=>total+Number(item.value||0),0);}
  function maxRecord(records){return records.slice().sort((a,b)=>Number(b.value||0)-Number(a.value||0))[0]||null;}
  function aggregate(records,key,type,mode,note){
    const matches=records.filter(item=>item.key===key&&(!type||item.sourceType===type));
    if(!matches.length)return null;
    const chosen=mode==='sum'?{...matches[0],value:sum(matches)}:{...maxRecord(matches)};
    chosen.fileName=unique(matches.map(item=>item.fileName)).join(', ');
    chosen.note=note||chosen.note;
    return chosen;
  }
  function reconcile(records,baseAlerts){
    const proposals=[];const alerts=baseAlerts.slice();
    const salaryForm16=aggregate(records,'salary','form16','sum','Combined gross-salary proposal from the selected Form 16 records.');
    const salaryTis=aggregate(records,'salary','tis','max');
    const salaryAis=aggregate(records,'salary','ais','max');
    const salaryPrimary=salaryForm16||salaryTis||salaryAis;
    if(salaryPrimary){salaryPrimary.selected=salaryPrimary.sourceType!=='ais'&&salaryPrimary.confidence!=='review';proposals.push(salaryPrimary);}
    [salaryTis,salaryAis].filter(Boolean).forEach(comparison=>{if(salaryPrimary&&comparison.sourceType!==salaryPrimary.sourceType&&Math.abs(Number(comparison.value)-Number(salaryPrimary.value))>=1)alerts.push('Salary comparison: '+TYPE_LABELS[comparison.sourceType]+' shows '+money(comparison.value)+' versus the proposed '+money(salaryPrimary.value)+'. Reconcile before applying.');});

    ['otherSources','dividend'].forEach(key=>{
      const tis=aggregate(records,key,'tis','max');const ais=aggregate(records,key,'ais','max');const primary=tis||ais;
      if(primary){primary.selected=primary.sourceType==='tis';proposals.push(primary);}
      if(tis&&ais&&Math.abs(Number(tis.value)-Number(ais.value))>=1)alerts.push(FIELD_LABELS[key]+' comparison: TIS '+money(tis.value)+' versus AIS '+money(ais.value)+'. Review feedback and source records.');
    });

    const tds26=aggregate(records,'tds','form26as','max');
    const tds16=aggregate(records,'tds','form16','sum');
    const tdsPrimary=tds26||tds16;
    if(tdsPrimary){tdsPrimary.selected=true;proposals.push(tdsPrimary);}
    if(tds26&&tds16&&Math.abs(Number(tds26.value)-Number(tds16.value))>=1)alerts.push('TDS comparison: Form 26AS '+money(tds26.value)+' versus Form 16 certificates '+money(tds16.value)+'. Claim only reconciled tax credit.');
    const tcs26=aggregate(records,'tcs','form26as','max');if(tcs26){tcs26.selected=true;proposals.push(tcs26);}

    const deductions=aggregate(records,'oldDeductions','form16','max','Highest aggregate Chapter VI-A proposal found; multiple Form 16 declarations were not added together.');
    if(deductions){deductions.selected=false;deductions.confidence='review';proposals.push(deductions);}
    ['deduction80C','deduction80D','deductionNPS','houseProperty','business','agriculturalIncome','advanceTax','selfAssessmentTax'].forEach(key=>{
      const item=aggregate(records,key,null,'max');if(item)proposals.push(item);
    });
    const pan=records.find(item=>item.key==='pan');if(pan)proposals.unshift({...pan,selected:false,confidence:'review'});
    return {proposals,alerts:unique(alerts)};
  }

  function setStatus(root,message,type){
    const status=root.querySelector('[data-import-status]');
    status.textContent=message||'';
    status.className='import-status'+(type?' '+type:'');
  }
  function showFiles(root,results,errors){
    const list=root.querySelector('[data-import-file-list]');list.replaceChildren();
    results.forEach(result=>{const li=document.createElement('li');const strong=document.createElement('strong');strong.textContent=result.name;const span=document.createElement('span');span.textContent=TYPE_LABELS[result.type]||TYPE_LABELS.unknown;li.append(strong,span);list.appendChild(li);});
    errors.forEach(error=>{const li=document.createElement('li');li.className='file-error';const strong=document.createElement('strong');strong.textContent=error.name;const span=document.createElement('span');span.textContent=error.message;li.append(strong,span);list.appendChild(li);});
    if(!results.length&&!errors.length){const li=document.createElement('li');li.textContent='No records selected.';list.appendChild(li);}
  }
  function showAlerts(root,alerts){
    const box=root.querySelector('[data-import-alerts]');box.replaceChildren();box.hidden=!alerts.length;
    if(!alerts.length)return;
    const heading=document.createElement('strong');heading.textContent='Reconciliation checks';const list=document.createElement('ul');
    alerts.forEach(message=>{const li=document.createElement('li');li.textContent=message;list.appendChild(li);});box.append(heading,list);
  }
  function renderReview(root,state){
    const target=root.dataset.importTarget;
    const body=root.querySelector('[data-import-rows]');body.replaceChildren();
    const visible=state.proposals.filter(item=>item.key!=='pan'||target==='json');
    visible.forEach((item,index)=>{
      item.renderIndex=index;
      const row=document.createElement('tr');row.dataset.proposalIndex=String(state.proposals.indexOf(item));
      const includeCell=document.createElement('td');const include=document.createElement('input');include.type='checkbox';include.checked=Boolean(item.selected);include.setAttribute('aria-label','Include '+(FIELD_LABELS[item.key]||item.key));include.dataset.importInclude='';includeCell.appendChild(include);
      const fieldCell=document.createElement('td');const fieldStrong=document.createElement('strong');fieldStrong.textContent=FIELD_LABELS[item.key]||item.key;const fieldNote=document.createElement('small');fieldNote.textContent=item.note||'';fieldCell.append(fieldStrong,fieldNote);
      const valueCell=document.createElement('td');const input=document.createElement('input');input.type='text';input.inputMode=item.key==='pan'?'text':'decimal';input.value=item.key==='pan'?String(item.value):Number(item.value).toLocaleString('en-IN',{maximumFractionDigits:2});input.dataset.importValue='';input.setAttribute('aria-label','Confirmed value for '+(FIELD_LABELS[item.key]||item.key));valueCell.appendChild(input);
      const sourceCell=document.createElement('td');const sourceStrong=document.createElement('strong');sourceStrong.textContent=TYPE_LABELS[item.sourceType]||TYPE_LABELS.unknown;const fileSmall=document.createElement('small');fileSmall.textContent=item.fileName;sourceCell.append(sourceStrong,fileSmall);
      const confidenceCell=document.createElement('td');const badge=document.createElement('span');badge.className='confidence-badge '+item.confidence;badge.textContent=confidenceLabel(item.confidence);confidenceCell.appendChild(badge);
      row.append(includeCell,fieldCell,valueCell,sourceCell,confidenceCell);body.appendChild(row);
    });
    root.querySelector('[data-import-review]').hidden=!visible.length;
    root.querySelector('[data-import-apply]').disabled=!visible.length;
    showAlerts(root,state.alerts);
  }
  function selectedValues(root,state){
    const selected=[];
    root.querySelectorAll('[data-proposal-index]').forEach(row=>{
      const include=row.querySelector('[data-import-include]');if(!include.checked)return;
      const item={...state.proposals[Number(row.dataset.proposalIndex)]};const raw=row.querySelector('[data-import-value]').value;
      if(item.key==='pan'){
        const pan=cleanText(raw,10).toUpperCase();if(!/^[A-Z]{5}[0-9]{4}[A-Z]$/.test(pan))throw new Error('Confirm the PAN in the format ABCDE1234F, or untick it.');item.value=pan;
      }else{
        const amount=parseAmount(raw);if(amount===null)throw new Error('Enter a valid amount for '+(FIELD_LABELS[item.key]||item.key)+'.');item.value=amount;
      }
      selected.push(item);
    });
    if(!selected.length)throw new Error('Select at least one reviewed value to apply.');
    return selected;
  }
  function applyValues(root,state){
    const target=root.dataset.importTarget;
    const mapping=target==='json'?JSON_MAP:CALCULATOR_MAP;
    const selected=selectedValues(root,state);
    const numericByInput={};let panValue='';
    selected.forEach(item=>{
      const id=mapping[item.key];if(!id)return;
      if(item.key==='pan'){panValue=item.value;return;}
      numericByInput[id]=(numericByInput[id]||0)+Number(item.value||0);
    });
    Object.entries(numericByInput).forEach(([id,value])=>{const input=document.getElementById(id);if(!input)return;input.value=value.toLocaleString('en-IN',{maximumFractionDigits:2});input.dispatchEvent(new Event('change',{bubbles:true}));});
    if(panValue&&document.getElementById('jsonPan'))document.getElementById('jsonPan').value=panValue;
    if(target==='json'){
      const documentValues={ais:'AIS',tis:'TIS',form26as:'Form 26AS',form16:'Form 16 / 16A'};
      const values=unique(selected.map(item=>documentValues[item.sourceType]));
      document.querySelectorAll('input[name="sourceDocument"]').forEach(input=>{if(values.includes(input.value))input.checked=true;});
    }
    const safeSnapshot={version:1,confirmedAt:new Date().toISOString(),records:selected.map(item=>({key:item.key,value:item.value,sourceType:item.sourceType,fileName:item.fileName,confidence:item.confidence,note:item.note})),alerts:state.alerts.slice(0,30)};
    try{sessionStorage.setItem('itrdesk:confirmed-document-import',JSON.stringify(safeSnapshot));}catch(_){}
    window.dispatchEvent(new CustomEvent('itrdesk:source-files',{detail:{names:unique(selected.flatMap(item=>item.fileName.split(',').map(name=>cleanText(name,180))))}}));
    if(target==='calculator'&&window.ITRDeskCalculator)window.ITRDeskCalculator.recalculate();
    const continueLink=root.querySelector('[data-import-continue]');if(continueLink)continueLink.hidden=false;
    setStatus(root,selected.length+' confirmed value'+(selected.length===1?' was':'s were')+' applied. Review the calculator or draft fields before relying on them.','success');
  }
  function restoreConfirmed(root,state){
    if(root.dataset.importTarget!=='json')return;
    try{
      const stored=JSON.parse(sessionStorage.getItem('itrdesk:confirmed-document-import')||'null');
      if(!stored||stored.version!==1||!Array.isArray(stored.records)||!stored.records.length)return;
      state.proposals=stored.records.map(item=>({...item,selected:true}));state.alerts=Array.isArray(stored.alerts)?stored.alerts:[];
      renderReview(root,state);setStatus(root,'Confirmed proposals from the calculator are ready for a second review before they are applied to this draft.');
      const restoredFiles=[];const seenFiles=new Set();
      state.proposals.forEach(item=>{const key=item.sourceType+'|'+item.fileName;if(!seenFiles.has(key)){seenFiles.add(key);restoredFiles.push({name:item.fileName,type:item.sourceType});}});
      showFiles(root,restoredFiles,[]);
    }catch(_){}
  }
  function clearImporter(root,state){
    state.proposals=[];state.alerts=[];const input=root.querySelector('[data-import-files]');input.value='';const password=root.querySelector('[data-import-password]');if(password)password.value='';
    try{sessionStorage.removeItem('itrdesk:confirmed-document-import');}catch(_){}
    showFiles(root,[],[]);showAlerts(root,[]);root.querySelector('[data-import-rows]').replaceChildren();root.querySelector('[data-import-review]').hidden=true;root.querySelector('[data-import-apply]').disabled=true;const continueLink=root.querySelector('[data-import-continue]');if(continueLink)continueLink.hidden=true;window.dispatchEvent(new CustomEvent('itrdesk:source-files',{detail:{names:[]}}));setStatus(root,'');
  }
  async function processFiles(root,state,files){
    if(files.length>MAX_FILES){setStatus(root,'Select no more than '+MAX_FILES+' records at one time.','error');return;}
    const total=files.reduce((sum,file)=>sum+file.size,0);
    if(total>MAX_TOTAL_BYTES){setStatus(root,'The selected records exceed the 40 MB local-processing limit.','error');return;}
    setStatus(root,'Reading the selected records locally in this browser…');
    const results=[];const errors=[];const passwordInput=root.querySelector('[data-import-password]');const password=String(passwordInput&&passwordInput.value||'');
    for(const file of files){
      if(file.size>MAX_FILE_BYTES){errors.push({name:file.name,message:'File exceeds the 12 MB per-record limit.'});continue;}
      try{
        const result=await readFile(file,password);
        if(/\.pdf$/i.test(file.name)&&cleanText(result.text,100000).length<80)throw new Error('No searchable text was found. Use an official JSON, CSV or searchable PDF/TXT record; this page does not send the document to an OCR service.');
        results.push(result);
      }catch(error){const protectedPdf=/password/i.test(String(error&&error.name||'')+' '+String(error&&error.message||''));errors.push({name:cleanText(file.name,180),message:protectedPdf?'This PDF needs a document-opening password. Enter that local PDF password and select the record again—never enter the e-Filing portal password here.':cleanText(error.message||'Could not read this record.',300)});}
    }
    if(passwordInput)passwordInput.value='';
    showFiles(root,results,errors);
    const extractedRecords=[];const alerts=[];
    results.forEach(result=>{const extracted=extractDocument(result);extractedRecords.push(...extracted.records);alerts.push(...extracted.alerts);});
    const reconciled=reconcile(extractedRecords,alerts);state.proposals=reconciled.proposals;state.alerts=reconciled.alerts;
    renderReview(root,state);
    const readable=results.length;const proposed=state.proposals.length;
    if(proposed)setStatus(root,'Found '+proposed+' proposed value'+(proposed===1?'':'s')+' in '+readable+' readable record'+(readable===1?'':'s')+'. Confirm every checked row before applying.');
    else setStatus(root,readable?'The records were read, but no value was safe enough to propose automatically. Use the reconciliation notes and enter verified totals manually.':'No selected record could be read.','error');
  }
  function initialise(root){
    const state={proposals:[],alerts:[]};const input=root.querySelector('[data-import-files]');
    if(!input)return;
    input.addEventListener('change',()=>processFiles(root,state,Array.from(input.files||[])));
    root.querySelector('[data-import-apply]').addEventListener('click',()=>{try{applyValues(root,state);}catch(error){setStatus(root,error.message,'error');}});
    root.querySelector('[data-import-clear]').addEventListener('click',()=>clearImporter(root,state));
    restoreConfirmed(root,state);
  }

  window.ITRDeskDocumentImport={detectDocumentType,parseAmount,extractDocument,reconcile};
  document.addEventListener('DOMContentLoaded',()=>document.querySelectorAll('[data-document-importer]').forEach(initialise));
})();
