import type { Method } from 'components/models/utils/request';
import type { Request } from 'components/routes/development/api/development_api.models';
import type { PossibleColor } from 'helpers/colors';

export const METHOD_COLOR_MAP: Record<Method, PossibleColor> = {
  GET: 'success'
};

export const parseRequest = (input: string): Request => {
  // Initialize the output object with default values
  let result: Request = {
    comment: null,
    url: null,
    method: null,
    body: null,
    response: null,
    error: null
  };

  // Extract the comment block (e.g., /** comment */) from the input
  result.comment = input.match(/\/\*[\s\S]*?\*\//)?.[0] || null;

  try {
    // Remove the comment from the input and parse the remaining JSON string
    const jsonString = input.replace(result.comment || '', '').trim();
    const parsedData = JSON.parse(jsonString) as Partial<Request>;

    // Update the result object with parsed data, falling back to defaults
    result = {
      ...result,
      url: parsedData.url || null,
      method: parsedData.method || null,
      body: parsedData.body || null,
      response: parsedData.response || null,
      error: null // Ensure error is cleared in case of successful parsing
    };
  } catch (error: unknown) {
    // Capture any parsing errors and store them in the result
    result.error = error instanceof Error ? error : new Error('Unknown parsing error');
  }

  return result; // Return the processed request object
};

export const stringifyRequest = ({
  comment = '',
  url = '',
  method = 'GET',
  body = null,
  response = null
}: Request): string => {
  // Escape dynamic segments in the URL and format with placeholders
  const formattedUrl = url.replaceAll(/<[^>]*>/g, (match, index) => `\${${index}:${match}}`);

  // Format the body: null or stringified JSON
  const formattedBody =
    body === null ? 'null' : typeof body === 'string' ? `"${body}"` : JSON.stringify(body, null, '\t');

  // Format the response: null or pretty-printed JSON
  const formattedResponse = response ? JSON.stringify(response, null, '\t') : 'null';

  // Construct the request string in a clear, formatted way
  return [
    comment, // Add the comment block at the beginning
    '{',
    `\t"url": "${formattedUrl}",`,
    `\t"method": "${method}",`,
    `\t"body": ${formattedBody},`,
    `\t"response": ${formattedResponse}`,
    '}'
  ].join('\n'); // Join all lines with a newline character
};
