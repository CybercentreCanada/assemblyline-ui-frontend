//*****************************************************************************************
// Media Query Evaluation
//*****************************************************************************************

export type MediaQueryCondition = {
  minWidth?: number;
  maxWidth?: number;
};

/**
 * @name parseMediaQuery
 * @description Pre-parses a CSS media query string into condition objects for efficient repeated evaluation.
 * Supports patterns like "(min-width:600px)", "(max-width:959px)", and compound queries with "and".
 * Parsing is done once, allowing evaluateMediaQuery to run efficiently on every resize event.
 * @param query - Media query string to parse
 * @returns Array of conditions, or empty array if parsing fails
 */
export function parseMediaQuery(query: string): MediaQueryCondition[] {
  const conditionStrings = query.match(/\([^)]+\)/g);
  if (!conditionStrings) return [];

  return conditionStrings.map(condition => {
    const result: MediaQueryCondition = {};
    const minWidthMatch = condition.match(/min-width:\s*(\d+)px/);
    const maxWidthMatch = condition.match(/max-width:\s*(\d+)px/);

    if (minWidthMatch?.[1]) {
      result.minWidth = parseInt(minWidthMatch[1], 10);
    }
    if (maxWidthMatch?.[1]) {
      result.maxWidth = parseInt(maxWidthMatch[1], 10);
    }

    return result;
  });
}

/**
 * @name evaluateMediaQuery
 * @description Evaluates pre-parsed media query conditions against a given width.
 * All conditions must pass (AND logic). This function is very fast since conditions are pre-parsed.
 * @param conditions - Pre-parsed conditions from parseMediaQuery
 * @param width - Container width in pixels to test against
 * @returns Boolean indicating if the query matches the width
 */
export function evaluateMediaQuery(conditions: MediaQueryCondition[], width: number): boolean {
  return conditions.every(condition => {
    if (condition.minWidth !== undefined && width < condition.minWidth) return false;
    if (condition.maxWidth !== undefined && width > condition.maxWidth) return false;
    return true;
  });
}
