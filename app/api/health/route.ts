
import { NextResponse } from "next/server";
import { prisma } from "../../../src/lib/prisma";

export async function GET() {
  try {
    const [categories, transactions] = await Promise.all([
      prisma.category.count(),
      prisma.transaction.count(),
    ]);

    return NextResponse.json({
      status: "ok",
      message: "Dompetin berhasil terhubung ke database!",
      data: {
        categories,
        transactions,
      },
    });
  } catch (error) {
    console.error("Database health check failed:", error);

    return NextResponse.json(
      {
        status: "error",
        message: "Gagal mengakses database.",
      },
      { status: 500 },
    );
  }
}
