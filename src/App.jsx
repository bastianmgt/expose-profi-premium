import React, { useState } from 'react';
import { Clock, TrendingUp, Award, Upload, Sparkles, FileText, Image, FileInput, Home, X, Check } from 'lucide-react';

export default function ExposeProfLanding() {
  const [activeSection, setActiveSection] = useState('');
  const [energyUploadStatus, setEnergyUploadStatus] = useState('idle');
  const [uploadedPhotos, setUploadedPhotos] = useState([]);
  const [uploadedFloorPlans, setUploadedFloorPlans] = useState([]);
  const [legalContent, setLegalContent] = useState(null); // State für die Rechtstexte
  
  const [propertyData, setPropertyData] = useState({
    wohnflaeche: '',
    zimmer: '',
    baujahr: '',
    aussenbereich: [],
    innenraum: [],
    parkenKeller: [],
    technikKomfort: [],
    weiteresBesonderheiten: '',
    ausweistyp: '',
    energiebedarf: '',
    energietraeger: '',
    effizienzklasse: ''
  });

  const featureCategories = {
    aussenbereich: ['Balkon', 'Terrasse', 'Garten', 'Dachterrasse', 'Loggia'],
    innenraum: ['Einbauküche', 'Gäste-WC', 'Kamin', 'Fußbodenheizung', 'Abstellraum'],
    parkenKeller: ['Garage', 'Tiefgarage', 'Außenstellplatz', 'Carport', 'Kellerraum'],
    technikKomfort: ['Aufzug', 'Barrierefrei', 'Smart Home', 'Klimaanlage']
  };

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setPropertyData(prev => ({ ...prev, [name]: value }));
  };

  const toggleFeature = (category, feature) => {
    setPropertyData(prev => ({
      ...prev,
      [category]: prev[category].includes(feature)
        ? prev[category].filter(f => f !== feature)
        : [...prev[category], feature]
    }));
  };

  const handleEnergyUpload = () => {
    setEnergyUploadStatus('uploading');
    setTimeout(() => {
      setEnergyUploadStatus('extracting');
      setTimeout(() => {
        setEnergyUploadStatus('complete');
        setPropertyData(prev => ({
          ...prev,
          ausweistyp: 'Bedarfsausweis',
          energiebedarf: '85',
          energietraeger: 'Gas',
          effizienzklasse: 'C'
        }));
      }, 2000);
    }, 1000);
  };

  const handlePhotoUpload = () => {
    const newPhotos = Array.from({ length: 5 }, (_, i) => ({
      id: Date.now() + i,
      url: `https://images.unsplash.com/photo-${1560184697-(580 + i)}?w=200&h=150&fit=crop`
    }));
    setUploadedPhotos(prev => [...prev, ...newPhotos].slice(0, 20));
  };

  const handleFloorPlanUpload = () => {
    const newPlan = {
      id: Date.now(),
      name: `Grundriss_${uploadedFloorPlans.length + 1}.pdf`
    };
    setUploadedFloorPlans(prev => [...prev, newPlan]);
  };

  const removePhoto = (id) => {
    setUploadedPhotos(prev => prev.filter(p => p.id !== id));
  };

  const removeFloorPlan = (id) => {
    setUploadedFloorPlans(prev => prev.filter(p => p.id !== id));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F4F7F6] via-[#E8ECEF] to-[#DFE6EA]">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md shadow-sm sticky top-0 z-50 border-b border-white/20">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <FileText className="w-8 h-8 text-[#C5A060]" />
            <span className="text-2xl font-bold text-[#0A2342]">Exposé-Profi</span>
          </div>
          <nav className="hidden md:flex space-x-8">
            <button onClick={() => scrollToSection('vorteile')} className="text-[#0A2342] hover:text-[#C5A060] transition-colors font-medium">Vorteile</button>
            <button onClick={() => scrollToSection('kontakt')} className="text-[#0A2342] hover:text-[#C5A060] transition-colors font-medium">Kontakt</button>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 md:py-32">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-[#0A2342] mb-6 leading-tight">
            Vom Foto zum perfekten<br />Exposé in 60 Sekunden.
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 mb-10 max-w-3xl mx-auto leading-relaxed">
            Steigern Sie Ihre Effizienz und Verkaufsgeschwindigkeit mit KI-generierten Immobilienbeschreibungen.
          </p>
          <button className="bg-[#C5A060] hover:bg-[#B39050] text-white px-10 py-4 rounded-lg text-lg font-semibold transition-all transform hover:scale-105 shadow-lg">
            Jetzt kostenlos testen
          </button>
        </div>
      </section>

      {/* Form Section */}
      <section className="py-20 bg-white/40 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-3xl md:text-4xl font-bold text-[#0A2342] text-center mb-12">Erstellen Sie Ihr erstes Exposé</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <h3 className="text-xl font-bold text-[#0A2342]">1. Medien hochladen</h3>
              <div className="bg-white/80 backdrop-blur-md rounded-xl p-6 border border-white/40 shadow-lg">
                <div className="border-2 border-dashed border-[#C5A060] rounded-lg p-6 hover:bg-[#F4F7F6]/50 transition-colors cursor-pointer text-center">
                  <Image className="w-10 h-10 text-[#C5A060] mx-auto mb-3" />
                  <h4 className="text-lg font-semibold text-[#0A2342]">Objektfotos</h4>
                  <button onClick={handlePhotoUpload} className="bg-[#0A2342] text-white px-6 py-2 rounded-lg text-sm mt-4">Fotos auswählen</button>
                </div>
              </div>
            </div>
            <div className="bg-white/80 backdrop-blur-md rounded-xl p-8 border border-white/40 shadow-lg">
              <h3 className="text-xl font-bold text-[#0A2342] mb-6">2. Eckdaten eingeben</h3>
              <div className="space-y-5">
                <input type="text" name="wohnflaeche" placeholder="Wohnfläche (m²)" onChange={handleInputChange} className="w-full px-4 py-3 rounded-lg border outline-none" />
                <input type="text" name="zimmer" placeholder="Zimmeranzahl" onChange={handleInputChange} className="w-full px-4 py-3 rounded-lg border outline-none" />
                <button className="w-full bg-[#C5A060] text-white px-6 py-4 rounded-lg font-bold shadow-lg mt-6">Exposé generieren</button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Vorteile Section */}
      <section id="vorteile" className="py-20 bg-gradient-to-b from-white/40 to-transparent">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-[#0A2342] mb-16">Ihre Vorteile mit Exposé-Profi</h2>
          <div className="grid md:grid-cols-3 gap-10">
            <div className="bg-white/80 p-8 rounded-xl border border-white/40 shadow-sm">
              <Clock className="w-12 h-12 text-[#C5A060] mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-2">Zeitersparnis</h3>
              <p className="text-sm text-gray-600">Erstellen Sie Exposés in Sekunden statt Stunden.</p>
            </div>
            <div className="bg-white/80 p-8 rounded-xl border border-white/40 shadow-sm">
              <TrendingUp className="w-12 h-12 text-[#C5A060] mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-2">Mehr Umsatz</h3>
              <p className="text-sm text-gray-600">Schnellere Vermarktung durch Profi-Texte.</p>
            </div>
            <div className="bg-white/80 p-8 rounded-xl border border-white/40 shadow-sm">
              <Award className="w-12 h-12 text-[#C5A060] mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-2">Profi-Qualität</h3>
              <p className="text-sm text-gray-600">KI-generierte Beschreibungen auf höchstem Niveau.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer id="kontakt" className="bg-[#0A2342] text-white py-12 mt-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-3 gap-8 mb-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <FileText className="w-6 h-6 text-[#C5A060]" />
                <span className="text-xl font-bold">Exposé-Profi</span>
              </div>
              <p className="text-gray-400 text-sm">KI-gestützte Exposé-Erstellung für Immobilienmakler.</p>
            </div>
            <div>
              <h4 className="text-sm font-semibold mb-4 uppercase">Rechtliches</h4>
              <ul className="space-y-2 text-sm">
                <li><button onClick={() => setLegalContent('impressum')} className="text-gray-400 hover:text-[#C5A060]">Impressum</button></li>
                <li><button onClick={() => setLegalContent('datenschutz')} className="text-gray-400 hover:text-[#C5A060]">Datenschutzerklärung</button></li>
                <li><button onClick={() => setLegalContent('agb')} className="text-gray-400 hover:text-[#C5A060]">AGB</button></li>
                <li><button onClick={() => setLegalContent('widerruf')} className="text-gray-400 hover:text-[#C5A060]">Widerrufsbelehrung</button></li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-semibold mb-4 uppercase">Kontakt</h4>
              <p className="text-sm text-gray-400">Email: info@expose-profi.de</p>
            </div>
          </div>
          <div className="border-t border-gray-700 pt-8 text-center text-sm text-gray-400">
            <p>© 2026 Exposé-Profi – Bastian Marget. Made with ❤️ for Immobilienmakler</p>
          </div>
        </div>
      </footer>

      {/* --- RECHTSTEXTE MODAL --- */}
      {legalContent && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.85)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 9999, padding: '20px' }}>
          <div style={{ backgroundColor: 'white', padding: '40px', borderRadius: '12px', maxWidth: '800px', maxHeight: '90vh', overflowY: 'auto', position: 'relative', color: '#333', textAlign: 'left', lineHeight: '1.6' }}>
            <button onClick={() => setLegalContent(null)} style={{ position: 'absolute', top: '15px', right: '15px', border: 'none', background: '#eee', borderRadius: '50%', width: '30px', height: '30px', cursor: 'pointer', fontWeight: 'bold' }}>X</button>

            {legalContent === 'impressum' && (
              <div>
                <h2 className="text-2xl font-bold mb-4">Impressum</h2>
                <p><strong>Angaben gemäß § 5 DDG:</strong><br />Bastian Marget<br />Werderstraße 16a<br />79379 Müllheim</p>
                <p className="mt-4"><strong>Kontakt:</strong><br />E-Mail: info@expose-profi.de</p>
                <p className="mt-4"><strong>Umsatzsteuer-ID:</strong><br />Umsatzsteuerfrei aufgrund der Kleinunternehmerregelung gemäß § 19 UStG.</p>
                <p className="mt-4"><strong>Redaktionell verantwortlich:</strong><br />Bastian Marget<br />Werderstraße 16a<br />79379 Müllheim</p>
                <p className="mt-4"><strong>EU-Streitschlichtung:</strong><br />Die Europäische Kommission stellt eine Plattform zur Online-Streitbeilegung (OS) bereit: <a href="https://ec.europa.eu/consumers/odr/" target="_blank" rel="noreferrer" className="text-blue-600">https://ec.europa.eu/consumers/odr/</a>.</p>
              </div>
            )}

            {legalContent === 'datenschutz' && (
              <div>
                <h2 className="text-2xl font-bold mb-4">Datenschutzerklärung</h2>
                <h3 className="font-bold mt-4">1. Datenschutz auf einen Blick</h3>
                <p>Diese Datenschutzerklärung klärt über die Art, den Umfang und Zweck der Verarbeitung von personenbezogenen Daten auf dieser Website auf.</p>
                <h3 className="font-bold mt-4">2. Hosting</h3>
                <p>Diese Website wird bei Vercel Inc. gehostet. Zur Bereitstellung der Website werden IP-Adressen und technische Logfiles verarbeitet.</p>
                <h3 className="font-bold mt-4">3. Datenerfassung</h3>
                <p>Kontaktaufnahme per E-Mail: Angaben werden zur Bearbeitung gespeichert. Cookies: Nur technisch notwendige Cookies.</p>
              </div>
            )}

            {legalContent === 'widerruf' && (
              <div>
                <h2 className="text-2xl font-bold mb-4">Widerrufsbelehrung</h2>
                <p>Sie haben das Recht, binnen vierzehn Tagen ohne Angabe von Gründen diesen Vertrag zu widerrufen.</p>
                <h3 className="font-bold mt-4">Erlöschen des Widerrufsrechts</h3>
                <p>Das Widerrufsrecht erlischt vorzeitig bei Verträgen über digitale Inhalte oder Dienstleistungen, wenn wir mit der Ausführung begonnen haben, nachdem Sie ausdrücklich zugestimmt haben.</p>
              </div>
            )}

            {legalContent === 'agb' && (
              <div>
                <h2 className="text-2xl font-bold mb-4">Allgemeine Geschäftsbedingungen (AGB)</h2>
                <p><strong>§ 1 Geltungsbereich:</strong> Diese AGB gelten für alle Verträge über die Erstellung von digitalen Immobilien-Exposés.</p>
                <p className="mt-4"><strong>§ 3 Preise:</strong> Gemäß § 19 UStG wird keine Umsatzsteuer erhoben (Kleinunternehmerstatus).</p>
                <p className="mt-4"><strong>§ 4 Mitwirkung:</strong> Der Kunde stellt die notwendigen Daten und Bilder zur Verfügung.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
