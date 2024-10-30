export const returnUserObject = {
  id: true,
  createdAt: true,
  updatedAt: true,
  phoneNumber: true,
  pin: true,
  name: true,
  picture: true,
  favorites: {
    // Обновляем связь с избранными постами
    select: {
      post: {
        // Указываем связь с постами
        select: {
          id: true,
          address: true,
          description: true,
          wash: {
            select: {
              id: true,
              name: true
            }
          }
        }
      }
    }
  }
}
