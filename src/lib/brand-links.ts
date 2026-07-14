export type ByPupilaSocialPlatform = "x" | "youtube" | "behance" | "instagram" | "website";

export const BY_PUPILA_SOCIAL_LINKS: ReadonlyArray<{
  platform: ByPupilaSocialPlatform;
  href: string;
}> = [
  { platform: "x", href: "https://x.com/BYPUPILA" },
  { platform: "youtube", href: "https://www.youtube.com/@ByPupila" },
  { platform: "behance", href: "https://www.behance.net/bypupila" },
  { platform: "instagram", href: "https://www.instagram.com/bypupila/" },
  { platform: "website", href: "https://bypupila.com/" },
];
