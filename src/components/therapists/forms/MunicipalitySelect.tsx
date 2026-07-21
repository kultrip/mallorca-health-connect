import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Municipality {
  id: string;
  name: string;
  slug: string;
}

interface MunicipalitySelectProps {
  value: string;
  onChange: (value: string) => void;
  municipalities: Municipality[];
  label?: string;
  placeholder?: string;
  disabled?: boolean;
}

export function MunicipalitySelect({
  value,
  onChange,
  municipalities,
  label = "Municipio",
  placeholder = "Selecciona un municipio...",
  disabled = false,
}: MunicipalitySelectProps) {
  return (
    <div className="space-y-2">
      {label && <Label className="text-sm font-medium text-[#1f3326]">{label}</Label>}
      <Select value={value} onValueChange={onChange} disabled={disabled}>
        <SelectTrigger className="w-full rounded-2xl border-[#dfcfbd] bg-white text-left focus:ring-1 focus:ring-[#8a6550]">
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent className="max-h-60 bg-white border border-[#dfcfbd]">
          {municipalities.map((m) => (
            <SelectItem key={m.id} value={m.id} className="cursor-pointer focus:bg-[#fcf9f5]">
              {m.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
