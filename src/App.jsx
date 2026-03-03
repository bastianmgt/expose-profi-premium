import React, { useState, useEffect, useRef } from 'react';
import { 
  Clock, 
  TrendingUp, 
  Award, 
  Upload, 
  Sparkles, 
  FileText, 
  Image, 
  FileInput, 
  X, 
  Check,
  Edit3,
  Download,
  Palette,
  Shield,
  Home,
  Building2,
  MapPin,
  Euro,
  Key,
  Lock,
  Unlock,
  Loader2
} from 'lucide-react';

export default function ExposeProfiLanding() {
  // STATE MANAGEMENT
  const [energyUploadStatus, setEnergyUploadStatus] = useState('idle');
  const [uploadedPhotos, setUploadedPhotos] = useState([]);
  const [uploadedFloorPlans, setUploadedFloorPlans] = useState([]);
  const [uploadedLogo, setUploadedLogo] = useState(null);
  const [uploadedEnergyCert, setUploadedEnergyCert] = useState(null);
  const [showPreview, setShowPreview] = useState(false);
  const [aiGeneratedText, setAiGeneratedText] = useState('');
  const [legalContent, setLegalContent] = useState(null);
  const [showBetaModal, setShowBetaModal] = useState(false);
  const [betaEmail, setBetaEmail] = useState('');
  const [betaSubmitted, setBetaSubmitted] = useState(false);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  
  const photoInputRef = useRef(null);
  const logoInputRef = useRef(null);
  const floorPlanInputRef = useRef(null);
  const energyInputRef = useRef(null);
  const dropZoneRef = useRef(null);
  
  const [propertyData, setPropertyData] = useState({
    objekttyp: '',
    vermarktungsart: '',
    plz: '',
    ort: '',
    zustand: '',
    preis: '',
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
        }
      ]
    },
    datenschutz: {
      title: 'Datenschutzerklärung',
      sections: [
        {
          heading: '1. Datenschutz auf einen Blick',
          content: 'Die folgenden Hinweise geben einen einfachen Überblick.'
        }
      ]
    },
    widerruf: {
      title: 'Widerrufsbelehrung',
      sections: [
        {
          heading: 'Widerrufsrecht',
          content: 'Sie haben das Recht, binnen vierzehn Tagen diesen Vertrag zu widerrufen.'
        }
      ]
    },
    agb: {
      title: 'AGB',
      sections: [
        {
          heading: '§ 1 Geltungsbereich',
          content: 'Diese AGB gelten für alle Verträge.'
        }
      ]
    }
  };

  // HILFSFUNKTIONEN

  const isFormValid = () => {
    return propertyData.wohnflaeche.trim() !== '' && 
           propertyData.zimmer.trim() !== '' &&
           propertyData.objekttyp !== '' &&
           propertyData.vermarktungsart !== '';
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

  // DATEI-KOMPRIMIERUNG
  const compressImage = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        const img = new window.Image();
        
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          
          // Resize wenn zu groß
          const MAX_WIDTH = 1024;
          const MAX_HEIGHT = 1024;
          
          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }
          
          canvas.width = width;
          canvas.height = height;
          
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);
          
          // Convert to base64 (JPEG, 80% quality)
          const base64 = canvas.toDataURL('image/jpeg', 0.8);
          resolve(base64);
        };
        
        img.onerror = reject;
        img.src = e.target.result;
      };
      
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  // FOTO-UPLOAD
  const handlePhotoUpload = async (files) => {
    const fileArray = Array.from(files);
    const imageFiles = fileArray.filter(f => f.type.startsWith('image/'));
    
    if (imageFiles.length === 0) {
      alert('Bitte nur Bilddateien auswählen (JPG, PNG)');
      return;
    }
    
    // Limit: 20 Fotos total
    const remaining = 20 - uploadedPhotos.length;
    const toProcess = imageFiles.slice(0, remaining);
    
    try {
      const compressedPhotos = [];
      
      for (const file of toProcess) {
        const base64 = await compressImage(file);
        const preview = URL.createObjectURL(file);
        
        compressedPhotos.push({
          id: Date.now() + Math.random(),
          name: file.name,
          preview: preview,
          base64: base64,
          size: file.size
        });
      }
      
      setUploadedPhotos(prev => [...prev, ...compressedPhotos]);
      
      if (toProcess.length < imageFiles.length) {
        alert(`Nur ${toProcess.length} von ${imageFiles.length} Fotos hinzugefügt (Maximum 20 erreicht)`);
      }
    } catch (error) {
      console.error('Fehler beim Komprimieren:', error);
      alert('Fehler beim Verarbeiten der Bilder');
    }
  };

  // LOGO-UPLOAD
  const handleLogoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    if (!file.type.startsWith('image/')) {
      alert('Bitte nur Bilddateien auswählen');
      return;
    }
    
    try {
      const base64 = await compressImage(file);
      const preview = URL.createObjectURL(file);
      
      setUploadedLogo({
        id: Date.now(),
        name: file.name,
        preview: preview,
        base64: base64
      });
    } catch (error) {
      console.error('Fehler beim Logo-Upload:', error);
      alert('Fehler beim Verarbeiten des Logos');
    }
  };

  // GRUNDRISS-UPLOAD
  const handleFloorPlanUpload = async (e) => {
    const files = Array.from(e.target.files);
    
    try {
      const newPlans = [];
      
      for (const file of files) {
        let base64;
        
        if (file.type.startsWith('image/')) {
          base64 = await compressImage(file);
        } else if (file.type === 'application/pdf') {
          // PDF zu Base64
          base64 = await new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(file);
          });
        } else {
          continue;
        }
        
        newPlans.push({
          id: Date.now() + Math.random(),
          name: file.name,
          base64: base64,
          type: file.type
        });
      }
      
      setUploadedFloorPlans(prev => [...prev, ...newPlans]);
    } catch (error) {
      console.error('Fehler beim Grundriss-Upload:', error);
      alert('Fehler beim Verarbeiten der Grundrisse');
    }
  };

  // ENERGIEAUSWEIS-UPLOAD MIT OCR
  const handleEnergyUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    if (!file.type.startsWith('image/') && file.type !== 'application/pdf') {
      alert('Bitte nur Bild- oder PDF-Dateien auswählen');
      return;
    }
    
    setEnergyUploadStatus('uploading');
    
    try {
      let base64;
      
      if (file.type.startsWith('image/')) {
        base64 = await compressImage(file);
      } else {
        // PDF zu Base64
        base64 = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result);
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });
      }
      
      setUploadedEnergyCert({
        id: Date.now(),
        name: file.name,
        base64: base64
      });
      
      // OCR durchführen
      setEnergyUploadStatus('extracting');
      
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          mode: 'ocr',
          energyCertificate: base64
        })
      });
      
      const data = await response.json();
      
      if (data.success && data.data) {
        // Befülle States mit OCR-Daten
        setPropertyData(prev => ({
          ...prev,
          effizienzklasse: data.data.effizienzklasse || '',
          energiebedarf: data.data.energiebedarf || '',
          energietraeger: data.data.energietraeger || '',
          ausweistyp: data.data.ausweistyp || ''
        }));
        
        setEnergyUploadStatus('complete');
      } else {
        throw new Error('OCR fehlgeschlagen');
      }
      
    } catch (error) {
      console.error('Fehler beim Energieausweis:', error);
      setEnergyUploadStatus('error');
      alert('Fehler beim Extrahieren der Energiedaten. Bitte geben Sie die Werte manuell ein.');
      
      setTimeout(() => {
        setEnergyUploadStatus('idle');
      }, 3000);
    }
  };

  // DRAG & DROP
  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handlePhotoUpload(files);
    }
  };

  // FOTO ENTFERNEN
  const removePhoto = (id) => {
    setUploadedPhotos(prev => {
      const photo = prev.find(p => p.id === id);
      if (photo?.preview) {
        URL.revokeObjectURL(photo.preview);
      }
      return prev.filter(p => p.id !== id);
    });
  };

  const removeFloorPlan = (id) => {
    setUploadedFloorPlans(prev => prev.filter(p => p.id !== id));
  };

  const removeLogo = () => {
    if (uploadedLogo?.preview) {
      URL.revokeObjectURL(uploadedLogo.preview);
    }
    setUploadedLogo(null);
  };

  // EXPOSÉ GENERIEREN MIT VISION
  const handleGenerateExpose = async () => {
    if (!isFormValid()) {
      return;
    }

    setShowPreview(false);
    setIsGenerating(true);
    setGenerationProgress(0);
    setAiGeneratedText('');
    setShowPreview(true);
    setIsUnlocked(false);

    try {
      // Progress-Simulation
      const progressInterval = setInterval(() => {
        setGenerationProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 300);

      console.log('📤 Sende Request mit', uploadedPhotos.length, 'Fotos...');
      
      // Bereite Fotos vor (nur Base64)
      const photosBase64 = uploadedPhotos.map(p => p.base64);
      
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          propertyData: {
            ...propertyData,
            uploadedPhotosCount: uploadedPhotos.length
          },
          photos: photosBase64,
          mode: 'generate'
        })
      });

      clearInterval(progressInterval);
      setGenerationProgress(100);

      const data = await response.json();
      console.log('📊 Response:', data);

      if (!response.ok) {
        console.error('❌ API-Fehler:', data);
        setAiGeneratedText(`❌ Fehler: ${data.message || data.error || 'Unbekannter Fehler'}`);
        setIsGenerating(false);
        return;
      }

      if (data.success && data.text) {
        console.log('✅ Exposé generiert mit', data.analyzedImages, 'analysierten Bildern');
        setAiGeneratedText(data.text);
      } else {
        setAiGeneratedText('❌ Fehler: Kein Text erhalten');
      }

    } catch (error) {
      console.error('❌ Netzwerk-Fehler:', error);
      setAiGeneratedText(`❌ Verbindungsfehler\n\nDetails: ${error.message}`);
    } finally {
      setIsGenerating(false);
      setGenerationProgress(0);
    }
  };

  const handleUnlock = () => {
    setIsUnlocked(true);
    setTimeout(() => {
      openBetaModal();
    }, 500);
  };

  // PDF-EXPORT FUNKTION
  const handleExportPDF = () => {
    const { jsPDF } = window.jspdf;
    
    if (!jsPDF) {
      alert('PDF-Bibliothek nicht geladen. Bitte Seite neu laden.');
      return;
    }

    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 20;
    let yPos = margin;

    const brandColor = { r: 197, g: 160, b: 89 };
    const darkColor = { r: 10, g: 25, b: 47 };
    const grayColor = { r: 100, g: 100, b: 100 };

    if (uploadedLogo && uploadedLogo.base64) {
      try {
        doc.addImage(uploadedLogo.base64, 'JPEG', margin, yPos, 40, 20);
      } catch (error) {
        console.error('Logo konnte nicht eingefügt werden:', error);
      }
    }

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(darkColor.r, darkColor.g, darkColor.b);

    const rightX = pageWidth - margin;
    const objectInfo = [
      propertyData.objekttyp || 'Immobilie',
      propertyData.ort ? `${propertyData.plz || ''} ${propertyData.ort}`.trim() : '',
      propertyData.preis ? `${propertyData.vermarktungsart === 'Verkauf' ? 'Kaufpreis' : 'Kaltmiete'}: ${Number(propertyData.preis).toLocaleString('de-DE')} €` : ''
    ].filter(Boolean);

    objectInfo.forEach((line, index) => {
      doc.text(line, rightX, yPos + (index * 6), { align: 'right' });
    });

    yPos += 35;

    doc.setDrawColor(brandColor.r, brandColor.g, brandColor.b);
    doc.setLineWidth(0.5);
    doc.line(margin, yPos, pageWidth - margin, yPos);
    yPos += 10;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(18);
    doc.setTextColor(darkColor.r, darkColor.g, darkColor.b);
    
    const headline = `${propertyData.objekttyp || 'Exklusive Immobilie'} in ${propertyData.ort || 'bester Lage'}`;
    doc.text(headline, margin, yPos);
    yPos += 12;

    doc.setFillColor(250, 250, 250);
    doc.roundedRect(margin, yPos, pageWidth - 2 * margin, 20, 2, 2, 'F');
    
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(grayColor.r, grayColor.g, grayColor.b);
    
    const eckdaten = [
      `${propertyData.wohnflaeche} m²`,
      `${propertyData.zimmer} Zimmer`,
      propertyData.baujahr ? `Baujahr ${propertyData.baujahr}` : null,
      propertyData.zustand || null
    ].filter(Boolean).join('  •  ');
    
    doc.text(eckdaten, margin + 5, yPos + 7);
    
    if (propertyData.effizienzklasse) {
      const energieText = `Energie: Klasse ${propertyData.effizienzklasse}, ${propertyData.energiebedarf || '—'} kWh/(m²·a)`;
      doc.text(energieText, margin + 5, yPos + 14);
    }
    
    yPos += 28;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(50, 50, 50);
    
    const textWidth = pageWidth - 2 * margin;
    const lines = doc.splitTextToSize(aiGeneratedText, textWidth);
    
    lines.forEach((line) => {
      if (yPos > pageHeight - 60) {
        doc.addPage();
        yPos = margin;
      }
      doc.text(line, margin, yPos);
      yPos += 5;
    });

    yPos += 10;

    const allFeatures = [
      ...propertyData.aussenbereich || [],
      ...propertyData.innenraum || [],
      ...propertyData.parkenKeller || [],
      ...propertyData.technikKomfort || []
    ];

    if (allFeatures.length > 0) {
      if (yPos > pageHeight - 80) {
        doc.addPage();
        yPos = margin;
      }

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(12);
      doc.setTextColor(darkColor.r, darkColor.g, darkColor.b);
      doc.text('Ausstattung & Highlights', margin, yPos);
      yPos += 8;

      const featuresHeight = Math.ceil(allFeatures.length / 2) * 6 + 10;
      doc.setFillColor(252, 249, 243);
      doc.roundedRect(margin, yPos, pageWidth - 2 * margin, featuresHeight, 2, 2, 'F');
      yPos += 7;

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(60, 60, 60);

      const columnWidth = (pageWidth - 2 * margin - 10) / 2;
      let currentColumn = 0;
      let columnYPos = yPos;

      allFeatures.forEach((feature) => {
        const xPos = margin + 5 + (currentColumn * (columnWidth + 10));
        
        doc.setTextColor(brandColor.r, brandColor.g, brandColor.b);
        doc.setFont('helvetica', 'bold');
        doc.text('✓', xPos, columnYPos);
        
        doc.setTextColor(60, 60, 60);
        doc.setFont('helvetica', 'normal');
        doc.text(feature, xPos + 5, columnYPos);
        
        currentColumn++;
        if (currentColumn >= 2) {
          currentColumn = 0;
          columnYPos += 6;
        }
      });
    }

    const addFooter = () => {
      const footerY = pageHeight - 15;
      doc.setDrawColor(brandColor.r, brandColor.g, brandColor.b);
      doc.setLineWidth(0.3);
      doc.line(margin, footerY - 5, pageWidth - margin, footerY - 5);
      
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(grayColor.r, grayColor.g, grayColor.b);
      
      const footerText = 'Erstellt mit Exposé-Profi  •  www.expose-profi.de';
      doc.text(footerText, pageWidth / 2, footerY, { align: 'center' });
    };

    const totalPages = doc.internal.pages.length - 1;
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      addFooter();
    }

    const fileName = `Expose_${propertyData.objekttyp || 'Immobilie'}_${propertyData.ort || 'Objekt'}_${new Date().toISOString().split('T')[0]}.pdf`;
    doc.save(fileName);
    
    console.log('✅ PDF erfolgreich erstellt:', fileName);
  };
  const getTeaserText = () => {
    if (isUnlocked) {
      return aiGeneratedText;
    }
    
    if (aiGeneratedText.length <= 200) {
      return aiGeneratedText;
    }
    
    return aiGeneratedText.substring(0, 200);
  };

  const getBlurredText = () => {
    if (isUnlocked || aiGeneratedText.length <= 200) {
      return '';
    }
    
    return aiGeneratedText.substring(200);
  };

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

  const handleBetaSubmit = (e) => {
    e.preventDefault();
    if (betaEmail && betaEmail.includes('@')) {
      console.log('Beta signup:', betaEmail);
      setBetaSubmitted(true);
      setTimeout(() => {
        closeBetaModal();
      }, 3000);
    }
  };

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

  // Cleanup URLs on unmount
  useEffect(() => {
    return () => {
      uploadedPhotos.forEach(photo => {
        if (photo.preview) URL.revokeObjectURL(photo.preview);
      });
      if (uploadedLogo?.preview) URL.revokeObjectURL(uploadedLogo.preview);
    };
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      
      {/* HEADER */}
      <header className="bg-[#0A192F] shadow-xl sticky top-0 z-50 border-b border-[#C5A059]/20">
        <div className="max-w-7xl mx-auto px-6 py-5 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-[#C5A059] to-[#A68B4A] rounded-lg flex items-center justify-center">
              <FileText className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-white tracking-tight">Exposé-Profi</span>
          </div>
          <nav className="hidden md:flex space-x-8">
            <button onClick={() => scrollToSection('vorteile')} className="text-gray-300 hover:text-[#C5A059] transition-colors font-medium">
              Vorteile
            </button>
            <button onClick={() => scrollToSection('preise')} className="text-gray-300 hover:text-[#C5A059] transition-colors font-medium">
              Preise
            </button>
            <button onClick={openBetaModal} className="bg-[#C5A059] hover:bg-[#B39050] text-white px-6 py-2 rounded-lg font-semibold transition-all">
              Beta-Zugang
            </button>
          </nav>
        </div>
      </header>

      {/* HERO */}
      <section className="py-24 md:py-32 bg-gradient-to-b from-[#0A192F] to-[#112240] text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-96 h-96 bg-[#C5A059] rounded-full filter blur-3xl"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-[#C5A059] rounded-full filter blur-3xl"></div>
        </div>
        <div className="max-w-6xl mx-auto px-6 text-center relative z-10">
          <h1 className="text-5xl md:text-7xl font-bold mb-8 leading-tight">
            Exposés auf Knopfdruck –<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#C5A059] to-[#D4B068]">
              Mit KI-Bildanalyse
            </span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-300 mb-12 max-w-3xl mx-auto leading-relaxed">
            Die KI analysiert Ihre Fotos und erstellt verkaufsstarke Texte mit konkreten Details.
          </p>
          <button onClick={() => scrollToSection('generator')} className="bg-[#C5A059] hover:bg-[#B39050] text-white px-10 py-4 rounded-lg text-lg font-semibold transition-all transform hover:scale-105 shadow-2xl">
            Jetzt kostenlos testen
          </button>
        </div>
      </section>

      {/* GENERATOR */}
      <section id="generator" className="py-20 bg-gradient-to-b from-slate-50 to-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold text-[#0A192F] mb-4">Erstellen Sie Ihr erstes Exposé</h2>
            <p className="text-xl text-gray-600">KI analysiert Ihre Fotos automatisch</p>
          </div>
          
          <div className="grid lg:grid-cols-2 gap-10">
            {/* Left - Uploads */}
            <div className="space-y-6">
              {/* Logo Upload */}
              <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                <div className="flex items-center space-x-2 mb-4">
                  <Palette className="w-5 h-5 text-[#C5A059]" />
                  <h3 className="text-lg font-bold text-[#0A192F]">Ihr Logo (optional)</h3>
                </div>
                <input
                  ref={logoInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleLogoUpload}
                  className="hidden"
                />
                <div 
                  onClick={() => logoInputRef.current?.click()}
                  className="border-2 border-dashed border-[#C5A059]/50 rounded-xl p-6 hover:border-[#C5A059] transition-colors cursor-pointer"
                >
                  <div className="text-center">
                    {uploadedLogo ? (
                      <div className="space-y-3">
                        <img src={uploadedLogo.preview} alt="Logo" className="w-32 h-32 object-contain mx-auto rounded-lg" />
                        <p className="text-sm text-gray-700">{uploadedLogo.name}</p>
                        <button onClick={(e) => { e.stopPropagation(); removeLogo(); }} className="text-xs text-red-600 hover:text-red-700">
                          Entfernen
                        </button>
                      </div>
                    ) : (
                      <>
                        <div className="w-16 h-16 bg-gradient-to-br from-[#C5A059]/20 to-[#C5A059]/10 rounded-xl flex items-center justify-center mx-auto mb-3">
                          <Image className="w-8 h-8 text-[#C5A059]" />
                        </div>
                        <h4 className="text-base font-semibold text-[#0A192F] mb-2">Logo hochladen</h4>
                        <p className="text-sm text-gray-600">Klicken zum Auswählen</p>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Photo Upload mit Drag & Drop */}
              <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                <h3 className="text-lg font-bold text-[#0A192F] mb-4">Objektfotos</h3>
                <input
                  ref={photoInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={(e) => handlePhotoUpload(e.target.files)}
                  className="hidden"
                />
                <div
                  ref={dropZoneRef}
                  onDragEnter={handleDragEnter}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => photoInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-xl p-6 transition-all cursor-pointer ${
                    isDragging 
                      ? 'border-[#C5A059] bg-[#C5A059]/10' 
                      : 'border-[#C5A059]/50 hover:border-[#C5A059]'
                  }`}
                >
                  <div className="text-center">
                    <Upload className={`w-10 h-10 mx-auto mb-3 ${isDragging ? 'text-[#C5A059]' : 'text-gray-400'}`} />
                    <p className="text-sm font-semibold text-gray-700 mb-1">
                      {isDragging ? 'Dateien hier ablegen...' : 'Fotos hochladen'}
                    </p>
                    <p className="text-xs text-gray-500">Drag & Drop oder Klicken (max. 20 Fotos)</p>
                  </div>
                </div>
                
                {uploadedPhotos.length > 0 && (
                  <div className="mt-4">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm font-medium text-gray-700">
                        {uploadedPhotos.length} {uploadedPhotos.length === 1 ? 'Foto' : 'Fotos'}
                      </p>
                      <button onClick={() => setUploadedPhotos([])} className="text-xs text-red-600 hover:text-red-700">
                        Alle entfernen
                      </button>
                    </div>
                    <div className="grid grid-cols-4 gap-2 max-h-60 overflow-y-auto">
                      {uploadedPhotos.map((photo) => (
                        <div key={photo.id} className="relative group">
                          <img 
                            src={photo.preview} 
                            alt={photo.name}
                            className="w-full h-20 object-cover rounded-lg"
                          />
                          <button 
                            onClick={() => removePhoto(photo.id)} 
                            className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X className="w-3 h-3" />
                          </button>
                          <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-xs p-1 rounded-b-lg truncate opacity-0 group-hover:opacity-100 transition-opacity">
                            {photo.name}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Grundrisse */}
              <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                <h3 className="text-lg font-bold text-[#0A192F] mb-4">Grundrisse (optional)</h3>
                <input
                  ref={floorPlanInputRef}
                  type="file"
                  accept="image/*,application/pdf"
                  multiple
                  onChange={handleFloorPlanUpload}
                  className="hidden"
                />
                <div 
                  onClick={() => floorPlanInputRef.current?.click()}
                  className="border-2 border-dashed border-[#C5A059]/50 rounded-xl p-6 hover:border-[#C5A059] transition-colors cursor-pointer"
                >
                  <div className="text-center">
                    <FileInput className="w-10 h-10 text-[#C5A059] mx-auto mb-3" />
                    <p className="text-sm text-gray-600 mb-2">Grundrisse hochladen</p>
                    <p className="text-xs text-gray-500">PDF, JPG, PNG</p>
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
                        <button onClick={() => removeFloorPlan(plan.id)} className="text-red-600 hover:text-red-700">
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Right - Form */}
            <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
              <h3 className="text-lg font-bold text-[#0A192F] mb-6">Objektdaten</h3>
              
              <div className="space-y-5">
                {/* Objekttyp */}
                <div>
                  <label className="block text-sm font-semibold text-[#0A192F] mb-2 flex items-center space-x-2">
                    <Building2 className="w-4 h-4 text-[#C5A059]" />
                    <span>Objekttyp *</span>
                  </label>
                  <select
                    name="objekttyp"
                    value={propertyData.objekttyp}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-[#C5A059] focus:ring-2 focus:ring-[#C5A059]/20 outline-none transition-all"
                  >
                    <option value="">Bitte wählen</option>
                    <option value="Haus">Haus</option>
                    <option value="Wohnung">Wohnung</option>
                    <option value="Loft">Loft</option>
                    <option value="Penthouse">Penthouse</option>
                    <option value="Gewerbe">Gewerbe</option>
                  </select>
                </div>

                {/* Vermarktungsart */}
                <div>
                  <label className="block text-sm font-semibold text-[#0A192F] mb-2 flex items-center space-x-2">
                    <Key className="w-4 h-4 text-[#C5A059]" />
                    <span>Vermarktungsart *</span>
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setPropertyData(prev => ({ ...prev, vermarktungsart: 'Verkauf' }))}
                      className={`px-4 py-3 rounded-lg font-medium transition-all ${
                        propertyData.vermarktungsart === 'Verkauf'
                          ? 'bg-[#C5A059] text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      Verkauf
                    </button>
                    <button
                      type="button"
                      onClick={() => setPropertyData(prev => ({ ...prev, vermarktungsart: 'Vermietung' }))}
                      className={`px-4 py-3 rounded-lg font-medium transition-all ${
                        propertyData.vermarktungsart === 'Vermietung'
                          ? 'bg-[#C5A059] text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      Vermietung
                    </button>
                  </div>
                </div>

                {/* Lage */}
                <div>
                  <label className="block text-sm font-semibold text-[#0A192F] mb-2 flex items-center space-x-2">
                    <MapPin className="w-4 h-4 text-[#C5A059]" />
                    <span>Lage</span>
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    <input
                      type="text"
                      inputMode="numeric"
                      name="plz"
                      value={propertyData.plz}
                      onChange={(e) => handleNumericInput(e, 'plz')}
                      placeholder="PLZ"
                      maxLength="5"
                      className="px-4 py-3 rounded-lg border border-gray-200 focus:border-[#C5A059] focus:ring-2 focus:ring-[#C5A059]/20 outline-none transition-all"
                    />
                    <input
                      type="text"
                      name="ort"
                      value={propertyData.ort}
                      onChange={handleInputChange}
                      placeholder="Ort"
                      className="col-span-2 px-4 py-3 rounded-lg border border-gray-200 focus:border-[#C5A059] focus:ring-2 focus:ring-[#C5A059]/20 outline-none transition-all"
                    />
                  </div>
                </div>

                {/* Zustand */}
                <div>
                  <label className="block text-sm font-semibold text-[#0A192F] mb-2 flex items-center space-x-2">
                    <Home className="w-4 h-4 text-[#C5A059]" />
                    <span>Objektzustand</span>
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {['Neuwertig', 'Gepflegt', 'Sanierungsbedürftig'].map((zustand) => (
                      <button
                        key={zustand}
                        type="button"
                        onClick={() => setPropertyData(prev => ({ ...prev, zustand }))}
                        className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                          propertyData.zustand === zustand
                            ? 'bg-[#C5A059] text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {zustand}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Preis */}
                <div>
                  <label className="block text-sm font-semibold text-[#0A192F] mb-2 flex items-center space-x-2">
                    <Euro className="w-4 h-4 text-[#C5A059]" />
                    <span>
                      {propertyData.vermarktungsart === 'Verkauf' ? 'Kaufpreis' : 
                       propertyData.vermarktungsart === 'Vermietung' ? 'Kaltmiete' : 'Preis'}
                    </span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      inputMode="numeric"
                      name="preis"
                      value={propertyData.preis}
                      onChange={(e) => handleNumericInput(e, 'preis')}
                      placeholder="z.B. 350000"
                      className="w-full px-4 py-3 pr-12 rounded-lg border border-gray-200 focus:border-[#C5A059] focus:ring-2 focus:ring-[#C5A059]/20 outline-none transition-all"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 font-medium">€</span>
                  </div>
                </div>

                <div className="border-t border-gray-200 pt-5"></div>

                {/* Wohnfläche & Zimmer */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-[#0A192F] mb-2">Wohnfläche (m²) *</label>
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
                    <label className="block text-sm font-semibold text-[#0A192F] mb-2">Zimmer *</label>
                    <input
                      type="text"
                      inputMode="decimal"
                      name="zimmer"
                      value={propertyData.zimmer}
                      onChange={(e) => handleNumericInput(e, 'zimmer', true)}
                      placeholder="z.B. 3"
                      className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-[#C5A059] focus:ring-2 focus:ring-[#C5A059]/20 outline-none transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-[#0A192F] mb-2">Baujahr (optional)</label>
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

                {/* Ausstattung */}
                <div>
                  <label className="block text-sm font-semibold text-[#0A192F] mb-3">Ausstattung</label>
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

                {/* Energieausweis */}
                <div>
                  <label className="block text-sm font-semibold text-[#0A192F] mb-3">Energieausweis (GEG-Pflicht)</label>
                  
                  <input
                    ref={energyInputRef}
                    type="file"
                    accept="image/*,application/pdf"
                    onChange={handleEnergyUpload}
                    className="hidden"
                  />
                  
                  <button
                    type="button"
                    onClick={() => energyInputRef.current?.click()}
                    disabled={energyUploadStatus === 'uploading' || energyUploadStatus === 'extracting'}
                    className={`w-full mb-4 px-4 py-3 rounded-lg text-sm font-medium transition-all flex items-center justify-center ${
                      energyUploadStatus === 'complete'
                        ? 'bg-emerald-50 border-2 border-emerald-500 text-emerald-700'
                        : energyUploadStatus === 'error'
                        ? 'bg-red-50 border-2 border-red-500 text-red-700'
                        : 'bg-slate-50 border-2 border-dashed border-[#C5A059] text-[#0A192F] hover:bg-slate-100'
                    }`}
                  >
                    {energyUploadStatus === 'idle' && (<><Upload className="w-4 h-4 mr-2" />Energieausweis hochladen & analysieren</>)}
                    {energyUploadStatus === 'uploading' && (<><Loader2 className="w-4 h-4 mr-2 animate-spin" />Wird hochgeladen...</>)}
                    {energyUploadStatus === 'extracting' && (<><Loader2 className="w-4 h-4 mr-2 animate-spin" />KI extrahiert Daten...</>)}
                    {energyUploadStatus === 'complete' && (<><Check className="w-4 h-4 mr-2" />Daten erfolgreich extrahiert</>)}
                    {energyUploadStatus === 'error' && (<><X className="w-4 h-4 mr-2" />Fehler - Bitte manuell eingeben</>)}
                  </button>

                  <div className="grid grid-cols-2 gap-3">
                    <select
                      name="effizienzklasse"
                      value={propertyData.effizienzklasse}
                      onChange={handleInputChange}
                      className="px-3 py-2 rounded-lg border border-gray-200 focus:border-[#C5A059] focus:ring-2 focus:ring-[#C5A059]/20 outline-none text-sm"
                    >
                      <option value="">Klasse</option>
                      {['A+', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'].map(k => (
                        <option key={k} value={k}>{k}</option>
                      ))}
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

                <button 
                  onClick={handleGenerateExpose}
                  disabled={!isFormValid() || isGenerating}
                  className={`w-full px-6 py-4 rounded-lg text-lg font-bold transition-all mt-6 ${
                    isFormValid() && !isGenerating
                      ? 'bg-gradient-to-r from-[#C5A059] to-[#A68B4A] hover:from-[#B39050] hover:to-[#957A3F] text-white transform hover:scale-105 shadow-xl cursor-pointer'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="w-5 h-5 inline mr-2 animate-spin" />
                      KI analysiert Fotos...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5 inline mr-2" />
                      Exposé generieren
                    </>
                  )}
                </button>

                {isGenerating && generationProgress > 0 && (
                  <div className="mt-3">
                    <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                      <div 
                        className="bg-gradient-to-r from-[#C5A059] to-[#A68B4A] h-2 transition-all duration-300"
                        style={{ width: `${generationProgress}%` }}
                      ></div>
                    </div>
                    <p className="text-xs text-center text-gray-600 mt-2">
                      {uploadedPhotos.length > 0 ? `Analysiere ${uploadedPhotos.length} Foto${uploadedPhotos.length > 1 ? 's' : ''}...` : 'Generiere Text...'}
                    </p>
                  </div>
                )}

                {!isFormValid() && !isGenerating && (
                  <p className="text-xs text-red-600 text-center">Bitte füllen Sie alle Pflichtfelder (*) aus</p>
                )}
              </div>
            </div>
          </div>

          {/* TEXT PREVIEW MIT TEASER */}
          {showPreview && (
            <div className="mt-10 bg-white rounded-2xl p-8 shadow-xl border border-gray-100 relative">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-2">
                  <Edit3 className="w-5 h-5 text-[#C5A059]" />
                  <h3 className="text-xl font-bold text-[#0A192F]">Text-Vorschau & Bearbeitung</h3>
                  {uploadedPhotos.length > 0 && !isGenerating && (
                    <span className="text-sm text-green-600 bg-green-50 px-3 py-1 rounded-full">
                      {uploadedPhotos.length} {uploadedPhotos.length === 1 ? 'Foto' : 'Fotos'} analysiert
                    </span>
                  )}
                </div>
                {isUnlocked && (
                  <button className="bg-[#0A192F] text-white px-6 py-3 rounded-lg font-semibold hover:bg-opacity-90 transition-all flex items-center space-x-2">
                    <Download className="w-5 h-5" />
                    <span>Als PDF exportieren</span>
                  </button>
                )}
              </div>
              
              <div className="relative">
                <textarea
                  value={getTeaserText()}
                  onChange={(e) => isUnlocked && setAiGeneratedText(e.target.value)}
                  disabled={!isUnlocked || isGenerating}
                  className="w-full h-96 px-6 py-4 rounded-xl border border-gray-200 focus:border-[#C5A059] focus:ring-2 focus:ring-[#C5A059]/20 outline-none font-sans text-gray-800 leading-relaxed resize-none"
                  placeholder="Hier erscheint der von der KI generierte Exposé-Text..."
                />
                
                {/* BLUR OVERLAY */}
                {!isUnlocked && getBlurredText() && !isGenerating && (
                  <div className="relative -mt-48 h-48">
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent to-white/95 backdrop-blur-md"></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="bg-white rounded-2xl shadow-2xl p-8 text-center max-w-md border-2 border-[#C5A059]">
                        <div className="w-16 h-16 bg-gradient-to-br from-[#C5A059] to-[#A68B4A] rounded-full flex items-center justify-center mx-auto mb-4">
                          <Lock className="w-8 h-8 text-white" />
                        </div>
                        <h4 className="text-2xl font-bold text-[#0A192F] mb-2">Vollversion freischalten</h4>
                        <p className="text-gray-600 mb-6">
                          Schalten Sie das vollständige Exposé frei.
                        </p>
                        <button
                          onClick={handleUnlock}
                          className="bg-gradient-to-r from-[#C5A059] to-[#A68B4A] hover:from-[#B39050] hover:to-[#957A3F] text-white px-8 py-3 rounded-lg font-bold transition-all transform hover:scale-105 shadow-lg flex items-center space-x-2 mx-auto"
                        >
                          <Unlock className="w-5 h-5" />
                          <span>Jetzt freischalten</span>
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              
              {isUnlocked && (
                <p className="mt-3 text-sm text-gray-600">
                  <Edit3 className="w-4 h-4 inline mr-1" />
                  Sie können den Text jederzeit anpassen.
                </p>
              )}
            </div>
          )}
        </div>
      </section>

      {/* BENEFITS */}
      <section id="vorteile" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-[#0A192F] mb-4">Warum Exposé-Profi?</h2>
            <p className="text-xl text-gray-600">KI-Bildanalyse für verkaufsstarke Texte</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-gradient-to-br from-slate-50 to-white p-8 rounded-2xl border border-gray-100 hover:shadow-xl transition-all">
              <div className="w-16 h-16 bg-gradient-to-br from-[#C5A059] to-[#A68B4A] rounded-xl flex items-center justify-center mb-6">
                <Clock className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-[#0A192F] mb-4">90% Zeitersparnis</h3>
              <p className="text-gray-600 leading-relaxed">KI analysiert Ihre Fotos automatisch und erstellt professionelle Texte in Sekunden.</p>
            </div>

            <div className="bg-gradient-to-br from-slate-50 to-white p-8 rounded-2xl border border-gray-100 hover:shadow-xl transition-all">
              <div className="w-16 h-16 bg-gradient-to-br from-[#C5A059] to-[#A68B4A] rounded-xl flex items-center justify-center mb-6">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-[#0A192F] mb-4">Vision-KI</h3>
              <p className="text-gray-600 leading-relaxed">GPT-4o analysiert Materialien, Lichtverhältnisse und Raumaufteilung.</p>
            </div>

            <div className="bg-gradient-to-br from-slate-50 to-white p-8 rounded-2xl border border-gray-100 hover:shadow-xl transition-all">
              <div className="w-16 h-16 bg-gradient-to-br from-[#C5A059] to-[#A68B4A] rounded-xl flex items-center justify-center mb-6">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-[#0A192F] mb-4">OCR für Energieausweis</h3>
              <p className="text-gray-600 leading-relaxed">Automatische Extraktion aller GEG-relevanten Daten aus Ihrem Energieausweis.</p>
            </div>
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section id="preise" className="py-20 bg-gradient-to-b from-slate-50 to-white">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-[#0A192F] mb-4">Transparente Preise</h2>
            <p className="text-xl text-gray-600">Mit KI-Bildanalyse inklusive</p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            <div className="bg-white rounded-2xl p-8 border-2 border-gray-200 hover:border-[#C5A059] transition-all hover:shadow-xl">
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-[#0A192F] mb-2">Starter</h3>
                <p className="text-gray-600 mb-6">Einzelne Exposés</p>
                <div className="mb-6">
                  <span className="text-5xl font-bold text-[#0A192F]">29€</span>
                  <span className="text-gray-600 ml-2">pro Exposé</span>
                </div>
              </div>
              
              <ul className="space-y-4 mb-8">
                <li className="flex items-start">
                  <Check className="w-5 h-5 text-green-600 mr-3 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">KI-Bildanalyse (bis zu 20 Fotos)</span>
                </li>
                <li className="flex items-start">
                  <Check className="w-5 h-5 text-green-600 mr-3 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">Energieausweis-OCR</span>
                </li>
                <li className="flex items-start">
                  <Check className="w-5 h-5 text-green-600 mr-3 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">GEG-konforme Texte</span>
                </li>
                <li className="flex items-start text-gray-400">
                  <X className="w-5 h-5 mr-3 flex-shrink-0 mt-0.5" />
                  <span>White-Label Branding</span>
                </li>
              </ul>
              
              <button onClick={openBetaModal} className="w-full bg-gray-900 hover:bg-gray-800 text-white py-4 rounded-lg font-semibold transition-all">
                Beta-Zugang anfordern
              </button>
            </div>

            <div className="bg-gradient-to-br from-[#0A192F] to-[#112240] rounded-2xl p-8 border-2 border-[#C5A059] relative overflow-hidden shadow-2xl">
              <div className="absolute top-4 right-4 bg-[#C5A059] text-white px-4 py-1 rounded-full text-sm font-bold">BELIEBT</div>
              
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-white mb-2">Pro-Abo</h3>
                <p className="text-gray-300 mb-6">Unbegrenzt</p>
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
                  <span className="text-white">KI-Bildanalyse (unbegrenzt)</span>
                </li>
                <li className="flex items-start">
                  <Check className="w-5 h-5 text-[#C5A059] mr-3 flex-shrink-0 mt-0.5" />
                  <span className="text-white">Energieausweis-OCR</span>
                </li>
                <li className="flex items-start">
                  <Check className="w-5 h-5 text-[#C5A059] mr-3 flex-shrink-0 mt-0.5" />
                  <span className="text-white font-semibold">White-Label Branding</span>
                </li>
                <li className="flex items-start">
                  <Check className="w-5 h-5 text-[#C5A059] mr-3 flex-shrink-0 mt-0.5" />
                  <span className="text-white">Prioritäts-Support</span>
                </li>
              </ul>
              
              <button onClick={openBetaModal} className="w-full bg-gradient-to-r from-[#C5A059] to-[#A68B4A] hover:from-[#B39050] hover:to-[#957A3F] text-white py-4 rounded-lg font-bold transition-all transform hover:scale-105 shadow-lg">
                Beta-Zugang anfordern
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
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
                KI-gestützte Exposé-Erstellung mit Bildanalyse.
              </p>
            </div>

            <div>
              <h4 className="text-sm font-bold text-white mb-4 uppercase tracking-wider">Produkt</h4>
              <ul className="space-y-3">
                <li><button onClick={() => scrollToSection('vorteile')} className="text-gray-400 hover:text-[#C5A059] transition-colors">Vorteile</button></li>
                <li><button onClick={() => scrollToSection('preise')} className="text-gray-400 hover:text-[#C5A059] transition-colors">Preise</button></li>
              </ul>
            </div>

            <div>
              <h4 className="text-sm font-bold text-white mb-4 uppercase tracking-wider">Rechtliches</h4>
              <ul className="space-y-3">
                <li><button onClick={() => openLegalModal('impressum')} className="text-gray-400 hover:text-[#C5A059] transition-colors text-left">Impressum</button></li>
                <li><button onClick={() => openLegalModal('datenschutz')} className="text-gray-400 hover:text-[#C5A059] transition-colors text-left">Datenschutz</button></li>
                <li><button onClick={() => openLegalModal('agb')} className="text-gray-400 hover:text-[#C5A059] transition-colors text-left">AGB</button></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-8">
            <p className="text-gray-400 text-sm text-center">© 2025 Exposé-Profi. Alle Rechte vorbehalten.</p>
          </div>
        </div>
      </footer>

      {/* MODALS */}
      {legalContent && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={closeLegalModal}>
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full my-8 relative" onClick={(e) => e.stopPropagation()}>
            <div className="sticky top-0 bg-white border-b border-gray-200 px-8 py-6 rounded-t-2xl flex items-center justify-between">
              <h2 className="text-3xl font-bold text-[#0A192F]">{legalTexts[legalContent].title}</h2>
              <button onClick={closeLegalModal} className="w-10 h-10 flex items-center justify-center rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors">
                <X className="w-6 h-6 text-gray-600" />
              </button>
            </div>
            
            <div className="px-8 py-6 max-h-[70vh] overflow-y-auto">
              <div className="prose prose-slate max-w-none">
                {legalTexts[legalContent].sections.map((section, index) => (
                  <div key={index} className="mb-6">
                    <h3 className="text-xl font-bold text-[#0A192F] mb-4">{section.heading}</h3>
                    <div className="text-gray-700">
                      {typeof section.content === 'string' ? <p>{section.content}</p> : section.content}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-8 py-4 rounded-b-2xl">
              <button onClick={closeLegalModal} className="w-full bg-[#0A192F] hover:bg-[#0A192F]/90 text-white py-3 rounded-lg font-semibold transition-all">
                Schließen
              </button>
            </div>
          </div>
        </div>
      )}

      {showBetaModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={closeBetaModal}>
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 relative" onClick={(e) => e.stopPropagation()}>
            <button onClick={closeBetaModal} className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors">
              <X className="w-5 h-5 text-gray-600" />
            </button>

            {!betaSubmitted ? (
              <>
                <div className="text-center mb-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-[#C5A059] to-[#A68B4A] rounded-full flex items-center justify-center mx-auto mb-4">
                    <Sparkles className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-[#0A192F] mb-2">Beta-Zugang anfordern</h3>
                  <p className="text-gray-600">
                    Seien Sie einer der Ersten, die unsere KI-Bildanalyse nutzen.
                  </p>
                </div>

                <form onSubmit={handleBetaSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-[#0A192F] mb-2">E-Mail-Adresse *</label>
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
                <h3 className="text-2xl font-bold text-[#0A192F] mb-2">Vielen Dank!</h3>
                <p className="text-gray-600">
                  Wir benachrichtigen Sie sobald Ihr Zugang bereit ist.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
