import axios from 'axios';
import { SetterOrUpdater } from 'recoil';

const API_URL = import.meta.env.VITE_API_URL;
const CLOUDINARY = import.meta.env.VITE_CLOUDINARY_ID;

interface ApiRequestParams {
    url: string;
    token?: string;
    data?: any;
    method?: string;
}

interface FetchPosts {
    uri?: string;
    token: string;
    data?: any;
    setPosts: SetterOrUpdater<any>;
}

export const API = axios.create({
    baseURL: API_URL,
    responseType: "json",
    validateStatus: (status) => status < 500,
});


export const apiRequest = async ({ url, token, data, method }: ApiRequestParams) => {
    console.log("API Call → URL:", API_URL + url);
    console.log("Request Data:", data);
    try {
        const result = await API(url, {
            method : method || "GET",
            data,
            headers: {
                "Content-Type": "application/json",
                Authorization: token ? `Bearer ${token}` : "",
            }
        });

        return result.data;
    } catch (error) {
        console.error("API request error:", error);
        return null;
    }
};

export const handleFileUpload = async (uploadFile: File | Blob) => {
    const formData = new FormData();
    formData.append("file", uploadFile);
    formData.append("upload_preset", "socialmedia");

    try {
        console.log("CLOUDINARY ", CLOUDINARY)
        const response = await axios.post(
            `https://api.cloudinary.com/v1_1/${CLOUDINARY}/image/upload`, 
            formData
        );
        console.log("uri  ", response.data)
        return response.data.secure_url;
    } catch (error) {
        console.error("API request error:", error);
        return null;
    }
};

export const fetchPosts = async ({uri, token, data, setPosts}: FetchPosts ) => {

    try {
            const res = await apiRequest({
                url: uri || "post",
                token,
                method: "POST",
                data: data || {}
            });
            setPosts(res.data);
            return;

    } catch(error) {
        console.log(error);
        return;
    }

};

export const likePost = async ( uri:string, token:string ) => {
    try {
        const res = await apiRequest({
            url: uri,
            token,
            method: "POST"
        });
        return res.data;
    } catch(error) {
        console.log(error);
    }
};

export const deletePost = async ( id:string, token:string ) => {
    try {
        const res = await apiRequest({
            url: `/post/${id}`,
            token,
            method: "DELETE"
        });
        return res.data;
    } catch(error) {
        console.log(error);
    }
};

export const getUserInfo = async (token:string, id?:string) => {
    try {
        const uri = id === undefined ? "/users/get-user" : `/users/get-user/${id}`;
        
        const res = await apiRequest({
            url: uri,
            token,
            method: "POST"
        });

        if (res.message === "Authentication failed") {
            localStorage.removeItem("user")
            alert("User session expried. Login again.");
            window.location.replace("/login");
        }
        return res.user;
    } catch (error) {
        console.log(error)
    }
};

export const sendFrienRequest = async (token:string, id:string) => {
    try {
        const res = await apiRequest({
            url: "/users/friend-request",
            token,
            method: "POST",
            data: { requestTo: id}
        })

        return res.data;
    } catch(error) {
        console.log(error);
    }
};

export const viewUserProfile =  async (token:string, id:string) => {
    try {
        const res = await apiRequest({
            url: "/users/profile-view",
            token,
            method: "POST",
            data: { id }
        })

        return res.data;
    } catch(error) {
        console.log(error);
    }
};