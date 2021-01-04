import { range } from '../src/helpers';
import { expect } from 'chai';
import 'mocha';

describe("Range", () => {
  it("Should have length equal to the value of it's argument", () => {
    expect(range(10)).to.have.length(10);
  });

  it("Should a last element equal to the value of it's argument minus one", () => {
    const argument = 10;
    const result = range(argument);
    expect(result[result.length - 1]).to.equal(argument - 1);
  });

  it("Should have elelments that sum to nth triangluar number where n is the arugment - 1", () => {
    const n = 10;
    const m = n - 1
    expect(range(n).reduce((sum, current) => sum + current)).to.equal((m * (m +1)) / 2);
  });

  it('For all n, range(n + 1) === range(n) ++ [n]', () => {
    for (let i = 0; i < 1000; i++) {
      expect(range(i + 1)).to.deep.equal(range(i).concat([i]))
    }
  });

});