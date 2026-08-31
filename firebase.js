import {initializeApp} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import {getDatabase,ref,set,remove,onValue,get,update} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js";
import {getAuth,signInWithEmailAndPassword,signOut,onAuthStateChanged,sendPasswordResetEmail} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
const firebaseConfig={apiKey:"AIzaSyB-slUGWh8PnjW63craYa-BgTvjSoIJm2A",authDomain:"louvorapp-4f609.firebaseapp.com",databaseURL:"https://louvorapp-4f609-default-rtdb.firebaseio.com",projectId:"louvorapp-4f609",storageBucket:"louvorapp-4f609.firebasestorage.app",messagingSenderId:"358727212611",appId:"1:358727212611:web:5f3ad0c5244df153067ef6"};
const app=initializeApp(firebaseConfig),db=getDatabase(app),auth=getAuth(app);
Object.assign(window,{db,dbRef:ref,dbSet:set,dbRemove:remove,dbGet:get,dbUpdate:update,firebaseAuth:auth,firebaseSignIn:signInWithEmailAndPassword,firebaseSignOut:signOut,firebaseResetPassword:sendPasswordResetEmail});
let unsubReg=null,unsubMem=null,unsubAudit=null,unsubPerfis=null,unsubRole=null,unsubConn=null;
function iniciarLeituras(){
  [unsubReg,unsubMem,unsubAudit,unsubPerfis,unsubRole,unsubConn].forEach(u=>{if(u)u()});
  unsubConn=onValue(ref(db,'.info/connected'),s=>window.atualizarConexao?.(!!s.val()),()=>window.atualizarConexao?.(false));
  unsubReg=onValue(ref(db,'registros_louvor'),s=>{window.todosOsDados=s.val()||{};window.renderTudo()},e=>window.erroBanco(e,'registros'));
  unsubMem=onValue(ref(db,'membros_louvor'),s=>{window.integrantesCadastrados=s.val()||{};window.renderTudo()},e=>window.erroBanco(e,'membros'));
  if(auth.currentUser){
    unsubRole=onValue(ref(db,`roles_louvor/${auth.currentUser.uid}`),s=>{window.roleLouvor=window.isAdmin?'admin':(s.val()||'responsavel');window.aplicarPermissoes()},()=>{window.roleLouvor=window.isAdmin?'admin':'responsavel';window.aplicarPermissoes()});
    set(ref(db,`perfis_louvor/${auth.currentUser.uid}`),{email:auth.currentUser.email||'',ultimoLogin:new Date().toISOString()}).catch(()=>{});
  }
  if(window.isAdmin){
    unsubAudit=onValue(ref(db,'auditoria_louvor'),s=>{window.auditoriaDados=s.val()||{};window.renderAuditoria()},()=>window.renderAuditoria());
    unsubPerfis=onValue(ref(db,'perfis_louvor'),s=>{window.perfisDados=s.val()||{};window.renderPerfis()},()=>window.renderPerfis());
  }
}
onAuthStateChanged(auth,user=>{
  window.usuarioAtual=user||null;window.isAdmin=!!user&&((user.email||'').toLowerCase()==='icmpinhos@gmail.com');window.roleLouvor=window.isAdmin?'admin':'responsavel';
  const overlay=document.getElementById('auth-overlay'),bar=document.getElementById('user-bar');
  if(user){overlay.style.display='none';bar.style.display='flex';document.getElementById('user-info').textContent=(window.isAdmin?'Administrador • ':'Usuário • ')+(user.email||'');iniciarLeituras();window.aplicarPermissoes()}
  else{overlay.style.display='flex';bar.style.display='none';window.todosOsDados={};window.integrantesCadastrados={};window.roleLouvor='visualizacao';window.atualizarConexao?.(false);[unsubReg,unsubMem,unsubAudit,unsubPerfis,unsubRole,unsubConn].forEach(u=>{if(u)u()})}
});