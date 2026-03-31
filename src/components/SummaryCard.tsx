import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { BalanceSummary, formatCurrency, calculateSettlements } from '../utils/split';

interface SummaryCardProps {
  balances: BalanceSummary[];
}

const SummaryCard: React.FC<SummaryCardProps> = ({ balances }) => {
  const settlements = calculateSettlements(balances);
  
  const totalOwedToUser = balances.reduce((sum, b) => b.netBalance > 0 ? sum + b.netBalance : sum, 0);
  const totalUserOwes = Math.abs(balances.reduce((sum, b) => b.netBalance < 0 ? sum + b.netBalance : sum, 0));

  return (
    <View style={styles.container}>
      <View style={styles.inner}>
        <View style={styles.section}>
          <Text style={styles.label}>Owed to group</Text>
          <Text style={[styles.amount, styles.owedAmount]}>
            {formatCurrency(totalOwedToUser)}
          </Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.section}>
          <Text style={styles.label}>Total Debt</Text>
          <Text style={[styles.amount, styles.debtAmount]}>
            {formatCurrency(totalUserOwes)}
          </Text>
        </View>
      </View>
      
      <View style={styles.settlementSection}>
        <Text style={styles.settlementTitle}>Settlement Instructions</Text>
        
        {settlements.length > 0 ? (
          settlements.map((s, idx) => (
            <View key={idx} style={styles.settlementRow}>
              <View style={styles.dot} />
              <Text style={styles.settlementText}>
                <Text style={styles.bold}>{s.from}</Text> owes <Text style={styles.bold}>{s.to}</Text>
                {' '}<Text style={styles.amountText}>{formatCurrency(s.amount)}</Text>
              </Text>
            </View>
          ))
        ) : (
          <Text style={styles.emptyText}>All settled up! 🤝</Text>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 20,
    marginHorizontal: 20,
    marginTop: 20,
    elevation: 8,
    shadowColor: '#4361EE',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    overflow: 'hidden',
  },
  inner: {
    flexDirection: 'row',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F3F5',
  },
  section: {
    flex: 1,
    alignItems: 'center',
  },
  label: {
    fontSize: 11,
    color: '#8E9AAF',
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  amount: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  owedAmount: {
    color: '#00C853',
  },
  debtAmount: {
    color: '#FF5252',
  },
  divider: {
    width: 1,
    backgroundColor: '#F1F3F5',
    marginHorizontal: 10,
  },
  settlementSection: {
    backgroundColor: '#F8F9FE',
    padding: 15,
  },
  settlementTitle: {
    fontSize: 12,
    color: '#606C81',
    fontWeight: '700',
    marginBottom: 10,
    textTransform: 'uppercase',
  },
  settlementRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#4361EE',
    marginRight: 10,
  },
  settlementText: {
    fontSize: 14,
    color: '#2D3436',
    flex: 1,
  },
  bold: {
    fontWeight: '700',
    color: '#2D3436',
  },
  amountText: {
    color: '#4361EE',
    fontWeight: '700',
  },
  emptyText: {
    fontSize: 14,
    color: '#636E72',
    fontStyle: 'italic',
    textAlign: 'center',
    marginVertical: 5,
  },
});

export default SummaryCard;
