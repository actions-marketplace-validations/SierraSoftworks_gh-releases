import { parseFilesList } from '../src/parser';
import { expect, describe, it, test } from '@jest/globals';

describe('The file name parser', () => {
    it('should return an empty list if a null string is provided', () => {
        expect(parseFilesList(null)).toEqual([]);
    })

    it('should return an empty list if no string is provided', () => {
        expect(parseFilesList('')).toEqual([]);
    })

    it('should return a valid list if only one file is provided', () => {
        expect(parseFilesList('foo.txt')).toEqual([{ source: 'foo.txt', target: 'foo.txt' }]);
    })

    it('should return a valid list if a bare newline is present', () => {
        expect(parseFilesList('foo.txt\n\n')).toEqual([{ source: 'foo.txt', target: 'foo.txt' }]);
    })

    it('should return the full list of files if multiple are provided', () => {
        expect(parseFilesList('foo.txt\nbar.txt')).toEqual([{ source: 'foo.txt', target: 'foo.txt' }, { source: 'bar.txt', target: 'bar.txt' }]);
    })

    it("should allow a file's name to be explicitly specified", () => {
        expect(parseFilesList('foo.txt | bar.txt')).toEqual([{ source: 'foo.txt', target: 'bar.txt' }]);
    })
})