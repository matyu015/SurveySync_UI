export interface User {
  id: string;
  email: string;
  password: string;
  role: 'client' | 'staff' | 'admin';
  name: string;
  phone: string;
  address?: {
    street: string;
    barangay: string;
    municipality: string;
    province: string;
  };
  idType?: string;
  idNumber?: string;
  idStatus?: 'pending' | 'verified' | 'rejected';
  createdAt: string;
  avatar?: string;
}

export interface SurveyRequest {
  id: string;
  referenceNo: string;
  clientId: string;
  surveyType: string;
  status: 'submitted' | 'under_review' | 'documents_verified' | 'scheduled' | 'field_survey' | 'processing' | 'completed';
  paymentStatus: 'pending' | 'partial' | 'paid' | 'refunded';
  propertyDetails: {
    address: {
      street: string;
      barangay: string;
      municipality: string;
      province: string;
    };
    lotNumber?: string;
    blockNumber?: string;
    area?: number;
    purpose: string;
  };
  scheduledDate?: string;
  scheduledTime?: string;
  submittedAt: string;
  amount: number;
  assignedStaff?: string;
}

export interface Document {
  id: string;
  name: string;
  type: string;
  uploadedAt: string;
  status: 'uploaded' | 'missing' | 'under_review' | 'verified' | 'rejected';
  rejectionReason?: string;
  fileUrl?: string;
  clientId?: string;
  requestId?: string;
}

export interface Payment {
  id: string;
  requestId: string;
  clientId: string;
  amount: number;
  method: 'gcash' | 'otc' | 'bank' | 'cash';
  status: 'pending' | 'paid' | 'failed' | 'refunded';
  referenceNo: string;
  paidAt?: string;
  createdAt: string;
}

export interface RepositoryDocument {
  id: string;
  surveyType: string;
  lotNumber: string;
  barangay: string;
  municipality: string;
  clientName: string;
  surveyDate: string;
  fileSize: string;
  tags: string[];
  year: string;
}

export interface Notification {
  id: string;
  userId: string;
  type: 'success' | 'warning' | 'error' | 'info';
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
}

export const SURVEY_TYPES = [
  {
    id: 'lot-parcel',
    name: 'Lot / Parcel Survey',
    description: 'Boundary determination and lot verification for land parcels',
    duration: '5-7 business days',
    priceRange: '₱3,500 - ₱8,000',
    requiredDocs: ['TCT or OCT copy', 'Tax Declaration', 'Lot sketch/vicinity map', "Owner's valid ID"]
  },
  {
    id: 'subdivision',
    name: 'Subdivision Survey',
    description: 'Divide mother lot into multiple smaller lots with individual titles',
    duration: '10-14 business days',
    priceRange: '₱15,000 - ₱45,000',
    requiredDocs: ['Mother title (TCT/OCT)', 'Approved Subdivision Plan (if existing)', 'Tax Declaration', 'Barangay clearance']
  },
  {
    id: 'relocation',
    name: 'Relocation Survey',
    description: 'Re-establish property corners and boundaries on the ground',
    duration: '3-5 business days',
    priceRange: '₱4,000 - ₱10,000',
    requiredDocs: ['TCT or OCT', 'Tax Declaration', 'Original survey plan (if available)', 'Adjacent lot owner info']
  },
  {
    id: 'consolidation',
    name: 'Consolidation Survey',
    description: 'Combine two or more adjacent lots into a single property',
    duration: '7-10 business days',
    priceRange: '₱12,000 - ₱30,000',
    requiredDocs: ['All TCTs of lots to be consolidated', 'Tax Declarations for all lots', 'Deed of Consolidation']
  },
  {
    id: 'topographic',
    name: 'Topographic Survey',
    description: 'Map terrain features, contours, and elevation for development planning',
    duration: '5-7 business days',
    priceRange: '₱8,000 - ₱25,000',
    requiredDocs: ['Project brief or site description', 'Location map', 'Authorization letter if representative']
  },
  {
    id: 'as-built',
    name: 'As-Built Survey',
    description: 'Document existing structures and improvements on property',
    duration: '3-5 business days',
    priceRange: '₱5,000 - ₱15,000',
    requiredDocs: ['Approved building plans', 'Building permit', 'Location map']
  },
  {
    id: 'right-of-way',
    name: 'Right-of-Way Survey',
    description: 'Establish legal access routes through properties',
    duration: '5-7 business days',
    priceRange: '₱6,000 - ₱18,000',
    requiredDocs: ['Project description', 'Location map', 'Land ownership documents']
  },
  {
    id: 'land-titling',
    name: 'Land Titling Assistance',
    description: 'Assist in processing land title applications and documentation',
    duration: '15-30 business days',
    priceRange: '₱10,000 - ₱35,000',
    requiredDocs: ['PSA Birth Certificate', 'Tax Declaration', 'Deed of Sale or Extrajudicial Settlement', 'Barangay certification']
  }
];

export const BARANGAYS = {
  'Dinalupihan': ['San Ramon', 'Pagalanggang', 'Layac', 'Pinulot', 'Dalao', 'Magsaysay', 'Naparing', 'Daang Bago', 'Gomez', 'Kataasan'],
  'Hermosa': ['Cataning', 'Tipo', 'Mabiga', 'Palihan', 'Bamban', 'Mabuco', 'San Jose', 'Almacen'],
  'Orani': ['Centro I', 'Centro II', 'Sibul', 'Pag-asa', 'Wawa', 'Calero', 'Tugatog', 'Apollo'],
  'Balanga': ['Poblacion', 'Tenejero', 'Tortugas', 'Cupang', 'Bagumbayan', 'Ibayo', 'Ala-uli', 'Central'],
  'Mariveles': ['Townsite', 'Maligaya', 'Cabcaben', 'Baseco', 'Lucanin', 'Camaya', 'Sisiman']
};

export const mockUsers: User[] = [
  {
    id: 'U001',
    email: 'juan.delacruz@email.com',
    password: 'password123',
    role: 'client',
    name: 'Juan Dela Cruz',
    phone: '0917-123-4567',
    address: {
      street: '123 Rizal Street',
      barangay: 'San Ramon',
      municipality: 'Dinalupihan',
      province: 'Bataan'
    },
    idType: 'PhilSys',
    idNumber: 'PHIL-1234-5678-9012',
    idStatus: 'verified',
    createdAt: '2026-01-15T10:00:00Z'
  },
  {
    id: 'U002',
    email: 'maria.santos@email.com',
    password: 'password123',
    role: 'client',
    name: 'Maria Santos',
    phone: '0918-234-5678',
    address: {
      street: '45 Luna Avenue',
      barangay: 'Layac',
      municipality: 'Dinalupihan',
      province: 'Bataan'
    },
    idType: 'Drivers License',
    idNumber: 'D12-34-567890',
    idStatus: 'verified',
    createdAt: '2026-02-10T14:30:00Z'
  },
  {
    id: 'U003',
    email: 'pedro.reyes@email.com',
    password: 'password123',
    role: 'client',
    name: 'Pedro Reyes',
    phone: '0919-345-6789',
    address: {
      street: '78 Del Pilar Street',
      barangay: 'Pagalanggang',
      municipality: 'Dinalupihan',
      province: 'Bataan'
    },
    idType: 'Passport',
    idNumber: 'P1234567',
    idStatus: 'pending',
    createdAt: '2026-03-05T09:15:00Z'
  },
  {
    id: 'U004',
    email: 'rosa.garcia@email.com',
    password: 'password123',
    role: 'client',
    name: 'Rosa Garcia',
    phone: '0920-456-7890',
    address: {
      street: '12 Bonifacio Road',
      barangay: 'Pinulot',
      municipality: 'Dinalupihan',
      province: 'Bataan'
    },
    idType: 'Voters ID',
    idNumber: 'V-2024-123456',
    idStatus: 'verified',
    createdAt: '2026-01-20T11:45:00Z'
  },
  {
    id: 'U005',
    email: 'admin@cimamaradlo.com',
    password: 'admin123',
    role: 'admin',
    name: 'Engr. Cris I. Mamaradlo',
    phone: '0917-999-8888',
    createdAt: '2025-01-01T00:00:00Z'
  },
  {
    id: 'U006',
    email: 'staff@cimamaradlo.com',
    password: 'staff123',
    role: 'staff',
    name: 'Ana Mendoza',
    phone: '0918-777-6666',
    createdAt: '2025-06-01T00:00:00Z'
  }
];

export const mockRequests: SurveyRequest[] = [
  {
    id: 'R001',
    referenceNo: 'SS-2026-04-0042',
    clientId: 'U001',
    surveyType: 'Lot / Parcel Survey',
    status: 'field_survey',
    paymentStatus: 'partial',
    propertyDetails: {
      address: {
        street: 'Lot 123, Blk 5',
        barangay: 'San Ramon',
        municipality: 'Dinalupihan',
        province: 'Bataan'
      },
      lotNumber: '123',
      blockNumber: '5',
      area: 350,
      purpose: 'For Sale'
    },
    scheduledDate: '2026-04-25',
    scheduledTime: 'Morning 8AM-12PM',
    submittedAt: '2026-04-10T09:00:00Z',
    amount: 5500,
    assignedStaff: 'U006'
  },
  {
    id: 'R002',
    referenceNo: 'SS-2026-04-0035',
    clientId: 'U002',
    surveyType: 'Subdivision Survey',
    status: 'processing',
    paymentStatus: 'paid',
    propertyDetails: {
      address: {
        street: 'Mother Lot 456',
        barangay: 'Layac',
        municipality: 'Dinalupihan',
        province: 'Bataan'
      },
      lotNumber: '456',
      area: 2500,
      purpose: 'Development'
    },
    scheduledDate: '2026-04-18',
    scheduledTime: 'Afternoon 1PM-5PM',
    submittedAt: '2026-04-05T10:30:00Z',
    amount: 28000,
    assignedStaff: 'U006'
  },
  {
    id: 'R003',
    referenceNo: 'SS-2026-04-0038',
    clientId: 'U003',
    surveyType: 'Relocation Survey',
    status: 'under_review',
    paymentStatus: 'pending',
    propertyDetails: {
      address: {
        street: 'Lot 789',
        barangay: 'Pagalanggang',
        municipality: 'Dinalupihan',
        province: 'Bataan'
      },
      lotNumber: '789',
      area: 420,
      purpose: 'Boundary Dispute'
    },
    submittedAt: '2026-04-08T14:20:00Z',
    amount: 6500
  },
  {
    id: 'R004',
    referenceNo: 'SS-2026-03-0021',
    clientId: 'U004',
    surveyType: 'Topographic Survey',
    status: 'completed',
    paymentStatus: 'paid',
    propertyDetails: {
      address: {
        street: 'Development Site',
        barangay: 'Pinulot',
        municipality: 'Dinalupihan',
        province: 'Bataan'
      },
      area: 1800,
      purpose: 'Development'
    },
    scheduledDate: '2026-03-20',
    scheduledTime: 'Morning 8AM-12PM',
    submittedAt: '2026-03-10T08:00:00Z',
    amount: 15000,
    assignedStaff: 'U006'
  }
];

export const mockDocuments: Document[] = [
  {
    id: 'D001',
    name: 'Transfer Certificate of Title',
    type: 'TCT',
    uploadedAt: '2026-04-10T09:05:00Z',
    status: 'verified',
    clientId: 'U001',
    requestId: 'R001'
  },
  {
    id: 'D002',
    name: 'Tax Declaration',
    type: 'Tax',
    uploadedAt: '2026-04-10T09:06:00Z',
    status: 'verified',
    clientId: 'U001',
    requestId: 'R001'
  },
  {
    id: 'D003',
    name: 'Valid ID - Front',
    type: 'ID',
    uploadedAt: '2026-04-10T09:07:00Z',
    status: 'verified',
    clientId: 'U001'
  },
  {
    id: 'D004',
    name: 'Lot Sketch',
    type: 'Sketch',
    uploadedAt: '2026-04-10T09:08:00Z',
    status: 'under_review',
    clientId: 'U001',
    requestId: 'R001'
  }
];

export const mockPayments: Payment[] = [
  {
    id: 'P001',
    requestId: 'R001',
    clientId: 'U001',
    amount: 1650,
    method: 'gcash',
    status: 'paid',
    referenceNo: 'GC-2026041012345',
    paidAt: '2026-04-10T09:30:00Z',
    createdAt: '2026-04-10T09:15:00Z'
  },
  {
    id: 'P002',
    requestId: 'R002',
    clientId: 'U002',
    amount: 28000,
    method: 'bank',
    status: 'paid',
    referenceNo: 'BK-2026040598765',
    paidAt: '2026-04-05T15:20:00Z',
    createdAt: '2026-04-05T11:00:00Z'
  },
  {
    id: 'P003',
    requestId: 'R003',
    clientId: 'U003',
    amount: 1950,
    method: 'otc',
    status: 'pending',
    referenceNo: 'OTC-2026040812345',
    createdAt: '2026-04-08T14:30:00Z'
  }
];

export const mockRepositoryDocs: RepositoryDocument[] = [
  {
    id: 'RD001',
    surveyType: 'Lot / Parcel Survey',
    lotNumber: 'Lot 123, Blk 5',
    barangay: 'San Ramon',
    municipality: 'Dinalupihan',
    clientName: 'Juan Dela Cruz',
    surveyDate: '2026-04-15',
    fileSize: '2.4 MB',
    tags: ['boundary', 'residential', '2026', 'Dinalupihan', 'verified'],
    year: '2026'
  },
  {
    id: 'RD002',
    surveyType: 'Subdivision Survey',
    lotNumber: 'Mother Lot 456',
    barangay: 'Layac',
    municipality: 'Dinalupihan',
    clientName: 'Maria Santos',
    surveyDate: '2026-04-18',
    fileSize: '5.1 MB',
    tags: ['subdivision', 'development', '2026', 'Dinalupihan', 'commercial'],
    year: '2026'
  },
  {
    id: 'RD003',
    surveyType: 'Topographic Survey',
    lotNumber: 'Development Site',
    barangay: 'Pinulot',
    municipality: 'Dinalupihan',
    clientName: 'Rosa Garcia',
    surveyDate: '2026-03-20',
    fileSize: '3.8 MB',
    tags: ['topographic', 'development', '2026', 'Dinalupihan', 'planning'],
    year: '2026'
  }
];

export const mockNotifications: Notification[] = [
  {
    id: 'N001',
    userId: 'U001',
    type: 'success',
    title: 'Document Verified',
    message: 'Your Transfer Certificate of Title has been verified and approved.',
    read: false,
    createdAt: '2026-04-10T10:00:00Z'
  },
  {
    id: 'N002',
    userId: 'U001',
    type: 'info',
    title: 'Field Survey Scheduled',
    message: 'Your field survey is scheduled for April 25, 2026 at 8AM-12PM.',
    read: false,
    createdAt: '2026-04-10T14:30:00Z'
  },
  {
    id: 'N003',
    userId: 'U002',
    type: 'success',
    title: 'Payment Received',
    message: 'We have received your payment of ₱28,000 via Bank Transfer.',
    read: true,
    createdAt: '2026-04-05T15:30:00Z'
  }
];
