import { SystemMessage } from '@tui/notis';
import { ClassificationAliases, ClassificationDefinition } from 'features/classification/classificationParser';
import { CustomUser, Indexes } from 'models/api/user';
import { Configuration } from 'models/base/config';
import { UserSettings } from 'models/base/user_settings';

declare global {
  type AppConfig = {
    c12nDef?: ClassificationDefinition;
    classificationAliases?: ClassificationAliases;
    configuration?: Configuration;
    flattenedProps?: Record<string, unknown>;
    indexes?: Indexes;
    settings?: UserSettings;
    systemMessage?: SystemMessage;
    user?: CustomUser;
  };
}
