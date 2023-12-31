import { Prisma, PrismaClient, Usuarios } from '@prisma/client';

const prisma = new PrismaClient()
// Create Extension
.$extends({
  name: 'Create-WithAuthenticatedUser',
  model: {
    $allModels: {
      /** createWithAuthUser -> create */
      async createWithAuthUser<T> (this: T, args: Prisma.Args<T, 'create'>['create'], authUser: Usuarios) : Promise<T> {
        const context = Prisma.getExtensionContext(this);
        args.data = {
          userCreated: {
            connect: {
              id: authUser.id
            }
          },
          ...args.data
        }
        return await (context as any).create(args);
      },
      /** createManyWithAuthUser -> createMany */
      async createManyWithAuthUser<T> (this: T, args: Prisma.Args<T, 'createMany'>['createMany'], authUser: Usuarios) : Promise<T> {
        const context = Prisma.getExtensionContext(this);
        const dataToModify = [...args.data];
        dataToModify.forEach((element:any, idx) => {
          element = {
            userCreated: {
              connect: {
                id: authUser.id
              }
            },
            ...element
          }
          dataToModify[idx] = element;
        }); 
        args.data = dataToModify;
        return await (context as any).createMany(args);
      },
    }
  }
})
// Update Extension
.$extends({
  name: 'Update-WithAuthenticatedUser',
  model: {
    $allModels: {
      /** updateWithAuthUser -> update */
      async updateWithAuthUser<T> (this: T, args: Prisma.Args<T, 'update'>['update'], authUser: Usuarios) : Promise<T> {
        const context = Prisma.getExtensionContext(this);
        args.data = {
          // userUpdatedId: authUser.id,
          userUpdated: {
            connect: {
              id: authUser.id
            }
          },
          ...args.data
        }
        return await (context as any).update(args);
      },
      /** updateManyWithAuthUser -> updateMany */
      async updateManyWithAuthUser<T> (this: T, args: Prisma.Args<T, 'updateMany'>['updateMany'], authUser: Usuarios) : Promise<T> {
        const context = Prisma.getExtensionContext(this);
        args.data = {
          userUpdatedId: authUser.id,
          ...args.data
        }
        return await (context as any).updateMany(args);
      },
    }
  }
})
// Upsert Extension
.$extends({
  name: 'Upsert-WithAuthenticatedUser',
  model: {
    $allModels: {
      /** upsertWithAuthUser -> upsert */
      async upsertWithAuthUser<T> (this: T, args: Prisma.Args<T, 'upsert'>['upsert'], authUser: Usuarios) : Promise<T> {
        const context = Prisma.getExtensionContext(this);
        args.update = {
          // userUpdatedId: authUser.id,
          userUpdated: {
            connect: {
              id: authUser.id
            }
          },
          ...args.update
        }
        args.create = {
          // userCreatedId: authUser.id,
          userCreated: {
            connect: {
              id: authUser.id
            }
          },
          ...args.create
        }
        return await (context as any).upsert(args);
      },
    }
  }
})
// Find Extension
.$extends({
  name: 'Find-FilteredBySituacaoCadastro',
  model: {
    $allModels: {
      /** findFirstAtivo -> findFirst com situacaoCadastroId = 1 */
      async findFirstAtivo<T> (this: T, args: Prisma.Args<T, 'findFirst'>['findFirst']) : Promise<T> {
        const context = Prisma.getExtensionContext(this);
        args.where = {
          situacaoCadastroId: 1,
          ...args.where
        }
        return await (context as any).findFirst(args);
      },
      /** findUniqueAtivo -> findUnique com situacaoCadastroId = 1 */
      async findUniqueAtivo<T> (this: T, args: Prisma.Args<T, 'findUnique'>['findUnique']) : Promise<T> {
        const context = Prisma.getExtensionContext(this);
        args.where = {
          situacaoCadastroId: 1,
          ...args.where
        }
        return await (context as any).findUnique(args);
      },
      /** findManyAtivo -> findMany com situacaoCadastroId = 1*/
      async findManyAtivo<T> (this: T, args: Prisma.Args<T, 'findMany'>['findMany']) : Promise<T[]> {
        const context = Prisma.getExtensionContext(this);
        args.where = {
          situacaoCadastroId: 1,
          ...args.where
        }
        if (!args.orderBy) {
          args.orderBy = {
            id: 'asc',
          }
        }
        return await (context as any).findMany(args);
      },
    }
  }
})
// Find With Pagination Extension
.$extends({
  name: 'Find-WithPagination',
  model: {
    $allModels: {
      /** findManyWithPagination -> findMany com paginação */
      async findManyWithPagination<T> (this: T, args: Prisma.Args<T, 'findMany'>['findMany'], page: number, limit: number) : Promise<T[]> {
        const context = Prisma.getExtensionContext(this);
        args.skip = (page - 1) * limit;
        args.take = limit;
        args.orderBy = {
          id: 'asc',
          ...args.orderBy
        }
        return await (context as any).findMany(args);
      },
      /** findManyAtivoWithPagination -> findMany com situacaoCadastroId = 1, e paginação */
      async findManyAtivoWithPagination<T> (this: T, args: Prisma.Args<T, 'findMany'>['findMany'], page: number, limit: number) : Promise<T[]> {
        const context = Prisma.getExtensionContext(this);
        args.skip = (page - 1) * limit;
        args.take = limit;
        args.where = {
          situacaoCadastroId: 1,
          ...args.where
        }
        args.orderBy = {
          id: 'asc',
          ...args.orderBy
        }
        return await (context as any).findMany(args);
      }
    }
  }
})
// Soft Delete Extension
.$extends({
  name: 'SoftDelete',
  model: {
    $allModels: {
      /** deleteWithAuthUser -> update com situacaoCadastroId = 2 e userUpdatedId = authUser  */
      async deleteWithAuthUser<T> (this: T, args: Prisma.Args<T, 'delete'>['delete'], authUser: Usuarios) : Promise<T> {
        const context = Prisma.getExtensionContext(this);
        const data = {
          // situacaoCadastroId: 2,
          situacaoCadastro: {
            connect: {
              id: 2
            }
          },
          userUpdated: {
            connect: {
              id: authUser.id
            }
          }
        }
        args.data = data;
        const where = {
          ...args.where
        }
        args.where = where;
        return await (context as any).update(args);
      },
      /** deleteManyWithAuthUser -> updateMany com situacaoCadastroId = 2 e userUpdatedId = authUser */
      async deleteManyWithAuthUser<T> (this: T, args: Prisma.Args<T, 'deleteMany'>['deleteMany'], authUser: Usuarios) : Promise<T> {
        const context = Prisma.getExtensionContext(this);
        args.data = {
          situacaoCadastroId: 2,
          userUpdatedId: authUser.id,
          ...args.data
        }
        args.where = {
          ...args.where
        }
        return await (context as any).updateMany(args);
      },
    }
  }
})

export { prisma };