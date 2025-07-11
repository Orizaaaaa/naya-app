import axios from "axios";
import { axiosInterceptor } from "./axiosInterceptor";
export const url = process.env.NEXT_PUBLIC_BASE_API
export const loginService = async (form: any, callback: any) => {
    await axios.post(`${url}/users/login`, form)
        .then((res) => {
            callback(true, res.data);
        }).catch((err) => {
            callback(false, err)
        })
}

export const registerUser = async (formRegister: any, callback: any) => {
    await axiosInterceptor.post('/users/register', formRegister)
        .then((res) => {
            callback(true, res.data);
            console.log(res.data);

        }).catch((err) => {
            callback(false, err);
        });
};
