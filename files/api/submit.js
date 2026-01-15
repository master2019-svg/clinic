import { google } from "googleapis";

/**
 * POST /api/submit
 * body: { full_name, phone, whatsapp, guardian_phone, level, year, subjects: [{subject,teacher,group,schedule}, ...] }
 *
 * Requires env:
 * - GOOGLE_SERVICE_ACCOUNT_KEY  (stringified JSON of service account key)
 * - SHEET_ID  (Google Sheet ID)
 * - SHEET_NAME (optional, default "Registrations")
 *
 * Behavior:
 * - Generates one student_id per submission.
 * - Appends one row per subject. If subjects array is empty, appends one row with empty subject fields.
 *
 * IMPORTANT:
 * ترتيب الأعمدة في الشيت يجب أن يكون مطابقاً للرؤوس العربية التي يضعها /api/setup-sheet:
 * [ "رقم الطالب", "تاريخ الإرسال", "الاسم الكامل", "رقم التليفون", "واتساب",
 *   "رقم ولي الأمر", "المرحلة", "السنة", "المادة", "المدرس", "المجموعة", "المواعيد",
 *   "حالة الدفع", "الحالة", "سبب الرفض/ملاحظات" ]
 */
export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });
  try {
    const {
      full_name,
      phone,
      whatsapp,
      guardian_phone,
      level,
      year,
      subjects = [],
    } = req.body;

    if (!full_name || !phone) {
      return res.status(400).json({ error: "الاسم ورقم التليفون مطلوبان" });
    }

    const keyJson = process.env.GOOGLE_SERVICE_ACCOUNT_KEY;
    if (!keyJson) return res.status(500).json({ error: "GOOGLE_SERVICE_ACCOUNT_KEY not configured" });

    const key = JSON.parse(keyJson);

    const jwtClient = new google.auth.JWT(
      key.client_email,
      null,
      // handle escaped newlines if present
      key.private_key.replace(/\\n/g, "\n"),
      ["https://www.googleapis.com/auth/spreadsheets"]
    );

    await jwtClient.authorize();

    const sheets = google.sheets({ version: "v4", auth: jwtClient });

    const now = new Date().toISOString();
    const student_id = "S" + Date.now().toString(36) + Math.floor(Math.random() * 1000);

    // If no subjects provided, create one empty subject row so at least one row is appended
    const subjectsList = (Array.isArray(subjects) && subjects.length > 0)
      ? subjects
      : [{ subject: "", teacher: "", group: "", schedule: "" }];

    // Build rows: one row per subject. Columns order must match headers (A->O):
    // [ رقم الطالب, تاريخ الإرسال, الاسم الكامل, رقم التليفون, واتساب, رقم ولي الأمر, المرحلة, السنة,
    //   المادة, المدرس, المجموعة, المواعيد, حالة الدفع, الحالة, سبب الرفض/ملاحظات ]
    const rows = subjectsList.map(s => [
      student_id,
      now,
      full_name,
      phone,
      s.whatsapp || whatsapp || "",
      guardian_phone || "",
      level || "",
      year || "",
      s.subject || "",
      s.teacher || "",
      s.group || "",
      s.schedule || "",
      "unpaid",
      "pending",
      ""
    ]);

    const sheetId = process.env.SHEET_ID;
    const sheetName = process.env.SHEET_NAME || "Registrations";

    if (!sheetId) return res.status(500).json({ error: "SHEET_ID not configured" });

    await sheets.spreadsheets.values.append({
      spreadsheetId: sheetId,
      range: `${sheetName}!A1`,
      valueInputOption: "RAW",
      requestBody: {
        values: rows,
      },
    });

    return res.status(200).json({ ok: true, student_id, rows_appended: rows.length });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message || "Server error" });
  }
}
