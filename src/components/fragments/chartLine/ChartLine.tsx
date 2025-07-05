'use client'

import { ApexOptions } from "apexcharts";
import React, { useEffect, useState } from "react";
const ReactApexChart = dynamic(() => import("react-apexcharts"), { ssr: false });
import dynamic from 'next/dynamic';
import useSWR from "swr";
import { url } from "@/api/auth";
import { fetcher } from "@/api/fetcher";
import { getDataCart } from "@/api/transaction";



const options: ApexOptions = {
    legend: {
        show: false,
        position: "top",
        horizontalAlign: "left",
    },
    colors: ["#80CAEE", "red"],
    chart: {
        fontFamily: "Satoshi, sans-serif",
        height: 395,
        type: "area",
        dropShadow: {
            enabled: true,
            color: "#623CEA14",
            top: 10,
            blur: 4,
            left: 0,
            opacity: 0.1,
        },

        toolbar: {
            show: false,
        },
    },
    responsive: [
        {
            breakpoint: 1024,
            options: {
                chart: {
                    height: 300,
                },
            },
        },
        {
            breakpoint: 1366,
            options: {
                chart: {
                    height: 350,
                },
            },
        },
    ],
    stroke: {
        width: [2, 2],
        curve: "straight",
    },
    // labels: {
    //   show: false,
    //   position: "top",
    // },
    grid: {
        xaxis: {
            lines: {
                show: true,
            },
        },
        yaxis: {
            lines: {
                show: true,
            },
        },
    },
    dataLabels: {
        enabled: false,
    },
    markers: {
        size: 4,
        colors: "#fff",
        strokeColors: ["#80CAEE", "red"],
        strokeWidth: 3,
        strokeOpacity: 0.9,
        strokeDashArray: 0,
        fillOpacity: 1,
        discrete: [],
        hover: {
            size: undefined,
            sizeOffset: 5,
        },
    },
    xaxis: {
        type: "category",
        categories: [
            "Sep",
            "Oct",
            "Nov",
            "Dec",
            "Jan",
            "Feb",
            "Mar",
            "Apr",
            "May",
            "Jun",
            "Jul",
            "Aug",
        ],
        axisBorder: {
            show: false,
        },
        axisTicks: {
            show: false,
        },
    },
    yaxis: {
        title: {
            style: {
                fontSize: "0px",
            },
        },
        min: 0,
        max: undefined,
    },
};

interface ChartOneState {
    series: {
        name: string;
        data: number[];
    }[];
}

const ChartLine: React.FC = () => {
    const [state, setState] = useState<ChartOneState>({
        series: [
            {
                name: "Pendapatan",
                data: new Array(12).fill(0), // 12 bulan dengan nilai default 0
            },
            {
                name: "Pengeluaran",
                data: new Array(12).fill(0), // 12 bulan dengan nilai default 0
            },
        ],
    });

    useEffect(() => {
        getDataCart((data: any) => {
            console.log('nih bang', data);

            // Inisialisasi data dengan 12 bulan berisi 0
            const defaultData = new Array(12).fill(0);

            // Map data dari API ke format yang diinginkan
            const mappedData = data?.dataCart?.map((item: any) => {
                // Salin data default
                const dataArray = [...defaultData];
                // Isi data yang ada dari API
                item.data.forEach((value: number, index: number) => {
                    dataArray[index] = value;
                });
                return {
                    name: item.name,
                    data: dataArray,
                };
            });

            setState({
                series: mappedData
            });
        });
    }, []);



    const handleReset = () => {
        setState((prevState) => ({
            ...prevState,
        }));
    };
    handleReset;



    // Mendapatkan tanggal hari ini
    const today = new Date();

    // Mendapatkan awal tahun
    const startOfYear = new Date(today.getFullYear(), 0, 1);

    // Mendapatkan akhir tahun
    const endOfYear = new Date(today.getFullYear(), 11, 31);

    // Fungsi untuk memformat tanggal menjadi dd.mm.yyyy
    const formatDate = (date: Date): string => {
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return `${day}.${month}.${year}`;
    };

    return (
        <div className="col-span-12 mt-5 rounded-lg bg-white px-5 pb-5 pt-7.5 shadow-defaultsm:px-7.5 xl:col-span-8 ">
            <div className="flex flex-wrap items-start justify-between gap-3 sm:flex-nowrap">
                <div className="flex w-full flex-wrap gap-3 sm:gap-5">
                    <div className="flex min-w-47.5">
                        <span className="mr-2 mt-1 flex h-4 w-full max-w-4 items-center justify-center rounded-full border border-[#80CAEE]">
                            <span className="block h-2.5 w-full max-w-2.5 rounded-full bg-[#80CAEE]"></span>
                        </span>
                        <div className="w-full">
                            <p className="font-semibold text-primary">Total Pendapatan</p>
                            <p className="text-sm font-medium"> {formatDate(startOfYear)} - {formatDate(endOfYear)}</p>
                        </div>
                    </div>
                    <div className="flex min-w-47.5">
                        <span className="mr-2 mt-1 flex h-4 w-full max-w-4 items-center justify-center rounded-full border border-red">
                            <span className="block h-2.5 w-full max-w-2.5 rounded-full bg-red"></span>
                        </span>
                        <div className="w-full">
                            <p className="font-semibold text-red">Total Pengeluaran</p>
                            <p className="text-sm font-medium"> {formatDate(startOfYear)} - {formatDate(endOfYear)}</p>
                        </div>
                    </div>
                </div>
                <div className="flex w-full max-w-45 justify-end">
                    <div className="inline-flex items-center rounded-md bg-whiter p-1.5 dark:bg-meta-4">
                        <button className="rounded bg-white px-3 py-1 text-xs font-medium text-black shadow-card hover:bg-white hover:shadow-card dark:bg-boxdark dark:text-white dark:hover:bg-boxdark">
                            Day
                        </button>
                        <button className="rounded px-3 py-1 text-xs font-medium text-black hover:bg-white hover:shadow-card dark:text-white dark:hover:bg-boxdark">
                            Week
                        </button>
                        <button className="rounded px-3 py-1 text-xs font-medium text-black hover:bg-white hover:shadow-card dark:text-white dark:hover:bg-boxdark">
                            Month
                        </button>
                    </div>
                </div>
            </div>

            <div>
                <div id="chartOne" className="-ml-5">
                    <ReactApexChart
                        options={options}
                        series={state.series}
                        type="area"
                        height={350}
                        width={"100%"}
                    />
                </div>
            </div>
        </div>
    );
};

export default ChartLine;
