import Constants from 'expo-constants';
import { useEffect, useState } from 'react';
import Purchases, {
  CustomerInfo,
  PurchasesConfiguration,
  PurchasesIntroPrice,
  PurchasesOffering,
  PurchasesPackage,
  PurchasesStoreProduct,
} from 'react-native-purchases';

import { useDiary } from './diary';

const API_KEY = Constants.expoConfig?.extra?.revenuecatApiKey as string | undefined;

let initialized = false;
let customerListenerAttached = false;

export async function initPurchases() {
  if (initialized) return;
  if (!API_KEY) return;
  try {
    const config: PurchasesConfiguration = { apiKey: API_KEY };
    Purchases.configure(config);
    initialized = true;
  } catch (e) {
    console.warn('RevenueCat init failed', e);
  }
}

function entitlementActive(info: CustomerInfo | null): boolean {
  return !!info?.entitlements.active['Calorie Tracker Pro'];
}

function pickPackage(offering: PurchasesOffering | undefined, kind: 'weekly' | 'yearly'): PurchasesPackage | undefined {
  if (!offering) return undefined;
  const direct = kind === 'weekly' ? offering.weekly : offering.annual;
  if (direct) return direct;
  const needle = kind === 'weekly' ? '$rc_weekly' : '$rc_annual';
  return offering.availablePackages.find((p) => p.identifier === needle);
}

type ProStatus = {
  ready: boolean;
  isPro: boolean;
  weekly?: PurchasesPackage;
  yearly?: PurchasesPackage;
  error?: string;
};

export function usePro(): ProStatus & {
  purchase: (pkg: PurchasesPackage) => Promise<boolean>;
  restore: () => Promise<boolean>;
} {
  const proOverride = useDiary((s) => s.proOverride);
  const [ready, setReady] = useState(false);
  const [info, setInfo] = useState<CustomerInfo | null>(null);
  const [weekly, setWeekly] = useState<PurchasesPackage | undefined>();
  const [yearly, setYearly] = useState<PurchasesPackage | undefined>();
  const [error, setError] = useState<string | undefined>();

  useEffect(() => {
    let cancelled = false;

    async function run() {
      if (!API_KEY) {
        setReady(true);
        return;
      }
      try {
        const customer = await Purchases.getCustomerInfo();
        if (cancelled) return;
        setInfo(customer);
        const offerings = await Purchases.getOfferings();
        if (cancelled) return;
        const current = offerings.current ?? offerings.all['default'];
        setWeekly(pickPackage(current, 'weekly'));
        setYearly(pickPackage(current, 'yearly'));
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : String(e));
      } finally {
        if (!cancelled) setReady(true);
      }
    }
    run();

    if (!customerListenerAttached) {
      Purchases.addCustomerInfoUpdateListener((customer) => {
        setInfo(customer);
      });
      customerListenerAttached = true;
    }

    return () => {
      cancelled = true;
    };
  }, []);

  async function purchase(pkg: PurchasesPackage) {
    try {
      const res = await Purchases.purchasePackage(pkg);
      setInfo(res.customerInfo);
      return entitlementActive(res.customerInfo);
    } catch (e: any) {
      if (e?.userCancelled) return false;
      setError(e?.message ?? 'Purchase failed');
      return false;
    }
  }

  async function restore() {
    try {
      const info = await Purchases.restorePurchases();
      setInfo(info);
      return entitlementActive(info);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
      return false;
    }
  }

  return {
    ready,
    isPro: proOverride ?? entitlementActive(info),
    weekly,
    yearly,
    error,
    purchase,
    restore,
  };
}

export function productPrice(p: PurchasesPackage | undefined): string {
  return p?.product?.priceString ?? '';
}

export function productPriceNumber(p: PurchasesPackage | undefined): number {
  return p?.product?.price ?? 0;
}

export function formattedIntro(p: PurchasesStoreProduct | undefined): string {
  if (!p?.introPrice) return '';
  const intro: PurchasesIntroPrice = p.introPrice;
  const unit =
    intro.periodUnit === 'WEEK'
      ? 'week'
      : intro.periodUnit === 'MONTH'
        ? 'month'
        : intro.periodUnit === 'YEAR'
          ? 'year'
          : 'period';
  return `first ${intro.cycles ?? 1} ${unit} ${intro.priceString}`;
}
