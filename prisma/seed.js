const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function main() {
  // Clear existing data
  await prisma.enrollment.deleteMany();
  await prisma.score.deleteMany();
  await prisma.timeOffRequest.deleteMany();
  await prisma.course.deleteMany();
  await prisma.evaluation.deleteMany();
  await prisma.user.deleteMany();

  // Create users
  const adminPassword = await bcrypt.hash('admin123', 10);
  const employeePassword = await bcrypt.hash('employee123', 10);

  const admin = await prisma.user.create({
    data: {
      name: 'Admin User',
      email: 'admin@hr.com',
      passwordHash: adminPassword,
      role: 'admin',
      jobPosition: 'HR Manager',
      birthday: new Date('1985-05-15'),
      dateHired: new Date('2020-01-01'),
      profilePicture: 'https://api.dicebear.com/7.x/avataaars/svg?seed=admin',
    },
  });

  const employees = await Promise.all([
    prisma.user.create({
      data: {
        name: 'John Doe',
        email: 'john@hr.com',
        passwordHash: employeePassword,
        role: 'employee',
        jobPosition: 'Accountant',
        birthday: new Date('1990-03-20'),
        dateHired: new Date('2021-06-15'),
        profilePicture: 'https://api.dicebear.com/7.x/avataaars/svg?seed=john',
      },
    }),
    prisma.user.create({
      data: {
        name: 'Jane Smith',
        email: 'jane@hr.com',
        passwordHash: employeePassword,
        role: 'employee',
        jobPosition: 'Tax Specialist',
        birthday: new Date('1988-07-12'),
        dateHired: new Date('2020-09-01'),
        profilePicture: 'https://api.dicebear.com/7.x/avataaars/svg?seed=jane',
      },
    }),
    prisma.user.create({
      data: {
        name: 'Mike Johnson',
        email: 'mike@hr.com',
        passwordHash: employeePassword,
        role: 'employee',
        jobPosition: 'Financial Analyst',
        birthday: new Date('1992-11-08'),
        dateHired: new Date('2022-03-10'),
        profilePicture: 'https://api.dicebear.com/7.x/avataaars/svg?seed=mike',
      },
    }),
  ]);

  // Create evaluations
  const evaluations = await Promise.all([
    prisma.evaluation.create({ data: { name: 'Bookkeeping' } }),
    prisma.evaluation.create({ data: { name: 'VAT' } }),
    prisma.evaluation.create({ data: { name: 'Toolbox' } }),
    prisma.evaluation.create({ data: { name: 'Yearwork' } }),
  ]);

  // Create scores for employees
  for (const employee of employees) {
    for (const evaluation of evaluations) {
      await prisma.score.create({
        data: {
          userId: employee.id,
          evaluationId: evaluation.id,
          score: Math.floor(Math.random() * 101),
        },
      });
    }
  }

  // Create courses
  const courses = await Promise.all([
    prisma.course.create({
      data: {
        title: 'Advanced Accounting Principles',
        description: 'Learn advanced accounting techniques and financial reporting standards.',
        imageUrl: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=400',
      },
    }),
    prisma.course.create({
      data: {
        title: 'Tax Planning & Compliance',
        description: 'Comprehensive guide to tax regulations and planning strategies.',
        imageUrl: 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=400',
      },
    }),
    prisma.course.create({
      data: {
        title: 'Financial Analysis Fundamentals',
        description: 'Master financial analysis tools and techniques for business decisions.',
        imageUrl: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400',
      },
    }),
  ]);

  // Create enrollments
  await prisma.enrollment.create({
    data: { userId: employees[0].id, courseId: courses[0].id },
  });
  await prisma.enrollment.create({
    data: { userId: employees[1].id, courseId: courses[0].id },
  });
  await prisma.enrollment.create({
    data: { userId: employees[1].id, courseId: courses[1].id },
  });
  await prisma.enrollment.create({
    data: { userId: employees[2].id, courseId: courses[2].id },
  });

  // Create time off requests
  await prisma.timeOffRequest.create({
    data: {
      userId: employees[0].id,
      startDate: new Date('2024-12-20'),
      endDate: new Date('2024-12-27'),
      reason: 'Holiday vacation',
      status: 'approved',
      adminNote: 'Approved. Enjoy your holidays!',
    },
  });

  await prisma.timeOffRequest.create({
    data: {
      userId: employees[1].id,
      startDate: new Date('2024-12-15'),
      endDate: new Date('2024-12-16'),
      reason: 'Personal matters',
      status: 'pending',
    },
  });

  console.log('✅ Database seeded successfully!');
  console.log('👤 Admin: admin@hr.com / admin123');
  console.log('👥 Employee: john@hr.com / employee123');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
