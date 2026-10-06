// One list of error codes for the whole interface service, each with a sentence
// a member can act on, in English and Urdu. Work register item: "Shared error
// code list with a member facing sentence for each code, in English and Urdu".
//
// Rules this file exists to enforce:
//   - every failure the member sees carries a CODE, so the application can act
//     on it and support can look it up, and a SENTENCE, so the member knows
//     what to do next;
//   - no sentence names an internal field, a table, a stack frame or another
//     member;
//   - no sentence blames the member for something the service did.
export type ErrorCode =
  | 'VALIDATION_FAILED' | 'SIGN_IN_REQUIRED' | 'SESSION_EXPIRED' | 'WRONG_PIN' | 'PIN_LOCKED'
  | 'NOT_ALLOWED' | 'NOT_FOUND' | 'ALREADY_EXISTS' | 'ALREADY_DONE' | 'CONFLICT'
  | 'TOO_MANY_REQUESTS' | 'COOLING_OFF' | 'SEAT_NOT_ALLOWED' | 'AFFORDABILITY'
  | 'PAYMENT_FAILED' | 'PARTNER_UNAVAILABLE' | 'SERVICE_ERROR';

type Message = { status: number; en: string; ur: string };

export const ERRORS: Record<ErrorCode, Message> = {
  VALIDATION_FAILED: { status: 400, en: 'Some details need fixing. Check the highlighted fields and try again.', ur: 'کچھ تفصیلات درست کرنی ہیں۔ نشان زدہ خانے دیکھ کر دوبارہ کوشش کریں۔' },
  SIGN_IN_REQUIRED: { status: 401, en: 'Please sign in to continue.', ur: 'جاری رکھنے کے لیے سائن اِن کریں۔' },
  SESSION_EXPIRED: { status: 401, en: 'You were signed out. Sign in again to continue.', ur: 'آپ سائن آؤٹ ہو گئے۔ جاری رکھنے کے لیے دوبارہ سائن اِن کریں۔' },
  WRONG_PIN: { status: 401, en: 'That PIN is not right. Try again.', ur: 'یہ پن درست نہیں۔ دوبارہ کوشش کریں۔' },
  PIN_LOCKED: { status: 423, en: 'Too many wrong PINs. Try again in fifteen minutes.', ur: 'کئی بار غلط پن۔ پندرہ منٹ بعد دوبارہ کوشش کریں۔' },
  NOT_ALLOWED: { status: 403, en: 'This is not available to you.', ur: 'یہ آپ کے لیے دستیاب نہیں۔' },
  NOT_FOUND: { status: 404, en: 'That is no longer there.', ur: 'یہ اب موجود نہیں۔' },
  ALREADY_EXISTS: { status: 409, en: 'That already exists.', ur: 'یہ پہلے سے موجود ہے۔' },
  ALREADY_DONE: { status: 409, en: 'This was already done. Nothing was charged twice.', ur: 'یہ پہلے ہو چکا ہے۔ رقم دوبارہ نہیں لی گئی۔' },
  CONFLICT: { status: 409, en: 'Something changed while you were on this screen. Open it again.', ur: 'اس دوران کچھ تبدیل ہو گیا۔ اسکرین دوبارہ کھولیں۔' },
  TOO_MANY_REQUESTS: { status: 429, en: 'Too many attempts. Wait a moment and try again.', ur: 'بہت زیادہ کوششیں۔ تھوڑی دیر بعد کوشش کریں۔' },
  COOLING_OFF: { status: 423, en: 'This is paused for two hours after a device change, for your safety.', ur: 'آپ کی حفاظت کے لیے، ڈیوائس تبدیل ہونے کے بعد یہ دو گھنٹے کے لیے روکا گیا ہے۔' },
  SEAT_NOT_ALLOWED: { status: 409, en: 'That turn is earlier than your record allows just now.', ur: 'یہ باری فی الحال آپ کے ریکارڈ کی اجازت سے پہلے ہے۔' },
  AFFORDABILITY: { status: 409, en: 'This instalment is more than your checked income supports.', ur: 'یہ قسط آپ کی تصدیق شدہ آمدن سے زیادہ ہے۔' },
  PAYMENT_FAILED: { status: 402, en: 'The payment did not go through. No money left your account.', ur: 'ادائیگی نہیں ہوئی۔ آپ کے اکاؤنٹ سے رقم نہیں گئی۔' },
  PARTNER_UNAVAILABLE: { status: 503, en: 'The bank is not answering right now. Nothing was lost; try again shortly.', ur: 'بینک اس وقت جواب نہیں دے رہا۔ کچھ ضائع نہیں ہوا؛ تھوڑی دیر بعد کوشش کریں۔' },
  SERVICE_ERROR: { status: 500, en: 'Something went wrong at our end. Nothing was charged.', ur: 'ہماری طرف سے مسئلہ ہوا۔ کوئی رقم نہیں لی گئی۔' },
};

export class AppError extends Error {
  code: ErrorCode;
  status: number;
  detail?: unknown;
  constructor(code: ErrorCode, detail?: unknown) {
    super(ERRORS[code].en);
    this.code = code;
    this.status = ERRORS[code].status;
    this.detail = detail;
  }
}

export const fail = (code: ErrorCode, detail?: unknown) => new AppError(code, detail);

// The body every failed request returns. `error` stays for the screens that
// already read it; `code` is what new code should branch on.
export const errorBody = (code: ErrorCode, detail?: unknown) => ({
  code, error: ERRORS[code].en, messageUr: ERRORS[code].ur, ...(detail === undefined ? {} : { details: detail }),
});

// Give a response body a shared code when it does not already carry one. This
// is what app.ts applies to every outgoing body, so that failures written
// inline with res.status(409).json({ error: '...' }) end up on the shared list
// too, keeping their own more specific sentence and gaining the Urdu beside it.
// A success, an array, or a body that already names its code is returned
// untouched.
export const withErrorCode = (statusCode: number, body: unknown): unknown => {
  if (statusCode < 400 || !body || typeof body !== 'object' || Array.isArray(body)) return body;
  const b = body as Record<string, unknown>;
  if (b.code) return body;
  const code = codeForStatus(statusCode);
  return { ...errorBody(code), ...b, code };
};

// The nearest shared code for a bare HTTP status, used to give a code to the
// routes that still answer inline rather than by throwing.
export const codeForStatus = (status: number): ErrorCode =>
  status === 400 ? 'VALIDATION_FAILED'
  : status === 401 ? 'SIGN_IN_REQUIRED'
  : status === 402 ? 'PAYMENT_FAILED'
  : status === 403 ? 'NOT_ALLOWED'
  : status === 404 ? 'NOT_FOUND'
  : status === 409 ? 'CONFLICT'
  : status === 423 ? 'PIN_LOCKED'
  : status === 429 ? 'TOO_MANY_REQUESTS'
  : status === 503 ? 'PARTNER_UNAVAILABLE'
  : 'SERVICE_ERROR';
