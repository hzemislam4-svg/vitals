import { Ionicons } from '@expo/vector-icons';
import { CameraView, useCameraPermissions, type CameraType } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { useRef, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button } from '@/components/ui/Button';
import { AppText } from '@/components/ui/Text';
import { palette, Radius, Spacing } from '@/constants/theme';
import { analyzeFoodPhoto } from '@/lib/api';
import { useDraft, useDiary } from '@/lib/diary';
import { hapticTap } from '@/lib/haptics';
import { preparePhotoForAnalysis } from '@/lib/image';
import { usePro } from '@/lib/pro';
import { DEMO_MEAL } from '@/lib/seed';

export default function CaptureScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [permission, requestPermission] = useCameraPermissions();
  const camera = useRef<CameraView>(null);
  const [facing, setFacing] = useState<CameraType>('back');
  const [flash, setFlash] = useState<'off' | 'on' | 'auto'>('off');
  const [busy, setBusy] = useState(false);
  const pro = usePro();
  const logsUsed = useDiary((s) => s.freeLogsUsed);

  const blocked = !pro.isPro && logsUsed >= 3;

  async function runAnalysis(uri: string) {
    setBusy(true);
    try {
      const prepared = await preparePhotoForAnalysis(uri);
      const result = await analyzeFoodPhoto(prepared.base64);
      useDraft.getState().setDraft({
        photoUri: prepared.uri,
        items: result.items,
        source: result.items[0]?.source ?? 'ai',
      });
      router.push('/capture/review');
    } catch {
      useDraft.getState().clear();
      alert('We couldn\u2019t analyze that photo. Please try again.');
    } finally {
      setBusy(false);
    }
  }

  async function onShutter() {
    if (!camera.current) return;
    hapticTap();
    const photo = await camera.current.takePictureAsync({ quality: 0.8, shutterSound: false });
    if (photo?.uri) await runAnalysis(photo.uri);
  }

  async function onPickLibrary() {
    const res = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 1 });
    if (!res.canceled && res.assets?.[0]?.uri) await runAnalysis(res.assets[0].uri);
  }

  if (blocked) {
    return (
      <BlockedView
        onUpgrade={() => router.push('/paywall')}
        onDemo={() => {
          useDraft.getState().setDraft({
            photoUri: null,
            items: [{ ...DEMO_MEAL }],
            source: 'demo',
          });
          router.push('/capture/review');
        }}
        onClose={router.back}
      />
    );
  }

  if (!permission) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={palette.accent} />
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.center}>
        <Ionicons name="camera-outline" size={40} color={palette.textTertiary} />
        <AppText variant="md" color={palette.textSecondary} align="center" style={styles.permissionText}>
          Vitals needs camera access to estimate your meals.
        </AppText>
        <Button title="Grant camera access" fullWidth onPress={requestPermission} />
        <Button title="Go back" variant="ghost" fullWidth onPress={router.back} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView
        ref={camera}
        style={StyleSheet.absoluteFill}
        facing={facing}
        flash={flash}
        active={!busy}
      />

      <View style={[styles.topBar, { paddingTop: insets.top + Spacing.sm }]}>
        <Pressable style={styles.roundBtn} onPress={router.back}>
          <Ionicons name="close" size={22} color={palette.text} />
        </Pressable>
        <AppText variant="md" weight={700}>Log a meal</AppText>
        <Pressable style={styles.roundBtn} onPress={() => setFlash((f) => (f === 'off' ? 'on' : 'off'))}>
          <Ionicons name={flash === 'on' ? 'flash' : 'flash-off-outline'} size={20} color={palette.text} />
        </Pressable>
      </View>

      <View style={styles.guide}>
        <View style={styles.guideBox} />
        <AppText variant="sm" color={palette.text} style={styles.guideText}>
          Center the plate in the frame
        </AppText>
      </View>

      {busy ? (
        <View style={[StyleSheet.absoluteFill, styles.analyzing]}>
          <ActivityIndicator size="large" color={palette.accent} />
          <AppText variant="md" weight={600} color={palette.text}>Analyzing your meal…</AppText>
        </View>
      ) : null}

      <View style={[styles.bottomBar, { paddingBottom: insets.bottom + Spacing.xl }]}>
        <Pressable style={styles.sideBtn} onPress={onPickLibrary}>
          <Ionicons name="images-outline" size={22} color={palette.text} />
          <AppText variant="xs" color={palette.text}>Library</AppText>
        </Pressable>

        <Pressable style={styles.shutter} onPress={onShutter}>
          <View style={styles.shutterInner} />
        </Pressable>

        <Pressable style={styles.sideBtn} onPress={() => setFacing((f) => (f === 'back' ? 'front' : 'back'))}>
          <Ionicons name="camera-reverse-outline" size={22} color={palette.text} />
          <AppText variant="xs" color={palette.text}>Flip</AppText>
        </Pressable>
      </View>

      <Pressable style={styles.manualLink} onPress={() => router.push('/capture/review')}>
        <AppText variant="sm" weight={600} color={palette.accent}>Enter manually instead</AppText>
      </Pressable>
    </View>
  );
}

function BlockedView({ onUpgrade, onDemo, onClose }: { onUpgrade: () => void; onDemo: () => void; onClose: () => void }) {
  return (
    <View style={styles.center}>
      <Ionicons name="diamond-outline" size={44} color={palette.accent} />
      <AppText variant="xl" weight={800} align="center">Free AI logs used up</AppText>
      <AppText variant="md" color={palette.textSecondary} align="center" style={styles.permissionText}>
        Upgrade to Vitals Pro for unlimited photo logging, full history and widgets.
      </AppText>
      <Button title="See plans" fullWidth onPress={onUpgrade} />
      <Button title="Preview with a demo meal" variant="secondary" fullWidth onPress={onDemo} />
      <Button title="Go back" variant="ghost" fullWidth onPress={onClose} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: palette.black },
  center: { flex: 1, backgroundColor: palette.bg, alignItems: 'center', justifyContent: 'center', padding: Spacing.xl, gap: Spacing.md },
  permissionText: { maxWidth: 320 },
  topBar: { position: 'absolute', top: 0, left: 0, right: 0, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: Spacing.lg },
  roundBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(10,13,18,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  guide: { position: 'absolute', top: 0, bottom: 0, left: 0, right: 0, alignItems: 'center', justifyContent: 'center' },
  guideBox: {
    width: 260,
    height: 260,
    borderRadius: Radius.xl,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.35)',
  },
  guideText: { marginTop: Spacing.md, textShadowColor: 'rgba(0,0,0,0.6)', textShadowRadius: 6 },
  analyzing: { backgroundColor: 'rgba(5,8,12,0.82)', alignItems: 'center', justifyContent: 'center', gap: Spacing.md },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: Spacing.xl,
  },
  sideBtn: { alignItems: 'center', gap: 4, width: 64 },
  shutter: {
    width: 78,
    height: 78,
    borderRadius: 39,
    borderWidth: 4,
    borderColor: palette.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  shutterInner: { width: 60, height: 60, borderRadius: 30, backgroundColor: palette.white },
  manualLink: { position: 'absolute', bottom: 108, alignSelf: 'center', paddingVertical: 8, paddingHorizontal: 16, backgroundColor: 'rgba(10,13,18,0.7)', borderRadius: Radius.pill },
});
