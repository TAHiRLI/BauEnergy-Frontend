import { HttpClient } from "../HttpClients";
import Cookies from "universal-cookie";
const cookies = new Cookies();

class InstrumentService extends HttpClient {
    constructor() {
        super(process.env.REACT_APP_API_URL);
    }
    

    async getAll(search = "", page = 1, pageSize = 16) {
        return await this.get(`Instrument`, {
            headers: {
                authorization: `Bearer ${cookies.get('user')?.token}`
            },
            params: {
                search,
                page,
                pageSize
            }
        });
    }

    // async getByExactName(name) {
    //     return await this.get(`Instrument/ByExactName?name=${name}`, {
    //         headers: {
    //             authorization: `Bearer ${cookies.get('user')?.token}`
    //         }
    //     });
    // }
    async getByExactName( projectName, status, name, pageNumber = 1, pageSize = 20) {
        // Construct query parameters
        const params = new URLSearchParams({
            projectName,
            status,
            name,
            pageNumber,
            pageSize: 20
        });
    
        // Make the API call
        return await this.get(`Instrument/ByExactName?${params.toString()}`, {
            headers: {
                authorization: `Bearer ${cookies.get('user')?.token}`
            }
        });
    }
    

    async getAllByName(search = "") {
        return await this.get(`Instrument/filteredbyname`, {
            headers: {
                authorization: `Bearer ${cookies.get('user')?.token}`
            },
            params: {
                search
            }
        });
    }
    
    async getById(id) {
        return await this.get(`Instrument/${id}`, {
            headers: {
                authorization: `Bearer ${cookies.get('user')?.token}`
            }
        });
    }

    async add(body) {
        return await this.post('Instrument', body, {
            headers: {
                authorization: `Bearer ${cookies.get('user')?.token}`
            }
        });
    }
    async edit(id,body) {
        return await this.put('Instrument',id, body, {
            headers: {
                authorization: `Bearer ${cookies.get('user')?.token}`
            }
        });
    }

    async remove(id) {
        return await this.delete('Instrument',id,{
            headers: {
                authorization: `Bearer ${cookies.get('user')?.token}`
            }
        });
    }

    async getAviableInstruments() {
        return await this.get(`Instrument/available`, {
            headers: {
                authorization: `Bearer ${cookies.get('user')?.token}`
            }
        });
    }
    
    async updateStatus(id,body) {
        console.log(body)
        return await this.putStatus(`Instrument`, id , body, 
        {
            headers: {
                authorization: `Bearer ${cookies.get('user')?.token}`
            }
        });
    }
    async removePdf(id1, id2) {
        return await this.deletePdf('Instrument',id1, id2, {
            headers: {
                authorization: `Bearer ${cookies.get('user')?.token}`
            }
        });
    }
    async removeImage(id1, id2) {
        return await this.deleteImage('Instrument',id1, id2, {
            headers: {
                authorization: `Bearer ${cookies.get('user')?.token}`
            }
        });
    }

    async addDocument(instrumentId, files) {
        const formData = new FormData();
        files.forEach((file) => formData.append('Files', file));
    
        console.log('FormData Entries:', [...formData.entries()]);
    
        return await this.post(`Instrument/${instrumentId}/documents`, formData, {
            headers: {
                authorization: `Bearer ${cookies.get('user')?.token}`
            }
        });
    }
    

}

export const instrumentService = new InstrumentService();