import { axiosInterceptor } from "./axiosInterceptor"

export const getAllRequestMessage = async () => {
    axiosInterceptor.get('/request/list')
        .then((res) => {
            console.log(res.data);
        }).catch((err) => {
            console.log(err);
        });
}
export const createMessageTemplate = async (form: any, callback: any) => {
    await axiosInterceptor.post('/request', form)
        .then((result) => {
            callback(result.data)
        }).catch((err) => {
            console.log(err);
        });
}

