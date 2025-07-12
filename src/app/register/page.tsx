'use client'

import InputForm from "@/components/elements/input/InputForm";

import { useState } from "react";
import { FaEyeSlash } from "react-icons/fa";

import Link from "next/link";
import { IoIosArrowBack } from "react-icons/io";
import ButtonPrimary from "@/components/elements/buttonPrimary";
import { Autocomplete, AutocompleteItem, DatePicker, Spinner } from "@heroui/react";
import { IoEye } from "react-icons/io5";
import { useRouter } from "next/navigation";
import { formatDate, formatDateStr } from "@/utils/helper";
import { parseDate } from '@internationalized/date'
import { address } from "framer-motion/client";
import DropdownCustom from "@/components/dropdown/dropdownCustom";
import { registerUser } from "@/api/auth";
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
        phone: '',
        nis: '',
        nisn: '',
        address: '',
        place_of_birth: '',
        birthdate: parseDate(formatDate(dateNow)),
        gender: '',
        image: '',
        class_name: '',
    });

    const [errorMsg, setErrorMsg] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        image: '',
        role: '',
        phone: '',
        place_of_birth: '',
        birthdate: '',
        gender: '',
        class_name: '',
        nis: '',
        nisn: '',
        address: '',
        responErrorApi: '',
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

        if (name === 'phone') {
            let numericValue = value.replace(/\D/g, '');
            if (numericValue.startsWith('08')) {
                numericValue = '628' + numericValue.slice(2);
            }

            if (numericValue.length > 15) {
                setErrorMsg((prev) => ({
                    ...prev,
                    phone: '*Nomor tidak boleh lebih dari 15 angka',
                }));
                return;
            } else {
                setErrorMsg((prev) => ({ ...prev, phone: '' }));
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
            phone: '', place_of_birth: '', birthdate: '',
            gender: '', class_name: '', nis: '', nisn: '', address: '', responErrorApi: ''
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

        if (!form.phone || !phoneRegex.test(form.phone)) {
            newErrorMsg.phone = '*No HP harus diawali 628 dan minimal 10 digit';
            valid = false;
        }

        if (!form.place_of_birth) {
            newErrorMsg.place_of_birth = '*Tempat lahir wajib diisi';
            valid = false;
        }

        if (!form.birthdate) {
            newErrorMsg.birthdate = '*Tanggal lahir wajib diisi';
            valid = false;
        }

        if (!form.gender) {
            newErrorMsg.gender = '*Jenis kelamin wajib dipilih';
            valid = false;
        }

        if (!form.place_of_birth) {
            newErrorMsg.place_of_birth = '*Tempat lahir wajib diisi';
            valid = false;
        }
        if (!form.address) {
            newErrorMsg.address = '*Alamat wajib diisi';
            valid = false;
        }

        if (!form.class_name) {
            newErrorMsg.class_name = '*Nama kelas wajib diisi';
            valid = false;
        }

        setErrorMsg(newErrorMsg);

        if (!valid) {
            setLoading(false);
            return;
        }

        // Jika lolos validasi

        const { confirmPassword, ...dataWithoutConfirmPassword } = form;

        const data = {
            ...dataWithoutConfirmPassword,
            birthdate: formatDateStr(form.birthdate), // pastikan penamaan tepat
        };

        console.log('data boss', data);


        registerUser(data, (status: boolean, res: any) => {
            if (res) {
                console.log(res);
            }
            if (status) {
                router.push('/');
            } else {
                setErrorMsg((prev) => ({ ...prev, responErrorApi: 'Email atau Password salah' }));
            }
            setLoading(false);
        });
    };

    const dataStatus = [
        { key: "laki-laki", label: "Laki-laki", value: "Laki-laki" },
        { key: "perempuan", label: "Perempuan", value: "Perempuan" },
    ]

    const onSelectionChange = (key: string) => {
        setForm({
            ...form,
            gender: key
        });
    };

    console.log(formatDateStr(form.birthdate));
    console.log(form);
    console.log(loading);


    return (
        <div className="register bg-black min-h-screen flex flex-col"> {/* Added flex-col */}
            <div className="container mx-auto">
                <div className="flex items-center py-3 cursor-pointer" onClick={() => router.back()}>
                    <IoIosArrowBack size={20} color='white' />
                    <p className='text-white'>Kembali</p>
                </div>
            </div>

            {/* Added flex, justify-center, items-center to center the form */}
            <div className="container mx-auto flex flex-grow justify-center items-center w-full">

                <form className='p-6 bg-[#e9e9e9] rounded-lg m-3 w-[350px] sm:w-[400px] md:w-[450px] lg:w-[500px]' onSubmit={handleRegister}>
                    <InputForm className='bg-slate-300' errorMsg={errorMsg.name} placeholder='Masukkan Nama' type='text' htmlFor='name' value={form.name} onChange={handleChange} />
                    <div className="flex gap-4">
                        <InputForm className='bg-slate-300' errorMsg={errorMsg.nisn} placeholder='Masukkan NISN' type='text' htmlFor='nisn' value={form.nisn} onChange={handleChange} />
                        <InputForm className='bg-slate-300' errorMsg={errorMsg.nis} placeholder='Masukkan NIS' type='text' htmlFor='nis' value={form.nis} onChange={handleChange} />
                    </div>

                    <InputForm className='bg-slate-300' errorMsg={errorMsg.place_of_birth} placeholder='Tempat Lahir' type='text' htmlFor='place_of_birth' value={form.place_of_birth} onChange={handleChange} />


                    <div className="flex gap-3">
                        <div className="w-full">
                            <h1 className="text-sm text-gray-400" >Jenis Kelamin</h1>

                            <Autocomplete className="max-w-xs" onSelectionChange={(e: any) => onSelectionChange(e)}>
                                {dataStatus.map((animal) => (
                                    <AutocompleteItem key={animal.key}>{animal.label}</AutocompleteItem>
                                ))}
                            </Autocomplete>

                            {/* <DropdownCustom clearButton={false} defaultItems={dataStatus} onSelect={(e: any) => onSelectionChange(e)}>
                                {(item: any) => <AutocompleteItem key={item.value}>{item.label}</AutocompleteItem>}
                            </DropdownCustom> */}
                            {errorMsg.gender && <p className="text-red-500 text-xs mt-1">{errorMsg.gender}</p>}
                        </div>
                        <div className="w-full"> {/* Changed to w-full for better responsiveness */}
                            <h1 className="text-sm text-gray-400" >Nama Kelas</h1>
                            <InputForm className='bg-slate-300 ' errorMsg={errorMsg.class_name} type='text' htmlFor='class_name' value={form.class_name} onChange={handleChange} />
                        </div>

                    </div>




                    <div className="date w-full my-2">
                        <DatePicker
                            label='Tanggal Lahir'
                            showMonthAndYearPickers
                            aria-label='date'
                            value={form.birthdate}
                            variant={'bordered'}
                            onChange={(e) => setForm({ ...form, birthdate: e })}
                        />
                        {errorMsg.birthdate && <p className="text-red-500 text-xs mt-1">{errorMsg.birthdate}</p>}
                    </div>

                    <InputForm className='bg-slate-300' errorMsg={errorMsg.address} placeholder='Alamat Lengkap' type='text' htmlFor='address' value={form.address} onChange={handleChange} />

                    <div className="flex gap-3">
                        <InputForm className='bg-slate-300' errorMsg={errorMsg.email} placeholder='Masukkan Email' type='email' htmlFor='email' value={form.email} onChange={handleChange} />
                        <InputForm className='bg-slate-300' errorMsg={errorMsg.phone} placeholder='Masukkan No HP' type='text' htmlFor='phone' value={form.phone} onChange={handleChange} />
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

                    <ButtonPrimary disabled={loading} typeButon="submit" className="rounded-lg cursor-pointer w-full mb-3 font-medium py-2 flex justify-center items-center
                     bg-primary" >
                        {loading ? <Spinner color="white" /> : 'Daftar'}
                    </ButtonPrimary>
                    {errorMsg.responErrorApi && <p className="text-red-800 text-xs mt-1">{errorMsg.responErrorApi}</p>}
                    <p className='text-sm'>Sudah punya akun? <Link href="/" className='text-primary font-medium'>Masuk</Link></p>
                </form>
            </div>
        </div>

    );
};

export default Register;
