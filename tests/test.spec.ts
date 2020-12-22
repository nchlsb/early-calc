import { range } from '../src/helpers';
import { expect } from 'chai';
import 'mocha';

describe('First test', () => { 
    it('test', () => { 
      expect(range(2)).to.equal([0, 1]); 
  }); 
});