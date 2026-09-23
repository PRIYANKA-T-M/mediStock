import express, { Request, Response } from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;
const HOST = '0.0.0.0';

app.use(cors());
app.use(express.json());

// ==========================================
// In-Memory Data Store & Seed Data
// ==========================================

interface User {
  id: number;
  name: string;
  email: string;
  password: string;
  role: 'ADMIN' | 'PHARMACIST' | 'STAFF';
}

interface Supplier {
  id: number;
  name: string;
  contactPerson: string;
  email: string;
  phone: string;
  address?: string;
  city: string;
  state: string;
  pincode?: string;
  gstNumber: string;
  licenseNumber: string;
  status: 'ACTIVE' | 'INACTIVE';
  rating: number;
  leadTimeDays: number;
  createdAt: string;
  updatedAt: string;
}

interface Medicine {
  id: number;
  name: string;
  category: string;
  manufacturer: string;
  description: string;
  price: number;
  reorderLevel: number;
  batchNumber?: string | null;
  expiryDate?: string | null;
  createdAt: string;
}

interface InventoryItem {
  id: number;
  medicineId: number;
  medicineName: string;
  quantity: number;
  reorderLevel: number;
  status: 'IN_STOCK' | 'LOW_STOCK' | 'OUT_OF_STOCK';
}

interface StockItem {
  id: number;
  medicineCode: string;
  medicineName: string;
  category: string;
  batchNumber: string;
  supplierId: number | null;
  supplierName: string | null;
  quantity: number;
  reorderLevel: number;
  unit: string;
  expiryDate: string;
  unitPrice: number;
  status: string;
  updatedAt: string;
}

interface Alert {
  id: number;
  type: string;
  severity: 'CRITICAL' | 'WARNING' | 'INFO';
  status: 'OPEN' | 'ACKNOWLEDGED' | 'RESOLVED';
  title: string;
  message: string;
  referenceKey: string;
  medicineId: number | null;
  medicineName: string | null;
  currentStock: number;
  thresholdStock: number;
  supplierId: number | null;
  supplierName: string | null;
  actedBy: string | null;
  createdAt: string;
  updatedAt: string;
  acknowledgedAt: string | null;
  resolvedAt: string | null;
}

// Seed Users
const users: User[] = [
  {
    id: 1,
    name: 'System Admin',
    email: 'admin@medistock.com',
    password: 'admin123',
    role: 'ADMIN',
  },
  {
    id: 2,
    name: 'Senior Pharmacist',
    email: 'pharmacist@medistock.com',
    password: 'pharma123',
    role: 'PHARMACIST',
  },
  {
    id: 3,
    name: 'Clinic Staff',
    email: 'staff@medistock.com',
    password: 'staff123',
    role: 'STAFF',
  },
];

// Seed Suppliers
const suppliers: Supplier[] = [
  {
    id: 1,
    name: 'Apollo Pharma Distributors',
    contactPerson: 'Ramesh Kumar',
    email: 'orders@apollopharmadist.in',
    phone: '9876543210',
    city: 'Vijayawada',
    state: 'Andhra Pradesh',
    gstNumber: 'GST-AP-001',
    licenseNumber: 'DL-AP-101',
    status: 'ACTIVE',
    rating: 4.8,
    leadTimeDays: 2,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 2,
    name: 'MedPlus Wholesale Network',
    contactPerson: 'S. Priya',
    email: 'supply@medpluswholesale.in',
    phone: '9123456780',
    city: 'Hyderabad',
    state: 'Telangana',
    gstNumber: 'GST-TS-002',
    licenseNumber: 'DL-TS-204',
    status: 'ACTIVE',
    rating: 4.6,
    leadTimeDays: 3,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 3,
    name: 'CureLine Medical Supplies',
    contactPerson: 'Arjun Reddy',
    email: 'sales@cureline.in',
    phone: '9012345678',
    city: 'Guntur',
    state: 'Andhra Pradesh',
    gstNumber: 'GST-AP-003',
    licenseNumber: 'DL-AP-309',
    status: 'ACTIVE',
    rating: 4.4,
    leadTimeDays: 4,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 4,
    name: 'HealthBridge Lifesciences',
    contactPerson: 'Neha Sharma',
    email: 'dispatch@healthbridge.in',
    phone: '9988776655',
    city: 'Chennai',
    state: 'Tamil Nadu',
    gstNumber: 'GST-TN-004',
    licenseNumber: 'DL-TN-411',
    status: 'ACTIVE',
    rating: 4.7,
    leadTimeDays: 2,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

// Seed Medicines
const medicines: Medicine[] = [
  {
    id: 1,
    name: 'Paracetamol 500mg',
    category: 'Tablet',
    manufacturer: 'Apollo Pharma',
    description: 'Fast-acting analgesic and antipyretic',
    price: 1.2,
    reorderLevel: 30,
    batchNumber: 'PCM-2608-A',
    expiryDate: '2027-08-15',
    createdAt: new Date().toISOString(),
  },
  {
    id: 2,
    name: 'Amoxicillin 500mg',
    category: 'Capsule',
    manufacturer: 'MedPlus Wholesale',
    description: 'Broad-spectrum antibiotic',
    price: 6.5,
    reorderLevel: 25,
    batchNumber: 'AMX-2607-B',
    expiryDate: '2027-05-20',
    createdAt: new Date().toISOString(),
  },
  {
    id: 3,
    name: 'Ibuprofen 400mg',
    category: 'Tablet',
    manufacturer: 'CureLine Medical Supplies',
    description: 'NSAID anti-inflammatory pain reliever',
    price: 2.4,
    reorderLevel: 20,
    batchNumber: 'IBU-2606-C',
    expiryDate: '2027-06-18',
    createdAt: new Date().toISOString(),
  },
  {
    id: 4,
    name: 'Cetirizine 10mg',
    category: 'Tablet',
    manufacturer: 'Apollo Pharma',
    description: 'Antihistamine for allergy symptoms',
    price: 1.8,
    reorderLevel: 15,
    batchNumber: 'CTZ-2608-D',
    expiryDate: '2027-11-10',
    createdAt: new Date().toISOString(),
  },
  {
    id: 5,
    name: 'Metformin 500mg',
    category: 'Tablet',
    manufacturer: 'HealthBridge Lifesciences',
    description: 'First-line oral antidiabetic medicine',
    price: 2.1,
    reorderLevel: 20,
    batchNumber: 'MET-2605-E',
    expiryDate: '2027-04-12',
    createdAt: new Date().toISOString(),
  },
  {
    id: 6,
    name: 'Azithromycin 500mg',
    category: 'Tablet',
    manufacturer: 'MedPlus Wholesale',
    description: 'Macrolide antibiotic for respiratory infections',
    price: 18.0,
    reorderLevel: 10,
    batchNumber: 'AZM-2607-F',
    expiryDate: '2027-03-30',
    createdAt: new Date().toISOString(),
  },
  {
    id: 7,
    name: 'ORS Sachet',
    category: 'Syrup',
    manufacturer: 'CureLine Medical Supplies',
    description: 'Oral rehydration solution',
    price: 12.0,
    reorderLevel: 25,
    batchNumber: 'ORS-2609-G',
    expiryDate: '2028-01-25',
    createdAt: new Date().toISOString(),
  },
  {
    id: 8,
    name: 'Pantoprazole 40mg',
    category: 'Tablet',
    manufacturer: 'Apollo Pharma',
    description: 'Proton pump inhibitor for gastritis',
    price: 4.5,
    reorderLevel: 15,
    batchNumber: 'PAN-2608-H',
    expiryDate: '2027-09-14',
    createdAt: new Date().toISOString(),
  },
  {
    id: 9,
    name: 'Human Insulin 40 IU/ml',
    category: 'Injection',
    manufacturer: 'HealthBridge Lifesciences',
    description: 'Recombinant human insulin vial',
    price: 165.0,
    reorderLevel: 12,
    batchNumber: 'INS-2608-I',
    expiryDate: '2026-12-05',
    createdAt: new Date().toISOString(),
  },
  {
    id: 10,
    name: 'Atorvastatin 10mg',
    category: 'Tablet',
    manufacturer: 'MedPlus Wholesale',
    description: 'Lipid-lowering statin medication',
    price: 5.3,
    reorderLevel: 20,
    batchNumber: 'ATV-2607-J',
    expiryDate: '2027-07-22',
    createdAt: new Date().toISOString(),
  },
];

// Seed Inventory
const computeInventoryStatus = (qty: number, reorderLevel: number): 'IN_STOCK' | 'LOW_STOCK' | 'OUT_OF_STOCK' => {
  if (qty <= 0) return 'OUT_OF_STOCK';
  if (qty <= reorderLevel) return 'LOW_STOCK';
  return 'IN_STOCK';
};

const inventory: InventoryItem[] = [
  { id: 1, medicineId: 1, medicineName: 'Paracetamol 500mg', quantity: 120, reorderLevel: 30, status: 'IN_STOCK' },
  { id: 2, medicineId: 2, medicineName: 'Amoxicillin 500mg', quantity: 12, reorderLevel: 25, status: 'LOW_STOCK' },
  { id: 3, medicineId: 3, medicineName: 'Ibuprofen 400mg', quantity: 0, reorderLevel: 20, status: 'OUT_OF_STOCK' },
  { id: 4, medicineId: 4, medicineName: 'Cetirizine 10mg', quantity: 18, reorderLevel: 15, status: 'IN_STOCK' },
  { id: 5, medicineId: 5, medicineName: 'Metformin 500mg', quantity: 8, reorderLevel: 20, status: 'LOW_STOCK' },
  { id: 6, medicineId: 6, medicineName: 'Azithromycin 500mg', quantity: 30, reorderLevel: 10, status: 'IN_STOCK' },
  { id: 7, medicineId: 7, medicineName: 'ORS Sachet', quantity: 5, reorderLevel: 25, status: 'LOW_STOCK' },
  { id: 8, medicineId: 8, medicineName: 'Pantoprazole 40mg', quantity: 40, reorderLevel: 15, status: 'IN_STOCK' },
  { id: 9, medicineId: 9, medicineName: 'Human Insulin 40 IU/ml', quantity: 6, reorderLevel: 12, status: 'LOW_STOCK' },
  { id: 10, medicineId: 10, medicineName: 'Atorvastatin 10mg', quantity: 55, reorderLevel: 20, status: 'IN_STOCK' },
];

// Seed Medicine Stock items
const stockItems: StockItem[] = [
  {
    id: 1,
    medicineCode: 'MED-001',
    medicineName: 'Paracetamol 500mg',
    category: 'Analgesic',
    batchNumber: 'PCM-2608-A',
    supplierId: 1,
    supplierName: 'Apollo Pharma Distributors',
    quantity: 120,
    reorderLevel: 30,
    unit: 'tablets',
    expiryDate: '2027-08-15',
    unitPrice: 1.2,
    status: 'IN_STOCK',
    updatedAt: new Date().toISOString(),
  },
  {
    id: 2,
    medicineCode: 'MED-002',
    medicineName: 'Amoxicillin 500mg',
    category: 'Antibiotic',
    batchNumber: 'AMX-2607-B',
    supplierId: 2,
    supplierName: 'MedPlus Wholesale Network',
    quantity: 12,
    reorderLevel: 25,
    unit: 'capsules',
    expiryDate: '2027-05-20',
    unitPrice: 6.5,
    status: 'LOW_STOCK',
    updatedAt: new Date().toISOString(),
  },
  {
    id: 3,
    medicineCode: 'MED-003',
    medicineName: 'Ibuprofen 400mg',
    category: 'Analgesic',
    batchNumber: 'IBU-2606-C',
    supplierId: 3,
    supplierName: 'CureLine Medical Supplies',
    quantity: 0,
    reorderLevel: 20,
    unit: 'tablets',
    expiryDate: '2027-06-18',
    unitPrice: 2.4,
    status: 'OUT_OF_STOCK',
    updatedAt: new Date().toISOString(),
  },
  {
    id: 4,
    medicineCode: 'MED-004',
    medicineName: 'Cetirizine 10mg',
    category: 'Antihistamine',
    batchNumber: 'CTZ-2608-D',
    supplierId: 1,
    supplierName: 'Apollo Pharma Distributors',
    quantity: 18,
    reorderLevel: 15,
    unit: 'tablets',
    expiryDate: '2027-11-10',
    unitPrice: 1.8,
    status: 'IN_STOCK',
    updatedAt: new Date().toISOString(),
  },
  {
    id: 5,
    medicineCode: 'MED-005',
    medicineName: 'Metformin 500mg',
    category: 'Antidiabetic',
    batchNumber: 'MET-2605-E',
    supplierId: 4,
    supplierName: 'HealthBridge Lifesciences',
    quantity: 8,
    reorderLevel: 20,
    unit: 'tablets',
    expiryDate: '2027-04-12',
    unitPrice: 2.1,
    status: 'LOW_STOCK',
    updatedAt: new Date().toISOString(),
  },
  {
    id: 6,
    medicineCode: 'MED-006',
    medicineName: 'Azithromycin 500mg',
    category: 'Antibiotic',
    batchNumber: 'AZM-2607-F',
    supplierId: 2,
    supplierName: 'MedPlus Wholesale Network',
    quantity: 30,
    reorderLevel: 10,
    unit: 'tablets',
    expiryDate: '2027-03-30',
    unitPrice: 18.0,
    status: 'IN_STOCK',
    updatedAt: new Date().toISOString(),
  },
  {
    id: 7,
    medicineCode: 'MED-007',
    medicineName: 'ORS Sachet',
    category: 'Rehydration',
    batchNumber: 'ORS-2609-G',
    supplierId: 3,
    supplierName: 'CureLine Medical Supplies',
    quantity: 5,
    reorderLevel: 25,
    unit: 'sachets',
    expiryDate: '2028-01-25',
    unitPrice: 12.0,
    status: 'LOW_STOCK',
    updatedAt: new Date().toISOString(),
  },
  {
    id: 8,
    medicineCode: 'MED-008',
    medicineName: 'Pantoprazole 40mg',
    category: 'Gastrointestinal',
    batchNumber: 'PAN-2608-H',
    supplierId: 1,
    supplierName: 'Apollo Pharma Distributors',
    quantity: 40,
    reorderLevel: 15,
    unit: 'tablets',
    expiryDate: '2027-09-14',
    unitPrice: 4.5,
    status: 'IN_STOCK',
    updatedAt: new Date().toISOString(),
  },
  {
    id: 9,
    medicineCode: 'MED-009',
    medicineName: 'Human Insulin 40 IU/ml',
    category: 'Antidiabetic',
    batchNumber: 'INS-2608-I',
    supplierId: 4,
    supplierName: 'HealthBridge Lifesciences',
    quantity: 6,
    reorderLevel: 12,
    unit: 'vials',
    expiryDate: '2026-12-05',
    unitPrice: 165.0,
    status: 'LOW_STOCK',
    updatedAt: new Date().toISOString(),
  },
  {
    id: 10,
    medicineCode: 'MED-010',
    medicineName: 'Atorvastatin 10mg',
    category: 'Cardiovascular',
    batchNumber: 'ATV-2607-J',
    supplierId: 2,
    supplierName: 'MedPlus Wholesale Network',
    quantity: 55,
    reorderLevel: 20,
    unit: 'tablets',
    expiryDate: '2027-07-22',
    unitPrice: 5.3,
    status: 'IN_STOCK',
    updatedAt: new Date().toISOString(),
  },
];

// Seed Alerts
const alerts: Alert[] = [
  {
    id: 1,
    type: 'OUT_OF_STOCK',
    severity: 'CRITICAL',
    status: 'OPEN',
    title: 'Out of Stock: Ibuprofen 400mg',
    message: 'Current stock is 0 (reorder threshold is 20). Immediate replenishment needed.',
    referenceKey: 'MED-003',
    medicineId: 3,
    medicineName: 'Ibuprofen 400mg',
    currentStock: 0,
    thresholdStock: 20,
    supplierId: 3,
    supplierName: 'CureLine Medical Supplies',
    actedBy: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    acknowledgedAt: null,
    resolvedAt: null,
  },
  {
    id: 2,
    type: 'LOW_STOCK',
    severity: 'WARNING',
    status: 'OPEN',
    title: 'Low Stock: Amoxicillin 500mg',
    message: 'Current stock is 12 (reorder threshold is 25). Replenish soon.',
    referenceKey: 'MED-002',
    medicineId: 2,
    medicineName: 'Amoxicillin 500mg',
    currentStock: 12,
    thresholdStock: 25,
    supplierId: 2,
    supplierName: 'MedPlus Wholesale Network',
    actedBy: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    acknowledgedAt: null,
    resolvedAt: null,
  },
  {
    id: 3,
    type: 'LOW_STOCK',
    severity: 'WARNING',
    status: 'OPEN',
    title: 'Low Stock: Metformin 500mg',
    message: 'Current stock is 8 (reorder threshold is 20). Replenish soon.',
    referenceKey: 'MED-005',
    medicineId: 5,
    medicineName: 'Metformin 500mg',
    currentStock: 8,
    thresholdStock: 20,
    supplierId: 4,
    supplierName: 'HealthBridge Lifesciences',
    actedBy: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    acknowledgedAt: null,
    resolvedAt: null,
  },
  {
    id: 4,
    type: 'LOW_STOCK',
    severity: 'WARNING',
    status: 'OPEN',
    title: 'Low Stock: ORS Sachet',
    message: 'Current stock is 5 (reorder threshold is 25). Replenish soon.',
    referenceKey: 'MED-007',
    medicineId: 7,
    medicineName: 'ORS Sachet',
    currentStock: 5,
    thresholdStock: 25,
    supplierId: 3,
    supplierName: 'CureLine Medical Supplies',
    actedBy: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    acknowledgedAt: null,
    resolvedAt: null,
  },
  {
    id: 5,
    type: 'LOW_STOCK',
    severity: 'WARNING',
    status: 'OPEN',
    title: 'Low Stock: Human Insulin 40 IU/ml',
    message: 'Current stock is 6 (reorder threshold is 12). Critical antidiabetic stock.',
    referenceKey: 'MED-009',
    medicineId: 9,
    medicineName: 'Human Insulin 40 IU/ml',
    currentStock: 6,
    thresholdStock: 12,
    supplierId: 4,
    supplierName: 'HealthBridge Lifesciences',
    actedBy: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    acknowledgedAt: null,
    resolvedAt: null,
  },
];

// Helper to refresh alerts automatically from current inventory/stock
const refreshAlertsData = () => {
  stockItems.forEach((item) => {
    const existing = alerts.find(
      (a) => a.referenceKey === item.medicineCode && a.status !== 'RESOLVED'
    );
    if (item.quantity === 0) {
      if (!existing) {
        alerts.push({
          id: alerts.length + 1,
          type: 'OUT_OF_STOCK',
          severity: 'CRITICAL',
          status: 'OPEN',
          title: `Out of Stock: ${item.medicineName}`,
          message: `Current stock is 0 (reorder threshold is ${item.reorderLevel}).`,
          referenceKey: item.medicineCode,
          medicineId: item.id,
          medicineName: item.medicineName,
          currentStock: item.quantity,
          thresholdStock: item.reorderLevel,
          supplierId: item.supplierId,
          supplierName: item.supplierName,
          actedBy: null,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          acknowledgedAt: null,
          resolvedAt: null,
        });
      }
    } else if (item.quantity <= item.reorderLevel) {
      if (!existing) {
        alerts.push({
          id: alerts.length + 1,
          type: 'LOW_STOCK',
          severity: 'WARNING',
          status: 'OPEN',
          title: `Low Stock: ${item.medicineName}`,
          message: `Current stock is ${item.quantity} (reorder threshold is ${item.reorderLevel}).`,
          referenceKey: item.medicineCode,
          medicineId: item.id,
          medicineName: item.medicineName,
          currentStock: item.quantity,
          thresholdStock: item.reorderLevel,
          supplierId: item.supplierId,
          supplierName: item.supplierName,
          actedBy: null,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          acknowledgedAt: null,
          resolvedAt: null,
        });
      }
    } else if (existing && existing.status === 'OPEN') {
      existing.status = 'RESOLVED';
      existing.resolvedAt = new Date().toISOString();
      existing.updatedAt = new Date().toISOString();
    }
  });
};

// ==========================================
// API Routes
// ==========================================

// Auth Routes
app.post('/api/auth/register', (req: Request, res: Response) => {
  const { name, email, password, role } = req.body;
  if (!name || !email || !password) {
    return res.status(400).send('Name, email, and password are required');
  }

  const existing = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  if (existing) {
    return res.status(409).send('User with this email already exists');
  }

  const newUser: User = {
    id: users.length + 1,
    name,
    email,
    password,
    role: (role && ['ADMIN', 'PHARMACIST', 'STAFF'].includes(role.toUpperCase()))
      ? (role.toUpperCase() as any)
      : 'STAFF',
  };
  users.push(newUser);

  // AppRoutes.jsx uses response.text()
  return res.status(200).send('User registered successfully');
});

app.post('/api/auth/login', (req: Request, res: Response) => {
  const { email, password } = req.body;
  const user = users.find(
    (u) => u.email.toLowerCase() === email?.toLowerCase() && u.password === password
  );

  if (!user) {
    return res.status(401).json({ message: 'Invalid email or password' });
  }

  return res.json({
    token: `token-${user.id}-${Date.now()}`,
    userId: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
  });
});

// Medicine Routes
app.get('/api/medicines', (req: Request, res: Response) => {
  const search = req.query.search as string;
  if (search && search.trim()) {
    const q = search.toLowerCase();
    const filtered = medicines.filter(
      (m) =>
        m.name.toLowerCase().includes(q) ||
        m.category.toLowerCase().includes(q) ||
        m.manufacturer.toLowerCase().includes(q)
    );
    return res.json(filtered);
  }
  return res.json(medicines);
});

app.get('/api/medicines/:id', (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const medicine = medicines.find((m) => m.id === id);
  if (!medicine) return res.status(404).json({ message: 'Medicine not found' });
  return res.json(medicine);
});

app.post('/api/medicines', (req: Request, res: Response) => {
  const { name, category, manufacturer, description, price, reorderLevel, batchNumber, expiryDate } = req.body;
  const newMed: Medicine = {
    id: medicines.length > 0 ? Math.max(...medicines.map((m) => m.id)) + 1 : 1,
    name,
    category,
    manufacturer,
    description,
    price: Number(price) || 0,
    reorderLevel: Number(reorderLevel) || 10,
    batchNumber: batchNumber || null,
    expiryDate: expiryDate || null,
    createdAt: new Date().toISOString(),
  };
  medicines.push(newMed);

  // Sync to inventory & stock
  const newInv: InventoryItem = {
    id: inventory.length > 0 ? Math.max(...inventory.map((i) => i.id)) + 1 : 1,
    medicineId: newMed.id,
    medicineName: newMed.name,
    quantity: 0,
    reorderLevel: newMed.reorderLevel,
    status: 'OUT_OF_STOCK',
  };
  inventory.push(newInv);

  stockItems.push({
    id: newMed.id,
    medicineCode: `MED-0${newMed.id}`,
    medicineName: newMed.name,
    category: newMed.category,
    batchNumber: newMed.batchNumber || `BATCH-${newMed.id}`,
    supplierId: suppliers[0]?.id || 1,
    supplierName: suppliers[0]?.name || 'Primary Supplier',
    quantity: 0,
    reorderLevel: newMed.reorderLevel,
    unit: 'units',
    expiryDate: newMed.expiryDate || new Date(Date.now() + 365 * 24 * 3600 * 1000).toISOString().split('T')[0],
    unitPrice: newMed.price,
    status: 'OUT_OF_STOCK',
    updatedAt: new Date().toISOString(),
  });

  refreshAlertsData();
  return res.status(201).json(newMed);
});

app.put('/api/medicines/:id', (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const index = medicines.findIndex((m) => m.id === id);
  if (index === -1) return res.status(404).json({ message: 'Medicine not found' });

  const { name, category, manufacturer, description, price, reorderLevel, batchNumber, expiryDate } = req.body;
  medicines[index] = {
    ...medicines[index],
    name: name !== undefined ? name : medicines[index].name,
    category: category !== undefined ? category : medicines[index].category,
    manufacturer: manufacturer !== undefined ? manufacturer : medicines[index].manufacturer,
    description: description !== undefined ? description : medicines[index].description,
    price: price !== undefined ? Number(price) : medicines[index].price,
    reorderLevel: reorderLevel !== undefined ? Number(reorderLevel) : medicines[index].reorderLevel,
    batchNumber: batchNumber !== undefined ? batchNumber : medicines[index].batchNumber,
    expiryDate: expiryDate !== undefined ? expiryDate : medicines[index].expiryDate,
  };

  // Sync to inventory
  const inv = inventory.find((i) => i.medicineId === id);
  if (inv) {
    inv.medicineName = medicines[index].name;
    inv.reorderLevel = medicines[index].reorderLevel;
    inv.status = computeInventoryStatus(inv.quantity, inv.reorderLevel);
  }

  // Sync to stock
  const stock = stockItems.find((s) => s.id === id || s.medicineName === medicines[index].name);
  if (stock) {
    stock.medicineName = medicines[index].name;
    stock.category = medicines[index].category;
    stock.unitPrice = medicines[index].price;
    stock.reorderLevel = medicines[index].reorderLevel;
    if (medicines[index].batchNumber) stock.batchNumber = medicines[index].batchNumber!;
    if (medicines[index].expiryDate) stock.expiryDate = medicines[index].expiryDate!;
  }

  refreshAlertsData();
  return res.json(medicines[index]);
});

app.delete('/api/medicines/:id', (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const index = medicines.findIndex((m) => m.id === id);
  if (index === -1) return res.status(404).json({ message: 'Medicine not found' });

  medicines.splice(index, 1);
  const invIndex = inventory.findIndex((i) => i.medicineId === id);
  if (invIndex !== -1) inventory.splice(invIndex, 1);

  const stockIndex = stockItems.findIndex((s) => s.id === id);
  if (stockIndex !== -1) stockItems.splice(stockIndex, 1);

  return res.status(204).send();
});

// Inventory Routes
app.get('/api/inventory', (_req: Request, res: Response) => {
  return res.json(inventory);
});

app.get('/api/inventory/:id', (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const item = inventory.find((i) => i.id === id);
  if (!item) return res.status(404).json({ message: 'Inventory item not found' });
  return res.json(item);
});

app.get('/api/inventory/medicine/:medicineId', (req: Request, res: Response) => {
  const medicineId = Number(req.params.medicineId);
  const item = inventory.find((i) => i.medicineId === medicineId);
  if (!item) return res.status(404).json({ message: 'Inventory item not found' });
  return res.json(item);
});

app.post('/api/inventory', (req: Request, res: Response) => {
  const { medicineId, quantity } = req.body;
  const med = medicines.find((m) => m.id === Number(medicineId));
  if (!med) return res.status(400).json({ message: 'Invalid medicine ID' });

  const qty = Number(quantity) || 0;
  const existing = inventory.find((i) => i.medicineId === Number(medicineId));
  if (existing) {
    existing.quantity += qty;
    existing.status = computeInventoryStatus(existing.quantity, existing.reorderLevel);
    // sync to stock
    const stock = stockItems.find((s) => s.id === med.id);
    if (stock) {
      stock.quantity = existing.quantity;
      stock.status = existing.status;
      stock.updatedAt = new Date().toISOString();
    }
    refreshAlertsData();
    return res.json(existing);
  }

  const newItem: InventoryItem = {
    id: inventory.length > 0 ? Math.max(...inventory.map((i) => i.id)) + 1 : 1,
    medicineId: med.id,
    medicineName: med.name,
    quantity: qty,
    reorderLevel: med.reorderLevel,
    status: computeInventoryStatus(qty, med.reorderLevel),
  };
  inventory.push(newItem);

  const stock = stockItems.find((s) => s.id === med.id);
  if (stock) {
    stock.quantity = qty;
    stock.status = newItem.status;
    stock.updatedAt = new Date().toISOString();
  }
  refreshAlertsData();
  return res.status(201).json(newItem);
});

app.put('/api/inventory/:id/stock', (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const { quantity } = req.body;
  const item = inventory.find((i) => i.id === id);
  if (!item) return res.status(404).json({ message: 'Inventory item not found' });

  item.quantity = Math.max(0, Number(quantity) || 0);
  item.status = computeInventoryStatus(item.quantity, item.reorderLevel);

  // Sync to stock items
  const stock = stockItems.find((s) => s.id === item.medicineId || s.medicineName === item.medicineName);
  if (stock) {
    stock.quantity = item.quantity;
    stock.status = item.status;
    stock.updatedAt = new Date().toISOString();
  }

  refreshAlertsData();
  return res.json(item);
});

// Stock Routes
app.get('/api/stock', (_req: Request, res: Response) => {
  return res.json(stockItems);
});

app.patch('/api/stock/:id', (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const { quantity } = req.body;
  const stock = stockItems.find((s) => s.id === id);
  if (!stock) return res.status(404).json({ message: 'Stock item not found' });

  stock.quantity = Math.max(0, Number(quantity) || 0);
  stock.status = computeInventoryStatus(stock.quantity, stock.reorderLevel);
  stock.updatedAt = new Date().toISOString();

  // Sync to inventory
  const inv = inventory.find((i) => i.medicineId === id || i.medicineName === stock.medicineName);
  if (inv) {
    inv.quantity = stock.quantity;
    inv.status = stock.status as any;
  }

  refreshAlertsData();
  return res.json(stock);
});

app.post('/api/stock/refresh-alerts', (_req: Request, res: Response) => {
  refreshAlertsData();
  return res.status(200).send();
});

// Dashboard Summary Route
app.get('/api/dashboard/summary', (_req: Request, res: Response) => {
  const totalSuppliers = suppliers.length;
  const activeSuppliers = suppliers.filter((s) => s.status === 'ACTIVE').length;
  const totalMedicineItems = stockItems.length;
  const optimalStockItems = stockItems.filter((s) => s.quantity > s.reorderLevel).length;
  const lowStockItems = stockItems.filter((s) => s.quantity > 0 && s.quantity <= s.reorderLevel).length;
  const outOfStockItems = stockItems.filter((s) => s.quantity === 0).length;
  const openAlerts = alerts.filter((a) => a.status === 'OPEN').length;
  const acknowledgedAlerts = alerts.filter((a) => a.status === 'ACKNOWLEDGED').length;
  const criticalActiveAlerts = alerts.filter((a) => a.severity === 'CRITICAL' && a.status === 'OPEN').length;

  return res.json({
    totalSuppliers,
    activeSuppliers,
    totalMedicineItems,
    optimalStockItems,
    lowStockItems,
    outOfStockItems,
    openAlerts,
    acknowledgedAlerts,
    criticalActiveAlerts,
  });
});

app.get('/api/supplier/dashboard/stats', (_req: Request, res: Response) => {
  const totalSuppliers = suppliers.length;
  const activeSuppliers = suppliers.filter((s) => s.status === 'ACTIVE').length;
  const totalMedicineItems = stockItems.length;
  const optimalStockItems = stockItems.filter((s) => s.quantity > s.reorderLevel).length;
  const lowStockItems = stockItems.filter((s) => s.quantity > 0 && s.quantity <= s.reorderLevel).length;
  const outOfStockItems = stockItems.filter((s) => s.quantity === 0).length;
  const openAlerts = alerts.filter((a) => a.status === 'OPEN').length;
  const acknowledgedAlerts = alerts.filter((a) => a.status === 'ACKNOWLEDGED').length;
  const criticalActiveAlerts = alerts.filter((a) => a.severity === 'CRITICAL' && a.status === 'OPEN').length;

  return res.json({
    totalSuppliers,
    activeSuppliers,
    totalMedicineItems,
    optimalStockItems,
    lowStockItems,
    outOfStockItems,
    openAlerts,
    acknowledgedAlerts,
    criticalActiveAlerts,
  });
});

// Suppliers Routes
app.get('/api/suppliers', (req: Request, res: Response) => {
  const search = req.query.search as string;
  const status = req.query.status as string;

  let results = [...suppliers];
  if (search && search.trim()) {
    const q = search.toLowerCase();
    results = results.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.contactPerson.toLowerCase().includes(q) ||
        s.city.toLowerCase().includes(q) ||
        s.state.toLowerCase().includes(q)
    );
  }
  if (status && status.trim()) {
    results = results.filter((s) => s.status.toLowerCase() === status.toLowerCase());
  }

  return res.json(results);
});

app.get('/api/suppliers/:id', (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const sup = suppliers.find((s) => s.id === id);
  if (!sup) return res.status(404).json({ message: 'Supplier not found' });
  return res.json(sup);
});

app.post('/api/suppliers', (req: Request, res: Response) => {
  const { name, contactPerson, email, phone, address, city, state, pincode, gstNumber, licenseNumber, rating, leadTimeDays, status } = req.body;
  const newSup: Supplier = {
    id: suppliers.length > 0 ? Math.max(...suppliers.map((s) => s.id)) + 1 : 1,
    name: name || 'New Supplier',
    contactPerson: contactPerson || '',
    email: email || '',
    phone: phone || '',
    address: address || '',
    city: city || '',
    state: state || '',
    pincode: pincode || '',
    gstNumber: gstNumber || '',
    licenseNumber: licenseNumber || '',
    status: (status && status.toUpperCase() === 'INACTIVE') ? 'INACTIVE' : 'ACTIVE',
    rating: Number(rating) || 4.5,
    leadTimeDays: Number(leadTimeDays) || 3,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  suppliers.push(newSup);
  return res.status(201).json(newSup);
});

app.put('/api/suppliers/:id', (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const index = suppliers.findIndex((s) => s.id === id);
  if (index === -1) return res.status(404).json({ message: 'Supplier not found' });

  suppliers[index] = {
    ...suppliers[index],
    ...req.body,
    id,
    updatedAt: new Date().toISOString(),
  };
  return res.json(suppliers[index]);
});

app.delete('/api/suppliers/:id', (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const index = suppliers.findIndex((s) => s.id === id);
  if (index === -1) return res.status(404).json({ message: 'Supplier not found' });

  suppliers.splice(index, 1);
  return res.status(204).send();
});

// Alerts Routes
app.get('/api/alerts', (req: Request, res: Response) => {
  const status = req.query.status as string;
  const severity = req.query.severity as string;
  const type = req.query.type as string;

  let results = [...alerts];
  if (status && status.trim()) {
    results = results.filter((a) => a.status.toLowerCase() === status.toLowerCase());
  }
  if (severity && severity.trim()) {
    results = results.filter((a) => a.severity.toLowerCase() === severity.toLowerCase());
  }
  if (type && type.trim()) {
    results = results.filter((a) => a.type.toLowerCase() === type.toLowerCase());
  }

  return res.json(results);
});

app.get('/api/alerts/:id', (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const alert = alerts.find((a) => a.id === id);
  if (!alert) return res.status(404).json({ message: 'Alert not found' });
  return res.json(alert);
});

app.post('/api/alerts', (req: Request, res: Response) => {
  const { type, severity, title, message, referenceKey, medicineId, medicineName, currentStock, thresholdStock, supplierId, supplierName } = req.body;
  const newAlert: Alert = {
    id: alerts.length > 0 ? Math.max(...alerts.map((a) => a.id)) + 1 : 1,
    type: type || 'CUSTOM',
    severity: severity || 'WARNING',
    status: 'OPEN',
    title: title || 'Custom Alert',
    message: message || '',
    referenceKey: referenceKey || `REF-${Date.now()}`,
    medicineId: medicineId || null,
    medicineName: medicineName || null,
    currentStock: currentStock || 0,
    thresholdStock: thresholdStock || 0,
    supplierId: supplierId || null,
    supplierName: supplierName || null,
    actedBy: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    acknowledgedAt: null,
    resolvedAt: null,
  };
  alerts.push(newAlert);
  return res.status(201).json(newAlert);
});

app.post('/api/alerts/detect-low-stock', (req: Request, res: Response) => {
  const { items } = req.body;
  let checked = 0;
  let lowStock = 0;
  let outOfStock = 0;
  let recovered = 0;

  if (Array.isArray(items)) {
    checked = items.length;
    items.forEach((item: any) => {
      if (item.quantity === 0) outOfStock++;
      else if (item.quantity <= (item.reorderLevel || 10)) lowStock++;
      else recovered++;
    });
  }

  refreshAlertsData();
  const activeAlerts = alerts.filter((a) => a.status === 'OPEN');
  return res.json({
    checked,
    lowStock,
    outOfStock,
    recovered,
    activeAlerts,
  });
});

app.patch('/api/alerts/:id/acknowledge', (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const alert = alerts.find((a) => a.id === id);
  if (!alert) return res.status(404).json({ message: 'Alert not found' });

  alert.status = 'ACKNOWLEDGED';
  alert.acknowledgedAt = new Date().toISOString();
  alert.updatedAt = new Date().toISOString();
  alert.actedBy = (req.headers['authorization'] as string) || 'Authorized User';

  return res.json(alert);
});

app.patch('/api/alerts/:id/resolve', (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const alert = alerts.find((a) => a.id === id);
  if (!alert) return res.status(404).json({ message: 'Alert not found' });

  alert.status = 'RESOLVED';
  alert.resolvedAt = new Date().toISOString();
  alert.updatedAt = new Date().toISOString();
  alert.actedBy = (req.headers['authorization'] as string) || 'Authorized User';

  return res.json(alert);
});

app.delete('/api/alerts/:id', (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const index = alerts.findIndex((a) => a.id === id);
  if (index === -1) return res.status(404).json({ message: 'Alert not found' });

  alerts.splice(index, 1);
  return res.status(204).send();
});

// ==========================================
// Vite Dev Server / Static Production Server
// ==========================================

async function startServer() {
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: { middlewareMode: true, host: HOST },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, HOST, () => {
    console.log(`[MediStock] Server listening on http://${HOST}:${PORT}`);
  });
}

startServer();
