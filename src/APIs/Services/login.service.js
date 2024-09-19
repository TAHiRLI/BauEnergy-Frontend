import Cookies from "universal-cookie";
import { HttpClient } from "../HttpClients";

const cookies = new Cookies();

class LoginService extends HttpClient {
    constructor() {
        const apiUrl = process.env.REACT_APP_API_URL;        
        super(apiUrl);
    }

    async login(body) {
        console.log(`Sending request to: ${this.baseUrl}/auth/login`);
        const response = await this.post('auth/login', body, { withCredentials: true});
        const user = response.data;

        cookies.set('user', user, { 
            path: '/', 
            secure: false, 
            sameSite: 'Lax'
        }); 
        
        return user;
    }
}

export const loginService = new LoginService();

