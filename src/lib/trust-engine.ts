import { TrustLevel, TrustDetails, AIVerification } from '@/types';

export function evaluateReportTrust(
  hasGps: boolean,
  hasMedia: boolean,
  aiVerification?: AIVerification,
  humanVerified: boolean = false
): { trustLevel: TrustLevel; trustDetails: TrustDetails } {
  const aiStatus = aiVerification?.status || 'Needs Review';
  
  const trustDetails: TrustDetails = {
    gpsVerified: hasGps,
    recentSubmission: true,
    mediaAttached: hasMedia,
    humanVerified,
    aiStatus,
  };

  if (humanVerified || (hasGps && hasMedia && aiStatus === 'Verified')) {
    return { trustLevel: 'HIGH', trustDetails };
  }

  if (hasGps || hasMedia || aiStatus === 'Needs Review') {
    return { trustLevel: 'MEDIUM', trustDetails };
  }

  return { trustLevel: 'LOW', trustDetails };
}
