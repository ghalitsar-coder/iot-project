# Cara Menggunakan Toast dengan Sonner

Proyek ini sekarang menggunakan **Sonner** untuk toast notifications, sesuai rekomendasi dari shadcn/ui.

## Import

```typescript
import { toast } from "@/hooks/use-toast";
```

## Penggunaan Dasar

### Success Toast

```typescript
toast.success("Data berhasil disimpan!");
```

### Error Toast

```typescript
toast.error("Terjadi kesalahan saat menyimpan data");
```

### Info Toast

```typescript
toast.info("Informasi penting untuk Anda");
```

### Warning Toast

```typescript
toast.warning("Peringatan: Stok hampir habis");
```

### Loading Toast

```typescript
toast.loading("Memproses data...");
```

## Penggunaan dengan Deskripsi

```typescript
toast.success("Berhasil!", {
  description: "Data Anda telah disimpan dengan aman",
});
```

## Toast dengan Action Button

```typescript
toast("Event has been created", {
  action: {
    label: "Undo",
    onClick: () => console.log("Undo"),
  },
});
```

## Promise Toast (untuk async operations)

```typescript
const promise = () => new Promise((resolve) => setTimeout(resolve, 2000));

toast.promise(promise, {
  loading: "Memuat...",
  success: "Data berhasil dimuat!",
  error: "Error ketika memuat data",
});
```

## Custom Duration

```typescript
toast.success("Pesan ini akan hilang dalam 5 detik", {
  duration: 5000,
});
```

## Dismiss Toast

```typescript
const toastId = toast.success("Pesan ini bisa ditutup");

// Tutup toast secara manual
toast.dismiss(toastId);
```

## Contoh Penggunaan di Component

```typescript
"use client";

import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";

export function MyComponent() {
  const handleSave = async () => {
    try {
      // Tampilkan loading toast
      const loadingToast = toast.loading("Menyimpan data...");

      // Lakukan operasi async
      await saveData();

      // Tutup loading toast dan tampilkan success
      toast.dismiss(loadingToast);
      toast.success("Data berhasil disimpan!");
    } catch (error) {
      toast.error("Gagal menyimpan data", {
        description: error.message,
      });
    }
  };

  return <Button onClick={handleSave}>Simpan</Button>;
}
```

## Migrasi dari Toast Lama

### Sebelum (shadcn toast):

```typescript
const { toast } = useToast();

toast({
  title: "Success",
  description: "Your data has been saved",
  variant: "default",
});
```

### Sesudah (Sonner):

```typescript
import { toast } from "@/hooks/use-toast";

toast.success("Success", {
  description: "Your data has been saved",
});
```

## Keunggulan Sonner

1. **Lebih Simple**: API yang lebih sederhana dan intuitif
2. **Better UX**: Animasi yang lebih smooth dan modern
3. **Built-in Types**: Success, error, warning, info, loading
4. **Promise Support**: Mudah untuk handle async operations
5. **Lightweight**: Lebih ringan dari toast sebelumnya
6. **Accessibility**: Lebih accessible secara default

## Dokumentasi Lengkap

Untuk dokumentasi lengkap, kunjungi: https://sonner.emilkowal.ski/
