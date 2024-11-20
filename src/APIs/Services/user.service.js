import { HttpClient } from "../HttpClients";
import Cookies from "universal-cookie";
import axios from "axios";
const cookies = new Cookies();

class UserService extends HttpClient {
  constructor() {
    super(process.env.REACT_APP_API_URL);
  }

  async CompletedTutorial() {
    return await axios.post(`${this.baseUrl}/Auth/CompletedTutorial`, null,{
      headers: {
        authorization: `Bearer ${cookies.get("user")?.token}`,
      },
    });
  }

  async AddUser(userData) {
    return await this.post(`User/CreateAdmin`, userData, {
      headers: {
        authorization: `Bearer ${cookies.get("user")?.token}`
      }
    });
  }
}

export const userSerivce = new UserService();
