import type { SVGProps } from "react";
import type { AchievementIcon } from "@/config/achievements";

type P = SVGProps<SVGSVGElement> & { size?: number };

function base({ size = 20, ...rest }: P, children: React.ReactNode, filled = false) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill={filled ? "currentColor" : "none"}
      stroke={filled ? "none" : "currentColor"}
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...rest}
    >
      {children}
    </svg>
  );
}

export const IFlame = (p: P) =>
  base(
    p,
    <>
      <path d="M12 2.8c1.1 2.7 5 5 5 9.2a5 5 0 0 1-10 0c0-4.2 3.9-6.5 5-9.2z" />
      <path d="M12 13.2c.9 1 1.5 1.9 1.5 2.9a1.5 1.5 0 0 1-3 0c0-1 .6-1.9 1.5-2.9z" />
    </>
  );

export const IFlameFill = (p: P) =>
  base(p, <path d="M12 2.8c1.1 2.7 5 5 5 9.2a5 5 0 0 1-10 0c0-4.2 3.9-6.5 5-9.2z" />, true);

export const ISpark = (p: P) =>
  base(
    p,
    <path d="M12 3.5l1.7 6 6 1.7-6 1.7-1.7 6-1.7-6-6-1.7 6-1.7z" />
  );

export const ISparkFill = (p: P) =>
  base(p, <path d="M12 3l1.9 6.6L20.5 11.5l-6.6 1.9L12 20l-1.9-6.6L3.5 11.5l6.6-1.9z" />, true);

export const IGem = (p: P) =>
  base(
    p,
    <>
      <path d="M7 4h10l4 5-9 11L3 9z" />
      <path d="M3 9h18M9.5 4 12 9l2.5-5M12 9v11" />
    </>
  );

export const ISword = (p: P) =>
  base(
    p,
    <>
      <path d="M19.5 4.5 9 15" />
      <path d="M15 4.5h4.5V9" />
      <path d="M7 13l4 4-2.5 2.5L4.5 15.5z" />
    </>
  );

export const IScroll = (p: P) =>
  base(
    p,
    <>
      <path d="M7 4h11a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V6a2 2 0 0 0-2-2h3z" />
      <path d="M9.5 9h6M9.5 12.5h6M9.5 16h3.5" />
    </>
  );

export const IShield = (p: P) =>
  base(p, <path d="M12 3l7 2.6v5.1c0 4.6-3 8.2-7 10.3-4-2.1-7-5.7-7-10.3V5.6z" />);

export const IHelm = (p: P) =>
  base(
    p,
    <>
      <path d="M5 13a7 7 0 0 1 14 0v5l-3-1.5-2 1.5h-4l-2-1.5L5 18z" />
      <path d="M9 12.5h6" />
    </>
  );

export const ITrophy = (p: P) =>
  base(
    p,
    <>
      <path d="M8 4h8v6a4 4 0 0 1-8 0z" />
      <path d="M8 5.5H5a3 3 0 0 0 3 4M16 5.5h3a3 3 0 0 1-3 4M12 14v3.5M8.5 20.5h7M10 17.5h4" />
    </>
  );

export const ISun = (p: P) =>
  base(
    p,
    <>
      <circle cx="12" cy="12" r="3.6" />
      <path d="M12 3.5v2M12 18.5v2M3.5 12h2M18.5 12h2M6 6l1.4 1.4M16.6 16.6 18 18M18 6l-1.4 1.4M7.4 16.6 6 18" />
    </>
  );

export const IMoon = (p: P) =>
  base(p, <path d="M20 13.5A8 8 0 0 1 10.5 4 8 8 0 1 0 20 13.5z" />);

export const ICheck = (p: P) => base(p, <path d="M5 12.5l4.5 4.5L19 7.5" />);

export const IPlus = (p: P) => base(p, <path d="M12 5v14M5 12h14" />);

export const IX = (p: P) => base(p, <path d="M6 6l12 12M18 6 6 18" />);

export const ITrash = (p: P) =>
  base(
    p,
    <>
      <path d="M4.5 6.5h15M9.5 3.5h5M6.5 6.5l1 13a1.5 1.5 0 0 0 1.5 1.4h6a1.5 1.5 0 0 0 1.5-1.4l1-13" />
      <path d="M10 10.5v6M14 10.5v6" />
    </>
  );

export const IQuill = (p: P) =>
  base(
    p,
    <>
      <path d="M20 4c-6 1-10.5 4-13 9l-2 7 7-2c5-2.5 8-7 9-13z" />
      <path d="M7.5 16.5 15 9" />
    </>
  );

export const IClock = (p: P) =>
  base(
    p,
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 7.5V12l3 2" />
    </>
  );

export const ICalendar = (p: P) =>
  base(
    p,
    <>
      <rect x="4" y="5" width="16" height="15" rx="2.5" />
      <path d="M4 9.5h16M8.5 3.5v3M15.5 3.5v3" />
    </>
  );

export const IRepeat = (p: P) =>
  base(
    p,
    <>
      <path d="M4 12a6 6 0 0 1 6-6h9" />
      <path d="M16.5 3.5 19 6l-2.5 2.5" />
      <path d="M20 12a6 6 0 0 1-6 6H5" />
      <path d="M7.5 20.5 5 18l2.5-2.5" />
    </>
  );

export const IGear = (p: P) =>
  base(
    p,
    <>
      <circle cx="12" cy="12" r="3" />
      <path d="M12 3.5v2.2M12 18.3v2.2M3.5 12h2.2M18.3 12h2.2M6 6l1.6 1.6M16.4 16.4 18 18M18 6l-1.6 1.6M7.6 16.4 6 18" />
    </>
  );

export const IChart = (p: P) =>
  base(p, <path d="M5 20V10M12 20V4M19 20v-8M3.5 20h17" />);

export const IUser = (p: P) =>
  base(
    p,
    <>
      <circle cx="12" cy="8" r="4" />
      <path d="M4.5 20a7.5 7.5 0 0 1 15 0" />
    </>
  );

export const IMap = (p: P) =>
  base(
    p,
    <>
      <path d="M9 4 4 6v14l5-2 6 2 5-2V4l-5 2z" />
      <path d="M9 4v14M15 6v14" />
    </>
  );

export const IDownload = (p: P) =>
  base(p, <path d="M12 4v10M7.5 10.5 12 15l4.5-4.5M5 19.5h14" />);

export const IUpload = (p: P) =>
  base(p, <path d="M12 14V4M7.5 8.5 12 4l4.5 4.5M5 19.5h14" />);

export const ILock = (p: P) =>
  base(
    p,
    <>
      <rect x="5.5" y="10.5" width="13" height="9.5" rx="2" />
      <path d="M8.5 10.5v-3a3.5 3.5 0 0 1 7 0v3" />
    </>
  );

export const IChevronDown = (p: P) => base(p, <path d="M6 9.5l6 6 6-6" />);
export const IChevronRight = (p: P) => base(p, <path d="M9.5 6l6 6-6 6" />);

export const IHome = (p: P) =>
  base(
    p,
    <>
      <path d="M4 11.5 12 4l8 7.5" />
      <path d="M6.5 10v9.5h11V10" />
      <path d="M10.5 19.5v-5h3v5" />
    </>
  );

export const ISparkles = (p: P) =>
  base(
    p,
    <>
      <path d="M12 5l1.4 4.1L17.5 10.5l-4.1 1.4L12 16l-1.4-4.1L6.5 10.5l4.1-1.4z" />
      <path d="M18.5 15.5l.8 2.2 2.2.8-2.2.8-.8 2.2-.8-2.2-2.2-.8 2.2-.8z" />
    </>
  );

export const IMinus = (p: P) => base(p, <path d="M6 12h12" />);

/** Botanical sprig — the "grown" mark used instead of mechanical checkmarks. */
export const ISprig = (p: P) =>
  base(
    { fill: "currentColor", stroke: "none", ...p },
    <>
      <path d="M11.2 21.5c.2-3.9.5-7.4 1.2-10.9l1.5.3c-.7 3.4-1 6.9-1.2 10.7z" />
      <path d="M12.6 13.4c-3.9.4-6.6-1.5-7.8-5.4 4-.3 6.8 1.5 7.8 5.4z" />
      <path d="M13 9.8c3.8.3 6.4-1.7 7.4-5.6-3.9-.2-6.6 1.7-7.4 5.6z" />
    </>
  );

export const achievementIcon = (icon: AchievementIcon, size = 22) => {
  const map: Record<AchievementIcon, (p: P) => React.ReactElement> = {
    spark: ISpark,
    flame: IFlame,
    sword: ISword,
    scroll: IScroll,
    trophy: ITrophy,
    moon: IMoon,
    sun: ISun,
    gem: IGem,
    shield: IShield,
    helm: IHelm,
  };
  const Cmp = map[icon];
  return <Cmp size={size} />;
};
