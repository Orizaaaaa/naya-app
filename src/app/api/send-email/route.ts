// src/app/api/send-email/route.ts

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
const nodemailer = require('nodemailer');

export async function POST(req: NextRequest) {
    const { to, subject, text } = await req.json();

    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
    });

    const mailOptions = {
        from: process.env.EMAIL_USER,
        to,
        subject,
        text,
    };

    try {
        await transporter.sendMail(mailOptions);
        return NextResponse.json({ message: 'Email terkirim' }, { status: 200 });
    } catch (error) {
        console.error('Gagal mengirim email:', error);
        return NextResponse.json({ message: 'Gagal mengirim email' }, { status: 500 });
    }
}
