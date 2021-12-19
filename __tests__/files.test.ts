import { readFile } from '../src/files';
import { expect, describe, it, test } from '@jest/globals';

describe('The file reader', () => {
    it('should return the contents of the file that is requested', async () => {
        expect(await readFile('__tests__/files.test.ts')).toContain('The file reader');
    })
})