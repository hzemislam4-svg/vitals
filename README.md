# Vitals

تطبيق تتبع السعرات الحرارية مبني بـ [Expo](https://expo.dev) (SDK 57).

## البدء

1. ثبّت الاعتماديات:

   ```bash
   npm install
   ```

2. شغّل التطبيق:

   ```bash
   npx expo start
   ```

## بناء IPA (iOS)

يُبنى الـ IPA عبر GitHub Actions (workflow `build-ipa.yml`)، ويمكن تشغيله يدوياً من تبويب **Actions**:

1. افتح **Actions → Build unsigned IPA → Run workflow** (الفرع `main`).
2. بعد اكتمال البناء، حمّل منتج `Vitals-ipa` وافك ضغطه لتحصل على `Vitals.ipa`.
3. ثبّته على جهازك عبر [Sideloadly](https://sideloadly.io) مع بطاقة Apple مجانية.

## ملاحظات

- عند غياب مفتاح Clerk حقيقي (`pk_test_...` placeholder) يعمل التطبيق في وضع تجريبي بلا تسجيل دخول.
- راجع [CHANGELOG.md](./CHANGELOG.md) لسجل التحديثات.
