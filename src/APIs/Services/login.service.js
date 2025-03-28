import Cookies from "universal-cookie";
import { HttpClient } from "../HttpClients";

const cookies = new Cookies();

class LoginService extends HttpClient {
    constructor() {
        const apiUrl = process.env.REACT_APP_API_URL;        
        super(apiUrl);
    }

    async login(body) {
        console.log(`Sending request to: ${this.baseUrl}/login`);
        const response = await this.post('auth/login', body, { withCredentials: true});
        const user = response.data;
       
        
        return user;
    }

    async resetPassword(body) {

        return await this.post('Auth/ResetPassword', body);
    }

    async generateResetToken(email) {
        return await this.post('Auth/GenerateResetToken', email, {
            headers: {
                'Content-Type': 'application/json', 
            },
        });
    }
    
    
    
}

export const loginService = new LoginService();

