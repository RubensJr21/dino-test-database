export function getRealAmountValue(
	cashflow_type: -1 | 1,
	amount: number,
	inverse: boolean = false
) {
	// para não precisar verificar se tem que somar ou subtrair do saldo
	const multiplyFactor = inverse ? -1 : 1;
	return (cashflow_type * amount) * multiplyFactor;
}

// Sortear o cashflow_type (-1 = saída, 1 = entrada)
export function getCashflowType(): -1 | 1 {
	return Math.random() > 0.5 ? -1 : 1;
}
