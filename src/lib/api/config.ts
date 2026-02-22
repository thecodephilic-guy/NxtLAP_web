/**
 * API Configuration
 *
 * Centralizes all external API base URLs and routing logic
 * for determining which API service to use per league.
 */

/** TheSportsDB API base URL */
export const SPORTS_DB_BASE_URL =
  "https://www.thesportsdb.com/api/v1/json/3";

/** League ID that should use the alternative (Jolpi) F1 API */
const F1_LEAGUE_ID = "4370";

/**
 * Determines whether a given league should use an alternative API
 * instead of the default TheSportsDB.
 *
 * Currently only Formula 1 (ID: 4370) uses the Jolpi F1 API.
 */
export function shouldUseAlternativeAPI(leagueId: string): boolean {
  return leagueId === F1_LEAGUE_ID;
}
