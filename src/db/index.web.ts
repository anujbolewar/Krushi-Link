import { Database } from '@nozbe/watermelondb';
import LokiJSAdapter from '@nozbe/watermelondb/adapters/lokijs';

import { schema } from './schema';
import GradingResult from './models/GradingResult';

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
