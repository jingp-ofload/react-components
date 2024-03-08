import { deepFreeze } from "./deepFreeze"

describe('deepFreeze', () => {
    it('should not be able to modify deep frozen object', () => {
        const obj = {
            title: 'Domain driven design',
            author: {
                name: 'Eric evans',
                otherTitles: ['Domain driven design reference', 'Pattern summaries']
            }
        }

        const frozen = deepFreeze(obj);

        expect(() => {
            frozen.title = 'Some other title';
        }).toThrowError(TypeError);

        expect(() => {
            frozen.author.name = 'Not eric evans';
        }).toThrowError(TypeError);

        expect(() => {
            frozen.author.otherTitles.push('ddd');
        }).toThrowError(TypeError);
    })
})
