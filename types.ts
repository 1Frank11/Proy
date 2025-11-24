export enum ClaimStatus {
  Normal = 'Normal',
  Fraud = 'Fraude',
}

export interface InsuranceClaim {
  id: string;
  patientName: string;
  providerId: string;
  diagnosisCode: string; // CIE-10 equivalent
  procedureCode: string;
  claimAmount: number;
  date: string;
  status: ClaimStatus;
  riskScore: number; // 0 to 1
  reason?: string;
}

export interface ModelMetrics {
  accuracy: number;
  precision: number;
  recall: number;
  f1Score: number;
  totalSamples: number;
  totalFraud: number;
  totalNormal: number;
}
