"""Rebuild the local ATS TrueType font from the installed OFL Fontsource files.

Requires: pip install fonttools
Normal development/deployment does not require Python: the TTF is committed.
No network resources or proprietary/system fonts are used.
"""

from pathlib import Path
from tempfile import TemporaryDirectory

from fontTools.merge import Merger, Options
from fontTools.ttLib import TTFont

root = Path(__file__).resolve().parents[1]
source = root / "node_modules/@fontsource/noto-sans-sc/files"
target = root / "public/fonts/BirchifyATS-Regular.ttf"
inputs = sorted(p for p in source.glob("*-400-normal.woff") if "chinese-simplified" not in p.name)
if len(inputs) < 90:
    raise RuntimeError("Missing Fontsource subsets. Run npm ci first.")

with TemporaryDirectory(prefix="birchify-font-") as temporary:
    paths = []
    for index, path in enumerate(inputs):
        font = TTFont(path)
        font.flavor = None
        for table in ("BASE", "GDEF", "GPOS", "GSUB", "STAT", "vhea", "vmtx"):
            if table in font:
                del font[table]
        output = Path(temporary) / f"{index}.ttf"
        font.save(output)
        paths.append(str(output))
    options = Options()
    options.drop_tables = ["BASE", "GDEF", "GPOS", "GSUB", "STAT", "vhea", "vmtx"]
    merged = Merger(options).merge(paths)
    # Modified font: use our own family name, as required by the OFL.
    names = {1: "Birchify ATS", 2: "Regular", 3: "BirchifyATS-Regular-1.0", 4: "Birchify ATS Regular", 6: "BirchifyATS-Regular"}
    for name in merged["name"].names:
        if name.nameID in names:
            name.string = names[name.nameID].encode(name.getEncoding())
    target.parent.mkdir(parents=True, exist_ok=True)
    merged.save(target)
    print(f"{target.name}: {target.stat().st_size:,} bytes, {len(merged.getBestCmap()):,} Unicode characters")
