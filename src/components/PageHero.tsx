import { Badge } from "@/components/ui/badge";

interface PageHeroProps {
  image: string;
  badge: string;
  title: string;
  subtitle: string;
  action?: React.ReactNode;
}

export function PageHero({ image, badge, title, subtitle, action }: PageHeroProps) {
  return (
    <section className="relative overflow-hidden rounded-2xl">
      <div className="absolute inset-0">
        <img
          src={image}
          alt={title}
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-black/10" />
      </div>
      <div className="relative flex min-h-[180px] sm:min-h-[220px] flex-col justify-end p-6 sm:p-8">
        <Badge className="mb-2 w-fit bg-white/20 text-white backdrop-blur-sm border-white/30 text-xs uppercase tracking-wider">
          {badge}
        </Badge>
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white font-heading">
              {title}
            </h1>
            <p className="mt-1 text-sm text-white/70 max-w-lg">
              {subtitle}
            </p>
          </div>
          {action}
        </div>
      </div>
    </section>
  );
}
