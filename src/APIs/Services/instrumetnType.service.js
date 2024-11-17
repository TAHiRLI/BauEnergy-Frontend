import { HttpClient } from "../HttpClients";
import Cookies from "universal-cookie";
const cookies = new Cookies();

class InstrumentTypeService extends HttpClient {
    constructor() {
        super(process.env.REACT_APP_API_URL);
    }
    

    async getAll() {
        return await this.get(`InstrumentTypes`, {
            headers: {
                authorization: `Bearer ${cookies.get('user')?.token}`
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


}

export const instrumentTypeService = new InstrumentTypeService();