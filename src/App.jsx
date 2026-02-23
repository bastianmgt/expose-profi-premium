import React, { useState, useEffect } from 'react';
import { 
  Clock, 
  TrendingUp, 
  Award, 
  Upload, 
  Sparkles, 
  FileText, 
  Image, 
  FileInput, 
  Home, 
  X, 
  Check,
  Edit3,
  Download,
  Palette,
  Shield
} from 'lucide-react';

export default function ExposeProfiLanding() {
  // ============================================
  // STATE MANAGEMENT
  // ============================================
  
  // Upload states
  const [energyUploadStatus, setEnergyUploadStatus] = useState('idle');
  const [uploadedPhotos, setUploadedPhotos] = useState([]);
  const [uploadedFloorPlans, setUploadedFloorPlans] = useState([]);
  const [uploadedLogo, setUploadedLogo] = useState(null);
  
  // Generator states
  const [showPreview, setShowPreview] = useState(false);
  const [aiGeneratedText, setAiGeneratedText] = useState('');
  
  // Modal states
  const [legalContent, setLegalContent] = useState(null);
  const [showBetaModal, setShowBetaModal] = useState(false);
  const [betaEmail, setBetaEmail] = useState('');
  const [betaSubmitted, setBetaSubmitted] = useState(false);
  
  // Form data
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

  // ============================================
  // FEATURE CATEGORIES
  // ============================================
  
  const featureCategories = {
    aussenbereich: ['Balkon', 'Terrasse', 'Garten', 'Dachterrasse', 'Loggia'],
    innenraum: ['Einbauküche', 'Gäste-WC', 'Kamin', 'Fußbodenheizung', 'Abstellraum'],
    parkenKeller: ['Garage', 'Tiefgarage', 'Außenstellplatz', 'Carport', 'Kellerraum'],
    technikKomfort: ['Aufzug', 'Barrierefrei', 'Smart Home', 'Klimaanlage']
  };

  // ============================================
  // LEGAL CONTENT STRUCTURE
  // ============================================
  
  const legalTexts = {
    impressum: {
      title: 'Impressum',
      sections: [
        {
          heading: 'Angaben gemäß § 5 TMG',
          content: (
            <>
              <strong>Bastian Marget</strong><br/>
              Werderstraße 16a<br/>
              79379 Müllheim<br/>
              Deutschland
            </>
          )
        },
        {
          heading: 'Kontakt',
          content: 'E-Mail: info@expose-profi.de'
        },
        {
          heading: 'Umsatzsteuer-ID',
          content: 'Kleinunternehmer gemäß § 19 UStG. Es wird keine Umsatzsteuer ausgewiesen.'
        },
        {
          heading: 'Haftungsausschluss',
          content: (
            <>
              <p className="mb-4">
                <strong>Haftung für Inhalte:</strong><br/>
                Die Inhalte unserer Seiten wurden mit größter Sorgfalt erstellt. Für die Richtigkeit, Vollständigkeit und Aktualität der Inhalte können wir jedoch keine Gewähr übernehmen.
              </p>
              <p>
                <strong>Haftung für Links:</strong><br/>
                Unser Angebot enthält Links zu externen Webseiten Dritter, auf deren Inhalte wir keinen Einfluss haben. Deshalb können wir für diese fremden Inhalte auch keine Gewähr übernehmen.
              </p>
            </>
          )
        }
      ]
    },
    datenschutz: {
      title: 'Datenschutzerklärung',
      sections: [
        {
          heading: '1. Datenschutz auf einen Blick',
          content: 'Die folgenden Hinweise geben einen einfachen Überblick darüber, was mit Ihren personenbezogenen Daten passiert, wenn Sie diese Website besuchen.'
        },
        {
          heading: '2. Hosting',
          content: (
            <>
              <p className="mb-4">
                Diese Website wird gehostet durch <strong>Vercel Inc.</strong><br/>
                440 N Barranca Ave #4133<br/>
                Covina, CA 91723<br/>
                USA
              </p>
              <p>
                Vercel verarbeitet technische Logfiles (IP-Adressen, Browsertyp, Zugriffszeiten) zur Bereitstellung und Sicherheit der Website. Die Rechtsgrundlage ist Art. 6 Abs. 1 lit. f DSGVO (berechtigtes Interesse).
              </p>
            </>
          )
        },
        {
          heading: '3. Datenerfassung auf dieser Website',
          content: (
            <>
              <p className="mb-4">
                <strong>Server-Log-Dateien:</strong><br/>
                Der Provider der Seiten erhebt und speichert automatisch Informationen in Server-Log-Dateien, die Ihr Browser automatisch übermittelt. Dies sind:
              </p>
              <ul className="list-disc list-inside mb-4 space-y-1">
                <li>Browsertyp und Browserversion</li>
                <li>Verwendetes Betriebssystem</li>
                <li>Referrer URL</li>
                <li>Hostname des zugreifenden Rechners</li>
                <li>Uhrzeit der Serveranfrage</li>
                <li>IP-Adresse</li>
              </ul>
              <p>
                Eine Zusammenführung dieser Daten mit anderen Datenquellen wird nicht vorgenommen. Die Erfassung erfolgt auf Grundlage von Art. 6 Abs. 1 lit. f DSGVO.
              </p>
            </>
          )
        },
        {
          heading: '4. Kontaktaufnahme',
          content: 'Bei Kontaktaufnahme per E-Mail werden Ihre Angaben zur Bearbeitung der Anfrage und für den Fall von Anschlussfragen gespeichert. Diese Daten werden nicht ohne Ihre Einwilligung weitergegeben.'
        },
        {
          heading: '5. Ihre Rechte',
          content: 'Sie haben das Recht auf Auskunft, Berichtigung, Löschung, Einschränkung der Verarbeitung, Widerspruch und Datenübertragbarkeit. Wenden Sie sich dazu an: info@expose-profi.de'
        }
      ]
    },
    widerruf: {
      title: 'Widerrufsbelehrung',
      sections: [
        {
          heading: 'Widerrufsrecht',
          content: (
            <>
              <p className="mb-4">
                Sie haben das Recht, binnen vierzehn Tagen ohne Angabe von Gründen diesen Vertrag zu widerrufen.
              </p>
              <p className="mb-4">
                Die Widerrufsfrist beträgt vierzehn Tage ab dem Tag des Vertragsabschlusses.
              </p>
              <p className="mb-4">
                Um Ihr Widerrufsrecht auszuüben, müssen Sie uns<br/>
                <strong>Bastian Marget</strong><br/>
                Werderstraße 16a<br/>
                79379 Müllheim<br/>
                E-Mail: info@expose-profi.de
              </p>
              <p>
                mittels einer eindeutigen Erklärung (z. B. ein mit der Post versandter Brief oder E-Mail) über Ihren Entschluss, diesen Vertrag zu widerrufen, informieren.
              </p>
            </>
          )
        },
        {
          heading: 'Folgen des Widerrufs',
          content: 'Wenn Sie diesen Vertrag widerrufen, haben wir Ihnen alle Zahlungen, die wir von Ihnen erhalten haben, unverzüglich und spätestens binnen vierzehn Tagen ab dem Tag zurückzuzahlen, an dem die Mitteilung über Ihren Widerruf dieses Vertrags bei uns eingegangen ist.'
        },
        {
          heading: 'Erlöschen des Widerrufsrechts',
          content: (
            <>
              <p className="mb-4">
                Das Widerrufsrecht erlischt bei einem Vertrag zur Erbringung von Dienstleistungen, wenn der Unternehmer die Dienstleistung vollständig erbracht hat und mit der Ausführung der Dienstleistung erst begonnen hat, nachdem der Verbraucher dazu seine ausdrückliche Zustimmung gegeben hat und gleichzeitig seine Kenntnis davon bestätigt hat, dass er sein Widerrufsrecht bei vollständiger Vertragserfüllung durch den Unternehmer verliert.
              </p>
              <p>
                <strong>Wichtig:</strong> Bei der sofortigen Nutzung digitaler Dienstleistungen (z.B. Exposé-Generierung) erlischt das Widerrufsrecht mit Beginn der Leistungserbringung, wenn Sie dem ausdrücklich zugestimmt haben.
              </p>
            </>
          )
        }
      ]
    },
    agb: {
      title: 'Allgemeine Geschäftsbedingungen',
      sections: [
        {
          heading: '§ 1 Geltungsbereich',
          content: 'Diese Allgemeinen Geschäftsbedingungen (AGB) gelten für alle Verträge über die Erstellung von Immobilien-Exposés mittels KI-gestützter Software zwischen Bastian Marget (nachfolgend "Anbieter") und dem Kunden.'
        },
        {
          heading: '§ 2 Vertragsgegenstand',
          content: 'Der Anbieter stellt eine Software-Lösung zur Verfügung, die es Immobilienmaklern ermöglicht, professionelle Exposés zu erstellen. Die Erstellung erfolgt durch künstliche Intelligenz auf Basis der vom Kunden hochgeladenen Daten.'
        },
        {
          heading: '§ 3 Leistungsumfang',
          content: (
            <>
              <p className="mb-4">
                <strong>Starter-Paket (29€ pro Exposé):</strong>
              </p>
              <ul className="list-disc list-inside mb-4 space-y-1">
                <li>1 professionelles Exposé</li>
                <li>KI-generierte Texte</li>
                <li>GEG-konforme Pflichtangaben</li>
                <li>PDF-Export in Standarddesign</li>
              </ul>
              <p className="mb-4">
                <strong>Pro-Abo (79€ pro Monat):</strong>
              </p>
              <ul className="list-disc list-inside space-y-1">
                <li>Unbegrenzte Exposés</li>
                <li>Premium KI-Texte</li>
                <li>Eigenes Logo und Branding (White-Label)</li>
                <li>Prioritäts-Support</li>
              </ul>
            </>
          )
        },
        {
          heading: '§ 4 Preise und Zahlung',
          content: (
            <>
              <p className="mb-4">
                Die aktuellen Preise sind auf der Website ersichtlich. Die Zahlung erfolgt per Rechnung und ist innerhalb von 7 Tagen nach Rechnungsdatum fällig.
              </p>
              <p>
                Das Pro-Abo verlängert sich automatisch um jeweils einen weiteren Monat, sofern es nicht mit einer Frist von 14 Tagen zum Monatsende gekündigt wird.
              </p>
            </>
          )
        },
        {
          heading: '§ 5 Pflichten des Kunden',
          content: 'Der Kunde ist verpflichtet, korrekte und vollständige Daten hochzuladen. Der Kunde ist für die rechtliche Prüfung der generierten Exposés selbst verantwortlich, insbesondere für die Einhaltung der GEG-Pflichtangaben.'
        },
        {
          heading: '§ 6 Haftung',
          content: 'Der Anbieter haftet nur bei Vorsatz und grober Fahrlässigkeit. Die Haftung für die Richtigkeit der KI-generierten Inhalte ist ausgeschlossen. Der Kunde muss alle Exposés vor Veröffentlichung selbst auf Vollständigkeit und Korrektheit prüfen.'
        },
        {
          heading: '§ 7 Urheberrecht',
          content: 'Die vom Kunden erstellten Exposés dürfen frei verwendet werden. Der Anbieter behält sich das Recht vor, anonymisierte Beispiele für Marketingzwecke zu nutzen.'
        },
        {
          heading: '§ 8 Datenschutz',
          content: 'Es gelten die Bestimmungen unserer Datenschutzerklärung.'
        },
        {
          heading: '§ 9 Schlussbestimmungen',
          content: (
            <>
              <p className="mb-4">
                Es gilt das Recht der Bundesrepublik Deutschland. Sollten einzelne Bestimmungen dieser AGB unwirksam sein, bleibt die Wirksamkeit der übrigen Bestimmungen unberührt.
              </p>
              <p>
                <strong>Stand:</strong> Februar 2025
              </p>
            </>
          )
        }
      ]
    }
  };

  // ============================================
  // VALIDATION & UTILITY FUNCTIONS
  // ============================================
  
  const isFormValid = () => {
    return propertyData.wohnflaeche.trim() !== '' && propertyData.zimmer.trim() !== '';
  };

  const handleNumericInput = (e, field, allowDecimal = false) => {
    const value = e.target.value;
    const regex = allowDecimal ? /^\d*\.?\d*$/ : /^\d*$/;
    
    if (value === '' || regex.test(value)) {
      setPropertyData(prev => ({ ...prev, [field]: value }));
    }
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

  // ============================================
  // MODAL FUNCTIONS
  // ============================================
  
  const openLegalModal = (type) => {
    setLegalContent(type);
  };

  const closeLegalModal = () => {
    setLegalContent(null);
  };

  const openBetaModal = () => {
    setShowBetaModal(true);
    setBetaSubmitted(false);
    setBetaEmail('');
  };

  const closeBetaModal = () => {
    setShowBetaModal(false);
    setBetaEmail('');
    setBetaSubmitted(false);
  };

const handleBetaSubmit = async (e) => {
  e.preventDefault();
  if (betaEmail && betaEmail.includes('@')) {
    // Senden an dein Formspree-Konto
    const response = await fetch("https://formspree.io/f/xojnpyez", {
      method: "POST",
      body: JSON.stringify({ email: betaEmail }),
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    });

    if (response.ok) {
      setBetaSubmitted(true);
      // Modal nach 3 Sekunden automatisch schließen
      setTimeout(() => {
        closeBetaModal();
      }, 3000);
    } else {
      alert("Hoppla! Da gab es ein Problem. Bitte versuche es später noch einmal.");
    }
  }
};

  // ============================================
  // UPLOAD FUNCTIONS
  // ============================================
  
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
      url: `photo-${i}`
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

  const handleLogoUpload = () => {
    setUploadedLogo({
      id: Date.now(),
      name: 'Ihr_Logo.png'
    });
  };

  const removePhoto = (id) => {
    setUploadedPhotos(prev => prev.filter(p => p.id !== id));
  };

  const removeFloorPlan = (id) => {
    setUploadedFloorPlans(prev => prev.filter(p => p.id !== id));
  };

  // ============================================
  // GENERATOR FUNCTION
  // ============================================
  
const handleGenerateExpose = () => {
    if (!isFormValid()) return;
    
    // 1. Die Vorschau wird im Hintergrund erstellt
    setShowPreview(true);
    setAiGeneratedText(`Exklusive ${propertyData.zimmer || '3'}-Zimmer-Wohnung mit ${propertyData.wohnflaeche || '85'} m² Wohnfläche

Diese attraktive Immobilie vereint modernen Wohnkomfort mit zeitloser Eleganz. Die großzügig geschnittenen Räume bieten Ihnen vielfältige Gestaltungsmöglichkeiten für Ihr neues Zuhause.

AUSSTATTUNG & BESONDERHEITEN:
${propertyData.aussenbereich.length > 0 ? `✓ ${propertyData.aussenbereich.join(', ')}\n` : ''}${propertyData.innenraum.length > 0 ? `✓ ${propertyData.innenraum.join(', ')}\n` : ''}${propertyData.parkenKeller.length > 0 ? `✓ ${propertyData.parkenKeller.join(', ')}\n` : ''}${propertyData.technikKomfort.length > 0 ? `✓ ${propertyData.technikKomfort.join(', ')}\n` : ''}
ENERGETISCHE DATEN:
Energieeffizienzklasse: ${propertyData.effizienzklasse || 'C'}
Energiebedarf: ${propertyData.energiebedarf || '85'} kWh/(m²·a)
Energieträger: ${propertyData.energietraeger || 'Gas'}

Diese Immobilie bietet Ihnen die perfekte Kombination aus Wohnqualität und Zukunftssicherheit.`);

    // 2. Das Beta-Fenster öffnet sich sofort
    openBetaModal();
  };

  // ============================================
  // KEYBOARD EVENT HANDLERS (ESC to close modals)
  // ============================================
  
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        if (legalContent) closeLegalModal();
        if (showBetaModal) closeBetaModal();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [legalContent, showBetaModal]);

  // ============================================
  // RENDER
  // ============================================
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      
      {/* ============================================ */}
      {/* HEADER */}
      {/* ============================================ */}
      
      <header className="bg-[#0A192F] shadow-xl sticky top-0 z-50 border-b border-[#C5A059]/20">
        <div className="max-w-7xl mx-auto px-6 py-5 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-[#C5A059] to-[#A68B4A] rounded-lg flex items-center justify-center">
              <FileText className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-white tracking-tight">Exposé-Profi</span>
          </div>
          <nav className="hidden md:flex space-x-8">
            <button
              onClick={() => scrollToSection('vorteile')}
              className="text-gray-300 hover:text-[#C5A059] transition-colors font-medium"
            >
              Vorteile
            </button>
            <button
              onClick={() => scrollToSection('preise')}
              className="text-gray-300 hover:text-[#C5A059] transition-colors font-medium"
            >
              Preise
            </button>
            <button
              onClick={() => scrollToSection('kontakt')}
              className="text-gray-300 hover:text-[#C5A059] transition-colors font-medium"
            >
              Kontakt
            </button>
            <button 
              onClick={openBetaModal}
              className="bg-[#C5A059] hover:bg-[#B39050] text-white px-6 py-2 rounded-lg font-semibold transition-all"
            >
              Beta-Zugang
            </button>
          </nav>
        </div>
      </header>

      {/* ============================================ */}
      {/* HERO SECTION */}
      {/* ============================================ */}
      
      <section className="py-24 md:py-32 bg-gradient-to-b from-[#0A192F] to-[#112240] text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-96 h-96 bg-[#C5A059] rounded-full filter blur-3xl"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-[#C5A059] rounded-full filter blur-3xl"></div>
        </div>
        <div className="max-w-6xl mx-auto px-6 text-center relative z-10">
          <div className="inline-block mb-6 px-4 py-2 bg-[#C5A059]/20 border border-[#C5A059]/40 rounded-full">
            <span className="text-[#C5A059] text-sm font-semibold">KI-gestützte Exposé-Erstellung</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-bold mb-8 leading-tight">
            Exposés auf Knopfdruck –<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#C5A059] to-[#D4B068]">
              In Ihrer Corporate Identity
            </span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-300 mb-12 max-w-3xl mx-auto leading-relaxed">
            Professionelle Immobilien-Exposés in Sekunden. Mit Ihrem Logo, Ihren Farben, Ihrer Marke. 
            Rechtssicher nach GEG. Für Makler, die keine Zeit verschwenden.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button 
              onClick={() => scrollToSection('generator')}
              className="bg-[#C5A059] hover:bg-[#B39050] text-white px-10 py-4 rounded-lg text-lg font-semibold transition-all transform hover:scale-105 shadow-2xl"
            >
              Jetzt kostenlos testen
            </button>
            <button 
              onClick={() => scrollToSection('preise')}
              className="bg-white/10 backdrop-blur-sm hover:bg-white/20 text-white border border-white/30 px-10 py-4 rounded-lg text-lg font-semibold transition-all"
            >
              Preise ansehen
            </button>
          </div>
        </div>
      </section>

      {/* ============================================ */}
      {/* 3-STEP PROCESS */}
      {/* ============================================ */}
      
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-[#0A192F] mb-4">
              So einfach geht's
            </h2>
            <p className="text-xl text-gray-600">Vom Foto zum fertigen PDF in drei Schritten</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-12">
            <div className="text-center group">
              <div className="relative mb-8">
                <div className="w-24 h-24 bg-gradient-to-br from-[#C5A059] to-[#A68B4A] rounded-2xl flex items-center justify-center mx-auto shadow-xl transform group-hover:scale-110 transition-transform duration-300">
                  <Upload className="w-12 h-12 text-white" />
                </div>
                <div className="absolute -top-4 -right-4 w-12 h-12 bg-[#0A192F] rounded-full flex items-center justify-center text-white font-bold text-xl shadow-lg">
                  1
                </div>
              </div>
              <h3 className="text-2xl font-bold text-[#0A192F] mb-4">Fotos hochladen</h3>
              <p className="text-gray-600 leading-relaxed">
                Laden Sie Objektfotos, Grundrisse und optional Ihr Logo hoch. Unsere KI analysiert alles automatisch.
              </p>
            </div>

            <div className="text-center group">
              <div className="relative mb-8">
                <div className="w-24 h-24 bg-gradient-to-br from-[#C5A059] to-[#A68B4A] rounded-2xl flex items-center justify-center mx-auto shadow-xl transform group-hover:scale-110 transition-transform duration-300">
                  <Sparkles className="w-12 h-12 text-white" />
                </div>
                <div className="absolute -top-4 -right-4 w-12 h-12 bg-[#0A192F] rounded-full flex items-center justify-center text-white font-bold text-xl shadow-lg">
                  2
                </div>
              </div>
              <h3 className="text-2xl font-bold text-[#0A192F] mb-4">KI-Erstellung</h3>
              <p className="text-gray-600 leading-relaxed">
                Die KI generiert verkaufsstarke Texte, prüft GEG-Pflichtangaben und erstellt ein Profi-Layout.
              </p>
            </div>

            <div className="text-center group">
              <div className="relative mb-8">
                <div className="w-24 h-24 bg-gradient-to-br from-[#C5A059] to-[#A68B4A] rounded-2xl flex items-center justify-center mx-auto shadow-xl transform group-hover:scale-110 transition-transform duration-300">
                  <Download className="w-12 h-12 text-white" />
                </div>
                <div className="absolute -top-4 -right-4 w-12 h-12 bg-[#0A192F] rounded-full flex items-center justify-center text-white font-bold text-xl shadow-lg">
                  3
                </div>
              </div>
              <h3 className="text-2xl font-bold text-[#0A192F] mb-4">PDF-Download</h3>
              <p className="text-gray-600 leading-relaxed">
                Bearbeiten Sie bei Bedarf den Text und laden Sie Ihr druckfertiges Exposé als PDF herunter.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================ */}
      {/* GENERATOR SECTION */}
      {/* ============================================ */}
      
      <section id="generator" className="py-20 bg-gradient-to-b from-slate-50 to-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold text-[#0A192F] mb-4">
              Erstellen Sie Ihr erstes Exposé
            </h2>
            <p className="text-xl text-gray-600">Kostenlos testen – ohne Anmeldung</p>
          </div>
          
          <div className="grid lg:grid-cols-2 gap-10">
            {/* Left Column - Upload */}
            <div className="space-y-6">
              {/* Logo Upload */}
              <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                <div className="flex items-center space-x-2 mb-4">
                  <Palette className="w-5 h-5 text-[#C5A059]" />
                  <h3 className="text-lg font-bold text-[#0A192F]">White-Label Branding</h3>
                </div>
                <div className="border-2 border-dashed border-[#C5A059]/50 rounded-xl p-6 hover:border-[#C5A059] transition-colors cursor-pointer">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-gradient-to-br from-[#C5A059]/20 to-[#C5A059]/10 rounded-xl flex items-center justify-center mx-auto mb-3">
                      <Image className="w-8 h-8 text-[#C5A059]" />
                    </div>
                    <h4 className="text-base font-semibold text-[#0A192F] mb-2">Ihr Logo hochladen</h4>
                    <p className="text-sm text-gray-600 mb-4">
                      Nutzen Sie Ihre eigene Corporate Identity
                    </p>
                    <button 
                      onClick={handleLogoUpload}
                      className="bg-[#0A192F] text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-opacity-90 transition-all"
                    >
                      {uploadedLogo ? 'Logo ändern' : 'Logo auswählen'}
                    </button>
                    {uploadedLogo && (
                      <div className="mt-3 flex items-center justify-center space-x-2 text-sm">
                        <Check className="w-4 h-4 text-green-600" />
                        <span className="text-gray-700">{uploadedLogo.name}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Photo Upload */}
              <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                <h3 className="text-lg font-bold text-[#0A192F] mb-4">Objektfotos</h3>
                <div className="border-2 border-dashed border-[#C5A059]/50 rounded-xl p-6 hover:border-[#C5A059] transition-colors cursor-pointer">
                  <div className="text-center">
                    <Image className="w-10 h-10 text-[#C5A059] mx-auto mb-3" />
                    <p className="text-sm text-gray-600 mb-4">
                      Bis zu 20 Fotos (JPG, PNG)
                    </p>
                    <button 
                      onClick={handlePhotoUpload}
                      className="bg-[#0A192F] text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-opacity-90 transition-all"
                    >
                      Fotos auswählen
                    </button>
                  </div>
                </div>
                
                {uploadedPhotos.length > 0 && (
                  <div className="mt-4">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm font-medium text-gray-700">
                        {uploadedPhotos.length} {uploadedPhotos.length === 1 ? 'Foto' : 'Fotos'}
                      </p>
                      <button 
                        onClick={() => setUploadedPhotos([])}
                        className="text-xs text-red-600 hover:text-red-700"
                      >
                        Alle entfernen
                      </button>
                    </div>
                    <div className="grid grid-cols-4 gap-2 max-h-40 overflow-y-auto">
                      {uploadedPhotos.map((photo) => (
                        <div key={photo.id} className="relative group">
                          <div className="w-full h-20 bg-gradient-to-br from-slate-100 to-slate-200 rounded-lg flex items-center justify-center">
                            <Image className="w-6 h-6 text-gray-400" />
                          </div>
                          <button
                            onClick={() => removePhoto(photo.id)}
                            className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Floor Plans */}
              <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                <h3 className="text-lg font-bold text-[#0A192F] mb-4">Grundrisse</h3>
                <div className="border-2 border-dashed border-[#C5A059]/50 rounded-xl p-6 hover:border-[#C5A059] transition-colors cursor-pointer">
                  <div className="text-center">
                    <FileInput className="w-10 h-10 text-[#C5A059] mx-auto mb-3" />
                    <p className="text-sm text-gray-600 mb-4">
                      Mehrere Stockwerke (PDF, JPG, PNG)
                    </p>
                    <button 
                      onClick={handleFloorPlanUpload}
                      className="bg-[#0A192F] text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-opacity-90 transition-all"
                    >
                      Grundriss hinzufügen
                    </button>
                  </div>
                </div>
                
                {uploadedFloorPlans.length > 0 && (
                  <div className="mt-4 space-y-2">
                    {uploadedFloorPlans.map((plan) => (
                      <div key={plan.id} className="flex items-center justify-between bg-slate-50 px-3 py-2 rounded-lg">
                        <div className="flex items-center space-x-2">
                          <FileInput className="w-4 h-4 text-[#C5A059]" />
                          <span className="text-sm text-gray-700">{plan.name}</span>
                        </div>
                        <button
                          onClick={() => removeFloorPlan(plan.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Right Column - Form */}
            <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
              <h3 className="text-lg font-bold text-[#0A192F] mb-6">Objektdaten</h3>
              
              <div className="space-y-5">
                {/* Basic Data with Validation */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-[#0A192F] mb-2">
                      Wohnfläche (m²) *
                    </label>
                    <input
                      type="text"
                      inputMode="numeric"
                      name="wohnflaeche"
                      value={propertyData.wohnflaeche}
                      onChange={(e) => handleNumericInput(e, 'wohnflaeche')}
                      placeholder="z.B. 85"
                      className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-[#C5A059] focus:ring-2 focus:ring-[#C5A059]/20 outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-[#0A192F] mb-2">
                      Zimmer *
                    </label>
                    <input
                      type="text"
                      inputMode="decimal"
                      name="zimmer"
                      value={propertyData.zimmer}
                      onChange={(e) => handleNumericInput(e, 'zimmer', true)}
                      placeholder="z.B. 3 oder 3.5"
                      className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-[#C5A059] focus:ring-2 focus:ring-[#C5A059]/20 outline-none transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-[#0A192F] mb-2">
                    Baujahr (optional)
                  </label>
                  <input
                    type="text"
                    inputMode="numeric"
                    name="baujahr"
                    value={propertyData.baujahr}
                    onChange={(e) => handleNumericInput(e, 'baujahr')}
                    placeholder="z.B. 2015"
                    className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-[#C5A059] focus:ring-2 focus:ring-[#C5A059]/20 outline-none transition-all"
                  />
                </div>

                <div className="border-t border-gray-200 pt-5"></div>

                {/* Compact Features */}
                <div>
                  <label className="block text-sm font-semibold text-[#0A192F] mb-3">
                    Ausstattung
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {[...featureCategories.aussenbereich, ...featureCategories.innenraum].slice(0, 8).map((feature) => {
                      const category = featureCategories.aussenbereich.includes(feature) ? 'aussenbereich' : 'innenraum';
                      return (
                        <label key={feature} className="flex items-center space-x-2 cursor-pointer text-sm">
                          <input
                            type="checkbox"
                            checked={propertyData[category].includes(feature)}
                            onChange={() => toggleFeature(category, feature)}
                            className="w-4 h-4 text-[#C5A059] border-gray-300 rounded focus:ring-[#C5A059]"
                          />
                          <span className="text-gray-700">{feature}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>

                <div className="border-t border-gray-200 pt-5"></div>

                {/* Energy Certificate */}
                <div>
                  <label className="block text-sm font-semibold text-[#0A192F] mb-3">
                    Energieausweis (GEG-Pflicht)
                  </label>
                  
                  <button
                    type="button"
                    onClick={handleEnergyUpload}
                    disabled={energyUploadStatus === 'uploading' || energyUploadStatus === 'extracting'}
                    className={`w-full mb-4 px-4 py-3 rounded-lg text-sm font-medium transition-all flex items-center justify-center ${
                      energyUploadStatus === 'complete'
                        ? 'bg-emerald-50 border-2 border-emerald-500 text-emerald-700'
                        : 'bg-slate-50 border-2 border-dashed border-[#C5A059] text-[#0A192F] hover:bg-slate-100'
                    }`}
                  >
                    {energyUploadStatus === 'idle' && (
                      <>
                        <Upload className="w-4 h-4 mr-2" />
                        Energieausweis hochladen
                      </>
                    )}
                    {energyUploadStatus === 'uploading' && (
                      <>
                        <Sparkles className="w-4 h-4 mr-2 animate-pulse" />
                        Wird hochgeladen...
                      </>
                    )}
                    {energyUploadStatus === 'extracting' && (
                      <>
                        <Sparkles className="w-4 h-4 mr-2 animate-spin" />
                        KI extrahiert Daten...
                      </>
                    )}
                    {energyUploadStatus === 'complete' && (
                      <>
                        <Check className="w-4 h-4 mr-2" />
                        Daten erfolgreich extrahiert
                      </>
                    )}
                  </button>

                  <div className="grid grid-cols-2 gap-3">
                    <select
                      name="effizienzklasse"
                      value={propertyData.effizienzklasse}
                      onChange={handleInputChange}
                      className="px-3 py-2 rounded-lg border border-gray-200 focus:border-[#C5A059] focus:ring-2 focus:ring-[#C5A059]/20 outline-none text-sm"
                    >
                      <option value="">Klasse</option>
                      <option value="A+">A+</option>
                      <option value="A">A</option>
                      <option value="B">B</option>
                      <option value="C">C</option>
                      <option value="D">D</option>
                      <option value="E">E</option>
                      <option value="F">F</option>
                      <option value="G">G</option>
                      <option value="H">H</option>
                    </select>

                    <input
                      type="text"
                      inputMode="numeric"
                      name="energiebedarf"
                      value={propertyData.energiebedarf}
                      onChange={(e) => handleNumericInput(e, 'energiebedarf')}
                      placeholder="kWh/m²a"
                      className="px-3 py-2 rounded-lg border border-gray-200 focus:border-[#C5A059] focus:ring-2 focus:ring-[#C5A059]/20 outline-none text-sm"
                    />
                  </div>
                </div>

                {/* Generate Button with Validation */}
                <button 
                  onClick={handleGenerateExpose}
                  disabled={!isFormValid()}
                  className={`w-full px-6 py-4 rounded-lg text-lg font-bold transition-all mt-6 ${
                    isFormValid()
                      ? 'bg-gradient-to-r from-[#C5A059] to-[#A68B4A] hover:from-[#B39050] hover:to-[#957A3F] text-white transform hover:scale-105 shadow-xl cursor-pointer'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  <Sparkles className="w-5 h-5 inline mr-2" />
                  Exposé generieren
                </button>

                {!isFormValid() && (
                  <p className="text-xs text-red-600 text-center">
                    Bitte füllen Sie alle Pflichtfelder (*) aus
                  </p>
                )}

                <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                  <p className="text-xs text-gray-700 leading-relaxed">
                    <Shield className="w-4 h-4 inline mr-1 text-amber-600" />
                    <strong>Rechtssicher:</strong> Die KI erstellt einen Entwurf. Der Makler prüft gemäß GEG alle Pflichtangaben vor Veröffentlichung.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Text Preview Section */}
          {showPreview && (
            <div className="mt-10 bg-white rounded-2xl p-8 shadow-xl border border-gray-100">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-2">
                  <Edit3 className="w-5 h-5 text-[#C5A059]" />
                  <h3 className="text-xl font-bold text-[#0A192F]">Text-Vorschau & Bearbeitung</h3>
                </div>
                <button className="bg-[#0A192F] text-white px-6 py-3 rounded-lg font-semibold hover:bg-opacity-90 transition-all flex items-center space-x-2">
                  <Download className="w-5 h-5" />
                  <span>Als PDF exportieren</span>
                </button>
              </div>
              <textarea
                value={aiGeneratedText}
                onChange={(e) => setAiGeneratedText(e.target.value)}
                className="w-full h-96 px-6 py-4 rounded-xl border border-gray-200 focus:border-[#C5A059] focus:ring-2 focus:ring-[#C5A059]/20 outline-none font-sans text-gray-800 leading-relaxed resize-none"
                placeholder="Hier erscheint der von der KI generierte Exposé-Text..."
              />
              <p className="mt-3 text-sm text-gray-600">
                <Edit3 className="w-4 h-4 inline mr-1" />
                Sie können den Text jederzeit anpassen, bevor Sie ihn als PDF exportieren.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* ============================================ */}
      {/* BENEFITS SECTION */}
      {/* ============================================ */}
      
      <section id="vorteile" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-[#0A192F] mb-4">
              Warum Exposé-Profi?
            </h2>
            <p className="text-xl text-gray-600">Die Vorteile für professionelle Makler</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-gradient-to-br from-slate-50 to-white p-8 rounded-2xl border border-gray-100 hover:shadow-xl transition-all">
              <div className="w-16 h-16 bg-gradient-to-br from-[#C5A059] to-[#A68B4A] rounded-xl flex items-center justify-center mb-6">
                <Clock className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-[#0A192F] mb-4">90% Zeitersparnis</h3>
              <p className="text-gray-600 leading-relaxed">
                Von 2 Stunden auf 5 Minuten. Fokus auf Verkauf statt Verwaltung.
              </p>
            </div>

            <div className="bg-gradient-to-br from-slate-50 to-white p-8 rounded-2xl border border-gray-100 hover:shadow-xl transition-all">
              <div className="w-16 h-16 bg-gradient-to-br from-[#C5A059] to-[#A68B4A] rounded-xl flex items-center justify-center mb-6">
                <Palette className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-[#0A192F] mb-4">Ihr Branding</h3>
              <p className="text-gray-600 leading-relaxed">
                Logo, Farben, Schriftarten – alles in Ihrer Corporate Identity.
              </p>
            </div>

            <div className="bg-gradient-to-br from-slate-50 to-white p-8 rounded-2xl border border-gray-100 hover:shadow-xl transition-all">
              <div className="w-16 h-16 bg-gradient-to-br from-[#C5A059] to-[#A68B4A] rounded-xl flex items-center justify-center mb-6">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-[#0A192F] mb-4">GEG-konform</h3>
              <p className="text-gray-600 leading-relaxed">
                Automatische Prüfung aller Pflichtangaben nach deutschem Recht.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================ */}
      {/* PRICING SECTION (BETA) */}
      {/* ============================================ */}
      
      <section id="preise" className="py-20 bg-gradient-to-b from-slate-50 to-white">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-[#0A192F] mb-4">
              Transparente Preise
            </h2>
            <p className="text-xl text-gray-600">Wählen Sie das passende Paket für Ihr Geschäft</p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {/* Starter Package */}
            <div className="bg-white rounded-2xl p-8 border-2 border-gray-200 hover:border-[#C5A059] transition-all hover:shadow-xl">
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-[#0A192F] mb-2">Starter</h3>
                <p className="text-gray-600 mb-6">Perfekt für gelegentliche Nutzung</p>
                <div className="mb-6">
                  <span className="text-5xl font-bold text-[#0A192F]">29€</span>
                  <span className="text-gray-600 ml-2">pro Exposé</span>
                </div>
              </div>
              
              <ul className="space-y-4 mb-8">
                <li className="flex items-start">
                  <Check className="w-5 h-5 text-green-600 mr-3 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">1 professionelles Exposé</span>
                </li>
                <li className="flex items-start">
                  <Check className="w-5 h-5 text-green-600 mr-3 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">KI-generierte Texte</span>
                </li>
                <li className="flex items-start">
                  <Check className="w-5 h-5 text-green-600 mr-3 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">GEG-konforme Pflichtangaben</span>
                </li>
                <li className="flex items-start">
                  <Check className="w-5 h-5 text-green-600 mr-3 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">PDF-Export in Standarddesign</span>
                </li>
                <li className="flex items-start text-gray-400">
                  <X className="w-5 h-5 mr-3 flex-shrink-0 mt-0.5" />
                  <span>Eigenes Logo & Branding</span>
                </li>
              </ul>
              
              <button 
                onClick={openBetaModal}
                className="w-full bg-gray-900 hover:bg-gray-800 text-white py-4 rounded-lg font-semibold transition-all"
              >
                Beta-Zugang anfordern
              </button>
            </div>

            {/* Pro Package - Highlighted */}
            <div className="bg-gradient-to-br from-[#0A192F] to-[#112240] rounded-2xl p-8 border-2 border-[#C5A059] relative overflow-hidden shadow-2xl">
              <div className="absolute top-4 right-4 bg-[#C5A059] text-white px-4 py-1 rounded-full text-sm font-bold">
                BELIEBT
              </div>
              
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-white mb-2">Pro-Abo</h3>
                <p className="text-gray-300 mb-6">Für professionelle Makler</p>
                <div className="mb-6">
                  <span className="text-5xl font-bold text-white">79€</span>
                  <span className="text-gray-300 ml-2">pro Monat</span>
                </div>
              </div>
              
              <ul className="space-y-4 mb-8">
                <li className="flex items-start">
                  <Check className="w-5 h-5 text-[#C5A059] mr-3 flex-shrink-0 mt-0.5" />
                  <span className="text-white font-semibold">Unbegrenzte Exposés</span>
                </li>
                <li className="flex items-start">
                  <Check className="w-5 h-5 text-[#C5A059] mr-3 flex-shrink-0 mt-0.5" />
                  <span className="text-white">Premium KI-Texte</span>
                </li>
                <li className="flex items-start">
                  <Check className="w-5 h-5 text-[#C5A059] mr-3 flex-shrink-0 mt-0.5" />
                  <span className="text-white">GEG-konforme Pflichtangaben</span>
                </li>
                <li className="flex items-start">
                  <Check className="w-5 h-5 text-[#C5A059] mr-3 flex-shrink-0 mt-0.5" />
                  <span className="text-white font-semibold">Ihr Logo & Ihre Farben</span>
                </li>
                <li className="flex items-start">
                  <Check className="w-5 h-5 text-[#C5A059] mr-3 flex-shrink-0 mt-0.5" />
                  <span className="text-white font-semibold">White-Label PDF-Export</span>
                </li>
                <li className="flex items-start">
                  <Check className="w-5 h-5 text-[#C5A059] mr-3 flex-shrink-0 mt-0.5" />
                  <span className="text-white">Prioritäts-Support</span>
                </li>
              </ul>
              
              <button 
                onClick={openBetaModal}
                className="w-full bg-gradient-to-r from-[#C5A059] to-[#A68B4A] hover:from-[#B39050] hover:to-[#957A3F] text-white py-4 rounded-lg font-bold transition-all transform hover:scale-105 shadow-lg"
              >
                Beta-Zugang anfordern
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================ */}
      {/* FOOTER */}
      {/* ============================================ */}
      
      <footer id="kontakt" className="bg-[#0A192F] text-white py-16">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-8 mb-12">
            <div className="md:col-span-2">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-[#C5A059] to-[#A68B4A] rounded-lg flex items-center justify-center">
                  <FileText className="w-6 h-6 text-white" />
                </div>
                <span className="text-2xl font-bold">Exposé-Profi</span>
              </div>
              <p className="text-gray-400 leading-relaxed mb-6">
                Die führende KI-Lösung für professionelle Immobilien-Exposés. 
                Entwickelt von Maklern für Makler.
              </p>
              <div className="flex space-x-4">
                <button className="w-10 h-10 bg-white/10 hover:bg-white/20 rounded-lg flex items-center justify-center transition-all">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                </button>
                <button className="w-10 h-10 bg-white/10 hover:bg-white/20 rounded-lg flex items-center justify-center transition-all">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/></svg>
                </button>
                <button className="w-10 h-10 bg-white/10 hover:bg-white/20 rounded-lg flex items-center justify-center transition-all">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
                </button>
              </div>
            </div>

            <div>
              <h4 className="text-sm font-bold text-white mb-4 uppercase tracking-wider">Produkt</h4>
              <ul className="space-y-3">
                <li><button onClick={() => scrollToSection('vorteile')} className="text-gray-400 hover:text-[#C5A059] transition-colors">Vorteile</button></li>
                <li><button onClick={() => scrollToSection('preise')} className="text-gray-400 hover:text-[#C5A059] transition-colors">Preise</button></li>
                <li><button onClick={openBetaModal} className="text-gray-400 hover:text-[#C5A059] transition-colors">Beta-Zugang</button></li>
              </ul>
            </div>

            <div>
              <h4 className="text-sm font-bold text-white mb-4 uppercase tracking-wider">Rechtliches</h4>
              <ul className="space-y-3">
                <li>
                  <button 
                    onClick={() => openLegalModal('impressum')}
                    className="text-gray-400 hover:text-[#C5A059] transition-colors text-left"
                  >
                    Impressum
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => openLegalModal('datenschutz')}
                    className="text-gray-400 hover:text-[#C5A059] transition-colors text-left"
                  >
                    Datenschutz
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => openLegalModal('agb')}
                    className="text-gray-400 hover:text-[#C5A059] transition-colors text-left"
                  >
                    AGB
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => openLegalModal('widerruf')}
                    className="text-gray-400 hover:text-[#C5A059] transition-colors text-left"
                  >
                    Widerruf
                  </button>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <p className="text-gray-400 text-sm">
                © 2025 Exposé-Profi. Alle Rechte vorbehalten.
              </p>
              <p className="text-gray-400 text-sm mt-4 md:mt-0">
                Made with ❤️ in Deutschland
              </p>
            </div>
          </div>
        </div>
      </footer>

      {/* ============================================ */}
      {/* MODALS */}
      {/* ============================================ */}

      {/* Legal Modal */}
      {legalContent && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto"
          onClick={closeLegalModal}
        >
          <div 
            className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full my-8 relative"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 px-8 py-6 rounded-t-2xl flex items-center justify-between z-10">
              <h2 className="text-3xl font-bold text-[#0A192F]">
                {legalTexts[legalContent].title}
              </h2>
              <button
                onClick={closeLegalModal}
                className="w-10 h-10 flex items-center justify-center rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
                aria-label="Schließen"
              >
                <X className="w-6 h-6 text-gray-600" />
              </button>
            </div>
            
            {/* Modal Content */}
            <div className="px-8 py-6 max-h-[70vh] overflow-y-auto">
              <div className="prose prose-slate max-w-none text-gray-700 leading-relaxed">
                {legalTexts[legalContent].sections.map((section, index) => (
                  <div key={index} className="mb-6">
                    <h3 className="text-xl font-bold text-[#0A192F] mb-4">{section.heading}</h3>
                    <div className="text-gray-700">
                      {typeof section.content === 'string' ? (
                        <p className="mb-4">{section.content}</p>
                      ) : (
                        section.content
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Modal Footer */}
            <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-8 py-4 rounded-b-2xl">
              <button
                onClick={closeLegalModal}
                className="w-full bg-[#0A192F] hover:bg-[#0A192F]/90 text-white py-3 rounded-lg font-semibold transition-all"
              >
                Schließen
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Beta Waitlist Modal */}
      {showBetaModal && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={closeBetaModal}
        >
          <div 
            className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={closeBetaModal}
              className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
              aria-label="Schließen"
            >
              <X className="w-5 h-5 text-gray-600" />
            </button>

            {!betaSubmitted ? (
              <>
                <div className="text-center mb-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-[#C5A059] to-[#A68B4A] rounded-full flex items-center justify-center mx-auto mb-4">
                    <Sparkles className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-[#0A192F] mb-2">
                    Beta-Zugang anfordern
                  </h3>
                  <p className="text-gray-600">
                    Vielen Dank für Ihr Interesse! Wir befinden uns aktuell in einer exklusiven Beta-Phase. 
                    Hinterlassen Sie Ihre E-Mail-Adresse, und wir benachrichtigen Sie, sobald Ihr Zugang bereit ist.
                  </p>
                </div>

                <form onSubmit={handleBetaSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-[#0A192F] mb-2">
                      E-Mail-Adresse *
                    </label>
                    <input
                      type="email"
                      value={betaEmail}
                      onChange={(e) => setBetaEmail(e.target.value)}
                      placeholder="ihre.email@beispiel.de"
                      required
                      className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-[#C5A059] focus:ring-2 focus:ring-[#C5A059]/20 outline-none transition-all"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-gradient-to-r from-[#C5A059] to-[#A68B4A] hover:from-[#B39050] hover:to-[#957A3F] text-white py-3 rounded-lg font-semibold transition-all transform hover:scale-105 shadow-lg"
                  >
                    Beta-Zugang sichern
                  </button>
                </form>
              </>
            ) : (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Check className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-2xl font-bold text-[#0A192F] mb-2">
                  Vielen Dank!
                </h3>
                <p className="text-gray-600">
                  Wir haben Ihre E-Mail-Adresse erhalten und werden Sie benachrichtigen, 
                  sobald Ihr Beta-Zugang freigeschaltet ist.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
