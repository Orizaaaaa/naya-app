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


export const getTemplateById = async (id: string) => {
    try {
        const result = await axiosInterceptor(`/template/${id}`);
        return result.data; // ✅ return data langsung
    } catch (err) {
        console.error(err);
        throw err;
    }
};


export const deleteTemplate = async (id: any) => {
    try {
        const result = await axiosInterceptor.delete(`/template/${id}`)
        return result.data; // ✅ return data langsung
    } catch (err) {
        console.error(err);
        throw err;
    }
}

export const updateTemplate = async (id: any, form: any) => {
    try {
        const result = await axiosInterceptor.put(`/template/${id}`, form);
        return result.data; // ✅ return data langsung
    } catch (err) {
        console.error(err);
        throw err;
    }
}


export const updateRequestUser = async (id: any, form: any) => {
    try {
        const result = await axiosInterceptor.put(`/request/${id}`, form);
        return result.data; // ✅ return data langsung
    } catch (err) {
        console.error(err);
        throw err;
    }
}


export const deleteRequest = async (id: any) => {
    try {
        const result = await axiosInterceptor.delete(`/request/${id}`)
        return result.data; // ✅ return data langsung
    } catch (err) {
        console.error(err);
        throw err;
    }
}

export const getMessageUser = async (id: string) => {
    try {
        const result = await axiosInterceptor.get(`/request/${id}`);
        return result.data; // ✅ return data langsung
    } catch (err) {
        console.error(err);
        throw err;
    }
};


export const createRequestMessage = async (form: any, callback: any) => {
    await axiosInterceptor.post('/request', form)
        .then((result) => {
            callback(result.data)
        }).catch((err) => {
            console.log(err);
        });
}