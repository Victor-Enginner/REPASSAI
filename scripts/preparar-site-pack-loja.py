"""Gera metadados selecionados e um preview HTML; não executa os projetos."""
from pathlib import Path
import json

ROOT = Path(__file__).resolve().parents[1]

def run():
    analysis = json.loads((ROOT / 'docs/ANALISE_SITE_PACK_2026-10-05.json').read_text(encoding='utf-8'))
    items = []
    for project in analysis:
        items.append({
            'id': project['projeto'],
            'titulo': project['projeto'].replace('-', ' ').title(),
            'framework': 'Next.js' if project['pacotes'] else 'HTML/CSS/JS',
            'rotas': project['rotas'],
            'assets': project['assets_publicos'],
            'observacoes': project['observacoes_tecnicas'],
            'licenca': 'Encontrada; revisar termos' if project['licencas_encontradas'] else 'Revisão pendente',
            'status': 'Em validação',
            'previewDisponivel': project['projeto'] == 'background-animations-2',
        })
    source = ROOT / 'Site Pack Assets/Extraidos/background-animations-2'
    html = (source / 'index.html').read_text(encoding='utf-8')
    css = (source / 'style.css').read_text(encoding='utf-8')
    js = (source / 'script.js').read_text(encoding='utf-8')
    # Só estes três arquivos previamente inspecionados entram no preview.
    # CSP impede conexões com APIs, formulários e leitura de recursos do REPASS.
    module_url = 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js'
    policy = "default-src 'none'; script-src 'unsafe-inline' " + module_url + "; style-src 'unsafe-inline' https://fonts.googleapis.com; font-src https://fonts.gstatic.com; connect-src 'none'; img-src data:; form-action 'none'; base-uri 'none'"
    html = html.replace('<head>', '<head><meta http-equiv="Content-Security-Policy" content="' + policy + '">', 1)
    css += '\n.text { font-size: clamp(1.5rem, 8vw, 4.125rem); max-width: 100%; }'
    html = html.replace('<link rel="stylesheet" href="style.css">', '<style>' + css + '</style>')
    html = html.replace('<script src="https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.min.js"></script>', '')
    js = js.replace('this.cfg = this.read()', "this.cfg = this.read(); if (matchMedia('(prefers-reduced-motion: reduce)').matches) { this.cfg.speed = 0; this.cfg.enableRipples = false }")
    html = html.replace('<script src="script.js"></script>', '<script type="module">import * as THREE from "' + module_url + '";\n' + js + '</script>')
    output = ROOT / 'src/data/sitePackValidation.json'
    output.write_text(json.dumps({'projetos': items, 'previewHTML': html}, ensure_ascii=False, indent=2), encoding='utf-8')
    print(json.dumps({'projetos': len(items), 'previews_html_preparados': 1, 'previews_next_pendentes': 13}))

if __name__ == '__main__':
    run()
