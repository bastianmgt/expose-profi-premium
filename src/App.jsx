import React, { useState, useEffect, useRef } from 'react';
import {
  Sparkles, Upload, X, Check, Loader2, Download, Eye, Mail,
  Clock, Zap, Shield, Home, Ruler, BedDouble, Bath, Calendar,
  Flame, Car, Image as ImageIcon, CreditCard, Lock, Unlock,
  ChevronDown, CheckCircle, Star
} from 'lucide-react';

export default function ExposeProfiMonument() {
  const [propertyData, setPropertyData] = useState({
    objekttyp: '', vermarktungsart: '', preis: '', plz: '', ort: '',
    wohnflaeche: '', nutzflaeche: '', grundstueck: '', zimmer: '',
    schlafzimmer: '', baeder: '', balkone: '', baujahr: '', sanierung: '',
    heizung: '', keller: '', stellplaetze: '', zustand: '',
    weiteresBesonderheiten: '',
    aussenbereich: [], innenraum: [], parkenKeller: [], technikKomfort: [],
    ausweistyp: '', energiebedarf: '', energietraeger: '', effizienzklasse: ''
  });

  const [uploadedPhotos, setUploadedPhotos] = useState([]);
  const [uploadedLogo, setUploadedLogo] = useState(null);
  const [uploadedEnergyCert, setUploadedEnergyCert] = useState(null);
  const [aiGeneratedText, setAiGeneratedText] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [energyUploadStatus, setEnergyUploadStatus] = useState('idle');
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [betaEmail, setBetaEmail] = useState('');
  const [betaSubmitted, setBetaSubmitted] = useState(false);
  
  const photoInputRef = useRef(null);
  const logoInputRef = useRef(null);
  const energyInputRef = useRef(null);
  const studioRef = useRef(null);

  const features = {
    aussenbereich: ['Balkon', 'Terrasse', 'Garten', 'Dachterrasse', 'Loggia', 'Wintergarten', 'Pool', 'Sauna'],
    innenraum: ['Einbauküche', 'Gäste-WC', 'Kamin', 'Fußbodenheizung', 'Abstellraum', 'Ankleidezimmer', 'Vorratskammer', 'Hauswirtschaftsraum', 'Einbauschränke', 'Parkettboden', 'Bodentiefe Fenster', 'Fliesen', 'Marmorbad'],
    parkenKeller: ['Garage', 'Tiefgarage', 'Außenstellplatz', 'Carport', 'Kellerraum', 'Doppelgarage', 'Stellplatz mit E-Ladestation', 'Fahrradkeller'],
    technikKomfort: ['Aufzug', 'Barrierefrei', 'Smart Home', 'Klimaanlage', 'Photovoltaik', 'Wärmepumpe', 'Videosprechanlage', 'Alarmanlage', 'Rollläden elektrisch', 'Zentralstaubsauger']
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('success') === 'true') {
      setIsUnlocked(true);
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, []);

  const scrollToStudio = () => studioRef.current?.scrollIntoView({ behavior: 'smooth' });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setPropertyData(prev => ({ ...prev, [name]: value }));
  };

  const handleNumericInput = (e, field, decimal = false) => {
    const val = e.target.value;
    if (val === '' || (decimal ? /^\d*\.?\d*$/ : /^\d*$/).test(val)) {
      setPropertyData(prev => ({ ...prev, [field]: val }));
    }
  };

  const toggleFeature = (cat, feat) => {
    setPropertyData(prev => ({
      ...prev,
      [cat]: prev[cat].includes(feat) ? prev[cat].filter(f => f !== feat) : [...prev[cat], feat]
    }));
  };

  const isFormValid = () => {
    return propertyData.wohnflaeche && propertyData.zimmer && propertyData.objekttyp && propertyData.vermarktungsart;
  };

  const compressImage = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new window.Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let w = img.width, h = img.height;
          const MAX = 1024;
          if (w > h && w > MAX) { h *= MAX / w; w = MAX; }
          else if (h > MAX) { w *= MAX / h; h = MAX; }
          canvas.width = w; canvas.height = h;
          canvas.getContext('2d').drawImage(img, 0, 0, w, h);
          resolve(canvas.toDataURL('image/jpeg', 0.8));
        };
        img.onerror = reject;
        img.src = e.target.result;
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handlePhotoUpload = async (files) => {
    const arr = Array.from(files).filter(f => f.type.startsWith('image/')).slice(0, 20 - uploadedPhotos.length);
    try {
      const newPhotos = [];
      for (const file of arr) {
        const base64 = await compressImage(file);
        newPhotos.push({
          id: Date.now() + Math.random(),
          name: file.name,
          preview: URL.createObjectURL(file),
          base64,
          label: ''
        });
      }
      setUploadedPhotos(prev => [...prev, ...newPhotos]);
    } catch (e) {
      alert('Fehler beim Verarbeiten');
    }
  };

  const handleLogoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file || !file.type.startsWith('image/')) return;
    try {
      const base64 = await compressImage(file);
      setUploadedLogo({
        id: Date.now(),
        name: file.name,
        preview: URL.createObjectURL(file),
        base64
      });
    } catch (e) {}
  };

  const handleEnergyUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setEnergyUploadStatus('uploading');
    try {
      let base64;
      if (file.type.startsWith('image/')) {
        base64 = await compressImage(file);
      } else {
        base64 = await new Promise((res, rej) => {
          const reader = new FileReader();
          reader.onload = () => res(reader.result);
          reader.onerror = rej;
          reader.readAsDataURL(file);
        });
      }
      setUploadedEnergyCert({ id: Date.now(), name: file.name, base64 });
      setEnergyUploadStatus('extracting');
      
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode: 'ocr', energyCertificate: base64 })
      });
      
      const data = await response.json();
      if (data.success && data.data) {
        setPropertyData(prev => ({
          ...prev,
          effizienzklasse: data.data.effizienzklasse || '',
          energiebedarf: data.data.energiebedarf || '',
          energietraeger: data.data.energietraeger || '',
          ausweistyp: data.data.ausweistyp || ''
        }));
        setEnergyUploadStatus('complete');
      } else throw new Error();
    } catch (e) {
      setEnergyUploadStatus('error');
      setTimeout(() => setEnergyUploadStatus('idle'), 3000);
    }
  };

  const updatePhotoLabel = (id, label) => {
    setUploadedPhotos(prev => prev.map(p => p.id === id ? { ...p, label } : p));
  };

  const removePhoto = (id) => {
    setUploadedPhotos(prev => {
      const p = prev.find(x => x.id === id);
      if (p?.preview) URL.revokeObjectURL(p.preview);
      return prev.filter(x => x.id !== id);
    });
  };

  const handleDragOver = (e) => { e.preventDefault(); setIsDragging(true); };
  const handleDragLeave = () => setIsDragging(false);
  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    handlePhotoUpload(e.dataTransfer.files);
  };

  const handleGenerate = async () => {
    if (!isFormValid()) return;
    setIsGenerating(true);
    setGenerationProgress(0);
    setAiGeneratedText('');
    setIsUnlocked(false);

    try {
      const interval = setInterval(() => {
        setGenerationProgress(p => p >= 90 ? 90 : p + 10);
      }, 300);

      const photos = uploadedPhotos.map(p => ({ base64: p.base64, label: p.label }));
      
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          propertyData: { ...propertyData, uploadedPhotosCount: uploadedPhotos.length },
          photos,
          mode: 'generate'
        })
      });

      clearInterval(interval);
      setGenerationProgress(100);

      const data = await response.json();
      if (data.success && data.text) {
        setAiGeneratedText(data.text);
      } else {
        setAiGeneratedText('❌ Fehler bei der Generierung');
      }
    } catch (e) {
      setAiGeneratedText(`❌ Fehler: ${e.message}`);
    } finally {
      setIsGenerating(false);
      setGenerationProgress(0);
    }
  };

  const openPayment = () => setShowPaymentModal(true);
  const closePayment = () => setShowPaymentModal(false);
  const handlePaymentSuccess = () => {
    setIsUnlocked(true);
    setShowPaymentModal(false);
  };

  const getTeaserText = () => {
    if (isUnlocked || aiGeneratedText.length <= 300) return aiGeneratedText;
    return aiGeneratedText.substring(0, 300);
  };

  const getBlurredText = () => {
    if (isUnlocked || aiGeneratedText.length <= 300) return '';
    return aiGeneratedText.substring(300);
  };

  const handleExportPDF = () => {
    const { jsPDF } = window.jspdf;
    if (!jsPDF) { alert('PDF nicht geladen'); return; }

    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const w = doc.internal.pageSize.getWidth();
    const h = doc.internal.pageSize.getHeight();
    const m = 20;
    let y = m;

    const gold = { r: 197, g: 160, b: 89 };
    const navy = { r: 10, g: 25, b: 47 };

    if (uploadedLogo?.base64) {
      try { doc.addImage(uploadedLogo.base64, 'JPEG', m, y, 40, 20); } catch (e) {}
    }
    y += 30;

    if (uploadedPhotos[0]?.base64) {
      try { doc.addImage(uploadedPhotos[0].base64, 'JPEG', m, y, w - 2 * m, 100); } catch (e) {}
      y += 110;
    }

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(20);
    doc.setTextColor(navy.r, navy.g, navy.b);
    doc.text(`${propertyData.objekttyp || 'Immobilie'} in ${propertyData.ort || 'Lage'}`, m, y);
    y += 15;

    doc.setDrawColor(gold.r, gold.g, gold.b);
    doc.setLineWidth(0.5);
    doc.line(m, y, w - m, y);
    y += 10;

    const info = [
      `${propertyData.wohnflaeche} m²`,
      `${propertyData.zimmer} Zimmer`,
      propertyData.baujahr ? `Bj ${propertyData.baujahr}` : null,
      propertyData.preis ? `${Number(propertyData.preis).toLocaleString('de-DE')} €` : null
    ].filter(Boolean).join('  •  ');
    
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text(info, m, y);
    y += 15;

    doc.addPage();
    y = m;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.text('Beschreibung', m, y);
    y += 10;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    const lines = doc.splitTextToSize(aiGeneratedText, w - 2 * m);
    lines.forEach(line => {
      if (y > h - 30) {
        doc.addPage();
        y = m;
      }
      doc.text(line, m, y);
      y += 5;
    });

    const file = `Expose_${propertyData.objekttyp || 'Immobilie'}_${propertyData.ort || 'Objekt'}_${new Date().toISOString().split('T')[0]}.pdf`;
    doc.save(file);
  };

  const handleExportEmail = () => {
    const subj = `Exposé: ${propertyData.objekttyp || 'Objekt'} in ${propertyData.ort || 'Lage'}`;
    const body = `${aiGeneratedText}\n\n---\nErstellt mit Exposé-Profi`;
    window.location.href = `mailto:?subject=${encodeURIComponent(subj)}&body=${encodeURIComponent(body)}`;
  };

  const handleBetaSubmit = (e) => {
    e.preventDefault();
    if (betaEmail && betaEmail.includes('@')) {
      setBetaSubmitted(true);
      setTimeout(() => {
        setBetaEmail('');
        setBetaSubmitted(false);
      }, 5000);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* HERO */}
      <section className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0A192F] via-[#112240] to-[#0A192F] text-white overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-10 w-96 h-96 bg-[#C5A059] rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-[#C5A059] rounded-full blur-3xl"></div>
        </div>
        
        <div className="relative z-10 max-w-6xl mx-auto px-6 text-center">
          <div className="inline-flex items-center space-x-2 bg-white/10 backdrop-blur-lg rounded-full px-6 py-3 mb-8 border border-white/20">
            <Sparkles className="w-5 h-5 text-[#C5A059]" />
            <span className="text-sm font-medium">Powered by Vision-KI</span>
          </div>
          
          <h1 className="text-7xl md:text-8xl font-bold mb-6 leading-tight">
            Exposés in<br/>
            <span className="bg-gradient-to-r from-[#C5A059] via-[#D4AF6A] to-[#C5A059] bg-clip-text text-transparent">Perfektion</span>
          </h1>
          
          <p className="text-xl md:text-2xl text-gray-300 mb-12 max-w-3xl mx-auto leading-relaxed">
            Immobilien-Exposés, die verkaufen. Erstellt von Vision-KI, die Architektur versteht.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6">
            <button onClick={scrollToStudio}
              className="group px-10 py-5 bg-gradient-to-r from-[#C5A059] to-[#B39050] hover:from-[#D4AF6A] hover:to-[#C5A059] text-white rounded-2xl text-lg font-bold transition-all transform hover:scale-105 shadow-2xl">
              <span className="flex items-center space-x-2">
                <Sparkles className="w-6 h-6" />
                <span>Jetzt erstellen</span>
              </span>
            </button>
            <button
              className="px-10 py-5 bg-white/10 hover:bg-white/20 backdrop-blur-lg border border-white/20 rounded-2xl text-lg font-bold transition-all">
              Demo ansehen
            </button>
          </div>
          
          <div className="mt-16 grid grid-cols-3 gap-8 max-w-3xl mx-auto">
            {[
              { num: '<30s', text: 'Generierung' },
              { num: '10.000+', text: 'Exposés erstellt' },
              { num: '98%', text: 'Zufriedenheit' }
            ].map((stat, i) => (
              <div key={i} className="text-center">
                <div className="text-4xl font-bold text-[#C5A059] mb-2">{stat.num}</div>
                <div className="text-sm text-gray-400">{stat.text}</div>
              </div>
            ))}
          </div>
        </div>
        
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce">
          <ChevronDown className="w-8 h-8 text-white/50" />
        </div>
      </section>

      {/* BENEFITS */}
      <section className="py-32 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-20">
            <h2 className="text-5xl font-bold text-[#0A192F] mb-6">
              Warum Exposé-Profi?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Die intelligente Lösung für professionelle Immobilien-Exposés
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Clock,
                title: 'Zeitersparnis',
                desc: 'Von Stunden auf Minuten. Unsere Vision-KI analysiert Fotos und erstellt in Sekunden verkaufsstarke Texte.',
                color: 'from-blue-500 to-cyan-500'
              },
              {
                icon: Eye,
                title: 'Bild-Intelligenz',
                desc: 'Beschriften Sie Fotos ("Badezimmer", "Küche") und die KI beschreibt Materialien, Licht und Details präzise.',
                color: 'from-[#C5A059] to-[#D4AF6A]'
              },
              {
                icon: Shield,
                title: 'Rechtssicherheit',
                desc: 'Automatische Energieausweis-Erkennung (OCR) und GEG-konforme Pflichtangaben in jedem Exposé.',
                color: 'from-green-500 to-emerald-500'
              }
            ].map((benefit, i) => (
              <div key={i} className="group relative bg-white rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all">
                <div className={`w-16 h-16 bg-gradient-to-br ${benefit.color} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                  <benefit.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-[#0A192F] mb-4">{benefit.title}</h3>
                <p className="text-gray-600 leading-relaxed">{benefit.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* STUDIO */}
      <section ref={studioRef} className="py-32 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-20">
            <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-[#C5A059]/10 to-[#D4AF6A]/10 rounded-full px-6 py-3 mb-6">
              <Sparkles className="w-5 h-5 text-[#C5A059]" />
              <span className="text-sm font-semibold text-[#0A192F]">Das magische Studio</span>
            </div>
            <h2 className="text-5xl font-bold text-[#0A192F] mb-6">
              Ihr Exposé in 3 Schritten
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Füllen Sie die Daten aus, laden Sie Fotos hoch, und lassen Sie die KI arbeiten
            </p>
          </div>

          {/* BASISDATEN KARTE */}
          <div className="bg-gradient-to-br from-gray-50 to-white rounded-3xl p-8 shadow-xl mb-8 border border-gray-100">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-[#C5A059] to-[#B39050] rounded-xl flex items-center justify-center">
                <Home className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-[#0A192F]">Basisdaten</h3>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-semibold text-[#0A192F] mb-2">Objekttyp *</label>
                <select name="objekttyp" value={propertyData.objekttyp} onChange={handleInputChange}
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#C5A059] focus:ring-4 focus:ring-[#C5A059]/20 outline-none transition-all">
                  <option value="">Wählen</option>
                  <option value="Haus">Haus</option>
                  <option value="Wohnung">Wohnung</option>
                  <option value="Loft">Loft</option>
                  <option value="Penthouse">Penthouse</option>
                  <option value="Gewerbe">Gewerbe</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#0A192F] mb-2">Vermarktung *</label>
                <div className="grid grid-cols-2 gap-3">
                  {['Verkauf', 'Vermietung'].map(t => (
                    <button key={t} type="button"
                      onClick={() => setPropertyData(prev => ({ ...prev, vermarktungsart: t }))}
                      className={`px-4 py-3 rounded-xl font-semibold transition-all ${
                        propertyData.vermarktungsart === t
                          ? 'bg-gradient-to-r from-[#C5A059] to-[#B39050] text-white shadow-lg'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}>
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#0A192F] mb-2">
                  {propertyData.vermarktungsart === 'Verkauf' ? 'Kaufpreis' : 'Kaltmiete'} (€)
                </label>
                <input type="text" name="preis" value={propertyData.preis}
                  onChange={(e) => handleNumericInput(e, 'preis')}
                  placeholder="350000"
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#C5A059] focus:ring-4 focus:ring-[#C5A059]/20 outline-none transition-all" />
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#0A192F] mb-2">PLZ</label>
                <input type="text" name="plz" value={propertyData.plz}
                  onChange={(e) => handleNumericInput(e, 'plz')} maxLength="5"
                  placeholder="79379"
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#C5A059] focus:ring-4 focus:ring-[#C5A059]/20 outline-none transition-all" />
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#0A192F] mb-2">Ort</label>
                <input type="text" name="ort" value={propertyData.ort} onChange={handleInputChange}
                  placeholder="Müllheim"
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#C5A059] focus:ring-4 focus:ring-[#C5A059]/20 outline-none transition-all" />
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#0A192F] mb-2">Besonderheiten (optional)</label>
                <input type="text" name="weiteresBesonderheiten" value={propertyData.weiteresBesonderheiten} onChange={handleInputChange}
                  placeholder="z.B. Weinberglage"
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#C5A059] focus:ring-4 focus:ring-[#C5A059]/20 outline-none transition-all" />
              </div>
            </div>
          </div>

          {/* FLÄCHEN KARTE */}
          <div className="bg-gradient-to-br from-gray-50 to-white rounded-3xl p-8 shadow-xl mb-8 border border-gray-100">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center">
                <Ruler className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-[#0A192F]">Flächen & Räume</h3>
            </div>
            
            <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-6">
              {[
                { label: 'Wohnfläche (m²) *', field: 'wohnflaeche', ph: '85' },
                { label: 'Nutzfläche (m²)', field: 'nutzflaeche', ph: '15' },
                { label: 'Grundstück (m²)', field: 'grundstueck', ph: '500' },
                { label: 'Zimmer *', field: 'zimmer', ph: '3', decimal: true },
                { label: 'Schlafzimmer', field: 'schlafzimmer', ph: '2' },
                { label: 'Bäder', field: 'baeder', ph: '1' },
                { label: 'Balkone', field: 'balkone', ph: '1' }
              ].map((f, i) => (
                <div key={i}>
                  <label className="block text-sm font-semibold text-[#0A192F] mb-2">{f.label}</label>
                  <input type="text" value={propertyData[f.field]}
                    onChange={(e) => handleNumericInput(e, f.field, f.decimal)}
                    placeholder={f.ph}
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#C5A059] focus:ring-4 focus:ring-[#C5A059]/20 outline-none transition-all" />
                </div>
              ))}
            </div>
          </div>

          {/* ZUSTAND KARTE */}
          <div className="bg-gradient-to-br from-gray-50 to-white rounded-3xl p-8 shadow-xl mb-8 border border-gray-100">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center">
                <Calendar className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-[#0A192F]">Zustand & Technik</h3>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div>
                <label className="block text-sm font-semibold text-[#0A192F] mb-2">Baujahr</label>
                <input type="text" value={propertyData.baujahr}
                  onChange={(e) => handleNumericInput(e, 'baujahr')}
                  placeholder="2015"
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#C5A059] focus:ring-4 focus:ring-[#C5A059]/20 outline-none transition-all" />
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#0A192F] mb-2">Letzte Sanierung</label>
                <input type="text" value={propertyData.sanierung}
                  onChange={(e) => handleNumericInput(e, 'sanierung')}
                  placeholder="2020"
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#C5A059] focus:ring-4 focus:ring-[#C5A059]/20 outline-none transition-all" />
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#0A192F] mb-2">Heizung</label>
                <select name="heizung" value={propertyData.heizung} onChange={handleInputChange}
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#C5A059] focus:ring-4 focus:ring-[#C5A059]/20 outline-none transition-all">
                  <option value="">Wählen</option>
                  <option value="Gas">Gas</option>
                  <option value="Öl">Öl</option>
                  <option value="Fernwärme">Fernwärme</option>
                  <option value="Wärmepumpe">Wärmepumpe</option>
                  <option value="Pellets">Pellets</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#0A192F] mb-2">Keller</label>
                <select name="keller" value={propertyData.keller} onChange={handleInputChange}
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#C5A059] focus:ring-4 focus:ring-[#C5A059]/20 outline-none transition-all">
                  <option value="">Wählen</option>
                  <option value="Ja">Ja</option>
                  <option value="Nein">Nein</option>
                  <option value="Teilunterkellert">Teilunterkellert</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#0A192F] mb-2">Zustand</label>
                <div className="grid grid-cols-3 gap-2">
                  {['Neuwertig', 'Gepflegt', 'Renovierungsbedürftig'].map(z => (
                    <button key={z} type="button"
                      onClick={() => setPropertyData(prev => ({ ...prev, zustand: z }))}
                      className={`px-3 py-2 rounded-lg text-sm font-semibold transition-all ${
                        propertyData.zustand === z
                          ? 'bg-gradient-to-r from-[#C5A059] to-[#B39050] text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}>
                      {z === 'Neuwertig' ? 'Neu' : z === 'Gepflegt' ? 'Gepfl.' : 'Renov.'}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#0A192F] mb-2">Stellplätze</label>
                <input type="text" value={propertyData.stellplaetze}
                  onChange={(e) => handleNumericInput(e, 'stellplaetze')}
                  placeholder="2"
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#C5A059] focus:ring-4 focus:ring-[#C5A059]/20 outline-none transition-all" />
              </div>
            </div>
          </div>

          {/* AUSSTATTUNG KARTE */}
          <div className="bg-gradient-to-br from-gray-50 to-white rounded-3xl p-8 shadow-xl mb-8 border border-gray-100">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-[#0A192F]">Ausstattung</h3>
            </div>
            
            {Object.entries(features).map(([cat, feats]) => (
              <div key={cat} className="mb-6 last:mb-0">
                <h4 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3">
                  {cat === 'aussenbereich' ? 'Außenbereich' :
                   cat === 'innenraum' ? 'Innenraum' :
                   cat === 'parkenKeller' ? 'Parken & Keller' : 'Technik & Komfort'}
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                  {feats.map(f => (
                    <label key={f} className="flex items-center space-x-2 cursor-pointer group">
                      <input type="checkbox"
                        checked={propertyData[cat].includes(f)}
                        onChange={() => toggleFeature(cat, f)}
                        className="w-5 h-5 rounded text-[#C5A059] border-gray-300 focus:ring-[#C5A059] focus:ring-2 transition-all" />
                      <span className="text-sm text-gray-700 group-hover:text-[#0A192F] transition-colors">{f}</span>
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* UPLOADS KARTE */}
          <div className="bg-gradient-to-br from-gray-50 to-white rounded-3xl p-8 shadow-xl mb-8 border border-gray-100">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center">
                <ImageIcon className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-[#0A192F]">Uploads</h3>
            </div>

            <div className="space-y-8">
              {/* Logo */}
              <div>
                <label className="block text-sm font-semibold text-[#0A192F] mb-3">Logo</label>
                <input ref={logoInputRef} type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
                <button onClick={() => logoInputRef.current?.click()}
                  className="w-full border-2 border-dashed border-gray-300 hover:border-[#C5A059] rounded-2xl p-6 transition-all bg-white">
                  {uploadedLogo ? (
                    <div className="flex items-center space-x-4">
                      <img src={uploadedLogo.preview} alt="Logo" className="w-20 h-20 object-contain" />
                      <span className="text-sm text-gray-700">{uploadedLogo.name}</span>
                    </div>
                  ) : (
                    <div className="text-center text-gray-500">
                      <Upload className="w-10 h-10 mx-auto mb-2" />
                      <span className="text-sm font-medium">Logo hochladen</span>
                    </div>
                  )}
                </button>
              </div>

              {/* Fotos */}
              <div>
                <label className="block text-sm font-semibold text-[#0A192F] mb-3">Objektfotos (mit Beschriftung)</label>
                <input ref={photoInputRef} type="file" accept="image/*" multiple onChange={(e) => handlePhotoUpload(e.target.files)} className="hidden" />
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => photoInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-2xl p-8 cursor-pointer transition-all ${
                    isDragging ? 'border-[#C5A059] bg-[#C5A059]/5' : 'border-gray-300 hover:border-[#C5A059] bg-white'
                  }`}>
                  <div className="text-center text-gray-500">
                    <Upload className="w-12 h-12 mx-auto mb-3" />
                    <span className="text-sm font-medium block mb-1">Drag & Drop oder Klicken</span>
                    <span className="text-xs text-gray-400">Max. 20 Fotos</span>
                  </div>
                </div>

                {uploadedPhotos.length > 0 && (
                  <div className="mt-6 space-y-4">
                    {uploadedPhotos.map(p => (
                      <div key={p.id} className="flex items-start space-x-4 bg-white p-4 rounded-xl border border-gray-200">
                        <img src={p.preview} alt={p.name} className="w-24 h-24 object-cover rounded-lg" />
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-700 mb-2">{p.name}</p>
                          <input type="text" value={p.label}
                            onChange={(e) => updatePhotoLabel(p.id, e.target.value)}
                            placeholder="Beschriftung (z.B. 'Badezimmer')"
                            className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 focus:border-[#C5A059] focus:ring-2 focus:ring-[#C5A059]/20 outline-none" />
                        </div>
                        <button onClick={() => removePhoto(p.id)}
                          className="text-red-500 hover:text-red-600 transition-colors">
                          <X className="w-5 h-5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Energieausweis */}
              <div>
                <label className="block text-sm font-semibold text-[#0A192F] mb-3">Energieausweis (OCR)</label>
                <input ref={energyInputRef} type="file" accept="image/*,application/pdf" onChange={handleEnergyUpload} className="hidden" />
                <button onClick={() => energyInputRef.current?.click()}
                  disabled={energyUploadStatus === 'uploading' || energyUploadStatus === 'extracting'}
                  className={`w-full px-6 py-4 rounded-xl text-sm font-semibold transition-all ${
                    energyUploadStatus === 'complete' ? 'bg-emerald-50 border-2 border-emerald-500 text-emerald-700' :
                    energyUploadStatus === 'error' ? 'bg-red-50 border-2 border-red-500 text-red-700' :
                    'bg-gray-50 border-2 border-dashed border-gray-300 text-gray-700 hover:border-[#C5A059]'
                  }`}>
                  {energyUploadStatus === 'idle' && (<><Upload className="w-5 h-5 inline mr-2" />Energieausweis hochladen</>)}
                  {energyUploadStatus === 'uploading' && (<><Loader2 className="w-5 h-5 inline mr-2 animate-spin" />Hochladen...</>)}
                  {energyUploadStatus === 'extracting' && (<><Loader2 className="w-5 h-5 inline mr-2 animate-spin" />KI extrahiert...</>)}
                  {energyUploadStatus === 'complete' && (<><Check className="w-5 h-5 inline mr-2" />Erfolgreich</>)}
                  {energyUploadStatus === 'error' && (<><X className="w-5 h-5 inline mr-2" />Fehler</>)}
                </button>
                {(energyUploadStatus === 'complete' || propertyData.effizienzklasse) && (
                  <div className="mt-4 grid grid-cols-3 gap-4">
                    <select name="effizienzklasse" value={propertyData.effizienzklasse} onChange={handleInputChange}
                      className="px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#C5A059] outline-none">
                      <option value="">Klasse</option>
                      {['A+', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'].map(k => <option key={k} value={k}>{k}</option>)}
                    </select>
                    <input type="text" value={propertyData.energiebedarf}
                      onChange={(e) => handleNumericInput(e, 'energiebedarf')}
                      placeholder="kWh/m²a"
                      className="px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#C5A059] outline-none" />
                    <select name="energietraeger" value={propertyData.energietraeger} onChange={handleInputChange}
                      className="px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#C5A059] outline-none">
                      <option value="">Träger</option>
                      <option value="Gas">Gas</option>
                      <option value="Öl">Öl</option>
                      <option value="Fernwärme">Fernwärme</option>
                      <option value="Strom">Strom</option>
                    </select>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* GENERATE BUTTON */}
          <button onClick={handleGenerate}
            disabled={!isFormValid() || isGenerating}
            className={`w-full py-6 rounded-2xl text-xl font-bold transition-all shadow-2xl ${
              isFormValid() && !isGenerating
                ? 'bg-gradient-to-r from-[#C5A059] to-[#B39050] hover:from-[#D4AF6A] hover:to-[#C5A059] text-white transform hover:scale-105'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}>
            {isGenerating ? (
              <span className="flex items-center justify-center space-x-3">
                <Loader2 className="w-6 h-6 animate-spin" />
                <span>KI analysiert Architektur...</span>
              </span>
            ) : (
              <span className="flex items-center justify-center space-x-3">
                <Sparkles className="w-6 h-6" />
                <span>Premium-Exposé generieren</span>
              </span>
            )}
          </button>

          {isGenerating && generationProgress > 0 && (
            <div className="mt-6 bg-white rounded-2xl p-6 shadow-lg">
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div className="bg-gradient-to-r from-[#C5A059] to-[#D4AF6A] h-3 rounded-full transition-all duration-500"
                  style={{ width: `${generationProgress}%` }} />
              </div>
              <p className="text-sm text-center text-gray-600 mt-3">
                {uploadedPhotos.length > 0 ? `Analysiere ${uploadedPhotos.length} Foto${uploadedPhotos.length > 1 ? 's' : ''}...` : 'Generiere Text...'}
              </p>
            </div>
          )}

          {/* RESULT */}
          {aiGeneratedText && (
            <div className="mt-12 bg-white rounded-3xl shadow-2xl border border-gray-200 overflow-hidden">
              <div className="bg-gradient-to-r from-[#0A192F] to-[#112240] px-8 py-6 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Eye className="w-6 h-6 text-[#C5A059]" />
                  <h3 className="text-2xl font-bold text-white">Ihr Exposé</h3>
                </div>
                {isUnlocked && (
                  <div className="flex space-x-3">
                    <button onClick={handleExportPDF}
                      className="px-6 py-3 bg-white/10 hover:bg-white/20 backdrop-blur-lg border border-white/20 rounded-xl text-white font-semibold transition-all flex items-center space-x-2">
                      <Download className="w-5 h-5" />
                      <span>PDF</span>
                    </button>
                    <button onClick={handleExportEmail}
                      className="px-6 py-3 bg-gradient-to-r from-[#C5A059] to-[#B39050] hover:from-[#D4AF6A] hover:to-[#C5A059] rounded-xl text-white font-semibold transition-all flex items-center space-x-2">
                      <Mail className="w-5 h-5" />
                      <span>E-Mail</span>
                    </button>
                  </div>
                )}
              </div>

              <div className="p-8 relative">
                <div className="prose prose-lg max-w-none">
                  <div className="whitespace-pre-wrap text-gray-800 leading-relaxed">
                    {getTeaserText()}
                  </div>
                  
                  {!isUnlocked && getBlurredText() && (
                    <div className="relative mt-4">
                      <div className="whitespace-pre-wrap text-gray-800 leading-relaxed blur-md select-none">
                        {getBlurredText()}
                      </div>
                      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/90 to-white flex items-center justify-center">
                        <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl p-10 text-center max-w-md border-2 border-[#C5A059]/20">
                          <div className="w-20 h-20 bg-gradient-to-br from-[#C5A059] to-[#B39050] rounded-full flex items-center justify-center mx-auto mb-6">
                            <Lock className="w-10 h-10 text-white" />
                          </div>
                          <h4 className="text-3xl font-bold text-[#0A192F] mb-3">Premium-Exposé</h4>
                          <p className="text-gray-600 mb-8 leading-relaxed">
                            Schalten Sie das vollständige Exposé mit allen Funktionen frei.
                          </p>
                          <button onClick={openPayment}
                            className="w-full bg-gradient-to-r from-[#C5A059] to-[#B39050] hover:from-[#D4AF6A] hover:to-[#C5A059] text-white px-8 py-4 rounded-2xl text-lg font-bold transition-all transform hover:scale-105 shadow-xl flex items-center justify-center space-x-2">
                            <Unlock className="w-6 h-6" />
                            <span>Jetzt für 29€ freischalten</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* PRICING */}
      <section className="py-32 bg-gradient-to-br from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-20">
            <h2 className="text-5xl font-bold text-[#0A192F] mb-6">
              Preise & Pakete
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Wählen Sie das passende Modell für Ihre Bedürfnisse
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {[
              {
                name: 'Starter',
                price: '29€',
                per: 'pro Exposé',
                desc: 'Perfekt für gelegentliche Nutzung',
                features: ['Vision-KI Analyse', 'Foto-Beschriftungen', 'OCR Energieausweis', 'PDF-Export', 'E-Mail-Export'],
                cta: 'Jetzt starten',
                highlight: false
              },
              {
                name: 'Pro-Abo',
                price: '79€',
                per: 'pro Monat',
                desc: 'Für professionelle Makler',
                features: ['Alles aus Starter', '10 Exposés inkl.', 'Eigenes Branding', 'Prioritäts-Support', 'Beta-Features'],
                cta: 'Pro werden',
                highlight: true
              }
            ].map((plan, i) => (
              <div key={i} className={`relative bg-white rounded-3xl p-8 shadow-xl transition-all hover:shadow-2xl ${
                plan.highlight ? 'ring-4 ring-[#C5A059] transform scale-105' : ''
              }`}>
                {plan.highlight && (
                  <div className="absolute -top-5 left-1/2 -translate-x-1/2">
                    <div className="bg-gradient-to-r from-[#C5A059] to-[#B39050] text-white px-6 py-2 rounded-full text-sm font-bold flex items-center space-x-1">
                      <Star className="w-4 h-4" />
                      <span>Beliebt</span>
                    </div>
                  </div>
                )}

                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold text-[#0A192F] mb-2">{plan.name}</h3>
                  <p className="text-gray-600 text-sm mb-6">{plan.desc}</p>
                  <div className="mb-2">
                    <span className="text-5xl font-bold text-[#0A192F]">{plan.price}</span>
                  </div>
                  <p className="text-gray-500 text-sm">{plan.per}</p>
                </div>

                <div className="space-y-4 mb-8">
                  {plan.features.map((feat, j) => (
                    <div key={j} className="flex items-center space-x-3">
                      <CheckCircle className="w-5 h-5 text-[#C5A059] flex-shrink-0" />
                      <span className="text-gray-700">{feat}</span>
                    </div>
                  ))}
                </div>

                <button
                  className={`w-full py-4 rounded-2xl font-bold transition-all ${
                    plan.highlight
                      ? 'bg-gradient-to-r from-[#C5A059] to-[#B39050] hover:from-[#D4AF6A] hover:to-[#C5A059] text-white shadow-lg transform hover:scale-105'
                      : 'bg-gray-100 hover:bg-gray-200 text-[#0A192F]'
                  }`}>
                  {plan.cta}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* BETA */}
      <section className="py-32 bg-gradient-to-br from-[#0A192F] via-[#112240] to-[#0A192F] text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 right-10 w-96 h-96 bg-[#C5A059] rounded-full blur-3xl"></div>
        </div>

        <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-5xl font-bold mb-6">
            Werde Beta-Tester
          </h2>
          <p className="text-xl text-gray-300 mb-12 leading-relaxed">
            Erhalte exklusiven Zugang zu neuen Features und gestalte die Zukunft von Exposé-Profi mit.
          </p>

          {betaSubmitted ? (
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20">
              <Check className="w-16 h-16 text-[#C5A059] mx-auto mb-4" />
              <p className="text-xl font-semibold">Vielen Dank für Ihre Anmeldung!</p>
              <p className="text-gray-300 mt-2">Wir melden uns in Kürze bei Ihnen.</p>
            </div>
          ) : (
            <form onSubmit={handleBetaSubmit} className="max-w-xl mx-auto">
              <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
                <input type="email" value={betaEmail} onChange={(e) => setBetaEmail(e.target.value)}
                  placeholder="ihre.email@beispiel.de"
                  required
                  className="flex-1 px-6 py-4 rounded-2xl bg-white/10 backdrop-blur-lg border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-4 focus:ring-[#C5A059]/50" />
                <button type="submit"
                  className="px-10 py-4 bg-gradient-to-r from-[#C5A059] to-[#B39050] hover:from-[#D4AF6A] hover:to-[#C5A059] rounded-2xl font-bold transition-all transform hover:scale-105 shadow-xl">
                  Anmelden
                </button>
              </div>
            </form>
          )}
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-[#0A192F] text-white py-16">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-12 mb-12">
            <div>
              <div className="flex items-center space-x-2 mb-6">
                <div className="w-10 h-10 bg-gradient-to-br from-[#C5A059] to-[#B39050] rounded-lg flex items-center justify-center">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <span className="text-xl font-bold">Exposé-Profi</span>
              </div>
              <p className="text-gray-400 text-sm leading-relaxed">
                Vision-KI für professionelle Immobilien-Exposés.
              </p>
            </div>

            <div>
              <h4 className="font-bold mb-4">Produkt</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-[#C5A059] transition-colors">Features</a></li>
                <li><a href="#" className="hover:text-[#C5A059] transition-colors">Preise</a></li>
                <li><a href="#" className="hover:text-[#C5A059] transition-colors">Demo</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold mb-4">Rechtliches</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#impressum" className="hover:text-[#C5A059] transition-colors">Impressum</a></li>
                <li><a href="#datenschutz" className="hover:text-[#C5A059] transition-colors">Datenschutz</a></li>
                <li><a href="#agb" className="hover:text-[#C5A059] transition-colors">AGB</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold mb-4">Kontakt</h4>
              <p className="text-sm text-gray-400 mb-2">Bastian Marget</p>
              <p className="text-sm text-gray-400 mb-2">Werderstraße 16a</p>
              <p className="text-sm text-gray-400">79379 Müllheim</p>
              <p className="text-sm text-[#C5A059] mt-4">info@expose-profi.de</p>
            </div>
          </div>

          <div className="border-t border-white/10 pt-8">
            <p className="text-center text-sm text-gray-500">
              © 2026 Exposé-Profi. Alle Rechte vorbehalten.
            </p>
          </div>
        </div>
      </footer>

      {/* PAYMENT MODAL */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={closePayment}>
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8 relative" onClick={(e) => e.stopPropagation()}>
            <button onClick={closePayment} className="absolute top-4 right-4 w-10 h-10 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 transition-colors">
              <X className="w-5 h-5 text-gray-600" />
            </button>

            <div className="text-center mb-8">
              <div className="w-20 h-20 bg-gradient-to-br from-[#C5A059] to-[#B39050] rounded-full flex items-center justify-center mx-auto mb-6">
                <CreditCard className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-3xl font-bold text-[#0A192F] mb-3">Premium freischalten</h3>
              <div className="bg-[#C5A059]/10 border border-[#C5A059]/30 rounded-2xl p-6 mb-6">
                <div className="text-5xl font-bold text-[#0A192F] mb-2">29€</div>
                <div className="text-sm text-gray-600">einmalig pro Exposé</div>
              </div>
            </div>

            <div className="space-y-4 mb-8">
              {[
                'Vollständiger Premium-Text',
                'PDF-Export mit Branding',
                'E-Mail-Versand',
                'Text-Bearbeitung'
              ].map((f, i) => (
                <div key={i} className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-[#C5A059] flex-shrink-0" />
                  <span className="text-gray-700">{f}</span>
                </div>
              ))}
            </div>

            <button onClick={handlePaymentSuccess}
              className="w-full bg-gradient-to-r from-[#C5A059] to-[#B39050] hover:from-[#D4AF6A] hover:to-[#C5A059] text-white py-5 rounded-2xl text-lg font-bold transition-all transform hover:scale-105 shadow-xl flex items-center justify-center space-x-2">
              <CreditCard className="w-6 h-6" />
              <span>Jetzt freischalten (Demo)</span>
            </button>
            
            <p className="text-xs text-gray-500 text-center mt-4">
              Demo-Modus: Klick simuliert erfolgreiche Zahlung
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
