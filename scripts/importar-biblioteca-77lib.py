"""Importação incremental dos slugs observados na biblioteca autenticada."""
from pathlib import Path
import json
import sys
from dotenv import load_dotenv

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / 'backend'))
load_dotenv(ROOT / 'backend' / '.env')
import templates_store

if not templates_store.token():
    raise SystemExit('Configure LIB77_TOKEN no backend antes de importar.')
slugs = list(dict.fromkeys((ROOT / 'config' / '77lib-templates-slugs.txt').read_text().splitlines()))
result = {'origem': 'biblioteca autenticada 77lib, Templates Free', 'total': len(slugs), 'importados': [], 'falhas': []}
for index, slug in enumerate(slugs, 1):
    try:
        ficha = templates_store.importar(slug)
        if not templates_store.html_do_template(slug):
            raise RuntimeError('Conteúdo HTML ausente.')
        result['importados'].append({'slug': slug, 'titulo': ficha['titulo']})
        print(f'[{index}/{len(slugs)}] OK {slug}', flush=True)
    except Exception as exc:
        # Erro de rede nunca inclui URL autenticada ou credencial no relatório.
        result['falhas'].append({'slug': slug, 'tipo': type(exc).__name__})
        print(f'[{index}/{len(slugs)}] FALHA {slug} ({type(exc).__name__})', flush=True)
(ROOT / 'docs' / 'IMPORTACAO_77LIB_2026-10-05.json').write_text(json.dumps(result, ensure_ascii=False, indent=2), encoding='utf-8')
print(json.dumps({'importados': len(result['importados']), 'falhas': len(result['falhas']), 'catalogo_local': len(templates_store.listar())}))
sys.exit(1 if result['falhas'] else 0)
