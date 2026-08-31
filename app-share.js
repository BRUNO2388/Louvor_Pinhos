async function gerarImagemElemento(el,nomeArquivo,titulo){
  if(!el){alert('Relatório não encontrado na tela.');return}
  if(typeof html2canvas!=='function'){alert('O gerador de imagem não carregou. Atualize a página e tente novamente.');return}
  try{
    const canvas=await html2canvas(el,{backgroundColor:'#fff',scale:2,useCORS:true});
    const blob=await new Promise(resolve=>canvas.toBlob(resolve,'image/png'));
    if(!blob){throw new Error('Falha ao criar imagem')}
    const file=new File([blob],nomeArquivo,{type:'image/png'});
    if(navigator.share&&navigator.canShare&&navigator.canShare({files:[file]})){
      try{await navigator.share({files:[file],title:titulo});return}catch(e){if(e&&e.name==='AbortError')return}
    }
    const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=nomeArquivo;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(a.href),1500);
    if(typeof toast==='function')toast('Imagem gerada.');
  }catch(e){console.error(e);alert('Não foi possível gerar a imagem. Tente atualizar a página.')}
}

function abrirLinkCompartilhamento(url){
  const a=document.createElement('a');a.href=url;a.target='_blank';a.rel='noopener noreferrer';document.body.appendChild(a);a.click();a.remove();
}

async function gerarImagemECompartilhar(){return gerarImagemElemento(document.getElementById('folha-timbrada'),'relatorio-louvor.png','Relatório Grupo de Louvor')}

function enviarTextoWhatsApp(){
  const data=document.getElementById('ensaio-data').value,itens=Object.values((window.todosOsDados||{})[data]||{});
  if(!itens.length)return alert('Sem registros nesta data.');
  let txt=`*Grupo de Louvor - ICM PINHOS*\n*${formatData(data)}*\n\n`;
  itens.sort((a,b)=>(a.nome||'').localeCompare(b.nome||'','pt-BR')).forEach(m=>txt+=`${m.status==='presente'?'✅':m.status==='atrasado'?'🟡':'❌'} ${m.nome} - ${m.status==='presente'?'Presente':m.status==='atrasado'?'Atrasado':'Faltou'}${m.motivo?' ('+m.motivo+')':''}\n`);
  abrirLinkCompartilhamento('https://wa.me/?text='+encodeURIComponent(txt));
}

async function compartilharDashboardImagem(){
  const mes=document.getElementById('mes-dashboard').value;
  if(!mes)return alert('Selecione um mês.');
  const d=dadosDashboard(mes);
  if(!Object.keys(d.map).length)return alert('Sem registros neste mês.');
  await gerarImagemElemento(document.getElementById('relatorio-geral-dashboard'),`relatorio-geral-${mes}.png`,'Relatório Geral de Presenças');
}

function compartilharDashboardWhatsApp(){
  const mes=document.getElementById('mes-dashboard').value,d=dadosDashboard(mes),nomes=Object.keys(d.map).sort((a,b)=>a.localeCompare(b,'pt-BR'));
  if(!nomes.length)return alert('Sem registros neste mês.');
  const periodo=mes.split('-').reverse().join('/');
  let txt=`*GRUPO DE LOUVOR - ICM PINHOS*\n*Relatório Geral de Presenças - ${periodo}*\n\n`;
  txt+=`Chamadas: ${d.datas.length}\nPresenças: ${d.pres}\nAtrasos: ${d.atr}\nFaltas: ${d.fal}\nTaxa geral: ${d.taxa}%\n\n*Frequência por integrante*\n`;
  nomes.forEach(n=>{const x=d.map[n],pct=x.total?Math.round((x.p/x.total)*100):0;txt+=`${n}: ${pct}% | P ${x.p} | A ${x.a} | F ${x.f}\n`});
  abrirLinkCompartilhamento('https://wa.me/?text='+encodeURIComponent(txt));
}

function imprimirDashboard(){
  const el=document.getElementById('relatorio-geral-dashboard');
  if(!el)return alert('Relatório não encontrado.');
  const mes=document.getElementById('mes-dashboard').value,d=dadosDashboard(mes);
  if(!Object.keys(d.map).length)return alert('Sem registros neste mês.');
  const w=window.open('','_blank');
  if(!w)return alert('O navegador bloqueou a janela do PDF. Permita pop-ups para este site e tente novamente.');
  const css=`body{font-family:Segoe UI,Arial,sans-serif;padding:24px;color:#222}.paper-title{text-align:center;font-weight:900;margin-bottom:12px}.stats{display:flex;gap:8px;flex-wrap:wrap;margin:12px 0}.stat{border:1px solid #ccc;border-radius:8px;padding:8px 12px;text-align:center;min-width:90px}.stat strong{display:block;font-size:18px}.report-table{width:100%;border-collapse:collapse}.report-table th,.report-table td{border:1px solid #bbb;padding:7px;text-align:left}.report-table th{background:#0b1b46;color:#fff}.muted{color:#666;font-size:12px}@media print{body{padding:0}}`;
  w.document.open();
  w.document.write(`<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Relatório Geral de Presenças</title><style>${css}</style></head><body>${el.innerHTML}<script>window.onload=function(){setTimeout(function(){window.print()},250)}<\/script></body></html>`);
  w.document.close();
}

window.gerarImagemECompartilhar=gerarImagemECompartilhar;
window.enviarTextoWhatsApp=enviarTextoWhatsApp;
window.compartilharDashboardImagem=compartilharDashboardImagem;
window.compartilharDashboardWhatsApp=compartilharDashboardWhatsApp;
window.imprimirDashboard=imprimirDashboard;

function renderTudo(){if(!window.usuarioAtual)return;renderizarListaCadastrados();montarRascunho();renderChamadaSalva();gerarFolhaDiaria();renderHistorico();carregarDashboard();if(window.isAdmin){carregarRolesAdmin();renderAuditoria();renderPerfis()}}