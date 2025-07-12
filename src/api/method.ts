import { axiosInterceptor } from "./axiosInterceptor"

// export const getAllRequestMessage = async () => {
//     axiosInterceptor.get('/request/list')
//         .then((res) => {
//             console.log(res.data);
//         }).catch((err) => {
//             console.log(err);
//         });
// }
export const createMessageTemplate = async (form: any, callback: any) => {
    await axiosInterceptor.post('/request', form)
        .then((result) => {
            callback(result.data)
        }).catch((err) => {
            console.log(err);
        });
}


export const getAllRequestMessage = async () => {
    try {
        const res = await axiosInterceptor.get('/request/list');
        return res.data; // ✅ return data
    } catch (err) {
        console.error(err);
        return []; // atau null, tergantung kebutuhan
    }
};
