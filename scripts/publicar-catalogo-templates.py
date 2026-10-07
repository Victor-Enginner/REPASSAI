"""Gera pacote público sanitizado, sem credenciais do registry."""
import json, re, zipfile
from pathlib import Path
root = Path(__file__).resolve().parents[1]
source = root / "backend/data/templates_store"
target = root / "public/templates"
target.mkdir(parents=True, exist_ok=True)
def clean(value):
    if isinstance(value, str):
        return re.sub(r"([?&])token=[^\s\"'<>\\)]+", "", value)
    if isinstance(value, list): return [clean(v) for v in value]
    if isinstance(value, dict): return {k:clean(v) for k,v in value.items()}
    return value
catalog=[]
for file in sorted(source.glob("*.json")):
    meta=clean(json.loads(file.read_text(encoding="utf-8")))
    slug=meta["slug"]
    if not re.fullmatch(r"[a-zA-Z0-9_-]+",slug): raise ValueError("Slug inválido")
    html=clean((source/(slug+".html")).read_text(encoding="utf-8"))
    html=re.sub(r'<script\b[^>]*googletagmanager[^>]*>[\s\S]*?</script>', '', html, flags=re.I)
    meta["comando_instalacao"]="Baixe o ZIP deste template para usar o index.html e DESIGN.md."
    meta["publicado_estatico"]=True
    (target/(slug+".html")).write_text(html,encoding="utf-8")
    (target/(slug+".json")).write_text(json.dumps(meta,ensure_ascii=False),encoding="utf-8")
    with zipfile.ZipFile(target/(slug+".zip"),"w",zipfile.ZIP_DEFLATED) as archive:
        archive.writestr("index.html",html)
        archive.writestr("DESIGN.md",meta.get("design_md",""))
        archive.writestr("prompts.json",json.dumps(meta.get("prompts",{}),ensure_ascii=False))
    catalog.append({k:v for k,v in meta.items() if k not in {"design_md","prompts"}})
if len(catalog)!=61: raise ValueError("Esperados 61 templates")
(target/"catalog.json").write_text(json.dumps({"templates":catalog},ensure_ascii=False),encoding="utf-8")
print("61 fichas, previews e ZIPs sanitizados.")
