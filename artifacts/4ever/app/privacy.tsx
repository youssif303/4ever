import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Header, Screen, SoftCard } from '@/components/AppUI';
import { useColors } from '@/hooks/useColors';

export default function PrivacyScreen() {
  const colors = useColors();
  const styles = makeStyles(colors);
  return (
    <Screen>
      <Header title="Privacy" subtitle="A clear starting point" onBack={() => router.back()} />
      <SoftCard style={styles.notice}>
        <View style={styles.icon}><Feather name="shield" size={22} color={colors.primary} /></View>
        <Text style={styles.title}>Your reflections are personal.</Text>
        <Text style={styles.body}>4Ever is an MVP. Conversations and check-ins are stored locally on this device so you can use the app without creating an account.</Text>
        <Text style={styles.body}>The app does not add analytics that collect conversation content, and your local reflections are not used for model training by this MVP.</Text>
      </SoftCard>
      <View style={styles.list}>
        <PrivacyPoint icon="database" title="Local by default" body="Your conversations, moods, and profile details stay in local app storage." />
        <PrivacyPoint icon="key" title="No unnecessary information" body="A first name and email are optional. You can use the app without adding them." />
        <PrivacyPoint icon="trash-2" title="You’re in control" body="Delete local data at any time from your profile." />
      </View>
      <Text style={styles.legal}>This placeholder privacy notice should be reviewed by a qualified lawyer before public launch.</Text>
    </Screen>
  );
}

function PrivacyPoint({ icon, title, body }: { icon: keyof typeof Feather.glyphMap; title: string; body: string }) {
  const colors = useColors();
  const styles = makeStyles(colors);
  return <View style={styles.point}><View style={styles.pointIcon}><Feather name={icon} size={16} color={colors.primary} /></View><View style={styles.pointCopy}><Text style={styles.pointTitle}>{title}</Text><Text style={styles.pointBody}>{body}</Text></View></View>;
}

function makeStyles(colors: ReturnType<typeof useColors>) {
  return StyleSheet.create({
    notice: { gap: 13, padding: 22 },
    icon: { width: 48, height: 48, borderRadius: 17, backgroundColor: colors.secondary, alignItems: 'center', justifyContent: 'center' },
    title: { color: colors.foreground, fontFamily: 'Inter_700Bold', fontSize: 23, letterSpacing: -0.6 },
    body: { color: colors.mutedForeground, fontFamily: 'Inter_400Regular', fontSize: 14, lineHeight: 21 },
    list: { gap: 22, marginTop: 27 },
    point: { flexDirection: 'row', gap: 12 },
    pointIcon: { width: 34, height: 34, borderRadius: 12, backgroundColor: colors.secondary, alignItems: 'center', justifyContent: 'center' },
    pointCopy: { flex: 1 },
    pointTitle: { color: colors.foreground, fontFamily: 'Inter_600SemiBold', fontSize: 14 },
    pointBody: { color: colors.mutedForeground, fontFamily: 'Inter_400Regular', fontSize: 13, lineHeight: 19, marginTop: 3 },
    legal: { color: colors.mutedForeground, fontFamily: 'Inter_400Regular', fontSize: 11, lineHeight: 16, marginTop: 30 },
  });
}