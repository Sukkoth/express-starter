import { OtpCharacters } from '@/types/otp';

/**
 * @param length - The length of the OTP to generate.
 * @param charSet - The character set to use for the OTP.
 * @returns The generated OTP as a string.
 */
function generateOtp(length: number, charSet: OtpCharacters) {
  const characters = {
    [OtpCharacters.numeric]: '0123456789',
    [OtpCharacters.alphabetic]:
      'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ',
    [OtpCharacters.alphanumeric]:
      '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ',
  };

  const characterSet = characters[charSet];
  let otp = '';

  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * characterSet.length);
    otp += characterSet[randomIndex];
  }

  return otp;
}

export default { generateOtp };
