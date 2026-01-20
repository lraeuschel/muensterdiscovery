import json
import csv

INPUT_FILE ="C:\\Users\\lraeu\\Desktop\\GIIS\\voronoi_polygons.geojson"
OUTPUT_FILE = "C:\\Users\\lraeu\\Desktop\\GIIS\\muensterdiscovery\\muensterdiscovery\\data\\voronoi_polygons.csv"

with open(INPUT_FILE, "r", encoding="utf-8") as f:
    geojson = json.load(f)

with open(OUTPUT_FILE, "w", newline="", encoding="utf-8") as csvfile:
    writer = csv.writer(csvfile)

    # CSV Header
    writer.writerow(["id", "geoJSON"])

    for feature in geojson["features"]:
        id = feature["properties"].get("id")
        geoJSON = json.dumps(feature["geometry"], ensure_ascii=False)


        writer.writerow([
            id,
            geoJSON,
        ])

print(f"CSV wurde erstellt: {OUTPUT_FILE}")
