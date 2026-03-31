import { Database } from '@nozbe/watermelondb';
import LokiJSAdapter from '@nozbe/watermelondb/adapters/lokijs';

import { schema } from './schema';
import GradingResult from './models/GradingResult';

// IMPORTANT: For Expo Go, we must use LokiJSAdapter because it is 100% JS.
// SQLiteAdapter requires custom native modules which are NOT in Expo Go.
const adapter = new LokiJSAdapter({
  schema,
  useWebWorker: false,
  useIncrementalIndexedDB: true,
  onSetUpError: error => {
    console.error('LokiJS setup error:', error);
  }
});

export const database = new Database({
  adapter,
  modelClasses: [GradingResult],
});
