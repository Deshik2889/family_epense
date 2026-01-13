'use client';

import { useMemo } from 'react';
import { useCollection, useFirestore, useUser, useMemoFirebase } from '@/firebase';
import { collection } from 'firebase/firestore';
import type { Emi } from '@/lib/types';
import { EmiCard } from '@/components/emis/emi-card';
import { PageHeader } from '@/components/shared/page-header';
import { Skeleton } from '@/components/ui/skeleton';

export default function EmisPage() {
  const firestore = useFirestore();
  const { user } = useUser();

  const emisCollectionRef = useMemoFirebase(() => {
    if (!user) return null;
    return collection(firestore, `users/${user.uid}/emis`);
  }, [firestore, user]);

  const { data: emis, isLoading } = useCollection<Emi>(emisCollectionRef);
  
  const sortedEmis = useMemo(() => {
    if (!emis) return [];
    // Firestore doesn't guarantee order without an orderBy clause, so we sort client-side.
    // Also convert timestamp to date for calculation
    return [...emis]
      .map(emi => ({ ...emi, startDate: emi.startDate.toDate(), name: emi.name || "Unnamed EMI" }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [emis]);

  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/40">
      <PageHeader title="EMI Management" showAddEmi />
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-6">
        <div className="grid grid-cols-1 gap-4">
          {isLoading && Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-64 w-full" />)}
          
          {!isLoading && sortedEmis && sortedEmis.map(emi => (
            <EmiCard key={emi.id} emi={emi} />
          ))}

          {!isLoading && (!sortedEmis || sortedEmis.length === 0) && (
            <div className="col-span-full text-center text-muted-foreground py-10">
              <p>No EMIs found.</p>
              <p className="text-sm">Click "Add EMI" to get started.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
