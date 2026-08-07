import { createClient } from "@/lib/supabase/server";
import FormTambahWarga from "@/components/forms/FormTambahWarga";
import WargaActions from "@/components/forms/WargaActions";

interface PageWarga {
  id: string;
  nama: string;
  no_rumah: string | null;
  no_hp: string | null;
  status_aktif: boolean;
  created_at: string;
}

async function getWarga() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("warga")
    .select("*")
    .order("nama");
  return (data as PageWarga[]) ?? [];
}

function Avatar({ nama }: { nama: string }) {
  const initials = nama.split(" ").map(x => x[0]).slice(0, 2).join("").toUpperCase();
  return (
    <div style={{
      width: "32px", height: "32px", borderRadius: "50%",
      background: "var(--brass-soft)", color: "var(--green)",
      display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: "12px", fontWeight: 700,
      fontFamily: "'Fraunces', serif",
    }}>{initials}</div>
  );
}

export default async function WargaPage() {
  const wargaList = await getWarga();
  const aktif = wargaList.filter((w) => w.status_aktif);
  const punyaWa = wargaList.filter((w) => w.no_hp);

  const stats = [
    { label: "Total Terdaftar", value: wargaList.length, color: "var(--green)" },
    { label: "Warga Aktif", value: aktif.length, color: "#4A9E6E" },
    { label: "Punya No. WA", value: punyaWa.length, color: "#25D366" },
  ];

  const headers = ["Nama", "Rumah", "No. HP", "Status", ""];

  return (
    <div style={{ padding: "20px 16px 60px", maxHeight: "100vh", overflowY: "auto" }} className="md:p-7 md:pb-20">
      {/* Topbar */}
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-end",
        marginBottom: "20px",
        flexWrap: "wrap",
        gap: "12px",
      }}>
        <div>
          <h1 style={{
            fontFamily: "'Fraunces', serif",
            fontSize: "20px",
            fontWeight: 600,
            color: "var(--green)",
            margin: 0,
            lineHeight: 1.1,
          }} className="md:text-2xl">Data Warga</h1>
          <div style={{ fontSize: "11.5px", color: "var(--ink-soft)", marginTop: "3px" }} className="md:text-sm">
            {aktif.length} kepala keluarga terdaftar
          </div>
        </div>
      </div>

      {/* KPI */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "1fr",
        gap: "12px",
        marginBottom: "16px",
      }} className="md:grid-cols-3 md:gap-4 md:mb-5">
        {stats.map(({ label, value, color }) => (
          <div key={label} style={{
            background: "var(--paper-raised)",
            border: "1px solid var(--line)",
            borderRadius: "12px",
            padding: "14px 16px",
            boxShadow: "var(--shd)",
            position: "relative",
            overflow: "hidden",
          }} className="md:p-5">
            <div style={{
              position: "absolute", left: 0, top: 0, bottom: 0,
              width: "4px", background: color, borderRadius: "12px 0 0 12px",
            }} />
            <div style={{
              fontSize: "11px", textTransform: "uppercase",
              letterSpacing: "0.06em", color: "var(--ink-soft)",
              fontWeight: 600, marginBottom: "6px",
            }} className="md:text-sm md:mb-2">{label}</div>
            <div style={{
              fontSize: "22px", fontWeight: 600, color: "var(--ink)",
              fontFamily: "'IBM Plex Mono', monospace",
              fontVariantNumeric: "tabular-nums",
            }} className="md:text-2xl">{value}</div>
          </div>
        ))}
      </div>

      {/* Table */}
      <div style={{
        background: "var(--paper-raised)",
        border: "1px solid var(--line)",
        borderRadius: "12px",
        boxShadow: "var(--shd)",
        overflow: "hidden",
      }}>
        <div style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "14px 16px",
          borderBottom: "1px solid var(--line)",
          flexWrap: "wrap",
          gap: "10px",
        }} className="md:px-5">
          <h2 style={{
            fontFamily: "'Fraunces', serif",
            fontSize: "14px",
            fontWeight: 600,
            color: "var(--green)",
            margin: 0,
          }} className="md:text-base">Daftar Warga</h2>
          <FormTambahWarga />
        </div>

        {wargaList.length === 0 ? (
          <div style={{
            padding: "30px",
            textAlign: "center",
            color: "var(--ink-soft)",
            fontSize: "12px",
          }} className="md:text-sm md:py-10">
            Belum ada data warga. Tambahkan warga di sini.
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "12.5px" }}>
              <thead>
                <tr style={{ borderBottom: "2px solid var(--line)" }}>
                  {headers.map((h) => (
                    <th key={h} style={{
                      textAlign: "left",
                      padding: "8px 12px",
                      fontSize: "10px",
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                      color: "var(--ink-soft)",
                      fontWeight: 600,
                    }} className="md:text-xs md:px-5">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {wargaList.map((w, i) => (
                  <tr
                    key={w.id}
                    style={{
                      borderBottom: i < wargaList.length - 1 ? "1px solid var(--line)" : "none",
                    }}
                  >
                    <td style={{ padding: "10px 12px" }} className="md:px-5">
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <Avatar nama={w.nama} />
                        <span style={{ fontWeight: 600, color: "var(--ink)", fontSize: "13px" }}>{w.nama}</span>
                      </div>
                    </td>
                    <td style={{ padding: "10px 12px", color: "var(--ink-soft)", fontSize: "12px" }} className="md:px-5">
                      {w.no_rumah ?? "—"}
                    </td>
                    <td style={{
                      padding: "10px 12px",
                      color: "var(--ink-soft)",
                      fontFamily: "'IBM Plex Mono', monospace",
                      fontSize: "12px",
                    }} className="md:px-5">
                      {w.no_hp ?? "—"}
                    </td>
                    <td style={{ padding: "10px 12px" }} className="md:px-5">
                      <span style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "4px",
                        fontSize: "11px",
                        fontWeight: 600,
                        padding: "3px 8px",
                        borderRadius: "20px",
                        ...(w.status_aktif ? {
                          color: "var(--green)",
                          background: "rgba(31,61,43,0.08)",
                        } : {
                          color: "var(--ink-soft)",
                          background: "rgba(92,88,75,0.08)",
                        }),
                      }}>
                        <span style={{
                          width: "5px", height: "5px", borderRadius: "50%",
                          background: w.status_aktif ? "var(--green-soft)" : "var(--ink-soft)",
                        }} />
                        {w.status_aktif ? "Aktif" : "Nonaktif"}
                      </span>
                    </td>
                    <td style={{ padding: "10px 12px" }} className="md:px-5">
                      <WargaActions
                        warga={{
                          id: w.id,
                          nama: w.nama,
                          no_hp: w.no_hp,
                          no_rumah: w.no_rumah,
                          status_aktif: w.status_aktif,
                        }}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
