/**
 * @param value
 * @returns
 * @description Verifies that the time input is valid - TDI17 deposit_time occasionally has a 0 as the deposit_time value
 */

const verifyTimeInputIsValid = (value: string): boolean => {
  if (value.split('').length < 4) {
    return false;
  }
  return true;
};

/**
 *
 * @param value
 * @returns
 * @description Sets the time format to HHMMSS in order to be compatible with the database
 */

export const timeFormat = (value: string): string | null => {
  if (verifyTimeInputIsValid(value)) {
    return `${value}00`;
  } else {
    return null;
  }
};

export const dateFormat = (value: string): string => {
  const date = {
    year: value.slice(0, 4),
    month: value.slice(4, 6),
    day: value.slice(6, 8)
  };
  return `${date.year}-${date.month}-${date.day}`;
};

export const decimalFormat = (value: string): string => {
  const stringLength = value.split('').length;
  const decimalPlace = stringLength - 2;
  return (
    parseInt(value.slice(0, decimalPlace)) +
    '.' +
    value.slice(decimalPlace, stringLength)
  );
};
