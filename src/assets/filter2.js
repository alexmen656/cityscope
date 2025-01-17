const fs = require('fs');

const filePath = 'original_og.json';
const outputFilePath = 'original.json';

fs.readFile(filePath, 'utf8', (err, data) => {
  if (err) {
    console.error('Fehler beim Lesen der Datei:', err);
    return;
  }

  const cities = JSON.parse(data);

  // Filtere Städte aus Alaska und Hawaii heraus
  const filteredCities = cities.filter(city => city.state !== 'Alaska' && city.state !== 'Hawaii');

  // Behalte nur die größte Stadt, wenn es mehrere Städte mit demselben Namen gibt
  const cityMap = new Map();
  filteredCities.forEach(city => {
    if (!cityMap.has(city.city) || Number(city.population) > Number(cityMap.get(city.city).population)) {
      cityMap.set(city.city, city);
    }
  });

  const uniqueCities = Array.from(cityMap.values());

  fs.writeFile(outputFilePath, JSON.stringify(uniqueCities, null, 2), err => {
    if (err) {
      console.error('Fehler beim Schreiben der Datei:', err);
      return;
    }
    console.log('Gefilterte Daten wurden in cities.json gespeichert.');
  });
});