export interface ContactRequest {
  name: string;
  email: string;
  phone: string;
  subject?: string;
  message: string;
  propertyId?: string | number | null;
}

export interface ContactSubmissionState {
  success: boolean;
  referenceId?: string;
}
