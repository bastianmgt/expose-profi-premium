import React, { useState, useEffect, useRef } from 'react';
import { 
  ChevronDown, ChevronUp, Upload, X, Check, Loader2, Eye, Download, Mail,
  CreditCard, Home, Building2, MapPin, Euro, Key, Ruler, BedDouble, Bath,
  Calendar, Flame, Car, Image as ImageIcon, FileText, Sparkles, Lock, Unlock,
  Edit3, Palette
} from 'lucide-react';

export default function ExposeProfiPremium() {
  // ERWEITERTE STATE
  const [propertyData, setPropertyData] = useState({
    objekttyp: '', vermarktungsart: '', preis: '', plz: '', ort: '',
    wohnflaeche: '', nutzflaeche: '', grundstueck: '', zimmer: '',
    schlafzimmer: '', baeder: '', balkone: '', baujahr: '', sanierung: '',
    heizung: '', keller: '', stellplaetze: '', zustand: '', umgebung: '',
    aussenbereich: [], innenraum: [], parkenKeller: [], technikKomfort: [],
    weiteresBesonderheiten: '', ausweistyp: '', energiebedarf: '',
    energietraeger: '', effizienzklasse: ''
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
  
  const [openAccordions, setOpenAccordions] = useState({
    basis: true, flaechen: false, zustand: false, lage: false, 
    ausstattung: false, uploads: false
  });
  
  const photoInputRef = useRef(null);
  const logoInputRef = useRef(null);
  const energyInputRef = useRef(null);

  const featureCategories = {
    aussenbereich: ['Balkon', 'Terrasse', 'Garten', 'Dachterrasse', 'Loggia', 'Wintergarten', 'Pool', 'Sauna'],
    innenraum: ['Einbauküche', 'Gäste-WC', 'Kamin', 'Fußbodenheizung', 'Abstellraum', 'Ankleidezimmer', 'Vorratskammer', 'Hauswirtschaftsraum', 'Einbauschränke', 'Parkettboden', 'Bodentiefe Fenster', 'Fliesen', 'Marmorbad'],
    parkenKeller: ['Garage', 'Tiefgarage', 'Außenstellplatz', 'Carport', 'Kellerraum', 'Doppelgarage', 'Stellplatz mit E-Ladestation', 'Fahrradkeller'],
    technikKomfort: ['Aufzug', 'Barrierefrei', 'Smart Home', 'Klimaanlage', 'Photovoltaik', 'Wärmepumpe', 'Videosprechanlage', 'Alarmanlage', 'Rollläden elektrisch', 'Zentralstaubsauger']
  };

  // URL-Parameter Check
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('success') === 'true') {
      setIsUnlocked(true);
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  const toggleAccordion = (section) => {
    setOpenAccordions(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setPropertyData(prev => ({ ...prev, [name]: value }));
  };

  const handleNumericInput = (e, field, allowDecimal = false) => {
    const value = e.target.value;
    const regex = allowDecimal ? /^\d*\.?\d*$/ : /^\d*$/;
    if (value === '' || regex.test(value)) {
      setPropertyData(prev => ({ ...prev, [field]: value }));
    }
  };

  const toggleFeature = (category, feature) => {
    setPropertyData(prev => ({
      ...prev,
      [category]: prev[category].includes(feature)
        ? prev[category].filter(f => f !== feature)
        : [...prev[category], feature]
    }));
  };

  const isFormValid = () => {
    return propertyData.wohnflaeche.trim() !== '' && 
           propertyData.zimmer.trim() !== '' &&
           propertyData.objekttyp !== '' &&
           propertyData.vermarktungsart !== '';
  };

  // FILE HANDLING
  const compressImage = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new window.Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width, height = img.height;
          const MAX = 1024;
          if (width > height && width > MAX) { height *= MAX / width; width = MAX; }
          else if (height > MAX) { width *= MAX / height; height = MAX; }
          canvas.width = width; canvas.height = height;
          canvas.getContext('2d').drawImage(img, 0, 0, width, height);
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
    const fileArray = Array.from(files).filter(f => f.type.startsWith('image/')).slice(0, 20 - uploadedPhotos.length);
    try {
      const newPhotos = [];
      for (const file of fileArray) {
        const base64 = await compressImage(file);
        newPhotos.push({
          id: Date.now() + Math.random(),
          name: file.name,
          preview: URL.createObjectURL(file),
          base64: base64,
          label: ''
        });
      }
      setUploadedPhotos(prev => [...prev, ...newPhotos]);
    } catch (error) {
      console.error('Fehler:', error);
      alert('Fehler beim Verarbeiten der Bilder');
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
        base64: base64
      });
    } catch (error) {
      console.error('Fehler:', error);
    }
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
        base64 = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result);
          reader.onerror = reject;
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
      } else throw new Error('OCR fehlgeschlagen');
    } catch (error) {
      console.error('Fehler:', error);
      setEnergyUploadStatus('error');
      setTimeout(() => setEnergyUploadStatus('idle'), 3000);
    }
  };

  const updatePhotoLabel = (id, label) => {
    setUploadedPhotos(prev => prev.map(p => p.id === id ? { ...p, label } : p));
  };

  const removePhoto = (id) => {
    setUploadedPhotos(prev => {
      const photo = prev.find(p => p.id === id);
      if (photo?.preview) URL.revokeObjectURL(photo.preview);
      return prev.filter(p => p.id !== id);
    });
  };

  const handleDragOver = (e) => { e.preventDefault(); setIsDragging(true); };
  const handleDragLeave = () => setIsDragging(false);
  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    handlePhotoUpload(e.dataTransfer.files);
  };

  // GENERATE
  const handleGenerateExpose = async () => {
    if (!isFormValid()) return;
    setIsGenerating(true);
    setGenerationProgress(0);
    setAiGeneratedText('');
    setIsUnlocked(false);

    try {
      const progressInterval = setInterval(() => {
        setGenerationProgress(prev => prev >= 90 ? 90 : prev + 10);
      }, 300);

      const photosData = uploadedPhotos.map(p => ({ base64: p.base64, label: p.label }));
      
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          propertyData: { ...propertyData, uploadedPhotosCount: uploadedPhotos.length },
          photos: photosData,
          mode: 'generate'
        })
      });

      clearInterval(progressInterval);
      setGenerationProgress(100);

      const data = await response.json();
      if (data.success && data.text) {
        setAiGeneratedText(data.text);
      } else {
        setAiGeneratedText('❌ Fehler: Kein Text erhalten');
      }
    } catch (error) {
      console.error('Fehler:', error);
      setAiGeneratedText(`❌ Verbindungsfehler: ${error.message}`);
    } finally {
      setIsGenerating(false);
      setGenerationProgress(0);
    }
  };

  const openPaymentModal = () => setShowPaymentModal(true);
  const closePaymentModal = () => setShowPaymentModal(false);
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

  // EXPORT FUNCTIONS
  const handleExportPDF = () => {
    const { jsPDF } = window.jspdf;
    if (!jsPDF) { alert('PDF-Bibliothek nicht geladen'); return; }

    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 20;
    let yPos = margin;

    const brandColor = { r: 197, g: 160, b: 89 };
    const darkColor = { r: 10, g: 25, b: 47 };

    // SEITE 1: Header + Hauptfoto + Titel
    if (uploadedLogo?.base64) {
      try {
        doc.addImage(uploadedLogo.base64, 'JPEG', margin, yPos, 40, 20);
      } catch (e) { console.error('Logo error:', e); }
    }
    yPos += 30;

    if (uploadedPhotos[0]?.base64) {
      try {
        doc.addImage(uploadedPhotos[0].base64, 'JPEG', margin, yPos, pageWidth - 2 * margin, 100);
      } catch (e) { console.error('Photo error:', e); }
      yPos += 110;
    }

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(20);
    doc.setTextColor(darkColor.r, darkColor.g, darkColor.b);
    const headline = `${propertyData.objekttyp || 'Exklusive Immobilie'} in ${propertyData.ort || 'bester Lage'}`;
    doc.text(headline, margin, yPos);
    yPos += 15;

    doc.setDrawColor(brandColor.r, brandColor.g, brandColor.b);
    doc.setLineWidth(0.5);
    doc.line(margin, yPos, pageWidth - margin, yPos);
    yPos += 10;

    const eckdaten = [
      `${propertyData.wohnflaeche} m²`,
      `${propertyData.zimmer} Zimmer`,
      propertyData.baujahr ? `Baujahr ${propertyData.baujahr}` : null,
      propertyData.preis ? `${propertyData.vermarktungsart === 'Verkauf' ? 'Kaufpreis' : 'Miete'}: ${Number(propertyData.preis).toLocaleString('de-DE')} €` : null
    ].filter(Boolean).join('  •  ');
    
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text(eckdaten, margin, yPos);
    yPos += 15;

    // SEITE 2: Tabelle + Text
    doc.addPage();
    yPos = margin;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.setTextColor(darkColor.r, darkColor.g, darkColor.b);
    doc.text('Objektdetails', margin, yPos);
    yPos += 10;

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    const details = [
      ['Wohnfläche', `${propertyData.wohnflaeche} m²`],
      ['Zimmer', propertyData.zimmer],
      ['Baujahr', propertyData.baujahr || '—'],
      ['Zustand', propertyData.zustand || '—']
    ];
    details.forEach(([key, val]) => {
      doc.text(`${key}:`, margin, yPos);
      doc.text(val, margin + 40, yPos);
      yPos += 6;
    });

    yPos += 10;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.text('Beschreibung', margin, yPos);
    yPos += 8;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    const lines = doc.splitTextToSize(aiGeneratedText, pageWidth - 2 * margin);
    lines.forEach(line => {
      if (yPos > pageHeight - 30) {
        doc.addPage();
        yPos = margin;
      }
      doc.text(line, margin, yPos);
      yPos += 5;
    });

    // SEITE 3: Foto-Galerie
    if (uploadedPhotos.length > 1) {
      doc.addPage();
      yPos = margin;
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(14);
      doc.text('Weitere Impressionen', margin, yPos);
      yPos += 15;

      const photos = uploadedPhotos.slice(1, 5);
      const photoWidth = (pageWidth - 3 * margin) / 2;
      const photoHeight = 60;
      let col = 0;

      photos.forEach((photo, i) => {
        const xPos = margin + (col * (photoWidth + margin));
        try {
          doc.addImage(photo.base64, 'JPEG', xPos, yPos, photoWidth, photoHeight);
        } catch (e) { console.error('Photo error:', e); }
        col++;
        if (col >= 2) {
          col = 0;
          yPos += photoHeight + 10;
        }
      });
    }

    const fileName = `Expose_${propertyData.objekttyp || 'Immobilie'}_${propertyData.ort || 'Objekt'}_${new Date().toISOString().split('T')[0]}.pdf`;
    doc.save(fileName);
  };

  const handleExportEmail = () => {
    const subject = `Immobilien-Exposé: ${propertyData.objekttyp || 'Objekt'} in ${propertyData.ort || 'Lage'}`;
    const body = `${aiGeneratedText}\n\n---\nKontakt: info@expose-profi.de`;
    window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      {/* HEADER */}
      <header className="bg-[#0A192F] shadow-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-[#C5A059] to-[#A68B4A] rounded-lg flex items-center justify-center">
              <FileText className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-white">Exposé-Profi Premium</span>
          </div>
        </div>
      </header>

      {/* SPLIT-SCREEN LAYOUT */}
      <div className="max-w-[1800px] mx-auto p-6">
        <div className="grid lg:grid-cols-2 gap-8">
          
          {/* LEFT: EINGABEMASKE */}
          <div className="space-y-4 h-[calc(100vh-120px)] overflow-y-auto pr-4">
            
            {/* ACCORDION 1: BASIS */}
            <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
              <button
                onClick={() => toggleAccordion('basis')}
                className="w-full px-6 py-4 flex items-center justify-between bg-gradient-to-r from-[#0A192F] to-[#112240] text-white hover:from-[#112240] hover:to-[#1a3a5a] transition-all"
              >
                <div className="flex items-center space-x-3">
                  <Home className="w-5 h-5 text-[#C5A059]" />
                  <span className="text-lg font-bold">Basis-Fakten</span>
                </div>
                {openAccordions.basis ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
              </button>
              {openAccordions.basis && (
                <div className="p-6 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-[#0A192F] mb-2">Objekttyp *</label>
                      <select name="objekttyp" value={propertyData.objekttyp} onChange={handleInputChange}
                        className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-[#C5A059] focus:ring-2 focus:ring-[#C5A059]/20 outline-none">
                        <option value="">Wählen</option>
                        <option value="Haus">Haus</option>
                        <option value="Wohnung">Wohnung</option>
                        <option value="Loft">Loft</option>
                        <option value="Penthouse">Penthouse</option>
                        <option value="Gewerbe">Gewerbe</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-[#0A192F] mb-2">Vermarktungsart *</label>
                      <div className="grid grid-cols-2 gap-2">
                        <button type="button" onClick={() => setPropertyData(prev => ({ ...prev, vermarktungsart: 'Verkauf' }))}
                          className={`px-4 py-3 rounded-lg font-medium ${propertyData.vermarktungsart === 'Verkauf' ? 'bg-[#C5A059] text-white' : 'bg-gray-100 text-gray-700'}`}>
                          Verkauf
                        </button>
                        <button type="button" onClick={() => setPropertyData(prev => ({ ...prev, vermarktungsart: 'Vermietung' }))}
                          className={`px-4 py-3 rounded-lg font-medium ${propertyData.vermarktungsart === 'Vermietung' ? 'bg-[#C5A059] text-white' : 'bg-gray-100 text-gray-700'}`}>
                          Vermietung
                        </button>
                      </div>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-[#0A192F] mb-2">
                      {propertyData.vermarktungsart === 'Verkauf' ? 'Kaufpreis' : 'Kaltmiete'}
                    </label>
                    <div className="relative">
                      <input type="text" name="preis" value={propertyData.preis} onChange={(e) => handleNumericInput(e, 'preis')}
                        placeholder="z.B. 350000"
                        className="w-full px-4 py-3 pr-12 rounded-lg border border-gray-200 focus:border-[#C5A059] focus:ring-2 focus:ring-[#C5A059]/20 outline-none" />
                      <Euro className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="col-span-1">
                      <label className="block text-sm font-semibold text-[#0A192F] mb-2">PLZ</label>
                      <input type="text" name="plz" value={propertyData.plz} onChange={(e) => handleNumericInput(e, 'plz')} maxLength="5"
                        placeholder="79379"
                        className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-[#C5A059] focus:ring-2 focus:ring-[#C5A059]/20 outline-none" />
                    </div>
                    <div className="col-span-2">
                      <label className="block text-sm font-semibold text-[#0A192F] mb-2">Ort</label>
                      <input type="text" name="ort" value={propertyData.ort} onChange={handleInputChange}
                        placeholder="Müllheim"
                        className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-[#C5A059] focus:ring-2 focus:ring-[#C5A059]/20 outline-none" />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* ACCORDION 2: FLÄCHEN & RÄUME */}
            <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
              <button onClick={() => toggleAccordion('flaechen')}
                className="w-full px-6 py-4 flex items-center justify-between bg-gradient-to-r from-[#0A192F] to-[#112240] text-white hover:from-[#112240] hover:to-[#1a3a5a] transition-all">
                <div className="flex items-center space-x-3">
                  <Ruler className="w-5 h-5 text-[#C5A059]" />
                  <span className="text-lg font-bold">Flächen & Räume</span>
                </div>
                {openAccordions.flaechen ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
              </button>
              {openAccordions.flaechen && (
                <div className="p-6 space-y-4">
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-[#0A192F] mb-2">Wohnfläche (m²) *</label>
                      <input type="text" value={propertyData.wohnflaeche} onChange={(e) => handleNumericInput(e, 'wohnflaeche')}
                        placeholder="85"
                        className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-[#C5A059] focus:ring-2 focus:ring-[#C5A059]/20 outline-none" />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-[#0A192F] mb-2">Nutzfläche (m²)</label>
                      <input type="text" value={propertyData.nutzflaeche} onChange={(e) => handleNumericInput(e, 'nutzflaeche')}
                        placeholder="15"
                        className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-[#C5A059] focus:ring-2 focus:ring-[#C5A059]/20 outline-none" />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-[#0A192F] mb-2">Grundstück (m²)</label>
                      <input type="text" value={propertyData.grundstueck} onChange={(e) => handleNumericInput(e, 'grundstueck')}
                        placeholder="500"
                        className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-[#C5A059] focus:ring-2 focus:ring-[#C5A059]/20 outline-none" />
                    </div>
                  </div>
                  <div className="grid grid-cols-4 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-[#0A192F] mb-2">Zimmer *</label>
                      <input type="text" value={propertyData.zimmer} onChange={(e) => handleNumericInput(e, 'zimmer', true)}
                        placeholder="3"
                        className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-[#C5A059] focus:ring-2 focus:ring-[#C5A059]/20 outline-none" />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-[#0A192F] mb-2">Schlafzimmer</label>
                      <input type="text" value={propertyData.schlafzimmer} onChange={(e) => handleNumericInput(e, 'schlafzimmer')}
                        placeholder="2"
                        className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-[#C5A059] focus:ring-2 focus:ring-[#C5A059]/20 outline-none" />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-[#0A192F] mb-2">Bäder</label>
                      <input type="text" value={propertyData.baeder} onChange={(e) => handleNumericInput(e, 'baeder')}
                        placeholder="1"
                        className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-[#C5A059] focus:ring-2 focus:ring-[#C5A059]/20 outline-none" />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-[#0A192F] mb-2">Balkone</label>
                      <input type="text" value={propertyData.balkone} onChange={(e) => handleNumericInput(e, 'balkone')}
                        placeholder="1"
                        className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-[#C5A059] focus:ring-2 focus:ring-[#C5A059]/20 outline-none" />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* ACCORDION 3: ZUSTAND & TECHNIK */}
            <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
              <button onClick={() => toggleAccordion('zustand')}
                className="w-full px-6 py-4 flex items-center justify-between bg-gradient-to-r from-[#0A192F] to-[#112240] text-white hover:from-[#112240] hover:to-[#1a3a5a] transition-all">
                <div className="flex items-center space-x-3">
                  <Calendar className="w-5 h-5 text-[#C5A059]" />
                  <span className="text-lg font-bold">Zustand & Technik</span>
                </div>
                {openAccordions.zustand ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
              </button>
              {openAccordions.zustand && (
                <div className="p-6 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-[#0A192F] mb-2">Baujahr</label>
                      <input type="text" value={propertyData.baujahr} onChange={(e) => handleNumericInput(e, 'baujahr')}
                        placeholder="2015"
                        className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-[#C5A059] focus:ring-2 focus:ring-[#C5A059]/20 outline-none" />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-[#0A192F] mb-2">Letzte Sanierung</label>
                      <input type="text" value={propertyData.sanierung} onChange={(e) => handleNumericInput(e, 'sanierung')}
                        placeholder="2020"
                        className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-[#C5A059] focus:ring-2 focus:ring-[#C5A059]/20 outline-none" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-[#0A192F] mb-2">Zustand</label>
                    <div className="grid grid-cols-3 gap-2">
                      {['Neuwertig', 'Gepflegt', 'Sanierungsbedürftig'].map((z) => (
                        <button key={z} type="button" onClick={() => setPropertyData(prev => ({ ...prev, zustand: z }))}
                          className={`px-3 py-2 rounded-lg text-sm font-medium ${propertyData.zustand === z ? 'bg-[#C5A059] text-white' : 'bg-gray-100 text-gray-700'}`}>
                          {z}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-[#0A192F] mb-2">Heizung</label>
                      <select name="heizung" value={propertyData.heizung} onChange={handleInputChange}
                        className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-[#C5A059] focus:ring-2 focus:ring-[#C5A059]/20 outline-none">
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
                        className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-[#C5A059] focus:ring-2 focus:ring-[#C5A059]/20 outline-none">
                        <option value="">Wählen</option>
                        <option value="Ja">Ja</option>
                        <option value="Nein">Nein</option>
                        <option value="Teilunterkellert">Teilunterkellert</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-[#0A192F] mb-2">Stellplätze</label>
                    <input type="text" value={propertyData.stellplaetze} onChange={(e) => handleNumericInput(e, 'stellplaetze')}
                      placeholder="2"
                      className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-[#C5A059] focus:ring-2 focus:ring-[#C5A059]/20 outline-none" />
                  </div>
                </div>
              )}
            </div>

            {/* ACCORDION 4: LAGE & UMFELD */}
            <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
              <button onClick={() => toggleAccordion('lage')}
                className="w-full px-6 py-4 flex items-center justify-between bg-gradient-to-r from-[#0A192F] to-[#112240] text-white hover:from-[#112240] hover:to-[#1a3a5a] transition-all">
                <div className="flex items-center space-x-3">
                  <MapPin className="w-5 h-5 text-[#C5A059]" />
                  <span className="text-lg font-bold">Lage & Umfeld</span>
                </div>
                {openAccordions.lage ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
              </button>
              {openAccordions.lage && (
                <div className="p-6">
                  <label className="block text-sm font-semibold text-[#0A192F] mb-2">Umgebungsbeschreibung</label>
                  <textarea name="umgebung" value={propertyData.umgebung} onChange={handleInputChange}
                    placeholder="z.B. Ruhige Wohnlage, zentral, gute Anbindung..."
                    rows="4"
                    className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-[#C5A059] focus:ring-2 focus:ring-[#C5A059]/20 outline-none resize-none" />
                </div>
              )}
            </div>

            {/* ACCORDION 5: AUSSTATTUNG */}
            <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
              <button onClick={() => toggleAccordion('ausstattung')}
                className="w-full px-6 py-4 flex items-center justify-between bg-gradient-to-r from-[#0A192F] to-[#112240] text-white hover:from-[#112240] hover:to-[#1a3a5a] transition-all">
                <div className="flex items-center space-x-3">
                  <Sparkles className="w-5 h-5 text-[#C5A059]" />
                  <span className="text-lg font-bold">Ausstattung</span>
                </div>
                {openAccordions.ausstattung ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
              </button>
              {openAccordions.ausstattung && (
                <div className="p-6 space-y-4">
                  {Object.entries(featureCategories).map(([category, features]) => (
                    <div key={category}>
                      <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                        {category === 'aussenbereich' ? 'Außenbereich' : 
                         category === 'innenraum' ? 'Innenraum' :
                         category === 'parkenKeller' ? 'Parken & Keller' : 'Technik & Komfort'}
                      </h4>
                      <div className="grid grid-cols-2 gap-2">
                        {features.map((feature) => (
                          <label key={feature} className="flex items-center space-x-2 cursor-pointer text-sm">
                            <input type="checkbox"
                              checked={propertyData[category].includes(feature)}
                              onChange={() => toggleFeature(category, feature)}
                              className="w-4 h-4 text-[#C5A059] border-gray-300 rounded focus:ring-[#C5A059]" />
                            <span className="text-gray-700">{feature}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* ACCORDION 6: UPLOADS */}
            <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
              <button onClick={() => toggleAccordion('uploads')}
                className="w-full px-6 py-4 flex items-center justify-between bg-gradient-to-r from-[#0A192F] to-[#112240] text-white hover:from-[#112240] hover:to-[#1a3a5a] transition-all">
                <div className="flex items-center space-x-3">
                  <Upload className="w-5 h-5 text-[#C5A059]" />
                  <span className="text-lg font-bold">Uploads</span>
                </div>
                {openAccordions.uploads ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
              </button>
              {openAccordions.uploads && (
                <div className="p-6 space-y-6">
                  {/* Logo */}
                  <div>
                    <label className="block text-sm font-semibold text-[#0A192F] mb-2">Logo</label>
                    <input ref={logoInputRef} type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
                    <button onClick={() => logoInputRef.current?.click()}
                      className="w-full border-2 border-dashed border-[#C5A059]/50 rounded-xl p-4 hover:border-[#C5A059] transition-all">
                      {uploadedLogo ? (
                        <div className="flex items-center space-x-3">
                          <img src={uploadedLogo.preview} alt="Logo" className="w-16 h-16 object-contain" />
                          <span className="text-sm text-gray-700">{uploadedLogo.name}</span>
                        </div>
                      ) : (
                        <div className="text-center text-gray-600">
                          <Palette className="w-8 h-8 mx-auto mb-2 text-[#C5A059]" />
                          <span className="text-sm">Logo hochladen</span>
                        </div>
                      )}
                    </button>
                  </div>

                  {/* Fotos mit Beschriftung */}
                  <div>
                    <label className="block text-sm font-semibold text-[#0A192F] mb-2">Objektfotos (mit Beschriftung)</label>
                    <input ref={photoInputRef} type="file" accept="image/*" multiple onChange={(e) => handlePhotoUpload(e.target.files)} className="hidden" />
                    <div
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={handleDrop}
                      onClick={() => photoInputRef.current?.click()}
                      className={`border-2 border-dashed rounded-xl p-6 cursor-pointer transition-all ${
                        isDragging ? 'border-[#C5A059] bg-[#C5A059]/10' : 'border-[#C5A059]/50 hover:border-[#C5A059]'
                      }`}>
                      <div className="text-center text-gray-600">
                        <Upload className="w-10 h-10 mx-auto mb-2 text-[#C5A059]" />
                        <span className="text-sm">Drag & Drop oder Klicken (max. 20)</span>
                      </div>
                    </div>
                    {uploadedPhotos.length > 0 && (
                      <div className="mt-4 space-y-3">
                        {uploadedPhotos.map((photo) => (
                          <div key={photo.id} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                            <img src={photo.preview} alt={photo.name} className="w-20 h-20 object-cover rounded" />
                            <div className="flex-1">
                              <p className="text-sm font-medium text-gray-700 mb-2">{photo.name}</p>
                              <input type="text" value={photo.label} onChange={(e) => updatePhotoLabel(photo.id, e.target.value)}
                                placeholder="Beschriftung (z.B. 'Badezimmer')"
                                className="w-full px-3 py-2 text-sm rounded border border-gray-200 focus:border-[#C5A059] focus:ring-1 focus:ring-[#C5A059] outline-none" />
                            </div>
                            <button onClick={() => removePhoto(photo.id)} className="text-red-600 hover:text-red-700">
                              <X className="w-5 h-5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Energieausweis */}
                  <div>
                    <label className="block text-sm font-semibold text-[#0A192F] mb-2">Energieausweis (OCR)</label>
                    <input ref={energyInputRef} type="file" accept="image/*,application/pdf" onChange={handleEnergyUpload} className="hidden" />
                    <button onClick={() => energyInputRef.current?.click()}
                      disabled={energyUploadStatus === 'uploading' || energyUploadStatus === 'extracting'}
                      className={`w-full px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                        energyUploadStatus === 'complete' ? 'bg-emerald-50 border-2 border-emerald-500 text-emerald-700' :
                        energyUploadStatus === 'error' ? 'bg-red-50 border-2 border-red-500 text-red-700' :
                        'bg-slate-50 border-2 border-dashed border-[#C5A059] text-[#0A192F] hover:bg-slate-100'
                      }`}>
                      {energyUploadStatus === 'idle' && (<><Upload className="w-4 h-4 inline mr-2" />Energieausweis hochladen</>)}
                      {energyUploadStatus === 'uploading' && (<><Loader2 className="w-4 h-4 inline mr-2 animate-spin" />Hochladen...</>)}
                      {energyUploadStatus === 'extracting' && (<><Loader2 className="w-4 h-4 inline mr-2 animate-spin" />KI extrahiert...</>)}
                      {energyUploadStatus === 'complete' && (<><Check className="w-4 h-4 inline mr-2" />Erfolgreich extrahiert</>)}
                      {energyUploadStatus === 'error' && (<><X className="w-4 h-4 inline mr-2" />Fehler</>)}
                    </button>
                    {(energyUploadStatus === 'complete' || propertyData.effizienzklasse) && (
                      <div className="mt-3 grid grid-cols-2 gap-3">
                        <select name="effizienzklasse" value={propertyData.effizienzklasse} onChange={handleInputChange}
                          className="px-3 py-2 rounded-lg border border-gray-200 focus:border-[#C5A059] outline-none text-sm">
                          <option value="">Klasse</option>
                          {['A+', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'].map(k => <option key={k} value={k}>{k}</option>)}
                        </select>
                        <input type="text" value={propertyData.energiebedarf} onChange={(e) => handleNumericInput(e, 'energiebedarf')}
                          placeholder="kWh/m²a"
                          className="px-3 py-2 rounded-lg border border-gray-200 focus:border-[#C5A059] outline-none text-sm" />
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* GENERATE BUTTON */}
            <button onClick={handleGenerateExpose}
              disabled={!isFormValid() || isGenerating}
              className={`w-full px-8 py-5 rounded-xl text-lg font-bold transition-all shadow-xl ${
                isFormValid() && !isGenerating
                  ? 'bg-gradient-to-r from-[#C5A059] to-[#A68B4A] hover:from-[#B39050] hover:to-[#957A3F] text-white transform hover:scale-105'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}>
              {isGenerating ? (
                <><Loader2 className="w-6 h-6 inline mr-2 animate-spin" />KI generiert Premium-Exposé...</>
              ) : (
                <><Sparkles className="w-6 h-6 inline mr-2" />Premium-Exposé generieren</>
              )}
            </button>

            {isGenerating && generationProgress > 0 && (
              <div className="bg-white rounded-xl p-4 shadow-md">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-gradient-to-r from-[#C5A059] to-[#A68B4A] h-2 rounded-full transition-all"
                    style={{ width: `${generationProgress}%` }} />
                </div>
                <p className="text-xs text-center text-gray-600 mt-2">
                  {uploadedPhotos.length > 0 ? `Analysiere ${uploadedPhotos.length} Foto${uploadedPhotos.length > 1 ? 's' : ''}...` : 'Generiere Text...'}
                </p>
              </div>
            )}
          </div>

          {/* RIGHT: LIVE-VORSCHAU */}
          <div className="hidden lg:block">
            <div className="sticky top-24">
              <div className="bg-white rounded-2xl shadow-2xl p-8 border border-gray-200"
                style={{ aspectRatio: '210/297', maxHeight: 'calc(100vh - 150px)', overflow: 'auto' }}>
                <div className="mb-6 flex items-center justify-between">
                  <h3 className="text-xl font-bold text-[#0A192F] flex items-center">
                    <Eye className="w-5 h-5 mr-2 text-[#C5A059]" />
                    Live-Vorschau
                  </h3>
                  {aiGeneratedText && isUnlocked && (
                    <div className="flex space-x-2">
                      <button onClick={handleExportPDF}
                        className="px-4 py-2 bg-[#0A192F] text-white rounded-lg text-sm font-medium hover:bg-opacity-90 flex items-center space-x-1">
                        <Download className="w-4 h-4" />
                        <span>PDF</span>
                      </button>
                      <button onClick={handleExportEmail}
                        className="px-4 py-2 bg-[#C5A059] text-white rounded-lg text-sm font-medium hover:bg-opacity-90 flex items-center space-x-1">
                        <Mail className="w-4 h-4" />
                        <span>E-Mail</span>
                      </button>
                    </div>
                  )}
                </div>

                {aiGeneratedText ? (
                  <div className="prose prose-sm max-w-none">
                    <div className="relative">
                      <div className="whitespace-pre-wrap text-gray-800 leading-relaxed font-serif">
                        {getTeaserText()}
                      </div>
                      
                      {!isUnlocked && getBlurredText() && (
                        <div className="relative">
                          <div className="whitespace-pre-wrap text-gray-800 leading-relaxed font-serif blur-md select-none">
                            {getBlurredText()}
                          </div>
                          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/80 to-white flex items-center justify-center">
                            <div className="bg-white rounded-2xl shadow-2xl p-8 text-center max-w-sm border-2 border-[#C5A059]">
                              <div className="w-16 h-16 bg-gradient-to-br from-[#C5A059] to-[#A68B4A] rounded-full flex items-center justify-center mx-auto mb-4">
                                <Lock className="w-8 h-8 text-white" />
                              </div>
                              <h4 className="text-2xl font-bold text-[#0A192F] mb-2">Premium-Exposé</h4>
                              <p className="text-gray-600 mb-6">Schalten Sie das vollständige Exposé mit allen Features frei.</p>
                              <button onClick={openPaymentModal}
                                className="bg-gradient-to-r from-[#C5A059] to-[#A68B4A] hover:from-[#B39050] hover:to-[#957A3F] text-white px-8 py-3 rounded-lg font-bold transition-all transform hover:scale-105 shadow-lg flex items-center space-x-2 mx-auto">
                                <Unlock className="w-5 h-5" />
                                <span>Jetzt für 29€ freischalten</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="text-center text-gray-400 py-20">
                    <FileText className="w-16 h-16 mx-auto mb-4 opacity-50" />
                    <p>Live-Vorschau erscheint hier nach der Generierung</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* PAYMENT MODAL */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={closePaymentModal}>
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 relative" onClick={(e) => e.stopPropagation()}>
            <button onClick={closePaymentModal} className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-lg bg-gray-100 hover:bg-gray-200">
              <X className="w-5 h-5 text-gray-600" />
            </button>

            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-[#C5A059] to-[#A68B4A] rounded-full flex items-center justify-center mx-auto mb-4">
                <CreditCard className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-[#0A192F] mb-2">Premium freischalten</h3>
              <div className="bg-[#C5A059]/10 border border-[#C5A059]/30 rounded-lg p-4 mb-6">
                <div className="text-3xl font-bold text-[#0A192F] mb-1">29€</div>
                <div className="text-sm text-gray-600">einmalig pro Exposé</div>
              </div>
            </div>

            <div className="space-y-3 mb-6">
              <div className="flex items-center space-x-2 text-sm text-gray-700">
                <Check className="w-4 h-4 text-green-600 flex-shrink-0" />
                <span>Vollständiger Premium-Text</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-700">
                <Check className="w-4 h-4 text-green-600 flex-shrink-0" />
                <span>3-Seiten Premium-PDF</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-700">
                <Check className="w-4 h-4 text-green-600 flex-shrink-0" />
                <span>E-Mail Export</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-700">
                <Check className="w-4 h-4 text-green-600 flex-shrink-0" />
                <span>Text-Bearbeitung</span>
              </div>
            </div>

            <button onClick={handlePaymentSuccess}
              className="w-full bg-gradient-to-r from-[#C5A059] to-[#A68B4A] hover:from-[#B39050] hover:to-[#957A3F] text-white py-4 rounded-lg font-bold transition-all transform hover:scale-105 shadow-lg flex items-center justify-center space-x-2">
              <CreditCard className="w-5 h-5" />
              <span>Jetzt freischalten (Demo)</span>
            </button>
            
            <p className="text-xs text-gray-500 text-center mt-4">
              Demo-Modus: Klick simuliert Zahlung
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
