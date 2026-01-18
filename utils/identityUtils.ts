
import { Identity } from '../types';

const firstNames = {
  US: ['James', 'Mary', 'Robert', 'Patricia', 'John', 'Jennifer', 'Michael', 'Linda'],
  UK: ['Oliver', 'Olivia', 'George', 'Amelia', 'Harry', 'Isla', 'Noah', 'Ava'],
  ID: ['Budi', 'Siti', 'Agus', 'Lani', 'Eko', 'Dewi', 'Bambang', 'Putri'],
  DE: ['Lukas', 'Lina', 'Maximilian', 'Emma', 'Jakob', 'Mia', 'Felix', 'Sofia'],
  BR: ['Gabriel', 'Julia', 'Lucas', 'Mariana', 'Matheus', 'Beatriz', 'Felipe', 'Ana'],
  FR: ['Lucas', 'Emma', 'Léo', 'Jade', 'Gabriel', 'Louise', 'Raphaël', 'Alice'],
  JP: ['Haruto', 'Himari', 'Riku', 'Akari', 'Haruki', 'Ichika', 'Kaito', 'Sara'],
  AU: ['Jack', 'Charlotte', 'William', 'Olivia', 'Thomas', 'Amelia', 'James', 'Mia'],
};

const lastNames = {
  US: ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis'],
  UK: ['Smith', 'Jones', 'Taylor', 'Brown', 'Williams', 'Wilson', 'Johnson', 'Davies'],
  ID: ['Sutrisno', 'Wijaya', 'Hidayat', 'Saputra', 'Kusuma', 'Pratama', 'Gunawan', 'Santoso'],
  DE: ['Müller', 'Schmidt', 'Schneider', 'Fischer', 'Weber', 'Meyer', 'Wagner', 'Becker'],
  BR: ['Silva', 'Santos', 'Oliveira', 'Souza', 'Rodrigues', 'Ferreira', 'Alves', 'Pereira'],
  FR: ['Martin', 'Bernard', 'Thomas', 'Petit', 'Robert', 'Richard', 'Durand', 'Dubois'],
  JP: ['Sato', 'Suzuki', 'Takahashi', 'Tanaka', 'Watanabe', 'Ito', 'Yamamoto', 'Nakamura'],
  AU: ['Smith', 'Jones', 'Williams', 'Brown', 'Wilson', 'Taylor', 'Johnson', 'White'],
};

const cities = {
  US: ['New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix', 'Philadelphia'],
  UK: ['London', 'Birmingham', 'Manchester', 'Glasgow', 'Liverpool', 'Leeds'],
  ID: ['Jakarta', 'Surabaya', 'Bandung', 'Medan', 'Semarang', 'Makassar'],
  DE: ['Berlin', 'Hamburg', 'Munich', 'Cologne', 'Frankfurt', 'Stuttgart'],
  BR: ['São Paulo', 'Rio de Janeiro', 'Brasília', 'Salvador', 'Fortaleza', 'Belo Horizonte'],
  FR: ['Paris', 'Marseille', 'Lyon', 'Toulouse', 'Nice', 'Nantes'],
  JP: ['Tokyo', 'Osaka', 'Nagoya', 'Sapporo', 'Fukuoka', 'Kyoto'],
  AU: ['Sydney', 'Melbourne', 'Brisbane', 'Perth', 'Adelaide', 'Gold Coast'],
};

const generateZip = (countryCode: string): string => {
  const randNum = (len: number) => Array.from({ length: len }, () => Math.floor(Math.random() * 10)).join('');
  const randChar = () => String.fromCharCode(65 + Math.floor(Math.random() * 26));

  switch (countryCode) {
    case 'US':
      return randNum(5);
    case 'UK':
      // Simplified UK format: AA# #AA
      return `${randChar()}${randChar()}${Math.floor(Math.random() * 9) + 1} ${Math.floor(Math.random() * 9) + 1}${randChar()}${randChar()}`;
    case 'ID':
      return randNum(5);
    case 'DE':
      return randNum(5);
    case 'BR':
      return `${randNum(5)}-${randNum(3)}`;
    case 'FR':
      return randNum(5);
    case 'JP':
      return `${randNum(3)}-${randNum(4)}`;
    case 'AU':
      return randNum(4);
    default:
      return randNum(5);
  }
};

export const generateIdentity = (countryCode: string): Identity => {
  const code = (firstNames[countryCode as keyof typeof firstNames] ? countryCode : 'US') as keyof typeof firstNames;
  
  const fName = firstNames[code][Math.floor(Math.random() * firstNames[code].length)];
  const lName = lastNames[code][Math.floor(Math.random() * lastNames[code].length)];
  const city = cities[code][Math.floor(Math.random() * cities[code].length)];
  
  const streetNum = Math.floor(Math.random() * 9999) + 1;
  const streets = ['Main St', 'Park Ave', 'Oak St', 'Broadway', 'Maple Ave', 'Cedar Ln', 'Jl. Merdeka', 'Jl. Sudirman', 'Berliner Str.', 'Av. Paulista', 'Rue de Rivoli', 'Chuo-dori', 'George St'];
  const street = `${streetNum} ${streets[Math.floor(Math.random() * streets.length)]}`;
  
  const zip = generateZip(code);
  const phone = `+${Math.floor(Math.random() * 90) + 10} ${Math.floor(Math.random() * 900) + 100}-${Math.floor(Math.random() * 9000) + 1000}`;
  const email = `${fName.toLowerCase()}.${lName.toLowerCase()}${Math.floor(Math.random() * 999)}@example.com`;
  
  const year = 1970 + Math.floor(Math.random() * 40);
  const month = String(Math.floor(Math.random() * 12) + 1).padStart(2, '0');
  const day = String(Math.floor(Math.random() * 28) + 1).padStart(2, '0');
  
  return {
    firstName: fName,
    lastName: lName,
    gender: Math.random() > 0.5 ? 'Male' : 'Female',
    street,
    city,
    state: 'Region ' + (Math.floor(Math.random() * 20) + 1),
    zip,
    country: code,
    phone,
    email,
    birthday: `${year}-${month}-${day}`,
    ssn: `${Math.floor(Math.random() * 900) + 100}-${Math.floor(Math.random() * 90) + 10}-${Math.floor(Math.random() * 9000) + 1000}`,
  };
};
