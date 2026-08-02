# سجل التحديثات — Vitals

## [4aade82] — إصلاح انهيار التطبيق عند الإقلاع (السبب الجذري)

- **المشكلة**: كان التطبيق ينهار (`SIGABRT`) بعد 0.5 ثانية من الإقلاع في جميع النسخ.
- **السبب**: في `src/app/_layout.tsx` كان `useAuth()` يُستدعى بلا شرط حتى عندما لا يكون Clerk مفعّلاً (مفتاح `pk_test_` placeholder لا يطابق نمط مفتاح حقيقي). عندها لا يوجد `<ClerkProvider>` في شجرة المكوّنات، فيرمي Clerk خطأً فورياً: `useAuth() can only be used within the <ClerkProvider> component` — خطأ JS غير مُلتقط يصل إلى `RCTExceptionsManager` ثم `SIGABRT`.
- **الحل**:
  - فصل `DemoNavigator` عن `RootNavigator`: وضع التطوير التجريبي (بدون Clerk) لم يعد يستدعي `useAuth`.
  - `RootNavigator` يستدعي `useAuth` فقط داخل `ClerkProvider`.
  - غلّف `configureNotificationHandler()` بـ `try/catch` احتياطاً (كان الاستدعاء غير محمي).
- **الملفات المتأثرة**: `src/app/_layout.tsx`

## [9677adc] — إزالة اعتماديات الويدجت لبناء IPA نظيف

- أُزيلت `expo-widgets` و `@expo/ui` من الاعتماديات.
- تبيّن لاحقاً أن الويدجت لم يكن سبب الانهيار (سجل الانهيار الجديد لا يُظهر أي `appex`)، لكن الإزالة تبقى صحيحة وتقلّل حجم المنتج.

## [a4f49f8] — إزالة الويدجت وLive Activity

- إزالة كود الويدجت من مشروع Widget Extension.
- إزالة كود تحديث Live Activity.
- كان هدفاً أولياً لحل انهيار التوقيع المجاني على iOS 26، ثم تبيّن أن السبب الحقيقي هو خطأ Clerk (أعلاه).

## [118b265] — البنية: macOS لبناء IPA

- تحديث GitHub Actions workflow إلى `macos-latest` (يلزم Xcode 17+ لبناء `clerk-ios` عبر SPM).
- تشغيل البناء يدوياً عبر `workflow_dispatch`.

## [d7a3d80] — التأسيس

- مشروع Vitals: تطبيق تتبع السعرات الحرارية مبني بـ Expo SDK 57.
