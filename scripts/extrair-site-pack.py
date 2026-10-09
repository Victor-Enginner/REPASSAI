"""Extrai cada ZIP em pasta isolada, sem executar dependências ou sobrescrever arquivos."""
from pathlib import Path, PurePosixPath
import hashlib
import json
import os
import re
import shutil
import stat
import tempfile
import zipfile

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / 'Site Pack Assets'
DEST = SOURCE / 'Extraidos'
MAX_BYTES = 512 * 1024 * 1024
RESERVED = re.compile(r'^(con|prn|aux|nul|com[1-9]|lpt[1-9])(?:\.|$)', re.I)


def validated_entries(archive):
    infos = archive.infolist()
    if len(infos) > 20000 or sum(i.file_size for i in infos) > MAX_BYTES:
        raise ValueError('Limite de extração excedido')
    seen = set()
    for info in infos:
        name = info.filename.replace('\\', '/')
        parts = name.rstrip('/').split('/')
        if not name or name.startswith('/') or any(p in ('', '.', '..') or ':' in p or p.endswith((' ', '.')) or RESERVED.match(p) for p in parts):
            raise ValueError('Caminho inválido no ZIP')
        if stat.S_ISLNK(info.external_attr >> 16):
            raise ValueError('Link simbólico no ZIP')
        key = name.rstrip('/').casefold()
        if key in seen:
            raise ValueError('Caminho duplicado no ZIP')
        seen.add(key)
        if info.file_size > 2 * 1024 * 1024 and info.file_size / max(info.compress_size, 1) > 1000:
            raise ValueError('Taxa de compressão excessiva')
        yield info, PurePosixPath(name)


def inspect(folder, source, entries):
    packages = []
    for path in folder.rglob('package.json'):
        if 'node_modules' in path.parts:
            continue
        try:
            data = json.loads(path.read_text(encoding='utf-8'))
            deps = {**data.get('dependencies', {}), **data.get('devDependencies', {})}
            packages.append({'arquivo': path.relative_to(folder).as_posix(), 'nome': data.get('name'),
                             'tecnologia': 'Next.js' if 'next' in deps else 'React' if 'react' in deps else 'JavaScript',
                             'dependencias': sorted(deps), 'scripts_disponiveis': sorted(data.get('scripts', {}))})
        except (ValueError, OSError):
            pass
    paths = sorted(p.relative_to(folder).as_posix() for p in folder.rglob('*') if p.is_file())
    with source.open('rb') as original:
        digest = hashlib.file_digest(original, 'sha256').hexdigest()
    report = {'zip_original': source.name, 'sha256': digest,
              'arquivos': paths, 'pacotes': packages,
              'entradas_principais': [p for p in paths if p.endswith(('index.html', 'page.tsx', 'page.jsx', 'App.tsx', 'App.jsx', 'README.md', 'LICENSE', 'LICENSE.md', 'DESIGN.md'))],
              'arquivos_env': [p for p in paths if Path(p).name.startswith('.env')],
              'estado': 'extraido; codigo nao executado; integracao pendente',
              'tipo': 'projeto' if packages else 'html' if any(p.endswith('.html') for p in paths) else 'assets'}
    (folder / 'INVENTARIO_REPASS.json').write_text(json.dumps(report, ensure_ascii=False, indent=2), encoding='utf-8')
    summary = ['# Inventário REPASS', '', f'Origem: {source.name}', f'Arquivos extraídos: {len(paths)}', '',
               'Nenhum script, dependência ou servidor deste pacote foi executado.',
               'A extração preserva arquivos; não transfere direitos de propriedade nem autoriza redistribuição.',
               'Verificar licença e condições do fornecedor antes de publicar ou vender.', '', '## Tecnologia']
    summary += [f"- {p['tecnologia']} — {p['arquivo']}" for p in packages] or ['- HTML/assets sem package.json']
    summary += ['', '## Entradas principais'] + [f'- {p}' for p in report['entradas_principais']]
    summary += ['', '## Próximos passos', '',
                '- Revisar dependências e licença.',
                '- Para Next.js: separar serviços/API, remover chaves de exemplo e avaliar exportação estática.',
                '- Para HTML: preservar CSS/JS/imagens e validar preview isolado.',
                '- Conferir responsividade antes de adaptar ao editor REPASS.',
                '- PDFs e documentação não devem aparecer como templates completos.']
    (folder / 'LEIA-ME_REPASS.md').write_text('\n'.join(summary), encoding='utf-8')
    return {'zip': source.name, 'pasta': str(folder.relative_to(ROOT)), 'arquivos': len(paths), 'tipo': report['tipo'], 'tecnologias': sorted(set(p['tecnologia'] for p in packages))}


def run():
    DEST.mkdir(exist_ok=True)
    report = {'extraidos': [], 'ignorados': [], 'falhas': []}
    for source in sorted(SOURCE.glob('*.zip')):
        target = DEST / source.stem
        staging = None
        try:
            with zipfile.ZipFile(source) as archive:
                entries = list(validated_entries(archive))
                if not entries:
                    raise ValueError('ZIP vazio')
                if target.exists():
                    report['ignorados'].append({'zip': source.name, 'motivo': 'Pasta já existe; não sobrescrita'})
                    continue
                staging = Path(tempfile.mkdtemp(prefix='.extracao-', dir=DEST))
                for info, relative in entries:
                    path = staging.joinpath(*relative.parts)
                    if not path.resolve().is_relative_to(staging.resolve()):
                        raise ValueError('Caminho fora da pasta')
                    if info.is_dir():
                        path.mkdir(parents=True, exist_ok=True)
                    else:
                        path.parent.mkdir(parents=True, exist_ok=True)
                        with archive.open(info) as src, path.open('xb') as dst:
                            shutil.copyfileobj(src, dst)
                item = inspect(staging, source, entries)
                staging.rename(target)
                item['pasta'] = str(target.relative_to(ROOT))
                report['extraidos'].append(item)
                print('OK', source.name, item['tipo'], flush=True)
        except (zipfile.BadZipFile, ValueError, OSError) as exc:
            report['falhas'].append({'zip': source.name, 'motivo': str(exc), 'pasta_parcial': str(staging) if staging else None})
            print('FALHA', source.name, type(exc).__name__, flush=True)
    (DEST / 'INVENTARIO_GERAL.json').write_text(json.dumps(report, ensure_ascii=False, indent=2), encoding='utf-8')
    print(json.dumps({k: len(v) for k, v in report.items()}))


if __name__ == '__main__':
    run()
