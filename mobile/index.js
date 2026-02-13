/**
 * @format
 */

import { AppRegistry } from 'react-native';
import App from './App';
import { name as appName } from './app.json';

// Polyfill TextDecoder for STOMP/WebSocket parsing in React Native
if (typeof global.TextDecoder === 'undefined') {
	const { TextDecoder } = require('text-encoding');
	// eslint-disable-next-line no-global-assign
	global.TextDecoder = TextDecoder;
}

if (typeof global.TextEncoder === 'undefined') {
	const { TextEncoder } = require('text-encoding');
	// eslint-disable-next-line no-global-assign
	global.TextEncoder = TextEncoder;
}

AppRegistry.registerComponent(appName, () => App);
