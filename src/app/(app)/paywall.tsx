import { useRouter } from 'expo-router';

import { PaywallContent } from '@/components/PaywallContent';

export default function PaywallScreen() {
  const router = useRouter();
  return <PaywallContent onClose={() => router.back()} />;
}
