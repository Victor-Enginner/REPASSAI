"""Mapa técnico dos projetos extraídos: leitura estática, sem executar código recebido."""
from pathlib import Path
import json
import re

ROOT = Path(__file__).resolve().parents[1]
BASE = ROOT / 'Site Pack Assets' / 'Extraidos'
results = []
for folder in sorted(BASE.iterdir()):
    if not folder.is_dir() or folder.name.startswith('.'):
        continue
    manifest = folder / 'INVENTARIO_REPASS.json'
    if not manifest.exists():
        continue
    inventory = json.loads(manifest.read_text(encoding='utf-8'))
    source_files = [p for p in folder.rglob('*') if p.suffix in ('.tsx', '.jsx', '.js', '.ts', '.css', '.html') and p.is_file()]
    contents = []
    for path in source_files:
        if path.stat().st_size <= 1024 * 1024:
            contents.append(path.read_text(encoding='utf-8', errors='replace'))
    source = '\n'.join(contents)
    routes = [p.relative_to(folder).as_posix() for p in folder.rglob('*') if p.name in ('page.tsx', 'page.jsx', 'route.ts', 'route.js')]
    env_names = sorted(set(re.findall(r'process\.env\.([A-Z][A-Z0-9_]*)', source)))
    features = []
    for pattern, description in [
        (r'@react-three|three|Canvas', '3D/WebGL: requer teste de desempenho e fallback mobile'),
        (r'framer-motion|motion/react', 'Animações React Motion'),
        (r'lenis', 'Scroll suave Lenis'),
        (r'gsap', 'Animações GSAP'),
        (r'useState|useEffect', 'Componentes interativos/client-side'),
        (r'<form|onSubmit', 'Formulários: conferir destino e validação'),
        (r'fetch\(|axios', 'Chamadas de rede: conferir endpoints e autenticação'),
        (r'openai|anthropic|@ai-sdk|google/generative', 'Integração IA: manter chaves apenas no backend REPASS'),
        (r'next/image', 'Imagens Next.js: adaptar otimização para exportação/preview'),
        (r'localStorage', 'Uso de storage local: revisar dados armazenados'),
    ]:
        if re.search(pattern, source, flags=re.I):
            features.append(description)
    public = folder / 'public'
    assets = [p.relative_to(folder).as_posix() for p in public.rglob('*') if p.is_file()] if public.exists() else []
    license_files = [p.relative_to(folder).as_posix() for p in folder.rglob('*') if p.is_file() and p.name.lower() in ('license', 'license.md', 'license.txt')]
    readmes = [p for p in folder.rglob('README.md') if p.stat().st_size < 100000]
    result = {'projeto': folder.name, 'pacotes': inventory['pacotes'], 'rotas': routes, 'assets_publicos': len(assets),
              'licencas_encontradas': license_files, 'variaveis_de_ambiente_referenciadas': env_names,
              'observacoes_tecnicas': features,
              'integracao': 'Requer build/adaptação Next.js; não é HTML pronto para o editor' if inventory['pacotes'] else 'HTML/CSS/JS: preservar arquivos relativos e usar preview isolado',
              'codigo_executado': False}
    (folder / 'ANALISE_TECNICA_REPASS.json').write_text(json.dumps(result, ensure_ascii=False, indent=2), encoding='utf-8')
    markdown = ['# Análise técnica — ' + folder.name, '', 'Leitura estática; dependências e scripts não executados.', '', '## Integração', '', result['integracao'], '', '## Pacotes']
    for package in result['pacotes']:
        markdown += [f"- {package['tecnologia']} ({package['arquivo']})", '- Dependências: ' + ', '.join(package['dependencias'])]
    markdown += ['', '## Rotas e entradas', ''] + ['- ' + p for p in routes]
    markdown += ['', '## Comportamento detectado', ''] + ['- ' + p for p in features]
    markdown += ['', '## Assets e configuração', '', f'Assets em public/: {len(assets)}',
                 'Nomes de variáveis referenciadas: ' + (', '.join(env_names) or 'nenhuma detectada'),
                 'Arquivos de licença: ' + (', '.join(license_files) or 'nenhum encontrado; verificar fornecedor'),
                 '', '## Checklist antes de entrar na loja', '',
                 '- Revisar licença para uso comercial/redistribuição.',
                 '- Auditar dependências antes de instalar.',
                 '- Confirmar que formulários, serviços de IA e APIs não usam credenciais/clientes de exemplo.',
                 '- Preservar visual original; não substituir por preview genérico.',
                 '- Validar desktop, tablet e mobile; conectar ao editor apenas após adaptação.']
    (folder / 'ANALISE_TECNICA_REPASS.md').write_text('\n'.join(markdown), encoding='utf-8')
    results.append(result)
(ROOT / 'docs' / 'ANALISE_SITE_PACK_2026-10-05.json').write_text(json.dumps(results, ensure_ascii=False, indent=2), encoding='utf-8')
print(json.dumps({'projetos_analisados': len(results), 'nextjs': sum(bool(r['pacotes']) for r in results), 'html': sum(not r['pacotes'] for r in results)}))
