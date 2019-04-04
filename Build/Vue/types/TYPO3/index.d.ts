declare module 'TYPO3/CMS/Backend/ContextMenu';
declare module 'TYPO3/CMS/Backend/Icons';
declare module 'TYPO3/CMS/Backend/Modal';

// type definition for global namespace object
interface Window {
  TYPO3: any;
  $: any;
  startInModule: Array<string>;
  inline: {
    delayedImportElement: (objectId: number, table: string, uid: number, type: string) => void,
  };
  rawurlencode: Function;
  require: Function;
  list_frame: Window;
  jump: Function;
  currentSubScript: string;
  currentModuleLoaded: string;
  fsMod: { [key: string]: any };
  nextLoadModuleUrl: string;
}

declare module 'TYPO3/CMS/Backend/Modal';
declare module 'moment';
