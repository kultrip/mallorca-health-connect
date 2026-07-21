import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Globe, Instagram, Facebook, Linkedin, Youtube } from "lucide-react";

interface SocialLinks {
  website: string;
  instagramUrl: string;
  facebookUrl: string;
  linkedinUrl: string;
  youtubeUrl: string;
}

interface SocialLinksFormProps {
  links: SocialLinks;
  onChange: (field: keyof SocialLinks, value: string) => void;
  disabled?: boolean;
}

export function SocialLinksForm({ links, onChange, disabled = false }: SocialLinksFormProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
      <div className="space-y-2">
        <Label className="text-sm font-medium text-[#1f3326] flex items-center gap-1.5">
          <Globe className="h-4 w-4 text-[#8a6550]" /> Sitio web
        </Label>
        <Input
          type="url"
          placeholder="https://..."
          value={links.website}
          onChange={(e) => onChange("website", e.target.value)}
          disabled={disabled}
          className="rounded-2xl border-[#dfcfbd] focus:border-[#8a6550] focus:ring-[#8a6550]"
        />
      </div>

      <div className="space-y-2">
        <Label className="text-sm font-medium text-[#1f3326] flex items-center gap-1.5">
          <Instagram className="h-4 w-4 text-[#8a6550]" /> Instagram (URL)
        </Label>
        <Input
          type="url"
          placeholder="https://instagram.com/..."
          value={links.instagramUrl}
          onChange={(e) => onChange("instagramUrl", e.target.value)}
          disabled={disabled}
          className="rounded-2xl border-[#dfcfbd] focus:border-[#8a6550] focus:ring-[#8a6550]"
        />
      </div>

      <div className="space-y-2">
        <Label className="text-sm font-medium text-[#1f3326] flex items-center gap-1.5">
          <Facebook className="h-4 w-4 text-[#8a6550]" /> Facebook (URL)
        </Label>
        <Input
          type="url"
          placeholder="https://facebook.com/..."
          value={links.facebookUrl}
          onChange={(e) => onChange("facebookUrl", e.target.value)}
          disabled={disabled}
          className="rounded-2xl border-[#dfcfbd] focus:border-[#8a6550] focus:ring-[#8a6550]"
        />
      </div>

      <div className="space-y-2">
        <Label className="text-sm font-medium text-[#1f3326] flex items-center gap-1.5">
          <Linkedin className="h-4 w-4 text-[#8a6550]" /> LinkedIn (URL)
        </Label>
        <Input
          type="url"
          placeholder="https://linkedin.com/in/..."
          value={links.linkedinUrl}
          onChange={(e) => onChange("linkedinUrl", e.target.value)}
          disabled={disabled}
          className="rounded-2xl border-[#dfcfbd] focus:border-[#8a6550] focus:ring-[#8a6550]"
        />
      </div>

      <div className="space-y-2 md:col-span-2">
        <Label className="text-sm font-medium text-[#1f3326] flex items-center gap-1.5">
          <Youtube className="h-4 w-4 text-[#8a6550]" /> Canal de YouTube (URL)
        </Label>
        <Input
          type="url"
          placeholder="https://youtube.com/c/..."
          value={links.youtubeUrl}
          onChange={(e) => onChange("youtubeUrl", e.target.value)}
          disabled={disabled}
          className="rounded-2xl border-[#dfcfbd] focus:border-[#8a6550] focus:ring-[#8a6550]"
        />
      </div>
    </div>
  );
}
