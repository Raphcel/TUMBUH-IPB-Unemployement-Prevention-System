# Testing

This is the canonical manual QA document for TUMBUH. The full matrix starts with `Not Run` statuses by default; only change a status to passed or failed after an actual test execution.

## Auth Showcase Test Cases

Use this section when you want to demo and manually verify the authentication flow end-to-end.

### Prerequisites

- Backend is running at `http://127.0.0.1:8000`
- Frontend is running at the Vite URL, usually `http://localhost:5173`
- Database migrations and seed data have been applied:

```powershell
cd be-web
alembic upgrade head
python -m scripts.seed
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

Seeded demo credentials:

| Role | Email | Password | Expected Dashboard |
|---|---|---|---|
| Student | `budi.santoso@apps.ipb.ac.id` | `password123` | `/student/dashboard` |
| HR | `hr@tokopedia.com` | `password123` | `/hr/dashboard` |
| Admin | `admin@tumbuh.id` | `password123` | Admin-only pages/API access |

### Quick UI Showcase

| ID Test Case | Scenario | Steps | Expected Result |
|---|---|---|---|
| TC-AUTH-SHOW-001 | Student login succeeds | Open `/login`; enter `budi.santoso@apps.ipb.ac.id` and `password123`; click Masuk | Login succeeds, success toast appears, user is redirected to `/student/dashboard` |
| TC-AUTH-SHOW-002 | HR login succeeds | Open `/login`; enter `hr@tokopedia.com` and `password123`; click Masuk | Login succeeds and user is redirected to `/hr/dashboard` |
| TC-AUTH-SHOW-003 | Wrong password is rejected | Open `/login`; enter a seeded email and `wrongpass123`; click Masuk | Login fails, error message appears, user stays on login page, no new session is created |
| TC-AUTH-SHOW-004 | Register validates IPB email | Open `/register`; fill required fields using `test@gmail.com`; click Daftar | Frontend blocks submission with "Gunakan email institusi IPB" / "Use an IPB institutional email" |
| TC-AUTH-SHOW-005 | Register validates password length | Open `/register`; fill required fields using an IPB email and password `12345`; click Daftar | Frontend blocks submission with minimum 8 character validation |
| TC-AUTH-SHOW-006 | New student registration succeeds | Open `/register`; fill first name, last name, unique `@apps.ipb.ac.id` email, password `password123`, role Student; click Daftar | Account is created, tokens are stored, user is redirected to `/student/dashboard` |
| TC-AUTH-SHOW-007 | Duplicate email registration is rejected | Register again with an email that already exists | API returns an error and frontend shows registration failure |
| TC-AUTH-SHOW-008 | Logout clears session | Login, use the user menu logout action, then refresh a protected page | Token is removed from local storage and user must login again |

### Quick API Showcase

Run these from PowerShell while the backend is running.

#### 1. Login with valid credentials

```powershell
$login = Invoke-RestMethod `
  -Method Post `
  -Uri "http://127.0.0.1:8000/api/v1/auth/login" `
  -ContentType "application/json" `
  -Body '{"email":"budi.santoso@apps.ipb.ac.id","password":"password123"}'

$login.user
$login.access_token.Length
$login.refresh_token.Length
```

Expected result:

- HTTP `200 OK`
- Response contains `access_token`, `refresh_token`, `token_type: bearer`, and `user`
- `user.email` is `budi.santoso@apps.ipb.ac.id`
- `user.role` is `student`
- Response must not contain `hashed_password`

#### 2. Read current user with access token

```powershell
$headers = @{ Authorization = "Bearer $($login.access_token)" }

Invoke-RestMethod `
  -Method Get `
  -Uri "http://127.0.0.1:8000/api/v1/auth/me" `
  -Headers $headers
```

Expected result:

- HTTP `200 OK`
- Returns the authenticated user's profile
- Returned user ID and email match the login response

#### 3. Reject invalid login

```powershell
Invoke-RestMethod `
  -Method Post `
  -Uri "http://127.0.0.1:8000/api/v1/auth/login" `
  -ContentType "application/json" `
  -Body '{"email":"budi.santoso@apps.ipb.ac.id","password":"wrongpass123"}'
```

Expected result:

- HTTP `401 Unauthorized`
- Error detail is `Incorrect email or password`
- No token is issued

#### 4. Register a new student

Change the email suffix or timestamp each time so the email stays unique.

```powershell
$newEmail = "auth.demo.$([DateTimeOffset]::UtcNow.ToUnixTimeSeconds())@apps.ipb.ac.id"

$registerBody = @{
  first_name = "Auth"
  last_name = "Demo"
  email = $newEmail
  password = "password123"
  role = "student"
} | ConvertTo-Json

$registered = Invoke-RestMethod `
  -Method Post `
  -Uri "http://127.0.0.1:8000/api/v1/auth/register" `
  -ContentType "application/json" `
  -Body $registerBody

$registered.user
```

Expected result:

- HTTP `201 Created`
- Response contains access and refresh tokens
- `user.email` matches `$newEmail`
- `user.role` is `student`

#### 5. Reject duplicate registration

```powershell
Invoke-RestMethod `
  -Method Post `
  -Uri "http://127.0.0.1:8000/api/v1/auth/register" `
  -ContentType "application/json" `
  -Body $registerBody
```

Expected result:

- HTTP `400 Bad Request`
- Error detail is `A user with this email already exists`

#### 6. Refresh tokens

```powershell
$refresh = Invoke-RestMethod `
  -Method Post `
  -Uri "http://127.0.0.1:8000/api/v1/auth/refresh" `
  -ContentType "application/json" `
  -Body (@{ refresh_token = $login.refresh_token } | ConvertTo-Json)

$refresh.access_token.Length
$refresh.refresh_token.Length
```

Expected result:

- HTTP `200 OK`
- New `access_token` and `refresh_token` are returned
- Returned `user` is still the same account

#### 7. Reject refresh token as an access token

```powershell
Invoke-RestMethod `
  -Method Get `
  -Uri "http://127.0.0.1:8000/api/v1/auth/me" `
  -Headers @{ Authorization = "Bearer $($login.refresh_token)" }
```

Expected result:

- HTTP `401 Unauthorized`
- Error detail is `Cannot use refresh token for authentication`

#### 8. Reject malformed or fake token

```powershell
Invoke-RestMethod `
  -Method Get `
  -Uri "http://127.0.0.1:8000/api/v1/auth/me" `
  -Headers @{ Authorization = "Bearer not-a-real-token" }
```

Expected result:

- HTTP `401 Unauthorized`
- Error detail is `Invalid or expired token`

#### 9. Rate limit login/register

```powershell
1..6 | ForEach-Object {
  try {
    Invoke-RestMethod `
      -Method Post `
      -Uri "http://127.0.0.1:8000/api/v1/auth/login" `
      -ContentType "application/json" `
      -Body '{"email":"nobody@apps.ipb.ac.id","password":"wrongpass123"}'
  } catch {
    $_.Exception.Response.StatusCode.value__
  }
}
```

Expected result:

- First failed attempts return `401`
- Once the `5/minute` limit is exceeded, the next request is rate-limited, usually `429 Too Many Requests`

### Auth Acceptance Checklist

- [ ] Valid student login redirects to student dashboard
- [ ] Valid HR login redirects to HR dashboard
- [ ] Invalid credentials do not create a session
- [ ] Register accepts a unique IPB institutional email
- [ ] Register rejects duplicate email
- [ ] Access token works on `/auth/me`
- [ ] Refresh token works only on `/auth/refresh`
- [ ] Refresh token is rejected on protected endpoints
- [ ] API responses do not expose `hashed_password`
- [ ] Login/register rate limit is enforced

## Full Test Case Matrix

| No | Fitur Utama | ID Test Case | Tujuan | Langkah-langkah | Data Input | Expected Result | Status |
|---:|---|---|---|---|---|---|---|
| 1 | Register | TC-AUTH-001 | Memastikan student dapat registrasi dengan data valid | Buka halaman Register; isi semua field wajib; pilih role Student; klik Daftar | Email valid, password `password123`, nama, NIM, major, GPA | Akun student berhasil dibuat, token/session aktif, user masuk ke dashboard student | Not Run |
| 2 | Register | TC-AUTH-002 | Memastikan HR dapat registrasi dengan data valid | Buka halaman Register; isi data HR; pilih role HR; hubungkan company jika tersedia; klik Daftar | Email valid, password `password123`, nama, company_id valid | Akun HR berhasil dibuat, role tersimpan sebagai HR | Not Run |
| 3 | Register | TC-AUTH-003 | Memastikan format email invalid ditolak | Buka Register; isi email dengan format salah; klik Daftar | `budi-ipb.com` | Sistem menolak registrasi dan menampilkan pesan validasi email | Not Run |
| 4 | Register | TC-AUTH-004 | Memastikan password kurang dari minimum ditolak | Buka Register; isi password kurang dari 8 karakter; klik Daftar | Password `12345` | Sistem menolak registrasi dan menampilkan pesan validasi password | Not Run |
| 5 | Register | TC-AUTH-005 | Memastikan email duplikat tidak dapat digunakan | Register menggunakan email yang sudah terdaftar | Email existing | Sistem menolak registrasi, akun duplikat tidak dibuat | Not Run |
| 6 | Register | TC-AUTH-006 | Memastikan field wajib tidak boleh kosong | Kosongkan nama/email/password; klik Daftar | Field wajib kosong | Sistem menampilkan validasi field wajib | Not Run |
| 7 | Login | TC-AUTH-007 | Memastikan user dapat login dengan kredensial valid | Buka halaman Login; isi email dan password benar; klik Login | Email terdaftar, password benar | Login berhasil dan user diarahkan ke dashboard sesuai role | Not Run |
| 8 | Login | TC-AUTH-008 | Memastikan password salah ditolak | Login menggunakan email valid dan password salah | Email valid, password salah | Login gagal, token/session tidak dibuat, pesan error tampil | Not Run |
| 9 | Login | TC-AUTH-009 | Memastikan email tidak terdaftar ditolak | Login menggunakan email yang belum terdaftar | Email unknown | Login gagal dan pesan error tampil | Not Run |
| 10 | Authorization | TC-AUTH-010 | Memastikan halaman protected tidak dapat diakses tanpa login | Akses dashboard/profil tanpa session/token | Tidak ada token | User diarahkan ke login atau mendapat `401 Unauthorized` | Not Run |
| 11 | Authorization | TC-AUTH-011 | Memastikan token invalid atau expired ditolak | Kirim request ke endpoint protected menggunakan token rusak/expired | Token invalid/expired | Sistem menolak akses dengan `401 Unauthorized` | Not Run |
| 12 | Authorization | TC-AUTH-012 | Memastikan pembatasan login/register berjalan | Lakukan login/register lebih dari batas percobaan per menit | Lebih dari 5 request per menit | Request berikutnya ditolak/rate-limited | Not Run |
| 13 | Refresh Token | TC-AUTH-013 | Memastikan refresh token valid menghasilkan token baru | Login; ambil refresh token; kirim ke endpoint refresh | Refresh token valid | Access token dan refresh token baru diterbitkan | Not Run |
| 14 | Refresh Token | TC-AUTH-014 | Memastikan refresh token invalid ditolak | Kirim refresh token palsu/expired | Refresh token invalid | Sistem menolak refresh token | Not Run |
| 15 | Profil Student | TC-STU-001 | Memastikan student dapat melihat profil sendiri | Login sebagai student; buka halaman Profil | Akun student valid | Data profil student tampil sesuai database | Not Run |
| 16 | Profil Student | TC-STU-002 | Memastikan student dapat memperbarui profil | Edit phone, bio, NIM, major, dan GPA; klik Simpan | Data profil valid | Data tersimpan dan tetap tampil setelah refresh | Not Run |
| 17 | Profil Student | TC-STU-003 | Memastikan GPA invalid ditolak | Isi GPA menggunakan teks/simbol; klik Simpan | `abc` | Sistem menampilkan validasi error dan data tidak berubah | Not Run |
| 18 | Profil Student | TC-STU-004 | Memastikan user hanya mengubah profil sendiri | Login sebagai student A; coba ubah profil student B melalui request langsung | User ID student B | Sistem menolak akses atau hanya mengubah profil student A | Not Run |
| 19 | Upload Foto | TC-STU-005 | Memastikan upload avatar valid berhasil | Login; buka Profil; upload file gambar valid | JPG/PNG/GIF/WebP <= 2MB | Foto tersimpan, URL avatar dikembalikan, profil menampilkan foto baru | Not Run |
| 20 | Upload Foto | TC-STU-006 | Memastikan file non-gambar ditolak | Upload file selain gambar sebagai avatar | PDF/DOCX/TXT | Sistem menolak dengan pesan file harus berupa gambar | Not Run |
| 21 | Upload Foto | TC-STU-007 | Memastikan gambar melebihi batas ukuran ditolak | Upload gambar lebih dari 2MB | Image 3MB | Sistem menolak dengan pesan ukuran maksimal 2MB | Not Run |
| 22 | Upload CV | TC-STU-008 | Memastikan upload CV PDF valid berhasil | Login student; buka Profil/CV; upload PDF valid | PDF <= 5MB | CV tersimpan, URL CV dikembalikan, profil menampilkan CV | Not Run |
| 23 | Upload CV | TC-STU-009 | Memastikan CV non-PDF ditolak | Upload DOCX/JPG sebagai CV | `.docx` atau `.jpg` | Sistem menolak dengan pesan file harus PDF | Not Run |
| 24 | Upload CV | TC-STU-010 | Memastikan PDF terlalu besar ditolak | Upload PDF lebih dari 5MB | PDF 6MB | Sistem menolak dengan pesan ukuran maksimal 5MB | Not Run |
| 25 | Lowongan | TC-JOB-001 | Memastikan user dapat melihat daftar lowongan | Buka halaman Lowongan | Tidak ada | Daftar lowongan tampil dengan total data | Not Run |
| 26 | Lowongan | TC-JOB-002 | Memastikan pencarian lowongan berdasarkan judul berjalan | Masukkan keyword pada search lowongan | `Frontend` | Hanya lowongan relevan yang tampil | Not Run |
| 27 | Lowongan | TC-JOB-003 | Memastikan filter tipe lowongan berjalan | Pilih filter tipe lowongan | `INTERNSHIP` | Lowongan bertipe internship tampil | Not Run |
| 28 | Lowongan | TC-JOB-004 | Memastikan filter lokasi berjalan | Pilih/isi lokasi pada filter | `Jakarta` | Hanya lowongan sesuai lokasi yang tampil | Not Run |
| 29 | Lowongan | TC-JOB-005 | Memastikan tipe lowongan invalid ditolak | Kirim request list lowongan dengan tipe tidak valid | `PART_TIME_RANDOM` | Sistem menampilkan validasi error | Not Run |
| 30 | Lowongan | TC-JOB-006 | Memastikan pagination invalid ditolak | Kirim request dengan skip negatif atau limit di luar batas | `skip=-1`, `limit=0`, `limit=101` | Sistem menampilkan validasi error | Not Run |
| 31 | Detail Lowongan | TC-JOB-007 | Memastikan detail lowongan valid tampil | Klik salah satu lowongan | Opportunity ID valid | Detail lowongan, company, requirement, dan deadline tampil | Not Run |
| 32 | Detail Lowongan | TC-JOB-008 | Memastikan ID lowongan tidak ditemukan ditangani | Akses detail lowongan dengan ID tidak ada | Opportunity ID tidak ada | Sistem menampilkan not found/error state | Not Run |
| 33 | Perusahaan | TC-COMP-001 | Memastikan user dapat melihat daftar perusahaan | Buka halaman Perusahaan | Tidak ada | Daftar perusahaan tampil | Not Run |
| 34 | Perusahaan | TC-COMP-002 | Memastikan pencarian perusahaan berjalan | Cari perusahaan berdasarkan nama/industri | `Technology` | Perusahaan sesuai keyword tampil | Not Run |
| 35 | Perusahaan | TC-COMP-003 | Memastikan detail perusahaan valid tampil | Klik salah satu perusahaan | Company ID valid | Detail perusahaan tampil lengkap | Not Run |
| 36 | Perusahaan | TC-COMP-004 | Memastikan company ID tidak ada ditangani | Akses detail company dengan ID tidak valid | Company ID tidak ada | Sistem menampilkan not found/error state | Not Run |
| 37 | Lamaran | TC-APP-001 | Memastikan student dapat melamar lowongan valid | Login student; buka detail lowongan; klik Apply; isi cover letter jika ada | Opportunity valid, cover letter opsional | Lamaran dibuat dengan status awal `APPLIED` | Not Run |
| 38 | Lamaran | TC-APP-002 | Memastikan student tidak dapat melamar lowongan yang sama dua kali | Lamar lowongan yang sama dua kali | Opportunity ID yang sama | Sistem menolak lamaran duplikat | Not Run |
| 39 | Lamaran | TC-APP-003 | Memastikan student tidak dapat melamar lowongan tidak valid | Kirim lamaran ke opportunity ID tidak ada | Opportunity ID tidak ada | Sistem menolak dengan not found/error | Not Run |
| 40 | Lamaran | TC-APP-004 | Memastikan HR/Admin tidak dapat melamar | Login HR/Admin; coba apply ke lowongan | Akun HR/Admin | Akses ditolak dengan `403 Forbidden` | Not Run |
| 41 | Lamaran Saya | TC-APP-005 | Memastikan student hanya melihat lamaran sendiri | Login student; buka Lamaran Saya | Akun student valid | Hanya lamaran milik student tersebut tampil | Not Run |
| 42 | Lamaran Saya | TC-APP-006 | Memastikan HR tidak dapat mengakses Lamaran Saya milik student | Login HR; akses endpoint/halaman Lamaran Saya | Akun HR | Akses ditolak dengan `403 Forbidden` | Not Run |
| 43 | Bookmark | TC-BMK-001 | Memastikan student dapat bookmark lowongan | Login student; klik bookmark pada lowongan | Opportunity ID valid | Bookmark dibuat dan lowongan muncul di daftar bookmark | Not Run |
| 44 | Bookmark | TC-BMK-002 | Memastikan bookmark duplikat tidak dibuat | Bookmark lowongan yang sama dua kali | Opportunity ID yang sama | Sistem menolak atau tetap hanya menyimpan satu bookmark | Not Run |
| 45 | Bookmark | TC-BMK-003 | Memastikan student dapat menghapus bookmark | Buka daftar bookmark; klik hapus | Bookmark existing | Bookmark hilang dari daftar | Not Run |
| 46 | Bookmark | TC-BMK-004 | Memastikan bookmark ID tidak ada ditangani | Hapus bookmark untuk opportunity yang tidak pernah disimpan | Opportunity ID tidak tersimpan | Sistem memberi respons aman tanpa menghapus data lain | Not Run |
| 47 | Bookmark | TC-BMK-005 | Memastikan HR/Admin tidak dapat memakai fitur bookmark student | Login HR/Admin; akses endpoint bookmark | Akun HR/Admin | Akses ditolak dengan `403 Forbidden` | Not Run |
| 48 | Externship | TC-EXT-001 | Memastikan student dapat menambah externship | Login student; buka Externship; tambah data | Title, company, duration, description valid | Externship berhasil dibuat | Not Run |
| 49 | Externship | TC-EXT-002 | Memastikan student dapat melihat externship sendiri | Login student; buka daftar externship | Akun student valid | Hanya externship milik student tersebut tampil | Not Run |
| 50 | Externship | TC-EXT-003 | Memastikan student dapat mengedit externship sendiri | Edit data externship milik sendiri; simpan | Data update valid | Data externship berhasil diperbarui | Not Run |
| 51 | Externship | TC-EXT-004 | Memastikan student dapat menghapus externship sendiri | Hapus externship milik sendiri | Externship ID valid | Data externship terhapus dari daftar | Not Run |
| 52 | Externship | TC-EXT-005 | Memastikan student tidak dapat mengedit externship orang lain | Login student A; edit externship student B | Externship ID milik user lain | Akses ditolak atau data tidak ditemukan | Not Run |
| 53 | Externship | TC-EXT-006 | Memastikan title terlalu panjang ditolak | Buat externship dengan title lebih dari 300 karakter | Title > 300 karakter | Sistem menampilkan validasi error | Not Run |
| 54 | Externship | TC-EXT-007 | Memastikan company terlalu panjang ditolak | Buat externship dengan company lebih dari 200 karakter | Company > 200 karakter | Sistem menampilkan validasi error | Not Run |
| 55 | HR Company | TC-HR-001 | Memastikan HR dapat membuat profil perusahaan | Login HR; isi form profil perusahaan; klik Simpan | Nama, industry, location valid | Perusahaan berhasil dibuat | Not Run |
| 56 | HR Company | TC-HR-002 | Memastikan HR dapat memperbarui perusahaan sendiri | Login HR; edit data company miliknya; simpan | Company ID sendiri | Data perusahaan berhasil diperbarui | Not Run |
| 57 | HR Company | TC-HR-003 | Memastikan HR tidak dapat memperbarui perusahaan lain | Login HR; coba update company milik HR lain | Company ID lain | Akses ditolak dengan `403 Forbidden` | Not Run |
| 58 | HR Company | TC-HR-004 | Memastikan HR tidak dapat menghapus perusahaan lain | Login HR; coba delete company milik HR lain | Company ID lain | Akses ditolak dengan `403 Forbidden` | Not Run |
| 59 | HR Company | TC-HR-005 | Memastikan field wajib company divalidasi | Buat company tanpa name/industry/location | Field wajib kosong | Sistem menampilkan validasi error | Not Run |
| 60 | HR Lowongan | TC-HR-006 | Memastikan HR dapat membuat lowongan | Login HR; buka Form Lowongan; isi data; submit | Title, type, location, deadline valid | Lowongan dibuat dan terhubung ke company HR | Not Run |
| 61 | HR Lowongan | TC-HR-007 | Memastikan HR tanpa company tidak dapat membuat lowongan | Login HR tanpa company_id; submit lowongan valid | Data lowongan valid | Sistem menolak karena HR harus terkait perusahaan | Not Run |
| 62 | HR Lowongan | TC-HR-008 | Memastikan student/admin tidak dapat membuat lowongan | Login student/admin; akses create lowongan | Akun non-HR | Akses ditolak dengan `403 Forbidden` | Not Run |
| 63 | HR Lowongan | TC-HR-009 | Memastikan title lowongan terlalu panjang ditolak | Submit lowongan dengan title lebih dari 300 karakter | Title > 300 karakter | Sistem menampilkan validasi error | Not Run |
| 64 | HR Lowongan | TC-HR-010 | Memastikan location lowongan terlalu panjang ditolak | Submit lowongan dengan location lebih dari 200 karakter | Location > 200 karakter | Sistem menampilkan validasi error | Not Run |
| 65 | HR Lowongan | TC-HR-011 | Memastikan HR dapat edit lowongan sendiri | Login HR; edit lowongan milik company sendiri | Opportunity ID sendiri | Lowongan berhasil diperbarui | Not Run |
| 66 | HR Lowongan | TC-HR-012 | Memastikan HR dapat close/nonaktifkan lowongan sendiri | Login HR; ubah status lowongan menjadi inactive/closed | `is_active=false` | Lowongan tidak tampil sebagai lowongan aktif | Not Run |
| 67 | HR Lowongan | TC-HR-013 | Memastikan HR dapat menghapus lowongan sendiri | Login HR; hapus lowongan milik company sendiri | Opportunity ID sendiri | Lowongan terhapus | Not Run |
| 68 | HR Lowongan | TC-HR-014 | Memastikan HR tidak dapat edit lowongan company lain | Login HR; edit opportunity milik company lain | Opportunity ID company lain | Akses ditolak dengan `403 Forbidden` | Not Run |
| 69 | HR Pelamar | TC-HR-015 | Memastikan HR dapat melihat pelamar lowongan sendiri | Login HR; buka pelamar untuk lowongan company sendiri | Opportunity ID sendiri | Daftar pelamar tampil | Not Run |
| 70 | HR Pelamar | TC-HR-016 | Memastikan HR tidak dapat melihat pelamar company lain | Login HR; akses pelamar opportunity company lain | Opportunity ID company lain | Akses ditolak dengan `403 Forbidden` | Not Run |
| 71 | HR Pelamar | TC-HR-017 | Memastikan pagination pelamar berjalan | Buka daftar pelamar dengan skip/limit valid | `skip=0`, `limit=10` | Sistem menampilkan data sesuai pagination | Not Run |
| 72 | HR Status Lamaran | TC-HR-018 | Memastikan HR dapat update status lamaran | Login HR; ubah status applicant | `SCREENING`, `INTERVIEW`, `ACCEPTED`, atau `REJECTED` | Status berubah dan history status tercatat | Not Run |
| 73 | HR Status Lamaran | TC-HR-019 | Memastikan status invalid ditolak | Update status lamaran menggunakan enum tidak valid | `HIRED_RANDOM` | Sistem menampilkan validasi error | Not Run |
| 74 | HR Status Lamaran | TC-HR-020 | Memastikan HR tidak dapat update lamaran company lain | Login HR; update application dari company lain | Application ID company lain | Akses ditolak dengan `403 Forbidden` | Not Run |
| 75 | HR Bulk Action | TC-HR-021 | Memastikan HR dapat update status banyak pelamar | Pilih beberapa lamaran dari company sendiri; update status sekaligus | List application ID valid | Semua status lamaran terpilih berubah | Not Run |
| 76 | HR Bulk Action | TC-HR-022 | Memastikan bulk action lintas company ditolak | Bulk update berisi application ID dari company lain | Mixed application IDs | Sistem menolak update tidak sah | Not Run |
| 77 | Candidate Detail | TC-HR-023 | Memastikan HR dapat melihat detail kandidat yang melamar | Login HR; buka detail pelamar dari lowongan sendiri | Application ID valid | Profil, CV, status, dan riwayat kandidat tampil | Not Run |
| 78 | Candidate Detail | TC-HR-024 | Memastikan HR tidak dapat melihat kandidat company lain | Login HR; buka detail application company lain | Application ID company lain | Akses ditolak | Not Run |
| 79 | Notifikasi | TC-NOTIF-001 | Memastikan user dapat melihat daftar notifikasi | Login user; buka halaman Notifications | Akun valid | Daftar notifikasi, total, dan unread count tampil | Not Run |
| 80 | Notifikasi | TC-NOTIF-002 | Memastikan user dapat menandai satu notifikasi sebagai terbaca | Klik mark as read pada satu notifikasi | Notification ID valid | `is_read` menjadi true dan unread count berkurang | Not Run |
| 81 | Notifikasi | TC-NOTIF-003 | Memastikan user dapat menandai semua notifikasi sebagai terbaca | Klik Mark All Read | Akun valid | Semua notifikasi user menjadi read dan unread count menjadi 0 | Not Run |
| 82 | Notifikasi | TC-NOTIF-004 | Memastikan user tidak dapat membaca notifikasi orang lain | Login user A; mark read notification user B | Notification ID milik user B | Akses ditolak atau not found | Not Run |
| 83 | Admin Dashboard | TC-ADM-001 | Memastikan admin dapat melihat statistik platform | Login admin; buka dashboard admin | Akun admin | Total students, companies, opportunities, dan aplikasi tampil | Not Run |
| 84 | Admin Dashboard | TC-ADM-002 | Memastikan student tidak dapat mengakses dashboard admin | Login student; akses halaman/API admin | Akun student | Akses ditolak dengan `403 Forbidden` | Not Run |
| 85 | Admin Dashboard | TC-ADM-003 | Memastikan HR tidak dapat mengakses dashboard admin | Login HR; akses halaman/API admin | Akun HR | Akses ditolak dengan `403 Forbidden` | Not Run |
| 86 | Admin User | TC-ADM-004 | Memastikan admin dapat melihat daftar user | Login admin; buka User Management | Akun admin | Daftar user tampil dengan total data | Not Run |
| 87 | Admin User | TC-ADM-005 | Memastikan admin dapat search user | Cari user berdasarkan email atau NIM | Keyword valid | User sesuai keyword tampil | Not Run |
| 88 | Admin User | TC-ADM-006 | Memastikan admin dapat filter user berdasarkan role | Pilih filter role | `STUDENT`, `HR`, atau `ADMIN` | Hanya user dengan role sesuai yang tampil | Not Run |
| 89 | Admin User | TC-ADM-007 | Memastikan admin dapat menonaktifkan user | Klik toggle active pada user aktif | User ID valid | Status user berubah menjadi inactive | Not Run |
| 90 | Admin User | TC-ADM-008 | Memastikan user inactive tidak dapat memakai sistem | Login atau akses sistem menggunakan akun inactive | Email/password user inactive | Sistem menolak login/akses | Not Run |
| 91 | Admin User | TC-ADM-009 | Memastikan delete user ID tidak ada ditangani | Admin menghapus user ID tidak valid | User ID tidak ada | Sistem menampilkan not found/error | Not Run |
| 92 | Admin Company | TC-ADM-010 | Memastikan admin dapat melihat daftar company | Login admin; buka Company Management | Akun admin | Daftar company tampil | Not Run |
| 93 | Admin Company | TC-ADM-011 | Memastikan admin dapat menghapus company | Admin hapus company test | Company ID valid | Company terhapus dan tidak tampil lagi | Not Run |
| 94 | Admin Company | TC-ADM-012 | Memastikan delete company ID tidak ada ditangani | Admin hapus company ID tidak valid | Company ID tidak ada | Sistem menampilkan not found/error | Not Run |
| 95 | Admin Opportunity | TC-ADM-013 | Memastikan admin dapat melihat semua lowongan | Login admin; buka daftar opportunities admin | Akun admin | Semua lowongan lintas company tampil | Not Run |
| 96 | Admin Opportunity | TC-ADM-014 | Memastikan admin dapat menghapus lowongan bermasalah | Admin delete opportunity test | Opportunity ID valid | Lowongan terhapus dari daftar publik | Not Run |
| 97 | Audit Log | TC-AUD-001 | Memastikan aksi penting tercatat di audit log | Lakukan aksi create/update/delete; buka audit log | Action HR/Admin valid | Log berisi actor, action, target, dan timestamp | Not Run |
| 98 | Audit Log | TC-AUD-002 | Memastikan audit log hanya dapat dibaca admin | Login student/HR; akses audit log | Akun non-admin | Akses ditolak dengan `403 Forbidden` | Not Run |
| 99 | Audit Log | TC-AUD-003 | Memastikan audit log tidak dapat diubah/dihapus | Coba update/delete audit log | Log ID valid | Sistem menolak perubahan karena audit log read-only | Not Run |
| 100 | CV Maker | TC-CV-001 | Memastikan student dapat membuat CV dari data profil | Login student; buka CV Maker; isi multi-step form; preview | Data profil, education, skill, project valid | Preview CV tampil sesuai data input | Not Run |
| 101 | CV Maker | TC-CV-002 | Memastikan export CV ke PDF berhasil | Selesaikan CV Maker; klik Export PDF | Data CV lengkap | File PDF berhasil dibuat/diunduh | Not Run |
| 102 | CV Maker | TC-CV-003 | Memastikan field wajib CV tervalidasi | Kosongkan field wajib; klik Next/Export | Field wajib kosong | Sistem menampilkan validasi dan tidak membuat PDF | Not Run |
| 103 | CV Maker | TC-CV-004 | Memastikan teks terlalu panjang tidak merusak layout CV | Isi bio/project dengan teks sangat panjang; preview CV | Bio/project panjang | Layout tetap rapi atau sistem membatasi input | Not Run |
| 104 | Enhanced Profile | TC-PROF-001 | Memastikan student dapat menambah skill | Buka Profil; tambah beberapa skill; simpan | `Python`, `React`, `Leadership` | Skill tersimpan dan tampil di profil | Not Run |
| 105 | Enhanced Profile | TC-PROF-002 | Memastikan student dapat menambah project/experience | Buka Profil; tambah project/experience; simpan | Judul, deskripsi, periode valid | Project/experience tampil di profil | Not Run |
| 106 | Enhanced Profile | TC-PROF-003 | Memastikan external link valid tersimpan | Tambahkan LinkedIn/GitHub/website valid | URL valid | Link tersimpan dan dapat diklik | Not Run |
| 107 | Enhanced Profile | TC-PROF-004 | Memastikan external link invalid ditolak | Isi URL tidak valid; simpan | `abc-not-url` | Sistem menampilkan validasi URL | Not Run |
| 108 | Settings Privacy | TC-SET-001 | Memastikan student dapat menyembunyikan profil dari HR | Buka Settings; ubah visibility ke hidden; simpan | Toggle hidden | Profil tidak muncul di pencarian/akses publik HR | Not Run |
| 109 | Settings Privacy | TC-SET-002 | Memastikan student dapat mengaktifkan open to opportunities | Buka Settings; aktifkan visibility/open status; simpan | Toggle open | Profil dapat ditemukan HR sesuai aturan platform | Not Run |
| 110 | Account Settings | TC-SET-003 | Memastikan password dapat diganti dengan password lama benar | Isi current password benar dan new password valid; simpan | Current password benar, new password valid | Password berubah; login dengan password baru berhasil | Not Run |
| 111 | Account Settings | TC-SET-004 | Memastikan password tidak berubah jika current password salah | Isi current password salah; simpan | Current password salah | Sistem menolak perubahan password | Not Run |
| 112 | Account Settings | TC-SET-005 | Memastikan update email valid berhasil | Ubah email ke email valid yang belum digunakan | Email baru valid | Email berubah dan dapat dipakai login | Not Run |
| 113 | Account Settings | TC-SET-006 | Memastikan update email duplikat ditolak | Ubah email ke email user lain | Email existing | Sistem menolak email duplikat | Not Run |
| 114 | Email Notification | TC-EMAIL-001 | Memastikan email terkirim saat status lamaran berubah | HR ubah status lamaran menjadi accepted/rejected | Status `ACCEPTED` atau `REJECTED` | Student menerima email/notifikasi sesuai template | Not Run |
| 115 | Email Notification | TC-EMAIL-002 | Memastikan preferensi email dihormati | Student matikan email notification; HR ubah status | Email notification off | Email tidak dikirim, status tetap berubah | Not Run |
| 116 | Email Notification | TC-EMAIL-003 | Memastikan kegagalan email tidak merusak status lamaran | Simulasikan SMTP gagal saat HR update status | SMTP unavailable | Status lamaran tetap konsisten, error tercatat | Not Run |
| 117 | Recommendation | TC-REC-001 | Memastikan rekomendasi sesuai profil student | Login student dengan major/GPA/skill lengkap; buka rekomendasi | Major, GPA, skills lengkap | Lowongan relevan tampil dan diprioritaskan | Not Run |
| 118 | Recommendation | TC-REC-002 | Memastikan profil tidak lengkap tetap ditangani | Login student tanpa skill/GPA; buka rekomendasi | Profil minim | Sistem menampilkan fallback lowongan umum | Not Run |
| 119 | Recommendation | TC-REC-003 | Memastikan rekomendasi tidak menampilkan lowongan inactive/expired | Buka rekomendasi dengan data lowongan expired/inactive | Lowongan inactive/expired | Lowongan tersebut tidak direkomendasikan | Not Run |
| 120 | Security | TC-SEC-001 | Memastikan response API tidak membocorkan password hash atau secret | Inspect response login/profile/user list | Request valid | Tidak ada `hashed_password`, secret key, atau data sensitif | Not Run |
| 121 | Security | TC-SEC-002 | Memastikan malformed JSON ditolak dengan aman | Kirim body JSON rusak ke endpoint create/update | JSON invalid | Sistem mengembalikan error validasi dan tidak crash | Not Run |
| 122 | Security | TC-SEC-003 | Memastikan role-based access control konsisten | Coba endpoint Student, HR, Admin menggunakan role yang salah | Token role tidak sesuai | Akses ditolak dengan `403 Forbidden` | Not Run |
| 123 | Security | TC-SEC-004 | Memastikan object ownership aman | User/HR mencoba akses resource milik user/company lain | ID resource milik pihak lain | Akses ditolak atau data tidak ditemukan | Not Run |
| 124 | Security | TC-SEC-005 | Memastikan input ID negatif tidak diterima | Akses endpoint detail/update/delete dengan ID negatif | `-1` | Sistem menampilkan validasi/not found dan tidak crash | Not Run |
| 125 | Security | TC-SEC-006 | Memastikan file upload tidak menerima content-type palsu | Upload file executable dengan ekstensi gambar/PDF | File berbahaya/disguised | Sistem menolak atau tidak mengeksekusi file; file tidak membahayakan sistem | Not Run |
