
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // Hash passwords
  const hashedHaukurPassword = await bcrypt.hash('haukur2024!', 12);
  const hashedLeifPassword = await bcrypt.hash('leif2024!', 12);

  // Create founder users  
  const haukurFounder = await prisma.user.upsert({
    where: { email: 'haukur@hylur.net' },
    update: {},
    create: {
      name: 'Haukur Kristinsson',
      email: 'haukur@hylur.net',
      password: hashedHaukurPassword,
      role: 'founder',
      emailVerified: new Date(),
    },
  });

  const leifFounder = await prisma.user.upsert({
    where: { email: 'leif@hylur.net' },
    update: {},
    create: {
      name: 'Leif Eriksson',
      email: 'leif@hylur.net',
      password: hashedLeifPassword,
      role: 'founder',
      emailVerified: new Date(),
    },
  });

  console.log('✅ Created founder accounts');

  // Create demo documents
  const demoDocuments = [
    {
      filename: 'business-plan-2024.pdf',
      originalName: 'Hylur Business Plan 2024.pdf',
      filePath: '/uploads/documents/business-plan-2024.pdf',
      fileSize: 2547891,
      mimeType: 'application/pdf',
      userId: haukurFounder.id,
    },
    {
      filename: 'market-research.pdf',
      originalName: 'AI Market Research Report.pdf',
      filePath: '/uploads/documents/market-research.pdf',
      fileSize: 1834567,
      mimeType: 'application/pdf',
      userId: leifFounder.id,
    },
    {
      filename: 'technical-specifications.pdf',
      originalName: 'Technical Specifications v3.2.pdf',
      filePath: '/uploads/documents/technical-specifications.pdf',
      fileSize: 967234,
      mimeType: 'application/pdf',
      userId: haukurFounder.id,
    },
  ];

  for (const doc of demoDocuments) {
    await prisma.document.create({
      data: doc,
    });
  }

  console.log('✅ Created demo documents');

  // Create demo data tables
  const customerDataTable = await prisma.dataTable.create({
    data: {
      name: 'Customer Analytics Q4 2024',
      description: 'Quarterly customer engagement and revenue metrics',
      userId: haukurFounder.id,
      columns: [
        { name: 'Customer ID', type: 'string' },
        { name: 'Company', type: 'string' },
        { name: 'Revenue', type: 'number' },
        { name: 'Engagement Score', type: 'number' },
        { name: 'Last Contact', type: 'date' },
        { name: 'Status', type: 'string' },
      ],
      rows: [
        ['CUST001', 'TechCorp Solutions', 145000, 8.7, '2024-12-15', 'Active'],
        ['CUST002', 'InnovateLab Inc', 89500, 7.2, '2024-12-10', 'Active'],
        ['CUST003', 'Digital Dynamics', 234000, 9.1, '2024-12-18', 'Premium'],
        ['CUST004', 'StartupHub', 45000, 6.8, '2024-11-28', 'Active'],
        ['CUST005', 'Enterprise Global', 567000, 9.8, '2024-12-20', 'Premium'],
        ['CUST006', 'CloudFirst Ltd', 123000, 7.9, '2024-12-05', 'Active'],
        ['CUST007', 'AI Ventures', 298000, 8.5, '2024-12-12', 'Premium'],
        ['CUST008', 'DataScience Pro', 76000, 6.9, '2024-11-30', 'Active'],
      ],
    },
  });

  const productMetricsTable = await prisma.dataTable.create({
    data: {
      name: 'Product Performance Metrics',
      description: 'Key performance indicators for our AI products',
      userId: leifFounder.id,
      columns: [
        { name: 'Product', type: 'string' },
        { name: 'Users', type: 'number' },
        { name: 'Revenue', type: 'number' },
        { name: 'Growth Rate', type: 'number' },
        { name: 'Satisfaction', type: 'number' },
      ],
      rows: [
        ['AI Chatbot Pro', 12500, 185000, 23.5, 4.7],
        ['Document Analyzer', 8900, 134000, 18.2, 4.5],
        ['Data Insights Platform', 6700, 267000, 31.8, 4.8],
        ['Knowledge Base AI', 15200, 98000, 15.7, 4.3],
        ['Enterprise Suite', 3400, 456000, 28.9, 4.9],
      ],
    },
  });

  console.log('✅ Created demo data tables');

  // Create demo web links
  const demoWebLinks = [
    {
      title: 'OpenAI GPT-4 Documentation',
      url: 'https://platform.openai.com/docs',
      description: 'Complete API documentation for GPT-4 integration',
      favicon: 'https://i.ytimg.com/vi/LFjibtsCOrs/maxresdefault.jpg',
      userId: haukurFounder.id,
    },
    {
      title: 'Y Combinator Startup School',
      url: 'https://www.startupschool.org/',
      description: 'Free online course for startup founders',
      favicon: 'https://www.startupschool.org/favicon.ico',
      userId: leifFounder.id,
    },
    {
      title: 'TechCrunch AI News',
      url: 'https://techcrunch.com/category/artificial-intelligence/',
      description: 'Latest news and trends in artificial intelligence',
      favicon: 'https://techcrunch.com/favicon.ico',
      userId: haukurFounder.id,
    },
    {
      title: 'Next.js Documentation',
      url: 'https://nextjs.org/docs',
      description: 'Official Next.js framework documentation',
      favicon: 'https://nextjs.org/favicon.ico',
      userId: leifFounder.id,
    },
    {
      title: 'Prisma Database Toolkit',
      url: 'https://www.prisma.io/docs',
      description: 'Modern database toolkit documentation',
      favicon: 'https://www.prisma.io/favicon.ico',
      userId: haukurFounder.id,
    },
    {
      title: 'Tailwind CSS Framework',
      url: 'https://tailwindcss.com/docs',
      description: 'Utility-first CSS framework documentation',
      favicon: 'https://tailwindcss.com/favicon.ico',
      userId: leifFounder.id,
    },
  ];

  for (const link of demoWebLinks) {
    await prisma.webLink.create({
      data: link,
    });
  }

  console.log('✅ Created demo web links');

  console.log('🎉 Database seeding completed successfully!');
  console.log('\n📊 Summary:');
  console.log(`- Created 2 founder accounts`);
  console.log(`- Created ${demoDocuments.length} demo documents`);
  console.log(`- Created 2 demo data tables`);
  console.log(`- Created ${demoWebLinks.length} demo web links`);
  console.log('\n🔐 Login credentials:');
  console.log('Founder 1: haukur@hylur.net / haukur2024!');
  console.log('Founder 2: leif@hylur.net / leif2024!');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
