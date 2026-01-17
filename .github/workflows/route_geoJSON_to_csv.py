import json
import csv

INPUT_FILE ="C:\\Users\\lraeu\\Desktop\\GIIS\\muensterdiscovery\\muensterdiscovery\\data\\routes_with_coordinates2.geojson"
OUTPUT_FILE = "C:\\Users\\lraeu\\Desktop\\GIIS\\muensterdiscovery\\muensterdiscovery\\data\\routes2.csv"

with open(INPUT_FILE, "r", encoding="utf-8") as f:
    geojson = json.load(f)

with open(OUTPUT_FILE, "w", newline="", encoding="utf-8") as csvfile:
    writer = csv.writer(csvfile)

    # CSV Header
    writer.writerow(["id", "name", "POIs", "geoJSON", "description", "time_length", "distance"])

    counter = 1

    for feature in geojson["features"]:
        id = counter
        counter += 1
        name = feature["properties"].get("id")
        POIs = feature["properties"].get("pois", [])        
        geoJSON = json.dumps(feature["geometry"], ensure_ascii=False)
        description = "description for Route " + str(feature["properties"].get("id"))
        time_length = 120  # Beispielwert für Zeitlänge in Minuten
        distance = id * 1000  # Beispielwert für Distanz in Metern

        writer.writerow([
            id,
            name,
            POIs,
            geoJSON,
            description,
            time_length,
            distance
        ])

print(f"CSV wurde erstellt: {OUTPUT_FILE}")
