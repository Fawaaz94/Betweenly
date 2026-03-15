import { useLocalSearchParams, useRouter } from 'expo-router';
import { GhostButton, ScreenContainer, ScreenTitle } from '../../components/ui/primitives';
import { createPartnerFormValuesFromPartner } from '../../lib/partner-validations';
import { useAppState } from '../app/app-context';
import { PartnerFormScreen } from './partner-form-screen';

export function EditPartnerScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { partners, updatePartner, deletePartner } = useAppState();
  const partner = partners.find((item) => item.id === id);

  if (!partner) {
    return (
      <ScreenContainer>
        <ScreenTitle title="Partner not found" subtitle="This partner was removed or not available." showBackButton />
        <GhostButton label="Back" onPress={() => router.replace('/partner/shared')} />
      </ScreenContainer>
    );
  }

  return (
    <PartnerFormScreen
      title="Edit Partner"
      initialValues={createPartnerFormValuesFromPartner(partner)}
      submitLabel="Save"
      onSubmit={async (input) => {
        await updatePartner(partner.id, input);
        router.replace('/partner/shared');
      }}
      onDelete={async () => {
        await deletePartner(partner.id);
        router.replace('/partner/shared');
      }}
    />
  );
}
