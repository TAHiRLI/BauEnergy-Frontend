import { HttpClient } from "../HttpClients";
import Cookies from "universal-cookie";
const cookies = new Cookies();

class InstrumentTagService extends HttpClient {
    constructor() {
        super(process.env.REACT_APP_API_URL);
    }
    

    async getAll() {
        return await this.get(`InstrumentTags`, {
            headers: {
                authorization: `Bearer ${cookies.get('user')?.token}`
            }
        });
    }

    async getAllWithCount() {
        return await this.get(`InstrumentTags/WithCount`, {
            headers: {
                authorization: `Bearer ${cookies.get('user')?.token}`
            }
        });
    }
    
    async GetProjectsTagsInstruments() {
        return await this.get(`InstrumentTags/projects-tags-instruments`, {
            headers: {
                authorization: `Bearer ${cookies.get('user')?.token}`
            }
        });
    }

    async remove(id) {
        return await this.delete('InstrumentTags',id,{
            headers: {
                authorization: `Bearer ${cookies.get('user')?.token}`
            }
        });
    }
}

export const instrumentTagService = new InstrumentTagService();