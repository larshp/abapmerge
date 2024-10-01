export default class Utils {

  public static minstdRandMax = 2147483646;

  public static nextMinstdRandFor(seed: number): number {
    const product = 48271 * seed;
    return product % (Utils.minstdRandMax + 1);
  }

  public static hashCodeOf(input: string): number {
    let hash = 0;

    if (input.length === 0) {
      return hash;
    }

    for (let i = 0; i < input.length; ++i) {
      const char = input.charCodeAt(i);
      /* eslint-disable-next-line no-bitwise */
      hash = ( ( hash << 5 ) - hash ) + char;
      /* eslint-disable-next-line no-bitwise */
      hash = hash & hash;
    }

    if (hash < 0) {
      return hash * -1;
    }

    return hash;
  }

  public static randomStringOfLength(seed: number, requiredLength: number): string {
    const allowedLetters = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";

    let result = "";
    for (let currentLength = 0; currentLength < requiredLength; ++currentLength) {
      seed = Utils.nextMinstdRandFor(seed);
      result += allowedLetters[Math.floor(allowedLetters.length * (seed / Utils.minstdRandMax))];
    }

    return result;
  }
}
