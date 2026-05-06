'use client';

import { useState, useMemo } from 'react';
import cities from '@/app/data/colombianCities.json';

interface CitySelectorProps {
  onCitySelect: (city: string, isCashOnDeliveryEligible: boolean) => void;
}

export default function CitySelector({ onCitySelect }: CitySelectorProps) {
  const [selectedCity, setSelectedCity] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  const allCities = useMemo(() => {
    const cityList: Array<{ name: string; cashOnDelivery: boolean }> = [];

    cities.forEach((city) => {
      cityList.push({
        name: city.city,
        cashOnDelivery: city.cashOnDelivery,
      });

      city.suburbs.forEach((suburb) => {
        cityList.push({
          name: suburb,
          cashOnDelivery: city.cashOnDelivery,
        });
      });
    });

    return cityList.sort((a, b) => a.name.localeCompare(b.name));
  }, []);

  const filteredCities = useMemo(() => {
    if (!selectedCity) return allCities;

    return allCities.filter((city) =>
      city.name.toLowerCase().includes(selectedCity.toLowerCase())
    );
  }, [selectedCity, allCities]);

  const handleCitySelect = (cityName: string) => {
    const city = allCities.find((c) => c.name === cityName);
    setSelectedCity(cityName);
    setIsOpen(false);

    if (city) {
      onCitySelect(cityName, city.cashOnDelivery);
    }
  };

  return (
    <div className="relative">
      <label className="block text-sm font-semibold text-trust-dark mb-2">
        Ciudad de Entrega
      </label>

      <div className="relative">
        <input
          type="text"
          placeholder="Busca tu ciudad..."
          value={selectedCity}
          onChange={(e) => setSelectedCity(e.target.value)}
          onFocus={() => setIsOpen(true)}
          className="w-full px-4 py-2 border border-trust-dark rounded-lg focus:outline-none focus:ring-2 focus:ring-trust-green"
        />

        {isOpen && filteredCities.length > 0 && (
          <div className="absolute top-full left-0 right-0 bg-white border border-trust-dark rounded-lg mt-1 max-h-48 overflow-y-auto shadow-lg z-20">
            {filteredCities.slice(0, 15).map((city) => (
              <button
                key={city.name}
                onClick={() => handleCitySelect(city.name)}
                className="w-full text-left px-4 py-2 hover:bg-trust-light transition text-sm"
              >
                <span className="text-trust-dark font-medium">{city.name}</span>
                {city.cashOnDelivery && (
                  <span className="ml-2 text-xs bg-trust-green text-white px-2 py-1 rounded">
                    Contra Entrega ✓
                  </span>
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      {selectedCity && (
        <p className="text-xs text-gray-600 mt-2">
          Seleccionaste: {selectedCity}
        </p>
      )}
    </div>
  );
}
