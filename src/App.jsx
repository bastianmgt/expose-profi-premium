import React, { useState, useEffect, useRef } from 'react';
import {
  Sparkles, Upload, X, Check, Loader2, Download, Eye, Mail,
  Clock, Zap, Shield, Home, Ruler, BedDouble, Bath, Calendar,
  Flame, Car, Image as ImageIcon, CreditCard, Lock, Unlock,
  ChevronDown, CheckCircle, Star, Scale, Building, RotateCcw,
  AlertCircle, CheckCircle2, XCircle, Info
} from 'lucide-react';

// Toast Notification Component
function Toast({ message, type = 'info', onClose }) {
  const icons = {
    success: <CheckCircle2 className="w-5 h-5 text-green-500" />,
    error: <XCircle className="w-5 h-5 text-red-500" />,
    info: <Info className="w-5 h-5 text-blue-500" />,
    warning: <AlertCircle className="w-5 h-5 text-amber-500" />
  };

  const colors = {
    success: 'bg-green-50 border-green-200',
    error: 'bg-red-50 border-red-200',
    info: 'bg-blue-50 border-blue-200',
    warning: 'bg-amber-50 border-amber-200'
  };

  useEffect(() => {
    const timer = setTimeout(onClose, 5000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className={`fixed top-4 right-4 z-50 ${colors[type]} border-2 rounded-xl p-4 shadow-2xl max-w-md animate-slide-in`}>
      <div className="flex items-start space-x-3">
        {icons[type]}
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-900">{message}</p>
        </div>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

export default function ExposeProfiUltimate() {
  const [propertyData, setPropertyData] = useState({
    objekttyp: '', vermarktungsart: '', preis: '', plz: '', ort: '',
    wohnflaeche: '', nutzflaeche: '', grundstueck: '', zimmer: '',
    schlafzimmer: '', baeder: '', balkone: '', baujahr: '', sanierung: '',
    heizung: '', keller: '', stellplaetze: '', zustand: '',
    weiteresBesonderheiten: '',
    aussenbereich: [], innenraum: [], parkenKeller: [], technikKomfort: [],
    ausweistyp: '', energiebedarf: '', energietraeger: '', effizienzklasse: '',
    denkmalschutz: 'Nein', erbpacht: 'Nein', einliegerwohnung: 'Nein',
    hausgeld: '', provision: '', provisionspflichtig: 'Nein', verfuegbarAb: ''
  });

  const [uploadedPhotos, setUploadedPhotos] = useState([]);
  const [uploadedLogo, setUploadedLogo] = useState(null);
  const [uploadedEnergyCert, setUploadedEnergyCert] = useState(null);
  const [aiGeneratedText, setAiGeneratedText] = useState('');
  const [editableText, setEditableText] = useState(''); // NEU: Editierbarer Text
  const [isGenerating, setIsGenerating] = useState(false);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [energyUploadStatus, setEnergyUploadStatus] = useState('idle');
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [betaEmail, setBetaEmail] = useState('');
  const [betaSubmitted, setBetaSubmitted] = useState(false);
  const [selectedTonality, setSelectedTonality] = useState('professional'); // NEU
  const [isTextEdited, setIsTextEdited] = useState(false); // NEU
  const [showRestoreBanner, setShowRestoreBanner] = useState(false); // NEU
  const [toast, setToast] = useState(null); // NEU: Toast State
  
  const photoInputRef = useRef(null);
  const logoInputRef = useRef(null);
  const energyInputRef = useRef(null);
  const studioRef = useRef(null);

  const objekttypen = [
    '--- Wohnimmobilien ---',
    'Einfamilienhaus (freistehend)', 'Doppelhaushälfte', 'Reihenhaus (Mittelhaus)',
    'Reihenhaus (Endhaus)', 'Bungalow', 'Villa', 'Stadthaus', 'Mehrfamilienhaus',
    'Zweifamilienhaus', 'Wohnung', 'Maisonette', 'Penthouse', 'Dachgeschosswohnung',
    'Souterrain', 'Loft', 'Apartment',
    '--- Gewerbe ---',
    'Bürogebäude', 'Ladenlokal', 'Gastronomiebetrieb', 'Halle/Lager',
    'Praxisfläche', 'Werkstatt', 'Hotel/Pension',
    '--- Grundstücke & Sonstiges ---',
    'Baugrundstück', 'Gewerbegrundstück', 'Resthof', 'Bauernhof',
    'Wohn- und Geschäftshaus', 'Atelierwohnung', 'Apartment-Haus'
  ];

  const features = {
    aussenbereich: ['Balkon', 'Terrasse', 'Garten', 'Dachterrasse', 'Loggia', 'Wintergarten', 'Pool', 'Sauna'],
    innenraum: ['Einbauküche', 'Gäste-WC', 'Kamin', 'Fußbodenheizung', 'Abstellraum', 'Ankleidezimmer', 'Vorratskammer', 'Hauswirtschaftsraum', 'Einbauschränke', 'Parkettboden', 'Bodentiefe Fenster', 'Fliesen', 'Marmorbad'],
    parkenKeller: ['Garage', 'Tiefgarage', 'Außenstellplatz', 'Carport', 'Kellerraum', 'Doppelgarage', 'Stellplatz mit E-Ladestation', 'Fahrradkeller'],
    technikKomfort: ['Aufzug', 'Barrierefrei', 'Smart Home', 'Klimaanlage', 'Photovoltaik', 'Wärmepumpe', 'Videosprechanlage', 'Alarmanlage', 'Rollläden elektrisch', 'Zentralstaubsauger']
  };

  // NEU: Toast Helper
  const showToast = (message, type = 'info') => {
    setToast({ message, type });
  };

  // NEU: localStorage Auto-Save
  useEffect(() => {
    const saveInterval = setInterval(() => {
      const dataToSave = {
        propertyData,
        uploadedPhotos: uploadedPhotos.map(p => ({ id: p.id, name: p.name, base64: p.base64, label: p.label })),
        aiGeneratedText,
        editableText,
        timestamp: new Date().toISOString()
      };
      localStorage.setItem('expose-profi-autosave', JSON.stringify(dataToSave));
    }, 5000); // Alle 5 Sekunden

    return () => clearInterval(saveInterval);
  }, [propertyData, uploadedPhotos, aiGeneratedText, editableText]);

  // NEU: Restore auf Mount
  useEffect(() => {
    const saved = localStorage.getItem('expose-profi-autosave');
    if (saved) {
      try {
        const data = JSON.parse(saved);
        const savedTime = new Date(data.timestamp);
        const now = new Date();
        const hoursSince = (now - savedTime) / (1000 * 60 * 60);
        
        if (hoursSince < 24) { // Nur wenn < 24h alt
          setShowRestoreBanner(true);
        }
      } catch (e) {}
    }
  }, []);

  const handleRestore = () => {
    const saved = localStorage.getItem('expose-profi-autosave');
    if (saved) {
      try {
        const data = JSON.parse(saved);
        setPropertyData(data.propertyData || propertyData);
        if (data.uploadedPhotos) {
          const restoredPhotos = data.uploadedPhotos.map(p => ({
            ...p,
            preview: p.base64 // base64 as preview
          }));
          setUploadedPhotos(restoredPhotos);
        }
        setAiGeneratedText(data.aiGeneratedText || '');
        setEditableText(data.editableText || '');
        setShowRestoreBanner(false);
        showToast('Daten wiederhergestellt!', 'success');
      } catch (e) {
        showToast('Fehler beim Wiederherstellen', 'error');
      }
    }
  };

  const handleClearSaved = () => {
    localStorage.removeItem('expose-profi-autosave');
    setShowRestoreBanner(false);
    showToast('Gespeicherte Daten gelöscht', 'info');
  };

  // URL Parameter Check
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('success') === 'true') {
      setIsUnlocked(true);
      window.history.replaceState({}, '', window.location.pathname);
      showToast('Zahlung erfolgreich! Exposé freigeschaltet.', 'success');
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
      showToast(`${newPhotos.length} Foto(s) hochgeladen`, 'success');
    } catch (e) {
      showToast('Fehler beim Verarbeiten der Fotos', 'error');
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
      showToast('Logo hochgeladen', 'success');
    } catch (e) {
      showToast('Fehler beim Logo-Upload', 'error');
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
        showToast('Energieausweis erfolgreich erkannt', 'success');
      } else {
        throw new Error(data.message || 'OCR fehlgeschlagen');
      }
    } catch (e) {
      setEnergyUploadStatus('error');
      showToast(e.message || 'Fehler bei der Energieausweis-Erkennung', 'error');
      setTimeout(() => setEnergyUploadStatus('idle'), 3000);
    }
  };

  const updatePhotoLabel = (id, label) => {
    setUploadedPhotos(prev => prev.map(p => p.id === id ? { ...p, label } : p));
  };

  const removePhoto = (id) => {
    setUploadedPhotos(prev => {
      const p = prev.find(x => x.id === id);
      if (p?.preview && !p.preview.startsWith('data:')) URL.revokeObjectURL(p.preview);
      return prev.filter(x => x.id !== id);
    });
    showToast('Foto entfernt', 'info');
  };

  const handleDragOver = (e) => { e.preventDefault(); setIsDragging(true); };
  const handleDragLeave = () => setIsDragging(false);
  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    handlePhotoUpload(e.dataTransfer.files);
  };
  const handleGenerate = async (tonality = selectedTonality) => {
    if (!isFormValid()) {
      showToast('Bitte füllen Sie alle Pflichtfelder aus', 'warning');
      return;
    }

    setIsGenerating(true);
    setGenerationProgress(0);
    setAiGeneratedText('');
    setEditableText('');
    setIsTextEdited(false);
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
          tonality,
          mode: 'generate'
        })
      });

      clearInterval(interval);
      setGenerationProgress(100);

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Generierung fehlgeschlagen');
      }

      if (data.success && data.text) {
        setAiGeneratedText(data.text);
        setEditableText(data.text); // Auch in editierbaren Text
        setSelectedTonality(tonality);
        showToast(`Exposé generiert (${tonality === 'professional' ? 'Professionell' : tonality === 'emotional' ? 'Emotional' : 'Luxuriös'})`, 'success');
        
        // Rate Limit Info
        if (data.rateLimit && data.rateLimit.remaining <= 3) {
          setTimeout(() => {
            showToast(`Noch ${data.rateLimit.remaining} Generierungen in diesem Zeitfenster möglich`, 'warning');
          }, 2000);
        }
      } else {
        throw new Error(data.message || 'Kein Text generiert');
      }
    } catch (e) {
      console.error('Generate Error:', e);
      setAiGeneratedText(`❌ Fehler: ${e.message}`);
      setEditableText('');
      showToast(e.message || 'Fehler bei der Generierung', 'error');
    } finally {
      setIsGenerating(false);
      setGenerationProgress(0);
    }
  };

  const handleTextEdit = (newText) => {
    setEditableText(newText);
    setIsTextEdited(true);
  };

  const handleResetText = () => {
    setEditableText(aiGeneratedText);
    setIsTextEdited(false);
    showToast('Text zurückgesetzt', 'info');
  };

  const openPayment = () => setShowPaymentModal(true);
  const closePayment = () => setShowPaymentModal(false);
  
  const handlePaymentSuccess = () => {
    setIsUnlocked(true);
    setShowPaymentModal(false);
    showToast('Zahlung erfolgreich! Exposé freigeschaltet.', 'success');
  };

  const getTeaserText = () => {
    const text = isTextEdited ? editableText : aiGeneratedText;
    if (isUnlocked || text.length <= 300) return text;
    return text.substring(0, 300);
  };

  const getBlurredText = () => {
    const text = isTextEdited ? editableText : aiGeneratedText;
    if (isUnlocked || text.length <= 300) return '';
    return text.substring(300);
  };

  const parseTextSections = (text) => {
    const sections = {
      headline: '',
      einleitung: '',
      objekt: '',
      lage: '',
      ausstattung: '',
      energie: '',
      kontakt: ''
    };

    const headlineMatch = text.match(/\[HEADLINE\]([\s\S]*?)(?=\[|$)/i);
    const einleitungMatch = text.match(/\[EINLEITUNG\]([\s\S]*?)(?=\[|$)/i);
    const objektMatch = text.match(/\[OBJEKT\]([\s\S]*?)(?=\[|$)/i);
    const lageMatch = text.match(/\[LAGE\]([\s\S]*?)(?=\[|$)/i);
    const ausstattungMatch = text.match(/\[AUSSTATTUNG\]([\s\S]*?)(?=\[|$)/i);
    const energieMatch = text.match(/\[ENERGIE\]([\s\S]*?)(?=\[|$)/i);
    const kontaktMatch = text.match(/\[KONTAKT\]([\s\S]*?)(?=\[|$)/i);

    if (headlineMatch) sections.headline = headlineMatch[1].trim();
    if (einleitungMatch) sections.einleitung = einleitungMatch[1].trim();
    if (objektMatch) sections.objekt = objektMatch[1].trim();
    if (lageMatch) sections.lage = lageMatch[1].trim();
    if (ausstattungMatch) sections.ausstattung = ausstattungMatch[1].trim();
    if (energieMatch) sections.energie = energieMatch[1].trim();
    if (kontaktMatch) sections.kontakt = kontaktMatch[1].trim();

    return sections;
  };

  const capitalizeFirst = (str) => {
    if (!str) return str;
    return str.charAt(0).toUpperCase() + str.slice(1);
  };

  const cleanLatex = (text) => {
    if (!text) return text;
    return text
      .replace(/\$m\^2\$/g, 'm²')
      .replace(/\$m²\$/g, 'm²')
      .replace(/m\^2/g, 'm²')
      .replace(/\bm2\b/g, 'm²')
      .replace(/\bqm\b/gi, 'm²');
  };

  const handleExportPDF = () => {
    const { jsPDF } = window.jspdf;
    if (!jsPDF) {
      showToast('PDF-Bibliothek nicht geladen. Bitte Seite neu laden.', 'error');
      return;
    }

    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 20;

    const gold = { r: 197, g: 160, b: 89 };
    const navy = { r: 10, g: 25, b: 47 };
    const gray = { r: 100, g: 100, b: 100 };
    const lightGray = { r: 245, g: 245, b: 245 };

    // Text von LaTeX bereinigen - verwende editierten Text!
    const textToUse = isTextEdited ? editableText : aiGeneratedText;
    const cleanedText = cleanLatex(textToUse);
    const sections = parseTextSections(cleanedText);

    const ortCapitalized = capitalizeFirst(propertyData.ort || 'Lage');

    // SEITE 1: COVER
    let yPos = margin;

    if (uploadedLogo?.base64) {
      try {
        doc.addImage(uploadedLogo.base64, 'JPEG', margin, yPos, 40, 20);
      } catch (e) {}
    }
    yPos += 35;

    if (uploadedPhotos[0]?.base64) {
      const photoHeight = 120;
      const photoWidth = pageWidth - 2 * margin;
      const cornerRadius = 3;
      
      try {
        doc.setFillColor(255, 255, 255);
        doc.roundedRect(margin, yPos, photoWidth, photoHeight, cornerRadius, cornerRadius, 'F');
        doc.addImage(uploadedPhotos[0].base64, 'JPEG', margin, yPos, photoWidth, photoHeight);
        doc.setDrawColor(gold.r, gold.g, gold.b);
        doc.setLineWidth(0.3);
        doc.roundedRect(margin, yPos, photoWidth, photoHeight, cornerRadius, cornerRadius, 'S');
      } catch (e) {}
      yPos += photoHeight + 15;
    }

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(26);
    doc.setTextColor(navy.r, navy.g, navy.b);
    const headline = sections.headline || `${propertyData.objekttyp || 'Immobilie'} in ${ortCapitalized}`;
    const headlineLines = doc.splitTextToSize(headline, pageWidth - 2 * margin);
    headlineLines.forEach((line, i) => {
      doc.text(line, pageWidth / 2, yPos + (i * 10), { align: 'center' });
    });
    yPos += (headlineLines.length * 10) + 8;

    doc.setDrawColor(gold.r, gold.g, gold.b);
    doc.setLineWidth(1.5);
    doc.line(margin, yPos, pageWidth - margin, yPos);
    yPos += 15;

    const topFacts = [
      { label: 'Wohnfläche', value: `${propertyData.wohnflaeche} m²` },
      { label: 'Zimmer', value: propertyData.zimmer },
      { label: 'Baujahr', value: propertyData.baujahr || '—' },
      { label: 'Preis', value: propertyData.preis ? `${Number(propertyData.preis).toLocaleString('de-DE')} €` : '—' }
    ];

    const factWidth = (pageWidth - 2 * margin) / 2;
    let factCol = 0;
    let factRow = 0;

    topFacts.forEach(fact => {
      const xPos = margin + (factCol * factWidth);
      const yBase = yPos + (factRow * 18);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(gray.r, gray.g, gray.b);
      doc.text(fact.label, xPos, yBase);

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(14);
      doc.setTextColor(navy.r, navy.g, navy.b);
      doc.text(fact.value, xPos, yBase + 6);

      factCol++;
      if (factCol >= 2) {
        factCol = 0;
        factRow++;
      }
    });

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(gold.r, gold.g, gold.b);
    doc.text('1', pageWidth - margin, pageHeight - 10, { align: 'right' });

    // SEITE 2: DETAILS
    doc.addPage();
    yPos = margin;

    if (uploadedLogo?.base64) {
      try {
        doc.addImage(uploadedLogo.base64, 'JPEG', margin, yPos, 30, 15);
      } catch (e) {}
    }
    yPos += 25;

    const leftColWidth = 45;
    const rightColStart = margin + leftColWidth + 10;
    const rightColWidth = pageWidth - rightColStart - margin;

    doc.setFillColor(lightGray.r, lightGray.g, lightGray.b);
    doc.rect(margin, yPos, leftColWidth, pageHeight - yPos - margin - 15, 'F');

    let leftY = yPos + 5;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(navy.r, navy.g, navy.b);
    doc.text('Technische Daten', margin + 3, leftY);
    leftY += 10;

    const technicalData = [
      ['Objekttyp', propertyData.objekttyp || '—'],
      ['Schlafzimmer', propertyData.schlafzimmer || '—'],
      ['Bäder', propertyData.baeder || '—'],
      ['Balkone', propertyData.balkone || '—'],
      ['Sanierung', propertyData.sanierung || '—'],
      ['Zustand', propertyData.zustand || '—'],
      ['Heizung', propertyData.heizung || '—'],
      ['Keller', propertyData.keller || '—'],
      ['Stellplätze', propertyData.stellplaetze || '—']
    ];

    if (propertyData.denkmalschutz === 'Ja') technicalData.push(['Denkmalschutz', 'Ja']);
    if (propertyData.einliegerwohnung === 'Ja') technicalData.push(['Einliegerwohnung', 'Ja']);
    if (propertyData.erbpacht === 'Ja') technicalData.push(['Erbpacht', 'Ja']);
    if (propertyData.hausgeld) technicalData.push(['Hausgeld', `${propertyData.hausgeld} €/M`]);
    if (propertyData.verfuegbarAb) technicalData.push(['Verfügbar ab', propertyData.verfuegbarAb]);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(gray.r, gray.g, gray.b);

    technicalData.forEach(([key, val]) => {
      if (leftY > pageHeight - 30) return;
      if (val && val !== '—') {
        doc.setFont('helvetica', 'bold');
        doc.text(`${key}:`, margin + 3, leftY);
        doc.setFont('helvetica', 'normal');
        doc.text(val, margin + 3, leftY + 4);
        leftY += 12;
      }
    });

    let rightY = yPos;

    if (rightY > pageHeight - 25) {
      doc.addPage();
      rightY = margin;
      if (uploadedLogo?.base64) {
        try {
          doc.addImage(uploadedLogo.base64, 'JPEG', margin, rightY, 30, 15);
        } catch (e) {}
      }
      rightY += 25;
    }

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.setTextColor(navy.r, navy.g, navy.b);
    doc.text('Beschreibung', rightColStart, rightY);
    rightY += 10;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(11);
    doc.setTextColor(gray.r, gray.g, gray.b);

    const einleitungText = sections.einleitung || '';
    const objektText = sections.objekt || '';
    const combinedText = `${einleitungText}\n\n${objektText}`;

    const textLines = doc.splitTextToSize(combinedText, rightColWidth);
    const lineHeight = 6.5;

    textLines.forEach((line) => {
      if (rightY > pageHeight - 30) {
        doc.addPage();
        rightY = margin;
        if (uploadedLogo?.base64) {
          try {
            doc.addImage(uploadedLogo.base64, 'JPEG', margin, rightY, 30, 15);
          } catch (e) {}
        }
        rightY += 25;
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        doc.setTextColor(gold.r, gold.g, gold.b);
        doc.text(`${doc.internal.pages.length - 1}`, pageWidth - margin, pageHeight - 10, { align: 'right' });
      }

      doc.text(line, rightColStart, rightY);
      rightY += lineHeight;
    });

    doc.setPage(2);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(gold.r, gold.g, gold.b);
    doc.text('2', pageWidth - margin, pageHeight - 10, { align: 'right' });

    // SEITE 3: LAGE & FOTOS
    doc.addPage();
    yPos = margin;

    if (uploadedLogo?.base64) {
      try {
        doc.addImage(uploadedLogo.base64, 'JPEG', margin, yPos, 30, 15);
      } catch (e) {}
    }
    yPos += 25;

    if (yPos > pageHeight - 25) {
      doc.addPage();
      yPos = margin;
    }

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.setTextColor(navy.r, navy.g, navy.b);
    doc.text('Lage & Umgebung', margin, yPos);
    yPos += 10;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(11);
    doc.setTextColor(gray.r, gray.g, gray.b);

    const lageText = sections.lage || '';
    const lageLines = doc.splitTextToSize(lageText, pageWidth - 2 * margin);
    lageLines.forEach(line => {
      if (yPos > pageHeight - 30) {
        doc.addPage();
        yPos = margin;
        if (uploadedLogo?.base64) {
          try {
            doc.addImage(uploadedLogo.base64, 'JPEG', margin, yPos, 30, 15);
          } catch (e) {}
        }
        yPos += 25;
      }
      doc.text(line, margin, yPos);
      yPos += 6.5;
    });

    yPos += 10;

    if (uploadedPhotos.length > 1) {
      if (yPos > pageHeight - 25) {
        doc.addPage();
        yPos = margin;
      }

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(12);
      doc.setTextColor(navy.r, navy.g, navy.b);
      doc.text('Weitere Ansichten', margin, yPos);
      yPos += 10;

      const photos = uploadedPhotos.slice(1, 5);
      const gap = 8;
      const photoWidth = (pageWidth - 2 * margin - gap) / 2;
      const photoHeight = 55;

      photos.forEach((photo, i) => {
        const col = i % 2;
        const row = Math.floor(i / 2);
        const xPos = margin + (col * (photoWidth + gap));
        const yPhotoPos = yPos + (row * (photoHeight + gap));

        try {
          doc.addImage(photo.base64, 'JPEG', xPos, yPhotoPos, photoWidth, photoHeight);
          doc.setDrawColor(gold.r, gold.g, gold.b);
          doc.setLineWidth(0.2);
          doc.rect(xPos, yPhotoPos, photoWidth, photoHeight);
        } catch (e) {}
      });

      yPos += Math.ceil(photos.length / 2) * (photoHeight + gap) + 10;
    }

    if (yPos > pageHeight - 60) {
      doc.addPage();
      yPos = margin + 30;
    }

    yPos = Math.max(yPos, pageHeight - 55);

    doc.setFillColor(gold.r, gold.g, gold.b);
    doc.roundedRect(margin, yPos, pageWidth - 2 * margin, 45, 2, 2, 'F');

    yPos += 8;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(255, 255, 255);
    doc.text('Energie & Kontakt', margin + 5, yPos);
    yPos += 10;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    const energieText = sections.energie || `Energieeffizienzklasse: ${propertyData.effizienzklasse || '—'}`;
    const kontaktText = sections.kontakt || 'Vereinbaren Sie einen Besichtigungstermin.';

    const energieLines = doc.splitTextToSize(cleanLatex(energieText), pageWidth - 2 * margin - 10);
    energieLines.forEach(line => {
      doc.text(line, margin + 5, yPos);
      yPos += 5;
    });

    yPos += 3;
    const kontaktLines = doc.splitTextToSize(kontaktText, pageWidth - 2 * margin - 10);
    kontaktLines.forEach(line => {
      doc.text(line, margin + 5, yPos);
      yPos += 5;
    });

    if (propertyData.provision) {
      yPos += 2;
      doc.text(`Provision: ${propertyData.provision}`, margin + 5, yPos);
    }

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(255, 255, 255);
    doc.text('3', pageWidth - margin, pageHeight - 10, { align: 'right' });

    const fileName = `Expose_${ortCapitalized}_${propertyData.objekttyp || 'Immobilie'}_${new Date().toISOString().split('T')[0]}.pdf`;
    doc.save(fileName);

    showToast('PDF erfolgreich erstellt!', 'success');
    console.log('✅ PDF erstellt:', fileName);
  };

  const handleExportEmail = () => {
    const textToUse = isTextEdited ? editableText : aiGeneratedText;
    const subj = `Exposé: ${propertyData.objekttyp || 'Objekt'} in ${capitalizeFirst(propertyData.ort || 'Lage')}`;
    const body = `${cleanLatex(textToUse)}\n\n---\nErstellt mit Exposé-Profi`;
    window.location.href = `mailto:?subject=${encodeURIComponent(subj)}&body=${encodeURIComponent(body)}`;
    showToast('E-Mail-Client geöffnet', 'info');
  };

  const handleBetaSubmit = (e) => {
    e.preventDefault();
    if (betaEmail && betaEmail.includes('@')) {
      setBetaSubmitted(true);
      showToast('Erfolgreich angemeldet!', 'success');
      setTimeout(() => {
        setBetaEmail('');
        setBetaSubmitted(false);
      }, 5000);
    }
  };
  return (
    <div className="min-h-screen bg-white">
      {/* TOAST NOTIFICATIONS */}
      {toast && (
        <Toast 
          message={toast.message} 
          type={toast.type} 
          onClose={() => setToast(null)} 
        />
      )}

      {/* RESTORE BANNER */}
      {showRestoreBanner && (
        <div className="fixed top-0 left-0 right-0 bg-gradient-to-r from-[#C5A059] to-[#B39050] text-white py-3 px-6 z-40 shadow-xl">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <AlertCircle className="w-5 h-5" />
              <span className="font-medium">Möchten Sie Ihre zuletzt gespeicherten Daten wiederherstellen?</span>
            </div>
            <div className="flex items-center space-x-3">
              <button onClick={handleRestore}
                className="px-4 py-2 bg-white text-[#0A192F] rounded-lg font-semibold hover:bg-gray-100 transition-all">
                Wiederherstellen
              </button>
              <button onClick={handleClearSaved}
                className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg font-semibold transition-all">
                Verwerfen
              </button>
            </div>
          </div>
        </div>
      )}

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
              <div className="lg:col-span-1">
                <label className="block text-sm font-semibold text-[#0A192F] mb-2">Objekttyp *</label>
                <select name="objekttyp" value={propertyData.objekttyp} onChange={handleInputChange}
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#C5A059] focus:ring-4 focus:ring-[#C5A059]/20 outline-none transition-all">
                  <option value="">Wählen</option>
                  {objekttypen.map((typ, i) => (
                    typ.startsWith('---') ? (
                      <option key={i} disabled className="font-bold bg-gray-100">{typ}</option>
                    ) : (
                      <option key={i} value={typ}>{typ}</option>
                    )
                  ))}
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
          {/* RECHTLICHES & FINANZEN */}
          <div className="bg-gradient-to-br from-gray-50 to-white rounded-3xl p-8 shadow-xl mb-8 border border-gray-100">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl flex items-center justify-center">
                <Scale className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-[#0A192F]">Rechtliches & Finanzen</h3>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-semibold text-[#0A192F] mb-2">Denkmalschutz</label>
                <div className="grid grid-cols-2 gap-3">
                  {['Ja', 'Nein'].map(t => (
                    <button key={t} type="button"
                      onClick={() => setPropertyData(prev => ({ ...prev, denkmalschutz: t }))}
                      className={`px-4 py-3 rounded-xl font-semibold transition-all ${
                        propertyData.denkmalschutz === t
                          ? 'bg-gradient-to-r from-[#C5A059] to-[#B39050] text-white shadow-lg'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}>
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#0A192F] mb-2">Erbpacht</label>
                <div className="grid grid-cols-2 gap-3">
                  {['Ja', 'Nein'].map(t => (
                    <button key={t} type="button"
                      onClick={() => setPropertyData(prev => ({ ...prev, erbpacht: t }))}
                      className={`px-4 py-3 rounded-xl font-semibold transition-all ${
                        propertyData.erbpacht === t
                          ? 'bg-gradient-to-r from-[#C5A059] to-[#B39050] text-white shadow-lg'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}>
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#0A192F] mb-2">Einliegerwohnung</label>
                <div className="grid grid-cols-2 gap-3">
                  {['Ja', 'Nein'].map(t => (
                    <button key={t} type="button"
                      onClick={() => setPropertyData(prev => ({ ...prev, einliegerwohnung: t }))}
                      className={`px-4 py-3 rounded-xl font-semibold transition-all ${
                        propertyData.einliegerwohnung === t
                          ? 'bg-gradient-to-r from-[#C5A059] to-[#B39050] text-white shadow-lg'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}>
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#0A192F] mb-2">Hausgeld (€/Monat)</label>
                <input type="text" value={propertyData.hausgeld}
                  onChange={(e) => handleNumericInput(e, 'hausgeld')}
                  placeholder="350"
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#C5A059] focus:ring-4 focus:ring-[#C5A059]/20 outline-none transition-all" />
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#0A192F] mb-2">Provision</label>
                <input type="text" name="provision" value={propertyData.provision} onChange={handleInputChange}
                  placeholder="3,57% inkl. MwSt."
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#C5A059] focus:ring-4 focus:ring-[#C5A059]/20 outline-none transition-all" />
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#0A192F] mb-2">Provisionspflichtig</label>
                <select name="provisionspflichtig" value={propertyData.provisionspflichtig} onChange={handleInputChange}
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#C5A059] focus:ring-4 focus:ring-[#C5A059]/20 outline-none transition-all">
                  <option value="Nein">Nein</option>
                  <option value="Käufer">Käufer</option>
                  <option value="Verkäufer">Verkäufer</option>
                  <option value="Beide">Beide</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#0A192F] mb-2">Verfügbar ab</label>
                <input type="text" name="verfuegbarAb" value={propertyData.verfuegbarAb} onChange={handleInputChange}
                  placeholder="sofort / 01.06.2026"
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#C5A059] focus:ring-4 focus:ring-[#C5A059]/20 outline-none transition-all" />
              </div>
            </div>
          </div>

          {/* AUSSTATTUNG */}
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

          {/* UPLOADS */}
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

          {/* TONALITÄT AUSWAHL (NEU!) */}
          <div className="bg-gradient-to-br from-[#C5A059]/5 to-[#D4AF6A]/5 rounded-3xl p-8 shadow-xl mb-8 border-2 border-[#C5A059]/20">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-[#C5A059] to-[#B39050] rounded-xl flex items-center justify-center">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-[#0A192F]">Tonalität wählen</h3>
            </div>

            <div className="grid md:grid-cols-3 gap-4">
              {[
                { value: 'professional', label: 'Professionell', desc: 'Sachlich & vertrauenswürdig', icon: '💼' },
                { value: 'emotional', label: 'Emotional', desc: 'Wärmend & einladend', icon: '🎭' },
                { value: 'luxury', label: 'Luxuriös', desc: 'Exklusiv & prestigeträchtig', icon: '👑' }
              ].map(tone => (
                <button key={tone.value} type="button"
                  onClick={() => setSelectedTonality(tone.value)}
                  className={`p-6 rounded-2xl text-left transition-all ${
                    selectedTonality === tone.value
                      ? 'bg-gradient-to-br from-[#C5A059] to-[#B39050] text-white shadow-2xl scale-105'
                      : 'bg-white text-gray-700 hover:bg-gray-50 shadow-lg'
                  }`}>
                  <div className="text-3xl mb-3">{tone.icon}</div>
                  <h4 className="font-bold text-lg mb-2">{tone.label}</h4>
                  <p className={`text-sm ${selectedTonality === tone.value ? 'text-white/80' : 'text-gray-600'}`}>
                    {tone.desc}
                  </p>
                </button>
              ))}
            </div>
          </div>

          {/* GENERATE BUTTON */}
          <button onClick={() => handleGenerate(selectedTonality)}
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
                <span>Premium-Exposé generieren ({selectedTonality === 'professional' ? 'Professionell' : selectedTonality === 'emotional' ? 'Emotional' : 'Luxuriös'})</span>
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
          {/* RESULT MIT TEXT-EDITOR (NEU!) */}
          {(aiGeneratedText || editableText) && (
            <div className="mt-12 bg-white rounded-3xl shadow-2xl border border-gray-200 overflow-hidden">
              <div className="bg-gradient-to-r from-[#0A192F] to-[#112240] px-8 py-6 flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center space-x-3">
                  <Eye className="w-6 h-6 text-[#C5A059]" />
                  <h3 className="text-2xl font-bold text-white">Ihr Exposé</h3>
                  {isTextEdited && (
                    <span className="px-3 py-1 bg-amber-500 text-white text-xs font-bold rounded-full">
                      Bearbeitet
                    </span>
                  )}
                </div>
                {isUnlocked && (
                  <div className="flex space-x-3">
                    {isTextEdited && (
                      <button onClick={handleResetText}
                        className="px-6 py-3 bg-white/10 hover:bg-white/20 backdrop-blur-lg border border-white/20 rounded-xl text-white font-semibold transition-all flex items-center space-x-2">
                        <RotateCcw className="w-5 h-5" />
                        <span>Zurücksetzen</span>
                      </button>
                    )}
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

              <div className="p-8">
                {isUnlocked ? (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between mb-4">
                      <p className="text-sm text-gray-600">
                        Bearbeiten Sie den Text direkt. Änderungen werden automatisch im PDF übernommen.
                      </p>
                      <div className="text-xs text-gray-500">
                        {editableText.length} Zeichen
                      </div>
                    </div>
                    
                    <textarea
                      value={editableText}
                      onChange={(e) => handleTextEdit(e.target.value)}
                      className="w-full min-h-[600px] px-6 py-4 border-2 border-gray-200 rounded-2xl focus:border-[#C5A059] focus:ring-4 focus:ring-[#C5A059]/20 outline-none font-mono text-sm leading-relaxed resize-y"
                      placeholder="Ihr generierter Text erscheint hier..."
                    />
                  </div>
                ) : (
                  <div className="relative">
                    <div className="prose prose-lg max-w-none mb-4">
                      <div className="whitespace-pre-wrap text-gray-800 leading-relaxed">
                        {getTeaserText()}
                      </div>
                    </div>

                    {getBlurredText() && (
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
                              Schalten Sie das vollständige Exposé mit Text-Editor und allen Funktionen frei.
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
                )}
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
                features: [
                  'Vision-KI Analyse', 
                  '3 Tonalitäten (Pro/Emotional/Luxus)',
                  'Text-Editor mit Live-Bearbeitung',
                  'Foto-Beschriftungen', 
                  'OCR Energieausweis', 
                  'PDF-Export', 
                  'E-Mail-Export'
                ],
                cta: 'Jetzt starten',
                highlight: false
              },
              {
                name: 'Pro-Abo',
                price: '79€',
                per: 'pro Monat',
                desc: 'Für professionelle Makler',
                features: [
                  'Alles aus Starter', 
                  '10 Exposés inkl.', 
                  'Eigenes Branding', 
                  'Prioritäts-Support', 
                  'Beta-Features',
                  'Exposé-Verlauf & Speicherung',
                  'Bulk-Export (bald)'
                ],
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
                'Text-Editor mit Live-Bearbeitung',
                'PDF-Export mit Branding',
                'E-Mail-Versand',
                '3 Tonalitäten wählbar'
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

      {/* CSS für Toast Animation */}
      <style>{`
        @keyframes slide-in {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        .animate-slide-in {
          animation: slide-in 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}
