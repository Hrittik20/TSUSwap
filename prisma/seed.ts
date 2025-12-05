import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding database...')

  // Create sample users
  const hashedPassword = await bcrypt.hash('password123', 12)

  const user1 = await prisma.user.upsert({
    where: { email: 'john@example.com' },
    update: {},
    create: {
      email: 'john@example.com',
      name: 'John Doe',
      password: hashedPassword,
      dormitory: 'mayak',
      roomNumber: '204',
      phoneNumber: '+7 900 123-4567',
    },
  })

  const user2 = await prisma.user.upsert({
    where: { email: 'jane@example.com' },
    update: {},
    create: {
      email: 'jane@example.com',
      name: 'Jane Smith',
      password: hashedPassword,
      dormitory: 'parus',
      roomNumber: '315',
      phoneNumber: '+7 900 765-4321',
    },
  })

  const user3 = await prisma.user.upsert({
    where: { email: 'mike@example.com' },
    update: {},
    create: {
      email: 'mike@example.com',
      name: 'Mike Johnson',
      password: hashedPassword,
      dormitory: 'kvartal',
      roomNumber: '112',
      phoneNumber: '+7 900 555-5555',
    },
  })

  console.log('Created users:', { user1, user2, user3 })

  // Create sample items (prices in Rubles)
  const item1 = await prisma.item.create({
    data: {
      title: 'iPhone 13 Pro - Отличное состояние',
      description: 'Почти новый iPhone 13 Pro, 256GB, Pacific Blue. С оригинальной коробкой и зарядкой.',
      price: 65000,
      images: [
        'https://images.unsplash.com/photo-1632661674596-df8be070a5c5?w=500',
      ],
      category: 'Электроника',
      condition: 'Как новое',
      listingType: 'REGULAR',
      sellerId: user1.id,
    },
  })

  const item2 = await prisma.item.create({
    data: {
      title: 'Письменный стол со стулом',
      description: 'Крепкий письменный стол с подходящим стулом. Идеально для комнаты в общежитии. Небольшие следы использования, но полностью функционален.',
      price: 5000,
      images: [
        'https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?w=500',
      ],
      category: 'Мебель',
      condition: 'Хорошее',
      listingType: 'REGULAR',
      sellerId: user2.id,
    },
  })

  // Create auction item
  const auctionItem = await prisma.item.create({
    data: {
      title: 'Sony PlayStation 5 - Новая',
      description: 'Совершенно новая консоль PS5, не вскрывалась. Выиграл в розыгрыше, но уже есть одна.',
      images: [
        'https://images.unsplash.com/photo-1606813907291-d86efa9b94db?w=500',
      ],
      category: 'Электроника',
      condition: 'Новое',
      listingType: 'AUCTION',
      sellerId: user3.id,
      auction: {
        create: {
          startPrice: 35000,
          currentPrice: 35000,
          reservePrice: 40000,
          endTime: new Date(Date.now() + 48 * 60 * 60 * 1000), // 48 hours from now
        },
      },
    },
    include: {
      auction: true,
    },
  })

  // Add some bids to the auction (in Rubles)
  const bid1 = await prisma.bid.create({
    data: {
      amount: 37000,
      auctionId: auctionItem.auction!.id,
      bidderId: user1.id,
    },
  })

  const bid2 = await prisma.bid.create({
    data: {
      amount: 40000,
      auctionId: auctionItem.auction!.id,
      bidderId: user2.id,
    },
  })

  const bid3 = await prisma.bid.create({
    data: {
      amount: 42000,
      auctionId: auctionItem.auction!.id,
      bidderId: user1.id,
    },
  })

  // Update auction current price
  await prisma.auction.update({
    where: { id: auctionItem.auction!.id },
    data: { currentPrice: 42000 },
  })

  console.log('Created items and auction with bids')

  // Create a sample transaction (in Rubles)
  const transaction = await prisma.transaction.create({
    data: {
      amount: 5000,
      commissionAmount: 0,
      paymentMethod: 'CASH_ON_MEET',
      status: 'COMPLETED',
      itemId: item2.id,
      buyerId: user3.id,
      sellerId: user2.id,
      completedAt: new Date(),
    },
  })

  console.log('Created sample transaction')

  // Mark item2 as sold
  await prisma.item.update({
    where: { id: item2.id },
    data: { status: 'SOLD' },
  })

  // Create sample messages (in Russian)
  const message1 = await prisma.message.create({
    data: {
      content: 'Привет! Этот товар еще доступен?',
      senderId: user3.id,
      receiverId: user1.id,
    },
  })

  const message2 = await prisma.message.create({
    data: {
      content: 'Да, доступен! Хочешь прийти посмотреть?',
      senderId: user1.id,
      receiverId: user3.id,
      isRead: true,
    },
  })

  console.log('Created sample messages')
  console.log('Seeding completed successfully!')
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

