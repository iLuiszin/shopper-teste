// __mocks__/prisma.ts

const create = jest.fn()
const findFirst = jest.fn()

const prismaMock = {
  measure: {
    create,
    findFirst,
  },
}

export default prismaMock
