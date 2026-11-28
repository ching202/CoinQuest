// Diagnostic source execution, not a browser or Supabase integration test.
// Usage: node verify_source.cjs /path/to/frontend/src/App.jsx
const fs = require('fs');
const vm = require('vm');
const crypto = require('crypto');
const src = fs.readFileSync(process.argv[2], 'utf8');
const marker = '  return (\n    <main';
if (!src.includes(marker)) throw Error('Source changed: inspect runner before reuse.');
const prefix = src.slice(0, src.indexOf(marker)).replace(/^import .*$/mg, '');
const transformed = prefix + '\nreturn {totalIncome,totalExpenses,netBalance,savingsRate,financialHealthScore,availableQuests,completedQuests,currentProfile,savingsGoals,completeQuest};\n}\nApp';
async function check(id, data, failures, inspect) {
 const database=structuredClone(data); const states=[]; let i=0, first=true, pending; const alerts=[],errors=[];
 const sb={from(table){let operation='read', value;const q={select(){return q},order(){return q},update(v){operation='update';value=v;return q},eq(){return q},insert(v){operation='insert';value=v;return q},then(resolve,reject){return Promise.resolve().then(()=>{if(failures?.[table+':'+operation])return {data:null,error:{message:'Simulated '+table+' '+operation+' failure'}};if(operation==='update')Object.assign(database[table][0],value);if(operation==='insert')database[table].push(...value);return {data:structuredClone(database[table]),error:null}}).then(resolve,reject)}};return q}};
 const context={useState(v){const n=i++;if(!(n in states))states[n]=v;return[states[n],v=>{states[n]=typeof v==='function'?v(states[n]):v}]},useEffect(fn){if(first)pending=fn()},supabase:sb,console:{error(...a){errors.push(a)}},alert(v){alerts.push(v)}};
 // The effect callback starts an async loader without returning its promise.
 const app=vm.runInNewContext(transformed,context); const render=()=>{i=0;const r=app();first=false;return r};
 render();for(let n=0;n<10;n++)await new Promise(setImmediate); const view=render();
 const observation=await inspect({view,render,database,states,alerts,errors});
 return {id,...observation};
}
const base={profiles:[{id:'p1',username:'Synthetic Student',email:'student@example.test',xp:90,level:1}],quests:[{id:'q1',title:'Synthetic Quest',xp_reward:10}],transactions:[],savings_goals:[],achievements:[],user_quests:[]};
(async()=>{
const results=[];
results.push(await check('SV-01', {...base,user_quests:[{user_id:'p1',quest_id:'q1',completed:false}]},{},async({view})=>({expected:'Incomplete record remains available, subject to Kyle confirming completed=false semantics.',actual:{available:view.availableQuests.length,completed:view.completedQuests.length},finding:'Record with completed:false is classified as completed.'})));
results.push(await check('SV-02',base,{'user_quests:insert':true},async({view,database,render,errors})=>{await view.completeQuest(view.availableQuests[0]);const after=render();return {expected:'Failed quest completion does not retain a reward without a completion record.',actual:{storedXP:database.profiles[0].xp,storedLevel:database.profiles[0].level,completionRows:database.user_quests.length,displayStateXP:after.currentProfile.xp,errors},finding:'Profile update persists in stub before insert failure; component state retains old XP.'}}));
results.push(await check('SV-03',base,{'transactions:read':true},async({view,errors})=>({expected:'Unavailable financial data is distinguished from a true zero balance; proposed usability expectation.',actual:{income:view.totalIncome,expenses:view.totalExpenses,net:view.netBalance,errors},finding:'Read failure falls back to empty transaction state and zero calculations.'})));
results.push(await check('SV-04',{...base,transactions:[{type:'income',amount:'1000'},{type:'expense',amount:'250'}]},{},async({view})=>({expected:{income:1000,expenses:250,net:750,savingsRate:75},actual:{income:view.totalIncome,expenses:view.totalExpenses,net:view.netBalance,savingsRate:view.savingsRate},finding:'Diagnostic values match this arithmetic example.'})));
console.log(JSON.stringify({sourceSha256:crypto.createHash('sha256').update(src).digest('hex'),execution:'Original App.jsx logic before JSX return, in Node VM with fake hooks and simulated database; no UI rendering or real database.',node:process.version,results},null,2));
})();
