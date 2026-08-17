import React from 'react';
import {
  ActivityIndicator,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  type PressableProps,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColors } from '@/hooks/useColors';
import type { MoodValue } from '@/types';

const moodMeta: Record<MoodValue, { label: string; icon: keyof typeof Feather.glyphMap; colorKey: 'accent' | 'success' | 'primary' | 'mutedForeground' | 'destructive' }> = {
  'very-low': { label: 'Very low', icon: 'frown', colorKey: 'destructive' },
  low: { label: 'Low', icon: 'frown', colorKey: 'accent' },
  okay: { label: 'Okay', icon: 'meh', colorKey: 'mutedForeground' },
  good: { label: 'Good', icon: 'smile', colorKey: 'success' },
  'very-good': { label: 'Very good', icon: 'smile', colorKey: 'primary' },
};

export function Screen({
  children,
  scroll = true,
  contentStyle,
}: {
  children: React.ReactNode;
  scroll?: boolean;
  contentStyle?: StyleProp<ViewStyle>;
}) {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const styles = makeStyles(colors);
  const content = (
    <View
      style={[
        styles.screenContent,
        { paddingTop: insets.top + (Platform.OS === 'web' ? 67 : 16), paddingBottom: insets.bottom + 28 },
        contentStyle,
      ]}
    >
      {children}
    </View>
  );
  return scroll ? (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      {content}
    </ScrollView>
  ) : (
    <View style={styles.screen}>{content}</View>
  );
}

export function BrandMark({ compact = false }: { compact?: boolean }) {
  const colors = useColors();
  return (
    <View style={compact ? compactBrandStyles.row : brandStyles.row}>
      <View style={[brandStyles.mark, { backgroundColor: colors.accent }, compact && brandStyles.compactMark]}>
        <View style={[brandStyles.loop, { borderColor: colors.foreground }]} />
      </View>
      <Text style={[brandStyles.name, { color: colors.foreground }, compact && brandStyles.compactName]}>4Ever</Text>
    </View>
  );
}

export function Header({
  title,
  subtitle,
  onBack,
  right,
}: {
  title: string;
  subtitle?: string;
  onBack?: () => void;
  right?: React.ReactNode;
}) {
  const colors = useColors();
  const styles = makeStyles(colors);
  return (
    <View style={styles.header}>
      <View style={styles.headerLeft}>
        {onBack ? (
          <Pressable
            accessibilityLabel="Go back"
            onPress={onBack}
            hitSlop={12}
            style={({ pressed }) => [styles.iconButton, pressed && styles.pressed]}
          >
            <Feather name="arrow-left" size={20} color={colors.foreground} />
          </Pressable>
        ) : null}
        <View>
          <Text style={styles.headerTitle}>{title}</Text>
          {subtitle ? <Text style={styles.headerSubtitle}>{subtitle}</Text> : null}
        </View>
      </View>
      {right}
    </View>
  );
}

export function PrimaryButton({
  children,
  loading = false,
  variant = 'primary',
  icon,
  ...props
}: PressableProps & {
  children: React.ReactNode;
  loading?: boolean;
  variant?: 'primary' | 'secondary' | 'quiet';
  icon?: keyof typeof Feather.glyphMap;
}) {
  const colors = useColors();
  const styles = makeStyles(colors);
  return (
    <Pressable
      {...props}
      disabled={props.disabled || loading}
      style={({ pressed }) => [
        styles.button,
        variant === 'secondary' && styles.secondaryButton,
        variant === 'quiet' && styles.quietButton,
        (pressed || props.disabled) && styles.pressed,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'primary' ? colors.primaryForeground : colors.primary} />
      ) : (
        <>
          <Text
            style={[
              styles.buttonText,
              variant !== 'primary' && styles.secondaryButtonText,
            ]}
          >
            {children}
          </Text>
          {icon ? <Feather name={icon} size={17} color={variant === 'primary' ? colors.primaryForeground : colors.primary} /> : null}
        </>
      )}
    </Pressable>
  );
}

export function MoodSelector({
  value,
  onChange,
}: {
  value: MoodValue | null;
  onChange: (mood: MoodValue) => void;
}) {
  const colors = useColors();
  const styles = makeStyles(colors);
  const moods = Object.keys(moodMeta) as MoodValue[];
  return (
    <View style={styles.moodRow}>
      {moods.map((mood) => {
        const meta = moodMeta[mood];
        const selected = value === mood;
        const tone = colors[meta.colorKey as keyof typeof colors] as string;
        return (
          <Pressable
            key={mood}
            onPress={() => onChange(mood)}
            accessibilityRole="button"
            accessibilityLabel={meta.label}
            style={({ pressed }) => [
              styles.moodChoice,
              selected && { backgroundColor: colors.secondary, borderColor: tone },
              pressed && styles.pressed,
            ]}
          >
            <View style={[styles.moodIcon, { backgroundColor: selected ? tone : colors.muted }]}>
              <Feather name={meta.icon} size={17} color={selected ? colors.card : colors.mutedForeground} />
            </View>
            <Text style={[styles.moodLabel, selected && { color: colors.foreground }]}>{meta.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

export function SectionLabel({ children, action, onAction }: { children: React.ReactNode; action?: string; onAction?: () => void }) {
  const colors = useColors();
  const styles = makeStyles(colors);
  return (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionLabel}>{children}</Text>
      {action && onAction ? (
        <Pressable onPress={onAction} hitSlop={10}>
          <Text style={styles.sectionAction}>{action}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

export function SoftCard({
  children,
  style,
  onPress,
}: {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  onPress?: () => void;
}) {
  const colors = useColors();
  const styles = makeStyles(colors);
  const card = <View style={[styles.card, style]}>{children}</View>;
  return onPress ? (
    <Pressable onPress={onPress} style={({ pressed }) => [pressed && styles.pressed]}>
      {card}
    </Pressable>
  ) : card;
}

export function GradientHero({ children }: { children: React.ReactNode }) {
  const colors = useColors();
  const styles = makeStyles(colors);
  return (
    <LinearGradient
      colors={[colors.darkSurface, '#0D2B40', colors.primary + 'AA']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.hero}
    >
      {children}
    </LinearGradient>
  );
}

export { moodMeta };

// ─── Level Pill ────────────────────────────────────────────────────────────────

export function LevelPill({ level, label }: { level: 1 | 2 | 3 | 4; label: string }) {
  const colors = useColors();
  const dotColors: Record<number, string> = {
    1: colors.accent,
    2: colors.success,
    3: colors.primary,
    4: '#a78bfa',
  };
  return (
    <View style={levelPillStyles.pill}>
      <View style={[levelPillStyles.dot, { backgroundColor: dotColors[level] }]} />
      <Text style={[levelPillStyles.text, { color: dotColors[level] }]}>
        Level {level} · {label}
      </Text>
    </View>
  );
}

const levelPillStyles = StyleSheet.create({
  pill: { flexDirection: 'row', alignItems: 'center', gap: 6, alignSelf: 'flex-start', paddingHorizontal: 11, paddingVertical: 5, borderRadius: 20, backgroundColor: '#1A3250', borderWidth: 1, borderColor: '#1E3A50' },
  dot: { width: 6, height: 6, borderRadius: 3 },
  text: { fontFamily: 'Inter_600SemiBold', fontSize: 11, letterSpacing: 0.4 },
});

// ─── Language Selector ─────────────────────────────────────────────────────────

export const LANGUAGES = [
  { code: 'en', label: 'English', flag: '🇬🇧' },
  { code: 'ar', label: 'Arabic', flag: '🇪🇬' },
  { code: 'ko', label: 'Korean', flag: '🇰🇷' },
  { code: 'vi', label: 'Vietnamese', flag: '🇻🇳' },
  { code: 'es', label: 'Spanish', flag: '🇪🇸' },
  { code: 'fr', label: 'French', flag: '🇫🇷' },
] as const;

export type LanguageCode = (typeof LANGUAGES)[number]['code'];

export function LanguageSelector({
  value,
  onChange,
  label,
}: {
  value: LanguageCode;
  onChange: (code: LanguageCode) => void;
  label?: string;
}) {
  const colors = useColors();
  return (
    <View style={langStyles.wrapper}>
      {label ? <Text style={[langStyles.label, { color: colors.mutedForeground }]}>{label}</Text> : null}
      <View style={langStyles.row}>
        {LANGUAGES.map((lang) => {
          const selected = lang.code === value;
          return (
            <Pressable
              key={lang.code}
              onPress={() => onChange(lang.code)}
              style={({ pressed }) => [
                langStyles.chip,
                { backgroundColor: selected ? colors.primary : colors.card, borderColor: selected ? colors.primary : colors.border },
                pressed && { opacity: 0.72 },
              ]}
            >
              <Text style={langStyles.flag}>{lang.flag}</Text>
              <Text style={[langStyles.chipText, { color: selected ? colors.primaryForeground : colors.foreground }]}>{lang.label}</Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const langStyles = StyleSheet.create({
  wrapper: { gap: 10 },
  label: { fontFamily: 'Inter_600SemiBold', fontSize: 12, letterSpacing: 0.8, textTransform: 'uppercase' },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 13, paddingVertical: 9, borderRadius: 24, borderWidth: 1.5 },
  flag: { fontSize: 14 },
  chipText: { fontFamily: 'Inter_600SemiBold', fontSize: 13 },
});

// ─── Journey Ladder ────────────────────────────────────────────────────────────

type JourneyStepProps = {
  level: 1 | 2 | 3 | 4;
  title: string;
  description: string;
  icon: keyof typeof Feather.glyphMap;
  onPress: () => void;
  active?: boolean;
};

export function JourneyLadder({ children }: { children: React.ReactNode }) {
  const colors = useColors();
  return (
    <View style={[ladderStyles.wrapper, { borderColor: colors.border }]}>
      {children}
    </View>
  );
}

export function JourneyStep({ level, title, description, icon, onPress, active }: JourneyStepProps) {
  const colors = useColors();
  const dotColor = active ? colors.primary : colors.border;
  const stepColors: Record<number, string> = {
    1: colors.accent,
    2: colors.success,
    3: colors.primary,
    4: '#a78bfa',
  };
  const iconBg = stepColors[level];
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [ladderStyles.step, { borderColor: colors.border, backgroundColor: colors.card }, pressed && { opacity: 0.72 }]}>
      <View style={[ladderStyles.levelBadge, { backgroundColor: iconBg + '22', borderColor: iconBg + '44' }]}>
        <Feather name={icon} size={16} color={iconBg} />
      </View>
      <View style={ladderStyles.copy}>
        <View style={ladderStyles.titleRow}>
          <Text style={[ladderStyles.levelNum, { color: colors.mutedForeground }]}>LEVEL {level}</Text>
          {active ? <View style={[ladderStyles.activePill, { backgroundColor: colors.success + '22' }]}><Text style={[ladderStyles.activeText, { color: colors.success }]}>Active</Text></View> : null}
        </View>
        <Text style={[ladderStyles.title, { color: colors.foreground }]}>{title}</Text>
        <Text style={[ladderStyles.desc, { color: colors.mutedForeground }]}>{description}</Text>
      </View>
      <View style={[ladderStyles.dot, { borderColor: dotColor }]}>
        {active ? <View style={[ladderStyles.dotFill, { backgroundColor: colors.primary }]} /> : null}
      </View>
    </Pressable>
  );
}

const ladderStyles = StyleSheet.create({
  wrapper: { gap: 10 },
  step: { flexDirection: 'row', alignItems: 'center', gap: 14, padding: 17, borderRadius: 20, borderWidth: 1 },
  levelBadge: { width: 44, height: 44, borderRadius: 15, alignItems: 'center', justifyContent: 'center', borderWidth: 1.5 },
  copy: { flex: 1, gap: 2 },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  levelNum: { fontFamily: 'Inter_700Bold', fontSize: 9, letterSpacing: 1.2 },
  activePill: { paddingHorizontal: 7, paddingVertical: 2, borderRadius: 8 },
  activeText: { fontFamily: 'Inter_700Bold', fontSize: 9, letterSpacing: 0.8 },
  title: { fontFamily: 'Inter_700Bold', fontSize: 15, letterSpacing: -0.2 },
  desc: { fontFamily: 'Inter_400Regular', fontSize: 12, lineHeight: 17 },
  dot: { width: 18, height: 18, borderRadius: 9, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  dotFill: { width: 8, height: 8, borderRadius: 4 },
});

const brandStyles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  mark: { width: 42, height: 42, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  compactMark: { width: 32, height: 32, borderRadius: 11 },
  loop: { width: 18, height: 11, borderRadius: 8, borderWidth: 3, transform: [{ rotate: '-20deg' }] },
  name: { fontFamily: 'Inter_700Bold', fontSize: 22, letterSpacing: -0.8, color: '#E8F4FF' },
  compactName: { fontSize: 18 },
});

const compactBrandStyles = StyleSheet.create({ row: { flexDirection: 'row', alignItems: 'center', gap: 8 } });

function makeStyles(colors: ReturnType<typeof useColors>) {
  return StyleSheet.create({
    screen: { flex: 1, backgroundColor: colors.background },
    scrollContent: { flexGrow: 1 },
    screenContent: { width: '100%', maxWidth: 900, alignSelf: 'center', paddingHorizontal: 22 },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28 },
    headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 14 },
    iconButton: { width: 40, height: 40, borderRadius: 14, backgroundColor: colors.secondary, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: colors.border },
    headerTitle: { fontFamily: 'Inter_700Bold', fontSize: 26, color: colors.foreground, letterSpacing: -0.8 },
    headerSubtitle: { fontFamily: 'Inter_400Regular', fontSize: 13, color: colors.mutedForeground, marginTop: 3 },
    // Vivid teal pill-shaped button with dark text
    button: { minHeight: 52, borderRadius: 26, paddingHorizontal: 24, backgroundColor: colors.primary, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10 },
    buttonText: { fontFamily: 'Inter_700Bold', fontSize: 15, color: colors.primaryForeground, letterSpacing: 0.1 },
    secondaryButton: { backgroundColor: colors.secondary, borderRadius: 26 },
    secondaryButtonText: { color: colors.secondaryForeground },
    quietButton: { backgroundColor: 'transparent', borderWidth: 1.5, borderColor: colors.border, borderRadius: 26 },
    pressed: { opacity: 0.75 },
    // Mood chips — dark surface, glow on selection
    moodRow: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
    moodChoice: { flexGrow: 1, flexBasis: 54, alignItems: 'center', paddingVertical: 12, borderRadius: 18, borderWidth: 1.5, borderColor: colors.border, backgroundColor: colors.secondary, gap: 7 },
    moodIcon: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
    moodLabel: { fontFamily: 'Inter_600SemiBold', color: colors.mutedForeground, fontSize: 10, textAlign: 'center', letterSpacing: 0.2 },
    sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
    sectionLabel: { fontFamily: 'Inter_700Bold', fontSize: 11, letterSpacing: 1.4, color: colors.mutedForeground, textTransform: 'uppercase' },
    sectionAction: { fontFamily: 'Inter_600SemiBold', fontSize: 13, color: colors.primary },
    // Dark card — the centrepiece of the dark premium look
    card: { borderRadius: colors.radius, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, padding: 20 },
    hero: { borderRadius: 28, padding: 26, minHeight: 190, overflow: 'hidden' },
  });
}