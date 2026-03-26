import type { Stock } from './types';

// ─── Seeded RNG (Mulberry32) ─────────────────────────────────
function seedRng(seed: number) {
  return () => {
    seed |= 0; seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function hashStr(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = ((h << 5) - h + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

function between(rng: () => number, lo: number, hi: number): number {
  return lo + rng() * (hi - lo);
}

function pick<T>(rng: () => number, arr: T[]): T {
  return arr[Math.floor(rng() * arr.length)];
}

// ─── Stock Universe ──────────────────────────────────────────
// [ticker, name, sector, industry, exchange, ~marketCapMillions]
type Def = [string, string, string, string, string, number];

const DEFS: Def[] = [
  // Technology
  ['AAPL','Apple Inc.','Technology','Consumer Electronics','NASDAQ',3200000],
  ['MSFT','Microsoft Corp.','Technology','Software','NASDAQ',2900000],
  ['GOOGL','Alphabet Inc.','Technology','Internet Content','NASDAQ',2000000],
  ['AMZN','Amazon.com Inc.','Technology','E-Commerce','NASDAQ',1900000],
  ['NVDA','NVIDIA Corp.','Technology','Semiconductors','NASDAQ',2800000],
  ['META','Meta Platforms','Technology','Social Media','NASDAQ',1400000],
  ['TSM','Taiwan Semiconductor','Technology','Semiconductors','NYSE',700000],
  ['AVGO','Broadcom Inc.','Technology','Semiconductors','NASDAQ',750000],
  ['ORCL','Oracle Corp.','Technology','Software','NYSE',340000],
  ['CRM','Salesforce Inc.','Technology','Cloud Computing','NYSE',280000],
  ['ADBE','Adobe Inc.','Technology','Software','NASDAQ',250000],
  ['AMD','Advanced Micro Devices','Technology','Semiconductors','NASDAQ',220000],
  ['CSCO','Cisco Systems','Technology','Networking','NASDAQ',230000],
  ['INTC','Intel Corp.','Technology','Semiconductors','NASDAQ',110000],
  ['TXN','Texas Instruments','Technology','Semiconductors','NASDAQ',175000],
  ['QCOM','Qualcomm Inc.','Technology','Semiconductors','NASDAQ',190000],
  ['IBM','IBM Corp.','Technology','IT Services','NYSE',195000],
  ['NOW','ServiceNow Inc.','Technology','Cloud Computing','NYSE',175000],
  ['INTU','Intuit Inc.','Technology','Software','NASDAQ',180000],
  ['AMAT','Applied Materials','Technology','Semiconductors','NASDAQ',155000],
  ['MU','Micron Technology','Technology','Semiconductors','NASDAQ',105000],
  ['LRCX','Lam Research','Technology','Semiconductors','NASDAQ',100000],
  ['ADI','Analog Devices','Technology','Semiconductors','NASDAQ',105000],
  ['KLAC','KLA Corp.','Technology','Semiconductors','NASDAQ',90000],
  ['SNPS','Synopsys Inc.','Technology','Software','NASDAQ',82000],
  ['CDNS','Cadence Design','Technology','Software','NASDAQ',78000],
  ['MRVL','Marvell Technology','Technology','Semiconductors','NASDAQ',65000],
  ['FTNT','Fortinet Inc.','Technology','Cybersecurity','NASDAQ',60000],
  ['PANW','Palo Alto Networks','Technology','Cybersecurity','NASDAQ',115000],
  ['CRWD','CrowdStrike','Technology','Cybersecurity','NASDAQ',72000],
  ['NET','Cloudflare Inc.','Technology','Cloud Computing','NYSE',35000],
  ['DDOG','Datadog Inc.','Technology','Cloud Computing','NASDAQ',40000],
  ['ZS','Zscaler Inc.','Technology','Cybersecurity','NASDAQ',28000],
  ['TEAM','Atlassian Corp.','Technology','Software','NASDAQ',45000],
  ['WDAY','Workday Inc.','Technology','Cloud Computing','NASDAQ',62000],
  ['PLTR','Palantir Technologies','Technology','Software','NYSE',55000],
  ['SHOP','Shopify Inc.','Technology','E-Commerce','NYSE',95000],
  ['SQ','Block Inc.','Technology','Fintech','NYSE',42000],
  ['COIN','Coinbase Global','Technology','Fintech','NASDAQ',45000],
  ['TTD','The Trade Desk','Technology','Advertising Tech','NASDAQ',48000],
  ['HUBS','HubSpot Inc.','Technology','Software','NYSE',30000],
  ['BILL','Bill Holdings','Technology','Fintech','NYSE',8000],
  ['PAYC','Paycom Software','Technology','Software','NYSE',11000],
  ['VEEV','Veeva Systems','Technology','Software','NYSE',32000],
  ['ANSS','ANSYS Inc.','Technology','Software','NASDAQ',28000],
  ['KEYS','Keysight Technologies','Technology','Test Equipment','NYSE',27000],
  ['ZM','Zoom Video','Technology','Software','NASDAQ',20000],
  ['OKTA','Okta Inc.','Technology','Cybersecurity','NASDAQ',14000],
  ['TWLO','Twilio Inc.','Technology','Cloud Computing','NYSE',12000],
  ['SNOW','Snowflake Inc.','Technology','Cloud Computing','NYSE',55000],

  // Healthcare
  ['JNJ','Johnson & Johnson','Healthcare','Pharmaceuticals','NYSE',380000],
  ['UNH','UnitedHealth Group','Healthcare','Health Insurance','NYSE',520000],
  ['LLY','Eli Lilly & Co.','Healthcare','Pharmaceuticals','NYSE',780000],
  ['PFE','Pfizer Inc.','Healthcare','Pharmaceuticals','NYSE',145000],
  ['ABBV','AbbVie Inc.','Healthcare','Pharmaceuticals','NYSE',310000],
  ['MRK','Merck & Co.','Healthcare','Pharmaceuticals','NYSE',280000],
  ['TMO','Thermo Fisher','Healthcare','Diagnostics','NYSE',210000],
  ['ABT','Abbott Laboratories','Healthcare','Medical Devices','NYSE',195000],
  ['DHR','Danaher Corp.','Healthcare','Diagnostics','NYSE',175000],
  ['AMGN','Amgen Inc.','Healthcare','Biotechnology','NASDAQ',155000],
  ['MDT','Medtronic PLC','Healthcare','Medical Devices','NYSE',105000],
  ['ISRG','Intuitive Surgical','Healthcare','Medical Devices','NASDAQ',165000],
  ['GILD','Gilead Sciences','Healthcare','Biotechnology','NASDAQ',105000],
  ['CVS','CVS Health','Healthcare','Healthcare Services','NYSE',85000],
  ['VRTX','Vertex Pharma','Healthcare','Biotechnology','NASDAQ',120000],
  ['REGN','Regeneron Pharma','Healthcare','Biotechnology','NASDAQ',110000],
  ['ZTS','Zoetis Inc.','Healthcare','Pharmaceuticals','NYSE',82000],
  ['BDX','Becton Dickinson','Healthcare','Medical Devices','NYSE',67000],
  ['SYK','Stryker Corp.','Healthcare','Medical Devices','NYSE',130000],
  ['BSX','Boston Scientific','Healthcare','Medical Devices','NYSE',115000],
  ['HCA','HCA Healthcare','Healthcare','Healthcare Services','NYSE',88000],
  ['DXCM','DexCom Inc.','Healthcare','Medical Devices','NASDAQ',32000],
  ['IQV','IQVIA Holdings','Healthcare','Healthcare Services','NYSE',42000],
  ['IDXX','IDEXX Labs','Healthcare','Diagnostics','NASDAQ',38000],
  ['MRNA','Moderna Inc.','Healthcare','Biotechnology','NASDAQ',42000],
  ['BIIB','Biogen Inc.','Healthcare','Biotechnology','NASDAQ',28000],
  ['ILMN','Illumina Inc.','Healthcare','Diagnostics','NASDAQ',20000],
  ['ALGN','Align Technology','Healthcare','Medical Devices','NASDAQ',16000],
  ['HOLX','Hologic Inc.','Healthcare','Medical Devices','NASDAQ',18000],

  // Financial Services
  ['JPM','JPMorgan Chase','Financial Services','Banks','NYSE',580000],
  ['V','Visa Inc.','Financial Services','Payment Processing','NYSE',540000],
  ['MA','Mastercard Inc.','Financial Services','Payment Processing','NYSE',420000],
  ['BAC','Bank of America','Financial Services','Banks','NYSE',310000],
  ['WFC','Wells Fargo','Financial Services','Banks','NYSE',200000],
  ['GS','Goldman Sachs','Financial Services','Capital Markets','NYSE',155000],
  ['MS','Morgan Stanley','Financial Services','Capital Markets','NYSE',155000],
  ['BLK','BlackRock Inc.','Financial Services','Asset Management','NYSE',130000],
  ['C','Citigroup Inc.','Financial Services','Banks','NYSE',115000],
  ['SCHW','Charles Schwab','Financial Services','Capital Markets','NYSE',120000],
  ['AXP','American Express','Financial Services','Payment Processing','NYSE',175000],
  ['CME','CME Group','Financial Services','Capital Markets','NASDAQ',80000],
  ['ICE','Intercontinental Exchange','Financial Services','Capital Markets','NYSE',82000],
  ['PNC','PNC Financial','Financial Services','Banks','NYSE',72000],
  ['USB','U.S. Bancorp','Financial Services','Banks','NYSE',65000],
  ['AIG','American Intl Group','Financial Services','Insurance','NYSE',48000],
  ['MET','MetLife Inc.','Financial Services','Insurance','NYSE',52000],
  ['PRU','Prudential Financial','Financial Services','Insurance','NYSE',42000],
  ['SPGI','S&P Global','Financial Services','Financial Data','NYSE',145000],
  ['MCO','Moodys Corp.','Financial Services','Financial Data','NYSE',80000],
  ['MSCI','MSCI Inc.','Financial Services','Financial Data','NYSE',42000],
  ['FIS','Fidelity National Info','Financial Services','Fintech','NYSE',40000],
  ['FISV','Fiserv Inc.','Financial Services','Fintech','NYSE',90000],
  ['GPN','Global Payments','Financial Services','Payment Processing','NYSE',28000],
  ['TROW','T. Rowe Price','Financial Services','Asset Management','NASDAQ',25000],
  ['NDAQ','Nasdaq Inc.','Financial Services','Capital Markets','NASDAQ',38000],
  ['CBOE','Cboe Global Markets','Financial Services','Capital Markets','CBOE',18000],

  // Consumer Cyclical
  ['TSLA','Tesla Inc.','Consumer Cyclical','Automotive','NASDAQ',780000],
  ['HD','Home Depot','Consumer Cyclical','Home Improvement','NYSE',380000],
  ['MCD','McDonalds Corp.','Consumer Cyclical','Restaurants','NYSE',210000],
  ['NKE','Nike Inc.','Consumer Cyclical','Apparel','NYSE',115000],
  ['SBUX','Starbucks Corp.','Consumer Cyclical','Restaurants','NASDAQ',105000],
  ['TJX','TJX Companies','Consumer Cyclical','Retail','NYSE',120000],
  ['LOW','Lowes Companies','Consumer Cyclical','Home Improvement','NYSE',145000],
  ['BKNG','Booking Holdings','Consumer Cyclical','Travel','NASDAQ',140000],
  ['ABNB','Airbnb Inc.','Consumer Cyclical','Travel','NASDAQ',78000],
  ['MAR','Marriott International','Consumer Cyclical','Hotels','NASDAQ',72000],
  ['HLT','Hilton Worldwide','Consumer Cyclical','Hotels','NYSE',55000],
  ['GM','General Motors','Consumer Cyclical','Automotive','NYSE',48000],
  ['CMG','Chipotle Mexican Grill','Consumer Cyclical','Restaurants','NYSE',78000],
  ['YUM','Yum! Brands','Consumer Cyclical','Restaurants','NYSE',38000],
  ['ROST','Ross Stores','Consumer Cyclical','Retail','NASDAQ',48000],
  ['TGT','Target Corp.','Consumer Cyclical','Retail','NYSE',58000],
  ['ETSY','Etsy Inc.','Consumer Cyclical','E-Commerce','NASDAQ',7500],
  ['EBAY','eBay Inc.','Consumer Cyclical','E-Commerce','NASDAQ',28000],
  ['DECK','Deckers Outdoor','Consumer Cyclical','Apparel','NYSE',25000],
  ['LULU','Lululemon Athletica','Consumer Cyclical','Apparel','NASDAQ',38000],
  ['DHI','D.R. Horton','Consumer Cyclical','Homebuilders','NYSE',48000],
  ['LEN','Lennar Corp.','Consumer Cyclical','Homebuilders','NYSE',38000],
  ['RCL','Royal Caribbean','Consumer Cyclical','Travel','NYSE',48000],
  ['PHM','PulteGroup','Consumer Cyclical','Homebuilders','NYSE',22000],
  ['POOL','Pool Corp.','Consumer Cyclical','Specialty Retail','NASDAQ',14000],

  // Consumer Defensive
  ['PG','Procter & Gamble','Consumer Defensive','Household Products','NYSE',380000],
  ['KO','Coca-Cola Co.','Consumer Defensive','Beverages','NYSE',265000],
  ['PEP','PepsiCo Inc.','Consumer Defensive','Beverages','NASDAQ',225000],
  ['COST','Costco Wholesale','Consumer Defensive','Retail','NASDAQ',360000],
  ['WMT','Walmart Inc.','Consumer Defensive','Retail','NYSE',520000],
  ['PM','Philip Morris','Consumer Defensive','Tobacco','NYSE',190000],
  ['CL','Colgate-Palmolive','Consumer Defensive','Household Products','NYSE',75000],
  ['GIS','General Mills','Consumer Defensive','Food','NYSE',38000],
  ['MDLZ','Mondelez International','Consumer Defensive','Food','NASDAQ',92000],
  ['STZ','Constellation Brands','Consumer Defensive','Beverages','NYSE',42000],
  ['CHD','Church & Dwight','Consumer Defensive','Household Products','NYSE',24000],
  ['EL','Estee Lauder','Consumer Defensive','Personal Products','NYSE',28000],
  ['CLX','Clorox Company','Consumer Defensive','Household Products','NYSE',18000],
  ['MNST','Monster Beverage','Consumer Defensive','Beverages','NASDAQ',52000],
  ['KDP','Keurig Dr Pepper','Consumer Defensive','Beverages','NASDAQ',48000],
  ['HRL','Hormel Foods','Consumer Defensive','Food','NYSE',18000],
  ['SJM','J.M. Smucker','Consumer Defensive','Food','NYSE',14000],
  ['HSY','Hershey Co.','Consumer Defensive','Food','NYSE',32000],
  ['KMB','Kimberly-Clark','Consumer Defensive','Household Products','NYSE',45000],
  ['MKC','McCormick & Co.','Consumer Defensive','Food','NYSE',20000],

  // Industrials
  ['HON','Honeywell International','Industrials','Conglomerate','NASDAQ',135000],
  ['UNP','Union Pacific','Industrials','Railroads','NYSE',145000],
  ['UPS','United Parcel Service','Industrials','Logistics','NYSE',105000],
  ['CAT','Caterpillar Inc.','Industrials','Machinery','NYSE',175000],
  ['RTX','RTX Corp.','Industrials','Aerospace & Defense','NYSE',150000],
  ['BA','Boeing Co.','Industrials','Aerospace & Defense','NYSE',125000],
  ['DE','Deere & Co.','Industrials','Machinery','NYSE',110000],
  ['LMT','Lockheed Martin','Industrials','Aerospace & Defense','NYSE',115000],
  ['GE','GE Aerospace','Industrials','Aerospace & Defense','NYSE',195000],
  ['MMM','3M Company','Industrials','Conglomerate','NYSE',65000],
  ['EMR','Emerson Electric','Industrials','Electrical Equipment','NYSE',65000],
  ['ETN','Eaton Corp.','Industrials','Electrical Equipment','NYSE',125000],
  ['ITW','Illinois Tool Works','Industrials','Machinery','NYSE',78000],
  ['CTAS','Cintas Corp.','Industrials','Business Services','NASDAQ',72000],
  ['WM','Waste Management','Industrials','Waste Management','NYSE',82000],
  ['RSG','Republic Services','Industrials','Waste Management','NYSE',62000],
  ['FDX','FedEx Corp.','Industrials','Logistics','NYSE',68000],
  ['CSX','CSX Corp.','Industrials','Railroads','NASDAQ',62000],
  ['CARR','Carrier Global','Industrials','HVAC','NYSE',58000],
  ['OTIS','Otis Worldwide','Industrials','Machinery','NYSE',38000],
  ['TT','Trane Technologies','Industrials','HVAC','NYSE',78000],
  ['IR','Ingersoll Rand','Industrials','Machinery','NYSE',38000],
  ['PCAR','PACCAR Inc.','Industrials','Trucks','NASDAQ',52000],
  ['GWW','W.W. Grainger','Industrials','Distribution','NYSE',48000],
  ['SWK','Stanley Black & Decker','Industrials','Tools','NYSE',14000],

  // Energy
  ['XOM','Exxon Mobil','Energy','Oil & Gas Integrated','NYSE',455000],
  ['CVX','Chevron Corp.','Energy','Oil & Gas Integrated','NYSE',280000],
  ['COP','ConocoPhillips','Energy','Exploration & Production','NYSE',130000],
  ['SLB','Schlumberger Ltd.','Energy','Equipment & Services','NYSE',62000],
  ['EOG','EOG Resources','Energy','Exploration & Production','NYSE',72000],
  ['MPC','Marathon Petroleum','Energy','Refining','NYSE',55000],
  ['PSX','Phillips 66','Energy','Refining','NYSE',48000],
  ['VLO','Valero Energy','Energy','Refining','NYSE',42000],
  ['OXY','Occidental Petroleum','Energy','Exploration & Production','NYSE',48000],
  ['DVN','Devon Energy','Energy','Exploration & Production','NYSE',28000],
  ['FANG','Diamondback Energy','Energy','Exploration & Production','NASDAQ',35000],
  ['HES','Hess Corp.','Energy','Exploration & Production','NYSE',42000],
  ['HAL','Halliburton Co.','Energy','Equipment & Services','NYSE',28000],
  ['BKR','Baker Hughes','Energy','Equipment & Services','NASDAQ',35000],
  ['MRO','Marathon Oil','Energy','Exploration & Production','NYSE',14000],

  // Basic Materials
  ['LIN','Linde PLC','Basic Materials','Industrial Gases','NYSE',210000],
  ['APD','Air Products','Basic Materials','Industrial Gases','NYSE',65000],
  ['ECL','Ecolab Inc.','Basic Materials','Specialty Chemicals','NYSE',62000],
  ['SHW','Sherwin-Williams','Basic Materials','Specialty Chemicals','NYSE',85000],
  ['NEM','Newmont Corp.','Basic Materials','Gold Mining','NYSE',52000],
  ['FCX','Freeport-McMoRan','Basic Materials','Copper Mining','NYSE',62000],
  ['DOW','Dow Inc.','Basic Materials','Chemicals','NYSE',35000],
  ['PPG','PPG Industries','Basic Materials','Specialty Chemicals','NYSE',32000],
  ['NUE','Nucor Corp.','Basic Materials','Steel','NYSE',38000],
  ['STLD','Steel Dynamics','Basic Materials','Steel','NASDAQ',18000],
  ['CLF','Cleveland-Cliffs','Basic Materials','Steel','NYSE',8000],
  ['CF','CF Industries','Basic Materials','Agricultural Inputs','NYSE',15000],
  ['MOS','Mosaic Co.','Basic Materials','Agricultural Inputs','NYSE',10000],
  ['ALB','Albemarle Corp.','Basic Materials','Specialty Chemicals','NYSE',12000],
  ['IFF','IFF Inc.','Basic Materials','Specialty Chemicals','NYSE',22000],

  // Communication Services
  ['DIS','Walt Disney Co.','Communication Services','Entertainment','NYSE',195000],
  ['NFLX','Netflix Inc.','Communication Services','Entertainment','NASDAQ',310000],
  ['CMCSA','Comcast Corp.','Communication Services','Telecom','NASDAQ',155000],
  ['T','AT&T Inc.','Communication Services','Telecom','NYSE',145000],
  ['VZ','Verizon Comm.','Communication Services','Telecom','NYSE',168000],
  ['TMUS','T-Mobile US','Communication Services','Telecom','NASDAQ',235000],
  ['CHTR','Charter Comm.','Communication Services','Telecom','NASDAQ',52000],
  ['EA','Electronic Arts','Communication Services','Gaming','NASDAQ',38000],
  ['TTWO','Take-Two Interactive','Communication Services','Gaming','NASDAQ',28000],
  ['MTCH','Match Group','Communication Services','Internet Content','NASDAQ',8000],
  ['WBD','Warner Bros Discovery','Communication Services','Entertainment','NASDAQ',22000],
  ['PARA','Paramount Global','Communication Services','Entertainment','NASDAQ',7500],
  ['OMC','Omnicom Group','Communication Services','Advertising','NYSE',18000],
  ['LYV','Live Nation','Communication Services','Entertainment','NYSE',28000],
  ['PINS','Pinterest Inc.','Communication Services','Social Media','NYSE',22000],

  // Utilities
  ['NEE','NextEra Energy','Utilities','Electric Utilities','NYSE',155000],
  ['SO','Southern Company','Utilities','Electric Utilities','NYSE',88000],
  ['DUK','Duke Energy','Utilities','Electric Utilities','NYSE',82000],
  ['D','Dominion Energy','Utilities','Multi-Utilities','NYSE',42000],
  ['AEP','American Electric Power','Utilities','Electric Utilities','NASDAQ',52000],
  ['EXC','Exelon Corp.','Utilities','Electric Utilities','NASDAQ',42000],
  ['SRE','Sempra','Utilities','Multi-Utilities','NYSE',52000],
  ['XEL','Xcel Energy','Utilities','Electric Utilities','NASDAQ',35000],
  ['WEC','WEC Energy Group','Utilities','Multi-Utilities','NYSE',28000],
  ['ES','Eversource Energy','Utilities','Electric Utilities','NYSE',22000],
  ['ED','Consolidated Edison','Utilities','Electric Utilities','NYSE',32000],
  ['DTE','DTE Energy','Utilities','Multi-Utilities','NYSE',22000],

  // Real Estate
  ['PLD','Prologis Inc.','Real Estate','Industrial REIT','NYSE',115000],
  ['AMT','American Tower','Real Estate','Infrastructure REIT','NYSE',95000],
  ['CCI','Crown Castle','Real Estate','Infrastructure REIT','NYSE',42000],
  ['EQIX','Equinix Inc.','Real Estate','Data Center REIT','NASDAQ',78000],
  ['PSA','Public Storage','Real Estate','Self-Storage REIT','NYSE',52000],
  ['O','Realty Income','Real Estate','Retail REIT','NYSE',48000],
  ['DLR','Digital Realty','Real Estate','Data Center REIT','NYSE',42000],
  ['SPG','Simon Property Group','Real Estate','Retail REIT','NYSE',52000],
  ['VICI','VICI Properties','Real Estate','Gaming REIT','NYSE',32000],
  ['AVB','AvalonBay Communities','Real Estate','Residential REIT','NYSE',28000],
  ['EQR','Equity Residential','Real Estate','Residential REIT','NYSE',25000],
  ['WELL','Welltower Inc.','Real Estate','Healthcare REIT','NYSE',55000],
];

// ─── Sector Profiles ─────────────────────────────────────────
interface Profile {
  pe: [number, number]; fpe: [number, number]; peg: [number, number];
  ps: [number, number]; pb: [number, number]; eveb: [number, number];
  epsGr: [number, number]; revGr: [number, number];
  div: [number, number]; divProb: number;
  beta: [number, number]; margin: [number, number]; opMargin: [number, number];
  roe: [number, number]; roa: [number, number]; de: [number, number];
  cr: [number, number]; instOwn: [number, number];
  shortFloat: [number, number];
  priceBase: [number, number];
}

const PROFILES: Record<string, Profile> = {
  'Technology':             { pe:[18,80], fpe:[15,65], peg:[0.8,3.5], ps:[3,25], pb:[3,20], eveb:[12,50], epsGr:[-10,60], revGr:[-5,40], div:[0,1.2], divProb:0.3, beta:[0.9,1.8], margin:[5,35], opMargin:[8,40], roe:[10,50], roa:[5,25], de:[0,1.5], cr:[1.2,4], instOwn:[60,95], shortFloat:[1,10], priceBase:[15,800] },
  'Healthcare':             { pe:[15,60], fpe:[12,50], peg:[0.8,3.0], ps:[2,15], pb:[2,12], eveb:[10,35], epsGr:[-15,45], revGr:[-5,30], div:[0,2.5], divProb:0.5, beta:[0.5,1.3], margin:[8,30], opMargin:[10,35], roe:[10,40], roa:[4,20], de:[0.1,2.0], cr:[1.0,3.5], instOwn:[65,95], shortFloat:[1,8], priceBase:[20,600] },
  'Financial Services':     { pe:[8,22], fpe:[7,20], peg:[0.6,2.5], ps:[2,8], pb:[0.8,3.5], eveb:[6,18], epsGr:[-10,30], revGr:[-5,20], div:[0.5,4.0], divProb:0.85, beta:[0.8,1.6], margin:[15,35], opMargin:[20,45], roe:[8,22], roa:[0.5,3], de:[0.5,8], cr:[0.8,2], instOwn:[70,95], shortFloat:[1,6], priceBase:[20,500] },
  'Consumer Cyclical':      { pe:[12,45], fpe:[10,40], peg:[0.7,3.0], ps:[1,10], pb:[2,15], eveb:[8,30], epsGr:[-10,40], revGr:[-5,25], div:[0,2.5], divProb:0.5, beta:[0.8,1.7], margin:[3,20], opMargin:[5,25], roe:[10,40], roa:[4,18], de:[0.2,3], cr:[0.8,3], instOwn:[60,92], shortFloat:[2,12], priceBase:[10,500] },
  'Consumer Defensive':     { pe:[16,30], fpe:[14,28], peg:[1.5,4.0], ps:[1.5,6], pb:[3,12], eveb:[12,22], epsGr:[-5,15], revGr:[-3,10], div:[1.5,4.5], divProb:0.9, beta:[0.3,0.8], margin:[8,22], opMargin:[12,28], roe:[15,45], roa:[5,15], de:[0.3,2.5], cr:[0.6,2], instOwn:[65,90], shortFloat:[1,5], priceBase:[30,350] },
  'Industrials':            { pe:[14,35], fpe:[12,30], peg:[1.0,3.0], ps:[1.5,8], pb:[3,15], eveb:[10,25], epsGr:[-8,25], revGr:[-5,18], div:[0.5,3.0], divProb:0.75, beta:[0.7,1.4], margin:[6,18], opMargin:[10,22], roe:[12,35], roa:[4,14], de:[0.3,2.5], cr:[1.0,2.5], instOwn:[70,95], shortFloat:[1,7], priceBase:[30,500] },
  'Energy':                 { pe:[6,20], fpe:[5,18], peg:[0.5,2.0], ps:[0.5,3], pb:[1,4], eveb:[4,12], epsGr:[-30,50], revGr:[-20,30], div:[1.5,5.5], divProb:0.85, beta:[0.8,1.6], margin:[5,18], opMargin:[10,30], roe:[8,30], roa:[3,14], de:[0.3,1.8], cr:[0.8,2], instOwn:[65,90], shortFloat:[2,8], priceBase:[20,120] },
  'Basic Materials':        { pe:[10,28], fpe:[8,25], peg:[0.7,2.5], ps:[1,5], pb:[1.5,6], eveb:[6,18], epsGr:[-20,40], revGr:[-10,25], div:[0.5,3.5], divProb:0.7, beta:[0.8,1.5], margin:[5,18], opMargin:[8,25], roe:[8,25], roa:[3,12], de:[0.3,2], cr:[1.0,3], instOwn:[65,90], shortFloat:[2,10], priceBase:[15,250] },
  'Communication Services': { pe:[12,40], fpe:[10,35], peg:[0.8,3.0], ps:[1.5,10], pb:[1.5,10], eveb:[8,25], epsGr:[-10,35], revGr:[-5,20], div:[0,5.0], divProb:0.5, beta:[0.6,1.4], margin:[8,25], opMargin:[12,30], roe:[8,35], roa:[3,15], de:[0.5,3.5], cr:[0.8,2.5], instOwn:[60,90], shortFloat:[2,10], priceBase:[10,700] },
  'Utilities':              { pe:[15,28], fpe:[14,26], peg:[2.0,5.0], ps:[2,5], pb:[1.2,3], eveb:[10,18], epsGr:[-3,10], revGr:[-2,8], div:[2.5,5.5], divProb:0.98, beta:[0.2,0.7], margin:[10,20], opMargin:[18,35], roe:[8,14], roa:[2,6], de:[1.0,3.0], cr:[0.5,1.5], instOwn:[60,85], shortFloat:[1,5], priceBase:[30,100] },
  'Real Estate':            { pe:[20,50], fpe:[18,45], peg:[2.0,5.0], ps:[5,15], pb:[1.5,5], eveb:[15,30], epsGr:[-5,15], revGr:[-3,12], div:[2.0,5.5], divProb:0.95, beta:[0.4,1.1], margin:[15,40], opMargin:[25,55], roe:[3,12], roa:[1,5], de:[0.5,2.5], cr:[0.5,2], instOwn:[70,95], shortFloat:[2,8], priceBase:[30,250] },
};

// ─── Generate Single Stock ───────────────────────────────────
function generateStock(def: Def): Stock {
  const [ticker, name, sector, industry, exchange, baseMc] = def;
  const rng = seedRng(hashStr(ticker) * 31337);
  const p = PROFILES[sector] || PROFILES['Technology'];

  const marketCap = baseMc * between(rng, 0.85, 1.15);
  const price = between(rng, p.priceBase[0], p.priceBase[1]);
  const changePercent = between(rng, -5, 5);
  const change = price * changePercent / 100;
  const weekChange = between(rng, -8, 8);
  const monthChange = between(rng, -15, 15);
  const quarterChange = between(rng, -25, 25);
  const yearChange = between(rng, -40, 60);
  const ytdChange = between(rng, -30, 40);
  const gap = between(rng, -3, 3);

  const avgVolume = Math.floor(between(rng, 500000, 80000000));
  const relativeVolume = between(rng, 0.3, 4.0);
  const volume = Math.floor(avgVolume * relativeVolume);

  const hasDividend = rng() < p.divProb;
  const pe = rng() < 0.9 ? between(rng, p.pe[0], p.pe[1]) : null;
  const forwardPe = pe != null ? pe * between(rng, 0.7, 1.1) : null;
  const peg = pe != null ? between(rng, p.peg[0], p.peg[1]) : null;

  const beta = between(rng, p.beta[0], p.beta[1]);
  const rsi = between(rng, 22, 82);
  const high52w = price * between(rng, 1.02, 1.45);
  const low52w = price * between(rng, 0.55, 0.98);
  const sma20 = price * between(rng, 0.95, 1.05);
  const sma50 = price * between(rng, 0.90, 1.10);
  const sma200 = price * between(rng, 0.80, 1.20);
  const atr = price * between(rng, 0.01, 0.04);

  const profitMargin = between(rng, p.margin[0], p.margin[1]);
  const operatingMargin = between(rng, p.opMargin[0], p.opMargin[1]);
  const roe = between(rng, p.roe[0], p.roe[1]);
  const roa = between(rng, p.roa[0], p.roa[1]);
  const debtEquity = between(rng, p.de[0], p.de[1]);
  const currentRatio = between(rng, p.cr[0], p.cr[1]);
  const quickRatio = currentRatio * between(rng, 0.5, 0.95);

  const epsGrowth = between(rng, p.epsGr[0], p.epsGr[1]);
  const revenueGrowth = between(rng, p.revGr[0], p.revGr[1]);

  const institutionalOwnership = between(rng, p.instOwn[0], p.instOwn[1]);
  const insiderOwnership = between(rng, 0.5, 15);
  const shortFloat = between(rng, p.shortFloat[0], p.shortFloat[1]);

  const ratings = ['Strong Buy', 'Buy', 'Hold', 'Sell'];
  const analystRating = pick(rng, ratings);
  const analystScore = analystRating === 'Strong Buy' ? between(rng, 4.2, 5.0) :
    analystRating === 'Buy' ? between(rng, 3.5, 4.2) :
    analystRating === 'Hold' ? between(rng, 2.5, 3.5) : between(rng, 1.0, 2.5);

  const earningsDay = Math.floor(between(rng, 1, 60));
  const ed = new Date('2026-04-01');
  ed.setDate(ed.getDate() + earningsDay);
  const earningsDate = ed.toISOString().split('T')[0];

  const ipoYear = Math.floor(between(rng, 1970, 2023));
  const ipoDate = `${ipoYear}-01-01`;
  const employees = Math.floor(between(rng, 500, 500000));

  // 30-day sparkline
  const sparkline: number[] = [];
  let sp = price * between(rng, 0.92, 1.0);
  for (let i = 0; i < 30; i++) {
    sp *= 1 + between(rng, -0.03, 0.03);
    sparkline.push(Number(sp.toFixed(2)));
  }

  return {
    ticker, name, sector, industry, exchange, country: 'US',
    price: Number(price.toFixed(2)),
    change: Number(change.toFixed(2)),
    changePercent: Number(changePercent.toFixed(2)),
    weekChange: Number(weekChange.toFixed(2)),
    monthChange: Number(monthChange.toFixed(2)),
    quarterChange: Number(quarterChange.toFixed(2)),
    yearChange: Number(yearChange.toFixed(2)),
    ytdChange: Number(ytdChange.toFixed(2)),
    gap: Number(gap.toFixed(2)),
    volume, avgVolume,
    relativeVolume: Number(relativeVolume.toFixed(2)),
    marketCap: Math.round(marketCap),
    pe: pe != null ? Number(pe.toFixed(1)) : null,
    forwardPe: forwardPe != null ? Number(forwardPe.toFixed(1)) : null,
    peg: peg != null ? Number(peg.toFixed(2)) : null,
    priceSales: Number(between(rng, p.ps[0], p.ps[1]).toFixed(1)),
    priceBook: Number(between(rng, p.pb[0], p.pb[1]).toFixed(1)),
    evEbitda: Number(between(rng, p.eveb[0], p.eveb[1]).toFixed(1)),
    epsGrowth: Number(epsGrowth.toFixed(1)),
    revenueGrowth: Number(revenueGrowth.toFixed(1)),
    profitMargin: Number(profitMargin.toFixed(1)),
    operatingMargin: Number(operatingMargin.toFixed(1)),
    roe: Number(roe.toFixed(1)),
    roa: Number(roa.toFixed(1)),
    debtEquity: Number(debtEquity.toFixed(2)),
    currentRatio: Number(currentRatio.toFixed(2)),
    quickRatio: Number(quickRatio.toFixed(2)),
    dividendYield: hasDividend ? Number(between(rng, p.div[0], p.div[1]).toFixed(2)) : 0,
    rsi: Math.round(rsi),
    beta: Number(beta.toFixed(2)),
    atr: Number(atr.toFixed(2)),
    sma20: Number(sma20.toFixed(2)),
    sma50: Number(sma50.toFixed(2)),
    sma200: Number(sma200.toFixed(2)),
    high52w: Number(high52w.toFixed(2)),
    low52w: Number(low52w.toFixed(2)),
    fromHigh52w: Number(((price - high52w) / high52w * 100).toFixed(1)),
    fromLow52w: Number(((price - low52w) / low52w * 100).toFixed(1)),
    institutionalOwnership: Number(institutionalOwnership.toFixed(1)),
    insiderOwnership: Number(insiderOwnership.toFixed(1)),
    shortFloat: Number(shortFloat.toFixed(1)),
    analystRating,
    analystScore: Number(analystScore.toFixed(1)),
    earningsDate,
    ipoDate,
    employees,
    sparkline,
  };
}

// ─── Cached Dataset ──────────────────────────────────────────
let _cache: Stock[] | null = null;

export function getAllStocks(): Stock[] {
  if (!_cache) _cache = DEFS.map(generateStock);
  return _cache;
}

export function getStockByTicker(ticker: string): Stock | undefined {
  return getAllStocks().find(s => s.ticker === ticker);
}

export function getSectors(): string[] {
  const set = new Set(getAllStocks().map(s => s.sector));
  return [...set].sort();
}

export function getIndustries(): string[] {
  const set = new Set(getAllStocks().map(s => s.industry));
  return [...set].sort();
}

export function getStockCount(): number {
  return DEFS.length;
}
