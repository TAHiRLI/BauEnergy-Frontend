import { HttpClient } from "../HttpClients";
import Cookies from "universal-cookie";
const cookies = new Cookies();

class CarService extends HttpClient {
    constructor() {
        super(process.env.REACT_APP_API_URL);
    }
    

    async getAll() {
        return await this.get(`Car`, {
            headers: {
                authorization: `Bearer ${cookies.get('user')?.token}`
            }
        });
    }

    async getAllAvailable() {
        return await this.get(`Car/available`, {
            headers: {
                authorization: `Bearer ${cookies.get('user')?.token}`
            }
        });
    }

    async getById(id) {
        return await this.get(`Car/${id}`, {
            headers: {
                authorization: `Bearer ${cookies.get('user')?.token}`
            }
        });
    }

    async getDistinctCarIds(instruments) {
        return await this.post("Car/groupbyCar", instruments, {
            headers: {
                authorization: `Bearer ${cookies.get('user')?.token}`,
                "Content-Type": "application/json"
            },
        });
    }
    

    async add(body) {
        return await this.post('Car', body, {
            headers: {
                authorization: `Bearer ${cookies.get('user')?.token}`
            }
        });
    }
    async edit(id,body) {
        return await this.put('Car',id, body, {
            headers: {
                authorization: `Bearer ${cookies.get('user')?.token}`
            }
        });
    }

    async remove(id) {
        return await this.delete('Car',id,{
            headers: {
                authorization: `Bearer ${cookies.get('user')?.token}`
            }
        });
    }

    async assignInstrumentsToCar(carId, instrumentIds) {
        return await this.customPut('Car/assign-instruments-to-car', {
            carId: carId,
            instrumentIds: instrumentIds,
        }, {
            headers: {
                authorization: `Bearer ${cookies.get('user')?.token}`,
                'Content-Type': 'application/json'
            }
        });
    }

    async unassignInstruments(carId) {
        console.log(carId)
        return await this.customPut1('Car/unassign-instruments', carId, {
            headers: {
                authorization: `Bearer ${cookies.get('user')?.token}`
            }
        });
    }
    

}

export const carService = new CarService();