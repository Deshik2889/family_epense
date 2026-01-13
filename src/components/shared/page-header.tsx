'use client';
import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";
import { EmiForm } from "@/components/forms/emi-form";


interface PageHeaderProps {
    title: string;
    showAddEmi?: boolean;
}

export function PageHeader({ title, showAddEmi }: PageHeaderProps) {
  const [isEmiOpen, setEmiOpen] = useState(false);
  
  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
      <div className="flex items-center gap-2">
        <Button variant="outline" size="icon" className="h-7 w-7" asChild>
            <Link href="/">
                <ArrowLeft className="h-4 w-4" />
                <span className="sr-only">Back</span>
            </Link>
        </Button>
        <h1 className="text-xl font-bold tracking-tight">{title}</h1>
      </div>
      {showAddEmi && (
        <div className="ml-auto">
             <Dialog open={isEmiOpen} onOpenChange={setEmiOpen}>
                <DialogTrigger asChild>
                    <Button size="sm" className="h-8 gap-1">
                        <PlusCircle className="h-3.5 w-3.5" />
                        <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">Add EMI</span>
                    </Button>
                </DialogTrigger>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Add New EMI</DialogTitle>
                        <DialogDescription>Enter the details for the new vehicle loan.</DialogDescription>
                    </DialogHeader>
                    <EmiForm setOpen={setEmiOpen} />
                </DialogContent>
            </Dialog>
        </div>
      )}
    </header>
  );
}
