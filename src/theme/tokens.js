import { useColorScheme } from 'react-native';

// Contrast (WCAG) checked per pair: every text colour is at least 4.5:1 on its surface.
const light = {
  bg: '#F7F6F0', surface: '#FFFFFF', surface2: '#EEEDE3', edge: '#E3E1D5', separator: '#ECEAE0',
  label: '#23241C', secondary: '#5F6156', placeholder: '#6F7166',
  accent: '#555C2C', onAccent: '#FFFFFF', accentTint: '#E9EBD5',
  success: '#2A7044', successTint: '#E3F1E6', danger: '#B03A2A', dangerTint: '#F9E8E4',
  puzzle: '#555C2C', puzzleTint: '#E9EBD5', challenge: '#94570F', challengeTint: '#F6E8D2', paw: '#EAD8BA', scrim: 'rgba(25,26,15,0.42)',
};
const dark = {
  bg: '#13140E', surface: '#1D1E17', surface2: '#2A2B21', edge: '#32332A', separator: '#2B2C23',
  label: '#F4F3EA', secondary: '#B3B4A5', placeholder: '#95978B',
  accent: '#C4CD80', onAccent: '#1D1F0E', accentTint: '#2F331A',
  success: '#7DD098', successTint: '#183223', danger: '#FF9382', dangerTint: '#3B1E19',
  puzzle: '#C4CD80', puzzleTint: '#2F331A', challenge: '#E9B56C', challengeTint: '#392B16', paw: '#EAD8BA', scrim: 'rgba(0,0,0,0.6)',
};

export const useColors = () => (useColorScheme() === 'dark' ? dark : light);

export const type = {
  largeTitle: { fontSize: 32, lineHeight: 39, fontWeight: '700', letterSpacing: -0.6 },
  title: { fontSize: 26, lineHeight: 32, fontWeight: '700', letterSpacing: -0.4 },
  title2: { fontSize: 20, lineHeight: 26, fontWeight: '700', letterSpacing: -0.2 },
  headline: { fontSize: 17, lineHeight: 24, fontWeight: '600' },
  body: { fontSize: 17, lineHeight: 25 },
  subhead: { fontSize: 15, lineHeight: 21 },
  footnote: { fontSize: 13, lineHeight: 18 },
  caption: { fontSize: 12, lineHeight: 16, fontWeight: '500' },
};
