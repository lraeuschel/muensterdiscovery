import json
import csv

INPUT_FILE ="C:\\Users\\lraeu\\Desktop\\GIIS\\muensterdiscovery\\muensterdiscovery\\data\\routes_with_coordinates.geojson"
OUTPUT_FILE = "C:\\Users\\lraeu\\Desktop\\GIIS\\muensterdiscovery\\muensterdiscovery\\data\\routes.csv"

with open(INPUT_FILE, "r", encoding="utf-8") as f:
    geojson = json.load(f)

with open(OUTPUT_FILE, "w", newline="", encoding="utf-8") as csvfile:
    writer = csv.writer(csvfile)

    # CSV Header
    writer.writerow(["id", "name", "POIs", "geoJSON"])

    counter = 1

    for feature in geojson["features"]:
        feature_id = counter
        counter += 1
        name = feature["properties"].get("id")
        pois = feature["properties"].get("pois", [])        
        geometry_json = json.dumps(feature["geometry"], ensure_ascii=False)

        writer.writerow([
            feature_id,
            name,
            pois,
            geometry_json
        ])

print(f"CSV wurde erstellt: {OUTPUT_FILE}")
