"use client";

import { useState } from "react";
import type { CategoryUsage } from "@/lib/categories";
import type { CourseCategory } from "@/lib/types";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { CategoryEditDialog } from "./category-edit-dialog";

export function CategoriesTable({
  initialCategories,
}: {
  initialCategories: CategoryUsage[];
}) {
  const [labels, setLabels] = useState<Record<CourseCategory, string>>(() =>
    Object.fromEntries(
      initialCategories.map((c) => [c.key, c.label]),
    ) as Record<CourseCategory, string>,
  );
  const [editingKey, setEditingKey] = useState<CourseCategory | null>(null);

  function setLabel(key: CourseCategory, label: string) {
    setLabels((prev) => ({ ...prev, [key]: label }));
  }

  const editing = initialCategories.find((c) => c.key === editingKey) ?? null;
  const totalCourses = initialCategories.reduce(
    (sum, c) => sum + c.courseCount,
    0,
  );

  return (
    <>
      <p className="text-body text-ink-soft">
        {initialCategories.length} categories across {totalCourses} course
        {totalCourses === 1 ? "" : "s"}
      </p>

      <div className="mt-8 overflow-hidden rounded-card border border-linen bg-paper">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Category</TableHead>
              <TableHead>Courses</TableHead>
              <TableHead>Trainers</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {initialCategories.map((c) => (
              <TableRow key={c.key}>
                <TableCell className="text-ink">{labels[c.key]}</TableCell>
                <TableCell className="text-ink-soft">
                  {c.courseCount}
                </TableCell>
                <TableCell className="text-ink-soft">
                  {c.trainerCount}
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setEditingKey(c.key)}
                  >
                    Edit
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <CategoryEditDialog
        category={editing}
        label={editing ? labels[editing.key] : ""}
        onOpenChange={(open) => {
          if (!open) setEditingKey(null);
        }}
        onLabelChange={setLabel}
      />
    </>
  );
}
