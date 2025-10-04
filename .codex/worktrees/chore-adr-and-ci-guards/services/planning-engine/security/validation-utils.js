
// 输入验证工具
import validator from 'validator';
import xss from 'xss';

export const sanitizeInput = (input) => {
  if (typeof input === 'string') {
    return xss(validator.escape(input.trim()));
  }
  return input;
};

export const validateEmail = (email) => {
  return validator.isEmail(email);
};

export const validatePassword = (password) => {
  return password && password.length >= 8 && /[A-Z]/.test(password) && /[0-9]/.test(password);
};

export const validateUserId = (userId) => {
  return validator.isUUID(userId);
};
