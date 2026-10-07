const groups = [
 ['barbearia','barber','salon','stylist','cabelo','hair','beleza','beauty','estetica'],
 ['restaurante','restaurant','burger','hamburgueria','food','gastronomia'],
 ['cafe','coffee','cafeteria','roastery'],
 ['imobiliaria','imoveis','estate','property','realty'],
 ['advocacia','advogado','law','legal'],
 ['saude','clinica','medical','wellness','physiotherapy','odontologia'],
 ['academia','fitness','trainer','yoga'],
 ['software','saas','startup','technology','tecnologia','automation'],
 ['eletricista','electrical','electricia'],
 ['construcao','contractor','construction','renovation'],
 ['joalheria','jewelry','jeweller'],
 ['automotivo','automotive','carro','car'],
];
function words(value) { return new Set(String(value||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().match(/[a-z0-9]+/g)||[]); }
export function rankTemplates(catalog, briefing) {
 const query=words(`${briefing.categoria||''} ${briefing.orientacao||''}`);
 const active=groups.filter(group=>group.some(term=>query.has(term)));
 return catalog.map(template=>{
  const title=words(template.titulo), description=words(template.descricao);
  let score=0; const reasons=[];
  for(const group of active) {
   const matched=group.filter(term=>title.has(term)||description.has(term));
   if(matched.length){score+=10+matched.filter(term=>title.has(term)).length*3;reasons.push(`Categoria relacionada: ${matched.join(', ')}`);}
  }
  for(const term of query) if(term.length>=4 && title.has(term)){score+=2;reasons.push(`Título contém: ${term}`);}
  return {template,score,reasons};
 }).sort((a,b)=>b.score-a.score||a.template.slug.localeCompare(b.template.slug));
}
