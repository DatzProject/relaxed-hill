import React, { useState, useEffect } from "react";

const endpoint =
  "https://script.google.com/macros/s/AKfycbwwbQw7c7srpvaoiqO9_k2uvrI7p-LMxC1uEkGHHmcRQ42jYqr04CKk6w1peqY-XM8d/exec";

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

interface StudentFormProps {
  onBack: () => void;
  onStudentAdded: () => void;
}

const formatDateDDMMYYYY = (isoDate: string): string => {
  const [year, month, day] = isoDate.split("-");
  return `${day}-${month}-${year}`;
};

const StudentForm: React.FC<StudentFormProps> = ({
  onBack,
  onStudentAdded,
}) => {
  const [nisn, setNisn] = useState("");
  const [nama, setNama] = useState("");
  const [kelas, setKelas] = useState("");
  const [students, setStudents] = useState<Student[]>([]);

  const fetchStudents = () => {
    fetch(endpoint)
      .then((res) => res.json())
      .then((data: Student[]) => setStudents(data))
      .catch(() => alert("❌ Gagal mengambil data siswa"));
  };

  useEffect(() => {
    fetchStudents();
  }, []);

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
        onStudentAdded();
        setNisn("");
        setNama("");
        setKelas("");
        fetchStudents();
      })
      .catch(() => alert("❌ Gagal menambahkan siswa."));
  };

  const handleEditStudent = (student: Student) => {
    const newName = prompt("Edit nama siswa:", student.name);
    const newClass = prompt("Edit kelas siswa:", student.kelas);

    if (newName && newClass) {
      fetch(endpoint, {
        method: "POST",
        mode: "no-cors",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "edit",
          nisn: student.nisn,
          nama: newName,
          kelas: newClass,
        }),
      })
        .then(() => {
          alert("✅ Data siswa berhasil diperbarui");
          fetchStudents();
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
          fetchStudents();
        })
        .catch(() => alert("❌ Gagal menghapus siswa"));
    }
  };

  return (
    <div className="max-w-xl mx-auto bg-white p-6 rounded-lg shadow-md mt-6">
      <h2 className="text-xl font-bold mb-4 text-center text-blue-600">
        Tambah Data Siswa
      </h2>
      <div className="space-y-3">
        <input
          type="text"
          placeholder="NISN"
          value={nisn}
          onChange={(e) => setNisn(e.target.value)}
          className="w-full border px-4 py-2 rounded"
        />
        <input
          type="text"
          placeholder="Nama Siswa"
          value={nama}
          onChange={(e) => setNama(e.target.value)}
          className="w-full border px-4 py-2 rounded"
        />
        <input
          type="text"
          placeholder="Kelas"
          value={kelas}
          onChange={(e) => setKelas(e.target.value)}
          className="w-full border px-4 py-2 rounded"
        />
        <div className="flex justify-between">
          <button
            onClick={onBack}
            className="px-4 py-2 bg-gray-400 text-white rounded"
          >
            ← Kembali
          </button>
          <button
            onClick={handleSubmit}
            className="px-4 py-2 bg-blue-600 text-white rounded"
          >
            Tambah Siswa
          </button>
        </div>
      </div>

      {/* List Data Siswa */}
      <div className="mt-8">
        <h3 className="text-lg font-semibold text-gray-700 mb-3">
          Daftar Siswa
        </h3>
        {students.length === 0 ? (
          <p className="text-sm text-gray-500">Belum ada data siswa.</p>
        ) : (
          <div className="space-y-3">
            {students.map((s) => (
              <div
                key={s.id}
                className="flex justify-between items-center bg-gray-100 border px-4 py-2 rounded"
              >
                <div>
                  <p className="font-medium">{s.name}</p>
                  <p className="text-sm text-gray-600">
                    NISN: {s.nisn} | Kelas: {s.kelas}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEditStudent(s)}
                    className="text-xs bg-yellow-500 text-white px-2 py-1 rounded"
                  >
                    ✏️ Edit
                  </button>
                  <button
                    onClick={() => handleDeleteStudent(s.nisn)}
                    className="text-xs bg-red-500 text-white px-2 py-1 rounded"
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

const StudentAttendanceApp: React.FC = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [attendance, setAttendance] = useState<AttendanceRecord>({});
  const [date, setDate] = useState<string>(
    new Date().toISOString().split("T")[0]
  );
  const [showForm, setShowForm] = useState<boolean>(false);

  const fetchStudents = () => {
    fetch(endpoint)
      .then((res) => res.json())
      .then((data: Student[]) => setStudents(data))
      .catch(() => alert("❌ Gagal mengambil data siswa"));
  };

  useEffect(() => {
    fetchStudents();
  }, []);

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
    const data = students.map((s) => ({
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
      .then(() => alert("✅ Data absensi berhasil dikirim!"))
      .catch(() => alert("❌ Gagal kirim data absensi."));
  };

  const handleStudentAdded = () => {
    fetchStudents();
  };

  const statusColor: Record<AttendanceStatus, string> = {
    Hadir: "bg-green-500",
    Izin: "bg-yellow-400",
    Sakit: "bg-blue-400",
    Alpha: "bg-red-500",
  };

  if (showForm) {
    return (
      <StudentForm
        onBack={() => setShowForm(false)}
        onStudentAdded={handleStudentAdded}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4">
      <div className="max-w-3xl mx-auto bg-white p-6 rounded-lg shadow-md">
        <h1 className="text-2xl font-bold text-center text-blue-700 mb-6">
          📋 Absensi Siswa ({students.length})
        </h1>

        <div className="mb-4 text-center">
          <p className="text-sm text-gray-500">
            Tanggal: {formatDateDDMMYYYY(date)}
          </p>
        </div>

        <div className="mb-6 flex justify-center">
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="border border-gray-300 rounded-lg px-4 py-2 shadow-sm"
          />
        </div>

        {students.map((s) => (
          <div
            key={s.id}
            className="mb-4 p-4 border border-gray-200 rounded-lg bg-gray-50 shadow-sm"
          >
            <div className="flex justify-between items-center">
              <div>
                <p className="text-lg font-semibold text-gray-800">{s.name}</p>
                <p className="text-sm text-gray-500">
                  {s.kelas} • NISN: {s.nisn}
                </p>
              </div>
              <div className="flex gap-2">
                {(
                  ["Hadir", "Izin", "Sakit", "Alpha"] as AttendanceStatus[]
                ).map((status) => (
                  <button
                    key={status}
                    onClick={() => setStatus(s.id, status)}
                    className={`px-3 py-1 rounded-lg text-sm font-medium ${
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

        <button
          onClick={handleSave}
          className="mt-6 w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-bold shadow-md"
        >
          💾 Simpan Absensi
        </button>

        <button
          onClick={() => setShowForm(true)}
          className="mt-4 w-full bg-gray-600 text-white py-2 rounded-lg"
        >
          ➕ Tambah Data Siswa
        </button>
      </div>
    </div>
  );
};

export default StudentAttendanceApp;
