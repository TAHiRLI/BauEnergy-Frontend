import { HttpClient } from "../HttpClients";
import Cookies from "universal-cookie";
const cookies = new Cookies();

class TeamMemberService extends HttpClient {
    constructor() {
        super(process.env.REACT_APP_API_URL);
    }
    

    async getAll() {
        return await this.get(`TeamMember`, {
            headers: {
                authorization: `Bearer ${cookies.get('user')?.token}`
            }
        });
    }
    async getAllMembers() {
        return await this.get(`TeamMember/members`, {
            headers: {
                authorization: `Bearer ${cookies.get('user')?.token}`
            }
        });
    }

    async getAllByCompany(projectId) {
        return await this.get(`TeamMember/GetAllByCompany`, {
            params: { projectId },
            headers: {
                authorization: `Bearer ${cookies.get('user')?.token}`
            }
        });
    }
    async getById(id) {
        return await this.get(`TeamMember/${id}`, {
            headers: {
                authorization: `Bearer ${cookies.get('user')?.token}`
            }
        });
    }

    async getAllProjectManagers(projectId) {
        return await this.get(`TeamMember/GetAllProjectManagers`, {
            params: { projectId },
            headers: {
                authorization: `Bearer ${cookies.get('user')?.token}`
            }
        });
    }

    async add(body) {
        return await this.post('TeamMember', body, {
            headers: {
                authorization: `Bearer ${cookies.get('user')?.token}`
            }
        });
    }
    async edit(id,body) {
        return await this.put('TeamMember',id, body, {
            headers: {
                authorization: `Bearer ${cookies.get('user')?.token}`
            }
        });
    }

    async remove(id) {
        return await this.delete('TeamMember',id,{
            headers: {
                authorization: `Bearer ${cookies.get('user')?.token}`
            }
        });
    }
    async removeUser(id) {
        return await this.delete('TeamMember/delete-user',id,{
            headers: {
                authorization: `Bearer ${cookies.get('user')?.token}`
            }
        });
    }
}

export const teamMemberService = new TeamMemberService();