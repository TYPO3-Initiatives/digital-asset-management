import { expect } from 'chai';
import FormatterService from '@/services/FormatterService';

describe('FormatterService', () => {
  it('formats mega bytes', () => {
    const testSize = 1024;
    expect(FormatterService.fileSizeAsString(1024)).to.equal('1 MB');
  });
});
