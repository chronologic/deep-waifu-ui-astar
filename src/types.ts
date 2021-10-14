export interface IMintStatus {
  status: string;
  message: string;
  id?: number;
  tx?: string;
  metadataLink?: string;
  certificateLink?: string;
}

export interface IStripeCheckoutIntent {
  sessionId: string;
  checkoutUrl: string;
}
