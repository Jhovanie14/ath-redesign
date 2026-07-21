"use client";

import { useState, type ReactNode } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { CategoryUsage } from "@/lib/categories";
import type { CourseCategory } from "@/lib/types";

export interface CategoryEditDialogProps {
  category: CategoryUsage | null;
  label: string;
  onOpenChange: (open: boolean) => void;
  onLabelChange: (key: CourseCategory, label: string) => void;
}

export function CategoryEditDialog({
  category,
  label,
  onOpenChange,
  onLabelChange,
}: CategoryEditDialogProps) {
  return (
    <Dialog open={!!category} onOpenChange={onOpenChange}>
      <DialogContent
        position="center"
        className="max-h-[85vh] max-w-lg overflow-y-auto p-6 sm:p-8"
      >
        {category && (
          <CategoryEditForm
            key={category.key}
            category={category}
            label={label}
            onOpenChange={onOpenChange}
            onLabelChange={onLabelChange}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}

function CategoryEditForm({
  category,
  label,
  onOpenChange,
  onLabelChange,
}: {
  category: CategoryUsage;
  label: string;
  onOpenChange: (open: boolean) => void;
  onLabelChange: (key: CourseCategory, label: string) => void;
}) {
  const [draft, setDraft] = useState(label);

  return (
    <>
      <DialogHeader>
        <DialogTitle className="text-title">{label}</DialogTitle>
        <DialogDescription className="font-data text-micro">
          {category.key}
        </DialogDescription>
      </DialogHeader>

      <dl className="mt-6 grid grid-cols-2 gap-x-6 gap-y-4">
        <ReviewField label="Courses" value={category.courseCount} />
        <ReviewField label="Trainers" value={category.trainerCount} />
      </dl>

      <div className="mt-6">
        <label htmlFor="category-label" className="eyebrow !text-stone">
          Display label
        </label>
        <Input
          id="category-label"
          className="mt-2"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
        />
      </div>

      <DialogFooter className="mt-7">
        <Button
          onClick={() => {
            onLabelChange(category.key, draft);
            onOpenChange(false);
          }}
        >
          Save label
        </Button>
      </DialogFooter>
    </>
  );
}

function ReviewField({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div>
      <dt className="eyebrow !text-stone">{label}</dt>
      <dd className="mt-1 text-small text-ink">{value}</dd>
    </div>
  );
}
