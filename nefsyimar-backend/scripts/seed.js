const { sequelize, GiftCatalog } = require('../src/models');

// Gift catalog data based on requirements
const giftCatalogData = [
  // 🌹 White Rose Collection – Purity & Remembrance
  {
    name: 'Single White Rose',
    name_amharic: 'አንድ ነጭ ሮዝ',
    description: 'A simple gesture of remembrance',
    description_amharic: 'የመታሰቢያ ቀላል ምልክት',
    symbolism: 'Represents purity, remembrance, and unconditional love',
    symbolism_amharic: 'ንፅህና፣ መታሰቢያ እና ያልተገደበ ፍቅርን ያመለክታል',
    category: 'WHITE_ROSE',
    value: 5.00,
    animation_type: 'petal_bloom',
    animation_duration: 3000,
    icon_url: '/assets/gifts/white-rose-single.svg',
    animation_url: '/assets/animations/petal-bloom.json',
    sort_order: 1
  },
  {
    name: 'White Rose Bouquet',
    name_amharic: 'ነጭ ሮዝ ጥቅል',
    description: 'Collective love and purity',
    description_amharic: 'የጋራ ፍቅር እና ንፅህና',
    symbolism: 'Multiple roses representing collective remembrance',
    symbolism_amharic: 'የጋራ መታሰቢያን የሚወክሉ በርካታ ሮዞች',
    category: 'WHITE_ROSE',
    value: 10.00,
    animation_type: 'multiple_petals_bloom',
    animation_duration: 4000,
    icon_url: '/assets/gifts/white-rose-bouquet.svg',
    animation_url: '/assets/animations/multiple-petals-bloom.json',
    sort_order: 2
  },
  {
    name: 'Lily & Rose Harmony',
    name_amharic: 'ሊሊ እና ሮዝ ስምምነት',
    description: 'Beauty of life and memory combined',
    description_amharic: 'የህይወት እና የመታሰቢያ ውበት ተዳምሮ',
    symbolism: 'Harmony between different flowers representing life\'s beauty',
    symbolism_amharic: 'የህይወትን ውበት የሚወክሉ የተለያዩ አበቦች መካከል ያለ ስምምነት',
    category: 'WHITE_ROSE',
    value: 15.00,
    animation_type: 'dual_flowers_opening',
    animation_duration: 5000,
    icon_url: '/assets/gifts/lily-rose-harmony.svg',
    animation_url: '/assets/animations/dual-flowers-opening.json',
    sort_order: 3
  },
  {
    name: 'Garden of White Roses',
    name_amharic: 'የነጭ ሮዞች ገነት',
    description: 'Eternal remembrance',
    description_amharic: 'ዘላለማዊ መታሰቢያ',
    symbolism: 'A garden representing eternal memory and lasting love',
    symbolism_amharic: 'ዘላለማዊ ትዝታ እና ዘላቂ ፍቅርን የሚወክል ገነት',
    category: 'WHITE_ROSE',
    value: 20.00,
    animation_type: 'garden_blooming_sequence',
    animation_duration: 6000,
    icon_url: '/assets/gifts/white-roses-garden.svg',
    animation_url: '/assets/animations/garden-blooming-sequence.json',
    sort_order: 4
  },
  {
    name: 'Field of Roses',
    name_amharic: 'የሮዞች ሜዳ',
    description: 'Universal tribute to all souls',
    description_amharic: 'ለሁሉም ነፍሳት ሁለንተናዊ ክብር',
    symbolism: 'An endless field representing universal love and remembrance',
    symbolism_amharic: 'ሁለንተናዊ ፍቅር እና መታሰቢያን የሚወክል ማለቂያ የሌለው ሜዳ',
    category: 'WHITE_ROSE',
    value: 25.00,
    animation_type: 'expanding_flower_field',
    animation_duration: 7000,
    icon_url: '/assets/gifts/roses-field.svg',
    animation_url: '/assets/animations/expanding-flower-field.json',
    sort_order: 5,
    is_featured: true
  },

  // 🕯️ Candle of Peace Collection – Memory & Serenity
  {
    name: 'Candle of Peace',
    name_amharic: 'የሰላም ሻማ',
    description: 'Memory & serenity',
    description_amharic: 'ትዝታ እና መረጋጋት',
    symbolism: 'Warmth, reflection, and the eternal flame of memory',
    symbolism_amharic: 'ሙቀት፣ ነጸብራቅ እና የዘላለማዊ ትዝታ ነበልባል',
    category: 'CANDLE_PEACE',
    value: 10.00,
    animation_type: 'gentle_flame',
    animation_duration: 4000,
    icon_url: '/assets/gifts/peace-candle.svg',
    animation_url: '/assets/animations/gentle-flame.json',
    sort_order: 1
  },
  {
    name: 'Twin Candles',
    name_amharic: 'መንትዮች ሻማዎች',
    description: 'Shared remembrance',
    description_amharic: 'የጋራ መታሰቢያ',
    symbolism: 'Two flames representing shared memories and mutual support',
    symbolism_amharic: 'የጋራ ትዝታዎችን እና የጋራ ድጋፍን የሚወክሉ ሁለት ነበልባሎች',
    category: 'CANDLE_PEACE',
    value: 15.00,
    animation_type: 'twin_flames_flickering',
    animation_duration: 5000,
    icon_url: '/assets/gifts/twin-candles.svg',
    animation_url: '/assets/animations/twin-flames-flickering.json',
    sort_order: 2
  },
  {
    name: 'Golden Glow Candle',
    name_amharic: 'የወርቅ ብርሃን ሻማ',
    description: 'Hope, light, and eternal faith',
    description_amharic: 'ተስፋ፣ ብርሃን እና ዘላለማዊ እምነት',
    symbolism: 'Golden light representing hope and divine presence',
    symbolism_amharic: 'ተስፋ እና መለኮታዊ መገኘትን የሚወክል የወርቅ ብርሃን',
    category: 'CANDLE_PEACE',
    value: 20.00,
    animation_type: 'warm_golden_glow',
    animation_duration: 5000,
    icon_url: '/assets/gifts/golden-glow-candle.svg',
    animation_url: '/assets/animations/warm-golden-glow.json',
    sort_order: 3
  },
  {
    name: 'Candle Circle',
    name_amharic: 'የሻማ ክብ',
    description: 'Family unity in grief',
    description_amharic: 'በሀዘን ውስጥ የቤተሰብ አንድነት',
    symbolism: 'Circle of candles representing family unity and collective mourning',
    symbolism_amharic: 'የቤተሰብ አንድነት እና የጋራ ሀዘንን የሚወክል የሻማዎች ክብ',
    category: 'CANDLE_PEACE',
    value: 25.00,
    animation_type: 'circle_candles_lighting',
    animation_duration: 6000,
    icon_url: '/assets/gifts/candle-circle.svg',
    animation_url: '/assets/animations/circle-candles-lighting.json',
    sort_order: 4
  },
  {
    name: 'Lantern of Serenity',
    name_amharic: 'የመረጋጋት ፋኖስ',
    description: 'Guidance through darkness',
    description_amharic: 'በጨለማ ውስጥ መመሪያ',
    symbolism: 'A guiding light through difficult times',
    symbolism_amharic: 'በከባድ ጊዜያት የሚመራ ብርሃን',
    category: 'CANDLE_PEACE',
    value: 30.00,
    animation_type: 'floating_lantern_illumination',
    animation_duration: 7000,
    icon_url: '/assets/gifts/serenity-lantern.svg',
    animation_url: '/assets/animations/floating-lantern-illumination.json',
    sort_order: 5,
    is_featured: true
  },

  // 🕊️ Dove of Mercy Collection – Peace & Compassion
  {
    name: 'Dove of Mercy',
    name_amharic: 'የምሕረት ርግብ',
    description: 'Peace & compassion',
    description_amharic: 'ሰላም እና ርኅራኄ',
    symbolism: 'Peace, compassion, and the soul\'s gentle journey toward heaven',
    symbolism_amharic: 'ሰላም፣ ርኅራኄ እና ነፍሱ ወደ ሰማይ የሚያደርገው ረጋ ያለ ጉዞ',
    category: 'DOVE_MERCY',
    value: 25.00,
    animation_type: 'dove_flying_softly',
    animation_duration: 5000,
    icon_url: '/assets/gifts/mercy-dove.svg',
    animation_url: '/assets/animations/dove-flying-softly.json',
    sort_order: 1
  },
  {
    name: 'Olive Dove',
    name_amharic: 'የዘይት ርግብ',
    description: 'Hope and renewal',
    description_amharic: 'ተስፋ እና እድሳት',
    symbolism: 'Dove carrying olive branch representing hope and new beginnings',
    symbolism_amharic: 'ተስፋ እና አዲስ ጅምሮችን የሚወክል የዘይት ቅርንጫፍ የሚያሸከም ርግብ',
    category: 'DOVE_MERCY',
    value: 30.00,
    animation_type: 'dove_with_olive_branch',
    animation_duration: 6000,
    icon_url: '/assets/gifts/olive-dove.svg',
    animation_url: '/assets/animations/dove-with-olive-branch.json',
    sort_order: 2
  },
  {
    name: 'Pair of Doves',
    name_amharic: 'ጥንድ ርግቦች',
    description: 'Reunion in eternal love',
    description_amharic: 'በዘላለማዊ ፍቅር ውስጥ መገናኘት',
    symbolism: 'Two doves representing eternal love and spiritual reunion',
    symbolism_amharic: 'ዘላለማዊ ፍቅር እና መንፈሳዊ መገናኘትን የሚወክሉ ሁለት ርግቦች',
    category: 'DOVE_MERCY',
    value: 35.00,
    animation_type: 'two_doves_ascending',
    animation_duration: 7000,
    icon_url: '/assets/gifts/pair-doves.svg',
    animation_url: '/assets/animations/two-doves-ascending.json',
    sort_order: 3
  },
  {
    name: 'Messenger Dove',
    name_amharic: 'መልእክተኛ ርግብ',
    description: 'Sending prayers to heaven',
    description_amharic: 'ወደ ሰማይ ጸሎት መላክ',
    symbolism: 'Dove carrying prayers and messages to the divine realm',
    symbolism_amharic: 'ጸሎቶችን እና መልእክቶችን ወደ መለኮታዊ ግዛት የሚያሸከም ርግብ',
    category: 'DOVE_MERCY',
    value: 40.00,
    animation_type: 'dove_carrying_ribbon_scroll',
    animation_duration: 8000,
    icon_url: '/assets/gifts/messenger-dove.svg',
    animation_url: '/assets/animations/dove-carrying-ribbon-scroll.json',
    sort_order: 4
  },
  {
    name: 'Heavenly Flight',
    name_amharic: 'የሰማያዊ በረራ',
    description: 'Soul\'s journey to peace',
    description_amharic: 'ነፍሱ ወደ ሰላም የሚያደርገው ጉዞ',
    symbolism: 'Doves ascending into divine light representing the soul\'s peaceful journey',
    symbolism_amharic: 'ነፍሱ የሚያደርገውን ሰላማዊ ጉዞ የሚወክሉ ወደ መለኮታዊ ብርሃን የሚወጡ ርግቦች',
    category: 'DOVE_MERCY',
    value: 50.00,
    animation_type: 'doves_flying_into_bright_light',
    animation_duration: 10000,
    icon_url: '/assets/gifts/heavenly-flight.svg',
    animation_url: '/assets/animations/doves-flying-into-bright-light.json',
    sort_order: 5,
    is_featured: true
  },

  // 💫 Eternal Light Collection – Legacy & Honor
  {
    name: 'Eternal Light',
    name_amharic: 'ዘላለማዊ ብርሃን',
    description: 'Legacy & honor',
    description_amharic: 'ውርስ እና ክብር',
    symbolism: 'The soul\'s guidance, divine presence, and eternal legacy',
    symbolism_amharic: 'የነፍሱ መመሪያ፣ መለኮታዊ መገኘት እና ዘላለማዊ ውርስ',
    category: 'ETERNAL_LIGHT',
    value: 100.00,
    animation_type: 'soft_aura',
    animation_duration: 8000,
    icon_url: '/assets/gifts/eternal-light.svg',
    animation_url: '/assets/animations/soft-aura.json',
    sort_order: 1,
    is_featured: true
  },
  {
    name: 'Golden Halo',
    name_amharic: 'የወርቅ ክብ',
    description: 'Sacred remembrance',
    description_amharic: 'ቅዱስ መታሰቢያ',
    symbolism: 'Sacred circle of light representing divine blessing and honor',
    symbolism_amharic: 'መለኮታዊ በረከት እና ክብርን የሚወክል ቅዱስ የብርሃን ክብ',
    category: 'ETERNAL_LIGHT',
    value: 125.00,
    animation_type: 'light_ring_aura',
    animation_duration: 9000,
    icon_url: '/assets/gifts/golden-halo.svg',
    animation_url: '/assets/animations/light-ring-aura.json',
    sort_order: 2
  },
  {
    name: 'Star of Legacy',
    name_amharic: 'የውርስ ኮከብ',
    description: 'Everlasting inspiration',
    description_amharic: 'ዘላቂ መነሳሳት',
    symbolism: 'Bright star representing lasting impact and inspiration',
    symbolism_amharic: 'ዘላቂ ተጽዕኖ እና መነሳሳትን የሚወክል ደማቅ ኮከብ',
    category: 'ETERNAL_LIGHT',
    value: 150.00,
    animation_type: 'starburst_glow',
    animation_duration: 10000,
    icon_url: '/assets/gifts/star-legacy.svg',
    animation_url: '/assets/animations/starburst-glow.json',
    sort_order: 3
  },
  {
    name: 'Heavenly Lamp',
    name_amharic: 'የሰማያዊ መብራት',
    description: 'Light guiding the spirit',
    description_amharic: 'መንፈስን የሚመራ ብርሃን',
    symbolism: 'Divine lamp illuminating the path to eternal peace',
    symbolism_amharic: 'ወደ ዘላለማዊ ሰላም የሚወስደውን መንገድ የሚያበራ መለኮታዊ መብራት',
    category: 'ETERNAL_LIGHT',
    value: 175.00,
    animation_type: 'floating_lamp_illumination',
    animation_duration: 12000,
    icon_url: '/assets/gifts/heavenly-lamp.svg',
    animation_url: '/assets/animations/floating-lamp-illumination.json',
    sort_order: 4
  },
  {
    name: 'Sun of Memory',
    name_amharic: 'የመታሰቢያ ፀሐይ',
    description: 'Radiance of a life well-lived',
    description_amharic: 'በደንብ የተኖረ ህይወት ብርሃን',
    symbolism: 'Brilliant sun representing the radiant impact of a meaningful life',
    symbolism_amharic: 'ትርጉም ያለው ህይወት የሚያደርገውን ደማቅ ተጽዕኖ የሚወክል ደማቅ ፀሐይ',
    category: 'ETERNAL_LIGHT',
    value: 200.00,
    animation_type: 'rising_golden_sun',
    animation_duration: 15000,
    icon_url: '/assets/gifts/sun-memory.svg',
    animation_url: '/assets/animations/rising-golden-sun.json',
    sort_order: 5,
    is_featured: true
  }
];

// Seed function
const seedGiftCatalog = async () => {
  try {
    console.log('🌱 Starting gift catalog seeding...');

    // Check if database is connected
    await sequelize.authenticate();
    console.log('✅ Database connection established.');

    // Sync models
    await sequelize.sync();
    console.log('✅ Database models synchronized.');

    // Clear existing gift catalog
    await GiftCatalog.destroy({ where: {} });
    console.log('🗑️  Cleared existing gift catalog.');

    // Insert gift catalog data
    await GiftCatalog.bulkCreate(giftCatalogData);
    console.log(`✅ Inserted ${giftCatalogData.length} gifts into catalog.`);

    // Verify insertion
    const count = await GiftCatalog.count();
    console.log(`📊 Total gifts in catalog: ${count}`);

    // Show summary by category
    const categories = ['WHITE_ROSE', 'CANDLE_PEACE', 'DOVE_MERCY', 'ETERNAL_LIGHT'];
    for (const category of categories) {
      const categoryCount = await GiftCatalog.count({ where: { category } });
      const priceRange = await GiftCatalog.findOne({
        where: { category },
        attributes: [
          [sequelize.fn('MIN', sequelize.col('value')), 'min_price'],
          [sequelize.fn('MAX', sequelize.col('value')), 'max_price']
        ]
      });
      
      console.log(`   ${category}: ${categoryCount} gifts (${priceRange.dataValues.min_price} - ${priceRange.dataValues.max_price} ETB)`);
    }

    console.log('🎉 Gift catalog seeding completed successfully!');
    
  } catch (error) {
    console.error('❌ Error seeding gift catalog:', error);
    throw error;
  }
};

// Run seeding if called directly
if (require.main === module) {
  seedGiftCatalog()
    .then(() => {
      console.log('✅ Seeding completed. Exiting...');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Seeding failed:', error);
      process.exit(1);
    });
}

module.exports = {
  seedGiftCatalog,
  giftCatalogData
};
