function calculatePctPips(firstNumber: number | null | string, secondNumber: number | null | string, symbol: string): string | number {
  if (firstNumber === null || secondNumber === null) return 0;
  if (firstNumber === '' || secondNumber === '') return 0;
  if (firstNumber === 0 || secondNumber === 0) return 0;

  let pips = Math.abs(Math.round((Number(firstNumber) - Number(secondNumber)) * 10000));
  // check if symbol contains 'JPY' or 'jpy' and if so, divide by 100
  if (symbol.includes('JPY') || symbol.includes('jpy')) pips = pips / 100;

  let pct = ((Number(firstNumber) - Number(secondNumber)) / Number(firstNumber)) * 100;
  pct = Math.round((pct + Number.EPSILON) * 1000000) / 1000000;
  pct = Math.abs(pct);

  return `${pct}%  ||  ${pips} pips `;
}

export { calculatePctPips };
