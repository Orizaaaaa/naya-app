'use client'

import InputForm from "@/components/elements/input/InputForm";

import { useState } from "react";
import { FaEyeSlash } from "react-icons/fa";

import Link from "next/link";
import { IoIosArrowBack } from "react-icons/io";
import ButtonPrimary from "@/components/elements/buttonPrimary";
import { AutocompleteItem, DatePicker, Spinner } from "@heroui/react";
import { IoEye } from "react-icons/io5";
import { useRouter } from "next/navigation";
import { formatDate } from "@/utils/helper";
import { parseDate } from '@internationalized/date'
import DropdownCustom from "@/components/elements/dropdown/Dropdown";
// Pastikan ini ada

const Register = () => {
    const router = useRouter();
    const [showPassword, setShowPassword] = useState(true);
    const [showConfirmPassword, setShowConfirmPassword] = useState(true);
    const [typePassword, setTypePassword] = useState("password");
    const [typeConfirmPassword, setTypeConfirmPassword] = useState("password");
    const [loading, setLoading] = useState(false);
    const dateNow = new Date();
    const [form, setForm]: any = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        role: 'user',
        number_phone: '',
        nik: '',
        tempat_lahir: '',
        tanggal_lahir: parseDate(formatDate(dateNow)),
        jenis_kelamin: '',
        alamat: '',
        kelas: '',
    });

    const [errorMsg, setErrorMsg] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        image: '',
        role: '',
        number_phone: '',
        nik: '',
        tempat_lahir: '',
        tanggal_lahir: '',
        jenis_kelamin: '',
        alamat: '',
        kelas: '',
    });

    const togglePassword = () => {
        setShowPassword(!showPassword);
        setTypePassword(showPassword ? "text" : "password");
    };

    const toggleConfirmPassword = () => {
        setShowConfirmPassword(!showConfirmPassword);
        setTypeConfirmPassword(showConfirmPassword ? "text" : "password");
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;

        if (name === 'number_phone') {
            let numericValue = value.replace(/\D/g, '');
            if (numericValue.startsWith('08')) {
                numericValue = '628' + numericValue.slice(2);
            }

            if (numericValue.length > 15) {
                setErrorMsg((prev) => ({
                    ...prev,
                    number_phone: '*Nomor tidak boleh lebih dari 15 angka',
                }));
                return;
            } else {
                setErrorMsg((prev) => ({ ...prev, number_phone: '' }));
            }

            setForm({ ...form, [name]: numericValue });
            return;
        }

        if (name === 'nik') {
            const numericValue = value.replace(/\D/g, '');
            if (numericValue.length > 16) {
                setErrorMsg((prev) => ({
                    ...prev,
                    nik: '*NIK tidak boleh lebih dari 16 digit',
                }));
                return;
            } else {
                setErrorMsg((prev) => ({ ...prev, nik: '' }));
            }

            setForm({ ...form, [name]: numericValue });
            return;
        }

        setForm({ ...form, [name]: value });
    };

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const newErrorMsg = {
            name: '', email: '', password: '', confirmPassword: '', image: '', role: '',
            number_phone: '', nik: '', tempat_lahir: '', tanggal_lahir: '',
            jenis_kelamin: '', alamat: '', kelas: ''
        };
        let valid = true;

        const nameRegex = /^[A-Za-z\s\-\_\'\.\,\&\(\)]{1,100}$/;
        const emailRegex = /^[\w\.-]+@[a-zA-Z\d\.-]+\.[a-zA-Z]{2,}$/;
        const passwordRegex = /^[A-Za-z0-9]+$/;
        const numberRegex = /^[0-9]+$/;
        const phoneRegex = /^628[0-9]{8,}$/;

        if (!form.name || !nameRegex.test(form.name)) {
            newErrorMsg.name = '*Masukkan nama yang valid';
            valid = false;
        }

        if (!form.email || !emailRegex.test(form.email)) {
            newErrorMsg.email = '*Masukkan email yang valid';
            valid = false;
        }

        if (!form.password || !passwordRegex.test(form.password) || form.password.length < 8) {
            newErrorMsg.password = '*Password harus 8 karakter atau lebih';
            valid = false;
        }

        if (form.password !== form.confirmPassword) {
            newErrorMsg.confirmPassword = '*Password dan Konfirmasi tidak sama';
            valid = false;
        }

        if (!form.nik || !numberRegex.test(form.nik) || form.nik.length !== 16) {
            newErrorMsg.nik = '*NIK harus 16 digit angka';
            valid = false;
        }

        if (!form.number_phone || !phoneRegex.test(form.number_phone)) {
            newErrorMsg.number_phone = '*No HP harus diawali 628 dan minimal 10 digit';
            valid = false;
        }

        if (!form.tempat_lahir) {
            newErrorMsg.tempat_lahir = '*Tempat lahir wajib diisi';
            valid = false;
        }

        if (!form.tanggal_lahir) {
            newErrorMsg.tanggal_lahir = '*Tanggal lahir wajib diisi';
            valid = false;
        }

        if (!form.jenis_kelamin) {
            newErrorMsg.jenis_kelamin = '*Jenis kelamin wajib dipilih';
            valid = false;
        }

        if (!form.alamat) {
            newErrorMsg.alamat = '*Alamat wajib diisi';
            valid = false;
        }

        if (!form.kelas) {
            newErrorMsg.kelas = '*Kelas wajib diisi';
            valid = false;
        }

        setErrorMsg(newErrorMsg);

        if (!valid) {
            setLoading(false);
            return;
        }

        console.log('Data valid:', form);
        setLoading(false);
    };

    const dataStatus = [
        { label: "Sedang Berjalan", value: "Sedang Berjalan" },
        { label: "Berhenti Sementara", value: "Berhenti Sementara" },
        { label: "Selesai", value: "Selesai" },
    ]

    const onSelectionChange = (key: string) => {
        setForm({
            ...form,         // Salin semua properti dari objek `form`
            status: key      // Ganti nilai `status` dengan `key`
        });
    };
    return (
        <div className="register bg-black min-h-screen">
            <div className="container mx-auto">
                <div className="flex items-center py-3 cursor-pointer" onClick={() => router.back()}>
                    <IoIosArrowBack size={20} color='white' />
                    <p className='text-white'>Kembali</p>
                </div>
            </div>

            <div className="container mx-auto flex flex-col justify-center items-center w-full">


                <form className='p-6 bg-[#e9e9e9] rounded-lg m-3 w-[350px] sm:w-[400px] md:w-[450px] lg:w-[500px]' onSubmit={handleRegister}>
                    <InputForm className='bg-slate-300' errorMsg={errorMsg.name} placeholder='Masukkan Nama' type='text' htmlFor='name' value={form.name} onChange={handleChange} />
                    <InputForm className='bg-slate-300' errorMsg={errorMsg.nik} placeholder='Masukkan NIK' type='text' htmlFor='nik' value={form.nik} onChange={handleChange} />
                    <InputForm className='bg-slate-300' errorMsg={errorMsg.tempat_lahir} placeholder='Tempat Lahir' type='text' htmlFor='tempat_lahir' value={form.tempat_lahir} onChange={handleChange} />


                    <div className="flex gap-3">
                        <div className="w-full">
                            <h1 className="text-sm" >Jenis Kelamin</h1>
                            <DropdownCustom clearButton={false} defaultItems={dataStatus} onSelect={(e: any) => onSelectionChange(e)}>
                                {(item: any) => <AutocompleteItem key={item.value}>{item.label}</AutocompleteItem>}
                            </DropdownCustom>
                        </div>
                        <div className="">
                            <h1 className="text-sm" >Kelas</h1>
                            <InputForm className='bg-slate-300 ' errorMsg={errorMsg.kelas} placeholder='Kelas' type='text' htmlFor='kelas' value={form.kelas} onChange={handleChange} />
                        </div>

                    </div>




                    <div className="date w-full my-2">
                        <DatePicker
                            label='Tanggal Lahir'
                            showMonthAndYearPickers
                            aria-label='date'
                            value={form.tanggal_lahir ?? new Date()} // provide a default value if form.tanggal_lahir is null
                            variant={'bordered'}
                            onChange={(e) => setForm({ ...form, tanggal_lahir: e })}
                        />

                    </div>

                    <InputForm className='bg-slate-300' errorMsg={errorMsg.alamat} placeholder='Alamat Lengkap' type='text' htmlFor='alamat' value={form.alamat} onChange={handleChange} />

                    <div className="flex gap-3">
                        <InputForm className='bg-slate-300' errorMsg={errorMsg.email} placeholder='Masukkan Email' type='email' htmlFor='email' value={form.email} onChange={handleChange} />
                        <InputForm className='bg-slate-300' errorMsg={errorMsg.number_phone} placeholder='Masukkan No HP' type='text' htmlFor='number_phone' value={form.number_phone} onChange={handleChange} />
                    </div>

                    <div className="relative">
                        <button onClick={togglePassword} type='button' className="absolute right-0 top-1/2 -translate-y-1/2 pe-4">
                            {showPassword ? <FaEyeSlash size={20} color='#636363' /> : <IoEye size={20} color='#636363' />}
                        </button>
                        <InputForm className='bg-slate-300' errorMsg={errorMsg.password} htmlFor="password" onChange={handleChange} type={typePassword} value={form.password} placeholder="Masukkan Kata Sandi" />
                    </div>

                    <div className="relative mt-1">
                        <button onClick={toggleConfirmPassword} type='button' className="absolute right-0 top-1/2 -translate-y-1/2 pe-4">
                            {showConfirmPassword ? <FaEyeSlash size={20} color='#636363' /> : <IoEye size={20} color='#636363' />}
                        </button>
                        <InputForm className='bg-slate-300' errorMsg={errorMsg.confirmPassword} htmlFor="confirmPassword" onChange={handleChange} type={typeConfirmPassword} value={form.confirmPassword} placeholder="Konfirmasi Kata Sandi" />
                    </div>

                    <ButtonPrimary typeButon="submit" className="rounded-lg w-full mb-3 font-medium py-2 flex justify-center items-center bg-primary">
                        {loading ? <Spinner className="w-5 h-5" size="sm" color="white" /> : 'Daftar'}
                    </ButtonPrimary>
                    <p className='text-sm'>Sudah punya akun? <Link href="/login" className='text-primary font-medium'>Masuk</Link></p>
                </form>
            </div>
        </div>

    );
};

export default Register;
