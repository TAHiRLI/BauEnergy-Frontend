// import Cookies from "universal-cookie";
// import { HttpClient } from "../HttpClients";
// const cookies = new Cookies();

// class LoginService extends HttpClient {
//     constructor() {
//         super(process.env.REACT_APP_API_URL);
//     }

//     async login(body) {
//         const response = await this.post('auth/login', body);
//         return response
//     }
//     // async resetPassword(body) {
//     //     return await this.post('Accounts/ResetPassword', body);
//     // }
//     async getRoles() {
//         return await this.get(`Accounts/Roles`, {
//             headers: {
//                 authorization: `Bearer ${cookies.get('user')?.token}`
//             }
//         });
//     }
    
// }

// export const loginService = new LoginService();

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
        console.log(user);
        //cookies.set('user', user, { path: '/' });

        cookies.set('user', user, { 
            path: '/', 
            secure: false, 
            sameSite: 'Lax'
        }); 
        
        console.log(user)
        return user;
    }
}

export const loginService = new LoginService();
