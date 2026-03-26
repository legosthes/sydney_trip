import {
  Thermometer,
  Shirt,
  Plug,
  DollarSign,
  Phone,
  Clock,
  Languages,
  Wifi,
  Baby,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { PageHero } from "@/components/PageHero";
import { useTranslation } from "@/i18n/LanguageContext";
import type { TranslationKey } from "@/i18n/translations";
import type { LucideIcon } from "lucide-react";

interface InfoSection {
  icon: LucideIcon;
  titleKey: TranslationKey;
  contentKey: TranslationKey;
  color: string;
}

const sections: InfoSection[] = [
  { icon: Thermometer, titleKey: "info.weather", contentKey: "info.weatherDesc", color: "#219ebc" },
  { icon: Shirt, titleKey: "info.clothing", contentKey: "info.clothingDesc", color: "#e76f51" },
  { icon: Plug, titleKey: "info.power", contentKey: "info.powerDesc", color: "#f4a261" },
  { icon: DollarSign, titleKey: "info.currency", contentKey: "info.currencyDesc", color: "#2d6a4f" },
  { icon: Phone, titleKey: "info.emergency", contentKey: "info.emergencyDesc", color: "#e63946" },
  { icon: Clock, titleKey: "info.timezone", contentKey: "info.timezoneDesc", color: "#264653" },
  { icon: Languages, titleKey: "info.language", contentKey: "info.languageDesc", color: "#8338ec" },
  { icon: Wifi, titleKey: "info.sim", contentKey: "info.simDesc", color: "#0077b6" },
  { icon: Baby, titleKey: "info.familyTips", contentKey: "info.familyTipsDesc", color: "#db2777" },
];

export function TravelInfo() {
  const { t } = useTranslation();

  return (
    <div className="pb-20 space-y-8">
      <PageHero
        image="https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?w=1400&q=80"
        badge="Sydney, Australia"
        title={t("info.title")}
        subtitle={t("info.subtitle")}
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {sections.map((s) => {
          const Icon = s.icon;
          return (
            <Card key={s.titleKey} className="border-border/50 shadow-sm">
              <CardContent className="p-5 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="rounded-xl p-2.5" style={{ backgroundColor: `${s.color}15` }}>
                    <Icon className="h-5 w-5" style={{ color: s.color }} />
                  </div>
                  <h2 className="font-semibold">{t(s.titleKey)}</h2>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
                  {t(s.contentKey)}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
