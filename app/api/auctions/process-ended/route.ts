import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createNotification } from '@/lib/notifications'

// This route processes ended auctions
// - If no bids: converts to regular listing with startPrice as price
// - If bids exist: marks as sold and notifies winner + seller

export async function POST(request: Request) {
  try {
    // Find all ended auctions that are still active
    const endedAuctions = await prisma.auction.findMany({
      where: {
        isActive: true,
        endTime: {
          lt: new Date()
        }
      },
      include: {
        item: {
          include: {
            seller: true
          }
        },
        bids: {
          orderBy: { amount: 'desc' },
          take: 1,
          include: {
            bidder: true
          }
        }
      }
    })

    const results = {
      processed: 0,
      convertedToRegular: 0,
      soldToWinner: 0,
      errors: [] as string[]
    }

    for (const auction of endedAuctions) {
      try {
        if (auction.bids.length === 0) {
          // No bids - convert to regular listing
          await prisma.$transaction([
            // Update item to regular listing with startPrice as price
            prisma.item.update({
              where: { id: auction.itemId },
              data: {
                listingType: 'REGULAR',
                price: auction.startPrice,
                status: 'ACTIVE'
              }
            }),
            // Mark auction as inactive
            prisma.auction.update({
              where: { id: auction.id },
              data: { isActive: false }
            })
          ])

          // Notify seller
          await createNotification({
            userId: auction.item.sellerId,
            type: 'AUCTION_ENDED',
            title: 'Auction ended with no bids',
            message: `Your auction for "${auction.item.title}" ended with no bids. It has been converted to a regular listing at ${auction.startPrice.toLocaleString()} ₽.`,
            relatedItemId: auction.itemId
          })

          results.convertedToRegular++
        } else {
          // Has bids - auction successful
          const winningBid = auction.bids[0]
          
          await prisma.$transaction([
            // Mark auction as inactive
            prisma.auction.update({
              where: { id: auction.id },
              data: { isActive: false }
            }),
            // Keep item status as ACTIVE until transaction is completed
            // The seller and buyer need to arrange meetup first
          ])

          // Notify the winner
          await createNotification({
            userId: winningBid.bidderId,
            type: 'AUCTION_ENDED',
            title: 'Congratulations! You won the auction!',
            message: `You won the auction for "${auction.item.title}" with a bid of ${winningBid.amount.toLocaleString()} ₽. Contact the seller to arrange the meetup.`,
            relatedItemId: auction.itemId
          })

          // Notify the seller
          await createNotification({
            userId: auction.item.sellerId,
            type: 'AUCTION_ENDED',
            title: 'Your auction has ended!',
            message: `Your auction for "${auction.item.title}" has ended. ${winningBid.bidder.name} won with a bid of ${winningBid.amount.toLocaleString()} ₽. They will contact you to arrange the meetup.`,
            relatedItemId: auction.itemId
          })

          // Create a message from winner to seller to start the conversation
          await prisma.message.create({
            data: {
              senderId: winningBid.bidderId,
              receiverId: auction.item.sellerId,
              content: `🎉 Hi! I won your auction for "${auction.item.title}" with a bid of ${winningBid.amount.toLocaleString()} ₽. When can we meet to complete the transaction?`
            }
          })

          results.soldToWinner++
        }

        results.processed++
      } catch (error) {
        results.errors.push(`Error processing auction ${auction.id}: ${error}`)
      }
    }

    return NextResponse.json({
      success: true,
      message: `Processed ${results.processed} ended auctions`,
      details: results
    })
  } catch (error) {
    console.error('Process ended auctions error:', error)
    return NextResponse.json(
      { error: 'Failed to process ended auctions' },
      { status: 500 }
    )
  }
}

// GET endpoint to check auction status (can be called periodically)
export async function GET() {
  try {
    const pendingAuctions = await prisma.auction.count({
      where: {
        isActive: true,
        endTime: {
          lt: new Date()
        }
      }
    })

    return NextResponse.json({
      pendingEndedAuctions: pendingAuctions,
      message: pendingAuctions > 0 
        ? `${pendingAuctions} auction(s) need processing. Call POST to process them.`
        : 'No auctions need processing.'
    })
  } catch (error) {
    console.error('Check auctions error:', error)
    return NextResponse.json(
      { error: 'Failed to check auctions' },
      { status: 500 }
    )
  }
}

