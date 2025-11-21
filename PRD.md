Tentu, ini adalah **Product Requirements Document (PRD)** lengkap untuk proyek **Smart Aquarium Controller** Anda. Dokumen ini dirancang untuk menjadi panduan utama bagi tim pengembang (Frontend, Backend, dan Hardware/IoT Engineer).

---

# Product Requirements Document (PRD)
**Nama Proyek:** Smart Aquarium Controller (Auto Feeder & UV System)
**Versi:** 1.0
**Tanggal:** 19 November 2025

## 1. Ringkasan Proyek (Executive Summary)
Sistem IoT berbasis web untuk memantau dan mengontrol akuarium secara otomatis. Sistem ini memiliki dua fitur utama:
1.  **Smart Feeder:** Sistem pemberian pakan dengan mekanisme "Double Gate" (Volumetric Dosing) untuk takaran akurat (~10g) dan keamanan stok.
2.  **Smart UV Sterilizer:** Pengontrolan lampu UV pembersih air dengan sistem penjadwalan fleksibel dan mode manual yang memiliki prioritas *override*.

Sistem menggunakan protokol **MQTT** untuk komunikasi antara Hardware (ESP32/Arduino) dan Server.

---

## 2. Fitur Fungsional (Functional Requirements)

### A. Modul Automatic Feeder (Pemberi Pakan)

**1. Mekanisme Fisik (Double Gate Logic)**
Sistem harus mengikuti alur kerja berikut untuk menjatuhkan 1 dosis pakan:
* **State Awal:** Gate Atas (P2) & Bawah (P4) tertutup.
* **Step 1 (Isi Takaran):** Buka P2 selama **X detik** (estimasi 4-6 detik) untuk mengisi ruang takar (P3) dari Stok (P1). P4 tetap tertutup.
* **Step 2 (Kunci):** Tutup P2. Jeda sebentar untuk stabilisasi.
* **Step 3 (Tuang):** Buka P4 untuk menjatuhkan isi P3 (~10g) ke kolam.
* **Step 4 (Reset):** Tutup P4. Kembali ke State Awal.
* *Output:* Mengurangi nilai stok pakan di database sebesar 10 gram (estimasi).

**2. Penjadwalan Pakan (Scheduling)**
* User dapat mengatur jadwal berdasarkan **Hari** (Senin-Minggu).
* Limitasi: Maksimal 5 kali pemberian pakan per hari.
* Input user: Jam eksekusi (misal: 08:00, 12:00).

**3. Manual Feed & Validasi**
* Terdapat tombol "Beri Pakan Sekarang".
* **Validasi:** Saat tombol ditekan, sistem harus menampilkan *Popup Konfirmasi*:
    > *"Anda yakin? Pemberian pakan terakhir terjadi pada hari [HARI], jam [JAM:MENIT]"*
* Data "terakhir makan" diambil dari log history sukses terakhir.

---

### B. Modul UV Sterilizer (Lampu UV)

**1. Penjadwalan UV**
* User dapat mengatur jadwal berdasarkan **Hari** dan **Rentang Waktu** (Start Time - End Time).
* Default: 7 Hari seminggu, durasi 8 jam (misal 20:00 - 04:00).

**2. Manual Override (Prioritas)**
* User dapat menyalakan UV secara manual dengan input **Durasi** (bukan jam selesai). Misal: "Nyalakan selama 2 jam".
* **Logika Konflik:** Jika Mode Manual sedang aktif (Running), maka jadwal otomatis yang seharusnya berjalan di jam tersebut harus **diabaikan/dipauses** hingga manual selesai.

---

## 3. Arsitektur Sistem & Data Flow

### Alur Komunikasi (MQTT)
Sistem menggunakan arsitektur Pub/Sub. Backend bertindak sebagai pengendali logika.

**1. Topik MQTT (Draft Standar)**

| Topic | Method | Payload (JSON Example) | Deskripsi |
| :--- | :--- | :--- | :--- |
| `aquarium/feeder/command` | PUBLISH (Server) | `{"action": "FEED", "dose": 1}` | Perintah dari server ke alat untuk memulai siklus Double Gate. |
| `aquarium/feeder/status` | PUBLISH (Alat) | `{"status": "IDLE"}` atau `{"status": "DISPENSING"}` | Status alat saat ini. |
| `aquarium/uv/command` | PUBLISH (Server) | `{"state": "ON", "duration_sec": 7200}` | Perintah nyalakan UV. Jika schedule, duration bisa diset 0 (ikut jadwal). |
| `aquarium/uv/status` | PUBLISH (Alat) | `{"state": "ON", "remaining": 3600}` | Laporan status UV real-time. |
| `aquarium/device/report` | PUBLISH (Alat) | `{"result": "SUCCESS", "type": "FEED", "feed_gram": 10}` | Laporan akhir setelah aksi selesai untuk dicatat ke DB. |

---

## 4. Spesifikasi Database (Schema Overview)

Sesuai diskusi sebelumnya, berikut adalah struktur tabel yang akan digunakan di Backend.

**1. `pakan_schedules`**
* Menyimpan jadwal rutin pakan.
* Kolom: `id`, `day_name` (Mon-Sun), `time` (HH:MM), `amount_gram` (default 10), `is_active`.

**2. `uv_schedules`**
* Menyimpan jadwal rutin UV.
* Kolom: `id`, `day_name`, `start_time`, `end_time`, `is_active`.

**3. `action_history` (Log Utama)**
* Mencatat semua aktivitas dan digunakan untuk validasi logic.
* Kolom:
    * `id`
    * `device_type`: ('FEEDER', 'UV')
    * `trigger_source`: ('SCHEDULE', 'MANUAL')
    * `start_time`: Timestamp
    * `end_time`: Timestamp (Diisi saat selesai / estimasi selesai untuk UV manual)
    * `status`: ('PENDING', 'RUNNING', 'SUCCESS', 'FAILED', 'OVERRIDDEN')
    * `value`: (Misal: 10 untuk gram pakan, atau durasi detik untuk UV)

---

## 5. Kebutuhan Antarmuka (UI/UX)

**Dashboard Utama:**
1.  **Card Status Stok:** Menampilkan sisa pakan (dalam Gram atau Persentase) dengan grafik visual.
2.  **Card Status UV:** Indikator apakah UV sedang Nyala/Mati dan sisa waktu (jika manual).
3.  **History Table:** Tabel riwayat aktivitas (Feeding & UV) dengan status sukses/gagal.

**Kontrol Panel:**
1.  **Tombol Manual Feed:** Membuka modal konfirmasi dengan data history terakhir.
2.  **Tombol Manual UV:** Membuka input form "Durasi" (menit/jam).
3.  **Setting Jadwal:** Form untuk menambah/edit/hapus jadwal Pakan dan UV (Toggle ON/OFF per hari).

---

## 6. Logika Backend (Business Logic)

**Cron Job / Scheduler (Berjalan setiap menit):**
1.  **Cek Jadwal Pakan:**
    * Apakah ada jadwal di menit ini?
    * Jika YA -> Publish MQTT `aquarium/feeder/command`.
2.  **Cek Jadwal UV:**
    * Apakah saat ini masuk rentang waktu jadwal UV?
    * *Cek Konflik:* Apakah ada data di `action_history` dengan source 'MANUAL' dan status 'RUNNING'?
    * Jika TIDAK ADA konflik -> Publish MQTT `aquarium/uv/command` (ON).
    * Jika ADA konflik -> Jangan lakukan apa-apa (biarkan manual berjalan).

---

## 7. Next Step
Dokumen ini siap digunakan sebagai acuan.
1.  **Backend Dev:** Setup database dan MQTT Broker, buat Cron Job.
2.  **Hardware Dev:** Coding ESP32 untuk subscribe topic MQTT dan menggerakkan servo (P2 & P4) sesuai urutan logic.
3.  **Frontend Dev:** Buat UI Dashboard dan logika fetch data history untuk popup.

 