require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('./models/product');

// Map slug → image URL
const map = {
  'mo-hinh-pikachu': '/images/pokemon/pikachu.jpg',
  'mo-hinh-charizard': '/images/pokemon/charizard.jpg',
  'mo-hinh-bulbasaur': '/images/pokemon/bulbasaur.jpg',
  'mo-hinh-squirtle': '/images/pokemon/squirtle.jpg',
  'mo-hinh-gengar': '/images/pokemon/gengar.jpg',
  'mo-hinh-lucario': '/images/pokemon/lucario.jpg',
  'mo-hinh-dragonite': '/images/pokemon/dragonite.jpg',
  'mo-hinh-mew': '/images/pokemon/mew.jpg',
  'mo-hinh-snorlax': '/images/pokemon/snorlax.jpg',
  'mo-hinh-rayquaza': '/images/pokemon/rayquaza.jpg',
  'mo-hinh-groudon': '/images/pokemon/groudon.jpg',
  'mo-hinh-charizard-shiny': '/images/pokemon/charizard-shiny.jpg',
  'mo-hinh-psyduck': '/images/pokemon/psyduck.jpg'
};

(async () => {
  try {
    await mongoose.connect(
      process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/datapokemon'
    );

    console.log('Đang cập nhật ảnh...');

    for (const [slug, img] of Object.entries(map)) {
      const result = await Product.updateOne(
        { slug },
        { $set: { images: [img] } }
      );

      console.log(slug, result.matchedCount ? '✔ updated' : '✖ not found');
    }

    console.log('Hoàn tất!');
    process.exit(0);
  } catch (err) {
    console.error('Lỗi:', err);
    process.exit(1);
  }
})();
