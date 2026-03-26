import { Chip, NoteText, PrimaryButton, Row, ScreenContainer, ScreenTitle } from '../../components/ui/primitives';
import { useAppState } from '../app/app-context';

export function SettingsScreen() {
  const { themeMode, setThemeMode, toggleThemeMode } = useAppState();

  return (
    <ScreenContainer>
      <ScreenTitle title="Settings" subtitle="App behavior and appearance" showBackButton />
      <Row>
        <Chip label="Light mode" active={themeMode === 'light'} onPress={() => void setThemeMode('light')} />
        <Chip label="Dark mode" active={themeMode === 'dark'} onPress={() => void setThemeMode('dark')} />
      </Row>

      <PrimaryButton
        label={themeMode === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
        onPress={() => void toggleThemeMode()}
      />

      <NoteText>
        Theme changes apply across all screens and are saved locally on this device.
      </NoteText>
    </ScreenContainer>
  );
}
