export const SIDEBAR_ORDER_KEY = 'repass.sidebar.order.v3';

export function restoreSidebarOrder(defaultSections, storage) {
  try {
    const saved = JSON.parse(storage?.getItem(SIDEBAR_ORDER_KEY) || 'null');
    if (saved?.version !== 1 || !Array.isArray(saved.sections)) return defaultSections;

    const known = new Map(defaultSections.flatMap(section => section.itens.map(item => [item.id, item])));
    const savedBySection = new Map(saved.sections
      .filter(section => section && typeof section.id === 'string' && Array.isArray(section.items))
      .map(section => [section.id, section.items]));
    const used = new Set();
    const restored = defaultSections.map(section => ({ ...section, itens: [] }));

    restored.forEach(section => {
      for (const id of savedBySection.get(section.id) || []) {
        if (typeof id !== 'string' || !known.has(id) || used.has(id)) continue;
        if (known.get(id).fixed || section.fixed) continue;
        section.itens.push(known.get(id));
        used.add(id);
      }
    });

    defaultSections.forEach((section, index) => {
      section.itens.forEach(item => {
        if (used.has(item.id)) return;
        restored[index].itens.push(item);
        used.add(item.id);
      });
    });
    return restored;
  } catch {
    return defaultSections;
  }
}

export function saveSidebarOrder(sections, storage) {
  try {
    storage?.setItem(SIDEBAR_ORDER_KEY, JSON.stringify({
      version: 1,
      sections: sections.map(section => ({ id: section.id, items: section.itens.map(item => item.id) })),
    }));
    return true;
  } catch {
    return false;
  }
}

export function moveSidebarItem(sections, itemId, targetSectionId, beforeId = null) {
  const source = sections.find(section => section.itens.some(item => item.id === itemId));
  const target = sections.find(section => section.id === targetSectionId);
  if (!source || !target || beforeId === itemId) return sections;

  const item = source.itens.find(candidate => candidate.id === itemId);
  if (item.fixed || target.fixed) return sections;
  const next = sections.map(section => ({
    ...section,
    itens: section.itens.filter(candidate => candidate.id !== itemId),
  }));
  const destination = next.find(section => section.id === targetSectionId);
  const index = beforeId === null
    ? destination.itens.length
    : destination.itens.findIndex(candidate => candidate.id === beforeId);
  if (beforeId !== null && index === -1) return sections;
  destination.itens.splice(index, 0, item);

  const unchanged = sections.every((section, sectionIndex) =>
    section.itens.map(candidate => candidate.id).join('|') ===
    next[sectionIndex].itens.map(candidate => candidate.id).join('|'));
  return unchanged ? sections : next;
}
