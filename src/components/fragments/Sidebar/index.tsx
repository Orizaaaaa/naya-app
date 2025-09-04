"use client";

import React, { useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import NavigationList from "../NavigationList/NavigationList";
import { RxDashboard } from "react-icons/rx";
import { logo, realLogo } from "@/app/image";
import Image from "next/image";
import { IoPricetags, IoReceiptOutline, IoStorefront } from "react-icons/io5";
import { FaUserGear } from "react-icons/fa6";
import ButtonSecondary from "@/components/elements/buttonSecondary";
import { LuBookDown, LuBookPlus } from "react-icons/lu";
import { MdDashboard, MdOutlineLibraryBooks, MdOutlineMoveToInbox } from "react-icons/md";
import { RiBook2Line } from "react-icons/ri";
import { TbMoneybag } from "react-icons/tb";
import { HiOutlineArchiveBox } from "react-icons/hi2";
import { SiGitbook } from "react-icons/si";
import { BsPersonFillGear } from "react-icons/bs";

interface SidebarProps {
  sidebarOpen: boolean;
  setSidebarOpen: (arg: boolean) => void;
}

const Sidebar = ({ sidebarOpen, setSidebarOpen }: SidebarProps) => {
  const pathname = usePathname();

  const trigger = useRef<any>(null);
  const sidebar = useRef<any>(null);

  let storedSidebarExpanded = "true";

  const [sidebarExpanded, setSidebarExpanded] = useState(
    storedSidebarExpanded === null ? false : storedSidebarExpanded === "true",
  );

  // close on click outside
  useEffect(() => {
    const clickHandler = ({ target }: MouseEvent) => {
      if (!sidebar.current || !trigger.current) return;
      if (
        !sidebarOpen ||
        sidebar.current.contains(target) ||
        trigger.current.contains(target)
      )
        return;
      setSidebarOpen(false);
    };
    document.addEventListener("click", clickHandler);
    return () => document.removeEventListener("click", clickHandler);
  });

  // close if the esc key is pressed
  useEffect(() => {
    const keyHandler = ({ key }: KeyboardEvent) => {
      if (!sidebarOpen || key !== "Escape") return;
      setSidebarOpen(false);
    };
    document.addEventListener("keydown", keyHandler);
    return () => document.removeEventListener("keydown", keyHandler);
  });

  useEffect(() => {
    localStorage.setItem("sidebar-expanded", sidebarExpanded.toString());
    if (sidebarExpanded) {
      document.querySelector("body")?.classList.add("sidebar-expanded");
    } else {
      document.querySelector("body")?.classList.remove("sidebar-expanded");
    }
  }, [sidebarExpanded]);


  const route = useRouter()
  const handleLogout = () => {
    localStorage.clear();
    document.cookie = 'token=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/';
    route.push("/")
  }

  return (
    <aside
      ref={sidebar}
      className={`absolute left-0 top-0 z-50 flex h-screen w-72.5 flex-col overflow-y-hidden bg-black border-r border-white/20 duration-300 ease-linear dark:bg-boxdark lg:static lg:translate-x-0 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
    >
      {/* <!-- SIDEBAR HEADER --> */}
      <div className="flex items-center justify-between lg:justify-center gap-2 px-6 py-5.5 lg:py-6.5">
        <div >
          <Image className="h-10" src={realLogo} alt="logo" />
        </div>

        <button
          ref={trigger}
          onClick={() => setSidebarOpen(!sidebarOpen)}
          aria-controls="sidebar"
          aria-expanded={sidebarOpen}
          className="block lg:hidden"
        >
          <svg
            className="fill-current"
            width="20"
            height="18"
            viewBox="0 0 20 18"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M19 8.175H2.98748L9.36248 1.6875C9.69998 1.35 9.69998 0.825 9.36248 0.4875C9.02498 0.15 8.49998 0.15 8.16248 0.4875L0.399976 8.3625C0.0624756 8.7 0.0624756 9.225 0.399976 9.5625L8.16248 17.4375C8.31248 17.5875 8.53748 17.7 8.76248 17.7C8.98748 17.7 9.17498 17.625 9.36248 17.475C9.69998 17.1375 9.69998 16.6125 9.36248 16.275L3.02498 9.8625H19C19.45 9.8625 19.825 9.4875 19.825 9.0375C19.825 8.55 19.45 8.175 19 8.175Z"
              fill=""
            />
          </svg>
        </button>
      </div>
      {/* <!-- SIDEBAR HEADER --> */}

      <div className="no-scrollbar flex flex-col overflow-y-auto duration-300 ease-linear">
        {/* <!-- Sidebar Menu --> */}
        <nav className="mt-5 px-4 py-4 lg:mt-5 lg:px-6">
          {/* <!-- Menu Group --> */}
          <div>
            <ul className="mb-6 flex flex-col gap-1.5">
              {/* <!-- Menu Item Dashboard --> */}
              <NavigationList icon={<MdDashboard size={24} />} title="Home" pathname="/dashboard" />
              <NavigationList icon={<BsPersonFillGear size={24} />} title="Permintaan Surat" pathname="/request_message" />
              <NavigationList icon={<LuBookPlus size={24} />} title="Buat Surat" pathname="/create_message" />
              <NavigationList icon={<SiGitbook size={24} />} title="Semua Surat" pathname="/all_message" />
              <NavigationList icon={<MdOutlineMoveToInbox size={24} />} title="Kategori Bobot" pathname="/category_message" />
              <ButtonSecondary className="w-full py-1 rounded-md font-medium mt-20 cursor-pinter" onClick={handleLogout} >Logout</ButtonSecondary>
              {/* <!-- Menu Item Calendar -->
              <NavigationList icon={<IoCalendarOutline size={19} />} title="Calendar" pathname="/calendar" /> */}


              {/* <!-- Menu Item Profile --> */}
              {/* <NavigationList icon={<IoPersonOutline size={19} />} title=" Profile" pathname="/profile" /> */}


              {/* <!-- Dropdown Menu Start --> */}
              {/* <SidebarLinkGroup
                activeCondition={
                  pathname === "/forms" || pathname.includes("forms")
                }
              >
                {(handleClick, open) => {
                  return (
                    <React.Fragment>
                      <Link
                        href="#"
                        className={`group relative flex items-center gap-2.5 rounded-sm px-4 py-2 font-medium text-bodydark1 duration-300 ease-in-out hover:bg-graydark dark:hover:bg-meta-4 ${(pathname === "/forms" ||
                          pathname.includes("forms")) &&
                          "bg-graydark dark:bg-meta-4"
                          }`}

                        onClick={(e) => { e.preventDefault(); sidebarExpanded ? handleClick() : setSidebarExpanded(true); }}
                      >
                        <GrArticle size={19} />
                        Articles
                        <svg
                          className={`absolute right-4 top-1/2 -translate-y-1/2 fill-current ${open && "rotate-180"
                            }`}
                          width="20"
                          height="20"
                          viewBox="0 0 20 20"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            fillRule="evenodd"
                            clipRule="evenodd"
                            d="M4.41107 6.9107C4.73651 6.58527 5.26414 6.58527 5.58958 6.9107L10.0003 11.3214L14.4111 6.91071C14.7365 6.58527 15.2641 6.58527 15.5896 6.91071C15.915 7.23614 15.915 7.76378 15.5896 8.08922L10.5896 13.0892C10.2641 13.4147 9.73651 13.4147 9.41107 13.0892L4.41107 8.08922C4.08563 7.76378 4.08563 7.23614 4.41107 6.9107Z"
                            fill=""
                          />
                        </svg>
                      </Link>


                      <div
                        className={`translate transform overflow-hidden ${!open && "hidden"
                          }`}
                      >
                        <ul className="mb-5.5 mt-4 flex flex-col gap-2.5 pl-6">
                          <li>
                            <Link
                              href="/create_articles"
                              className={`group relative flex items-center gap-2.5 rounded-md px-4 font-medium text-bodydark2 duration-300 ease-in-out hover:text-white ${pathname === "/forms/form-elements" &&
                                "text-white"
                                }`}
                            >
                              Create article
                            </Link>
                          </li>
                          <li>
                            <Link
                              href="/all_news_admin"
                              className={`group relative flex items-center gap-2.5 rounded-md px-4 font-medium text-bodydark2 duration-300 ease-in-out hover:text-white ${pathname === "/forms/form-layout" &&
                                "text-white"
                                } `}
                            >
                              All article
                            </Link>
                          </li>
                        </ul>
                      </div>
                    </React.Fragment>
                  );
                }}
              </SidebarLinkGroup> */}


              {/* <!-- Menu Item Tables --> */}
              {/* <NavigationList icon={<MdOutlineTableChart size={19} />} title=" Tables" pathname="/tables" /> */}


              {/* <!-- Menu Item Settings --> */}
              {/* <NavigationList icon={<IoSettingsOutline size={19} />} title="Settings" pathname="/settings" /> */}


            </ul>
          </div>

        </nav>
        {/* <!-- Sidebar Menu --> */}
      </div>
    </aside>
  );
};

export default Sidebar;
