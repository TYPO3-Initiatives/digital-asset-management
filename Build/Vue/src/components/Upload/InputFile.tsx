import {Component, Vue} from 'vue-property-decorator';
import {VNode} from 'vue';
import FileUpload from '@/components/Upload/FileUpload';

@Component
export default class InputFile extends Vue {
    change(e: Event): void {
        const target = e.target as HTMLInputElement;
        (this.$parent as FileUpload).addInputFile(target);
        if (target.files) {
            target.value = '';
            if (!/safari/i.test(navigator.userAgent)) {
                target.type = '';
                target.type = 'file';
            }
        } else {
            // ie9 fix #219
            this.$destroy();
            // eslint-disable-next-line
            // @ts-ignore
            let _unused = new this.constructor({
                parent: (this.$parent as FileUpload),
                el: this.$el,
            });
        }
    }

    render(): VNode {
        return (
            <input type='file'
                   name={(this.$parent as FileUpload).name}
                   id={(this.$parent as FileUpload).inputId || (this.$parent as FileUpload).name}
                   accept={(this.$parent as FileUpload).accept}
                   capture={(this.$parent as FileUpload).capture}
                   disabled={(this.$parent as FileUpload).disabled}
                   onChange={this.change}
                   webkitdirectory={(this.$parent as FileUpload).directory && (this.$parent as FileUpload).features.directory}
                   directory={(this.$parent as FileUpload).directory && (this.$parent as FileUpload).features.directory}
                   multiple={(this.$parent as FileUpload).multiple && (this.$parent as FileUpload).features.html5}/>
        );
    }
}
