
"use client";

import { useCallback, useEffect, useState } from "react";

type Transaction = {
  id: number;
  type: "INCOME" | "EXPENSE";
  amount: number;
  description: string;
  transactionDate: string;
  category: { name: string };
};

type DashboardData = {
  balance: number;
  totalIncome: number;
  totalExpense: number;
  latestTransactions: Transaction[];
};

const rupiah = (amount: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(amount);

const tanggal = (value: string) =>
  new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));

export default function Home() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadDashboard = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/dashboard", {
        cache: "no-store",
      });
      const result = await response.json();

      if (!response.ok || result.status !== "ok") {
        throw new Error(result.message || "Gagal memuat dashboard.");
      }

      setData(result.data);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Terjadi kesalahan saat memuat data."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadDashboard();
  }, [loadDashboard]);

  return (
    <main className="min-h-screen bg-[#F1E6D0] text-[#292722]">
      <div className="mx-auto flex min-h-screen max-w-[1600px]">
        {/* SIDEBAR */}
        <aside className="hidden w-64 shrink-0 flex-col border-r border-[#D8C6A5] bg-[#E8D9BD] p-7 md:flex">
          <a href="/" className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg border border-[#B08D57] bg-[#24382D] font-serif text-2xl font-bold text-[#F1E6D0]">
              D
            </div>
            <div>
              <h1 className="font-serif text-xl font-bold tracking-wide">
                Dompetin
              </h1>
              <p className="text-[10px] uppercase tracking-[0.2em] text-[#75664F]">
                Personal Ledger
              </p>
            </div>
          </a>

          <div className="my-8 border-t border-[#CDBB9B]" />

          <p className="mb-4 text-[10px] font-bold uppercase tracking-[0.2em] text-[#8A7759]">
            Buku Keuangan
          </p>

          <nav className="space-y-2">
            <a
              href="/"
              className="flex items-center gap-3 rounded-lg border border-[#CDBB9B] bg-[#F5EBD9] px-4 py-3 font-semibold text-[#24382D] shadow-sm"
            >
              <span>▦</span> Dashboard
            </a>
            <a
              href="#transaksi"
              className="flex items-center gap-3 rounded-lg px-4 py-3 text-[#75664F] transition hover:bg-[#F1E6D0]"
            >
              <span>↔</span> Transaksi
            </a>
            <a
              href="#ringkasan"
              className="flex items-center gap-3 rounded-lg px-4 py-3 text-[#75664F] transition hover:bg-[#F1E6D0]"
            >
              <span>◷</span> Ringkasan
            </a>
          </nav>

          <div className="mt-auto border border-[#CDBB9B] bg-[#F5EBD9] p-4">
            <p className="font-serif font-bold text-[#24382D]">
              The House Ledger
            </p>
            <p className="mt-3 text-xs leading-6 text-[#75664F]">
              Every rupiah accounted for. Every decision made with purpose.
            </p>
            <div className="mt-4 border-t border-[#D8C6A5] pt-3 text-[9px] uppercase tracking-[0.15em] text-[#8A7759]">
              Discipline. Records. Prosperity.
            </div>
          </div>
        </aside>

        {/* KONTEN UTAMA */}
        <section className="min-w-0 flex-1 p-5 sm:p-8 lg:p-10">
          <header className="mb-8 flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="mb-2 flex items-center gap-2">
                <span className="h-px w-7 bg-[#B08D57]" />
                <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-[#8A7759]">
                  The Birmingham Ledger
                </p>
              </div>
              <h2 className="font-serif text-3xl font-bold text-[#24382D] sm:text-4xl">
                Dashboard Keuangan
              </h2>
              <p className="mt-2 text-sm text-[#75664F]">
                Kelola setiap rupiah dengan perhitungan matang.
              </p>
            </div>

            <button
              onClick={() => void loadDashboard()}
              disabled={loading}
              className="rounded-lg border border-[#B08D57] bg-[#FAF4E8] px-4 py-3 text-sm font-semibold text-[#24382D] transition hover:bg-[#E8D9BD] disabled:opacity-60"
            >
              {loading ? "Memuat..." : "↻ Perbarui Data"}
            </button>
          </header>

          {error && (
            <div
              role="alert"
              className="mb-6 flex flex-wrap items-center justify-between gap-3 border border-[#A54B37] bg-[#F8E7DD] p-4 text-sm text-[#783C2D]"
            >
              <p>{error}</p>
              <button
                onClick={() => void loadDashboard()}
                className="font-semibold underline"
              >
                Coba lagi
              </button>
            </div>
          )}

          {/* RINGKASAN KEUANGAN */}
          <section
            id="ringkasan"
            className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3"
          >
            <article className="relative overflow-hidden rounded-xl border border-[#B08D57]/60 bg-[#24382D] p-6 text-[#F1E6D0] shadow-md sm:col-span-2 xl:col-span-1">
              <div className="pointer-events-none absolute -right-8 -top-8 h-36 w-36 rounded-full border-[20px] border-[#B08D57]/10" />
              <div className="relative flex items-center justify-between">
                <p className="text-xs uppercase tracking-[0.18em] text-[#D8C6A5]">
                  Saldo Bersih
                </p>
                <span className="text-xl text-[#B08D57]">✦</span>
              </div>
              <p className="relative mt-7 break-words font-serif text-3xl font-bold sm:text-4xl">
                {loading && !data
                  ? "Memuat..."
                  : rupiah(data?.balance ?? 0)}
              </p>
              <div className="relative mt-6 border-t border-[#B08D57]/40 pt-4">
                <p className="text-[10px] uppercase tracking-[0.12em] text-[#D8C6A5]">
                  Pemasukan dikurangi pengeluaran
                </p>
              </div>
            </article>

            <article className="rounded-xl border border-[#D8C6A5] bg-[#FAF4E8] p-6 shadow-sm">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.14em] text-[#75664F]">
                    Total Pemasukan
                  </p>
                  <p className="mt-2 text-xs text-[#9A896C]">Dana masuk</p>
                </div>
                <span className="flex h-10 w-10 items-center justify-center rounded-lg border border-[#C9D3BD] bg-[#E7ECDD] text-xl text-[#365B3E]">
                  ↗
                </span>
              </div>
              <p className="mt-6 break-words font-serif text-2xl font-bold text-[#24382D] sm:text-3xl">
                {loading && !data
                  ? "Memuat..."
                  : rupiah(data?.totalIncome ?? 0)}
              </p>
              <div className="mt-5 border-t border-[#E5D7BF] pt-3">
                <p className="text-xs text-[#8A7759]">
                  Dari seluruh transaksi masuk
                </p>
              </div>
            </article>

            <article className="rounded-xl border border-[#D8C6A5] bg-[#FAF4E8] p-6 shadow-sm">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.14em] text-[#75664F]">
                    Total Pengeluaran
                  </p>
                  <p className="mt-2 text-xs text-[#9A896C]">Dana keluar</p>
                </div>
                <span className="flex h-10 w-10 items-center justify-center rounded-lg border border-[#E0C7B5] bg-[#F4E5D9] text-xl text-[#8A4935]">
                  ↙
                </span>
              </div>
              <p className="mt-6 break-words font-serif text-2xl font-bold text-[#5B3828] sm:text-3xl">
                {loading && !data
                  ? "Memuat..."
                  : rupiah(data?.totalExpense ?? 0)}
              </p>
              <div className="mt-5 border-t border-[#E5D7BF] pt-3">
                <p className="text-xs text-[#8A7759]">
                  Dari seluruh transaksi keluar
                </p>
              </div>
            </article>
          </section>

          {/* TABEL TRANSAKSI */}
          <section
            id="transaksi"
            className="mt-8 overflow-hidden rounded-xl border border-[#D8C6A5] bg-[#FAF4E8] shadow-sm"
          >
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#D8C6A5] bg-[#F5EBD9] p-6">
              <div>
                <div className="mb-2 flex items-center gap-2">
                  <span className="h-px w-5 bg-[#B08D57]" />
                  <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-[#8A7759]">
                    Financial Records
                  </p>
                </div>
                <h3 className="font-serif text-xl font-bold text-[#24382D]">
                  Transaksi Terbaru
                </h3>
                <p className="mt-1 text-sm text-[#75664F]">
                  Catatan lima transaksi terakhir.
                </p>
              </div>
              <span className="border border-[#D8C6A5] bg-[#FAF4E8] px-3 py-2 text-xs font-semibold text-[#75664F]">
                {data?.latestTransactions.length ?? 0} catatan
              </span>
            </div>

            {loading && !data ? (
              <div className="p-10 text-center text-sm text-[#75664F]">
                <p className="mb-2 text-2xl">⌛</p>
                Membuka buku keuangan...
              </div>
            ) : data?.latestTransactions.length ? (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[620px] text-left">
                  <thead className="bg-[#E8D9BD] text-[10px] uppercase tracking-[0.14em] text-[#5B3828]">
                    <tr>
                      <th className="px-6 py-4 font-bold">Keterangan</th>
                      <th className="px-6 py-4 font-bold">Kategori</th>
                      <th className="px-6 py-4 font-bold">Tanggal</th>
                      <th className="px-6 py-4 text-right font-bold">
                        Nominal
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E5D7BF]">
                    {data.latestTransactions.map((transaction) => (
                      <tr
                        key={transaction.id}
                        className="transition-colors hover:bg-[#F1E6D0]"
                      >
                        <td className="px-6 py-4">
                          <p className="font-semibold text-[#292722]">
                            {transaction.description}
                          </p>
                          <p className="mt-1 text-[10px] uppercase tracking-[0.12em] text-[#9A896C]">
                            Ledger No. {transaction.id}
                          </p>
                        </td>
                        <td className="px-6 py-4 text-sm text-[#75664F]">
                          {transaction.category.name}
                        </td>
                        <td className="px-6 py-4 text-sm text-[#75664F]">
                          {tanggal(transaction.transactionDate)}
                        </td>
                        <td
                          className={`whitespace-nowrap px-6 py-4 text-right font-semibold ${
                            transaction.type === "INCOME"
                              ? "text-[#365B3E]"
                              : "text-[#8A4935]"
                          }`}
                        >
                          {transaction.type === "INCOME" ? "+" : "−"}
                          {rupiah(transaction.amount)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-12 text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-[#D8C6A5] bg-[#F1E6D0] font-serif text-2xl text-[#8A7759]">
                  D
                </div>
                <h4 className="mt-4 font-serif text-lg font-bold text-[#24382D]">
                  Belum Ada Transaksi
                </h4>
                <p className="mt-2 text-sm text-[#75664F]">
                  Catatan keuanganmu akan tercatat di sini.
                </p>
              </div>
            )}
          </section>

          {/* FOOTER */}
          <footer className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-[#D8C6A5] pt-5 text-[10px] uppercase tracking-[0.12em] text-[#8A7759]">
            <p>Dompetin · The Birmingham Ledger</p>
            <p>Discipline. Records. Prosperity.</p>
          </footer>
        </section>
      </div>
    </main>
  );
}
