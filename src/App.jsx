import React, { useState } from 'react';
import { Clock, TrendingUp, Award, Upload, Sparkles, FileText, Image, FileInput, Home, X, Check } from 'lucide-react';

export default function ExposeProfLanding() {
  const [activeSection, setActiveSection] = useState('');
  const [energyUploadStatus, setEnergyUploadStatus] = useState('idle');
  const [uploadedPhotos, setUploadedPhotos] = useState([]);
  const [uploadedFloorPlans, setUploadedFloorPlans] = useState([]);
  
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
            <button
              onClick={() => scrollToSection('vorteile')}
              className="text-[#0A2342] hover:text-[#C5A060] transition-colors font-medium"
            >
              Vorteile
            </button>
            <button
              onClick={() => scrollToSection('kontakt')}
              className="text-[#0A2342] hover:text-[#C5A060] transition-colors font-medium"
            >
              Kontakt
            </button>
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

      {/* Upload & Form Section */}
      <section className="py-20 bg-white/40 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-3xl md:text-4xl font-bold text-[#0A2342] text-center mb-12">
            Erstellen Sie Ihr erstes Exposé
          </h2>
          
          <div className="grid md:grid-cols-2 gap-8">
            {/* Upload Area */}
            <div className="space-y-6">
              <h3 className="text-xl font-bold text-[#0A2342] mb-4">1. Medien hochladen</h3>
              
              {/* Objektfotos Upload */}
              <div className="bg-white/80 backdrop-blur-md rounded-xl p-6 border border-white/40 shadow-lg">
                <div className="border-2 border-dashed border-[#C5A060] rounded-lg p-6 hover:bg-[#F4F7F6]/50 transition-colors cursor-pointer">
                  <div className="text-center">
                    <Image className="w-10 h-10 text-[#C5A060] mx-auto mb-3" />
                    <h4 className="text-lg font-semibold text-[#0A2342] mb-2">Objektfotos</h4>
                    <p className="text-gray-600 text-sm mb-4">
                      Bis zu 20 Fotos hochladen<br />
                      (JPG, PNG)
                    </p>
                    <button 
                      onClick={handlePhotoUpload}
                      className="bg-[#0A2342] text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-opacity-90 transition-all">
                      Fotos auswählen
                    </button>
                  </div>
                </div>
                
                {/* Photo Gallery Preview */}
                {uploadedPhotos.length > 0 && (
                  <div className="mt-4">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm font-medium text-[#2D3748]">
                        {uploadedPhotos.length} {uploadedPhotos.length === 1 ? 'Foto' : 'Fotos'} hochgeladen
                      </p>
                      <button 
                        onClick={() => setUploadedPhotos([])}
                        className="text-xs text-red-600 hover:text-red-700">
                        Alle entfernen
                      </button>
                    </div>
                    <div className="grid grid-cols-4 gap-2 max-h-48 overflow-y-auto">
                      {uploadedPhotos.map((photo) => (
                        <div key={photo.id} className="relative group">
                          <img 
                            src={photo.url} 
                            alt="Upload" 
                            className="w-full h-20 object-cover rounded-lg"
                          />
                          <button
                            onClick={() => removePhoto(photo.id)}
                            className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Grundrisse Upload */}
              <div className="bg-white/80 backdrop-blur-md rounded-xl p-6 border border-white/40 shadow-lg">
                <div className="border-2 border-dashed border-[#C5A060] rounded-lg p-6 hover:bg-[#F4F7F6]/50 transition-colors cursor-pointer">
                  <div className="text-center">
                    <FileInput className="w-10 h-10 text-[#C5A060] mx-auto mb-3" />
                    <h4 className="text-lg font-semibold text-[#0A2342] mb-2">Grundrisse</h4>
                    <p className="text-gray-600 text-sm mb-4">
                      Mehrere Stockwerke möglich<br />
                      (PDF, JPG, PNG)
                    </p>
                    <button 
                      onClick={handleFloorPlanUpload}
                      className="bg-[#0A2342] text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-opacity-90 transition-all">
                      Grundriss hinzufügen
                    </button>
                  </div>
                </div>
                
                {/* Floor Plans List */}
                {uploadedFloorPlans.length > 0 && (
                  <div className="mt-4 space-y-2">
                    {uploadedFloorPlans.map((plan) => (
                      <div key={plan.id} className="flex items-center justify-between bg-[#F4F7F6] px-3 py-2 rounded-lg">
                        <div className="flex items-center space-x-2">
                          <FileInput className="w-4 h-4 text-[#C5A060]" />
                          <span className="text-sm text-[#2D3748]">{plan.name}</span>
                        </div>
                        <button
                          onClick={() => removeFloorPlan(plan.id)}
                          className="text-red-600 hover:text-red-700">
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Quick Form */}
            <div className="bg-white/80 backdrop-blur-md rounded-xl p-8 border border-white/40 shadow-lg">
              <h3 className="text-xl font-bold text-[#0A2342] mb-6">2. Eckdaten eingeben</h3>
              
              <div className="space-y-5">
                {/* Wohnfläche */}
                <div>
                  <label className="block text-sm font-semibold text-[#0A2342] mb-2">
                    Wohnfläche (m²) *
                  </label>
                  <input
                    type="text"
                    inputMode="numeric"
                    name="wohnflaeche"
                    value={propertyData.wohnflaeche}
                    onChange={handleInputChange}
                    placeholder="z.B. 85"
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-[#C5A060] focus:ring-2 focus:ring-[#C5A060] focus:ring-opacity-20 outline-none transition-all [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  />
                </div>

                {/* Zimmeranzahl */}
                <div>
                  <label className="block text-sm font-semibold text-[#0A2342] mb-2">
                    Anzahl Zimmer *
                  </label>
                  <input
                    type="text"
                    inputMode="decimal"
                    name="zimmer"
                    value={propertyData.zimmer}
                    onChange={handleInputChange}
                    placeholder="z.B. 3 oder 3.5"
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-[#C5A060] focus:ring-2 focus:ring-[#C5A060] focus:ring-opacity-20 outline-none transition-all [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  />
                </div>

                {/* Baujahr */}
                <div>
                  <label className="block text-sm font-semibold text-[#0A2342] mb-2">
                    Baujahr (optional)
                  </label>
                  <input
                    type="text"
                    inputMode="numeric"
                    name="baujahr"
                    value={propertyData.baujahr}
                    onChange={handleInputChange}
                    placeholder="z.B. 2015"
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-[#C5A060] focus:ring-2 focus:ring-[#C5A060] focus:ring-opacity-20 outline-none transition-all [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  />
                </div>

                {/* Divider */}
                <div className="border-t border-gray-300 my-6"></div>

                {/* Besonderheiten - Kategorisiert */}
                <div>
                  <label className="block text-sm font-semibold text-[#0A2342] mb-4">
                    Besonderheiten & Ausstattung
                  </label>
                  
                  <div className="space-y-4">
                    {/* Außenbereich */}
                    <div>
                      <h5 className="text-xs font-semibold text-[#2D3748] mb-2 uppercase tracking-wide">Außenbereich</h5>
                      <div className="grid grid-cols-2 gap-2">
                        {featureCategories.aussenbereich.map((feature) => (
                          <label key={feature} className="flex items-center space-x-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={propertyData.aussenbereich.includes(feature)}
                              onChange={() => toggleFeature('aussenbereich', feature)}
                              className="w-4 h-4 text-[#C5A060] border-gray-300 rounded focus:ring-[#C5A060]"
                            />
                            <span className="text-sm text-[#2D3748]">{feature}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* Innenraum */}
                    <div>
                      <h5 className="text-xs font-semibold text-[#2D3748] mb-2 uppercase tracking-wide">Innenraum</h5>
                      <div className="grid grid-cols-2 gap-2">
                        {featureCategories.innenraum.map((feature) => (
                          <label key={feature} className="flex items-center space-x-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={propertyData.innenraum.includes(feature)}
                              onChange={() => toggleFeature('innenraum', feature)}
                              className="w-4 h-4 text-[#C5A060] border-gray-300 rounded focus:ring-[#C5A060]"
                            />
                            <span className="text-sm text-[#2D3748]">{feature}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* Parken & Keller */}
                    <div>
                      <h5 className="text-xs font-semibold text-[#2D3748] mb-2 uppercase tracking-wide">Parken & Keller</h5>
                      <div className="grid grid-cols-2 gap-2">
                        {featureCategories.parkenKeller.map((feature) => (
                          <label key={feature} className="flex items-center space-x-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={propertyData.parkenKeller.includes(feature)}
                              onChange={() => toggleFeature('parkenKeller', feature)}
                              className="w-4 h-4 text-[#C5A060] border-gray-300 rounded focus:ring-[#C5A060]"
                            />
                            <span className="text-sm text-[#2D3748]">{feature}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* Technik & Komfort */}
                    <div>
                      <h5 className="text-xs font-semibold text-[#2D3748] mb-2 uppercase tracking-wide">Technik & Komfort</h5>
                      <div className="grid grid-cols-2 gap-2">
                        {featureCategories.technikKomfort.map((feature) => (
                          <label key={feature} className="flex items-center space-x-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={propertyData.technikKomfort.includes(feature)}
                              onChange={() => toggleFeature('technikKomfort', feature)}
                              className="w-4 h-4 text-[#C5A060] border-gray-300 rounded focus:ring-[#C5A060]"
                            />
                            <span className="text-sm text-[#2D3748]">{feature}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* Freitext für weitere Besonderheiten */}
                    <div>
                      <label className="block text-xs font-semibold text-[#2D3748] mb-2">
                        Weitere Besonderheiten (mit Komma trennen)
                      </label>
                      <input
                        type="text"
                        name="weiteresBesonderheiten"
                        value={propertyData.weiteresBesonderheiten}
                        onChange={handleInputChange}
                        placeholder="z.B. Neubau, Erstbezug, Denkmalschutz"
                        className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:border-[#C5A060] focus:ring-2 focus:ring-[#C5A060] focus:ring-opacity-20 outline-none transition-all text-sm"
                      />
                    </div>
                  </div>
                </div>

                {/* Divider */}
                <div className="border-t border-gray-300 my-6"></div>

                {/* Energieausweis Section */}
                <div>
                  <label className="block text-sm font-semibold text-[#0A2342] mb-3">
                    Energieausweis (Pflichtangaben gemäß GEG) *
                  </label>
                  
                  {/* Energy Certificate Upload Button */}
                  <button
                    type="button"
                    onClick={handleEnergyUpload}
                    disabled={energyUploadStatus === 'uploading' || energyUploadStatus === 'extracting'}
                    className={`w-full mb-4 px-4 py-3 rounded-lg text-sm font-medium transition-all flex items-center justify-center ${
                      energyUploadStatus === 'complete'
                        ? 'bg-green-50 border-2 border-green-500 text-green-700'
                        : 'bg-white border-2 border-dashed border-[#C5A060] text-[#0A2342] hover:bg-[#F4F7F6]'
                    }`}
                  >
                    {energyUploadStatus === 'idle' && (
                      <>
                        <Upload className="w-4 h-4 mr-2" />
                        Energieausweis hochladen (Foto oder PDF)
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

                  {/* Energy Certificate Fields */}
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      {/* Ausweistyp */}
                      <div>
                        <label className="block text-xs font-medium text-[#2D3748] mb-1">
                          Ausweistyp
                        </label>
                        <select
                          name="ausweistyp"
                          value={propertyData.ausweistyp}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:border-[#C5A060] focus:ring-2 focus:ring-[#C5A060] focus:ring-opacity-20 outline-none transition-all text-sm"
                        >
                          <option value="">Auswählen</option>
                          <option value="Bedarfsausweis">Bedarfsausweis</option>
                          <option value="Verbrauchsausweis">Verbrauchsausweis</option>
                        </select>
                      </div>

                      {/* Effizienzklasse */}
                      <div>
                        <label className="block text-xs font-medium text-[#2D3748] mb-1">
                          Effizienzklasse
                        </label>
                        <select
                          name="effizienzklasse"
                          value={propertyData.effizienzklasse}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:border-[#C5A060] focus:ring-2 focus:ring-[#C5A060] focus:ring-opacity-20 outline-none transition-all text-sm"
                        >
                          <option value="">Auswählen</option>
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
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      {/* Energiebedarf/-verbrauch */}
                      <div>
                        <label className="block text-xs font-medium text-[#2D3748] mb-1">
                          Endenergie (kWh/m²a)
                        </label>
                        <input
                          type="text"
                          inputMode="numeric"
                          name="energiebedarf"
                          value={propertyData.energiebedarf}
                          onChange={handleInputChange}
                          placeholder="z.B. 85"
                          className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:border-[#C5A060] focus:ring-2 focus:ring-[#C5A060] focus:ring-opacity-20 outline-none transition-all text-sm [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        />
                      </div>

                      {/* Energieträger */}
                      <div>
                        <label className="block text-xs font-medium text-[#2D3748] mb-1">
                          Energieträger
                        </label>
                        <input
                          type="text"
                          name="energietraeger"
                          value={propertyData.energietraeger}
                          onChange={handleInputChange}
                          placeholder="z.B. Gas"
                          className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:border-[#C5A060] focus:ring-2 focus:ring-[#C5A060] focus:ring-opacity-20 outline-none transition-all text-sm"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Submit Button */}
                <button className="w-full bg-[#C5A060] hover:bg-[#B39050] text-white px-6 py-4 rounded-lg text-lg font-semibold transition-all transform hover:scale-105 shadow-lg mt-6">
                  Exposé generieren
                </button>

                {/* Legal Notice */}
                <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                  <p className="text-xs text-[#2D3748] leading-relaxed">
                    <strong>Rechtlicher Hinweis:</strong> Die KI erstellt einen Entwurf. Der Makler ist gemäß GEG zur Endkontrolle aller Pflichtangaben verpflichtet.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Vorteile Section */}
      <section id="vorteile" className="py-20 bg-gradient-to-b from-white/40 to-transparent">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-3xl md:text-4xl font-bold text-[#0A2342] text-center mb-16">
            Ihre Vorteile mit Exposé-Profi
          </h2>
          <div className="grid md:grid-cols-3 gap-10">
            {/* Karte 1 */}
            <div className="bg-white/80 backdrop-blur-md p-8 rounded-xl hover:shadow-xl transition-shadow border border-white/40">
              <div className="w-16 h-16 bg-[#C5A060] rounded-full flex items-center justify-center mb-6">
                <Clock className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-[#0A2342] mb-4">Zeitersparnis</h3>
              <p className="text-[#2D3748] leading-relaxed">
                Reduzieren Sie den Zeitaufwand für die Exposé-Erstellung um bis zu 90%. Mehr Zeit für Besichtigungen und Verkaufsgespräche.
              </p>
            </div>

            {/* Karte 2 */}
            <div className="bg-white/80 backdrop-blur-md p-8 rounded-xl hover:shadow-xl transition-shadow border border-white/40">
              <div className="w-16 h-16 bg-[#C5A060] rounded-full flex items-center justify-center mb-6">
                <TrendingUp className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-[#0A2342] mb-4">Mehr Umsatz</h3>
              <p className="text-[#2D3748] leading-relaxed">
                Professionelle Exposés verkaufen sich schneller. Steigern Sie Ihre Abschlussrate und bearbeiten Sie mehr Objekte parallel.
              </p>
            </div>

            {/* Karte 3 */}
            <div className="bg-white/80 backdrop-blur-md p-8 rounded-xl hover:shadow-xl transition-shadow border border-white/40">
              <div className="w-16 h-16 bg-[#C5A060] rounded-full flex items-center justify-center mb-6">
                <Award className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-[#0A2342] mb-4">Profi-Qualität</h3>
              <p className="text-[#2D3748] leading-relaxed">
                KI-generierte Texte auf höchstem Niveau. Emotionale Beschreibungen, die Kaufinteressenten überzeugen.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* So funktioniert's Section */}
      <section className="py-20 bg-white/60 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-3xl md:text-4xl font-bold text-[#0A2342] text-center mb-16">
            So funktioniert's
          </h2>
          <div className="grid md:grid-cols-3 gap-12">
            {/* Schritt 1 */}
            <div className="text-center">
              <div className="w-20 h-20 bg-[#C5A060] rounded-full flex items-center justify-center mx-auto mb-6">
                <Upload className="w-10 h-10 text-white" />
              </div>
              <div className="w-12 h-12 bg-[#0A2342] rounded-full flex items-center justify-center mx-auto mb-4 text-white font-bold text-xl">
                1
              </div>
              <h3 className="text-xl font-bold text-[#0A2342] mb-3">Bilder & Grundriss hochladen</h3>
              <p className="text-[#2D3748]">
                Laden Sie Ihre Objektfotos und optional den Grundriss hoch. Unsere KI analysiert alle visuellen Details.
              </p>
            </div>

            {/* Schritt 2 */}
            <div className="text-center">
              <div className="w-20 h-20 bg-[#C5A060] rounded-full flex items-center justify-center mx-auto mb-6">
                <Home className="w-10 h-10 text-white" />
              </div>
              <div className="w-12 h-12 bg-[#0A2342] rounded-full flex items-center justify-center mx-auto mb-4 text-white font-bold text-xl">
                2
              </div>
              <h3 className="text-xl font-bold text-[#0A2342] mb-3">Eckdaten eingeben</h3>
              <p className="text-[#2D3748]">
                Ergänzen Sie die wichtigsten Fakten: Wohnfläche, Zimmeranzahl und Besonderheiten Ihrer Immobilie.
              </p>
            </div>

            {/* Schritt 3 */}
            <div className="text-center">
              <div className="w-20 h-20 bg-[#C5A060] rounded-full flex items-center justify-center mx-auto mb-6">
                <Sparkles className="w-10 h-10 text-white" />
              </div>
              <div className="w-12 h-12 bg-[#0A2342] rounded-full flex items-center justify-center mx-auto mb-4 text-white font-bold text-xl">
                3
              </div>
              <h3 className="text-xl font-bold text-[#0A2342] mb-3">Profi-Exposé erhalten</h3>
              <p className="text-[#2D3748]">
                In wenigen Sekunden erhalten Sie ein verkaufsstarkes, professionelles Exposé zum sofortigen Download.
              </p>
            </div>
          </div>

          {/* CTA Button */}
          <div className="text-center mt-16">
            <button className="bg-[#C5A060] hover:bg-[#B39050] text-white px-10 py-4 rounded-lg text-lg font-semibold transition-all transform hover:scale-105 shadow-lg">
              Jetzt kostenlos testen
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer id="kontakt" className="bg-[#0A2342] text-white py-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-3 gap-8 mb-8">
            {/* Brand */}
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <FileText className="w-6 h-6 text-[#C5A060]" />
                <span className="text-xl font-bold">Exposé-Profi</span>
              </div>
              <p className="text-gray-400 text-sm leading-relaxed">
                KI-gestützte Exposé-Erstellung für Immobilienmakler. Schnell, professionell, rechtssicher.
              </p>
            </div>

            {/* Links */}
            <div>
              <h4 className="text-sm font-semibold text-white mb-4 uppercase tracking-wide">Rechtliches</h4>
              <ul className="space-y-2">
                <li>
                  <a href="#impressum" className="text-gray-400 hover:text-[#C5A060] transition-colors text-sm">
                    Impressum
                  </a>
                </li>
                <li>
                  <a href="#datenschutz" className="text-gray-400 hover:text-[#C5A060] transition-colors text-sm">
                    Datenschutzerklärung
                  </a>
                </li>
                <li>
                  <a href="#agb" className="text-gray-400 hover:text-[#C5A060] transition-colors text-sm">
                    AGB
                  </a>
                </li>
                <li>
                  <a href="#widerruf" className="text-gray-400 hover:text-[#C5A060] transition-colors text-sm">
                    Widerrufsbelehrung
                  </a>
                </li>
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h4 className="text-sm font-semibold text-white mb-4 uppercase tracking-wide">Kontakt</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>Email: info@expose-profi.de</li>
                <li>Tel: +49 (0) 123 456789</li>
                <li className="pt-2">
                  <button 
                    onClick={() => scrollToSection('vorteile')}
                    className="text-[#C5A060] hover:text-[#B39050] transition-colors font-medium">
                    Mehr erfahren →
                  </button>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-700 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center text-sm text-gray-400">
              <p>© 2025 Exposé-Profi. Alle Rechte vorbehalten.</p>
              <p className="mt-2 md:mt-0">
                Made with ❤️ for Immobilienmakler
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
 das ist der code ich brauche hier unterschtüzung wio ich die punkte ienfüge
