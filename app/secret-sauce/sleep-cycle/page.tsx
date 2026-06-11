import { Navbar } from '@/components/navbar';
import { SecretSaucePage } from '@/components/secret-sauce/SecretSaucePage';
import { PageShell } from '@/components/ui/mission';

export default function SleepCyclePage() {
  return (
    <PageShell>
      <Navbar />
      <SecretSaucePage />
    </PageShell>
  );
}
