import React, { useEffect, useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Header, PrimaryButton, Screen, SoftCard } from '@/components/AppUI';
import { useApp } from '@/context/AppContext';
import { useColors } from '@/hooks/useColors';

export default function ProfileScreen() {
  const colors = useColors();
  const styles = makeStyles(colors);
  const { profile, updateProfile, deleteLocalData } = useApp();
  const [firstName, setFirstName] = useState(profile.firstName);
  const [email, setEmail] = useState(profile.email);

  useEffect(() => { setFirstName(profile.firstName); setEmail(profile.email); }, [profile.firstName, profile.email]);

  async function save() {
    await updateProfile({ firstName: firstName.trim(), email: email.trim() });
    Alert.alert('Profile saved', 'Your details stay on this device for now.');
  }

  function deleteData() {
    Alert.alert('Delete local data?', 'This removes your conversations, mood check-ins, and profile details from this device.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: deleteLocalData },
    ]);
  }

  return (
    <Screen>
      <Header title="Your profile" subtitle="Keep it simple" onBack={() => router.back()} />
      <SoftCard style={styles.form}>
        <View style={styles.avatar}><Feather name="user" size={22} color={colors.primary} /></View>
        <Text style={styles.label}>First name</Text>
        <TextInput value={firstName} onChangeText={setFirstName} placeholder="What should we call you?" placeholderTextColor={colors.mutedForeground} style={styles.input} />
        <Text style={styles.label}>Email</Text>
        <TextInput value={email} onChangeText={setEmail} placeholder="Optional" placeholderTextColor={colors.mutedForeground} keyboardType="email-address" autoCapitalize="none" style={styles.input} />
        <PrimaryButton onPress={save} icon="check">Save profile</PrimaryButton>
      </SoftCard>
      <Text style={styles.sectionTitle}>Settings</Text>
      <SettingRow icon="lock" title="Privacy" detail="How 4Ever handles sensitive reflections" onPress={() => router.push('/privacy')} />
      <SettingRow icon="book-open" title="About 4Ever" detail="Wellbeing, not treatment" onPress={() => router.push('/onboarding')} />
      <Pressable onPress={deleteData} style={({ pressed }) => [styles.deleteRow, pressed && styles.pressed]}><Feather name="trash-2" size={18} color={colors.destructive} /><Text style={styles.deleteText}>Delete my local data</Text></Pressable>
    </Screen>
  );
}

function SettingRow({ icon, title, detail, onPress }: { icon: keyof typeof Feather.glyphMap; title: string; detail: string; onPress: () => void }) {
  const colors = useColors();
  const styles = makeStyles(colors);
  return <Pressable onPress={onPress} style={({ pressed }) => [styles.settingRow, pressed && styles.pressed]}><View style={styles.settingIcon}><Feather name={icon} size={17} color={colors.primary} /></View><View style={styles.settingCopy}><Text style={styles.settingTitle}>{title}</Text><Text style={styles.settingDetail}>{detail}</Text></View><Feather name="chevron-right" size={17} color={colors.mutedForeground} /></Pressable>;
}

function makeStyles(colors: ReturnType<typeof useColors>) {
  return StyleSheet.create({
    form: { gap: 12 },
    avatar: { width: 54, height: 54, borderRadius: 20, backgroundColor: colors.secondary, alignItems: 'center', justifyContent: 'center', marginBottom: 6 },
    label: { color: colors.mutedForeground, fontFamily: 'Inter_700Bold', fontSize: 11, letterSpacing: 1.2, textTransform: 'uppercase', marginTop: 6 },
    input: { minHeight: 52, borderWidth: 1.5, borderColor: colors.border, backgroundColor: colors.background, borderRadius: 16, paddingHorizontal: 16, color: colors.foreground, fontFamily: 'Inter_400Regular', fontSize: 15 },
    sectionTitle: { color: colors.mutedForeground, fontFamily: 'Inter_700Bold', fontSize: 11, textTransform: 'uppercase', letterSpacing: 1.2, marginTop: 32, marginBottom: 14 },
    settingRow: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: colors.border },
    settingIcon: { width: 38, height: 38, borderRadius: 14, backgroundColor: colors.secondary, alignItems: 'center', justifyContent: 'center' },
    settingCopy: { flex: 1 },
    settingTitle: { color: colors.foreground, fontFamily: 'Inter_600SemiBold', fontSize: 14 },
    settingDetail: { color: colors.mutedForeground, fontFamily: 'Inter_400Regular', fontSize: 12, marginTop: 3 },
    deleteRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 25, paddingVertical: 8 },
    deleteText: { color: colors.destructive, fontFamily: 'Inter_600SemiBold', fontSize: 14 },
    pressed: { opacity: 0.7 },
  });
}