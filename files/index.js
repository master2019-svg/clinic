
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  User, Phone, MessageSquare, ShieldCheck, 
  GraduationCap, Calendar, Plus, Trash2, 
  Send, BookOpen, UserCircle, Users, Clock 
} from "lucide-react";

export default function Home() {
  const [form, setForm] = useState({
    full_name: "",
    phone: "",
    whatsapp: "",
    guardian_phone: "",
    level: "ابتدائي",
    year: "أول",
  });
  const [subjects, setSubjects] = useState([
    { subject: "", teacher: "", group: "", schedule: "" },
  ]);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState(null);

  function updateField(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function updateSubject(idx, key, value) {
    const copy = subjects.map((s, i) => (i === idx ? { ...s, [key]: value } : s));
    setSubjects(copy);
  }

  function addSubject() {
    setSubjects([...subjects, { subject: "", teacher: "", group: "", schedule: "" }]);
  }
  function removeSubject(idx) {
    setSubjects(subjects.filter((_, i) => i !== idx));
  }

  async function onSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setMsg(null);
    try {
      const res = await fetch("/api/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, subjects }),
      });
      const data = await res.json();
      if (res.ok) {
        setMsg({ type: "success", text: "تم الإرسال بنجاح. رقم الطالب: " + data.student_id });
        setForm({ full_name: "", phone: "", whatsapp: "", guardian_phone: "", level: "ابتدائي", year: "أول" });
        setSubjects([{ subject: " ", teacher: "", group: "", schedule: "" }]);
      } else {
        setMsg({ type: "error", text: data.error || "حدث خطأ ما" });
      }
    } catch (err) {
      setMsg({ type: "error", text: "خطأ في الاتصال بالسيرفر" });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#0f172a] text-white py-12 px-4 flex flex-col items-center font-sans" dir="rtl">
      {/* Background Glow */}
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden -z-10">
        <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-600/20 blur-[120px] rounded-full"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-purple-600/20 blur-[120px] rounded-full"></div>
      </div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-4xl"
      >
        <header className="text-center mb-10">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent mb-3">
            نموذج تسجيل الطلاب
          </h1>
          <p className="text-gray-400">سجل بياناتك والمواد الدراسية في خطوات بسيطة</p>
        </header>

        <form onSubmit={onSubmit} className="space-y-8">
          {/* Student Info Card */}
          <section className="bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl p-8 shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-1 h-full bg-blue-500 transition-all group-hover:w-2"></div>
            <h2 className="text-xl font-semibold mb-6 flex items-center gap-3 border-b border-white/10 pb-4">
              <UserCircle className="text-blue-400" /> البيانات الشخصية
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                { label: "الاسم الكامل", name: "full_name", icon: User, placeholder: "ادخل اسمك ثلاثي", req: true },
                { label: "رقم التليفون", name: "phone", icon: Phone, placeholder: "01xxxxxxxxx", req: true },
                { label: "واتساب", name: "whatsapp", icon: MessageSquare, placeholder: "رقم الواتساب" },
                { label: "رقم ولي الأمر", name: "guardian_phone", icon: ShieldCheck, placeholder: "رقم للطوارئ" },
              ].map((field) => (
                <div key={field.name} className="space-y-2">
                  <label className="text-sm text-gray-400 flex items-center gap-2 mr-1">
                    <field.icon size={16} /> {field.label}
                  </label>
                  <input
                    name={field.name}
                    value={form[field.name]}
                    onChange={updateField}
                    required={field.req}
                    placeholder={field.placeholder}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all placeholder:text-gray-600"
                  />
                </div>
              ))}

              <div className="space-y-2">
                <label className="text-sm text-gray-400 flex items-center gap-2 mr-1">
                  <GraduationCap size={16} /> المرحلة
                </label>
                <select name="level" value={form.level} onChange={updateField} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:border-blue-500 outline-none appearance-none">
                  <option className="bg-[#1e293b]">ابتدائي</option>
                  <option className="bg-[#1e293b]">اعدادي</option>
                  <option className="bg-[#1e293b]">ثانوي</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm text-gray-400 flex items-center gap-2 mr-1">
                  <Calendar size={16} /> السنة
                </label>
                <select name="year" value={form.year} onChange={updateField} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:border-blue-500 outline-none">
                  <option className="bg-[#1e293b]">أول</option>
                  <option className="bg-[#1e293b]">ثانية</option>
                  <option className="bg-[#1e293b]">ثالثة</option>
                </select>
              </div>
            </div>
          </section>

          {/* Subjects Card */}
          <section className="bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl p-8 shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-1 h-full bg-emerald-500 transition-all group-hover:w-2"></div>
            <div className="flex justify-between items-center mb-6 border-b border-white/10 pb-4">
              <h2 className="text-xl font-semibold flex items-center gap-3">
                <BookOpen className="text-emerald-400" /> المواد المختارة
              </h2>
              <button 
                type="button" 
                onClick={addSubject}
                className="flex items-center gap-2 text-sm bg-emerald-500/20 text-emerald-400 px-4 py-2 rounded-full hover:bg-emerald-500/30 transition-all border border-emerald-500/30"
              >
                <Plus size={18} /> إضافة مادة
              </button>
            </div>

            <div className="space-y-4">
              <AnimatePresence>
                {subjects.map((s, idx) => (
                  <motion.div 
                    key={idx}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="grid grid-cols-1 sm:grid-cols-4 gap-4 p-5 bg-white/5 rounded-2xl border border-white/5 relative"
                  >
                    <div className="space-y-1">
                      <label className="text-[10px] text-emerald-400 flex items-center gap-1"><BookOpen size={10}/> المادة</label>
                      <input value={s.subject} onChange={(e) => updateSubject(idx, "subject", e.target.value)} required className="w-full bg-transparent border-b border-white/10 focus:border-emerald-500 outline-none py-1 transition-all" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] text-emerald-400 flex items-center gap-1"><UserCircle size={10}/> المدرس</label>
                      <input value={s.teacher} onChange={(e) => updateSubject(idx, "teacher", e.target.value)} className="w-full bg-transparent border-b border-white/10 focus:border-emerald-500 outline-none py-1 transition-all" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] text-emerald-400 flex items-center gap-1"><Users size={10}/> المجموعة</label>
                      <input value={s.group} onChange={(e) => updateSubject(idx, "group", e.target.value)} className="w-full bg-transparent border-b border-white/10 focus:border-emerald-500 outline-none py-1 transition-all" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] text-emerald-400 flex items-center gap-1"><Clock size={10}/> المواعيد</label>
                      <input value={s.schedule} onChange={(e) => updateSubject(idx, "schedule", e.target.value)} className="w-full bg-transparent border-b border-white/10 focus:border-emerald-500 outline-none py-1 transition-all" />
                    </div>
                    
                    {subjects.length > 1 && (
                      <button 
                        type="button" 
                        onClick={() => removeSubject(idx)}
                        className="absolute -left-2 -top-2 bg-red-500/20 text-red-400 p-1.5 rounded-full hover:bg-red-500 hover:text-white transition-all border border-red-500/20 shadow-lg"
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </section>

          {/* Action Button */}
          <div className="flex flex-col items-center pt-6">
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              type="submit" 
              disabled={loading}
              className={`group flex items-center justify-center gap-3 px-12 py-4 rounded-2xl font-bold text-lg shadow-xl transition-all w-full md:w-auto ${
                loading ? 'bg-gray-700 cursor-not-allowed' : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:shadow-blue-500/40'
              }`}
            >
              {loading ? "جارٍ الإرسال..." : (
                <>إرسال الطلب <Send size={20} className="group-hover:translate-x-[-4px] transition-transform" /></>
              )}
            </motion.button>

            <AnimatePresence>
              {msg && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`mt-6 p-4 rounded-xl border text-center max-w-md w-full ${
                    msg.type === "error" ? "bg-red-500/10 border-red-500/30 text-red-400" : "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                  }`}
                >
                  {msg.text}
                </motion.div>
              )}
            </AnimatePresence>
            
            <p className="mt-8 text-gray-500 text-xs text-center leading-relaxed">
              سيُنشأ <code className="text-blue-400">student_id</code> تلقائياً، ويُسجّل السجل في Google Sheet<br/> مع الحالة الافتراضية "pending".
            </p>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
