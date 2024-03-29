import axios from "axios";
import router from "next/router";

// ** Config
//import authConfig from 'src/configs/auth'

const http = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL || '/',

})



http.interceptors.request.use(
    (config) => {
        if (config?.headers) {
            const token = window.localStorage.getItem("storageTokenKeyName");
            if (token) {
                config.headers["Authorization"] =  `Bearer ${token}`;  
            }
        }
        
return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);


http.interceptors.response.use(
    (res) => {
        return res;
    },
    async (err) => {
        const originalConfig = err.config;

        /*if (originalConfig.url !== "/usuario/signin" && originalConfig.url !== "/usuario/logged" && err.response) {
            // Access Token was expired
            if (err.response.status === 401 && !originalConfig._retry) {
                originalConfig._retry = true;

                try {

                    const httpRefresh = axios.create({
                        baseURL: process.env.NEXT_PUBLIC_SGA_API_URL,
                    })
                    const { data } = await httpRefresh.get("usuario/refresh",  {headers: {
                        Authorization: `Bearer ${window.localStorage.getItem(authConfig.storageTokenRefreshKeyName)}`
                    }});
                    

                    window.localStorage.setItem(authConfig.storageTokenKeyName, data.data.accessToken);
                    window.localStorage.setItem(authConfig.storageTokenRefreshKeyName, data.data.refreshToken); 

                    
                    return http(originalConfig);
                } 
                catch (_error) {
                    if (axios.isAxiosError(_error) && _error.response?.status === 401) {
                        window.localStorage.removeItem('userData')
                        window.localStorage.removeItem(authConfig.storageTokenKeyName)
                        window.localStorage.removeItem(authConfig.storageTokenRefreshKeyName)
                        window.localStorage.removeItem('settings')
                        router.push("/login");
                    }
                    
                    return Promise.reject(_error);
                }
            }
        }*/

        return Promise.reject(err);
    }
);  

export default http;