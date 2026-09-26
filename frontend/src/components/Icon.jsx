const paths = {
  grid: ["M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h6v6h-6z"],
  box: ["m4 7 8-4 8 4-8 4z", "M4 7v10l8 4 8-4V7M12 11v10"],
  inbox: ["M4 4h16v13H4z", "M4 13h5l2 3h2l2-3h5"],
  truck: ["M3 6h11v11H3zM14 10h4l3 3v4h-7z", "M7 20a2 2 0 1 0 0-4 2 2 0 0 0 0 4ZM18 20a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z"],
  transfer: ["M4 7h14M15 4l3 3-3 3M20 17H6M9 14l-3 3 3 3"],
  sliders: ["M4 7h10M18 7h2M4 17h2M10 17h10", "M14 4h4v6h-4zM6 14h4v6H6z"],
  ledger: ["M5 3h14v18H5zM9 3v18M12 8h4M12 12h4M12 16h4"],
  plus: ["M12 5v14M5 12h14"],
  scan: ["M8 4H4v4M16 4h4v4M20 16v4h-4M8 20H4v-4M8 12h8"],
  menu: ["M4 7h16M4 12h16M4 17h16"],
  bell: ["M6 16h12l-1.5-2v-4a4.5 4.5 0 0 0-9 0v4zM10 19h4"],
  more: ["M5 12h.01M12 12h.01M19 12h.01"],
  package: ["M4 8h16v12H4zM8 4h8l4 4H4zM9 12h6"],
  alert: ["M12 3 2.8 20h18.4zM12 9v5M12 17h.01"],
  receipt: ["M5 3h14v18l-3-2-2 2-2-2-2 2-2-2-3 2zM9 8h6M9 12h6"],
  arrows: ["M7 7h11l-3-3M18 7l-3 3M17 17H6l3 3M6 17l3-3"],
  trend: ["M4 17 9 12l4 3 7-9M15 6h5v5"],
  search: ["M11 18a7 7 0 1 1 0-14 7 7 0 0 1 0 14ZM16 16l5 5"],
  chevron: ["m9 6 6 6-6 6"],
  close: ["M6 6l12 12M18 6 6 18"],
  arrowRight: ["M5 12h14M14 7l5 5-5 5"],
  map: ["M4 6l5-3 6 3 5-3v15l-5 3-6-3-5 3zM9 3v15M15 6v15"],
  check: ["m5 12 4 4L19 6"],
  clock: ["M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18ZM12 7v5l3 2"],
};

export default function Icon({ name, size = 20, className = "" }) {
  const iconPaths = paths[name] || paths.box;
  return (
    <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      {iconPaths.map((path, index) => (
        <path key={index} d={path} stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      ))}
    </svg>
  );
}
