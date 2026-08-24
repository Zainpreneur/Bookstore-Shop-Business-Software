import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

function slugify(name: string) {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

async function main() {
  console.log("Seeding database...");

  const adminPassword = await bcrypt.hash("Admin123!", 10);
  const admin = await prisma.user.upsert({
    where: { email: "admin@bookstore.com" },
    update: {},
    create: {
      name: "Store Admin",
      email: "admin@bookstore.com",
      passwordHash: adminPassword,
      role: "ADMIN",
    },
  });

  const customerPassword = await bcrypt.hash("Customer123!", 10);
  const customer = await prisma.user.upsert({
    where: { email: "customer@bookstore.com" },
    update: {},
    create: {
      name: "Jane Reader",
      email: "customer@bookstore.com",
      passwordHash: customerPassword,
      role: "CUSTOMER",
      address: "123 Main St, Springfield",
      phone: "555-0100",
    },
  });

  const categoryNames = ["Fiction", "Science Fiction", "Fantasy", "Non-Fiction", "Mystery & Thriller", "Biography", "Children's", "Self-Help"];
  const categories: Record<string, string> = {};
  for (const name of categoryNames) {
    const cat = await prisma.category.upsert({
      where: { name },
      update: {},
      create: { name, slug: slugify(name) },
    });
    categories[name] = cat.id;
  }

  const authorNames = [
    { name: "Isabel March", bio: "Award-winning novelist known for character-driven fiction." },
    { name: "Rowan Blake", bio: "Bestselling science fiction and fantasy author." },
    { name: "Dr. Elena Cross", bio: "Historian and non-fiction writer." },
    { name: "Marcus Webb", bio: "Mystery and thriller author with a dozen titles." },
    { name: "Priya Nandan", bio: "Biographer and journalist." },
    { name: "Tomás Rivera", bio: "Children's book author and illustrator." },
    { name: "Grace Holloway", bio: "Self-help and personal development coach." },
  ];
  const authors: Record<string, string> = {};
  for (const a of authorNames) {
    const author = await prisma.author.upsert({
      where: { name: a.name },
      update: {},
      create: a,
    });
    authors[a.name] = author.id;
  }

  const books = [
    {
      title: "The Quiet Horizon",
      isbn: "978-0-000-00001-1",
      description: "A sweeping literary novel about family, loss, and the ties that bind us across generations.",
      price: 18.99,
      costPrice: 8.5,
      stock: 42,
      category: "Fiction",
      author: "Isabel March",
      publisher: "Harbor House",
      publishedYear: 2022,
      pages: 342,
      featured: true,
    },
    {
      title: "Echoes of Tomorrow",
      isbn: "978-0-000-00002-2",
      description: "In a future where memories can be traded, one woman uncovers a conspiracy that spans decades.",
      price: 22.5,
      costPrice: 10,
      stock: 30,
      category: "Science Fiction",
      author: "Rowan Blake",
      publisher: "Nova Press",
      publishedYear: 2023,
      pages: 410,
      featured: true,
    },
    {
      title: "The Shattered Crown",
      isbn: "978-0-000-00003-3",
      description: "The first book in an epic fantasy trilogy about a fractured kingdom and the heir who must reclaim it.",
      price: 24.0,
      costPrice: 11,
      stock: 25,
      category: "Fantasy",
      author: "Rowan Blake",
      publisher: "Nova Press",
      publishedYear: 2021,
      pages: 512,
      featured: true,
    },
    {
      title: "Empires of the Silk Road",
      isbn: "978-0-000-00004-4",
      description: "A definitive history of the trade networks that shaped the ancient and medieval world.",
      price: 29.99,
      costPrice: 14,
      stock: 18,
      category: "Non-Fiction",
      author: "Dr. Elena Cross",
      publisher: "Academic Press",
      publishedYear: 2020,
      pages: 480,
      featured: false,
    },
    {
      title: "The Last Alibi",
      isbn: "978-0-000-00005-5",
      description: "A small-town detective races to solve a murder before the killer strikes again.",
      price: 16.5,
      costPrice: 7,
      stock: 4,
      lowStockAlert: 5,
      category: "Mystery & Thriller",
      author: "Marcus Webb",
      publisher: "Ravenwood Books",
      publishedYear: 2023,
      pages: 298,
      featured: true,
    },
    {
      title: "Nothing Left Unsaid",
      isbn: "978-0-000-00006-6",
      description: "A gripping thriller about a journalist chasing the truth behind a decades-old cold case.",
      price: 17.75,
      costPrice: 7.5,
      stock: 33,
      category: "Mystery & Thriller",
      author: "Marcus Webb",
      publisher: "Ravenwood Books",
      publishedYear: 2022,
      pages: 356,
      featured: false,
    },
    {
      title: "A Life in Ink: The Priya Nandan Story",
      isbn: "978-0-000-00007-7",
      description: "An intimate biography of one of the century's most celebrated war correspondents.",
      price: 21.0,
      costPrice: 9,
      stock: 15,
      category: "Biography",
      author: "Priya Nandan",
      publisher: "Harbor House",
      publishedYear: 2019,
      pages: 388,
      featured: false,
    },
    {
      title: "The Marmalade Cat's Big Adventure",
      isbn: "978-0-000-00008-8",
      description: "A whimsical picture book about a curious cat exploring the neighborhood for the first time.",
      price: 12.99,
      costPrice: 5,
      stock: 60,
      category: "Children's",
      author: "Tomás Rivera",
      publisher: "Sunny Day Books",
      publishedYear: 2023,
      pages: 32,
      featured: true,
    },
    {
      title: "Small Habits, Big Change",
      isbn: "978-0-000-00009-9",
      description: "A practical guide to building lasting habits through small, consistent daily actions.",
      price: 15.99,
      costPrice: 6.5,
      stock: 3,
      lowStockAlert: 5,
      category: "Self-Help",
      author: "Grace Holloway",
      publisher: "Bright Path",
      publishedYear: 2021,
      pages: 224,
      featured: true,
    },
    {
      title: "The Weight of Silence",
      isbn: "978-0-000-00010-2",
      description: "Two estranged sisters reunite to confront the secret that tore their family apart.",
      price: 19.5,
      costPrice: 8.75,
      stock: 27,
      category: "Fiction",
      author: "Isabel March",
      publisher: "Harbor House",
      publishedYear: 2024,
      pages: 302,
      featured: false,
    },
    {
      title: "Beyond the Event Horizon",
      isbn: "978-0-000-00011-3",
      description: "A hard science fiction epic about the first crewed mission to a black hole's edge.",
      price: 23.99,
      costPrice: 11,
      stock: 20,
      category: "Science Fiction",
      author: "Rowan Blake",
      publisher: "Nova Press",
      publishedYear: 2024,
      pages: 448,
      featured: false,
    },
    {
      title: "Mindful Mornings",
      isbn: "978-0-000-00012-4",
      description: "A 30-day guide to starting each day with clarity, calm, and intention.",
      price: 14.5,
      costPrice: 6,
      stock: 45,
      category: "Self-Help",
      author: "Grace Holloway",
      publisher: "Bright Path",
      publishedYear: 2022,
      pages: 198,
      featured: false,
    },
  ];

  for (const b of books) {
    await prisma.book.upsert({
      where: { isbn: b.isbn },
      update: {},
      create: {
        title: b.title,
        isbn: b.isbn,
        description: b.description,
        price: b.price,
        costPrice: b.costPrice,
        stock: b.stock,
        lowStockAlert: b.lowStockAlert ?? 5,
        publisher: b.publisher,
        publishedYear: b.publishedYear,
        pages: b.pages,
        featured: b.featured,
        categoryId: categories[b.category],
        authorId: authors[b.author],
      },
    });
  }

  console.log(`Seeded ${categoryNames.length} categories, ${authorNames.length} authors, ${books.length} books.`);
  console.log(`Admin login: ${admin.email} / Admin123!`);
  console.log(`Customer login: ${customer.email} / Customer123!`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
