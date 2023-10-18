import { Elysia, t } from 'elysia';
import { prisma } from '~libs/prisma';
import { hashSenha, hashEmail } from '~utils/hash'
import { authMiddleware, verificaAuthUser } from '~middlewares/auth';
import { Usuarios } from '@prisma/client';

/**
 * Controller de usuário
 */
export const userController = new Elysia({ prefix: '/user' })

  .use(authMiddleware)

  .post('/add', async ({ body, set, cookie, jwt, getAuthUser, verificaPermissao }) => {
    // pega o usuario pelo token
    const usuario = await getAuthUser({ jwt, cookie }) as Usuarios;
    // verifica se o usuario tem permissão de Admin ou Usuarios
    if (!verificaPermissao(usuario, "USUARIOS")) {
      set.status = 403;
      return {
        status: 403,
        message: 'Usuário sem permissão.',
        data: null
      }
    }

    // pega os dados do body
    const { nome, sobrenome, email, password, linkedin, github, curso, funcao, foto, permissaoAdmin, permissaoProjetos, permissaoPublicacoes, permissaoUsuarios } = body;

    // verifica se o email já existe
    const novoUsuario = await prisma.usuarios.findUnique({ where: { email } });
    if (novoUsuario) {
      set.status = 409;
      return {
        status: 409,
        message: 'Usuário já existe.',
        data: null
      }
    }

    // salva a foto no servidor
    let fotoPath = '';
    if (foto) {
      fotoPath = `./public/uploads/img/usuarios/${email}/${foto.name}`;
      const fotoBuffer = await foto.arrayBuffer();
      const uploaded = await Bun.write(fotoPath, fotoBuffer);
    }
    else {
      const hashedEmail = await hashEmail(email);
      fotoPath = `https://www.gravatar.com/avatar/${hashedEmail}?d=identicon`;
    }

    // cria o novo usuario
    const hashedSenha = await hashSenha(password);
    const novoUsuarioCriado = await prisma.usuarios.createWithAuthUser({
      data: {
        nome,
        sobrenome,
        email,
        senha: hashedSenha,
        linkedin,
        github,
        curso,
        funcao,
        foto: fotoPath,
        permissaoAdmin,
        permissaoProjetos,
        permissaoPublicacoes,
        permissaoUsuarios,
      }
    },
      usuario
    );

    // desconecta do banco para não deixar a conexão aberta
    await prisma.$disconnect();

    // retorna o novo usuario
    set.status = 201;
    return {
      status: 201,
      message: 'Usuário criado com sucesso.',
      data: novoUsuarioCriado
    }
  },
    {
      beforeHandle: verificaAuthUser,
      body: t.Object({
        nome: t.Optional(t.String()),
        sobrenome: t.Optional(t.String()),
        email: t.String(),
        password: t.String(),
        linkedin: t.Optional(t.String()),
        github: t.Optional(t.String()),
        curso: t.Optional(t.String()),
        funcao: t.Optional(t.Integer()),
        foto: t.Optional(t.File({ maxSize: 1024 * 1024 * 2, mimetype: ['image/png', 'image/jpg', 'image/jpeg'] })),
        permissaoAdmin: t.Optional(t.Boolean()),
        permissaoProjetos: t.Optional(t.Boolean()),
        permissaoPublicacoes: t.Optional(t.Boolean()),
        permissaoUsuarios: t.Optional(t.Boolean()),
      }),
      detail: { 
        tags: ['User'],
        summary: 'Adicionar Usuário',
        description: 'Adiciona o novo usuário ao banco e retorna os dados do usuário.',
        security: [{ cookieAuth: [] }],
        responses: {
          201: {
            description: 'Created.',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: { type: 'number', example: 201 },
                    message: { type: 'string', example: 'Usuário criado com sucesso.' },
                    data: { type: 'object' },
                  }
                }
              }
            }
          },
          401: { 
            description: 'Unauthorized.',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: { type: 'number', example: 401 },
                    message: { type: 'string', example: 'Usuário e/ou senha incorretos.' },
                    data: { type: 'object' },
                  }
                }
              }
            } 
          },
          403: { 
            description: 'Forbidden.',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: { type: 'number', example: 403 },
                    message: { type: 'string', example: 'Usuário sem permissão.' },
                    data: { type: 'object' },
                  }
                }
              }
            } 
          },
          409: { 
            description: 'Conflict.',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: { type: 'number', example: 409 },
                    message: { type: 'string', example: 'Usuário já existe.' },
                    data: { type: 'object' },
                  }
                }
              }
            } 
          },
        }
      }
    }
  )

  // .patch('/edit/:id', async ({ params, body, set, cookie, jwt }) => {
  //   // pega o usuario pelo token
  //   const usuario = await getAuthUser({ jwt, set, cookie });
  //   if (!usuario) {
  //     set.status = 401;
  //     return {
  //       status: 401,
  //       message: 'Unauthorized',
  //       data: null
  //     }
  //   }
  //   // verifica se o usuario tem permissão de Admin ou Usuarios ou se é o mesmo usuario que está sendo editado
  //   const temPermissao = verificaPermissaoUsuario(usuario, 'USUARIOS', parseInt(params.id));
  //   if (!temPermissao) {
  //     set.status = 403;
  //     return {
  //       status: 403,
  //       message: 'Forbidden',
  //       data: null
  //     }
  //   }

  //   // pega os dados do body
  //   const { nome, sobrenome, email, password, linkedin, github, curso, funcao, foto, permissaoAdmin, permissaoProjetos, permissaoPublicacoes, permissaoUsuarios } = body;

  //   // verifica se o id existe
  //   const usuarioParaEditar = await prisma.usuarios.findUniqueAtivo({ where: { id: parseInt(params.id) } });
  //   if (!usuarioParaEditar) {
  //     set.status = 404;
  //     return {
  //       status: 404,
  //       message: 'Usuário não existe.',
  //       data: null
  //     }
  //   }

  //   // salva a foto no servidor
  //   let fotoPath = '';
  //   if (foto) {
  //     fotoPath = `./public/uploads/img/usuarios/${email}/${foto.name}`;
  //     const fotoBuffer = await foto.arrayBuffer();
  //     const uploaded = await Bun.write(fotoPath, fotoBuffer);
  //   }
  //   else {
  //     const hashedEmail = await hashEmail(email);
  //     fotoPath = `https://www.gravatar.com/avatar/${hashedEmail}?d=identicon`;
  //   }

  //   // edita o usuario
  //   const hashedSenha = await hashSenha(password);
  //   const usuarioEditado = await prisma.usuarios.updateWithAuthUser({
  //     data: {
  //       nome,
  //       sobrenome,
  //       email,
  //       senha: hashedSenha,
  //       linkedin,
  //       github,
  //       curso,
  //       funcao,
  //       foto: fotoPath,
  //       permissaoAdmin,
  //       permissaoProjetos,
  //       permissaoPublicacoes,
  //       permissaoUsuarios,
  //     },
  //     where: {
  //       id: parseInt(params.id)
  //     }
  //   },
  //     usuario
  //   );

  //   // desconecta do banco para não deixar a conexão aberta
  //   await prisma.$disconnect();

  //   // retorna o novo usuario
  //   return {
  //     status: 200,
  //     message: 'Usuário editado com sucesso.',
  //     data: usuarioEditado
  //   }
  // },
  //   {
  //     body: t.Object({
  //       nome: t.Optional(t.String()),
  //       sobrenome: t.Optional(t.String()),
  //       email: t.String(),
  //       password: t.String(),
  //       linkedin: t.Optional(t.String()),
  //       github: t.Optional(t.String()),
  //       curso: t.Optional(t.String()),
  //       funcao: t.Optional(t.Integer()),
  //       foto: t.Optional(t.File({ maxSize: 1024 * 1024 * 2, mimetype: ['image/png', 'image/jpg', 'image/jpeg'] })),
  //       permissaoAdmin: t.Optional(t.Boolean()),
  //       permissaoProjetos: t.Optional(t.Boolean()),
  //       permissaoPublicacoes: t.Optional(t.Boolean()),
  //       permissaoUsuarios: t.Optional(t.Boolean()),
  //     })
  //   }
  // )

  // // TODO: terminar o delete
  // .delete('/delete/:id', async ({ params, body, set, cookie, jwt }) => {
  //   // pega o usuario pelo token
  //   const usuario = await getAuthUser({ jwt, set, cookie });
  //   if (!usuario) {
  //     set.status = 401;
  //     return {
  //       status: 401,
  //       message: 'Unauthorized',
  //       data: null
  //     }
  //   }
  //   // verifica se o usuario tem permissão de Admin ou Usuarios ou se é o mesmo usuario que está sendo editado
  //   const temPermissao = verificaPermissaoUsuario(usuario, 'USUARIOS');
  //   if (!temPermissao) {
  //     set.status = 403;
  //     return {
  //       status: 403,
  //       message: 'Forbidden',
  //       data: null
  //     }
  //   }

  //   // verifica se o id existe
  //   const usuarioParaDeletar = await prisma.usuarios.findUniqueAtivo({ where: { id: parseInt(params.id) } });
  //   if (!usuarioParaDeletar) {
  //     set.status = 404;
  //     return {
  //       status: 404,
  //       message: 'Usuário não existe.',
  //       data: null
  //     }
  //   }

  //   // desconecta do banco para não deixar a conexão aberta
  //   await prisma.$disconnect();

  //   // retorna o novo usuario
  //   return {
  //     status: 200,
  //     message: 'Usuário editado com sucesso.',
  //     data: null
  //   }
  // })

  // // TODO: terminar o list com parametros
  // .get('/list', async () => {
  //   // pega todos os usuarios
  //   const usuarios = await prisma.usuarios.findManyAtivo({ 
  //     select : {
  //       id: true,
  //       nome: true,
  //       sobrenome: true,
  //       linkedin: true,
  //       github: true,
  //       curso: true,
  //       funcao: true,
  //       foto: true,
  //     },
  //     orderBy: { 
  //       nome: 'asc' 
  //     } 
  //   });

  //   // desconecta do banco para não deixar a conexão aberta
  //   await prisma.$disconnect();

  //   // retorna os usuarios
  //   return {
  //     status: 200,
  //     message: 'Usuários encontrados.',
  //     data: usuarios
  //   }
  // })

  // .get('/view/:id', async ({ params }) => {
  //   // pega todos os usuarios
  //   const usuarios = await prisma.usuarios.findUniqueAtivo({ 
  //     select : {
  //       id: true,
  //       nome: true,
  //       sobrenome: true,
  //       linkedin: true,
  //       github: true,
  //       curso: true,
  //       funcao: true,
  //       foto: true,
  //     },
  //     where: {
  //       id: parseInt(params.id)
  //     }
  //   });

  //   // desconecta do banco para não deixar a conexão aberta
  //   await prisma.$disconnect();

  //   // retorna os usuarios
  //   return {
  //     status: 200,
  //     message: 'Usuários encontrados.',
  //     data: usuarios
  //   }
  // })