
import { NextResponse } from "next/server";
import { prisma } from "../../../../src/lib/prisma";

type RouteContext = {
  params: Promise<{ id: string }>;
};

function parseId(value: string) {
  if (!/^[1-9]\d*$/.test(value)) return null;

  const id = Number(value);
  return Number.isSafeInteger(id) ? id : null;
}

export async function PATCH(
  request: Request,
  { params }: RouteContext,
) {
  try {
    const { id: rawId } = await params;
    const id = parseId(rawId);

    if (id === null) {
      return NextResponse.json(
        { status: "error", message: "ID transaksi tidak valid." },
        { status: 400 },
      );
    }

    const body = await request.json();

    const {
      type,
      amount,
      description,
      categoryId,
      transactionDate,
    } = body;

    const data: {
      type?: "INCOME" | "EXPENSE";
      amount?: number;
      description?: string;
      categoryId?: number;
      transactionDate?: Date;
    } = {};

    if (type !== undefined) {
      if (type !== "INCOME" && type !== "EXPENSE") {
        return NextResponse.json(
          { status: "error", message: "Tipe transaksi tidak valid." },
          { status: 400 },
        );
      }
      data.type = type;
    }

    if (amount !== undefined) {
      if (!Number.isSafeInteger(amount) || amount <= 0) {
        return NextResponse.json(
          { status: "error", message: "Nominal harus berupa bilangan bulat positif." },
          { status: 400 },
        );
      }
      data.amount = amount;
    }

    if (description !== undefined) {
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
      data.description = description.trim();
    }

    if (categoryId !== undefined) {
      if (!Number.isSafeInteger(categoryId) || categoryId <= 0) {
        return NextResponse.json(
          { status: "error", message: "ID kategori tidak valid." },
          { status: 400 },
        );
      }
      data.categoryId = categoryId;
    }

    if (transactionDate !== undefined) {
      if (typeof transactionDate !== "string") {
        return NextResponse.json(
          { status: "error", message: "Format tanggal tidak valid." },
          { status: 400 },
        );
      }

      const date = new Date(transactionDate);

      if (Number.isNaN(date.getTime())) {
        return NextResponse.json(
          { status: "error", message: "Tanggal transaksi tidak valid." },
          { status: 400 },
        );
      }

      data.transactionDate = date;
    }

    if (Object.keys(data).length === 0) {
      return NextResponse.json(
        { status: "error", message: "Tidak ada data yang diubah." },
        { status: 400 },
      );
    }

    const existing = await prisma.transaction.findUnique({
      where: { id },
      include: { category: true },
    });

    if (!existing) {
      return NextResponse.json(
        { status: "error", message: "Transaksi tidak ditemukan." },
        { status: 404 },
      );
    }

    const finalType = data.type ?? existing.type;
    const finalCategoryId = data.categoryId ?? existing.categoryId;

    if (
      data.categoryId !== undefined ||
      data.type !== undefined
    ) {
      const category = await prisma.category.findUnique({
        where: { id: finalCategoryId },
      });

      if (!category) {
        return NextResponse.json(
          { status: "error", message: "Kategori tidak ditemukan." },
          { status: 404 },
        );
      }

      if (category.type !== finalType) {
        return NextResponse.json(
          {
            status: "error",
            message: "Tipe transaksi harus sesuai dengan tipe kategori.",
          },
          { status: 400 },
        );
      }
    }

    const transaction = await prisma.transaction.update({
      where: { id },
      data,
      include: { category: true },
    });

    return NextResponse.json({
      status: "ok",
      message: "Transaksi berhasil diperbarui.",
      data: transaction,
    });
  } catch (error) {
    if (error instanceof SyntaxError) {
      return NextResponse.json(
        { status: "error", message: "Body JSON tidak valid." },
        { status: 400 },
      );
    }

    console.error("Update transaction failed:", error);

    return NextResponse.json(
      { status: "error", message: "Gagal memperbarui transaksi." },
      { status: 500 },
    );
  }
}

export async function DELETE(
  _request: Request,
  { params }: RouteContext,
) {
  try {
    const { id: rawId } = await params;
    const id = parseId(rawId);

    if (id === null) {
      return NextResponse.json(
        { status: "error", message: "ID transaksi tidak valid." },
        { status: 400 },
      );
    }

    const existing = await prisma.transaction.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json(
        { status: "error", message: "Transaksi tidak ditemukan." },
        { status: 404 },
      );
    }

    await prisma.transaction.delete({
      where: { id },
    });

    return NextResponse.json({
      status: "ok",
      message: "Transaksi berhasil dihapus.",
    });
  } catch (error) {
    console.error("Delete transaction failed:", error);

    return NextResponse.json(
      { status: "error", message: "Gagal menghapus transaksi." },
      { status: 500 },
    );
  }
}
