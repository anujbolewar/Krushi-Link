import { Model } from '@nozbe/watermelondb';
import { field, date, readonly } from '@nozbe/watermelondb/decorators';

export default class GradingResult extends Model {
  static table = 'grading_results';

  @field('lot_id') declare lotId: string;
  @field('farmer_id') declare farmerId: string;
  @field('grade') declare grade: string;
  @field('defects') declare defects: string;
  @field('moisture') declare moisture: boolean;
  @field('confidence') declare confidence: number;
  @field('certificate_url') declare certificateUrl?: string;
  @date('captured_at') declare capturedAt: number;

  @readonly @date('created_at') declare createdAt: number;
  @readonly @date('updated_at') declare updatedAt: number;
}
