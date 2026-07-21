import { useState, useEffect, useRef } from "react";
import { Check, Plus, Search, GripVertical, X } from "lucide-react";
import { Input } from "@/components/ui/input";

interface CatalogItem {
  id: string;
  name: string;
}

interface CatalogPickerProps {
  title: string;
  description: string;
  placeholder: string;
  items: CatalogItem[];
  selectedIds: string[];
  maxSelection: number | null;
  search: string;
  onSearchChange: (value: string) => void;
  onChange: (values: string[]) => void;
  helperText: string;
  draggedIndex: number | null;
  onDragIndexChange: (value: number | null) => void;
}

export function CatalogPicker({
  title,
  description,
  placeholder,
  items,
  selectedIds,
  maxSelection,
  search,
  onSearchChange,
  onChange,
  helperText,
  draggedIndex,
  onDragIndexChange,
}: CatalogPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const filtered = items.filter((item) => {
    const name = item?.name ?? "";
    const term = (search ?? "").trim().toLowerCase();
    return name.toLowerCase().includes(term);
  });

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  function toggle(id: string) {
    const exists = selectedIds.includes(id);
    if (!exists && maxSelection !== null && selectedIds.length >= maxSelection) return;
    const next = exists ? selectedIds.filter((value) => value !== id) : [...selectedIds, id];
    onChange(next);
  }

  function remove(id: string) {
    onChange(selectedIds.filter((value) => value !== id));
  }

  function move(fromIndex: number, toIndex: number) {
    if (fromIndex === toIndex) return;
    const next = [...selectedIds];
    const [item] = next.splice(fromIndex, 1);
    next.splice(toIndex, 0, item);
    onChange(next);
  }

  return (
    <div className="space-y-4 rounded-3xl border border-[#eadfce] bg-[#fffaf4] p-5">
      <div>
        <h4 className="font-display text-lg text-[#11100e]">{title}</h4>
        <p className="mt-1 text-sm text-[#6d5b43]">{description}</p>
      </div>

      <div className="relative" ref={containerRef}>
        <Input
          value={search ?? ""}
          onChange={(event) => {
            onSearchChange(event.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          placeholder={placeholder}
          className="pr-10"
        />
        <Search className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8c7a66]" />

        {isOpen && (
          <div className="absolute left-0 right-0 top-full z-50 mt-1 grid max-h-60 gap-2 overflow-auto rounded-2xl border border-[#eadfce] bg-white p-3 shadow-lg">
            {filtered.map((item) => {
              const selected = selectedIds.includes(item.id);
              const disabled =
                !selected && maxSelection !== null && selectedIds.length >= maxSelection;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => toggle(item.id)}
                  disabled={disabled}
                  className={`flex items-center justify-between rounded-2xl border px-4 py-3 text-left text-sm transition-colors ${
                    selected
                      ? "border-[#526046] bg-[#f4ede6] text-[#1f1c18]"
                      : "border-[#eadfce] bg-white text-[#342b22] hover:bg-[#fffaf4]"
                  } ${disabled ? "cursor-not-allowed opacity-60" : ""}`}
                >
                  <span>{item.name}</span>
                  {selected ? (
                    <Check className="h-4 w-4 text-[#526046]" />
                  ) : (
                    <Plus className="h-4 w-4 text-[#8c7a66]" />
                  )}
                </button>
              );
            })}
            {filtered.length === 0 && (
              <p className="px-3 py-2 text-sm text-[#8c7a66] text-center">
                No encontramos resultados.
              </p>
            )}
          </div>
        )}
      </div>

      {selectedIds.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selectedIds.map((id, index) => {
            const item = items.find((entry) => entry.id === id);
            if (!item) return null;
            return (
              <div
                key={id}
                draggable
                onDragStart={() => onDragIndexChange(index)}
                onDragOver={(event) => event.preventDefault()}
                onDrop={() => {
                  if (draggedIndex === null) return;
                  move(draggedIndex, index);
                  onDragIndexChange(null);
                }}
                className="inline-flex items-center gap-2 rounded-full border border-[#d8c6b0] bg-white px-3 py-2 text-sm text-[#342b22]"
              >
                <GripVertical className="h-3.5 w-3.5 text-[#8c7a66]" />
                <span>{item.name}</span>
                <button
                  type="button"
                  onClick={() => remove(id)}
                  className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-[#f2e6d7] text-[#7f6046]"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            );
          })}
        </div>
      )}

      <p className="text-xs text-[#6d5b43]">{helperText}</p>
    </div>
  );
}
