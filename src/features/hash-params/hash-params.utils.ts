import type {
  HashParamValue,
  InferHashParamBlueprintFromValue,
  InferHashParamCodecFromBlueprint
} from 'features/hash-params';
import type { Location } from 'react-router';

//*****************************************************************************************
// Hash Param Blueprints
//*****************************************************************************************

/**
 * Factory functions for creating hash parameter blueprints.
 * Provides a simple API for defining which hash fragments a route accepts.
 */
export const HASH_PARAM_BLUEPRINTS = {
  /**
   * String blueprint that accepts any hash fragment string.
   * Returns the provided default value when the hash is missing.
   */
  string: (defaultValue = ''): InferHashParamBlueprintFromValue<string> => ({
    type: '',
    kind: 'string',
    parse: value => (value == null || value === '' ? defaultValue : value),
    stringify: value => {
      if (value == null || value === defaultValue) return '';
      return String(value);
    }
  }),

  /**
   * Enum blueprint that accepts one of several allowed values.
   * Returns the matched value or undefined if the hash doesn't match any allowed value.
   */
  enum: <const Values extends readonly [HashParamValue, ...HashParamValue[]]>(
    values: Values,
    defaultValue?: Values[number]
  ): InferHashParamBlueprintFromValue<Values[number]> => {
    const optionByString = new Map<string, Values[number]>();

    for (const option of values) {
      if (option === '' && option !== defaultValue) {
        throw new TypeError('Empty enum options must be the configured default.');
      }

      const serialized = String(option);
      if (optionByString.has(serialized) && !Object.is(optionByString.get(serialized), option)) {
        throw new TypeError('Enum options must have unique string representations.');
      }
      optionByString.set(serialized, option);
    }

    return {
      type: values[0],
      kind: 'enum',
      options: values,
      parse: value => {
        if (value == null || value === '') return defaultValue;
        for (const candidate of values) {
          if (String(candidate) === value) return candidate;
        }
        return defaultValue;
      },
      stringify: value => {
        if (value == null || value === defaultValue) return '';
        return String(value);
      }
    };
  }
};

/**
 * @name getDefaultHashParamBlueprint
 * @description Returns a safe no-op hash blueprint used as a fallback when no blueprint is provided.
 * @returns A blueprint with empty type, undefined parse result, and empty stringify output.
 */
export const getDefaultHashParamBlueprint = <
  const Value extends HashParamValue = HashParamValue
>(): InferHashParamBlueprintFromValue<Value> => {
  return {
    type: '' as unknown as Value,
    kind: 'string',
    parse: () => undefined,
    stringify: () => ''
  };
};

//*****************************************************************************************
// Create Hash Param Codec
//*****************************************************************************************

/**
 * Creates a codec for parsing and stringifying hash parameters.
 * Returns an object with methods to parse location hash and stringify parameter values.
 */
export const createHashParamCodec = <const Value extends HashParamValue>() => {
  return <const Blueprint extends InferHashParamBlueprintFromValue<Value>>(
    input: (blueprints: typeof HASH_PARAM_BLUEPRINTS) => Blueprint
  ): InferHashParamCodecFromBlueprint<Blueprint> => {
    const blueprint = input(HASH_PARAM_BLUEPRINTS) ?? (getDefaultHashParamBlueprint<Value>() as Blueprint);

    const type = blueprint.type;

    const parse = (location: Location): ReturnType<Blueprint['parse']> => {
      const hash = typeof location?.hash === 'string' ? location.hash : '';
      // Remove leading '#'
      const rawValue = hash.startsWith('#') ? hash.slice(1) : hash;

      // Decode URI component if needed
      let decodedValue: string;
      try {
        decodedValue = rawValue ? decodeURIComponent(rawValue) : '';
      } catch {
        decodedValue = rawValue;
      }

      return blueprint.parse(decodedValue || undefined) as ReturnType<Blueprint['parse']>;
    };

    const stringify = (value: Parameters<Blueprint['stringify']>[0]): string => {
      const stringified = blueprint.stringify(value);
      if (!stringified) return '';

      return `#${encodeURIComponent(stringified)}`;
    };

    return { blueprint, type, parse, stringify };
  };
};
