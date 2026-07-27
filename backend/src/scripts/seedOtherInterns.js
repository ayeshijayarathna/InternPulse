require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../../src/config/db');
const User = require('../../src/models/User');

const OTHER_INTERNS = [
  // Nipun (supervisor[1])
  { name: 'Amal Fernando',      email: 'amal@internpulse.com',      university: 'University of Colombo',    github: 'amal-f',      supervisorIdx: 1 },
  { name: 'Saduni Wickrama',    email: 'saduni@internpulse.com',    university: 'University of Moratuwa',   github: 'saduni-w',    supervisorIdx: 1 },
  { name: 'Kavishka Bandara',   email: 'kavishka@internpulse.com',  university: 'SLIIT',                    github: 'kavishka-b',  supervisorIdx: 1 },
  // Shashika (supervisor[2])
  { name: 'Nipuni Silva',       email: 'nipuni@internpulse.com',    university: 'University of Peradeniya',  github: 'nipuni-s',    supervisorIdx: 2 },
  { name: 'Tharaka Jayasena',   email: 'tharaka@internpulse.com',   university: 'NSBM Green University',     github: 'tharaka-j',   supervisorIdx: 2 },
  // Tharindu (supervisor[3])
  { name: 'Dishani Perera',     email: 'dishani@internpulse.com',   university: 'University of Kelaniya',    github: 'dishani-p',   supervisorIdx: 3 },
  { name: 'Ruwan Fernando',     email: 'ruwan@internpulse.com',     university: 'University of Colombo',     github: 'ruwan-f',     supervisorIdx: 3 },
  { name: 'Hashitha Samaraweera', email: 'hashitha@internpulse.com', university: 'University of Moratuwa',  github: 'hashitha-s',  supervisorIdx: 3 },
  // Hasitha (supervisor[4])
  { name: 'Chathura Gunasekara', email: 'chathura@internpulse.com',  university: 'SLIIT',                    github: 'chathura-g',  supervisorIdx: 4 },
  { name: 'Dilshan Rajapaksa',  email: 'dilshan@internpulse.com',   university: 'NSBM Green University',     github: 'dilshan-r',   supervisorIdx: 4 },
  // Dinesh (supervisor[5])
  { name: 'Ishara Mendis',       email: 'ishara@internpulse.com',    university: 'University of Peradeniya',  github: 'ishara-m',    supervisorIdx: 5 },
  { name: 'Thilini Amarasinghe', email: 'thilini@internpulse.com',   university: 'University of Kelaniya',    github: 'thilini-a',   supervisorIdx: 5 },
  // Sachin (supervisor[6])
  { name: 'Nipun Bandaranaike', email: 'nipunb@internpulse.com',    university: 'University of Colombo',     github: 'nipunb',      supervisorIdx: 6 },
  { name: 'Kasun Liyanaarachchi', email: 'kasun@internpulse.com',    university: 'University of Moratuwa',   github: 'kasun-l',     supervisorIdx: 6 },
  { name: 'Madushi Jayasuriya',  email: 'madushi@internpulse.com',   university: 'SLIIT',                     github: 'madushi-j',   supervisorIdx: 6 },
  // Lakmal (supervisor[7])
  { name: 'Sachithra Weerasinghe', email: 'sachithra@internpulse.com', university: 'NSBM Green University',  github: 'sachithra-w', supervisorIdx: 7 },
  { name: 'Nadeesha Ranasinghe', email: 'nadeesha@internpulse.com',  university: 'University of Peradeniya',  github: 'nadeesha-r',  supervisorIdx: 7 },
  // Ravindu (supervisor[8])
  { name: 'Tharindu Wijesinghe', email: 'tharinduw@internpulse.com', university: 'University of Kelaniya',    github: 'tharinduw',   supervisorIdx: 8 },
  { name: 'Pooja Fernando',      email: 'pooja@internpulse.com',     university: 'University of Colombo',     github: 'pooja-f',     supervisorIdx: 8 },
  // Amila (supervisor[9])
  { name: 'Dinesha Kumari',      email: 'dinesha@internpulse.com',   university: 'University of Moratuwa',    github: 'dinesha-k',   supervisorIdx: 9 },
  { name: 'Niroshan Perera',     email: 'niroshan@internpulse.com',  university: 'SLIIT',                     github: 'niroshan-p',  supervisorIdx: 9 },
];

async function seedOtherInterns() {
  try {
    await connectDB();
    console.log('Connected to MongoDB');

    const supervisors = await User.find({ role: 'supervisor' }).sort({ createdAt: 1 });
    console.log(`Found ${supervisors.length} supervisors`);

    const d = (y, m, day) => new Date(y, m - 1, day);
    let count = 0;

    for (const i of OTHER_INTERNS) {
      const exists = await User.findOne({ email: i.email });
      if (exists) {
        console.log(`Skip (exists): ${i.email}`);
        continue;
      }

      const sup = supervisors[i.supervisorIdx];
      if (!sup) {
        console.log(`Skip (no supervisor at idx ${i.supervisorIdx}): ${i.email}`);
        continue;
      }

      await User.create({
        name:             i.name,
        email:            i.email,
        passwordHash:     'Intern@1234!',
        role:             'intern',
        isActive:         true,
        createdBy:        sup._id,
        university:       i.university,
        githubUsername:    i.github,
        internshipStart:  d(2026, 2, 10),
        internshipEnd:    d(2026, 8, 10),
      });
      count++;
      console.log(`Created: ${i.name} under ${sup.name}`);
    }

    console.log(`\n${count} new interns created under other supervisors`);
    process.exit(0);
  } catch (err) {
    console.error('Seed failed:', err);
    process.exit(1);
  }
}

seedOtherInterns();
