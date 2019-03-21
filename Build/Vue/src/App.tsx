import {Component, Vue} from 'vue-property-decorator';
import {CreateElement, VNode} from 'vue';
import TreePanel from '@/components/TreePanel';
import ContentPanel from '@/components/ContentPanel';
import {Action} from 'vuex-class';
import {FETCH_DATA} from '@/store/mutations';

@Component
export default class App extends Vue {
    @Action(FETCH_DATA)
    fetchData: any;


    // lifecycle method
    mounted(): void {
        // root content area - dummy
        this.fetchData('1:/');
    }

    private render(h: CreateElement): VNode {

        return (
            <div id='app' class='module'>
                <TreePanel/>
                <ContentPanel/>
            </div>
        );
    }
}
