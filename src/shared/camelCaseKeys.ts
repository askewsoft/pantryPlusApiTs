/* Based on https://github.com/sindresorhus/camelcase-keys
   without the requirements of an ESM module
*/

const UPPERCASE = /[\p{Lu}]/u;
const LOWERCASE = /[\p{Ll}]/u;
const LEADING_CAPITAL = /^[\p{Lu}](?![\p{Lu}])/gu;
const IDENTIFIER = /([\p{Alpha}\p{N}_]|$)/u;
const SEPARATORS = /[_.\- ]+/;

const LEADING_SEPARATORS = new RegExp('^' + SEPARATORS.source);
const SEPARATORS_AND_IDENTIFIER = new RegExp(SEPARATORS.source + IDENTIFIER.source, 'gu');
const NUMBERS_AND_IDENTIFIER = new RegExp('\\d+' + IDENTIFIER.source, 'gu');

const preserveCamelCase = (string: string, toLowerCase: (s: string) => string, toUpperCase: (s: string) => string, preserveConsecutiveUppercase: boolean) => {
	let isLastCharLower = false;
	let isLastCharUpper = false;
	let isLastLastCharUpper = false;
	let isLastLastCharPreserved = false;

	for (let index = 0; index < string.length; index++) {
		const character = string[index];
		isLastLastCharPreserved = index > 2 ? string[index - 3] === '-' : true;

		if (isLastCharLower && UPPERCASE.test(character)) {
			string = string.slice(0, index) + '-' + string.slice(index);
			isLastCharLower = false;
			isLastLastCharUpper = isLastCharUpper;
			isLastCharUpper = true;
			index++;
		} else if (isLastCharUpper && isLastLastCharUpper && LOWERCASE.test(character) && (!isLastLastCharPreserved || preserveConsecutiveUppercase)) {
			string = string.slice(0, index - 1) + '-' + string.slice(index - 1);
			isLastLastCharUpper = isLastCharUpper;
			isLastCharUpper = false;
			isLastCharLower = true;
		} else {
			isLastCharLower = toLowerCase(character) === character && toUpperCase(character) !== character;
			isLastLastCharUpper = isLastCharUpper;
			isLastCharUpper = toUpperCase(character) === character && toLowerCase(character) !== character;
		}
	}

	return string;
};

const preserveConsecutiveUppercase = (input: string, toLowerCase: (s: string) => string) => {
	LEADING_CAPITAL.lastIndex = 0;

	return input.replaceAll(LEADING_CAPITAL, (match: string) => toLowerCase(match));
};

const postProcess = (input: string, toUpperCase: (s: string) => string) => {
	SEPARATORS_AND_IDENTIFIER.lastIndex = 0;
	NUMBERS_AND_IDENTIFIER.lastIndex = 0;

	return input
		.replaceAll(NUMBERS_AND_IDENTIFIER, (match: string, pattern: string, offset: number) => ['_', '-'].includes(input.charAt(offset + match.length)) ? match : toUpperCase(match))
		.replaceAll(SEPARATORS_AND_IDENTIFIER, (_, identifier: string) => toUpperCase(identifier));
};

function camelCase(input: string, options?: any) {
	options = {
		pascalCase: false,
		preserveConsecutiveUppercase: false,
		...options,
	};

    input = input.trim();

	if (input.length === 0) {
		return '';
	}

	const toLowerCase = options.locale === false
		? (string: string) => string.toLowerCase()
		: (string: string) => string.toLocaleLowerCase(options.locale);

	const toUpperCase = options.locale === false
		? (string: string) => string.toUpperCase()
		: (string: string) => string.toLocaleUpperCase(options.locale);

	if (input.length === 1) {
		if (SEPARATORS.test(input)) {
			return '';
		}

		return options.pascalCase ? toUpperCase(input) : toLowerCase(input);
	}

	const hasUpperCase = input !== toLowerCase(input);

	if (hasUpperCase) {
		input = preserveCamelCase(input, toLowerCase, toUpperCase, options.preserveConsecutiveUppercase);
	}

	input = input.replace(LEADING_SEPARATORS, '');
	input = options.preserveConsecutiveUppercase ? preserveConsecutiveUppercase(input, toLowerCase) : toLowerCase(input);

	if (options.pascalCase) {
		input = toUpperCase(input.charAt(0)) + input.slice(1);
	}

	return postProcess(input, toUpperCase);
}

export const snakeToCamel = (obj: any): any => {
  if (Array.isArray(obj)) return obj.map(snakeToCamel);

  if (typeof obj !== 'object' || obj === null) return obj;

  if (obj instanceof Date) return obj;

  let newObj: any = {};
  for (const key in obj) {
    const newKey = camelCase(key);
    newObj[newKey] = snakeToCamel(obj[key]);
  }
  return newObj;
};