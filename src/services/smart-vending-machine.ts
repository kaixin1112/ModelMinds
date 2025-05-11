/**
 * Represents a geographical location with latitude and longitude coordinates.
 */
export interface Location {
  /**
   * The latitude of the location.
   */
  lat: number;
  /**
   * The longitude of the location.
   */
  lng: number;
}

/**
 * Represents a Smart Vending Machine
 */
export interface SmartVendingMachine {
  /**
   * The id of the vending machine.
   */
  id: string;
  /**
   * The location of the vending machine (for map coordinates)
   */
  location: Location;
  /**
   * The simulated address of the vending machine for display.
   */
  address: string;
  /**
  * The city name for easier display in filters/dropdowns.
  */
  cityName: string; // This will be the zone/area name for detailed locations
  /**
   * The material types accepted by this vending machine (e.g., 'Plastic', 'Paper', 'Metal', 'Glass').
   */
  acceptedMaterialTypes: string[];
}

const UNIVERSAL_PRICING = new Map<string, number>([
  ['Plastic', 0.50],
  ['Paper', 0.25],
  ['Metal', 0.75],
  ['Glass', 0.30],
  ['Electronic Waste', 1.00], // Added Electronic Waste
]);

const ALL_MATERIAL_TYPES = ['Plastic', 'Paper', 'Metal', 'Glass', 'Electronic Waste']; // Updated list

const MOCK_STREET_NAMES: string[] = [
  "Jalan Utama", "Persiaran Lestari", "Lorong Ceria", "Jalan Harmoni", "Lingkaran Damai", 
  "Jalan Inovasi", "Persiaran Teknologi", "Lorong Bestari", "Jalan Sejahtera", "Lingkaran Ilmu",
  "Jalan Perdana", "Persiaran Murni", "Lorong Indah", "Jalan Makmur", "Lingkaran Setia",
  "Jalan Bakti", "Persiaran Wawasan", "Lorong Sentosa", "Jalan Muhibbah", "Lingkaran Jaya"
];

const MOCK_ZONES_AREAS_SUFFIXES: string[] = [
  "Industri Maju", "Komersial Sentral", "Kediaman Hijau Lestari", "Perdana Niaga",
  "Teknologi Bestari", "Bandar Baru Harmoni", "Inovasi Pintar", "Rekreasi Komuniti",
  "Komuniti Sejahtera", "Logistik Terpadu", "Perniagaan Dinamik", "Perumahan Elit",
  "Pendidikan Terpadu", "Eco Park", "Business Centre", "Heights", "Residency"
];


// Updated locations to cover all states and major cities in Malaysia
const MALAYSIA_LOCATIONS: { name: string; code: string; lat: number; lng: number; count: number }[] = [
  // Perlis
  { name: 'Kangar Town Centre, Perlis', code: 'KGR', lat: 6.4414, lng: 100.1986, count: 5 },

  // Kedah
  { name: 'Alor Setar City Centre, Kedah', code: 'ASCC', lat: 6.1256, lng: 100.3674, count: 8 },
  { name: 'Sungai Petani Town Area, Kedah', code: 'SPTA', lat: 5.6474, lng: 100.4880, count: 7 },
  { name: 'Kulim Hi-Tech Park Area, Kedah', code: 'KHTP', lat: 5.3792, lng: 100.5510, count: 5 },

  // Penang (Island & Mainland)
  { name: 'George Town UNESCO Site, Penang', code: 'GTU', lat: 5.4175, lng: 100.3327, count: 10 }, 
  { name: 'Gurney Drive Area, Penang', code: 'GDPA', lat: 5.4370, lng: 100.3080, count: 5 },
  { name: 'Bayan Lepas Industrial Zone, Penang', code: 'BLIZ', lat: 5.2949, lng: 100.2714, count: 8 },
  { name: 'Gelugor Residential, Penang', code: 'GLGR', lat: 5.3686, lng: 100.3047, count: 5 },
  { name: 'Jelutong Commercial, Penang', code: 'JLTC', lat: 5.3910, lng: 100.3120, count: 5 },
  { name: 'Air Itam Town Centre, Penang', code: 'AITC', lat: 5.3990, lng: 100.2800, count: 4 },
  { name: 'Butterworth Town Centre, Penang (Mainland)', code: 'BWTC', lat: 5.3949, lng: 100.3667, count: 7 },
  { name: 'Bukit Mertajam Town, Penang (Mainland)', code: 'BMTN', lat: 5.3646, lng: 100.4597, count: 6 },

  // Perak
  { name: 'Ipoh Old Town, Perak', code: 'IPOT', lat: 4.5975, lng: 101.0769, count: 10 },
  { name: 'Taiping Lake Gardens Area, Perak', code: 'TPGL', lat: 4.8500, lng: 100.7333, count: 6 },
  { name: 'Teluk Intan Town, Perak', code: 'TLIT', lat: 4.0238, lng: 101.0210, count: 4 },

  // Selangor
  { name: 'Shah Alam City Centre, Selangor', code: 'SACC', lat: 3.0734, lng: 101.5183, count: 8 },
  { name: 'Petaling Jaya Commercial Hub, Selangor', code: 'PJCH', lat: 3.1080, lng: 101.6030, count: 8 },
  { name: 'Subang Jaya (SS15 Area), Selangor', code: 'SJSS', lat: 3.0456, lng: 101.5820, count: 7 },
  { name: 'Klang Town, Selangor', code: 'KLGT', lat: 3.0360, lng: 101.4430, count: 6 },
  { name: 'Puchong Financial District, Selangor', code: 'PCFD', lat: 3.0251, lng: 101.6157, count: 6 },
  { name: 'Cyberjaya Tech Park, Selangor', code: 'CYTP', lat: 2.9213, lng: 101.6559, count: 5 },
  { name: 'Kajang Town Area, Selangor', code: 'KJTA', lat: 2.9936, lng: 101.7875, count: 5 },

  // Kuala Lumpur
  { name: 'Kuala Lumpur City Centre, Kuala Lumpur', code: 'KLCC', lat: 3.1578, lng: 101.7119, count: 12 }, 
  { name: 'Bukit Bintang, Kuala Lumpur', code: 'BBKL', lat: 3.1466, lng: 101.7100, count: 10 },
  { name: 'Bangsar, Kuala Lumpur', code: 'BGRK', lat: 3.1298, lng: 101.6709, count: 8 },
  { name: 'Mont Kiara, Kuala Lumpur', code: 'MKKK', lat: 3.1659, lng: 101.6507, count: 8 },
  { name: 'Kepong, Kuala Lumpur', code: 'KPKL', lat: 3.2150, lng: 101.6360, count: 6 },
  { name: 'Cheras, Kuala Lumpur', code: 'CRSK', lat: 3.0950, lng: 101.7400, count: 6 },

  // Negeri Sembilan
  { name: 'Seremban Town, N. Sembilan', code: 'SRBT', lat: 2.7297, lng: 101.9378, count: 8 },
  { name: 'Port Dickson Coastal Area, N. Sembilan', code: 'PDCA', lat: 2.5220, lng: 101.7940, count: 5 },

  // Melaka
  { name: 'Melaka Historical City, Melaka', code: 'MKHC', lat: 2.1944, lng: 102.2407, count: 10 },
  { name: 'Ayer Keroh Town, Melaka', code: 'AKTM', lat: 2.2735, lng: 102.2759, count: 5 },


  // Johor
  { name: 'Johor Bahru City Core, Johor', code: 'JBCC', lat: 1.4650, lng: 103.7500, count: 12 },
  { name: 'Skudai University Town, Johor', code: 'SKUT', lat: 1.5405, lng: 103.6667, count: 7 },
  { name: 'Pasir Gudang Industrial Hub, Johor', code: 'PGIH', lat: 1.4700, lng: 103.8850, count: 7 },
  { name: 'Kulai Town Centre, Johor', code: 'KLTC', lat: 1.6582, lng: 103.6049, count: 6 },
  { name: 'Iskandar Puteri (Medini), Johor', code: 'IPMD', lat: 1.4250, lng: 103.6350, count: 8 },
  { name: 'Muar Town Area, Johor', code: 'MATA', lat: 2.0468, lng: 102.5680, count: 5 },
  { name: 'Batu Pahat Town, Johor', code: 'BPTJ', lat: 1.8526, lng: 102.9277, count: 5 },

  // Pahang
  { name: 'Kuantan City, Pahang', code: 'KUCT', lat: 3.8079, lng: 103.3256, count: 8 },
  { name: 'Temerloh Town, Pahang', code: 'TMTH', lat: 3.4500, lng: 102.4167, count: 4 },
  { name: 'Genting Highlands Area, Pahang', code: 'GTHA', lat: 3.4236, lng: 101.7928, count: 3 },

  // Terengganu
  { name: 'Kuala Terengganu City Area, Terengganu', code: 'KTCA', lat: 5.3280, lng: 103.1370, count: 7 },
  { name: 'Dungun Town, Terengganu', code: 'DGTN', lat: 4.7722, lng: 103.4195, count: 4 },

  // Kelantan
  { name: 'Kota Bharu Town, Kelantan', code: 'KBKT', lat: 6.1300, lng: 102.2400, count: 8 },

  // Sabah
  { name: 'Kota Kinabalu City Centre, Sabah', code: 'KKCC', lat: 5.9750, lng: 116.0725, count: 10 },
  { name: 'Sandakan Town Area, Sabah', code: 'SDTA', lat: 5.8393, lng: 118.1176, count: 6 },
  { name: 'Tawau Town, Sabah', code: 'TWWT', lat: 4.2479, lng: 117.8870, count: 6 },
  { name: 'Lahad Datu Town, Sabah', code: 'LDTN', lat: 5.0260, lng: 118.3270, count: 3 },

  // Sarawak
  { name: 'Kuching City Centre, Sarawak', code: 'KCCC', lat: 1.5530, lng: 110.3438, count: 10 },
  { name: 'Miri City Area, Sarawak', code: 'MCAS', lat: 4.3980, lng: 113.9911, count: 7 },
  { name: 'Sibu Town Centre, Sarawak', code: 'SBTC', lat: 2.3000, lng: 111.8167, count: 6 },
  { name: 'Bintulu Town, Sarawak', code: 'BTTN', lat: 3.1700, lng: 113.0333, count: 5 },

  // Labuan
  { name: 'Victoria Town, Labuan FT', code: 'VTLF', lat: 5.2768, lng: 115.2400, count: 4 },
];


function getRandomSubset<T>(array: T[], minSize: number = 1, maxSize?: number): T[] {
  const size = Math.floor(Math.random() * ((maxSize || array.length) - minSize + 1)) + minSize;
  const shuffled = [...array].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, size);
}

function getRandomElement<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

/**
 * Asynchronously retrieves the available Smart Vending Machine.
 *
 * @param _location The location for which to find Smart Vending Machines. (Currently ignored as mock data is global)
 * @returns A promise that resolves to an array of SmartVendingMachine.
 */
export async function getSmartVendingMachines(_location?: Location): Promise<SmartVendingMachine[]> {
  const machines: SmartVendingMachine[] = [];
  let machineCounter = 0; // Used for unique IDs across all locations

  MALAYSIA_LOCATIONS.forEach(loc => {
    const machinesInThisCity = loc.count;

    for (let i = 0; i < machinesInThisCity; i++) {
      machineCounter++;
      const machineIdSuffix = String(machineCounter).padStart(4, '0'); 
      const machineId = `${loc.code}-${machineIdSuffix}`; 
      
      const randomLatOffsetFactor = 0.015; 
      const randomLngOffsetFactor = 0.015;
      const randomLatOffset = (Math.random() - 0.5) * randomLatOffsetFactor;
      const randomLngOffset = (Math.random() - 0.5) * randomLngOffsetFactor;

      const unitNumber = `Lot ${Math.floor(Math.random() * 500) + 1}`;
      const streetName = getRandomElement(MOCK_STREET_NAMES);
      const baseZoneName = loc.name.split(',')[0].trim();
      const zoneAreaSuffix = getRandomElement(MOCK_ZONES_AREAS_SUFFIXES);
      const descriptiveZone = `${baseZoneName} ${zoneAreaSuffix}`;

      machines.push({
        id: machineId,
        location: {
          lat: parseFloat((loc.lat + randomLatOffset).toFixed(6)),
          lng: parseFloat((loc.lng + randomLngOffset).toFixed(6)),
        },
        address: `${unitNumber}, ${streetName}, ${descriptiveZone}, ${loc.name}`,
        cityName: loc.name, 
        acceptedMaterialTypes: getRandomSubset(ALL_MATERIAL_TYPES, 2, ALL_MATERIAL_TYPES.length),
      });
    }
  });
  
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 200));
  return machines;
}

/**
 * Asynchronously retrieves the universal pricing for recyclable materials.
 * The pricing is the same for all vending machines.
 *
 * @param _vendingMachineId The ID of the vending machine (ignored, as pricing is universal).
 * @returns A promise that resolves to a map of material types and their prices.
 */
export async function getMaterialPricing(_vendingMachineId?: string): Promise<Map<string, number>> {
  // Pricing is universal.
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 300));
  return UNIVERSAL_PRICING;
}
