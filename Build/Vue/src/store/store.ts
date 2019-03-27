import Vue from 'vue';
import Vuex, {StoreOptions} from 'vuex';
import {
    SELECT_ITEM,
    FETCH_DATA,
    UNSELECT_ITEM,
    NAVIGATE,
    SWITCH_VIEW,
    LIST_VIEW,
    SELECT_ALL,
    UNSELECT_ALL,
    CHANGE_SORTING,
    CHANGE_SORTORDER,
    TOGGLE_TREE,
} from './mutations';
import {RootState} from '../../types/types';
import client from '@/services/http/Typo3Client';
import {SORT_FIELDS, SORT_ORDER} from '@/components/SortingSelector/SortOptions';

Vue.use(Vuex);
// https://codeburst.io/vuex-and-typescript-3427ba78cfa8
// further type definitions missing, just an example on how to use the store.
const options: StoreOptions<RootState> = {
    state: {
        selected: [],
        itemsGrouped: {
            folders: [],
            files: [],
            images: [],
        },
        sorting: {
            field: 'name',
            order: 'ASC',
        },
        items: [],
        current: '',
        viewMode: LIST_VIEW,
        showTree: true,
    },
    mutations: {
        [FETCH_DATA](state: RootState, items: {folders: Array<any>, files: Array<any>, images: Array<any>}): void {
            const sortItems = (a: any, b: any) => a.name.localeCompare(b.name, undefined, {numeric: true, sensitivity: 'base'});

            state.itemsGrouped = items;
            state.items = [...items.files, ...items.images, ...items.folders];

            // default sort order - ugly duplication
            state.items.sort(sortItems);
            state.itemsGrouped.folders.sort(sortItems);
            state.itemsGrouped.files.sort(sortItems);
            state.itemsGrouped.images.sort(sortItems);
        },
        [SELECT_ITEM](state: RootState, identifier: String): void {
            if (!state.selected.includes(identifier)) {
                state.selected.push(identifier);
            }
        },
        [UNSELECT_ITEM](state: RootState, identifier: String): void {
            if (state.selected.includes(identifier)) {
                state.selected.splice(state.selected.indexOf(identifier), 1);
            }
        },
        [SELECT_ALL](state: RootState, listOfIdentifiers: Array<String>): void {
            state.selected = listOfIdentifiers;
        },
        [UNSELECT_ALL](state: RootState): void {
            state.selected = [];
        },
        [NAVIGATE](state: RootState, identifier: String): void {
            state.current = identifier;
            state.selected = [];
        },
        [SWITCH_VIEW](state: RootState, viewMode: String): void {
            state.viewMode = viewMode;
        },
        [TOGGLE_TREE](state: RootState): void {
            state.showTree = !state.showTree;
        },
        [CHANGE_SORTING](state: RootState, sorting: SORT_FIELDS): void {
            const sortItems = (a: any, b: any) => a[sorting].localeCompare(b[sorting], undefined, {numeric: true, sensitivity: 'base'});

            state.sorting.field = sorting;
            state.items.sort(sortItems);
            state.itemsGrouped.folders.sort(sortItems);
            state.itemsGrouped.files.sort(sortItems);
            state.itemsGrouped.images.sort(sortItems);
        },
        [CHANGE_SORTORDER](state: RootState, sortOrder: SORT_ORDER): void {
            if (state.sorting.orger !== sortOrder) {
                state.sorting.order = sortOrder;
                state.items.reverse();
                state.itemsGrouped.folders.reverse();
                state.itemsGrouped.files.reverse();
                state.itemsGrouped.images.reverse();
            }

        },
    },
    actions: {
        async [FETCH_DATA]({commit}: any, identifier: String): Promise<any> {
            commit(NAVIGATE, identifier);
            // request [dummy data]:
            const response = await client.get('files.json?identifier=' + identifier);
            commit(FETCH_DATA, response.data);
        },
    },
};
export default new Vuex.Store<RootState>(options);
