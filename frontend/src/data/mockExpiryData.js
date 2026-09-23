/**
 * MOCK / DEMO DATA — Milestone 3, Frontend 1 (Expiry + Inventory Analytics)
 * -------------------------------------------------------------------------
 * The current Medicine model / backend API (Milestone 2) does NOT yet
 * expose "batchNumber" or "expiryDate". Milestone 3's expiry backend
 * endpoints are not available yet either.
 *
 * This file is a clearly-labelled MOCK DATA SOURCE so the Expiry +
 * Inventory Analytics UI can be built and demoed end-to-end right now.
 *
 * When the real Milestone 3 expiry API is ready, replace the calls to
 * `decorateWithMockExpiry` / `MOCK_EXPIRY_MEDICINES` in
 * `src/pages/ExpiryAnalytics.jsx` with the real API response — every
 * component below already expects the exact same shape:
 *
 *   { id, name, category, manufacturer, batchNumber, expiryDate, quantity }
 *
 * so no other file needs to change.
 */

// Adds/subtracts days from "today" and returns YYYY-MM-DD.
const addDays = (days) => {
    const date = new Date();
    date.setDate(date.getDate() + days);
    return date.toISOString().split("T")[0];
};

// Standalone fallback dataset — used only when the real Medicine API
// cannot be reached at all (e.g. backend not running), so the page can
// still be demoed offline.
export const MOCK_EXPIRY_MEDICINES = [
    { id: "m1", name: "Paracetamol 500mg", category: "Tablet", manufacturer: "Cipla", batchNumber: "BT-24011", quantity: 120, expiryDate: addDays(-18) },
    { id: "m2", name: "Amoxicillin 250mg", category: "Capsule", manufacturer: "Sun Pharma", batchNumber: "BT-24022", quantity: 60, expiryDate: addDays(-4) },
    { id: "m3", name: "Cough Syrup", category: "Syrup", manufacturer: "Dr. Reddy's", batchNumber: "BT-24033", quantity: 35, expiryDate: addDays(6) },
    { id: "m4", name: "Insulin Injection", category: "Injection", manufacturer: "Biocon", batchNumber: "BT-24044", quantity: 15, expiryDate: addDays(12) },
    { id: "m5", name: "Ibuprofen 400mg", category: "Tablet", manufacturer: "Cipla", batchNumber: "BT-24055", quantity: 200, expiryDate: addDays(21) },
    { id: "m6", name: "Vitamin C Tablet", category: "Tablet", manufacturer: "Himalaya", batchNumber: "BT-24066", quantity: 150, expiryDate: addDays(29) },
    { id: "m7", name: "Azithromycin 500mg", category: "Tablet", manufacturer: "Sun Pharma", batchNumber: "BT-24077", quantity: 45, expiryDate: addDays(45) },
    { id: "m8", name: "Cetirizine 10mg", category: "Tablet", manufacturer: "Cipla", batchNumber: "BT-24088", quantity: 80, expiryDate: addDays(90) },
    { id: "m9", name: "Multivitamin Capsule", category: "Capsule", manufacturer: "Himalaya", batchNumber: "BT-24099", quantity: 100, expiryDate: addDays(150) },
    { id: "m10", name: "Antacid Syrup", category: "Syrup", manufacturer: "Dr. Reddy's", batchNumber: "BT-24110", quantity: 40, expiryDate: addDays(200) },
    { id: "m11", name: "Tetanus Injection", category: "Injection", manufacturer: "Biocon", batchNumber: "BT-24121", quantity: 25, expiryDate: addDays(-30) },
    { id: "m12", name: "Omeprazole 20mg", category: "Capsule", manufacturer: "Sun Pharma", batchNumber: "BT-24132", quantity: 70, expiryDate: addDays(3) },
    { id: "m13", name: "Diclofenac Gel", category: "Tablet", manufacturer: "Himalaya", batchNumber: "BT-24143", quantity: 55, expiryDate: addDays(365) },
    { id: "m14", name: "ORS Powder", category: "Syrup", manufacturer: "Cipla", batchNumber: "BT-24154", quantity: 90, expiryDate: addDays(-2) },
    { id: "m15", name: "B-Complex Injection", category: "Injection", manufacturer: "Biocon", batchNumber: "BT-24165", quantity: 18, expiryDate: addDays(27) },
];

// Deterministic pseudo-random day offset derived from a medicine's id/name,
// so the same real medicine always gets the same mock batch/expiry values
// across renders and reloads.
const seededOffset = (key) => {
    const str = String(key ?? "medicine");
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = (hash * 31 + str.charCodeAt(i)) >>> 0;
    }
    const offsets = [-25, -14, -6, -1, 4, 9, 15, 22, 29, 40, 65, 100, 180, 300, 400];
    return offsets[hash % offsets.length];
};

const seededBatch = (key) => {
    const str = String(key ?? "0");
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = (hash * 17 + str.charCodeAt(i)) >>> 0;
    }
    return `BT-${(hash % 90000 + 10000)}`;
};

/**
 * Takes a real medicine object (from the Milestone 2 Medicine API) and
 * attaches mock batchNumber/expiryDate fields ONLY if they are missing,
 * so this becomes a no-op automatically once the real backend adds them.
 */
export const decorateWithMockExpiry = (medicine) => {
    const key = medicine.id ?? medicine.name;

    return {
        ...medicine,
        batchNumber: medicine.batchNumber || seededBatch(key),
        expiryDate: medicine.expiryDate || addDays(seededOffset(key)),
        quantity: medicine.quantity ?? 0,
    };
};
