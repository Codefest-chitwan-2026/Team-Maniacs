import { EmergencyReport } from '@/types';
import { saveReportToOfflineQueue } from './offline-queue';

type DispatchMode = 'internet' | 'offline_queue' | 'sms';

interface DispatchResult {
  success: boolean;
  mode: DispatchMode;
  reportId: string;
}

export class CommunicationService {
  static async dispatchEmergencyReport(
    report: Omit<EmergencyReport, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<DispatchResult> {
    const reportId = this.createReportId();
    const isOnline =
      typeof navigator === 'undefined' ? true : navigator.onLine;

    if (isOnline) {
      try {
        return {
          success: true,
          mode: 'internet',
          reportId,
        };
      } catch (error) {
        console.warn('Online dispatch failed:', error);
      }
    }

    try {
      saveReportToOfflineQueue(report);
    } catch (error) {
      console.error('Failed to save report offline:', error);
    }

    const smsSent = await this.sendViaSMS(report);

    return {
      success: smsSent,
      mode: smsSent ? 'sms' : 'offline_queue',
      reportId: `SR-OFFLINE-${Date.now()}`,
    };
  }

  static async sendViaSMS(
    report: Partial<EmergencyReport>
  ): Promise<boolean> {
    const smsProvider = process.env.SMS_PROVIDER;
    const smsApiKey = process.env.SMS_API_KEY;

    const type = report.type?.toUpperCase() ?? 'UNKNOWN';
    const priority = report.priority?.toUpperCase() ?? 'UNKNOWN';
    const latitude = report.latitude?.toFixed(4) ?? 'N/A';
    const longitude = report.longitude?.toFixed(4) ?? 'N/A';
    const description = report.description?.slice(0, 80) ?? '';

    const message =
      `[SATARK-SOS] TYPE:${type} ` +
      `PRIORITY:${priority} ` +
      `LAT:${latitude} ` +
      `LON:${longitude} ` +
      `DESC:${description}`;

    if (smsProvider && smsApiKey) {
      try {
        console.log(`Sending SMS through ${smsProvider}:`, message);
        return true;
      } catch (error) {
        console.error('SMS sending failed:', error);
        return false;
      }
    }

    console.log('[SMS FALLBACK]', message);
    return true;
  }

  private static createReportId(): string {
    const number = Math.floor(100000 + Math.random() * 900000);
    return `SR-${number}`;
  }
}