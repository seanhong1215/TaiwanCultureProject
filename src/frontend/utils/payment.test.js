import { describe, it, expect } from 'vitest';
import { detectCardBrand, getCardLast4, maskCardNumber, toSafePaymentRecord } from './payment';

describe('detectCardBrand', () => {
  it.each([
    ['4111111111111111', 'VISA'],
    ['5500005555555559', 'MasterCard'],
    ['3530111333300000', 'JCB'],
    ['371449635398431', 'AMEX'],
    ['9999999999999999', 'UNKNOWN'],
  ])('%s 應判斷為 %s', (cardNumber, expected) => {
    expect(detectCardBrand(cardNumber)).toBe(expected);
  });

  it('忽略卡號中的分隔符號', () => {
    expect(detectCardBrand('4111-1111-1111-1111')).toBe('VISA');
    expect(detectCardBrand('4111 1111 1111 1111')).toBe('VISA');
  });

  it('空值不應拋出例外', () => {
    expect(detectCardBrand(undefined)).toBe('UNKNOWN');
    expect(detectCardBrand('')).toBe('UNKNOWN');
  });
});

describe('getCardLast4', () => {
  it('只取數字部分的末四碼', () => {
    expect(getCardLast4('4111-1111-1111-9876')).toBe('9876');
  });

  it('位數不足時回傳空字串', () => {
    expect(getCardLast4('12')).toBe('');
    expect(getCardLast4('')).toBe('');
  });
});

describe('maskCardNumber', () => {
  it('只顯示末四碼', () => {
    expect(maskCardNumber('4111111111119876')).toBe('**** **** **** 9876');
  });

  it('無效卡號回傳空字串', () => {
    expect(maskCardNumber('abc')).toBe('');
  });
});

describe('toSafePaymentRecord', () => {
  const formData = {
    contactName: '王小明',
    cardNumber: '4111-1111-1111-9876',
    expiryDate: '05/28',
    cvv: '123',
  };

  it('保留對帳所需的欄位', () => {
    expect(toSafePaymentRecord(formData)).toEqual({
      contactName: '王小明',
      cardBrand: 'VISA',
      cardLast4: '9876',
    });
  });

  // 這是本模組存在的理由：完整卡號 / 有效期限 / CVV 依 PCI-DSS 不得寫入資料庫
  it.each(['cardNumber', 'expiryDate', 'cvv'])('不得輸出敏感欄位 %s', (field) => {
    expect(toSafePaymentRecord(formData)).not.toHaveProperty(field);
  });

  it('表單新增未知欄位時不會被一併帶出（白名單而非黑名單）', () => {
    const withExtra = { ...formData, cardPin: '9999', fullPan: '4111111111119876' };
    expect(Object.keys(toSafePaymentRecord(withExtra)).sort()).toEqual([
      'cardBrand',
      'cardLast4',
      'contactName',
    ]);
  });

  it('沒有傳入表單時回傳安全的預設值', () => {
    expect(toSafePaymentRecord()).toEqual({
      contactName: '',
      cardBrand: 'UNKNOWN',
      cardLast4: '',
    });
  });
});
