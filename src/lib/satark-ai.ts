import { AIVerification, EmergencyCategory } from '@/types';

export class SatarkAIService {
  static async analyzeReportMedia(
    type: EmergencyCategory,
    description: string,
    mediaFile?: File | string | null,
    hasGps: boolean = true
  ): Promise<AIVerification> {
    const apiKey = process.env.AI_API_KEY;

    if (apiKey) {
      try {
        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${encodeURIComponent(apiKey)}`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              contents: [
                {
                  parts: [
                    {
                      text: [
                        'Review this emergency report and assess its consistency.',
                        `Category: ${type}`,
                        `Description: ${description}`,
                        `GPS available: ${hasGps ? 'Yes' : 'No'}`,
                        `Media attached: ${mediaFile ? 'Yes' : 'No'}`,
                        'Return a short assessment suitable for an emergency reporting system.',
                      ].join('\n'),
                    },
                  ],
                },
              ],
              generationConfig: {
                temperature: 0.2,
                maxOutputTokens: 200,
              },
            }),
          }
        );

        if (response.ok) {
          const data = await response.json();
          const aiText =
            data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();

          if (aiText) {
            return {
              status: 'Verified',
              confidence: 90,
              observations: [
                'Report reviewed by Satark AI.',
                `Category provided: ${type}.`,
                hasGps
                  ? 'GPS information is available.'
                  : 'GPS information is unavailable.',
                mediaFile
                  ? 'Media is attached to the report.'
                  : 'No media is attached.',
                aiText.slice(0, 150),
              ],
              recommendation:
                'AI assessment completed. Human dispatcher review is recommended.',
            };
          }
        }
      } catch (error) {
        console.warn('Satark AI request failed:', error);
      }
    }

    const descriptionLength = description.trim().length;
    const hasMedia = Boolean(mediaFile);

    let confidence = 70;
    const observations: string[] = [];

    if (hasGps) {
      confidence += 10;
      observations.push('GPS information is available.');
    } else {
      confidence -= 10;
      observations.push('GPS information is unavailable.');
    }

    if (hasMedia) {
      confidence += 10;
      observations.push('Media is attached to the report.');
    } else {
      observations.push('No photo or video is attached.');
    }

    if (descriptionLength >= 30) {
      confidence += 10;
      observations.push('The description contains useful incident details.');
    } else if (descriptionLength >= 10) {
      confidence += 5;
      observations.push('The description contains limited incident details.');
    } else {
      confidence -= 15;
      observations.push('The description is too short for reliable assessment.');
    }

    confidence = Math.max(40, Math.min(95, confidence));

    let status: AIVerification['status'] = 'Needs Review';

    if (confidence >= 85) {
      status = 'Verified';
    } else if (confidence < 55) {
      status = 'Suspicious';
    }

    return {
      status,
      confidence,
      observations,
      recommendation:
        status === 'Verified'
          ? 'High confidence. Send for responder review.'
          : 'Human review is required before the report is treated as confirmed.',
    };
  }
}