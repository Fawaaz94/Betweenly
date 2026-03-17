import { useMemo } from 'react';
import { useRouter } from 'expo-router';
import { createDefaultPartnerFormValues } from '../../lib/partner-validations';
import { useAppState } from '../app/app-context';
import { PartnerFormScreen } from './partner-form-screen';

export function AddPartnerScreen() {
  const router = useRouter();
  const { savePartner } = useAppState();
  const initialValues = useMemo(() => createDefaultPartnerFormValues(), []);

  return (
    <PartnerFormScreen
      title="Add Partner"
      initialValues={initialValues}
      submitLabel="Save"
      onSubmit={async (input) => {
        const saved = await savePartner(input);
        if (!saved?.id) return;
        router.replace('/partner/shared');
      }}
    />
  );
}
