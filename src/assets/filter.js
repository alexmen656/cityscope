const fs = require("fs");

const filePath = "original.json";
const outputFilePath = "cities.json";

fs.readFile(filePath, "utf8", (err, data) => {
  if (err) {
    console.error("Fehler beim Lesen der Datei:", err);
    return;
  }

  const cities = JSON.parse(data);

  const filteredCities = cities
    .filter((city) => city.state !== "Alaska" && city.state !== "Hawaii")
    .map((city) => ({
      city: city.city,
      state: city.state,
      latitude: city.latitude,
      longitude: city.longitude,
    }));

  fs.writeFile(
    outputFilePath,
    JSON.stringify(filteredCities, null, 2),
    (err) => {
      if (err) {
        console.error("Fehler beim Schreiben der Datei:", err);
        return;
      }
      console.log("Gefilterte Daten wurden in cities.json gespeichert.");
    }
  );
});
