// import { NextRequest, NextResponse } from 'next/server';

// // Middleware untuk mengecek role dan token
// export function middleware(req: NextRequest) {
//     const token = req.cookies.get('token');
//     const roleCookie = req.cookies.get('role'); // Ambil role dari cookie
//     const role = roleCookie ? roleCookie.value : undefined; // Ambil value dari cookie jika ada

//     // Jika user mengakses halaman login atau root ("/"), abaikan middleware
//     if (req.nextUrl.pathname === '/login' || req.nextUrl.pathname === '/') {
//         return NextResponse.next();
//     }

//     // Jika token tidak ada, redirect ke halaman login
//     if (!token) {
//         const url = req.nextUrl.clone();
//         url.pathname = '/login';
//         return NextResponse.redirect(url);
//     }

//     // Logika untuk cek role dan route yang diakses
//     const urlPath = req.nextUrl.pathname;

//     // Cek jika role 'officer' mengakses dashboard-officer
//     if (urlPath.startsWith('/dashboard-officer') && role !== 'admin') {
//         const url = req.nextUrl.clone();
//         url.pathname = '/login';
//         return NextResponse.redirect(url);
//     }

//     // Cek jika role 'superadmin' mengakses dashboard-super-admin
//     if (urlPath.startsWith('/dashboard-super-admin') && role !== 'superadmin') {
//         const url = req.nextUrl.clone();
//         url.pathname = '/login';
//         return NextResponse.redirect(url);
//     }

//     // Cek jika role 'user' mengakses dashboard-user
//     if (urlPath.startsWith('/dashboard-user') && role !== 'user') {
//         const url = req.nextUrl.clone();
//         url.pathname = '/login';
//         return NextResponse.redirect(url);
//     }

//     // Lanjut ke halaman yang di-request jika semuanya sesuai
//     return NextResponse.next();
// }

// // Define paths where the middleware should be applied
// export const config = {
//     matcher: ['/dashboard-officer/:path*', '/dashboard-super-admin/:path*', '/dashboard-user/:path*'],
// };
