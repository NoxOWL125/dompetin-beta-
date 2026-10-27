
import { NextResponse } from "next/server";
import { prisma } from "../../../src/lib/prisma";

export async function GET() {
  try {
    const [income, expense, latestTransactions] = await Promise.all([
      prisma.transaction.aggregate({
        where: { type: "INCOME" },
        _sum: { amount: true },
      }),

      prisma.transaction.aggregate({
        where: { type: "EXPENSE" },
        _sum: { amount: true },
      }),

      prisma.transaction.findMany({
        take: 5,
        orderBy: [
          { transactionDate: "desc" },
          { id: "desc" },
        ],
        include: {
          category: true,
        },
      }),
    ]);

    const totalIncome = income._sum.amount ?? 0;
    const totalExpense = expense._sum.amount ?? 0;
    const balance = totalIncome - totalExpense;

    return NextResponse.json({
      status: "ok",
      message: "Berhasil mengambil ringkasan keuangan.",
      data: {
        balance,
        totalIncome,
        totalExpense,
        latestTransactions,
      },
    });
  } catch (error) {
    console.error("Dashboard summary failed:", error);

    return NextResponse.json(
      {
        status: "error",
        message: "Gagal mengambil ringkasan keuangan.",
      },
      { status: 500 },
    );
  }
}
