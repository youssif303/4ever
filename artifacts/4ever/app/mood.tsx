import React, { useState } from 'react';
import { Alert, StyleSheet, Text, TextInput, View } from 'react-native';
import { router } from 'expo-router';
import { Header, MoodSelector, PrimaryButton, Screen, SoftCard, moodMeta } from '@/components/AppUI';
import { useApp } from '@/context/AppContext';
import { useColors } from '@/hooks/useColors';
import type { MoodValue } from '@/types';

export default function MoodScreen() {
  const colors = useColors();
  const styles = makeStyles(colors);
  const { moods, saveMood } = useApp();
  const [mood, setMood] = useState<MoodValue | null>(null);
  const [note, setNote] = useState('');

  async function save() {
    if (!mood) {
      Alert.alert('Choose how you feel', 'There’s no right answer — just choose the closest one.');
      return;
    }
    await saveMood(mood, note);
    setNote('');
    setMood(null);
    Alert.alert('Check-in saved', 'A small moment of noticing can be enough for today.');
  }

  return (
    <Screen>
      <Header title="Check in" subtitle="Notice, don’t judge" onBack={() => router.back()} />
      <Text style={styles.intro}>How are you feeling today?</Text>
      <Text style={styles.body}>A quick check-in can help you notice patterns over time. It doesn’t define you.</Text>
      <SoftCard style={styles.card}>
        <MoodSelector value={mood} onChange={setMood} />
        <Text style={styles.inputLabel}>What influenced your mood?</Text>
        <TextInput value={note} onChangeText={setNote} placeholder="Optional — a word or two is enough" placeholderTextColor={colors.mutedForeground} style={styles.input} multiline maxLength={300} />
        <PrimaryButton onPress={save} icon="check">Save check-in</PrimaryButton>
      </SoftCard>
      <Text style={styles.historyTitle}>Your recent check-ins</Text>
      {moods.length === 0 ? (
        <SoftCard><Text style={styles.empty}>Your check-ins will appear here when you’re ready.</Text></SoftCard>
      ) : moods.slice(0, 7).map((entry) => {
        const meta = moodMeta[entry.mood];
        return (
          <SoftCard key={entry.id} style={styles.entry}>
            <View style={styles.entryIcon}><Text style={styles.entryIconText}>{meta.label.slice(0, 1)}</Text></View>
            <View style={styles.entryCopy}><Text style={styles.entryDay}>{new Date(entry.createdAt).toLocaleDateString(undefined, { weekday: 'long' })}</Text><Text style={styles.entryMood}>{meta.label}{entry.note ? ` · ${entry.note}` : ''}</Text></View>
            <Text style={styles.entryDate}>{new Date(entry.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</Text>
          </SoftCard>
        );
      })}
      <Text style={styles.disclaimer}>Mood check-ins are for reflection only. 4Ever doesn’t make medical conclusions from your data.</Text>
    </Screen>
  );
}

function makeStyles(colors: ReturnType<typeof useColors>) {
  return StyleSheet.create({
    intro: { color: colors.foreground, fontFamily: 'Inter_700Bold', fontSize: 28, letterSpacing: -0.9 },
    body: { color: colors.mutedForeground, fontFamily: 'Inter_400Regular', fontSize: 14, lineHeight: 22, marginTop: 8, marginBottom: 24 },
    card: { gap: 16 },
    inputLabel: { color: colors.foreground, fontFamily: 'Inter_600SemiBold', fontSize: 14, marginTop: 6 },
    input: { minHeight: 78, borderRadius: 16, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.background, padding: 14, color: colors.foreground, fontFamily: 'Inter_400Regular', fontSize: 14, textAlignVertical: 'top' },
    historyTitle: { color: colors.foreground, fontFamily: 'Inter_600SemiBold', fontSize: 16, marginTop: 30, marginBottom: 12 },
    entry: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 9, padding: 14 },
    entryIcon: { width: 36, height: 36, borderRadius: 13, backgroundColor: colors.secondary, alignItems: 'center', justifyContent: 'center' },
    entryIconText: { color: colors.primary, fontFamily: 'Inter_700Bold', fontSize: 16 },
    entryCopy: { flex: 1 },
    entryDay: { color: colors.foreground, fontFamily: 'Inter_600SemiBold', fontSize: 14 },
    entryMood: { color: colors.mutedForeground, fontFamily: 'Inter_400Regular', fontSize: 12, marginTop: 3 },
    entryDate: { color: colors.mutedForeground, fontFamily: 'Inter_400Regular', fontSize: 11 },
    empty: { color: colors.mutedForeground, fontFamily: 'Inter_400Regular', fontSize: 13, lineHeight: 19 },
    disclaimer: { color: colors.mutedForeground, fontFamily: 'Inter_400Regular', fontSize: 11, lineHeight: 16, marginTop: 22 },
  });
}