const fs=require('fs'),vm=require('vm');
const html=fs.readFileSync(process.argv[2] || require("path").join(__dirname, "..", "index.html"),'utf8');
const js=html.match(/<script>([\s\S]*)<\/script>/)[1]+';globalThis.__E=ESTILOS;globalThis.__c=contar;globalThis.__M={GIRO,ESPEJO};';
const ctx={Intl};vm.createContext(ctx);vm.runInContext(js,ctx);
const E=ctx.__E;console.log('estilos',E.length);
for(const t of ['Peña','Draco','Ángel Muñoz 99','xX_Pro_Xx']){
 let bad=0;
 for(const e of E){const v=e.convertir(t);
  if(!v||/\p{Cn}|\p{Co}|�/u.test(v)){bad++;console.log('MAL',e.nombre,v);}
  if(e.convertir(t)!==v){bad++;console.log('NO DETERMINISTA',e.nombre);}
  if(t==='Peña') console.log(String(ctx.__c(v)).padStart(3),e.categoria.padEnd(9),e.nombre.padEnd(42),v);
 }
 console.log(t,'fallos',bad);
}
for(const k of ['GIRO','ESPEJO']) console.log(k,Object.keys(ctx.__M[k]).length);
