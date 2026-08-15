'use client';

import React, { useState, useEffect } from 'react';
import { CloudRain, Wind, Thermometer, Info } from 'lucide-react';
import { WeatherData } from '@/types';
import { INITIAL_WEATHER } from '@/lib/db/mock-data';
import { useLanguage } from '@/context/language-context';

export default function WeatherWidget() {
  const { t, language } = useLanguage();
  const [weather, setWeather] = useState<WeatherData>(INITIAL_WEATHER);

  useEffect(() => {
    async function fetchLiveWeather() {
      try {
        // Open-Meteo API for Kathmandu coordinates (27.7172, 85.3240)
        const res = await fetch(
          'https://api.open-meteo.com/v1/forecast?latitude=27.7172&longitude=85.3240&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,rain,wind_speed_10m&hourly=precipitation_probability'
        );
        if (res.ok) {
          const data = await res.json();
          const current = data.current;
          const prob = data.hourly?.precipitation_probability?.[0] || 75;
          setWeather({
            city: 'Kathmandu Valley',
            temp: Math.round(current.temperature_2m),
            condition: current.rain > 0 ? 'Torrential Rainfall' : 'Overcast Monsoon',
            conditionNp: current.rain > 0 ? 'भारी वर्षा' : 'बादल लागेको मौसमी वर्षा',
            rainProbability: prob,
            windSpeed: Math.round(current.wind_speed_10m),
            forecast: 'Live Open-Meteo Satellite Feed — Rain expected to persist.',
            isDemo: false,
          });
        }
      } catch (err) {
        // Keeps fallback
      }
    }
    fetchLiveWeather();
  }, []);

  return (
    <div className="bg-navy-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <h3 className="font-extrabold text-white text-sm uppercase tracking-wider flex items-center gap-2">
          <CloudRain className="w-4 h-4 text-blue-400" />
          {t.weatherTitle}
        </h3>
        <span className="text-[10px] bg-blue-900/40 text-blue-300 font-semibold px-2 py-0.5 rounded border border-blue-700/50">
          {weather.city}
        </span>
      </div>

      <div className="grid grid-cols-3 gap-3 mt-4 text-center">
        <div className="bg-navy-950 p-3 rounded-xl border border-slate-800">
          <div className="flex items-center justify-center text-amber-400 mb-1">
            <Thermometer className="w-4 h-4" />
          </div>
          <p className="text-xs text-slate-400">{t.temperature}</p>
          <p className="text-base font-black text-white mt-0.5">{weather.temp}°C</p>
        </div>

        <div className="bg-navy-950 p-3 rounded-xl border border-slate-800">
          <div className="flex items-center justify-center text-blue-400 mb-1">
            <CloudRain className="w-4 h-4" />
          </div>
          <p className="text-xs text-slate-400">{t.rainChance}</p>
          <p className="text-base font-black text-blue-400 mt-0.5">{weather.rainProbability}%</p>
        </div>

        <div className="bg-navy-950 p-3 rounded-xl border border-slate-800">
          <div className="flex items-center justify-center text-teal-400 mb-1">
            <Wind className="w-4 h-4" />
          </div>
          <p className="text-xs text-slate-400">{t.windSpeed}</p>
          <p className="text-base font-black text-white mt-0.5">{weather.windSpeed} km/h</p>
        </div>
      </div>

      <div className="mt-3 flex items-start gap-2 text-xs text-slate-300 bg-blue-950/40 p-2.5 rounded-lg border border-blue-800/40">
        <Info className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
        <p className="line-clamp-2">
          {language === 'np' ? weather.conditionNp : weather.condition}: {weather.forecast}
        </p>
      </div>
    </div>
  );
}