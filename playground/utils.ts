export function getRealAmountValue(cashflow_type: -1 | 1, amount: number) {
	return cashflow_type * amount;
}

// Sortear o cashflow_type (-1 = saída, 1 = entrada)
export function getCashflowType(): -1 | 1 {
	return Math.random() > 0.5 ? -1 : 1;
}
