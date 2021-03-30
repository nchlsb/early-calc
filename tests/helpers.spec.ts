import { expect } from 'chai';
import 'mocha';
import { range } from '../src/helpers'
import { slope, point, twoPointForm } from '../src/graphablefunctions'

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
    expect(range(n).reduce((sum, current) => sum + current)).to.equal((m * (m + 1)) / 2);
  });

  it('For all n, range(n + 1) === range(n) ++ [n]', () => {
    for (let i = 0; i < 1000; i++) {
      expect(range(i + 1)).to.deep.equal(range(i).concat([i]))
    }
  });

});

describe("slope", () => {
  it("Should work for a postive slope", () => {
    expect(slope(point(0, 0), point(1, 1))).to.equal(1);
  });

  it("Should work for a negative negative", () => {
    expect(slope(point(0, 0), point(1, -1))).to.equal(-1);
    expect(slope(point(0, 0), point(1, -1))).to.equal(-1);
  });

  it("Should work for a slope of zero", () => {
    expect(slope(point(0, 0), point(1, 0))).to.equal(0);
  });

  it("Should not work for (return NaN) if it takes the same point twice", () => {
    expect(isNaN(slope(point(1, 1), point(1, 1)))).to.equal(true);
  });

  it("Should not work for (return Infinity) if it takes the two points witht the same x value but differnt y value.", () => {
    expect(isFinite(slope(point(1, 1), point(1, 1)))).to.equal(false);
  });
});

describe("twoPointForm", () => {
  it("Should work for a postive slope", () => {
    expect(twoPointForm(point(0, 0), point(1, 1))(2)).to.equal(2);
  });

  it("Should work for a negative negative", () => {
    expect(twoPointForm(point(0, 0), point(1, -1))(2)).to.equal(-2);
  });

  it("Should work for a slope of zero", () => {
    expect(twoPointForm(point(0, 0), point(1, 0))(2)).to.equal(0);
  });

  it("Should not work for (return NaN) if it takes the same point twice", () => {
    expect(isNaN(twoPointForm(point(1, 1), point(1, 1))(2))).to.equal(true);
  });

  it("Should not work for (return Infinity) if it takes the two points witht the same x value but differnt y value.", () => {
    expect(isFinite(twoPointForm(point(1, 1), point(1, 1))(2))).to.equal(false);
  });
});

describe("point", () => {
  it("Should create a point with the given x and y values", () => {
    expect(point(0, 0)).to.deep.equal({x: 0, y: 0});
  });
});