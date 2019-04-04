import { expect } from 'chai';
import FormatterService from '@/services/FormatterService';

describe('FormatterService', () => {
  it('formats kilo bytes', () => {
    const testSize = 1000;
    expect(FormatterService.fileSizeAsString(testSize)).to.equal('1 KB');
  });
  it('formats mega bytes', () => {
    const testSize = 1048577;
    expect(FormatterService.fileSizeAsString(testSize)).to.equal('1 MB');
  });
  it('rounds to kilobytes', () => {
    const testSize = 10485;
    expect(FormatterService.fileSizeAsString(testSize)).to.equal('10 KB');
  });
  it('rounds to megabytes', () => {
    const testSize = 2156789;
    expect(FormatterService.fileSizeAsString(testSize)).to.equal('2 MB');
  });
});
