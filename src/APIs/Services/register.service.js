import { HttpClient } from "../HttpClients";

class RegisterService extends HttpClient {
    constructor() {
        super(process.env.REACT_APP_API_URL);
    }

    async register(body) {
        console.log(`Sending request to: ${this.baseUrl}/User`);
        
        const config = {
            headers: {
                'Content-Type': 'application/json',
            }
        };
        
        const response = await this.post('Auth/SignUp', body, config);
        console.log(response);
        const user = response.data;
        
        return user;
    }
}


 export const registerService = new RegisterService();



