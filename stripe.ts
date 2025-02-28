import { PrismaClient } from '@prisma/client';
import Stripe from 'stripe';

const prisma = new PrismaClient();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2022-11-15',
});

export async function POST(req) {
  try {
    const { produtos, tokenPagamento } = await req.json();

    // Validações básicas
    if (!produtos || produtos.length === 0 || !tokenPagamento) {
      return new Response("Produtos e token de pagamento são obrigatórios.", { status: 400 });
    }

    // Inicia uma transação no Prisma com o bloqueio de todos os produtos que estão sendo comprados
    const result = await prisma.$transaction(async (prisma) => {
      const produtosReservados = [];

      // Primeiro, vamos verificar e bloquear os produtos
      for (let produtoData of produtos) {
        const { produtoId, quantidade } = produtoData;

        // Busca o produto e bloqueia ele para evitar concorrência
        const produto = await prisma.produto.findUnique({
          where: { id: produtoId },
          lock: true,  // Bloqueia o produto até o final da transação
        });

        if (!produto || produto.quantidade < quantidade) {
          throw new Error(`Estoque insuficiente para o produto ${produto.nome}`);
        }

        // Marca o produto como "reservado" (sem atualizar o estoque ainda)
        const produtoReservado = await prisma.produto.update({
          where: { id: produtoId },
          data: { status: 'reservado' },  // Atualiza o status, mas não o estoque físico
        });

        produtosReservados.push(produtoReservado);
      }

      return produtosReservados;
    });

    // Agora, cria o PaymentIntent no Stripe para todos os produtos
    const totalAmount = produtos.reduce((total, produtoData) => {
      const { produtoId, quantidade } = produtoData;
      // Calcular o preço total para todos os produtos
      const produto = await prisma.produto.findUnique({ where: { id: produtoId } });
      return total + produto.preco * quantidade;
    }, 0);

    const paymentIntent = await stripe.paymentIntents.create({
      amount: totalAmount * 100, // Convertendo para centavos
      currency: 'brl',
      payment_method: tokenPagamento,
      confirmation_method: 'manual',
      confirm: true,
    });

    if (paymentIntent.status === 'succeeded') {
      // Se o pagamento for bem-sucedido, decrementa o estoque e marca os produtos como vendidos
      await prisma.$transaction(async (prisma) => {
        for (let produtoData of produtos) {
          const { produtoId, quantidade } = produtoData;

          // Atualiza o estoque de cada produto
          const produto = await prisma.produto.update({
            where: { id: produtoId },
            data: {
              quantidade: {
                decrement: quantidade,  // Decrementa o estoque
              },
              status: 'vendido',  // Marca o produto como vendido
            },
          });
        }
      });

      return new Response(
        JSON.stringify({ message: 'Compra realizada com sucesso' }),
        { status: 200 }
      );
    } else {
      // Se o pagamento falhar, reverte o status dos produtos para "disponível"
      await prisma.$transaction(async (prisma) => {
        for (let produtoData of produtos) {
          const { produtoId } = produtoData;
          await prisma.produto.update({
            where: { id: produtoId },
            data: { status: 'disponível' },  // Reverte o status para "disponível"
          });
        }
      });

      return new Response("Pagamento falhou. Estoque revertido.", { status: 400 });
    }
  } catch (error) {
    console.error(error);
    return new Response(
      JSON.stringify({ message: error.message }),
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
