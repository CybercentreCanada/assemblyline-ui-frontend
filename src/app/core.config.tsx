import type { SystemMessage } from '@tui/notis';
import type { ClassificationAliases, ClassificationDefinition } from 'features/classification/classificationParser';
import type { Indexes } from 'models/api/user';
import type { Configuration } from 'models/base/config';
import type { User } from 'models/base/user';
import type { UserSettings } from 'models/base/user_settings';

declare global {
  type AppConfig = {
    c12nDef?: ClassificationDefinition;
    classificationAliases?: ClassificationAliases;
    configuration?: Configuration;
    flattenedProps?: Record<string, unknown>;
    indexes?: Indexes;
    settings?: UserSettings;
    systemMessage?: SystemMessage;
    user?: User;
  };
}
