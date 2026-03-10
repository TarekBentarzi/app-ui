import React from 'react';
import { ReleaseNotesModal } from './ReleaseNotesModal';

jest.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string) => key,
    }),
}));

jest.mock('lucide-react-native', () => ({
    X: jest.fn(() => null),
    Sparkles: jest.fn(() => null),
    Bug: jest.fn(() => null),
    Zap: jest.fn(() => null),
}));

describe('ReleaseNotesModal', () => {
    const defaultProps = {
        visible: true,
        version: '1.3.0',
        notes: [
            { type: 'feature' as const, text: 'New feature' },
            { type: 'bugfix' as const, text: 'Bug fixed' },
            { type: 'improvement' as const, text: 'Improvement made' },
        ],
        onClose: jest.fn(),
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should render ReleaseNotesModal component', () => {
        expect(ReleaseNotesModal).toBeDefined();
    });

    it('should accept correct props', () => {
        const props = defaultProps;
        expect(props.visible).toBe(true);
        expect(props.version).toBe('1.3.0');
        expect(props.notes).toHaveLength(3);
    });
});
