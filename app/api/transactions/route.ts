
import { NextResponse } from "next/server";
import { prisma } from "../../../src/lib/prisma";

const transactionTypes = ["INCOME", "EXPENSE"] as const;

export async function GET() {
  try {
    const transactions = await prisma.transaction.findMany({
      include: {
        category: true,
      },
      orderBy: {
        transactionDate: "desc",
      },
    });

    return NextResponse.json({
      status: "ok",
      message: "Berhasil mengambil data transaksi.",
      data: transactions,
    });
  } catch (error) {
    console.error("Get transactions failed:", error);

    return NextResponse.json(
      {
        status: "error",
        message: "Gagal mengambil data transaksi.",
      },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const { type, amount, description, categoryId, transactionDate } = body;

    if (!transactionTypes.includes(type)) {
      return NextResponse.json(
        { status: "error", message: "Tipe transaksi tidak valid." },
        { status: 400 },
      );
    }

    if (
      !Number.isSafeInteger(amount) ||
      amount <= 0
    ) {
      return NextResponse.json(
        { status: "error", message: "Nominal harus berupa bilangan bulat positif." },
        { status: 400 },
      );
    }

    if (
      typeof description !== "string" ||
      !description.trim() ||
      description.trim().length > 255
    ) {
      return NextResponse.json(
        { status: "error", message: "Deskripsi wajib diisi, maksimal 255 karakter." },
        { status: 400 },
      );
    }

    if (!Number.isSafeInteger(categoryId) || categoryId <= 0) {
      return NextResponse.json(
        { status: "error", message: "ID kategori tidak valid." },
        { status: 400 },
      );
    }

    let parsedDate: Date | undefined;

    if (transactionDate !== undefined) {
      if (typeof transactionDate !== "string") {
        return NextResponse.json(
          { status: "error", message: "Format tanggal tidak valid." },
          { status: 400 },
        );
      }

      parsedDate = new Date(transactionDate);

      if (Number.isNaN(parsedDate.getTime())) {
        return NextResponse.json(
          { status: "error", message: "Tanggal transaksi tidak valid." },
          { status: 400 },
        );
      }
    }

    const category = await prisma.category.findUnique({
      where: { id: categoryId },
    });

    if (!category) {
      return NextResponse.json(
        { status: "error", message: "Kategori tidak ditemukan." },
        { status: 404 },
      );
    }

    if (category.type !== type) {
      return NextResponse.json(
        {
          status: "error",
          message: "Tipe transaksi harus sesuai dengan tipe kategori.",
        },
        { status: 400 },
      );
    }

    const transaction = await prisma.transaction.create({
      data: {
        type,
        amount,
        description: description.trim(),
        categoryId,
        ...(parsedDate ? { transactionDate: parsedDate } : {}),
        source: "WEB",
      },
      include: {
        category: true,
      },
    });

    return NextResponse.json(
      {
        status: "ok",
        message: "Transaksi berhasil ditambahkan.",
        data: transaction,
      },
      { status: 201 },
    );
  } catch (error) {
    if (error instanceof SyntaxError) {
      return NextResponse.json(
        { status: "error", message: "Body JSON tidak valid." },
        { status: 400 },
      );
    }

    console.error("Create transaction failed:", error);

    return NextResponse.json(
      { status: "error", message: "Gagal menambahkan transaksi." },
      { status: 500 },
    );
  }
}
