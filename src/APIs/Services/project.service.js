import { HttpClient } from "../HttpClients";
import Cookies from "universal-cookie";
const cookies = new Cookies();

class ProjectService extends HttpClient {
    constructor() {
        super(process.env.REACT_APP_API_URL);
    }
    

    async getAll() {
        return await this.get(`Project`, {
            headers: {
                authorization: `Bearer ${cookies.get('user')?.token}`
            }
        });
    }
    async getById(id) {
        return await this.get(`Project/${id}`, {
            headers: {
                authorization: `Bearer ${cookies.get('user')?.token}`
            }
        });
    }

    async add(body) {
        return await this.post('Project', body, {
            headers: {
                authorization: `Bearer ${cookies.get('user')?.token}`
            }
        });
    }
    async edit(id,body) {
        return await this.put('Project',id, body, {
            headers: {
                authorization: `Bearer ${cookies.get('user')?.token}`
            }
        });
    }

    async remove(id) {
        return await this.delete('Project',id,{
            headers: {
                authorization: `Bearer ${cookies.get('user')?.token}`
            }
        });
    }

    async removeInstrumentFromProject(body) {
        return await this.customDelete('Project/removeInstrument', {
            data: body,
            headers: {
                authorization: `Bearer ${cookies.get('user')?.token}`,
            }
        });
    }

    async addInstrumentToProject(body) {
        return await this.post('Project/addInstrument',body, {
            headers: {
                authorization: `Bearer ${cookies.get('user')?.token}`,
            }
        });
    }

    async approveOrRejectInstrument(id, status) {
        return await this.customPost(`Project/${id}/approveOrReject?status=${status}`, {
            headers: {
                authorization: `Bearer ${cookies.get('user')?.token}`
            }
        });
    }
}
export const projectService = new ProjectService();