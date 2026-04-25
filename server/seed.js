/**
 * AgroSmart Database Seed Script
 * Seeds the 'agrosmart' database with all project data:
 *   - 40+ Crops (advisory data)
 *   - 6 Government Schemes
 *   - Market Prices
 *   - Sample Contacts & Newsletter entries
 *
 * Usage: node server/seed.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const Crop = require('./models/Crop');
const Scheme = require('./models/Scheme');
const MarketPrice = require('./models/MarketPrice');
const Contact = require('./models/Contact');
const Newsletter = require('./models/Newsletter');

// ═══════════════════════════════════════════════════════════
//  CROP DATA (from advisory.html)
// ═══════════════════════════════════════════════════════════
const cropsData = [
    {
        name: 'Rice',
        image: 'rice.jpg',
        category: 'cereal',
        soil: 'Clayey / Loamy',
        season: 'Kharif (June-July)',
        fertilizer: 'NPK (120:60:40)',
        yield: '3.5 - 5 Tons/Acre',
        advice: 'Requires standing water during the transplanting phase. Maintain water levels of 2-5cm. Control weed growth in the first 40 days.',
        waterRequirement: 'high',
        growthDuration: '120-150 days'
    },
    {
        name: 'Wheat',
        image: 'wheat.jpg',
        category: 'cereal',
        soil: 'Well-drained Loamy',
        season: 'Rabi (Oct-Nov)',
        fertilizer: 'NPK (100:50:25)',
        yield: '2.5 - 4 Tons/Acre',
        advice: 'Critical irrigation stages are CRI (21 days after sowing) and heading. Use quality treated seeds to prevent rust disease.',
        waterRequirement: 'medium',
        growthDuration: '110-130 days'
    },
    {
        name: 'Cotton',
        image: 'cotton.jpg',
        category: 'cash_crop',
        soil: 'Black / Deep Alluvial',
        season: 'Kharif (May-June)',
        fertilizer: 'NPK (80:40:40)',
        yield: '8 - 12 Quintals',
        advice: 'Avoid fertilization after flowering begins. Monitor for pink bollworm. Picking should be done in dry weather for quality.',
        waterRequirement: 'medium',
        growthDuration: '150-180 days'
    },
    {
        name: 'Sugarcane',
        image: 'sugarcane.jpg',
        category: 'cash_crop',
        soil: 'Deep Rich Loamy',
        season: 'Annual (Jan-Feb)',
        fertilizer: 'NPK (150:75:75)',
        yield: '35 - 50 Tons',
        advice: 'Requires heavy irrigation until the ripening stage. Earthing up is necessary to prevent lodging. Control shoot borer early.',
        waterRequirement: 'high',
        growthDuration: '12-18 months'
    },
    {
        name: 'Maize',
        image: 'babycorn.jpg',
        category: 'cereal',
        soil: 'Sandy Loam',
        season: 'Kharif (June-July)',
        fertilizer: 'NPK (120:60:40)',
        yield: '2.5 - 4 Tons',
        advice: 'Ensure proper drainage to prevent waterlogging. Apply nitrogen in split doses. Monitor for fall armyworm, especially in early stages.',
        waterRequirement: 'medium',
        growthDuration: '90-120 days'
    },
    {
        name: 'Tomato',
        image: 'tomato.jpg',
        category: 'vegetable',
        soil: 'Well-drained Loam',
        season: 'Year-round',
        fertilizer: 'NPK (100:80:60)',
        yield: '10 - 15 Tons',
        advice: 'Staking is essential for better fruit quality. Avoid overhead watering to prevent blight. Boost calcium to prevent rot.',
        waterRequirement: 'medium',
        growthDuration: '60-90 days'
    },
    {
        name: 'Banana',
        image: 'banana.jpg',
        category: 'fruit',
        soil: 'Deep Alluvial',
        season: 'Jun - July',
        fertilizer: 'NPK (110:35:330)',
        yield: '20 - 30 Tons',
        advice: 'Heavy feeder of potassium. Provide windbreaks to prevent leaf tearing. Remove suckers regularly for better yield.',
        waterRequirement: 'high',
        growthDuration: '10-12 months'
    },
    {
        name: 'Groundnut',
        image: 'groundnut.jpg',
        category: 'oilseed',
        soil: 'Sandy / Red Loamy',
        season: 'Kharif (June-July)',
        fertilizer: 'NPK (20:40:40)',
        yield: '1.5 - 2 Tons',
        advice: 'Apply gypsum during pegging stage. Well-drained soil is critical to prevent pod rot. Harvest when inner pod turns dark.',
        waterRequirement: 'low',
        growthDuration: '100-130 days'
    },
    {
        name: 'Black Pepper',
        image: 'blackpepper.jpg',
        category: 'spice',
        soil: 'Well-drained Red/Laterite',
        season: 'May - June',
        fertilizer: 'NPK (50:50:150)',
        yield: '2000 kg/ha',
        advice: 'Provide support for vines to climb. Ensure good drainage to prevent foot rot. Harvest when berries turn reddish-orange.',
        waterRequirement: 'medium',
        growthDuration: '3-4 years (first harvest)'
    },
    {
        name: 'Cardamom',
        image: 'Cardamom.jpg.png',
        category: 'spice',
        soil: 'Forest Loam (Acidic)',
        season: 'Aug - Sept',
        fertilizer: 'NPK (75:75:150)',
        yield: '250 - 500 kg/ha',
        advice: 'Requires shade and high humidity. Mulching is crucial for moisture retention. Hand pollination can increase yield.',
        waterRequirement: 'high',
        growthDuration: '2-3 years (first harvest)'
    },
    {
        name: 'Turmeric',
        image: 'turmeric.jpg',
        category: 'spice',
        soil: 'Well-drained Sandy/Clay Loam',
        season: 'May - June',
        fertilizer: 'NPK (60:60:120)',
        yield: '20-25 Tons/ha',
        advice: 'Plant rhizomes in well-prepared beds. Requires consistent moisture during growth. Harvest when leaves turn yellow and dry.',
        waterRequirement: 'medium',
        growthDuration: '7-9 months'
    },
    {
        name: 'Ginger',
        image: 'ginger.jpg',
        category: 'spice',
        soil: 'Well-drained Sandy/Clay Loam',
        season: 'May - June',
        fertilizer: 'NPK (75:50:50)',
        yield: '15-20 Tons/ha',
        advice: 'Thrives in partial shade. Heavy mulching is mandatory to conserve moisture and suppress weeds. Watch for rhizome rot.',
        waterRequirement: 'medium',
        growthDuration: '8-10 months'
    },
    {
        name: 'Clove',
        image: 'clove.jpg',
        category: 'spice',
        soil: 'Deep Rich Loam',
        season: 'Sept - Oct',
        fertilizer: '300:300:900 (g/tree)',
        yield: '4 - 8 kg/tree',
        advice: 'Requires deep, fertile soil and high humidity. Protect young plants from direct sun. Harvest flower buds before they open.',
        waterRequirement: 'medium',
        growthDuration: '4-5 years (first harvest)'
    },
    {
        name: 'Coriander',
        image: 'coriander.jpg',
        category: 'spice',
        soil: 'Loamy',
        season: 'Oct - Nov',
        fertilizer: 'NPK (20:30:20)',
        yield: '500-1000 kg/ha',
        advice: 'Sow directly as transplanting is difficult. Requires cool weather for good seed production. Harvest leaves before flowering for best flavor.',
        waterRequirement: 'low',
        growthDuration: '40-60 days'
    },
    {
        name: 'Cumin',
        image: 'cumin.jpg',
        category: 'spice',
        soil: 'Well-drained Sandy Loam',
        season: 'Oct - Nov',
        fertilizer: 'NPK (30:15:0)',
        yield: '500-600 kg/ha',
        advice: 'Requires cool, dry weather. Avoid over-watering to prevent fungal diseases. Harvest when seeds turn yellowish-brown.',
        waterRequirement: 'low',
        growthDuration: '100-120 days'
    },
    {
        name: 'Tea',
        image: 'tea.jpg',
        category: 'plantation',
        soil: 'Deep Acidic Soil',
        season: 'Year-round',
        fertilizer: 'NPK (120:60:60)',
        yield: '1500-2500 kg/ha',
        advice: 'Requires acidic soil and high rainfall. Regular pruning is essential for continuous flush. Pluck young leaves and buds for quality.',
        waterRequirement: 'high',
        growthDuration: '3 years (first harvest)'
    },
    {
        name: 'Coffee',
        image: 'coffee.jpg',
        category: 'plantation',
        soil: 'Deep Rich Forest Soil',
        season: 'Year-round',
        fertilizer: 'NPK (160:120:160)',
        yield: '1000-2000 kg/ha',
        advice: 'Requires partial shade and well-distributed rainfall. Pruning helps maintain plant shape and yield. Harvest ripe red cherries.',
        waterRequirement: 'medium',
        growthDuration: '3-4 years (first harvest)'
    },
    {
        name: 'Rubber',
        image: 'rubber.jpg',
        category: 'plantation',
        soil: 'Deep Well-drained',
        season: 'Year-round',
        fertilizer: 'NPK (30:30:30)',
        yield: '1000-2000 kg/ha',
        advice: 'Requires high humidity and well-drained soil. Tapping should be done carefully to avoid damaging the tree. Protect from strong winds.',
        waterRequirement: 'high',
        growthDuration: '6-7 years (first tapping)'
    },
    {
        name: 'Coconut',
        image: 'cocunut.jpg',
        category: 'plantation',
        soil: 'Sandy / Loamy',
        season: 'Year-round',
        fertilizer: '500:320:1200 (g/palm)',
        yield: '60 - 100 nuts/palm',
        advice: 'Requires sandy or loamy soil and coastal climate. Regular irrigation during dry periods is crucial. Apply micronutrients for better yield.',
        waterRequirement: 'medium',
        growthDuration: '5-6 years (first harvest)'
    },
    {
        name: 'Potato',
        image: 'potato.jpg',
        category: 'vegetable',
        soil: 'Well-drained Sandy/Clay Loam',
        season: 'Oct - Nov',
        fertilizer: 'NPK (120:100:100)',
        yield: '20-30 Tons/ha',
        advice: 'Plant certified seed potatoes. Earthing up is vital to protect tubers from greening. Manage late blight with fungicides.',
        waterRequirement: 'medium',
        growthDuration: '75-120 days'
    },
    {
        name: 'Onion',
        image: 'onion.jpg',
        category: 'vegetable',
        soil: 'Loamy',
        season: 'Oct - Nov',
        fertilizer: 'NPK (100:50:50)',
        yield: '25-30 Tons/ha',
        advice: 'Requires well-drained soil and full sun. Avoid excessive nitrogen late in the season. Harvest when tops fall over naturally.',
        waterRequirement: 'medium',
        growthDuration: '90-120 days'
    },
    {
        name: 'Brinjal',
        image: 'brinjal.jpg',
        category: 'vegetable',
        soil: 'Well-drained Loamy',
        season: 'Year-round',
        fertilizer: 'NPK (100:50:50)',
        yield: '25-35 Tons/ha',
        advice: 'Requires warm weather and consistent moisture. Support plants to prevent breakage. Monitor for fruit and shoot borer.',
        waterRequirement: 'medium',
        growthDuration: '60-80 days'
    },
    {
        name: 'Cabbage',
        image: 'cabbage.jpg',
        category: 'vegetable',
        soil: 'Well-drained Sandy Loam',
        season: 'Sept - Oct',
        fertilizer: 'NPK (120:60:60)',
        yield: '30-40 Tons/ha',
        advice: 'Requires cool weather and consistent moisture. Protect from cabbage worms and aphids. Harvest when heads are firm.',
        waterRequirement: 'medium',
        growthDuration: '60-90 days'
    },
    {
        name: 'Cauliflower',
        image: 'Cauliflower.jpg',
        category: 'vegetable',
        soil: 'Well-drained Clay Loam',
        season: 'Sept - Oct',
        fertilizer: 'NPK (120:60:60)',
        yield: '20-30 Tons/ha',
        advice: 'Requires cool temperatures and rich, moist soil. Blanching the curds by tying leaves helps maintain white color.',
        waterRequirement: 'medium',
        growthDuration: '60-100 days'
    },
    {
        name: 'Carrot',
        image: 'carrot.jpg',
        category: 'vegetable',
        soil: 'Well-drained Sandy Loam',
        season: 'Sept - Oct',
        fertilizer: 'NPK (60:60:100)',
        yield: '25-30 Tons/ha',
        advice: 'Sow in loose, stone-free soil for straight roots. Keep soil consistently moist. Harvest when roots reach desired size.',
        waterRequirement: 'medium',
        growthDuration: '70-80 days'
    },
    {
        name: 'Mango',
        image: 'mango.jpg',
        category: 'fruit',
        soil: 'Deep Well-drained Alluvial',
        season: 'July - Aug',
        fertilizer: '1000:500:1000 (g/tree)',
        yield: '400-600 fruits/tree',
        advice: 'Requires deep, well-drained soil. Pruning is essential for canopy management. Protect young fruits from fruit flies.',
        waterRequirement: 'medium',
        growthDuration: '5-6 years (first fruit)'
    },
    {
        name: 'Apple',
        image: 'apple.jpg',
        category: 'fruit',
        soil: 'Loamy',
        season: 'Dec - Jan',
        fertilizer: '350:175:350 (g/tree)',
        yield: '10-20 Tons/ha',
        advice: 'Requires specific chilling hours for bud break. Pruning during dormancy is vital for fruit quality. Thin fruits to ensure good size.',
        waterRequirement: 'medium',
        growthDuration: '4-5 years (first fruit)'
    },
    {
        name: 'Orange',
        image: 'orange.jpg',
        category: 'fruit',
        soil: 'Well-drained Alluvial/Red',
        season: 'July - Aug',
        fertilizer: '600:200:400 (g/tree)',
        yield: '30-40 Tons/ha',
        advice: 'Requires sunny location and well-drained soil. Avoid waterlogging around the root zone. Mulching helps retain moisture.',
        waterRequirement: 'medium',
        growthDuration: '3-5 years (first fruit)'
    },
    {
        name: 'Grapes',
        image: 'grape.jpg',
        category: 'fruit',
        soil: 'Well-drained Sandy Loam',
        season: 'Jan - Feb',
        fertilizer: '500:500:1000 (g/vine)',
        yield: '20-25 Tons/ha',
        advice: 'Pruning is the most important task for fruit production. Provide sturdy trellising. Watch for powdery mildew.',
        waterRequirement: 'medium',
        growthDuration: '2-3 years (first fruit)'
    },
    {
        name: 'Guava',
        image: 'guava.jpg',
        category: 'fruit',
        soil: 'Well-drained Loamy',
        season: 'July - Aug',
        fertilizer: '600:300:600 (g/tree)',
        yield: '15-25 Tons/ha',
        advice: 'Hardy crop that thrives in tropical climates. Training and pruning help maintain manageable height. Monitor for fruit flies.',
        waterRequirement: 'medium',
        growthDuration: '2-3 years (first fruit)'
    },
    {
        name: 'Pomegranate',
        image: 'Pomegranate.jpg',
        category: 'fruit',
        soil: 'Well-drained Sandy Loam',
        season: 'July - Aug',
        fertilizer: '625:250:250 (g/tree)',
        yield: '18-20 Tons/ha',
        advice: 'Drought-tolerant but yields better with regular irrigation. Bahar treatment is necessary for flower induction. Harvest when fruit turns yellowish-red.',
        waterRequirement: 'low',
        growthDuration: '2-3 years (first fruit)'
    },
    {
        name: 'Mustard',
        image: 'mustard.jpg',
        category: 'oilseed',
        soil: 'Well-drained Sandy Loam',
        season: 'Oct - Nov',
        fertilizer: 'NPK (60:40:40)',
        yield: '1.5 - 2 Tons/ha',
        advice: 'Cold climate oilseed. Sowing in October gives best yield. Monitor for mustard aphid and white rust. Harvest when pods turn golden.',
        waterRequirement: 'low',
        growthDuration: '110-140 days'
    },
    {
        name: 'Soybean',
        image: 'soyabean.jpg',
        category: 'oilseed',
        soil: 'Well-drained Loamy',
        season: 'June - July',
        fertilizer: 'NPK (20:60:40)',
        yield: '2-3 Tons/ha',
        advice: 'Nitrogen fixation crop. Inoculate seeds with Rhizobium for better growth. Maintain moisture during flower and pod stages.',
        waterRequirement: 'medium',
        growthDuration: '95-110 days'
    },
    {
        name: 'Sunflower',
        image: 'sunflowers.jpg',
        category: 'oilseed',
        soil: 'Well-drained Loamy',
        season: 'Year-round',
        fertilizer: 'NPK (60:40:40)',
        yield: '1.5 - 2 Tons/ha',
        advice: 'Requires full sun and well-drained soil. Protect from birds during ripening phase. Harvest when back of flower head turns yellow.',
        waterRequirement: 'low',
        growthDuration: '80-100 days'
    },
    {
        name: 'Sesame (Til)',
        image: 'Sesame.jpg',
        category: 'oilseed',
        soil: 'Well-drained Sandy Loam',
        season: 'June - July',
        fertilizer: 'NPK (25:15:15)',
        yield: '500-800 kg/ha',
        advice: 'Requires minimal watering after establishment. Extremely drought-tolerant. Harvest when capsules at the base turn brown.',
        waterRequirement: 'low',
        growthDuration: '80-95 days'
    },
    {
        name: 'Tobacco',
        image: 'tobacco.jpg',
        category: 'cash_crop',
        soil: 'Well-drained Sandy Loam',
        season: 'Oct - Nov',
        fertilizer: 'NPK (100:50:50)',
        yield: '1.5 - 2 Tons/ha',
        advice: 'Topping and desuckering are crucial for leaf quality. Controlled irrigation required during curing phase.',
        waterRequirement: 'medium',
        growthDuration: '90-120 days'
    },
    {
        name: 'Gram (Chickpea)',
        image: 'gram.jpg',
        category: 'pulse',
        soil: 'Well-drained Loamy',
        season: 'Oct - Nov',
        fertilizer: 'NPK (20:60:20)',
        yield: '1 - 2 Tons/ha',
        advice: 'Requires cool, dry climate. Nipping of young branches promotes lateral growth. Monitor for pod borer.',
        waterRequirement: 'low',
        growthDuration: '90-120 days'
    },
    {
        name: 'Arhar (Pigeon Pea)',
        image: 'arhar.jpg',
        category: 'pulse',
        soil: 'Well-drained Loamy',
        season: 'June - July',
        fertilizer: 'NPK (20:50:20)',
        yield: '1.5 - 2 Tons/ha',
        advice: 'Intercropping with sorghum or pearl millet is recommended. Avoid waterlogging during flowering stage.',
        waterRequirement: 'low',
        growthDuration: '120-180 days'
    },
    {
        name: 'Moong (Green Gram)',
        image: 'mung.jpg',
        category: 'pulse',
        soil: 'Well-drained Loamy',
        season: 'June - July',
        fertilizer: 'NPK (20:40:20)',
        yield: '0.8 - 1.2 Tons/ha',
        advice: 'Drought-resistant pulse. Pick pods manually as they ripen. Highly susceptible to yellow mosaic virus.',
        waterRequirement: 'low',
        growthDuration: '60-75 days'
    },
    {
        name: 'Urad (Black Gram)',
        image: 'urad.jpg',
        category: 'pulse',
        soil: 'Well-drained Loamy',
        season: 'Kharif (June-July)',
        fertilizer: 'NPK (20:40:20)',
        yield: '0.6 - 1.0 Tons/ha',
        advice: 'Grows well in hot and humid climates. Requires well-drained loamy soil. Harvest when pods turn black.',
        waterRequirement: 'low',
        growthDuration: '70-90 days'
    },
    {
        name: 'Peas',
        image: 'pea.jpg',
        category: 'pulse',
        soil: 'Well-drained Loamy',
        season: 'Oct - Nov',
        fertilizer: 'NPK (20:60:40)',
        yield: '2 - 3 Tons/ha',
        advice: 'Requires cool climate and well-drained soil. Provide support for vines. Harvest when pods are full and green.',
        waterRequirement: 'medium',
        growthDuration: '60-90 days'
    },
    {
        name: 'Barley',
        image: 'barley.jpg',
        category: 'cereal',
        soil: 'Well-drained Loamy',
        season: 'Rabi (Oct-Nov)',
        fertilizer: 'NPK (60:30:20)',
        yield: '1.5 - 2.5 Tons/Acre',
        advice: 'Malt-quality barley requires careful nitrogen management. Avoid late irrigation to prevent lodging. Ensure proper drainage during early growth.',
        waterRequirement: 'low',
        growthDuration: '100-130 days'
    },
    {
        name: 'Sorghum (Jowar)',
        image: 'sorghum.jpg',
        category: 'millet',
        soil: 'Alluvial / Black',
        season: 'Kharif / Rabi',
        fertilizer: 'NPK (80:40:40)',
        yield: '1.2 - 1.8 Tons/Acre',
        advice: 'Extremely drought-tolerant. Ensure proper spacing for better grain development. Harvest when grain moisture is below 25%.',
        waterRequirement: 'low',
        growthDuration: '100-120 days'
    },
    {
        name: 'Pearl Millet (Bajra)',
        image: 'pearl.jpg',
        category: 'millet',
        soil: 'Sandy / Shallow Black',
        season: 'Kharif (June-July)',
        fertilizer: 'NPK (40:20:20)',
        yield: '0.8 - 1.2 Tons/Acre',
        advice: 'Requires very little water. Good for dry regions. Watch for downy mildew. Harvest when grains are hard and dry.',
        waterRequirement: 'low',
        growthDuration: '65-85 days'
    },
    {
        name: 'Ragi (Finger Millet)',
        image: 'ragi.jpg',
        category: 'millet',
        soil: 'Red / Sandy Loam',
        season: 'Kharif (June-July)',
        fertilizer: 'NPK (60:30:30)',
        yield: '1.5 - 2.5 Tons/Acre',
        advice: 'Highly nutritious and resistant to many pests. Transplanting gives better yield than direct sowing. Good for iron-rich diet.',
        waterRequirement: 'low',
        growthDuration: '90-120 days'
    },
    {
        name: 'Tapioca (Cassava)',
        image: 'tapioca.jpg',
        category: 'tuber',
        soil: 'Sandy Loam / Clay Loam',
        season: 'Year-round',
        fertilizer: 'NPK (50:50:100)',
        yield: '10 - 15 Tons/Acre',
        advice: 'Requires well-drained soil to prevent tuber rot. Harvest when leaves turn yellow and dry. Excellent crop for marginal lands.',
        waterRequirement: 'low',
        growthDuration: '8-12 months'
    }
];

// ═══════════════════════════════════════════════════════════
//  GOVERNMENT SCHEMES DATA (from schemes.html)
// ═══════════════════════════════════════════════════════════
const schemesData = [
    {
        title: 'PMFBY (Crop Insurance)',
        category: 'insurance',
        icon: 'fa-shield-alt',
        color: 'warning',
        description: 'Pradhan Mantri Fasal Bima Yojana offers comprehensive insurance coverage against crop failure.',
        benefits: ['Low premium rates', 'Fast claim settlement'],
        eligibility: 'All farmers growing notified crops in notified areas',
        applicationLink: 'https://pmfby.gov.in'
    },
    {
        title: 'PM-KISAN (Income Support)',
        category: 'financial',
        icon: 'fa-hand-holding-usd',
        color: 'success',
        description: 'Direct income support of ₹6,000 per year to supplement financial needs of farmers.',
        benefits: ['Direct Benefit Transfer', 'National wide coverage'],
        eligibility: 'All landholding farmer families with cultivable land',
        applicationLink: 'https://pmkisan.gov.in'
    },
    {
        title: 'Soil Health Card',
        category: 'technical',
        icon: 'fa-flask',
        color: 'info',
        description: 'Helping farmers understand their soil productivity and correct nutrient deficiencies.',
        benefits: ['Nutrient status info', 'Fertilizer advice'],
        eligibility: 'All farmers across India',
        applicationLink: 'https://soilhealth.dac.gov.in'
    },
    {
        title: 'Kisan Credit Card (KCC)',
        category: 'financial',
        icon: 'fa-credit-card',
        color: 'primary',
        description: 'Providing adequate and timely credit support from the banking system to farmers.',
        benefits: ['Flexible credit', 'Low interest rates'],
        eligibility: 'All farmers including tenant farmers, oral lessees and sharecroppers',
        applicationLink: 'https://www.pmkisan.gov.in/kcc'
    },
    {
        title: 'PM-KUSUM (Solar Pumps)',
        category: 'technical',
        icon: 'fa-solar-panel',
        color: 'success',
        description: 'Installation of solar pumps and grid-connected solar power plants for farmers.',
        benefits: ['60% subsidy', 'Reduced diesel costs'],
        eligibility: 'All farmers with agricultural land and water source',
        applicationLink: 'https://pmkusum.mnre.gov.in'
    },
    {
        title: 'Paramparagat Krishi Vikas',
        category: 'technical',
        icon: 'fa-seedling',
        color: 'success',
        description: 'Promoting organic farming through cluster approach and Participatory Guarantee System.',
        benefits: ['Organic certification', 'Market assistance'],
        eligibility: 'Farmer groups willing to adopt organic farming practices',
        applicationLink: 'https://pgsindia-ncof.gov.in'
    }
];

// ═══════════════════════════════════════════════════════════
//  MARKET PRICES DATA (from market.html)
// ═══════════════════════════════════════════════════════════
const marketPricesData = [
    { crop: 'Rice', market: 'Chennai', state: 'Tamil Nadu', price: 2200, trend: 'up', trendPercent: 2.5 },
    { crop: 'Wheat', market: 'Delhi', state: 'Delhi', price: 2100, trend: 'down', trendPercent: 1.2 },
    { crop: 'Cotton', market: 'Mumbai', state: 'Maharashtra', price: 6400, trend: 'up', trendPercent: 5.0 },
    { crop: 'Sugarcane', market: 'Pune', state: 'Maharashtra', price: 3150, trend: 'stable', trendPercent: 0 },
    { crop: 'Maize', market: 'Hyderabad', state: 'Telangana', price: 1850, trend: 'up', trendPercent: 1.8 },
    { crop: 'Tomato', market: 'Bangalore', state: 'Karnataka', price: 3200, trend: 'down', trendPercent: 3.5 },
    { crop: 'Onion', market: 'Nashik', state: 'Maharashtra', price: 1800, trend: 'up', trendPercent: 4.2 },
    { crop: 'Potato', market: 'Agra', state: 'Uttar Pradesh', price: 1200, trend: 'stable', trendPercent: 0 },
    { crop: 'Groundnut', market: 'Rajkot', state: 'Gujarat', price: 5500, trend: 'up', trendPercent: 2.1 },
    { crop: 'Soybean', market: 'Indore', state: 'Madhya Pradesh', price: 4800, trend: 'down', trendPercent: 1.5 },
    { crop: 'Banana', market: 'Tiruchirappalli', state: 'Tamil Nadu', price: 2800, trend: 'up', trendPercent: 3.0 },
    { crop: 'Mango', market: 'Lucknow', state: 'Uttar Pradesh', price: 4500, trend: 'up', trendPercent: 6.0 },
    { crop: 'Turmeric', market: 'Erode', state: 'Tamil Nadu', price: 12500, trend: 'up', trendPercent: 8.0 },
    { crop: 'Black Pepper', market: 'Kochi', state: 'Kerala', price: 52000, trend: 'up', trendPercent: 4.5 },
    { crop: 'Coffee', market: 'Chikmagalur', state: 'Karnataka', price: 22000, trend: 'stable', trendPercent: 0 },
    { crop: 'Tea', market: 'Siliguri', state: 'West Bengal', price: 18000, trend: 'down', trendPercent: 2.0 },
    { crop: 'Coconut', market: 'Kozhikode', state: 'Kerala', price: 2600, trend: 'up', trendPercent: 1.5 },
    { crop: 'Mustard', market: 'Alwar', state: 'Rajasthan', price: 5200, trend: 'up', trendPercent: 3.2 },
    { crop: 'Gram', market: 'Jaipur', state: 'Rajasthan', price: 4900, trend: 'down', trendPercent: 1.0 },
    { crop: 'Arhar', market: 'Latur', state: 'Maharashtra', price: 6800, trend: 'up', trendPercent: 2.8 }
];

// ═══════════════════════════════════════════════════════════
//  SAMPLE CONTACT SUBMISSIONS
// ═══════════════════════════════════════════════════════════
const contactsData = [
    {
        name: 'Rajesh Kumar',
        email: 'rajesh.kumar@example.com',
        subject: 'Rice cultivation query',
        message: 'I need guidance on best rice varieties for Tamil Nadu climate. My land has clayey soil.'
    },
    {
        name: 'Priya Sharma',
        email: 'priya.sharma@example.com',
        subject: 'Organic farming support',
        message: 'I want to transition to organic farming for my 10-acre wheat farm. What government schemes can help?'
    },
    {
        name: 'Suresh Patel',
        email: 'suresh.patel@example.com',
        subject: 'Pest control advice',
        message: 'Fall armyworm is destroying my maize crop. Need urgent advice on bio-pesticides.'
    }
];

// ═══════════════════════════════════════════════════════════
//  SAMPLE NEWSLETTER SUBSCRIBERS
// ═══════════════════════════════════════════════════════════
const newsletterData = [
    { email: 'farmer1@example.com' },
    { email: 'farmer2@example.com' },
    { email: 'agriexpert@example.com' },
    { email: 'organic.farm@example.com' },
    { email: 'kisanhelp@example.com' }
];


// ═══════════════════════════════════════════════════════════
//  SEED FUNCTION
// ═══════════════════════════════════════════════════════════
async function seedDatabase() {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI, {
            dbName: 'agrosmart'
        });
        console.log('\n🌾 ═════════════════════════════════════════════');
        console.log('   AgroSmart Database Seeder');
        console.log('🌾 ═════════════════════════════════════════════\n');
        console.log(`📦 Connected to: ${mongoose.connection.name}\n`);

        // Clear existing data and drop indexes
        console.log('🗑️  Clearing existing data...');
        await Crop.collection.drop().catch(() => {});
        await Scheme.collection.drop().catch(() => {});
        await MarketPrice.collection.drop().catch(() => {});
        await Contact.collection.drop().catch(() => {});
        await Newsletter.collection.drop().catch(() => {});
        console.log('   ✅ All collections cleared\n');

        // Seed Crops
        console.log('🌱 Seeding Crops...');
        const cropsWithSlugs = cropsData.map(crop => ({
            ...crop,
            slug: crop.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
        }));
        const crops = await Crop.insertMany(cropsWithSlugs);
        console.log(`   ✅ ${crops.length} crops inserted\n`);

        // Seed Schemes
        console.log('📋 Seeding Government Schemes...');
        const schemes = await Scheme.insertMany(schemesData);
        console.log(`   ✅ ${schemes.length} schemes inserted\n`);

        // Seed Market Prices
        console.log('📊 Seeding Market Prices...');
        const prices = await MarketPrice.insertMany(marketPricesData);
        console.log(`   ✅ ${prices.length} market prices inserted\n`);

        // Seed Contacts
        console.log('📩 Seeding Sample Contacts...');
        const contacts = await Contact.insertMany(contactsData);
        console.log(`   ✅ ${contacts.length} contacts inserted\n`);

        // Seed Newsletter
        console.log('📧 Seeding Newsletter Subscribers...');
        const subscribers = await Newsletter.insertMany(newsletterData);
        console.log(`   ✅ ${subscribers.length} subscribers inserted\n`);

        // Summary
        console.log('🌾 ═════════════════════════════════════════════');
        console.log('   ✅ Database seeded successfully!');
        console.log('');
        console.log('   Collections populated:');
        console.log(`     📦 crops           → ${crops.length} documents`);
        console.log(`     📋 schemes         → ${schemes.length} documents`);
        console.log(`     📊 marketprices    → ${prices.length} documents`);
        console.log(`     📩 contacts        → ${contacts.length} documents`);
        console.log(`     📧 newsletters     → ${subscribers.length} documents`);
        console.log('🌾 ═════════════════════════════════════════════\n');

    } catch (error) {
        console.error('❌ Seeding failed:', error.message);
    } finally {
        await mongoose.connection.close();
        console.log('🔌 Database connection closed.');
        process.exit(0);
    }
}

seedDatabase();
