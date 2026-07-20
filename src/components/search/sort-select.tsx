"use client";

import { SORT_OPTIONS, type SortKey } from "./filters";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function SortSelect({
  value,
  onChange,
}: {
  value: SortKey;
  onChange: (value: SortKey) => void;
}) {
  return (
    <div className="flex items-center gap-2">
      <label
        htmlFor="sort"
        className="hidden text-small text-stone sm:inline"
      >
        Sort
      </label>
      <Select value={value} onValueChange={(v) => onChange(v as SortKey)}>
        <SelectTrigger id="sort" className="h-10 w-[190px]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {SORT_OPTIONS.map((o) => (
            <SelectItem key={o.value} value={o.value}>
              {o.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
