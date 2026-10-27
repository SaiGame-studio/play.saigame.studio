/* eslint-disable @next/next/no-img-element */

// Same SVG source the Studio site's react-country-flag (svg mode) renders.
const FLAG_CDN = "https://cdn.jsdelivr.net/gh/lipis/flag-icons/flags/4x3/";

export function CountryFlag({ id, countryCode, title }: { id: string; countryCode: string; title: string }) {
  return (
    <img
      id={id}
      src={`${FLAG_CDN}${countryCode.toLowerCase()}.svg`}
      alt={title}
      title={title}
      className="inline-block h-[1.25em] w-[1.25em] shrink-0 object-contain align-middle"
    />
  );
}
