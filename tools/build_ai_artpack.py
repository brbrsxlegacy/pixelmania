from __future__ import annotations

import argparse
import json
import math
from pathlib import Path

from PIL import Image, ImageFilter


def is_key_pixel(r: int, g: int, b: int) -> bool:
    return r > 195 and b > 185 and g < 115 and (r + b - g) > 330


def to_alpha(source: Image.Image) -> tuple[Image.Image, list[list[bool]]]:
    img = source.convert("RGBA")
    px = img.load()
    mask: list[list[bool]] = []
    for y in range(img.height):
        row: list[bool] = []
        for x in range(img.width):
            r, g, b, a = px[x, y]
            key = is_key_pixel(r, g, b)
            if key:
                px[x, y] = (0, 0, 0, 0)
                row.append(False)
            else:
                row.append(a > 8)
        mask.append(row)
    return img, mask


def bands(values: list[int], threshold: int, max_gap: int, min_size: int) -> list[tuple[int, int]]:
    raw: list[tuple[int, int]] = []
    start: int | None = None
    last_active = -1
    for i, value in enumerate(values):
        active = value > threshold
        if active:
            if start is None:
                start = i
            last_active = i
        elif start is not None and i - last_active > max_gap:
            raw.append((start, last_active + 1))
            start = None
    if start is not None:
        raw.append((start, last_active + 1))

    merged: list[tuple[int, int]] = []
    for a, b in raw:
        if b - a < min_size:
            continue
        if merged and a - merged[-1][1] <= max_gap:
            merged[-1] = (merged[-1][0], b)
        else:
            merged.append((a, b))
    return merged


def bbox_for(mask: list[list[bool]], x0: int, y0: int, x1: int, y1: int, pad: int) -> tuple[int, int, int, int] | None:
    xs: list[int] = []
    ys: list[int] = []
    h = len(mask)
    w = len(mask[0]) if h else 0
    x0 = max(0, x0)
    y0 = max(0, y0)
    x1 = min(w, x1)
    y1 = min(h, y1)
    for y in range(y0, y1):
        row = mask[y]
        for x in range(x0, x1):
            if row[x]:
                xs.append(x)
                ys.append(y)
    if not xs:
        return None
    return (
        max(0, min(xs) - pad),
        max(0, min(ys) - pad),
        min(w, max(xs) + pad + 1),
        min(h, max(ys) + pad + 1),
    )


def extract_grid_items(source_path: Path, kind: str) -> list[Image.Image]:
    source = Image.open(source_path)
    img, mask = to_alpha(source)
    if kind == "buildings":
        return extract_connected_items(img, mask, radius=4, min_area=500, pad=8)
    if kind == "characters":
        return extract_connected_items(img, mask, radius=3, min_area=80, pad=6)
    return extract_connected_items(img, mask, radius=6, min_area=90, pad=6)


def extract_connected_items(
    img: Image.Image,
    mask: list[list[bool]],
    radius: int,
    min_area: int,
    pad: int,
) -> list[Image.Image]:
    width, height = img.size
    mask_image = Image.new("L", (width, height), 0)
    mask_px = mask_image.load()
    for y, row in enumerate(mask):
        for x, value in enumerate(row):
            if value:
                mask_px[x, y] = 255
    dilated = mask_image.filter(ImageFilter.MaxFilter(radius * 2 + 1))
    dilated_px = dilated.load()
    visited = bytearray(width * height)
    boxes: list[tuple[int, int, int, int, int]] = []

    for sy in range(height):
        for sx in range(width):
            offset = sy * width + sx
            if visited[offset] or not dilated_px[sx, sy]:
                continue
            stack = [(sx, sy)]
            visited[offset] = 1
            min_x = max_x = sx
            min_y = max_y = sy
            area = 0
            while stack:
                x, y = stack.pop()
                area += 1
                if x < min_x:
                    min_x = x
                if x > max_x:
                    max_x = x
                if y < min_y:
                    min_y = y
                if y > max_y:
                    max_y = y
                for nx, ny in ((x - 1, y), (x + 1, y), (x, y - 1), (x, y + 1)):
                    if nx < 0 or ny < 0 or nx >= width or ny >= height:
                        continue
                    n_offset = ny * width + nx
                    if visited[n_offset] or not dilated_px[nx, ny]:
                        continue
                    visited[n_offset] = 1
                    stack.append((nx, ny))
            if area >= min_area:
                box = bbox_for(mask, min_x, min_y, max_x + 1, max_y + 1, pad)
                if box:
                    boxes.append((*box, area))

    row_bucket = max(1, radius * 5)
    boxes.sort(key=lambda b: (b[1] // row_bucket, b[0]))
    items: list[Image.Image] = []
    for x0, y0, x1, y1, _area in boxes:
        crop = img.crop((x0, y0, x1, y1))
        if crop.getchannel("A").getbbox() is not None:
            items.append(crop)
    return items

def pack(items: list[Image.Image], out_path: Path, cell_w: int, cell_h: int, cols: int, max_items: int | None = None) -> dict:
    selected = items if max_items is None else items[:max_items]
    rows = max(1, math.ceil(len(selected) / cols))
    atlas = Image.new("RGBA", (cols * cell_w, rows * cell_h), (0, 0, 0, 0))
    for index, item in enumerate(selected):
        alpha_bbox = item.getchannel("A").getbbox()
        if alpha_bbox:
            item = item.crop(alpha_bbox)
        max_w = cell_w - 10
        max_h = cell_h - 10
        scale = min(max_w / item.width, max_h / item.height, 1.0)
        new_size = (max(1, int(item.width * scale)), max(1, int(item.height * scale)))
        item = item.resize(new_size, Image.Resampling.NEAREST)
        x = (index % cols) * cell_w + (cell_w - item.width) // 2
        y = (index // cols) * cell_h + (cell_h - item.height) // 2
        atlas.alpha_composite(item, (x, y))
    out_path.parent.mkdir(parents=True, exist_ok=True)
    atlas.save(out_path)
    return {
        "path": str(out_path).replace("\\", "/"),
        "count": len(selected),
        "cols": cols,
        "rows": rows,
        "cellW": cell_w,
        "cellH": cell_h,
    }


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--lumas", required=True, type=Path)
    parser.add_argument("--characters", required=True, type=Path)
    parser.add_argument("--buildings", required=True, type=Path)
    parser.add_argument("--out-dir", default=Path("assets/artpack"), type=Path)
    args = parser.parse_args()

    lumas = extract_grid_items(args.lumas, "lumas")
    characters = extract_grid_items(args.characters, "characters")
    buildings = extract_grid_items(args.buildings, "buildings")

    manifest = {
        "lumas": pack(lumas, args.out_dir / "lumas.png", 64, 64, 16),
        "characters": pack(characters, args.out_dir / "characters.png", 64, 72, 12),
        "buildings": pack(buildings, args.out_dir / "buildings.png", 176, 128, 6),
        "sourceCounts": {
            "lumas": len(lumas),
            "characters": len(characters),
            "buildings": len(buildings),
        },
    }

    manifest_path = args.out_dir / "manifest.json"
    manifest_path.write_text(json.dumps(manifest, indent=2), encoding="utf-8")
    print(json.dumps(manifest, indent=2))
    if manifest["lumas"]["count"] < 133:
        raise SystemExit("Not enough Luma sprites extracted")
    if manifest["characters"]["count"] < 20:
        raise SystemExit("Not enough character sprites extracted")
    if manifest["buildings"]["count"] < 24:
        raise SystemExit("Not enough building sprites extracted")


if __name__ == "__main__":
    main()
