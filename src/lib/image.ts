import * as ImageManipulator from 'expo-image-manipulator';
import { readAsStringAsync } from 'expo-file-system/legacy';

/** Max long edge for images sent to the model — keeps requests fast & cheap */
const MAX_EDGE = 1280;
const JPEG_QUALITY = 0.78;

/**
 * Downsizes a photo and returns `{ uri, base64 }` of a JPEG suitable for
 * sending to the Gemini API route.
 */
export async function preparePhotoForAnalysis(uri: string): Promise<{ uri: string; base64: string }> {
  const manipulated = await ImageManipulator.manipulateAsync(
    uri,
    [{ resize: { width: MAX_EDGE } }],
    { compress: JPEG_QUALITY, format: ImageManipulator.SaveFormat.JPEG }
  );

  const base64 = await readAsStringAsync(manipulated.uri, { encoding: 'base64' });
  return { uri: manipulated.uri, base64 };
}
