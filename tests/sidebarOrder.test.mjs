import test from 'node:test';
import assert from 'node:assert/strict';
import { moveSidebarItem, restoreSidebarOrder, saveSidebarOrder, SIDEBAR_ORDER_KEY } from '../src/components/sidebarOrder.js';

const defaults = [
  { id: 'suite', itens: [{ id: 'painel' }, { id: 'sites' }] },
  { id: 'ia', itens: [{ id: 'motor' }, { id: 'agentes' }] },
];

test('mantém última opção fixa mesmo com preferências salvas anteriores', () => {
  const fixedDefaults = [defaults[0], { id: 'neural', fixed: true, itens: [{ id: 'engine', fixed: true }] }];
  assert.equal(moveSidebarItem(fixedDefaults, 'engine', 'suite'), fixedDefaults);
  assert.equal(moveSidebarItem(fixedDefaults, 'painel', 'neural'), fixedDefaults);
  const restored = restoreSidebarOrder(fixedDefaults, { getItem: () => JSON.stringify({ version: 1, sections: [
    { id: 'suite', items: ['engine', 'painel'] }, { id: 'neural', items: ['sites'] }
  ] }) });
  assert.deepEqual(restored.map(section => section.itens.map(item => item.id)), [['painel', 'sites'], ['engine']]);
});

test('move entre seções sem perder itens', () => {
  const result = moveSidebarItem(defaults, 'motor', 'suite', 'sites');
  assert.deepEqual(result.map(section => section.itens.map(item => item.id)),
    [['painel', 'motor', 'sites'], ['agentes']]);
  assert.deepEqual(defaults[1].itens.map(item => item.id), ['motor', 'agentes']);
});

test('restaura ordem, ignora IDs desconhecidos e acrescenta novos módulos', () => {
  const storage = new Map();
  const adapter = { getItem: key => storage.get(key), setItem: (key, value) => storage.set(key, value) };
  saveSidebarOrder(moveSidebarItem(defaults, 'motor', 'suite', 'sites'), adapter);
  const saved = JSON.parse(storage.get(SIDEBAR_ORDER_KEY));
  saved.sections[0].items.push('fantasma', 'motor');
  storage.set(SIDEBAR_ORDER_KEY, JSON.stringify(saved));
  const newer = [{ ...defaults[0], itens: [...defaults[0].itens, { id: 'novo' }] }, defaults[1]];
  assert.deepEqual(restoreSidebarOrder(newer, adapter).map(section => section.itens.map(item => item.id)),
    [['painel', 'motor', 'sites', 'novo'], ['agentes']]);
});

test('não move item para destino inválido', () => {
  assert.equal(moveSidebarItem(defaults, 'motor', 'ausente'), defaults);
  assert.equal(moveSidebarItem(defaults, 'motor', 'suite', 'ausente'), defaults);
});
