import { ImageResponse } from 'next/og'
 
export const runtime = 'edge'
export const alt = 'TSUSwap Item'
export const size = {
  width: 1200,
  height: 630,
}
export const contentType = 'image/png'
 
export default async function Image({ params }: { params: { id: string } }) {
  try {
    // Fetch item data
    const item = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/items/${params.id}`)
      .then(res => res.json())
      .catch(() => null)

    if (!item) {
      return new ImageResponse(
        (
          <div
            style={{
              background: '#0072bc',
              width: '100%',
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 60,
              fontWeight: 'bold',
              color: 'white',
            }}
          >
            TSUSwap
          </div>
        ),
        {
          ...size,
        }
      )
    }

    const price = item.listingType === 'AUCTION' 
      ? item.auction?.currentPrice 
      : item.price

    return new ImageResponse(
      (
        <div
          style={{
            background: 'white',
            width: '100%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {/* Header */}
          <div
            style={{
              background: '#0072bc',
              width: '100%',
              height: '100px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '0 60px',
            }}
          >
            <div
              style={{
                fontSize: 48,
                fontWeight: 'bold',
                color: 'white',
                display: 'flex',
              }}
            >
              TSUSwap
            </div>
            <div
              style={{
                fontSize: 24,
                color: 'white',
                display: 'flex',
                background: 'rgba(255,255,255,0.2)',
                padding: '8px 16px',
                borderRadius: '8px',
              }}
            >
              {item.listingType === 'AUCTION' ? '🔨 Auction' : '🛒 Buy Now'}
            </div>
          </div>

          {/* Content */}
          <div
            style={{
              display: 'flex',
              flex: 1,
              padding: '60px',
            }}
          >
            {/* Image */}
            {item.images[0] && (
              <div
                style={{
                  width: '400px',
                  height: '400px',
                  borderRadius: '16px',
                  overflow: 'hidden',
                  marginRight: '40px',
                  display: 'flex',
                }}
              >
                <img
                  src={item.images[0]}
                  alt={item.title}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                  }}
                />
              </div>
            )}

            {/* Details */}
            <div
              style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
              }}
            >
              <div
                style={{
                  fontSize: 48,
                  fontWeight: 'bold',
                  color: '#1f2937',
                  marginBottom: '20px',
                  display: 'flex',
                  lineHeight: 1.2,
                }}
              >
                {item.title.substring(0, 50)}
                {item.title.length > 50 ? '...' : ''}
              </div>

              <div
                style={{
                  fontSize: 64,
                  fontWeight: 'bold',
                  color: '#0072bc',
                  marginBottom: '20px',
                  display: 'flex',
                }}
              >
                {price?.toLocaleString('ru-RU')} ₽
              </div>

              <div
                style={{
                  fontSize: 28,
                  color: '#6b7280',
                  marginBottom: '10px',
                  display: 'flex',
                }}
              >
                {item.category} • {item.condition}
              </div>

              <div
                style={{
                  fontSize: 24,
                  color: '#9ca3af',
                  display: 'flex',
                }}
              >
                Seller: {item.seller.name} • Room {item.seller.roomNumber}
              </div>
            </div>
          </div>
        </div>
      ),
      {
        ...size,
      }
    )
  } catch (e) {
    console.error(e)
    return new ImageResponse(
      (
        <div
          style={{
            background: '#0072bc',
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 60,
            fontWeight: 'bold',
            color: 'white',
          }}
        >
          TSUSwap
        </div>
      ),
      {
        ...size,
      }
    )
  }
}

