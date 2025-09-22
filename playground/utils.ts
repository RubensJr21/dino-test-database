export function getRealAmountValue(
	cashflow_type: Cashflow_Type,
	amount: number,
	inverse: boolean = false
) {
	// para não precisar verificar se tem que somar ou subtrair do saldo
	const multiplyFactor = inverse ? -1 : 1;
	return cashflow_type * amount * multiplyFactor;
}

// Sortear o cashflow_type (-1 = saída, 1 = entrada)
export function drawCashflowType(): Cashflow_Type {
	return Math.random() > 0.5 ? -1 : 1;
}

export function randomFloatBetween(min: number, max: number) {
	return Math.random() * (max - min) + min;
}

export function randomIntBetween(min: number, max: number) {
	min = Math.ceil(min); // Ensure min is rounded up
	max = Math.floor(max); // Ensure max is rounded down
	return Math.floor(Math.random() * (max - min)) + min;
}

export function randomIndex(size: number) {
	return randomIntBetween(0, size);
}

export function randomFutureDate(daysAhead = 0) {
	const today = new Date();

	// gera número aleatório de dias no intervalo [0, daysAhead]
	const randomDays = Math.floor(Math.random() * (daysAhead + 1));

	// cria nova data adicionando os dias
	const result = new Date(today);
	result.setDate(today.getDate() + randomDays);

	return result;
}

export function randomRangeDate() {
	const start_date = randomFutureDate();
	const shouldHaveEndDate = Math.random() > 0.75;
	return {
		start_date,
		end_date: shouldHaveEndDate
			? randomFutureDate(start_date.getDate() + 60)
			: null,
	};
}
