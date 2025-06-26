import React, { useState, useEffect } from "react";

const endpoint =
  "https://script.google.com/macros/s/AKfycbwjQ5l9ovx35Gef01HqGNZE_XEPyw3FSF6cYII7yW-_1Ps2k0hVY9wUpFgUI0aKqams/exec";

interface Student {
  id: string;
  name: string;
  nisn: string;
  kelas: string;
}

type AttendanceStatus = "Hadir" | "Izin" | "Sakit" | "Alpha";
interface AttendanceRecord {
  [date: string]: {
    [studentId: string]: string;
  };
}

interface MonthlyRecap {
  nama: string;
  kelas: string;
  hadir: number;
  alpa: number;
  izin: number;
  sakit: number;
  persenHadir: number;
}

const formatDateDDMMYYYY = (isoDate: string): string => {
  const [year, month, day] = isoDate.split("-");
  return `${day}-${month}-${year}`;
};

const StudentDataTab: React.FC<{
  students: Student[];
  onRefresh: () => void;
}> = ({ students, onRefresh }) => {
  const [nisn, setNisn] = useState("");
  const [nama, setNama] = useState("");
  const [kelas, setKelas] = useState("");

  const handleSubmit = () => {
    if (!nisn || !nama || !kelas) {
      alert("⚠️ Semua field wajib diisi!");
      return;
    }

    fetch(endpoint, {
      method: "POST",
      mode: "no-cors",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: "siswa",
        nisn,
        nama,
        kelas,
      }),
    })
      .then(() => {
        alert("✅ Siswa berhasil ditambahkan!");
        setNisn("");
        setNama("");
        setKelas("");
        onRefresh();
      })
      .catch(() => alert("❌ Gagal menambahkan siswa."));
  };

  const handleEditStudent = (student: Student) => {
    const newNisn = prompt("Edit NISN:", student.nisn);
    const newName = prompt("Edit nama siswa:", student.name);
    const newClass = prompt("Edit kelas siswa:", student.kelas);

    if (newNisn && newName && newClass) {
      fetch(endpoint, {
        method: "POST",
        mode: "no-cors",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "edit",
          nisnLama: student.nisn,
          nisnBaru: newNisn,
          nama: newName,
          kelas: newClass,
        }),
      })
        .then(() => {
          alert("✅ Data siswa berhasil diperbarui");
          onRefresh();
        })
        .catch(() => alert("❌ Gagal memperbarui data"));
    }
  };

  const handleDeleteStudent = (nisn: string) => {
    if (confirm("Yakin ingin menghapus siswa ini?")) {
      fetch(endpoint, {
        method: "POST",
        mode: "no-cors",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "delete",
          nisn: nisn,
        }),
      })
        .then(() => {
          alert("🗑️ Data siswa berhasil dihapus");
          onRefresh();
        })
        .catch(() => alert("❌ Gagal menghapus siswa"));
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white p-6 rounded-lg shadow-md mb-6">
        <h2 className="text-xl font-bold mb-4 text-center text-blue-600">
          Tambah Data Siswa
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <input
            type="text"
            placeholder="NISN"
            value={nisn}
            onChange={(e) => setNisn(e.target.value)}
            className="w-full border border-gray-300 px-4 py-2 rounded-lg"
          />
          <input
            type="text"
            placeholder="Nama Siswa"
            value={nama}
            onChange={(e) => setNama(e.target.value)}
            className="w-full border border-gray-300 px-4 py-2 rounded-lg"
          />
          <input
            type="text"
            placeholder="Kelas"
            value={kelas}
            onChange={(e) => setKelas(e.target.value)}
            className="w-full border border-gray-300 px-4 py-2 rounded-lg"
          />
        </div>
        <div className="text-center">
          <button
            onClick={handleSubmit}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium"
          >
            ➕ Tambah Siswa
          </button>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-lg font-semibold text-gray-700 mb-4">
          Daftar Siswa ({students.length})
        </h3>
        {students.length === 0 ? (
          <p className="text-center text-gray-500 py-8">
            Belum ada data siswa.
          </p>
        ) : (
          <div className="space-y-3">
            {students.map((s) => (
              <div
                key={s.id}
                className="flex justify-between items-center bg-gray-50 border border-gray-200 px-4 py-3 rounded-lg"
              >
                <div>
                  <p className="font-medium text-gray-800">{s.name}</p>
                  <p className="text-sm text-gray-600">
                    NISN: {s.nisn} | Kelas: {s.kelas}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEditStudent(s)}
                    className="text-xs bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded"
                  >
                    ✏️ Edit
                  </button>
                  <button
                    onClick={() => handleDeleteStudent(s.nisn)}
                    className="text-xs bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded"
                  >
                    🗑️ Hapus
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const AttendanceTab: React.FC<{
  students: Student[];
  onRecapRefresh: () => void;
}> = ({ students, onRecapRefresh }) => {
  const [attendance, setAttendance] = useState<AttendanceRecord>({});
  const [date, setDate] = useState<string>(
    new Date().toISOString().split("T")[0]
  );
  const [selectedKelas, setSelectedKelas] = useState<string>("Semua");
  const [showDebugInfo, setShowDebugInfo] = useState<boolean>(false);

  const uniqueClasses = React.useMemo(() => {
    console.log("Processing students for classes:", students);

    const classSet = new Set<string>();

    students.forEach((student) => {
      console.log(
        "Student:",
        student.name,
        "Class:",
        student.kelas,
        "Type:",
        typeof student.kelas
      );

      let kelasValue = student.kelas;

      if (kelasValue != null) {
        kelasValue = String(kelasValue).trim();

        if (
          kelasValue !== "" &&
          kelasValue !== "undefined" &&
          kelasValue !== "null"
        ) {
          classSet.add(kelasValue);
        }
      }
    });

    const classes = Array.from(classSet).sort((a, b) => {
      const aIsNum = /^\d+$/.test(a);
      const bIsNum = /^\d+$/.test(b);

      if (aIsNum && bIsNum) {
        return parseInt(a) - parseInt(b);
      } else if (aIsNum && !bIsNum) {
        return -1;
      } else if (!aIsNum && bIsNum) {
        return 1;
      } else {
        return a.localeCompare(b);
      }
    });

    console.log("Unique classes found:", classes);
    return ["Semua", ...classes];
  }, [students]);

  const filteredStudents = React.useMemo(() => {
    if (selectedKelas === "Semua") {
      return students;
    }

    return students.filter((student) => {
      if (student.kelas == null) return false;
      const studentKelas = String(student.kelas).trim();
      const result = studentKelas === selectedKelas;
      console.log(
        `Filtering: ${student.name} (${studentKelas}) === ${selectedKelas} = ${result}`
      );
      return result;
    });
  }, [students, selectedKelas]);

  useEffect(() => {
    if (students.length && !attendance[date]) {
      const init: { [key: string]: string } = {};
      students.forEach((s) => (init[s.id] = "Hadir"));
      setAttendance((prev) => ({ ...prev, [date]: init }));
    }
  }, [date, students, attendance]);

  const setStatus = (sid: string, status: AttendanceStatus) => {
    setAttendance((prev) => ({
      ...prev,
      [date]: { ...prev[date], [sid]: status },
    }));
  };

  const handleSave = () => {
    const formattedDate = formatDateDDMMYYYY(date);
    const studentsToSave =
      selectedKelas === "Semua" ? students : filteredStudents;

    const data = studentsToSave.map((s) => ({
      tanggal: formattedDate,
      nama: s.name,
      kelas: s.kelas,
      nisn: s.nisn,
      status: attendance[date]?.[s.id] || "Hadir",
    }));

    fetch(endpoint, {
      method: "POST",
      mode: "no-cors",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    })
      .then(() => {
        const message =
          selectedKelas === "Semua"
            ? "✅ Data absensi semua kelas berhasil dikirim!"
            : `✅ Data absensi kelas ${selectedKelas} berhasil dikirim!`;
        alert(message);
      })
      .catch(() => alert("❌ Gagal kirim data absensi."));
  };

  const statusColor: Record<AttendanceStatus, string> = {
    Hadir: "bg-green-500",
    Izin: "bg-yellow-400",
    Sakit: "bg-blue-400",
    Alpha: "bg-red-500",
  };

  const getAttendanceSummary = () => {
    const summary = { Hadir: 0, Izin: 0, Sakit: 0, Alpha: 0 };
    filteredStudents.forEach((s) => {
      const status = attendance[date]?.[s.id] || "Hadir";
      summary[status as AttendanceStatus]++;
    });
    return summary;
  };

  const attendanceSummary = getAttendanceSummary();

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-center text-blue-700 mb-6">
          📋 Absensi Siswa
        </h2>

        <div className="mb-6 flex flex-col md:flex-row gap-4 items-center justify-center">
          <div className="text-center">
            <p className="text-sm text-gray-500 mb-2">Tanggal</p>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="border border-gray-300 rounded-lg px-4 py-2 shadow-sm"
            />
          </div>

          <div className="text-center">
            <p className="text-sm text-gray-500 mb-2">Filter Kelas</p>
            <select
              value={selectedKelas}
              onChange={(e) => {
                console.log("Changing class filter to:", e.target.value);
                setSelectedKelas(e.target.value);
              }}
              className="border border-gray-300 rounded-lg px-4 py-2 shadow-sm bg-white min-w-32"
            >
              {uniqueClasses.map((kelas) => (
                <option key={kelas} value={kelas}>
                  {kelas}
                </option>
              ))}
            </select>
          </div>

          <div className="text-center">
            <button
              onClick={() => setShowDebugInfo(!showDebugInfo)}
              className="text-sm bg-gray-200 hover:bg-gray-300 px-3 py-1 rounded-lg"
            >
              🔍 Debug Info
            </button>
          </div>
        </div>

        {showDebugInfo && (
          <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h4 className="font-semibold text-yellow-800 mb-2">
              Debug Information:
            </h4>
            <div className="text-sm text-yellow-700 space-y-1">
              <p>
                <strong>Total Siswa:</strong> {students.length}
              </p>
              <p>
                <strong>Kelas yang Tersedia:</strong> {uniqueClasses.join(", ")}
              </p>
              <p>
                <strong>Kelas Terpilih:</strong> {selectedKelas}
              </p>
              <p>
                <strong>Siswa Terfilter:</strong> {filteredStudents.length}
              </p>
            </div>
            <div className="mt-3">
              <p className="font-semibold text-yellow-800 mb-1">
                Detail Data Siswa per Kelas:
              </p>
              <div className="max-h-32 overflow-y-auto text-xs">
                {uniqueClasses.slice(1).map((kelas) => {
                  const siswaKelas = students.filter(
                    (s) => String(s.kelas).trim() === kelas
                  );
                  return (
                    <div key={kelas} className="mb-1">
                      <strong>Kelas {kelas}:</strong> {siswaKelas.length} siswa
                      {siswaKelas.slice(0, 3).map((s) => (
                        <div key={s.id} className="ml-4 text-gray-600">
                          • {s.name} (NISN: {s.nisn}, Kelas: {s.kelas})
                        </div>
                      ))}
                      {siswaKelas.length > 3 && (
                        <div className="ml-4 text-gray-500">
                          ... dan {siswaKelas.length - 3} lainnya
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="mt-3">
              <p className="font-semibold text-yellow-800 mb-1">
                Raw Student Data Sample:
              </p>
              <div className="max-h-24 overflow-y-auto text-xs bg-white p-2 rounded border">
                {students.slice(0, 5).map((s, idx) => (
                  <div key={idx} className="text-gray-600">
                    {idx + 1}. {s.name} | Kelas: "{s.kelas}" (type:{" "}
                    {typeof s.kelas})
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        <div className="mb-4 text-center">
          <p className="text-sm text-gray-600">
            Menampilkan: <span className="font-semibold">{selectedKelas}</span>{" "}
            • Tanggal:{" "}
            <span className="font-semibold">{formatDateDDMMYYYY(date)}</span> •
            Total Siswa:{" "}
            <span className="font-semibold">{filteredStudents.length}</span>
          </p>
        </div>

        {students.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">Belum ada data siswa.</p>
            <p className="text-sm text-gray-400 mt-2">
              Silakan tambah data siswa terlebih dahulu di tab "Data Siswa"
            </p>
          </div>
        ) : filteredStudents.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">
              Tidak ada siswa di kelas {selectedKelas}.
            </p>
            <p className="text-sm text-gray-400 mt-2">
              Pilih kelas lain atau ubah filter ke "Semua"
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-center">
                <div className="text-green-600 font-bold text-lg">
                  {attendanceSummary.Hadir}
                </div>
                <div className="text-green-700 text-sm">Hadir</div>
              </div>
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-center">
                <div className="text-yellow-600 font-bold text-lg">
                  {attendanceSummary.Izin}
                </div>
                <div className="text-yellow-700 text-sm">Izin</div>
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-center">
                <div className="text-blue-600 font-bold text-lg">
                  {attendanceSummary.Sakit}
                </div>
                <div className="text-blue-700 text-sm">Sakit</div>
              </div>
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-center">
                <div className="text-red-600 font-bold text-lg">
                  {attendanceSummary.Alpha}
                </div>
                <div className="text-red-700 text-sm">Alpha</div>
              </div>
            </div>

            <div className="space-y-4 mb-6">
              {filteredStudents.map((s) => (
                <div
                  key={s.id}
                  className="p-4 border border-gray-200 rounded-lg bg-gray-50 shadow-sm"
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-lg font-semibold text-gray-800">
                        {s.name}
                      </p>
                      <p className="text-sm text-gray-500">
                        Kelas {s.kelas} • NISN: {s.nisn}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      {(
                        [
                          "Hadir",
                          "Izin",
                          "Sakit",
                          "Alpha",
                        ] as AttendanceStatus[]
                      ).map((status) => (
                        <button
                          key={status}
                          onClick={() => setStatus(s.id, status)}
                          className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                            attendance[date]?.[s.id] === status
                              ? `${statusColor[status]} text-white`
                              : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-100"
                          }`}
                        >
                          {status}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={handleSave}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-bold shadow-md transition-colors"
            >
              💾 Simpan Absensi{" "}
              {selectedKelas !== "Semua"
                ? `Kelas ${selectedKelas}`
                : "Semua Kelas"}
            </button>
          </>
        )}
      </div>
    </div>
  );
};

const MonthlyRecapTab: React.FC<{
  onRefresh: () => void;
  uniqueClasses: string[];
}> = ({ onRefresh, uniqueClasses }) => {
  const [recapData, setRecapData] = useState<MonthlyRecap[]>([]);
  const [selectedKelas, setSelectedKelas] = useState<string>("Semua");
  const [selectedBulan, setSelectedBulan] = useState<string>("Januari");
  const [loading, setLoading] = useState<boolean>(true);

  const months = [
    "Januari",
    "Februari",
    "Maret",
    "April",
    "Mei",
    "Juni",
    "Juli",
    "Agustus",
    "September",
    "Oktober",
    "November",
    "Desember",
  ];

  useEffect(() => {
    setLoading(true);
    console.log(
      "Fetching recap data with kelas:",
      selectedKelas,
      "and bulan:",
      selectedBulan
    );
    fetch(
      `${endpoint}?action=monthlyRecap&kelas=${
        selectedKelas === "Semua" ? "" : selectedKelas
      }&bulan=${selectedBulan.toLowerCase()}`
    )
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        return res.json();
      })
      .then((data) => {
        console.log("Recap data response:", data);
        if (data.success) {
          setRecapData(data.data || []);
        } else {
          alert("❌ Gagal memuat data rekap: " + data.message);
          setRecapData([]);
        }
        setLoading(false);
      })
      .catch((error) => {
        console.error("Fetch error:", error);
        alert("❌ Gagal memuat data rekap. Cek console untuk detail.");
        setRecapData([]);
        setLoading(false);
      });
  }, [selectedKelas, selectedBulan, onRefresh]);

  const filteredRecapData = React.useMemo(() => {
    if (selectedKelas === "Semua") {
      return recapData;
    }
    console.log("Filtering recap data for kelas:", selectedKelas);
    return recapData.filter((item) => {
      const itemKelas = String(item.kelas).trim();
      const result = itemKelas === selectedKelas;
      console.log("Item kelas:", itemKelas, "match?", result);
      return result;
    });
  }, [recapData, selectedKelas]);

  const getStatusSummary = () => {
    const summary = { Hadir: 0, Izin: 0, Sakit: 0, Alpha: 0 };
    filteredRecapData.forEach((item) => {
      summary.Hadir += item.hadir || 0;
      summary.Alpha += item.alpa || 0;
      summary.Izin += item.izin || 0;
      summary.Sakit += item.sakit || 0;
    });
    return summary;
  };

  const statusSummary = getStatusSummary();

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-center text-blue-700 mb-6">
          📊 Rekap Bulanan
        </h2>

        <div className="mb-6 text-center flex flex-col md:flex-row gap-4 items-center justify-center">
          <div>
            <p className="text-sm text-gray-500 mb-2">Filter Bulan</p>
            <select
              value={selectedBulan}
              onChange={(e) => setSelectedBulan(e.target.value)}
              className="border border-gray-300 rounded-lg px-4 py-2 shadow-sm bg-white min-w-32"
            >
              {months.map((bulan) => (
                <option key={bulan} value={bulan}>
                  {bulan}
                </option>
              ))}
            </select>
          </div>
          <div>
            <p className="text-sm text-gray-500 mb-2">Filter Kelas</p>
            <select
              value={selectedKelas}
              onChange={(e) => setSelectedKelas(e.target.value)}
              className="border border-gray-300 rounded-lg px-4 py-2 shadow-sm bg-white min-w-32"
            >
              {uniqueClasses.map((kelas) => (
                <option key={kelas} value={kelas}>
                  {kelas}
                </option>
              ))}
            </select>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-8">
            <p className="text-gray-500">Memuat data...</p>
          </div>
        ) : filteredRecapData.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">
              Tidak ada data rekap untuk ditampilkan untuk bulan "
              {selectedBulan}" dan kelas "{selectedKelas}".
            </p>
            <p className="text-sm text-gray-400 mt-2">
              Periksa apakah data tersedia di sheet "{selectedBulan}".
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-center">
                <div className="text-green-600 font-bold text-lg">
                  {statusSummary.Hadir}
                </div>
                <div className="text-green-700 text-sm">Hadir</div>
              </div>
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-center">
                <div className="text-yellow-600 font-bold text-lg">
                  {statusSummary.Izin}
                </div>
                <div className="text-yellow-700 text-sm">Izin</div>
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-center">
                <div className="text-blue-600 font-bold text-lg">
                  {statusSummary.Sakit}
                </div>
                <div className="text-blue-700 text-sm">Sakit</div>
              </div>
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-center">
                <div className="text-red-600 font-bold text-lg">
                  {statusSummary.Alpha}
                </div>
                <div className="text-red-700 text-sm">Alpha</div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-200">
                    <th className="p-3 border">Nama</th>
                    <th className="p-3 border">Kelas</th>
                    <th className="p-3 border">Hadir</th>
                    <th className="p-3 border">Alpha</th>
                    <th className="p-3 border">Izin</th>
                    <th className="p-3 border">Sakit</th>
                    <th className="p-3 border">% Hadir</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRecapData.map((item, index) => (
                    <tr key={index} className="border-t">
                      <td className="p-3">{item.nama || "N/A"}</td>
                      <td className="p-3">{item.kelas || "N/A"}</td>
                      <td className="p-3">{item.hadir || 0}</td>
                      <td className="p-3">{item.alpa || 0}</td>
                      <td className="p-3">{item.izin || 0}</td>
                      <td className="p-3">{item.sakit || 0}</td>
                      <td className="p-3">
                        {item.persenHadir !== undefined
                          ? `${item.persenHadir}%`
                          : "N/A"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

const StudentAttendanceApp: React.FC = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [uniqueClasses, setUniqueClasses] = useState<string[]>(["Semua"]);
  const [activeTab, setActiveTab] = useState<"data" | "attendance" | "recap">(
    "data"
  );
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const fetchStudents = () => {
    fetch(endpoint)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        return res.json();
      })
      .then((data: Student[]) => {
        console.log("Fetched student data:", data);
        setStudents(data);

        const classSet = new Set<string>();
        data.forEach((student) => {
          if (student.kelas != null) {
            const kelasValue = String(student.kelas).trim();
            if (
              kelasValue !== "" &&
              kelasValue !== "undefined" &&
              kelasValue !== "null"
            ) {
              classSet.add(kelasValue);
            }
          }
        });
        const classes = Array.from(classSet).sort((a, b) => {
          const aIsNum = /^\d+$/.test(a);
          const bIsNum = /^\d+$/.test(b);
          if (aIsNum && bIsNum) return parseInt(a) - parseInt(b);
          if (aIsNum && !bIsNum) return -1;
          if (!aIsNum && bIsNum) return 1;
          return a.localeCompare(b);
        });
        setUniqueClasses(["Semua", ...classes]);
      })
      .catch((error) => {
        console.error("Fetch error:", error);
        alert("❌ Gagal mengambil data siswa. Cek console untuk detail.");
      });
  };

  const handleRecapRefresh = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 py-6 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Sistem Absensi Siswa
          </h1>
          <p className="text-gray-600">Kelola data siswa dan absensi harian</p>
        </div>

        <div className="bg-white rounded-lg shadow-md mb-6">
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setActiveTab("data")}
              className={`flex-1 py-4 px-6 text-center font-medium transition-colors ${
                activeTab === "data"
                  ? "bg-blue-600 text-white border-b-2 border-blue-600"
                  : "text-gray-600 hover:text-blue-600 hover:bg-gray-50"
              }`}
            >
              👥 Data Siswa
            </button>
            <button
              onClick={() => setActiveTab("attendance")}
              className={`flex-1 py-4 px-6 text-center font-medium transition-colors ${
                activeTab === "attendance"
                  ? "bg-blue-600 text-white border-b-2 border-blue-600"
                  : "text-gray-600 hover:text-blue-600 hover:bg-gray-50"
              }`}
            >
              📋 Absensi
            </button>
            <button
              onClick={() => setActiveTab("recap")}
              className={`flex-1 py-4 px-6 text-center font-medium transition-colors ${
                activeTab === "recap"
                  ? "bg-blue-600 text-white border-b-2 border-blue-600"
                  : "text-gray-600 hover:text-blue-600 hover:bg-gray-50"
              }`}
            >
              📊 Rekap Bulanan
            </button>
          </div>
        </div>

        <div className="py-4">
          {activeTab === "data" ? (
            <StudentDataTab students={students} onRefresh={fetchStudents} />
          ) : activeTab === "attendance" ? (
            <AttendanceTab
              students={students}
              onRecapRefresh={handleRecapRefresh}
            />
          ) : (
            <MonthlyRecapTab
              onRefresh={handleRecapRefresh}
              uniqueClasses={uniqueClasses}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentAttendanceApp;
