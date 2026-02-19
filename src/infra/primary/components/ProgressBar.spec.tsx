import React from 'react';
import { render } from '@testing-library/react-native';
import { ProgressBar } from './ProgressBar';

describe('ProgressBar', () => {
    it('should render without crashing', () => {
        const { toJSON } = render(<ProgressBar progress={0.5} />);
        expect(toJSON()).toBeDefined();
    });

    it('should render with progress 0', () => {
        const { toJSON } = render(<ProgressBar progress={0} />);
        expect(toJSON()).toBeDefined();
    });

    it('should render with progress 1', () => {
        const { toJSON } = render(<ProgressBar progress={1} />);
        expect(toJSON()).toBeDefined();
    });

    it('should show text when showText is true', () => {
        const { toJSON } = render(<ProgressBar progress={0.75} showText={true} />);
        const rendered = JSON.stringify(toJSON());
        expect(rendered).toContain('75');
    });

    it('should show custom text', () => {
        const { toJSON } = render(<ProgressBar progress={0.5} showText={true} text="Custom" />);
        const rendered = JSON.stringify(toJSON());
        expect(rendered).toContain('Custom');
    });

    it('should handle progress > 1', () => {
        const { toJSON } = render(<ProgressBar progress={1.5} showText={true} />);
        const rendered = JSON.stringify(toJSON());
        expect(rendered).toContain('100');
    });

    it('should handle negative progress', () => {
        const { toJSON } = render(<ProgressBar progress={-0.5} showText={true} />);
        const rendered = JSON.stringify(toJSON());
        expect(rendered).toContain('0');
    });

    it('should accept custom color', () => {
        const { toJSON } = render(<ProgressBar progress={0.5} color="#ff0000" />);
        expect(toJSON()).toBeDefined();
    });

    it('should accept custom height', () => {
        const { toJSON } = render(<ProgressBar progress={0.5} height={12} />);
        expect(toJSON()).toBeDefined();
    });
});
