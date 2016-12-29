/* global describe it beforeEach inject expect */

describe('MathUtil', () => {
  let MUtil;

  beforeEach(module('tournamentApp'));

  beforeEach(inject((MathUtil) => {
    MUtil = MathUtil;
  }));

  describe('MathUtil.gcd | Greatest common divisor between two numbers should be calculated correctly', () => {
    it('and should return 0 if both numbers are zero', () => {
      expect(MUtil.gcd(0, 0)).toBe(0);
    });

    it('and should return 1 if both numbers share no factors', () => {
      expect(MUtil.gcd(16, 5)).toBe(1);
    });

    it('and should return 1 if both numbers are prime or coprime', () => {
      expect(MUtil.gcd(2, 3)).toBe(1);
      expect(MUtil.gcd(17, 73)).toBe(1);
    });

    it('and should return the non-zero number if one is zero and the other is not', () => {
      expect(MUtil.gcd(0, 5)).toBe(5);
      expect(MUtil.gcd(5, 0)).toBe(5);
    });

    it('and should return the smallest of the two if that divides evenly into the bigger', () => {
      expect(MUtil.gcd(20, 5)).toBe(5);
      expect(MUtil.gcd(9, 36)).toBe(9);
      expect(MUtil.gcd(81, 9)).toBe(9);
    });

    it('and should return the correct gcd if two numbers share a gcd that is not the smaller of the two', () => {
      expect(MUtil.gcd(26, 16)).toBe(2);
      expect(MUtil.gcd(42, 9)).toBe(3);
    });

    it('and should return the absolute value of the gcd', () => {
      expect(MUtil.gcd(0, -5)).toBe(5);
      expect(MUtil.gcd(-5, 0)).toBe(5);
      expect(MUtil.gcd(-2, 4)).toBe(2);
      expect(MUtil.gcd(-1, 4)).toBe(1);
    });
  });

  describe('MathUtil.gcdArray | Greatest common divisor of an array of numbers should be calculated correctly', () => {
    it('and should throw an error if arr is not provided or is null or is not an array', () => {
      expect(MUtil.gcdArray).toThrow();
      expect(() => {
        MUtil.gcdArray(null);
      }).toThrow();
      expect(() => {
        MUtil.gcdArray('Not an array');
      }).toThrow();
    });

    it('and should throw an error if an empty array is provided', () => {
      expect(() => {
        MUtil.gcdArray([]);
      }).toThrow();
    });

    it('and should return the absolute value of the only number in the array if array is one length 1', () => {
      expect(MUtil.gcdArray([5])).toBe(5);
      expect(MUtil.gcdArray([-5])).toBe(5);
    });

    it('and should return the correct gcd of a given array', () => {
      expect(MUtil.gcdArray([5, 10, 15])).toBe(5);
      expect(MUtil.gcdArray([6, 8, 10])).toBe(2);
      expect(MUtil.gcdArray([-5, 10, 15])).toBe(5);
      expect(MUtil.gcdArray([-3, 10, 16])).toBe(1);
    });
  });
});
