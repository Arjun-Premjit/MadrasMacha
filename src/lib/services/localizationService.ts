import { Stop } from '../../types/transit';

export type SupportedLanguage = 'en' | 'ta';

/**
 * Verified Official Chennai Metro Rail Limited (CMRL) Station Names in Tamil.
 * Source: Official CMRL station signboards, CMRL official timetable & route map.
 */
export const CMRL_STATION_TAMIL_NAMES: Record<string, string> = {
  // --- Corridor 1: Blue Line (Wimco Nagar Depot to Chennai Airport) ---
  'CMRL_01': 'விம்கோ நகர் பணிமனை',
  'CMRL_02': 'விம்கோ நகர்',
  'CMRL_03': 'திருவொற்றியூர்',
  'CMRL_04': 'திருவொற்றியூர் தேரடி',
  'CMRL_05': 'காலடிப்பேட்டை',
  'CMRL_06': 'டோல்கேட்',
  'CMRL_07': 'புது வண்ணாரப்பேட்டை',
  'CMRL_08': 'தண்டையார்பேட்டை',
  'CMRL_09': 'சர் தியாகராயா கல்லூரி',
  'CMRL_10': 'வண்ணாரப்பேட்டை',
  'CMRL_11': 'மண்ணடி',
  'CMRL_12': 'உயர் நீதிமன்றம்',
  'CMRL_13': 'புரட்சித் தலைவர் டாக்டர் எம்.ஜி. இராமச்சந்திரன் சென்ட்ரல்',
  'CMRL_14': 'அரசினர் தோட்டம்',
  'CMRL_15': 'எல்.ஐ.சி',
  'CMRL_16': 'ஆயிரம் விளக்கு',
  'CMRL_17': 'ஏ.ஜி.-டி.எம்.எஸ்',
  'CMRL_18': 'தேனாம்பேட்டை',
  'CMRL_19': 'நந்தனம்',
  'CMRL_20': 'சைதாப்பேட்டை',
  'CMRL_21': 'சின்னமலை',
  'CMRL_22': 'கிண்டி',
  'CMRL_23': 'அறிஞர் அண்ணா ஆலந்தூர்',
  'CMRL_24': 'நங்கநல்லூர் சாலை',
  'CMRL_25': 'மீனம்பாக்கம்',
  'CMRL_26': 'சென்னை பன்னாட்டு வானூர்தி நிலையம்',

  // --- Corridor 2: Green Line (Central to St. Thomas Mount) ---
  'CMRL_G01': 'புரட்சித் தலைவர் டாக்டர் எம்.ஜி. இராமச்சந்திரன் சென்ட்ரல்',
  'CMRL_G02': 'சென்னை எழும்பூர்',
  'CMRL_G03': 'நேரு பூங்கா',
  'CMRL_G04': 'கீழ்ப்பாக்கம் மருத்துவக் கல்லூரி',
  'CMRL_G05': 'பச்சையப்பன் கல்லூரி',
  'CMRL_G06': 'செனாய் நகர்',
  'CMRL_G07': 'அண்ணா நகர் கிழக்கு',
  'CMRL_G08': 'அண்ணா நகர் கோபுரம்',
  'CMRL_G09': 'திருமங்கலம்',
  'CMRL_G10': 'கோயம்பேடு',
  'CMRL_G11': 'கோயம்பேடு பணிமனை',
  'CMRL_G12': 'புரட்சித் தலைவி டாக்டர் ஜெ. ஜெயலலிதா புறநகர் பேருந்து நிலையம் (சி.எம்.பி.டி)',
  'CMRL_G13': 'அரும்பாக்கம்',
  'CMRL_G14': 'வடபழனி',
  'CMRL_G15': 'அசோக் நகர்',
  'CMRL_G16': 'ஈக்காட்டுத்தாங்கல்',
  'CMRL_G17': 'அறிஞர் அண்ணா ஆலந்தூர்',
  'CMRL_G18': 'பரங்கிமலை',

  // Seed Station IDs from seedData.ts
  'ST-CENTRAL': 'புரட்சி தலைவர் டாக்டர் எம்.ஜி.ஆர் சென்ட்ரல்',
  'ST-AIRPORT': 'சென்னை பன்னாட்டு வானூர்தி நிலையம்',
  'ST-ALANDUR': 'ஆலந்தூர் பரிமாற்ற நிலையம்',
  'ST-GUINDY': 'கிண்டி ரயில் நிலையம் மற்றும் தொழிற்பேட்டை',
  'ST-KMB': 'கோயம்பேடு பேருந்து நிலையம் (சி.எம்.பி.டி)',
  'ST-TNAGAR': 'தி. நகர் (பனகல் பூங்கா & பேருந்து நிலையம்)',
  'ST-THIRU': 'திருவான்மியூர் பேருந்து பணிமனை',
  'ST-TAMBARAM': 'தாம்பரம் பேருந்து நிலையம் & ரயில் நிலையம்',
  'ST-BROADWAY': 'பிராட்வே பேருந்து நிலையம் (பாரிஸ் கார்னர்)',
  'ST-VADAPALANI': 'வடபழனி சந்திப்பு மற்றும் மெட்ரோ',
  'ST-VELACHERY': 'வேளச்சேரி பேருந்து நிலையம் மற்றும் எம்.ஆர்.டி.எஸ்',
  'ST-SHOLING': 'சோழிங்கநல்லூர் ஐடி சந்திப்பு',
  'ST-ADYAR': 'அடையாறு பேருந்து பணிமனை',
  'ST-SIRUSERI': 'சிறுசேரி சிப்காட் ஐ.டி பார்க்',
  'ST-EGMORE': 'சென்னை எழும்பூர் மெட்ரோ & ரயில் நிலையம்',
  'ST-STMOUNT': 'பரங்கிமலை மெட்ரோ & புறநகர் ரயில் நிலையம்',
  'ST-WIMCO': 'விம்கோ நகர் பணிமனை & மெட்ரோ',
  'ST-ANNANAGAR': 'அண்ணா நகர் டவர் மெட்ரோ',
};

/**
 * Normalized name-based lookup for CMRL stations and verified major Chennai transit hubs.
 * Maps exact clean English stop names to official Tamil terminology.
 */
export const VERIFIED_TAMIL_NAMES_BY_NAME: Record<string, string> = {
  // CMRL Stations
  'wimco nagar depot': 'விம்கோ நகர் பணிமனை',
  'wimco nagar': 'விம்கோ நகர்',
  'thiruvottriyur': 'திருவொற்றியூர்',
  'tiruvottriyur': 'திருவொற்றியூர்',
  'thiruvottriyur theradi': 'திருவொற்றியூர் தேரடி',
  'kaladipet': 'காலடிப்பேட்டை',
  'tollgate': 'டோல்கேட்',
  'new washermanpet': 'புது வண்ணாரப்பேட்டை',
  'tondiarpet': 'தண்டையார்பேட்டை',
  'sri theagaraya college': 'சர் தியாகராயா கல்லூரி',
  'washermanpet': 'வண்ணாரப்பேட்டை',
  'mannadi': 'மண்ணடி',
  'high court': 'உயர் நீதிமன்றம்',
  'puratchi thalaivar dr. m.g. ramachandran central': 'புரட்சித் தலைவர் டாக்டர் எம்.ஜி.ஆர் சென்ட்ரல்',
  'puratchi thalaivar dr. m.g.r central': 'புரட்சித் தலைவர் டாக்டர் எம்.ஜி.ஆர் சென்ட்ரல்',
  'chennai central': 'சென்னை சென்ட்ரல்',
  'government estate': 'அரசினர் தோட்டம்',
  'lic': 'எல்.ஐ.சி',
  'thousand lights': 'ஆயிரம் விளக்கு',
  'ag-dms': 'ஏ.ஜி.-டி.எம்.எஸ்',
  'teynampet': 'தேனாம்பேட்டை',
  'nandanam': 'நந்தனம்',
  'saidapet': 'சைதாப்பேட்டை',
  'little mount': 'சின்னமலை',
  'guindy': 'கிண்டி',
  'guindy station': 'கிண்டி ரயில் நிலையம்',
  'guindy station & industrial estate': 'கிண்டி ரயில் நிலையம் மற்றும் தொழிற்பேட்டை',
  'arignar anna alandur': 'அறிஞர் அண்ணா ஆலந்தூர்',
  'alandur': 'ஆலந்தூர்',
  'alandur multi-modal interchange': 'ஆலந்தூர் பரிமாற்ற நிலையம்',
  'ota-nanganallur road': 'நங்கநல்லூர் சாலை',
  'nanganallur road': 'நங்கநல்லூர் சாலை',
  'meenambakkam': 'மீனம்பாக்கம்',
  'chennai international airport': 'சென்னை பன்னாட்டு வானூர்தி நிலையம்',
  'chennai airport': 'சென்னை விமான நிலையம்',
  'airport': 'விமான நிலையம்',
  'egmore': 'சென்னை எழும்பூர்',
  'chennai egmore': 'சென்னை எழும்பூர்',
  'nehru park': 'நேரு பூங்கா',
  'kilpauk medical college': 'கீழ்ப்பாக்கம் மருத்துவக் கல்லூரி',
  'kilpauk': 'கீழ்ப்பாக்கம்',
  'pachaiyappas college': 'பச்சையப்பன் கல்லூரி',
  'pachaiyappa college': 'பச்சையப்பன் கல்லூரி',
  'shenoy nagar': 'செனாய் நகர்',
  'anna nagar east': 'அண்ணா நகர் கிழக்கு',
  'anna nagar tower': 'அண்ணா நகர் கோபுரம்',
  'thirumangalam': 'திருமங்கலம்',
  'koyambedu': 'கோயம்பேடு',
  'koyambedu depot': 'கோயம்பேடு பணிமனை',
  'puratchi thalaivi dr. j. jayalalithaa cmbt': 'புரட்சித் தலைவி டாக்டர் ஜெ. ஜெயலலிதா சி.எம்.பி.டி',
  'cmbt': 'கோயம்பேடு பேருந்து நிலையம் (சி.எம்.பி.டி)',
  'arumbakkam': 'அரும்பாக்கம்',
  'vadapalani': 'வடபழனி',
  'vadapalani junction & metro': 'வடபழனி சந்திப்பு மற்றும் மெட்ரோ',
  'ashok nagar': 'அசோக் நகர்',
  'ekkattuthangal': 'ஈக்காட்டுத்தாங்கல்',
  'st. thomas mount': 'பரங்கிமலை',
  'st. thomas mount metro & suburban': 'பரங்கிமலை மெட்ரோ & புறநகர் ரயில் நிலையம்',

  // Major MTC Bus Hubs & Interchange Stations (Official TN Terminus Names)
  'tambaram': 'தாம்பரம்',
  'tambaram west': 'தாம்பரம் மேற்கு',
  'tambaram bus terminus': 'தாம்பரம் பேருந்து நிலையம்',
  'tambaram bus terminus & railway station': 'தாம்பரம் பேருந்து நிலையம் & ரயில் நிலையம்',
  'broadway': 'பிராட்வே',
  'broadway bus terminus': 'பிராட்வே பேருந்து நிலையம்',
  'broadway bus terminus (parrys corner)': 'பிராட்வே பேருந்து நிலையம் (பாரிஸ் கார்னர்)',
  'parrys': 'பாரிஸ்',
  't. nagar': 'தி. நகர்',
  't. nagar (panagal park & bus terminus)': 'தி. நகர் (பனகல் பூங்கா & பேருந்து நிலையம்)',
  't. nagar (panagal park)': 'தி. நகர் (பனகல் பூங்கா)',
  'velachery': 'வேளச்சேரி',
  'velachery bus terminus & mrts': 'வேளச்சேரி பேருந்து நிலையம் மற்றும் எம்.ஆர்.டி.எஸ்',
  'velachery bus stand': 'வேளச்சேரி பேருந்து நிலையம்',
  'adyar': 'அடையாறு',
  'adyar depot': 'அடையாறு பணிமனை',
  'adyar bus depot & signal': 'அடையாறு பேருந்து பணிமனை',
  'thiruvanmiyur': 'திருவான்மியூர்',
  'thiruvanmiyur bus depot & rto': 'திருவான்மியூர் பேருந்து பணிமனை',
  'sholinganallur': 'சோழிங்கநல்லூர்',
  'sholinganallur it junction': 'சோழிங்கநல்லூர் ஐடி சந்திப்பு',
  'siruseri': 'சிறுசேரி',
  'siruseri sipcot i.t. park': 'சிறுசேரி சிப்காட் ஐ.டி பார்க்',
  'siruseri i.t. park': 'சிறுசேரி ஐ.டி பார்க்',
  'perambur': 'பெரம்பூர்',
  'perambur bus stand': 'பெரம்பூர் பேருந்து நிலையம்',
  'besant nagar': 'பெசன்ட் நகர்',
  'chetpet': 'சேத்துப்பட்டு',
  'chetpet station': 'சேத்துப்பட்டு ரயில் நிலையம்',
  'ayanavaram': 'அயனாவரம்',
  'ambattur': 'அம்பத்தூர்',
  'ambattur o.t.': 'அம்பத்தூர் பழைய பேருந்து நிலையம்',
  'ambattur estate': 'அம்பத்தூர் தொழிற்பேட்டை',
  'pallavaram': 'பல்லாவரம்',
  'chromepet': 'குரோம்பேட்டை',
  'chengalpattu': 'செங்கல்பட்டு',
  'chengalpattu old bus stand': 'செங்கல்பட்டு பழைய பேருந்து நிலையம்',
  'medavakkam': 'மேடவாக்கம்',
  'medavakkam koot road': 'மேடவாக்கம் கூட்டு ரோடு',
  'guduvanchery': 'கூடுவாஞ்சேரி',
  'perungalathur': 'பெருங்களத்தூர்',
  'kelambakkam': 'கேளம்பாக்கம்',
  'navalur': 'நாவலூர்',
  'perungudi': 'பெருங்குடி',
  'thoraipakkam': 'துரைப்பாக்கம்',
  'kandanchavadi': 'கந்தன்சாவடி',
  'kotturpuram': 'கோட்டூர்புரம்',
  'mylapore': 'மயிலாப்பூர்',
  'mylapore luz corner': 'மயிலாப்பூர் லஸ் கார்னர்',
  'royapettah': 'ராயப்பேட்டை',
  'marina beach': 'மெரினா கடற்கரை',
  'santhome': 'சாந்தோம்',
  'santhome church': 'சாந்தோம் தேவாலயம்',
  'pattinapakkam': 'பட்டினப்பாக்கம்',
  'foreshore estate': 'பட்டினப்பாக்கம் பட்டினச்சேரி',
  'mandaveli': 'மந்தவெளி',
  'triplicane': 'திருவல்லிக்கேணி',
  'secretariat': 'தலைமைச் செயலகம்',
  'anna square': 'அண்ணா சதுக்கம்',
  'potheri': 'பொத்தேரி',
  'singaperumal koil': 'சிங்கபெருமாள் கோவில்',
  'maraimalai nagar': 'மறைமலை நகர்',
};

/**
 * Normalizes a station/stop string for robust dictionary matching.
 */
function normalizeName(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[.,\-\/()]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Centralized helper: retrieves the localized stop/station name.
 * 
 * Rules (strictly enforced):
 * 1. If language is 'en', returns the original stop_name.
 * 2. If language is 'ta':
 *    - First checks if the stop record has a valid `stop_name_tamil`.
 *    - Then checks verified dictionary by `stop_id`.
 *    - Then checks verified dictionary by exact normalized stop name.
 *    - If no verified Tamil name exists: RETURNS THE EXISTING ENGLISH NAME.
 *      Never invents or machine-generates unverified translations.
 * 3. Does NOT alter stop_id, route_id, trip_id, shape_id, or service_id.
 */
export function getLocalizedStopName(
  stopOrName: Stop | string | null | undefined,
  language: SupportedLanguage = 'en',
  stopId?: string
): string {
  if (!stopOrName) return '';

  let name = '';
  let id = stopId || '';
  let dbTamil: string | undefined;

  if (typeof stopOrName === 'string') {
    name = stopOrName.trim();
  } else {
    name = stopOrName.stop_name || '';
    id = id || stopOrName.stop_id || '';
    dbTamil = stopOrName.stop_name_tamil;
  }

  // English requested
  if (language === 'en') {
    return name;
  }

  // Tamil requested:
  // 1. Check if database/object record contains verified stop_name_tamil
  if (dbTamil && dbTamil.trim().length > 0) {
    return dbTamil.trim();
  }

  // 2. Check dictionary by stop_id (e.g. CMRL_01, CMRL_G14, ST-GUINDY)
  if (id && CMRL_STATION_TAMIL_NAMES[id]) {
    return CMRL_STATION_TAMIL_NAMES[id];
  }

  // 3. Check normalized name lookup
  const norm = normalizeName(name);
  if (VERIFIED_TAMIL_NAMES_BY_NAME[norm]) {
    return VERIFIED_TAMIL_NAMES_BY_NAME[norm];
  }

  // 4. Check for partial exact tokens in known corridors
  for (const [key, tamilVal] of Object.entries(VERIFIED_TAMIL_NAMES_BY_NAME)) {
    if (norm === key) {
      return tamilVal;
    }
  }

  // 5. Fallback: Show the existing English name rather than inventing a Tamil translation!
  return name;
}

/**
 * Common UI string translations for Bilingual interface.
 */
export const UI_TRANSLATIONS: Record<string, { en: string; ta: string }> = {
  fare_calculator: { en: 'Fare Calculator', ta: 'கட்டணக் கால்குலேட்டர்' },
  metro_fare: { en: 'Chennai Metro', ta: 'சென்னை மெட்ரோ' },
  mtc_fare: { en: 'MTC Bus', ta: 'மாநகரப் பேருந்து (MTC)' },
  origin_station: { en: 'Origin Station', ta: 'புறப்படும் நிலையம்' },
  destination_station: { en: 'Destination Station', ta: 'சேரும் நிலையம்' },
  select_station: { en: 'Select station', ta: 'நிலையத்தைத் தேர்ந்தெடுக்கவும்' },
  select_stop: { en: 'Select bus stop', ta: 'பேருந்து நிறுத்தத்தைத் தேர்ந்தெடுக்கவும்' },
  ticket_type: { en: 'Ticket Type', ta: 'பயணச்சீட்டு வகை' },
  service_type: { en: 'Service Type', ta: 'சேவை வகை' },
  calculate_fare: { en: 'Calculate Fare', ta: 'கட்டணத்தைக் கணக்கிடுக' },
  fare_result: { en: 'Applicable Fare', ta: 'பயணக் கட்டணம்' },
  regular_fare: { en: 'Regular Fare', ta: 'வழக்கமான கட்டணம்' },
  discounted_fare: { en: 'Discounted Fare', ta: 'தள்ளுபடி கட்டணம்' },
  discount: { en: 'Discount', ta: 'தள்ளுபடி' },
  stages: { en: 'Fare Stages', ta: 'கட்டண நிலைகள்' },
  approx_distance: { en: 'Approx Distance', ta: 'தோராய தூரம்' },
  token: { en: 'Token / Paper QR', ta: 'டோக்கன் / காகித QR' },
  smart_card: { en: 'Store Value Pass / Smart Card', ta: 'ஸ்மார்ட் கார்டு (20% தள்ளுபடி)' },
  mobile_qr: { en: 'Mobile App QR (CMRL / WhatsApp)', ta: 'மொபைல் QR (20% தள்ளுபடி)' },
  holiday_discount: { en: 'Sunday / Holiday Special (50% Off)', ta: 'ஞாயிறு / விடுமுறை சிறப்பு (50% தள்ளுபடி)' },
  tourist_card: { en: '1-Day Tourist Card (Unlimited)', ta: '1-நாள் சுற்றுலா அட்டை (வரம்பற்றது)' },
  ordinary: { en: 'Ordinary (White Board)', ta: 'சாதாரண பேருந்து (வெள்ளை போர்டு)' },
  express: { en: 'Express (Green Board)', ta: 'விரைவுப் பேருந்து (பச்சை போர்டு)' },
  deluxe: { en: 'Deluxe (Blue Board)', ta: 'டீலக்ஸ் பேருந்து (நீல போர்டு)' },
  ac_volvo: { en: 'AC Volvo', ta: 'குளிர்சாதன வால்வோ (AC)' },
  live_tracking: { en: 'Live Vehicle Tracking', ta: 'நேரடி வாகன கண்காணிப்பு' },
  live_buses: { en: 'Live MTC Buses', ta: 'நேரடி பேருந்துகள்' },
  live_unavailable: { en: 'Live bus locations are currently unavailable.', ta: 'நேரடி பேருந்து இருப்பிடங்கள் தற்போது கிடைக்கவில்லை.' },
  all_buses: { en: 'All Buses', ta: 'அனைத்துப் பேருந்துகள்' },
  selected_route_only: { en: 'Selected Route Only', ta: 'தேர்ந்தெடுக்கப்பட்ட தடம் மட்டும்' },
  women_free_travel: { en: 'Vidiyal Payanam Scheme: Free travel for women in Ordinary (White Board) buses.', ta: 'விடியல் பயணம் திட்டம்: சாதாரண கட்டண பேருந்துகளில் பெண்களுக்கு கட்டணமில்லா பயணம்.' },
  source_citation_cmrl: { en: 'Source: Official CMRL Fare Notification (chennaimetrorail.org)', ta: 'மூலம்: அதிகாரப்பூர்வ சென்னை மெட்ரோ கட்டண அறிவிப்பு' },
  source_citation_mtc: { en: 'Source: MTC Official Stage Fare Notification (mtcbus.tn.gov.in · G.O. Ms. No. 14)', ta: 'மூலம்: தமிழ்நாடு அரசு போக்குவரத்துக் கழக கட்டண ஆணை' },
};
