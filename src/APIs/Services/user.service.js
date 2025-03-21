import Cookies from "universal-cookie";
import { HttpClient } from "../HttpClients";
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
  async CompletedTest() {
    return await axios.post(`${this.baseUrl}/Auth/CompletedTest`, null,{
      headers: {
        authorization: `Bearer ${cookies.get("user")?.token}`,
      },
    });
  }

  async AddUser(userData) {
    return await this.post(`User/CreateUser`, userData, {
      headers: {
        authorization: `Bearer ${cookies.get("user")?.token}`
      }
    });
  }

  async getByEmail(email) {
    return await this.get(`User/${email}`, {
        headers: {
            authorization: `Bearer ${cookies.get('user')?.token}`
        }
    });
  }

  async edit(email,body) {
    return await this.put('User',email, body, {
        headers: {
            authorization: `Bearer ${cookies.get('user')?.token}`
        }
    });
  }

  async resetUserPassword(id){
    return await this.customPost(`User/ResetPassword/${id}`, {
      headers: {
          authorization: `Bearer ${cookies.get('user')?.token}`
      }
  });
  }

  async register(body) {
    return await this.post("Auth/SignUp", body, {
        headers: {
            "Content-Type": "application/json",
        },
    });
  }

  async approveUser(userId, isApproved) {
    return await this.post(
        `Auth/ApproveUser?userId=${userId}&isApproved=${isApproved}`,
        {},
        {
            headers: {
                authorization: `Bearer ${cookies.get("user")?.token}`,
            },
        }
    );
  }
}

export const userSerivce = new UserService();
