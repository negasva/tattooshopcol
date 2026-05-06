import cities from '@/app/data/colombianCities.json';

export function isCityEligibleForCashOnDelivery(selectedCity) {
  const city = cities.find(
    (c) => c.city.toLowerCase() === selectedCity.toLowerCase() ||
           c.suburbs.some(s => s.toLowerCase() === selectedCity.toLowerCase())
  );

  return city ? city.cashOnDelivery : false;
}

export function getMainCityForSuburb(suburb) {
  const city = cities.find(c =>
    c.suburbs.some(s => s.toLowerCase() === suburb.toLowerCase())
  );
  return city?.city || null;
}
