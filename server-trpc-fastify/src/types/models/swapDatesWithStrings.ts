export type SwapDatesWithStrings<T> = T extends Date
    ? string
    : T extends object
    ? { [k in keyof T]: SwapDatesWithStrings<T[k]> }
    : T;
