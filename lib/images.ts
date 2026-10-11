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
import begenaKfl from "@/public/images/begena-kfl.webp";
import orthodoxChurch from "@/public/images/orthodox-church.webp";
import begenaGirl from "@/public/images/begena-girl.webp";
import begenaMisc04 from "@/public/images/begena-misc-04.webp";
import lalibelaPriest from "@/public/images/lalibela-priest.webp";
import blessingBegena from "@/public/images/blessing-begena.webp";
import zmarieMshtBegena from "@/public/images/zmarie-msht-begena.webp";

import adminPhoto1 from "@/public/images/admin-photo-1.webp";
import adminPhoto2 from "@/public/images/admin-photo-2.webp";
import adminPhoto3 from "@/public/images/admin-photo-3.webp";
import adminCard1 from "@/public/images/admin-card-1.webp";
import adminCard2 from "@/public/images/admin-card-2.webp";
import adminCard3 from "@/public/images/admin-card-3.webp";
import adminCard4 from "@/public/images/admin-card-4.webp";
import adminCard5 from "@/public/images/admin-card-5.webp";
import adminAncient from "@/public/images/admin-ancient.webp";
import adminCloseup from "@/public/images/admin-closeup.webp";
import adminHeart from "@/public/images/admin-heart.webp";
import adminOrthodox from "@/public/images/admin-orthodox.webp";
import adminTeacher from "@/public/images/admin-teacher.webp";

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
  /** Orthodox church background image. 1400x700. */
  orthodoxChurch: SiteImage;
  /** Begena girl background image. 1400x700. */
  begenaGirl: SiteImage;
  /** Begena misc 04 background image. 1400x700. */
  begenaMisc04: SiteImage;
  /** Lalibela priest background image. 1400x700. */
  lalibelaPriest: SiteImage;
  /** Blessing begena background image. 1400x700. */
  blessingBegena: SiteImage;
  /** Begena sunlight image. */
  begenaSunlight: SiteImage;
  /** Zmarie msht begena hero photo. */
  zmarieHero: SiteImage;
  /** New admin card and modal images */
  adminPhoto1: SiteImage;
  adminPhoto2: SiteImage;
  adminPhoto3: SiteImage;
  adminCard1: SiteImage;
  adminCard2: SiteImage;
  adminCard3: SiteImage;
  adminCard4: SiteImage;
  adminCard5: SiteImage;
  adminAncient: SiteImage;
  adminCloseup: SiteImage;
  adminHeart: SiteImage;
  adminOrthodox: SiteImage;
  adminTeacher: SiteImage;
} = {
  hero: zmarieMshtBegena,
  about: begenaEnsemble,
  mezmurHero: begenaOrnate,
  begenaHistory: begenaDavid,
  scheduleBanner: begenaPerformer,
  scheduleCard: begenaSilhouette,
  noticeCard: begenaInstrument,
  studentsBanner: begenaEnsemble,
  paymentBanner: begenaKfl,
  authPanel: begenaStrings,
  studentProfile: begenaStringsWide,
  orthodoxChurch: orthodoxChurch,
  begenaGirl: begenaGirl,
  begenaMisc04: begenaMisc04,
  lalibelaPriest: lalibelaPriest,
  blessingBegena: blessingBegena,
  begenaSunlight: begenaSunlight,
  zmarieHero: zmarieMshtBegena,
  adminPhoto1: adminPhoto1,
  adminPhoto2: adminPhoto2,
  adminPhoto3: adminPhoto3,
  adminCard1: adminCard1,
  adminCard2: adminCard2,
  adminCard3: adminCard3,
  adminCard4: adminCard4,
  adminCard5: adminCard5,
  adminAncient: adminAncient,
  adminCloseup: adminCloseup,
  adminHeart: adminHeart,
  adminOrthodox: adminOrthodox,
  adminTeacher: adminTeacher,
};

export const adminCardBackgrounds: SiteImage[] = [
  adminCard1,
  adminCard2,
  adminCard3,
  adminCard4,
  adminCard5,
  adminAncient,
  adminHeart,
  adminOrthodox,
  adminTeacher,
  adminPhoto1,
  adminPhoto2,
  adminPhoto3,
  adminCloseup,
];
