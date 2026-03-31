import { appSchema, tableSchema } from '@nozbe/watermelondb';

export const schema = appSchema({
  version: 1,
  tables: [
    tableSchema({
      name: 'grading_results',
      columns: [
        { name: 'lot_id', type: 'string' },
        { name: 'farmer_id', type: 'string' },
        { name: 'grade', type: 'string' },
        { name: 'defects', type: 'string' }, // Stringified array
        { name: 'moisture', type: 'boolean' },
        { name: 'confidence', type: 'number' },
        { name: 'certificate_url', type: 'string', isOptional: true },
        { name: 'captured_at', type: 'number' },
      ],
    }),
  ],
});
