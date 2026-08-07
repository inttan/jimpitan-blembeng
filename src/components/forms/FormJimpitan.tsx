"use client";

import { useState, useTransition } from "react";
import { simpanJimpitan } from "@/app/actions/transaksi";
import { generateWAJimpitanLink, kirimNotifWA } from "@/lib/whatsapp";
import { formatRupiah } from "@/lib/utils";
import {
  getMingguKe,
  NOMINAL_STANDAR,
  formatPeriodeMinggu,
  type StatusJimpitan,
} from "@/lib/jimpitan";

type WargaItem = { id: string; nama: string; no_hp?: string | null; no_rumah?: string | null };
type ExistingTx = { warga_id: string; minggu_ke: string; status: string };

export default function FormJimpitan({
  wargaList = [],
  existingTxs = [],
}: {
  wargaList?: WargaItem[];
  existingTxs?: ExistingTx[];
}) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [successResult, setSuccessResult] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [wargaId, setWargaId] = useState("");
  const [mingguKe, setMingguKe] = useState(getMingguKe());
  const [jumlah, setJumlah] = useState(String(NOMINAL_STANDAR));
  const [status, setStatus] = useState<StatusJimpitan>("lunas");
  const [jumlahMinggu, setJumlahMinggu] = useState(1);
  const [keterangan, setKeterangan] = useState("");

  const jumlahNum = status === "nihil" ? 0 : parseFloat(jumlah) || 0;

  // FIX: sebelumnya ada guard `!existingTxs?.length` yang bikin fungsi ini
  // langsung return [] kalau belum ada riwayat transaksi sama sekali
  // (misal setelah TRUNCATE / warga baru). Itu bikin mingguInfo SELALU
  // kosong di kondisi database bersih, sehingga handleSubmit loop 0x
  // tapi tetap menampilkan "berhasil". Guard itu dihapus — existingTxs
  // kosong itu valid, artinya semua minggu memang belum pernah disetor.
  const getMingguInfo = (minggu: string, count: number) => {
    if (!minggu) return [];

    const infos: { minggu: string; status: string; sudahLunas: boolean }[] = [];
    const startDate = new Date(minggu + "T00:00:00");

    if (isNaN(startDate.getTime())) return [];

    for (let i = 0; i < count; i++) {
      const d = new Date(startDate);
      d.setDate(d.getDate() + i * 7);
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, "0");
      const day = String(d.getDate()).padStart(2, "0");
      const mgg = `${y}-${m}-${day}`;
      const existing = (existingTxs ?? []).find(
        (tx) => tx.warga_id === wargaId && tx.minggu_ke === mgg
      );
      infos.push({
        minggu: mgg,
        status: existing?.status || "belum",
        sudahLunas: existing?.status === "lunas",
      });
    }
    return infos;
  };

  const mingguInfo = wargaId ? getMingguInfo(mingguKe, jumlahMinggu) : [];
  const totalNominal = jumlahNum * jumlahMinggu;
  const adaYangSudahLunas = mingguInfo.some((m) => m.sudahLunas);

  function handleSubmit() {
    setError(null);

    if (!wargaId) {
      setError("Pilih warga terlebih dahulu.");
      return;
    }
    if (isPending) return;

    const mingguToProcess = mingguInfo.filter((m) => !m.sudahLunas);

    // FIX: safety net kedua. Kalau karena alasan apapun tidak ada minggu
    // yang perlu diproses, tampilkan error, JANGAN lanjut ke setSuccessResult.
    if (mingguToProcess.length === 0) {
      setError(
        "Tidak ada minggu yang diproses — mungkin semua minggu terpilih sudah lunas, atau tanggal setor belum valid."
      );
      return;
    }

    startTransition(async () => {
      let sudahTersimpan = 0;
      let lastSuccessData: any = null;

      for (const info of mingguToProcess) {
        try {
          const result = await simpanJimpitan({
            warga_id: wargaId,
            minggu_ke: info.minggu,
            jumlah_setor: jumlahNum,
            status: status,
          });

          if (!result.success) {
            setError(`Gagal menyimpan untuk ${formatPeriodeMinggu(info.minggu)}: ${result.error}`);
            return; // STOP — jangan lanjut ke setSuccessResult kalau ada yang gagal
          }
          sudahTersimpan++;
          lastSuccessData = result.data;
        } catch (err) {
          setError(
            `Terjadi kesalahan saat menyimpan ${formatPeriodeMinggu(info.minggu)}: ${
              err instanceof Error ? err.message : String(err)
            }`
          );
          return; // STOP
        }
      }

      // FIX: safety net ketiga — cuma tampilkan sukses kalau BENERAN ada
      // yang tersimpan ke database.
      if (sudahTersimpan === 0) {
        setError("Tidak ada transaksi yang berhasil disimpan. Coba lagi.");
        return;
      }

      setSuccessResult({
        warga: wargaList.find((w) => w.id === wargaId),
        jumlah_setor: totalNominal,
        status,
        jumlah_minggu: jumlahMinggu,
        potongan_kas: lastSuccessData?.potongan_kas,
        dana_kegiatan: lastSuccessData?.dana_kegiatan,
        minggu_ke: lastSuccessData?.minggu_ke,
      });
      setWargaId("");
      setJumlah(String(NOMINAL_STANDAR));
      setStatus("lunas");
      setJumlahMinggu(1);
      setKeterangan("");
    });
  }

  function handleKirimWA() {
    if (!successResult?.warga?.no_hp) return;
    const url = generateWAJimpitanLink({
      namaWarga: successResult.warga.nama,
      noHp: successResult.warga.no_hp,
      mingguKe: successResult.minggu_ke,
      jumlahSetor: successResult.jumlah_setor,
      status: successResult.status,
      potonganKas: successResult.potongan_kas,
      danaKegiatan: successResult.dana_kegiatan,
    });
    kirimNotifWA(url);
  }

  return (
    <>
      <button
        onClick={() => { setIsModalOpen(true); setError(null); }}
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "6px",
          padding: "9px 15px",
          borderRadius: "8px",
          border: "1px solid var(--line)",
          background: "#fff",
          fontSize: "13px",
          fontWeight: 600,
          color: "var(--ink)",
          cursor: "pointer",
          fontFamily: "'Public Sans', sans-serif",
          transition: "all 0.15s",
        }}
        onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "var(--brass)"; (e.currentTarget as HTMLElement).style.color = "#fff"; (e.currentTarget as HTMLElement).style.borderColor = "var(--brass)"; }}
        onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "#fff"; (e.currentTarget as HTMLElement).style.color = "var(--ink)"; (e.currentTarget as HTMLElement).style.borderColor = "var(--line)"; }}
      >
        + Catat Setoran
      </button>

      {/* Modal */}
      {(isModalOpen || successResult !== null || error !== null || isPending) && (
        <div style={{
          position: "fixed",
          inset: 0,
          zIndex: 200,
          background: "rgba(38,36,30,0.45)",
          backdropFilter: "blur(4px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "16px",
        }}
        onClick={(e) => e.target === e.currentTarget && !isPending && setIsModalOpen(false)}
        >
          <div style={{
            width: "100%",
            maxWidth: "420px",
            background: "var(--paper-raised)",
            borderRadius: "14px",
            padding: "28px",
            boxShadow: "0 8px 32px rgba(38,36,30,0.15)",
          }}>
            {successResult && !error ? (
              /* Success */
              <div>
                <div style={{ textAlign: "center", marginBottom: "16px" }}>
                  <div style={{
                    width: "52px", height: "52px", borderRadius: "50%",
                    background: "rgba(31,61,43,0.1)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    margin: "0 auto 10px",
                    fontSize: "24px",
                  }}>✅</div>
                  <h3 style={{
                    fontFamily: "'Fraunces', serif",
                    fontWeight: 600,
                    color: "var(--green)",
                    margin: "0 0 4px",
                    fontSize: "17px",
                  }}>Setoran berhasil dicatat!</h3>
                  <p style={{ fontSize: "13px", color: "var(--ink-soft)", margin: 0 }}>
                    {successResult.warga.nama}
                  </p>
                </div>

                <div style={{
                  background: "var(--surf2)",
                  borderRadius: "10px",
                  padding: "14px",
                  marginBottom: "16px",
                  fontSize: "13px",
                }}>
                  {successResult.jumlah_minggu > 1 ? (
                    <>
                      <div style={{ marginBottom: "8px", fontWeight: 600, color: "var(--green)" }}>
                        {successResult.jumlah_minggu} minggu sekaligus!
                      </div>
                    </>
                  ) : (
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                      <span style={{ color: "var(--ink-soft)" }}>Periode</span>
                      <span style={{ fontWeight: 600 }}>{formatPeriodeMinggu(mingguKe)}</span>
                    </div>
                  )}
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                    <span style={{ color: "var(--ink-soft)" }}>Status</span>
                    <span style={{
                      fontFamily: "'Fraunces', serif",
                      fontWeight: 700,
                      fontSize: "11px",
                      padding: "3px 10px",
                      borderRadius: "20px",
                      border: "1.5px solid",
                      transform: "rotate(-2deg)",
                      color: "var(--green)",
                      borderColor: "var(--green)",
                      background: "rgba(31,61,43,0.06)",
                    }}>LUNAS</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                    <span style={{ color: "var(--ink-soft)" }}>Total Bayar</span>
                    <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontWeight: 600 }}>
                      {formatRupiah(successResult.jumlah_setor)}
                    </span>
                  </div>
                  <div style={{
                    display: "flex", justifyContent: "space-between",
                    color: "var(--ink-soft)",
                    fontSize: "11px",
                    marginTop: "4px",
                  }}>
                    <span>Langsung masuk kas kegiatan</span>
                  </div>
                </div>

                {successResult.warga.no_hp ? (
                  <button
                    onClick={handleKirimWA}
                    style={{
                      width: "100%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "8px",
                      padding: "12px",
                      borderRadius: "8px",
                      border: "none",
                      background: "linear-gradient(135deg, #2ECC71 0%, #25A55D 100%)",
                      color: "#fff",
                      fontWeight: 600,
                      fontSize: "14px",
                      cursor: "pointer",
                      fontFamily: "'Public Sans', sans-serif",
                      marginBottom: "10px",
                    }}
                  >
                    📱 Kirim Bukti ke WhatsApp
                  </button>
                ) : (
                  <p style={{ fontSize: "12px", color: "var(--brass)", textAlign: "center", marginBottom: "10px" }}>
                    ⚠️ Nomor WA warga belum terdaftar.
                  </p>
                )}

                <button
                  onClick={() => {
                    setIsModalOpen(false);
                    setSuccessResult(null);
                    setWargaId("");
                    setJumlah(String(NOMINAL_STANDAR));
                    setStatus("lunas");
                    setJumlahMinggu(1);
                  }}
                  style={{
                    width: "100%",
                    padding: "10px",
                    borderRadius: "8px",
                    border: "1px solid var(--line)",
                    background: "#fff",
                    cursor: "pointer",
                    fontWeight: 600,
                    fontSize: "13px",
                    fontFamily: "'Public Sans', sans-serif",
                    color: "var(--ink)",
                  }}
                >
                  Tutup
                </button>
              </div>
            ) : (
              /* Form */
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                  <h2 style={{
                    fontFamily: "'Fraunces', serif",
                    fontSize: "17px",
                    fontWeight: 600,
                    color: "var(--green)",
                    margin: 0,
                  }}>Catat Setoran Jimpitan</h2>
                  <button
                    onClick={() => { setIsModalOpen(false); setError(null); }}
                    disabled={isPending}
                    style={{
                      background: "none", border: "none", cursor: "pointer",
                      fontSize: "20px", color: "var(--ink-soft)",
                    }}
                  >✕</button>
                </div>

                {error && (
                  <div style={{
                    background: "rgba(161,61,61,0.08)",
                    color: "var(--red)",
                    padding: "10px 14px",
                    borderRadius: "8px",
                    fontSize: "13px",
                    marginBottom: "14px",
                    border: "1px solid rgba(161,61,61,0.2)",
                  }}>{error}</div>
                )}

                <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                  <div>
                    <label style={{
                      fontSize: "12.5px", fontWeight: 600,
                      color: "var(--ink-soft)", display: "block", marginBottom: "6px",
                    }}>Warga / KK *</label>
                    <select
                      value={wargaId}
                      onChange={(e) => setWargaId(e.target.value)}
                      style={{
                        width: "100%", padding: "10px 12px", borderRadius: "8px",
                        border: "1px solid var(--line)", fontSize: "13.5px",
                        fontFamily: "'Public Sans', sans-serif", background: "#fff",
                      }}
                    >
                      <option value="">-- Pilih Warga --</option>
                      {wargaList.map((w) => (
                        <option key={w.id} value={w.id}>
                          {w.nama}{w.no_rumah ? ` · ${w.no_rumah}` : ""}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Info multiple minggu */}
                  {wargaId && (
                    <div style={{
                      background: "rgba(31,61,43,0.04)",
                      border: "1px solid rgba(31,61,43,0.1)",
                      borderRadius: "8px",
                      padding: "10px 14px",
                      fontSize: "12px",
                    }}>
                      <div style={{ marginBottom: "8px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                        <span style={{ fontWeight: 600, color: "var(--ink)" }}>Bayar berapa minggu?</span>
                        <div style={{ display: "flex", gap: "6px" }}>
                          {[1, 2, 3].map((n) => (
                            <button
                              key={n}
                              onClick={() => setJumlahMinggu(n)}
                              style={{
                                padding: "4px 12px",
                                borderRadius: "6px",
                                border: `1.5px solid ${jumlahMinggu === n ? "var(--green)" : "var(--line)"}`,
                                background: jumlahMinggu === n ? "rgba(31,61,43,0.08)" : "#fff",
                                color: jumlahMinggu === n ? "var(--green)" : "var(--ink)",
                                fontWeight: 600,
                                fontSize: "12px",
                                cursor: "pointer",
                              }}
                            >{n}x</button>
                          ))}
                        </div>
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                        {mingguInfo.map((info, i) => (
                          <div key={info.minggu} style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            color: "var(--ink)",
                            fontSize: "11px",
                          }}>
                            <span>
                              <strong>Minggu {i + 1}:</strong> {formatPeriodeMinggu(info.minggu)}
                            </span>
                            <span style={{
                              padding: "2px 8px",
                              borderRadius: "4px",
                              fontSize: "10px",
                              fontWeight: 600,
                              background: info.sudahLunas ? "rgba(31,61,43,0.08)" : "rgba(184,134,59,0.1)",
                              color: info.sudahLunas ? "var(--green)" : "var(--brass)",
                            }}>
                              {info.sudahLunas ? "✓ Sudah lunas" : "→ Akan lunas"}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div>
                    <label style={{
                      fontSize: "12.5px", fontWeight: 600,
                      color: "var(--ink-soft)", display: "block", marginBottom: "6px",
                    }}>Catatan (opsional)</label>
                    <input
                      type="text"
                      value={keterangan}
                      onChange={(e) => setKeterangan(e.target.value)}
                      placeholder="Contoh: Bayar 3 minggu sekaligus"
                      style={{
                        width: "100%", padding: "10px 12px", borderRadius: "8px",
                        border: "1px solid var(--line)", fontSize: "13.5px",
                        fontFamily: "'Public Sans', sans-serif", background: "#fff",
                      }}
                    />
                  </div>

                  <div>
                    <label style={{
                      fontSize: "12.5px", fontWeight: 600,
                      color: "var(--ink-soft)", display: "block", marginBottom: "6px",
                    }}>Tanggal Setor</label>
                    <input
                      type="date"
                      value={mingguKe}
                      onChange={(e) => setMingguKe(e.target.value)}
                      style={{
                        width: "100%", padding: "10px 12px", borderRadius: "8px",
                        border: "1px solid var(--line)", fontSize: "13.5px",
                        fontFamily: "'Public Sans', sans-serif", background: "#fff",
                      }}
                    />
                  </div>

                  <div>
                    <label style={{
                      fontSize: "12.5px", fontWeight: 600,
                      color: "var(--ink-soft)", display: "block", marginBottom: "6px",
                    }}>Status *</label>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "8px" }}>
                      {(["lunas", "belum", "nihil"] as StatusJimpitan[]).map((s) => (
                        <button
                          key={s}
                          type="button"
                          onClick={() => {
                            setStatus(s);
                            if (s === "nihil") setJumlah("0");
                            else if (jumlah === "0") setJumlah(String(NOMINAL_STANDAR));
                          }}
                          style={{
                            padding: "9px",
                            borderRadius: "8px",
                            border: `1.5px solid ${status === s ? (
                              s === "lunas" ? "var(--green)" :
                              s === "belum" ? "var(--red)" : "var(--ink-soft)"
                            ) : "var(--line)"}`,
                            background: status === s ? (
                              s === "lunas" ? "rgba(31,61,43,0.08)" :
                              s === "belum" ? "rgba(161,61,61,0.08)" : "rgba(92,88,75,0.08)"
                            ) : "#fff",
                            color: status === s ? (
                              s === "lunas" ? "var(--green)" :
                              s === "belum" ? "var(--red)" : "var(--ink-soft)"
                            ) : "var(--ink)",
                            fontWeight: 600,
                            fontSize: "13px",
                            cursor: "pointer",
                            fontFamily: "'Public Sans', sans-serif",
                            textTransform: "capitalize",
                          }}
                        >
                          {s === "lunas" ? "✓ Lunas" : s === "belum" ? "✗ Belum" : "— Nihil"}
                        </button>
                      ))}
                    </div>
                  </div>

                  {status !== "nihil" && (
                    <div>
                      <label style={{
                        fontSize: "12.5px", fontWeight: 600,
                        color: "var(--ink-soft)", display: "block", marginBottom: "6px",
                      }}>Nominal Setor (Rp)</label>
                      <input
                        type="number"
                        min="0"
                        step="500"
                        value={jumlah}
                        onChange={(e) => setJumlah(e.target.value)}
                        style={{
                          width: "100%", padding: "10px 12px", borderRadius: "8px",
                          border: "1px solid var(--line)", fontSize: "13.5px",
                          fontFamily: "'IBM Plex Mono', monospace", background: "#fff",
                        }}
                      />
                      <p style={{ fontSize: "11px", color: "var(--ink-soft)", marginTop: "4px" }}>
                        Default {formatRupiah(NOMINAL_STANDAR)} — bisa diedit untuk kasus khusus
                      </p>
                    </div>
                  )}

                  {status === "lunas" && jumlahNum > 0 && (
                    <div style={{
                      background: "var(--surf2)",
                      borderRadius: "10px",
                      padding: "12px",
                      fontSize: "13px",
                    }}>
                      {jumlahMinggu > 1 && (
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "5px" }}>
                          <span>Per minggu × {jumlahMinggu}</span>
                          <span style={{ fontFamily: "'IBM Plex Mono', monospace" }}>
                            {formatRupiah(jumlahNum)} × {jumlahMinggu}
                          </span>
                        </div>
                      )}
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: jumlahMinggu > 1 ? "0" : "5px", fontWeight: 600 }}>
                        <span>Total Bayar</span>
                        <span style={{ fontFamily: "'IBM Plex Mono', monospace" }}>
                          {formatRupiah(totalNominal)}
                        </span>
                      </div>
                      <div style={{
                        display: "flex", justifyContent: "space-between",
                        color: "var(--ink-soft)",
                        fontSize: "11px",
                        marginTop: "4px",
                      }}>
                        <span>Langsung masuk kas kegiatan</span>
                      </div>
                    </div>
                  )}

                  <div style={{ display: "flex", gap: "10px", marginTop: "4px" }}>
                    <button
                      type="button"
                      onClick={() => { setIsModalOpen(false); setError(null); }}
                      disabled={isPending}
                      style={{
                        flex: 1, padding: "11px", borderRadius: "8px",
                        border: "1px solid var(--line)", background: "#fff",
                        cursor: "pointer", fontWeight: 600, fontSize: "13.5px",
                        fontFamily: "'Public Sans', sans-serif", color: "var(--ink)",
                      }}
                    >Batal</button>
                    <button
                      type="button"
                      onClick={handleSubmit}
                      disabled={isPending}
                      style={{
                        flex: 1, padding: "11px", borderRadius: "8px",
                        border: "none",
                        background: "linear-gradient(135deg, #2E5540 0%, #1F3D2B 60%)",
                        cursor: isPending ? "wait" : "pointer",
                        fontWeight: 600, fontSize: "13.5px",
                        fontFamily: "'Public Sans', sans-serif",
                        color: "#F6F3EA",
                        opacity: isPending ? 0.7 : 1,
                        boxShadow: "0 2px 6px rgba(31,61,43,0.3), inset 0 1px 0 rgba(255,255,255,0.1)",
                      }}
                    >
                      {isPending ? "Menyimpan..." : "✅ Simpan"}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}