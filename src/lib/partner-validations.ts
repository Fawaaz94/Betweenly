import type { CreatePartnerInput, Partner } from '../types/models';

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

export type PartnerFormValues = {
  name: string;
  birthday: string;
  nationality: string;
  instagram: string;
  notes: string;
  phoneNumber: string;
  avatarUri: string | null;
};

export type PartnerValidationIssue = {
  field: keyof PartnerFormValues;
  message: string;
};

export type PartnerValidationResult =
  | { success: true; data: CreatePartnerInput }
  | { success: false; issues: PartnerValidationIssue[] };

function cleanText(value: string) {
  return value.trim();
}

function normalizeInstagram(value: string) {
  const cleaned = cleanText(value).replace(/^@+/, '');
  if (!cleaned) return '';
  return `@${cleaned}`;
}

export function createDefaultPartnerFormValues(): PartnerFormValues {
  return {
    name: '',
    birthday: '',
    nationality: '',
    instagram: '',
    notes: '',
    phoneNumber: '',
    avatarUri: null,
  };
}

export function createPartnerFormValuesFromPartner(partner: Partner): PartnerFormValues {
  return {
    name: partner.name,
    birthday: partner.birthday ?? '',
    nationality: partner.nationality ?? '',
    instagram: partner.instagram,
    notes: partner.notes,
    phoneNumber: partner.phoneNumber,
    avatarUri: partner.avatarUri,
  };
}

export function validatePartnerForm(values: PartnerFormValues): PartnerValidationResult {
  const issues: PartnerValidationIssue[] = [];
  const name = cleanText(values.name);
  const birthday = cleanText(values.birthday);
  const nationality = cleanText(values.nationality).toUpperCase();

  if (!name) {
    issues.push({ field: 'name', message: 'Name is required.' });
  }

  if (birthday && !DATE_PATTERN.test(birthday)) {
    issues.push({ field: 'birthday', message: 'Birthday must be in YYYY-MM-DD format.' });
  }

  if (issues.length > 0) {
    return { success: false, issues };
  }

  return {
    success: true,
    data: {
      name,
      birthday: birthday || null,
      nationality,
      instagram: normalizeInstagram(values.instagram),
      notes: cleanText(values.notes),
      phoneNumber: cleanText(values.phoneNumber),
      avatarUri: values.avatarUri,
    },
  };
}
