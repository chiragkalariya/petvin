/**
 * Costing engine for laser cutting + bending jobs.
 *
 * Pricing model (mixed):
 *  - Material cost   = weight (kg) x rate per kg
 *  - Cutting cost     = cutting length (m) x rate per metre
 *  - Bending cost      = number of bends x rate per bend
 *  - Wastage %         applied on top of material cost only
 *  - Margin %          applied on the subtotal (material + cutting + bending + wastage)
 *  - GST %             applied last, on (subtotal + margin)
 *
 * This is a pure function -- no I/O, no side effects -- so it can be reused
 * on the client (live preview while typing) and on the server (source of
 * truth when a quote is actually saved).
 */

export interface CostingInput {
  weightKg: number;
  materialRatePerKg: number;
  cuttingLengthM: number;
  cuttingRatePerM: number;
  bendCount: number;
  bendRatePerBend: number;
  wastagePercent: number;
  marginPercent: number;
  gstPercent: number;
}

export interface CostingResult {
  materialCost: number;
  cuttingCost: number;
  bendingCost: number;
  wastageCost: number;
  subtotal: number;
  marginAmount: number;
  taxAmount: number;
  totalCost: number;
}

/** Round to 2 decimal places, avoiding floating point artifacts like 12.230000001. */
function round2(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

export function calculateCosting(input: CostingInput): CostingResult {
  const materialCost = Math.max(0, input.weightKg) * Math.max(0, input.materialRatePerKg);
  const cuttingCost = Math.max(0, input.cuttingLengthM) * Math.max(0, input.cuttingRatePerM);
  const bendingCost = Math.max(0, input.bendCount) * Math.max(0, input.bendRatePerBend);

  const wastageCost = materialCost * (Math.max(0, input.wastagePercent) / 100);

  const subtotal = materialCost + cuttingCost + bendingCost + wastageCost;

  const marginAmount = subtotal * (Math.max(0, input.marginPercent) / 100);
  const taxableAmount = subtotal + marginAmount;
  const taxAmount = taxableAmount * (Math.max(0, input.gstPercent) / 100);

  const totalCost = taxableAmount + taxAmount;

  return {
    materialCost: round2(materialCost),
    cuttingCost: round2(cuttingCost),
    bendingCost: round2(bendingCost),
    wastageCost: round2(wastageCost),
    subtotal: round2(subtotal),
    marginAmount: round2(marginAmount),
    taxAmount: round2(taxAmount),
    totalCost: round2(totalCost),
  };
}

export const DEFAULT_COSTING_INPUT: CostingInput = {
  weightKg: 0,
  materialRatePerKg: 0,
  cuttingLengthM: 0,
  cuttingRatePerM: 0,
  bendCount: 0,
  bendRatePerBend: 0,
  wastagePercent: 5,
  marginPercent: 15,
  gstPercent: 18,
};

export const MATERIAL_TYPES = [
  "Mild Steel (MS)",
  "Stainless Steel (SS)",
  "Aluminum",
  "Brass",
  "Other",
] as const;
