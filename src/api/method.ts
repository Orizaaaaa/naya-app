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
    await axiosInterceptor.post('/template', form)
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
export const getAllTemplate = async () => {
    try {
        const res = await axiosInterceptor.get('/template/list');
        return res.data; // ✅ return data
    } catch (err) {
        console.error(err);
        return []; // atau null, tergantung kebutuhan
    }
};


export const getTemplateById = (id: string, callback: any) => {
    axiosInterceptor(`/template/${id}`)
        .then((result) => {
            callback(result.data)
        }).catch((err) => {
            console.log(err);
        });
}

export const deleteTemplate = (id: any, callback: any) => {
    axiosInterceptor.delete(`/template/${id}`)
        .then((result) => {
            callback(result.data)
        }).catch((err) => {
            console.log(err);
        });
}

export const updateTemplate = async (id: any, form: any, callback: any) => {
    await axiosInterceptor.put(`/template/${id}`, form)
        .then((result) => {
            callback(result.data)
        }).catch((err) => {
            console.log(err);
        });
}
