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
import { PageHero } from "@/components/PageHero";
import { useTranslation } from "@/i18n/LanguageContext";
import type { TranslationKey } from "@/i18n/translations";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

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

  const [spotlight, ...rest] = sections;
  const SpotlightIcon = spotlight.icon;

  return (
    <div className="pb-20 space-y-12">
      <PageHero
        image="https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?w=1400&q=80"
        badge="Sydney, Australia"
        title={t("info.title")}
        subtitle={t("info.subtitle")}
      />

      {/* Spotlight: weather */}
      <section
        className="animate-in grid gap-8 md:grid-cols-12 items-start border-b border-border pb-12"
      >
        <div className="md:col-span-3 flex items-start gap-4">
          <span className="font-numeric text-xs text-muted-foreground pt-1">01</span>
          <div
            className="rounded-2xl p-3"
            style={{ backgroundColor: `${spotlight.color}18` }}
          >
            <SpotlightIcon className="h-7 w-7" style={{ color: spotlight.color }} strokeWidth={1.5} />
          </div>
        </div>
        <div className="md:col-span-9 space-y-4">
          <span className="bracket-label">{t(spotlight.titleKey)}</span>
          <h2 className="font-display text-3xl md:text-5xl leading-[1.02] max-w-[18ch]">
            {t("info.spotlightTitle")}
          </h2>
          <p className="text-base sm:text-lg text-muted-foreground leading-relaxed max-w-[60ch] whitespace-pre-line">
            {t(spotlight.contentKey)}
          </p>
        </div>
      </section>

      {/* Editorial list — numbered entries, no cards */}
      <section className="grid gap-x-12 gap-y-10 md:grid-cols-2" data-reveal>
        {rest.map((s, i) => {
          const Icon = s.icon;
          const n = i + 2; // started from 01 for spotlight
          return (
            <article
              key={s.titleKey}
              className="group/info grid grid-cols-[auto_1fr] gap-x-5 sm:gap-x-8 pb-8 border-b border-border last:border-b-0"
            >
              <div className="flex flex-col items-start gap-3 pt-1">
                <span className="font-numeric text-xs text-muted-foreground">
                  {String(n).padStart(2, "0")}
                </span>
                <div
                  className={cn(
                    "rounded-xl p-2 transition-transform duration-500",
                    "group-hover/info:scale-[1.08]"
                  )}
                  style={{
                    backgroundColor: `${s.color}14`,
                    transitionTimingFunction: "var(--ease-out-quint)",
                  }}
                >
                  <Icon className="h-4 w-4" style={{ color: s.color }} strokeWidth={1.75} />
                </div>
              </div>
              <div className="space-y-2 min-w-0">
                <h3 className="font-display text-xl sm:text-2xl leading-tight">
                  {t(s.titleKey)}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
                  {t(s.contentKey)}
                </p>
              </div>
            </article>
          );
        })}
      </section>
    </div>
  );
}
