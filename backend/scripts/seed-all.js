const { execSync } = require('child_process');

console.log('Running all seeders in the correct order...');

const seeders = [
  '20250101000000-production-seed.js',
  '20250102000000-development-companies.js',
  '20250102000001-development-users.js',
  '20250102000002-development-company-modules.js',
  '20250102000003-development-directories.js',
  '20250102000004-development-directory-records.js'
];

seeders.forEach((seeder, index) => {
  console.log(`\n[${index + 1}/${seeders.length}] Running ${seeder}...`);
  try {
    execSync(`npx sequelize-cli db:seed --seed ${seeder}`, { 
      stdio: 'inherit',
      cwd: __dirname + '/..'
    });
    console.log(`✅ ${seeder} completed successfully`);
  } catch (error) {
    console.error(`❌ Error running ${seeder}:`, error.message);
    process.exit(1);
  }
});

console.log('\n🎉 All seeders completed successfully!');
console.log('\nSuper admin credentials:');
console.log('Email: admin@erp.com');
console.log('Password: admin123'); 