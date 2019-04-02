export class DraggableService {
    private configuration: DragConfiguration;
    private currentDraggedElement!: null | HTMLElement;
    private blockedDropZones: Array<Element> = [];

    constructor(configuration: DragConfiguration) {
        this.configuration = configuration;
        this.registerEvents();
    }

    /**
     * @return {NodeListOf<Element>}
     */
    public makeDraggable(): NodeListOf<Element> {
        const bound = document.querySelectorAll(this.configuration.draggableElements);
        Array.from(bound).forEach((value: Element): void => {
            value.setAttribute('draggable', 'true');
        });

        return bound;
    }

    private registerEvents(): void {
        this.setupDragStart();
        this.setupDragEnter();
        this.setupDragLeave();
        this.setupDragOver();
        this.setupDrop();
        this.setupDragEnd();
    }

    private static getDelegatedEventTarget(eventTarget: EventTarget | null, selector: string): HTMLElement | null {
        if (!eventTarget) {
            return null;
        }

        let targetElement: HTMLElement;

        if ((targetElement = <HTMLElement>(<Element>eventTarget).closest(selector)) === null) {
            if ((<Element>eventTarget).matches(selector)) {
                targetElement = <HTMLElement>eventTarget;
            }
        }

        return targetElement;
    }

    private setupDragStart(): void {
        document.addEventListener('dragstart', (e: Event): void => {
            let target: HTMLElement | null;
            if ((target = DraggableService.getDelegatedEventTarget(e.target, this.configuration.draggableElements)) === null) {
                return;
            }

            if (this.configuration.beforeDragStart) {
                this.configuration.beforeDragStart(e);
            }

            this.currentDraggedElement = target;
            target.classList.add('drag-active');

            this.determineBlockedDropZone();

            const dataTransfer = (<DragEvent>e).dataTransfer;
            if (dataTransfer && this.currentDraggedElement.dataset.identifier) {
                dataTransfer.effectAllowed = 'move';
                dataTransfer.setData('text/plain', this.currentDraggedElement.dataset.identifier);
            }

            if (this.configuration.afterDragStart) {
                this.configuration.afterDragStart(e);
            }
        });
    }

    private setupDragEnter(): void {
        document.addEventListener('dragenter', (e: Event): void => {
            let target: HTMLElement | null;
            if ((target = DraggableService.getDelegatedEventTarget(e.target, this.configuration.draggableElements)) === null) {
                return;
            }

            if (this.isDropAllowed(target)) {
                target.classList.add('tree-dropzone-allowed');
            }
        });
    }

    private setupDragLeave(): void {
        document.addEventListener('dragleave', (e: Event): void => {
            console.log('DraggableService.ts@92: ', e.target);
            let target: HTMLElement | null;
            if ((target = DraggableService.getDelegatedEventTarget(e.target, this.configuration.draggableElements)) === null) {
                return;
            }
            target.classList.remove('tree-dropzone-allowed');
        });
    }

    private setupDragOver(): void {
        document.addEventListener('dragover', (e: Event): void => {
            let target: HTMLElement | null;
            if ((target = DraggableService.getDelegatedEventTarget(e.target, this.configuration.draggableElements)) === null) {
                return;
            }

            const dataTransfer = (<DragEvent>e).dataTransfer;
            if (dataTransfer) {
                dataTransfer.dropEffect = 'move';
            }

            if (this.isDropAllowed(target)) {
                // This is an allowed drop action, prevent default event handling to get `drop` event fired
                e.preventDefault();
            }
        });
    }

    private setupDrop(): void {
        document.addEventListener('drop', (e: Event): void => {
            let target: HTMLElement | null;
            if ((target = DraggableService.getDelegatedEventTarget(e.target, this.configuration.dropInto)) === null) {
                return;
            }

            e.stopPropagation();

            const dataTransfer = (<DragEvent>e).dataTransfer;
            if (dataTransfer) {
                alert('TODO: Move ' + dataTransfer.getData('text/plain') + ' into ' + target.dataset.identifier);
            }
            target.classList.remove('tree-dropzone-allowed');
        });
    }

    private setupDragEnd(): void {
        document.addEventListener('dragend', (e: Event): void => {
            let target: HTMLElement | null;
            if ((target = DraggableService.getDelegatedEventTarget(e.target, this.configuration.draggableElements)) === null) {
                return;
            }

            if (this.configuration.beforeDragEnd) {
                this.configuration.beforeDragEnd(e);
            }

            target.classList.remove('drag-active');
            this.currentDraggedElement = null;

            this.blockedDropZones.forEach((dropZone: Element): void => {
                dropZone.classList.remove('tree-dropzone-blocked');
            });
            this.blockedDropZones = [];

            if (this.configuration.afterDragEnd) {
                this.configuration.afterDragEnd(e);
            }
        });
    }

    private determineBlockedDropZone(): Array<Element> {
        if (!this.currentDraggedElement) {
            return [];
        }

        const parent = this.currentDraggedElement.parentNode;
        if (parent) {
            this.blockedDropZones = Array.from(parent.querySelectorAll(this.configuration.dropInto));
            this.blockedDropZones.forEach((dropZone: Element): void => {
                dropZone.classList.add('tree-dropzone-blocked');
            });
        }

        return this.blockedDropZones;
    }

    /**
     * @param {Element} element
     * @return boolean
     */
    private isDropAllowed(element: Element): boolean {
        return !this.blockedDropZones.length || this.blockedDropZones.indexOf(element) === -1;
    }
}

export interface DragConfiguration {
    draggableElements: string;
    dropInto: string;
    beforeDragStart?: Function;
    afterDragStart?: Function;
    beforeDragEnd?: Function;
    afterDragEnd?: Function;
}
