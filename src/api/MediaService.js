import Config from 'config';
import Fetch from 'node-fetch';

export default class MediaService {
    static async isExists(resource, uid) {
        const url = `${Config.get('mediaService.url')}/${resource}/${uid}/exists`;
        const response = await Fetch(url);
        const result   = await response.json();

        return result.exists;
    }

    static async update(resource, data) {
        const url = `${Config.get('mediaService.url')}/${resource}`;
        const response = await Fetch(url, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${Config.get('mediaService.token')}`
            },
            body: JSON.stringify(data)
        });

        return await response.json();
    }
}
