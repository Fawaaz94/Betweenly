import { Alert, Linking } from 'react-native';

type OpenExternalUrlOptions = {
  value: string;
  toUrl: (value: string) => string | null;
  missingTitle: string;
  missingMessage: string;
  unavailableTitle: string;
  unavailableMessage: string;
};

export async function openExternalUrl(options: OpenExternalUrlOptions) {
  const url = options.toUrl(options.value);
  if (!url) {
    Alert.alert(options.missingTitle, options.missingMessage);
    return;
  }

  const canOpen = await Linking.canOpenURL(url);
  if (!canOpen) {
    Alert.alert(options.unavailableTitle, options.unavailableMessage);
    return;
  }

  await Linking.openURL(url);
}
