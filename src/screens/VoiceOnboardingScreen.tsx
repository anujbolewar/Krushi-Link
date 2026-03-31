import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, Animated } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { VoiceButton } from '../components/ui/VoiceButton';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS } from '../theme/colors';

export const VoiceOnboardingScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [showNext, setShowNext] = useState(false);
  
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const handleVoicePress = () => {
    if (isRecording) {
      // Stop recording and process
      setIsRecording(false);
      setIsProcessing(true);
      
      // Mock ASR Call to /api/v1/voice/transcribe
      setTimeout(() => {
        setIsProcessing(false);
        setTranscript('राहुल पाटील'); // Mocked Marathi name
        setShowNext(true);
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }).start();
      }, 1500);
    } else {
      // Start recording
      setTranscript('ऐकत आहे...');
      setIsRecording(true);
      setShowNext(false);
      fadeAnim.setValue(0);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.instruction}>तुमचं नाव सांगा</Text>
          <Text style={styles.subInstruction}>खालील बटण दाबा आणि तुमचे पूर्ण नाव बोला</Text>
        </View>

        <View style={styles.center}>
          <VoiceButton 
            onPress={handleVoicePress} 
            isRecording={isRecording} 
            isProcessing={isProcessing}
            label={isRecording ? "बोलणे सुरू ठेवा..." : "येथे दाबा"}
          />
        </View>

        <View style={styles.footer}>
          <View style={styles.transcriptContainer}>
            <Text style={[styles.transcriptText, !transcript && styles.placeholderText]}>
              {transcript || "तुमचा आवाज येथे दिसेल..."}
            </Text>
          </View>

          {showNext && (
            <Animated.View style={{ opacity: fadeAnim, width: '100%', marginTop: 24 }}>
              <TouchableOpacity 
                style={styles.nextButton}
                onPress={() => navigation.navigate('FarmDetails')}
                activeOpacity={0.8}
              >
                <Text style={styles.nextButtonText}>पुढे जा</Text>
                <MaterialCommunityIcons name="arrow-right" size={24} color="#FFFFFF" />
              </TouchableOpacity>
            </Animated.View>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F9F3',
  },
  content: {
    flex: 1,
    padding: 24,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  header: {
    marginTop: 40,
    alignItems: 'center',
  },
  instruction: {
    fontSize: 32,
    fontWeight: '900',
    color: '#1A2E1A',
    marginBottom: 12,
    textAlign: 'center',
  },
  subInstruction: {
    fontSize: 16,
    color: '#4A6741',
    textAlign: 'center',
    paddingHorizontal: 20,
    lineHeight: 24,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  footer: {
    width: '100%',
    marginBottom: 40,
    alignItems: 'center',
  },
  transcriptContainer: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E8F0E5',
    minHeight: 100,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  transcriptText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#2D7A3A',
    textAlign: 'center',
  },
  placeholderText: {
    color: '#8DA68A',
    fontWeight: '500',
    fontSize: 16,
  },
  nextButton: {
    backgroundColor: '#2D7A3A',
    height: 64,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  nextButtonText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
    marginRight: 10,
  },
});
