import { google } from "googleapis";

/**
 * GET or POST /api/setup-sheet
 * - يضع header عربي في الصف الأول
 * - يضبط اتجاه الورقة right-to-left = true
 *
 * Requires env:
 * - GOOGLE_SERVICE_ACCOUNT_KEY  (stringified JSON of service account key)
 * - SHEET_ID  (Google Sheet ID)
 * - SHEET_NAME (optional, default "Registrations")
 *
 * Usage: شغّل هذا once بعد نشر المشروع. سيكتب الصف الأول (A1:O1) بالعناوين العربية.
 */
export default async function handler(req, res) {
  try {
    const keyJson = process.env.GOOGLE_SERVICE_ACCOUNT_KEY;
    const sheetId = process.env.SHEET_ID;
    const sheetName = process.env.SHEET_NAME || "Registrations";

    if (!keyJson) return res.status(500).json({ error: "GOOGLE_SERVICE_ACCOUNT_KEY not configured" });
    if (!sheetId) return res.status(500).json({ error: "SHEET_ID not configured" });

    const key = JSON.parse(keyJson);

    const jwtClient = new google.auth.JWT(
      key.client_email,
      null,
      key.private_key.replace(/\\n/g, "\n"),
      ["https://www.googleapis.com/auth/spreadsheets"]
    );

    await jwtClient.authorize();

    const sheets = google.sheets({ version: "v4", auth: jwtClient });

    // احصل على metadata للشيت لتحديد sheetId الرقمي للورقة بالاسم
    const meta = await sheets.spreadsheets.get({ spreadsheetId: sheetId });
    const sheetsMeta = meta.data.sheets || [];

    let targetSheet = sheetsMeta.find(s => (s.properties && s.properties.title === sheetName));
    if (!targetSheet) {
      // إذا لم توجد الورقة بالاسم، اختر الورقة الأولى
      targetSheet = sheetsMeta[0];
      if (!targetSheet) {
        return res.status(400).json({ error: "Spreadsheet has no sheets" });
      }
    }
    const targetSheetId = targetSheet.properties.sheetId;

    // إعداد العناوين بالعربية (ترتيب الأعمدة A - O)
    const arabicHeaders = [
      "رقم الطالب",
      "تاريخ الإرسال",
      "الاسم الكامل",
      "رقم التليفون",
      "واتساب",
      "رقم ولي الأمر",
      "المرحلة",
      "السنة",
      "المادة",
      "المدرس",
      "المجموعة",
      "المواعيد",
      "حالة الدفع",
      "الحالة",
      "سبب الرفض/ملاحظات"
    ];

    // 1) اضبط اتجاه الورقة إلى RTL باستخدام batchUpdate
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId: sheetId,
      requestBody: {
        requests: [
          {
            updateSheetProperties: {
              properties: {
                sheetId: targetSheetId,
                rightToLeft: true
              },
              fields: "rightToLeft"
            }
          }
        ]
      }
    });

    // 2) اكتب صف العناوين (سيمسح الصف الأول الحالي/يستبدله)
    await sheets.spreadsheets.values.update({
      spreadsheetId: sheetId,
      range: `${sheetName}!A1:O1`,
      valueInputOption: "RAW",
      requestBody: {
        values: [arabicHeaders]
      }
    });

    return res.status(200).json({ ok: true, message: "Headers written and sheet set to RTL" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message || "Server error" });
  }
}
