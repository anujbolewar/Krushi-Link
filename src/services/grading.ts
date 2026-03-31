import { Camera, CameraType } from 'expo-camera';
import * as FileSystem from 'expo-file-system';
import axios from 'axios';
import { database } from '../db';
import { useAuthStore } from '../hooks/useAuthStore';

export interface GradingResultData {
  grade: 'A' | 'B' | 'C';
  defects: string[];
  moisture: boolean;
  confidence: number;
  certificateUrl: string;
}

class GradingService {
  /**
   * Captures photos for analysis
   */
  async takePhotos(cameraRef: any, count: number = 3): Promise<string[]> {
    const photos: string[] = [];
    for (let i = 0; i < count; i++) {
        if (!cameraRef) continue;
        const photo = await cameraRef.takePictureAsync({ quality: 0.8, base64: true });
        if (photo) photos.push(photo.uri);
        // Add a small delay between shots
        await new Promise(resolve => setTimeout(resolve, 500));
    }
    return photos;
  }

  /**
   * Analyzes the images using the KrushiLink AI Backend
   */
  async analyzeImages(imageUris: string[], lotId: string): Promise<GradingResultData> {
    const user = useAuthStore.getState().user;
    
    // Convert URIs to Base64 for the API
    const imagesBase64 = await Promise.all(
        imageUris.map(async (uri) => {
            return await FileSystem.readAsStringAsync(uri, { encoding: 'base64' });
        })
    );

    try {
        // Real API call
        /*
        const response = await axios.post('https://api.krushilink.com/v1/grading/analyze', {
            images: imagesBase64,
            lotId,
            farmerId: user?.id,
            gps: { lat: 0, lng: 0 } // Would come from expo-location
        });
        return response.data;
        */

        // For Demo: Simulated AI processing (3s delay)
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        const mockResult: GradingResultData = {
            grade: Math.random() > 0.6 ? 'A' : 'B',
            defects: ['साधारण डागाळणे', 'योग्य आकार'], 
            moisture: Math.random() > 0.8,
            confidence: 0.94,
            certificateUrl: 'https://krushilink.com/cert/demo.pdf'
        };

        // Cache result in WatermelonDB for offline access & history
        await database.write(async () => {
            await database.get('grading_results').create((record: any) => {
                record.lotId = lotId;
                record.farmerId = user?.id || 'unknown';
                record.grade = mockResult.grade;
                record.defects = JSON.stringify(mockResult.defects);
                record.moisture = mockResult.moisture;
                record.confidence = mockResult.confidence;
                record.certificateUrl = mockResult.certificateUrl;
                record.capturedAt = Date.now();
            });
        });

        return mockResult;

    } catch (error) {
        console.error('Grading analysis failed:', error);
        // Fallback: Grade B instantly for demo stability
        return {
            grade: 'B',
            defects: ['साधारण डागाळणे'],
            moisture: false,
            confidence: 0.5,
            certificateUrl: ''
        };
    }
  }
}

export const gradingService = new GradingService();
