
export const formatDate = (tanggal: any) => {
    if (!tanggal) {
        console.error("Tanggal tidak ada:", tanggal);
        return "Invalid date";  // Mengembalikan nilai default jika tanggal tidak ada
    }

    // Pastikan bahwa 'tanggal' merupakan string atau objek Date yang valid
    const date = new Date(tanggal);

    // Cek apakah objek Date valid
    if (isNaN(date.getTime())) {
        console.error("Format tanggal tidak valid:", tanggal);
        return "Invalid date";  // Mengembalikan nilai default jika format tanggal tidak valid
    }

    const tahun = date.getFullYear();
    const bulan = String(date.getMonth() + 1).padStart(2, '0'); // Bulan dimulai dari 0, jadi tambahkan 1
    const hari = String(date.getDate()).padStart(2, '0');

    return `${tahun}-${bulan}-${hari}`;
};

export function formatCatrgory(text: string, maxLength: number = 34): string {
    if (text.length > maxLength) {
        return text.slice(0, maxLength) + "...";
    }
    return text;
}

export const changeTypeAccount = (type: number): string => {
    switch (type) {
        case 1:
            return 'Aset';
        case 2:
            return 'Kewajiban';
        case 3:
            return 'Ekuitas';
        case 4:
            return 'Pendapatan';
        case 5:
            return 'Beban';
        default:
            return 'Tipe tidak dikenal'; // Mengembalikan nilai default jika tipe tidak ditemukan
    }
};


export function formatRupiah(amount: number | undefined): string {
    if (amount === undefined) {
        return 'Rp 0';
    }
    return 'Rp ' + amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}


export function capitalizeWords(str: string): string {
    return str.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ');
}


export const formatDateStr = (dateObj?: { month: number, day: number, year: number }) =>
    dateObj ? `${dateObj.month.toString().padStart(2, '0')}-${dateObj.day.toString().padStart(2, '0')}-${dateObj.year.toString().padStart(4, '0')}` : '';

export const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1);
};

const dateNow = new Date();
export const dateFirst = getFirstDayOfMonth(dateNow);

export function formatTanggalToIndo(dateString: string): string {
    const date = new Date(dateString);

    const hari = [
        "Minggu", "Senin", "Selasa", "Rabu",
        "Kamis", "Jumat", "Sabtu"
    ];

    const hariNama = hari[date.getDay()];
    const tanggal = String(date.getDate()).padStart(2, '0');
    const bulan = String(date.getMonth() + 1).padStart(2, '0'); // getMonth() 0-11
    const tahun = date.getFullYear();

    return `${hariNama}, ${tanggal}, ${bulan}, ${tahun}`;
}


export function formatTanggalIndoSecond(dateString: string): string {
    const date = new Date(dateString);
    const options: Intl.DateTimeFormatOptions = {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
    };

    // Format dengan locale Indonesia
    return date.toLocaleDateString('id-ID', options);
}


export function truncateText(text: string, maxLength: number, suffix: string = '...'): string {
    if (!text) return '';

    if (text.length > maxLength) {
        return text.slice(0, maxLength) + suffix;
    }

    return text;
}