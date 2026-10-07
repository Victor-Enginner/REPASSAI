import json,zipfile
from pathlib import Path
root=Path(__file__).resolve().parents[1]/"public"
catalog=json.loads((root/"templates/catalog.json").read_text(encoding="utf-8"))["templates"]
assert len(catalog)==61
for item in catalog:
    slug=item["slug"]
    for ext in (".json",".html",".zip"):
        file=root/"templates"/(slug+ext)
        assert file.exists() and file.stat().st_size>0
    assert (root/"template-thumbnails"/(slug+".jpg")).exists()
    with zipfile.ZipFile(root/"templates"/(slug+".zip")) as archive:
        assert {"index.html","DESIGN.md","prompts.json"}==set(archive.namelist())
        assert archive.testzip() is None
    assert "token=" not in (root/"templates"/(slug+".json")).read_text(encoding="utf-8")
print("PASS: 61 fichas, HTMLs, ZIPs íntegros e miniaturas.")
