import { EmergencyReport, WeatherData, SatarkPulseState } from '@/types';

export function calculateSatarkPulse(
  reports: EmergencyReport[],
  weather: WeatherData
): SatarkPulseState {
  const activeReports = reports.filter(
    (r) => r.status !== 'RESOLVED'
  );
  
  const highPriorityCount = activeReports.filter(
    (r) => r.priority === 'critical' || r.status === 'VERIFIED'
  ).length;

  const roadBlockages = activeReports.filter(
    (r) => r.type === 'road' || r.type === 'landslide'
  ).length;

  const heavyRain = weather.rainProbability >= 70 || weather.condition.toLowerCase().includes('heavy');

  const reasons: { en: string; np: string }[] = [];

  if (heavyRain) {
    reasons.push({
      en: `Torrential rainfall detected in Bagmati/Gandaki Basin (${weather.rainProbability}% precipitation chance)`,
      np: `भारी वर्षा मापन (${weather.rainProbability}% वर्षाको सम्भावना)`,
    });
  }

  if (highPriorityCount > 0) {
    reasons.push({
      en: `${highPriorityCount} critical verified disaster report(s) actively reported nearby`,
      np: `${highPriorityCount} वटा उच्च आपत्कालीन विपद् रिपोर्टहरू सक्रिय`,
    });
  }

  if (roadBlockages > 0) {
    reasons.push({
      en: `${roadBlockages} main highway/road blockages currently active`,
      np: `${roadBlockages} मुख्य राजमार्ग/सडक अवरुद्ध`,
    });
  }

  let riskLevel: SatarkPulseState['riskLevel'] = 'LOW';

  if (heavyRain && highPriorityCount >= 2) {
    riskLevel = 'HIGH';
  } else if (heavyRain || highPriorityCount >= 1 || roadBlockages >= 1) {
    riskLevel = 'MODERATE';
  } else {
    riskLevel = 'LOW';
    if (reasons.length === 0) {
      reasons.push({
        en: 'Normal weather conditions and minimal active emergency reports.',
        np: 'सामान्य मौसमी अवस्था र कम आपत्कालीन उजुरीहरू।',
      });
    }
  }

  return {
    riskLevel,
    reasons,
    updatedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    heavyRain,
    activeReportCount: activeReports.length,
    roadBlockageCount: roadBlockages,
  };
}
