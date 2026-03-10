import { getSurahNameFr, SURAH_NAMES_FR } from './surahNames';

describe('surahNames', () => {
    describe('getSurahNameFr', () => {
        it('should return the correct name for sourate 1', () => {
            expect(getSurahNameFr(1)).toBe("L'Ouverture");
        });

        it('should return the correct name for sourate 2', () => {
            expect(getSurahNameFr(2)).toBe('La Vache');
        });

        it('should return the correct name for sourate 114', () => {
            expect(getSurahNameFr(114)).toBe('Les Hommes');
        });

        it('should return default name for invalid numero', () => {
            expect(getSurahNameFr(999)).toBe('Sourate 999');
        });

        it('should return default name for numero 0', () => {
            expect(getSurahNameFr(0)).toBe('Sourate 0');
        });
    });

    describe('SURAH_NAMES_FR', () => {
        it('should have 114 sourates', () => {
            const count = Object.keys(SURAH_NAMES_FR).length;
            expect(count).toBe(114);
        });

        it('should have all sourate numbers from 1 to 114', () => {
            for (let i = 1; i <= 114; i++) {
                expect(SURAH_NAMES_FR[i]).toBeDefined();
                expect(typeof SURAH_NAMES_FR[i]).toBe('string');
            }
        });
    });
});
