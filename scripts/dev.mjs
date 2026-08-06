/**
 * REPASS AI - Inicia Frontend (Vite) + Backend (Python API) em um único comando.
 *
 * Resolve o erro "Failed to fetch":
 * 1. Limpa qualquer processo zumbi (python/node) preso nas portas 8000 ou 3000.
 * 2. Inicia o backend Python na porta 8000.
 * 3. Inicia o frontend Vite na porta 3000.
 */

import { spawn, execSync } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const raiz = path.resolve(__dirname, '..');

// Função para limpar portas ocupadas no Windows antes de iniciar
function liberarPorta(porta) {
  if (process.platform !== 'win32') return;
  try {
    const out = execSync(`netstat -ano | findstr :${porta}`, { encoding: 'utf-8', stdio: ['pipe', 'pipe', 'ignore'] });
    const linhas = out.split('\n');
    const pids = new Set();
    for (const linha of linhas) {
      if (linha.includes('LISTENING')) {
        const partes = linha.trim().split(/\s+/);
        const pid = partes[partes.length - 1];
        if (pid && pid !== '0') pids.add(pid);
      }
    }
    for (const pid of pids) {
      try {
        execSync(`taskkill /F /PID ${pid}`, { stdio: 'ignore' });
        console.log(`🧹 Porta ${porta} liberada (processo zumbi ${pid} finalizado).`);
      } catch {}
    }
  } catch {}
}

console.log('🚀 Preparando ambiente REPASS AI...');
liberarPorta(8000);
liberarPorta(3000);

console.log('\n✅ Iniciando Backend (Porta 8000) e Frontend (Porta 3000)...\n');

// 1. Inicia o Backend Python
const pythonCmd = process.platform === 'win32' ? 'python' : 'python3';
const backendProc = spawn(pythonCmd, ['-u', 'backend/run_dev_single_user.py'], {
  cwd: raiz,
  stdio: 'pipe',
  shell: true,
  // PORT precisa ser fixado aqui.
  //
  // `spawn` herda process.env, e `app_api.py` respeita PORT. Num ambiente
  // que já define PORT=3000 (harness de preview, Heroku, vários PaaS), o
  // backend subia na 3000 — a porta do Vite — e o frontend não subia. O
  // sintoma era enganoso: a API respondia 404 em "/" e parecia que o
  // frontend tinha quebrado.
  //
  // Este script existe para subir os dois lado a lado, então as portas são
  // contrato dele, não do ambiente.
  env: { ...process.env, PORT: '8000' },
});

backendProc.stdout.on('data', (data) => {
  const txt = data.toString().trim();
  if (txt) console.log(`[API 8000] ${txt}`);
});

backendProc.stderr.on('data', (data) => {
  const txt = data.toString().trim();
  if (txt) console.error(`[API 8000 ERR] ${txt}`);
});

// 2. Inicia o Frontend Vite
const npxCmd = process.platform === 'win32' ? 'npx.cmd' : 'npx';
const frontendProc = spawn(npxCmd, ['vite'], {
  cwd: raiz,
  stdio: 'pipe',
  shell: true,
});

frontendProc.stdout.on('data', (data) => {
  const txt = data.toString().trim();
  if (txt) console.log(`[VITE 3000] ${txt}`);
});

frontendProc.stderr.on('data', (data) => {
  const txt = data.toString().trim();
  if (txt) console.error(`[VITE 3000 ERR] ${txt}`);
});

// Encerrar ambos limpos no Ctrl+C
function fechar() {
  console.log('\n🛑 Encerrando servidores...');
  try { backendProc.kill(); } catch {}
  try { frontendProc.kill(); } catch {}
  process.exit(0);
}

process.on('SIGINT', fechar);
process.on('SIGTERM', fechar);
process.on('exit', fechar);
