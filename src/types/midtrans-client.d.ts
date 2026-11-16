declare module 'midtrans-client' {
  interface SnapConfig {
    isProduction: boolean;
    serverKey: string;
    clientKey: string;
  }

  interface SnapTransactionParameter {
    transaction_details: {
      order_id: string;
      gross_amount: number;
    };
    credit_card?: { secure: boolean };
    enabled_payments?: string[];
    expiry?: { duration: number; unit: string };
    customer_details?: {
      first_name?: string;
      last_name?: string;
      email?: string;
      phone?: string;
    };
    item_details?: Array<{
      id: string;
      price: number;
      quantity: number;
      name: string;
    }>;
  }

  interface SnapTransactionResponse {
    token: string;
    redirect_url: string;
    [key: string]: any;
  }

  export class Snap {
    constructor(config: SnapConfig);
    createTransaction(parameter: SnapTransactionParameter): Promise<SnapTransactionResponse>;
    createTransactionToken(parameter: SnapTransactionParameter): Promise<string>;
    createTransactionRedirectUrl(parameter: SnapTransactionParameter): Promise<string>;
  }

  interface CoreApiConfig {
    isProduction: boolean;
    serverKey: string;
    clientKey: string;
  }

  export class CoreApi {
    constructor(config: CoreApiConfig);
    charge(parameter: Record<string, any>): Promise<Record<string, any>>;
    capture(parameter: Record<string, any>): Promise<Record<string, any>>;
    cardRegister(parameter: Record<string, any>): Promise<Record<string, any>>;
  }
}
