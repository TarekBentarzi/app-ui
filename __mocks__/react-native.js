const React = require('react');

module.exports = {
  View: ({ children, ...props }) =>
    React.createElement('div', props, children),
  Text: ({ children, style, ...props }) =>
    React.createElement('span', { ...props, style }, children),
  SafeAreaView: ({ children, style, ...props }) =>
    React.createElement('div', { ...props, style }, children),
  TextInput: ({ onChangeText, style, ...props }) =>
    React.createElement('input', {
      ...props,
      style,
      onChange: (e) => onChangeText && onChangeText(e.target.value)
    }),
  TouchableOpacity: ({ onPress, children, style, ...props }) =>
    React.createElement('button', { ...props, style, onClick: onPress }, children),
  ActivityIndicator: () =>
    React.createElement('div', { 'data-testid': 'activity-indicator' }),
  StyleSheet: {
    create: (styles) => styles,
  },
};
