import { Metadata } from 'next'

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  try {
    const item = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/items/${params.id}`, {
      cache: 'no-store',
    }).then(res => res.json()).catch(() => null)

    if (!item) {
      return {
        title: 'Item Not Found - TSUSwap',
      }
    }

    const price = item.listingType === 'AUCTION' 
      ? item.auction?.currentPrice 
      : item.price

    const description = item.description.length > 160 
      ? item.description.substring(0, 157) + '...'
      : item.description

    const url = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/items/${item.id}`

    return {
      title: `${item.title} - ${price?.toLocaleString('ru-RU')} ₽ | TSUSwap`,
      description: description,
      openGraph: {
        title: `${item.title} - ${price?.toLocaleString('ru-RU')} ₽`,
        description: description,
        url: url,
        siteName: 'TSUSwap',
        images: [
          {
            url: item.images[0] || '/default-image.jpg',
            width: 1200,
            height: 630,
            alt: item.title,
          },
        ],
        locale: 'en_US',
        type: 'website',
      },
      twitter: {
        card: 'summary_large_image',
        title: `${item.title} - ${price?.toLocaleString('ru-RU')} ₽`,
        description: description,
        images: [item.images[0] || '/default-image.jpg'],
      },
      other: {
        // WhatsApp specific
        'og:image:width': '1200',
        'og:image:height': '630',
      },
    }
  } catch (error) {
    return {
      title: 'TSUSwap - University Dorm Marketplace',
    }
  }
}

