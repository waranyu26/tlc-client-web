import * as z from 'zod';

// ----------------------------------------------------------------------
// Thai address form schema. Field names mirror `AddressInput`
// (src/api/delivery.api.ts) exactly so form values submit without mapping.
// ----------------------------------------------------------------------

type Translate = (key: string) => string;

export function getAddressSchema(t: Translate) {
  return z.object({
    recipient_name: z.string().min(1, { error: t('address.errors.recipientNameRequired') }),
    phone: z
      .string()
      .min(1, { error: t('address.errors.phoneRequired') })
      .refine((val) => /^(0\d{8,9}|\+66\d{8,9})$/.test(val.replace(/[\s-]/g, '')), {
        error: t('address.errors.phoneInvalid'),
      }),
    line1: z.string().min(1, { error: t('address.errors.line1Required') }),
    line2: z.string(),
    district: z.string().min(1, { error: t('address.errors.districtRequired') }),
    province: z.string().min(1, { error: t('address.errors.provinceRequired') }),
    postal_code: z.string().regex(/^\d{5}$/, { error: t('address.errors.postalCodeInvalid') }),
    is_default: z.boolean(),
  });
}

export type AddressFormValues = z.infer<ReturnType<typeof getAddressSchema>>;

export const defaultAddressValues: AddressFormValues = {
  recipient_name: '',
  phone: '',
  line1: '',
  line2: '',
  district: '',
  province: '',
  postal_code: '',
  is_default: false,
};
