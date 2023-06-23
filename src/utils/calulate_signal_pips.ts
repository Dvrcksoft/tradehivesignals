function calculateSignalPips(firstNumber: number | null | string, secondNumber: number | null | string, symbol: string): number {
  if (firstNumber === null || secondNumber === null) return 0;
  if (firstNumber === '' || secondNumber === '') return 0;
  if (firstNumber === 0 || secondNumber === 0) return 0;

  let val = Math.abs(Math.round((Number(firstNumber) - Number(secondNumber)) * 10000));
  // check if symbol contains 'JPY' or 'jpy' and if so, divide by 100
  if (symbol.includes('JPY') || symbol.includes('jpy')) val = val / 100;

  return val;
}

export { calculateSignalPips };
