import db from 'utils/mysql';
import Moment from 'moment';

export default class Media {
    static async getCategories() {
        const query = 'SELECT * FROM categories ORDER BY `order` ASC';
        const flatList = await db.query(query);
        return flatList.map((category) => {
            return {
                id: category.id,
                uid: category.alias,
                title: {
                    ru: category.title_ru,
                    uk: category.title_ua
                },
                sort: category.order
            };
        });
    }

    static async getShows() {
        const query = 'SELECT * FROM programs';
        const flatList = await db.query(query);
        return flatList.map((show) => {
            return {
                id: show.id,
                uid: show.code,
                title: show.alias,
                categoryId: show.cat_id,
                description: {
                    short: show.desc_short,
                    medium: show.desc_medium,
                    long: show.desc_long,
                    days: show.days,
                    time: show.time
                },
                anons: !!show.anons
            };
        });
    }

    static async getEpisodes() {
        const query = 'SELECT a.*, y.code as youtube, y.publish_time as publish'
                    + ' FROM apps a'
                    + ' LEFT JOIN youtube y ON y.app_id = a.id'
                    + ' WHERE y.code IS NOT NULL';
        const flatList = await db.query(query);
        return flatList.map((episode) => {
            let language;
            switch (episode.lang_original) {
                case 2: language = 'ru'; break;
                case 3: language = 'uk'; break;
                case 11: language = 'ru,uk'; break;
            }
            switch (episode.lang_translate) {
                case 9: language = 'ru'; break;
                case 10: language = 'uk'; break;
                case 12: language = 'ru,uk'; break;
            }

            return {
                id: episode.id,
                uid: episode.code,
                title: episode.title,
                showId: episode.program_id,
                author: episode.author,
                description: episode.desc,
                publish: Moment(episode.publish),
                tags: episode.tags.length > 0 ? episode.tags.split(',').map(tag => tag.trim()) : [],
                hd: !!episode.hd,
                language,
                youtube: episode.youtube
            };
        });
    }
}
