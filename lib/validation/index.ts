import { OrderCreationInput } from "@/types";

export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

export function validateOrderInput(input: Partial<OrderCreationInput>): ValidationResult {
  const errors: Record<string, string> = {};

  if (!input.orderNumber || !input.orderNumber.trim()) {
    errors.orderNumber = "يرجى إدخال رقم الطلب بشكل صحيح.";
  } else if (input.orderNumber.trim().length > 30) {
    errors.orderNumber = "رقم الطلب طويل جداً (الحد الأقصى 30 حرف/رقم).";
  }

  if (!input.orderTicketImage) {
    errors.orderTicketImage = "يرجى التقاط أو رفع صورة تذكرة الطلب.";
  }

  if (!input.receiptImage) {
    errors.receiptImage = "يرجى التقاط أو رفع صورة الفاتورة / الإيصال.";
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

export function validateRestaurantInput(input: { nameAr: string; name: string }): ValidationResult {
  const errors: Record<string, string> = {};

  if (!input.nameAr || !input.nameAr.trim()) {
    errors.nameAr = "اسم المطعم باللغة العربية مطلوب.";
  }

  if (!input.name || !input.name.trim()) {
    errors.name = "اسم المطعم بالإنجليزية مطلوب.";
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}
