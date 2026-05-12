interface PageHeroProps {
  image: string;
  badge: string;
  title: string;
  subtitle: string;
  action?: React.ReactNode;
}

export function PageHero({ image, badge, title, subtitle, action }: PageHeroProps) {
  return (
    <section className="relative overflow-hidden rounded-3xl animate-fade">
      <div className="absolute inset-0">
        <img
          src={image}
          alt={title}
          className="h-full w-full object-cover animate-ken-burns"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/30 to-black/15" />
      </div>
      <div className="relative flex min-h-[260px] sm:min-h-[320px] flex-col px-6 sm:px-10 pt-6 pb-7">
        <span className="bracket-label" style={{ color: "rgba(255,255,255,0.8)" }}>
          {badge}
        </span>
        <div className="flex-1" />
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div className="max-w-xl space-y-2">
            <h1 className="font-display text-3xl sm:text-4xl md:text-5xl text-white leading-[1.02]">
              {title}
            </h1>
            <p className="text-sm text-white/75 max-w-md leading-relaxed">
              {subtitle}
            </p>
          </div>
          {action}
        </div>
      </div>
    </section>
  );
}
