import { Checkbox } from "@/components/ui/checkbox";
import { Check } from "lucide-react";

export function toggleValue(values: string[], value: string) {
  return values.includes(value) ? values.filter((item) => item !== value) : [...values, value];
}

interface CheckboxGridProps {
  title: string;
  description: string;
  items: string[];
  values: string[];
  onChange: (values: string[]) => void;
  helperByItem?: Record<string, string>;
  columns?: string;
  variant?: "checkbox" | "button";
}

export function CheckboxGrid({
  title,
  description,
  items,
  values,
  onChange,
  helperByItem,
  columns = "md:grid-cols-2 lg:grid-cols-3",
  variant = "checkbox",
}: CheckboxGridProps) {
  return (
    <div className="space-y-4 rounded-3xl border border-[#eadfce] bg-[#fffaf4] p-5">
      <div>
        <h4 className="font-display text-lg text-[#11100e]">{title}</h4>
        <p className="mt-1 text-sm text-[#6d5b43]">{description}</p>
      </div>
      <div className={`grid gap-3 ${columns}`}>
        {items.map((item) => {
          const selected = values.includes(item);

          if (variant === "button") {
            return (
              <button
                key={item}
                type="button"
                onClick={() => onChange(toggleValue(values, item))}
                className={`rounded-2xl border px-4 py-3 text-left text-sm transition-colors ${
                  selected
                    ? "border-[#526046] bg-white text-[#1f1c18]"
                    : "border-[#eadfce] bg-white/70 text-[#342b22] hover:bg-white"
                }`}
              >
                <span className="flex items-center gap-2">
                  <span
                    className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${
                      selected ? "border-[#526046] bg-[#526046] text-white" : "border-[#c5b39d]"
                    }`}
                  >
                    {selected && <Check className="h-3 w-3" />}
                  </span>
                  <span>{item}</span>
                </span>
                {helperByItem?.[item] && (
                  <span className="mt-2 block text-xs leading-5 text-[#7a6653]">
                    {helperByItem[item]}
                  </span>
                )}
              </button>
            );
          }

          return (
            <label
              key={item}
              className="rounded-2xl border border-[#eadfce] bg-white px-4 py-3 text-sm text-[#342b22] select-none cursor-pointer"
            >
              <div className="flex items-start gap-2">
                <Checkbox
                  checked={selected}
                  onCheckedChange={() => onChange(toggleValue(values, item))}
                />
                <div className="space-y-1">
                  <span className="block leading-6">{item}</span>
                  {helperByItem?.[item] && (
                    <span className="block text-xs text-[#8c7a66]">{helperByItem[item]}</span>
                  )}
                </div>
              </div>
            </label>
          );
        })}
      </div>
    </div>
  );
}

