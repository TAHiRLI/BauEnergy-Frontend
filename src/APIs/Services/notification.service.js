import { HttpClient } from "../HttpClients";
import Cookies from "universal-cookie";
const cookies = new Cookies();

class NotificationService extends HttpClient {
    constructor() {
        super(process.env.REACT_APP_API_URL);
    }

    async getAll(id) {
        return await this.get(`Notification/${id}`, {
            headers: {
                authorization: `Bearer ${cookies.get('user')?.token}`
            }
        });
    }

    async markRead(id) {
        return await this.post(`Notification/${id}/markRead`, {
            headers: {
                authorization: `Bearer ${cookies.get('user')?.token}`
            }
        });
    }
    async markUnRead(id) {
        return await this.post(`Notification/${id}/markUnRead`, {
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
}

export const notificationService = new NotificationService();