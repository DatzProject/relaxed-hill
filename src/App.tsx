import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Save, FileText, Users } from 'lucide-react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';

// Define the single web app URL at the top
const scriptURL = 'https://script.google.com/macros/s/AKfycbw-s6CHZBP6HJpXL8P060UneOepJrjuL-dIUKCZ1mHu3LK5j7ugVeqi5pAa2Dya6PYQow/exec';

interface QuizQuestion {
  soal: string;
  gambar: string;
  opsiA: string;
  opsiB: string;
  opsiC: string;
  opsiD: string;
  jawaban: string;
}

interface Student {
  nisn: string;
  nama_siswa: string;
}

const QuizMaker: React.FC = () => {
  const [questions, setQuestions] = useState<QuizQuestion[]>([{
    soal: '',
    gambar: '',
    opsiA: '',
    opsiB: '',
    opsiC: '',
    opsiD: '',
    jawaban: 'A'
  }]);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submitStatus, setSubmitStatus] = useState<string>('');

  const addQuestion = () => {
    setQuestions([...questions, {
      soal: '',
      gambar: '',
      opsiA: '',
      opsiB: '',
      opsiC: '',
      opsiD: '',
      jawaban: 'A'
    }]);
  };

  const removeQuestion = (index: number) => {
    if (questions.length > 1) {
      setQuestions(questions.filter((_, i) => i !== index));
    }
  };

  const updateQuestion = (index: number, field: keyof QuizQuestion, value: string) => {
    const updatedQuestions = [...questions];
    updatedQuestions[index] = { ...updatedQuestions[index], [field]: value };
    setQuestions(updatedQuestions);
  };

  const handleSubmit = () => {
    const hasEmptyFields = questions.some(
      q => !q.soal.trim() || !q.opsiA.trim() || !q.opsiB.trim() || !q.opsiC.trim() || !q.opsiD.trim() || !q.jawaban
    );
    if (hasEmptyFields) {
      setSubmitStatus('⚠️ Semua field wajib diisi!');
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus('Mengirim data...');

    const dataToSend = questions.map((q) => ({
      soal: q.soal,
      gambar: q.gambar,
      opsiA: q.opsiA,
      opsiB: q.opsiB,
      opsiC: q.opsiC,
      opsiD: q.opsiD,
      jawaban: q.jawaban
    }));

    fetch(scriptURL, {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'addToSheet2',
        data: dataToSend
      })
    })
      .then(() => {
        setSubmitStatus('✅ Data berhasil dikirim ke Sheet2!');
        setQuestions([{
          soal: '',
          gambar: '',
          opsiA: '',
          opsiB: '',
          opsiC: '',
          opsiD: '',
          jawaban: 'A'
        }]);
        setIsSubmitting(false);
      })
      .catch((error) => {
        setSubmitStatus('❌ Gagal mengirim data.');
        console.error('Fetch error:', error);
        setIsSubmitting(false);
      });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="flex items-center gap-3 mb-6">
            <FileText className="text-blue-600" size={32} />
            <h1 className="text-3xl font-bold text-gray-800">Pembuat Soal Online</h1>
          </div>
          
          <p className="text-gray-600 mb-6">
            Buat soal pilihan ganda dan kirim langsung ke Sheet2 di Google Sheets Anda.
          </p>

          {submitStatus && (
            <div className={`p-4 rounded-lg mb-6 ${
              submitStatus.includes('berhasil') 
                ? 'bg-green-100 text-green-700 border border-green-200' 
                : submitStatus.includes('Mengirim')
                ? 'bg-blue-100 text-blue-700 border border-blue-200'
                : 'bg-red-100 text-red-700 border border-red-200'
            }`}>
              {submitStatus}
            </div>
          )}

          <div className="space-y-6">
            {questions.map((question, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-6 bg-gray-50">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-gray-800">
                    Soal {index + 1}
                  </h3>
                  {questions.length > 1 && (
                    <button
                      onClick={() => removeQuestion(index)}
                      className="text-red-500 hover:text-red-700 transition-colors"
                    >
                      <Trash2 size={20} />
                    </button>
                  )}
                </div>

                <div className="grid gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Pertanyaan
                    </label>
                    <textarea
                      value={question.soal}
                      onChange={(e) => updateQuestion(index, 'soal', e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      rows={3}
                      placeholder="Masukkan pertanyaan soal..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Gambar (URL - opsional)
                    </label>
                    <input
                      type="url"
                      value={question.gambar}
                      onChange={(e) => updateQuestion(index, 'gambar', e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="https://example.com/gambar.jpg"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Opsi A
                      </label>
                      <input
                        type="text"
                        value={question.opsiA}
                        onChange={(e) => updateQuestion(index, 'opsiA', e.target.value)}
                        className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Pilihan A"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Opsi B
                      </label>
                      <input
                        type="text"
                        value={question.opsiB}
                        onChange={(e) => updateQuestion(index, 'opsiB', e.target.value)}
                        className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Pilihan B"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Opsi C
                      </label>
                      <input
                        type="text"
                        value={question.opsiC}
                        onChange={(e) => updateQuestion(index, 'opsiC', e.target.value)}
                        className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Pilihan C"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Opsi D
                      </label>
                      <input
                        type="text"
                        value={question.opsiD}
                        onChange={(e) => updateQuestion(index, 'opsiD', e.target.value)}
                        className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Pilihan D"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Jawaban Benar
                    </label>
                    <select
                      value={question.jawaban}
                      onChange={(e) => updateQuestion(index, 'jawaban', e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="A">A</option>
                      <option value="B">B</option>
                      <option value="C">C</option>
                      <option value="D">D</option>
                    </select>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="flex gap-4 mt-8">
            <button
              onClick={addQuestion}
              className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus size={20} />
              Tambah Soal
            </button>

            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              <Save size={20} />
              {isSubmitting ? 'Mengirim...' : 'Kirim ke Sheet2'}
            </button>
          </div>

          <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <h4 className="font-semibold text-yellow-800 mb-2">Catatan Implementasi:</h4>
            <p className="text-sm text-yellow-700">
              Untuk mengirim data ke Google Sheets, pastikan:
            </p>
            <ol className="text-sm text-yellow-700 mt-2 ml-4 list-decimal space-y-1">
              <li>Google Apps Script sudah terhubung ke spreadsheet Anda.</li>
              <li>URL script sudah benar dan di-deploy sebagai web app.</li>
              <li>Script memiliki izin untuk menulis ke Sheet2.</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
};

const StudentData: React.FC = () => {
  const [nisn, setNisn] = useState<string>('');
  const [namaSiswa, setNamaSiswa] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submitStatus, setSubmitStatus] = useState<string>('');
  const [students, setStudents] = useState<Student[]>([]);

  const fetchStudents = () => {
    fetch(`${scriptURL}?action=getFromSheet3`, {
      method: 'GET',
      mode: 'cors', // Use cors for GET to read response
    })
      .then(response => response.json())
      .then(data => {
        if (data.status === 'success') {
          setStudents(data.data);
        } else {
          setSubmitStatus('❌ Gagal mengambil data siswa.');
          console.error('Error fetching students:', data.message);
        }
      })
      .catch(error => {
        setSubmitStatus('❌ Gagal mengambil data siswa.');
        console.error('Fetch error:', error);
      });
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const handleSubmit = () => {
    if (!nisn.trim() || !namaSiswa.trim()) {
      setSubmitStatus('⚠️ Semua field wajib diisi!');
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus('Mengirim data...');

    fetch(scriptURL, {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'addToSheet3',
        data: [{ nisn, nama_siswa: namaSiswa }]
      })
    })
      .then(() => {
        setSubmitStatus('✅ Siswa berhasil ditambahkan!');
        setNisn('');
        setNamaSiswa('');
        fetchStudents(); // Refresh student list
        setIsSubmitting(false);
      })
      .catch((error) => {
        setSubmitStatus('❌ Gagal menambahkan siswa.');
        console.error('Fetch error:', error);
        setIsSubmitting(false);
      });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="flex items-center gap-3 mb-6">
            <Users className="text-blue-600" size={32} />
            <h1 className="text-3xl font-bold text-gray-800">Data Siswa</h1>
          </div>
          
          <p className="text-gray-600 mb-6">
            Tambah data siswa dan lihat daftar siswa yang sudah terinput di Sheet3.
          </p>

          {submitStatus && (
            <div className={`p-4 rounded-lg mb-6 ${
              submitStatus.includes('berhasil') 
                ? 'bg-green-100 text-green-700 border border-green-200' 
                : submitStatus.includes('Mengirim')
                ? 'bg-blue-100 text-blue-700 border border-blue-200'
                : 'bg-red-100 text-red-700 border border-red-200'
            }`}>
              {submitStatus}
            </div>
          )}

          <div className="grid gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                NISN
              </label>
              <input
                type="text"
                value={nisn}
                onChange={(e) => setNisn(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Masukkan NISN"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nama Siswa
              </label>
              <input
                type="text"
                value={namaSiswa}
                onChange={(e) => setNamaSiswa(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Masukkan nama siswa"
              />
            </div>
            <div className="text-center">
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                <Save size={20} />
                {isSubmitting ? 'Mengirim...' : 'Tambah Siswa'}
              </button>
            </div>
          </div>

          <div className="mt-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Daftar Siswa</h3>
            {students.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full bg-white border border-gray-200 rounded-lg">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">NISN</th>
                      <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Nama Siswa</th>
                    </tr>
                  </thead>
                  <tbody>
                    {students.map((student, index) => (
                      <tr key={index} className="border-t">
                        <td className="px-4 py-2 text-sm text-gray-600">{student.nisn}</td>
                        <td className="px-4 py-2 text-sm text-gray-600">{student.nama_siswa}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-gray-600">Belum ada data siswa.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <Router>
      <nav className="bg-blue-600 text-white p-4 shadow-md">
        <div className="max-w-4xl mx-auto flex gap-4">
          <Link to="/" className="flex items-center gap-2 hover:underline">
            <FileText size={20} />
            Pembuat Soal
          </Link>
          <Link to="/students" className="flex items-center gap-2 hover:underline">
            <Users size={20} />
            Data Siswa
          </Link>
        </div>
      </nav>
      <Routes>
        <Route path="/" element={<QuizMaker />} />
        <Route path="/students" element={<StudentData />} />
      </Routes>
    </Router>
  );
};

export default App;
