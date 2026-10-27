
import { NextResponse } from "next/server";
import { prisma } from "../../../src/lib/prisma";

export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      orderBy: {
        name: "asc",
      },
    });

    return NextResponse.json({
      status: "ok",
      message: "Berhasil mengambil data kategori.",
      data: categories,
    });
  } catch (error) {
    console.error("Get categories failed:", error);

    return NextResponse.json(
      {
        status: "error",
        message: "Gagal mengambil data kategori.",
      },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, type } = body;

    if (
      typeof name !== "string" ||
      !name.trim() ||
      name.trim().length > 100
    ) {
      return NextResponse.json(
        {
          status: "error",
          message: "Nama kategori wajib diisi, maksimal 100 karakter.",
        },
        { status: 400 },
      );
    }

    if (type !== "INCOME" && type !== "EXPENSE") {
      return NextResponse.json(
        {
          status: "error",
          message: "Tipe kategori harus INCOME atau EXPENSE.",
        },
        { status: 400 },
      );
    }

    const category = await prisma.category.create({
      data: {
        name: name.trim(),
        type,
      },
    });

    return NextResponse.json(
      {
        status: "ok",
        message: "Kategori berhasil dibuat.",
        data: category,
      },
      { status: 201 },
    );
  } catch (error) {
    if (error instanceof SyntaxError) {
      return NextResponse.json(
        {
          status: "error",
          message: "Body JSON tidak valid.",
        },
        { status: 400 },
      );
    }

    // P2002 = nilai unik duplikat, misalnya nama kategori sudah digunakan.
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      error.code === "P2002"
    ) {
      return NextResponse.json(
        {
          status: "error",
          message: "Nama kategori tersebut sudah digunakan.",
        },
        { status: 409 },
      );
    }

    console.error("Create category failed:", error);

    return NextResponse.json(
      {
        status: "error",
        message: "Gagal membuat kategori.",
      },
      { status: 500 },
    );
  }
}
