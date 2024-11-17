import { HttpClient } from "../HttpClients";

class RegisterService extends HttpClient {
    constructor() {
        const apiUrl = process.env.REACT_APP_API_URL;        
        super(apiUrl);
    }

    async register(body) {
        console.log(`Sending request to: ${this.baseUrl}/User`);
        
        const config = {
            headers: {
                'Content-Type': 'application/json',
            }
        };
        
        const response = await this.post('User', body, config);
        console.log(response);
        const user = response.data;
        
        return user;
    }
}


 export const registerService = new RegisterService();



