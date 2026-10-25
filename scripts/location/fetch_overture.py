"""Overture Maps (OpenStreetMap + Microsoft + Esri ...) нээлттэй өгөгдлөөс
төслийн орчмын бодит барилга, зам, ус, ногоон бүсийг таслан авна.

Overture-ийн GeoParquet файлуудыг S3-аас HTTPS-ээр (range request) уншиж,
row group-ийн bbox статистикаар шүүнэ — бүх дэлхийн өгөгдлийг татахгүй.

  python scripts/location/fetch_overture.py            # → scripts/location/.cache/*.parquet

Лиценз: ODbL (© OpenStreetMap contributors, Overture Maps Foundation) —
вэб дээр эх сурвалжийг заавал дурдана.
"""

import json
import math
import os
import re
import sys
import time
import urllib.parse
import urllib.request
from concurrent.futures import ThreadPoolExecutor

import fsspec
import pyarrow as pa
import pyarrow.compute as pc
import pyarrow.parquet as pq

HERE = os.path.dirname(os.path.abspath(__file__))
CACHE = os.path.join(HERE, ".cache")
BUCKET = "https://overturemaps-us-west-2.s3.us-west-2.amazonaws.com"
RELEASE = os.environ.get("OVERTURE_RELEASE", "2026-10-21.0")

# Төслийн цэг (site-content.ts → coords) ба таслах хүрээ (м): зүүн/баруун, хойд/урд
SITE = (47.89733862835647, 106.88538756153864)
EXTENT = {"west": 6000, "east": 6500, "north": 5500, "south": 4500}

TYPES = {
    "building": ("buildings", ["id", "geometry", "height", "num_floors", "min_height", "class", "subtype", "names", "is_underground", "bbox"]),
    "segment": ("transportation", ["id", "geometry", "subtype", "class", "names", "road_flags", "bbox"]),
    "water": ("base", ["id", "geometry", "subtype", "class", "names", "is_intermittent", "bbox"]),
    "land_use": ("base", ["id", "geometry", "subtype", "class", "names", "bbox"]),
    "land_cover": ("base", ["id", "geometry", "subtype", "bbox"]),
    "place": ("places", ["id", "geometry", "names", "categories", "confidence", "bbox"]),
}


def bbox_deg():
    lat0, lng0 = SITE
    m_lat = 110574.0
    m_lng = 111320.0 * math.cos(math.radians(lat0))
    return (lng0 - EXTENT["west"] / m_lng, lng0 + EXTENT["east"] / m_lng,
            lat0 - EXTENT["south"] / m_lat, lat0 + EXTENT["north"] / m_lat)


def list_files(theme, typ):
    keys, token = [], None
    while True:
        q = f"{BUCKET}/?list-type=2&prefix=release/{RELEASE}/theme={theme}/type={typ}/"
        if token:
            q += "&continuation-token=" + urllib.parse.quote(token)
        x = urllib.request.urlopen(q, timeout=60).read().decode()
        keys += re.findall(r"<Key>([^<]+\.parquet)</Key>", x)
        m = re.search(r"<NextContinuationToken>([^<]+)</NextContinuationToken>", x)
        if not m:
            return keys
        token = m.group(1)


def main():
    os.makedirs(CACHE, exist_ok=True)
    x0, x1, y0, y1 = bbox_deg()
    print(f"bbox lon {x0:.5f}..{x1:.5f} lat {y0:.5f}..{y1:.5f}")
    fs = fsspec.filesystem("http", client_kwargs={"trust_env": True}, block_size=2**20)
    only = sys.argv[1:] or list(TYPES)
    for typ in only:
        theme, cols = TYPES[typ]
        keys = list_files(theme, typ)
        t = time.time()

        def scan(key):
            url = f"{BUCKET}/{key}"
            with fs.open(url, "rb") as f:
                md = pq.ParquetFile(f).metadata
                names = [md.schema.column(i).path for i in range(md.num_columns)]
                ix = {n: names.index(n) for n in ("bbox.xmin", "bbox.xmax", "bbox.ymin", "bbox.ymax")}
                hits = []
                for rg in range(md.num_row_groups):
                    r = md.row_group(rg)
                    s = {k: r.column(i).statistics for k, i in ix.items()}
                    if any(v is None for v in s.values()):
                        hits.append(rg)
                        continue
                    if s["bbox.xmin"].min <= x1 and s["bbox.xmax"].max >= x0 and s["bbox.ymin"].min <= y1 and s["bbox.ymax"].max >= y0:
                        hits.append(rg)
                return url, hits

        with ThreadPoolExecutor(16) as ex:
            found = [(u, h) for u, h in ex.map(scan, keys) if h]
        print(f"{typ}: {len(keys)} files, {sum(len(h) for _, h in found)} row groups match ({time.time() - t:.0f}s)")
        tables = []
        for url, hits in found:
            with fs.open(url, "rb") as f:
                pf = pq.ParquetFile(f)
                avail = [c for c in cols if c in pf.schema_arrow.names]
                for rg in hits:
                    tb = pf.read_row_group(rg, columns=avail)
                    b = tb.column("bbox")
                    m = pc.and_(pc.and_(pc.less_equal(pc.struct_field(b, "xmin"), x1), pc.greater_equal(pc.struct_field(b, "xmax"), x0)),
                                pc.and_(pc.less_equal(pc.struct_field(b, "ymin"), y1), pc.greater_equal(pc.struct_field(b, "ymax"), y0)))
                    tb = tb.filter(m)
                    if tb.num_rows:
                        tables.append(tb)
        if tables:
            out = pa.concat_tables(tables, promote_options="default")
            pq.write_table(out, os.path.join(CACHE, f"{typ}.parquet"))
            print(f"  → {out.num_rows} features ({time.time() - t:.0f}s)")
        else:
            print("  → 0 features")
    with open(os.path.join(CACHE, "meta.json"), "w") as f:
        json.dump({"release": RELEASE, "site": SITE, "extent": EXTENT}, f)


if __name__ == "__main__":
    main()
