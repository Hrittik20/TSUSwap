import { ImageResponse } from 'next/og'
import { NextRequest } from 'next/server'

export const runtime = 'edge'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { searchParams } = new URL(request.url)
    const hasTitle = searchParams.has('title')
    const title = hasTitle
      ? searchParams.get('title')?.slice(0, 100)
      : 'TSUSwap Item'

    return new ImageResponse(
      (
        <div
          style={{
            background: 'linear-gradient(to bottom, #0072bc, #005b96)',
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'column',
            color: 'white',
            fontFamily: 'system-ui',
          }}
        >
          <div style={{ fontSize: 72, fontWeight: 'bold', marginBottom: 20 }}>
            TSUSwap
          </div>
          <div
            style={{
              fontSize: 48,
              textAlign: 'center',
              padding: '0 80px',
              maxWidth: '100%',
            }}
          >
            {title}
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    )
  } catch (e: any) {
    console.log(`${e.message}`)
    return new Response(`Failed to generate the image`, {
      status: 500,
    })
  }
}





