/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";
import type * as admissionRequirements from "../admissionRequirements.js";
import type * as alternativeAdmissions from "../alternativeAdmissions.js";
import type * as alumni from "../alumni.js";
import type * as contactUs from "../contactUs.js";
import type * as courses from "../courses.js";
import type * as fees from "../fees.js";
import type * as getAllContent from "../getAllContent.js";
import type * as gpc from "../gpc.js";
import type * as hero from "../hero.js";
import type * as howToApply from "../howToApply.js";
import type * as materials from "../materials.js";
import type * as mission from "../mission.js";
import type * as mutations from "../mutations.js";
import type * as news from "../news.js";
import type * as programs from "../programs.js";
import type * as requirements from "../requirements.js";
import type * as staff from "../staff.js";
import type * as students from "../students.js";
import type * as vision from "../vision.js";

/**
 * A utility for referencing Convex functions in your app's API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
declare const fullApi: ApiFromModules<{
  admissionRequirements: typeof admissionRequirements;
  alternativeAdmissions: typeof alternativeAdmissions;
  alumni: typeof alumni;
  contactUs: typeof contactUs;
  courses: typeof courses;
  fees: typeof fees;
  getAllContent: typeof getAllContent;
  gpc: typeof gpc;
  hero: typeof hero;
  howToApply: typeof howToApply;
  materials: typeof materials;
  mission: typeof mission;
  mutations: typeof mutations;
  news: typeof news;
  programs: typeof programs;
  requirements: typeof requirements;
  staff: typeof staff;
  students: typeof students;
  vision: typeof vision;
}>;
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;
