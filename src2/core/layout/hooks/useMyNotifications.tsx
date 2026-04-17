import type { AppNotificationService } from '@tui/notis';

export default function useMyNotification(): AppNotificationService {
  return {
    feedUrls: ['https://discover.dev.analysis.cyber.gc.ca/icons/assemblyline/dev-testing.json']
  };
}
