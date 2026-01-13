import { getEmis } from "@/lib/actions";
import { EmiCard } from "@/components/emis/emi-card";
import { PageHeader } from "@/components/shared/page-header";

export default async function EmisPage() {
  const emis = await getEmis();

  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/40">
        <PageHeader title="EMI Management" showAddEmi />
        <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-6">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {emis.map(emi => (
                    <EmiCard key={emi.id} emi={emi} />
                ))}
                 {emis.length === 0 && (
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
