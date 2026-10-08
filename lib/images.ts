import type { StaticImageData } from "next/image";

import begenaSunlight from "@/public/images/begena-sunlight.webp";
import begenaEnsemble from "@/public/images/begena-ensemble.webp";
import begenaPerformer from "@/public/images/begena-performer.webp";
import begenaOrnate from "@/public/images/begena-ornate.webp";
import begenaDavid from "@/public/images/begena-david.webp";
import begenaStrings from "@/public/images/begena-strings.webp";
import begenaStringsWide from "@/public/images/begena-strings-wide.webp";
import begenaSilhouette from "@/public/images/begena-silhouette.webp";
import begenaInstrument from "@/public/images/begena-instrument.webp";

/**
 * Central registry for site imagery.
 *
 * To swap an image:
 *   1. Add the source photo to `public/`.
 *   2. Add a job to `scripts/build-images.mjs` and run `npm run images`.
 *   3. Point the slot below at the generated file.
 *
 * Slots left as `undefined` render a themed fallback instead of a broken image,
 * so the site stays presentable until the artwork arrives.
 *
 * Size budgets: hero <= 200KB, section photos <= 120KB, panels <= 150KB.
 */
export type SiteImage = StaticImageData | undefined;

export const siteImages: {
  /** Home page banner. 1600x900. */
  hero: SiteImage;
  /** Home "about" section. 1200x675. */
  about: SiteImage;
  /** Mezmur list banner. 1600x900. */
  mezmurHero: SiteImage;
  /** Mezmur list history section. 1200x675. */
  begenaHistory: SiteImage;
  /** Schedule page banner. 1200x675. */
  scheduleBanner: SiteImage;
  /** Schedule list card. 1200x900. */
  scheduleCard: SiteImage;
  /** Schedule notice card. 1200x600. */
  noticeCard: SiteImage;
  /** Students page banner. 1200x675. */
  studentsBanner: SiteImage;
  /** Payment page banner. 1600x900. */
  paymentBanner: SiteImage;
  /** Login background, dimmed behind the form card. 1000x1400. */
  authPanel: SiteImage;
  /** Student dashboard profile card. 1400x500. */
  studentProfile: SiteImage;
} = {
  hero: begenaSunlight,
  about: begenaEnsemble,
  mezmurHero: begenaOrnate,
  begenaHistory: begenaDavid,
  scheduleBanner: begenaPerformer,
  scheduleCard: begenaSilhouette,
  noticeCard: begenaInstrument,
  studentsBanner: begenaEnsemble,
  paymentBanner: begenaOrnate,
  authPanel: begenaStrings,
  studentProfile: begenaStringsWide,
};
