import { Prisma } from '@prisma/client'

export const returnUserObject: Prisma.UserSelect = {
  id: true,
  name: true,
  phoneNumber: true,
  picture: true,
  pin: false,
  balance: true,
  cashback: true
}
