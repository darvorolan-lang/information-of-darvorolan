# Contoh Write-up: Login Bypass via SQL Injection

> Ini contoh format write-up. Hapus file ini lalu tulis punyamu sendiri.

## Ringkasan

Form login aplikasi ini memasukkan input username langsung ke query SQL tanpa sanitasi, sehingga bisa dimanipulasi.

## Recon

Mulai dengan memetakan layanan yang berjalan:

```bash
nmap -sV -p- 10.10.10.10
```

Halaman `/login` menerima POST dengan field `username` dan `password`.

## Eksploitasi

Query di belakang layar kira-kira seperti ini:

```sql
SELECT * FROM users WHERE username = '$user' AND password = '$pass';
```

Dengan memasukkan payload berikut pada field username, bagian password terkomentari:

```sql
' OR 1=1 -- -
```

## Pelajaran

- Gunakan *prepared statement* atau parameterized query.
- Validasi dan batasi panjang serta format input.
- Jangan tampilkan pesan error database ke pengguna.

## Referensi

- [OWASP: SQL Injection](https://owasp.org/www-community/attacks/SQL_Injection)
