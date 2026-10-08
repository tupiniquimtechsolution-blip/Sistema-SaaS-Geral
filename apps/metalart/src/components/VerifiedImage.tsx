import type { ImgHTMLAttributes } from "react";

/** Não renderiza requests de mídias sem arquivo de origem validado. */
export function VerifiedImage({
  src,
  ...props
}: ImgHTMLAttributes<HTMLImageElement>) {
  if (!src?.trim()) return null;
  return <img {...props} src={src} />;
}
