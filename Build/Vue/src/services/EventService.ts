import {EventType} from '@/enums/EventType';

export class EventService {

    constructor() {
        this.registerEvents();
    }

    private registerEvents(): void {
        document.addEventListener('resolveEvent', ((event: CustomEvent) => {
            // @TODO: Implement all actions here
            switch (event.detail.event) {
                case EventType.actionCopyTo:
                    this.actionCopyTo(event);
                    break;
                default:
                    console.log('unknown event type: ' + event.detail.event);
                    // @TODO: after implementation change console.info to error
                    // throw new Error('unknown event type: ' + event.detail.event);
            }
        }) as EventListener);
    }

    private actionCopyTo(event: CustomEvent): void {
        console.log('EventType.actionCopyTo triggered but not implemented yet');
        // let fileEvent = new CustomEvent('fileServiceEvent', {
        //     detail: {
        //         'event': FileServiceEvent.COPY_TO,
        //         'resources': [event.detail.identifier],
        //     },
        // });
        // document.dispatchEvent(fileEvent);
    }
}
