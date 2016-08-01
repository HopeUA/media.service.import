/**
 * @file Exporter module
 * @author Sergey Sadovoi [serg.sadovoi@gmail.com]
 */
import Logger from 'utils/logger';
import MediaApi from 'api/Media';
import MediaService from 'api/MediaService';
import Config from 'config';

export default class Exporter {
    static async run(options) {
        Logger.info('Export START');

        // 0. Clear db
        if (options.fresh) {
            await MediaService.remove('episodes');
            await MediaService.remove('shows');
            await MediaService.remove('categories');
        }

        // 1. Get categories
        const categories = await MediaApi.getCategories();

        // 2. Get shows
        const shows = await MediaApi.getShows();

        // 3. Get episodes
        const episodes = await MediaApi.getEpisodes(Config.get('query'));

        // 4. Export to Media.Service
        for (const episode of episodes) {
            Logger.info(`Episode ${episode.uid}`);

            const show = shows.find((item) => {
                return item.id === episode.showId;
            });

            const category = categories.find((item) => {
                return item.id === show.categoryId;
            });

            const categoryExists = await MediaService.isExists('categories', category.uid);
            if (!categoryExists) {
                Logger.info(`Category "${category.uid}" not found. Create...`);
                const result = await MediaService.update('categories', Object.assign({}, category));
                if (result.error) {
                    Logger.error(`Can't create Category: ${result.error.message}`);
                    continue;
                }
            }
            const showExists = await MediaService.isExists('shows', show.uid);
            if (!showExists) {
                Logger.info(`Show "${show.uid}" not found. Create...`);
                const result = await MediaService.update('shows', Object.assign({}, show, {
                    categoryId: category.uid
                }));
                if (result.error) {
                    Logger.error(`Can't create Show: ${result.error.message}`);
                    continue;
                }
            }

            Logger.info(`Update ${episode.uid}`);
            const result = await MediaService.update('episodes', Object.assign({}, episode, {
                publish: episode.publish ? episode.publish.format() : undefined,
                showId: show.uid
            }));
            if (result.error) {
                Logger.error(`Can't create Episode: ${result.error.message}`);
                continue;
            }

            Logger.info(`Episode "${episode.uid}" updated`);
        }
    }
}
