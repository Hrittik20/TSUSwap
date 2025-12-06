import { AuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export const authOptions: AuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Invalid credentials')
        }

        const user = await prisma.user.findUnique({
          where: {
            email: credentials.email,
          },
        })

        if (!user || !user?.password) {
          throw new Error('Invalid credentials')
        }

        const isCorrectPassword = await bcrypt.compare(
          credentials.password,
          user.password
        )

        if (!isCorrectPassword) {
          throw new Error('Invalid credentials')
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          dormitory: user.dormitory,
          roomNumber: user.roomNumber,
          profileImage: user.profileImage,
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id as string
        token.dormitory = (user as any).dormitory as string
        token.roomNumber = (user as any).roomNumber as string
        token.profileImage = (user as any).profileImage as string | undefined
      }
      return token
    },
    async session({ session, token }) {
      if (session.user && token) {
        const userId = token.id
        if (userId) {
          (session.user as any).id = typeof userId === 'string' ? userId : globalThis.String(userId)
        } else {
          (session.user as any).id = ''
        }
        (session.user as any).dormitory = token.dormitory as string | undefined
        (session.user as any).roomNumber = token.roomNumber as string | undefined
        (session.user as any).profileImage = token.profileImage as string | undefined
      }
      return session
    },
  },
  pages: {
    signIn: '/login',
  },
  session: {
    strategy: 'jwt',
  },
  secret: process.env.NEXTAUTH_SECRET,
}

