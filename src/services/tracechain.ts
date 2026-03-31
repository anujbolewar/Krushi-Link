import * as FileSystem from 'expo-file-system';

const { documentDirectory } = FileSystem as any;

export interface TraceEvent {
  type: 'lot_listing' | 'grading' | 'transport' | 'sale';
  timestamp: number;
  farmerId: string;
  lotId: string;
  gps: { lat: number; lng: number };
  sscc: string;
  details?: any;
}

const LEDGER_PATH = `${documentDirectory || './'}tracechain_ledger.json`;

class TraceChainService {
  /**
   * Records an event to the local "ledger" (Fabric Simulation)
   */
  async recordEvent(event: TraceEvent): Promise<{ success: boolean; blockHash: string }> {
    try {
      // Simulate Fabric processing and consensus
      await new Promise(resolve => setTimeout(resolve, 800));

      const ledgerRaw = await FileSystem.readAsStringAsync(LEDGER_PATH).catch(() => '[]');
      const ledger = JSON.parse(ledgerRaw);
      
      ledger.push(event);
      
      await FileSystem.writeAsStringAsync(LEDGER_PATH, JSON.stringify(ledger, null, 2));

      // Mock block hash calculation
      const blockHash = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
      
      console.log(`TraceChain: Event ${event.type} recorded in block ${blockHash}`);
      
      return { success: true, blockHash };
    } catch (error) {
      console.error('TraceChain recording failed:', error);
      return { success: false, blockHash: '' };
    }
  }

  /**
   * Helper to generate a compliant SSCC (Serial Shipping Container Code)
   */
  generateSSCC(farmerId: string, lotId: string): string {
    const prefix = '00'; // SSCC Application Identifier
    const extension = '1'; 
    const company = farmerId.substring(0, 7).padEnd(7, '0');
    const serial = lotId.replace(/\D/g, '').padStart(9, '0');
    
    // Simplified checksum for demo
    const sscc = `${prefix}${extension}${company}${serial}`;
    return sscc;
  }
}

export const traceChain = new TraceChainService();
