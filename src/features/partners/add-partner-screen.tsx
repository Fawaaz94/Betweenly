import { useRouter } from 'expo-router';
import { createDefaultPartnerFormValues } from '../../lib/partner-validations';
import { useAppState } from '../app/app-context';
import { PartnerFormScreen } from './partner-form-screen';

export function AddPartnerScreen() {
  const router = useRouter();
  const { savePartner } = useAppState();

  return (
    <PartnerFormScreen
      title="Add Partner"
      initialValues={createDefaultPartnerFormValues()}
      submitLabel="Save"
      onSubmit={async (input) => {
        const saved = await savePartner(input);
        router.replace({ pathname: '/partner/[id]', params: { id: saved.id } });
      }}
    />
  );
}
