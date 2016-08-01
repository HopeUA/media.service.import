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
                anons: Boolean(show.anons)
            };
        });
    }

    static async getEpisodes(options) {
        let query;

        switch (options.type) {
            case 'shared':
                query = 'SELECT a.*, y.code as youtube, y.channel as youtube_channel, y.publish_time as publish'
                      + ' FROM apps a'
                      + ' LEFT JOIN youtube y ON y.app_id = a.id'
                      + ' LEFT JOIN programs p ON p.id = a.program_id'
                      + ' LEFT JOIN channels ch ON ch.id = p.channel_id'
                      + ' WHERE a.status = 100';
                break;
            case 'channel':
                query = 'SELECT a.*, y.code as youtube, y.channel as youtube_channel, y.publish_time as publish'
                      + ' FROM apps a'
                      + ' LEFT JOIN youtube y ON y.app_id = a.id'
                      + ' LEFT JOIN programs p ON p.id = a.program_id'
                      + ' LEFT JOIN channels ch ON ch.id = p.channel_id'
                      + ' WHERE a.status = 100'
                      + '   AND ch.alias IN (' + options.channels.map((alias) => '"' + alias + '"').join(',') + ')'
                      + '   AND y.code <> ""';
                break;
            default:
                return null;
        }

        // const query = 'SELECT a.*, y.code as youtube, y.publish_time as publish'
        //             + ' FROM apps a'
        //             + ' LEFT JOIN youtube y ON y.app_id = a.id'
        //             + ' WHERE y.code IS NOT NULL';
        // const query = 'SELECT a.*, y.code as youtube, y.channel as youtube_channel, y.publish_time as publish'
        //             + ' FROM apps a'
        //             + ' LEFT JOIN youtube y ON y.app_id = a.id'
        //             + ' WHERE a.status = 100'
        //             + '   OR (a.status > 10 && a.program_id = 39)'; // Morning Hope
        const flatList = await db.query(query);
        return flatList.map((episode) => {
            let language;
            /* eslint-disable  default-case */
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
            /* eslint-enable  default-case */

            const result = {
                id: episode.id,
                uid: episode.code,
                title: episode.title,
                showId: episode.program_id,
                author: episode.author,
                description: episode.desc,
                tags: episode.tags.length > 0 ? episode.tags.split(',').map((tag) => tag.trim()) : [],
                hd: Boolean(episode.hd),
                language
            };

            if (episode.youtube && episode.publish) {
                result.publish = Moment(episode.publish);
                result.source = {};
                result.source.youtube = {};
                result.source.youtube.id = episode.youtube;
                result.source.youtube.channel = episode.youtube_channel;
            }

            return result;
        });
    }
}
