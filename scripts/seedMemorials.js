const { sequelize, User, Memorial } = require('../src/models');

async function seedMemorials() {
  try {
    console.log('🌱 Starting memorial seeding...');

    await sequelize.authenticate();
    console.log('✅ Database connection established.');

    await sequelize.sync();
    console.log('✅ Database models synchronized.');

    // Pick any active user to own the sample memorials
    const user = await User.findOne({ where: { is_active: true } });

    if (!user) {
      console.error('❌ No active user found. Please create a user first (via signup) and try again.');
      return;
    }

    console.log(`Using user ${user.user_id} (${user.name || user.email || user.phone}) as creator for sample memorials.`);

    const baseMemorials = [
      {
        deceased_name: 'Abebe Kebede',
        bio: 'Beloved father, community elder, and mentor to many.',
        date_of_birth: '1950-03-12',
        date_of_death: '2020-08-25',
        place_of_birth: 'Addis Ababa, Ethiopia',
        place_of_death: 'Addis Ababa, Ethiopia',
        profile_image: '/dawit.jpg',
      },
      {
        deceased_name: 'Mulu Getachew',
        bio: 'Cherished mother whose kindness touched everyone around her.',
        date_of_birth: '1958-11-05',
        date_of_death: '2019-04-10',
        place_of_birth: 'Gondar, Ethiopia',
        place_of_death: 'Addis Ababa, Ethiopia',
        profile_image: '/images1.jpg',
      },
      {
        deceased_name: 'Tesfaye Demissie',
        bio: 'Teacher, friend, and inspiration to generations of students.',
        date_of_birth: '1965-02-20',
        date_of_death: '2021-01-02',
        place_of_birth: 'Hawassa, Ethiopia',
        place_of_death: 'Hawassa, Ethiopia',
        profile_image: '/haile.jpg',
      },
      {
        deceased_name: 'Almaz Bekele',
        bio: 'A loving grandmother whose wisdom and laughter will be remembered forever.',
        date_of_birth: '1947-07-30',
        date_of_death: '2018-12-15',
        place_of_birth: 'Dire Dawa, Ethiopia',
        place_of_death: 'Dire Dawa, Ethiopia',
        profile_image: '/meron.jpg',
      },
      {
        deceased_name: 'Samuel Yohannes',
        bio: 'Engineer, problem solver, and loyal friend with a heart for service.',
        date_of_birth: '1978-09-18',
        date_of_death: '2022-03-09',
        place_of_birth: 'Bahir Dar, Ethiopia',
        place_of_death: 'Addis Ababa, Ethiopia',
        profile_image: '/images.jpg',
      },
      {
        deceased_name: 'Lulit Fekadu',
        bio: 'Bright soul, artist, and caring sister whose creativity lives on.',
        date_of_birth: '1990-06-01',
        date_of_death: '2023-01-14',
        place_of_birth: 'Mekelle, Ethiopia',
        place_of_death: 'Addis Ababa, Ethiopia',
        profile_image: '/dawit.jpg',
      },
      {
        deceased_name: 'Haile Selamu',
        bio: 'Business owner and community supporter remembered for his generosity.',
        date_of_birth: '1960-01-10',
        date_of_death: '2017-09-03',
        place_of_birth: 'Jimma, Ethiopia',
        place_of_death: 'Jimma, Ethiopia',
        profile_image: '/haile.jpg',
      },
    ];

    const createdOrUpdated = [];

    for (const m of baseMemorials) {
      const existing = await Memorial.findOne({
        where: {
          user_id: user.user_id,
          deceased_name: m.deceased_name,
        },
      });

      if (existing) {
        await existing.update({ profile_image: m.profile_image });
        createdOrUpdated.push(existing);
      } else {
        const memorial = await Memorial.create({
          user_id: user.user_id,
          deceased_name: m.deceased_name,
          bio: m.bio,
          date_of_birth: m.date_of_birth,
          date_of_death: m.date_of_death,
          place_of_birth: m.place_of_birth,
          place_of_death: m.place_of_death,
          visibility: 'PUBLIC',
          cultural_template: 'MODERN',
          paid_status: true,
          is_active: true,
          profile_image: m.profile_image,
          cover_image: null,
          gallery_images: [],
        });
        createdOrUpdated.push(memorial);
      }
    }

    console.log(`✅ Seeded profile images for ${createdOrUpdated.length} sample memorials.`);
    console.log('Sample memorial IDs:', createdOrUpdated.map((m) => m.memorial_id));
    console.log('🎉 Memorial seeding completed successfully!');
  } catch (error) {
    console.error('❌ Error seeding memorials:', error);
    throw error;
  } finally {
    await sequelize.close();
    console.log('🔌 Database connection closed.');
  }
}

if (require.main === module) {
  seedMemorials()
    .then(() => {
      console.log('✅ Seeding completed. Exiting...');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Seeding failed:', error);
      process.exit(1);
    });
}

module.exports = { seedMemorials };
