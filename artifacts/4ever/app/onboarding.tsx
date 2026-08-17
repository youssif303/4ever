import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import { BrandMark, PrimaryButton, Screen } from '@/components/AppUI';
import { useColors } from '@/hooks/useColors';

const slides = [
  { kicker: 'WELCOME TO 4EVER', title: 'AI that helps you reconnect with yourself and others.', body: 'A quiet place to put words around what you’re experiencing — without judgment and without pretending to be a person.' },
  { kicker: 'START WITH WHAT HAPPENED', title: 'You can begin anywhere.', body: 'Talk freely about something you experienced. You don’t need the perfect words, a diagnosis, or a plan.' },
  { kicker: 'FEEL HEARD. UNDERSTAND YOURSELF.', title: 'Make a little room for reflection.', body: '4Ever listens, reflects what it hears, and asks one useful question at a time to help you notice thoughts, feelings, and needs.' },
  { kicker: 'HUMAN CONNECTION WHEN YOU NEED IT', title: 'The next step can be human.', body: 'When it feels right, 4Ever can help you consider trusted people, peer support, or a professional therapist.' },
];

export default function OnboardingScreen() {
  const colors = useColors();
  const styles = makeStyles(colors);
  const [index, setIndex] = useState(0);
  const slide = slides[index];
  const last = index === slides.length - 1;
  return (
    <Screen contentStyle={styles.content}>
      <View style={styles.top}><BrandMark compact /><Pressable onPress={() => router.back()} hitSlop={12}><Text style={styles.skip}>Close</Text></Pressable></View>
      <View style={styles.illustration}><View style={styles.illustrationRing}><View style={styles.illustrationCore}><Feather name={index === 0 ? 'refresh-cw' : index === 1 ? 'edit-3' : index === 2 ? 'compass' : 'heart'} size={32} color={colors.primary} /></View></View></View>
      <Text style={styles.kicker}>{slide.kicker}</Text>
      <Text style={styles.title}>{slide.title}</Text>
      <Text style={styles.body}>{slide.body}</Text>
      <View style={styles.progress}>{slides.map((_, itemIndex) => <View key={itemIndex} style={[styles.progressDot, itemIndex === index && styles.progressActive]} />)}</View>
      <View style={styles.bottom}>{last ? <PrimaryButton onPress={() => router.replace('/')} icon="arrow-right">Start gently</PrimaryButton> : <PrimaryButton onPress={() => setIndex(index + 1)} icon="arrow-right">Continue</PrimaryButton>}<Text style={styles.disclaimer}>4Ever is a wellbeing and self-reflection tool. It is not a replacement for professional mental-health care.</Text></View>
    </Screen>
  );
}

function makeStyles(colors: ReturnType<typeof useColors>) {
  return StyleSheet.create({
    content: { minHeight: '100%', justifyContent: 'space-between' },
    top: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    skip: { color: colors.mutedForeground, fontFamily: 'Inter_500Medium', fontSize: 13 },
    illustration: { alignItems: 'center', justifyContent: 'center', marginTop: 42 },
    illustrationRing: { width: 192, height: 192, borderRadius: 96, backgroundColor: colors.secondary, alignItems: 'center', justifyContent: 'center', transform: [{ rotate: '-12deg' }] },
    illustrationCore: { width: 112, height: 112, borderRadius: 38, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, alignItems: 'center', justifyContent: 'center', transform: [{ rotate: '12deg' }] },
    kicker: { color: colors.primary, fontFamily: 'Inter_700Bold', fontSize: 10, letterSpacing: 1.3, marginTop: 49 },
    title: { color: colors.foreground, fontFamily: 'Inter_700Bold', fontSize: 30, lineHeight: 36, letterSpacing: -1, marginTop: 11 },
    body: { color: colors.mutedForeground, fontFamily: 'Inter_400Regular', fontSize: 15, lineHeight: 23, marginTop: 15, maxWidth: 570 },
    progress: { flexDirection: 'row', gap: 6, marginTop: 28 },
    progressDot: { width: 22, height: 4, borderRadius: 3, backgroundColor: colors.border },
    progressActive: { width: 44, backgroundColor: colors.primary },
    bottom: { marginTop: 38, gap: 18 },
    disclaimer: { color: colors.mutedForeground, fontFamily: 'Inter_400Regular', fontSize: 11, lineHeight: 16, textAlign: 'center' },
  });
}