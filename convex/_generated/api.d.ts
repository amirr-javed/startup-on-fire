/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as booths from "../booths.js";
import type * as gameActions from "../gameActions.js";
import type * as gameStore from "../gameStore.js";
import type * as health from "../health.js";
import type * as lib_game from "../lib/game.js";
import type * as lib_security from "../lib/security.js";
import type * as lib_world from "../lib/world.js";
import type * as worldActions from "../worldActions.js";
import type * as worldStore from "../worldStore.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  booths: typeof booths;
  gameActions: typeof gameActions;
  gameStore: typeof gameStore;
  health: typeof health;
  "lib/game": typeof lib_game;
  "lib/security": typeof lib_security;
  "lib/world": typeof lib_world;
  worldActions: typeof worldActions;
  worldStore: typeof worldStore;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
