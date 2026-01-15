import Header from '@/components/Header'
import Footer from '@/components/Footer'
import DoctorsGrid from '@/components/DoctorsGrid'
import { useLang } from '@/components/LanguageProvider'

export default function Doctors() {
  const { t } = useLang()
  return (
    <div>
      <Header />
      <main>
        <div className="py-8 max-w-6xl mx-auto px-4">
          <h1 className="text-3xl font-semibold mb-6">{t('doctors.title')}</h1>
          <DoctorsGrid t={t} />
        </div>
      </main>
      <Footer />
    </div>
  )
}
