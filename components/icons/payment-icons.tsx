// Payment Method SVG Icons for Tanzania mobile money providers

export const MpesaIcon = ({ className }: { className?: string }) => (
  <svg 
    viewBox="0 0 40 40" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <rect width="40" height="40" rx="8" fill="#E60000"/>
    <path 
      d="M10 20C10 14.4772 14.4772 10 20 10C25.5228 10 30 14.4772 30 20C30 25.5228 25.5228 30 20 30C14.4772 30 10 25.5228 10 20Z" 
      fill="white"
    />
    <path 
      d="M15 17H17V23H15V17ZM19 14H21V23H19V14ZM23 19H25V23H23V19Z" 
      fill="#E60000"
    />
    <text x="20" y="34" textAnchor="middle" fill="white" fontSize="5" fontWeight="bold">M-PESA</text>
  </svg>
);

export const AirtelMoneyIcon = ({ className }: { className?: string }) => (
  <svg 
    viewBox="0 0 40 40" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <rect width="40" height="40" rx="8" fill="#ED1C24"/>
    <circle cx="20" cy="18" r="8" fill="white"/>
    <path 
      d="M16 18C16 15.7909 17.7909 14 20 14C22.2091 14 24 15.7909 24 18C24 20.2091 22.2091 22 20 22C17.7909 22 16 20.2091 16 18Z" 
      fill="#ED1C24"
    />
    <text x="20" y="32" textAnchor="middle" fill="white" fontSize="5" fontWeight="bold">AIRTEL</text>
  </svg>
);

export const TigoPesaIcon = ({ className }: { className?: string }) => (
  <svg 
    viewBox="0 0 40 40" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <rect width="40" height="40" rx="8" fill="#003087"/>
    <circle cx="20" cy="17" r="7" fill="white"/>
    <path 
      d="M17 17L19 19L23 15" 
      stroke="#003087" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    />
    <text x="20" y="32" textAnchor="middle" fill="white" fontSize="5" fontWeight="bold">TIGO</text>
  </svg>
);

export const HalopesaIcon = ({ className }: { className?: string }) => (
  <svg 
    viewBox="0 0 40 40" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <rect width="40" height="40" rx="8" fill="#FF6600"/>
    <circle cx="20" cy="17" r="7" fill="white"/>
    <path 
      d="M16 17H24M20 13V21" 
      stroke="#FF6600" 
      strokeWidth="2" 
      strokeLinecap="round"
    />
    <text x="20" y="32" textAnchor="middle" fill="white" fontSize="4.5" fontWeight="bold">HALOPESA</text>
  </svg>
);

export const MixByYasIcon = ({ className }: { className?: string }) => (
  <svg 
    viewBox="0 0 40 40" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <rect width="40" height="40" rx="8" fill="#FFD700"/>
    <circle cx="20" cy="17" r="7" fill="white"/>
    <path 
      d="M17 15L20 20L23 15M17 19L20 14L23 19" 
      stroke="#FFD700" 
      strokeWidth="1.5" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    />
    <text x="20" y="32" textAnchor="middle" fill="#333" fontSize="4" fontWeight="bold">MIX BY YAS</text>
  </svg>
);

export const BankTransferIcon = ({ className }: { className?: string }) => (
  <svg 
    viewBox="0 0 40 40" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <rect width="40" height="40" rx="8" fill="#2E7D32"/>
    <path 
      d="M10 18L20 12L30 18V20H10V18Z" 
      fill="white"
    />
    <rect x="12" y="21" width="3" height="7" fill="white"/>
    <rect x="18.5" y="21" width="3" height="7" fill="white"/>
    <rect x="25" y="21" width="3" height="7" fill="white"/>
    <rect x="10" y="28" width="20" height="2" fill="white"/>
    <text x="20" y="36" textAnchor="middle" fill="white" fontSize="3.5" fontWeight="bold">BANK</text>
  </svg>
);

// Map payment method keys to icons
export const PaymentIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  mpesa: MpesaIcon,
  airtel_money: AirtelMoneyIcon,
  tigopesa: TigoPesaIcon,
  halopesa: HalopesaIcon,
  mix_by_yas: MixByYasIcon,
  bank_transfer: BankTransferIcon,
};
