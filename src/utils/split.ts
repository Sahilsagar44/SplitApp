import { Expense, Person, Payer, Payment } from '../storage/storage';

export const calculateEqualSplit = (amount: number, count: number): number => {
  if (count === 0) return 0;
  return amount / count;
};

export const formatCurrency = (amount: number): string => {
  return `₹${amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

export const getInitials = (name: string): string => {
  return name.charAt(0).toUpperCase();
};

export const getRandomSoftColor = (id: string): string => {
  const colors = [
    '#E3F2FD', // Blue
    '#F3E5F5', // Purple
    '#E8F5E9', // Green
    '#FFF3E0', // Orange
    '#FCE4EC', // Pink
    '#E0F7FA', // Cyan
    '#FFFDE7', // Yellow
    '#F1F8E9', // Light Green
  ];
  const index = id.charCodeAt(0) % colors.length;
  return colors[index];
};

export const getContrastColor = (id: string): string => {
  const colors = [
    '#1976D2', // Blue
    '#7B1FA2', // Purple
    '#388E3C', // Green
    '#F57C00', // Orange
    '#C2185B', // Pink
    '#0097A7', // Cyan
    '#AFB42B', // Yellow
    '#689F38', // Light Green
  ];
  const index = id.charCodeAt(0) % colors.length;
  return colors[index];
};

export interface BalanceSummary {
  personId: string;
  name: string;
  netBalance: number; // Positive means they are owed, negative means they owe
}

export const calculateBalances = (
  people: Person[], 
  expenses: Expense[], 
  payments: Payment[] = []
): BalanceSummary[] => {
  const balances: { [id: string]: number } = {};
  
  people.forEach(p => balances[p.id] = 0);

  // 1. Calculate balances from expenses (Paid - Share)
  expenses.forEach(exp => {
    // Add contributions from each payer
    exp.payers.forEach(payer => {
      if (balances[payer.personId] !== undefined) {
        balances[payer.personId] += payer.amount;
      }
    });

    // Subtract shares for each participant
    const splitCount = exp.splitBetween.length;
    if (splitCount > 0) {
      const perPerson = exp.amount / splitCount;
      exp.splitBetween.forEach(pid => {
        if (balances[pid] !== undefined) {
          balances[pid] -= perPerson;
        }
      });
    }
  });

  // 2. Adjust balances for recorded payments
  payments.forEach(pay => {
    // The person who paid ('from') gets a positive adjustment (their net balance increases)
    if (balances[pay.from] !== undefined) {
      balances[pay.from] += pay.amount;
    }
    // The person who received ('to') gets a negative adjustment (they are now owed less)
    if (balances[pay.to] !== undefined) {
      balances[pay.to] -= pay.amount;
    }
  });

  return people.map(p => ({
    personId: p.id,
    name: p.name,
    netBalance: balances[p.id],
  }));
};

/**
 * Robust splitting logic that handles rounding of the remainder to the first person.
 */
export const splitAndRound = (totalAmount: number, count: number): number[] => {
  if (count <= 0) return [];
  
  // Basic share rounded down to 2 decimals
  const share = Number((totalAmount / count).toFixed(2));
  const result = new Array(count).fill(share);
  
  // Calculate the difference due to recurring decimals
  const currentSum = result.reduce((sum, val) => sum + val, 0);
  const diff = Number((totalAmount - currentSum).toFixed(2));
  
  // Add the difference to the first person (could be positive or negative)
  if (diff !== 0) {
    result[0] = Number((result[0] + diff).toFixed(2));
  }
  
  return result;
};

/**
 * Automatically generates a list of payers with equal amounts distributed and rounded accurately.
 */
export const autoAddAllPayers = (splitBetween: string[], totalAmount: number): { personId: string; amount: string }[] => {
  if (splitBetween.length === 0) return [];
  
  const amounts = splitAndRound(totalAmount, splitBetween.length);
  
  return splitBetween.map((personId, idx) => ({
    personId,
    amount: amounts[idx].toString(),
  }));
};

export interface Settlement {
  from: string;
  to: string;
  amount: number;
}

export const calculateSettlements = (balances: BalanceSummary[]): Settlement[] => {
  const debtors = balances
    .filter(b => b.netBalance < -0.01)
    .map(b => ({ ...b, netBalance: Math.abs(b.netBalance) }))
    .sort((a, b) => b.netBalance - a.netBalance);
    
  const creditors = balances
    .filter(b => b.netBalance > 0.01)
    .sort((a, b) => b.netBalance - a.netBalance);
    
  const settlements: Settlement[] = [];
  
  let i = 0; // debtor index
  let j = 0; // creditor index
  
  while (i < debtors.length && j < creditors.length) {
    const debtor = debtors[i];
    const creditor = creditors[j];
    
    const amount = Math.min(debtor.netBalance, creditor.netBalance);
    settlements.push({
      from: debtor.name,
      to: creditor.name,
      amount,
    });
    
    debtor.netBalance -= amount;
    creditor.netBalance -= amount;
    
    if (debtor.netBalance < 0.01) i++;
    if (creditor.netBalance < 0.01) j++;
  }
  
  return settlements;
};
