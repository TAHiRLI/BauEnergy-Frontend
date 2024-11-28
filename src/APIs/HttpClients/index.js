import axios from "axios";

export class HttpClient{
    baseUrl;

    constructor(url){
        this.baseUrl = url;
    }

    async get(endpoint,config){
        return await axios.get(`${this.baseUrl}/${endpoint}`,config);
    }
    async post(endpoint, body,config){
        return await axios.post(`${this.baseUrl}/${endpoint}`, body,config);
    }
    async customPost(endpoint,config){
        return await axios.post(`${this.baseUrl}/${endpoint}`, config);
    }
    async put(endpoint, id, body, config){
        return await axios.put(`${this.baseUrl}/${endpoint}/${id}`,body, config);
    }
    async delete(endpoint, id,config){
        return await axios.delete(`${this.baseUrl}/${endpoint}/${id}`, config)
    }
    //custom
    async customDelete(endpoint,config){
        return await axios.delete(`${this.baseUrl}/${endpoint}`, config);
    }
    async putStatus(endpoint, id, body, config){
        return await axios.put(`${this.baseUrl}/${endpoint}/${id}/status`,body, config);
    }

    async deletePdf(endpoint, id1, id2, config){
        return await axios.delete(`${this.baseUrl}/${endpoint}/${id1}/document/${id2}`, config)
    }
    async deleteImage(endpoint, id1, id2, config){
        return await axios.delete(`${this.baseUrl}/${endpoint}/${id1}/image/${id2}`, config)
    }
}