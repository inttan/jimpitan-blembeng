"use client";

import { useState, useMemo } from "react";

const events = [
  { date: 1, recurring: "weekly", dayOfWeek: 1, title: "Setoran Jimpitan", time: "08:00 - 11:00", type: "jimpitan", desc: "Penarikan jimpitan mingguan door-to-door" },
  { date: 8, recurring: "weekly", dayOfWeek: 1, title: "Setoran Jimpitan", time: "08:00 - 11:00", type: "jimpitan", desc: "Penarikan jimpitan mingguan door-to-door" },
  { date: 15, recurring: "weekly", dayOfWeek: 1, title: "Setoran Jimpitan", time: "08:00 - 11:00", type: "jimpitan", desc: "Penarikan jimpitan mingguan door-to-door" },
  { date: 22, recurring: "weekly", dayOfWeek: 1, title: "Setoran Jimpitan", time: "08:00 - 11:00", type: "jimpitan", desc: "Penarikan jimpitan mingguan door-to-door" },
  { date: 29, recurring: "weekly", dayOfWeek: 1, title: "Setoran Jimpitan", time: "08:00 - 11:00", type: "jimpitan", desc: "Penarikan jimpitan mingguan door-to-door" },
  { date: 10, recurring: "bimonthly", title: "Rapat Bulanan", time: "19:30 - 21:00", type: "rapat", desc: "Rapat evaluasi dan perencanaan kegiatan dusun" },
  { date: 25, recurring: "bimonthly", title: "Rapat Bulanan", time: "19:30 - 21:00", type: "rapat", desc: "Rapat evaluasi dan perencanaan kegiatan dusun" },
  { date: 5, recurring: "quarterly", month: [3, 6, 9, 12], title: "Setor Kas ke Desa", time: "09:00 - 12:00", type: "kas", desc: "Penyerahan laporan dan saldo kas kegiatan ke Pemerintah Desa" },
  { date: 1, title: "Upacara Bendera", time: "07:00 - 09:00", type: "agustusan", desc: "Upacara bendera memperingati Hari Ulang Tahun Kemerdekaan RI" },
  { date: 17, title: "Upacara 17 Agustus", time: "07:00 - 10:00", type: "agustusan", desc: "Upacara bendera HUT RI di lapangan desa" },
  { date: 20, title: "Kerja Bakti Bulanan", time: "07:00 - 10:00", type: "kerja_bakti", desc: "Gotong royong membersihkan lingkungan dusun" },
];

const typeColors: Record<string, { bg: string; border: string; text: string }> = {
  jimpitan: { bg: "var(--p6)", border: "var(--green)", text: "var(--green)" },
  rapat: { bg: "var(--acc2)", border: "var(--brass)", text: "var(--brass)" },
  kas: { bg: "rgba(196,98,45,0.1)", border: "var(--terracotta)", text: "var(--terracotta)" },
  agustusan: { bg: "rgba(161,61,61,0.1)", border: "var(--red)", text: "var(--red)" },
  kerja_bakti: { bg: "var(--surf)", border: "var(--ink)", text: "var(--ink)" },
};

const monthNames = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];
const dayNames = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];

export default function KalenderPage() {
  const today = new Date();
  const [selectedMonth, setSelectedMonth] = useState(today.getMonth());
  const [selectedYear, setSelectedYear] = useState(today.getFullYear());
  const [selectedDate, setSelectedDate] = useState<number | null>(null);

  const getEventsForDate = (date: number) => {
    return events.filter((event) => {
      if (event.recurring === "weekly") return event.date === date;
      if (event.recurring === "bimonthly" || event.recurring === "quarterly") {
        if (event.recurring === "quarterly" && event.month) return event.date === date && event.month.includes(selectedMonth + 1);
        return event.date === date;
      }
      if (event.month) return event.date === date && event.month.includes(selectedMonth + 1);
      return event.date === date;
    });
  };

  const calendarData = useMemo(() => {
    const firstDay = new Date(selectedYear, selectedMonth, 1).getDay();
    const daysInMonth = new Date(selectedYear, selectedMonth + 1, 0).getDate();
    const calendar: (number | null)[] = [];
    for (let i = 0; i < firstDay; i++) calendar.push(null);
    for (let i = 1; i <= daysInMonth; i++) calendar.push(i);
    return calendar;
  }, [selectedMonth, selectedYear]);

  const selectedDateEvents = selectedDate ? getEventsForDate(selectedDate) : [];

  const goToPrevMonth = () => {
    if (selectedMonth === 0) { setSelectedMonth(11); setSelectedYear(selectedYear - 1); }
    else setSelectedMonth(selectedMonth - 1);
    setSelectedDate(null);
  };

  const goToNextMonth = () => {
    if (selectedMonth === 11) { setSelectedMonth(0); setSelectedYear(selectedYear + 1); }
    else setSelectedMonth(selectedMonth + 1);
    setSelectedDate(null);
  };

  const goToToday = () => {
    setSelectedMonth(today.getMonth());
    setSelectedYear(today.getFullYear());
    setSelectedDate(today.getDate());
  };

  const isToday = (date: number) => date === today.getDate() && selectedMonth === today.getMonth() && selectedYear === today.getFullYear();

  return (
    <div>
      {/* Hero */}
      <section className="py-16 md:py-24" style={{ background: "linear-gradient(180deg, var(--surf) 0%, var(--bg) 100%)" }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4" style={{ color: "var(--ink)", fontFamily: "var(--font-fraunces)" }}>
            Kalender <span style={{ color: "var(--green)" }}>Kegiatan</span>
          </h1>
          <p className="text-lg max-w-2xl mx-auto" style={{ color: "var(--text2)" }}>
            Jadwal lengkap kegiatan Dusun Blembeng sepanjang tahun
          </p>
        </div>
      </section>

      {/* Calendar Section */}
      <section className="pb-16 md:pb-24">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Calendar */}
            <div className="lg:col-span-2">
              <div className="p-6 rounded-2xl" style={{ background: "var(--surf)", border: "1px solid var(--bdr)", boxShadow: "var(--shd-card)" }}>
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                  <button onClick={goToPrevMonth} className="w-10 h-10 rounded-lg flex items-center justify-center transition-colors" style={{ background: "var(--surf2)", color: "var(--ink)" }}>
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6" /></svg>
                  </button>
                  <div className="text-center">
                    <h2 className="text-xl font-bold" style={{ color: "var(--ink)", fontFamily: "var(--font-fraunces)" }}>{monthNames[selectedMonth]} {selectedYear}</h2>
                    <button onClick={goToToday} className="text-sm mt-1 px-3 py-1 rounded-lg transition-colors" style={{ color: "var(--green)" }}>Hari ini</button>
                  </div>
                  <button onClick={goToNextMonth} className="w-10 h-10 rounded-lg flex items-center justify-center transition-colors" style={{ background: "var(--surf2)", color: "var(--ink)" }}>
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6" /></svg>
                  </button>
                </div>

                {/* Day Names */}
                <div className="grid grid-cols-7 gap-1 mb-2">
                  {dayNames.map((day) => <div key={day} className="text-center text-sm font-medium py-2" style={{ color: "var(--text3)" }}>{day}</div>)}
                </div>

                {/* Calendar Grid */}
                <div className="grid grid-cols-7 gap-1">
                  {calendarData.map((date, index) => {
                    if (date === null) return <div key={index} className="aspect-square" />;
                    const dayEvents = getEventsForDate(date);
                    const hasEvents = dayEvents.length > 0;
                    const isSelected = selectedDate === date;
                    const todayStyle = isToday(date);
                    return (
                      <button key={index} onClick={() => setSelectedDate(date)}
                        className={`aspect-square p-1 rounded-lg transition-all duration-200 relative ${isSelected ? "ring-2 ring-offset-2 ring-[var(--green)]" : ""}`}
                        style={{ background: isSelected ? "var(--green)" : todayStyle ? "var(--p6)" : "transparent", color: isSelected ? "var(--paper)" : "var(--ink)" }}>
                        <span className="text-sm font-medium">{date}</span>
                        {hasEvents && !isSelected && (
                          <div className="absolute bottom-1 left-1/2 -translate-x-1/2 flex gap-0.5">
                            {dayEvents.slice(0, 3).map((event, i) => (
                              <div key={i} className="w-1.5 h-1.5 rounded-full" style={{ background: typeColors[event.type]?.border || "var(--text3)" }} />
                            ))}
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Legend */}
                <div className="mt-6 pt-4 border-t" style={{ borderColor: "var(--bdr)" }}>
                  <div className="flex flex-wrap gap-4">
                    {Object.entries(typeColors).map(([type, colors]) => (
                      <div key={type} className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ background: colors.border }} />
                        <span className="text-xs" style={{ color: "var(--text2)" }}>{type}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Event Details */}
            <div className="lg:col-span-1">
              <div className="sticky top-24 p-6 rounded-2xl" style={{ background: "var(--surf)", border: "1px solid var(--bdr)", boxShadow: "var(--shd-card)" }}>
                <h3 className="text-lg font-bold mb-4" style={{ color: "var(--ink)", fontFamily: "var(--font-fraunces)" }}>
                  {selectedDate ? `Kegiatan ${selectedDate} ${monthNames[selectedMonth]}` : "Pilih Tanggal"}
                </h3>
                {selectedDate ? (
                  selectedDateEvents.length > 0 ? (
                    <div className="space-y-4">
                      {selectedDateEvents.map((event, index) => (
                        <div key={index} className="p-4 rounded-xl" style={{ background: typeColors[event.type]?.bg || "var(--surf)", borderLeft: `4px solid ${typeColors[event.type]?.border || "var(--text3)"}` }}>
                          <h4 className="font-semibold mb-1" style={{ color: typeColors[event.type]?.text || "var(--ink)" }}>{event.title}</h4>
                          <div className="flex items-center gap-2 mb-2">
                            <svg className="w-4 h-4" style={{ color: "var(--text3)" }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
                            <span className="text-sm" style={{ color: "var(--text2)" }}>{event.time}</span>
                          </div>
                          <p className="text-sm" style={{ color: "var(--text2)" }}>{event.desc}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: "var(--surf2)" }}>
                        <svg className="w-8 h-8" style={{ color: "var(--text3)" }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>
                      </div>
                      <p className="text-sm" style={{ color: "var(--text2)" }}>Tidak ada kegiatan pada tanggal ini</p>
                    </div>
                  )
                ) : (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: "var(--surf2)" }}>
                      <svg className="w-8 h-8" style={{ color: "var(--text3)" }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5" /></svg>
                    </div>
                    <p className="text-sm" style={{ color: "var(--text2)" }}>Klik tanggal pada kalender untuk melihat detail kegiatan</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
