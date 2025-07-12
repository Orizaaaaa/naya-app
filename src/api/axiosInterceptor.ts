import axios from 'axios';

export const axiosInterceptor = axios.create({
    baseURL: 'https://naya-epappers.vercel.app',
    // timeout: 5000,
});

// Selalu menggunakan token terbaru
axiosInterceptor.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers['Authorization'] = `${token}`;
            console.log('token tolol', token);

        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Interceptor untuk menangani error response
axiosInterceptor.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        const { message, success } = error.response?.data || {};

        // Cek apakah message mengandung pesan kadaluarsa
        if (message === "Your Url is expired please try again letter!" && success === false && message === "Please login to continue") {
            // Hapus token jika diperlukan
            localStorage.clear();
            // Arahkan ke halaman login menggunakan window.location.href
            window.location.href = '/login';
            document.cookie = 'token=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/';
            document.cookie = 'role=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/';
        }

        return Promise.reject(error);
    }
);
