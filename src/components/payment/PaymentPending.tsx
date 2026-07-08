// File: src/components/payment/PaymentPending.tsx
// Description: Auto-added top comment for easier file identification.

'use client';

import { Loader2, AlertCircle } from 'lucide-react';
import type { CSSProperties } from 'react';

interface PaymentPendingProps {
  errMsg?: string | null;
  wrapperClassName?: string;
  iconClassName?: string;
  titleClassName?: string;
  descriptionClassName?: string;
  errorClassName?: string;
  style?: CSSProperties;
}

// PaymentPending renders the waiting state while payment processing is ongoing.
export default function PaymentPending({
  errMsg,
  wrapperClassName,
  iconClassName,
  titleClassName,
  descriptionClassName,
  errorClassName,
  style,
}: PaymentPendingProps) {
  return (
    <div className={wrapperClassName} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: 12, padding: 24, ...style }}>
      <Loader2 size={48} className={iconClassName} />
      <p className={titleClassName} style={{ margin: 0, fontWeight: 700 }}>Waiting for Payment...</p>
      <p className={descriptionClassName} style={{ margin: 0, fontSize: 12, color: '#888' }}>
        Scan the QRIS code with your e-wallet app to complete payment
      </p>
      {errMsg && (
        <p className={errorClassName} style={{ margin: 0, color: '#d64545', display: 'flex', alignItems: 'center', gap: 8, fontSize: 13 }}>
          <AlertCircle size={14} />
          {errMsg}
        </p>
      )}
    </div>
  );
}
